// ============================================================
// Her Universe — Orbit Math Utilities (Keplerian Orbital Mechanics)
// ============================================================

import * as THREE from 'three';

/**
 * Convert input eccentricity value into true Keplerian eccentricity e in [0, 0.95).
 * Accepts either true eccentricity e (e.g. 0.15) or legacy semiMinorRatio b/a (e.g. 0.78).
 */
export function normalizeEccentricity(val: number): number {
  if (val >= 0.6 && val <= 0.99) {
    // Legacy semiMinorRatio (b/a) -> convert to true eccentricity e = sqrt(1 - ratio^2)
    return Math.sqrt(Math.max(0, 1 - val * val));
  }
  return Math.min(Math.max(val, 0), 0.95);
}

/**
 * Solve Kepler's Equation for Eccentric Anomaly E:
 * M = E - e * sin(E)
 * Uses Newton-Raphson iteration for machine-precision convergence.
 */
export function solveKepler(M: number, e: number): number {
  let m = M % (2 * Math.PI);
  if (m < 0) m += 2 * Math.PI;

  // Initial guess
  let E = e > 0.8 ? Math.PI : m;

  for (let i = 0; i < 8; i++) {
    const f = E - e * Math.sin(E) - m;
    const fPrime = 1 - e * Math.cos(E);
    const delta = f / fPrime;
    E -= delta;
    if (Math.abs(delta) < 1e-7) break;
  }
  return E;
}

/**
 * Compute the 3D position of a planet on its Keplerian elliptical orbit.
 * The Sun is at the primary focus (0, 0, 0).
 *
 * @param meanAnomaly    - current orbital mean anomaly M in radians
 * @param radius         - semi-major axis radius a (AU-scale)
 * @param tilt           - orbital inclination i in radians
 * @param eccentricity   - orbital eccentricity e (or legacy semiMinorRatio)
 * @param orbitRotation  - argument of periapsis omega in radians
 * @param ascendingNode  - longitude of ascending node Omega in radians
 * @returns THREE.Vector3 world position
 */
export function getOrbitPosition(
  meanAnomaly: number,
  radius: number,
  tilt: number,
  eccentricity = 0.15,
  orbitRotation = 0,
  ascendingNode = 0
): THREE.Vector3 {
  const a = radius;
  const e = normalizeEccentricity(eccentricity);
  const b = a * Math.sqrt(1 - e * e);

  // Solve Kepler's equation for Eccentric Anomaly E
  const E = solveKepler(meanAnomaly, e);

  // 2D position in orbital plane (Sun at focus 0,0,0)
  const xOrb = a * (Math.cos(E) - e);
  const zOrb = b * Math.sin(E);

  // 1. Rotate by Argument of Periapsis (omega)
  const cosW = Math.cos(orbitRotation);
  const sinW = Math.sin(orbitRotation);
  const x1 = xOrb * cosW - zOrb * sinW;
  const z1 = xOrb * sinW + zOrb * cosW;

  // 2. Rotate by Inclination (tilt i)
  const cosI = Math.cos(tilt);
  const sinI = Math.sin(tilt);
  const x2 = x1;
  const y2 = z1 * sinI;
  const z2 = z1 * cosI;

  // 3. Rotate by Longitude of Ascending Node (Omega)
  const cosN = Math.cos(ascendingNode);
  const sinN = Math.sin(ascendingNode);
  const xFinal = x2 * cosN - z2 * sinN;
  const yFinal = y2;
  const zFinal = x2 * sinN + z2 * cosN;

  return new THREE.Vector3(xFinal, yFinal, zFinal);
}

/**
 * Get current relative orbital speed multiplier (Kepler's 2nd Law).
 * Returns ~1.0 at average distance, >1.0 near perihelion, <1.0 near aphelion.
 */
export function getOrbitalSpeedFactor(meanAnomaly: number, eccentricity = 0.15): number {
  const e = normalizeEccentricity(eccentricity);
  const E = solveKepler(meanAnomaly, e);
  const cosE = Math.cos(E);
  return Math.sqrt((1 + e * cosE) / Math.max(0.01, 1 - e * cosE));
}

/**
 * Advance orbit angle by delta time, returning new mean anomaly.
 */
export function advanceAngle(
  currentAngle: number,
  orbitSpeed: number,
  delta: number
): number {
  return currentAngle + orbitSpeed * delta;
}

/**
 * Smooth linear interpolation (lerp).
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Vector3 lerp in place (modifies `current`).
 */
export function lerpVector3(
  current: THREE.Vector3,
  target: THREE.Vector3,
  t: number
): void {
  current.x = lerp(current.x, target.x, t);
  current.y = lerp(current.y, target.y, t);
  current.z = lerp(current.z, target.z, t);
}

/**
 * Spring-based damping (exponential approach).
 */
export function springDamp(
  current: number,
  target: number,
  damping: number,
  delta: number
): number {
  return current + (target - current) * (1 - Math.exp(-damping * delta));
}

/**
 * Build a set of points for a true Keplerian 3D orbit path ring.
 */
export function buildOrbitPoints(
  radius: number,
  tilt: number,
  eccentricity = 0.15,
  orbitRotation = 0,
  ascendingNode = 0,
  segments = 128
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const meanAnomaly = (i / segments) * Math.PI * 2;
    points.push(
      getOrbitPosition(meanAnomaly, radius, tilt, eccentricity, orbitRotation, ascendingNode)
    );
  }
  return points;
}

