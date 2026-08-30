// ============================================================
// Her Universe — Astronaut Cursor Configuration Defaults
// ============================================================

import type { AstronautCursorConfig } from '../components/AstronautCursor/types';

export const DEFAULT_ASTRONAUT_CONFIG: AstronautCursorConfig = {
  enabled: true,
  scale: 0.38,
  followSpeed: 28,
  damping: 16,
  offsetX: 16,
  offsetY: -14,
  enableFloating: true,
  floatAmplitude: 0.02,
  floatSpeed: 0.8,
  tiltStrength: 0.25,
  limbMotionStrength: 1.0,
  enableClickReaction: true,
  enableParticles: true,
  renderMode: '3d-mesh',
  referenceImagePath: '/astronaut/astronaut.png',
  showOnTouch: false,
  respectReducedMotion: true,
};
