import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { useThemeStore } from '@/stores/themeStore';
import VelocityEVScene from '@/components/canvas/projects/VelocityEVScene';

import { ScrollTrigger } from 'gsap/ScrollTrigger';

const colorOptions = [
  { name: 'Midnight Black', hex: '#1a1a1a' },
  { name: 'Arctic White', hex: '#f5f5f5' },
  { name: 'Ocean Blue', hex: '#1e40af' },
  { name: 'Sunset Red', hex: '#dc2626' },
];

const VelocityEV = () => {
  const { setActiveAccent } = useThemeStore();
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [scrollIndicatorOpacity, setScrollIndicatorOpacity] = useState(1);

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

    setActiveAccent('gold');

    return () => {
      setActiveAccent(null);
    };
  }, [setActiveAccent]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const opacity = Math.max(0, 1 - scrolled / 200);
      setScrollIndicatorOpacity(opacity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          Automotive
        </span>
        <h1 className="font-heading text-2xl font-bold">Velocity EV</h1>
      </div>

      {/* 3D Canvas */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [8, 4, 8], fov: 50 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <spotLight position={[0, 10, 0]} intensity={0.5} />
          <VelocityEVScene />
        </Canvas>
      </div>

      {/* Color Picker */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
          Exterior
        </span>
        {colorOptions.map((color) => (
          <button
            key={color.name}
            onClick={() => setSelectedColor(color)}
            className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor.name === color.name
              ? 'border-foreground scale-110'
              : 'border-transparent hover:border-muted-foreground'
              }`}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          />
        ))}
      </div>

      {/* View Toggle */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        <button className="px-4 py-2 border border-border rounded-sm font-mono text-xs hover:bg-card transition-colors">
          Exterior
        </button>
        <button className="px-4 py-2 border border-border rounded-sm font-mono text-xs hover:bg-card transition-colors">
          Interior
        </button>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 pointer-events-none h-screen flex items-end pb-24">
        <div className="pl-24 pr-12 flex items-end justify-between w-full">
          <div>
            <span className="label-chip mb-4">Material Props + Camera Rig</span>
            <h2 className="hero-text text-4xl md:text-5xl mb-2">
              Configure Your<br />Future
            </h2>
            <p className="text-muted-foreground max-w-md">
              Real-time customization with seamless camera transitions
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono text-[10px] text-muted-foreground block">
              SELECTED COLOR
            </span>
            <span className="font-heading text-xl font-bold">{selectedColor.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VelocityEV;
