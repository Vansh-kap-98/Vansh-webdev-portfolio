import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { useThemeStore } from '@/stores/themeStore';
import NeuroCoreScene from '@/components/canvas/projects/NeuroCoreScene';
import CustomCursor from '@/components/CustomCursor';

const NeuroCore = () => {
  const { setActiveAccent, setCursorStyle } = useThemeStore();

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    setActiveAccent('purple');
    setCursorStyle('neuro');
    return () => {
      setActiveAccent(null);
      setCursorStyle('default');
    };
  }, [setActiveAccent, setCursorStyle]);

  return (
    <div className="min-h-screen bg-background neurocore-section cursor-none">
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
          SaaS
        </span>
        <h1 className="font-heading text-2xl font-bold">NeuroCore</h1>
      </div>

      {/* 3D Canvas */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#a855f7" />
          <NeuroCoreScene />
        </Canvas>
      </div>

      {/* Scroll Indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          Scroll to Morph
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-accent-purple to-transparent" />
      </div>

      {/* Feature Sections */}
      <div className="relative z-10 pointer-events-none">
        <div className="h-screen flex items-center justify-start px-12">
          <div className="max-w-md">
            <span className="label-chip mb-4">InstancedMesh + Particle Morphing</span>
            <h2 className="hero-text text-4xl md:text-5xl mb-4">Data Cloud</h2>
            <p className="text-muted-foreground">
              Visualize millions of data points in real-time
            </p>
          </div>
        </div>
        <div className="h-screen flex items-center justify-end px-12">
          <div className="max-w-md text-right">
            <h2 className="hero-text text-4xl md:text-5xl mb-4">Security</h2>
            <p className="text-muted-foreground">
              Enterprise-grade protection for your data
            </p>
          </div>
        </div>
        <div className="h-screen flex items-center justify-start px-12">
          <div className="max-w-md">
            <h2 className="hero-text text-4xl md:text-5xl mb-4">Speed</h2>
            <p className="text-muted-foreground">
              Lightning-fast processing at any scale
            </p>
          </div>
        </div>
        <div className="h-screen flex items-center justify-end px-12">
          <div className="max-w-md text-right">
            <h2 className="hero-text text-4xl md:text-5xl mb-4">Global</h2>
            <p className="text-muted-foreground">
              Deploy across all regions instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuroCore;
