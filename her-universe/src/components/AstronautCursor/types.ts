// ============================================================
// Her Universe — Astronaut Mouse Pointer Types
// ============================================================

import type * as THREE from 'three';

export type AstronautRenderMode = '3d-mesh' | '2.5d-sprite' | 'auto';

export interface AstronautCursorConfig {
  /** Master toggle */
  enabled: boolean;
  /** Scale factor of the astronaut companion (default: 0.85) */
  scale: number;
  /** Follow response speed factor (higher = faster response) */
  followSpeed: number;
  /** Damping factor for smooth exponential decay (default: 10) */
  damping: number;
  /** Horizontal offset in pixels from mouse cursor (default: +20px) */
  offsetX: number;
  /** Vertical offset in pixels from mouse cursor (default: -16px) */
  offsetY: number;
  /** Enable continuous zero-G floating/breathing motion */
  enableFloating: boolean;
  /** Floating amplitude multiplier (default: 0.08) */
  floatAmplitude: number;
  /** Floating oscillation speed (default: 1.3) */
  floatSpeed: number;
  /** Directional banking/tilt strength based on velocity (default: 0.22) */
  tiltStrength: number;
  /** Arm & leg procedural motion strength (default: 1.0) */
  limbMotionStrength: number;
  /** Enable mouse click reaction (bounce, wave & thruster pulse) */
  enableClickReaction: boolean;
  /** Enable cosmic stardust & thruster particles */
  enableParticles: boolean;
  /** Render mode: 3D procedural mesh, 2.5D sprite fallback, or auto */
  renderMode: AstronautRenderMode;
  /** Path to optional GLB model */
  modelPath?: string;
  /** Path to 2D reference sprite asset */
  referenceImagePath?: string;
  /** Whether to show on touch-only mobile devices (default: false) */
  showOnTouch?: boolean;
  /** Whether to respect prefers-reduced-motion (default: true) */
  respectReducedMotion?: boolean;
  /** Guide action state for companion interactions */
  guideAction?: 'idle' | 'turn-to-star' | 'happy-bounce' | 'celebrate' | 'hint' | 'side-observe';
  /** Target 3D position of puzzle star to look/hint toward */
  targetStarPos?: [number, number, number] | null;
}

export interface AstronautCursorProps extends Partial<AstronautCursorConfig> {
  className?: string;
  onToggleEnabled?: (enabled: boolean) => void;
  guideAction?: 'idle' | 'turn-to-star' | 'happy-bounce' | 'celebrate' | 'hint' | 'side-observe';
  targetStarPos?: [number, number, number] | null;
}

export interface PointerState {
  /** Raw mouse position in window pixels */
  rawPixels: THREE.Vector2;
  /** Smoothed mouse position in window pixels */
  smoothedPixels: THREE.Vector2;
  /** Normalized Device Coordinates [-1, 1] */
  ndc: THREE.Vector2;
  /** Velocity vector in pixels/sec */
  velocity: THREE.Vector2;
  /** Normalized movement speed [0, 1] */
  speed: number;
  /** Normalized movement direction angle in radians */
  headingAngle: number;
  /** Click reaction pulse [0, 1] */
  clickPulse: number;
  /** Time spent idle in seconds */
  idleTime: number;
  /** Is cursor inside the viewport */
  isInsideViewport: boolean;
  /** Is mouse currently pressed down */
  isPointerDown: boolean;
  /** Is device touch-only */
  isTouchDevice: boolean;
}
