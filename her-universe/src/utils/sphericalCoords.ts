// ============================================================
// Her Universe — Spherical Coordinate Utilities
// ============================================================

import * as THREE from 'three';
import type { MemoryEntry } from '../data/memories';

/**
 * Convert spherical (theta, phi) to Cartesian (x, y, z) on a unit sphere.
 * theta = azimuthal [0, 2π]
 * phi   = polar [0, π]
 */
export function sphericalToCartesian(
  theta: number,
  phi: number,
  radius = 1
): THREE.Vector3 {
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Convert a 3D Cartesian point on a sphere to spherical coordinates.
 * Assumes the point is on the surface of a sphere centered at origin.
 */
export function cartesianToSpherical(point: THREE.Vector3): {
  theta: number;
  phi: number;
} {
  const r = point.length();
  if (r === 0) return { theta: 0, phi: 0 };

  const phi = Math.acos(Math.max(-1, Math.min(1, point.y / r)));
  const theta = Math.atan2(point.z, point.x);
  const normalizedTheta = ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  return { theta: normalizedTheta, phi };
}

/**
 * Compute angular distance (in radians) between two spherical coordinates.
 * Uses the haversine formula for numerical stability.
 */
export function angularDistance(
  theta1: number, phi1: number,
  theta2: number, phi2: number
): number {
  const dPhi = phi2 - phi1;
  const dTheta = theta2 - theta1;

  const a =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dTheta / 2) ** 2;

  return 2 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, a))));
}

/**
 * Find the nearest memory to a 3D intersection point on the planet sphere.
 * 
 * @param intersectionPoint  - world-space hit point (should be in local planet space)
 * @param memories           - array of MemoryEntry to search
 * @param planetRotationY    - current Y rotation of the planet (radians), to account for spin
 * @returns nearest MemoryEntry or null
 */
export function findNearestMemory(
  intersectionPoint: THREE.Vector3,
  memories: MemoryEntry[],
  planetRotationY = 0,
  time = 0
): { memory: MemoryEntry; distance: number } | null {
  if (memories.length === 0) return null;

  const { theta: clickTheta, phi: clickPhi } = cartesianToSpherical(
    intersectionPoint
  );

  let nearest: MemoryEntry | null = null;
  let minDistance = Infinity;

  memories.forEach((memory, idx) => {
    const orbitSpeed = 0.12 + (idx % 4) * 0.04;
    const revolvingTheta = memory.theta + time * orbitSpeed;
    const adjustedTheta = ((revolvingTheta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    const dist = angularDistance(clickTheta, clickPhi, adjustedTheta, memory.phi);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = memory;
    }
  });

  return nearest ? { memory: nearest, distance: minDistance } : null;
}

/**
 * Get the 3D surface position of a memory on a rotating planet.
 * Returns world-space position offset from planet center.
 */
export function getMemory3DPosition(
  memory: MemoryEntry,
  planetRadius: number,
  planetRotationY = 0
): THREE.Vector3 {
  // Adjust theta for planet rotation
  const adjustedTheta = memory.theta + planetRotationY;
  return sphericalToCartesian(adjustedTheta, memory.phi, planetRadius + 0.01);
}

/**
 * Get the surface normal of a memory (outward from sphere center).
 */
export function getMemorySurfaceNormal(
  memory: MemoryEntry,
  planetRotationY = 0
): THREE.Vector3 {
  const adjustedTheta = memory.theta + planetRotationY;
  const pos = sphericalToCartesian(adjustedTheta, memory.phi, 1);
  return pos.normalize();
}

/**
 * Fibonacci sphere — evenly distribute N points on a sphere.
 * Used for the dynamic photo sampler.
 */
export function fibonacciSpherePoints(
  n: number
): Array<{ theta: number; phi: number }> {
  const points: Array<{ theta: number; phi: number }> = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const phi = Math.acos(Math.max(-1, Math.min(1, y)));
    const theta = ((goldenAngle * i) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    points.push({ theta, phi });
  }

  return points;
}
