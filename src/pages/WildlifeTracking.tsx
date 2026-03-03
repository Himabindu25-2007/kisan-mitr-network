import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  PawPrint, Plus, Search, MapPin, AlertTriangle, Shield, Volume2,
  Map as MapIcon, BarChart3
} from "lucide-react";

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

const animalEmojis: Record<string, string> = {
  Tiger: "🐅", Lion: "🦁", Elephant: "🐘", Leopard: "🐆", Deer: "🦌",
  Bear: "🐻", Wolf: "🐺", Rhino: "🦏", Cheetah: "🐆",
};

const animalTypes = ["All", "Tiger", "Lion", "Elephant", "Leopard", "Deer", "Bear", "Wolf", "Rhino", "Cheetah"];

// Haversine formula
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

// Telugu voice alerts
const teluguAlerts: Record<string, { warning: string; danger: string }> = {
  Elephant: {
    warning: "ఏనుగు సరిహద్దు దగ్గర ఉంది. జాగ్రత్త!",
    danger: "ఏనుగులు నూరు మీటర్లు దాటసాయి. ప్రమాదం!",
  },
  Tiger: {
    warning: "పులి సరిహద్దు దగ్గర ఉంది. జాగ్రత్త!",
    danger: "పులి నూరు మీటర్లు దాటింది. అత్యవసర హెచ్చరిక!",
  },
  default: {
    warning: "అడవి జంతువు సరిహద్దు దగ్గర ఉంది.",
    danger: "అడవి జంతువు నూరు మీటర్లు దాటింది. జాగ్రత్త!",
  },
};

function speakTelugu(text: string) {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "te-IN";
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
}

const WildlifeTracking = () => {
  const [animals, setAnimals] = useState<WildAnimal[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selectedAnimal, setSelectedAnimal] = useState<WildAnimal | null>(null);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);
  const simulationRef = useRef<any>(null);

  const fetchAnimals = useCallback(async () => {
    const { data } = await supabase.from("wild_animals").select("*").order("created_at", { ascending: false });
    if (data) setAnimals(data as WildAnimal[]);
  }, []);

  useEffect(() => {
    fetchAnimals();
    // Realtime subscription
    const channel = supabase
      .channel("wild_animals_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "wild_animals" }, () => fetchAnimals())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAnimals]);

  // Simulate GPS movement
  useEffect(() => {
    if (animals.length === 0) return;
    simulationRef.current = setInterval(async () => {
      for (const animal of animals) {
        const dLat = (Math.random() - 0.48) * 0.001;
        const dLng = (Math.random() - 0.48) * 0.001;
        const newLat = animal.current_latitude + dLat;
        const newLng = animal.current_longitude + dLng;
        const dist = haversineDistance(animal.initial_latitude, animal.initial_longitude, newLat, newLng);
        const newStatus = dist > 100 ? "Alert" : "Safe";

        if (newStatus === "Alert" && animal.status !== "Alert") {
          const alerts = teluguAlerts[animal.animal_type] || teluguAlerts.default;
          toast.error(`⚠️ Alert! ${animal.tracking_id} (${animal.animal_type}) moved beyond 100m!`, { duration: 8000 });
          speakTelugu(alerts.danger);
          // Play warning sound
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            osc.frequency.value = 800;
            osc.connect(ctx.destination);
            osc.start();
            setTimeout(() => osc.stop(), 500);
          } catch {}
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

  // Update markers when animals change
  useEffect(() => {
    if (!leafletMap.current || !showMap) return;
    import("leaflet").then((L) => updateMarkers(L));
  }, [animals, showMap]);

  const updateMarkers = (L: any) => {
    if (!leafletMap.current) return;
    markersRef.current.forEach((m) => m.remove());
    circlesRef.current.forEach((c) => c.remove());
    markersRef.current = [];
    circlesRef.current = [];

    animals.forEach((animal) => {
      const color = animal.status === "Alert" ? "#ef4444" : "#22c55e";
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
          Status: <span style="color:${color};font-weight:bold">${animal.status}</span>
        `);
      markersRef.current.push(marker);

      const circle = L.circle([animal.initial_latitude, animal.initial_longitude], {
        radius: 100,
        color: color,
        fillColor: color,
        fillOpacity: 0.1,
        weight: 2,
        dashArray: "5,5",
      }).addTo(leafletMap.current);
      circlesRef.current.push(circle);
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

  const totalSafe = animals.filter((a) => a.status === "Safe").length;
  const totalAlert = animals.filter((a) => a.status === "Alert").length;

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
        <div className="flex gap-2">
          <Button variant={showMap ? "default" : "outline"} onClick={() => setShowMap(!showMap)}>
            <MapIcon className="h-4 w-4 mr-1" /> {showMap ? "Hide Map" : "Live Map"}
          </Button>
          <Link to="/dashboard/wildlife-register">
            <Button><Plus className="h-4 w-4 mr-1" /> Register Animal</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <PawPrint className="h-6 w-6 mx-auto mb-1 text-primary" />
          <div className="text-2xl font-bold">{animals.length}</div>
          <div className="text-xs text-muted-foreground">Total Tracked</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Shield className="h-6 w-6 mx-auto mb-1 text-green-600" />
          <div className="text-2xl font-bold text-green-600">{totalSafe}</div>
          <div className="text-xs text-muted-foreground">🟢 Safe Zone</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-destructive" />
          <div className="text-2xl font-bold text-destructive">{totalAlert}</div>
          <div className="text-xs text-muted-foreground">🔴 Out of Range</div>
        </div>
      </div>

      {/* Map */}
      {showMap && (
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
          <div ref={mapRef} style={{ height: 400, width: "100%" }} />
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
            const isAlert = animal.status === "Alert";
            return (
              <div
                key={animal.id}
                onClick={() => setSelectedAnimal(selectedAnimal?.id === animal.id ? null : animal)}
                className={`bg-card border rounded-xl p-4 cursor-pointer card-hover ${
                  isAlert ? "border-destructive/50 bg-destructive/5" : "border-border"
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
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    isAlert ? "bg-destructive/20 text-destructive" : "bg-green-100 text-green-700"
                  }`}>
                    {isAlert ? "🔴 Alert" : "🟢 Safe"}
                  </span>
                </div>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <div>🌲 Zone: {animal.forest_zone}</div>
                  <div>👮 Officer: {animal.officer_name}</div>
                  <div>📏 Distance: {dist.toFixed(1)}m from safe zone</div>
                </div>

                {selectedAnimal?.id === animal.id && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2 text-xs">
                    <div>📍 Initial: {animal.initial_latitude.toFixed(4)}, {animal.initial_longitude.toFixed(4)}</div>
                    <div>📡 Current: {animal.current_latitude.toFixed(4)}, {animal.current_longitude.toFixed(4)}</div>
                    <div>📞 Contact: {animal.officer_contact || "N/A"}</div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        const alerts = teluguAlerts[animal.animal_type] || teluguAlerts.default;
                        speakTelugu(isAlert ? alerts.danger : alerts.warning);
                      }}
                    >
                      <Volume2 className="h-3 w-3 mr-1" /> Telugu Voice Alert
                    </Button>
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
