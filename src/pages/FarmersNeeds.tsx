import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  {
    name: "Pesticides",
    emoji: "🧪",
    products: [
      { name: "Neem Oil Spray", desc: "Organic pest control for all crops", price: "₹350-500", link: "https://www.flipkart.com/search?q=neem+oil+spray" },
      { name: "Imidacloprid 17.8 SL", desc: "Systemic insecticide for sucking pests", price: "₹280-400", link: "https://www.flipkart.com/search?q=imidacloprid" },
      { name: "Mancozeb 75% WP", desc: "Fungicide for blight and leaf spot", price: "₹200-350", link: "https://www.flipkart.com/search?q=mancozeb" },
    ],
  },
  {
    name: "Fertilizers",
    emoji: "🌿",
    products: [
      { name: "NPK 19:19:19", desc: "Balanced nutrition for all crops", price: "₹800-1200", link: "https://www.flipkart.com/search?q=npk+fertilizer" },
      { name: "Urea 46% N", desc: "Nitrogen-rich for vegetative growth", price: "₹267/bag", link: "https://www.flipkart.com/search?q=urea+fertilizer" },
      { name: "DAP (18-46-0)", desc: "Phosphorus-rich starter fertilizer", price: "₹1350/bag", link: "https://www.flipkart.com/search?q=dap+fertilizer" },
    ],
  },
  {
    name: "Seeds",
    emoji: "🌰",
    products: [
      { name: "Hybrid Paddy Seeds", desc: "High-yield rice variety", price: "₹200-400/kg", link: "https://www.flipkart.com/search?q=paddy+seeds" },
      { name: "Bt Cotton Seeds", desc: "Bollworm resistant cotton", price: "₹800-1000/pack", link: "https://www.flipkart.com/search?q=cotton+seeds" },
      { name: "Vegetable Seed Kit", desc: "Mixed vegetable seeds combo", price: "₹150-300", link: "https://www.flipkart.com/search?q=vegetable+seeds" },
    ],
  },
  {
    name: "Farming Tools",
    emoji: "🔧",
    products: [
      { name: "Hand Sprayer 16L", desc: "Manual pressure sprayer", price: "₹800-1500", link: "https://www.flipkart.com/search?q=hand+sprayer" },
      { name: "Pruning Shears", desc: "Stainless steel garden scissors", price: "₹250-500", link: "https://www.flipkart.com/search?q=pruning+shears" },
      { name: "Drip Irrigation Kit", desc: "Water-saving drip system", price: "₹1500-3000", link: "https://www.flipkart.com/search?q=drip+irrigation+kit" },
    ],
  },
];

const FarmersNeeds = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-display font-bold mb-2">🛒 Farmers Needs</h1>
      <p className="text-muted-foreground mb-8">Essential products for your farm — buy directly from Flipkart</p>

      {categories.map((cat) => (
        <div key={cat.name} className="mb-10">
          <h2 className="text-xl font-display font-bold mb-4">
            {cat.emoji} {cat.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cat.products.map((p) => (
              <div key={p.name} className="bg-card rounded-xl border border-border p-5 card-hover">
                <h3 className="font-display font-semibold mb-1">{p.name}</h3>
                <p className="text-muted-foreground text-sm mb-3">{p.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">{p.price}</span>
                  <a href={p.link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                      Buy on Flipkart <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FarmersNeeds;
