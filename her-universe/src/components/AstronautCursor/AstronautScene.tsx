// ============================================================
// Her Universe — AstronautScene Component
// ============================================================
// Three.js scene hosting the astronaut character, viewport-to-3D
// coordinate mapping, studio lighting, and simulation loop.
// ============================================================

import { useRef, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { PointerState, AstronautCursorConfig } from './types';
import { AstronautModel3D } from './AstronautModel3D';
import { AstronautSpriteFallback } from './AstronautSpriteFallback';

interface AstronautSceneProps {
  pointerState: React.MutableRefObject<PointerState>;
  stepPhysics: (delta: number) => void;
  config: AstronautCursorConfig;
}

export function AstronautScene({
  pointerState,
  stepPhysics,
  config,
}: AstronautSceneProps) {
  const containerRef = useRef<THREE.Group>(null);
  const { viewport, size } = useThree();

  useFrame((_, delta) => {
    // Step simulation physics
    stepPhysics(delta);

    if (!containerRef.current) return;
    const pState = pointerState.current;

    const screenWidth = size.width || (typeof window !== 'undefined' ? window.innerWidth : 1920);
    const screenHeight = size.height || (typeof window !== 'undefined' ? window.innerHeight : 1080);

    const normX = (pState.smoothedPixels.x / screenWidth) - 0.5;
    const normY = -(pState.smoothedPixels.y / screenHeight) + 0.5;

    let targetWorldX = normX * viewport.width;
    let targetWorldY = normY * viewport.height;

    // During side-observe final sequence, drift to the right side of the screen
    if (config.guideAction === 'side-observe') {
      targetWorldX = viewport.width * 0.38;
      targetWorldY = -viewport.height * 0.2;
    }

    // Position container in world space with smooth lerp if side-observing
    if (config.guideAction === 'side-observe') {
      containerRef.current.position.x = THREE.MathUtils.lerp(containerRef.current.position.x, targetWorldX, 0.05);
      containerRef.current.position.y = THREE.MathUtils.lerp(containerRef.current.position.y, targetWorldY, 0.05);
    } else {
      containerRef.current.position.set(targetWorldX, targetWorldY, 0);
    }

    // Smooth visibility fade when mouse exits viewport
    const targetOpacity = pState.isInsideViewport || config.guideAction === 'side-observe' ? 1.0 : 0.0;
    containerRef.current.visible = targetOpacity > 0.01;
  });

  return (
    <>
      {/* Cinematic Studio Lighting for 3D Companion */}
      <ambientLight color="#f0f4ff" intensity={1.2} />

      {/* Warm Golden Key Light */}
      <directionalLight
        position={[4, 5, 6]}
        color="#fff5ea"
        intensity={2.4}
      />

      {/* Cosmic Blue Fill Light */}
      <directionalLight
        position={[-5, -3, 3]}
        color="#70a0ff"
        intensity={1.2}
      />

      {/* Solar Orange Rim Light */}
      <pointLight
        position={[0, 4, -4]}
        color="#ff8833"
        intensity={2.0}
        distance={15}
      />

      {/* Astronaut Root Anchor Group */}
      <group ref={containerRef}>
        <Suspense fallback={null}>
          {config.renderMode === '2.5d-sprite' ? (
            <AstronautSpriteFallback pointerState={pointerState} config={config} />
          ) : (
            <AstronautModel3D pointerState={pointerState} config={config} />
          )}
        </Suspense>
      </group>
    </>
  );
}
