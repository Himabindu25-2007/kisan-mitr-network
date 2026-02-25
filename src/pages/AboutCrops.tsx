import { Link } from "react-router-dom";
import { Sprout, Wheat, Bug, TrendingUp, ShieldAlert, CloudSun } from "lucide-react";

const crops = [
  { name: "Rice", emoji: "🌾", season: "Kharif", color: "bg-primary" },
  { name: "Wheat", emoji: "🌾", season: "Rabi", color: "bg-secondary" },
  { name: "Maize", emoji: "🌽", season: "Kharif", color: "bg-sky" },
  { name: "Cotton", emoji: "🏵️", season: "Kharif", color: "bg-accent" },
  { name: "Sugarcane", emoji: "🎋", season: "Annual", color: "bg-soil" },
  { name: "Tomato", emoji: "🍅", season: "Rabi", color: "bg-destructive" },
];

const AboutCrops = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-display font-bold mb-2">🌾 About Crops</h1>
      <p className="text-muted-foreground mb-8">Learn about major crops grown across India</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {crops.map((crop) => (
          <Link
            key={crop.name}
            to={`/dashboard/crop-info?crop=${crop.name.toLowerCase()}`}
            className="bg-card rounded-xl border border-border p-6 card-hover group"
          >
            <div className="text-5xl mb-4">{crop.emoji}</div>
            <h3 className="font-display font-semibold text-xl mb-1 group-hover:text-primary transition-colors">{crop.name}</h3>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${crop.color} text-primary-foreground`}>
              {crop.season}
            </span>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Bug, title: "Detect Disease", desc: "Upload crop photo", link: "/dashboard/crop-disease" },
          { icon: TrendingUp, title: "Market Prices", desc: "Check today's rates", link: "/dashboard/market-analytics" },
          { icon: ShieldAlert, title: "Wildlife SOS", desc: "Emergency help", link: "/dashboard/wildlife-protection" },
        ].map((a) => (
          <Link key={a.title} to={a.link} className="flex items-center gap-4 bg-leaf-light rounded-xl p-4 card-hover">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <a.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-display font-semibold">{a.title}</p>
              <p className="text-sm text-muted-foreground">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AboutCrops;
