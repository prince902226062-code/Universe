// ============================================================
// Her Universe — 3D TreasureObject Component
// ============================================================
// Renders distinct space-themed 3D artifacts (Capsule, Probe,
// Crystal, Relic) with idle floating physics, emissive glow,
// generous click hitboxes, and discovery state.
// ============================================================

import { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { TreasureConfig } from '../../data/treasures';

interface TreasureObjectProps {
  treasure: TreasureConfig;
  isDiscovered: boolean;
  isFocused: boolean;
  onSelectTreasure: (treasure: TreasureConfig) => void;
  onHoverTreasure: (treasure: TreasureConfig | null) => void;
}

export function TreasureObject({
  treasure,
  isDiscovered,
  isFocused,
  onSelectTreasure,
  onHoverTreasure,
}: TreasureObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Random phase offset for natural individual floating
  const seed = useRef(Math.random() * 100);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime() + seed.current;

    // Gentle float & slow 3D rotation physics
    const floatY = Math.sin(time * 1.5) * 0.45;
    const floatX = Math.cos(time * 1.1) * 0.2;

    groupRef.current.position.set(
      treasure.position[0] + floatX,
      treasure.position[1] + floatY,
      treasure.position[2]
    );

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * (hovered ? 1.8 : 0.8);
      coreRef.current.rotation.x += delta * 0.4;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.2;
      ringRef.current.rotation.x = Math.sin(time * 0.8) * 0.3;
    }
  });

  const handlePointerOver = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      setHovered(true);
      document.body.style.cursor = 'pointer';
      onHoverTreasure(treasure);
    },
    [treasure, onHoverTreasure]
  );

  const handlePointerOut = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      setHovered(false);
      document.body.style.cursor = 'default';
      onHoverTreasure(null);
    },
    [onHoverTreasure]
  );

  const handleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onSelectTreasure(treasure);
    },
    [treasure, onSelectTreasure]
  );

  const primaryColor = treasure.color;
  const glowColor = isDiscovered ? '#77ffbb' : hovered || isFocused ? '#ffffff' : primaryColor;
  const emissiveIntensity = isDiscovered ? 1.8 : hovered || isFocused ? 3.5 : 1.5;

  return (
    <group ref={groupRef} position={treasure.position} rotation={treasure.rotation || [0, 0, 0]}>
      {/* Invisible Large Click Target Hitbox */}
      <mesh
        visible={false}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[2.5, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* 1. MEMORY CAPSULE DESIGN */}
      {treasure.type === 'memory-capsule' && (
        <group scale={hovered ? 1.25 : 1.0}>
          {/* Main Metallic Cylinder */}
          <mesh ref={coreRef}>
            <cylinderGeometry args={[0.6, 0.6, 1.6, 16]} />
            <meshStandardMaterial
              color="#2a1b40"
              emissive={glowColor}
              emissiveIntensity={emissiveIntensity * 0.8}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>

          {/* Glowing Glass Core Sphere */}
          <mesh scale={0.7}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive={glowColor}
              emissiveIntensity={emissiveIntensity * 1.5}
              transparent
              opacity={0.9}
            />
          </mesh>

          {/* Orbiting Capsule Ring */}
          <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[1.2, 0.08, 12, 32]} />
            <meshBasicMaterial color={glowColor} transparent opacity={0.8} />
          </mesh>
        </group>
      )}

      {/* 2. LOST SPACE PROBE DESIGN */}
      {treasure.type === 'space-probe' && (
        <group scale={hovered ? 1.25 : 1.0}>
          {/* Parabolic Antenna Dish */}
          <mesh ref={coreRef} rotation={[0.4, 0, 0]}>
            <coneGeometry args={[1.2, 0.5, 24, 1, true]} />
            <meshStandardMaterial
              color="#1a2540"
              emissive={glowColor}
              emissiveIntensity={emissiveIntensity * 0.9}
              side={THREE.DoubleSide}
              metalness={0.85}
              roughness={0.3}
            />
          </mesh>

          {/* Probe Central Body */}
          <mesh position={[0, -0.6, 0]}>
            <boxGeometry args={[0.7, 0.7, 0.7]} />
            <meshStandardMaterial
              color="#3a4b6e"
              emissive={glowColor}
              emissiveIntensity={emissiveIntensity}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>

          {/* Pulsing Beacon Light */}
          <mesh ref={ringRef} position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.3, 12, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
          </mesh>
        </group>
      )}

      {/* 3. COSMIC CRYSTAL ARTIFACT DESIGN */}
      {treasure.type === 'cosmic-crystal' && (
        <group scale={hovered ? 1.25 : 1.0}>
          {/* Octahedron Gem Crystal */}
          <mesh ref={coreRef}>
            <octahedronGeometry args={[1.1, 0]} />
            <meshStandardMaterial
              color={glowColor}
              emissive={glowColor}
              emissiveIntensity={emissiveIntensity * 1.2}
              roughness={0.05}
              metalness={0.95}
              transparent
              opacity={0.88}
            />
          </mesh>

          {/* Floating Outer Prism Ring */}
          <mesh ref={ringRef} rotation={[0, Math.PI / 4, 0]}>
            <torusGeometry args={[1.4, 0.06, 8, 4]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
          </mesh>
        </group>
      )}

      {/* 4. MINI SOLAR RELIC DESIGN */}
      {treasure.type === 'solar-relic' && (
        <group scale={hovered ? 1.25 : 1.0}>
          {/* Core Orb */}
          <mesh ref={coreRef}>
            <sphereGeometry args={[0.8, 20, 20]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive={glowColor}
              emissiveIntensity={emissiveIntensity * 1.6}
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>

          {/* Concentric Gyro Rings */}
          <mesh ref={ringRef} rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[1.3, 0.07, 16, 32]} />
            <meshBasicMaterial color={glowColor} transparent opacity={0.8} />
          </mesh>
        </group>
      )}

      {/* Discovered Sparkle Aura Ring */}
      {isDiscovered && (
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={[2.2, 2.2, 2.2]}>
          <ringGeometry args={[0.5, 0.6, 24]} />
          <meshBasicMaterial color="#55ffaa" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
