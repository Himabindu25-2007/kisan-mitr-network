import { useState } from "react";

const stateData: Record<string, { crops: string[]; production: string; season: string }> = {
  "Punjab": { crops: ["Wheat", "Rice", "Cotton"], production: "High", season: "Rabi & Kharif" },
  "Haryana": { crops: ["Wheat", "Rice", "Mustard"], production: "High", season: "Rabi & Kharif" },
  "Uttar Pradesh": { crops: ["Wheat", "Sugarcane", "Rice"], production: "Very High", season: "Rabi & Kharif" },
  "Madhya Pradesh": { crops: ["Soybean", "Wheat", "Cotton"], production: "High", season: "Kharif & Rabi" },
  "Maharashtra": { crops: ["Cotton", "Sugarcane", "Soybean"], production: "High", season: "Kharif" },
  "Gujarat": { crops: ["Cotton", "Groundnut", "Cumin"], production: "High", season: "Kharif & Rabi" },
  "Rajasthan": { crops: ["Bajra", "Mustard", "Wheat"], production: "Moderate", season: "Kharif & Rabi" },
  "Karnataka": { crops: ["Maize", "Ragi", "Sugarcane"], production: "High", season: "Kharif" },
  "Andhra Pradesh": { crops: ["Rice", "Chilli", "Cotton"], production: "High", season: "Kharif & Rabi" },
  "Tamil Nadu": { crops: ["Rice", "Sugarcane", "Banana"], production: "High", season: "Samba & Navarai" },
  "West Bengal": { crops: ["Rice", "Jute", "Potato"], production: "Very High", season: "Kharif & Rabi" },
  "Bihar": { crops: ["Rice", "Wheat", "Maize"], production: "High", season: "Kharif & Rabi" },
  "Telangana": { crops: ["Rice", "Cotton", "Maize"], production: "High", season: "Kharif" },
};

const IndiaMap = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-display font-bold mb-2">🗺️ India Crop Map</h1>
      <p className="text-muted-foreground mb-8">Click a state to view its major crops and production data</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* State Grid (simplified map) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.keys(stateData).map((state) => (
            <button
              key={state}
              onClick={() => setSelected(state)}
              className={`p-4 rounded-xl border text-center text-sm font-medium transition-all card-hover ${
                selected === state ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-leaf-light"
              }`}
            >
              {state}
            </button>
          ))}
        </div>

        {/* State Detail */}
        {selected && stateData[selected] && (
          <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
            <h2 className="text-2xl font-display font-bold mb-4">{selected}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Major Crops</p>
                <div className="flex flex-wrap gap-2">
                  {stateData[selected].crops.map((crop) => (
                    <span key={crop} className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Production Level</p>
                  <p className="font-bold">{stateData[selected].production}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Season</p>
                  <p className="font-bold">{stateData[selected].season}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndiaMap;
