import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// This component demonstrates physics-based cloth simulation
// Vertex shader wobble effect that responds to mouse drag
const VoidStreetwearScene = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const { viewport } = useThree();

  // Simple wobble shader
  const vertexShader = `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uStrength;
    
    varying vec2 vUv;
    varying float vWave;
    
    void main() {
      vUv = uv;
      
      vec3 pos = position;
      
      // Calculate distance from mouse
      float dist = distance(uMouse, uv);
      
      // Create wave effect based on mouse position
      float wave = sin(pos.x * 3.0 + uTime * 2.0) * 0.1;
      wave += sin(pos.y * 2.0 + uTime * 1.5) * 0.1;
      
      // Add mouse influence
      float mouseInfluence = smoothstep(0.5, 0.0, dist) * uStrength;
      pos.z += wave + mouseInfluence * 0.3;
      
      vWave = wave;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 uColor;
    uniform float uTime;
    
    varying vec2 vUv;
    varying float vWave;
    
    void main() {
      vec3 color = uColor;
      
      // Add subtle gradient based on wave
      color += vWave * 0.5;
      
      // Add subtle noise pattern
      float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
      color += noise * 0.02;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  useFrame(({ clock, mouse }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      materialRef.current.uniforms.uMouse.value = new THREE.Vector2(
        (mouse.x + 1) / 2,
        (mouse.y + 1) / 2
      );
    }

    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
    }
  });

  return (
    <group>
      {/* Hoodie placeholder - would be replaced with actual 3D model */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[3, 4, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uStrength: { value: 1.0 },
            uColor: { value: new THREE.Color('#1a1a1a') },
          }}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Brand label placeholder */}
      <mesh position={[0, -2.5, 0]}>
        <planeGeometry args={[1.5, 0.3]} />
        <meshBasicMaterial color="#00ff00" transparent opacity={0.8} />
      </mesh>
    </group>
  );
};

export default VoidStreetwearScene;
