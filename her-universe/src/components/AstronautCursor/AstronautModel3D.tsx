// ============================================================
// Her Universe — AstronautModel3D Component
// ============================================================
// Procedural rigged 3D astronaut character meticulously designed
// to visually match the reference image:
// - Curved glossy helmet with golden/sunset reflection visor
// - Futuristic white spacesuit with warm orange accent bands
// - Detailed chest life-support console pack
// - Flexible ribbed oxygen tubes
// - Jetpack backpack with dual thruster nozzles
// - Articulated arms, puffy gloves, hips, legs, and space boots
// - Multi-layered continuous zero-G procedural animation
// ============================================================

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PointerState, AstronautCursorConfig } from './types';
import { StarDustTrail } from './StarDustTrail';

interface AstronautModel3DProps {
  pointerState: React.MutableRefObject<PointerState>;
  config: AstronautCursorConfig;
}

export function AstronautModel3D({ pointerState, config }: AstronautModel3DProps) {
  // Rig bone/group references
  const rootRef = useRef<THREE.Group>(null);
  const bodyGroupRef = useRef<THREE.Group>(null);
  const headGroupRef = useRef<THREE.Group>(null);
  const leftArmGroupRef = useRef<THREE.Group>(null);
  const rightArmGroupRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const leftLegGroupRef = useRef<THREE.Group>(null);
  const rightLegGroupRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);
  const backpackRef = useRef<THREE.Group>(null);
  const thrusterLightRef = useRef<THREE.PointLight>(null);

  // High quality PBR materials matching the reference artwork
  const materials = useMemo(() => {
    // Suit Matte White
    const suitWhite = new THREE.MeshStandardMaterial({
      color: '#f4f6fa',
      roughness: 0.35,
      metalness: 0.05,
    });

    // Suit Soft Inner / Joint Grey
    const suitJoint = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.6,
      metalness: 0.1,
    });

    // Orange Accent Trim
    const orangeAccent = new THREE.MeshStandardMaterial({
      color: '#ff7728',
      emissive: '#ff5511',
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.1,
    });

    // Visor Golden / Sky Glossy Dome
    const visorGlass = new THREE.MeshPhysicalMaterial({
      color: '#081224',
      emissive: '#1a3350',
      emissiveIntensity: 0.25,
      roughness: 0.08,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.95,
    });

    // Golden Visor Highlight Shell
    const visorGoldenRim = new THREE.MeshStandardMaterial({
      color: '#ffc83b',
      emissive: '#ff9900',
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.7,
      transparent: true,
      opacity: 0.45,
    });

    // Chest Console Pack (Slate Blue)
    const chestPack = new THREE.MeshStandardMaterial({
      color: '#8da4ba',
      roughness: 0.4,
      metalness: 0.3,
    });

    // Console Button Colors
    const btnCyan = new THREE.MeshBasicMaterial({ color: '#44e0ff' });
    const btnOrange = new THREE.MeshBasicMaterial({ color: '#ff8822' });
    const btnPink = new THREE.MeshBasicMaterial({ color: '#ff44aa' });
    const btnBlack = new THREE.MeshStandardMaterial({ color: '#1e2530', roughness: 0.5 });

    // Oxygen Hose (Ribbed Grey)
    const hoseMat = new THREE.MeshStandardMaterial({
      color: '#b0bec5',
      roughness: 0.5,
      metalness: 0.2,
    });

    // Thruster Metallic Cones
    const thrusterMetal = new THREE.MeshStandardMaterial({
      color: '#475569',
      roughness: 0.3,
      metalness: 0.8,
    });

    // Thruster Flame Glow
    const thrusterGlow = new THREE.MeshBasicMaterial({
      color: '#ffaa44',
      transparent: true,
      opacity: 0.8,
    });

    // Boot Sole Grip
    const bootSole = new THREE.MeshStandardMaterial({
      color: '#4a3832',
      roughness: 0.8,
      metalness: 0.0,
    });

    return {
      suitWhite,
      suitJoint,
      orangeAccent,
      visorGlass,
      visorGoldenRim,
      chestPack,
      btnCyan,
      btnOrange,
      btnPink,
      btnBlack,
      hoseMat,
      thrusterMetal,
      thrusterGlow,
      bootSole,
    };
  }, []);

  // Oxygen hose curve paths
  const leftHoseGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, -0.05, 0.35),
      new THREE.Vector3(-0.35, -0.2, 0.2),
      new THREE.Vector3(-0.35, -0.2, -0.15),
      new THREE.Vector3(-0.2, -0.1, -0.3),
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.038, 8, false);
  }, []);

  const rightHoseGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.15, -0.05, 0.35),
      new THREE.Vector3(0.35, -0.2, 0.2),
      new THREE.Vector3(0.35, -0.2, -0.15),
      new THREE.Vector3(0.2, -0.1, -0.3),
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.038, 8, false);
  }, []);

  // Animation time accumulator
  const timeRef = useRef(0);
  const clickWaveTimeRef = useRef(0);

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    timeRef.current += clampedDelta * config.floatSpeed;
    const t = timeRef.current;
    const pState = pointerState.current;

    if (!rootRef.current || !bodyGroupRef.current) return;

    // Velocity normalized components
    const vx = Math.max(-1, Math.min(1, pState.velocity.x / 600));
    const vy = Math.max(-1, Math.min(1, pState.velocity.y / 600));
    const speed = pState.speed;

    const floatAmp = config.enableFloating ? config.floatAmplitude : 0;
    // Gentle breathing when idle
    const idleBoost = Math.min(1.3, 1.0 + pState.idleTime * 0.1);
    const floatY = (Math.sin(t * 1.8) * 0.04 + Math.sin(t * 0.7) * 0.02) * floatAmp * idleBoost;
    const floatX = Math.cos(t * 1.2) * 0.02 * floatAmp;
    const swayZ = Math.sin(t * 1.0) * 0.03 * floatAmp;

    // Click reaction impulse
    if (pState.clickPulse > 0.1) {
      clickWaveTimeRef.current = 1.0;
    }
    clickWaveTimeRef.current *= Math.exp(-4 * clampedDelta);    // Guide action multipliers & gentle impulses
    const isGuideHappy = config.guideAction === 'happy-bounce';
    const isGuideCelebrate = config.guideAction === 'celebrate';
    const isGuideHinting = config.guideAction === 'turn-to-star' || config.guideAction === 'hint';
    const isSideObserve = config.guideAction === 'side-observe';

    // Gentle, silky smooth zero-G float instead of high-frequency bounce
    const guideBounce = isGuideHappy
      ? Math.sin(t * 3.5) * 0.06
      : isGuideCelebrate
      ? Math.sin(t * 3.0) * 0.08
      : 0;

    const guideSpin = isGuideCelebrate
      ? Math.sin(t * 4) * 0.3
      : isGuideHinting
      ? 0.35
      : 0;

    bodyGroupRef.current.position.set(floatX, floatY + guideBounce, 0);

    // Stable scale (no jarring squash or stretch)
    rootRef.current.scale.set(config.scale, config.scale, config.scale);

    // ========================================================
    // Layer 2: Directional Banking & Lean Physics
    // ========================================================
    const tiltStr = config.tiltStrength * 0.5;
    const targetRoll = -vx * tiltStr + swayZ; // bank left/right
    const targetPitch = vy * tiltStr * 0.5 + 0.08; // forward tilt
    const targetYaw = vx * 0.2 + Math.sin(t * 0.9) * 0.03 + guideSpin;

    // Smooth rotational damping
    bodyGroupRef.current.rotation.z += (targetRoll - bodyGroupRef.current.rotation.z) * 0.08;
    bodyGroupRef.current.rotation.x += (targetPitch - bodyGroupRef.current.rotation.x) * 0.08;
    bodyGroupRef.current.rotation.y += (targetYaw - bodyGroupRef.current.rotation.y) * 0.08;

    // Calculate dynamic directional angles toward target star if targetStarPos is provided
    let aimYaw = 0.65;
    let aimPitch = -0.3;

    if (config.targetStarPos) {
      const astroScreenX = pState.ndc.x; // [-1 to 1]
      const astroScreenY = pState.ndc.y; // [-1 to 1]

      // Target star position mapping in NDC space
      const targetNdcX = THREE.MathUtils.clamp(config.targetStarPos[0] / 80, -0.8, 0.8);
      const targetNdcY = THREE.MathUtils.clamp(config.targetStarPos[1] / 60, -0.6, 0.8);

      const dirX = targetNdcX - astroScreenX;
      const dirY = targetNdcY - astroScreenY;

      aimYaw = THREE.MathUtils.clamp(dirX * 0.9, -1.1, 1.1);
      aimPitch = THREE.MathUtils.clamp(-dirY * 0.8, -0.7, 0.7);
    }

    // ========================================================
    // Layer 4: Head / Helmet Movement
    // ========================================================
    if (headGroupRef.current) {
      let targetHeadYaw = vx * 0.25 + Math.sin(t * 1.3) * 0.05;
      let targetHeadPitch = -vy * 0.2 + Math.cos(t * 0.8) * 0.03;

      if (isGuideHinting) {
        targetHeadYaw = aimYaw;
        targetHeadPitch = aimPitch;
      } else if (isSideObserve) {
        targetHeadYaw = -0.55;
        targetHeadPitch = -0.1;
      } else if (isGuideHappy || isGuideCelebrate) {
        targetHeadPitch = -0.3 + Math.sin(t * 12) * 0.15;
      }

      headGroupRef.current.rotation.y += (targetHeadYaw - headGroupRef.current.rotation.y) * 0.25;
      headGroupRef.current.rotation.x += (targetHeadPitch - headGroupRef.current.rotation.x) * 0.25;
    }

    // ========================================================
    // Layer 5: Articulated Limbs (Arms & Hands)
    // ========================================================
    const limbStr = config.limbMotionStrength;

    // Left Arm (floating playful gesture / happy wave)
    if (leftArmGroupRef.current && leftForearmRef.current) {
      let leftArmBasePitch = -0.3 + Math.sin(t * 2.0 + 0.5) * 0.18 * limbStr;
      let leftArmBaseRoll = 0.45 + Math.cos(t * 1.6) * 0.12 * limbStr - vx * 0.3;
      let leftForearmBend = 0.4 + Math.sin(t * 2.2) * 0.15 * limbStr;

      if (isGuideHappy || isGuideCelebrate) {
        leftArmBasePitch = -1.4 + Math.sin(t * 14) * 0.4;
        leftArmBaseRoll = 0.8;
        leftForearmBend = 0.8;
      }

      leftArmGroupRef.current.rotation.x += (leftArmBasePitch - leftArmGroupRef.current.rotation.x) * 0.2;
      leftArmGroupRef.current.rotation.z += (leftArmBaseRoll - leftArmGroupRef.current.rotation.z) * 0.2;
      leftForearmRef.current.rotation.x += (leftForearmBend - leftForearmRef.current.rotation.x) * 0.2;
    }

    // Right Arm (pointing/wave gesture + click reaction + guide actions)
    if (rightArmGroupRef.current && rightForearmRef.current) {
      let waveOffset = clickWaveTimeRef.current * 0.6;
      let rightArmBasePitch = -0.4 - waveOffset + Math.cos(t * 2.2) * 0.18 * limbStr;
      let rightArmBaseRoll = -0.55 - waveOffset * 0.4 + Math.sin(t * 1.8) * 0.12 * limbStr - vx * 0.3;
      let rightForearmBend = 0.5 + waveOffset + Math.cos(t * 2.0) * 0.15 * limbStr;

      if (isGuideHappy || isGuideCelebrate) {
        waveOffset += 1.2 + Math.sin(t * 14) * 0.5;
        rightArmBasePitch = -0.4 - waveOffset;
        rightArmBaseRoll = -0.55 - waveOffset * 0.4;
        rightForearmBend = 0.5 + waveOffset;
      } else if (isGuideHinting) {
        // Direct forward & dynamic directional arm extension pointing straight at target star!
        rightArmBasePitch = -1.4 - aimPitch * 0.8; // Dynamic elevation angle toward star
        rightArmBaseRoll = -0.5 - aimYaw * 0.8;   // Dynamic horizontal angle toward star
        rightForearmBend = 0.05;                 // Straighten forearm for crisp pointing vector
      }

      rightArmGroupRef.current.rotation.x += (rightArmBasePitch - rightArmGroupRef.current.rotation.x) * 0.25;
      rightArmGroupRef.current.rotation.z += (rightArmBaseRoll - rightArmGroupRef.current.rotation.z) * 0.25;
      rightForearmRef.current.rotation.x += (rightForearmBend - rightForearmRef.current.rotation.x) * 0.25;
    }

    // ========================================================
    // Layer 6: Articulated Legs & Boots (Zero-G Drifting)
    // ========================================================
    if (leftLegGroupRef.current && leftKneeRef.current) {
      const leftLegTrail = -vy * 0.4 - vx * 0.2;
      const leftLegPitch = 0.25 + leftLegTrail + Math.sin(t * 1.5) * 0.14 * limbStr;
      const leftLegRoll = 0.15 + Math.cos(t * 1.1) * 0.08 * limbStr;
      const leftKneeBend = 0.35 + speed * 0.4 + Math.sin(t * 1.7) * 0.1 * limbStr;

      leftLegGroupRef.current.rotation.x += (leftLegPitch - leftLegGroupRef.current.rotation.x) * 0.15;
      leftLegGroupRef.current.rotation.z += (leftLegRoll - leftLegGroupRef.current.rotation.z) * 0.15;
      leftKneeRef.current.rotation.x += (leftKneeBend - leftKneeRef.current.rotation.x) * 0.15;
    }

    if (rightLegGroupRef.current && rightKneeRef.current) {
      const rightLegTrail = -vy * 0.4 + vx * 0.2;
      const rightLegPitch = 0.15 + rightLegTrail + Math.cos(t * 1.3) * 0.14 * limbStr;
      const rightLegRoll = -0.18 + Math.sin(t * 1.2) * 0.08 * limbStr;
      const rightKneeBend = 0.5 + speed * 0.5 + Math.cos(t * 1.5) * 0.1 * limbStr;

      rightLegGroupRef.current.rotation.x += (rightLegPitch - rightLegGroupRef.current.rotation.x) * 0.15;
      rightLegGroupRef.current.rotation.z += (rightLegRoll - rightLegGroupRef.current.rotation.z) * 0.15;
      rightKneeRef.current.rotation.x += (rightKneeBend - rightKneeRef.current.rotation.x) * 0.15;
    }

    // ========================================================
    // Layer 7: Thruster Flare / Lighting
    // ========================================================
    if (thrusterLightRef.current) {
      const thrusterIntensity = (speed > 0.05 ? 1.5 : 0.4) + pState.clickPulse * 3.0;
      thrusterLightRef.current.intensity = thrusterIntensity;
    }
  });

  return (
    <group ref={rootRef} position={[0, 0, 0]} dispose={null}>
      {/* Dynamic Thruster Light */}
      <pointLight
        ref={thrusterLightRef}
        color="#ff9933"
        intensity={0.6}
        distance={4}
        decay={2}
        position={[0, -0.5, -0.6]}
      />

      {/* Main Body Anchor */}
      <group ref={bodyGroupRef}>
        {/* =================================================== */}
        {/* TORSO & SPACESUIT BODY */}
        {/* =================================================== */}
        <group position={[0, 0, 0]}>
          {/* Main Suit Torso (curved chubby spaceship suit) */}
          <mesh material={materials.suitWhite} castShadow receiveShadow>
            <capsuleGeometry args={[0.38, 0.42, 16, 24]} />
          </mesh>

          {/* Orange Collar Ring */}
          <mesh position={[0, 0.36, 0]} material={materials.orangeAccent}>
            <torusGeometry args={[0.32, 0.035, 12, 24]} />
          </mesh>

          {/* Orange Waist Belt */}
          <mesh position={[0, -0.25, 0]} material={materials.orangeAccent}>
            <torusGeometry args={[0.36, 0.025, 12, 24]} />
          </mesh>

          {/* =================================================== */}
          {/* CHEST CONTROL PACK (Front Console) */}
          {/* =================================================== */}
          <group position={[0, 0.08, 0.33]} rotation={[0.08, 0, 0]}>
            {/* Console Base Box */}
            <mesh material={materials.chestPack}>
              <boxGeometry args={[0.36, 0.32, 0.12]} />
            </mesh>

            {/* Console Screen / Dials Plate */}
            <mesh position={[0, 0.06, 0.065]} material={materials.btnBlack}>
              <boxGeometry args={[0.3, 0.12, 0.02]} />
            </mesh>

            {/* Indicator Lights (Cyan, Orange, Pink) */}
            <mesh position={[-0.09, 0.06, 0.08]} material={materials.btnCyan}>
              <boxGeometry args={[0.06, 0.06, 0.02]} />
            </mesh>
            <mesh position={[0, 0.06, 0.08]} material={materials.btnOrange}>
              <boxGeometry args={[0.06, 0.06, 0.02]} />
            </mesh>
            <mesh position={[0.09, 0.06, 0.08]} material={materials.btnPink}>
              <circleGeometry args={[0.032, 16]} />
            </mesh>

            {/* Round Rotary Dial */}
            <mesh position={[-0.07, -0.06, 0.07]} rotation={[Math.PI / 2, 0, 0]} material={materials.btnBlack}>
              <cylinderGeometry args={[0.045, 0.045, 0.03, 16]} />
            </mesh>

            {/* Lower Toggle Switches */}
            <mesh position={[0.06, -0.06, 0.07]} material={materials.orangeAccent}>
              <cylinderGeometry args={[0.025, 0.025, 0.03, 12]} />
            </mesh>
          </group>

          {/* Oxygen Hoses Left & Right */}
          <mesh geometry={leftHoseGeo} material={materials.hoseMat} />
          <mesh geometry={rightHoseGeo} material={materials.hoseMat} />

          {/* =================================================== */}
          {/* BACKPACK (PLSS - Primary Life Support Subsystem) */}
          {/* =================================================== */}
          <group ref={backpackRef} position={[0, 0.06, -0.38]}>
            {/* Main Backpack Unit */}
            <mesh material={materials.suitWhite}>
              <boxGeometry args={[0.56, 0.68, 0.28]} />
            </mesh>

            {/* Side Storage Pods */}
            <mesh position={[-0.3, 0.05, 0]} material={materials.suitJoint}>
              <cylinderGeometry args={[0.065, 0.065, 0.45, 16]} />
            </mesh>
            <mesh position={[0.3, 0.05, 0]} material={materials.suitJoint}>
              <cylinderGeometry args={[0.065, 0.065, 0.45, 16]} />
            </mesh>

            {/* Orange Top Accent Strip */}
            <mesh position={[0, 0.32, 0]} material={materials.orangeAccent}>
              <boxGeometry args={[0.48, 0.05, 0.24]} />
            </mesh>

            {/* Thruster Nozzle Left */}
            <group position={[-0.16, -0.36, 0]}>
              <mesh material={materials.thrusterMetal} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.08, 0.14, 16]} />
              </mesh>
              <mesh position={[0, -0.06, 0]} material={materials.thrusterGlow} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.05, 0.12, 12]} />
              </mesh>
            </group>

            {/* Thruster Nozzle Right */}
            <group position={[0.16, -0.36, 0]}>
              <mesh material={materials.thrusterMetal} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.08, 0.14, 16]} />
              </mesh>
              <mesh position={[0, -0.06, 0]} material={materials.thrusterGlow} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.05, 0.12, 12]} />
              </mesh>
            </group>
          </group>

          {/* =================================================== */}
          {/* HEAD & HELMET WITH GLOSSY VISOR */}
          {/* =================================================== */}
          <group ref={headGroupRef} position={[0, 0.58, 0.02]}>
            {/* Outer Helmet Sphere */}
            <mesh material={materials.suitWhite}>
              <sphereGeometry args={[0.42, 32, 32]} />
            </mesh>

            {/* Helmet Rim Bezel (White frame around face) */}
            <mesh position={[0, 0.02, 0.18]} rotation={[0.2, 0, 0]} material={materials.orangeAccent}>
              <torusGeometry args={[0.34, 0.032, 16, 32]} />
            </mesh>

            {/* Large Reflective Bubble Visor */}
            <mesh position={[0, 0.03, 0.19]} rotation={[0.2, 0, 0]} material={materials.visorGlass}>
              <sphereGeometry args={[0.33, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
            </mesh>

            {/* Sunset / Golden Horizon Highlight on Visor */}
            <mesh position={[0, 0.12, 0.28]} rotation={[0.1, 0, 0]} material={materials.visorGoldenRim}>
              <ringGeometry args={[0.12, 0.24, 24]} />
            </mesh>

            {/* Ear Pods Left & Right (Comms & Headlamps) */}
            <group position={[-0.43, 0.02, 0.05]} rotation={[0, 0, Math.PI / 2]}>
              <mesh material={materials.suitJoint}>
                <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
              </mesh>
              <mesh position={[0, 0.045, 0]} material={materials.orangeAccent}>
                <torusGeometry args={[0.07, 0.015, 8, 16]} />
              </mesh>
            </group>

            <group position={[0.43, 0.02, 0.05]} rotation={[0, 0, Math.PI / 2]}>
              <mesh material={materials.suitJoint}>
                <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
              </mesh>
              <mesh position={[0, 0.045, 0]} material={materials.orangeAccent}>
                <torusGeometry args={[0.07, 0.015, 8, 16]} />
              </mesh>
            </group>
          </group>

          {/* =================================================== */}
          {/* LEFT ARM (Shoulder -> Forearm -> Glove) */}
          {/* =================================================== */}
          <group ref={leftArmGroupRef} position={[-0.42, 0.22, 0]}>
            {/* Shoulder Sphere */}
            <mesh material={materials.suitWhite}>
              <sphereGeometry args={[0.13, 16, 16]} />
            </mesh>
            {/* Orange Shoulder Stripe */}
            <mesh material={materials.orangeAccent}>
              <torusGeometry args={[0.135, 0.02, 12, 20]} />
            </mesh>

            {/* Upper Arm Cylinder */}
            <mesh position={[-0.12, -0.12, 0]} rotation={[0, 0, -Math.PI / 4]} material={materials.suitWhite}>
              <cylinderGeometry args={[0.1, 0.09, 0.24, 16]} />
            </mesh>

            {/* Forearm Group */}
            <group ref={leftForearmRef} position={[-0.2, -0.22, 0]}>
              <mesh position={[-0.08, -0.1, 0]} rotation={[0, 0, -Math.PI / 5]} material={materials.suitWhite}>
                <cylinderGeometry args={[0.09, 0.085, 0.22, 16]} />
              </mesh>
              <mesh position={[-0.08, -0.1, 0]} rotation={[0, 0, -Math.PI / 5]} material={materials.orangeAccent}>
                <torusGeometry args={[0.092, 0.014, 8, 16]} />
              </mesh>

              {/* Left Puffy Astronaut Glove */}
              <group position={[-0.15, -0.2, 0.04]} rotation={[0.3, 0.2, 0]}>
                {/* Glove Palm */}
                <mesh material={materials.suitWhite}>
                  <sphereGeometry args={[0.11, 16, 16]} />
                </mesh>
                {/* Pointing Index / Spread Finger */}
                <mesh position={[-0.06, -0.06, 0.04]} rotation={[0.4, 0, 0.4]} material={materials.suitWhite}>
                  <capsuleGeometry args={[0.035, 0.1, 8, 12]} />
                </mesh>
                {/* Thumb */}
                <mesh position={[0.04, 0.02, 0.06]} rotation={[0.6, 0.4, -0.3]} material={materials.suitWhite}>
                  <capsuleGeometry args={[0.035, 0.08, 8, 12]} />
                </mesh>
              </group>
            </group>
          </group>

          {/* =================================================== */}
          {/* RIGHT ARM (Shoulder -> Forearm -> Glove) */}
          {/* =================================================== */}
          <group ref={rightArmGroupRef} position={[0.42, 0.22, 0]}>
            {/* Shoulder Sphere */}
            <mesh material={materials.suitWhite}>
              <sphereGeometry args={[0.13, 16, 16]} />
            </mesh>
            {/* Orange Shoulder Stripe */}
            <mesh material={materials.orangeAccent}>
              <torusGeometry args={[0.135, 0.02, 12, 20]} />
            </mesh>

            {/* Upper Arm Cylinder */}
            <mesh position={[0.12, -0.12, 0]} rotation={[0, 0, Math.PI / 4]} material={materials.suitWhite}>
              <cylinderGeometry args={[0.1, 0.09, 0.24, 16]} />
            </mesh>

            {/* Forearm Group */}
            <group ref={rightForearmRef} position={[0.2, -0.22, 0]}>
              <mesh position={[0.08, -0.1, 0]} rotation={[0, 0, Math.PI / 5]} material={materials.suitWhite}>
                <cylinderGeometry args={[0.09, 0.085, 0.22, 16]} />
              </mesh>
              <mesh position={[0.08, -0.1, 0]} rotation={[0, 0, Math.PI / 5]} material={materials.orangeAccent}>
                <torusGeometry args={[0.092, 0.014, 8, 16]} />
              </mesh>

              {/* Right Puffy Astronaut Glove (Playful wave / point) */}
              <group position={[0.15, -0.2, 0.04]} rotation={[-0.2, -0.3, 0]}>
                {/* Glove Palm */}
                <mesh material={materials.suitWhite}>
                  <sphereGeometry args={[0.11, 16, 16]} />
                </mesh>
                {/* Pointing Index / Celebratory Finger */}
                <mesh position={[0.06, -0.06, 0.04]} rotation={[0.4, 0, -0.4]} material={materials.suitWhite}>
                  <capsuleGeometry args={[0.035, 0.1, 8, 12]} />
                </mesh>
                {/* Thumb */}
                <mesh position={[-0.04, 0.02, 0.06]} rotation={[0.6, -0.4, 0.3]} material={materials.suitWhite}>
                  <capsuleGeometry args={[0.035, 0.08, 8, 12]} />
                </mesh>
              </group>
            </group>
          </group>

          {/* =================================================== */}
          {/* LEFT LEG & SPACE BOOT */}
          {/* =================================================== */}
          <group ref={leftLegGroupRef} position={[-0.2, -0.35, 0]}>
            {/* Thigh */}
            <mesh position={[0, -0.12, 0]} material={materials.suitWhite}>
              <cylinderGeometry args={[0.12, 0.11, 0.24, 16]} />
            </mesh>
            {/* Orange Knee Band */}
            <mesh position={[0, -0.22, 0]} material={materials.orangeAccent}>
              <torusGeometry args={[0.115, 0.018, 8, 16]} />
            </mesh>

            {/* Knee & Calf Group */}
            <group ref={leftKneeRef} position={[0, -0.24, 0]}>
              <mesh position={[0, -0.12, 0]} material={materials.suitWhite}>
                <cylinderGeometry args={[0.11, 0.13, 0.24, 16]} />
              </mesh>

              {/* Chunky Left Space Boot */}
              <group position={[0, -0.26, 0.06]}>
                {/* Boot Main Body */}
                <mesh material={materials.suitWhite}>
                  <boxGeometry args={[0.22, 0.15, 0.32]} />
                </mesh>
                {/* Orange Sole Trim */}
                <mesh position={[0, -0.06, 0]} material={materials.orangeAccent}>
                  <boxGeometry args={[0.23, 0.03, 0.33]} />
                </mesh>
                {/* Dark Rubber Tread Sole */}
                <mesh position={[0, -0.085, 0]} material={materials.bootSole}>
                  <boxGeometry args={[0.24, 0.035, 0.34]} />
                </mesh>
              </group>
            </group>
          </group>

          {/* =================================================== */}
          {/* RIGHT LEG & SPACE BOOT */}
          {/* =================================================== */}
          <group ref={rightLegGroupRef} position={[0.2, -0.35, 0]}>
            {/* Thigh */}
            <mesh position={[0, -0.12, 0]} material={materials.suitWhite}>
              <cylinderGeometry args={[0.12, 0.11, 0.24, 16]} />
            </mesh>
            {/* Orange Knee Band */}
            <mesh position={[0, -0.22, 0]} material={materials.orangeAccent}>
              <torusGeometry args={[0.115, 0.018, 8, 16]} />
            </mesh>

            {/* Knee & Calf Group */}
            <group ref={rightKneeRef} position={[0, -0.24, 0]}>
              <mesh position={[0, -0.12, 0]} material={materials.suitWhite}>
                <cylinderGeometry args={[0.11, 0.13, 0.24, 16]} />
              </mesh>

              {/* Chunky Right Space Boot */}
              <group position={[0, -0.26, 0.06]}>
                {/* Boot Main Body */}
                <mesh material={materials.suitWhite}>
                  <boxGeometry args={[0.22, 0.15, 0.32]} />
                </mesh>
                {/* Orange Sole Trim */}
                <mesh position={[0, -0.06, 0]} material={materials.orangeAccent}>
                  <boxGeometry args={[0.23, 0.03, 0.33]} />
                </mesh>
                {/* Dark Rubber Tread Sole */}
                <mesh position={[0, -0.085, 0]} material={materials.bootSole}>
                  <boxGeometry args={[0.24, 0.035, 0.34]} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* Emitting Stardust Trail from Backpack Thrusters */}
      {config.enableParticles && (
        <StarDustTrail pointerState={pointerState} anchorRef={backpackRef} count={50} />
      )}
    </group>
  );
}
