import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// This component demonstrates particle morphing
// Particles morph into different symbols as user scrolls
const NeuroCoreScene = () => {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const morphProgress = useRef(0);
  
  const count = 500;

  // Define target positions for different shapes
  const shapeTargets = useMemo(() => {
    const shapes = {
      sphere: [] as THREE.Vector3[],
      shield: [] as THREE.Vector3[],
      bolt: [] as THREE.Vector3[],
      globe: [] as THREE.Vector3[],
    };

    for (let i = 0; i < count; i++) {
      // Sphere formation
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      shapes.sphere.push(new THREE.Vector3(
        Math.cos(theta) * Math.sin(phi) * 2,
        Math.sin(theta) * Math.sin(phi) * 2,
        Math.cos(phi) * 2
      ));

      // Shield formation (V shape)
      const t = i / count;
      const shieldX = (Math.random() - 0.5) * 3;
      const shieldY = Math.abs(shieldX) * 1.5 - 2;
      shapes.shield.push(new THREE.Vector3(shieldX, shieldY + t * 4, (Math.random() - 0.5) * 0.5));

      // Bolt formation (zigzag)
      const boltY = (i / count) * 4 - 2;
      const boltX = Math.sin(i * 0.5) * (Math.random() * 0.5 + 0.5);
      shapes.bolt.push(new THREE.Vector3(boltX, boltY, (Math.random() - 0.5) * 0.3));

      // Globe formation (wireframe sphere lines)
      const globePhi = (i % 20) * 0.314;
      const globeTheta = Math.floor(i / 20) * 0.628;
      shapes.globe.push(new THREE.Vector3(
        Math.sin(globePhi) * Math.cos(globeTheta) * 2.5,
        Math.cos(globePhi) * 2.5,
        Math.sin(globePhi) * Math.sin(globeTheta) * 2.5
      ));
    }

    return shapes;
  }, []);

  // Current and target positions
  const currentPositions = useRef<THREE.Vector3[]>(
    Array.from({ length: count }, () => new THREE.Vector3(
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5
    ))
  );

  const targetShape = useRef<'sphere' | 'shield' | 'bolt' | 'globe'>('sphere');

  useEffect(() => {
    // ScrollTrigger to change target shape
    ScrollTrigger.create({
      trigger: '.neurocore-section',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        if (progress < 0.25) targetShape.current = 'sphere';
        else if (progress < 0.5) targetShape.current = 'shield';
        else if (progress < 0.75) targetShape.current = 'bolt';
        else targetShape.current = 'globe';
        
        morphProgress.current = progress;
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  useFrame(({ clock }) => {
    if (!instancedMeshRef.current) return;

    const dummy = new THREE.Object3D();
    const targets = shapeTargets[targetShape.current];
    const time = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      // Lerp towards target
      currentPositions.current[i].lerp(targets[i], 0.02);

      // Add some floating motion
      const offset = Math.sin(time + i * 0.1) * 0.05;

      dummy.position.set(
        currentPositions.current[i].x,
        currentPositions.current[i].y + offset,
        currentPositions.current[i].z
      );
      dummy.updateMatrix();
      instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
    }

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshBasicMaterial color="#a855f7" transparent opacity={0.8} />
    </instancedMesh>
  );
};

export default NeuroCoreScene;
