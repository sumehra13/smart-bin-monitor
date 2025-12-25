import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import CitizenDashboard from "./pages/CitizenDashboard";
import BBMPDashboard from "./pages/BBMPDashboard";
import ReportIssue from "./pages/ReportIssue";
import MyComplaints from "./pages/MyComplaints";
import BBMPComplaints from "./pages/BBMPComplaints";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth/:role" element={<Auth />} />
            <Route path="/citizen-dashboard" element={<CitizenDashboard />} />
            <Route path="/bbmp-dashboard" element={<BBMPDashboard />} />
            <Route path="/report-issue" element={<ReportIssue />} />
            <Route path="/my-complaints" element={<MyComplaints />} />
            <Route path="/bbmp-complaints" element={<BBMPComplaints />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
