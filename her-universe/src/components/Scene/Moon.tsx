// ============================================================
// Her Universe — Moon Component
// ============================================================
// A small moon that continuously orbits its parent planet.
// Uses a grey/silver shader for realistic lunar appearance.
// ============================================================

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { getOrbitPosition } from '../../utils/orbitMath';
import {
  NOISE_GLSL,
  ATMOSPHERE_VERTEX,
  ATMOSPHERE_FRAGMENT,
} from '../../shaders/planetShaders';

interface MoonProps {
  name: string;
  size?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  orbitTilt?: number;
  color?: string;
  glowColor?: string;
  showLabel?: boolean;
  hideBadge?: boolean;
}

// ── Moon surface shader ─────────────────────────────────────────
const MOON_VERTEX = /* glsl */ `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const MOON_FRAGMENT = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform vec3 uSunDirection;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vec3 pos = vPosition * 4.0;

  // Lunar surface — grey with craters
  float terrain = fbm(pos, 4);
  float detail = snoise(pos * 6.0) * 0.2;

  // Crater patterns
  float craters = 0.0;
  for (int i = 0; i < 15; i++) {
    vec3 craterPos = vec3(
      sin(float(i) * 2.1 + 0.5) * 1.2,
      cos(float(i) * 1.4 + 1.2) * 1.2,
      sin(float(i) * 3.3 + 2.1) * 1.2
    );
    float dist = length(vPosition - craterPos);
    float crater = smoothstep(0.22, 0.04, dist);
    craters += crater * 0.12;
  }

  // Moon palette — silver/grey tones
  vec3 lightGrey = vec3(0.78, 0.76, 0.72);
  vec3 midGrey = vec3(0.58, 0.56, 0.52);
  vec3 darkGrey = vec3(0.38, 0.36, 0.34);

  vec3 baseColor = mix(lightGrey, midGrey, smoothstep(-0.3, 0.3, terrain));
  baseColor = mix(baseColor, darkGrey, smoothstep(0.1, 0.5, terrain + detail));
  baseColor -= craters * 0.8;

  // Mare (dark patches — like the real moon)
  float mare = snoise(pos * 1.5 + vec3(3.0, 1.0, 2.0));
  float mareMask = smoothstep(0.2, 0.5, mare);
  vec3 mareColor = vec3(0.32, 0.30, 0.30);
  baseColor = mix(baseColor, mareColor, mareMask * 0.35);

  // Soft omnidirectional lighting — always visible, no harsh shadow
  float diffuse = max(dot(vNormal, uSunDirection), 0.0);
  float ambient = 0.55;

  vec3 lit = baseColor * (diffuse * 0.5 + ambient);

  gl_FragColor = vec4(lit, 1.0);
}
`;

export function Moon({
  name,
  size = 0.35,
  orbitRadius = 3.5,
  orbitSpeed = 1.2,
  orbitTilt = 0.1,
  glowColor: _glowColor = '#c0c0d0',
  showLabel = true,
  hideBadge = false,
}: MoonProps) {
  const moonGroupRef = useRef<THREE.Group>(null);
  const moonMeshRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  // Moon shader material
  const moonMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: MOON_VERTEX,
        fragmentShader: MOON_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uSunDirection: { value: new THREE.Vector3(1, 0.3, 0).normalize() },
        },
      }),
    []
  );

  // Subtle glow around moon
  const glowMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ATMOSPHERE_VERTEX,
        fragmentShader: ATMOSPHERE_FRAGMENT,
        uniforms: {
          uColor: { value: new THREE.Vector3(0.75, 0.75, 0.85) },
          uIntensity: { value: 0.3 },
          uPower: { value: 4.0 },
        },
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useEffect(
    () => () => {
      moonMaterial.dispose();
      glowMaterial.dispose();
    },
    [moonMaterial, glowMaterial]
  );

  useFrame((state, delta) => {
    if (!moonGroupRef.current || !moonMeshRef.current) return;

    // Orbit the parent planet
    angleRef.current += orbitSpeed * delta;
    const moonPos = getOrbitPosition(
      angleRef.current,
      orbitRadius,
      orbitTilt,
      0.05, // subtle lunar eccentricity
      0.4,
      0.2
    );
    moonGroupRef.current.position.copy(moonPos);

    // Self-rotation
    moonMeshRef.current.rotation.y += delta * 0.3;

    // Update shader uniforms
    moonMaterial.uniforms.uTime.value = state.clock.elapsedTime;

    // Sun direction relative to moon (approximate — from origin)
    const moonWorldPos = new THREE.Vector3();
    moonGroupRef.current.getWorldPosition(moonWorldPos);
    const sunDir = new THREE.Vector3(0, 0, 0).sub(moonWorldPos).normalize();
    moonMaterial.uniforms.uSunDirection.value.copy(sunDir);
  });

  return (
    <group ref={moonGroupRef}>
      {/* Moon sphere */}
      <mesh ref={moonMeshRef} material={moonMaterial}>
        <sphereGeometry args={[size, 32, 32]} />
      </mesh>

      {/* Subtle glow */}
      <mesh material={glowMaterial}>
        <sphereGeometry args={[size * 1.2, 24, 24]} />
      </mesh>

      {/* Moon label */}
      {showLabel && !hideBadge && (
        <Html
          position={[0, size + 0.5, 0]}
          center
          distanceFactor={60}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            opacity: 0.9,
          }}
        >
          <div
            style={{
              fontFamily: "'Outfit', 'Inter', sans-serif",
              fontSize: '9px',
              fontWeight: 500,
              letterSpacing: '0.1em',
              color: 'rgba(255, 255, 255, 0.9)',
              background: 'rgba(10, 10, 30, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 0 8px rgba(200, 200, 255, 0.2)',
              padding: '2px 6px',
              borderRadius: '10px',
              backdropFilter: 'blur(3px)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <span>🌙</span>
            <span>{name}</span>
          </div>
        </Html>
      )}
    </group>
  );
}
