// ============================================================
// Her Universe — Space Effects
// ============================================================
// Shooting stars, satellites, asteroid belt, and nebula clouds
// for a living, breathing space environment.
// ============================================================

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Shooting Stars ──────────────────────────────────────────────

interface ShootingStar {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  brightness: number;
  trailLength: number;
}

function ShootingStars({ count = 3 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const starsRef = useRef<ShootingStar[]>([]);
  const headRefs = useRef<(THREE.Mesh | null)[]>([]);
  const trailRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Initialize pool
  if (starsRef.current.length === 0) {
    for (let i = 0; i < count; i++) {
      starsRef.current.push({
        position: new THREE.Vector3(999, 999, 999),
        velocity: new THREE.Vector3(0, 0, 0),
        life: -Math.random() * 6, // stagger initial spawns
        maxLife: 0,
        brightness: 0,
        trailLength: 0,
      });
    }
  }

  const spawnStar = (star: ShootingStar) => {
    // Spawn in the visible area around the solar system
    star.position.set(
      (Math.random() - 0.5) * 200,
      20 + Math.random() * 100,
      (Math.random() - 0.5) * 200
    );

    const speed = 120 + Math.random() * 180;
    const angle = Math.random() * Math.PI * 2;
    star.velocity.set(
      Math.cos(angle) * speed * 0.7,
      -speed * 0.5 - Math.random() * speed * 0.3,
      Math.sin(angle) * speed * 0.7
    );

    star.maxLife = 0.6 + Math.random() * 1.0;
    star.life = star.maxLife;
    star.brightness = 1.0;
    star.trailLength = 12 + Math.random() * 18;
  };

  useFrame((_, delta) => {
    starsRef.current.forEach((star, i) => {
      if (star.life <= 0) {
        star.life += delta;
        if (star.life >= 0 && Math.random() < 0.4) {
          spawnStar(star);
        } else if (star.life >= 0) {
          star.life = -(4 + Math.random() * 8); // wait 4-12 seconds
        }

        if (headRefs.current[i]) headRefs.current[i]!.visible = false;
        if (trailRefs.current[i]) trailRefs.current[i]!.visible = false;
        return;
      }

      star.life -= delta;
      star.position.addScaledVector(star.velocity, delta);

      const lifeRatio = star.life / star.maxLife;
      const fade = lifeRatio < 0.2 ? lifeRatio / 0.2 : lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2 : 1.0;

      // Head
      if (headRefs.current[i]) {
        const mesh = headRefs.current[i]!;
        mesh.visible = true;
        mesh.position.copy(star.position);
        mesh.scale.setScalar(1.2 + fade * 0.8);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = fade * star.brightness;
      }

      // Trail
      if (trailRefs.current[i]) {
        const trail = trailRefs.current[i]!;
        trail.visible = true;
        const dir = star.velocity.clone().normalize();
        const trailCenter = star.position.clone().addScaledVector(dir, -star.trailLength * fade * 0.5);
        trail.position.copy(trailCenter);
        trail.lookAt(star.position);
        trail.rotateX(Math.PI / 2);
        trail.scale.set(1, star.trailLength * fade, 1);
        const mat = trail.material as THREE.MeshBasicMaterial;
        mat.opacity = fade * 0.4;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }, (_, i) => (
        <group key={i}>
          <mesh ref={(el) => { headRefs.current[i] = el; }} visible={false}>
            <sphereGeometry args={[0.6, 8, 8]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={1}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh ref={(el) => { trailRefs.current[i] = el; }} visible={false}>
            <coneGeometry args={[0.5, 1, 6]} />
            <meshBasicMaterial
              color="#99ccff"
              transparent
              opacity={0.5}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}


// ── Satellites ──────────────────────────────────────────────────

function Satellites({ count = 6 }: { count?: number }) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const anglesRef = useRef<number[]>([]);

  const satellites = useMemo(() => {
    const sats = [];
    for (let i = 0; i < count; i++) {
      const orbitR = 80 + Math.random() * 120;
      anglesRef.current.push(Math.random() * Math.PI * 2);
      sats.push({
        orbitRadius: orbitR,
        orbitSpeed: 0.05 + Math.random() * 0.1,
        height: 30 + Math.random() * 60,
        tilt: (Math.random() - 0.5) * 0.4,
        blinkSpeed: 3 + Math.random() * 5,
        blinkPhase: Math.random() * Math.PI * 2,
      });
    }
    return sats;
  }, [count]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    satellites.forEach((sat, i) => {
      anglesRef.current[i] += sat.orbitSpeed * delta;
      const angle = anglesRef.current[i];

      const x = Math.cos(angle) * sat.orbitRadius;
      const z = Math.sin(angle) * sat.orbitRadius;
      const y = sat.height + Math.sin(angle * 2) * sat.tilt * sat.orbitRadius;

      if (meshRefs.current[i]) {
        const mesh = meshRefs.current[i]!;
        mesh.position.set(x, y, z);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        const blink = Math.sin(t * sat.blinkSpeed + sat.blinkPhase);
        mat.opacity = blink > 0.6 ? 1.0 : 0.15;
      }
    });
  });

  return (
    <group>
      {satellites.map((_, i) => (
        <mesh key={i} ref={(el) => { meshRefs.current[i] = el; }}>
          <sphereGeometry args={[0.25, 6, 6]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}


// ── Distant Nebula Glow ─────────────────────────────────────────

function NebulaGlow() {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  const clouds = useMemo(() => [
    { pos: [-200, 80, -300] as const, scale: 180, color: '#1a0840', opacity: 0.06 },
    { pos: [250, 120, -350] as const, scale: 150, color: '#0a1850', opacity: 0.05 },
    { pos: [-100, -40, -250] as const, scale: 200, color: '#200a40', opacity: 0.04 },
    { pos: [180, 60, -280] as const, scale: 160, color: '#0a2040', opacity: 0.05 },
  ], []);

  useFrame((_, delta) => {
    clouds.forEach((_, i) => {
      if (meshRefs.current[i]) {
        meshRefs.current[i]!.rotation.z += 0.003 * delta;
      }
    });
  });

  return (
    <group>
      {clouds.map((cloud, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
          position={[cloud.pos[0], cloud.pos[1], cloud.pos[2]]}
        >
          <planeGeometry args={[cloud.scale, cloud.scale * 0.6]} />
          <meshBasicMaterial
            color={cloud.color}
            transparent
            opacity={cloud.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}


// ── Comets ──────────────────────────────────────────────────────

function Comets() {
  const cometRefs = useRef<(THREE.Group | null)[]>([]);
  const cometData = useRef<{
    active: boolean;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    life: number;
  }[]>([
    { active: false, position: new THREE.Vector3(), velocity: new THREE.Vector3(), life: 0 },
    { active: false, position: new THREE.Vector3(), velocity: new THREE.Vector3(), life: -3 },
  ]);

  const spawnComet = (c: typeof cometData.current[0]) => {
    c.position.set(
      (Math.random() - 0.5) * 200,
      40 + Math.random() * 80,
      -50 + (Math.random() - 0.5) * 200
    );
    const speed = 20 + Math.random() * 30;
    const angle = Math.random() * Math.PI * 2;
    c.velocity.set(Math.cos(angle) * speed, (Math.random() - 0.5) * 5, Math.sin(angle) * speed);
    c.active = true;
    c.life = 8 + Math.random() * 10;
  };

  useFrame((_, delta) => {
    cometData.current.forEach((c, i) => {
      if (!c.active) {
        c.life += delta;
        if (c.life >= 0) spawnComet(c);
        if (cometRefs.current[i]) cometRefs.current[i]!.visible = false;
        return;
      }

      c.life -= delta;
      if (c.life <= 0 || c.position.length() > 400) {
        c.active = false;
        c.life = -(3 + Math.random() * 8);
        if (cometRefs.current[i]) cometRefs.current[i]!.visible = false;
        return;
      }

      c.position.addScaledVector(c.velocity, delta);

      if (cometRefs.current[i]) {
        const grp = cometRefs.current[i]!;
        grp.visible = true;
        grp.position.copy(c.position);
        const lookTarget = c.position.clone().add(c.velocity);
        grp.lookAt(lookTarget);
      }
    });
  });

  return (
    <group>
      {[0, 1].map((i) => (
        <group key={i} ref={(el) => { cometRefs.current[i] = el; }} visible={false}>
          <mesh>
            <sphereGeometry args={[1.0, 12, 12]} />
            <meshBasicMaterial color="#ccffff" transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          {/* Outer glow */}
          <mesh>
            <sphereGeometry args={[2.0, 10, 10]} />
            <meshBasicMaterial color="#66aacc" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          {/* Tail */}
          <mesh position={[0, 0, -8]}>
            <coneGeometry args={[2.0, 16, 8]} />
            <meshBasicMaterial color="#4488aa" transparent opacity={0.25} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          {/* Inner tail */}
          <mesh position={[0, 0, -5]}>
            <coneGeometry args={[0.8, 10, 6]} />
            <meshBasicMaterial color="#88ddff" transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}
    </group>
  );
}


// ── Combined Space Effects ──────────────────────────────────────
export function SpaceEffects() {
  return (
    <group>
      <NebulaGlow />
      <ShootingStars count={6} />
      <Satellites count={6} />
      {/* Asteroid belt moved to UniverseEnvironment for unified Keplerian asteroid system */}
      <Comets />
    </group>
  );
}

