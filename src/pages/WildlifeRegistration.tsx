import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, PawPrint, TreePine, User, Phone } from "lucide-react";

const animalTypes = ["Tiger", "Lion", "Elephant", "Leopard", "Deer", "Bear", "Wolf", "Rhino", "Cheetah"];

const animalEmojis: Record<string, string> = {
  Tiger: "🐅", Lion: "🦁", Elephant: "🐘", Leopard: "🐆", Deer: "🦌",
  Bear: "🐻", Wolf: "🐺", Rhino: "🦏", Cheetah: "🐆",
};

const WildlifeRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    animal_name: "",
    animal_type: "",
    forest_zone: "",
    officer_name: "",
    officer_contact: "",
    initial_latitude: "",
    initial_longitude: "",
  });

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          initial_latitude: pos.coords.latitude.toFixed(6),
          initial_longitude: pos.coords.longitude.toFixed(6),
        }));
        toast.success("Location detected!");
      },
      () => toast.error("Could not detect location")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.animal_type || !form.animal_name || !form.forest_zone || !form.officer_name || !form.initial_latitude) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const lat = parseFloat(form.initial_latitude);
      const lng = parseFloat(form.initial_longitude);
      const { data, error } = await supabase
        .from("wild_animals")
        .insert({
          animal_name: form.animal_name,
          animal_type: form.animal_type,
          forest_zone: form.forest_zone,
          officer_name: form.officer_name,
          officer_contact: form.officer_contact || "",
          initial_latitude: lat,
          initial_longitude: lng,
          current_latitude: lat,
          current_longitude: lng,
          tracking_id: "TEMP",
        })
        .select()
        .single();

      if (error) throw error;
      toast.success(`✅ Animal registered! Tracking ID: ${data.tracking_id}`);
      navigate("/dashboard/wildlife-tracking");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <PawPrint className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold">Register Wildlife</h1>
          <p className="text-muted-foreground text-sm">Add a new animal to the GPS tracking system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Animal Name *</Label>
            <Input
              placeholder="e.g. Raja, Sheru"
              value={form.animal_name}
              onChange={(e) => setForm({ ...form, animal_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Animal Type *</Label>
            <Select value={form.animal_type} onValueChange={(v) => setForm({ ...form, animal_type: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select animal type" />
              </SelectTrigger>
              <SelectContent>
                {animalTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {animalEmojis[t]} {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2"><TreePine className="h-4 w-4" /> Forest Zone *</Label>
          <Input
            placeholder="e.g. Nagarjuna Sagar, Jim Corbett"
            value={form.forest_zone}
            onChange={(e) => setForm({ ...form, forest_zone: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><User className="h-4 w-4" /> Officer Name *</Label>
            <Input
              placeholder="Officer name"
              value={form.officer_name}
              onChange={(e) => setForm({ ...form, officer_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Phone className="h-4 w-4" /> Contact Number</Label>
            <Input
              placeholder="Phone number"
              value={form.officer_contact}
              onChange={(e) => setForm({ ...form, officer_contact: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" /> GPS Location *</Label>
          <Button type="button" variant="outline" onClick={detectLocation} className="w-full">
            📍 Auto-Detect Current Location
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Latitude (e.g. 15.8281)"
              value={form.initial_latitude}
              onChange={(e) => setForm({ ...form, initial_latitude: e.target.value })}
              required
            />
            <Input
              placeholder="Longitude (e.g. 78.0373)"
              value={form.initial_longitude}
              onChange={(e) => setForm({ ...form, initial_longitude: e.target.value })}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full text-lg py-6" disabled={loading}>
          {loading ? "Registering..." : "🐾 Register & Start Tracking"}
        </Button>
      </form>
    </div>
  );
};

export default WildlifeRegistration;
