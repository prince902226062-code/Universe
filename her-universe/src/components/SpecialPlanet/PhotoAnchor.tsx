// ============================================================
// Her Universe — PhotoAnchor Component
// ============================================================
// A single photo tile anchored to the planet's surface.
// Positioned via spherical coordinates, stays attached
// while the planet rotates.
// Animates outward when selected.
// ============================================================

import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { MemoryEntry } from '../../data/memories';
import { PHOTO_SAMPLER_CONFIG } from '../../data/config';
import { lerp } from '../../utils/orbitMath';

interface PhotoAnchorProps {
  memory: MemoryEntry;
  planetRadius: number;
  planetRotationYRef: React.RefObject<number>;
  isSelected: boolean;
  isAnySelected: boolean;
  onSelect: (memory: MemoryEntry, worldPos: THREE.Vector3) => void;
  index?: number;
  timeRef?: React.RefObject<number>;
}

// Global texture cache with 256x256 downsampled bitmaps for zero FPS lag
export const textureCache = new Map<string, THREE.Texture>();

export function loadDownsampledTexture(url: string, callback?: (tex: THREE.Texture) => void): THREE.Texture {
  if (textureCache.has(url)) {
    const cached = textureCache.get(url)!;
    callback?.(cached);
    return cached;
  }

  const placeholder = new THREE.Texture();
  placeholder.needsUpdate = false;
  textureCache.set(url, placeholder);

  // Decode off main thread using background createImageBitmap
  fetch(url)
    .then((res) => res.blob())
    .then((blob) => createImageBitmap(blob, { resizeWidth: 128, resizeHeight: 128, resizeQuality: 'low' }))
    .then((bitmap) => {
      const tex = new THREE.CanvasTexture(bitmap as unknown as HTMLCanvasElement);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      textureCache.set(url, tex);
      callback?.(tex);
    })
    .catch(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createLinearGradient(0, 0, 128, 128);
      grad.addColorStop(0, '#4a1942');
      grad.addColorStop(0.5, '#8b2f6b');
      grad.addColorStop(1, '#c4507a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      ctx.font = '40px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,200,220,0.8)';
      ctx.fillText('❤', 64, 80);

      const fallback = new THREE.CanvasTexture(canvas);
      textureCache.set(url, fallback);
      callback?.(fallback);
    });

  return placeholder;
}

function useSafeTexture(url: string): THREE.Texture {
  const [texture, setTexture] = useState<THREE.Texture>(() => {
    return loadDownsampledTexture(url);
  });

  useEffect(() => {
    loadDownsampledTexture(url, (tex) => {
      setTexture(tex);
    });
  }, [url]);

  return texture;
}

const sharedFrameGeo = new THREE.PlaneGeometry(0.74, 0.58);
const sharedPhotoGeo = new THREE.PlaneGeometry(0.66, 0.51);

export function PhotoAnchor({
  memory,
  planetRadius,
  planetRotationYRef,
  isSelected,
  isAnySelected,
  onSelect,
  index = 0,
  timeRef,
}: PhotoAnchorProps) {
  const groupRef = useRef<THREE.Group>(null);
  const frameMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const texture = useSafeTexture(memory.imageUrl);
  const emergeRef = useRef(0); // 0 = orbiting in ring, 1 = fully emerged
  const opacityRef = useRef(1);
  const [isHovered, setIsHovered] = useState(false);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [texture]
  );

  useEffect(() => {
    material.map = texture;
    material.needsUpdate = true;
  }, [texture, material]);

  // Clean up WebGL material on unmount to eliminate memory leaks
  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const safeDelta = Math.min(delta, 0.033);

    const rotY = planetRotationYRef.current ?? 0;
    const time = timeRef?.current ?? 0;

    // Differential revolving orbital speed (silky smooth, fluid orbital movement)
    const orbitSpeed = 0.12 + (index % 4) * 0.04;
    const revolvingTheta = memory.theta + time * orbitSpeed;

    // Staggered floating orbital distance around the planet
    const baseRadius = planetRadius + 0.75 + (index % 3) * 0.45;
    const floatOffset = Math.sin(time * 1.6 + index * 1.1) * 0.12;

    // Animate emerge value when clicked/selected
    const targetEmerge = isSelected ? 1 : 0;
    emergeRef.current = lerp(
      emergeRef.current,
      targetEmerge,
      isSelected
        ? safeDelta / PHOTO_SAMPLER_CONFIG.emergeDuration
        : safeDelta / PHOTO_SAMPLER_CONFIG.returnDuration
    );

    // Opacity: fade non-selected photos when a memory is open
    const targetOpacity = isSelected ? 1 : isAnySelected ? 0.15 : 0.94;
    opacityRef.current = lerp(opacityRef.current, targetOpacity, safeDelta * 4);
    material.opacity = opacityRef.current;

    if (frameMaterialRef.current) {
      frameMaterialRef.current.opacity = opacityRef.current * (isHovered ? 0.9 : 0.5);
    }

    // Distance from planet center — revolve at orbiting distance
    const dist = baseRadius + floatOffset + emergeRef.current * PHOTO_SAMPLER_CONFIG.emergeDistance;

    // Revolving surface normal direction vector
    const surfaceNormal = new THREE.Vector3(
      Math.sin(memory.phi) * Math.cos(revolvingTheta),
      Math.cos(memory.phi),
      Math.sin(memory.phi) * Math.sin(revolvingTheta)
    );

    const pos = surfaceNormal.clone().multiplyScalar(dist);
    groupRef.current.position.copy(pos);

    // Face outward into space as it revolves
    groupRef.current.lookAt(surfaceNormal.clone().multiplyScalar(100));

    // Smooth hover & emerge scaling
    const hoverScale = isHovered ? 1.2 : 1.0;
    const emergeScale = 0.6 + emergeRef.current * 0.4;
    groupRef.current.scale.setScalar(hoverScale * emergeScale);
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!groupRef.current) return;
    const worldPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPos);
    onSelect(memory, worldPos);
  };

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setIsHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Outer Glowing Frame Backplate */}
      <mesh position={[0, 0, -0.005]} geometry={sharedFrameGeo}>
        <meshBasicMaterial
          ref={frameMaterialRef}
          color={isHovered ? '#ff99dd' : '#ff40a0'}
          transparent
          opacity={isHovered ? 0.9 : 0.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Photo Texture Plane */}
      <mesh geometry={sharedPhotoGeo} material={material} />
    </group>
  );
}
