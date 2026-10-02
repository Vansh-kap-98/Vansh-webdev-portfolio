import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import CustomCursor from "./components/CustomCursor";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// The landing page is eager; everything else is split out of the initial bundle.
// Each project page pulls in its own scene (and in several cases a chunk of drei),
// so bundling them together made the homepage pay for six 3D demos it never renders.
const CMS = lazy(() => import("./pages/CMS"));
const About = lazy(() => import("./pages/About"));
const Process = lazy(() => import("./pages/Process"));
const Contact = lazy(() => import("./pages/Contact"));
const TheEstate = lazy(() => import("./pages/projects/TheEstate"));
const GastroLab = lazy(() => import("./pages/projects/GastroLab"));
const VoidStreetwear = lazy(() => import("./pages/projects/VoidStreetwear"));
const NeuroCore = lazy(() => import("./pages/projects/NeuroCore"));
const VelocityEV = lazy(() => import("./pages/projects/VelocityEV"));
const Artifacts = lazy(() => import("./pages/projects/Artifacts"));

const queryClient = new QueryClient();

/** Shown while a route chunk is in flight. Deliberately quiet — these are dark pages. */
const RouteFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="h-px w-16 bg-foreground/20 overflow-hidden">
        <div className="h-full w-1/3 bg-foreground/70 animate-[loading_1.2s_ease-in-out_infinite]" />
      </div>
      <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
        Loading
      </span>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <CustomCursor />
        <Suspense fallback={<RouteFallback />}>
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
