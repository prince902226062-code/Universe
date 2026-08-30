// ============================================================
// Her Universe — Performance Detection & Adaptive Quality
// ============================================================

export interface PerformanceTier {
  tier: 'high' | 'medium' | 'low';
  bloomEnabled: boolean;
  starCount: number;
  photoCount: number;       // visible photos on special planet
  shadowsEnabled: boolean;
  antialias: boolean;
  pixelRatio: number;
}

/**
 * Detect device performance tier based on GPU info and hardware concurrency.
 * This is called once on startup.
 */
export function detectPerformanceTier(): PerformanceTier {
  // Check if it's a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  const cores = navigator.hardwareConcurrency ?? 4;
  const devicePixelRatio = window.devicePixelRatio ?? 1;

  // Try to detect GPU capability via WebGL
  let gpuTier: 'high' | 'medium' | 'low' = 'medium';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
        const rendererLower = renderer.toLowerCase();
        if (
          rendererLower.includes('intel') &&
          !rendererLower.includes('iris xe')
        ) {
          gpuTier = 'low';
        } else if (
          rendererLower.includes('nvidia') ||
          rendererLower.includes('amd') ||
          rendererLower.includes('radeon') ||
          rendererLower.includes('apple') ||
          rendererLower.includes('m1') ||
          rendererLower.includes('m2') ||
          rendererLower.includes('iris xe')
        ) {
          gpuTier = 'high';
        }
      }
    }
  } catch {
    // Ignore errors
  }

  if (isMobile || cores <= 2 || gpuTier === 'low') {
    return {
      tier: 'low',
      bloomEnabled: false,
      starCount: 1500,
      photoCount: 12,
      shadowsEnabled: false,
      antialias: false,
      pixelRatio: Math.min(devicePixelRatio, 1),
    };
  }

  if (cores <= 4 || gpuTier === 'medium') {
    return {
      tier: 'medium',
      bloomEnabled: true,
      starCount: 2500,
      photoCount: 20,
      shadowsEnabled: false,
      antialias: true,
      pixelRatio: Math.min(devicePixelRatio, 1.5),
    };
  }

  return {
    tier: 'high',
    bloomEnabled: true,
    starCount: 3500,
    photoCount: 28,
    shadowsEnabled: false,  // shadows disabled globally for performance
    antialias: true,
    pixelRatio: Math.min(devicePixelRatio, 1.5),
  };
}

let cachedTier: PerformanceTier | null = null;

export function getPerformanceTier(): PerformanceTier {
  if (!cachedTier) {
    cachedTier = detectPerformanceTier();
  }
  return cachedTier;
}
