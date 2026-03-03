import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  PawPrint, Plus, Search, MapPin, AlertTriangle, Shield, Volume2,
  Map as MapIcon, BarChart3, Route
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type WildAnimal = {
  id: string;
  tracking_id: string;
  animal_name: string;
  animal_type: string;
  forest_zone: string;
  officer_name: string;
  officer_contact: string;
  initial_latitude: number;
  initial_longitude: number;
  current_latitude: number;
  current_longitude: number;
  status: string;
  created_at: string;
};

type LocationHistory = {
  latitude: number;
  longitude: number;
  recorded_at: string;
  animal_id: string;
};

const animalEmojis: Record<string, string> = {
  Tiger: "🐅", Lion: "🦁", Elephant: "🐘", Leopard: "🐆", Deer: "🦌",
  Bear: "🐻", Wolf: "🐺", Rhino: "🦏", Cheetah: "🐆",
};

const trailColors: Record<string, string> = {
  Tiger: "#f97316", Lion: "#eab308", Elephant: "#6366f1", Leopard: "#ec4899",
  Deer: "#22c55e", Bear: "#8b5cf6", Wolf: "#64748b", Rhino: "#14b8a6", Cheetah: "#f43f5e",
};

const animalTypes = ["All", "Tiger", "Lion", "Elephant", "Leopard", "Deer", "Bear", "Wolf", "Rhino", "Cheetah"];

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const teluguAlerts: Record<string, { warning: string; danger: string; critical: string }> = {
  Elephant: {
    warning: "ఏనుగు సరిహద్దు దగ్గర ఉంది. జాగ్రత్త!",
    danger: "ఏనుగులు నూరు మీటర్లు దాటసాయి. అధికారికి హెచ్చరిక!",
    critical: "ఏనుగు 200 మీటర్లు దాటింది! వైల్డ్‌లైఫ్ హెడ్ ఆఫీసర్‌కు అత్యవసర హెచ్చరిక!",
  },
  Tiger: {
    warning: "పులి సరిహద్దు దగ్గర ఉంది. జాగ్రత్త!",
    danger: "పులి నూరు మీటర్లు దాటింది. అధికారికి హెచ్చరిక!",
    critical: "పులి 200 మీటర్లు దాటింది! వైల్డ్‌లైఫ్ హెడ్ ఆఫీసర్‌కు అత్యవసర హెచ్చరిక!",
  },
  default: {
    warning: "అడవి జంతువు సరిహద్దు దగ్గర ఉంది.",
    danger: "అడవి జంతువు నూరు మీటర్లు దాటింది. అధికారికి హెచ్చరిక!",
    critical: "అడవి జంతువు 200 మీటర్లు దాటింది! హెడ్ ఆఫీసర్‌కు అత్యవసర హెచ్చరిక!",
  },
};

function speakTelugu(text: string, rate = 0.9) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "te-IN";
  utter.rate = rate;
  window.speechSynthesis.speak(utter);
}

function playAlertTone(frequency: number, duration: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
  } catch {}
}

function getAlertLevel(dist: number): "safe" | "alert" | "critical" {
  if (dist > 200) return "critical";
  if (dist > 100) return "alert";
  return "safe";
}

const WildlifeTracking = () => {
  const [animals, setAnimals] = useState<WildAnimal[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selectedAnimal, setSelectedAnimal] = useState<WildAnimal | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showTrails, setShowTrails] = useState(true);
  const [locationHistory, setLocationHistory] = useState<Record<string, LocationHistory[]>>({});
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const simulationRef = useRef<any>(null);

  const fetchAnimals = useCallback(async () => {
    const { data } = await supabase.from("wild_animals").select("*").order("created_at", { ascending: false });
    if (data) setAnimals(data as WildAnimal[]);
  }, []);

  const fetchLocationHistory = useCallback(async () => {
    const { data } = await supabase
      .from("animal_location_history")
      .select("latitude, longitude, recorded_at, animal_id")
      .order("recorded_at", { ascending: true })
      .limit(1000);
    if (data) {
      const grouped: Record<string, LocationHistory[]> = {};
      data.forEach((loc) => {
        if (!grouped[loc.animal_id]) grouped[loc.animal_id] = [];
        grouped[loc.animal_id].push(loc);
      });
      setLocationHistory(grouped);
    }
  }, []);

  useEffect(() => {
    fetchAnimals();
    fetchLocationHistory();
    const channel = supabase
      .channel("wild_animals_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "wild_animals" }, () => {
        fetchAnimals();
        fetchLocationHistory();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAnimals, fetchLocationHistory]);

  // Simulate GPS movement with tiered alerts
  useEffect(() => {
    if (animals.length === 0) return;
    simulationRef.current = setInterval(async () => {
      for (const animal of animals) {
        const dLat = (Math.random() - 0.48) * 0.001;
        const dLng = (Math.random() - 0.48) * 0.001;
        const newLat = animal.current_latitude + dLat;
        const newLng = animal.current_longitude + dLng;
        const dist = haversineDistance(animal.initial_latitude, animal.initial_longitude, newLat, newLng);
        const alertLevel = getAlertLevel(dist);
        const prevLevel = getAlertLevel(haversineDistance(animal.initial_latitude, animal.initial_longitude, animal.current_latitude, animal.current_longitude));
        const newStatus = alertLevel === "safe" ? "Safe" : "Alert";

        const alerts = teluguAlerts[animal.animal_type] || teluguAlerts.default;

        // Tiered alert notifications
        if (alertLevel === "critical" && prevLevel !== "critical") {
          toast.error(
            `🚨 CRITICAL! ${animal.tracking_id} (${animal.animal_type}) crossed 200m! Wildlife Head Officer notified!`,
            { duration: 12000 }
          );
          playAlertTone(1100, 800);
          setTimeout(() => speakTelugu(alerts.critical, 1.0), 1000);
          if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 500]);
        } else if (alertLevel === "alert" && prevLevel === "safe") {
          toast.warning(
            `⚠️ Alert! ${animal.tracking_id} (${animal.animal_type}) crossed 100m! Officer notified.`,
            { duration: 8000 }
          );
          playAlertTone(700, 500);
          setTimeout(() => speakTelugu(alerts.danger, 0.9), 700);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }

        await supabase
          .from("wild_animals")
          .update({ current_latitude: newLat, current_longitude: newLng, status: newStatus })
          .eq("id", animal.id);

        await supabase
          .from("animal_location_history")
          .insert({ animal_id: animal.id, latitude: newLat, longitude: newLng });
      }
    }, 10000);

    return () => clearInterval(simulationRef.current);
  }, [animals.length]);

  // Initialize map
  useEffect(() => {
    if (!showMap || !mapRef.current) return;
    let cancelled = false;

    const initMap = async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (cancelled || leafletMap.current) return;

      const center = animals.length > 0
        ? [animals[0].current_latitude, animals[0].current_longitude] as [number, number]
        : [20.5937, 78.9629] as [number, number];

      leafletMap.current = L.map(mapRef.current!, { center, zoom: 10 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
      }).addTo(leafletMap.current);

      updateMarkers(L);
    };

    initMap();
    return () => { cancelled = true; };
  }, [showMap]);

  // Update markers when animals or history change
  useEffect(() => {
    if (!leafletMap.current || !showMap) return;
    import("leaflet").then((L) => updateMarkers(L));
  }, [animals, showMap, locationHistory, showTrails]);

  const updateMarkers = (L: any) => {
    if (!leafletMap.current) return;
    markersRef.current.forEach((m) => m.remove());
    circlesRef.current.forEach((c) => c.remove());
    polylinesRef.current.forEach((p) => p.remove());
    markersRef.current = [];
    circlesRef.current = [];
    polylinesRef.current = [];

    animals.forEach((animal) => {
      const dist = haversineDistance(animal.initial_latitude, animal.initial_longitude, animal.current_latitude, animal.current_longitude);
      const alertLevel = getAlertLevel(dist);
      const color = alertLevel === "critical" ? "#dc2626" : alertLevel === "alert" ? "#f97316" : "#22c55e";
      const emoji = animalEmojis[animal.animal_type] || "🐾";

      const icon = L.divIcon({
        html: `<div style="background:${color};color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${emoji}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        className: "",
      });

      const marker = L.marker([animal.current_latitude, animal.current_longitude], { icon })
        .addTo(leafletMap.current)
        .bindPopup(`
          <b>${animal.tracking_id}</b><br/>
          ${emoji} ${animal.animal_name} (${animal.animal_type})<br/>
          Zone: ${animal.forest_zone}<br/>
          Distance: ${dist.toFixed(1)}m<br/>
          Status: <span style="color:${color};font-weight:bold">${alertLevel === "critical" ? "🔴 CRITICAL (>200m)" : alertLevel === "alert" ? "🟠 Alert (>100m)" : "🟢 Safe"}</span>
        `);
      markersRef.current.push(marker);

      // Safe zone circles - 100m and 200m
      const circle100 = L.circle([animal.initial_latitude, animal.initial_longitude], {
        radius: 100, color: "#22c55e", fillColor: "#22c55e", fillOpacity: 0.08, weight: 2, dashArray: "5,5",
      }).addTo(leafletMap.current).bindTooltip("100m - Officer Alert Zone");
      circlesRef.current.push(circle100);

      const circle200 = L.circle([animal.initial_latitude, animal.initial_longitude], {
        radius: 200, color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.05, weight: 2, dashArray: "10,5",
      }).addTo(leafletMap.current).bindTooltip("200m - Head Officer Alert Zone");
      circlesRef.current.push(circle200);

      // Movement history trail
      if (showTrails && locationHistory[animal.id] && locationHistory[animal.id].length > 1) {
        const trailColor = trailColors[animal.animal_type] || "#6366f1";
        const points = locationHistory[animal.id].map((l) => [l.latitude, l.longitude] as [number, number]);
        const polyline = L.polyline(points, {
          color: trailColor, weight: 3, opacity: 0.7, dashArray: "6,4",
        }).addTo(leafletMap.current).bindTooltip(`${animal.tracking_id} trail (${points.length} points)`);
        polylinesRef.current.push(polyline);

        // Start point marker
        const startIcon = L.divIcon({
          html: `<div style="background:${trailColor};color:white;border-radius:50%;width:12px;height:12px;border:2px solid white;"></div>`,
          iconSize: [12, 12], iconAnchor: [6, 6], className: "",
        });
        const startMarker = L.marker(points[0], { icon: startIcon }).addTo(leafletMap.current).bindTooltip("Trail start");
        markersRef.current.push(startMarker);
      }
    });

    if (animals.length > 0) {
      const bounds = L.latLngBounds(animals.map((a) => [a.current_latitude, a.current_longitude]));
      leafletMap.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const filtered = animals.filter((a) => {
    const matchSearch = a.tracking_id.toLowerCase().includes(search.toLowerCase()) ||
      a.animal_name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All" || a.animal_type === filterType;
    return matchSearch && matchType;
  });

  const totalSafe = animals.filter((a) => {
    const d = haversineDistance(a.initial_latitude, a.initial_longitude, a.current_latitude, a.current_longitude);
    return d <= 100;
  }).length;
  const totalAlert = animals.filter((a) => {
    const d = haversineDistance(a.initial_latitude, a.initial_longitude, a.current_latitude, a.current_longitude);
    return d > 100 && d <= 200;
  }).length;
  const totalCritical = animals.filter((a) => {
    const d = haversineDistance(a.initial_latitude, a.initial_longitude, a.current_latitude, a.current_longitude);
    return d > 200;
  }).length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            🐾 Smart Wildlife Tracking
          </h1>
          <p className="text-muted-foreground text-sm">Monitor. Protect. Conserve.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant={showMap ? "default" : "outline"} onClick={() => setShowMap(!showMap)}>
            <MapIcon className="h-4 w-4 mr-1" /> {showMap ? "Hide Map" : "Live Map"}
          </Button>
          {showMap && (
            <Button variant={showTrails ? "default" : "outline"} onClick={() => setShowTrails(!showTrails)}>
              <Route className="h-4 w-4 mr-1" /> {showTrails ? "Hide Trails" : "Show Trails"}
            </Button>
          )}
          <Link to="/dashboard/wildlife-register">
            <Button><Plus className="h-4 w-4 mr-1" /> Register Animal</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <PawPrint className="h-6 w-6 mx-auto mb-1 text-primary" />
          <div className="text-2xl font-bold">{animals.length}</div>
          <div className="text-xs text-muted-foreground">Total Tracked</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Shield className="h-6 w-6 mx-auto mb-1 text-green-600" />
          <div className="text-2xl font-bold text-green-600">{totalSafe}</div>
          <div className="text-xs text-muted-foreground">🟢 Safe (&lt;100m)</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-orange-500" />
          <div className="text-2xl font-bold text-orange-500">{totalAlert}</div>
          <div className="text-xs text-muted-foreground">🟠 Officer Alert (100-200m)</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-destructive" />
          <div className="text-2xl font-bold text-destructive">{totalCritical}</div>
          <div className="text-xs text-muted-foreground">🔴 Head Officer (200m+)</div>
        </div>
      </div>

      {/* Map */}
      {showMap && (
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
          <div className="flex items-center gap-4 px-4 py-2 border-b border-border text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> 100m Safe Zone</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> 200m Critical Zone</span>
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-indigo-500" /> Movement Trail</span>
          </div>
          <div ref={mapRef} style={{ height: 450, width: "100%" }} />
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Tracking ID or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {animalTypes.map((t) => (
              <SelectItem key={t} value={t}>{t === "All" ? "All Types" : `${animalEmojis[t] || ""} ${t}`}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Animal Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <PawPrint className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No animals registered yet.</p>
          <Link to="/dashboard/wildlife-register">
            <Button className="mt-3"><Plus className="h-4 w-4 mr-1" /> Register First Animal</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((animal) => {
            const dist = haversineDistance(
              animal.initial_latitude, animal.initial_longitude,
              animal.current_latitude, animal.current_longitude
            );
            const alertLevel = getAlertLevel(dist);
            const historyCount = locationHistory[animal.id]?.length || 0;
            return (
              <div
                key={animal.id}
                onClick={() => setSelectedAnimal(selectedAnimal?.id === animal.id ? null : animal)}
                className={`bg-card border rounded-xl p-4 cursor-pointer card-hover ${
                  alertLevel === "critical" ? "border-destructive bg-destructive/5" :
                  alertLevel === "alert" ? "border-orange-400/50 bg-orange-50/30" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{animalEmojis[animal.animal_type] || "🐾"}</span>
                    <div>
                      <div className="font-bold text-sm">{animal.tracking_id}</div>
                      <div className="text-xs text-muted-foreground">{animal.animal_name}</div>
                    </div>
                  </div>
                  <Badge variant={alertLevel === "critical" ? "destructive" : alertLevel === "alert" ? "outline" : "secondary"}
                    className={alertLevel === "alert" ? "border-orange-400 text-orange-600" : ""}>
                    {alertLevel === "critical" ? "🔴 CRITICAL" : alertLevel === "alert" ? "🟠 Alert" : "🟢 Safe"}
                  </Badge>
                </div>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <div>🌲 Zone: {animal.forest_zone}</div>
                  <div>👮 Officer: {animal.officer_name}</div>
                  <div>📏 Distance: <span className={`font-semibold ${alertLevel === "critical" ? "text-destructive" : alertLevel === "alert" ? "text-orange-500" : "text-green-600"}`}>{dist.toFixed(1)}m</span></div>
                  {alertLevel === "alert" && (
                    <div className="text-orange-600 font-medium">⚠️ Officer notified (100m+ breach)</div>
                  )}
                  {alertLevel === "critical" && (
                    <div className="text-destructive font-medium">🚨 Head Officer notified (200m+ breach)</div>
                  )}
                  {historyCount > 0 && (
                    <div>📍 Trail: {historyCount} GPS points recorded</div>
                  )}
                </div>

                {selectedAnimal?.id === animal.id && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2 text-xs">
                    <div>📍 Initial: {animal.initial_latitude.toFixed(4)}, {animal.initial_longitude.toFixed(4)}</div>
                    <div>📡 Current: {animal.current_latitude.toFixed(4)}, {animal.current_longitude.toFixed(4)}</div>
                    <div>📞 Contact: {animal.officer_contact || "N/A"}</div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          const alerts = teluguAlerts[animal.animal_type] || teluguAlerts.default;
                          speakTelugu(alerts.warning);
                        }}
                      >
                        <Volume2 className="h-3 w-3 mr-1" /> Warning
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          const alerts = teluguAlerts[animal.animal_type] || teluguAlerts.default;
                          playAlertTone(900, 600);
                          setTimeout(() => speakTelugu(dist > 200 ? alerts.critical : alerts.danger, 1.0), 800);
                        }}
                      >
                        <Volume2 className="h-3 w-3 mr-1" /> {dist > 200 ? "Critical" : "Danger"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WildlifeTracking;
