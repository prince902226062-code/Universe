// ============================================================
// Her Universe — Universe Environment Layer
// ============================================================
// Orchestrator component that renders all space stations and
// asteroid fields as an environmental layer on top of the
// existing solar system. Performance-adaptive.
// ============================================================

import { Suspense } from 'react';
import * as THREE from 'three';
import { STATIONS, ASTEROID_FIELDS } from '../../data/stations';
import { AsteroidFields } from '../Asteroids/InstancedAsteroids';
import { AnimatedSpaceStation } from '../Stations/SpaceStations';

interface UniverseEnvironmentProps {
  planetGroupsRef: React.RefObject<Map<string, THREE.Group>>;
}

export function UniverseEnvironment({ planetGroupsRef }: UniverseEnvironmentProps) {
  return (
    <group>
      {/* Deep space ambient and directional fill lighting for high visibility */}
      <ambientLight intensity={1.4} color="#7b8da5" />
      <directionalLight position={[120, 160, 100]} intensity={1.2} color="#d4e6ff" />
      <directionalLight position={[-140, -90, -120]} intensity={0.9} color="#a08cb4" />

      {/* Asteroid Fields — instanced, performance-optimized */}
      <Suspense fallback={null}>
        <AsteroidFields fields={ASTEROID_FIELDS} />
      </Suspense>

      {/* Space Stations — positioned exclusively outside the solar system */}
      <Suspense fallback={null}>
        {STATIONS.map((station) => (
          <AnimatedSpaceStation
            key={station.id}
            config={station}
            planetGroupsRef={planetGroupsRef}
          />
        ))}
      </Suspense>
    </group>
  );
}
