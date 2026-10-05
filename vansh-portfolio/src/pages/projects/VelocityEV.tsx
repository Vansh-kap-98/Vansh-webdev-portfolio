import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import ProjectTopBar from '@/components/ProjectTopBar';
import { useThemeStore } from '@/stores/themeStore';
import VelocityEVScene from '@/components/canvas/projects/VelocityEVScene';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const colorOptions = [
  { name: 'Onyx Black', hex: '#0a0a0a', metalness: 0.9, roughness: 0.1 },
  { name: 'Chrono Silver', hex: '#a8a8a8', metalness: 1.0, roughness: 0.05 },
  { name: 'Velocity Blue', hex: '#0047ab', metalness: 0.8, roughness: 0.2 },
  { name: 'Pulse Red', hex: '#e31837', metalness: 0.85, roughness: 0.15 },
  { name: 'Arctic White', hex: '#f8f8f8', metalness: 0.5, roughness: 0.05 },
];

const modelOptions = [
  { id: 'coupe', name: 'Velocity GT', range: '420 mi', speed: '0-60 in 2.1s' },
  { id: 'suv', name: 'Velocity X', range: '380 mi', speed: '0-60 in 3.4s' },
  { id: 'roadster', name: 'Velocity R', range: '620 mi', speed: '0-60 in 1.9s' },
];

const VelocityEV = () => {
  const { lite, maxDpr } = useDeviceProfile();
  const { setActiveAccent } = useThemeStore();
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [selectedModel, setSelectedModel] = useState(modelOptions[0]);
  const [cameraMode, setCameraMode] = useState<'exterior' | 'interior'>('exterior');
  const [isReserved, setIsReserved] = useState(false);

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

    // UI entrance. The staggered version takes ~2.5s to finish, which is a long
    // time to stare at a car you cannot configure on a phone — and under
    // reduced-motion it shouldn't play at all. Both cases get the controls
    // immediately instead.
    if (lite) {
      gsap.set('.config-ui', { opacity: 1, y: 0 });
    } else {
      gsap.fromTo(
        '.config-ui',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out', delay: 0.5 }
      );
    }

    return () => {
      setActiveAccent(null);
    };
  }, [setActiveAccent, lite]);

  return (
    <div className="min-h-screen bg-background">
      <ProjectTopBar category="Automotive" title="Velocity EV" />

      {/* 3D Canvas */}
      <div className="fixed inset-0 z-0 bg-[#050505]">
        <Canvas
          camera={{ position: [8, 4, 8], fov: 45 }}
          shadows={!lite}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          // Uncapped, this rendered at full device pixel ratio — on a 2× display
          // that is 4× the fragments, with shadows and a reflector on top.
          dpr={[1, maxDpr]}
        >
          <VelocityEVScene
            color={selectedColor.hex}
            cameraMode={cameraMode}
            modelType={selectedModel.id}
          />
        </Canvas>
      </div>

      {/* Model Selection (Top Center) */}
      <div className="fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-50 flex gap-1 md:gap-4 bg-[#0a0a0a]/85 p-1 rounded-full border border-border/50 config-ui opacity-0">
        {modelOptions.map((model) => (
          <button
            key={model.id}
            onClick={() => setSelectedModel(model)}
            className={`px-3 md:px-6 py-2 rounded-full font-mono text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${selectedModel.id === model.id
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {model.name}
          </button>
        ))}
      </div>

      {/* Color Picker (Top Left - Parallelogram Style) */}
      <div className="fixed z-50 config-ui opacity-0 flex flex-col gap-3 md:gap-8 left-0 right-0 bottom-32 px-5 items-center md:items-start md:left-12 md:right-auto md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:px-0">
        <div className="hidden md:flex flex-col gap-1">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">
            Automotive Engineering
          </span>
          <h3 className="font-heading text-xl font-bold uppercase tracking-tight">Exterior Design</h3>
          <div className="w-16 h-0.5 bg-accent-gold mt-1" />
        </div>

        <div className="flex items-center gap-3">
          {colorOptions.map((color) => (
            <div key={color.name} className="relative group">
              <button
                onClick={() => setSelectedColor(color)}
                className={`w-10 h-9 md:w-14 md:h-12 skew-x-[-15deg] border-2 transition-all duration-500 overflow-hidden ${selectedColor.name === color.name
                  ? 'border-white scale-110 shadow-[0_5px_15px_rgba(255,255,255,0.2)]'
                  : 'border-white/10 hover:border-white/40'
                  }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {/* Subtle highlight sheen */}
                <div className={`absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent transition-opacity duration-500 ${selectedColor.name === color.name ? 'opacity-100' : 'opacity-20 group-hover:opacity-100'}`} />
              </button>

              {/* Dynamic name label that pops up */}
              <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-mono uppercase tracking-[0.2em] transition-all duration-300 pointer-events-none ${selectedColor.name === color.name ? 'opacity-100 translate-y-0 text-accent-gold' : 'opacity-0 translate-y-2'}`}>
                {color.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Toggle (Right) */}
      <div className="fixed z-50 config-ui opacity-0 flex gap-2 md:flex-col md:gap-4 left-0 right-0 bottom-20 justify-center px-5 md:left-auto md:right-8 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:justify-start md:px-0">
        <span className="hidden md:block font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-6 border-b border-border pb-4 text-right">
          Perspective
        </span>
        <button
          onClick={() => setCameraMode('exterior')}
          className={`px-4 py-2 border rounded-sm font-mono text-[10px] uppercase tracking-widest transition-all ${cameraMode === 'exterior' ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:bg-card'
            }`}
        >
          Exterior
        </button>
        <button
          onClick={() => setCameraMode('interior')}
          className={`px-4 py-2 border rounded-sm font-mono text-[10px] uppercase tracking-widest transition-all ${cameraMode === 'interior' ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:bg-card'
            }`}
        >
          Interior
        </button>

        <div className="hidden md:flex mt-8 pt-8 border-t border-border flex-col gap-2 text-right">
          <div className="text-[10px] font-mono uppercase text-muted-foreground">Range</div>
          <div className="text-sm font-bold">{selectedModel.range}</div>
          <div className="text-[10px] font-mono uppercase text-muted-foreground mt-2">Performance</div>
          <div className="text-sm font-bold">{selectedModel.speed}</div>
        </div>
      </div>

      {/* Checkout Section (Bottom Right) */}
      <div className="fixed z-50 config-ui opacity-0 flex flex-col gap-4 pointer-events-auto left-0 right-0 bottom-5 items-center px-5 md:left-auto md:right-24 md:bottom-12 md:items-end md:px-0">
        <div className="hidden md:block text-right mb-2">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Estimated Delivery</div>
          <div className="text-xs">Late 2026</div>
        </div>
        <button
          onClick={() => setIsReserved(true)}
          className="group relative overflow-hidden bg-accent-gold px-12 py-4 rounded-full font-heading font-bold text-black tracking-widest uppercase transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(212,175,55,0.3)]"
        >
          <span className="relative z-10">Reserve Now</span>
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
        </button>
      </div>

      {/* Reservation Success Overlay */}
      {isReserved && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in pointer-events-auto">
          <div className="max-w-md w-full bg-card border border-border p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-accent-gold" />
            <div className="w-20 h-20 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-accent-gold/20">
              <span className="text-4xl">✨</span>
            </div>
            <h2 className="text-3xl font-heading font-bold mb-4">Reservation Confirmed</h2>
            <p className="text-muted-foreground mb-8">
              Your custom <span className="text-foreground font-bold">{selectedModel.name}</span> in <span className="text-foreground font-bold">{selectedColor.name}</span> has been locked in.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsReserved(false)}
                className="w-full py-4 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-foreground/90 transition-colors"
              >
                Go Back to Configurator
              </button>
              <Link
                to="/contact"
                className="w-full py-4 border border-border font-mono text-xs uppercase tracking-widest hover:bg-card transition-colors"
              >
                Contact Advisor
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Left Branding Pills */}
      <div className="hidden md:flex fixed bottom-12 left-12 z-50 pointer-events-none config-ui opacity-0 flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="label-chip bg-accent-gold/20 text-accent-gold border-accent-gold/30 text-[10px] px-3 py-1">V2.1 PRO</span>
          <span className="font-mono text-[9px] text-white/40 tracking-[0.3em] uppercase">Advanced Virtual Studio</span>
        </div>
        <h2 className="hero-text text-5xl md:text-7xl leading-none">
          Velocity <span className="text-accent-gold">{selectedModel.id === 'roadster' ? 'R' : selectedModel.id === 'suv' ? 'X' : 'GT'}</span>
        </h2>
      </div>
    </div>
  );
};

export default VelocityEV;
