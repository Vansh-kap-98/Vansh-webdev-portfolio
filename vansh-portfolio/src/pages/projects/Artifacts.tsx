import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, X, Maximize2 } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { useThemeStore } from '@/stores/themeStore';
import ArtifactsScene, { type Painting } from '@/components/canvas/projects/ArtifactsScene';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/* ─── Injected CSS ──────────────────────────────────────────────────────────── */
const FOCUS_STYLES = `
  @keyframes focusFadeIn {
    from { opacity: 0; transform: translateY(10px) scale(0.975); }
    to   { opacity: 1; transform: translateY(0)    scale(1);     }
  }
  @keyframes lightboxFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .focus-card  { animation: focusFadeIn  0.28s cubic-bezier(0.22,1,0.36,1) forwards; }
  .lightbox-bg { animation: lightboxFadeIn 0.22s ease forwards; }
  .focus-img-wrap { overflow: hidden; }
  .focus-img-wrap img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    transform: scale(1.04);
    transition: transform 9s ease;
  }
  .focus-img-wrap:hover img { transform: scale(1.14); }
  .focus-desc::-webkit-scrollbar { width: 3px; }
  .focus-desc::-webkit-scrollbar-track { background: transparent; }
  .focus-desc::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
  /* Hide global custom cursor on this page */
  .artifacts-page .custom-cursor { display: none !important; }
  .artifacts-page * { cursor: auto !important; }
  .artifacts-page canvas { cursor: crosshair !important; }
`;

const Artifacts = () => {
  const { setActiveAccent } = useThemeStore();

  // ── Scroll text fade ──────────────────────────────────────────────────────
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [heroY, setHeroY] = useState(0);
  const [scrollIndicatorOpacity, setScrollIndicatorOpacity] = useState(1);

  // ── Focus panel ───────────────────────────────────────────────────────────
  const [focusPainting, setFocusPainting] = useState<Painting | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const isPaintingHovered = useRef(false);
  const isCardHovered = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!isPaintingHovered.current && !isCardHovered.current) setPanelVisible(false);
    }, 160);
  }, []);

  const closePanel = useCallback(() => {
    isPaintingHovered.current = false;
    isCardHovered.current = false;
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setPanelVisible(false);
    setLightboxOpen(false);
  }, []);

  useEffect(() => {
    ScrollTrigger.getAll().forEach(t => t.kill());
    setActiveAccent('cyan');

    // Add class to body to suppress global custom cursor on this page
    document.documentElement.classList.add('artifacts-page');

    return () => {
      setActiveAccent(null);
      document.documentElement.classList.remove('artifacts-page');
    };
  }, [setActiveAccent]);

  const handleScroll = useCallback((e: Event) => {
    const { offset } = (e as CustomEvent<{ offset: number }>).detail;
    setScrollIndicatorOpacity(Math.max(0, 1 - offset / 0.08));
    const p = Math.min(1, offset / 0.06);
    setHeroOpacity(Math.max(0, 1 - p * p * p));
    setHeroY(-(p * 32));
  }, []);

  const handleHover = useCallback((e: Event) => {
    const { painting } = (e as CustomEvent<{ painting: Painting | null }>).detail;
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (painting) {
      isPaintingHovered.current = true;
      setFocusPainting(painting);
      setPanelVisible(true);
    } else {
      isPaintingHovered.current = false;
      scheduleHide();
    }
  }, [scheduleHide]);

  useEffect(() => {
    window.addEventListener('artifacts:scroll', handleScroll);
    window.addEventListener('artifacts:hover', handleHover);
    return () => {
      window.removeEventListener('artifacts:scroll', handleScroll);
      window.removeEventListener('artifacts:hover', handleHover);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [handleScroll, handleHover]);

  // Close lightbox on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closePanel]);

  return (
    <div className="min-h-screen bg-background">
      <style>{FOCUS_STYLES}</style>

      {/* Back */}
      <Link to="/" className="fixed top-8 left-8 z-50 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-mono text-sm">Back</span>
      </Link>

      {/* Header */}
      <div className="fixed top-8 right-8 z-50 text-right">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">Museum</span>
        <h1 className="font-heading text-2xl font-bold">Artifacts</h1>
      </div>

      {/* 3D Canvas */}
      <div className="fixed inset-0 z-0">
        <Canvas
          camera={{ position: [0, 1.6, 4], fov: 70 }}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
          dpr={[1, 1.5]}
        >
          <ArtifactsScene />
        </Canvas>
      </div>

      {/* Hero Text */}
      <div
        className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none"
        style={{ opacity: heroOpacity, transform: `translateY(${heroY}px)`, willChange: 'opacity, transform' }}
      >
        <div className="text-center">
          <span className="label-chip mb-4">Classical Gallery</span>
          <h2 className="hero-text text-4xl md:text-6xl mb-4">Enter the<br />Infinite</h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            History's greatest masterpieces — hover a painting to explore
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none"
        style={{ opacity: scrollIndicatorOpacity, willChange: 'opacity' }}
      >
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          Scroll to Explore Gallery
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-accent-cyan to-transparent" />
      </div>

      {/* ── Focus Mode Panel ──────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center"
        style={{
          opacity: panelVisible && focusPainting ? 1 : 0,
          pointerEvents: panelVisible && focusPainting ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
          background: panelVisible ? 'rgba(4,2,3,0.6)' : 'transparent',
          backdropFilter: panelVisible ? 'blur(4px)' : 'none',
          WebkitBackdropFilter: panelVisible ? 'blur(4px)' : 'none',
        }}
        onClick={closePanel}
      >
        {focusPainting && (
          <div
            key={focusPainting.name}
            className="focus-card"
            onMouseEnter={() => { isCardHovered.current = true; if (hideTimer.current) clearTimeout(hideTimer.current); }}
            onMouseLeave={() => { isCardHovered.current = false; scheduleHide(); }}
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              width: 'min(920px, 92vw)',
              maxHeight: '88vh',
              borderRadius: 16,
              overflow: 'hidden',
              background: 'rgba(7,3,5,0.97)',
              border: `1px solid ${focusPainting.accent}30`,
              boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 0 80px ${focusPainting.accent}15, 0 40px 100px rgba(0,0,0,0.9)`,
            }}
          >
            {/* ── Left: Image ── */}
            <div
              className="focus-img-wrap"
              style={{ flex: '0 0 52%', position: 'relative', background: '#050205', minHeight: 320 }}
            >
              <img src={focusPainting.imageUrl} alt={focusPainting.name} style={{ width: '100%', height: '100%' }} />

              {/* Inset mat border */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                boxShadow: `inset 0 0 0 10px rgba(7,3,5,0.97), inset 0 0 0 12px ${focusPainting.accent}20, inset 0 0 0 14px rgba(7,3,5,0.97), inset 0 0 50px rgba(0,0,0,0.55)`,
              }} />

              {/* View Full button */}
              <button
                onClick={() => setLightboxOpen(true)}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  background: 'rgba(7,3,5,0.85)',
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${focusPainting.accent}40`,
                  borderRadius: 8, padding: '6px 12px', gap: 6,
                  display: 'flex', alignItems: 'center',
                  color: '#ccc', fontSize: 10, fontFamily: 'monospace',
                  letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = focusPainting.accent; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${focusPainting.accent}40`; (e.currentTarget as HTMLElement).style.color = '#ccc'; }}
              >
                <Maximize2 size={11} />
                View Full
              </button>

              {/* Artist badge */}
              <div style={{
                position: 'absolute', bottom: 16, left: 16,
                background: 'rgba(7,3,5,0.88)', backdropFilter: 'blur(8px)',
                border: `1px solid ${focusPainting.accent}35`,
                borderRadius: 6, padding: '5px 11px',
              }}>
                <span style={{ fontSize: 9, color: focusPainting.accent, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  {focusPainting.artist}
                </span>
              </div>
            </div>

            {/* ── Right: Placard ── */}
            <div style={{ flex: 1, padding: '32px 28px', display: 'flex', flexDirection: 'column', overflowY: 'auto', position: 'relative' }}>

              {/* Close */}
              <button
                onClick={closePanel}
                style={{
                  position: 'absolute', top: 14, right: 14,
                  background: 'rgba(255,255,255,0.05)', border: 'none',
                  borderRadius: '50%', width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#666',
                }}
              >
                <X size={13} />
              </button>

              <p style={{ fontSize: 8, letterSpacing: '0.3em', color: focusPainting.accent, textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 14 }}>
                ✦ Museum Collection
              </p>

              <h2 style={{ fontSize: 'clamp(17px, 2vw, 24px)', fontWeight: 700, lineHeight: 1.25, fontFamily: '"Georgia", serif', color: '#f6f0e8', marginBottom: 5 }}>
                {focusPainting.name}
              </h2>
              <p style={{ fontSize: 11.5, color: '#6a5a48', fontFamily: '"Georgia", serif', fontStyle: 'italic', marginBottom: 18 }}>
                {focusPainting.artist}
              </p>

              <div style={{ height: 1, background: `linear-gradient(to right, ${focusPainting.accent}45, transparent)`, marginBottom: 18 }} />

              {/* Description */}
              <p
                className="focus-desc"
                style={{ fontSize: 12, color: '#9a8870', lineHeight: 1.8, fontFamily: '"Georgia", serif', marginBottom: 22, flexGrow: 1, overflowY: 'auto', paddingRight: 4, maxHeight: 130 }}
              >
                {focusPainting.description}
              </p>

              {/* ── Metadata grid ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 18 }}>

                {/* Date */}
                <div>
                  <p style={{ fontSize: 7.5, color: '#3d3028', letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 3 }}>Date Painted</p>
                  <p style={{ fontSize: 12.5, color: '#c8b99a', fontFamily: '"Georgia", serif' }}>{focusPainting.datePainted}</p>
                </div>

                {/* Value */}
                <div>
                  <p style={{ fontSize: 7.5, color: '#3d3028', letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 3 }}>Estimated Value</p>
                  <p style={{ fontSize: 14, color: focusPainting.accent, fontFamily: 'monospace', fontWeight: 700 }}>{focusPainting.cost}</p>
                </div>

                {/* Medium */}
                <div>
                  <p style={{ fontSize: 7.5, color: '#3d3028', letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 3 }}>Medium</p>
                  <p style={{ fontSize: 12, color: '#a08878', fontFamily: '"Georgia", serif', fontStyle: 'italic' }}>{focusPainting.medium}</p>
                </div>

                {/* Dimensions */}
                <div>
                  <p style={{ fontSize: 7.5, color: '#3d3028', letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 3 }}>Dimensions</p>
                  <p style={{ fontSize: 12, color: '#a08878', fontFamily: 'monospace' }}>{focusPainting.dimensions}</p>
                </div>

                {/* Location */}
                <div>
                  <p style={{ fontSize: 7.5, color: '#3d3028', letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 3 }}>Current Location</p>
                  <p style={{ fontSize: 11.5, color: '#a08878', fontFamily: '"Georgia", serif' }}>{focusPainting.location}</p>
                </div>

                {/* Copies */}
                <div>
                  <p style={{ fontSize: 7.5, color: '#3d3028', letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 3 }}>Copies / Prints</p>
                  <p style={{ fontSize: 12, fontFamily: 'monospace' }}>
                    {focusPainting.copiesAvailable === 0
                      ? <span style={{ color: focusPainting.accent }}>Original — Unique</span>
                      : <span style={{ color: '#c8b99a' }}>~{focusPainting.copiesAvailable} known prints</span>
                    }
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Lightbox: Full Painting View ─────────────────────────────────────── */}
      {lightboxOpen && focusPainting && (
        <div
          className="lightbox-bg fixed inset-0 z-[60] flex items-center justify-center"
          style={{ background: 'rgba(2,1,2,0.97)', backdropFilter: 'blur(12px)' }}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            style={{
              position: 'fixed', top: 24, right: 24, zIndex: 61,
              background: 'rgba(255,255,255,0.08)', border: `1px solid ${focusPainting.accent}40`,
              borderRadius: '50%', width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#aaa',
            }}
          >
            <X size={16} />
          </button>

          <div style={{ textAlign: 'center', padding: '20px' }} onClick={e => e.stopPropagation()}>
            {/* Ornate outer glow */}
            <div style={{
              display: 'inline-block',
              padding: 12,
              background: `linear-gradient(135deg, #6b4c10, #2a1d00, #7d5a1e, #2a1d00, #6b4c10)`,
              borderRadius: 4,
              boxShadow: `0 0 80px ${focusPainting.accent}20, 0 0 200px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.5)`,
            }}>
              <img
                src={focusPainting.imageUrl}
                alt={focusPainting.name}
                style={{
                  display: 'block',
                  maxWidth: 'min(85vw, 1100px)',
                  maxHeight: '78vh',
                  objectFit: 'contain',
                  borderRadius: 2,
                }}
              />
            </div>
            <div style={{ marginTop: 16 }}>
              <p style={{ fontFamily: '"Georgia", serif', fontSize: 14, color: '#c8b99a', marginBottom: 4 }}>
                {focusPainting.name}
              </p>
              <p style={{ fontFamily: 'monospace', fontSize: 9, color: '#4a3f35', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                {focusPainting.artist} · {focusPainting.datePainted} · {focusPainting.dimensions}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Artwork Counter */}
      <div className="fixed bottom-8 right-8 z-50 text-right">
        <span className="font-mono text-[10px] text-muted-foreground block">ARTWORKS</span>
        <span className="font-heading text-xl font-bold">06</span>
      </div>
    </div>
  );
};

export default Artifacts;
