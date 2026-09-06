// ============================================================
// Her Universe — Main 3D Scene
// ============================================================

import { Suspense, useCallback, useRef } from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { StarField } from './StarField';
import { CosmicNebula } from './CosmicNebula';
import { SpaceEffects } from './SpaceEffects';
import { UniverseEnvironment } from './UniverseEnvironment';
import { Sun } from './Sun';
import { SolarSystem } from './SolarSystem';
import { SpecialPhotoPlanet } from '../SpecialPlanet/SpecialPhotoPlanet';
import { CinematicCamera } from '../Camera/CinematicCamera';
import { ConstellationPuzzle } from '../ConstellationPuzzle/ConstellationPuzzle';
import { TreasureHunt } from '../TreasureHunt/TreasureHunt';
import type { MemoryEntry } from '../../data/memories';
import { SPECIAL_PLANET, type PlanetConfig } from '../../data/planets';
import type { PuzzleStarConfig } from '../../data/constellationData';
import type { TreasureConfig } from '../../data/treasures';
import { getPerformanceTier } from '../../utils/performance';
import { SCENE_CONFIG } from '../../data/config';

export interface SceneProps {
  onIntroComplete: () => void;
  introComplete: boolean;
  onMemoryOpen: (memory: MemoryEntry) => void;
  onMemoryClose: () => void;
  isFocused: boolean;
  focusedPlanet: PlanetConfig | null;
  onSelectPlanet: (planet: PlanetConfig) => void;
  puzzleActive: boolean;
  showStarMessage: boolean;
  isStarMessageFading?: boolean;
  isFinalCinematic: boolean;
  isPuzzleFocused?: boolean;
  discoveredTreasureIds: string[];
  focusedTreasure: TreasureConfig | null;
  onSelectTreasure: (treasure: TreasureConfig) => void;
  onHoverTreasure: (treasure: TreasureConfig | null) => void;
  onCorrectStarClick: (star: PuzzleStarConfig) => void;
  onWrongStarClick: () => void;
  onHoverStar: (star: PuzzleStarConfig | null) => void;
  onPuzzleComplete: () => void;
  onStarMessageFormed: () => void;
  // ── Quiz game props ───────────────────────────────────────
  isGameMode?: boolean;
  gameWrongPlanet?: string | null;
  gameCorrectPlanet?: string | null;
}

function SceneInner({
  onIntroComplete,
  introComplete,
  onMemoryOpen,
  onMemoryClose,
  isFocused,
  focusedPlanet,
  onSelectPlanet,
  puzzleActive,
  showStarMessage,
  isStarMessageFading,
  isFinalCinematic,
  isPuzzleFocused,
  discoveredTreasureIds,
  focusedTreasure,
  onSelectTreasure,
  onHoverTreasure,
  onCorrectStarClick,
  onWrongStarClick,
  onHoverStar,
  onPuzzleComplete,
  onStarMessageFormed,
  isGameMode,
  gameWrongPlanet,
  gameCorrectPlanet,
}: SceneProps) {
  const tier = getPerformanceTier();
  const planetGroupsRef = useRef<Map<string, THREE.Group>>(new Map());

  const handleRegisterRef = useCallback((name: string, group: THREE.Group | null) => {
    if (group) {
      planetGroupsRef.current.set(name, group);
    } else {
      planetGroupsRef.current.delete(name);
    }
  }, []);

  const getTargetPosition = useCallback(() => {
    if (!focusedPlanet) return null;
    const group = planetGroupsRef.current.get(focusedPlanet.name);
    if (!group) return null;
    const pos = new THREE.Vector3();
    group.getWorldPosition(pos);
    return pos;
  }, [focusedPlanet]);

  return (
    <>
      <CinematicCamera
        introComplete={introComplete}
        isFocused={isFocused}
        focusedPlanetName={focusedPlanet?.name}
        focusDistance={focusedPlanet?.focusDistance ?? 10}
        getTargetPosition={getTargetPosition}
        onIntroComplete={onIntroComplete}
        isFinalCinematic={isFinalCinematic}
        isPuzzleFocused={isPuzzleFocused}
        focusedTreasurePos={focusedTreasure?.position}
      />

      {/* Deep space background */}
      <color attach="background" args={['#02010a']} />
      <fog attach="fog" args={['#02010a', 300, 1200]} />

      {/* Stars */}
      <StarField count={tier.starCount} />

      {/* Vibrant Cosmic Nebulas matching reference photos */}
      <CosmicNebula />

      {/* Space Effects — shooting stars, satellites, asteroids, comets */}
      <SpaceEffects />

      {/* 3D Video Treasures */}
      <TreasureHunt
        discoveredIds={discoveredTreasureIds}
        focusedTreasureId={focusedTreasure?.id || null}
        onSelectTreasure={onSelectTreasure}
        onHoverTreasure={onHoverTreasure}
      />

      {/* Constellation Puzzle & Star Message */}
      <ConstellationPuzzle
        isActive={puzzleActive}
        onCorrectStarClick={onCorrectStarClick}
        onWrongStarClick={onWrongStarClick}
        onHoverStar={onHoverStar}
        onPuzzleComplete={onPuzzleComplete}
        onStarMessageFormed={onStarMessageFormed}
        showStarMessage={showStarMessage}
        isStarMessageFading={isStarMessageFading}
      />

      {/* Sun */}
      <Suspense fallback={null}>
        <Sun
          isFocused={focusedPlanet?.name === 'The Sun'}
          anyFocused={isFocused}
          onSunClick={onSelectPlanet}
          registerRef={handleRegisterRef}
        />
      </Suspense>

      {/* 8 Standard Planets */}
      <Suspense fallback={null}>
        <SolarSystem
          focusedPlanetName={focusedPlanet?.name}
          anyFocused={isFocused}
          onPlanetClick={onSelectPlanet}
          registerRef={handleRegisterRef}
          isGameMode={isGameMode}
          gameWrongPlanet={gameWrongPlanet}
          gameCorrectPlanet={gameCorrectPlanet}
        />
      </Suspense>

      {/* Prapti's Special Planet */}
      <Suspense fallback={null}>
        <SpecialPhotoPlanet
          isFocused={focusedPlanet?.name === SPECIAL_PLANET.name}
          anyFocused={isFocused}
          onFocusRequest={() => onSelectPlanet(SPECIAL_PLANET)}
          onMemoryOpen={onMemoryOpen}
          onMemoryClose={onMemoryClose}
          registerRef={handleRegisterRef}
        />
      </Suspense>

      {/* Space Stations & Dense Asteroid Fields */}
      <Suspense fallback={null}>
        <UniverseEnvironment planetGroupsRef={planetGroupsRef} />
      </Suspense>

      {/* Bloom and Post-Processing optimized for 90-120 FPS+ */}
      {tier.bloomEnabled && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom
            intensity={SCENE_CONFIG.bloomStrength}
            luminanceThreshold={SCENE_CONFIG.bloomThreshold}
            luminanceSmoothing={0.85}
            radius={SCENE_CONFIG.bloomRadius}
            resolutionScale={0.5}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.2} darkness={0.65} />
        </EffectComposer>
      )}
    </>
  );
}

export function Scene(props: SceneProps) {
  return <SceneInner {...props} />;
}
