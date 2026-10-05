import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleField = () => {
  const meshRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  const count = 1200;

  const [positions, velocities, fadeSpeeds, fadePhases] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    // Static per-particle fade parameters — the wave itself is evaluated in the
    // vertex shader, so neither of these is ever re-uploaded.
    const fadeSpeeds = new Float32Array(count);
    const fadePhases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spread particles more evenly with higher variance
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * 25; // Square root for uniform distribution
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;

      velocities[i * 3] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 2] = 0;

      fadeSpeeds[i] = 0.08 + Math.random() * 0.22;
      fadePhases[i] = Math.random();
    }

    return [positions, velocities, fadeSpeeds, fadePhases];
  }, [count]);

  useFrame(({ mouse, clock }) => {
    if (!meshRef.current) return;

    shaderMaterial.uniforms.uTime.value = clock.getElapsedTime();

    const geometry = meshRef.current.geometry;
    const positionAttr = geometry.attributes.position;
    const pos = positionAttr.array as Float32Array;

    mouseRef.current.x = mouse.x * viewport.width * 0.5;
    mouseRef.current.y = mouse.y * viewport.height * 0.5;

    // Compare squared distances; the only use was a radius test.
    const RADIUS = 3;
    const RADIUS_SQ = RADIUS * RADIUS;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // Apply velocity
      pos[ix] += velocities[ix];
      pos[iy] += velocities[iy];

      // Mouse influence
      const dx = mouseRef.current.x - pos[ix];
      const dy = mouseRef.current.y - pos[iy];
      const distSq = dx * dx + dy * dy;

      if (distSq < RADIUS_SQ) {
        const force = (RADIUS - Math.sqrt(distSq)) * 0.002;
        pos[ix] += dx * force;
        pos[iy] += dy * force;
      }

      // Wrap around with larger boundaries
      if (pos[ix] > 25) pos[ix] = -25;
      if (pos[ix] < -25) pos[ix] = 25;
      if (pos[iy] > 25) pos[iy] = -25;
      if (pos[iy] < -25) pos[iy] = 25;

    }

    positionAttr.needsUpdate = true;
  });

  // Custom shader material for per-particle opacity
  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(0xffffff) },
          pointSize: { value: 0.05 },
          uTime: { value: 0 },
        },
        vertexShader: `
          attribute float aFadeSpeed;
          attribute float aFadePhase;
          varying float vAlpha;
          uniform float pointSize;
          uniform float uTime;

          void main() {
            // Triangle wave between 0.1 and 1.0 — the same ping-pong fade the
            // CPU used to compute and upload for every particle, every frame.
            float t = fract(uTime * aFadeSpeed + aFadePhase);
            vAlpha = 0.1 + 0.9 * abs(t * 2.0 - 1.0);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = pointSize * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          varying float vAlpha;
          
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            
            float opacity = (1.0 - dist * 2.0) * vAlpha * 0.85;
            gl_FragColor = vec4(color, opacity);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  return (
    <points ref={meshRef} material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          usage={THREE.DynamicDrawUsage}
        />
        <bufferAttribute attach="attributes-aFadeSpeed" count={count} array={fadeSpeeds} itemSize={1} />
        <bufferAttribute attach="attributes-aFadePhase" count={count} array={fadePhases} itemSize={1} />
      </bufferGeometry>
    </points>
  );
};

export default ParticleField;
