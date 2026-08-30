// ============================================================
// Her Universe — StarDustTrail Component
// ============================================================
// Emits sparkling cosmic stardust & thruster embers behind the
// floating astronaut companion as it moves across the screen.
// ============================================================

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PointerState } from './types';

interface StarDustTrailProps {
  pointerState: React.MutableRefObject<PointerState>;
  anchorRef: React.RefObject<THREE.Group | null>;
  count?: number;
}

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  color: THREE.Color;
}

export function StarDustTrail({
  pointerState,
  anchorRef,
  count = 90,
}: StarDustTrailProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Palette of cosmic stardust colors
  const colors = useMemo(
    () => [
      new THREE.Color('#ffbb44'), // warm sparkling gold
      new THREE.Color('#ff6eb4'), // romantic pink stardust
      new THREE.Color('#70d6ff'), // cosmic bright cyan
      new THREE.Color('#ffe066'), // glowing star amber
      new THREE.Color('#ffffff'), // pure starlight
      new THREE.Color('#c77dff'), // magical violet
    ],
    []
  );

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, () => ({
      position: new THREE.Vector3(0, 0, -100),
      velocity: new THREE.Vector3(0, 0, 0),
      life: 0,
      maxLife: 1.0,
      size: 0.2,
      color: colors[0].clone(),
    }));
  }, [count, colors]);

  const spawnIndexRef = useRef(0);
  const spawnTimerRef = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const clampedDelta = Math.min(delta, 0.05);
    const pState = pointerState.current;

    let worldPos = new THREE.Vector3();
    if (anchorRef.current) {
      anchorRef.current.getWorldPosition(worldPos);
    }

    // Spawn rate scales with speed & click pulse (faster when moving)
    const spawnInterval = pState.speed > 0.02 ? 0.008 : 0.035;
    spawnTimerRef.current += clampedDelta;

    if (spawnTimerRef.current >= spawnInterval) {
      spawnTimerRef.current = 0;
      
      // Spawn 1-2 particles per tick for dense magical effect
      const burstCount = pState.speed > 0.1 ? 2 : 1;
      for (let b = 0; b < burstCount; b++) {
        const p = particles[spawnIndexRef.current];
        spawnIndexRef.current = (spawnIndexRef.current + 1) % count;

        // Spawn at thruster backpack / feet with playful drift
        p.position.copy(worldPos);
        p.position.x += (Math.random() - 0.5) * 0.15;
        p.position.y += -0.16 + (Math.random() - 0.5) * 0.08;
        p.position.z += -0.06 + (Math.random() - 0.5) * 0.08;

        // Velocity opposite to movement direction + sparkle drift
        const moveVx = (pState.velocity.x / 800);
        const moveVy = (-pState.velocity.y / 800);

        p.velocity.set(
          -moveVx * 0.5 + (Math.random() - 0.5) * 0.25,
          -moveVy * 0.5 - 0.12 - Math.random() * 0.2,
          (Math.random() - 0.5) * 0.15
        );

        p.maxLife = 0.5 + Math.random() * 0.5;
        p.life = p.maxLife;
        // Balanced 3x size
        p.size = (0.048 + Math.random() * 0.06) * (pState.clickPulse > 0.2 ? 1.5 : 1.0);
        p.color.copy(colors[Math.floor(Math.random() * colors.length)]);
      }
    }

    // Update particles
    for (let i = 0; i < count; i++) {
      const p = particles[i];

      if (p.life > 0) {
        p.life -= clampedDelta;
        p.position.addScaledVector(p.velocity, clampedDelta);
        p.velocity.multiplyScalar(0.97); // gentle space drag

        const lifeRatio = Math.max(0, p.life / p.maxLife);
        // Twinkle / pulse scaling formula
        const twinkle = 1 + Math.sin(lifeRatio * Math.PI * 4) * 0.2;
        const currentScale = p.size * lifeRatio * (1 + Math.sin(lifeRatio * Math.PI)) * twinkle;

        dummy.position.copy(p.position);
        dummy.scale.setScalar(Math.max(0.001, currentScale));
        dummy.rotation.z += clampedDelta * 4;
        dummy.rotation.x += clampedDelta * 3;
        dummy.updateMatrix();

        meshRef.current.setMatrixAt(i, dummy.matrix);
        meshRef.current.setColorAt(i, p.color);
      } else {
        dummy.position.set(0, 0, -500);
        dummy.scale.setScalar(0.0001);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <octahedronGeometry args={[0.6, 0]} />
      <meshBasicMaterial
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
