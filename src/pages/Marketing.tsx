import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const buyers = [
  "ITC Agri Business Division",
  "Ninjacart",
  "WayCool Foods",
  "BigBasket Farm Connect",
  "Nearby APMC Market",
];

const Marketing = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    setSubmitted(true);
    toast({ title: "✅ Crop listed for sale!", description: "Buyers have been notified." });
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-2">🏪 Sell Your Crop</h1>
      <p className="text-muted-foreground mb-8">List your produce and connect with top buyers</p>

      {!submitted ? (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          {[
            { key: "cropType", label: "Crop Type" },
            { key: "quantity", label: "Quantity (kg)" },
            { key: "price", label: "Expected Price (₹/kg)" },
            { key: "harvestDate", label: "Harvest Date", type: "date" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-sm font-medium mb-1 block">{f.label}</label>
              <Input
                type={f.type || "text"}
                value={form[f.key] || ""}
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              />
            </div>
          ))}
          <Button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground" size="lg">
            📤 List for Sale
          </Button>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* AI Quality Assessment (mock) */}
          <div className="bg-leaf-light border border-primary/20 rounded-xl p-6">
            <h3 className="font-display font-bold text-lg mb-4">🤖 AI Quality Assessment</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Quality Grade", value: "A+" },
                { label: "Freshness Score", value: "92/100" },
                { label: "Damage Level", value: "Low (3%)" },
                { label: "Est. Market Value", value: `₹${Number(form.price || 25) * 1.1}/kg` },
              ].map((m) => (
                <div key={m.label} className="bg-card rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="font-bold text-primary text-lg">{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Buyers */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-display font-bold text-lg mb-4">📦 Send to Buyers</h3>
            <div className="space-y-3">
              {buyers.map((b) => (
                <div key={b} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium">{b}</span>
                  <Button size="sm" variant="outline" className="border-primary text-primary">Send Offer</Button>
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" onClick={() => setSubmitted(false)}>← List Another Crop</Button>
        </div>
      )}
    </div>
  );
};

export default Marketing;
