import { Phone } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const nationalHelplines = [
  { name: "Kisan Call Center", number: "1800-180-1551", desc: "Free farming advice 24/7" },
  { name: "PM Kisan Helpline", number: "155261", desc: "PM-KISAN scheme queries" },
  { name: "Disaster Management", number: "1078", desc: "Flood, drought, cyclone help" },
  { name: "Electricity Complaint", number: "1912", desc: "Power supply issues" },
  { name: "Emergency Services", number: "112", desc: "Police, Fire, Ambulance" },
  { name: "Forest Helpline", number: "1926", desc: "Wildlife conflicts" },
];

const stateContacts: Record<string, { agri: string; forest: string; address: string }> = {
  "Andhra Pradesh": { agri: "0866-2974871", forest: "0866-2573353", address: "Dept of Agriculture, Amaravati" },
  "Karnataka": { agri: "080-22280738", forest: "080-22266935", address: "MS Building, Bangalore" },
  "Maharashtra": { agri: "020-26122451", forest: "022-22025313", address: "Agriculture Dept, Pune" },
  "Punjab": { agri: "0172-2740043", forest: "0172-2740203", address: "Agriculture Bhawan, Chandigarh" },
  "Tamil Nadu": { agri: "044-25671463", forest: "044-24321738", address: "Secretariat, Chennai" },
  "Telangana": { agri: "040-23450025", forest: "040-23231567", address: "Agriculture Dept, Hyderabad" },
  "Uttar Pradesh": { agri: "0522-2286765", forest: "0522-2622030", address: "Agriculture Bhawan, Lucknow" },
};

const Helplines = () => {
  const [state, setState] = useState<string>("");

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-display font-bold mb-2">☎️ Government & Helplines</h1>
      <p className="text-muted-foreground mb-8">Click any number to call directly</p>

      {/* National Helplines */}
      <h3 className="font-display font-bold text-lg mb-4">🇮🇳 National Helplines</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {nationalHelplines.map((h) => (
          <a
            key={h.number}
            href={`tel:${h.number}`}
            className="bg-card rounded-xl border border-border p-5 card-hover flex items-start gap-4"
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <Phone className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-display font-semibold">{h.name}</p>
              <p className="text-primary font-bold text-lg">{h.number}</p>
              <p className="text-muted-foreground text-xs">{h.desc}</p>
            </div>
          </a>
        ))}
      </div>

      {/* State Contacts */}
      <h3 className="font-display font-bold text-lg mb-4">🏛️ State Departments</h3>
      <div className="max-w-md mb-6">
        <Select onValueChange={(v) => setState(v)}>
          <SelectTrigger><SelectValue placeholder="Select your state..." /></SelectTrigger>
          <SelectContent>
            {Object.keys(stateContacts).map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {state && stateContacts[state] && (
        <div className="bg-card rounded-xl border border-border p-6 animate-fade-in max-w-lg">
          <h4 className="font-display font-bold text-lg mb-4">{state}</h4>
          <div className="space-y-4">
            <a href={`tel:${stateContacts[state].agri}`} className="flex justify-between items-center p-3 bg-leaf-light rounded-lg hover:bg-leaf-light/80">
              <span className="font-medium">Agriculture Department</span>
              <span className="text-primary font-bold">{stateContacts[state].agri}</span>
            </a>
            <a href={`tel:${stateContacts[state].forest}`} className="flex justify-between items-center p-3 bg-leaf-light rounded-lg hover:bg-leaf-light/80">
              <span className="font-medium">Forest Department</span>
              <span className="text-primary font-bold">{stateContacts[state].forest}</span>
            </a>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Office Address</p>
              <p className="font-medium text-sm">{stateContacts[state].address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Helplines;
