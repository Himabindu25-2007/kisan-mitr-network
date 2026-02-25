import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const problemTypes = [
  "💧 Water Shortage",
  "⚡ Electricity Issue",
  "🏦 Loan Delay",
  "🛡️ Insurance Issue",
  "🧪 Fertilizer Shortage",
  "📉 Market Exploitation",
];

const ReportProblems = () => {
  const [form, setForm] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    toast({
      title: "✅ Complaint Submitted",
      description: "Your report has been sent to the government dashboard. Track ID: " + Date.now().toString(36).toUpperCase(),
    });
    setForm({});
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-2">📋 Report Problems</h1>
      <p className="text-muted-foreground mb-8">Submit your farming issues to the government dashboard</p>

      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Problem Type</label>
          <Select onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
            <SelectTrigger><SelectValue placeholder="Select problem..." /></SelectTrigger>
            <SelectContent>
              {problemTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
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
        <Button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground" size="lg">
          📤 Submit Report
        </Button>
      </div>
    </div>
  );
};

export default ReportProblems;
