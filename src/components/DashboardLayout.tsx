import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Sprout, Wheat, ShoppingCart, Landmark, ShieldAlert, Store, Bug,
  BarChart3, Map, FileWarning, Phone, Settings, Search, Menu, X, MessageCircle
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const menuItems = [
  { title: "About Crops", path: "/dashboard", icon: Sprout },
  { title: "Crop Information", path: "/dashboard/crop-info", icon: Wheat },
  { title: "Farmers Needs", path: "/dashboard/farmers-needs", icon: ShoppingCart },
  { title: "Loan Facility", path: "/dashboard/loan-facility", icon: Landmark },
  { title: "Wildlife Protection", path: "/dashboard/wildlife-protection", icon: ShieldAlert },
  { title: "Sell Crop", path: "/dashboard/marketing", icon: Store },
  { title: "Crop Disease", path: "/dashboard/crop-disease", icon: Bug },
  { title: "Market Analytics", path: "/dashboard/market-analytics", icon: BarChart3 },
  { title: "India Crop Map", path: "/dashboard/india-map", icon: Map },
  { title: "Report Problems", path: "/dashboard/report-problems", icon: FileWarning },
  { title: "Helplines", path: "/dashboard/helplines", icon: Phone },
  { title: "🤖 Kisan Mitra AI", path: "/dashboard/chat-assistant", icon: MessageCircle },
];

const DashboardLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-sidebar text-sidebar-foreground z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-sidebar-primary" />
            <span className="font-display font-bold text-lg">KISAN KI RAKSHA</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Admin Panel</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted">
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search crop, pesticide, price or demand…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-muted/50 border-0"
            />
          </div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">
            ← Back to Home
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
