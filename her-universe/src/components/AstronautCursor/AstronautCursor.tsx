// ============================================================
// Her Universe — AstronautCursor Root Component
// ============================================================
// Reusable, lightweight, transparent overlay custom cursor companion.
// Follows the mouse pointer with multi-layered procedural 3D physics.
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import type { AstronautCursorProps, AstronautCursorConfig } from './types';
import { DEFAULT_ASTRONAUT_CONFIG } from '../../config/astronautCursorConfig';
import { usePointerFollower } from '../../hooks/usePointerFollower';
import { AstronautScene } from './AstronautScene';
import './AstronautCursor.css';

export function AstronautCursor(props: AstronautCursorProps) {
  const config: AstronautCursorConfig = useMemo(
    () => ({
      ...DEFAULT_ASTRONAUT_CONFIG,
      ...props,
    }),
    [props.enabled, props.guideAction, props.targetStarPos, props.followSpeed, props.scale, props.className]
  );

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check touch devices and reduced motion
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches;
    setIsTouchDevice(isTouch);

    if (config.respectReducedMotion) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setReducedMotion(e.matches);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [config.respectReducedMotion]);

  // Manage body class for cursor visibility
  useEffect(() => {
    if (config.enabled && !isTouchDevice) {
      document.body.classList.add('astronaut-pointer-active');
    } else {
      document.body.classList.remove('astronaut-pointer-active');
    }

    return () => {
      document.body.classList.remove('astronaut-pointer-active');
    };
  }, [config.enabled, isTouchDevice]);

  // Pointer follower hook
  const { stateRef, step } = usePointerFollower({
    followSpeed: config.followSpeed,
    offsetX: config.offsetX,
    offsetY: config.offsetY,
    enabled: config.enabled,
  });

  // If disabled, or if touch device without showOnTouch, do not render overlay
  if (!config.enabled || (isTouchDevice && !config.showOnTouch) || reducedMotion) {
    return null;
  }

  return (
    <div
      className={`astronaut-cursor-overlay ${isTouchDevice ? 'hide-on-touch' : ''} ${
        props.className || ''
      }`}
      aria-hidden="true"
    >
      <Canvas
        className="astronaut-cursor-canvas"
        camera={{
          position: [0, 0, 10],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.25) : 1}
        performance={{ min: 0.8 }}
      >
        <AstronautScene
          pointerState={stateRef}
          stepPhysics={step}
          config={config}
        />
      </Canvas>
    </div>
  );
}

export * from './types';
export { DEFAULT_ASTRONAUT_CONFIG } from '../../config/astronautCursorConfig';
