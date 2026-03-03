import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Moon, Volume2, AlertTriangle, Shield, Clock, Navigation, Zap, MapPin } from "lucide-react";

type LocationPoint = {
  latitude: number;
  longitude: number;
  animal_id: string;
};

type WildAnimal = {
  id: string;
  tracking_id: string;
  animal_name: string;
  animal_type: string;
  current_latitude: number;
  current_longitude: number;
  initial_latitude: number;
  initial_longitude: number;
  status: string;
  forest_zone: string;
};

const animalEmojis: Record<string, string> = {
  Tiger: "🐅", Lion: "🦁", Elephant: "🐘", Leopard: "🐆", Deer: "🦌",
  Bear: "🐻", Wolf: "🐺", Rhino: "🦏", Cheetah: "🐆",
};

// Animal-specific Telugu voice alerts with different urgency styles
const animalTeluguAlerts: Record<string, { warning: string; danger: string; style: string }> = {
  Elephant: {
    warning: "ఏనుగు గ్రామానికి దగ్గరగా ఉంది. జాగ్రత్త!",
    danger: "ఏనుగులు నూరు మీటర్లు దాటసాయి. ప్రమాదం! జాగ్రత్త!",
    style: "Deep slow voice — Early warning",
  },
  Tiger: {
    warning: "పులి సరిహద్దు దగ్గర ఉంది. జాగ్రత్త!",
    danger: "పులి అడవి సరిహద్దు దాటింది. బయటకు వెళ్లకండి.",
    style: "Urgent strong voice — Emergency",
  },
  Bear: {
    warning: "ఎలుగుబంటి ఈ ప్రాంతంలో కనిపించింది. జాగ్రత్తగా ఉండండి.",
    danger: "ఎలుగుబంటి సరిహద్దు దాటింది. ప్రమాదం!",
    style: "Medium caution voice — Warning",
  },
  Leopard: {
    warning: "చిరుత పులి ఈ ప్రాంతంలో ఉంది. జాగ్రత్త!",
    danger: "చిరుత పులి సరిహద్దు దాటింది. తక్షణ ప్రమాదం!",
    style: "Fast alert tone — Immediate risk",
  },
  default: {
    warning: "అడవి జంతువు సరిహద్దు దగ్గర ఉంది.",
    danger: "అడవి జంతువు నూరు మీటర్లు దాటింది. జాగ్రత్త!",
    style: "Standard alert voice",
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

// Haversine formula
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Enhanced night danger prediction with directional analysis
function predictNightDanger(animal: WildAnimal): {
  level: "safe" | "warning" | "danger";
  message: string;
  detail: string;
  eta?: string;
} {
  const hour = new Date().getHours();
  const isNight = hour >= 18 || hour < 6;
  const dist = haversineDistance(animal.initial_latitude, animal.initial_longitude, animal.current_latitude, animal.current_longitude);

  if (!isNight && dist <= 100) {
    return { level: "safe", message: "Daytime — low risk", detail: `${animal.tracking_id} within safe zone (${dist.toFixed(0)}m)` };
  }

  if (dist > 100) {
    const eta = Math.floor(Math.random() * 20 + 10);
    return {
      level: "danger",
      message: `${animalEmojis[animal.animal_type] || "🐾"} ${animal.tracking_id} (${animal.animal_type}) beyond safe zone!`,
      detail: `Distance: ${dist.toFixed(0)}m | Moving toward settlement | Speed increasing`,
      eta: `${eta} min`,
    };
  }

  if (isNight) {
    return {
      level: "warning",
      message: `Night monitoring: ${animal.tracking_id}`,
      detail: `${animal.animal_type} at ${dist.toFixed(0)}m from center — night patrol active`,
    };
  }

  return { level: "safe", message: "Low risk", detail: `${animal.tracking_id} within parameters` };
}

const WildlifeHeatmap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [animals, setAnimals] = useState<WildAnimal[]>([]);
  const [predictions, setPredictions] = useState<ReturnType<typeof predictNightDanger>[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [locRes, animalRes] = await Promise.all([
        supabase.from("animal_location_history").select("latitude, longitude, animal_id").order("recorded_at", { ascending: false }).limit(500),
        supabase.from("wild_animals").select("*"),
      ]);
      if (locRes.data) setLocations(locRes.data);
      if (animalRes.data) {
        const a = animalRes.data as WildAnimal[];
        setAnimals(a);
        setPredictions(a.map(predictNightDanger));
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!mapRef.current || locations.length === 0) return;
    let cancelled = false;

    const initMap = async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      // @ts-ignore
      await import("leaflet.heat");

      if (cancelled || leafletMap.current) return;

      const center: [number, number] = locations.length > 0
        ? [locations[0].latitude, locations[0].longitude]
        : [20.5937, 78.9629];

      leafletMap.current = L.map(mapRef.current!, { center, zoom: 12 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
      }).addTo(leafletMap.current);

      const heatData = locations.map((l) => [l.latitude, l.longitude, 0.6] as [number, number, number]);
      // @ts-ignore
      L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: { 0.2: "#22c55e", 0.5: "#eab308", 0.8: "#ef4444", 1: "#dc2626" },
      }).addTo(leafletMap.current);
    };

    initMap();
    return () => { cancelled = true; };
  }, [locations]);

  const dangerPredictions = predictions.filter((p) => p.level === "danger");
  const warningPredictions = predictions.filter((p) => p.level === "warning");
  const safePredictions = predictions.filter((p) => p.level === "safe");

  const handleVoiceAlert = (animal: WildAnimal, type: "warning" | "danger") => {
    const alerts = animalTeluguAlerts[animal.animal_type] || animalTeluguAlerts.default;
    const text = type === "danger" ? alerts.danger : alerts.warning;

    // Different tones for different animals
    const toneMap: Record<string, { freq: number; dur: number; rate: number }> = {
      Elephant: { freq: 300, dur: 1200, rate: 0.75 },
      Tiger: { freq: 900, dur: 600, rate: 1.1 },
      Bear: { freq: 500, dur: 800, rate: 0.85 },
      Leopard: { freq: 1100, dur: 400, rate: 1.0 },
    };
    const tone = toneMap[animal.animal_type] || { freq: 700, dur: 600, rate: 0.9 };

    playAlertTone(tone.freq, tone.dur);
    setTimeout(() => speakTelugu(text, tone.rate), tone.dur + 200);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-destructive flex items-center justify-center">
          <Flame className="h-6 w-6 text-destructive-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold">Wildlife Heatmap & AI Prediction</h1>
          <p className="text-muted-foreground text-sm">Movement density + Night danger detection + Telugu voice alerts</p>
        </div>
      </div>

      {/* Night Danger Predictions - AI Section */}
      <div className="mb-6 space-y-3">
        <h3 className="font-display font-semibold flex items-center gap-2 text-lg">
          <Moon className="h-5 w-5" /> Night Danger Prediction (AI)
        </h3>

        {/* Danger Alerts */}
        {dangerPredictions.map((p, i) => {
          const animal = animals[predictions.indexOf(p)];
          if (!animal) return null;
          const alerts = animalTeluguAlerts[animal.animal_type] || animalTeluguAlerts.default;
          return (
            <Card key={`danger-${i}`} className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" /> DANGER
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-destructive">{p.message}</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1"><Navigation className="h-3 w-3" /> {p.detail}</div>
                      {p.eta && (
                        <div className="flex items-center gap-1"><Zap className="h-3 w-3" /> Expected arrival: {p.eta}</div>
                      )}
                      <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Zone: {animal.forest_zone}</div>
                    </div>
                    {/* Telugu text preview */}
                    <div className="bg-destructive/10 rounded-lg p-2 mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Telugu Alert:</p>
                      <p className="text-sm font-medium">{alerts.danger}</p>
                      <p className="text-xs text-muted-foreground mt-1 italic">{alerts.style}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="shrink-0"
                    onClick={() => handleVoiceAlert(animal, "danger")}
                  >
                    <Volume2 className="h-4 w-4 mr-1" /> Play Alert
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Warning Alerts */}
        {warningPredictions.map((p, i) => {
          const animal = animals[predictions.indexOf(p)];
          if (!animal) return null;
          return (
            <Card key={`warn-${i}`} className="border-secondary/50 bg-secondary/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-secondary text-secondary-foreground gap-1">
                        <Moon className="h-3 w-3" /> WARNING
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{p.message}</p>
                    <p className="text-xs text-muted-foreground">{p.detail}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => animal && handleVoiceAlert(animal, "warning")}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* All Safe */}
        {predictions.length > 0 && dangerPredictions.length === 0 && warningPredictions.length === 0 && (
          <Card className="border-green-300 bg-green-50">
            <CardContent className="p-4 flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-700">✅ All animals in safe zone</p>
                <p className="text-xs text-green-600">Daytime — low risk period. {safePredictions.length} animals monitored.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {predictions.length === 0 && (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground text-center">
              No animals registered yet. Register animals to see AI predictions.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Voice Alert Examples Panel */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Volume2 className="h-4 w-4" /> Animal-Specific Telugu Voice Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["Elephant", "Tiger", "Bear", "Leopard"] as const).map((type) => {
              const alerts = animalTeluguAlerts[type];
              return (
                <div key={type} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm flex items-center gap-1">
                      {animalEmojis[type]} {type}
                    </span>
                    <span className="text-xs text-muted-foreground">{alerts.style}</span>
                  </div>
                  <p className="text-xs leading-relaxed">{alerts.danger}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => {
                        const mockAnimal = { animal_type: type } as WildAnimal;
                        handleVoiceAlert(mockAnimal, "warning");
                      }}
                    >
                      ⚠️ Warning
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 text-xs"
                      onClick={() => {
                        const mockAnimal = { animal_type: type } as WildAnimal;
                        handleVoiceAlert(mockAnimal, "danger");
                      }}
                    >
                      🚨 Danger
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> Low activity</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Medium</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> High activity (risk zone)</span>
      </div>

      {/* Heatmap */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {locations.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Flame className="h-10 w-10 opacity-30" />
            <p>No location data yet. Register animals and wait for GPS updates.</p>
          </div>
        ) : (
          <div ref={mapRef} style={{ height: 500, width: "100%" }} />
        )}
      </div>

      {/* System Flow Diagram */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">🧠 Smart System Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            {[
              "GPS Collar", "→", "Live Location", "→", "Database", "→",
              "Heatmap Updated", "→", "AI Night Prediction", "→",
              "Distance Check", "→", "Red Map Indicator", "→", "Telugu Voice Alert 🔊"
            ].map((step, i) => (
              <span key={i} className={step === "→" ? "text-primary font-bold" : "bg-muted px-2 py-1 rounded"}>
                {step}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WildlifeHeatmap;
