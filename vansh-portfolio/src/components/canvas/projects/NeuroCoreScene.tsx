import { useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * InstancedMesh particle morphing.
 *
 * The earlier version aimed its particles at shapes defined by ad-hoc trig, so
 * the "shield" and "bolt" never read as either. These targets are sampled from
 * the filled pixels of an actual icon path rasterised to an offscreen canvas,
 * which is why the silhouettes are legible. Scroll interpolates continuously
 * between consecutive targets rather than snapping at thresholds.
 */

const COUNT = 2600;

// ─── Target builders ─────────────────────────────────────────────────────────

/** Rasterise an SVG path (24×24 viewBox) and scatter points across its filled area. */
const sampleSilhouette = (pathData: string, count: number, scale: number) => {
  const S = 180;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(S / 24, S / 24);
  ctx.fillStyle = '#fff';
  ctx.fill(new Path2D(pathData));

  const { data } = ctx.getImageData(0, 0, S, S);
  const filled: number[] = [];
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      if (data[(y * S + x) * 4 + 3] > 128) filled.push(y * S + x);
    }
  }

  // Shuffle once, then walk with a stride so coverage is even rather than clumpy.
  for (let i = filled.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [filled[i], filled[j]] = [filled[j], filled[i]];
  }

  const out: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const px = filled[i % filled.length];
    const x = px % S;
    const y = (px / S) | 0;
    out.push(
      new THREE.Vector3(
        (x / S - 0.5) * scale + (Math.random() - 0.5) * 0.03,
        -(y / S - 0.5) * scale + (Math.random() - 0.5) * 0.03,
        (Math.random() - 0.5) * scale * 0.035,
      ),
    );
  }
  return out;
};

/**
 * Loose volumetric cloud. Deliberately *not* a clean shell — the closing globe is
 * also spherical, and if the opening formation were a perfect sphere too the two
 * stages would read as the same shape.
 */
const dataCloud = (count: number, radius: number) => {
  const out: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    // Vary the radius per particle so the cloud has depth instead of a hard shell.
    const depth = 0.42 + Math.pow(Math.random(), 0.65) * 0.78;
    out.push(
      new THREE.Vector3(
        Math.cos(theta) * r * radius * depth,
        y * radius * depth,
        Math.sin(theta) * r * radius * depth,
      ),
    );
  }
  return out;
};

/**
 * Wire globe: a coarse lat/long lattice plus two tilted orbit rings. Few enough
 * rings that the gaps between them survive at this particle count — a denser
 * lattice just fills in and reads as a solid ball.
 */
const wireGlobe = (count: number, radius: number) => {
  const out: THREE.Vector3[] = [];
  const orbitCount = Math.floor(count * 0.22);
  const latticeCount = count - orbitCount;

  const lats = 5;
  const lons = 8;
  const rings = lats + lons;
  const perRing = Math.ceil(latticeCount / rings);

  for (let i = 0; i < latticeCount; i++) {
    const ring = i % rings;
    const t = (Math.floor(i / rings) / perRing) * Math.PI * 2;

    if (ring < lats) {
      const phi = ((ring + 1) / (lats + 1)) * Math.PI;
      const r = Math.sin(phi) * radius;
      out.push(new THREE.Vector3(Math.cos(t) * r, Math.cos(phi) * radius, Math.sin(t) * r));
    } else {
      const lonAngle = ((ring - lats) / lons) * Math.PI;
      const a = t / 2; // half sweep: a meridian runs pole to pole, not all the way round
      out.push(
        new THREE.Vector3(
          Math.sin(a) * Math.cos(lonAngle) * radius,
          Math.cos(a) * radius,
          Math.sin(a) * Math.sin(lonAngle) * radius,
        ),
      );
    }
  }

  // Two tilted orbit rings outside the globe — the detail that makes the final
  // formation unmistakably different from the opening cloud.
  const orbits = [
    { tilt: 0.42, r: radius * 1.55 },
    { tilt: -1.05, r: radius * 1.78 },
  ];
  for (let i = 0; i < orbitCount; i++) {
    const o = orbits[i % orbits.length];
    const a = (Math.floor(i / orbits.length) / Math.ceil(orbitCount / orbits.length)) * Math.PI * 2;
    const x = Math.cos(a) * o.r;
    const z = Math.sin(a) * o.r;
    out.push(
      new THREE.Vector3(x, z * Math.sin(o.tilt) + (Math.random() - 0.5) * 0.05, z * Math.cos(o.tilt)),
    );
  }

  return out;
};

const SHIELD_PATH =
  'M12 1.6 L21 5.6 L21 11.4 C21 16.9 17.2 21.3 12 22.6 C6.8 21.3 3 16.9 3 11.4 L3 5.6 Z';
const BOLT_PATH = 'M13.4 1.5 L3.6 14.2 L10.6 14.2 L9.8 22.5 L20.4 9.2 L13.1 9.2 Z';

const STAGES = ['cloud', 'shield', 'bolt', 'globe'] as const;
/** How much Y-rotation each formation tolerates. The flat silhouettes want none. */
const STAGE_SPIN = [1, 0, 0, 1];

const NeuroCoreScene = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const targetProgress = useRef(0);
  const progress = useRef(0);

  const shapes = useMemo(
    () => [
      dataCloud(COUNT, 3.6),
      sampleSilhouette(SHIELD_PATH, COUNT, 7.4),
      sampleSilhouette(BOLT_PATH, COUNT, 8.0),
      wireGlobe(COUNT, 2.75),
    ],
    [],
  );

  // Per-particle state: current position, a speed jitter so the swarm doesn't
  // arrive in lockstep, and a fixed colour ramp position.
  const particles = useMemo(() => {
    const current = new Float32Array(COUNT * 3);
    const speed = new Float32Array(COUNT);
    const phase = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      current[i * 3] = (Math.random() - 0.5) * 14;
      current[i * 3 + 1] = (Math.random() - 0.5) * 14;
      current[i * 3 + 2] = (Math.random() - 0.5) * 14;
      speed[i] = 0.045 + Math.random() * 0.075;
      phase[i] = Math.random() * Math.PI * 2;
    }
    return { current, speed, phase };
  }, []);

  const colorA = useMemo(() => new THREE.Color('#a855f7'), []);
  const colorB = useMemo(() => new THREE.Color('#22d3ee'), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  /*
   * Seed the instance matrices to identity once. These instances only ever
   * translate and scale uniformly, so the frame loop can then touch just the
   * six floats that change (m0/m5/m10 scale, m12/m13/m14 position) instead of
   * composing 2,600 full matrices through Object3D every frame.
   */
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const m = mesh.instanceMatrix.array as Float32Array;
    m.fill(0);
    for (let i = 0; i < COUNT; i++) {
      const o = i * 16;
      m[o] = m[o + 5] = m[o + 10] = m[o + 15] = 1;
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  // Colour ramp is static, so write it once.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < COUNT; i++) {
      tmpColor.copy(colorA).lerp(colorB, (i / COUNT) * 0.85 + Math.random() * 0.15);
      mesh.setColorAt(i, tmpColor);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [colorA, colorB, tmpColor]);

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
    const mesh = meshRef.current;
    if (!mesh) return;

    const k = 1 - Math.pow(0.004, delta);
    progress.current += (targetProgress.current - progress.current) * k;
    const p = progress.current;
    const t = clock.getElapsedTime();

    // Continuous blend across the four targets instead of switching at thresholds.
    const stageF = p * (STAGES.length - 1);
    const i0 = Math.min(STAGES.length - 1, Math.floor(stageF));
    const i1 = Math.min(STAGES.length - 1, i0 + 1);
    const raw = stageF - i0;
    const blend = raw * raw * (3 - 2 * raw);

    const from = shapes[i0];
    const to = shapes[i1];
    const { current, speed, phase } = particles;
    const m = mesh.instanceMatrix.array as Float32Array;

    for (let i = 0; i < COUNT; i++) {
      const a = from[i];
      const b = to[i];
      const tx = a.x + (b.x - a.x) * blend;
      const ty = a.y + (b.y - a.y) * blend;
      const tz = a.z + (b.z - a.z) * blend;

      const i3 = i * 3;
      const s = speed[i];
      current[i3] += (tx - current[i3]) * s;
      current[i3 + 1] += (ty - current[i3 + 1]) * s;
      current[i3 + 2] += (tz - current[i3 + 2]) * s;

      // Idle shimmer keeps the formation alive once it has settled.
      const drift = Math.sin(t * 1.3 + phase[i]) * 0.035;

      // Particles still travelling are drawn slightly larger, so a morph reads as motion.
      const dist = Math.abs(tx - current[i3]) + Math.abs(ty - current[i3 + 1]);
      const scale = 1 + Math.min(1.6, dist * 0.55);

      const o = i * 16;
      m[o] = scale;
      m[o + 5] = scale;
      m[o + 10] = scale;
      m[o + 12] = current[i3] + drift;
      m[o + 13] = current[i3 + 1] + drift * 0.6;
      m[o + 14] = current[i3 + 2];
    }

    mesh.instanceMatrix.needsUpdate = true;
    const spin = STAGE_SPIN[i0] + (STAGE_SPIN[i1] - STAGE_SPIN[i0]) * blend;
    mesh.rotation.y = (Math.sin(t * 0.14) * 0.22 + p * 0.5) * spin;

    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.22;
      coreRef.current.rotation.x = t * 0.1;
      // The core only belongs to the opening "data cloud" formation.
      const visible = Math.max(0, 1 - p * 4);
      coreRef.current.scale.setScalar(0.55 + visible * 0.45);
      (coreRef.current.material as THREE.MeshBasicMaterial).opacity = visible * 0.5;
    }

    camera.position.x = Math.sin(t * 0.18) * 0.7 * (0.25 + spin * 0.75);
    camera.position.y = Math.cos(t * 0.15) * 0.45 * (0.25 + spin * 0.75);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      <color attach="background" args={['#06040c']} />
      <fog attach="fog" args={['#06040c', 14, 40]} />

      <ambientLight intensity={0.6} />
      <pointLight position={[8, 8, 8]} intensity={60} distance={40} decay={2} color="#a855f7" />
      <pointLight position={[-8, -4, 6]} intensity={40} distance={40} decay={2} color="#22d3ee" />

      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <sphereGeometry args={[0.028, 6, 5]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* Wireframe core, visible only during the opening formation */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.25, 1]} />
        <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

export default NeuroCoreScene;
