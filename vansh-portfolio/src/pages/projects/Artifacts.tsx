import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { useThemeStore } from '@/stores/themeStore';
import ArtifactsScene from '@/components/canvas/projects/ArtifactsScene';
import CustomCursor from '@/components/CustomCursor';

const Artifacts = () => {
  const { setActiveAccent, setCursorStyle } = useThemeStore();

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    setActiveAccent('cyan');
    setCursorStyle('artifacts');
    return () => {
      setActiveAccent(null);
      setCursorStyle('default');
    };
  }, [setActiveAccent, setCursorStyle]);

  return (
    <div className="min-h-screen bg-background cursor-none">
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
          Museum
        </span>
        <h1 className="font-heading text-2xl font-bold">Artifacts</h1>
      </div>

      {/* 3D Canvas */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 2, 0], fov: 75 }}>
          <ArtifactsScene />
        </Canvas>
      </div>

      {/* Scroll Indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          Scroll to Explore Gallery
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-accent-cyan to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 pointer-events-none">
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <span className="label-chip mb-4">FogExp2 + Infinite Loop</span>
            <h2 className="hero-text text-4xl md:text-6xl mb-4">
              Enter the<br />Infinite
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              A never-ending journey through digital art
            </p>
          </div>
        </div>
        <div className="h-[200vh]" /> {/* Scroll space */}
      </div>

      {/* Artwork Counter */}
      <div className="fixed bottom-8 right-8 z-50 text-right">
        <span className="font-mono text-[10px] text-muted-foreground block">ARTWORK</span>
        <span className="font-heading text-xl font-bold">∞</span>
      </div>
    </div>
  );
};

export default Artifacts;
