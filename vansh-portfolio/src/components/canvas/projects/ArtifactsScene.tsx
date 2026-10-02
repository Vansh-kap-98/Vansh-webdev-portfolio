import { useRef, useMemo, useState, useEffect, useLayoutEffect, memo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, ScrollControls, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ─── Painting Data ─────────────────────────────────────────────────────────────
export const PAINTINGS = [
  {
    name: 'The Starry Night',
    artist: 'Vincent van Gogh',
    description:
      'A swirling night sky over a sleeping village, painted from memory during Van Gogh’s voluntary internment at the Saint-Paul-de-Mausole asylum. The village below is invented; only the dark cypress and the hills are drawn from the view out his window.',
    datePainted: 'June 1889',
    cost: 'Not for sale — held in trust',
    dimensions: '73.7 × 92.1 cm',
    medium: 'Oil on canvas',
    location: 'Museum of Modern Art, New York',
    copiesAvailable: 0,
    imageUrl: '/paintings/starry-night.jpg',
    accent: '#3b82f6',
  },
  {
    name: 'The Night Watch',
    artist: 'Rembrandt van Rijn',
    description:
      'A militia company caught mid-muster rather than posed in rank — the break from the static group portrait that made the painting famous. It was trimmed on all four sides in 1715 to fit a wall in Amsterdam’s town hall, and has never been made whole.',
    datePainted: '1642',
    cost: 'Not for sale — state collection',
    dimensions: '379.5 × 453.5 cm',
    medium: 'Oil on canvas',
    location: 'Rijksmuseum, Amsterdam',
    copiesAvailable: 0,
    imageUrl: '/paintings/the-night-watch.jpg',
    accent: '#f59e0b',
  },
  {
    name: 'Girl with a Pearl Earring',
    artist: 'Johannes Vermeer',
    description:
      'Not a portrait but a tronie — a study of a type rather than a named sitter. Recent imaging suggests the pearl is a few deft strokes of lead white over a translucent glaze, with no outline at all: an illusion of a pearl rather than a painted one.',
    datePainted: 'c. 1665',
    cost: 'Not for sale — museum collection',
    dimensions: '44.5 × 39 cm',
    medium: 'Oil on canvas',
    location: 'Mauritshuis, The Hague',
    copiesAvailable: 0,
    imageUrl: '/paintings/girl-with-a-pearl-earring.jpg',
    accent: '#22d3ee',
  },
  {
    name: 'The Great Wave off Kanagawa',
    artist: 'Katsushika Hokusai',
    description:
      'The first print in Thirty-six Views of Mount Fuji. The wave is not a tsunami but an okinami — a rogue open-sea wave — and Fuji sits small and still at the centre of the composition, dwarfed by it.',
    datePainted: 'c. 1831',
    cost: '$2.76M — record for an impression (2023)',
    dimensions: '25.7 × 37.9 cm',
    medium: 'Woodblock print (ukiyo-e)',
    location: 'Impressions held worldwide',
    copiesAvailable: 100,
    imageUrl: '/paintings/the-great-wave.jpg',
    accent: '#6366f1',
  },
  {
    name: 'The Scream',
    artist: 'Edvard Munch',
    description:
      'Munch described the moment behind it in his diary — a walk at sunset when he felt “a great, infinite scream pass through nature.” The figure is not screaming but covering its ears against it. Four versions exist, in paint and pastel.',
    datePainted: '1893',
    cost: '$119.9M — 1895 pastel version (2012)',
    dimensions: '91 × 73 cm',
    medium: 'Oil, tempera and pastel on cardboard',
    location: 'National Gallery, Oslo',
    copiesAvailable: 3,
    imageUrl: '/paintings/the-scream.jpg',
    accent: '#f97316',
  },
  {
    name: 'Wanderer above the Sea of Fog',
    artist: 'Caspar David Friedrich',
    description:
      'The defining image of German Romanticism. The viewer is placed directly behind the figure — a Rückenfigur — so the landscape is encountered over his shoulder rather than presented, which is what makes the painting feel like a vantage point rather than a view.',
    datePainted: 'c. 1818',
    cost: 'Not for sale — museum collection',
    dimensions: '94.8 × 74.8 cm',
    medium: 'Oil on canvas',
    location: 'Kunsthalle Hamburg, Germany',
    copiesAvailable: 0,
    imageUrl: '/paintings/wanderer-above-the-sea-of-fog.jpg',
    accent: '#a3e635',
  },
];

export type Painting = typeof PAINTINGS[number];

/**
 * Canvas aspect (width / height), read off the catalogued dimensions, which are
 * recorded height × width in the usual museum convention.
 */
const aspectOf = (painting: Painting) => {
  const [h, w] = painting.dimensions.split('×').map((part) => parseFloat(part));
  return Number.isFinite(h) && Number.isFinite(w) && h > 0 ? w / h : 1.33;
};

// ─── Gallery dimensions ──────────────────────────────────────────────────────
const HALF_WIDTH = 4.6; // wall plane at ±HALF_WIDTH
const HEIGHT = 7.2;
const BAY = 11; // pilaster / painting rhythm
const CORRIDOR_LENGTH = 132;
const CORRIDOR_START = 8; // corridor begins slightly behind the camera
const EYE = 1.68;

/** Hang height for the centre of every canvas. */
const HANG_Y = 2.55;
/** Every canvas is hung to the same height; width follows from the aspect. */
const CANVAS_HEIGHT = 1.62;

const PAINTING_Z = (i: number) => -(12 + i * BAY);
const PAINTING_SIDE = (i: number) => (i % 2 === 0 ? -1 : 1);
const TRAVEL = Math.abs(PAINTING_Z(PAINTINGS.length - 1)) + 13;

// ─── Texture loading ─────────────────────────────────────────────────────────
const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = 'anonymous';
const preloadedTextures: Record<string, THREE.Texture> = {};

const fallbackCanvas = document.createElement('canvas');
fallbackCanvas.width = fallbackCanvas.height = 1;
const fallbackCtx = fallbackCanvas.getContext('2d')!;
fallbackCtx.fillStyle = '#3a3030';
fallbackCtx.fillRect(0, 0, 1, 1);
const FALLBACK_TEXTURE = new THREE.CanvasTexture(fallbackCanvas);

PAINTINGS.forEach((p) => {
  // Store the texture reference IMMEDIATELY — three.js textures are live objects,
  // so the material can hold this and update itself when the image data arrives.
  const tex = textureLoader.load(
    p.imageUrl,
    (loadedTex) => {
      loadedTex.colorSpace = THREE.SRGBColorSpace;
      loadedTex.anisotropy = 8;
    },
    undefined,
    () => {
      console.warn(`[Artifacts] Failed to load: ${p.imageUrl}`);
      tex.image = fallbackCanvas as unknown as HTMLImageElement;
      tex.needsUpdate = true;
    },
  );
  preloadedTextures[p.imageUrl] = tex;
});

/** Engraved brass placard, drawn at runtime so there is no asset per artwork. */
const placardTexture = (painting: Painting) => {
  const W = 512;
  const H = 128;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#6b5423');
  grad.addColorStop(0.5, '#917238');
  grad.addColorStop(1, '#55411b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(28,20,8,0.92)';
  ctx.font = '600 30px Georgia, "Times New Roman", serif';
  ctx.fillText(painting.name.toUpperCase(), W / 2, 50);
  ctx.font = 'italic 24px Georgia, "Times New Roman", serif';
  ctx.fillStyle = 'rgba(38,28,12,0.8)';
  ctx.fillText(`${painting.artist}, ${painting.datePainted}`, W / 2, 90);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

// ─── Shared materials ────────────────────────────────────────────────────────
const M = {
  wall: new THREE.MeshStandardMaterial({ color: '#3a272c', roughness: 0.96 }),
  alcove: new THREE.MeshStandardMaterial({ color: '#463036', roughness: 0.92 }),
  stone: new THREE.MeshStandardMaterial({ color: '#5a4a50', roughness: 0.8, metalness: 0.06 }),
  stoneDark: new THREE.MeshStandardMaterial({ color: '#2e2428', roughness: 0.9 }),
  ceiling: new THREE.MeshStandardMaterial({ color: '#241a1d', roughness: 1 }),
  gold: new THREE.MeshStandardMaterial({ color: '#9c7c33', metalness: 1, roughness: 0.26, envMapIntensity: 1.4 }),
  goldBright: new THREE.MeshStandardMaterial({ color: '#d8b164', metalness: 1, roughness: 0.12 }),
  goldDark: new THREE.MeshStandardMaterial({ color: '#4a3a16', metalness: 0.85, roughness: 0.5 }),
  brass: new THREE.MeshStandardMaterial({ color: '#c49a4e', metalness: 1, roughness: 0.28 }),
  brassShade: new THREE.MeshStandardMaterial({ color: '#8f7236', metalness: 0.7, roughness: 0.52 }),
  backing: new THREE.MeshStandardMaterial({ color: '#0b0709', roughness: 1 }),
  leather: new THREE.MeshStandardMaterial({ color: '#2c1e21', roughness: 0.75 }),
  chrome: new THREE.MeshStandardMaterial({ color: '#8d939b', metalness: 1, roughness: 0.18 }),
  carpet: new THREE.MeshStandardMaterial({ color: '#5c1f27', roughness: 1 }),
  skylight: new THREE.MeshStandardMaterial({
    color: '#120d0a',
    emissive: new THREE.Color('#ffcf96'),
    emissiveIntensity: 0.16,
    roughness: 0.9,
  }),
};

const EMISSIVE_WHITE = new THREE.Color(1, 1, 1);

/** Recessed arched alcove that each canvas is hung inside. */
const Alcove = ({ w, h }: { w: number; h: number }) => (
  <group position={[0, 0, -0.06]}>
    <mesh material={M.alcove}>
      <planeGeometry args={[w, h]} />
    </mesh>
    {/* Arch head */}
    <mesh position={[0, h / 2, 0]} material={M.alcove}>
      <circleGeometry args={[w / 2, 28, 0, Math.PI]} />
    </mesh>
    {/* Moulding around the recess */}
    <mesh position={[0, h / 2, 0.02]} material={M.stone}>
      <ringGeometry args={[w / 2, w / 2 + 0.12, 28, 1, 0, Math.PI]} />
    </mesh>
    {[-(w / 2 + 0.06), w / 2 + 0.06].map((x, i) => (
      <mesh key={i} position={[x, 0, 0.02]} material={M.stone}>
        <boxGeometry args={[0.12, h, 0.06]} />
      </mesh>
    ))}
    <mesh position={[0, -(h / 2 + 0.06), 0.02]} material={M.stone}>
      <boxGeometry args={[w + 0.24, 0.12, 0.06]} />
    </mesh>
  </group>
);

// ─── Frame ───────────────────────────────────────────────────────────────────
/**
 * Built from four mitred rails plus an inner lip and outer bead, rather than a
 * stack of concentric slabs — the rails are what make it read as a moulding at
 * a glancing angle instead of a flat plaque.
 */
const Frame = ({ w, h }: { w: number; h: number }) => {
  const FW = 0.175; // face width of the main rail
  const FD = 0.15; // depth
  const ow = w + FW * 2;
  const oh = h + FW * 2;

  return (
    <group>
      {/* Backing board, so the recess reads as a box rather than a floating plane */}
      <mesh position={[0, 0, -FD / 2 - 0.015]} material={M.backing}>
        <boxGeometry args={[ow, oh, 0.03]} />
      </mesh>

      {/* Main rails */}
      <mesh position={[0, h / 2 + FW / 2, 0]} material={M.gold} castShadow>
        <boxGeometry args={[ow, FW, FD]} />
      </mesh>
      <mesh position={[0, -(h / 2 + FW / 2), 0]} material={M.gold} castShadow>
        <boxGeometry args={[ow, FW, FD]} />
      </mesh>
      <mesh position={[-(w / 2 + FW / 2), 0, 0]} material={M.gold} castShadow>
        <boxGeometry args={[FW, h, FD]} />
      </mesh>
      <mesh position={[w / 2 + FW / 2, 0, 0]} material={M.gold} castShadow>
        <boxGeometry args={[FW, h, FD]} />
      </mesh>

      {/* Outer bead — a thin bright edge that catches the picture light */}
      {[
        [0, oh / 2 + 0.02, ow + 0.08, 0.045],
        [0, -(oh / 2 + 0.02), ow + 0.08, 0.045],
      ].map(([x, y, bw, bh], i) => (
        <mesh key={`bead-h-${i}`} position={[x, y, 0.02]} material={M.goldBright}>
          <boxGeometry args={[bw, bh, FD * 0.8]} />
        </mesh>
      ))}
      {[-(ow / 2 + 0.02), ow / 2 + 0.02].map((x, i) => (
        <mesh key={`bead-v-${i}`} position={[x, 0, 0.02]} material={M.goldBright}>
          <boxGeometry args={[0.045, oh + 0.08, FD * 0.8]} />
        </mesh>
      ))}

      {/* Inner lip, set proud of the canvas so the art sits in a recess */}
      {[
        [0, h / 2 + 0.03, w + 0.12, 0.06],
        [0, -(h / 2 + 0.03), w + 0.12, 0.06],
      ].map(([x, y, lw, lh], i) => (
        <mesh key={`lip-h-${i}`} position={[x, y, FD / 2 - 0.01]} material={M.goldDark}>
          <boxGeometry args={[lw, lh, 0.05]} />
        </mesh>
      ))}
      {[-(w / 2 + 0.03), w / 2 + 0.03].map((x, i) => (
        <mesh key={`lip-v-${i}`} position={[x, 0, FD / 2 - 0.01]} material={M.goldDark}>
          <boxGeometry args={[0.06, h + 0.12, 0.05]} />
        </mesh>
      ))}

      {/* Corner ornaments */}
      {[
        [-(w / 2 + FW / 2), h / 2 + FW / 2],
        [w / 2 + FW / 2, h / 2 + FW / 2],
        [-(w / 2 + FW / 2), -(h / 2 + FW / 2)],
        [w / 2 + FW / 2, -(h / 2 + FW / 2)],
      ].map(([x, y], i) => (
        <mesh key={`orn-${i}`} position={[x, y, FD / 2 - 0.01]} material={M.goldBright}>
          <boxGeometry args={[0.17, 0.17, 0.07]} />
        </mesh>
      ))}
    </group>
  );
};

// ─── Picture light ───────────────────────────────────────────────────────────
/** Brass gallery lamp on a swan neck, with the spot light it appears to cast. */
const PictureLight = ({ width, topY }: { width: number; topY: number }) => {
  const target = useMemo(() => new THREE.Object3D(), []);

  return (
    <group>
      {/* Arm off the wall */}
      <mesh position={[0, topY + 0.34, -0.1]} material={M.brass}>
        <boxGeometry args={[0.05, 0.42, 0.05]} />
      </mesh>
      <mesh position={[0, topY + 0.55, 0.12]} rotation={[Math.PI / 2.6, 0, 0]} material={M.brass}>
        <cylinderGeometry args={[0.028, 0.028, 0.5, 10]} />
      </mesh>
      {/* Shade */}
      <mesh position={[0, topY + 0.62, 0.34]} rotation={[0.42, 0, 0]} material={M.brassShade}>
        <cylinderGeometry args={[0.1, 0.13, Math.min(width * 0.72, 1.5), 14, 1, false, 0, Math.PI]} />
      </mesh>
      {/* Bulb read: a dim strip tucked inside the shade, not a glowing sleeve */}
      <mesh position={[0, topY + 0.56, 0.355]} rotation={[0.42, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.05, Math.min(width * 0.6, 1.25), 10, 1, true]} />
        <meshBasicMaterial color="#ffcb8a" transparent opacity={0.34} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      {/* The actual light. Shadows are off — six of these with shadow maps would
          cost more than they add in a corridor this dark. */}
      <primitive object={target} position={[0, -0.25, 0]} />
      <spotLight
        position={[0, topY + 0.52, 0.56]}
        target={target}
        angle={0.85}
        penumbra={0.7}
        intensity={58}
        distance={13}
        decay={1.5}
        color="#ffd9ab"
      />
    </group>
  );
};

// ─── Painting ────────────────────────────────────────────────────────────────
const PaintingMesh = ({
  painting,
  position,
  rotation,
}: {
  painting: Painting;
  position: [number, number, number];
  rotation: [number, number, number];
}) => {
  const canvasRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const scaleRef = useRef(1);
  const emissiveVal = useRef(0);
  const hoveredRef = useRef(false);
  const paintingZ = position[2];

  const h = CANVAS_HEIGHT;
  const w = CANVAS_HEIGHT * aspectOf(painting);

  const placard = useMemo(() => placardTexture(painting), [painting]);

  const [texture, setTexture] = useState<THREE.Texture | undefined>(
    () => preloadedTextures[painting.imageUrl],
  );

  useEffect(() => {
    const cached = preloadedTextures[painting.imageUrl];
    if (cached) {
      setTexture(cached);
      return;
    }
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(
      painting.imageUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        preloadedTextures[painting.imageUrl] = tex;
        setTexture(tex);
      },
      undefined,
      () => {
        console.warn(`[Artifacts] Failed to load: ${painting.imageUrl}`);
        setTexture(FALLBACK_TEXTURE);
      },
    );
  }, [painting.imageUrl]);

  useFrame(({ camera }) => {
    if (canvasRef.current) {
      const target = hoveredRef.current ? 1.045 : 1;
      scaleRef.current += (target - scaleRef.current) * 0.12;
      canvasRef.current.scale.setScalar(scaleRef.current);
    }

    // The spot light does the real work up close; this keeps the art faintly
    // legible further down the corridor so it draws you forward.
    if (matRef.current) {
      const dist = Math.abs(camera.position.z - paintingZ);
      const proximity = Math.max(0, 1 - Math.max(0, dist - 5) / 14);
      const target = proximity * proximity * 0.5;
      const speed = target > emissiveVal.current ? 0.08 : 0.04;
      emissiveVal.current += (target - emissiveVal.current) * speed;
      matRef.current.emissiveIntensity = emissiveVal.current;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <Alcove w={w + 1.15} h={h + 1.5} />
      <Frame w={w} h={h} />

      <mesh
        ref={canvasRef}
        position={[0, 0, 0.055]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (emissiveVal.current < 0.06) return; // ignore art still lost in the fog
          hoveredRef.current = true;
          document.body.style.cursor = 'pointer';
          window.dispatchEvent(new CustomEvent('artifacts:hover', { detail: { painting } }));
        }}
        onPointerOut={() => {
          hoveredRef.current = false;
          document.body.style.cursor = 'auto';
          window.dispatchEvent(new CustomEvent('artifacts:hover', { detail: { painting: null } }));
        }}
      >
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          ref={matRef}
          color="#ffffff"
          map={texture}
          emissive={EMISSIVE_WHITE}
          emissiveMap={texture}
          emissiveIntensity={0}
          roughness={0.82}
        />
      </mesh>

      <PictureLight width={w} topY={h / 2 + 0.18} />

      {/* Brass placard below the frame */}
      <group position={[0, -(h / 2 + 0.62), 0.03]}>
        <mesh material={M.brass}>
          <boxGeometry args={[0.92, 0.23, 0.025]} />
        </mesh>
        <mesh position={[0, 0, 0.015]}>
          <planeGeometry args={[0.88, 0.2]} />
          <meshStandardMaterial map={placard} roughness={0.42} metalness={0.55} />
        </mesh>
      </group>
    </group>
  );
};

// ─── Architecture ────────────────────────────────────────────────────────────
/**
 * One draw call for a repeated box. The pilasters and ceiling coffers were 114
 * individual meshes between them, which dominated the frame's draw-call count —
 * and every one of them was drawn twice, once for the floor's reflection pass.
 */
const InstancedBoxes = ({
  size,
  material,
  positions,
}: {
  size: [number, number, number];
  material: THREE.Material;
  positions: [number, number, number][];
}) => {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    positions.forEach((pos, i) => {
      dummy.position.set(pos[0], pos[1], pos[2]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, positions.length]}
      material={material}
      frustumCulled={false}
    >
      <boxGeometry args={size} />
    </instancedMesh>
  );
};

const Architecture = memo(() => {
  const bays = useMemo(
    () => Array.from({ length: Math.ceil(CORRIDOR_LENGTH / BAY) + 1 }, (_, k) => CORRIDOR_START - 6.5 - k * BAY),
    [],
  );
  const coffers = useMemo(
    () => Array.from({ length: Math.ceil(CORRIDOR_LENGTH / 5.5) }, (_, k) => CORRIDOR_START - k * 5.5),
    [],
  );
  const midZ = CORRIDOR_START - CORRIDOR_LENGTH / 2;

  const pilasterShafts = useMemo(
    () => bays.flatMap((z) => [-1, 1].map((side) => [side * (HALF_WIDTH - 0.18), HEIGHT / 2 - 0.3, z] as [number, number, number])),
    [bays],
  );
  const pilasterCaps = useMemo(
    () => bays.flatMap((z) => [-1, 1].map((side) => [side * (HALF_WIDTH - 0.22), HEIGHT - 0.75, z] as [number, number, number])),
    [bays],
  );
  const pilasterBases = useMemo(
    () => bays.flatMap((z) => [-1, 1].map((side) => [side * (HALF_WIDTH - 0.22), 0.34, z] as [number, number, number])),
    [bays],
  );
  const cofferBeams = useMemo(
    () => coffers.map((z) => [0, HEIGHT - 0.16, z] as [number, number, number]),
    [coffers],
  );
  const cofferPanels = useMemo(
    () => coffers.filter((_, k) => k % 2 === 0).map((z) => [0, HEIGHT - 0.07, z - 2.75] as [number, number, number]),
    [coffers],
  );

  return (
    <group>
      {/* ── Walls ── */}
      {[-1, 1].map((side) => (
        <mesh
          key={`wall-${side}`}
          position={[side * HALF_WIDTH, HEIGHT / 2, midZ]}
          rotation={[0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
          material={M.wall}
          receiveShadow
        >
          <planeGeometry args={[CORRIDOR_LENGTH, HEIGHT]} />
        </mesh>
      ))}

      {/* ── Pilasters, cornice and skirting ── */}
      <InstancedBoxes size={[0.36, HEIGHT - 0.6, 0.62]} material={M.stone} positions={pilasterShafts} />
      <InstancedBoxes size={[0.44, 0.22, 0.82]} material={M.stone} positions={pilasterCaps} />
      <InstancedBoxes size={[0.44, 0.3, 0.82]} material={M.stone} positions={pilasterBases} />

      {[-1, 1].map((side) => (
        <group key={`trim-${side}`}>
          {/* Cornice */}
          <mesh position={[side * (HALF_WIDTH - 0.3), HEIGHT - 0.42, midZ]} material={M.stone}>
            <boxGeometry args={[0.6, 0.34, CORRIDOR_LENGTH]} />
          </mesh>
          <mesh position={[side * (HALF_WIDTH - 0.46), HEIGHT - 0.68, midZ]} material={M.stoneDark}>
            <boxGeometry args={[0.28, 0.18, CORRIDOR_LENGTH]} />
          </mesh>
          {/* Skirting */}
          <mesh position={[side * (HALF_WIDTH - 0.12), 0.17, midZ]} material={M.stone}>
            <boxGeometry args={[0.24, 0.34, CORRIDOR_LENGTH]} />
          </mesh>
        </group>
      ))}

      {/* ── Ceiling and coffers ── */}
      <mesh
        position={[0, HEIGHT, midZ]}
        rotation={[Math.PI / 2, 0, 0]}
        material={M.ceiling}
      >
        <planeGeometry args={[HALF_WIDTH * 2, CORRIDOR_LENGTH]} />
      </mesh>
      <InstancedBoxes size={[HALF_WIDTH * 2, 0.32, 0.4]} material={M.stoneDark} positions={cofferBeams} />
      {/* Every other bay gets a soft overhead panel */}
      <InstancedBoxes size={[2.4, 0.04, 3.6]} material={M.skylight} positions={cofferPanels} />
      {/* Longitudinal ceiling ribs */}
      {[-2.4, 2.4].map((x) => (
        <mesh key={`rib-${x}`} position={[x, HEIGHT - 0.14, midZ]} material={M.stoneDark}>
          <boxGeometry args={[0.3, 0.28, CORRIDOR_LENGTH]} />
        </mesh>
      ))}

      {/* ── Floor: polished stone, with a runner down the middle ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, midZ]} receiveShadow>
        <planeGeometry args={[HALF_WIDTH * 2, CORRIDOR_LENGTH]} />
        <MeshReflectorMaterial
          resolution={256}
          blur={[160, 50]}
          mixBlur={1}
          mixStrength={26}
          depthScale={1.1}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.3}
          color="#120d0f"
          roughness={0.5}
          metalness={0.62}
          mirror={0.62}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, midZ]} material={M.carpet} receiveShadow>
        <planeGeometry args={[3.1, CORRIDOR_LENGTH]} />
      </mesh>
      {[-1.63, 1.63].map((x) => (
        <mesh key={`runner-edge-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, midZ]} material={M.goldDark}>
          <planeGeometry args={[0.07, CORRIDOR_LENGTH]} />
        </mesh>
      ))}

      {/* ── Benches ── */}
      {[-26, -48, -70].map((z) => (
        <group key={`bench-${z}`} position={[0, 0, z]}>
          <mesh position={[0, 0.46, 0]} material={M.leather} castShadow>
            <boxGeometry args={[1.15, 0.16, 2.3]} />
          </mesh>
          <mesh position={[0, 0.24, 0]} material={M.chrome}>
            <boxGeometry args={[0.16, 0.3, 1.9]} />
          </mesh>
          {[-0.9, 0.9].map((bz) => (
            <mesh key={bz} position={[0, 0.06, bz]} material={M.chrome}>
              <boxGeometry args={[0.9, 0.12, 0.14]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── Far archway: the corridor reads as continuing past the last work ── */}
      <pointLight
        position={[0, 2.6, CORRIDOR_START - CORRIDOR_LENGTH + 19]}
        intensity={30}
        distance={30}
        decay={1.6}
        color="#ffbf80"
      />
      <group position={[0, 0, CORRIDOR_START - CORRIDOR_LENGTH + 14]}>
        <mesh position={[0, HEIGHT / 2 - 0.4, 0]} material={M.stone}>
          <ringGeometry args={[2.9, 3.5, 32, 1, 0, Math.PI]} />
        </mesh>
        {[-3.2, 3.2].map((x) => (
          <mesh key={x} position={[x, (HEIGHT / 2 - 0.4) / 2, 0]} material={M.stone}>
            <boxGeometry args={[0.6, HEIGHT / 2 - 0.4, 0.5]} />
          </mesh>
        ))}
      </group>
    </group>
  );
});
Architecture.displayName = 'Architecture';

// ─── Dust ────────────────────────────────────────────────────────────────────
const Dust = () => {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const n = 420;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * HALF_WIDTH * 2;
      arr[i * 3 + 1] = Math.random() * HEIGHT;
      arr[i * 3 + 2] = CORRIDOR_START - Math.random() * CORRIDOR_LENGTH;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const arr = (ref.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    for (let i = 1; i < arr.length; i += 3) {
      arr[i] += delta * 0.055;
      if (arr[i] > HEIGHT) arr[i] = 0.2;
    }
    (ref.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <pointsMaterial size={0.028} color="#ffe6c4" transparent opacity={0.42} sizeAttenuation depthWrite={false} />
    </points>
  );
};

// ─── Scene ───────────────────────────────────────────────────────────────────
const ArtifactsScene = () => {
  const scroll = useScroll();
  const frameCount = useRef(0);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const smoothedLookX = useRef(0);

  const artworks = useMemo(
    () =>
      PAINTINGS.map((painting, i) => {
        const side = PAINTING_SIDE(i);
        return {
          painting,
          side,
          z: PAINTING_Z(i),
          position: [side * (HALF_WIDTH - 0.12), HANG_Y, PAINTING_Z(i)] as [number, number, number],
          // Turned a few degrees off the wall so the canvas is readable while
          // walking past, without losing the flush-hung gallery look.
          rotation: [0, side < 0 ? Math.PI / 2 - 0.16 : -Math.PI / 2 + 0.16, 0] as [number, number, number],
        };
      }),
    [],
  );

  useFrame(({ camera }, delta) => {
    if (!scroll) return;
    const t = scroll.offset;
    const z = -t * TRAVEL;

    // Gentle walking sway and bob rather than a dead-straight dolly.
    const walk = t * TRAVEL;
    camera.position.z = z;
    camera.position.x = Math.sin(walk * 0.09) * 0.42;
    camera.position.y = EYE + Math.sin(walk * 1.7) * 0.012;

    // Drift the gaze toward whichever canvas you are nearest, so the camera
    // "turns to look" on the way past instead of staring down the corridor.
    let nearestX = 0;
    let bestWeight = 0;
    for (const art of artworks) {
      const d = Math.abs(z - art.z);
      const weight = Math.max(0, 1 - d / 7);
      if (weight > bestWeight) {
        bestWeight = weight;
        nearestX = art.side * HALF_WIDTH;
      }
    }
    const desiredLookX = camera.position.x * 0.3 + nearestX * bestWeight * 0.5;
    smoothedLookX.current += (desiredLookX - smoothedLookX.current) * Math.min(1, delta * 3.2);

    lookTarget.set(smoothedLookX.current, HANG_Y - 0.5 + bestWeight * 0.3, z - 9);
    camera.lookAt(lookTarget);

    frameCount.current++;
    if (frameCount.current % 3 === 0) {
      window.dispatchEvent(new CustomEvent('artifacts:scroll', { detail: { offset: t } }));
    }
  });

  return (
    <group>
      <color attach="background" args={['#0b0507']} />
      <fog attach="fog" args={['#0d0608', 7, 46]} />

      {/* Deliberately dim: the picture lights are meant to be the only real
          sources, which is what gives a gallery its pools of light. */}
      <ambientLight intensity={0.34} color="#ffe2c0" />
      <hemisphereLight args={['#4a373c', '#0b0709', 0.5]} />
      {/* Sparse warm fill down the length of the corridor so the walls and floor
          read between the picture lights, without flattening the pools. */}
      {[-20, -62].map((z) => (
        <pointLight key={z} position={[0, HEIGHT - 1.1, z]} intensity={26} distance={44} decay={1.4} color="#ffc98f" />
      ))}

      <Architecture />

      {artworks.map((art, i) => (
        <PaintingMesh
          key={i}
          painting={art.painting}
          position={art.position}
          rotation={art.rotation}
        />
      ))}

      <Dust />
    </group>
  );
};

// ─── Wrapper ───────────────────────────────────────────────────────────────────
const ArtifactsSceneWrapper = () => (
  <Suspense fallback={null}>
    <ScrollControls pages={6} damping={0.28}>
      <ArtifactsScene />
    </ScrollControls>
  </Suspense>
);

export default ArtifactsSceneWrapper;
