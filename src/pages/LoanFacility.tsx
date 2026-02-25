import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const loanTypes = [
  { name: "Crop Loan", desc: "Short-term loan for crop cultivation expenses", max: "₹3,00,000", rate: "4% p.a.", icon: "🌾" },
  { name: "Equipment Loan", desc: "Purchase tractors, harvesters & machinery", max: "₹10,00,000", rate: "8% p.a.", icon: "🚜" },
  { name: "Tractor Loan", desc: "Dedicated financing for tractor purchase", max: "₹8,00,000", rate: "7.5% p.a.", icon: "🚜" },
  { name: "Irrigation Loan", desc: "Setup drip, sprinkler or bore well systems", max: "₹5,00,000", rate: "6% p.a.", icon: "💧" },
  { name: "Dairy Loan", desc: "Start or expand dairy farming operations", max: "₹7,00,000", rate: "7% p.a.", icon: "🐄" },
  { name: "Kisan Credit Card", desc: "Flexible credit for all farming needs", max: "₹3,00,000", rate: "4% p.a.", icon: "💳" },
];

const banks = [
  "State Bank of India (SBI)", "Punjab National Bank (PNB)", "Bank of Baroda",
  "Canara Bank", "HDFC Bank", "ICICI Bank", "Axis Bank", "Indian Bank", "Andhra Bank",
];

const states = [
  "Andhra Pradesh", "Bihar", "Gujarat", "Haryana", "Karnataka",
  "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu",
  "Telangana", "Uttar Pradesh", "West Bengal",
];

const LoanFacility = () => {
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [bank, setBank] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const appId = `KKR-${Date.now().toString(36).toUpperCase()}`;
    toast({
      title: "✅ Application Submitted!",
      description: `Your loan request has been submitted to ${bank}. Application ID: ${appId}`,
    });
    setSelectedLoan(null);
    setStep(1);
    setBank("");
    setFormData({});
  };

  if (selectedLoan) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto">
        <button onClick={() => { setSelectedLoan(null); setStep(1); }} className="text-primary mb-4 hover:underline">
          ← Back to Loan Types
        </button>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-1 rounded ${s < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {step === 1 ? "Select Bank" : step === 2 ? "Fill Details" : "Submit"}
          </span>
        </div>

        <h2 className="text-2xl font-display font-bold mb-6">{selectedLoan} Application</h2>

        {step === 1 && (
          <div className="space-y-4">
            <label className="font-semibold">Select Bank</label>
            <Select onValueChange={(v) => setBank(v)}>
              <SelectTrigger><SelectValue placeholder="Choose your bank..." /></SelectTrigger>
              <SelectContent>
                {banks.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => bank && setStep(2)} disabled={!bank} className="w-full bg-primary text-primary-foreground">
              Next →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-leaf-light rounded-lg p-3 mb-4 text-sm">
              🏦 Bank: <strong>{bank}</strong> | Loan: <strong>{selectedLoan}</strong>
            </div>
            {[
              { key: "fullName", label: "Full Name", type: "text" },
              { key: "fatherName", label: "Father's Name", type: "text" },
              { key: "aadhaar", label: "Aadhaar Number", type: "text" },
              { key: "mobile", label: "Mobile Number", type: "tel" },
              { key: "village", label: "Village", type: "text" },
              { key: "district", label: "District", type: "text" },
              { key: "landSize", label: "Land Size (acres)", type: "number" },
              { key: "cropType", label: "Crop Type", type: "text" },
              { key: "income", label: "Annual Income (₹)", type: "number" },
              { key: "loanAmount", label: "Loan Amount Required (₹)", type: "number" },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-sm font-medium mb-1 block">{field.label}</label>
                <Input
                  type={field.type}
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, [field.key]: e.target.value }))}
                />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium mb-1 block">State</label>
              <Select onValueChange={(v) => setFormData((p) => ({ ...p, state: v }))}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
              <Button onClick={() => setStep(3)} className="flex-1 bg-primary text-primary-foreground">Review & Submit</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-2 text-sm">
              <p><strong>Loan Type:</strong> {selectedLoan}</p>
              <p><strong>Bank:</strong> {bank}</p>
              {Object.entries(formData).map(([k, v]) => (
                <p key={k}><strong className="capitalize">{k.replace(/([A-Z])/g, " $1")}:</strong> {v}</p>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>← Edit</Button>
              <Button onClick={handleSubmit} className="flex-1 bg-primary text-primary-foreground">✅ Submit Application</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-display font-bold mb-2">🏦 Loan Facility</h1>
      <p className="text-muted-foreground mb-8">Government-backed loans for Indian farmers</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loanTypes.map((loan) => (
          <div key={loan.name} className="bg-card rounded-xl border border-border p-6 card-hover">
            <span className="text-3xl block mb-3">{loan.icon}</span>
            <h3 className="font-display font-semibold text-lg mb-1">{loan.name}</h3>
            <p className="text-muted-foreground text-sm mb-4">{loan.desc}</p>
            <div className="space-y-1 mb-4 text-sm">
              <p>Max: <strong className="text-primary">{loan.max}</strong></p>
              <p>Interest: <strong>{loan.rate}</strong></p>
            </div>
            <Button onClick={() => setSelectedLoan(loan.name)} className="w-full bg-primary text-primary-foreground">
              Apply Now →
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoanFacility;
