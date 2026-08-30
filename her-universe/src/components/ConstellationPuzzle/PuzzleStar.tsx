// ============================================================
// Her Universe — PuzzleStar Component
// ============================================================
// Softly glowing, discoverable 3D puzzle star inside space.
// ============================================================

import { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PuzzleStarConfig } from '../../data/constellationData';

interface PuzzleStarProps {
  star: PuzzleStarConfig;
  isDiscovered: boolean;
  isConnected: boolean;
  isNext: boolean;
  wrongTrigger: number;
  onSelectStar: (star: PuzzleStarConfig) => void;
  onHoverStar: (star: PuzzleStarConfig | null) => void;
}

export function PuzzleStar({
  star,
  isDiscovered,
  isConnected,
  isNext,
  wrongTrigger,
  onSelectStar,
  onHoverStar,
}: PuzzleStarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);

  const [hovered, setHovered] = useState(false);

  // Wrong click pulse animation ref
  const wrongPulseRef = useRef(0);
  const prevWrongTrigger = useRef(wrongTrigger);

  if (wrongTrigger !== prevWrongTrigger.current) {
    prevWrongTrigger.current = wrongTrigger;
    if (isHoveredOrActive(hovered, isNext)) {
      wrongPulseRef.current = 1.0;
    }
  }

  function isHoveredOrActive(isH: boolean, next: boolean) {
    return isH || next;
  }

  const handlePointerOver = useCallback(
    (e: any) => {
      e.stopPropagation();
      setHovered(true);
      onHoverStar(star);
    },
    [star, onHoverStar]
  );

  const handlePointerOut = useCallback(
    (e: any) => {
      e.stopPropagation();
      setHovered(false);
      onHoverStar(null);
    },
    [onHoverStar]
  );

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      onSelectStar(star);
    },
    [star, onSelectStar]
  );

  // Animation loop
  const timeRef = useRef(Math.random() * 100);
  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    timeRef.current += clampedDelta;
    const t = timeRef.current;

    // Decay wrong click pulse
    if (wrongPulseRef.current > 0.001) {
      wrongPulseRef.current = THREE.MathUtils.damp(wrongPulseRef.current, 0, 8, clampedDelta);
    } else {
      wrongPulseRef.current = 0;
    }

    if (!meshRef.current) return;

    // Subtle float & pulse
    const floatY = Math.sin(t * 1.8 + star.order) * 0.15;
    const shakeX = Math.sin(t * 35) * 0.2 * wrongPulseRef.current;

    meshRef.current.position.set(
      star.position[0] + shakeX,
      star.position[1] + floatY,
      star.position[2]
    );

    // Dynamic scale based on state
    let targetScale = 1.0;
    if (isConnected) {
      targetScale = 1.8 + Math.sin(t * 2.5) * 0.15;
    } else if (hovered) {
      targetScale = 1.6;
    } else if (isDiscovered || isNext) {
      targetScale = 1.35 + Math.sin(t * 2.0) * 0.1;
    } else {
      targetScale = 1.0 + Math.sin(t * 1.2) * 0.08;
    }

    // Shrink slightly during wrong pulse
    targetScale *= 1.0 - wrongPulseRef.current * 0.25;

    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);

    // Glow mesh scale & opacity
    if (glowRef.current) {
      const glowMat = glowRef.current.material as THREE.MeshBasicMaterial;
      const baseGlowOpacity = isConnected ? 0.9 : hovered ? 0.75 : isNext ? 0.6 : 0.35;
      glowMat.opacity = baseGlowOpacity * (1.0 - wrongPulseRef.current * 0.5);
    }

    // Outer aura ring on hover or next
    if (auraRef.current) {
      auraRef.current.rotation.z += clampedDelta * 0.8;
      const auraMat = auraRef.current.material as THREE.MeshBasicMaterial;
      auraMat.opacity = hovered ? 0.8 : isNext ? 0.45 : 0.0;
    }
  });

  const starColor = star.color || '#ff80bf';

  return (
    <group>
      {/* Clickable Star Anchor */}
      <mesh
        ref={meshRef}
        position={star.position}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        {/* Transparent Large Invisible Click Target Hitbox */}
        <mesh visible={false}>
          <sphereGeometry args={[1.8, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Core Star Sphere */}
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial
          color={isConnected ? '#ffffff' : starColor}
          emissive={isConnected ? '#ffffff' : starColor}
          emissiveIntensity={isConnected ? 3.5 : hovered ? 2.5 : 1.5}
          roughness={0.1}
          metalness={0.8}
        />

        {/* Soft Radial Glow Mesh */}
        <mesh ref={glowRef} scale={[2.2, 2.2, 2.2]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial
            color={starColor}
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Hover / Target Discovery Halo Ring */}
        <mesh ref={auraRef} scale={[3.2, 3.2, 3.2]} rotation={[Math.PI / 4, 0, 0]}>
          <ringGeometry args={[0.4, 0.48, 24]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </mesh>
    </group>
  );
}
