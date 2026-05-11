import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleField = () => {
  const meshRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  const count = 1200;

  const [positions, velocities, alphas, alphaVelocities] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const alphas = new Float32Array(count);
    const alphaVelocities = new Float32Array(count);

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

      // Random initial opacity and fade speed for each particle
      alphas[i] = Math.random();
      alphaVelocities[i] = (Math.random() - 0.5) * 0.02;
    }

    return [positions, velocities, alphas, alphaVelocities];
  }, [count]);

  useFrame(({ mouse }) => {
    if (!meshRef.current) return;

    const geometry = meshRef.current.geometry;
    const positionAttr = geometry.attributes.position;
    const alphaAttr = geometry.attributes.alpha;
    const pos = positionAttr.array as Float32Array;
    const alpha = alphaAttr.array as Float32Array;

    mouseRef.current.x = mouse.x * viewport.width * 0.5;
    mouseRef.current.y = mouse.y * viewport.height * 0.5;

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
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 3) {
        const force = (3 - dist) * 0.002;
        pos[ix] += dx * force;
        pos[iy] += dy * force;
      }

      // Wrap around with larger boundaries
      if (pos[ix] > 25) pos[ix] = -25;
      if (pos[ix] < -25) pos[ix] = 25;
      if (pos[iy] > 25) pos[iy] = -25;
      if (pos[iy] < -25) pos[iy] = 25;

      // Update alpha (fade in/out effect)
      alphas[i] += alphaVelocities[i];
      
      // Reverse fade direction at bounds
      if (alphas[i] > 1) {
        alphas[i] = 1;
        alphaVelocities[i] = -Math.abs(alphaVelocities[i]);
      } else if (alphas[i] < 0.1) {
        alphas[i] = 0.1;
        alphaVelocities[i] = Math.abs(alphaVelocities[i]);
      }
      
      alpha[i] = alphas[i];
    }

    positionAttr.needsUpdate = true;
    alphaAttr.needsUpdate = true;
  });

  // Custom shader material for per-particle opacity
  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(0xffffff) },
          pointSize: { value: 0.05 },
        },
        vertexShader: `
          attribute float alpha;
          varying float vAlpha;
          uniform float pointSize;
          
          void main() {
            vAlpha = alpha;
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
        <bufferAttribute
          attach="attributes-alpha"
          count={count}
          array={alphas}
          itemSize={1}
          usage={THREE.DynamicDrawUsage}
        />
      </bufferGeometry>
    </points>
  );
};

export default ParticleField;
