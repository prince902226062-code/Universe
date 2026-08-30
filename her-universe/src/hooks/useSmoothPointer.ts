// ============================================================
// Her Universe — useSmoothPointer Hook
// ============================================================
// Tracks mouse/touch position and returns smoothly
// interpolated values with spring-like physics damping.
// ============================================================

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SmoothPointerOptions {
  /** Damping factor: higher = faster response. 0.05–0.15 is typical. */
  damping?: number;
  /** Maximum offset strength multiplier */
  strength?: number;
}

interface SmoothPointerResult {
  /** Smoothed normalized pointer [-1, 1] for x and y */
  smoothed: React.MutableRefObject<THREE.Vector2>;
  /** Raw (un-smoothed) pointer position */
  raw: React.MutableRefObject<THREE.Vector2>;
}

export function useSmoothPointer({
  damping = 0.16,
  strength = 1,
}: SmoothPointerOptions = {}): SmoothPointerResult {
  const raw = useRef(new THREE.Vector2(0, 0));
  const smoothed = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      raw.current.set(nx * strength, ny * strength);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const nx = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        const ny = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        raw.current.set(nx * strength, ny * strength);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [strength]);

  useFrame((_, delta) => {
    // Smooth exponential damping
    const clampedDelta = Math.min(delta, 0.1);
    const factor = 1 - Math.exp(-damping * 60 * clampedDelta);
    smoothed.current.lerp(raw.current, factor);
  });

  return { smoothed, raw };
}
