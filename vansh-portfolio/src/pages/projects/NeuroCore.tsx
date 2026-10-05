import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import ProjectTopBar from '@/components/ProjectTopBar';
import { useThemeStore } from '@/stores/themeStore';
import { useScrollFade } from '@/hooks/useScrollFade';
import NeuroCoreScene from '@/components/canvas/projects/NeuroCoreScene';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';

import { ScrollTrigger } from 'gsap/ScrollTrigger';

const FEATURES = [
  {
    eyebrow: 'Formation',
    title: 'Data Cloud',
    copy: '2,600 instances on a single draw call, distributed over a Fibonacci sphere. Each one carries its own approach speed, so the swarm arrives over a spread of frames instead of snapping into place together.',
  },
  {
    eyebrow: 'Morph',
    title: 'Security',
    copy: "Targets aren't hand-written trig. The shield is rasterised from an SVG path to an offscreen canvas, and particles are assigned to its filled pixels — which is why the silhouette actually reads.",
  },
  {
    eyebrow: 'Transition',
    title: 'Speed',
    copy: 'Scroll position maps onto a continuous blend across the four targets rather than switching at thresholds, so one formation flows into the next. Particles still in transit scale up, making the motion legible.',
  },
  {
    eyebrow: 'Formation',
    title: 'Global',
    copy: 'The final target distributes particles along latitude and longitude rings, so the same instance buffer resolves into a wire globe without changing a single material.',
  },
] as const;

const NeuroCore = () => {
  const { lite, maxDpr } = useDeviceProfile();
  const scrollIndicatorRef = useScrollFade<HTMLDivElement>(200);
  const { setActiveAccent } = useThemeStore();

  useEffect(() => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    setActiveAccent('purple');

    return () => {
      setActiveAccent(null);
    };
  }, [setActiveAccent]);


  return (
    <div className="min-h-screen bg-background neurocore-section">
      <ProjectTopBar category="SaaS" title="NeuroCore" />

      {/* 3D Canvas */}
      <div className="fixed inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 11.5], fov: 55 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          dpr={[1, maxDpr]}
        >
          <NeuroCoreScene />
        </Canvas>
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="safe-bottom fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 transition-opacity duration-300"
      >
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          Scroll to Morph
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-accent-purple to-transparent" />
      </div>

      {/* Feature Sections — scroll position drives the morph */}
      <div className="relative z-10 pointer-events-none">
        {FEATURES.map((feature, index) => (
          <div
            key={feature.title}
            className={`scene-section h-screen flex items-center px-8 md:px-16 ${
              index % 2 === 0 ? 'justify-start' : 'justify-end'
            }`}
          >
            <div className={`scene-copy ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
              {index === 0 && (
                <span className="label-chip mb-5 pointer-events-auto">
                  InstancedMesh + Particle Morphing
                </span>
              )}
              <div className="font-mono text-[10px] text-accent-purple tracking-[0.3em] uppercase mb-3">
                {String(index + 1).padStart(2, '0')} / {feature.eyebrow}
              </div>
              <h2 className="hero-text font-heading font-bold text-3xl sm:text-4xl md:text-5xl mb-3 md:mb-4">
                {feature.title}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{feature.copy}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default NeuroCore;
