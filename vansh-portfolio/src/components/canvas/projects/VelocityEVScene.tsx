import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  ContactShadows,
  MeshReflectorMaterial,
  Float,
  RoundedBox
} from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

interface VelocityEVSceneProps {
  color: string;
  cameraMode: 'exterior' | 'interior';
  modelType: string;
}

const VelocityEVScene = ({ color, cameraMode, modelType }: VelocityEVSceneProps) => {
  const { camera } = useThree();
  const carGroupRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group>(null);

  const [displayModel, setDisplayModel] = useState(modelType);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const cameraPositions = {
    exterior: { position: [7, 3, 7], target: [0, 0.5, 0] },
    interior: { position: [0.2, 0.9, 0.2], target: [1.5, 0.8, 0] },
  };

  const transitionTimeline = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (modelType !== displayModel) {
      // Kill any existing transition to prevent overlapping animations
      if (transitionTimeline.current) transitionTimeline.current.kill();

      setIsTransitioning(true);

      const timeline = gsap.timeline({
        onComplete: () => {
          // Switch the model architecture
          setDisplayModel(modelType);

          if (carGroupRef.current) {
            // Immediately set the new model's correct height and entry position
            const newBaseHeight = modelType === 'suv' ? 0.23 : 0.1;
            carGroupRef.current.position.set(-15, newBaseHeight, 0);

            // Drive in the new model
            gsap.to(carGroupRef.current.position, {
              x: 0,
              duration: 1.2,
              ease: "power2.out",
              onComplete: () => setIsTransitioning(false)
            });
          }
        }
      });

      transitionTimeline.current = timeline;

      // Drive off the current model
      timeline.to(carGroupRef.current!.position, {
        x: 15,
        duration: 0.8,
        ease: "power2.in"
      });
    }

    return () => {
      if (transitionTimeline.current) transitionTimeline.current.kill();
    };
  }, [modelType, displayModel]);

  useEffect(() => {
    const target = cameraPositions[cameraMode];
    gsap.to(camera.position, {
      x: target.position[0],
      y: target.position[1],
      z: target.position[2],
      duration: 2,
      ease: 'power3.inOut',
    });

    const lookAtProxy = { x: 0, y: 0.5, z: 0 };
    gsap.to(lookAtProxy, {
      x: target.target[0],
      y: target.target[1],
      z: target.target[2],
      duration: 2,
      ease: 'power3.inOut',
      onUpdate: () => {
        camera.lookAt(lookAtProxy.x, lookAtProxy.y, lookAtProxy.z);
      }
    });
  }, [cameraMode, camera]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const spinSpeed = isTransitioning ? 25 : 2;

    if (wheelsRef.current) {
      const dt = state.clock.getDelta();
      wheelsRef.current.children.forEach((wheelPosGroup) => {
        const wheelContent = wheelPosGroup.children[0] as THREE.Group;
        if (wheelContent) {
          wheelContent.rotation.z += dt * spinSpeed;
        }
      });
    }

    // Subtle drift
    if (carGroupRef.current && !isTransitioning) {
      const baseHeight = displayModel === 'suv' ? 0.23 : 0.1;
      carGroupRef.current.position.y = Math.sin(t * 0.5) * 0.05 + baseHeight;
    }
  });

  return (
    <>
      <Environment preset="city" />

      <spotLight
        position={[10, 15, 10]}
        angle={0.15}
        penumbra={1}
        intensity={2}
        castShadow
        shadow-bias={-0.0001}
      />
      <pointLight position={[-10, 10, -10]} intensity={1} color={color} />

      <group ref={carGroupRef} position={[0, 0.1, 0]}>
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.25}>
          <group>
            {/* Main Body / Chassis */}
            <mesh castShadow receiveShadow position={[0, displayModel === 'suv' ? 0.5 : 0.4, 0]}>
              <RoundedBox
                args={[
                  displayModel === 'roadster' ? 4.5 : (displayModel === 'suv' ? 3.0 : 4),
                  displayModel === 'suv' ? 1.0 : 0.8,
                  displayModel === 'suv' ? 2.0 : 2
                ]}
                radius={displayModel === 'suv' ? 0.1 : 0.2}
                smoothness={10}
              >
                <meshStandardMaterial
                  color={color}
                  metalness={0.9}
                  roughness={0.05}
                  envMapIntensity={2}
                />
              </RoundedBox>
            </mesh>

            {/* SUV Specific: Hood Step */}
            {displayModel === 'suv' && (
              <mesh castShadow receiveShadow position={[1.5, 0.75, 0]}>
                <RoundedBox args={[1.2, 0.5, 1.8]} radius={0.15} smoothness={10}>
                  <meshStandardMaterial color={color} metalness={0.9} roughness={0.05} envMapIntensity={2} />
                </RoundedBox>
              </mesh>
            )}

            {/* SUV Specific: Fenders */}
            {displayModel === 'suv' && (
              <group>
                <mesh position={[1.4, 0.45, 1.0]}>
                  <boxGeometry args={[0.8, 0.1, 0.3]} />
                  <meshStandardMaterial color="#111" />
                </mesh>
                <mesh position={[1.4, 0.45, -1.0]}>
                  <boxGeometry args={[0.8, 0.1, 0.3]} />
                  <meshStandardMaterial color="#111" />
                </mesh>
                <mesh position={[-1.2, 0.45, 1.0]}>
                  <boxGeometry args={[0.8, 0.1, 0.3]} />
                  <meshStandardMaterial color="#111" />
                </mesh>
                <mesh position={[-1.2, 0.45, -1.0]}>
                  <boxGeometry args={[0.8, 0.1, 0.3]} />
                  <meshStandardMaterial color="#111" />
                </mesh>
                <mesh position={[2.1, 0.3, 0]}>
                  <RoundedBox args={[0.2, 0.3, 2.2]} radius={0.05}>
                    <meshStandardMaterial color="#111" />
                  </RoundedBox>
                </mesh>
              </group>
            )}

            {/* Greenhouse Section */}
            <group position={[displayModel === 'roadster' ? 0.5 : (displayModel === 'suv' ? -0.45 : 0), displayModel === 'suv' ? 1.45 : 0.8, 0]}>
              {/* Structural Cubicle Frame (SUV Only) */}
              {displayModel === 'suv' && (
                <mesh castShadow>
                  <RoundedBox
                    args={[2.18, 0.98, 1.88]}
                    radius={0.1}
                    smoothness={10}
                  >
                    <meshStandardMaterial
                      color={color}
                      metalness={1}
                      roughness={0.1}
                      wireframe
                    />
                  </RoundedBox>
                </mesh>
              )}

              {/* Glass Panels */}
              <mesh castShadow>
                <RoundedBox
                  args={[
                    displayModel === 'roadster' ? 2 : (displayModel === 'suv' ? 2.1 : 2.5),
                    displayModel === 'suv' ? 0.9 : 0.6,
                    displayModel === 'suv' ? 1.8 : 1.7
                  ]}
                  radius={displayModel === 'suv' ? 0.08 : 0.3}
                  smoothness={10}
                >
                  <meshStandardMaterial
                    color="#050505"
                    metalness={1}
                    roughness={0}
                    transparent
                    opacity={displayModel === 'suv' ? 0.4 : 0.9}
                  />
                </RoundedBox>
              </mesh>
            </group>

            {/* Lights */}
            <group position={[displayModel === 'roadster' ? 2.2 : 1.95, 0.4, 0]}>
              <mesh position={[0, 0, 0.7]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial emissive="#fff" emissiveIntensity={5} color="#fff" />
              </mesh>
              <mesh position={[0, 0, -0.7]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial emissive="#fff" emissiveIntensity={5} color="#fff" />
              </mesh>
            </group>

            <mesh position={[displayModel === 'roadster' ? -2.2 : -1.95, 0.4, 0]}>
              <boxGeometry args={[0.05, 0.1, 1.8]} />
              <meshStandardMaterial emissive="red" emissiveIntensity={2} color="red" />
            </mesh>

            {/* Wheels */}
            <group ref={wheelsRef}>
              {[
                [displayModel === 'suv' ? 1.2 : 1.4, 0.2, 1.1],
                [displayModel === 'suv' ? 1.2 : 1.4, 0.2, -1.1],
                [displayModel === 'suv' ? -1.2 : -1.4, 0.2, 1.1],
                [displayModel === 'suv' ? -1.2 : -1.4, 0.2, -1.1]
              ].map((pos, i) => (
                <group key={i} position={pos as [number, number, number]}>
                  <group>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                      <cylinderGeometry args={[displayModel === 'suv' ? 0.55 : 0.42, displayModel === 'suv' ? 0.55 : 0.42, displayModel === 'suv' ? 0.45 : 0.4, 64]} />
                      <meshStandardMaterial color="#020202" roughness={0.8} />
                    </mesh>
                    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, pos[2] > 0 ? 0.05 : -0.05]}>
                      <cylinderGeometry args={[0.1, 0.1, 0.12, 32]} />
                      <meshStandardMaterial color="#aaa" metalness={1} roughness={0.05} />
                    </mesh>
                    {[0, 1, 2, 3, 4].map((j) => (
                      <mesh key={j} rotation={[0, 0, (j * Math.PI * 2) / 5]} position={[0, 0, pos[2] > 0 ? 0.04 : -0.04]}>
                        <boxGeometry args={[0.04, displayModel === 'suv' ? 0.45 : 0.35, 0.02]} />
                        <meshStandardMaterial color="#666" metalness={1} roughness={0.2} />
                      </mesh>
                    ))}
                    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, pos[2] > 0 ? 0.06 : -0.06]}>
                      <torusGeometry args={[displayModel === 'suv' ? 0.4 : 0.3, 0.005, 16, 32]} />
                      <meshStandardMaterial emissive={color} emissiveIntensity={1} color={color} />
                    </mesh>
                  </group>
                </group>
              ))}
            </group>

            {/* SUV Specific Spare Tire */}
            {displayModel === 'suv' && (
              <group position={[-1.7, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
                  <meshStandardMaterial color="#050505" roughness={0.9} />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.05]}>
                  <cylinderGeometry args={[0.1, 0.1, 0.32, 16]} />
                  <meshStandardMaterial color="#333" metalness={1} roughness={0.1} />
                </mesh>
              </group>
            )}

            {/* Smudge Shadow */}
            <group position={[0, -0.4, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[displayModel === 'roadster' ? 5 : 4.5, 2.2]} />
                <meshBasicMaterial color="#000" transparent opacity={0.3} depthWrite={false} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <planeGeometry args={[displayModel === 'roadster' ? 6 : 5.5, 3]} />
                <meshBasicMaterial color="#000" transparent opacity={0.1} depthWrite={false} />
              </mesh>
            </group>
          </group>
        </Float>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={256}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#101010"
          metalness={0.5}
          mirror={0.5}
        />
      </mesh>
    </>
  );
};

export default VelocityEVScene;
