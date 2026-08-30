// ============================================================
// Her Universe — Planet Component
// ============================================================

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { PlanetConfig } from '../../data/planets';
import { OrbitPath } from './OrbitPath';
import { getOrbitPosition } from '../../utils/orbitMath';
import { Moon } from './Moon';
import {
  PLANET_VERTEX,
  PLANET_FRAGMENT_SHADERS,
  RING_VERTEX,
  RING_FRAGMENT,
  type PlanetShaderType,
} from '../../shaders/planetShaders';

interface PlanetProps {
  config: PlanetConfig;
  isFocused?: boolean;
  anyFocused?: boolean;
  onPlanetClick?: (config: PlanetConfig) => void;
  registerRef?: (name: string, group: THREE.Group | null) => void;
  // ── Quiz game props ──────────────────────────────────────
  isGameMode?: boolean;    // quiz is active — planets are clickable answers
  isGameWrong?: boolean;   // this planet was just clicked wrong (shake + red tint)
  isGameCorrect?: boolean; // this planet was just clicked correct (pink glow pulse)
}

// ── Orbital motion hook ─────────────────────────────────────────
function useOrbit(
  config: PlanetConfig,
  registerRef?: (name: string, group: THREE.Group | null) => void
) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(config.initialAngle);

  useEffect(() => {
    if (groupRef.current && registerRef) {
      registerRef(config.name, groupRef.current);
    }
    return () => {
      registerRef?.(config.name, null);
    };
  }, [config.name, registerRef]);

  useFrame((_, delta) => {
    if (!groupRef.current || !meshRef.current) return;
    angleRef.current += config.orbitSpeed * delta;
    const pos = getOrbitPosition(
      angleRef.current,
      config.orbitRadius,
      config.orbitTilt,
      config.orbitEccentricity ?? 0.15,
      config.orbitRotation ?? 0,
      config.ascendingNode ?? 0
    );
    groupRef.current.position.copy(pos);
    meshRef.current.rotation.y += config.rotationSpeed * delta;
  });

  return { groupRef, meshRef };
}

// ── Planet Ring with Shader (Saturn & Uranus) ───────────────────
function ShaderRings({ config }: { config: PlanetConfig }) {
  if (!config.rings) return null;

  const isUranus = config.name === 'Uranus';

  const innerColor = isUranus ? [0.45, 0.75, 0.85] : [0.75, 0.65, 0.45];
  const midColor = isUranus ? [0.85, 0.96, 0.98] : [0.92, 0.85, 0.68];
  const outerColor = isUranus ? [0.60, 0.85, 0.92] : [0.82, 0.75, 0.58];

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: RING_VERTEX,
        fragmentShader: RING_FRAGMENT,
        uniforms: {
          uInnerRadius: { value: config.rings!.innerRadius },
          uOuterRadius: { value: config.rings!.outerRadius },
          uSunDirection: { value: new THREE.Vector3(0, 0, 0) },
          uTime: { value: 0 },
          uColorInner: { value: new THREE.Vector3(...innerColor) },
          uColorMid: { value: new THREE.Vector3(...midColor) },
          uColorOuter: { value: new THREE.Vector3(...outerColor) },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [config.rings, isUranus]
  );

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} material={material}>
      <ringGeometry args={[config.rings.innerRadius, config.rings.outerRadius, 128]} />
    </mesh>
  );
}

// ── Planet Label ────────────────────────────────────────────────
function PlanetBadge({
  name,
  size,
  isHovered,
  hideBadge,
  onClick,
}: {
  name: string;
  size: number;
  isHovered: boolean;
  hideBadge: boolean;
  onClick: () => void;
}) {
  if (hideBadge) return null;

  return (
    <Html
      position={[0, size + 1.2, 0]}
      center
      distanceFactor={60}
      style={{
        pointerEvents: 'auto',
        userSelect: 'none',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        opacity: isHovered ? 1 : 0.8,
        transform: isHovered ? 'scale(1.1)' : 'scale(0.95)',
        cursor: 'pointer',
      }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        style={{
          fontFamily: "'Outfit', 'Inter', sans-serif",
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.12em',
          color: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
          background: isHovered ? 'rgba(30, 20, 50, 0.85)' : 'rgba(5, 5, 20, 0.65)',
          border: isHovered ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: isHovered ? '0 0 12px rgba(255,255,255,0.3)' : 'none',
          padding: '2px 8px',
          borderRadius: '12px',
          backdropFilter: 'blur(4px)',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease',
        }}
      >
        {name}
      </div>
    </Html>
  );
}

// ── Shader-based planet mesh ────────────────────────────────────
function ShaderPlanetMesh({
  config,
  anyFocused,
  onPlanetClick,
  registerRef,
  isGameMode,
  isGameWrong,
  isGameCorrect,
}: PlanetProps) {
  const { gl } = useThree();
  const { groupRef, meshRef } = useOrbit(config, registerRef);
  const [isHovered, setIsHovered] = useState(false);

  // ── Game effect refs ─────────────────────────────────────
  const gameGlowRef = useRef<THREE.Mesh>(null);
  const shakeTimeRef = useRef(0);
  const shakeActiveRef = useRef(false);
  const glowActiveRef = useRef(false);
  const glowTimeRef = useRef(0);

  // Trigger shake when isGameWrong flips on
  useEffect(() => {
    if (isGameWrong) {
      shakeTimeRef.current = 0;
      shakeActiveRef.current = true;
    }
  }, [isGameWrong]);

  // Trigger glow when isGameCorrect flips on
  useEffect(() => {
    if (isGameCorrect) {
      glowTimeRef.current = 0;
      glowActiveRef.current = true;
    }
  }, [isGameCorrect]);

  const shaderType = config.shaderType as PlanetShaderType | undefined;
  const fragmentShader = shaderType ? PLANET_FRAGMENT_SHADERS[shaderType] : null;

  const material = useMemo(() => {
    if (!fragmentShader) {
      // Fallback to basic material for planets without shaders
      return new THREE.MeshStandardMaterial({
        color: config.color,
        emissive: config.emissive ? new THREE.Color(config.emissive) : new THREE.Color(config.color),
        emissiveIntensity: config.emissiveIntensity ?? 0.2,
        roughness: 0.7,
        metalness: 0.1,
      });
    }

    return new THREE.ShaderMaterial({
      vertexShader: PLANET_VERTEX,
      fragmentShader: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSunDirection: { value: new THREE.Vector3(1, 0.3, 0).normalize() },
      },
    });
  }, [fragmentShader, config]);

  // Update shader uniforms every frame + game effects
  useFrame((state, delta) => {
    if (material instanceof THREE.ShaderMaterial) {
      material.uniforms.uTime.value = state.clock.elapsedTime;

      // Compute sun direction relative to this planet
      if (groupRef.current) {
        const planetPos = new THREE.Vector3();
        groupRef.current.getWorldPosition(planetPos);
        // Sun is at origin
        const sunDir = new THREE.Vector3(0, 0, 0).sub(planetPos).normalize();
        material.uniforms.uSunDirection.value.copy(sunDir);
      }
    }

    // ── Shake effect (wrong answer) ────────────────────────
    if (shakeActiveRef.current && meshRef.current) {
      shakeTimeRef.current += delta;
      const t = shakeTimeRef.current;
      const shakeDuration = 0.55;
      if (t < shakeDuration) {
        const decay = 1 - t / shakeDuration;
        meshRef.current.position.x = Math.sin(t * 60) * 0.18 * decay;
        meshRef.current.position.z = Math.cos(t * 55) * 0.12 * decay;
      } else {
        meshRef.current.position.x = 0;
        meshRef.current.position.z = 0;
        shakeActiveRef.current = false;
      }
    }

    // ── Correct glow pulse ─────────────────────────────────
    if (glowActiveRef.current && gameGlowRef.current) {
      glowTimeRef.current += delta;
      const t = glowTimeRef.current;
      const glowDuration = 1.0;
      if (t < glowDuration) {
        const pulse = Math.sin(t * Math.PI / glowDuration);
        const mat = gameGlowRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = pulse * 0.45;
        gameGlowRef.current.scale.setScalar(1 + pulse * 0.15);
      } else {
        const mat = gameGlowRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = 0;
        gameGlowRef.current.scale.setScalar(1);
        glowActiveRef.current = false;
      }
    }
  });

  useEffect(
    () => () => {
      material.dispose();
    },
    [material]
  );

  const handleClick = useCallback(
    (e?: ThreeEvent<MouseEvent>) => {
      e?.stopPropagation();
      onPlanetClick?.(config);
    },
    [config, onPlanetClick]
  );

  // ── Wrong-click red tint overlay material ─────────────────
  const wrongTintMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ff2244',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.FrontSide,
      }),
    []
  );
  const correctGlowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ff80c0',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.FrontSide,
      }),
    []
  );

  useEffect(() => {
    if (isGameWrong) {
      wrongTintMaterial.opacity = 0.3;
      setTimeout(() => { wrongTintMaterial.opacity = 0; }, 550);
    }
  }, [isGameWrong, wrongTintMaterial]);

  useEffect(() => () => {
    wrongTintMaterial.dispose();
    correctGlowMaterial.dispose();
  }, [wrongTintMaterial, correctGlowMaterial]);

  return (
    <group ref={groupRef}>
      <group rotation={[config.axialTilt, 0, 0]}>
        <mesh
          ref={meshRef}
          material={material}
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setIsHovered(true);
            gl.domElement.style.cursor = isGameMode ? 'crosshair' : 'pointer';
          }}
          onPointerOut={() => {
            setIsHovered(false);
            gl.domElement.style.cursor = 'default';
          }}
        >
          <sphereGeometry args={[config.size, 64, 64]} />
        </mesh>

        {/* Wrong-answer red tint overlay */}
        {isGameWrong && (
          <mesh scale={1.005} material={wrongTintMaterial}>
            <sphereGeometry args={[config.size, 32, 32]} />
          </mesh>
        )}

        {/* Correct-answer pink glow */}
        <mesh ref={gameGlowRef} scale={1.0} material={correctGlowMaterial}>
          <sphereGeometry args={[config.size * 1.08, 32, 32]} />
        </mesh>

        <ShaderRings config={config} />
        <PlanetBadge
          name={config.name}
          size={config.size}
          isHovered={isHovered}
          hideBadge={!!anyFocused}
          onClick={handleClick}
        />
      </group>

      {/* Earth's Moon — "Prince" */}
      {config.name === 'Earth' && (
        <Moon
          name="Moon"
          size={0.4}
          orbitRadius={3.2}
          orbitSpeed={0.8}
          orbitTilt={0.09}
        />
      )}
    </group>
  );
}

// ── Public Planet component ──────────────────────────────────────
export function Planet({
  config,
  isFocused,
  anyFocused,
  onPlanetClick,
  registerRef,
  isGameMode,
  isGameWrong,
  isGameCorrect,
}: PlanetProps) {
  return (
    <>
      <OrbitPath
        radius={config.orbitRadius}
        tilt={config.orbitTilt}
        eccentricity={config.orbitEccentricity ?? 0.15}
        orbitRotation={config.orbitRotation ?? 0}
        ascendingNode={config.ascendingNode ?? 0}
      />
      <ShaderPlanetMesh
        config={config}
        isFocused={isFocused}
        anyFocused={anyFocused}
        onPlanetClick={onPlanetClick}
        registerRef={registerRef}
        isGameMode={isGameMode}
        isGameWrong={isGameWrong}
        isGameCorrect={isGameCorrect}
      />
    </>
  );
}
