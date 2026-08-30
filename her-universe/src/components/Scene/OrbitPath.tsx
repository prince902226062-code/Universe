// ============================================================
// Her Universe — OrbitPath Component
// ============================================================
// A subtle dashed/faded ring showing a planet's orbit.
// ============================================================

import { useMemo } from 'react';
import * as THREE from 'three';
import { buildOrbitPoints } from '../../utils/orbitMath';

interface OrbitPathProps {
  radius: number;
  tilt: number;
  eccentricity?: number;
  semiMinorRatio?: number; // legacy prop compatibility
  orbitRotation?: number;
  ascendingNode?: number;
  color?: string;
  opacity?: number;
}

export function OrbitPath({
  radius,
  tilt,
  eccentricity,
  semiMinorRatio = 0.78,
  orbitRotation = 0,
  ascendingNode = 0,
  color = '#4466aa',
  opacity = 0.2,
}: OrbitPathProps) {
  const ecc = eccentricity ?? semiMinorRatio;

  const points = useMemo(
    () => buildOrbitPoints(radius, tilt, ecc, orbitRotation, ascendingNode, 160),
    [radius, tilt, ecc, orbitRotation, ascendingNode]
  );

  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return new THREE.Line(geo, mat);
  }, [points, color, opacity]);

  return <primitive object={lineObj} />;
}

