import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const problemTypes = [
  "💧 Water Shortage",
  "⚡ Electricity Issue",
  "🏦 Loan Delay",
  "🛡️ Insurance Issue",
  "🧪 Fertilizer Shortage",
  "📉 Market Exploitation",
  "🐘 Wildlife Attack",
  "🌳 Illegal Tree Cutting",
  "🛤️ Road Damage",
];

const ReportProblems = () => {
  const [form, setForm] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (location.state) {
      const s = location.state as Record<string, string>;
      setForm((prev) => ({
        ...prev,
        ...(s.type && { type: s.type }),
        ...(s.description && { description: s.description }),
      }));
      if (s.photo) setPhoto(s.photo);
    }
  }, [location.state]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.type || !form.name) {
      toast({ title: "Missing fields", description: "Please fill in problem type and name", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    const priority = ["🐘 Wildlife Attack", "🌳 Illegal Tree Cutting"].includes(form.type) ? "Emergency" : 
                     ["💧 Water Shortage", "⚡ Electricity Issue"].includes(form.type) ? "Medium" : "Normal";

    const { error } = await supabase.from("complaints").insert({
      farmer_name: form.name,
      village: form.village || null,
      district: form.district || null,
      mobile: form.mobile || null,
      problem_type: form.type,
      description: form.description || null,
      photo_url: photo || null,
      priority,
      submitted_by: user?.id,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Complaint Submitted", description: "Your report has been sent for admin review." });
      setForm({});
      setPhoto(null);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-2">📋 Report Problems</h1>
      <p className="text-muted-foreground mb-8">Submit your farming issues for admin review & government action</p>

      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Problem Type</label>
          <Select value={form.type || ""} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
            <SelectTrigger><SelectValue placeholder="Select problem..." /></SelectTrigger>
            <SelectContent>
              {problemTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">📸 Attach Photo</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center cursor-pointer hover:border-primary/60 transition-colors"
          >
            {photo ? (
              <div className="relative">
                <img src={photo} alt="Attached" className="max-h-48 mx-auto rounded-lg" />
                <button
                  onClick={(e) => { e.stopPropagation(); setPhoto(null); }}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 text-xs font-bold"
                >✕</button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-primary/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Take photo or upload from gallery</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
        </div>

        {[
          { key: "name", label: "Your Name" },
          { key: "village", label: "Village" },
          { key: "district", label: "District" },
          { key: "mobile", label: "Mobile Number" },
        ].map((f) => (
          <div key={f.key}>
            <label className="text-sm font-medium mb-1 block">{f.label}</label>
            <Input value={form[f.key] || ""} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} />
          </div>
        ))}
        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            value={form.description || ""}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Describe your problem in detail..."
          />
        </div>
        <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-primary text-primary-foreground" size="lg">
          {submitting ? "Submitting..." : "📤 Submit Report"}
        </Button>
      </div>
    </div>
  );
};

export default ReportProblems;
