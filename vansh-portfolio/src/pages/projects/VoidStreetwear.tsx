import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { useThemeStore } from '@/stores/themeStore';
import { useScrollFade } from '@/hooks/useScrollFade';
import VoidStreetwearScene from '@/components/canvas/projects/VoidStreetwearScene';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';

import { ScrollTrigger } from 'gsap/ScrollTrigger';

const VoidStreetwear = () => {
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

    setActiveAccent('neon');

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
          Fashion
        </span>
        <h1 className="font-heading text-2xl font-bold">Void Streetwear</h1>
      </div>

      {/* 3D Canvas */}
      <div className="fixed inset-0 z-0">
        <Canvas
          shadows={!lite}
          camera={{ position: [0.9, 2.75, 10.4], fov: 44 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          dpr={[1, maxDpr]}
        >
          <VoidStreetwearScene />
        </Canvas>
      </div>

      {/* Interaction Hint */}
      <div
        ref={scrollIndicatorRef}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 transition-opacity duration-300"
      >
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          Move to Push · Drag to Grab
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-accent-neon to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 pointer-events-none h-screen flex items-center">
        <div className="px-6 md:px-12 scene-copy md:max-w-lg">
          <span className="label-chip mb-4">Verlet Cloth Solver</span>
          <h2 className="hero-text text-4xl md:text-5xl mb-6">
            Feel the<br />Movement
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A mass-spring cloth solved on the CPU — structural, shear and bend constraints
            relaxed with Verlet integration every frame, with normals recomputed so the
            lighting catches each fold. Move the cursor to push the fabric; press and drag
            to grab a point and pull it.
          </p>
        </div>
      </div>

      {/* Product Info */}
      <div className="fixed bottom-8 right-8 z-50 text-right">
        <span className="font-mono text-[10px] text-muted-foreground block">VOID HOODIE V1</span>
        <span className="font-heading text-xl font-bold">$189.00</span>
      </div>
    </div>
  );
};

export default VoidStreetwear;
