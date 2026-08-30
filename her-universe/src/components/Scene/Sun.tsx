// ============================================================
// Her Universe — Sun Component
// ============================================================

import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { SUN_CONFIG, type PlanetConfig } from '../../data/planets';
import {
  SUN_VERTEX,
  SUN_FRAGMENT,
} from '../../shaders/planetShaders';

interface SunProps {
  isFocused?: boolean;
  anyFocused?: boolean;
  onSunClick?: (config: PlanetConfig) => void;
  registerRef?: (name: string, group: THREE.Group | null) => void;
}

// ── Solar Prominence Fumes & Plasma Plumes ──────────────────────
function SolarFumes({ sunRadius = 3.8, count = 52 }: { sunRadius?: number; count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Palette of fiery orange solar prominence colors
  const colors = useMemo(
    () => [
      new THREE.Color('#ff4500'), // vibrant fiery orange-red
      new THREE.Color('#ff7700'), // rich solar orange
      new THREE.Color('#ff9900'), // glowing solar amber
      new THREE.Color('#ff3300'), // deep crimson prominence
      new THREE.Color('#ffbb22'), // incandescent solar gold
    ],
    []
  );

  // Pre-generate eruption vectors around the sphere
  const fumesData = useMemo(() => {
    return Array.from({ length: count }, () => {
      // Random direction on unit sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const dir = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      );

      return {
        dir,
        baseScale: 0.12 + Math.random() * 0.16, // balanced 1x increase
        hopDistance: 0.35 + Math.random() * 0.55, // visible outward hop
        speed: 1.3 + Math.random() * 2.0,
        phase: Math.random() * Math.PI * 2,
        colorIdx: Math.floor(Math.random() * 5),
        rotSpeed: (Math.random() - 0.5) * 3,
      };
    });
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    fumesData.forEach((fume, i) => {
      // Periodic erupting hop cycle (0 to 1 outward burst and fall-back/fade)
      const cycle = Math.sin(t * fume.speed + fume.phase);
      const hop = Math.max(0, cycle); // only burst when positive

      // Distance outward from sun surface
      const currentRadius = sunRadius + hop * fume.hopDistance;
      const pos = fume.dir.clone().multiplyScalar(currentRadius);

      // Subtle solar turbulence
      pos.x += Math.sin(t * 2 + i) * 0.08;
      pos.y += Math.cos(t * 2 + i * 1.5) * 0.08;

      // Expand slightly as it hops outward, then shrink
      const scale = hop > 0.01 ? fume.baseScale * (1 + hop * 1.1) : 0.001;

      dummy.position.copy(pos);
      dummy.scale.setScalar(scale);
      dummy.rotation.set(t * fume.rotSpeed + i, t * 1.2, 0);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, colors[fume.colorIdx]);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  const fumeMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useEffect(() => () => fumeMat.dispose(), [fumeMat]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      material={fumeMat}
      frustumCulled={false}
    >
      <dodecahedronGeometry args={[0.35, 0]} />
    </instancedMesh>
  );
}

export function Sun({ isFocused: _isFocused, anyFocused, onSunClick, registerRef }: SunProps) {
  const { gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (groupRef.current && registerRef) {
      registerRef(SUN_CONFIG.name, groupRef.current);
    }
    return () => {
      registerRef?.(SUN_CONFIG.name, null);
    };
  }, [registerRef]);

  // Animated plasma shader material
  const sunMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SUN_VERTEX,
        fragmentShader: SUN_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
        },
      }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Update plasma shader time
    sunMaterial.uniforms.uTime.value = t;

    if (innerRef.current) {
      innerRef.current.rotation.y += state.clock.getDelta() * 0.05;
    }

    if (lightRef.current) {
      lightRef.current.intensity = 4.0 + Math.sin(t * 0.5) * 0.3;
    }
  });

  useEffect(
    () => () => {
      sunMaterial.dispose();
    },
    [sunMaterial]
  );

  const handleClick = useCallback(
    (e?: ThreeEvent<MouseEvent>) => {
      e?.stopPropagation();
      onSunClick?.(SUN_CONFIG);
    },
    [onSunClick]
  );

  return (
    <group ref={groupRef}>
      {/* Main sun sphere with plasma shader */}
      <mesh
        ref={innerRef}
        material={sunMaterial}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovered(true);
          gl.domElement.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setIsHovered(false);
          gl.domElement.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[SUN_CONFIG.size, 64, 64]} />
      </mesh>

      {/* Fiery orange solar fumes & plasma plumes hopping out */}
      <SolarFumes sunRadius={SUN_CONFIG.size} count={65} />

      {/* Sun Badge */}
      {!anyFocused && (
        <Html
          position={[0, SUN_CONFIG.size + 1.6, 0]}
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
              handleClick();
            }}
            style={{
              fontFamily: "'Outfit', 'Inter', sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#fff',
              background: isHovered
                ? 'linear-gradient(135deg, rgba(255, 140, 0, 0.9), rgba(255, 69, 0, 0.9))'
                : 'rgba(30, 15, 0, 0.65)',
              border: '1px solid rgba(255, 200, 100, 0.4)',
              boxShadow: '0 0 14px rgba(255, 140, 0, 0.5)',
              padding: '3px 9px',
              borderRadius: '12px',
              backdropFilter: 'blur(4px)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>☀️</span>
            <span>The Sun</span>
          </div>
        </Html>
      )}

      {/* Point light */}
      <pointLight
        ref={lightRef}
        position={[0, 0, 0]}
        intensity={4.0}
        distance={300}
        decay={1.0}
        color="#fff0d0"
      />

      {/* Ambient fill */}
      <ambientLight intensity={0.6} color="#2a1a50" />

      {/* Hemisphere fill */}
      <hemisphereLight args={['#ffd0a0', '#102040', 0.4]} />
    </group>
  );
}
