import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");

  const mockData = {
    diseases: [
      { id: 1, crop: "Rice", disease: "Bacterial Leaf Blight", farmer: "Raju K.", date: "2026-02-24", status: "Pending" },
      { id: 2, crop: "Tomato", disease: "Late Blight", farmer: "Suresh M.", date: "2026-02-23", status: "Reviewed" },
    ],
    loans: [
      { id: 1, name: "Venkat R.", bank: "SBI", amount: "₹2,00,000", type: "Crop Loan", status: "Pending" },
      { id: 2, name: "Lakshmi D.", bank: "PNB", amount: "₹5,00,000", type: "Tractor Loan", status: "Approved" },
    ],
    sales: [
      { id: 1, farmer: "Kumar S.", crop: "Wheat", qty: "500 kg", price: "₹28/kg", status: "Listed" },
    ],
    complaints: [
      { id: 1, type: "Water Shortage", farmer: "Ramesh P.", district: "Guntur", status: "Open" },
      { id: 2, type: "Loan Delay", farmer: "Anjali K.", district: "Pune", status: "Resolved" },
    ],
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card rounded-xl border border-border p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-display font-bold mb-2">🔐 Admin Login</h1>
          <p className="text-muted-foreground mb-6 text-sm">Enter admin password to continue</p>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
          <Button
            onClick={() => {
              if (password === "admin123") {
                setLoggedIn(true);
              } else {
                toast({ title: "Invalid password", description: "Hint: admin123", variant: "destructive" });
              }
            }}
            className="w-full bg-primary text-primary-foreground"
          >
            Login
          </Button>
        </div>
      </div>
    );
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      Pending: "bg-secondary text-secondary-foreground",
      Approved: "bg-primary text-primary-foreground",
      Rejected: "bg-destructive text-destructive-foreground",
      Reviewed: "bg-sky text-sky-foreground",
      Open: "bg-accent text-accent-foreground",
      Resolved: "bg-primary text-primary-foreground",
      Listed: "bg-secondary text-secondary-foreground",
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-muted"}`}>{status}</span>;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold">🛠️ Admin Dashboard</h1>
          <Button variant="outline" onClick={() => setLoggedIn(false)}>Logout</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Disease Reports", count: mockData.diseases.length, color: "bg-accent" },
            { label: "Loan Applications", count: mockData.loans.length, color: "bg-primary" },
            { label: "Selling Requests", count: mockData.sales.length, color: "bg-secondary" },
            { label: "Complaints", count: mockData.complaints.length, color: "bg-sky" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-5 text-center">
              <p className="text-3xl font-bold text-foreground">{s.count}</p>
              <p className="text-muted-foreground text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tables */}
        {[
          { title: "🏥 Disease Reports", data: mockData.diseases, cols: ["Crop", "Disease", "Farmer", "Date", "Status"] },
          { title: "🏦 Loan Applications", data: mockData.loans, cols: ["Name", "Bank", "Amount", "Type", "Status"] },
          { title: "📋 Complaints", data: mockData.complaints, cols: ["Type", "Farmer", "District", "Status"] },
        ].map((section) => (
          <div key={section.title} className="mb-8">
            <h3 className="font-display font-bold text-lg mb-3">{section.title}</h3>
            <div className="bg-card rounded-xl border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {section.cols.map((c) => (
                      <th key={c} className="text-left p-3 font-semibold text-muted-foreground">{c}</th>
                    ))}
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {section.data.map((row: any) => (
                    <tr key={row.id} className="border-b border-border/50">
                      {Object.entries(row)
                        .filter(([k]) => k !== "id")
                        .map(([k, v]) => (
                          <td key={k} className="p-3">
                            {k === "status" ? <StatusBadge status={v as string} /> : (v as string)}
                          </td>
                        ))}
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="text-xs h-7 border-primary text-primary">Approve</Button>
                          <Button size="sm" variant="outline" className="text-xs h-7 border-destructive text-destructive">Reject</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
