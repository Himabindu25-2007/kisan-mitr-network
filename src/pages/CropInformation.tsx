import { useState } from "react";
import { Button } from "@/components/ui/button";

const cropsData: Record<string, {
  emoji: string; season: string; soil: string; climate: string; yield: string;
  price: string; demand: string; steps: { title: string; desc: string }[];
}> = {
  rice: {
    emoji: "🌾", season: "Kharif (June-Nov)", soil: "Clayey, Loamy", climate: "Hot & humid, 20-37°C",
    yield: "2-5 tonnes/hectare", price: "₹22-28/kg", demand: "High",
    steps: [
      { title: "🌱 Land Preparation", desc: "Plough 2-3 times, level the field, ensure proper water retention" },
      { title: "🌰 Seed Selection", desc: "Use certified HYV seeds like IR-64, Swarna, or Basmati" },
      { title: "🌿 Sowing", desc: "Transplant 25-30 day old seedlings in rows with 20cm spacing" },
      { title: "💧 Irrigation", desc: "Maintain 5cm standing water during tillering; drain before harvest" },
      { title: "🧪 Fertilizer", desc: "Apply NPK 120:60:40 kg/ha in split doses" },
      { title: "🐛 Pest Control", desc: "Monitor for stem borer, BPH; use neem-based sprays" },
      { title: "🌾 Harvest", desc: "Harvest when 80% grains turn golden, moisture 20-22%" },
    ],
  },
  wheat: {
    emoji: "🌾", season: "Rabi (Oct-Mar)", soil: "Loamy, Clay loam", climate: "Cool & dry, 10-25°C",
    yield: "3-6 tonnes/hectare", price: "₹25-32/kg", demand: "Very High",
    steps: [
      { title: "🌱 Land Preparation", desc: "Fine tilth with 2-3 ploughings and planking" },
      { title: "🌰 Seed Selection", desc: "HD-2967, PBW-343, or WH-1105 varieties" },
      { title: "🌿 Sowing", desc: "Line sowing with 22.5cm row spacing, 100kg seed/ha" },
      { title: "💧 Irrigation", desc: "5-6 irrigations at crown root, tillering, flowering stages" },
      { title: "🧪 Fertilizer", desc: "NPK 120:60:40 + Zinc Sulphate 25 kg/ha" },
      { title: "🐛 Pest Control", desc: "Watch for rust, karnal bunt; spray Propiconazole" },
      { title: "🌾 Harvest", desc: "When grains are hard and golden, moisture below 14%" },
    ],
  },
  maize: {
    emoji: "🌽", season: "Kharif (June-Sep)", soil: "Sandy loam, well-drained", climate: "Warm, 21-30°C",
    yield: "4-8 tonnes/hectare", price: "₹18-24/kg", demand: "High",
    steps: [
      { title: "🌱 Land Preparation", desc: "Deep ploughing with FYM application" },
      { title: "🌰 Seed Selection", desc: "Hybrid seeds like DHM-117, HQPM-1" },
      { title: "🌿 Sowing", desc: "Ridge sowing at 60x20cm spacing" },
      { title: "💧 Irrigation", desc: "Critical at knee-high, tasseling and grain filling" },
      { title: "🧪 Fertilizer", desc: "NPK 120:60:40 with micronutrients" },
      { title: "🐛 Pest Control", desc: "Fall armyworm control with Emamectin benzoate" },
      { title: "🌾 Harvest", desc: "When husks dry and kernels are hard, 25% moisture" },
    ],
  },
  cotton: {
    emoji: "🏵️", season: "Kharif (Apr-Dec)", soil: "Black cotton soil", climate: "Warm & dry, 25-35°C",
    yield: "1.5-3 tonnes/hectare", price: "₹60-80/kg", demand: "High",
    steps: [
      { title: "🌱 Land Preparation", desc: "Deep summer ploughing with compost" },
      { title: "🌰 Seed Selection", desc: "Bt cotton hybrids as per region" },
      { title: "🌿 Sowing", desc: "Dibbling method, 90x60cm spacing" },
      { title: "💧 Irrigation", desc: "Drip irrigation preferred, 6-8 irrigations" },
      { title: "🧪 Fertilizer", desc: "NPK 80:40:40, potash at boll formation" },
      { title: "🐛 Pest Control", desc: "Pink bollworm pheromone traps + sprays" },
      { title: "🌾 Harvest", desc: "Pick when bolls fully open, 3-4 pickings" },
    ],
  },
  sugarcane: {
    emoji: "🎋", season: "Annual (Feb-Jan)", soil: "Deep loamy, well-drained", climate: "Tropical, 20-35°C",
    yield: "60-100 tonnes/hectare", price: "₹3-4/kg", demand: "Very High",
    steps: [
      { title: "🌱 Land Preparation", desc: "Deep ploughing with 25 tonnes FYM/ha" },
      { title: "🌰 Seed Selection", desc: "Three-bud setts from disease-free cane" },
      { title: "🌿 Sowing", desc: "Furrow planting at 75-90cm row spacing" },
      { title: "💧 Irrigation", desc: "15-20 irrigations, critical at tillering" },
      { title: "🧪 Fertilizer", desc: "NPK 150:60:60 in splits" },
      { title: "🐛 Pest Control", desc: "Early shoot borer, top borer management" },
      { title: "🌾 Harvest", desc: "12-14 months after planting, test Brix content" },
    ],
  },
  tomato: {
    emoji: "🍅", season: "Rabi (Oct-Feb)", soil: "Sandy loam, pH 6-7", climate: "Moderate, 15-30°C",
    yield: "20-40 tonnes/hectare", price: "₹15-60/kg", demand: "Very High",
    steps: [
      { title: "🌱 Land Preparation", desc: "Raised beds with good drainage" },
      { title: "🌰 Seed Selection", desc: "Arka Rakshak, Pusa Ruby hybrids" },
      { title: "🌿 Sowing", desc: "Transplant 30-day seedlings, 60x45cm spacing" },
      { title: "💧 Irrigation", desc: "Drip irrigation, mulching recommended" },
      { title: "🧪 Fertilizer", desc: "NPK 100:60:60 + calcium" },
      { title: "🐛 Pest Control", desc: "Whitefly, fruit borer; use IPM" },
      { title: "🌾 Harvest", desc: "Harvest at breaker stage for market" },
    ],
  },
  chilli: {
    emoji: "🌶️", season: "Kharif/Rabi", soil: "Light loam, well-drained", climate: "Warm, 20-30°C",
    yield: "1-2 tonnes dry/hectare", price: "₹100-200/kg", demand: "High",
    steps: [
      { title: "🌱 Land Preparation", desc: "Fine tilth, raised bed method" },
      { title: "🌰 Seed Selection", desc: "Guntur, Byadagi, or hybrid varieties" },
      { title: "🌿 Sowing", desc: "Transplant at 60x45cm spacing" },
      { title: "💧 Irrigation", desc: "Critical at flowering and fruit set" },
      { title: "🧪 Fertilizer", desc: "NPK 100:50:50 with micronutrients" },
      { title: "🐛 Pest Control", desc: "Thrips, mites; use Fipronil" },
      { title: "🌾 Harvest", desc: "Red ripe for dry chilli, green for fresh" },
    ],
  },
  groundnut: {
    emoji: "🥜", season: "Kharif (Jun-Oct)", soil: "Sandy loam, well-drained", climate: "Warm, 25-30°C",
    yield: "1.5-3 tonnes/hectare", price: "₹50-70/kg", demand: "Moderate",
    steps: [
      { title: "🌱 Land Preparation", desc: "Light ploughing with gypsum application" },
      { title: "🌰 Seed Selection", desc: "TAG-24, TG-37A, or local varieties" },
      { title: "🌿 Sowing", desc: "Ridge and furrow at 30x10cm spacing" },
      { title: "💧 Irrigation", desc: "Critical at pegging and pod formation" },
      { title: "🧪 Fertilizer", desc: "NPK 25:50:0 + Gypsum 500 kg/ha" },
      { title: "🐛 Pest Control", desc: "Tikka leaf spot, white grub management" },
      { title: "🌾 Harvest", desc: "When leaves turn yellow, 70-80% mature pods" },
    ],
  },
};

const CropInformation = () => {
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const cropNames = Object.keys(cropsData);

  const crop = selectedCrop ? cropsData[selectedCrop] : null;

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-display font-bold mb-2">🌱 Crop Information</h1>
      <p className="text-muted-foreground mb-8">Detailed cultivation guide for major Indian crops</p>

      {/* Crop Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {cropNames.map((name) => (
          <button
            key={name}
            onClick={() => setSelectedCrop(name)}
            className={`p-4 rounded-xl border text-center card-hover ${
              selectedCrop === name ? "border-primary bg-leaf-light" : "border-border bg-card"
            }`}
          >
            <span className="text-3xl block mb-2">{cropsData[name].emoji}</span>
            <span className="font-display font-semibold capitalize">{name}</span>
          </button>
        ))}
      </div>

      {/* Crop Detail */}
      {crop && (
        <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">{crop.emoji}</span>
            <div>
              <h2 className="text-2xl font-display font-bold capitalize">{selectedCrop}</h2>
              <p className="text-muted-foreground">{crop.season}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Soil Type", value: crop.soil },
              { label: "Climate", value: crop.climate },
              { label: "Expected Yield", value: crop.yield },
              { label: "Market Price", value: crop.price },
              { label: "Demand", value: crop.demand },
            ].map((info) => (
              <div key={info.label} className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">{info.label}</p>
                <p className="font-semibold text-sm mt-1">{info.value}</p>
              </div>
            ))}
          </div>

          {/* Cultivation Steps */}
          <h3 className="font-display font-bold text-lg mb-4">🌱 How to Cultivate</h3>
          <div className="space-y-4">
            {crop.steps.map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-muted-foreground text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CropInformation;
