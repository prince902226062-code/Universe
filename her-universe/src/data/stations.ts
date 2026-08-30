// ============================================================
// Her Universe — Space Stations & Asteroid Fields Configuration
// ============================================================

// ─── Station Types ──────────────────────────────────────────────

export type StationType = 'orbital' | 'ring' | 'industrial';

export interface StationConfig {
  id: string;
  type: StationType;
  name: string;
  scale: number;
  // Orbital placement
  orbitPlanet?: string;         // planet name to orbit, or null for free-floating
  orbitRadius: number;          // distance from planet or from origin
  orbitSpeed: number;           // rad/s
  orbitTilt: number;            // inclination
  orbitInitialAngle: number;
  // Station rotation
  rotationSpeed: [number, number, number]; // euler rotation speeds
  // Lighting
  techColor: string;
  engineColor: string;
  // Position offset (for free-floating stations)
  position?: [number, number, number];
}

export const STATIONS: StationConfig[] = [
  // Deep-Space Ring Station 1 — Outer Frontier Gate
  {
    id: 'elysium-gate',
    type: 'ring',
    name: 'Elysium Gate',
    scale: 3.4,
    orbitRadius: 115,
    orbitSpeed: 0.012,
    orbitTilt: 0.08,
    orbitInitialAngle: 0.6,
    rotationSpeed: [0, 0.012, 0],
    techColor: '#44d4ff',
    engineColor: '#ff8833',
    position: [0, 12, 0],
  },
  // Deep-Space Industrial Forge — Outer Heavy Mining Citadel
  {
    id: 'deep-forge-citadel',
    type: 'industrial',
    name: 'Deep Forge Citadel',
    scale: 3.0,
    orbitRadius: 145,
    orbitSpeed: 0.009,
    orbitTilt: 0.12,
    orbitInitialAngle: 2.3,
    rotationSpeed: [0, 0.015, 0],
    techColor: '#33aaff',
    engineColor: '#ff6622',
    position: [0, -18, 0],
  },
  // Deep-Space Research & Comms Array — Deep Space Relay
  {
    id: 'aethelgard-relay',
    type: 'orbital',
    name: 'Aethelgard Deep Relay',
    scale: 2.8,
    orbitRadius: 175,
    orbitSpeed: 0.007,
    orbitTilt: 0.18,
    orbitInitialAngle: 3.8,
    rotationSpeed: [0, 0.02, 0],
    techColor: '#66eeff',
    engineColor: '#ffaa33',
    position: [0, 24, 0],
  },
  // Massive Outer Ring Haven — Outer System Starport
  {
    id: 'chronos-haven',
    type: 'ring',
    name: 'Chronos Starport',
    scale: 4.2,
    orbitRadius: 210,
    orbitSpeed: 0.005,
    orbitTilt: 0.05,
    orbitInitialAngle: 5.1,
    rotationSpeed: [0, 0.008, 0],
    techColor: '#55ccff',
    engineColor: '#ff7722',
    position: [0, -8, 0],
  },
  // Far Frontier Industrial Outpost
  {
    id: 'vanguard-outpost',
    type: 'industrial',
    name: 'Vanguard Deep Outpost',
    scale: 3.2,
    orbitRadius: 250,
    orbitSpeed: 0.004,
    orbitTilt: 0.14,
    orbitInitialAngle: 1.5,
    rotationSpeed: [0, 0.018, 0],
    techColor: '#38bdf8',
    engineColor: '#f97316',
    position: [0, 30, 0],
  },
];

// ─── Asteroid Field Configurations ──────────────────────────────

export interface AsteroidFieldConfig {
  id: string;
  innerRadius: number;
  outerRadius: number;
  count: number;
  ySpread: number;          // vertical spread
  orbitSpeed: number;       // belt orbital speed
  sizeRange: [number, number]; // min/max scale
  // Optional position offset for non-centered fields
  center?: [number, number, number];
}

export const ASTEROID_FIELDS: AsteroidFieldConfig[] = [
  // Main asteroid belt (Mars-Jupiter gap)
  {
    id: 'main-belt',
    innerRadius: 30,
    outerRadius: 36,
    count: 400,
    ySpread: 3.5,
    orbitSpeed: 0.03,
    sizeRange: [0.2, 0.9],
  },
  // Outer Kuiper-style belt
  {
    id: 'kuiper-belt',
    innerRadius: 92,
    outerRadius: 115,
    count: 350,
    ySpread: 6.0,
    orbitSpeed: 0.008,
    sizeRange: [0.15, 0.6],
  },
  // Far background scatter
  {
    id: 'far-background',
    innerRadius: 160,
    outerRadius: 280,
    count: 250,
    ySpread: 40.0,
    orbitSpeed: 0.003,
    sizeRange: [0.3, 1.8],
  },
  // Deep space cluster — upper hemisphere
  {
    id: 'deep-cluster-upper',
    innerRadius: 200,
    outerRadius: 350,
    count: 180,
    ySpread: 80.0,
    orbitSpeed: 0.002,
    sizeRange: [0.5, 2.5],
    center: [0, 40, 0],
  },
];

// Per-tier asteroid counts (multiplier)
export function getAsteroidCountMultiplier(tier: 'high' | 'medium' | 'low'): number {
  switch (tier) {
    case 'high': return 1.0;
    case 'medium': return 0.6;
    case 'low': return 0.3;
  }
}
