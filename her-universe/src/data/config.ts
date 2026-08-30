// ============================================================
// Her Universe — Global Configuration
// ============================================================

export const GIRLFRIEND_NAME = 'Prapti';

export const PLANET_COLORS = {
  special: '#ff6eb4',   // romantic pink-magenta for Prapti's planet
  glow: '#ff9de2',
  aura: '#c850c0',
} as const;

export const CAMERA_CONFIG = {
  initialPosition: [0, 85, 110] as [number, number, number],
  fov: 60,
  near: 0.1,
  far: 2000,

  // Full-screen mouse follow / parallax strength
  parallaxStrength: 24,         // Position shift responding to mouse
  rotationParallaxStrength: 0.14, // Camera tilt responding to mouse
  parallaxDamping: 0.08,

  // Focus transitions
  focusTransitionDuration: 1.8,  // seconds (GSAP)
  overviewTransitionDuration: 1.6,
} as const;

export const SCENE_CONFIG = {
  starCount: 3500,
  starSpread: 800,
  starSize: 0.6,

  // Post-processing
  bloomStrength: 1.2,
  bloomRadius: 0.6,
  bloomThreshold: 0.2,
} as const;

export const PHOTO_SAMPLER_CONFIG = {
  // How many photos to show on the visible hemisphere at once
  visiblePhotoCount: 24,
  // How close to a photo anchor center before it "opens" on click
  clickRadiusDeg: 18,
  // How far photos float out from the surface
  emergeDistance: 3.5,
  // Animation durations (seconds)
  emergeDuration: 0.8,
  returnDuration: 0.6,
} as const;

export const INTRO_CONFIG = {
  duration: 6.0,  // total intro sequence duration in seconds
  skipable: true,
} as const;
