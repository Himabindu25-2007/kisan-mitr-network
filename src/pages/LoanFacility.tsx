import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LoanScheme = {
  id: string;
  loan_name: string;
  provider: string;
  max_amount: number;
  interest_rate: number;
  eligibility: string | null;
  description: string | null;
  loan_type: string;
  tenure_months: number | null;
  processing_fee: number | null;
};

type LoanApplication = {
  id: string;
  amount_requested: number;
  tenure_months: number;
  emi: number | null;
  status: string;
  created_at: string;
  farmer_id: string;
  loan_scheme_id: string;
};

type Farmer = {
  id: string;
  farmer_name: string;
  village: string | null;
  state: string | null;
  land_size_acres: number | null;
};

type TrackingEntry = {
  id: string;
  stage: string;
  notes: string | null;
  updated_at: string;
};

const loanIcons: Record<string, string> = {
  "Crop Loan": "🌾",
  "Kisan Credit Card": "💳",
  "Tractor Loan": "🚜",
  "Equipment Loan": "🔧",
  "Irrigation Loan": "💧",
  "Dairy Loan": "🐄",
  "Government Subsidy Loan": "🏛️",
};

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  "Under Review": "bg-blue-100 text-blue-800",
};

const LoanFacility = () => {
  const { user } = useAuth();
  const [schemes, setSchemes] = useState<LoanScheme[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [schemeMap, setSchemeMap] = useState<Record<string, LoanScheme>>({});
  const [farmerMap, setFarmerMap] = useState<Record<string, Farmer>>({});
  const [loading, setLoading] = useState(true);

  // Apply form state
  const [selectedScheme, setSelectedScheme] = useState<LoanScheme | null>(null);
  const [step, setStep] = useState(1);
  const [farmerId, setFarmerId] = useState("");
  const [amount, setAmount] = useState("");
  const [tenure, setTenure] = useState("12");

  // Tracking
  const [trackingAppId, setTrackingAppId] = useState<string | null>(null);
  const [trackingEntries, setTrackingEntries] = useState<TrackingEntry[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [schemesRes, farmersRes, appsRes] = await Promise.all([
      supabase.from("loan_schemes").select("*").eq("is_active", true),
      supabase.from("farmers").select("id, farmer_name, village, state, land_size_acres"),
      supabase.from("loan_applications").select("*").order("created_at", { ascending: false }),
    ]);

    if (schemesRes.data) {
      setSchemes(schemesRes.data);
      const map: Record<string, LoanScheme> = {};
      schemesRes.data.forEach((s) => (map[s.id] = s));
      setSchemeMap(map);
    }
    if (farmersRes.data) {
      setFarmers(farmersRes.data);
      const map: Record<string, Farmer> = {};
      farmersRes.data.forEach((f) => (map[f.id] = f));
      setFarmerMap(map);
    }
    if (appsRes.data) setApplications(appsRes.data as LoanApplication[]);
    setLoading(false);
  };

  const calculateEMI = (principal: number, rate: number, months: number) => {
    if (rate === 0) return principal / months;
    const r = rate / 100 / 12;
    return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  };

  const handleApply = async () => {
    if (!user || !selectedScheme) return;
    const amt = parseFloat(amount);
    const ten = parseInt(tenure);
    const emi = calculateEMI(amt, selectedScheme.interest_rate, ten);

    const { data, error } = await supabase.from("loan_applications").insert({
      farmer_id: farmerId,
      loan_scheme_id: selectedScheme.id,
      amount_requested: amt,
      tenure_months: ten,
      emi: Math.round(emi),
      applied_by: user.id,
    }).select().single();

    if (error) {
      toast({ title: "❌ Error", description: error.message, variant: "destructive" });
      return;
    }

    // Add initial tracking entry
    if (data) {
      await supabase.from("loan_status_tracking").insert({
        application_id: data.id,
        stage: "Submitted",
        notes: "Application submitted successfully",
      });
    }

    toast({
      title: "✅ Application Submitted!",
      description: `Loan application for ₹${amt.toLocaleString("en-IN")} submitted successfully.`,
    });
    setSelectedScheme(null);
    setStep(1);
    setFarmerId("");
    setAmount("");
    setTenure("12");
    fetchData();
  };

  const loadTracking = async (appId: string) => {
    setTrackingAppId(appId);
    const { data } = await supabase
      .from("loan_status_tracking")
      .select("*")
      .eq("application_id", appId)
      .order("updated_at", { ascending: true });
    if (data) setTrackingEntries(data as TrackingEntry[]);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading loan data...</div>;
  }

  // Application flow
  if (selectedScheme) {
    const emi = amount && tenure
      ? calculateEMI(parseFloat(amount) || 0, selectedScheme.interest_rate, parseInt(tenure) || 12)
      : 0;

    return (
      <div className="animate-fade-in max-w-2xl mx-auto">
        <button onClick={() => { setSelectedScheme(null); setStep(1); }} className="text-primary mb-4 hover:underline">
          ← Back to Loan Schemes
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
            {step === 1 ? "Select Farmer" : step === 2 ? "Loan Details" : "Review & Submit"}
          </span>
        </div>

        <h2 className="text-2xl font-display font-bold mb-2">
          {loanIcons[selectedScheme.loan_type] || "💰"} {selectedScheme.loan_name}
        </h2>
        <p className="text-muted-foreground text-sm mb-6">Provider: {selectedScheme.provider}</p>

        {step === 1 && (
          <div className="space-y-4">
            <label className="font-semibold">Select Farmer</label>
            {farmers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No farmers registered yet. Please register farmers first.</p>
            ) : (
              <Select onValueChange={(v) => setFarmerId(v)}>
                <SelectTrigger><SelectValue placeholder="Choose farmer..." /></SelectTrigger>
                <SelectContent>
                  {farmers.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.farmer_name} — {f.village || "N/A"}, {f.state || "N/A"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={() => farmerId && setStep(2)} disabled={!farmerId} className="w-full">
              Next →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-3 text-sm">
              👨‍🌾 Farmer: <strong>{farmerMap[farmerId]?.farmer_name}</strong> |
              Scheme: <strong>{selectedScheme.loan_name}</strong> |
              Max: <strong>₹{selectedScheme.max_amount.toLocaleString("en-IN")}</strong>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Loan Amount (₹)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={selectedScheme.max_amount}
                placeholder={`Max ₹${selectedScheme.max_amount.toLocaleString("en-IN")}`}
              />
              {parseFloat(amount) > selectedScheme.max_amount && (
                <p className="text-destructive text-xs mt-1">Amount exceeds maximum limit</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tenure (Months)</label>
              <Select value={tenure} onValueChange={setTenure}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[6, 12, 24, 36, 48, 60].map((m) => (
                    <SelectItem key={m} value={m.toString()}>{m} months</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {emi > 0 && (
              <div className="bg-primary/10 rounded-lg p-4 text-sm space-y-1">
                <p>📊 <strong>EMI Estimate:</strong> ₹{Math.round(emi).toLocaleString("en-IN")}/month</p>
                <p>📈 Interest Rate: {selectedScheme.interest_rate}% p.a.</p>
                <p>💰 Total Payable: ₹{Math.round(emi * parseInt(tenure)).toLocaleString("en-IN")}</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
              <Button
                onClick={() => setStep(3)}
                className="flex-1"
                disabled={!amount || parseFloat(amount) > selectedScheme.max_amount || parseFloat(amount) <= 0}
              >
                Review →
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-2 text-sm">
              <p><strong>Loan Scheme:</strong> {selectedScheme.loan_name}</p>
              <p><strong>Provider:</strong> {selectedScheme.provider}</p>
              <p><strong>Farmer:</strong> {farmerMap[farmerId]?.farmer_name}</p>
              <p><strong>Amount:</strong> ₹{parseFloat(amount).toLocaleString("en-IN")}</p>
              <p><strong>Tenure:</strong> {tenure} months</p>
              <p><strong>Interest Rate:</strong> {selectedScheme.interest_rate}% p.a.</p>
              <p><strong>EMI:</strong> ₹{Math.round(emi).toLocaleString("en-IN")}/month</p>
              <p><strong>Total Payable:</strong> ₹{Math.round(emi * parseInt(tenure)).toLocaleString("en-IN")}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>← Edit</Button>
              <Button onClick={handleApply} className="flex-1">✅ Submit Application</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-display font-bold mb-2">🏦 Loan Facility</h1>
      <p className="text-muted-foreground mb-6">Government-backed loans & schemes for Indian farmers</p>

      <Tabs defaultValue="schemes" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="schemes">Available Schemes</TabsTrigger>
          <TabsTrigger value="applications">My Applications ({applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="schemes">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map((scheme) => (
              <div key={scheme.id} className="bg-card rounded-xl border border-border p-6 card-hover">
                <span className="text-3xl block mb-3">{loanIcons[scheme.loan_type] || "💰"}</span>
                <h3 className="font-display font-semibold text-lg mb-1">{scheme.loan_name}</h3>
                <p className="text-muted-foreground text-sm mb-1">{scheme.description}</p>
                <p className="text-xs text-muted-foreground mb-4">Provider: {scheme.provider}</p>
                <div className="space-y-1 mb-4 text-sm">
                  <p>Max: <strong className="text-primary">₹{scheme.max_amount.toLocaleString("en-IN")}</strong></p>
                  <p>Interest: <strong>{scheme.interest_rate}% p.a.</strong></p>
                  {scheme.eligibility && <p className="text-xs text-muted-foreground">✅ {scheme.eligibility}</p>}
                </div>
                <Button onClick={() => setSelectedScheme(scheme)} className="w-full">
                  Apply Now →
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applications">
          {applications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-4xl mb-3">📋</p>
              <p>No loan applications yet. Apply for a scheme to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const scheme = schemeMap[app.loan_scheme_id];
                const farmer = farmerMap[app.farmer_id];
                return (
                  <div key={app.id} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold">{scheme?.loan_name || "Unknown Scheme"}</h3>
                        <p className="text-sm text-muted-foreground">
                          Farmer: {farmer?.farmer_name || "Unknown"} • {new Date(app.created_at).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <Badge className={statusColors[app.status] || "bg-muted"}>{app.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
                      <div><span className="text-muted-foreground">Amount:</span> <strong>₹{app.amount_requested.toLocaleString("en-IN")}</strong></div>
                      <div><span className="text-muted-foreground">Tenure:</span> <strong>{app.tenure_months}m</strong></div>
                      <div><span className="text-muted-foreground">EMI:</span> <strong>₹{(app.emi || 0).toLocaleString("en-IN")}</strong></div>
                      <div><span className="text-muted-foreground">Rate:</span> <strong>{scheme?.interest_rate || 0}%</strong></div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => loadTracking(app.id)}>
                      📍 Track Status
                    </Button>

                    {trackingAppId === app.id && (
                      <div className="mt-4 border-t border-border pt-4">
                        <h4 className="text-sm font-semibold mb-3">Application Progress</h4>
                        {trackingEntries.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No tracking updates yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {trackingEntries.map((t, i) => (
                              <div key={t.id} className="flex items-start gap-3">
                                <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${i === trackingEntries.length - 1 ? "bg-primary" : "bg-muted-foreground/40"}`} />
                                <div>
                                  <p className="text-sm font-medium">{t.stage}</p>
                                  {t.notes && <p className="text-xs text-muted-foreground">{t.notes}</p>}
                                  <p className="text-xs text-muted-foreground">{new Date(t.updated_at).toLocaleString("en-IN")}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoanFacility;
