// ============================================================
// Her Universe — SpecialPhotoPlanet Component
// ============================================================
// Prapti's planet:
// - Orbits the Sun with custom path
// - Has magical pink glow
// - Surface covered with photo anchors
// - Click → raycasting → nearest photo emerges
// - State: overview | hover | focused | memoryOpen
// ============================================================

import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { SPECIAL_PLANET } from '../../data/planets';
import { PRAPTI_SPECIAL_MEMORIES, type MemoryEntry } from '../../data/memories';
import { getOrbitPosition } from '../../utils/orbitMath';
import { findNearestMemory } from '../../utils/sphericalCoords';
import { OrbitPath } from '../Scene/OrbitPath';
import { Moon } from '../Scene/Moon';
import { PhotoAnchor } from './PhotoAnchor';
import { mediaDB } from '../../utils/mediaDB';

export type PlanetState = 'overview' | 'hover' | 'focused' | 'memoryOpen';

interface SpecialPhotoPlanetProps {
  allMemories?: MemoryEntry[];
  onStateChange?: (state: PlanetState) => void;
  onMemoryOpen?: (memory: MemoryEntry) => void;
  onMemoryClose?: () => void;
  isFocused: boolean;
  anyFocused?: boolean;
  onFocusRequest: () => void;
  registerRef?: (name: string, group: THREE.Group | null) => void;
}

export function SpecialPhotoPlanet({
  allMemories,
  onStateChange,
  onMemoryOpen,
  onMemoryClose: _onMemoryClose,
  isFocused,
  anyFocused,
  onFocusRequest,
  registerRef,
}: SpecialPhotoPlanetProps) {
  const { gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(SPECIAL_PLANET.initialAngle);
  const rotationYRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    if (groupRef.current && registerRef) {
      registerRef(SPECIAL_PLANET.name, groupRef.current);
    }
    return () => {
      registerRef?.(SPECIAL_PLANET.name, null);
    };
  }, [registerRef]);

  const [_planetState, setPlanetState] = useState<PlanetState>('overview');
  const [selectedMemory, setSelectedMemory] = useState<MemoryEntry | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Use all memories or PRAPTI_SPECIAL_MEMORIES (211 real photo memories)
  const memories = useMemo(() => {
    if (allMemories && allMemories.length > 0) return allMemories;
    return PRAPTI_SPECIAL_MEMORIES;
  }, [allMemories]);

  // Step in strict non-overlapping chunks of 16 photos so NO photo repeats until ALL 211 photos are shown!
  const BATCH_SIZE = 16;
  const [photoOffset, setPhotoOffset] = useState(0);

  useEffect(() => {
    if (memories.length <= BATCH_SIZE) return;
    const interval = setInterval(() => {
      setPhotoOffset((prev) => (prev + BATCH_SIZE) % memories.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [memories.length]);

  // Stagger preload of the NEXT batch using requestIdleCallback (via mediaDB)
  // so the render loop is never blocked by background image loading.
  useEffect(() => {
    if (memories.length <= BATCH_SIZE) return;
    const nextOffset = (photoOffset + BATCH_SIZE) % memories.length;
    const nextUrls: string[] = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const idx = (nextOffset + i) % memories.length;
      nextUrls.push(memories[idx].imageUrl);
    }
    mediaDB.preloadTextures(nextUrls);
  }, [photoOffset, memories]);

  const visibleMemories = useMemo(() => {
    if (memories.length <= BATCH_SIZE) {
      return memories;
    }
    const result: MemoryEntry[] = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const idx = (photoOffset + i) % memories.length;
      result.push(memories[idx]);
    }
    return result;
  }, [memories, photoOffset]);

  // Planet material
  const planetMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SPECIAL_PLANET.color,
        emissive: new THREE.Color(SPECIAL_PLANET.emissive!),
        emissiveIntensity: SPECIAL_PLANET.emissiveIntensity,
        roughness: 0.6,
        metalness: 0.1,
        transparent: true,
        opacity: 0.88,
      }),
    []
  );

  // Outer glow shell
  const glowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: SPECIAL_PLANET.glowColor,
        transparent: true,
        opacity: 0.06,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useEffect(() => {
    return () => {
      planetMaterial.dispose();
      glowMaterial.dispose();
    };
  }, [planetMaterial, glowMaterial]);

  const updateState = useCallback(
    (next: PlanetState) => {
      setPlanetState(next);
      onStateChange?.(next);
    },
    [onStateChange]
  );

  const handlePlanetClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();

      if (!isFocused) {
        onFocusRequest();
        updateState('focused');
        return;
      }

      // Already focused — find nearest memory to click point
      if (!e.point || !groupRef.current) return;

      // Convert world click point to local planet space
      const localPoint = e.point.clone();
      groupRef.current.worldToLocal(localPoint);

      // Normalize to unit sphere (remove planet radius)
      const normalized = localPoint.clone().normalize();

      // Find nearest memory (accounting for planet rotation and orbital revolution)
      const result = findNearestMemory(normalized, visibleMemories, rotationYRef.current, timeRef.current);
      if (!result) return;

      setSelectedMemory(result.memory);
      updateState('memoryOpen');
      onMemoryOpen?.(result.memory);

      // Change cursor
      gl.domElement.style.cursor = 'default';
    },
    [isFocused, onFocusRequest, visibleMemories, updateState, onMemoryOpen, gl]
  );

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;

    // Advance orbit
    angleRef.current += SPECIAL_PLANET.orbitSpeed * delta;
    const pos = getOrbitPosition(
      angleRef.current,
      SPECIAL_PLANET.orbitRadius,
      SPECIAL_PLANET.orbitTilt,
      SPECIAL_PLANET.orbitEccentricity ?? 0.18,
      SPECIAL_PLANET.orbitRotation ?? 2.4,
      SPECIAL_PLANET.ascendingNode ?? 0.5
    );
    groupRef.current.position.copy(pos);

    // Self-rotation
    rotationYRef.current += SPECIAL_PLANET.rotationSpeed * delta;
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y = rotationYRef.current;
    }

    // Animate glow
    if (glowRef.current) {
      const glowMat = glowRef.current.material as THREE.MeshBasicMaterial;
      const baseOpacity = isHovered || isFocused ? 0.12 : 0.06;
      const pulse = Math.sin(timeRef.current * 1.2) * 0.03;
      glowMat.opacity = baseOpacity + pulse;

      const glowScale = 1 + Math.sin(timeRef.current * 0.8) * 0.03;
      glowRef.current.scale.setScalar(glowScale);
    }
  });

  return (
    <>
      <OrbitPath
        radius={SPECIAL_PLANET.orbitRadius}
        tilt={SPECIAL_PLANET.orbitTilt}
        eccentricity={SPECIAL_PLANET.orbitEccentricity ?? 0.18}
        orbitRotation={SPECIAL_PLANET.orbitRotation ?? 2.4}
        ascendingNode={SPECIAL_PLANET.ascendingNode ?? 0.5}
        color="#ff6eb4"
        opacity={0.35}
      />

      <group ref={groupRef}>
        <group rotation={[SPECIAL_PLANET.axialTilt, 0, 0]}>
          {/* Planet sphere */}
          <mesh
            ref={planetMeshRef}
            material={planetMaterial}
            onClick={handlePlanetClick}
            onPointerOver={(e) => {
              e.stopPropagation();
              setIsHovered(true);
              if (!isFocused) gl.domElement.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setIsHovered(false);
              gl.domElement.style.cursor = 'default';
            }}
          >
            <sphereGeometry args={[SPECIAL_PLANET.size, 64, 64]} />
          </mesh>

          {/* Outer glow shell */}
          <mesh ref={glowRef} material={glowMaterial}>
            <sphereGeometry args={[SPECIAL_PLANET.size * 1.6, 32, 32]} />
          </mesh>

          {/* Point light from the planet itself */}
          <pointLight
            color={SPECIAL_PLANET.glowColor}
            intensity={1.2}
            distance={16}
            decay={1.8}
          />

          {/* Glowing 3D Badge */}
          {!anyFocused && (
            <Html
              position={[0, SPECIAL_PLANET.size + 1.6, 0]}
              center
              distanceFactor={60}
              style={{
                pointerEvents: 'none',
                userSelect: 'none',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isHovered ? 'scale(1.15) translateY(-4px)' : 'scale(1.0)',
              }}
            >
              <div
                style={{
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.85), rgba(186, 24, 115, 0.9))',
                  border: '1px solid rgba(255, 192, 203, 0.6)',
                  boxShadow: '0 0 16px rgba(255, 105, 180, 0.6), 0 4px 12px rgba(0,0,0,0.5)',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  backdropFilter: 'blur(6px)',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>🌸</span>
                <span>Prapti ✦</span>
              </div>
            </Html>
          )}
        </group>

        {/* Revolving Photo Orbit Rings around Prapti's planet */}
        {[SPECIAL_PLANET.size + 0.75, SPECIAL_PLANET.size + 1.2, SPECIAL_PLANET.size + 1.65].map((ringRadius, rIdx) => (
          <mesh key={`photo-orbit-ring-${rIdx}`} rotation={[Math.PI / 2 + (rIdx - 1) * 0.12, 0, 0]}>
            <ringGeometry args={[ringRadius, ringRadius + 0.015, 64]} />
            <meshBasicMaterial
              color="#ff80bf"
              transparent
              opacity={0.16 - rIdx * 0.03}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        {/* Photo Anchors revolving around planet surface */}
        {visibleMemories.map((memory, idx) => (
          <PhotoAnchor
            key={`anchor-slot-${idx}`}
            index={idx}
            timeRef={timeRef}
            memory={memory}
            planetRadius={SPECIAL_PLANET.size}
            planetRotationYRef={rotationYRef}
            isSelected={selectedMemory?.id === memory.id}
            isAnySelected={selectedMemory !== null}
            onSelect={(mem, _worldPos) => {
              setSelectedMemory(mem);
              updateState('memoryOpen');
              onMemoryOpen?.(mem);
            }}
          />
        ))}

        {/* Prince — Moon orbiting Prapti's planet */}
        <Moon
          name="Prince"
          size={0.45}
          orbitRadius={4.0}
          orbitSpeed={0.9}
          orbitTilt={0.12}
          glowColor="#ffa0d0"
        />
      </group>
    </>
  );
}
