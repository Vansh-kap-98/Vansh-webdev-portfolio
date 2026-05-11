import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import ParticleField from './ParticleField';
import { useThemeStore, accentColors } from '@/stores/themeStore';

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

const Scene = () => {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.35]}
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
