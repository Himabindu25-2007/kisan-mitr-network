import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, FileText, Banknote, Bug, RefreshCw } from "lucide-react";

const AdminDashboard = () => {
  const { user, hasRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loanApps, setLoanApps] = useState<any[]>([]);
  const [diseaseReports, setDiseaseReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    if (!authLoading && (!user || !hasRole("admin"))) {
      toast({ title: "Access Denied", description: "Admin role required", variant: "destructive" });
      navigate("/dashboard");
    }
  }, [user, authLoading, hasRole]);

  const fetchAll = async () => {
    setLoading(true);
    const [c, l, d] = await Promise.all([
      supabase.from("complaints" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("loan_applications").select("*, farmers(farmer_name, village, district), loan_schemes(loan_name, provider)").order("created_at", { ascending: false }),
      supabase.from("disease_reports" as any).select("*").order("created_at", { ascending: false }),
    ]);
    setComplaints(c.data || []);
    setLoanApps(l.data || []);
    setDiseaseReports(d.data || []);
    setLoading(false);
  };

  useEffect(() => { if (user && hasRole("admin")) fetchAll(); }, [user, authLoading]);

  const updateStatus = async (table: string, id: string, status: string) => {
    const { error } = await supabase.from(table).update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${status}`, description: `Record has been ${status.toLowerCase()}` });
      if (table === "loan_applications") {
        await supabase.from("loan_status_tracking").insert({ application_id: id, stage: status === "Approved" ? "Loan Approved" : "Loan Rejected", notes: `Admin ${status.toLowerCase()} the application` });
      }
      fetchAll();
    }
  };

  const filterData = (data: any[]) => filter === "All" ? data : data.filter(d => d.status === filter);

  const stats = [
    { label: "Complaints", count: complaints.length, pending: complaints.filter(c => c.status === "Pending").length, icon: FileText, color: "text-accent" },
    { label: "Loan Applications", count: loanApps.length, pending: loanApps.filter(l => l.status === "Pending").length, icon: Banknote, color: "text-primary" },
    { label: "Disease Reports", count: diseaseReports.length, pending: diseaseReports.filter(d => d.status === "Pending").length, icon: Bug, color: "text-destructive" },
  ];

  const StatusBadge = ({ status }: { status: string }) => {
    const variant = status === "Approved" ? "default" : status === "Rejected" ? "destructive" : "secondary";
    return <Badge variant={variant}>{status}</Badge>;
  };

  const PriorityBadge = ({ priority }: { priority: string }) => {
    const colors: Record<string, string> = { Emergency: "bg-destructive text-destructive-foreground", Medium: "bg-accent text-accent-foreground", Normal: "bg-secondary text-secondary-foreground" };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[priority] || "bg-muted"}`}>{priority}</span>;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-7 w-7 text-primary" />
          <h1 className="text-2xl md:text-3xl font-display font-bold">Admin Control Panel</h1>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{s.count}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.pending} pending review</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["All", "Pending", "Approved", "Rejected"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="complaints">
        <TabsList className="mb-4">
          <TabsTrigger value="complaints">📋 Complaints ({filterData(complaints).length})</TabsTrigger>
          <TabsTrigger value="loans">💰 Loans ({filterData(loanApps).length})</TabsTrigger>
          <TabsTrigger value="diseases">🌱 Disease Reports ({filterData(diseaseReports).length})</TabsTrigger>
        </TabsList>

        {/* Complaints Tab */}
        <TabsContent value="complaints">
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Farmer", "Village", "District", "Problem", "Priority", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left p-3 font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filterData(complaints).length === 0 && (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No complaints found</td></tr>
                )}
                {filterData(complaints).map(c => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-3 font-medium">{c.farmer_name}</td>
                    <td className="p-3">{c.village}</td>
                    <td className="p-3">{c.district}</td>
                    <td className="p-3">{c.problem_type}</td>
                    <td className="p-3"><PriorityBadge priority={c.priority} /></td>
                    <td className="p-3"><StatusBadge status={c.status} /></td>
                    <td className="p-3 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      {c.status === "Pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" className="text-xs h-7 bg-primary text-primary-foreground" onClick={() => updateStatus("complaints", c.id, "Approved")}>✅ Approve</Button>
                          <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => updateStatus("complaints", c.id, "Rejected")}>❌ Reject</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Loans Tab */}
        <TabsContent value="loans">
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Farmer", "Village", "Loan Type", "Provider", "Amount", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left p-3 font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filterData(loanApps).length === 0 && (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No loan applications found</td></tr>
                )}
                {filterData(loanApps).map(l => (
                  <tr key={l.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-3 font-medium">{l.farmers?.farmer_name || "—"}</td>
                    <td className="p-3">{l.farmers?.village || "—"}</td>
                    <td className="p-3">{l.loan_schemes?.loan_name || "—"}</td>
                    <td className="p-3">{l.loan_schemes?.provider || "—"}</td>
                    <td className="p-3 font-medium">₹{Number(l.amount_requested).toLocaleString("en-IN")}</td>
                    <td className="p-3"><StatusBadge status={l.status} /></td>
                    <td className="p-3 text-xs">{new Date(l.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      {l.status === "Pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" className="text-xs h-7 bg-primary text-primary-foreground" onClick={() => updateStatus("loan_applications", l.id, "Approved")}>✅ Approve</Button>
                          <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => updateStatus("loan_applications", l.id, "Rejected")}>❌ Reject</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Disease Reports Tab */}
        <TabsContent value="diseases">
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Farmer", "Crop", "Disease", "Severity", "Confidence", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left p-3 font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filterData(diseaseReports).length === 0 && (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No disease reports found</td></tr>
                )}
                {filterData(diseaseReports).map(d => (
                  <tr key={d.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-3 font-medium">{d.farmer_name || "—"}</td>
                    <td className="p-3">{d.crop_name}</td>
                    <td className="p-3">{d.disease_name}</td>
                    <td className="p-3"><Badge variant={d.severity === "High" ? "destructive" : "secondary"}>{d.severity}</Badge></td>
                    <td className="p-3">{d.confidence}%</td>
                    <td className="p-3"><StatusBadge status={d.status} /></td>
                    <td className="p-3 text-xs">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      {d.status === "Pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" className="text-xs h-7 bg-primary text-primary-foreground" onClick={() => updateStatus("disease_reports", d.id, "Approved")}>✅ Approve</Button>
                          <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => updateStatus("disease_reports", d.id, "Rejected")}>❌ Reject</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
