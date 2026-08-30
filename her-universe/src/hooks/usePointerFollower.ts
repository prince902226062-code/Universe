// ============================================================
// Her Universe — usePointerFollower Hook
// ============================================================
// Ultra-smooth 60+ FPS pointer tracker with spring/exponential damping,
// velocity calculation, heading angle, and click pulse physics.
// Avoids React re-renders by storing high-frequency state in refs.
// ============================================================

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { PointerState } from '../components/AstronautCursor/types';

interface UsePointerFollowerOptions {
  followSpeed?: number;
  offsetX?: number;
  offsetY?: number;
  enabled?: boolean;
}

export function usePointerFollower({
  followSpeed = 55,
  offsetX = 16,
  offsetY = -14,
  enabled = true,
}: UsePointerFollowerOptions = {}) {
  const initX = typeof window !== 'undefined' ? window.innerWidth / 2 + offsetX : 0;
  const initY = typeof window !== 'undefined' ? window.innerHeight / 2 + offsetY : 0;

  // Master state ref accessed by 3D render loop
  const stateRef = useRef<PointerState>({
    rawPixels: new THREE.Vector2(initX - offsetX, initY - offsetY),
    smoothedPixels: new THREE.Vector2(initX, initY),
    ndc: new THREE.Vector2(0, 0),
    velocity: new THREE.Vector2(0, 0),
    speed: 0,
    headingAngle: 0,
    clickPulse: 0,
    idleTime: 0,
    isInsideViewport: true,
    isPointerDown: false,
    isTouchDevice: false,
  });

  const prevRawRef = useRef(new THREE.Vector2(initX, initY));
  const rawTargetRef = useRef(new THREE.Vector2(initX, initY));
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect touch-only device
    const isTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches;
    stateRef.current.isTouchDevice = isTouch;

    const handleMouseMove = (e: MouseEvent) => {
      const targetX = e.clientX + offsetX;
      const targetY = e.clientY + offsetY;

      rawTargetRef.current.set(targetX, targetY);
      stateRef.current.rawPixels.set(e.clientX, e.clientY);
      stateRef.current.isInsideViewport = true;

      // Calculate NDC
      stateRef.current.ndc.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );

      if (!isInitializedRef.current) {
        stateRef.current.smoothedPixels.copy(rawTargetRef.current);
        prevRawRef.current.copy(rawTargetRef.current);
        isInitializedRef.current = true;
      }
    };

    const handleMouseDown = () => {
      stateRef.current.isPointerDown = true;
      stateRef.current.clickPulse = 1.0;
    };

    const handleMouseUp = () => {
      stateRef.current.isPointerDown = false;
    };

    const handleMouseLeave = () => {
      stateRef.current.isInsideViewport = false;
    };

    const handleMouseEnter = (e: MouseEvent) => {
      stateRef.current.isInsideViewport = true;
      const targetX = e.clientX + offsetX;
      const targetY = e.clientY + offsetY;
      rawTargetRef.current.set(targetX, targetY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const targetX = touch.clientX + offsetX;
        const targetY = touch.clientY + offsetY;

        rawTargetRef.current.set(targetX, targetY);
        stateRef.current.rawPixels.set(touch.clientX, touch.clientY);
        stateRef.current.isInsideViewport = true;
        stateRef.current.ndc.set(
          (touch.clientX / window.innerWidth) * 2 - 1,
          -(touch.clientY / window.innerHeight) * 2 + 1
        );

        if (!isInitializedRef.current) {
          stateRef.current.smoothedPixels.copy(rawTargetRef.current);
          prevRawRef.current.copy(rawTargetRef.current);
          isInitializedRef.current = true;
        }
      }
    };

    const handleTouchStart = () => {
      stateRef.current.isPointerDown = true;
      stateRef.current.clickPulse = 1.0;
    };

    const handleTouchEnd = () => {
      stateRef.current.isPointerDown = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [offsetX, offsetY, enabled]);

  /** Step simulation per frame inside R3F useFrame loop */
  const step = (delta: number) => {
    const clampedDelta = Math.min(delta, 0.05);
    const state = stateRef.current;

    // Smooth exponential damping follow
    const lerpFactor = 1 - Math.exp(-followSpeed * clampedDelta);
    state.smoothedPixels.lerp(rawTargetRef.current, lerpFactor);

    // Velocity calculation in screen pixels
    const vx = (rawTargetRef.current.x - prevRawRef.current.x) / (clampedDelta || 0.016);
    const vy = (rawTargetRef.current.y - prevRawRef.current.y) / (clampedDelta || 0.016);

    // Smooth velocity
    state.velocity.x += (vx - state.velocity.x) * 0.2;
    state.velocity.y += (vy - state.velocity.y) * 0.2;

    prevRawRef.current.copy(rawTargetRef.current);

    // Speed calculation
    const rawSpeed = state.velocity.length();
    state.speed = Math.min(rawSpeed / 1200, 1.0);

    // Movement angle
    if (rawSpeed > 10) {
      state.headingAngle = Math.atan2(state.velocity.y, state.velocity.x);
      state.idleTime = 0;
    } else {
      state.idleTime += clampedDelta;
    }

    // Click pulse exponential decay
    if (state.clickPulse > 0.001) {
      state.clickPulse *= Math.exp(-8 * clampedDelta);
    } else {
      state.clickPulse = 0;
    }
  };

  return { stateRef, step };
}
