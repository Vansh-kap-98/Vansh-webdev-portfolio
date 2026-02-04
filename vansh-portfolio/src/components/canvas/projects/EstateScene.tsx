import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ScrollControls, useScroll } from '@react-three/drei';
import * as THREE from 'three';

// This component demonstrates scroll-based camera flythrough
// using CatmullRomCurve3 for smooth path interpolation
const EstateScene = () => {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  // Define camera path points (Aerial -> Front Door -> Living Room)
  const pathPoints = [
    new THREE.Vector3(0, 10, 20),    // Aerial view
    new THREE.Vector3(0, 3, 10),     // Approaching
    new THREE.Vector3(0, 1.6, 5),    // Front door
    new THREE.Vector3(0, 1.6, 0),    // Entrance
    new THREE.Vector3(0, 1.6, -5),   // Living room
  ];

  const curve = new THREE.CatmullRomCurve3(pathPoints);

  useFrame(({ camera }) => {
    if (!scroll) return;
    
    const scrollOffset = scroll.offset;
    
    // Get position along the curve based on scroll
    const point = curve.getPoint(scrollOffset);
    camera.position.copy(point);
    
    // Look at a target that moves with scroll
    const lookAtPoint = curve.getPoint(Math.min(scrollOffset + 0.1, 1));
    camera.lookAt(lookAtPoint);
  });

  return (
    <group ref={groupRef}>
      {/* Building placeholder geometry */}
      <mesh position={[0, 2, -10]}>
        <boxGeometry args={[10, 6, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      
      {/* Interior furniture placeholders */}
      <mesh position={[0, 0.5, -8]}>
        <boxGeometry args={[3, 0.5, 1.5]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
    </group>
  );
};

// Wrapper with ScrollControls
const EstateSceneWrapper = () => {
  return (
    <ScrollControls pages={3} damping={0.1}>
      <EstateScene />
    </ScrollControls>
  );
};

export default EstateSceneWrapper;
