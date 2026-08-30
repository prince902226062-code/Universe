// ============================================================
// Her Universe — AstronautSpriteFallback Component
// ============================================================
// High-fidelity 2.5D fallback sprite mode using the reference
// PNG with dynamic 3D directional tilting, floating, and lighting.
// ============================================================

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { PointerState, AstronautCursorConfig } from './types';
import { StarDustTrail } from './StarDustTrail';

interface AstronautSpriteFallbackProps {
  pointerState: React.MutableRefObject<PointerState>;
  config: AstronautCursorConfig;
}

export function AstronautSpriteFallback({
  pointerState,
  config,
}: AstronautSpriteFallbackProps) {
  const rootRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const texture = useTexture(config.referenceImagePath || '/astronaut/astronaut.png');
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    timeRef.current += clampedDelta * config.floatSpeed;
    const t = timeRef.current;
    const pState = pointerState.current;

    if (!rootRef.current || !meshRef.current) return;

    const vx = Math.max(-1, Math.min(1, pState.velocity.x / 600));
    const vy = Math.max(-1, Math.min(1, pState.velocity.y / 600));

    // Zero-G float
    const floatAmp = config.enableFloating ? config.floatAmplitude : 0;
    const floatY = (Math.sin(t * 1.8) * 0.04 + Math.sin(t * 0.7) * 0.02) * floatAmp;
    const floatX = Math.cos(t * 1.2) * 0.02 * floatAmp;

    // Click reaction bounce
    const clickBounce = Math.sin(pState.clickPulse * Math.PI) * 0.15;
    rootRef.current.position.set(floatX, floatY + clickBounce, 0);

    // Directional 3D tilt
    const targetRoll = -vx * config.tiltStrength * 1.2;
    const targetPitch = vy * config.tiltStrength * 0.8;
    const targetYaw = vx * 0.3;

    meshRef.current.rotation.z += (targetRoll - meshRef.current.rotation.z) * 0.18;
    meshRef.current.rotation.x += (targetPitch - meshRef.current.rotation.x) * 0.18;
    meshRef.current.rotation.y += (targetYaw - meshRef.current.rotation.y) * 0.18;

    // Scale
    const baseScale = config.scale * 1.5;
    const squashScale = baseScale * (1.0 + pState.clickPulse * 0.15);
    rootRef.current.scale.set(squashScale, squashScale, squashScale);
  });

  return (
    <group ref={rootRef}>
      <mesh ref={meshRef}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.01}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Thruster particle trail */}
      {config.enableParticles && (
        <StarDustTrail pointerState={pointerState} anchorRef={rootRef} count={35} />
      )}
    </group>
  );
}
