import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// This component demonstrates exploded view product showcase
// Dish layers separate on Y-axis as user scrolls
const GastroLabScene = () => {
  const groupRef = useRef<THREE.Group>(null);
  const layersRef = useRef<THREE.Mesh[]>([]);
  
  // Layer offsets controlled by scroll
  const layerOffsets = useRef([0, 0, 0, 0, 0]);

  useEffect(() => {
    // Create GSAP timeline linked to scroll position
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.gastro-section', // You'd add this class to the section
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    // Animate layer separation
    layerOffsets.current.forEach((_, index) => {
      tl.to(layerOffsets.current, {
        [index]: (index - 2) * 1.5, // Spread layers apart
        duration: 1,
        ease: 'power2.inOut',
      }, index * 0.1);
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  useFrame(() => {
    layersRef.current.forEach((mesh, index) => {
      if (mesh) {
        mesh.position.y = layerOffsets.current[index];
      }
    });
  });

  // Layer definitions (bottom to top): Plate, Bun Bottom, Patty, Veggies, Bun Top
  const layers = [
    { name: 'Plate', color: '#444444', height: 0.1, radius: 2 },
    { name: 'Bun Bottom', color: '#d4a574', height: 0.3, radius: 1.2 },
    { name: 'Patty', color: '#5c4033', height: 0.4, radius: 1.3 },
    { name: 'Veggies', color: '#228b22', height: 0.2, radius: 1.4 },
    { name: 'Bun Top', color: '#e6b87d', height: 0.5, radius: 1.2 },
  ];

  return (
    <group ref={groupRef}>
      {layers.map((layer, index) => (
        <mesh
          key={layer.name}
          ref={(el) => { if (el) layersRef.current[index] = el; }}
          position={[0, index * 0.5, 0]}
        >
          <cylinderGeometry args={[layer.radius, layer.radius, layer.height, 32]} />
          <meshStandardMaterial color={layer.color} />
        </mesh>
      ))}
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1} />
    </group>
  );
};

export default GastroLabScene;
