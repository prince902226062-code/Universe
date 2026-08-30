// ============================================================
// Her Universe — ConstellationLines Component
// ============================================================
// Renders glowing 3D lines connecting discovered puzzle stars
// with smooth draw animations between sequence steps.
// ============================================================

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PuzzleStarConfig } from '../../data/constellationData';

interface ConstellationLinesProps {
  stars: PuzzleStarConfig[];
  connectedIds: string[];
  isCompleted: boolean;
}

export function ConstellationLines({
  stars,
  connectedIds,
  isCompleted,
}: ConstellationLinesProps) {
  const lineGroupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // Map star IDs to configs
  const starMap = useMemo(() => {
    const map = new Map<string, PuzzleStarConfig>();
    stars.forEach((s) => map.set(s.id, s));
    return map;
  }, [stars]);

  // Build connected line segment line geometries
  const lineSegments = useMemo(() => {
    const segments: Array<{ from: [number, number, number]; to: [number, number, number] }> = [];

    for (let i = 0; i < connectedIds.length - 1; i++) {
      const fromStar = starMap.get(connectedIds[i]);
      const toStar = starMap.get(connectedIds[i + 1]);
      if (fromStar && toStar) {
        segments.push({
          from: fromStar.position,
          to: toStar.position,
        });
      }
    }

    // If puzzle is completed, connect last star back to star-1 to complete perimeter heart!
    if (isCompleted && connectedIds.length >= stars.length) {
      const firstStar = starMap.get(connectedIds[0]);
      const lastStar = starMap.get(connectedIds[connectedIds.length - 2]); // star-6
      if (firstStar && lastStar) {
        segments.push({
          from: lastStar.position,
          to: firstStar.position,
        });
      }
    }

    return segments;
  }, [connectedIds, stars.length, starMap, isCompleted]);

  // Pulsing energy line animation
  useFrame((_, delta) => {
    timeRef.current += delta * 2.0;
    if (!lineGroupRef.current) return;

    lineGroupRef.current.children.forEach((child) => {
      if (child instanceof THREE.Line) {
        const mat = child.material as THREE.LineBasicMaterial;
        mat.opacity = 0.75 + Math.sin(timeRef.current) * 0.15;
      }
    });
  });

  return (
    <group ref={lineGroupRef}>
      {lineSegments.map((seg, idx) => {
        const points = [
          new THREE.Vector3(...seg.from),
          new THREE.Vector3(...seg.to),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          // @ts-ignore
          <line key={`line-${idx}`} geometry={geometry}>
            <lineBasicMaterial
              color={isCompleted ? '#ff77d4' : '#ffaae5'}
              linewidth={3}
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
            />
          </line>
        );
      })}
    </group>
  );
}
