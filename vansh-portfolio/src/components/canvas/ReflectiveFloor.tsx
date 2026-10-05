import { MeshReflectorMaterial } from '@react-three/drei';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';

interface ReflectiveFloorProps {
  size: [number, number];
  position?: [number, number, number];
  color: string;
  roughness?: number;
  metalness?: number;
  mirror?: number;
  mixStrength?: number;
  blur?: [number, number];
  resolution?: number;
  receiveShadow?: boolean;
}

/**
 * A mirrored floor on capable devices, a plain one everywhere else.
 *
 * `MeshReflectorMaterial` renders the entire scene a second time into a render
 * target and then runs a multi-pass blur over it — every frame. That is the most
 * expensive single thing in these scenes, and on a phone it reliably halves the
 * frame rate for a reflection most people never look at. On mobile and under
 * reduced-motion we fall back to a slightly glossier standard material, which
 * keeps the floor from reading as flat black without the second pass.
 */
const ReflectiveFloor = ({
  size,
  position = [0, 0, 0],
  color,
  roughness = 0.8,
  metalness = 0.5,
  mirror = 0.5,
  mixStrength = 28,
  blur = [160, 50],
  resolution = 256,
  receiveShadow = true,
}: ReflectiveFloorProps) => {
  const { lite } = useDeviceProfile();

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow={receiveShadow}>
      <planeGeometry args={size} />
      {lite ? (
        <meshStandardMaterial color={color} roughness={Math.min(0.95, roughness + 0.1)} metalness={metalness * 0.6} />
      ) : (
        <MeshReflectorMaterial
          resolution={resolution}
          blur={blur}
          mixBlur={1}
          mixStrength={mixStrength}
          depthScale={1.1}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.3}
          color={color}
          roughness={roughness}
          metalness={metalness}
          mirror={mirror}
        />
      )}
    </mesh>
  );
};

export default ReflectiveFloor;
