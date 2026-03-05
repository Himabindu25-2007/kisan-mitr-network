import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, Search, User, ChevronDown, ChevronUp } from "lucide-react";

const soilTypes = ["Alluvial", "Black/Cotton", "Red", "Laterite", "Sandy", "Clay", "Loamy", "Saline"];
const irrigationTypes = ["Canal", "Bore Well", "Drip", "Sprinkler", "Rain-fed", "River", "Tank"];
const states = [
  "Andhra Pradesh", "Bihar", "Chhattisgarh", "Gujarat", "Haryana", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
];
const seasons = ["Kharif", "Rabi", "Zaid"];

interface CropEntry {
  crop_name: string;
  crop_period: "past" | "present" | "future";
  season: string;
  year: string;
}

interface Farmer {
  id: string;
  farmer_name: string;
  father_name: string;
  phone: string;
  aadhaar: string;
  village: string;
  district: string;
  state: string;
  land_size_acres: number;
  soil_type: string;
  irrigation_type: string;
  created_at: string;
}

const FarmerRegistration = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFarmer, setExpandedFarmer] = useState<string | null>(null);
  const [farmerCrops, setFarmerCrops] = useState<Record<string, CropEntry[]>>({});
  const [loading, setLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    farmer_name: "", father_name: "", phone: "", aadhaar: "", address: "",
    village: "", district: "", state: "", land_size_acres: "",
    soil_type: "", irrigation_type: "",
  });
  const [crops, setCrops] = useState<CropEntry[]>([]);

  const fetchFarmers = async () => {
    const { data } = await supabase.from("farmers" as any).select("*").order("created_at", { ascending: false });
    if (data) setFarmers(data as any);
  };

  const fetchCropsForFarmer = async (farmerId: string) => {
    const { data } = await supabase.from("farmer_crops" as any).select("*").eq("farmer_id", farmerId);
    if (data) setFarmerCrops((prev) => ({ ...prev, [farmerId]: data as any }));
  };

  useEffect(() => { fetchFarmers(); }, []);

  const addCrop = () => {
    setCrops([...crops, { crop_name: "", crop_period: "present", season: "", year: new Date().getFullYear().toString() }]);
  };

  const removeCrop = (index: number) => {
    setCrops(crops.filter((_, i) => i !== index));
  };

  const updateCrop = (index: number, field: keyof CropEntry, value: string) => {
    setCrops(crops.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const handleSubmit = async () => {
    if (!form.farmer_name || !form.phone) {
      toast({ title: "❌ Missing Fields", description: "Farmer name and phone are required." });
      return;
    }
    setLoading(true);

    const { data: farmer, error } = await supabase.from("farmers" as any).insert({
      ...form,
      land_size_acres: form.land_size_acres ? Number(form.land_size_acres) : null,
      created_by: user?.id,
    } as any).select().single();

    if (error || !farmer) {
      toast({ title: "❌ Error", description: error?.message || "Failed to register farmer." });
      setLoading(false);
      return;
    }

    // Insert crops
    if (crops.length > 0) {
      const validCrops = crops.filter((c) => c.crop_name);
      if (validCrops.length > 0) {
        await supabase.from("farmer_crops" as any).insert(
          validCrops.map((c) => ({ ...c, farmer_id: (farmer as any).id })) as any
        );
      }
    }

    toast({ title: "✅ Farmer Registered!", description: `${form.farmer_name} has been added successfully.` });
    setForm({ farmer_name: "", father_name: "", phone: "", aadhaar: "", address: "", village: "", district: "", state: "", land_size_acres: "", soil_type: "", irrigation_type: "" });
    setCrops([]);
    setShowForm(false);
    setLoading(false);
    fetchFarmers();
  };

  const toggleExpand = (farmerId: string) => {
    if (expandedFarmer === farmerId) {
      setExpandedFarmer(null);
    } else {
      setExpandedFarmer(farmerId);
      if (!farmerCrops[farmerId]) fetchCropsForFarmer(farmerId);
    }
  };

  const filteredFarmers = farmers.filter((f) =>
    f.farmer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.aadhaar?.includes(searchQuery) ||
    f.phone?.includes(searchQuery) ||
    f.village?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showForm) {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto">
        <button onClick={() => setShowForm(false)} className="text-primary mb-4 hover:underline">← Back to Farmers List</button>
        <h2 className="text-2xl font-display font-bold mb-6">👨‍🌾 Register New Farmer</h2>

        {/* Basic Details */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Basic Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "farmer_name", label: "Farmer Name *", type: "text" },
              { key: "father_name", label: "Father's Name", type: "text" },
              { key: "phone", label: "Phone Number *", type: "tel" },
              { key: "aadhaar", label: "Aadhaar Number", type: "text" },
              { key: "address", label: "Address", type: "text" },
              { key: "village", label: "Village", type: "text" },
              { key: "district", label: "District", type: "text" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-sm font-medium mb-1 block">{f.label}</label>
                <Input type={f.type} value={(form as any)[f.key]} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium mb-1 block">State</label>
              <Select onValueChange={(v) => setForm((p) => ({ ...p, state: v }))}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Land Details */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-lg mb-4">🌾 Land Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Land Size (Acres)</label>
              <Input type="number" value={form.land_size_acres} onChange={(e) => setForm((p) => ({ ...p, land_size_acres: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Soil Type</label>
              <Select onValueChange={(v) => setForm((p) => ({ ...p, soil_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Select soil" /></SelectTrigger>
                <SelectContent>{soilTypes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Irrigation Type</label>
              <Select onValueChange={(v) => setForm((p) => ({ ...p, irrigation_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Select irrigation" /></SelectTrigger>
                <SelectContent>{irrigationTypes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Crop Details */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">🌱 Crop Details</h3>
            <Button variant="outline" size="sm" onClick={addCrop} className="gap-1"><Plus className="h-4 w-4" /> Add Crop</Button>
          </div>
          {crops.length === 0 && <p className="text-muted-foreground text-sm">No crops added yet. Click "+ Add Crop" to start.</p>}
          {crops.map((crop, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3 items-end">
              <div>
                <label className="text-xs font-medium mb-1 block">Crop Name</label>
                <Input value={crop.crop_name} onChange={(e) => updateCrop(i, "crop_name", e.target.value)} placeholder="e.g. Rice" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Period</label>
                <Select value={crop.crop_period} onValueChange={(v) => updateCrop(i, "crop_period", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="past">Past</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="future">Future</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Season</label>
                <Select value={crop.season} onValueChange={(v) => updateCrop(i, "season", v)}>
                  <SelectTrigger><SelectValue placeholder="Season" /></SelectTrigger>
                  <SelectContent>{seasons.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Year</label>
                <Input value={crop.year} onChange={(e) => updateCrop(i, "year", e.target.value)} placeholder="2025" />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeCrop(i)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button onClick={handleSubmit} disabled={loading} className="w-full bg-primary text-primary-foreground py-6 text-base">
          {loading ? "Registering..." : "✅ Register Farmer"}
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">👨‍🌾 Farmer Registration</h1>
          <p className="text-muted-foreground">Manage and register farmer profiles ({farmers.length} registered)</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> Add New Farmer
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, Aadhaar, phone, village..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      {/* Farmer Cards */}
      {filteredFarmers.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg">No farmers found</p>
          <p className="text-sm">Click "Add New Farmer" to register the first farmer.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredFarmers.map((farmer) => (
            <div key={farmer.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleExpand(farmer.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-full h-10 w-10 flex items-center justify-center text-primary font-bold">
                    {farmer.farmer_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{farmer.farmer_name}</p>
                    <p className="text-sm text-muted-foreground">{farmer.village}{farmer.district ? `, ${farmer.district}` : ""} — {farmer.state}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex gap-4 text-sm text-muted-foreground">
                    <span>📞 {farmer.phone || "N/A"}</span>
                    <span>🌾 {farmer.land_size_acres || "?"} acres</span>
                    <span>💧 {farmer.irrigation_type || "N/A"}</span>
                  </div>
                  {expandedFarmer === farmer.id ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </div>
              </div>

              {expandedFarmer === farmer.id && (
                <div className="border-t border-border p-4 bg-muted/10 animate-fade-in">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                    <div><span className="text-muted-foreground">Father:</span> <strong>{farmer.father_name || "N/A"}</strong></div>
                    <div><span className="text-muted-foreground">Aadhaar:</span> <strong>{farmer.aadhaar || "N/A"}</strong></div>
                    <div><span className="text-muted-foreground">Soil:</span> <strong>{farmer.soil_type || "N/A"}</strong></div>
                    <div><span className="text-muted-foreground">Registered:</span> <strong>{new Date(farmer.created_at).toLocaleDateString()}</strong></div>
                  </div>

                  {/* Crops */}
                  <h4 className="font-semibold text-sm mb-2">🌱 Crops</h4>
                  {farmerCrops[farmer.id]?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {farmerCrops[farmer.id].map((c: any, i: number) => (
                        <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium ${
                          c.crop_period === "past" ? "bg-muted text-muted-foreground" :
                          c.crop_period === "present" ? "bg-primary/10 text-primary" :
                          "bg-secondary/30 text-secondary-foreground"
                        }`}>
                          {c.crop_name} ({c.crop_period}{c.season ? ` / ${c.season}` : ""})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No crop data available.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerRegistration;
