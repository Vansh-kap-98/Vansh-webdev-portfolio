import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, ScrollControls } from '@react-three/drei';
import * as THREE from 'three';

// This component demonstrates an infinite tunnel gallery
// Camera moves through a dark corridor with floating artworks
const ArtifactsScene = () => {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  // Generate artwork positions along the tunnel
  const artworks = useMemo(() => {
    const items = [];
    const tunnelLength = 100;
    const artworkCount = 20;

    for (let i = 0; i < artworkCount; i++) {
      const z = -(i / artworkCount) * tunnelLength;
      const side = i % 2 === 0 ? -3 : 3;
      const y = 1 + Math.sin(i * 0.5) * 0.5;

      items.push({
        position: [side, y, z] as [number, number, number],
        rotation: [0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0] as [number, number, number],
        color: `hsl(${(i * 30) % 360}, 50%, 50%)`,
      });
    }

    return items;
  }, []);

  useFrame(({ camera }) => {
    if (!scroll) return;

    const scrollOffset = scroll.offset;
    const tunnelLength = 100;

    // Move camera through tunnel based on scroll
    camera.position.z = -scrollOffset * tunnelLength * 0.8;
    camera.position.y = 1.6;
    camera.position.x = Math.sin(scrollOffset * Math.PI * 2) * 0.3;

    // Add subtle camera sway
    camera.lookAt(0, 1.6, camera.position.z - 10);
  });

  return (
    <group ref={groupRef}>
      {/* Fog for depth */}
      <fog attach="fog" args={['#000000', 5, 30]} />

      {/* Tunnel walls */}
      <mesh position={[-5, 2, -50]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[100, 6]} />
        <meshStandardMaterial color="#0a0a0a" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[5, 2, -50]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[100, 6]} />
        <meshStandardMaterial color="#0a0a0a" side={THREE.DoubleSide} />
      </mesh>

      {/* Floor */}
      <mesh position={[0, 0, -50]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 100]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 4, -50]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 100]} />
        <meshStandardMaterial color="#030303" />
      </mesh>

      {/* Artworks */}
      {artworks.map((artwork, index) => (
        <group key={index} position={artwork.position} rotation={artwork.rotation}>
          {/* Frame */}
          <mesh>
            <boxGeometry args={[2.2, 1.7, 0.1]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* Artwork */}
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[2, 1.5]} />
            <meshStandardMaterial color={artwork.color} emissive={artwork.color} emissiveIntensity={0.2} />
          </mesh>
          {/* Spotlight */}
          <pointLight position={[0, 1, 0.5]} intensity={0.3} distance={3} color={artwork.color} />
        </group>
      ))}

      {/* Ambient lighting */}
      <ambientLight intensity={0.1} />
    </group>
  );
};

// Wrapper with ScrollControls
const ArtifactsSceneWrapper = () => {
  return (
    <ScrollControls pages={5} damping={0.1}>
      <ArtifactsScene />
    </ScrollControls>
  );
};

export default ArtifactsSceneWrapper;
