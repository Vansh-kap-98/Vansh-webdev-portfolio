import { useRef, useMemo, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ReflectiveFloor from '@/components/canvas/ReflectiveFloor';

/**
 * Verlet-integrated cloth.
 *
 * The previous version was a sine-wave vertex shader on a flat plane, which
 * can't drape, fold or hold a crease. This runs an actual mass-spring solver on
 * the CPU — structural, shear and bend constraints relaxed over two Gauss-Seidel
 * passes per frame — and writes the result into the geometry's position buffer.
 * Normals are recomputed each frame so the lighting picks up the wrinkles.
 */

const COLS = 22;
const ROWS = 29;
const CLOTH_W = 3.4;
const CLOTH_H = 4.4;
/** Height of the cloth's top edge. The sim runs in world space — the mesh is not
 *  offset by a parent group — so pointer raycasts need no coordinate conversion. */
const CLOTH_TOP_Y = 4.84;
const COUNT = COLS * ROWS;

const GRAVITY = -7.5;
const DAMPING = 0.985;
const RELAX_PASSES = 3;
const STEP = 1 / 60;

/** Columns outside this span hang free, which is what gives the piece its shoulders. */
const PIN_FROM = 4;
const PIN_TO = COLS - 5;

const idx = (ix: number, iy: number) => iy * COLS + ix;

// ─── Screen-printed graphic, generated at runtime so there's no asset to ship ──
const makeFabricTexture = () => {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base cloth
  ctx.fillStyle = '#121214';
  ctx.fillRect(0, 0, size, size);

  // Woven slub — fine random threads in both directions
  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const v = Math.random();
    ctx.fillStyle = `rgba(${v > 0.5 ? '255,255,255' : '0,0,0'},${0.012 + Math.random() * 0.02})`;
    ctx.fillRect(x, y, Math.random() > 0.5 ? 6 : 1, Math.random() > 0.5 ? 1 : 6);
  }

  // Wordmark
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#eaeaea';
  ctx.font = '900 190px "Helvetica Neue", Helvetica, Arial, sans-serif';
  ctx.letterSpacing = '18px';
  ctx.fillText('VOID', size / 2, size * 0.42);

  // Neon underline
  ctx.fillStyle = '#39ff14';
  ctx.fillRect(size * 0.28, size * 0.5, size * 0.44, 7);

  ctx.fillStyle = 'rgba(220,220,220,0.75)';
  ctx.font = '500 34px "JetBrains Mono", ui-monospace, monospace';
  ctx.letterSpacing = '14px';
  ctx.fillText('STREETWEAR', size / 2, size * 0.56);

  ctx.fillStyle = 'rgba(160,160,160,0.5)';
  ctx.font = '500 22px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillText('A/W — NO SEASON', size / 2, size * 0.62);

  // Care label printed low on the body
  ctx.fillStyle = 'rgba(140,140,140,0.35)';
  ctx.font = '400 17px "JetBrains Mono", ui-monospace, monospace';
  ctx.letterSpacing = '6px';
  ctx.fillText('100% HEAVYWEIGHT COTTON · 420 GSM', size / 2, size * 0.88);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
};

// ─── Cloth ────────────────────────────────────────────────────────────────────
const Cloth = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();

  const texture = useMemo(makeFabricTexture, []);

  const sim = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const prev = new Float32Array(COUNT * 3);
    const pinned = new Uint8Array(COUNT);
    const pinPos = new Float32Array(COUNT * 3);

    const stepX = CLOTH_W / (COLS - 1);
    const stepY = CLOTH_H / (ROWS - 1);
    const centre = (COLS - 1) / 2;
    const shoulderSpan = centre - PIN_FROM;

    for (let iy = 0; iy < ROWS; iy++) {
      for (let ix = 0; ix < COLS; ix++) {
        const i = idx(ix, iy) * 3;
        const t = Math.abs(ix - centre) / shoulderSpan;

        pos[i] = -CLOTH_W / 2 + ix * stepX;
        pos[i + 1] = CLOTH_TOP_Y - iy * stepY;
        // Bulge the body forward a little so it starts with volume, not as a sheet.
        pos[i + 2] = 0.34 * Math.max(0, 1 - t * t) * Math.sin((iy / (ROWS - 1)) * Math.PI * 0.85);

        prev[i] = pos[i];
        prev[i + 1] = pos[i + 1];
        prev[i + 2] = pos[i + 2];

        // Top row pins follow a hanger line that slopes away from the hook.
        if (iy === 0 && ix >= PIN_FROM && ix <= PIN_TO) {
          pinned[idx(ix, iy)] = 1;
          pinPos[i] = pos[i];
          pinPos[i + 1] = pos[i + 1] - 0.42 * t;
          pinPos[i + 2] = pos[i + 2];
          pos[i + 1] = pinPos[i + 1];
          prev[i + 1] = pinPos[i + 1];
        }
      }
    }

    // Constraint list: [a, b, restLength]
    const a: number[] = [];
    const b: number[] = [];
    const rest: number[] = [];
    const add = (p: number, q: number) => {
      const dx = pos[p * 3] - pos[q * 3];
      const dy = pos[p * 3 + 1] - pos[q * 3 + 1];
      const dz = pos[p * 3 + 2] - pos[q * 3 + 2];
      a.push(p);
      b.push(q);
      rest.push(Math.hypot(dx, dy, dz));
    };

    for (let iy = 0; iy < ROWS; iy++) {
      for (let ix = 0; ix < COLS; ix++) {
        if (ix < COLS - 1) add(idx(ix, iy), idx(ix + 1, iy)); // structural
        if (iy < ROWS - 1) add(idx(ix, iy), idx(ix, iy + 1));
        if (ix < COLS - 1 && iy < ROWS - 1) {
          add(idx(ix, iy), idx(ix + 1, iy + 1)); // shear
          add(idx(ix + 1, iy), idx(ix, iy + 1));
        }
        if (ix < COLS - 2) add(idx(ix, iy), idx(ix + 2, iy)); // bend
        if (iy < ROWS - 2) add(idx(ix, iy), idx(ix, iy + 2));
      }
    }

    return {
      pos,
      prev,
      pinned,
      pinPos,
      ca: new Uint16Array(a),
      cb: new Uint16Array(b),
      crest: new Float32Array(rest),
    };
  }, []);

  // ── Pointer state, tracked in world space on the cloth's own plane ──
  const pointer = useRef(new THREE.Vector3(0, 0, 10));
  const pointerActive = useRef(false);
  const grabbed = useRef(-1);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.35), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  const updatePointer = useCallback(
    (clientX: number, clientY: number) => {
      const rect = gl.domElement.getBoundingClientRect();
      ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(dragPlane, hit)) {
        pointer.current.copy(hit);
        pointerActive.current = true;
      }
    },
    [camera, dragPlane, gl, hit, ndc, raycaster],
  );

  useEffect(() => {
    const el = gl.domElement;

    const onMove = (e: PointerEvent) => updatePointer(e.clientX, e.clientY);
    const onLeave = () => {
      pointerActive.current = false;
      grabbed.current = -1;
    };
    const onDown = (e: PointerEvent) => {
      updatePointer(e.clientX, e.clientY);
      // Grab the nearest free particle so the cloth can be pulled, not just pushed.
      let best = -1;
      let bestDist = 0.55;
      const { pos, pinned } = sim;
      for (let i = 0; i < COUNT; i++) {
        if (pinned[i]) continue;
        const d = Math.hypot(
          pos[i * 3] - pointer.current.x,
          pos[i * 3 + 1] - pointer.current.y,
          pos[i * 3 + 2] - pointer.current.z,
        );
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      grabbed.current = best;
    };
    const onUp = () => {
      grabbed.current = -1;
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerup', onUp);

    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerup', onUp);
    };
  }, [gl, sim, updatePointer]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { pos, prev, pinned, pinPos, ca, cb, crest } = sim;
    const t = clock.getElapsedTime();
    const dt2 = STEP * STEP;

    // Wind: a slow travelling gust so the fabric never sits perfectly still.
    const gust = Math.sin(t * 0.55) * 0.5 + Math.sin(t * 1.37 + 1.2) * 0.25;

    // ── Integrate ──
    for (let i = 0; i < COUNT; i++) {
      if (pinned[i]) continue;
      const i3 = i * 3;

      const windZ = (gust * 1.9 + Math.sin(t * 2.1 + pos[i3 + 1] * 1.8) * 0.5) * 0.55;
      const windX = Math.sin(t * 0.9 + pos[i3 + 1] * 0.7) * 0.35;

      for (let axis = 0; axis < 3; axis++) {
        const k = i3 + axis;
        const accel = axis === 0 ? windX : axis === 1 ? GRAVITY : windZ;
        const velocity = (pos[k] - prev[k]) * DAMPING;
        prev[k] = pos[k];
        pos[k] += velocity + accel * dt2;
      }
    }

    // ── Pointer interaction ──
    if (pointerActive.current) {
      const p = pointer.current;
      if (grabbed.current >= 0) {
        const g = grabbed.current * 3;
        pos[g] = p.x;
        pos[g + 1] = p.y;
        pos[g + 2] = p.z;
        prev[g] = p.x;
        prev[g + 1] = p.y;
        prev[g + 2] = p.z;
      } else {
        const R = 0.75;
        for (let i = 0; i < COUNT; i++) {
          if (pinned[i]) continue;
          const i3 = i * 3;
          const dx = pos[i3] - p.x;
          const dy = pos[i3 + 1] - p.y;
          const dz = pos[i3 + 2] - p.z;
          const d = Math.hypot(dx, dy, dz);
          if (d < R && d > 1e-4) {
            const push = ((R - d) / R) * 0.055;
            pos[i3] += (dx / d) * push;
            pos[i3 + 1] += (dy / d) * push;
            pos[i3 + 2] += (dz / d) * push;
          }
        }
      }
    }

    // ── Relax constraints ──
    for (let pass = 0; pass < RELAX_PASSES; pass++) {
      for (let c = 0; c < ca.length; c++) {
        const i3 = ca[c] * 3;
        const j3 = cb[c] * 3;
        const dx = pos[j3] - pos[i3];
        const dy = pos[j3 + 1] - pos[i3 + 1];
        const dz = pos[j3 + 2] - pos[i3 + 2];
        const d = Math.hypot(dx, dy, dz);
        if (d < 1e-6) continue;

        const diff = ((d - crest[c]) / d) * 0.5;
        const ox = dx * diff;
        const oy = dy * diff;
        const oz = dz * diff;

        const iFixed = pinned[ca[c]] === 1;
        const jFixed = pinned[cb[c]] === 1;
        if (iFixed && jFixed) continue;

        // A pinned endpoint takes none of the correction, so the free one takes it all.
        const wi = iFixed ? 0 : jFixed ? 2 : 1;
        const wj = jFixed ? 0 : iFixed ? 2 : 1;

        pos[i3] += ox * wi;
        pos[i3 + 1] += oy * wi;
        pos[i3 + 2] += oz * wi;
        pos[j3] -= ox * wj;
        pos[j3 + 1] -= oy * wj;
        pos[j3 + 2] -= oz * wj;
      }

      // Re-assert pins after each pass.
      for (let i = 0; i < COUNT; i++) {
        if (!pinned[i]) continue;
        const i3 = i * 3;
        pos[i3] = pinPos[i3];
        pos[i3 + 1] = pinPos[i3 + 1];
        pos[i3 + 2] = pinPos[i3 + 2];
      }
    }

    const attr = mesh.geometry.attributes.position as THREE.BufferAttribute;
    (attr.array as Float32Array).set(pos);
    attr.needsUpdate = true;
    // No computeBoundingSphere here: the mesh sets frustumCulled={false}, so the
    // sphere is never read, and recomputing it walked every vertex each frame.
    mesh.geometry.computeVertexNormals();
  });

  return (
    <group>
      <mesh ref={meshRef} castShadow frustumCulled={false}>
        <planeGeometry args={[CLOTH_W, CLOTH_H, COLS - 1, ROWS - 1]} />
        <meshStandardMaterial
          map={texture}
          side={THREE.DoubleSide}
          roughness={0.93}
          metalness={0.02}
        />
      </mesh>
    </group>
  );
};

// ─── Rail the garment hangs from ─────────────────────────────────────────────
const RAIL_METAL = new THREE.MeshStandardMaterial({
  color: '#8d939b',
  roughness: 0.3,
  metalness: 0.95,
});

const Rail = () => (
  <group>
    {/* Cross bar */}
    <mesh position={[0, 5.0, 0]} rotation={[0, 0, Math.PI / 2]} material={RAIL_METAL} castShadow>
      <cylinderGeometry args={[0.045, 0.045, 7, 16]} />
    </mesh>
    {/* Uprights + feet */}
    {[-3.3, 3.3].map((x) => (
      <group key={x}>
        <mesh position={[x, 2.5, 0]} material={RAIL_METAL} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 5.0, 14]} />
        </mesh>
        <mesh position={[x, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} material={RAIL_METAL} castShadow>
          <torusGeometry args={[0.32, 0.045, 10, 28]} />
        </mesh>
      </group>
    ))}
    {/* Hanger hook */}
    <mesh position={[0, 5.0, 0]} rotation={[Math.PI / 2, 0, 0]} material={RAIL_METAL} castShadow>
      <torusGeometry args={[0.13, 0.018, 8, 22, Math.PI * 1.4]} />
    </mesh>
    <mesh position={[0, 4.78, 0]} material={RAIL_METAL} castShadow>
      <cylinderGeometry args={[0.018, 0.018, 0.34, 8]} />
    </mesh>
  </group>
);

// ─── Scene ───────────────────────────────────────────────────────────────────
const CameraRig = () => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0.9, 2.6, 11.2);
    camera.lookAt(0, 2.6, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
};

const VoidStreetwearScene = () => {
  const dust = useRef<THREE.Points>(null);

  const dustGeometry = useMemo(() => {
    const n = 180;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = Math.random() * 7;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (dust.current) dust.current.rotation.y = clock.getElapsedTime() * 0.025;
  });

  return (
    <group>
      <color attach="background" args={['#08090b']} />
      <fog attach="fog" args={['#08090b', 9, 26]} />

      {/* Studio key light from front-right, neon rim from behind-left */}
      <ambientLight intensity={0.3} color="#aab4c4" />
      <spotLight
        position={[5.5, 9.5, 7.5]}
        angle={0.6}
        penumbra={0.9}
        intensity={190}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
      />
      <pointLight position={[-5, 4.4, -4]} intensity={44} distance={20} decay={2} color="#39ff14" />
      <pointLight position={[4.5, 2.4, -4]} intensity={20} distance={16} decay={2} color="#1f6bff" />
      <pointLight position={[0, 3.4, 4.5]} intensity={16} distance={13} decay={2} color="#ffffff" />

      <CameraRig />
      <Rail />
      <Cloth />

      {/* Cyclorama backdrop */}
      <mesh position={[0, 4, -5.2]} receiveShadow>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#0c0d10" roughness={1} />
      </mesh>

      {/* Polished studio floor */}
      <ReflectiveFloor
        size={[60, 60]}
        color="#0a0b0d"
        roughness={0.75}
        metalness={0.65}
        mirror={0.55}
        mixStrength={32}
      />

      <points ref={dust} geometry={dustGeometry}>
        <pointsMaterial size={0.022} color="#7d8794" transparent opacity={0.5} sizeAttenuation />
      </points>
    </group>
  );
};

export default VoidStreetwearScene;
