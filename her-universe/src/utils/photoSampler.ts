// ============================================================
// Her Universe — Dynamic Photo Sampler
// ============================================================
// Handles 1000+ photos by:
// 1. Distributing all photos evenly across the sphere using Fibonacci sphere
// 2. When the camera is focused on a region, selecting the N nearest photos
//    to show as active PhotoAnchor components
// 3. Smooth swap-in/swap-out as the user explores
// ============================================================

import type { MemoryEntry } from '../data/memories';
import { generateMemoriesFromFileList } from '../data/memories';
import { angularDistance, fibonacciSpherePoints } from './sphericalCoords';

/**
 * Build the full memory list from a list of photo filenames.
 * Uses Fibonacci sphere for even distribution.
 */
export function buildMemoriesFromFiles(filenames: string[]): MemoryEntry[] {
  return generateMemoriesFromFileList(filenames);
}

/**
 * Given a viewpoint direction (theta, phi on the sphere), return the N
 * memories closest to that region. Used for dynamic loading.
 *
 * @param allMemories   - full list of all memories
 * @param centerTheta   - view center azimuthal angle
 * @param centerPhi     - view center polar angle
 * @param count         - how many to return
 */
export function getNearestMemories(
  allMemories: MemoryEntry[],
  centerTheta: number,
  centerPhi: number,
  count: number
): MemoryEntry[] {
  const scored = allMemories.map((m) => ({
    memory: m,
    dist: angularDistance(m.theta, m.phi, centerTheta, centerPhi),
  }));

  scored.sort((a, b) => a.dist - b.dist);
  return scored.slice(0, count).map((s) => s.memory);
}

/**
 * When no real photos are loaded, generate N evenly distributed
 * placeholder memory entries.
 */
export function generatePlaceholderMemories(count: number): MemoryEntry[] {
  const points = fibonacciSpherePoints(count);
  return points.map(({ theta, phi }, i) => ({
    id: `placeholder-${i}`,
    imageUrl: `/memories/photo-${String((i % 12) + 1).padStart(2, '0')}.jpg`,
    title: `Memory ${i + 1}`,
    description: undefined,
    theta,
    phi,
  }));
}

/**
 * Determines which photos to show based on current camera viewing angle
 * toward the special planet. Returns a stable sorted list to minimize
 * React re-renders.
 */
export function selectVisiblePhotos(
  allMemories: MemoryEntry[],
  viewTheta: number,
  viewPhi: number,
  maxCount: number
): MemoryEntry[] {
  // Show photos from the entire visible hemisphere (pi/2 range from center)
  // plus a few from the edges for richness
  const results = getNearestMemories(allMemories, viewTheta, viewPhi, maxCount);

  // Stable sort by id to reduce React key churn
  return [...results].sort((a, b) => a.id.localeCompare(b.id));
}
