import { Phone, ShieldAlert, Lightbulb, Zap, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const protectionMethods = [
  {
    title: "Solar Fencing",
    icon: Sun,
    desc: "Eco-friendly electric fence powered by solar panels. Non-lethal shock deters animals.",
    cost: "₹30,000-80,000",
    effectiveness: "Very High",
  },
  {
    title: "Electric Fencing",
    icon: Zap,
    desc: "Grid-powered perimeter fencing with pulsed electric current for crop protection.",
    cost: "₹20,000-50,000",
    effectiveness: "High",
  },
  {
    title: "Motion Sensor Alarms",
    icon: ShieldAlert,
    desc: "PIR motion sensors trigger loud alarms and lights when animals approach.",
    cost: "₹5,000-15,000",
    effectiveness: "Moderate",
  },
  {
    title: "Night Lighting",
    icon: Lightbulb,
    desc: "Solar-powered LED flood lights deter nocturnal animals from entering fields.",
    cost: "₹3,000-10,000",
    effectiveness: "Moderate",
  },
];

const forestContacts = [
  { name: "National Forest Helpline", number: "1926" },
  { name: "Emergency Services", number: "112" },
  { name: "Andhra Pradesh Forest Dept", number: "0866-2573353" },
  { name: "Maharashtra Forest Dept", number: "022-22025313" },
  { name: "Karnataka Forest Dept", number: "080-22266935" },
  { name: "Tamil Nadu Forest Dept", number: "044-24321738" },
  { name: "Punjab Forest Dept", number: "0172-2740203" },
  { name: "Madhya Pradesh Forest Dept", number: "0755-2674302" },
];

const animals = ["🐘 Elephant", "🐗 Wild Boar", "🐒 Monkey", "🦌 Deer", "🐆 Leopard", "🐍 Snake"];

const WildlifeProtection = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-display font-bold mb-2">🛡️ Wildlife Raksha SOS</h1>
      <p className="text-muted-foreground mb-8">Protect your crops from wild animals — get emergency help</p>

      {/* SOS Button */}
      <div className="bg-destructive/10 border-2 border-destructive rounded-xl p-6 mb-8 text-center">
        <h2 className="text-2xl font-display font-bold text-destructive mb-2">🆘 Emergency SOS</h2>
        <p className="text-muted-foreground mb-4">Wild animal threatening your farm? Get help now!</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="tel:1926">
            <Button size="lg" className="bg-destructive text-destructive-foreground text-lg px-8">
              📞 Call Forest Dept (1926)
            </Button>
          </a>
          <a href="tel:112">
            <Button size="lg" variant="outline" className="border-destructive text-destructive text-lg px-8">
              🚨 Emergency 112
            </Button>
          </a>
        </div>
      </div>

      {/* Animal Types */}
      <div className="mb-8">
        <h3 className="font-display font-bold text-lg mb-3">Report Animal Type</h3>
        <div className="flex flex-wrap gap-2">
          {animals.map((a) => (
            <button key={a} className="px-4 py-2 bg-card border border-border rounded-lg text-sm hover:bg-muted transition-colors">
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Protection Methods */}
      <h3 className="font-display font-bold text-lg mb-4">🔒 Protection Methods</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {protectionMethods.map((m) => (
          <div key={m.title} className="bg-card rounded-xl border border-border p-5 card-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <m.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h4 className="font-display font-semibold">{m.title}</h4>
            </div>
            <p className="text-muted-foreground text-sm mb-3">{m.desc}</p>
            <div className="flex justify-between text-sm">
              <span>Cost: <strong className="text-primary">{m.cost}</strong></span>
              <span>Effectiveness: <strong>{m.effectiveness}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Forest Contacts */}
      <h3 className="font-display font-bold text-lg mb-4">☎️ Forest Department Contacts</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {forestContacts.map((c) => (
          <a
            key={c.number}
            href={`tel:${c.number}`}
            className="flex items-center justify-between bg-card rounded-lg border border-border p-4 hover:bg-leaf-light transition-colors"
          >
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">{c.name}</span>
            </div>
            <span className="font-bold text-primary">{c.number}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default WildlifeProtection;
