import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
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
import FarmerRegistration from "./pages/FarmerRegistration";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
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
              <Route path="farmer-registration" element={<FarmerRegistration />} />
            </Route>
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
