// ============================================================
// Her Universe — Space Stations System
// ============================================================
// Procedural futuristic space stations built from Three.js
// primitives: orbital research, rotating ring, and deep-space
// industrial types. All animate smoothly with tech lighting.
// ============================================================

import { useRef, useMemo, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { type StationConfig } from '../../data/stations';

// ── Shared Materials ────────────────────────────────────────────

function useStationMaterials(techColor: string, engineColor: string) {
  return useMemo(() => ({
    hull: new THREE.MeshStandardMaterial({
      color: '#828896',
      roughness: 0.45,
      metalness: 0.75,
      emissive: '#282c38',
      emissiveIntensity: 0.45,
    }),
    panel: new THREE.MeshStandardMaterial({
      color: '#5c6475',
      roughness: 0.35,
      metalness: 0.85,
      emissive: '#1c202c',
      emissiveIntensity: 0.35,
    }),
    tech: new THREE.MeshStandardMaterial({
      color: techColor,
      roughness: 0.2,
      metalness: 0.1,
      emissive: techColor,
      emissiveIntensity: 2.2,
      transparent: true,
      opacity: 0.95,
    }),
    engine: new THREE.MeshStandardMaterial({
      color: engineColor,
      roughness: 0.2,
      metalness: 0.1,
      emissive: engineColor,
      emissiveIntensity: 2.8,
    }),
    solar: new THREE.MeshStandardMaterial({
      color: '#e69926',
      roughness: 0.25,
      metalness: 0.65,
      emissive: '#ffaa22',
      emissiveIntensity: 1.2,
    }),
    truss: new THREE.MeshStandardMaterial({
      color: '#8890a0',
      roughness: 0.5,
      metalness: 0.85,
      emissive: '#202430',
      emissiveIntensity: 0.3,
    }),
  }), [techColor, engineColor]);
}

// ── Orbital Research Station ────────────────────────────────────

function OrbitalResearchStation({ materials, time }: {
  materials: ReturnType<typeof useStationMaterials>;
  time: number;
}) {
  const solarAngle = Math.sin(time * 0.15) * 0.2;

  return (
    <group>
      {/* Central command module */}
      <mesh material={materials.hull}>
        <cylinderGeometry args={[0.6, 0.6, 2.0, 8]} />
      </mesh>

      {/* Tech windows on command module */}
      {[0, 1, 2, 3].map(i => (
        <mesh key={`w${i}`} position={[Math.cos(i * Math.PI / 2) * 0.61, 0, Math.sin(i * Math.PI / 2) * 0.61]}
              rotation={[0, -i * Math.PI / 2, 0]} material={materials.tech}>
          <boxGeometry args={[0.02, 0.3, 0.25]} />
        </mesh>
      ))}

      {/* Forward docking port */}
      <mesh position={[0, 1.2, 0]} material={materials.hull}>
        <cylinderGeometry args={[0.3, 0.4, 0.4, 6]} />
      </mesh>

      {/* Rear engine section */}
      <mesh position={[0, -1.3, 0]} material={materials.panel}>
        <cylinderGeometry args={[0.5, 0.35, 0.6, 8]} />
      </mesh>
      <mesh position={[0, -1.7, 0]} material={materials.engine}>
        <cylinderGeometry args={[0.25, 0.15, 0.2, 6]} />
      </mesh>

      {/* Main trusses — cross shape */}
      {[0, Math.PI / 2].map((rot, i) => (
        <group key={`truss-${i}`} rotation={[0, rot, 0]}>
          <mesh material={materials.truss}>
            <boxGeometry args={[6.0, 0.08, 0.08]} />
          </mesh>
          {/* Solar panels on each end */}
          {[-1, 1].map(side => (
            <group key={`solar-${side}`} position={[side * 2.8, 0, 0]} rotation={[solarAngle * side, 0, 0]}>
              <mesh material={materials.solar}>
                <boxGeometry args={[1.6, 0.02, 0.9]} />
              </mesh>
              {/* Panel grid lines */}
              {[0, 1, 2].map(j => (
                <mesh key={j} position={[0, 0.015, (j - 1) * 0.28]} material={materials.truss}>
                  <boxGeometry args={[1.58, 0.01, 0.02]} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}

      {/* Side modules */}
      {[0, 1, 2, 3].map(i => {
        const angle = (i * Math.PI / 2) + Math.PI / 4;
        return (
          <group key={`mod-${i}`} position={[Math.cos(angle) * 1.6, 0, Math.sin(angle) * 1.6]}>
            <mesh material={materials.hull}>
              <boxGeometry args={[0.5, 0.8, 0.4]} />
            </mesh>
            <mesh position={[0, 0, 0.21]} material={materials.tech}>
              <boxGeometry args={[0.35, 0.2, 0.01]} />
            </mesh>
          </group>
        );
      })}

      {/* Communication antennas */}
      <group position={[0, 1.5, 0]}>
        <mesh material={materials.truss}>
          <cylinderGeometry args={[0.015, 0.015, 0.8, 4]} />
        </mesh>
        <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, time * 0.3]} material={materials.panel}>
          <cylinderGeometry args={[0.2, 0.02, 0.04, 8]} />
        </mesh>
      </group>

      {/* Navigation lights */}
      <pointLight position={[3.5, 0, 0]} color="#ff3333" intensity={0.5} distance={4} />
      <pointLight position={[-3.5, 0, 0]} color="#33ff33" intensity={0.5} distance={4} />
      <pointLight position={[0, -1.7, 0]} color={materials.engine.color} intensity={1.5} distance={5} />
    </group>
  );
}

// ── Rotating Ring Station ───────────────────────────────────────

function RotatingRingStation({ materials, time }: {
  materials: ReturnType<typeof useStationMaterials>;
  time: number;
}) {
  const ringRotation = time * 0.12;

  return (
    <group>
      {/* Central hub */}
      <mesh material={materials.hull}>
        <sphereGeometry args={[0.8, 12, 12]} />
      </mesh>

      {/* Hub tech panels */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const phi = (i / 6) * Math.PI * 2;
        return (
          <mesh key={`hp${i}`}
                position={[Math.cos(phi) * 0.82, 0, Math.sin(phi) * 0.82]}
                rotation={[0, -phi, 0]}
                material={materials.tech}>
            <boxGeometry args={[0.02, 0.25, 0.2]} />
          </mesh>
        );
      })}

      {/* Outer rotating ring */}
      <group rotation={[0, ringRotation, 0]}>
        <mesh material={materials.panel}>
          <torusGeometry args={[3.5, 0.35, 8, 32]} />
        </mesh>

        {/* Ring segment detail markers */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          return (
            <mesh key={`seg${i}`}
                  position={[Math.cos(angle) * 3.5, 0, Math.sin(angle) * 3.5]}
                  rotation={[0, -angle + Math.PI / 2, 0]}
                  material={i % 4 === 0 ? materials.tech : materials.hull}>
              <boxGeometry args={[0.5, 0.38, 0.03]} />
            </mesh>
          );
        })}

        {/* Docking ports on ring */}
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
          <mesh key={`dock${i}`}
                position={[Math.cos(angle) * 3.9, 0, Math.sin(angle) * 3.9]}
                rotation={[0, -angle, 0]}
                material={materials.hull}>
            <boxGeometry args={[0.15, 0.25, 0.3]} />
          </mesh>
        ))}
      </group>

      {/* Structural spokes connecting hub to ring */}
      {[0, 1, 2, 3].map(i => {
        const angle = (i / 4) * Math.PI * 2 + ringRotation;
        return (
          <mesh key={`spoke${i}`}
                position={[Math.cos(angle) * 1.75, 0, Math.sin(angle) * 1.75]}
                rotation={[0, 0, Math.PI / 2]}>
            <mesh rotation={[0, angle, 0]} material={materials.truss}>
              <boxGeometry args={[2.5, 0.06, 0.06]} />
            </mesh>
          </mesh>
        );
      })}

      {/* Top/bottom hub extensions */}
      <mesh position={[0, 1.0, 0]} material={materials.hull}>
        <cylinderGeometry args={[0.2, 0.3, 0.5, 6]} />
      </mesh>
      <mesh position={[0, -1.0, 0]} material={materials.hull}>
        <cylinderGeometry args={[0.3, 0.2, 0.5, 6]} />
      </mesh>

      {/* Central light */}
      <pointLight position={[0, 0, 0]} color={materials.tech.color} intensity={2.0} distance={8} />

      {/* Ring navigation lights */}
      {[0, Math.PI].map((a, i) => (
        <pointLight key={`rl${i}`}
                    position={[Math.cos(a + ringRotation) * 3.5, 0.4, Math.sin(a + ringRotation) * 3.5]}
                    color="#ffffff" intensity={0.8} distance={3} />
      ))}
    </group>
  );
}

// ── Deep-Space Industrial Station ───────────────────────────────

function IndustrialStation({ materials, time }: {
  materials: ReturnType<typeof useStationMaterials>;
  time: number;
}) {
  const armAngle = Math.sin(time * 0.08) * 0.15;

  return (
    <group>
      {/* Main cylindrical hull */}
      <mesh material={materials.hull} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.7, 5.0, 10]} />
      </mesh>

      {/* Hull detail rings */}
      {[-1.5, 0, 1.5].map((zOff, i) => (
        <mesh key={`ring${i}`} position={[0, 0, zOff]} material={materials.panel}>
          <torusGeometry args={[0.85, 0.06, 6, 12]} />
        </mesh>
      ))}

      {/* Tech panel strips along hull */}
      {[0, 1, 2, 3].map(i => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh key={`tp${i}`}
                position={[Math.cos(angle) * 0.82, 0, Math.sin(angle) * 0.82]}
                rotation={[0, 0, Math.PI / 2]}
                material={materials.tech}>
            <boxGeometry args={[0.08, 4.0, 0.02]} />
          </mesh>
        );
      })}

      {/* Forward section — command and docking */}
      <group position={[0, 0, 2.8]}>
        <mesh material={materials.hull}>
          <sphereGeometry args={[0.7, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh position={[0, 0, 0.4]} material={materials.panel}>
          <cylinderGeometry args={[0.25, 0.25, 0.3, 6]} />
        </mesh>
      </group>

      {/* Rear engine cluster */}
      <group position={[0, 0, -2.8]}>
        {[0, 1, 2, 3].map(i => {
          const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
          const r = 0.35;
          return (
            <group key={`eng${i}`} position={[Math.cos(angle) * r, Math.sin(angle) * r, 0]}>
              <mesh material={materials.panel}>
                <cylinderGeometry args={[0.15, 0.12, 0.4, 6]} />
              </mesh>
              <mesh position={[0, 0, -0.25]} material={materials.engine}>
                <cylinderGeometry args={[0.1, 0.06, 0.15, 6]} />
              </mesh>
            </group>
          );
        })}
        {/* Engine glow */}
        <pointLight position={[0, 0, -0.5]} color={materials.engine.color} intensity={3} distance={6} />
      </group>

      {/* Mechanical arms — port and starboard */}
      {[-1, 1].map(side => (
        <group key={`arm${side}`} position={[side * 1.2, 0, 0.5]} rotation={[0, 0, armAngle * side]}>
          <mesh material={materials.truss}>
            <boxGeometry args={[2.0, 0.08, 0.08]} />
          </mesh>
          {/* Arm end cargo module */}
          <mesh position={[side * 1.2, 0, 0]} material={materials.hull}>
            <boxGeometry args={[0.6, 0.4, 0.5]} />
          </mesh>
          <mesh position={[side * 1.2, 0, 0.26]} material={materials.tech}>
            <boxGeometry args={[0.4, 0.15, 0.01]} />
          </mesh>
        </group>
      ))}

      {/* Docking modules — top and bottom */}
      {[-1, 1].map(side => (
        <group key={`dock${side}`} position={[0, side * 1.0, 0.8]}>
          <mesh material={materials.hull}>
            <boxGeometry args={[0.4, 0.3, 0.6]} />
          </mesh>
          <mesh position={[0, side * 0.16, 0]} material={materials.tech}>
            <boxGeometry args={[0.35, 0.02, 0.5]} />
          </mesh>
        </group>
      ))}

      {/* Energy section */}
      <group position={[0, 0, -1.0]}>
        <mesh material={materials.hull}>
          <cylinderGeometry args={[1.0, 0.9, 1.2, 8]} />
        </mesh>
        {/* Reactor glow */}
        <pointLight position={[0, 0, 0]} color={materials.engine.color} intensity={2} distance={5} />
        {[0, 1, 2, 3].map(i => {
          const angle = (i / 4) * Math.PI * 2;
          return (
            <mesh key={`ep${i}`}
                  position={[Math.cos(angle) * 1.01, Math.sin(angle) * 1.01, 0]}
                  rotation={[angle, 0, 0]}
                  material={materials.engine}>
              <boxGeometry args={[0.25, 0.03, 0.8]} />
            </mesh>
          );
        })}
      </group>

      {/* Navigation lights */}
      <pointLight position={[1.5, 0, 2.5]} color="#ff2222" intensity={0.6} distance={3} />
      <pointLight position={[-1.5, 0, 2.5]} color="#22ff22" intensity={0.6} distance={3} />
    </group>
  );
}

// ── Small Spacecraft ────────────────────────────────────────────

function SmallShip({ position, angle, speed, materials }: {
  position: [number, number, number];
  angle: number;
  speed: number;
  materials: ReturnType<typeof useStationMaterials>;
}) {
  const ref = useRef<THREE.Group>(null);
  const angleRef = useRef(angle);

  useFrame((_, delta) => {
    if (!ref.current) return;
    angleRef.current += speed * delta;
    const r = 2.5;
    ref.current.position.set(
      position[0] + Math.cos(angleRef.current) * r,
      position[1] + Math.sin(angleRef.current * 0.7) * 0.3,
      position[2] + Math.sin(angleRef.current) * r
    );
    ref.current.rotation.y = -angleRef.current + Math.PI / 2;
  });

  return (
    <group ref={ref}>
      {/* Ship body */}
      <mesh material={materials.panel} scale={[0.15, 0.06, 0.25]}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      {/* Engine glow */}
      <mesh position={[0, 0, 0.14]} material={materials.engine} scale={[0.04, 0.04, 0.04]}>
        <sphereGeometry args={[1, 6, 6]} />
      </mesh>
      <pointLight position={[0, 0, 0.15]} color={materials.engine.color} intensity={0.3} distance={1.5} />
    </group>
  );
}

// ── Station Wrapper with Orbit ──────────────────────────────────

interface SpaceStationProps {
  config: StationConfig;
  planetGroupsRef: React.RefObject<Map<string, THREE.Group>>;
}

export function SpaceStation({ config, planetGroupsRef }: SpaceStationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const stationRef = useRef<THREE.Group>(null);
  const angleRef = useRef(config.orbitInitialAngle);
  const timeRef = useRef(0);

  const materials = useStationMaterials(config.techColor, config.engineColor);

  // Get parent planet world position
  const getParentPosition = useCallback(() => {
    if (!config.orbitPlanet || !planetGroupsRef.current) return null;
    const group = planetGroupsRef.current.get(config.orbitPlanet);
    if (!group) return null;
    const pos = new THREE.Vector3();
    group.getWorldPosition(pos);
    return pos;
  }, [config.orbitPlanet, planetGroupsRef]);

  useFrame((_, delta) => {
    if (!groupRef.current || !stationRef.current) return;
    timeRef.current += delta;
    angleRef.current += config.orbitSpeed * delta;

    const parentPos = getParentPosition();

    if (parentPos) {
      // Orbit around planet
      const x = parentPos.x + Math.cos(angleRef.current) * config.orbitRadius;
      const z = parentPos.z + Math.sin(angleRef.current) * config.orbitRadius;
      const y = parentPos.y + Math.sin(angleRef.current) * Math.sin(config.orbitTilt) * config.orbitRadius * 0.4;
      groupRef.current.position.set(x, y, z);
    } else {
      // Free-floating orbit around origin
      const px = config.position?.[0] ?? 0;
      const py = config.position?.[1] ?? 0;
      const pz = config.position?.[2] ?? 0;
      const x = px + Math.cos(angleRef.current) * config.orbitRadius;
      const z = pz + Math.sin(angleRef.current) * config.orbitRadius;
      const y = py + Math.sin(angleRef.current) * Math.sin(config.orbitTilt) * config.orbitRadius * 0.3;
      groupRef.current.position.set(x, y, z);
    }

    // Station self-rotation
    stationRef.current.rotation.x += config.rotationSpeed[0] * delta;
    stationRef.current.rotation.y += config.rotationSpeed[1] * delta;
    stationRef.current.rotation.z += config.rotationSpeed[2] * delta;
  });

  // Dispose materials on unmount
  useEffect(() => {
    return () => {
      Object.values(materials).forEach(m => m.dispose());
    };
  }, [materials]);

  const StationModel = config.type === 'ring' ? RotatingRingStation
    : config.type === 'industrial' ? IndustrialStation
    : OrbitalResearchStation;

  return (
    <group ref={groupRef}>
      <group ref={stationRef} scale={config.scale}>
        <StationModel materials={materials} time={timeRef.current} />
      </group>

      {/* Small ships near larger stations */}
      {config.scale >= 2.0 && (
        <>
          <SmallShip position={[0, 0.5, 0]} angle={0} speed={0.4} materials={materials} />
          <SmallShip position={[0, -0.3, 0]} angle={Math.PI} speed={0.3} materials={materials} />
        </>
      )}
    </group>
  );
}

// Note: We need the time uniform to animate station components.
// The StationModel receives `time` but it's captured at render time.
// We need a ref-based approach instead.

// ── Animated Station Model Wrapper ──────────────────────────────
// This wrapper provides real-time `time` to station sub-components

export function AnimatedSpaceStation({ config, planetGroupsRef }: SpaceStationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const stationRef = useRef<THREE.Group>(null);
  const angleRef = useRef(config.orbitInitialAngle);
  const timeRef = useRef(0);

  const materials = useStationMaterials(config.techColor, config.engineColor);

  const getParentPosition = useCallback(() => {
    if (!config.orbitPlanet || !planetGroupsRef.current) return null;
    const group = planetGroupsRef.current.get(config.orbitPlanet);
    if (!group) return null;
    const pos = new THREE.Vector3();
    group.getWorldPosition(pos);
    return pos;
  }, [config.orbitPlanet, planetGroupsRef]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    timeRef.current = state.clock.elapsedTime;
    angleRef.current += config.orbitSpeed * delta;

    const parentPos = getParentPosition();

    if (parentPos) {
      const x = parentPos.x + Math.cos(angleRef.current) * config.orbitRadius;
      const z = parentPos.z + Math.sin(angleRef.current) * config.orbitRadius;
      const y = parentPos.y + Math.sin(angleRef.current) * Math.sin(config.orbitTilt) * config.orbitRadius * 0.4;
      groupRef.current.position.set(x, y, z);
    } else {
      const px = config.position?.[0] ?? 0;
      const py = config.position?.[1] ?? 0;
      const pz = config.position?.[2] ?? 0;
      const x = px + Math.cos(angleRef.current) * config.orbitRadius;
      const z = pz + Math.sin(angleRef.current) * config.orbitRadius;
      const y = py + Math.sin(angleRef.current) * Math.sin(config.orbitTilt) * config.orbitRadius * 0.3;
      groupRef.current.position.set(x, y, z);
    }

    if (stationRef.current) {
      stationRef.current.rotation.x += config.rotationSpeed[0] * delta;
      stationRef.current.rotation.y += config.rotationSpeed[1] * delta;
      stationRef.current.rotation.z += config.rotationSpeed[2] * delta;
    }
  });

  useEffect(() => {
    return () => {
      Object.values(materials).forEach(m => m.dispose());
    };
  }, [materials]);

  return (
    <group ref={groupRef}>
      <group ref={stationRef} scale={config.scale}>
        <AnimatedStationInner type={config.type} materials={materials} />
      </group>

      {config.scale >= 2.0 && (
        <>
          <SmallShip position={[0, 0.5, 0]} angle={0} speed={0.4} materials={materials} />
          <SmallShip position={[0, -0.3, 0]} angle={Math.PI} speed={0.3} materials={materials} />
        </>
      )}
    </group>
  );
}

// Inner component that provides animated time to station models
function AnimatedStationInner({ type, materials }: {
  type: StationConfig['type'];
  materials: ReturnType<typeof useStationMaterials>;
}) {
  const timeRef = useRef(0);

  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime;
  });

  return <StationRenderer type={type} materials={materials} timeRef={timeRef} />;
}

function StationRenderer({ type, materials, timeRef }: {
  type: StationConfig['type'];
  materials: ReturnType<typeof useStationMaterials>;
  timeRef: React.RefObject<number>;
}) {
  const time = timeRef.current ?? 0;

  if (type === 'ring') return <RotatingRingStation materials={materials} time={time} />;
  if (type === 'industrial') return <IndustrialStation materials={materials} time={time} />;
  return <OrbitalResearchStation materials={materials} time={time} />;
}

