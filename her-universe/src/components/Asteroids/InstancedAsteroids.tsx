// ============================================================
// Her Universe — Instanced Asteroid Fields
// ============================================================
// High-performance instanced asteroid system with irregular
// low-poly geometry, cratered surfaces, and per-instance
// randomized rotation/drift animation.
// ============================================================

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { type AsteroidFieldConfig, getAsteroidCountMultiplier } from '../../data/stations';
import { getPerformanceTier } from '../../utils/performance';

// ── Procedural Solid 3D Asteroid Geometry (Asteroid Lutetia Style) ─
// 100% watertight, gap-free irregular low-poly boulder with defined craters

interface Crater {
  cx: number;
  cy: number;
  cz: number;
  radius: number;
  depth: number;
}

function createAsteroidGeometry(seed: number, detail: number = 2): THREE.BufferGeometry {
  // Use Dodecahedron or Icosahedron for natural low-poly faceted boulder
  const geo = new THREE.DodecahedronGeometry(1, detail);
  const positions = geo.attributes.position;
  const rng = mulberry32(seed);

  // Pre-generate asteroid-level shape parameters & craters
  const elongX = 0.85 + rng() * 0.45; // triaxial shape variation
  const elongY = 0.80 + rng() * 0.40;
  const elongZ = 0.85 + rng() * 0.45;
  const warpA = (rng() - 0.5) * 0.35;
  const warpB = (rng() - 0.5) * 0.35;

  const numCraters = 4 + Math.floor(rng() * 4);
  const craters: Crater[] = [];
  for (let c = 0; c < numCraters; c++) {
    const theta = rng() * Math.PI * 2;
    const phi = Math.acos(2 * rng() - 1);
    craters.push({
      cx: Math.sin(phi) * Math.cos(theta),
      cy: Math.sin(phi) * Math.sin(theta),
      cz: Math.cos(phi),
      radius: 0.35 + rng() * 0.35,
      depth: 0.12 + rng() * 0.18,
    });
  }

  // Large planar gouge / impact facet
  const gougeX = (rng() - 0.5);
  const gougeY = (rng() - 0.5);
  const gougeZ = (rng() - 0.5);
  const gougeLen = Math.sqrt(gougeX * gougeX + gougeY * gougeY + gougeZ * gougeZ) || 1;
  const gnx = gougeX / gougeLen;
  const gny = gougeY / gougeLen;
  const gnz = gougeZ / gougeLen;
  const gougeThreshold = 0.55 + rng() * 0.2;

  // Compute watertight continuous displacement for every vertex
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const len = Math.sqrt(x * x + y * y + z * z) || 1;
    const nx = x / len;
    const ny = y / len;
    const nz = z / len;

    // 1. Base triaxial elongation & organic asymmetry
    let displacement = 1.0;
    displacement += (elongX - 1.0) * nx * nx + (elongY - 1.0) * ny * ny + (elongZ - 1.0) * nz * nz;
    displacement += warpA * nx * ny + warpB * ny * nz;

    // 2. Continuous multi-octave 3D rock noise
    displacement += Math.sin(nx * 3.5 + seed) * Math.cos(ny * 3.2 + seed * 1.3) * 0.14;
    displacement += Math.sin(nz * 5.8 + seed * 0.7) * Math.cos(nx * 4.6 + 1.2) * 0.08;
    displacement += Math.sin(ny * 8.4 + 2.1) * Math.cos(nz * 7.2 - seed) * 0.04;

    // 3. Planar impact gouge / flat facet
    const gougeDot = nx * gnx + ny * gny + nz * gnz;
    if (gougeDot > gougeThreshold) {
      const gougeFactor = (gougeDot - gougeThreshold) / (1.0 - gougeThreshold);
      displacement -= gougeFactor * 0.22;
    }

    // 4. Smooth crater depressions with raised rims
    for (let c = 0; c < craters.length; c++) {
      const crater = craters[c];
      const dist = Math.sqrt(
        (nx - crater.cx) ** 2 +
        (ny - crater.cy) ** 2 +
        (nz - crater.cz) ** 2
      );

      if (dist < crater.radius) {
        const u = dist / crater.radius;
        // Bowl indentation
        const bowl = crater.depth * (1.0 - u * u) * (1.0 - u * u);
        // Raised circular rim around the crater edge
        const rim = crater.depth * 0.35 * Math.sin(Math.PI * u) * (1.0 - u);
        displacement = displacement - bowl + rim;
      }
    }

    // Apply continuous displacement
    positions.setXYZ(i, nx * displacement, ny * displacement, nz * displacement);
  }

  geo.computeVertexNormals();
  return geo;
}

// Simple seeded RNG for reproducible geometry
function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Per-instance asteroid data ──────────────────────────────────

interface AsteroidInstance {
  angle: number;
  radius: number;
  y: number;
  scale: number;
  // Multi-axis tumbling rotation
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  rotPhaseX: number;
  rotPhaseY: number;
  rotPhaseZ: number;
  // Multi-frequency organic 3D drift
  driftSpeedR: number;
  driftSpeedY: number;
  driftSpeedA: number;
  driftAmpR: number;
  driftAmpY: number;
  phaseR: number;
  phaseY: number;
  phaseA: number;
  geoIndex: number;
}

// ── Instanced Asteroid Field Component ──────────────────────────

export function InstancedAsteroidField({ config }: { config: AsteroidFieldConfig }) {
  const { tier } = getPerformanceTier();
  const multiplier = getAsteroidCountMultiplier(tier);
  const count = Math.floor(config.count * multiplier);

  // Create 6 varied solid asteroid geometries with low-poly facets
  const geometries = useMemo(() => {
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      geos.push(createAsteroidGeometry(i * 197 + 53, 2));
    }
    return geos;
  }, []);

  // Low-poly 3D rock materials with flat shading for rich facet depth
  const materials = useMemo(() => [
    new THREE.MeshStandardMaterial({
      color: '#9c958c',
      roughness: 0.85,
      metalness: 0.12,
      flatShading: true,
      emissive: '#1c1a17',
      emissiveIntensity: 0.25,
    }),
    new THREE.MeshStandardMaterial({
      color: '#aaa39a',
      roughness: 0.82,
      metalness: 0.15,
      flatShading: true,
      emissive: '#181614',
      emissiveIntensity: 0.22,
    }),
    new THREE.MeshStandardMaterial({
      color: '#8e877e',
      roughness: 0.88,
      metalness: 0.10,
      flatShading: true,
      emissive: '#201e1a',
      emissiveIntensity: 0.28,
    }),
  ], []);

  // Group instances by geometry for batched instanced rendering
  const instanceGroups = useMemo(() => {
    const groups: Map<number, AsteroidInstance[]> = new Map();
    for (let i = 0; i < 6; i++) groups.set(i, []);

    const rng = mulberry32(config.innerRadius * 1000 + config.outerRadius * 100);
    const centerY = config.center?.[1] ?? 0;

    for (let i = 0; i < count; i++) {
      const geoIndex = Math.floor(rng() * 6);
      const angle = rng() * Math.PI * 2;
      const radius = config.innerRadius + rng() * (config.outerRadius - config.innerRadius);
      const y = centerY + (rng() - 0.5) * config.ySpread;
      const scale = config.sizeRange[0] + rng() * (config.sizeRange[1] - config.sizeRange[0]);

      const signX = rng() > 0.5 ? 1 : -1;
      const signY = rng() > 0.5 ? 1 : -1;
      const signZ = rng() > 0.5 ? 1 : -1;

      const inst: AsteroidInstance = {
        angle,
        radius,
        y,
        scale,
        // Guaranteed slow continuous 3D tumbling rotation
        rotSpeedX: signX * (0.08 + rng() * 0.22),
        rotSpeedY: signY * (0.06 + rng() * 0.20),
        rotSpeedZ: signZ * (0.05 + rng() * 0.18),
        rotPhaseX: rng() * Math.PI * 2,
        rotPhaseY: rng() * Math.PI * 2,
        rotPhaseZ: rng() * Math.PI * 2,
        // Organic multi-axis 3D drifting motion
        driftSpeedR: 0.15 + rng() * 0.25,
        driftSpeedY: 0.12 + rng() * 0.22,
        driftSpeedA: 0.08 + rng() * 0.16,
        driftAmpR: 0.6 + rng() * 1.4,
        driftAmpY: 0.5 + rng() * 1.2,
        phaseR: rng() * Math.PI * 2,
        phaseY: rng() * Math.PI * 2,
        phaseA: rng() * Math.PI * 2,
        geoIndex,
      };

      groups.get(geoIndex)!.push(inst);
    }

    return groups;
  }, [count, config]);

  // Refs for each instanced mesh (one per geometry variant)
  const meshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const cx = config.center?.[0] ?? 0;
    const cz = config.center?.[2] ?? 0;

    instanceGroups.forEach((instances, geoIdx) => {
      const mesh = meshRefs.current[geoIdx];
      if (!mesh) return;

      for (let i = 0; i < instances.length; i++) {
        const ast = instances[i];
        const orbitalRate = config.orbitSpeed * (config.innerRadius / Math.max(ast.radius, 1));

        // Slow organic 3D drift (radial, vertical, and angular oscillation)
        const currentRadius = ast.radius + Math.sin(t * ast.driftSpeedR + ast.phaseR) * ast.driftAmpR;
        const currentAngle = ast.angle + t * orbitalRate + Math.sin(t * ast.driftSpeedA + ast.phaseA) * 0.03;
        const currentY = ast.y + Math.cos(t * ast.driftSpeedY + ast.phaseY) * ast.driftAmpY;

        const x = cx + Math.cos(currentAngle) * currentRadius;
        const z = cz + Math.sin(currentAngle) * currentRadius;
        const y = currentY;

        dummy.position.set(x, y, z);
        dummy.scale.setScalar(ast.scale);
        dummy.rotation.set(
          ast.rotPhaseX + t * ast.rotSpeedX,
          ast.rotPhaseY + t * ast.rotSpeedY,
          ast.rotPhaseZ + t * ast.rotSpeedZ
        );
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  useEffect(() => {
    return () => {
      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
    };
  }, [geometries, materials]);

  return (
    <group>
      {Array.from(instanceGroups.entries()).map(([geoIdx, instances]) => {
        if (instances.length === 0) return null;
        return (
          <instancedMesh
            key={`${config.id}-geo-${geoIdx}`}
            ref={(el) => { meshRefs.current[geoIdx] = el; }}
            args={[geometries[geoIdx], materials[geoIdx % materials.length], instances.length]}
            frustumCulled={true}
          />
        );
      })}
    </group>
  );
}

// ── All Asteroid Fields Combined ────────────────────────────────

export function AsteroidFields({ fields }: { fields: AsteroidFieldConfig[] }) {
  return (
    <group>
      {fields.map((field) => (
        <InstancedAsteroidField key={field.id} config={field} />
      ))}
    </group>
  );
}
