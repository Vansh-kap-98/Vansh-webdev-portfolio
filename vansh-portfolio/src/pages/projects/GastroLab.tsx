import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import ProjectTopBar from '@/components/ProjectTopBar';
import { useThemeStore } from '@/stores/themeStore';
import { useScrollFade } from '@/hooks/useScrollFade';
import GastroLabScene from '@/components/canvas/projects/GastroLabScene';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';

import { ScrollTrigger } from 'gsap/ScrollTrigger';

const LAYER_NOTES = [
  {
    title: 'Artisan Bun',
    copy: 'House-baked brioche crown, sesame scattered across the dome. The crumb and bake spots are drawn into a canvas texture at runtime rather than loaded as an image.',
  },
  {
    title: 'Sharp Cheddar',
    copy: 'A plane subdivided 18 × 18, with vertices past the patty radius pulled down on a curve — so the slice droops over the edge instead of sitting on it like a tile.',
  },
  {
    title: 'Wagyu Patty',
    copy: 'A5 wagyu, flame-grilled. Grind speckle and grill bars are painted into the same procedural texture pass; a darker ring geometry gives the edge its char.',
  },
  {
    title: 'Garden Layer',
    copy: 'Lettuce is a cylinder shell whose vertices are displaced by two stacked sine waves, which is what gives the leaf its ruffled edge and rippled surface.',
  },
] as const;

const GastroLab = () => {
  const { lite, maxDpr } = useDeviceProfile();
  const scrollIndicatorRef = useScrollFade<HTMLDivElement>(200);
  const { setActiveAccent } = useThemeStore();

  useEffect(() => {
    // Kill all ScrollTriggers and scroll to top
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    setActiveAccent('orange');

    return () => {
      setActiveAccent(null);
    };
  }, [setActiveAccent]);


  return (
    <div className="min-h-screen bg-background gastro-section">
      <ProjectTopBar category="Restaurant" title="Gastro Lab" />

      {/* 3D Canvas */}
      <div className="fixed inset-0 z-0">
        <Canvas
          shadows={!lite}
          camera={{ position: [0, 2.4, 8.4], fov: 42 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          dpr={[1, maxDpr]}
        >
          <GastroLabScene />
        </Canvas>
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="safe-bottom fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 transition-opacity duration-300"
      >
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          Scroll to Explode
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-accent-orange to-transparent" />
      </div>

      {/* Content Sections — these also set the scroll height the explode reads */}
      <div className="relative z-10 pointer-events-none">
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <span className="label-chip mb-4">Scroll-Linked Exploded View</span>
            <h2 className="hero-text text-4xl md:text-6xl font-heading font-bold">The Dish</h2>
            <p className="mt-4 text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
              Scroll to pull the build apart, layer by layer.
            </p>
          </div>
        </div>

        {LAYER_NOTES.map((note, index) => (
          <div
            key={note.title}
            className={`scene-section h-screen flex items-center px-8 md:px-16 ${
              index % 2 === 0 ? 'justify-start' : 'justify-end'
            }`}
          >
            <div className={`scene-copy md:max-w-xs ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
              <div className="font-mono text-[10px] text-accent-orange tracking-[0.3em] uppercase mb-2">
                {String(index + 1).padStart(2, '0')} / Layer
              </div>
              <h3 className="font-heading text-2xl md:text-3xl font-bold mb-2">{note.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{note.copy}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default GastroLab;
