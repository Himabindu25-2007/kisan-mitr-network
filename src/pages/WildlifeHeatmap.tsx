import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Flame, Moon, Volume2 } from "lucide-react";

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
  status: string;
};

function speakTelugu(text: string) {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "te-IN";
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
}

// Simple night danger prediction
function predictNightDanger(animal: WildAnimal): { level: string; message: string } {
  const hour = new Date().getHours();
  const isNight = hour >= 18 || hour < 6;
  if (!isNight) return { level: "safe", message: "Daytime — low risk" };
  if (animal.status === "Alert") {
    return { level: "danger", message: `🚨 ${animal.animal_type} ${animal.tracking_id} actively moving beyond safe zone at night!` };
  }
  return { level: "warning", message: `⚠️ Night monitoring active for ${animal.tracking_id}` };
}

const WildlifeHeatmap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [animals, setAnimals] = useState<WildAnimal[]>([]);
  const [predictions, setPredictions] = useState<{ level: string; message: string }[]>([]);

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

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-destructive flex items-center justify-center">
          <Flame className="h-6 w-6 text-destructive-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold">Wildlife Heatmap & Night Prediction</h1>
          <p className="text-muted-foreground text-sm">Movement density + AI night danger detection</p>
        </div>
      </div>

      {/* Night Danger Predictions */}
      <div className="mb-6 space-y-2">
        <h3 className="font-display font-semibold flex items-center gap-2">
          <Moon className="h-4 w-4" /> Night Danger Prediction (AI)
        </h3>
        {dangerPredictions.length > 0 && dangerPredictions.map((p, i) => (
          <div key={i} className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm font-medium text-destructive">{p.message}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => speakTelugu("ప్రమాదం! అడవి జంతువు రాత్రి సమయంలో సరిహద్దు దాటింది. జాగ్రత్త!")}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {warningPredictions.length > 0 && warningPredictions.map((p, i) => (
          <div key={i} className="bg-secondary/20 border border-secondary/30 rounded-lg p-3 text-sm">
            {p.message}
          </div>
        ))}
        {predictions.every((p) => p.level === "safe") && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            ✅ All animals in safe zone. Daytime — low risk period.
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-sm">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> Low activity</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Medium</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> High activity (risk)</span>
      </div>

      {/* Heatmap */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {locations.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No location data yet. Register animals and wait for GPS updates.
          </div>
        ) : (
          <div ref={mapRef} style={{ height: 500, width: "100%" }} />
        )}
      </div>
    </div>
  );
};

export default WildlifeHeatmap;
