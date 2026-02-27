import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import CustomCursor from "./components/CustomCursor";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CMS from "./pages/CMS";
import About from "./pages/About";
import Process from "./pages/Process";
import Contact from "./pages/Contact";
import TheEstate from "./pages/projects/TheEstate";
import GastroLab from "./pages/projects/GastroLab";
import VoidStreetwear from "./pages/projects/VoidStreetwear";
import NeuroCore from "./pages/projects/NeuroCore";
import VelocityEV from "./pages/projects/VelocityEV";
import Artifacts from "./pages/projects/Artifacts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <CustomCursor />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cms" element={<CMS />} />
          <Route path="/about" element={<About />} />
          <Route path="/process" element={<Process />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/projects/the-estate" element={<TheEstate />} />
          <Route path="/projects/gastro-lab" element={<GastroLab />} />
          <Route path="/projects/void-streetwear" element={<VoidStreetwear />} />
          <Route path="/projects/neurocore" element={<NeuroCore />} />
          <Route path="/projects/velocity-ev" element={<VelocityEV />} />
          <Route path="/projects/artifacts" element={<Artifacts />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
