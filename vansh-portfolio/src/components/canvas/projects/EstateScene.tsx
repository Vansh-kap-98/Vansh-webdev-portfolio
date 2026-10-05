import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ReflectiveFloor from '@/components/canvas/ReflectiveFloor';

/**
 * Scroll-driven architectural flythrough.
 *
 * The camera rides a CatmullRomCurve3 from an aerial establishing shot, down the
 * approach, through the front door and into the living room. A second curve drives
 * the look-at target so the camera can face the house on the way in and then turn
 * toward the glass wall once inside — a single forward-looking tangent can't do that.
 */

// ─── Shared materials ────────────────────────────────────────────────────────
const M = {
  concrete: new THREE.MeshStandardMaterial({ color: '#15181d', roughness: 0.94, metalness: 0.02 }),
  concreteLight: new THREE.MeshStandardMaterial({ color: '#23272e', roughness: 0.88, metalness: 0.03 }),
  drive: new THREE.MeshStandardMaterial({ color: '#171a1f', roughness: 0.96, metalness: 0.0 }),
  trim: new THREE.MeshStandardMaterial({ color: '#0a0c0f', roughness: 0.55, metalness: 0.65 }),
  glass: new THREE.MeshStandardMaterial({
    color: '#0a141b',
    roughness: 0.06,
    metalness: 0.9,
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide,
  }),
  glow: new THREE.MeshStandardMaterial({
    color: '#241a0e',
    emissive: new THREE.Color('#f0a44e'),
    emissiveIntensity: 0.62,
    roughness: 0.5,
  }),
  // Slightly cooler/dimmer pane used on the upper band so the facade isn't one flat value.
  glowDim: new THREE.MeshStandardMaterial({
    color: '#1d1810',
    emissive: new THREE.Color('#d99a55'),
    emissiveIntensity: 0.42,
    roughness: 0.55,
  }),
  glowCool: new THREE.MeshStandardMaterial({
    color: '#06111a',
    emissive: new THREE.Color('#2dd4bf'),
    emissiveIntensity: 1.1,
    roughness: 0.4,
  }),
  wood: new THREE.MeshStandardMaterial({ color: '#2b1f16', roughness: 0.75 }),
  woodLight: new THREE.MeshStandardMaterial({ color: '#4a3524', roughness: 0.7 }),
  fabric: new THREE.MeshStandardMaterial({ color: '#2a2b30', roughness: 1 }),
  fabricWarm: new THREE.MeshStandardMaterial({ color: '#3b3028', roughness: 1 }),
  metal: new THREE.MeshStandardMaterial({ color: '#6c7076', roughness: 0.28, metalness: 0.92 }),
  foliage: new THREE.MeshStandardMaterial({ color: '#0e1a12', roughness: 1 }),
  bark: new THREE.MeshStandardMaterial({ color: '#191410', roughness: 1 }),
  water: new THREE.MeshStandardMaterial({
    color: '#041a22',
    emissive: new THREE.Color('#0d4f63'),
    emissiveIntensity: 0.6,
    roughness: 0.04,
    metalness: 0.95,
  }),
};

// ─── Camera rig ──────────────────────────────────────────────────────────────
const POSITION_CURVE = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(17, 19, 27), // aerial establishing, three-quarter
    new THREE.Vector3(8, 10.5, 18), // swinging round to the drive
    new THREE.Vector3(1.6, 3.4, 9), // approach
    new THREE.Vector3(0, 1.7, 1.4), // at the threshold
    new THREE.Vector3(0, 1.65, -4.5), // through the entry
    new THREE.Vector3(2.9, 1.6, -7.2), // living room, dollying right to open the room up
  ],
  false,
  'catmullrom',
  0.4,
);

const TARGET_CURVE = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 3.2, -7), // look at the house
    new THREE.Vector3(0, 3.0, -7),
    new THREE.Vector3(0, 2.2, -6),
    new THREE.Vector3(0, 1.6, -7), // into the doorway
    new THREE.Vector3(-0.5, 1.5, -11),
    new THREE.Vector3(-2.4, 1.15, -12.2), // across the room toward the media wall
  ],
  false,
  'catmullrom',
  0.4,
);

// ─── Small building blocks ───────────────────────────────────────────────────
const Box = ({
  args,
  position,
  rotation,
  material,
  castShadow = true,
  receiveShadow = true,
}: {
  args: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  material: THREE.Material;
  castShadow?: boolean;
  receiveShadow?: boolean;
}) => (
  <mesh
    position={position}
    rotation={rotation}
    material={material}
    castShadow={castShadow}
    receiveShadow={receiveShadow}
  >
    <boxGeometry args={args} />
  </mesh>
);

const Tree = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 1.1, 0]} material={M.bark} castShadow>
      <cylinderGeometry args={[0.12, 0.2, 2.2, 6]} />
    </mesh>
    <mesh position={[0, 2.9, 0]} material={M.foliage} castShadow>
      <icosahedronGeometry args={[1.25, 0]} />
    </mesh>
    <mesh position={[0.35, 2.1, 0.2]} material={M.foliage} castShadow>
      <icosahedronGeometry args={[0.78, 0]} />
    </mesh>
  </group>
);

/** Low bollard that lights the approach. Emissive only — no extra light cost. */
const PathLight = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 0.3, 0]} material={M.trim} castShadow>
      <cylinderGeometry args={[0.055, 0.075, 0.6, 8]} />
    </mesh>
    <mesh position={[0, 0.63, 0]} material={M.glow}>
      <cylinderGeometry args={[0.07, 0.07, 0.1, 8]} />
    </mesh>
  </group>
);

// ─── The house ───────────────────────────────────────────────────────────────
const House = () => (
  <group>
    {/* ── Ground floor shell. Front wall sits at z = -2 with a door void at x = 0 ── */}
    <Box args={[13, 0.3, 13]} position={[0, -0.14, -8.5]} material={M.concrete} />

    {/* Back wall */}
    <Box args={[13, 3.3, 0.25]} position={[0, 1.65, -15]} material={M.concrete} />
    {/* Right wall (solid) */}
    <Box args={[0.25, 3.3, 13]} position={[6.4, 1.65, -8.5]} material={M.concrete} />

    {/* Left wall — full-height glazing with mullions */}
    <mesh position={[-6.4, 1.65, -8.5]} rotation={[0, Math.PI / 2, 0]} material={M.glass}>
      <planeGeometry args={[13, 3.3]} />
    </mesh>
    {[-13, -10.5, -8, -5.5, -3].map((z) => (
      <Box key={z} args={[0.1, 3.3, 0.1]} position={[-6.4, 1.65, z]} material={M.trim} />
    ))}
    <Box args={[0.14, 0.14, 13]} position={[-6.4, 3.25, -8.5]} material={M.trim} />
    <Box args={[0.14, 0.14, 13]} position={[-6.4, 0.07, -8.5]} material={M.trim} />

    {/* Front wall, built around the door void */}
    <Box args={[5.6, 3.3, 0.25]} position={[-3.7, 1.65, -2]} material={M.concrete} />
    <Box args={[5.6, 3.3, 0.25]} position={[3.7, 1.65, -2]} material={M.concrete} />
    <Box args={[1.8, 0.85, 0.25]} position={[0, 2.88, -2]} material={M.concrete} />

    {/* Lit windows flanking the entrance */}
    <Box args={[3.2, 1.5, 0.07]} position={[-3.6, 1.75, -1.86]} material={M.glow} castShadow={false} />
    <Box args={[3.2, 1.5, 0.07]} position={[3.6, 1.75, -1.86]} material={M.glow} castShadow={false} />
    <Box args={[3.4, 0.08, 0.12]} position={[-3.6, 1.75, -1.82]} material={M.trim} castShadow={false} />
    <Box args={[3.4, 0.08, 0.12]} position={[3.6, 1.75, -1.82]} material={M.trim} castShadow={false} />

    {/* Front door, standing ajar so the camera can pass through */}
    <group position={[-0.9, 0, -2]} rotation={[0, -1.25, 0]}>
      <Box args={[1.8, 2.45, 0.09]} position={[0.9, 1.22, 0]} material={M.woodLight} />
      <mesh position={[1.62, 1.2, 0.08]} material={M.metal} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.85, 8]} />
      </mesh>
    </group>

    {/* ── Upper volume, cantilevered to leave a terrace over the entrance ── */}
    <Box args={[13, 0.3, 13]} position={[0, 3.45, -8.5]} material={M.concreteLight} />
    <Box args={[13, 3.1, 9.4]} position={[0, 5.15, -10.3]} material={M.concrete} />

    {/* Glazing band across the upper front */}
    <Box args={[11.4, 1.7, 0.09]} position={[0, 5.2, -5.55]} material={M.glowDim} castShadow={false} />
    {[-4.4, -2.2, 0, 2.2, 4.4].map((x) => (
      <Box key={x} args={[0.1, 1.8, 0.14]} position={[x, 5.2, -5.5]} material={M.trim} castShadow={false} />
    ))}

    {/* Roof slab with a slight overhang */}
    <Box args={[13.8, 0.3, 10.2]} position={[0, 6.85, -10.3]} material={M.concreteLight} />

    {/* Terrace railing */}
    <mesh position={[0, 4.05, -5.6]} material={M.glass}>
      <planeGeometry args={[13, 1.1]} />
    </mesh>
    <Box args={[13, 0.09, 0.09]} position={[0, 4.6, -5.6]} material={M.metal} />

    {/* Entry canopy */}
    <Box args={[5.4, 0.22, 3.2]} position={[0, 3.3, -0.5]} material={M.concreteLight} />
    <mesh position={[0, 3.15, -0.5]} material={M.glow} castShadow={false}>
      <boxGeometry args={[3.6, 0.05, 1.6]} />
    </mesh>

    {/* Chimney / service stack breaks up the roofline */}
    <Box args={[1.1, 2.0, 1.1]} position={[4.6, 7.8, -12.5]} material={M.concrete} />
  </group>
);

// ─── Interior: the living room the flythrough lands in ───────────────────────
const Interior = () => (
  <group>
    {/* Floor finish + rug */}
    <mesh position={[0, 0.03, -9]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[12.6, 12.6]} />
      <meshStandardMaterial color="#1b1511" roughness={0.45} metalness={0.15} />
    </mesh>
    <Box args={[6.4, 0.03, 5.2]} position={[-1.6, 0.05, -10]} material={M.fabricWarm} castShadow={false} />

    {/* Sofa facing the glass wall */}
    <group position={[0.9, 0, -10]}>
      <Box args={[1.5, 0.42, 4.2]} position={[0, 0.34, 0]} material={M.fabric} />
      <Box args={[0.3, 0.75, 4.2]} position={[0.62, 0.72, 0]} material={M.fabric} />
      <Box args={[1.5, 0.3, 0.28]} position={[0, 0.68, 2.1]} material={M.fabric} />
      <Box args={[1.5, 0.3, 0.28]} position={[0, 0.68, -2.1]} material={M.fabric} />
      {[-1.2, 0.2, 1.5].map((z) => (
        <Box key={z} args={[0.14, 0.5, 0.5]} position={[0.42, 0.72, z]} material={M.fabricWarm} rotation={[0, 0, 0.3]} />
      ))}
    </group>

    {/* Coffee table */}
    <group position={[-1.9, 0, -10]}>
      <Box args={[1.1, 0.07, 2.2]} position={[0, 0.42, 0]} material={M.woodLight} />
      {[
        [-0.45, -0.95],
        [0.45, -0.95],
        [-0.45, 0.95],
        [0.45, 0.95],
      ].map(([x, z], i) => (
        <Box key={i} args={[0.06, 0.42, 0.06]} position={[x, 0.21, z]} material={M.metal} />
      ))}
      <mesh position={[0, 0.52, 0.4]} material={M.glowCool} castShadow={false}>
        <cylinderGeometry args={[0.1, 0.13, 0.14, 10]} />
      </mesh>
    </group>

    {/* Media wall against the back */}
    <Box args={[4.2, 0.45, 0.6]} position={[-1.6, 0.22, -14.4]} material={M.wood} />
    <mesh position={[-1.6, 1.35, -14.55]} castShadow={false}>
      <boxGeometry args={[3.0, 1.7, 0.06]} />
      <meshStandardMaterial color="#05080c" emissive="#13364a" emissiveIntensity={0.7} roughness={0.3} />
    </mesh>

    {/* Shelving against the solid right wall */}
    <group position={[6.0, 0, -11]}>
      <Box args={[0.45, 2.6, 3.4]} position={[0, 1.3, 0]} material={M.wood} />
      {[0.6, 1.2, 1.8, 2.4].map((y) => (
        <Box key={y} args={[0.5, 0.05, 3.4]} position={[-0.03, y, 0]} material={M.woodLight} />
      ))}
      {[
        [0.75, -1.1],
        [0.75, -0.6],
        [1.35, 0.9],
        [1.95, -0.3],
        [1.95, 1.2],
      ].map(([y, z], i) => (
        <Box key={i} args={[0.3, 0.28, 0.18]} position={[-0.05, y, z]} material={i % 2 ? M.fabricWarm : M.glowCool} castShadow={false} />
      ))}
    </group>

    {/* Floor lamp — paired with the warm point light below */}
    <group position={[3.4, 0, -12.6]}>
      <mesh position={[0, 0.03, 0]} material={M.metal} castShadow>
        <cylinderGeometry args={[0.24, 0.28, 0.06, 12]} />
      </mesh>
      <mesh position={[0, 0.85, 0]} material={M.metal} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 1.7, 8]} />
      </mesh>
      <mesh position={[0, 1.78, 0]} material={M.glow} castShadow={false}>
        <coneGeometry args={[0.34, 0.42, 14, 1, true]} />
      </mesh>
    </group>

    {/* Pendant cluster over the table */}
    {[
      [-2.4, 2.45, -10.6],
      [-1.9, 2.75, -10.0],
      [-1.4, 2.3, -9.4],
    ].map(([x, y, z], i) => (
      <group key={i}>
        <mesh position={[x, (y + 3.3) / 2, z]} material={M.trim}>
          <cylinderGeometry args={[0.007, 0.007, 3.3 - y, 4]} />
        </mesh>
        <mesh position={[x, y, z]} material={M.glow} castShadow={false}>
          <sphereGeometry args={[0.11, 12, 12]} />
        </mesh>
      </group>
    ))}

    {/* Dining set in the far corner */}
    <group position={[-4.0, 0, -13.4]}>
      <Box args={[2.4, 0.08, 1.2]} position={[0, 0.74, 0]} material={M.woodLight} />
      {[
        [-1.05, -0.5],
        [1.05, -0.5],
        [-1.05, 0.5],
        [1.05, 0.5],
      ].map(([x, z], i) => (
        <Box key={i} args={[0.07, 0.74, 0.07]} position={[x, 0.37, z]} material={M.metal} />
      ))}
      {[-0.7, 0, 0.7].map((x) => (
        <group key={x} position={[x, 0, 0.95]}>
          <Box args={[0.42, 0.06, 0.42]} position={[0, 0.45, 0]} material={M.fabric} />
          <Box args={[0.42, 0.5, 0.06]} position={[0, 0.72, 0.18]} material={M.fabric} />
        </group>
      ))}
    </group>
  </group>
);

// ─── Grounds ─────────────────────────────────────────────────────────────────
const Grounds = () => (
  <group>
    {/* Approach */}
    <Box args={[3.4, 0.06, 20]} position={[0, 0.005, 8]} material={M.drive} castShadow={false} />
    {[1.5, 4.5, 7.5, 10.5, 13.5].map((z) => (
      <group key={z}>
        <PathLight position={[-2.3, 0, z]} />
        <PathLight position={[2.3, 0, z]} />
      </group>
    ))}

    {/* Pool off the glazed side, catching the house lights */}
    <Box args={[6.4, 0.12, 11]} position={[-11.5, 0.02, -8]} material={M.concreteLight} castShadow={false} />
    <mesh position={[-11.5, 0.11, -8]} rotation={[-Math.PI / 2, 0, 0]} material={M.water}>
      <planeGeometry args={[5.6, 10.2]} />
    </mesh>

    {/* Hedges along the drive */}
    {[2, 6, 10, 14].map((z) => (
      <group key={z}>
        <Box args={[1.1, 0.8, 2.6]} position={[-4.2, 0.4, z]} material={M.foliage} />
        <Box args={[1.1, 0.8, 2.6]} position={[4.2, 0.4, z]} material={M.foliage} />
      </group>
    ))}

    <Tree position={[-9.5, 0, 6]} scale={1.3} />
    <Tree position={[9.5, 0, 3]} scale={1.1} />
    <Tree position={[11.5, 0, -10]} scale={1.45} />
    <Tree position={[-16, 0, 2]} scale={1.2} />
    <Tree position={[14, 0, 10]} scale={1} />
    <Tree position={[-14, 0, -16]} scale={1.35} />
  </group>
);

// ─── Scene ───────────────────────────────────────────────────────────────────
const EstateScene = () => {
  const { gl } = useThree();
  const shadowFrames = useRef(0);
  const targetProgress = useRef(0);
  const progress = useRef(0);
  const lookAt = useMemo(() => new THREE.Vector3(), []);
  const moonRef = useRef<THREE.DirectionalLight>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress.current = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Nothing in this scene moves except the camera, so the shadow map is the
    // same image every frame. Render it a couple of times (once the geometry
    // and materials have settled) and then stop paying for it.
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    return () => {
      gl.shadowMap.autoUpdate = true;
    };
  }, [gl]);

  useEffect(() => {
    // Tighten the shadow frustum around the house so the one shadow map we pay
    // for is actually spent on the building rather than empty ground.
    const moon = moonRef.current;
    if (!moon) return;
    const cam = moon.shadow.camera;
    cam.left = -24;
    cam.right = 24;
    cam.top = 24;
    cam.bottom = -24;
    cam.near = 1;
    cam.far = 70;
    cam.updateProjectionMatrix();
  }, []);

  useFrame((_, delta) => {
    // Re-bake the static shadow map over the first few frames, then leave it.
    if (shadowFrames.current < 4) {
      shadowFrames.current++;
      gl.shadowMap.needsUpdate = true;
    }

    // Frame-rate independent easing toward the scroll position.
    const k = 1 - Math.pow(0.0015, delta);
    progress.current += (targetProgress.current - progress.current) * k;

    const t = progress.current;
    const camera = _.camera;
    POSITION_CURVE.getPoint(t, camera.position);
    TARGET_CURVE.getPoint(t, lookAt);
    camera.lookAt(lookAt);
  });

  return (
    <group>
      <color attach="background" args={['#070b14']} />
      <fog attach="fog" args={['#0a1019', 26, 115]} />

      {/* Deep-dusk key light + cool fill, with warm interior sources */}
      <ambientLight intensity={0.38} color="#8ea6cc" />
      <hemisphereLight args={['#24364f', '#070a0e', 0.85]} />
      <directionalLight
        ref={moonRef}
        position={[-26, 24, 20]}
        intensity={1.9}
        color="#b8ccee"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0008}
      />
      {/* Low opposite-side bounce so no face falls to pure black */}
      <directionalLight position={[20, 9, -18]} intensity={0.35} color="#4a6184" />
      <pointLight position={[-1.6, 2.7, -10]} intensity={22} distance={18} decay={2} color="#ffb366" />
      <pointLight position={[3.4, 1.8, -12.6]} intensity={10} distance={11} decay={2} color="#ffc287" />
      <pointLight position={[1.5, 2.6, -13.2]} intensity={9} distance={12} decay={2} color="#ffa95c" />
      <pointLight position={[0, 2.9, -0.5]} intensity={5} distance={8} decay={2} color="#ffb97a" />

      <House />
      <Interior />
      <Grounds />

      {/* Ground plane — wet-looking so the house and pool read in reflection */}
      <ReflectiveFloor
        size={[220, 220]}
        position={[0, -0.02, 0]}
        color="#10151c"
        roughness={0.92}
        metalness={0.4}
        mirror={0.4}
        mixStrength={14}
        blur={[180, 60]}
      />
    </group>
  );
};

export default EstateScene;
