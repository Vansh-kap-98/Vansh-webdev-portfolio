import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { useThemeStore } from '@/stores/themeStore';
import { useScrollFade } from '@/hooks/useScrollFade';
import EstateScene from '@/components/canvas/projects/EstateScene';

import { ScrollTrigger } from 'gsap/ScrollTrigger';

const SECTIONS = [
  {
    eyebrow: 'Approach',
    title: 'Aerial View',
    copy: 'The tour opens above the property. Scroll position maps to a point on a Catmull-Rom spline, so the descent reads as one continuous take rather than a cut between fixed viewpoints.',
  },
  {
    eyebrow: 'Threshold',
    title: 'Front Door',
    copy: 'A second spline drives the look-at target independently of the camera position. That separation is what lets the camera keep facing the facade while it drops, then pivot through the doorway.',
  },
  {
    eyebrow: 'Interior',
    title: 'Living Room',
    copy: 'Inside, the camera turns toward the glazed wall. Warm interior point lights and emissive window panels carry the night-time read; a single tight-frustum directional light handles shadows.',
  },
] as const;

const TheEstate = () => {
  const scrollIndicatorRef = useScrollFade<HTMLDivElement>(200);
  const { setActiveAccent } = useThemeStore();

  useEffect(() => {
    // Kill all ScrollTriggers
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    // Set theme
    setActiveAccent('teal');

    // Force scroll to top
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Additional reset in next frame
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => {
      setActiveAccent(null);
    };
  }, [setActiveAccent]);


  return (
    <div className="min-h-screen bg-background">

      {/* Back Button */}
      <Link
        to="/"
        className="fixed top-8 left-8 z-50 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-mono text-sm">Back</span>
      </Link>

      {/* Project Header */}
      <div className="fixed top-8 right-8 z-50 text-right">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">
          Real Estate
        </span>
        <h1 className="font-heading text-2xl font-bold">The Estate</h1>
      </div>

      {/* 3D Canvas - Fixed background */}
      <div className="fixed inset-0 z-0">
        <Canvas
          shadows
          camera={{ position: [0, 15, 22], fov: 55 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          dpr={[1, 1.5]}
        >
          <EstateScene />
        </Canvas>
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 transition-opacity duration-300"
      >
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          Scroll to Explore
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-accent-teal to-transparent" />
      </div>

      {/* Content Overlay — also sets the scroll height the camera rig reads */}
      <div className="relative z-10">
        {SECTIONS.map((section, index) => (
          <div
            key={section.title}
            className={`h-screen w-full flex items-center pointer-events-none px-8 md:px-16 ${
              index % 2 === 0 ? 'justify-start' : 'justify-end'
            }`}
          >
            <div className={`max-w-md ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
              {index === 0 && (
                <span className="label-chip mb-5 pointer-events-auto">
                  Dual Spline Rig + CatmullRomCurve3
                </span>
              )}
              <div className="font-mono text-[10px] text-accent-teal tracking-[0.3em] uppercase mb-3">
                {String(index + 1).padStart(2, '0')} / {section.eyebrow}
              </div>
              <h2 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mb-4">
                {section.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">{section.copy}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default TheEstate;
