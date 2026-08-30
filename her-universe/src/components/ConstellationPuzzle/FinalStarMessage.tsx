// ============================================================
// Her Universe — FinalStarMessage Component
// ============================================================
// Ultra-crisp 3D glowing star typography & morphing stardust
// particles spelling out "Happy Birthday, My Universe" in deep space.
// Features a smooth, gradual 3-second cosmic dissolution fade-out.
// ============================================================

import { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

interface FinalStarMessageProps {
  isActive: boolean;
  isFadingOut?: boolean;
  onMessageFormed?: () => void;
}

export function FinalStarMessage({ isActive, isFadingOut, onMessageFormed }: FinalStarMessageProps) {
  const groupRef = useRef<THREE.Group>(null);
  const textGroupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const [textOpacity, setTextOpacity] = useState(0);
  const animationProgress = useRef(0);
  const animatedRef = useRef(false);

  // Generate sparkling background particles around the text position
  const particleCount = 220;
  const { initialPositions, targetPositions, colors, sizes } = useMemo(() => {
    const initialPositions = new Float32Array(particleCount * 3);
    const targetPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const baseColor = new THREE.Color('#ff80df');
    const goldColor = new THREE.Color('#ffdf80');
    const whiteColor = new THREE.Color('#ffffff');

    for (let i = 0; i < particleCount; i++) {
      // Scatter in deep space initially
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 90 + Math.random() * 60;

      initialPositions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      initialPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      initialPositions[i * 3 + 2] = r * Math.cos(phi);

      // Target bounds around text [0, 30, 0]
      targetPositions[i * 3 + 0] = (Math.random() - 0.5) * 75;
      targetPositions[i * 3 + 1] = 30 + (Math.random() - 0.5) * 18;
      targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;

      const cRand = Math.random();
      const c = cRand > 0.6 ? whiteColor : cRand > 0.3 ? baseColor : goldColor;

      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = Math.random() * 1.5 + 0.8;
    }

    return { initialPositions, targetPositions, colors, sizes };
  }, [particleCount]);

  const currentPositions = useMemo(() => new Float32Array(initialPositions), [initialPositions]);

  // Trigger smooth GSAP appearance animation sequence
  useEffect(() => {
    if (!isActive) {
      if (animatedRef.current && !isFadingOut) {
        setTextOpacity(0);
        animationProgress.current = 0;
        animatedRef.current = false;
      }
      return;
    }

    if (animatedRef.current) return;
    animatedRef.current = true;

    animationProgress.current = 0;

    // 1. Morph stardust particles to target region
    gsap.to(animationProgress, {
      current: 1.0,
      duration: 3.2,
      ease: 'power3.inOut',
    });

    // 2. Fade in crystal-clear text typography
    const opacityObj = { val: 0 };
    gsap.to(opacityObj, {
      val: 1.0,
      duration: 2.8,
      delay: 0.5,
      ease: 'power2.out',
      onUpdate: () => setTextOpacity(opacityObj.val),
      onComplete: () => {
        if (onMessageFormed) {
          onMessageFormed();
        }
      },
    });
  }, [isActive, isFadingOut, onMessageFormed]);

  // Trigger smooth 2.5-second dissolution fade out
  useEffect(() => {
    if (!isFadingOut) return;

    const opacityObj = { val: 1.0 };
    gsap.to(opacityObj, {
      val: 0,
      duration: 2.5,
      ease: 'power2.inOut',
      onUpdate: () => setTextOpacity(opacityObj.val),
      onComplete: () => setTextOpacity(0),
    });
  }, [isFadingOut]);

  // Frame loop for sparkling stardust movement & float
  useFrame(() => {
    if (!pointsRef.current) return;

    const prog = animationProgress.current;

    // Only update GPU buffer when particles are actively morphing
    if (prog > 0.001 && prog < 0.999) {
      const geo = pointsRef.current.geometry;
      const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const ix = initialPositions[i * 3 + 0];
        const iy = initialPositions[i * 3 + 1];
        const iz = initialPositions[i * 3 + 2];

        const tx = targetPositions[i * 3 + 0];
        const ty = targetPositions[i * 3 + 1];
        const tz = targetPositions[i * 3 + 2];

        array[i * 3 + 0] = THREE.MathUtils.lerp(ix, tx, prog);
        array[i * 3 + 1] = THREE.MathUtils.lerp(iy, ty, prog);
        array[i * 3 + 2] = THREE.MathUtils.lerp(iz, tz, prog);
      }

      posAttr.needsUpdate = true;
    }

    // Gentle float on text group
    if (textGroupRef.current) {
      textGroupRef.current.position.y = 30 + Math.sin(Date.now() * 0.0015) * 0.4;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [currentPositions, colors, sizes]);

  if (!isActive || (isFadingOut && textOpacity <= 0.01)) return null;

  return (
    <group ref={groupRef}>
      {/* Morphing Sparkling Stardust Particles */}
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          vertexColors
          size={1.6}
          sizeAttenuation
          transparent
          opacity={textOpacity * 0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Crystal-Clear 3D Star Letter Typography */}
      <group ref={textGroupRef} position={[0, 30, 0]}>
        {/* Line 1: HAPPY BIRTHDAY, */}
        <Text
          position={[0, 3.8, 0]}
          fontSize={4.8}
          letterSpacing={0.06}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.12}
          outlineColor="#ff55bb"
          outlineOpacity={textOpacity * 0.9}
          fillOpacity={textOpacity}
        >
          HAPPY BIRTHDAY,
        </Text>

        {/* Line 2: MY UNIVERSE */}
        <Text
          position={[0, -2.5, 0]}
          fontSize={5.4}
          letterSpacing={0.08}
          color="#ffe5b4"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.15}
          outlineColor="#ff33aa"
          outlineOpacity={textOpacity * 0.9}
          fillOpacity={textOpacity}
        >
          MY UNIVERSE
        </Text>
      </group>
    </group>
  );
}
