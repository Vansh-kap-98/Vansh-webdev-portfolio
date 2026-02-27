import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, ScrollControls } from '@react-three/drei';
import * as THREE from 'three';

// ─── Painting Data ─────────────────────────────────────────────────────────────
export const PAINTINGS = [
  {
    name: 'Starry Night',
    artist: 'Vincent van Gogh',
    description: 'A swirling night sky over a sleeping village, painted from memory by Van Gogh during his voluntary internment at the Saint-Paul-de-Mausole asylum.',
    datePainted: 'June 1889',
    cost: '$82,000,000',
    dimensions: '73.7 × 92.1 cm',
    medium: 'Oil on canvas',
    location: 'MoMA, New York City',
    copiesAvailable: 0,
    imageUrl: 'https://picsum.photos/seed/starry/800/600',
    accent: '#3b82f6',
  },
  {
    name: 'The Night Watch',
    artist: 'Rembrandt van Rijn',
    description: "Rembrandt's monumental masterpiece depicts Captain Frans Banninck Cocq leading his civic militia.",
    datePainted: '1642',
    cost: '$900,000,000',
    dimensions: '363 × 437 cm',
    medium: 'Oil on canvas',
    location: 'Rijksmuseum, Amsterdam',
    copiesAvailable: 0,
    imageUrl: 'https://picsum.photos/seed/nightwatch/800/960',
    accent: '#f59e0b',
  },
  {
    name: 'Girl with a Pearl Earring',
    artist: 'Johannes Vermeer',
    description: 'Called the "Mona Lisa of the North", this work is classified as a tronie — a study of an anonymous subject.',
    datePainted: 'c. 1665',
    cost: '$59,000,000',
    dimensions: '44.5 × 39 cm',
    medium: 'Oil on canvas',
    location: 'Mauritshuis, The Hague',
    copiesAvailable: 0,
    imageUrl: 'https://picsum.photos/seed/pearl/800/1000',
    accent: '#22d3ee',
  },
  {
    name: 'The Great Wave',
    artist: 'Katsushika Hokusai',
    description: "Part of Hokusai's series Thirty-six Views of Mount Fuji, this woodblock print captures a colossal wave.",
    datePainted: 'c. 1831',
    cost: '$2,760,000',
    dimensions: '25.7 × 37.9 cm',
    medium: 'Woodblock print (ukiyo-e)',
    location: 'Metropolitan Museum of Art, NY',
    copiesAvailable: 100,
    imageUrl: 'https://picsum.photos/seed/wave/1000/700',
    accent: '#6366f1',
  },
  {
    name: 'The Persistence of Memory',
    artist: 'Salvador Dalí',
    description: "Dalí's surrealist masterpiece explores the fluidity of time.",
    datePainted: '1931',
    cost: '$70,000,000',
    dimensions: '24 × 33 cm',
    medium: 'Oil on canvas',
    location: 'MoMA, New York City',
    copiesAvailable: 0,
    imageUrl: 'https://picsum.photos/seed/dali/800/600',
    accent: '#f97316',
  },
  {
    name: 'Wanderer Above the Sea of Fog',
    artist: 'Caspar David Friedrich',
    description: "Friedrich's quintessential Romantic painting shows a man standing on a rocky precipice.",
    datePainted: 'c. 1818',
    cost: '$2,600,000',
    dimensions: '94.8 × 74.8 cm',
    medium: 'Oil on canvas',
    location: 'Kunsthalle Hamburg, Germany',
    copiesAvailable: 0,
    imageUrl: 'https://picsum.photos/seed/fog/800/1000',
    accent: '#a3e635',
  },
];

export type Painting = typeof PAINTINGS[number];

const TUNNEL_LENGTH = 80;

// Pre-load all textures at module level — no Suspense needed
const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = 'anonymous';
const preloadedTextures: Record<string, THREE.Texture> = {};

// Tiny 1×1 grey canvas used as fallback when an image URL fails
const fallbackCanvas = document.createElement('canvas');
fallbackCanvas.width = fallbackCanvas.height = 1;
const fallbackCtx = fallbackCanvas.getContext('2d')!;
fallbackCtx.fillStyle = '#3a3030';
fallbackCtx.fillRect(0, 0, 1, 1);
const FALLBACK_TEXTURE = new THREE.CanvasTexture(fallbackCanvas);

PAINTINGS.forEach((p) => {
  // Store the texture reference IMMEDIATELY — Three.js textures are live objects.
  // The material holds this reference and Three.js auto-updates when the image
  // data arrives (sets texture.needsUpdate = true internally).
  // If we only stored it in the onLoad callback, fast-rendering meshes like the
  // first painting would read undefined and never re-render when it resolves.
  const tex = textureLoader.load(
    p.imageUrl,
    (loadedTex) => {
      loadedTex.colorSpace = THREE.SRGBColorSpace;
    },
    undefined,
    () => {
      // On failure, swap this texture's image to the fallback canvas
      console.warn(`[Artifacts] Failed to load: ${p.imageUrl}`);
      tex.image = fallbackCanvas as unknown as HTMLImageElement;
      tex.needsUpdate = true;
    }
  );
  preloadedTextures[p.imageUrl] = tex;
});

// ─── Materials ─────────────────────────────────────────────────────────────
const goldFrameMaterialOuter = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#94712b'), // Richer gold
  metalness: 0.9,
  roughness: 0.2, // Smoother for better highlights
  envMapIntensity: 1.5,
});

const goldFrameMaterialInner = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#3d2b00'),
  metalness: 0.6,
  roughness: 0.5,
});

const goldFrameMaterialDetail = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#b58e3d'), // Brighter detail gold
  metalness: 1.0,
  roughness: 0.1,
});

// Reusable white color for emissive tint
const EMISSIVE_WHITE = new THREE.Color(1, 1, 1);

// ─── Ornate Frame Sub-component ──────────────────────────────────────────────────
const OrnateFrame = () => {
  return (
    <group>
      {/* 1. Outer Tier (Deepest) */}
      <mesh material={goldFrameMaterialOuter}>
        <boxGeometry args={[2.6, 2.05, 0.12]} />
      </mesh>

      {/* 2. Middle "Cove" Molding */}
      <mesh position={[0, 0, 0.04]} material={goldFrameMaterialInner}>
        <boxGeometry args={[2.3, 1.75, 0.08]} />
      </mesh>

      {/* 3. Sub-tier detail */}
      <mesh position={[0, 0, 0.06]} material={goldFrameMaterialDetail}>
        <boxGeometry args={[2.35, 1.8, 0.02]} />
      </mesh>

      {/* 4. Inner Fillet (Adjacent to canvas) */}
      <mesh position={[0, 0, 0.08]} material={goldFrameMaterialOuter}>
        <boxGeometry args={[2.1, 1.58, 0.04]} />
      </mesh>

      {/* Decorative Corner Ornaments */}
      {[
        [-1.2, 0.925], [1.2, 0.925], [-1.2, -0.925], [1.2, -0.925]
      ].map(([x, y], i) => (
        <mesh key={i} position={[x as number, y as number, 0.08]} material={goldFrameMaterialDetail}>
          <boxGeometry args={[0.2, 0.25, 0.05]} />
        </mesh>
      ))}
    </group>
  );
};


// ─── Painting Mesh ────────────────────────────────────────────────────────────────
const PaintingMesh = ({
  painting,
  position,
  rotation,
}: {
  painting: Painting;
  position: [number, number, number];
  rotation: [number, number, number];
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const scaleRef = useRef(1);
  const emissiveVal = useRef(0);
  const hoveredRef = useRef(false);
  const paintingZ = position[2];

  // ── Texture with React state so re-render fires when image arrives ──
  const [texture, setTexture] = useState<THREE.Texture | undefined>(
    () => preloadedTextures[painting.imageUrl]  // instant if already cached
  );

  useEffect(() => {
    const cached = preloadedTextures[painting.imageUrl];
    if (cached) {
      setTexture(cached);
      return;
    }
    // Not cached yet — load and update state when done
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(
      painting.imageUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        preloadedTextures[painting.imageUrl] = tex; // cache for reuse
        setTexture(tex);
      },
      undefined,
      () => {
        console.warn(`[Artifacts] Failed to load: ${painting.imageUrl}`);
        setTexture(FALLBACK_TEXTURE);
      }
    );
  }, [painting.imageUrl]);

  useFrame(({ camera }) => {
    // Scale lerp on hover
    if (meshRef.current) {
      const scaleTarget = hoveredRef.current ? 1.1 : 1.0;
      scaleRef.current += (scaleTarget - scaleRef.current) * 0.1;
      meshRef.current.scale.setScalar(scaleRef.current);
    }

    // Emissive proximity: painting glows evenly with no glare
    if (matRef.current) {
      const dist = Math.abs(camera.position.z - paintingZ);
      // Full glow ≤4 units away, fades out by 14 units
      const proximity = Math.max(0, 1 - Math.max(0, dist - 4) / 10);
      const target = proximity * proximity * 0.72;  // 0 → 0.72 quadratic
      const speed = target > emissiveVal.current ? 0.08 : 0.04;
      emissiveVal.current += (target - emissiveVal.current) * speed;
      matRef.current.emissiveIntensity = emissiveVal.current;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Ornate Layered Frame */}
      <OrnateFrame />

      {/* Painting canvas — emissiveMap makes the whole surface glow uniformly */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0.11]}
        onPointerOver={(e) => {
          e.stopPropagation();
          // Only show hover when the painting is visibly lit up
          if (emissiveVal.current < 0.08) return;
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
        <planeGeometry args={[2.0, 1.5]} />
        <meshStandardMaterial
          ref={matRef}
          color="#000000"
          map={texture}
          emissive={EMISSIVE_WHITE}
          emissiveMap={texture}
          emissiveIntensity={0}
          roughness={0.85}
        />
      </mesh>
      {/* Wall-mount bar */}
      <mesh position={[0, -1.02, -0.02]}>
        <boxGeometry args={[0.5, 0.05, 0.05]} />
        <meshStandardMaterial color="#1a1000" metalness={0.3} roughness={0.8} />
      </mesh>
    </group>
  );
};

// ─── Main Scene ────────────────────────────────────────────────────────────────
const ArtifactsScene = () => {
  const scroll = useScroll();
  const frameCount = useRef(0);

  const artworks = useMemo(() =>
    PAINTINGS.map((painting, i) => {
      const t = i / (PAINTINGS.length - 1);
      const side = i % 2 === 0 ? -3.1 : 3.1;
      return {
        painting,
        position: [side, 1.65, -t * TUNNEL_LENGTH] as [number, number, number],
        rotation: [0, side > 0 ? -Math.PI / 9 : Math.PI / 9, 0] as [number, number, number],
      };
    }),
    []);

  useFrame(({ camera }) => {
    if (!scroll) return;
    const t = scroll.offset;
    camera.position.z = -t * TUNNEL_LENGTH * 0.92;
    camera.position.y = 1.65;
    camera.position.x = Math.sin(t * Math.PI * 2) * 0.2;
    camera.lookAt(camera.position.x * 0.3, 1.65, camera.position.z - 10);

    frameCount.current++;
    if (frameCount.current % 3 === 0) {
      window.dispatchEvent(new CustomEvent('artifacts:scroll', { detail: { offset: t } }));
    }
  });

  return (
    <group>
      <fog attach="fog" args={['#0e0508', 5, 36]} />

      {/* Base ambient — paintings self-illuminate via emissive, walls just need fill */}
      <ambientLight intensity={0.2} color="#ffe8cc" />
      {/* Warm overhead fill */}
      <directionalLight position={[0, 8, 0]} intensity={0.35} color="#ffd6a0" />
      {/* Cool front rim */}
      <directionalLight position={[0, 2, 10]} intensity={0.12} color="#c8d8ff" />
      {/* Mid-tunnel path light */}
      <pointLight position={[0, 2, -TUNNEL_LENGTH / 2]} intensity={0.5} distance={60} color="#ff9944" decay={1} />

      {/* ── Louvre-like walls: deep burgundy/wine ── */}
      <mesh position={[-4.5, 2, -TUNNEL_LENGTH / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[TUNNEL_LENGTH, 6]} />
        <meshStandardMaterial color="#1c0a0d" roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[4.5, 2, -TUNNEL_LENGTH / 2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[TUNNEL_LENGTH, 6]} />
        <meshStandardMaterial color="#1c0a0d" roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      {/* Dark marble floor */}
      <mesh position={[0, -0.01, -TUNNEL_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, TUNNEL_LENGTH]} />
        <meshStandardMaterial color="#0d0608" roughness={0.2} metalness={0.4} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 5.01, -TUNNEL_LENGTH / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, TUNNEL_LENGTH]} />
        <meshStandardMaterial color="#0a0305" roughness={0.95} />
      </mesh>


      {artworks.map((art, i) => (
        <PaintingMesh
          key={i}
          painting={art.painting}
          position={art.position}
          rotation={art.rotation}
        />
      ))}
    </group>
  );
};

// ─── Wrapper ───────────────────────────────────────────────────────────────────
const ArtifactsSceneWrapper = () => (
  <Suspense fallback={null}>
    <ScrollControls pages={4} damping={0.3}>
      <ArtifactsScene />
    </ScrollControls>
  </Suspense>
);

export default ArtifactsSceneWrapper;
