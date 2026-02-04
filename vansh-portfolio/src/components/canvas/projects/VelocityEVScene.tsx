import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface CarConfig {
  color: string;
  cameraMode: 'exterior' | 'interior';
}

// This component demonstrates a car configurator
// Real-time paint customization with interior camera transitions
const VelocityEVScene = () => {
  const groupRef = useRef<THREE.Group>(null);
  const carBodyRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  
  const [config, setConfig] = useState<CarConfig>({
    color: '#1a1a1a',
    cameraMode: 'exterior',
  });

  // Paint colors available
  const paintColors = [
    { name: 'Midnight Black', hex: '#1a1a1a' },
    { name: 'Arctic White', hex: '#f5f5f5' },
    { name: 'Electric Blue', hex: '#0066ff' },
    { name: 'Sunset Orange', hex: '#ff6600' },
    { name: 'Racing Red', hex: '#cc0000' },
  ];

  // Camera positions
  const cameraPositions = {
    exterior: { position: [5, 2, 8], target: [0, 0, 0] },
    interior: { position: [0.5, 1.2, 0.5], target: [0, 1.2, -2] },
  };

  const changePaintColor = (color: string) => {
    setConfig(prev => ({ ...prev, color }));
    
    if (carBodyRef.current) {
      gsap.to(carBodyRef.current.material, {
        duration: 0.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          (carBodyRef.current!.material as THREE.MeshStandardMaterial).color.set(color);
        },
      });
    }
  };

  const toggleCameraMode = () => {
    const newMode = config.cameraMode === 'exterior' ? 'interior' : 'exterior';
    setConfig(prev => ({ ...prev, cameraMode: newMode }));

    const targetPos = cameraPositions[newMode].position;
    const targetLookAt = cameraPositions[newMode].target;

    gsap.to(camera.position, {
      x: targetPos[0],
      y: targetPos[1],
      z: targetPos[2],
      duration: 1.5,
      ease: 'power2.inOut',
    });
  };

  useFrame(({ clock }) => {
    if (groupRef.current && config.cameraMode === 'exterior') {
      // Slow rotation when in exterior view
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.3;
    }
  });

  return (
    <>
      <group ref={groupRef}>
        {/* Car body placeholder */}
        <mesh ref={carBodyRef} position={[0, 0.5, 0]}>
          <boxGeometry args={[4, 1, 2]} />
          <meshStandardMaterial color={config.color} metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Wheels */}
        {[[-1.5, 0, 1], [-1.5, 0, -1], [1.5, 0, 1], [1.5, 0, -1]].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        ))}

        {/* Windshield */}
        <mesh position={[0.5, 1.2, 0]}>
          <boxGeometry args={[2, 0.8, 1.8]} />
          <meshStandardMaterial color="#111111" transparent opacity={0.5} />
        </mesh>

        {/* Interior (visible when inside) */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[2, 0.5, 1.5]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Dashboard */}
        <mesh position={[1, 1, 0]}>
          <boxGeometry args={[0.3, 0.4, 1.4]} />
          <meshStandardMaterial color="#2a2a2a" emissive="#ffa500" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <spotLight position={[10, 10, 10]} angle={0.3} intensity={1} castShadow />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ffd700" />
    </>
  );
};

// Export both the scene and configuration functions
export default VelocityEVScene;
