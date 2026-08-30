// ============================================================
// Her Universe — 3D Star Letter Layout Utility
// ============================================================
// Converts any configurable text string into a set of 3D star positions
// using offscreen 2D canvas text sampling.
// ============================================================

export interface StarTargetPoint {
  position: [number, number, number];
  size: number;
}

/**
 * Generates 3D world coordinates for star particles spelling out the given text string.
 * @param text Message to render in 3D space
 * @param maxPoints Number of points to sample (e.g. 250)
 * @param planeCenter [x, y, z] target center in world space
 * @param scaleWidth Target width in 3D world units
 */
export function generateStarLetterPositions(
  text: string,
  maxPoints: number = 260,
  planeCenter: [number, number, number] = [0, 18, 0],
  scaleWidth: number = 75
): StarTargetPoint[] {
  if (typeof window === 'undefined') {
    return Array.from({ length: maxPoints }, (_, i) => ({
      position: [planeCenter[0] + (i - maxPoints / 2) * 0.2, planeCenter[1], planeCenter[2]],
      size: 0.8,
    }));
  }

  const canvas = document.createElement('canvas');
  const canvasWidth = 600;
  const canvasHeight = 160;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return Array.from({ length: maxPoints }, (_, i) => ({
      position: [planeCenter[0] + (i - maxPoints / 2) * 0.2, planeCenter[1], planeCenter[2]],
      size: 0.8,
    }));
  }

  // Draw background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Split multi-word long strings into two lines if needed
  const words = text.toUpperCase().split(' ');
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (words.length > 2) {
    const line1 = words.slice(0, 2).join(' ');
    const line2 = words.slice(2).join(' ');
    ctx.font = 'bold 36px "Outfit", "Inter", sans-serif';
    ctx.fillText(line1, canvasWidth / 2, canvasHeight * 0.35);
    ctx.fillText(line2, canvasWidth / 2, canvasHeight * 0.70);
  } else {
    ctx.font = 'bold 42px "Outfit", "Inter", sans-serif';
    ctx.fillText(text.toUpperCase(), canvasWidth / 2, canvasHeight / 2);
  }

  const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const pixels = imgData.data;

  // Collect bright pixel coordinates
  const validPixels: Array<{ x: number; y: number }> = [];
  const step = 2; // sample grid density

  for (let y = 0; y < canvasHeight; y += step) {
    for (let x = 0; x < canvasWidth; x += step) {
      const idx = (y * canvasWidth + x) * 4;
      const brightness = pixels[idx]; // R channel
      if (brightness > 160) {
        validPixels.push({ x, y });
      }
    }
  }

  if (validPixels.length === 0) {
    return [];
  }

  // Uniformly pick maxPoints points from validPixels
  const targets: StarTargetPoint[] = [];
  const total = validPixels.length;
  const ratio = total / maxPoints;

  const aspectRatio = canvasWidth / canvasHeight;
  const scaleHeight = scaleWidth / aspectRatio;

  for (let i = 0; i < maxPoints; i++) {
    const pIdx = Math.min(Math.floor(i * ratio), total - 1);
    const pixel = validPixels[pIdx];

    // Normalize coordinates to [-0.5, 0.5]
    const normX = pixel.x / canvasWidth - 0.5;
    const normY = -(pixel.y / canvasHeight - 0.5); // flip Y for 3D coordinate system

    const worldX = planeCenter[0] + normX * scaleWidth;
    const worldY = planeCenter[1] + normY * scaleHeight;
    const worldZ = planeCenter[2] + (Math.random() - 0.5) * 1.5; // slight depth jitter

    targets.push({
      position: [worldX, worldY, worldZ],
      size: Math.random() * 0.8 + 0.6,
    });
  }

  return targets;
}
