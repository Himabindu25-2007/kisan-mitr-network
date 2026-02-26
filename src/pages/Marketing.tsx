import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, CheckCircle, MessageCircle, ShieldCheck, Phone, MapPin, Star, Users, Wheat, Bug, Banknote, Sprout } from "lucide-react";

const buyers = [
  "ITC Agri Business Division",
  "Ninjacart",
  "WayCool Foods",
  "BigBasket Farm Connect",
  "Nearby APMC Market",
];

const whatsappGroups = [
  { name: "🌾 Selling Community", desc: "Post crops for sale & find buyers", icon: Wheat, color: "bg-primary/10 border-primary/30", link: "https://chat.whatsapp.com/" },
  { name: "💰 Loan & Financial Help", desc: "Govt loans, subsidies & bank schemes", icon: Banknote, color: "bg-accent/10 border-accent/30", link: "https://chat.whatsapp.com/" },
  { name: "🌱 Seeds & Fertilizer Info", desc: "Best seeds, seasonal tips & vendors", icon: Sprout, color: "bg-secondary/10 border-secondary/30", link: "https://chat.whatsapp.com/" },
  { name: "🚨 Crop Disease Alerts", desc: "Share disease photos & get solutions", icon: Bug, color: "bg-destructive/10 border-destructive/30", link: "https://chat.whatsapp.com/" },
];

const sampleProducts = [
  { crop: "Tomato", qty: "500 kg", price: "₹18/kg", location: "Anantapur, AP", phone: "9876XXXXXX", verified: true, posted: "2 hours ago" },
  { crop: "Wheat", qty: "2 Tons", price: "₹22/kg", location: "Ludhiana, Punjab", phone: "9123XXXXXX", verified: true, posted: "5 hours ago" },
  { crop: "Cotton", qty: "800 kg", price: "₹65/kg", location: "Nagpur, MH", phone: "9988XXXXXX", verified: false, posted: "1 day ago" },
  { crop: "Rice", qty: "1.5 Tons", price: "₹32/kg", location: "Guntur, AP", phone: "9456XXXXXX", verified: true, posted: "3 hours ago" },
  { crop: "Chilli", qty: "300 kg", price: "₹120/kg", location: "Warangal, TS", phone: "9654XXXXXX", verified: false, posted: "6 hours ago" },
];

const states = ["All States", "Andhra Pradesh", "Punjab", "Maharashtra", "Karnataka", "Tamil Nadu", "Telangana", "Uttar Pradesh"];
const cropFilters = ["All Crops", "Rice", "Wheat", "Cotton", "Tomato", "Chilli", "Sugarcane", "Maize"];

const Marketing = () => {
  const [mode, setMode] = useState<"farmer" | "buyer">("farmer");
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState("All States");
  const [cropFilter, setCropFilter] = useState("All Crops");

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
      toast({ title: "📸 Photo added!", description: "Your crop photo is ready." });
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    toast({ title: "✅ Product posted for sale!", description: "Buyers have been notified." });
  };

  const resetForm = () => {
    setSubmitted(false);
    setStep(1);
    setForm({});
    setPhotoPreview(null);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-1">🛒 Sell & Connect Marketplace</h1>
      <p className="text-muted-foreground mb-6">Post your produce, find buyers & join farming communities</p>

      {/* Mode Selector */}
      <div className="flex gap-3 mb-8">
        {[
          { key: "farmer" as const, icon: "👨‍🌾", label: "For Farmers" },
          { key: "buyer" as const, icon: "🚜", label: "For Buyers" },
        ].map((m) => (
          <Button
            key={m.key}
            variant={mode === m.key ? "default" : "outline"}
            size="lg"
            className="flex-1 text-base py-6"
            onClick={() => setMode(m.key)}
          >
            <span className="text-xl mr-2">{m.icon}</span> {m.label}
          </Button>
        ))}
      </div>

      {mode === "farmer" ? (
        <Tabs defaultValue="sell" className="space-y-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="sell">📤 Sell Crop</TabsTrigger>
            <TabsTrigger value="community">💬 Communities</TabsTrigger>
            <TabsTrigger value="my">📋 My Listings</TabsTrigger>
          </TabsList>

          {/* ─── SELL TAB ─── */}
          <TabsContent value="sell">
            {!submitted ? (
              <div className="bg-card rounded-xl border border-border p-6">
                {/* Progress */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{s}</div>
                      {s < 3 && <div className={`w-10 h-1 rounded ${step > s ? "bg-primary" : "bg-muted"}`} />}
                    </div>
                  ))}
                </div>

                {/* Step 1 – Photo */}
                {step === 1 && (
                  <div className="space-y-4 text-center">
                    <h3 className="font-display font-bold text-lg">📸 Add Crop Photo</h3>
                    <p className="text-sm text-muted-foreground">A photo helps buyers trust your product</p>

                    {photoPreview ? (
                      <div className="relative mx-auto w-64 h-64 rounded-xl overflow-hidden border-2 border-primary/30">
                        <img src={photoPreview} alt="Crop" className="w-full h-full object-cover" />
                        <button onClick={() => setPhotoPreview(null)} className="absolute top-2 right-2 bg-background/80 rounded-full p-1 text-xs">✕</button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-primary/40 rounded-xl p-10 mx-auto max-w-sm bg-primary/5">
                        <Camera className="mx-auto mb-3 text-primary" size={48} />
                        <p className="text-sm text-muted-foreground mb-4">Take a photo or upload from gallery</p>
                        <div className="flex gap-3 justify-center">
                          <label className="cursor-pointer">
                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
                            <Button asChild variant="default" size="lg"><span><Camera size={18} /> Take Photo</span></Button>
                          </label>
                          <label className="cursor-pointer">
                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                            <Button asChild variant="outline" size="lg"><span><Upload size={18} /> Upload</span></Button>
                          </label>
                        </div>
                      </div>
                    )}

                    <Button size="lg" className="mt-4 w-full max-w-sm" onClick={() => setStep(2)} disabled={!photoPreview}>
                      Next → Enter Details
                    </Button>
                  </div>
                )}

                {/* Step 2 – Details */}
                {step === 2 && (
                  <div className="space-y-4 max-w-md mx-auto">
                    <h3 className="font-display font-bold text-lg text-center">📝 Product Details</h3>
                    {[
                      { key: "cropName", label: "Crop Name", placeholder: "e.g. Tomato, Wheat" },
                      { key: "quantity", label: "Quantity (kg)", placeholder: "e.g. 500" },
                      { key: "price", label: "Expected Price (₹/kg)", placeholder: "e.g. 25" },
                      { key: "location", label: "Location (Village, District)", placeholder: "e.g. Anantapur, AP" },
                      { key: "phone", label: "Phone Number", placeholder: "e.g. 9876543210" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="text-sm font-medium mb-1 block">{f.label}</label>
                        <Input placeholder={f.placeholder} value={form[f.key] || ""} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} />
                      </div>
                    ))}
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1">← Back</Button>
                      <Button onClick={() => setStep(3)} className="flex-1" disabled={!form.cropName || !form.quantity || !form.price}>Next → Review</Button>
                    </div>
                  </div>
                )}

                {/* Step 3 – Review */}
                {step === 3 && (
                  <div className="space-y-4 max-w-md mx-auto">
                    <h3 className="font-display font-bold text-lg text-center">✅ Review & Post</h3>
                    <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                      {photoPreview && <img src={photoPreview} alt="Crop" className="w-full h-40 object-cover rounded-lg" />}
                      {Object.entries(form).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                          <span className="font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1">← Edit</Button>
                      <Button onClick={handleSubmit} className="flex-1" size="lg">📤 Post Product</Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* AI Assessment */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                  <h3 className="font-display font-bold text-lg mb-4">🤖 AI Quality Assessment</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Quality Grade", value: "A+" },
                      { label: "Freshness Score", value: "92/100" },
                      { label: "Damage Level", value: "Low (3%)" },
                      { label: "Est. Market Value", value: `₹${Math.round(Number(form.price || 25) * 1.1)}/kg` },
                    ].map((m) => (
                      <div key={m.label} className="bg-card rounded-lg p-3 text-center border">
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

                <Button variant="outline" onClick={resetForm}>← Post Another Product</Button>
              </div>
            )}
          </TabsContent>

          {/* ─── COMMUNITY TAB ─── */}
          <TabsContent value="community">
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-6 mb-2">
                <h3 className="font-display font-bold text-lg mb-1 flex items-center gap-2"><Users size={20} /> 🤝 Join Farming Communities</h3>
                <p className="text-sm text-muted-foreground mb-6">Connect with farmers, buyers & experts on WhatsApp</p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {whatsappGroups.map((g) => (
                    <div key={g.name} className={`rounded-xl border p-5 ${g.color} transition-transform hover:scale-[1.02]`}>
                      <div className="flex items-start gap-3">
                        <g.icon className="text-primary mt-1 shrink-0" size={24} />
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{g.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{g.desc}</p>
                        </div>
                      </div>
                      <a href={g.link} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full mt-4 bg-[#25D366] hover:bg-[#20bd5a] text-white" size="sm">
                          <MessageCircle size={16} /> Join on WhatsApp
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ─── MY LISTINGS TAB ─── */}
          <TabsContent value="my">
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <p className="text-muted-foreground mb-4">Your posted products will appear here.</p>
              {submitted && (
                <div className="bg-muted/30 rounded-lg p-4 text-left max-w-sm mx-auto">
                  {photoPreview && <img src={photoPreview} alt="Crop" className="w-full h-32 object-cover rounded-lg mb-3" />}
                  <p className="font-bold">{form.cropName || "Crop"}</p>
                  <p className="text-sm text-muted-foreground">{form.quantity} kg · ₹{form.price}/kg</p>
                  <Badge className="mt-2 bg-primary/20 text-primary border-0">Active</Badge>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        /* ─── BUYER MODE ─── */
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={cropFilter} onValueChange={setCropFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{cropFilters.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {sampleProducts.map((p, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-lg">{p.crop}</h4>
                    <p className="text-sm text-muted-foreground">{p.posted}</p>
                  </div>
                  {p.verified && (
                    <Badge className="bg-primary/15 text-primary border-0 gap-1"><ShieldCheck size={12} /> Verified</Badge>
                  )}
                </div>
                <div className="space-y-1 text-sm mb-4">
                  <p className="flex items-center gap-2"><Wheat size={14} className="text-primary" /> {p.qty} · <span className="font-bold text-primary">{p.price}</span></p>
                  <p className="flex items-center gap-2"><MapPin size={14} className="text-muted-foreground" /> {p.location}</p>
                  <p className="flex items-center gap-2"><Phone size={14} className="text-muted-foreground" /> {p.phone}</p>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${p.phone}`} className="flex-1"><Button variant="outline" className="w-full" size="sm"><Phone size={14} /> Call</Button></a>
                  <a href={`https://wa.me/91${p.phone.replace(/X/g, "0")}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white" size="sm"><MessageCircle size={14} /> WhatsApp</Button>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Verified Badge Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-start gap-4">
            <Star className="text-accent shrink-0 mt-1" size={28} />
            <div>
              <h4 className="font-bold flex items-center gap-2">⭐ Verified Farmer Badge</h4>
              <p className="text-sm text-muted-foreground mt-1">Farmers with <CheckCircle size={12} className="inline text-primary" /> badge have completed 3+ successful sales and phone verification. Buy with confidence!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketing;
