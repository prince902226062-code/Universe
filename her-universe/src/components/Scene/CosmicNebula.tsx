// ============================================================
// Her Universe — Cosmic Nebula Background
// ============================================================
// Generates stunning, multi-layered deep space nebulas matching
// the reference images (Butterfly Nebula, Rosette Rose Nebula,
// and Carina Cosmic Pillars with rich magenta, amber, and cyan dust).
// ============================================================

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NOISE_GLSL } from '../../shaders/planetShaders';

// ── Volumetric Nebula Shader ────────────────────────────────────
const NEBULA_VERTEX = /* glsl */ `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const NEBULA_FRAGMENT = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform vec3 uColorCore;
uniform vec3 uColorMid;
uniform vec3 uColorOuter;
uniform vec3 uColorDark;
uniform float uDensity;
uniform float uNoiseScale;
uniform float uSeed;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vec2 uv = (vUv - 0.5) * 2.0;
  float dist = length(uv);
  
  // Fast smooth Gaussian radial falloff
  float radialFalloff = exp(-3.2 * dist * dist);
  if (radialFalloff <= 0.008) {
    discard;
  }

  vec3 pos = vec3(uv * uNoiseScale, uSeed);
  float t = uTime * 0.015;

  // Ultra-fast lightweight 2-octave procedural cloud noise
  float n1 = snoise(pos + vec3(t * 0.4, -t * 0.2, 0.0));
  float n2 = snoise(pos * 2.2 + vec3(-t * 0.2, t * 0.3, 0.0)) * 0.5;
  float gasDensity = n1 * 0.65 + n2 * 0.35;

  // Color mapping across density
  vec3 color = mix(uColorDark, uColorOuter, smoothstep(-0.3, 0.2, gasDensity));
  color = mix(color, uColorMid, smoothstep(0.1, 0.55, gasDensity));
  color = mix(color, uColorCore, smoothstep(0.5, 0.9, gasDensity));

  // Radiant core highlight
  color += uColorCore * smoothstep(0.6, 1.0, gasDensity) * 0.5;

  float alpha = smoothstep(-0.3, 0.65, gasDensity) * radialFalloff * uDensity;

  gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
}
`;

interface NebulaCloudConfig {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number];
  core: [number, number, number];
  mid: [number, number, number];
  outer: [number, number, number];
  dark: [number, number, number];
  density: number;
  noiseScale: number;
  seed: number;
}

export function CosmicNebula() {
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<THREE.ShaderMaterial[]>([]);

  // Balanced panoramic celestial nebula distribution covering ALL skies
  const nebulaConfigs = useMemo<NebulaCloudConfig[]>(() => [
    // 1. Butterfly Nebula Wings (Right sky / East) — Radiant Violet, Magenta, Crimson & Cyan Core
    {
      position: [360, 110, -420],
      rotation: [0.15, -0.35, 0.25],
      scale: [520, 380],
      core: [0.75, 0.95, 1.0],     // glowing celestial cyan/white core
      mid: [1.0, 0.18, 0.68],      // rich electric magenta
      outer: [1.0, 0.48, 0.08],    // fiery crimson-amber wings
      dark: [0.30, 0.02, 0.40],    // deep cosmic violet dust
      density: 0.45,
      noiseScale: 2.0,
      seed: 14.5,
    },
    // 2. High Top-Right Celestial Veil (Upper East sky) — Electric Cyan & Lavender Stardust
    {
      position: [220, 240, -360],
      rotation: [-0.2, -0.4, 0.6],
      scale: [480, 360],
      core: [0.25, 0.90, 1.0],     // electric turquoise core
      mid: [0.75, 0.35, 0.95],     // bright amethyst purple
      outer: [0.95, 0.25, 0.55],   // rose dust
      dark: [0.10, 0.04, 0.32],    // indigo background
      density: 0.42,
      noiseScale: 2.1,
      seed: 33.2,
    },
    // 3. Rosette Cosmic Rose Nebula (Top-Center sky) — Fiery Crimson Ring with Radiant Golden Amber Heart
    {
      position: [20, 230, -460],
      rotation: [-0.1, 0.2, -0.15],
      scale: [560, 480],
      core: [1.0, 0.88, 0.35],     // warm golden stellar heart
      mid: [1.0, 0.38, 0.12],      // vibrant solar orange
      outer: [0.92, 0.12, 0.42],   // intense rose-pink & crimson perimeter
      dark: [0.35, 0.02, 0.18],    // dark interstellar dust rim
      density: 0.48,
      noiseScale: 1.8,
      seed: 42.8,
    },
    // 4. Carina Pillars & Mystic Lagoon (Center-Back sky) — Towering Amber Clouds & Electric Blue Ionization
    {
      position: [-100, 90, -540],
      rotation: [0.2, 0.1, -0.4],
      scale: [680, 440],
      core: [0.20, 0.88, 1.0],     // ionization cyan
      mid: [1.0, 0.58, 0.15],      // towering amber gas pillars
      outer: [0.82, 0.18, 0.48],   // deep purple/magenta edge
      dark: [0.15, 0.05, 0.28],    // dark molecular cloud
      density: 0.44,
      noiseScale: 2.2,
      seed: 88.1,
    },
    // 5. Far Right Horizon (Lower East sky) — Warm Golden Star-Forming Rift
    {
      position: [440, -60, -380],
      rotation: [0.3, -0.2, -0.3],
      scale: [500, 360],
      core: [1.0, 0.92, 0.70],     // radiant starlight gold
      mid: [1.0, 0.50, 0.18],      // rich fiery amber
      outer: [0.88, 0.15, 0.38],   // crimson dust
      dark: [0.22, 0.04, 0.18],    // silhouette gas
      density: 0.40,
      noiseScale: 2.3,
      seed: 205.6,
    },
    // 6. Left Sky Clouds (West sky) — Soft Feathered Violet & Rose Dust
    {
      position: [-360, 140, -420],
      rotation: [-0.25, 0.4, -0.3],
      scale: [520, 420],
      core: [0.90, 0.50, 0.95],    // soft lavender
      mid: [0.85, 0.20, 0.50],     // rose magenta
      outer: [0.55, 0.10, 0.45],   // deep violet
      dark: [0.18, 0.02, 0.25],    // cosmic purple
      density: 0.38,
      noiseScale: 2.0,
      seed: 168.4,
    },
    // 7. Lower Left Sky (Southwest) — Deep Crimson & Fiery Amber Lagoon
    {
      position: [-280, -110, -460],
      rotation: [0.35, 0.15, 0.5],
      scale: [500, 360],
      core: [1.0, 0.70, 0.25],     // warm amber
      mid: [0.95, 0.28, 0.20],     // fiery orange-red
      outer: [0.65, 0.08, 0.35],   // wine magenta
      dark: [0.20, 0.03, 0.15],    // abyssal dust
      density: 0.36,
      noiseScale: 2.2,
      seed: 95.7,
    },
    // 8. Lower Right Sky (Southeast) — Electric Aqua & Cyan Starfield
    {
      position: [260, -130, -440],
      rotation: [-0.3, -0.2, 0.4],
      scale: [460, 340],
      core: [0.40, 0.95, 1.0],     // brilliant cyan
      mid: [0.20, 0.60, 0.90],     // deep ocean blue
      outer: [0.50, 0.20, 0.75],   // violet halo
      dark: [0.08, 0.05, 0.24],    // dark blue void
      density: 0.38,
      noiseScale: 2.4,
      seed: 142.1,
    },
  ], []);

  // Create shader materials
  const materials = useMemo(() => {
    return nebulaConfigs.map((cfg) => {
      return new THREE.ShaderMaterial({
        vertexShader: NEBULA_VERTEX,
        fragmentShader: NEBULA_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uColorCore: { value: new THREE.Vector3(...cfg.core) },
          uColorMid: { value: new THREE.Vector3(...cfg.mid) },
          uColorOuter: { value: new THREE.Vector3(...cfg.outer) },
          uColorDark: { value: new THREE.Vector3(...cfg.dark) },
          uDensity: { value: cfg.density },
          uNoiseScale: { value: cfg.noiseScale },
          uSeed: { value: cfg.seed },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
    });
  }, [nebulaConfigs]);

  materialsRef.current = materials;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    materialsRef.current.forEach((mat) => {
      mat.uniforms.uTime.value = t;
    });
  });

  useEffect(() => {
    return () => {
      materials.forEach((mat) => mat.dispose());
    };
  }, [materials]);

  return (
    <group ref={groupRef}>
      {nebulaConfigs.map((cfg, i) => (
        <mesh
          key={i}
          position={cfg.position}
          rotation={cfg.rotation}
          material={materials[i]}
        >
          <planeGeometry args={[cfg.scale[0], cfg.scale[1]]} />
        </mesh>
      ))}
    </group>
  );
}
