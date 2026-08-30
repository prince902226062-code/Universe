// ============================================================
// Her Universe — CinematicCamera Component
// ============================================================
// Handles:
// 1. Dynamic full-screen mouse follow & parallax
// 2. Mouse wheel & trackpad scroll zoom in/out (overview & focus)
// 3. Double-click cursor view adjustment & angle presets
// 4. Click & drag to rotate view around the universe
// 5. GSAP-driven cinematic intro
// 6. Continuous real-time orbital tracking of ANY selected planet
// 7. Smooth transitions between planets & back to overview
// ============================================================

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useSmoothPointer } from '../../hooks/useSmoothPointer';
import { CAMERA_CONFIG } from '../../data/config';

interface CinematicCameraProps {
  introComplete: boolean;
  isFocused: boolean;
  focusedPlanetName?: string;
  focusDistance?: number;
  getTargetPosition: () => THREE.Vector3 | null;
  onIntroComplete: () => void;
  isFinalCinematic?: boolean;
  isPuzzleFocused?: boolean;
  focusedTreasurePos?: [number, number, number] | null;
}

// Preset camera viewing angles in Overview Mode (covering distinct vertical & horizontal perspectives)
const OVERVIEW_PRESETS: Array<[number, number, number]> = [
  [0, 85, 110],   // 1. Classic 45° Cinematic Overhead
  [0, 160, 25],   // 2. High Top-Down Galaxy Bird's-Eye Map (Vertical)
  [0, 32, 145],   // 3. Low Horizontal Orbital Plane
  [85, 65, 85],   // 4. Diagonal Side Perspective
  [0, -25, 130],  // 5. Low Dramatic Upward Angle (Looking up into the galaxy)
];

// Focused planet angle presets with distinct vertical elevations
const FOCUS_ANGLE_PRESETS = [
  { x: 0, y: 0.35 },                    // 1. Classic 3/4 Elevated View
  { x: Math.PI * 0.4, y: 1.15 },         // 2. High Polar Top-Down View (Vertical)
  { x: Math.PI * 0.85, y: 0.05 },        // 3. Eye-Level Equatorial Profile
  { x: Math.PI * 1.4, y: -0.45 },        // 4. Low Upward Angle (Vertical)
];

export function CinematicCamera({
  introComplete,
  isFocused,
  focusedPlanetName,
  focusDistance = 10,
  getTargetPosition,
  onIntroComplete,
  isFinalCinematic,
  isPuzzleFocused,
  focusedTreasurePos,
}: CinematicCameraProps) {
  const { camera, gl } = useThree();
  const { smoothed } = useSmoothPointer({ damping: 0.08, strength: 1 });

  // Base camera state
  const basePos = useRef(new THREE.Vector3(...CAMERA_CONFIG.initialPosition));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const isTransitioning = useRef(false);
  const introRan = useRef(false);
  const lastPlanetName = useRef<string | undefined>(undefined);

  // ── Drag-to-Rotate View ─────────────────────────────────────────
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const orbitAngle = useRef({ x: 0, y: 0 });
  const targetOrbitAngle = useRef({ x: 0, y: 0 });

  // ── Double-Click View Angle Preset ──────────────────────────────
  const overviewPresetIdx = useRef(0);
  const focusAnglePresetIdx = useRef(0);

  // ── Scroll Zoom State ───────────────────────────────────────────
  const overviewZoom = useRef(1.0);
  const targetOverviewZoom = useRef(1.0);

  const focusZoom = useRef(1.0);
  const targetFocusZoom = useRef(1.0);

  // ── Mouse Wheel Scroll Listener ─────────────────────────────────
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 0.0012;
      const delta = e.deltaY * zoomSpeed;

      if (isFocused) {
        targetFocusZoom.current = THREE.MathUtils.clamp(
          targetFocusZoom.current + delta,
          0.45,
          2.2
        );
      } else {
        targetOverviewZoom.current = THREE.MathUtils.clamp(
          targetOverviewZoom.current + delta,
          0.35,
          2.2
        );
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isFocused]);

  // ── Double Click to Adjust View ─────────────────────────────────
  useEffect(() => {
    const handleDblClick = (e: MouseEvent) => {
      // Ignore double-clicks on buttons or modals
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('.memory-viewer-card') || target.closest('.hud-btn')) {
        return;
      }

      if (isFocused) {
        // In focused mode: cycle through camera orbit angles with rich vertical elevations
        focusAnglePresetIdx.current = (focusAnglePresetIdx.current + 1) % FOCUS_ANGLE_PRESETS.length;
        const preset = FOCUS_ANGLE_PRESETS[focusAnglePresetIdx.current];
        targetOrbitAngle.current.x = preset.x;
        targetOrbitAngle.current.y = preset.y;
      } else {
        // In overview mode:
        // Double click switches to the next cinematic camera perspective (including high vertical top-down and low angles)!
        overviewPresetIdx.current = (overviewPresetIdx.current + 1) % OVERVIEW_PRESETS.length;
        const nextPreset = OVERVIEW_PRESETS[overviewPresetIdx.current];

        isTransitioning.current = true;
        gsap.to(basePos.current, {
          x: nextPreset[0],
          y: nextPreset[1],
          z: nextPreset[2],
          duration: 1.4,
          ease: 'power3.inOut',
          onComplete: () => {
            isTransitioning.current = false;
          },
        });

        // Reset manual drag orbit angles on preset switch
        targetOrbitAngle.current = { x: 0, y: 0 };
      }
    };

    window.addEventListener('dblclick', handleDblClick);
    return () => window.removeEventListener('dblclick', handleDblClick);
  }, [isFocused]);

  // ── Pointer Drag to Orbit ───────────────────────────────────────
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return; // Left click only
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('.memory-viewer-card') ||
        target.closest('.quiz-invitation-bubble') ||
        target.closest('.quiz-question-card') ||
        target.closest('.quiz-completion-content')
      ) {
        return;
      }

      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = (e.clientX - dragStart.current.x) * 0.005;
      const dy = (e.clientY - dragStart.current.y) * 0.004;
      dragStart.current = { x: e.clientX, y: e.clientY };

      targetOrbitAngle.current.x += dx;
      targetOrbitAngle.current.y = THREE.MathUtils.clamp(
        targetOrbitAngle.current.y + dy,
        -Math.PI * 0.35,
        Math.PI * 0.35
      );
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  // ── Cinematic Intro ─────────────────────────────────────────────
  useEffect(() => {
    if (introRan.current) return;
    introRan.current = true;

    camera.position.set(0, 140, 700);
    camera.lookAt(0, 0, 0);

    const tl = gsap.timeline({
      onComplete: () => {
        isTransitioning.current = false;
        basePos.current.set(...CAMERA_CONFIG.initialPosition);
        onIntroComplete();
      },
    });

    isTransitioning.current = true;

    tl.to(camera.position, {
      x: 0,
      y: 110,
      z: 320,
      duration: 2.2,
      ease: 'power2.inOut',
    })
      .to(camera.position, {
        x: 0,
        y: 95,
        z: 180,
        duration: 2.2,
        ease: 'power2.out',
      })
      .to(camera.position, {
        x: CAMERA_CONFIG.initialPosition[0],
        y: CAMERA_CONFIG.initialPosition[1],
        z: CAMERA_CONFIG.initialPosition[2],
        duration: 2.0,
        ease: 'power3.out',
      });

    return () => {
      tl.kill();
    };
  }, [camera, onIntroComplete]);

  // ── Handle Focus Changes & Transitions ────────────────────────
  useEffect(() => {
    if (!introComplete) return;

    if (focusedTreasurePos) {
      isTransitioning.current = true;
      gsap.to(basePos.current, {
        x: focusedTreasurePos[0],
        y: focusedTreasurePos[1] + 6,
        z: focusedTreasurePos[2] + 16,
        duration: 2.0,
        ease: 'power3.inOut',
      });
      gsap.to(currentLookAt.current, {
        x: focusedTreasurePos[0],
        y: focusedTreasurePos[1],
        z: focusedTreasurePos[2],
        duration: 2.0,
        ease: 'power3.inOut',
        onComplete: () => {
          isTransitioning.current = false;
        },
      });
      return;
    }

    if (isPuzzleFocused) {
      isTransitioning.current = true;
      gsap.to(basePos.current, {
        x: 35,
        y: 45,
        z: 80,
        duration: 2.0,
        ease: 'power3.inOut',
      });
      gsap.to(currentLookAt.current, {
        x: 35,
        y: 30,
        z: 0,
        duration: 2.0,
        ease: 'power3.inOut',
        onComplete: () => {
          isTransitioning.current = false;
        },
      });
      return;
    }

    if (isFinalCinematic) {
      isTransitioning.current = true;
      gsap.to(basePos.current, {
        x: 0,
        y: 30,
        z: 75,
        duration: 2.4,
        ease: 'power3.inOut',
      });
      gsap.to(currentLookAt.current, {
        x: 0,
        y: 30,
        z: 0,
        duration: 2.4,
        ease: 'power3.inOut',
        onComplete: () => {
          isTransitioning.current = false;
        },
      });
      return;
    }

    if (isFocused && focusedPlanetName) {
      if (focusedPlanetName !== lastPlanetName.current) {
        lastPlanetName.current = focusedPlanetName;
        targetFocusZoom.current = 1.0;
        focusZoom.current = 1.0;
        targetOrbitAngle.current = { x: 0, y: 0 };
        isTransitioning.current = false;
      }
    } else if (!isFocused && lastPlanetName.current !== undefined) {
      lastPlanetName.current = undefined;
      isTransitioning.current = true;
      targetOverviewZoom.current = 1.0;
      targetOrbitAngle.current = { x: 0, y: 0 };

      const activePreset = OVERVIEW_PRESETS[overviewPresetIdx.current];

      gsap.to(basePos.current, {
        x: activePreset[0],
        y: activePreset[1],
        z: activePreset[2],
        duration: CAMERA_CONFIG.overviewTransitionDuration,
        ease: 'power3.inOut',
      });

      gsap.to(currentLookAt.current, {
        x: 0,
        y: 0,
        z: 0,
        duration: CAMERA_CONFIG.overviewTransitionDuration,
        ease: 'power3.inOut',
        onComplete: () => {
          isTransitioning.current = false;
        },
      });
    }
  }, [isFocused, focusedPlanetName, introComplete, isFinalCinematic, isPuzzleFocused, focusedTreasurePos]);

  // ── Render Loop ────────────────────────────────────────────────
  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.1);

    // Skip manual lerping during GSAP camera transitions to eliminate zoom lag & stutter
    if (isTransitioning.current) {
      camera.position.copy(basePos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // Mouse pointer offsets (full screen parallax)
    const pointerX = smoothed.current.x;
    const pointerY = smoothed.current.y;

    // Smooth drag orbit angles (silky smooth cinematic tracking)
    const orbitLerp = 1 - Math.exp(-12.0 * clampedDelta);
    orbitAngle.current.x = THREE.MathUtils.lerp(orbitAngle.current.x, targetOrbitAngle.current.x, orbitLerp);
    orbitAngle.current.y = THREE.MathUtils.lerp(orbitAngle.current.y, targetOrbitAngle.current.y, orbitLerp);

    if (isFocused) {
      // Smoothly interpolate focus zoom
      const zoomLerp = 1 - Math.exp(-10.0 * clampedDelta);
      focusZoom.current = THREE.MathUtils.lerp(focusZoom.current, targetFocusZoom.current, zoomLerp);

      const targetPos = getTargetPosition();
      if (targetPos) {
        // Orbit offset around focused planet based on drag + double click angle
        const dist = Math.max(focusDistance * focusZoom.current, 3.2);

        const angleX = orbitAngle.current.x;
        const angleY = orbitAngle.current.y + 0.35; // base elevation

        const camOffsetX = Math.sin(angleX) * Math.cos(angleY) * dist * 1.15;
        const camOffsetY = Math.sin(angleY) * dist * 1.15;
        const camOffsetZ = Math.cos(angleX) * Math.cos(angleY) * dist * 1.15;

        // Subtle mouse parallax
        const mouseOffset = new THREE.Vector3(
          pointerX * dist * 0.18,
          pointerY * dist * 0.14,
          0
        );

        const desiredPos = targetPos.clone().add(new THREE.Vector3(camOffsetX, camOffsetY, camOffsetZ)).add(mouseOffset);

        // Smooth tracking
        const trackingSpeed = isTransitioning.current ? 4.0 : 12.0;
        const lerpFactor = 1 - Math.exp(-trackingSpeed * clampedDelta);

        basePos.current.lerp(desiredPos, lerpFactor);
        currentLookAt.current.lerp(targetPos, lerpFactor);

        camera.position.copy(basePos.current);
        camera.lookAt(currentLookAt.current);
        return;
      }
    }

    // ─── Solar System Overview ────────────────────────────────────
    const zoomLerp = 1 - Math.exp(-10.0 * clampedDelta);
    overviewZoom.current = THREE.MathUtils.lerp(overviewZoom.current, targetOverviewZoom.current, zoomLerp);

    const zoom = overviewZoom.current;

    // Apply manual drag orbit rotation to overview position (both horizontal and vertical)
    const activePreset = OVERVIEW_PRESETS[overviewPresetIdx.current];
    const initialPos = new THREE.Vector3(...activePreset).multiplyScalar(zoom);

    // 1. Rotate horizontally around Y axis
    initialPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), orbitAngle.current.x);

    // 2. Rotate vertically around perpendicular horizontal axis
    const rightAxis = new THREE.Vector3(-initialPos.z, 0, initialPos.x).normalize();
    if (rightAxis.lengthSq() > 0.001) {
      initialPos.applyAxisAngle(rightAxis, orbitAngle.current.y);
    }

    const parallaxPos = new THREE.Vector3(
      initialPos.x + pointerX * CAMERA_CONFIG.parallaxStrength * zoom,
      initialPos.y + pointerY * (CAMERA_CONFIG.parallaxStrength * 0.6) * zoom,
      initialPos.z - Math.abs(pointerX) * 5 * zoom
    );

    const posLerp = 1 - Math.exp(-9.0 * clampedDelta);
    basePos.current.lerp(parallaxPos, posLerp);
    camera.position.copy(basePos.current);

    // LookAt follows mouse with subtle tilt
    const targetLookAt = new THREE.Vector3(
      pointerX * CAMERA_CONFIG.parallaxStrength * 0.3 * zoom,
      pointerY * CAMERA_CONFIG.parallaxStrength * 0.2 * zoom,
      0
    );

    const lookLerp = 1 - Math.exp(-10.0 * clampedDelta);
    currentLookAt.current.lerp(targetLookAt, lookLerp);

    camera.lookAt(currentLookAt.current);
  });

  return null;
}
