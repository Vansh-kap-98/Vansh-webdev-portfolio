import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Scroll-linked exploded view.
 *
 * Each layer owns a rest height and a separation weight; scroll progress drives
 * both, so the dish pulls itself apart along Y and settles back as you scroll up.
 * All surface detail is generated into canvas textures at runtime — no image
 * assets to download before the scene can look like food.
 */

// ─── Procedural textures ─────────────────────────────────────────────────────
const canvasTexture = (size: number, draw: (ctx: CanvasRenderingContext2D, s: number) => void) => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  draw(canvas.getContext('2d')!, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
};

const bunTexture = () =>
  canvasTexture(512, (ctx, s) => {
    const g = ctx.createRadialGradient(s * 0.42, s * 0.38, s * 0.05, s * 0.5, s * 0.5, s * 0.62);
    g.addColorStop(0, '#e8b877');
    g.addColorStop(0.55, '#cf9552');
    g.addColorStop(1, '#a66f36');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);

    // Crumb speckle + a few darker bake spots
    for (let i = 0; i < 5200; i++) {
      const r = Math.random() * 2.1;
      ctx.fillStyle = `rgba(${Math.random() > 0.55 ? '255,228,180' : '120,74,30'},${Math.random() * 0.26})`;
      ctx.beginPath();
      ctx.arc(Math.random() * s, Math.random() * s, r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = `rgba(140,86,36,${0.08 + Math.random() * 0.12})`;
      ctx.beginPath();
      ctx.ellipse(Math.random() * s, Math.random() * s, 14 + Math.random() * 30, 10 + Math.random() * 22, Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

const pattyTexture = () =>
  canvasTexture(512, (ctx, s) => {
    ctx.fillStyle = '#42281a';
    ctx.fillRect(0, 0, s, s);

    // Coarse grind
    for (let i = 0; i < 7000; i++) {
      const v = Math.random();
      ctx.fillStyle =
        v > 0.82 ? 'rgba(26,14,8,0.6)' : v > 0.5 ? 'rgba(96,56,32,0.45)' : 'rgba(132,80,44,0.25)';
      ctx.beginPath();
      ctx.arc(Math.random() * s, Math.random() * s, Math.random() * 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Grill bars across the face
    ctx.strokeStyle = 'rgba(16,8,4,0.55)';
    ctx.lineWidth = 13;
    for (let i = -1; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 86, 0);
      ctx.lineTo(i * 86 + 150, s);
      ctx.stroke();
    }
  });

const tomatoTexture = () =>
  canvasTexture(256, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 4, s / 2, s / 2, s / 2);
    g.addColorStop(0, '#f4d9c2');
    g.addColorStop(0.3, '#d6452f');
    g.addColorStop(0.86, '#b42f1f');
    g.addColorStop(1, '#8d2416');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);

    // Locules radiating from the core
    ctx.fillStyle = 'rgba(248,222,196,0.55)';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(s / 2 + Math.cos(a) * s * 0.26, s / 2 + Math.sin(a) * s * 0.26, s * 0.1, s * 0.055, a, 0, Math.PI * 2);
      ctx.fill();
    }
  });

// ─── Geometry helpers ────────────────────────────────────────────────────────
/** Crumpled ring used for the lettuce — a disc with a wavy edge and rippled surface. */
const makeLettuceGeometry = () => {
  const g = new THREE.CylinderGeometry(1.42, 1.42, 0.06, 96, 3, true);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const theta = Math.atan2(v.z, v.x);
    const ruffle = Math.sin(theta * 9) * 0.16 + Math.sin(theta * 23 + 1.1) * 0.07;
    const r = Math.hypot(v.x, v.z);
    const scale = (r + ruffle) / (r || 1);
    pos.setX(i, v.x * scale);
    pos.setZ(i, v.z * scale);
    pos.setY(i, v.y + Math.sin(theta * 7) * 0.09 + Math.cos(theta * 15) * 0.04);
  }
  g.computeVertexNormals();
  return g;
};

/** Cheese slice: a square that droops over the edges of the patty. */
const makeCheeseGeometry = () => {
  const g = new THREE.PlaneGeometry(2.15, 2.15, 18, 18);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const d = Math.max(Math.abs(x), Math.abs(z));
    // Flat over the patty, folding down past its radius
    const droop = d > 1.05 ? -Math.pow(d - 1.05, 1.6) * 1.15 : 0;
    pos.setY(i, droop + Math.sin(x * 3) * Math.cos(z * 3) * 0.015);
  }
  g.computeVertexNormals();
  return g;
};

// ─── Layer definition ────────────────────────────────────────────────────────
/*
 * Resting heights are derived from the geometry rather than hand-tuned, because
 * hand-tuned values left the stack open: the crown floated ~0.37 above the onion
 * and the lettuce hovered over the base bun. Each layer is stacked on the one
 * below using its own half-thickness, so the burger actually closes at rest.
 */
const BUN_RADIUS = 1.32;
const BUN_BASE_SCALE_Y = 0.34; // shallow heel
const BUN_CROWN_SCALE_Y = 0.62; // domed crown
const BUN_BASE_DEPTH = BUN_RADIUS * BUN_BASE_SCALE_Y;

const PLATE_TOP = 0.1; // rim of the plate the heel settles onto

const LETTUCE_HALF = 0.14; // slab plus ruffle amplitude
const TOMATO_HALF = 0.065;
const PATTY_HALF = 0.18;
const CHEESE_HALF = 0.015;
const ONION_HALF = 0.075;

/** Running stack: each entry sits on top of the previous one. */
const Y_PLATE = 0;
const Y_BUN_BASE = PLATE_TOP + BUN_BASE_DEPTH - 0.04; // settles slightly into the plate
const Y_LETTUCE = Y_BUN_BASE + 0.055; // leaves drape over the cut face
const Y_TOMATO = Y_LETTUCE + LETTUCE_HALF * 0.7 + TOMATO_HALF;
const Y_PATTY = Y_TOMATO + TOMATO_HALF + PATTY_HALF;
const Y_CHEESE = Y_PATTY + PATTY_HALF + CHEESE_HALF;
const Y_ONION = Y_CHEESE + CHEESE_HALF + ONION_HALF;
const Y_BUN_CROWN = Y_ONION + ONION_HALF + 0.05; // crown's cut face rests on the onion

interface Layer {
  key: string;
  /** Resting Y when the dish is assembled. */
  y: number;
  /** How far this layer travels when the view explodes. */
  spread: number;
}

const LAYERS: Layer[] = [
  { key: 'plate', y: Y_PLATE, spread: 0 },
  { key: 'bunBottom', y: Y_BUN_BASE, spread: 0.1 },
  { key: 'lettuce', y: Y_LETTUCE, spread: 0.95 },
  { key: 'tomato', y: Y_TOMATO, spread: 1.75 },
  { key: 'patty', y: Y_PATTY, spread: 2.6 },
  { key: 'cheese', y: Y_CHEESE, spread: 3.45 },
  { key: 'onion', y: Y_ONION, spread: 4.3 },
  { key: 'bunTop', y: Y_BUN_CROWN, spread: 5.3 },
];

const GastroLabScene = () => {
  const groupRef = useRef<THREE.Group>(null);
  const layerRefs = useRef<Record<string, THREE.Group | null>>({});
  const steamRef = useRef<THREE.Points>(null);
  const { camera } = useThree();

  const targetProgress = useRef(0);
  const progress = useRef(0);

  const tex = useMemo(
    () => ({ bun: bunTexture(), patty: pattyTexture(), tomato: tomatoTexture() }),
    [],
  );
  const lettuceGeo = useMemo(makeLettuceGeometry, []);
  const cheeseGeo = useMemo(makeCheeseGeometry, []);

  // Sesame seeds scattered over the crown, placed on the dome by spherical angle.
  const seeds = useMemo(
    () =>
      Array.from({ length: 34 }, () => {
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * 0.95;
        const r = 1.26;
        return {
          position: [
            Math.sin(theta) * Math.cos(phi) * r,
            Math.cos(theta) * r * 0.74,
            Math.sin(theta) * Math.sin(phi) * r,
          ] as [number, number, number],
          rotation: [Math.random() * 3, Math.random() * 3, Math.random() * 3] as [number, number, number],
        };
      }),
    [],
  );

  const steamGeo = useMemo(() => {
    const n = 70;
    const arr = new Float32Array(n * 3);
    const seedArr = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 1.1;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = Math.random() * 2.2;
      arr[i * 3 + 2] = Math.sin(a) * r;
      seedArr[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    g.userData.seeds = seedArr;
    return g;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress.current = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useFrame(({ clock }, delta) => {
    const k = 1 - Math.pow(0.002, delta);
    progress.current += (targetProgress.current - progress.current) * k;
    const p = progress.current;
    const t = clock.getElapsedTime();

    // Ease the separation so the first bit of scroll does less work than the last.
    const spreadAmount = p * p * (3 - 2 * p);

    for (const layer of LAYERS) {
      const group = layerRefs.current[layer.key];
      if (!group) continue;
      group.position.y = layer.y + layer.spread * spreadAmount;
      // Layers fan out a touch as they lift, and counter-rotate slightly.
      group.rotation.y = spreadAmount * layer.spread * 0.12;
      group.position.x = Math.sin(t * 0.6 + layer.spread) * 0.012 * spreadAmount;
    }

    if (groupRef.current) groupRef.current.rotation.y = t * 0.12 + p * 0.9;

    // Orbit up and back as the dish opens so the stack stays in frame.
    camera.position.set(
      Math.sin(p * 0.35) * 1.6,
      1.9 + p * 4.4,
      9.6 + p * 5.6,
    );
    camera.lookAt(0, 1.05 + p * 2.4, 0);

    if (steamRef.current) {
      const arr = (steamRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
      const seedArr = steamGeo.userData.seeds as Float32Array;
      for (let i = 0; i < seedArr.length; i++) {
        arr[i * 3 + 1] += delta * (0.32 + seedArr[i] * 0.5);
        if (arr[i * 3 + 1] > 2.8) arr[i * 3 + 1] = 0.6;
        arr[i * 3] += Math.sin(t * 0.8 + seedArr[i] * 10) * delta * 0.09;
      }
      (steamRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (steamRef.current.material as THREE.PointsMaterial).opacity = 0.13 * (1 - p);
    }
  });

  const setRef = (key: string) => (el: THREE.Group | null) => {
    layerRefs.current[key] = el;
  };

  return (
    <group>
      <color attach="background" args={['#0a0604']} />
      <fog attach="fog" args={['#0a0604', 12, 34]} />

      <ambientLight intensity={0.35} color="#ffd9b0" />
      <spotLight
        position={[5, 10, 6]}
        angle={0.55}
        penumbra={0.85}
        intensity={260}
        color="#fff0dc"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      <pointLight position={[-5, 3.5, -3]} intensity={38} distance={18} decay={2} color="#ff7a2f" />
      <pointLight position={[4, 1.6, -5]} intensity={22} distance={16} decay={2} color="#2f7dff" />

      <group ref={groupRef}>
        {/* ── Plate ── */}
        <group ref={setRef('plate')}>
          <mesh position={[0, 0.04, 0]} receiveShadow castShadow>
            <cylinderGeometry args={[2.9, 2.55, 0.09, 72]} />
            <meshStandardMaterial color="#1a1a1d" roughness={0.3} metalness={0.25} />
          </mesh>
          <mesh position={[0, 0.095, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <ringGeometry args={[2.25, 2.86, 72]} />
            <meshStandardMaterial color="#232327" roughness={0.22} metalness={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* ── Bottom bun ── */}
        <group ref={setRef('bunBottom')}>
          <mesh scale={[1, BUN_BASE_SCALE_Y, 1]} castShadow receiveShadow>
            <sphereGeometry args={[BUN_RADIUS, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <meshStandardMaterial map={tex.bun} roughness={0.92} />
          </mesh>
          <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[1.32, 48]} />
            <meshStandardMaterial color="#e8cfa6" roughness={0.98} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* ── Lettuce ── */}
        <group ref={setRef('lettuce')}>
          <mesh geometry={lettuceGeo} castShadow>
            <meshStandardMaterial color="#4f8f33" roughness={0.78} side={THREE.DoubleSide} />
          </mesh>
          <mesh geometry={lettuceGeo} rotation={[0, 1.1, 0]} scale={[0.93, 1, 0.93]} position={[0, 0.05, 0]} castShadow>
            <meshStandardMaterial color="#6fae46" roughness={0.78} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* ── Tomato ── */}
        <group ref={setRef('tomato')}>
          {[
            [0.42, 0, 0.3],
            [-0.5, 0, 0.18],
            [0.06, 0, -0.52],
          ].map(([x, , z], i) => (
            <mesh key={i} position={[x, 0, z]} rotation={[0, i * 1.3, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.66, 0.66, 0.13, 32]} />
              <meshStandardMaterial map={tex.tomato} roughness={0.42} />
            </mesh>
          ))}
        </group>

        {/* ── Patty ── */}
        <group ref={setRef('patty')}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[1.34, 1.28, 0.36, 48]} />
            <meshStandardMaterial map={tex.patty} roughness={0.74} />
          </mesh>
          {/* Charred lip where the edge caught the grill */}
          <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.12, 1.35, 48]} />
            <meshStandardMaterial color="#2a160c" roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* ── Cheese ── */}
        <group ref={setRef('cheese')}>
          <mesh geometry={cheeseGeo} rotation={[0, Math.PI / 4, 0]} castShadow>
            <meshStandardMaterial color="#f0a81f" roughness={0.42} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* ── Onion ── */}
        <group ref={setRef('onion')}>
          {[0.86, 1.08].map((r, i) => (
            <mesh key={r} position={[i ? 0.1 : -0.12, i * 0.05, i ? -0.08 : 0.1]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[r, 0.07, 10, 48]} />
              <meshStandardMaterial color={i ? '#d8c6de' : '#c3a9cc'} roughness={0.55} />
            </mesh>
          ))}
        </group>

        {/* ── Top bun ── */}
        <group ref={setRef('bunTop')}>
          <mesh scale={[1, BUN_CROWN_SCALE_Y, 1]} castShadow receiveShadow>
            <sphereGeometry args={[BUN_RADIUS, 48, 28, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial map={tex.bun} roughness={0.9} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.32, 48]} />
            <meshStandardMaterial color="#dcc099" roughness={0.98} side={THREE.DoubleSide} />
          </mesh>
          {seeds.map((seed, i) => (
            <mesh key={i} position={seed.position} rotation={seed.rotation} scale={[1, 0.45, 0.62]} castShadow>
              <sphereGeometry args={[0.062, 8, 6]} />
              <meshStandardMaterial color="#f3e2bd" roughness={0.6} />
            </mesh>
          ))}
        </group>
      </group>

      <points ref={steamRef} geometry={steamGeo} position={[0, 0.9, 0]}>
        <pointsMaterial size={0.055} color="#ffd9b4" transparent opacity={0.13} sizeAttenuation depthWrite={false} />
      </points>

      {/* Dark polished pass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[70, 70]} />
        <MeshReflectorMaterial
          resolution={256}
          blur={[150, 45]}
          mixBlur={1}
          mixStrength={28}
          depthScale={1}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.2}
          color="#0d0806"
          roughness={0.78}
          metalness={0.6}
          mirror={0.5}
        />
      </mesh>
    </group>
  );
};

export default GastroLabScene;
