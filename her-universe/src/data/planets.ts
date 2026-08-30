// ============================================================
// Her Universe — Planet Configurations
// ============================================================

import type { PlanetShaderType } from '../shaders/planetShaders';

export interface PlanetConfig {
  name: string;
  subtitle?: string;
  description?: string;
  tag?: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;      // radians per second (mean motion n)
  orbitTilt: number;       // inclination i in radians
  orbitEccentricity?: number; // Keplerian eccentricity e in [0, 0.95)
  orbitRotation?: number;     // argument of periapsis omega in radians
  ascendingNode?: number;     // longitude of ascending node Omega in radians
  rotationSpeed: number;   // radians per second
  axialTilt: number;       // radians
  color: string;           // primary color
  colorB?: string;         // secondary color
  colorC?: string;         // tertiary color
  emissive?: string;       // glow color
  emissiveIntensity?: number;
  glowColor?: string;      // atmospheric halo color
  glowSize?: number;
  focusDistance?: number;  // custom camera distance when focused
  rings?: {
    innerRadius: number;
    outerRadius: number;
    color: string;
    opacity: number;
  };
  initialAngle: number;
  texture?: string;
  shaderType?: PlanetShaderType;
}

// ─── Sun Configuration ──────────────────────────────────────────
export const SUN_CONFIG: PlanetConfig = {
  name: 'The Sun',
  subtitle: 'The Heart of the Universe',
  description: 'Like the Sun warms every corner of this galaxy, your smile brings warmth and light to my life every single day.',
  tag: 'Eternal Light',
  size: 3.8,
  orbitRadius: 0,
  orbitSpeed: 0,
  orbitTilt: 0,
  rotationSpeed: 0.15,
  axialTilt: 0,
  color: '#ffcc33',
  colorB: '#ff8800',
  colorC: '#ffeedd',
  emissive: '#ff9900',
  emissiveIntensity: 1.0,
  glowColor: '#ffbb44',
  glowSize: 1.6,
  focusDistance: 16,
  initialAngle: 0,
};

// ─── All Planetary Configurations ───────────────────────────────
export const PLANETS: PlanetConfig[] = [
  {
    name: 'Mercury',
    subtitle: 'The Swift Messenger',
    description: 'Closest to the central flame, quick and full of energy — just like the fast excitement of the first day we met.',
    tag: 'First Spark',
    size: 0.9,
    orbitRadius: 9,
    orbitEccentricity: 0.205,
    orbitRotation: 0.50,
    ascendingNode: 0.84,
    orbitSpeed: 0.55,
    orbitTilt: 0.12,
    rotationSpeed: 0.4,
    axialTilt: 0.01,
    color: '#d4c2b0',
    colorB: '#a38d78',
    colorC: '#756350',
    emissive: '#664d38',
    emissiveIntensity: 0.25,
    glowColor: '#e0c8b0',
    glowSize: 1.3,
    focusDistance: 5.5,
    initialAngle: 0.8,
    texture: 'mercury.jpg',
    shaderType: 'mercury',
  },
  {
    name: 'Venus (Padu planet)',
    subtitle: 'The Morning & Evening Star',
    description: 'Named after beauty and radiance. Brilliant, luminous, and impossible not to gaze at, exactly like you.',
    tag: 'Pure Radiance',
    size: 1.4,
    orbitRadius: 14,
    orbitEccentricity: 0.05,
    orbitRotation: 0.95,
    ascendingNode: 1.34,
    orbitSpeed: 0.38,
    orbitTilt: 0.06,
    rotationSpeed: -0.25,
    axialTilt: 3.09,
    color: '#ffd166',
    colorB: '#e69d45',
    colorC: '#c46820',
    emissive: '#995814',
    emissiveIntensity: 0.3,
    glowColor: '#ffc870',
    glowSize: 1.35,
    focusDistance: 7.0,
    initialAngle: 2.2,
    texture: 'venus.jpg',
    shaderType: 'venus',
  },
  {
    name: 'Earth (Heaven)',
    subtitle: 'Our Sanctuary of Life',
    description: 'Out of billions of galaxies and infinite worlds, I found you right here on this beautiful blue oasis.',
    tag: 'Home with You',
    size: 1.6,
    orbitRadius: 20,
    orbitEccentricity: 0.06,
    orbitRotation: 1.78,
    ascendingNode: 0.00,
    orbitSpeed: 0.28,
    orbitTilt: 0.03,
    rotationSpeed: 0.6,
    axialTilt: 0.41,
    color: '#2a9df4',
    colorB: '#2e7d32',
    colorC: '#e0f7fa',
    emissive: '#104d80',
    emissiveIntensity: 0.28,
    glowColor: '#4db5ff',
    glowSize: 1.4,
    focusDistance: 7.8,
    initialAngle: 3.7,
    texture: 'earth.jpg',
    shaderType: 'earth',
  },
  {
    name: 'Mars',
    subtitle: 'The Crimson Heart',
    description: 'Bold, passionate, and fiercely bright in the night sky — a symbol of every unforgettable adventure we share.',
    tag: 'Passion & Wonder',
    size: 1.2,
    orbitRadius: 26,
    orbitEccentricity: 0.14,
    orbitRotation: 2.86,
    ascendingNode: 0.86,
    orbitSpeed: 0.22,
    orbitTilt: 0.03,
    rotationSpeed: 0.55,
    axialTilt: 0.44,
    color: '#ff5722',
    colorB: '#c43000',
    colorC: '#8a1c00',
    emissive: '#8c2400',
    emissiveIntensity: 0.3,
    glowColor: '#ff7043',
    glowSize: 1.35,
    focusDistance: 6.5,
    initialAngle: 1.4,
    texture: 'mars.jpg',
    shaderType: 'mars',
  },
  {
    name: 'Jupiter',
    subtitle: 'The Majestic Guardian',
    description: 'The gentle giant protecting our solar system. Infinite in scale, just like how deeply I care about you.',
    tag: 'Infinite Care',
    size: 3.4,
    orbitRadius: 38,
    orbitEccentricity: 0.08,
    orbitRotation: 0.48,
    ascendingNode: 1.75,
    orbitSpeed: 0.15,
    orbitTilt: 0.02,
    rotationSpeed: 0.8,
    axialTilt: 0.05,
    color: '#f4a261',
    colorB: '#bc6c25',
    colorC: '#dda15e',
    emissive: '#663a14',
    emissiveIntensity: 0.22,
    glowColor: '#ffb703',
    glowSize: 1.3,
    focusDistance: 13.5,
    initialAngle: 0.4,
    texture: 'jupiter.jpg',
    shaderType: 'jupiter',
  },
  {
    name: 'Saturn',
    subtitle: 'The Crowned Jewel',
    description: 'Adorned with celestial halos that shimmer in starlight. Elegant and timeless in every single way.',
    tag: 'Crowned Beauty',
    size: 2.8,
    orbitRadius: 50,
    orbitEccentricity: 0.09,
    orbitRotation: 1.62,
    ascendingNode: 1.98,
    orbitSpeed: 0.11,
    orbitTilt: 0.04,
    rotationSpeed: 0.7,
    axialTilt: 0.47,
    color: '#eed7a1',
    colorB: '#d4a373',
    colorC: '#b07d4b',
    emissive: '#614324',
    emissiveIntensity: 0.22,
    glowColor: '#f3d59b',
    glowSize: 1.3,
    focusDistance: 14.0,
    initialAngle: 2.6,
    texture: 'saturn.jpg',
    shaderType: 'saturn',
    rings: {
      innerRadius: 3.6,
      outerRadius: 6.2,
      color: '#e6c587',
      opacity: 0.85,
    },
  },
  {
    name: 'Uranus',
    subtitle: 'The Emerald Horizon',
    description: 'A serene icy cyan jewel that spins on its own unique axis — because being wonderfully unique is what makes you so special.',
    tag: 'Unique & Rare',
    size: 2.2,
    orbitRadius: 63,
    orbitEccentricity: 0.07,
    orbitRotation: 1.70,
    ascendingNode: 1.29,
    orbitSpeed: 0.08,
    orbitTilt: 0.01,
    rotationSpeed: -0.45,
    axialTilt: 1.71,
    color: '#70e0d0',
    colorB: '#38b6ab',
    colorC: '#1a756d',
    emissive: '#135c54',
    emissiveIntensity: 0.25,
    glowColor: '#80fff0',
    glowSize: 1.35,
    focusDistance: 10.0,
    initialAngle: 4.5,
    texture: 'uranus.jpg',
    shaderType: 'uranus',
    rings: {
      innerRadius: 2.8,
      outerRadius: 4.5,
      color: '#a8f0ea',
      opacity: 0.85,
    },
  },
  {
    name: 'Neptune',
    subtitle: 'The Deep Celestial Ocean',
    description: 'Mysterious, calm, and as deep as the ocean blues. A world of infinite dreams and starry skies.',
    tag: 'Deep Wonder',
    size: 2.1,
    orbitRadius: 76,
    orbitEccentricity: 0.05,
    orbitRotation: 0.77,
    ascendingNode: 2.30,
    orbitSpeed: 0.06,
    orbitTilt: 0.03,
    rotationSpeed: 0.5,
    axialTilt: 0.49,
    color: '#4361ee',
    colorB: '#2b3990',
    colorC: '#161e54',
    emissive: '#1a237e',
    emissiveIntensity: 0.28,
    glowColor: '#4cc9f0',
    glowSize: 1.35,
    focusDistance: 9.5,
    initialAngle: 5.8,
    texture: 'neptune.jpg',
    shaderType: 'neptune',
  },
];

// ─── Prapti's Special Planet ────────────────────────────────────
export const SPECIAL_PLANET: PlanetConfig & {
  glowColor: string;
  glowIntensity: number;
  planetRadius: number;
} = {
  name: 'Prapti',
  subtitle: 'The Center of My Universe',
  description: 'The magical sphere carrying all our precious moments, smiles, and memories. Click any photo anchor on its surface to revisit our story.',
  tag: 'Happy Birthday ❤️',
  size: 2.2,
  orbitRadius: 89,
  orbitEccentricity: 0.18,
  orbitRotation: 2.40,
  ascendingNode: 0.50,
  orbitSpeed: 0.045,
  orbitTilt: 0.05,
  rotationSpeed: 0.25,
  axialTilt: 0.2,
  color: '#ff69b4',
  colorB: '#ff1493',
  colorC: '#ffb6c1',
  emissive: '#ff2a8d',
  emissiveIntensity: 0.5,
  initialAngle: 0.2,
  glowColor: '#ff80bf',
  glowIntensity: 2.2,
  planetRadius: 2.2,
  focusDistance: 9.0,
};
