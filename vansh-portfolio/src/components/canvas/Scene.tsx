import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import ParticleField from './ParticleField';
import { useThemeStore, accentColors } from '@/stores/themeStore';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';

const AmbientLight = () => {
  const { activeAccent } = useThemeStore();

  const color = activeAccent
    ? `hsl(${accentColors[activeAccent].hsl})`
    : '#111111';

  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.3} color={color} />
      <pointLight position={[-10, -10, -10]} intensity={0.2} color={color} />
    </>
  );
};

/**
 * Stand-in for the particle field on phones and when the OS asks for reduced
 * motion. A full-screen WebGL canvas repainting at 60fps underneath the whole
 * document is the single most expensive thing on the page, and on a phone it
 * buys a background texture you can barely see. This is three static gradients
 * — one paint, no GL context, no per-frame work — and it reads as the same
 * dark, faintly-lit space.
 */
const StaticBackdrop = () => (
  <div
    aria-hidden
    className="fixed inset-0 z-0 pointer-events-none"
    style={{
      background: `
        radial-gradient(ellipse 80% 55% at 50% 0%, rgba(45,212,191,0.07), transparent 60%),
        radial-gradient(ellipse 70% 50% at 85% 75%, rgba(168,85,247,0.06), transparent 65%),
        radial-gradient(ellipse 90% 60% at 10% 100%, rgba(34,211,238,0.05), transparent 60%)
      `,
    }}
  />
);

const Scene = () => {
  const { lite, maxDpr } = useDeviceProfile();

  if (lite) return <StaticBackdrop />;

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, Math.min(1.35, maxDpr)]}
      >
        <Suspense fallback={null}>
          <AmbientLight />
          <ParticleField />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;
