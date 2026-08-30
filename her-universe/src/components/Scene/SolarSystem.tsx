// ============================================================
// Her Universe — SolarSystem Component
// ============================================================

import { Suspense } from 'react';
import * as THREE from 'three';
import { PLANETS, type PlanetConfig } from '../../data/planets';
import { getPlanetKey } from '../../data/planetQuiz';
import { Planet } from './Planet';

interface SolarSystemProps {
  focusedPlanetName?: string | null;
  anyFocused?: boolean;
  onPlanetClick?: (config: PlanetConfig) => void;
  registerRef?: (name: string, group: THREE.Group | null) => void;
  // ── Quiz game props ───────────────────────────────────────
  isGameMode?: boolean;
  gameWrongPlanet?: string | null;   // canonical key of wrong-clicked planet
  gameCorrectPlanet?: string | null; // canonical key of correct planet
}

export function SolarSystem({
  focusedPlanetName,
  anyFocused,
  onPlanetClick,
  registerRef,
  isGameMode,
  gameWrongPlanet,
  gameCorrectPlanet,
}: SolarSystemProps) {
  return (
    <group>
      <Suspense fallback={null}>
        {PLANETS.map((planet) => {
          const key = getPlanetKey(planet.name);
          return (
            <Planet
              key={planet.name}
              config={planet}
              isFocused={focusedPlanetName === planet.name}
              anyFocused={anyFocused}
              onPlanetClick={onPlanetClick}
              registerRef={registerRef}
              isGameMode={isGameMode}
              isGameWrong={gameWrongPlanet === key}
              isGameCorrect={gameCorrectPlanet === key}
            />
          );
        })}
      </Suspense>
    </group>
  );
}
