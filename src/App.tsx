import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import AboutCrops from "./pages/AboutCrops";
import CropInformation from "./pages/CropInformation";
import FarmersNeeds from "./pages/FarmersNeeds";
import LoanFacility from "./pages/LoanFacility";
import WildlifeProtection from "./pages/WildlifeProtection";
import CropDisease from "./pages/CropDisease";
import MarketAnalytics from "./pages/MarketAnalytics";
import IndiaMap from "./pages/IndiaMap";
import Marketing from "./pages/Marketing";
import ReportProblems from "./pages/ReportProblems";
import Helplines from "./pages/Helplines";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<AboutCrops />} />
            <Route path="crop-info" element={<CropInformation />} />
            <Route path="farmers-needs" element={<FarmersNeeds />} />
            <Route path="loan-facility" element={<LoanFacility />} />
            <Route path="wildlife-protection" element={<WildlifeProtection />} />
            <Route path="marketing" element={<Marketing />} />
            <Route path="crop-disease" element={<CropDisease />} />
            <Route path="market-analytics" element={<MarketAnalytics />} />
            <Route path="india-map" element={<IndiaMap />} />
            <Route path="report-problems" element={<ReportProblems />} />
            <Route path="helplines" element={<Helplines />} />
          </Route>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
