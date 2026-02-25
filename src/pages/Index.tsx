import { Link } from "react-router-dom";
import { Sprout, BarChart3, Map, Phone, ShieldAlert, TrendingUp, Upload, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroFarmer from "@/assets/hero-farmer.jpg";

const features = [
  { icon: Upload, title: "Scan Crop Disease", desc: "Upload crop photo for instant AI diagnosis", link: "/dashboard/crop-disease", color: "bg-primary" },
  { icon: IndianRupee, title: "Market Prices", desc: "Real-time crop prices & demand analytics", link: "/dashboard/market-analytics", color: "bg-secondary" },
  { icon: Sprout, title: "Government Schemes", desc: "Loans, subsidies & PM Kisan support", link: "/dashboard/loan-facility", color: "bg-sky" },
  { icon: ShieldAlert, title: "Wildlife SOS", desc: "Emergency help for animal threats", link: "/dashboard/wildlife-protection", color: "bg-accent" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-secondary" />
            <span className="font-display font-bold text-lg text-primary-foreground">KISAN KI RAKSHA</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {["Home", "Dashboard", "Market Analytics", "India Map", "Helplines"].map((item) => (
              <Link
                key={item}
                to={item === "Home" ? "/" : `/dashboard/${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-primary-foreground/80 hover:text-secondary transition-colors text-sm font-medium"
              >
                {item}
              </Link>
            ))}
            <Link to="/admin">
              <Button size="sm" variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                Admin Login
              </Button>
            </Link>
          </div>
          <Link to="/dashboard" className="md:hidden">
            <Button size="sm" className="bg-secondary text-secondary-foreground">Dashboard</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0">
          <img src={heroFarmer} alt="Indian farmer in field" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-2xl animate-fade-in">
            <p className="text-secondary font-display font-semibold text-lg mb-3">🌾 Smart Farming Partner</p>
            <h1 className="text-5xl md:text-7xl font-display font-black text-primary-foreground leading-tight mb-4">
              KISAN KI<br />RAKSHA
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 font-light mb-2">
              Detect. Protect. Grow. Sell.
            </p>
            <p className="text-primary-foreground/70 text-lg mb-8 max-w-lg">
              Protecting Farmers with AI & Smart Market Intelligence. Your complete digital agriculture ecosystem.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-display font-semibold text-lg px-8 py-6 rounded-xl shadow-saffron">
                  Enter Dashboard
                </Button>
              </Link>
              <Link to="/dashboard/crop-disease">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-display text-lg px-8 py-6 rounded-xl">
                  📸 Upload Crop Photo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gradient-wheat">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-3">
            Smart Farming at Your Fingertips
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Everything a farmer needs — from disease detection to market selling — in one platform.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Link
                key={f.title}
                to={f.link}
                className="bg-card rounded-xl p-6 card-hover border border-border"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-12 h-12 ${f.color} rounded-lg flex items-center justify-center mb-4`}>
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "8+", label: "Crops Supported" },
              { num: "28", label: "States Covered" },
              { num: "₹0", label: "Platform Cost" },
              { num: "24/7", label: "Helpline Access" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-display font-bold text-secondary">{s.num}</p>
                <p className="text-primary-foreground/70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-earth py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-primary-foreground/60 text-sm">
            🌾 Kisan Ki Raksha — Built for Indian Farmers | Hackathon Project
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
