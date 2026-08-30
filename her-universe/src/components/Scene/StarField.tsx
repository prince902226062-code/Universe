// ============================================================
// Her Universe — StarField Component
// ============================================================
// Creates thousands of stars as a Points object with
// per-star size variation and subtle twinkling animation.
// ============================================================

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SCENE_CONFIG } from '../../data/config';

interface StarFieldProps {
  count?: number;
  spread?: number;
}

export function StarField({
  count = SCENE_CONFIG.starCount,
  spread = SCENE_CONFIG.starSpread,
}: StarFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate star positions and colors once
  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const colorOptions = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#ffe8e8'),
      new THREE.Color('#e8e8ff'),
      new THREE.Color('#ffe8ff'),
      new THREE.Color('#e8f0ff'),
    ];

    for (let i = 0; i < count; i++) {
      // Random positions in a sphere (not a cube) for more natural look
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = spread * (0.5 + Math.random() * 0.5);

      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const c = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = Math.random() * 1.8 + 0.3;
    }

    return { positions, colors, sizes };
  }, [count, spread]);

  // Subtle twinkle animation
  const timeRef = useRef(0);
  useFrame((_, delta) => {
    timeRef.current += delta;
    if (pointsRef.current) {
      // Very gentle opacity pulse — achieved via material opacity
      const material = pointsRef.current.material as THREE.PointsMaterial;
      material.opacity = 0.85 + Math.sin(timeRef.current * 0.3) * 0.12;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, colors, sizes]);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={SCENE_CONFIG.starSize}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
