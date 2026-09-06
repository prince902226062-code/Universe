// ============================================================
// Her Universe — Media Database (mediaDB)
// ============================================================
// A two-layer cache for all photos and videos:
//
// Layer 1: In-memory GPU texture registry (Map<url, Texture>)
//   • Deduplicates textures — never re-uploads to GPU
//   • LRU eviction to keep GPU memory bounded (max 48 textures)
//
// Layer 2: IndexedDB blob cache (via idb-keyval)
//   • Persists image/video blobs across page refreshes
//   • Serves blobs instantly without any network request
//
// Preloading uses requestIdleCallback so the render loop is
// never blocked by background asset loading.
// ============================================================

import * as THREE from 'three';
import { get, set, del, keys } from 'idb-keyval';

// ── Config ───────────────────────────────────────────────────
const MAX_GPU_TEXTURES = 48;       // LRU cap for in-memory textures
const MAX_IDB_ENTRIES  = 300;      // max blobs to store in IndexedDB
const RESIZE_PX        = 128;      // downsampled photo size (px)
const IDB_KEY_PREFIX   = 'heru-media-';

// ── Types ────────────────────────────────────────────────────
type LRUEntry = { texture: THREE.Texture; lastUsed: number };

// ── In-memory GPU texture registry (LRU) ────────────────────
const gpuRegistry = new Map<string, LRUEntry>();

// ── Blob URL registry (for <video> / <img>) ──────────────────
// Maps url → object URL created from cached blob
const blobUrlRegistry = new Map<string, string>();

// ── In-flight promise registry ────────────────────────────────
// Prevents duplicate concurrent fetch()es for the same asset
const inflightTextures = new Map<string, Promise<THREE.Texture>>();
const inflightBlobs    = new Map<string, Promise<string>>();

// ── LRU eviction ─────────────────────────────────────────────
function evictLRUTextures(): void {
  if (gpuRegistry.size <= MAX_GPU_TEXTURES) return;

  // Sort by lastUsed ascending (oldest first)
  const sorted = [...gpuRegistry.entries()].sort((a, b) => a[1].lastUsed - b[1].lastUsed);
  const toEvict = sorted.slice(0, gpuRegistry.size - MAX_GPU_TEXTURES);

  for (const [url, entry] of toEvict) {
    entry.texture.dispose();
    gpuRegistry.delete(url);
  }
}

// ── IDB key helper ────────────────────────────────────────────
function idbKey(url: string): string {
  return IDB_KEY_PREFIX + url;
}

// ── IDB LRU eviction ─────────────────────────────────────────
async function evictIDBIfNeeded(): Promise<void> {
  try {
    const allKeys = (await keys()).filter((k) => String(k).startsWith(IDB_KEY_PREFIX));
    if (allKeys.length > MAX_IDB_ENTRIES) {
      // Evict oldest 20% of entries — simple approach since we don't store timestamps
      const toRemove = allKeys.slice(0, Math.floor(allKeys.length * 0.2));
      await Promise.all(toRemove.map((k) => del(k)));
    }
  } catch {
    // IDB unavailable — silently ignore
  }
}

// ── Fetch blob with IDB caching ───────────────────────────────
async function fetchBlobCached(url: string): Promise<Blob> {
  // 1. Try IndexedDB first
  try {
    const cached: ArrayBuffer | undefined = await get(idbKey(url));
    if (cached) {
      return new Blob([cached]);
    }
  } catch {
    // IDB read failed — fall through to network fetch
  }

  // 2. Fetch from network
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} fetching ${url}`);
  const arrayBuffer = await response.arrayBuffer();

  // 3. Store in IndexedDB asynchronously (don't block the return)
  Promise.resolve().then(async () => {
    try {
      await set(idbKey(url), arrayBuffer);
      await evictIDBIfNeeded();
    } catch {
      // IDB quota exceeded or unavailable — skip silently
    }
  });

  return new Blob([arrayBuffer]);
}

// ── Load a Three.js texture with full caching ─────────────────
export async function loadTexture(url: string): Promise<THREE.Texture> {
  // 1. Already in GPU registry?
  const existing = gpuRegistry.get(url);
  if (existing) {
    existing.lastUsed = Date.now();
    return existing.texture;
  }

  // 2. Already in-flight?
  const inflight = inflightTextures.get(url);
  if (inflight) return inflight;

  // 3. Fetch, decode, upload
  const promise = (async (): Promise<THREE.Texture> => {
    try {
      const blob = await fetchBlobCached(url);
      const bitmap = await createImageBitmap(blob, {
        resizeWidth:   RESIZE_PX,
        resizeHeight:  RESIZE_PX,
        resizeQuality: 'low',
      });

      const tex = new THREE.CanvasTexture(bitmap as unknown as HTMLCanvasElement);
      tex.colorSpace       = THREE.SRGBColorSpace;
      tex.generateMipmaps  = false;
      tex.minFilter        = THREE.LinearFilter;
      tex.needsUpdate      = true;

      gpuRegistry.set(url, { texture: tex, lastUsed: Date.now() });
      evictLRUTextures();
      return tex;
    } catch {
      // Fallback: pink heart placeholder
      return makePlaceholderTexture();
    } finally {
      inflightTextures.delete(url);
    }
  })();

  inflightTextures.set(url, promise);
  return promise;
}

// ── Sync getter (returns placeholder if not ready) ────────────
export function getTexture(url: string): THREE.Texture {
  const entry = gpuRegistry.get(url);
  if (entry) {
    entry.lastUsed = Date.now();
    return entry.texture;
  }
  return makePlaceholderTexture();
}

// ── Staggered idle preload for an array of URLs ───────────────
export function preloadTextures(urls: string[]): void {
  const scheduler =
    typeof requestIdleCallback !== 'undefined'
      ? (cb: () => void) => requestIdleCallback(cb, { timeout: 2000 })
      : (cb: () => void) => setTimeout(cb, 0);

  urls.forEach((url, i) => {
    scheduler(() => {
      // Only preload if not already cached
      if (!gpuRegistry.has(url) && !inflightTextures.has(url)) {
        loadTexture(url).catch(() => {/* handled inside */});
      }
    });
    void i; // suppress unused var warning (forEach already provides ordering)
  });
}

// ── Load a Blob URL (for <video> / <img>) with IDB cache ─────
export async function loadBlobUrl(url: string): Promise<string> {
  // 1. Already have a blob URL for this?
  const existing = blobUrlRegistry.get(url);
  if (existing) return existing;

  // 2. Already in-flight?
  const inflight = inflightBlobs.get(url);
  if (inflight) return inflight;

  const promise = (async (): Promise<string> => {
    try {
      const blob = await fetchBlobCached(url);
      const objectUrl = URL.createObjectURL(blob);
      blobUrlRegistry.set(url, objectUrl);
      return objectUrl;
    } finally {
      inflightBlobs.delete(url);
    }
  })();

  inflightBlobs.set(url, promise);
  return promise;
}

// ── Get a cached Blob URL synchronously (null if not ready) ──
export function getBlobUrl(url: string): string | null {
  return blobUrlRegistry.get(url) ?? null;
}

// ── Revoke a blob URL and remove from registry ────────────────
export function revokeBlobUrl(url: string): void {
  const objectUrl = blobUrlRegistry.get(url);
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    blobUrlRegistry.delete(url);
  }
}

// ── Placeholder texture for missing / errored photos ──────────
function makePlaceholderTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width  = RESIZE_PX;
  canvas.height = RESIZE_PX;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, RESIZE_PX, RESIZE_PX);
  grad.addColorStop(0,   '#4a1942');
  grad.addColorStop(0.5, '#8b2f6b');
  grad.addColorStop(1,   '#c4507a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, RESIZE_PX, RESIZE_PX);

  ctx.font      = '40px serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,200,220,0.8)';
  ctx.fillText('❤', RESIZE_PX / 2, RESIZE_PX * 0.65);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ── Named export object for convenient import ─────────────────
export const mediaDB = {
  loadTexture,
  getTexture,
  preloadTextures,
  loadBlobUrl,
  getBlobUrl,
  revokeBlobUrl,
} as const;
