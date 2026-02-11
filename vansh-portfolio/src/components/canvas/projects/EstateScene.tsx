import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// This component demonstrates scroll-based camera flythrough
// using CatmullRomCurve3 for smooth path interpolation
const EstateScene = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = scrollHeight > 0 ? scrolled / scrollHeight : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    // Get position along the curve based on scroll
    const point = curve.getPoint(scrollProgress);
    camera.position.copy(point);
    
    // Look at a target that moves with scroll
    const lookAtPoint = curve.getPoint(Math.min(scrollProgress + 0.1, 1));
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

export default EstateScene;
