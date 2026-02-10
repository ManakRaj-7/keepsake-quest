import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CapsuleProvider } from "@/context/CapsuleContext";
import Navbar from "@/components/Navbar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import CreateCapsule from "./pages/CreateCapsule";
import CapsuleDetail from "./pages/CapsuleDetail";
import Prompts from "./pages/Prompts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CapsuleProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<CreateCapsule />} />
            <Route path="/capsule/:id" element={<CapsuleDetail />} />
            <Route path="/prompts" element={<Prompts />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CapsuleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
