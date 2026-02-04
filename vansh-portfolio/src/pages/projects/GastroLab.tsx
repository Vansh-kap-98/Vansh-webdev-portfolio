import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { useThemeStore } from '@/stores/themeStore';
import GastroLabScene from '@/components/canvas/projects/GastroLabScene';
import CustomCursor from '@/components/CustomCursor';

const GastroLab = () => {
  const { setActiveAccent, setCursorStyle } = useThemeStore();

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    setActiveAccent('orange');
    setCursorStyle('gastro');
    return () => {
      setActiveAccent(null);
      setCursorStyle('default');
    };
  }, [setActiveAccent, setCursorStyle]);

  return (
    <div className="min-h-screen bg-background gastro-section cursor-none">
      <CustomCursor />
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
          Restaurant
        </span>
        <h1 className="font-heading text-2xl font-bold">Gastro Lab</h1>
      </div>

      {/* 3D Canvas */}
      <div className="fixed inset-0 z-0 flex items-center justify-center">
        <div className="w-full h-full max-w-3xl">
          <Canvas camera={{ position: [0, 5, 8], fov: 45 }}>
            <GastroLabScene />
          </Canvas>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          Scroll to Explode
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-accent-orange to-transparent" />
      </div>

      {/* Content Sections */}
      <div className="relative z-10 pointer-events-none">
        <div className="h-screen flex items-end justify-center pb-32">
          <div className="text-center">
            <span className="label-chip mb-4">GSAP Timeline + Scroll Linked</span>
            <h2 className="hero-text text-4xl md:text-6xl">The Dish</h2>
          </div>
        </div>
        <div className="h-screen flex items-center justify-start px-12">
          <div>
            <h3 className="font-heading text-2xl font-bold mb-2">Artisan Bun</h3>
            <p className="text-muted-foreground max-w-xs">
              House-baked brioche with sesame seeds
            </p>
          </div>
        </div>
        <div className="h-screen flex items-center justify-end px-12">
          <div className="text-right">
            <h3 className="font-heading text-2xl font-bold mb-2">Wagyu Patty</h3>
            <p className="text-muted-foreground max-w-xs">
              Premium A5 wagyu beef, flame-grilled
            </p>
          </div>
        </div>
        <div className="h-screen flex items-center justify-start px-12">
          <div>
            <h3 className="font-heading text-2xl font-bold mb-2">Garden Fresh</h3>
            <p className="text-muted-foreground max-w-xs">
              Organic lettuce, tomato, and pickled onions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GastroLab;
