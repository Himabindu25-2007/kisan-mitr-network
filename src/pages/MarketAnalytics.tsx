import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const priceData = [
  { crop: "Rice", price: 25, demand: 85 },
  { crop: "Wheat", price: 28, demand: 90 },
  { crop: "Maize", price: 20, demand: 70 },
  { crop: "Cotton", price: 65, demand: 75 },
  { crop: "Tomato", price: 35, demand: 95 },
  { crop: "Chilli", price: 150, demand: 60 },
  { crop: "Sugarcane", price: 3.5, demand: 80 },
  { crop: "Groundnut", price: 55, demand: 50 },
];

const demandData = [
  { crop: "Rice", level: 85 },
  { crop: "Wheat", level: 90 },
  { crop: "Maize", level: 70 },
  { crop: "Cotton", level: 75 },
  { crop: "Tomato", level: 95 },
  { crop: "Chilli", level: 60 },
  { crop: "Sugarcane", level: 80 },
  { crop: "Groundnut", level: 50 },
];

const MarketAnalytics = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-display font-bold mb-2">📊 Market Analytics</h1>
      <p className="text-muted-foreground mb-8">Real-time crop prices and demand analysis</p>

      {/* Price Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {priceData.map((d) => (
          <div key={d.crop} className="bg-card rounded-xl border border-border p-4 text-center card-hover">
            <p className="font-display font-semibold mb-1">{d.crop}</p>
            <p className="text-2xl font-bold text-primary">₹{d.price}</p>
            <p className="text-xs text-muted-foreground">/kg</p>
            <div className={`mt-2 text-xs font-medium ${d.demand > 70 ? "text-primary" : "text-destructive"}`}>
              {d.demand > 70 ? "↑" : "↓"} Demand: {d.demand}%
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-display font-bold mb-4">Crop vs Price (₹ per kg)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="crop" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="price" fill="hsl(122, 46%, 33%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-display font-bold mb-4">Crop vs Demand Level (%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={demandData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="crop" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="level" fill="hsl(25, 90%, 53%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalytics;
