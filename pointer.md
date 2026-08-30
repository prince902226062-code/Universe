# pointer.md

# Astronaut Mouse Pointer — Project Specification

## 1. Overview

Create a premium animated mouse pointer using the provided astronaut image as the visual reference and design asset.

The astronaut becomes a custom cursor companion that follows the user's mouse throughout the website. It must not behave like a normal static cursor image. The astronaut should feel alive, floating in space, continuously moving, and smoothly reacting to mouse movement.

The intended visual behavior is:

**Mouse moves → astronaut smoothly follows → body floats → arms move → hands move → legs move → astronaut continuously remains in motion**

The experience should feel smooth, playful, premium, and cinematic.

---

## 2. Mandatory Visual Asset

Use the astronaut image supplied by the user as the primary visual reference for the astronaut.

Provided astronaut image:

```text
6950c682-5642-4479-8dbd-ee670134502e.png
```

The astronaut has:

- White futuristic spacesuit.
- Large reflective helmet visor.
- Backpack.
- Visible articulated arms.
- Visible hands.
- Visible legs.
- Warm orange accent details.
- Cute stylized 3D appearance.

Important: the supplied PNG is a 2D image of a 3D astronaut. If the astronaut itself must be genuinely animated in three dimensions, the production implementation needs a corresponding 3D model, preferably `.glb` or `.gltf`.

The supplied image should therefore be used as:

1. The exact visual reference for modeling or selecting the astronaut.
2. A fallback cursor sprite/placeholder during development.
3. The source reference for colors, proportions, pose, and visual style.

---

# 3. Core Cursor Behavior

The astronaut must follow the mouse pointer everywhere inside the experience.

Do not directly attach the astronaut to the mouse coordinates.

Use a smooth target-follow system:

```text
Mouse position
      ↓
Target position
      ↓
Damping / interpolation
      ↓
Astronaut position
```

The astronaut should slightly lag behind the mouse in a natural way.

### Required movement qualities

- No snapping.
- No visible jitter.
- Smooth acceleration.
- Smooth deceleration.
- Slight inertia.
- Frame-rate independent animation.
- Natural cursor following.
- Stable behavior at high refresh rates.

Recommended implementation:

- `requestAnimationFrame`.
- Delta-time-based movement.
- Exponential damping or lerp.
- Optional spring physics for an even more natural response.

---

# 4. Full-Body Animation

The astronaut must continuously animate even when the mouse is not moving.

The animation should be procedural or rigged and should include all major visible body parts.

## Body

The astronaut body should:

- Gently float up and down.
- Slightly sway.
- Subtly rotate.
- Lean naturally when following the mouse.
- Return smoothly toward a neutral pose.

## Head and Helmet

The helmet should:

- Slightly turn toward the direction of movement.
- Have subtle idle movement.
- Never rotate unnaturally or too aggressively.

## Arms

Both arms should:

- Move continuously.
- Swing gently during cursor movement.
- Have a small floating-space motion when idle.
- Bend naturally from the shoulder and elbow.
- React subtly to direction changes.

## Hands

The hands should:

- Follow arm movement.
- Have subtle wrist motion.
- Preserve the recognizable style of the provided astronaut.
- Optionally make small idle gestures.

## Legs

Both legs should:

- Move continuously.
- Float and drift naturally as if there is low gravity.
- Bend subtly while the astronaut follows the pointer.
- Swing slightly in the opposite direction of sudden movement.
- Never appear completely rigid.

## Backpack and Small Components

Small components can have:

- Slight delayed follow-through.
- Tiny secondary motion.
- Subtle rotational inertia.

This will make the astronaut feel more physically alive.

---

# 5. Motion Layers

Use multiple motion layers rather than one simple animation.

## Layer 1 — Cursor Following

The entire astronaut smoothly moves toward the mouse position.

## Layer 2 — Directional Tilt

The astronaut subtly tilts depending on mouse movement direction.

## Layer 3 — Floating

The body continuously floats in a low-gravity pattern.

## Layer 4 — Limb Motion

Arms and legs continuously move independently.

## Layer 5 — Secondary Motion

Hands, backpack, and smaller components react with slight delay.

This combination is important for creating a believable animated cursor companion.

---

# 6. 3D Requirement

The astronaut should ideally be a real 3D object, not just a flat animated image.

Recommended asset format:

```text
.glb
```

Preferred 3D model requirements:

- Separate body mesh or rigged skeleton.
- Separate or riggable arms.
- Separate or riggable legs.
- Hand joints where practical.
- Head/helmet joint.
- Animation-ready skeleton.
- Low-to-medium polygon count for browser performance.
- PBR materials.

The provided astronaut image should be used to preserve the visual appearance of the model.

If a real 3D model is not available initially, create the implementation architecture so that the PNG can be replaced by a GLB model later.

---

# 7. 3D Motion System

For the actual 3D implementation:

- Use a rigged GLB astronaut.
- Load it with `useGLTF`.
- Animate the model with React Three Fiber.
- Use `useFrame` for continuous motion.
- Animate bones or groups procedurally.
- Combine rig animations with procedural idle movement.
- Use delta time for all motion.

Suggested conceptual hierarchy:

```text
AstronautRoot
├── Body
│   ├── Head / Helmet
│   ├── LeftArm
│   │   └── LeftHand
│   ├── RightArm
│   │   └── RightHand
│   ├── LeftLeg
│   ├── RightLeg
│   └── Backpack
```

---

# 8. Mouse Direction Reaction

The astronaut should know the approximate direction of mouse movement.

For example:

```text
Mouse moves right  → astronaut leans slightly right
Mouse moves left   → astronaut leans slightly left
Mouse moves upward → legs trail slightly below
Mouse moves downward → body adjusts naturally
Mouse stops        → astronaut smoothly settles into floating idle motion
```

Direction changes must be damped.

Do not instantly rotate the astronaut to face every new direction.

---

# 9. Scale and Position

The astronaut should not cover the exact mouse click point.

Recommended behavior:

- Keep the actual pointer hotspot slightly offset from the astronaut's center.
- Position the astronaut close enough to feel connected to the cursor.
- Allow scale configuration.
- Adapt size to desktop and mobile screens.

Example configuration:

```ts
const astronautCursorConfig = {
  scale: 0.9,
  followDamping: 10,
  cursorOffsetX: 18,
  cursorOffsetY: -12,
  floatAmplitude: 0.08,
  floatSpeed: 1.2,
  directionalTilt: 0.18,
  enabled: true,
};
```

Values should be tuned for visual quality.

---

# 10. Click Interaction

The astronaut can react to mouse clicks.

Possible behavior:

1. User clicks.
2. Astronaut briefly compresses or reacts.
3. A hand or arm makes a small gesture.
4. The astronaut returns to the normal floating state.

Optional visual effects:

- Small glow.
- Tiny sparkle.
- Short thrust effect.
- Quick rotation.
- Brief wave.

These effects should be subtle and must not interfere with normal website interaction.

---

# 11. Cursor Visibility

The default browser cursor should be hidden only when the custom astronaut cursor is active.

Requirements:

- `cursor: none` only on supported pointer devices.
- Restore the normal cursor when the astronaut cursor is disabled.
- Avoid hiding the system cursor on touch-only devices.
- Respect accessibility requirements where possible.

The astronaut cursor should use a very high `z-index` when implemented as a DOM overlay.

---

# 12. Best Rendering Architecture

There are two recommended implementation approaches.

## Option A — Full 3D Overlay (Recommended)

Create a transparent React Three Fiber canvas above the entire website.

Architecture:

```text
Application
├── Main Website Content
└── Astronaut Cursor Canvas
    └── Transparent WebGL Canvas
        └── 3D Astronaut
```

The 3D astronaut canvas should:

- Have a transparent background.
- Be fixed to the viewport.
- Cover the screen.
- Ignore pointer events.
- Render above the normal website.
- Use the mouse position as a 3D target.

Recommended CSS:

```css
.astronaut-cursor-layer {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 99999;
}
```

This is the preferred solution for a genuinely 3D astronaut.

## Option B — Animated 2D/2.5D PNG Fallback

Use the supplied astronaut PNG as an overlay and animate it with:

- GSAP.
- CSS transforms.
- Spring/damping motion.
- Rotation.
- Scale.
- Float animation.

This is easier and lighter but does not satisfy the requirement for genuine 3D limb movement as well as a rigged 3D model.

---

# 13. Technology Stack

Recommended frontend-only stack:

## Core

- React
- Vite
- TypeScript

## 3D

- Three.js
- @react-three/fiber
- @react-three/drei

## Animation

- GSAP
- @gsap/react where appropriate

## Optional State

- Zustand

No backend is required.

---

# 14. Suggested Component Structure

```text
src/
├── components/
│   └── AstronautCursor/
│       ├── AstronautCursor.tsx
│       ├── AstronautModel.tsx
│       ├── AstronautRig.tsx
│       ├── CursorCamera.tsx
│       └── AstronautCursor.css
│
├── hooks/
│   └── usePointerPosition.ts
│
├── store/
│   └── cursorStore.ts
│
├── config/
│   └── astronautCursorConfig.ts
│
├── assets/
│   └── astronaut/
│       ├── astronaut.glb
│       └── reference.png
│
└── utils/
    └── smoothing.ts
```

---

# 15. Pointer Tracking Logic

The system should track:

```text
Current mouse X
Current mouse Y
Previous mouse X
Previous mouse Y
Mouse velocity X
Mouse velocity Y
Target position
Smoothed position
Movement direction
```

These values can be used to control:

- Astronaut root position.
- Body tilt.
- Head rotation.
- Arm swing.
- Leg motion.
- Secondary motion.

Avoid placing these values in React state every frame if that causes unnecessary component re-renders.

Use refs and the 3D render loop for high-frequency animation.

---

# 16. Animation States

The astronaut should support the following states:

## Idle

Mouse is still.

Behavior:

- Floating body.
- Gentle hand motion.
- Gentle leg movement.
- Subtle head movement.

## Following

Mouse is moving normally.

Behavior:

- Smooth target following.
- Directional body tilt.
- Natural arm and leg response.

## Fast Movement

Mouse velocity is high.

Behavior:

- Slightly stronger body lean.
- More visible limb follow-through.
- Smooth recovery after slowing down.

## Click

Mouse button is pressed.

Behavior:

- Small reaction animation.
- Optional hand gesture or compression.

## Hidden / Disabled

Custom cursor is temporarily inactive.

Behavior:

- Fade out or stop rendering.
- Restore normal browser cursor.

---

# 17. Performance Requirements

The astronaut pointer must be extremely smooth.

Requirements:

- Target 60 FPS or higher where hardware allows.
- Use `requestAnimationFrame` through React Three Fiber.
- Use delta time.
- Avoid unnecessary React re-renders.
- Keep the GLB lightweight.
- Use optimized textures.
- Use one canvas rather than repeatedly creating canvases.
- Disable or reduce expensive effects when not needed.
- Use a low number of lights.
- Consider device pixel ratio limits.
- Pause or reduce rendering when the tab is hidden.
- Use adaptive quality on low-performance devices.

Do not use heavy physics simulations unless they are genuinely required.

Natural procedural animation with damping should provide the best performance-to-quality ratio.

---

# 18. Accessibility and Fallbacks

Provide fallback behavior:

- Disable the custom astronaut cursor on touch-only devices.
- Keep the normal cursor if WebGL is unavailable.
- Respect `prefers-reduced-motion`.
- Provide a configuration flag to disable the feature.
- Do not block clicks or hover interactions on the website.
- The overlay must use `pointer-events: none`.

---

# 19. Configuration API

Create a reusable API similar to:

```tsx
<AstronautCursor
  enabled
  scale={0.9}
  followSpeed={10}
  offsetX={18}
  offsetY={-12}
  enableFloating
  enableClickReaction
  reducedMotion={false}
/>
```

Additional options may include:

- modelPath
- referenceImagePath
- zIndex
- floatAmplitude
- floatSpeed
- tiltStrength
- limbMotionStrength
- showOnTouchDevices

The component should be reusable throughout the project.

---

# 20. Integration with Her Universe

This astronaut pointer is designed to fit the larger **Her Universe** project.

It can act as:

- A playful guide through the solar system.
- A visual companion while exploring planets.
- A premium interactive detail.
- A thematic element that makes the website feel alive.

However, because the main website is already a 3D solar system, performance must be considered carefully.

Recommended integration strategy:

- Keep the main solar-system canvas as the primary 3D scene.
- Use one optimized overlay canvas for the astronaut only if needed.
- Share rendering resources where practical.
- Disable unnecessary post-processing on the cursor overlay.
- Use the astronaut at a moderate size.

An even more optimized alternative is to render the astronaut as part of the main Three.js scene and position it in camera/viewport space while preserving normal website interactions.

---

# 21. Final Quality Standard

The astronaut must feel like:

- A real companion.
- A living 3D character.
- Smoothly connected to the mouse.
- Weightless and floating in space.
- Constantly but subtly animated.
- Premium and cinematic.

The animation must include:

- Moving body.
- Moving arms.
- Moving hands.
- Moving legs.
- Head/helmet reaction.
- Floating motion.
- Directional reaction.
- Secondary motion.

The final interaction should feel like:

**You move your mouse → the astronaut comes alive and follows you through the universe.**

---

# 22. Claude Sonnet Implementation Prompt

You are a senior frontend engineer, Three.js specialist, React Three Fiber specialist, 3D character animation engineer, and motion designer.

Build a complete, production-quality, frontend-only custom cursor component using React, Vite, TypeScript, Three.js, React Three Fiber, Drei, and GSAP where appropriate.

## Main Requirement

Create a custom mouse pointer using the **attached astronaut reference image** as the exact visual reference.

**The attached astronaut image is mandatory reference material. Study and follow its design closely. The final 3D astronaut must visually resemble the supplied reference image rather than using a generic astronaut design.**

The reference image defines the astronaut's white suit, large reflective dark helmet visor, backpack, orange details, body proportions, limbs, cute futuristic appearance, and overall style.

The astronaut must follow the user's mouse smoothly throughout the website.

The astronaut must feel alive and must continuously animate.

Required visible motion:

- Body floating.
- Body sway.
- Subtle body rotation.
- Head/helmet movement.
- Moving left arm.
- Moving right arm.
- Moving hands.
- Moving left leg.
- Moving right leg.
- Backpack and secondary motion.
- Natural directional reaction.

The final result must look like a small animated astronaut companion following the mouse.

## Critical 3D Requirement

The supplied astronaut image is a 2D reference image. For genuine 3D animation, use a rigged `.glb` or `.gltf` astronaut model that visually matches the supplied image.

Prefer this architecture:

```text
Rigged GLB astronaut
    ↓
React Three Fiber
    ↓
Procedural bone/group animation
    +
Continuous floating animation
    +
Smooth cursor following
```

Use the supplied image for colors, visual style, proportions, suit details, helmet design, and overall appearance.

If a rigged model is unavailable, build the component architecture so the supplied PNG can be used as a temporary placeholder while keeping the code ready for a real GLB model.

## Cursor Following

Do not directly set the astronaut position equal to the mouse position.

Implement:

Mouse → target → damping/interpolation → astronaut

Use:

- delta time.
- smooth damping or exponential smoothing.
- slight inertia.
- stable movement.

There must be no snapping or jitter.

## Full Body Animation

Animate all body parts continuously.

### Body

- Gentle low-gravity floating.
- Slight sway.
- Subtle rotation.
- Directional lean based on mouse velocity.

### Arms

- Continuous idle motion.
- Direction-based follow-through.
- Shoulder and elbow movement.
- Smooth natural return.

### Hands

- Follow arm movement.
- Add subtle wrist motion.
- Optional tiny gestures.

### Legs

- Continuous floating movement.
- Independent low-gravity drifting.
- Direction-based trailing.
- Natural bending if the model rig supports it.

### Head

- Slight directional response.
- Idle movement.
- Smooth damping.

### Secondary Motion

- Backpack and secondary parts should lag slightly behind major body motion.

## Click Reaction

On mouse click:

- Add a short subtle reaction.
- Compress or tilt the astronaut.
- Optionally make a tiny hand gesture.
- Smoothly return to idle/follow state.

Do not block normal website clicks.

## Rendering

Preferred implementation:

- Transparent fixed React Three Fiber canvas.
- Full viewport.
- `pointer-events: none`.
- High z-index.
- Normal website remains fully interactive underneath.

The custom astronaut cursor should be disabled or replaced with the standard cursor on:

- Touch-only devices.
- WebGL fallback failure.
- Reduced-motion preference when appropriate.

## Performance

This component will be used with another large 3D solar-system scene.

Therefore optimize heavily:

- Do not use React state updates every animation frame.
- Use refs.
- Use `useFrame`.
- Use delta time.
- Keep the GLB lightweight.
- Optimize textures.
- Limit pixel ratio.
- Avoid unnecessary post-processing.
- Use one overlay canvas.
- Target stable 60 FPS or better on capable hardware.
- Pause or reduce work when the browser tab is hidden.

## Component API

Create a reusable component:

```tsx
<AstronautCursor
  enabled
  scale={0.9}
  followSpeed={10}
  offsetX={18}
  offsetY={-12}
  enableFloating
  enableClickReaction
  modelPath="/astronaut/astronaut.glb"
/>
```

Include clean TypeScript types.

## Deliverables

Provide:

1. Complete project architecture.
2. All required source files.
3. Complete TypeScript implementation.
4. Pointer tracking hook.
5. 3D astronaut component.
6. Rig/procedural animation logic.
7. Smooth cursor-follow system.
8. Floating animation.
9. Arm, hand, and leg motion.
10. Directional movement response.
11. Click reaction.
12. CSS for the transparent overlay.
13. Integration instructions.
14. Fallback behavior.
15. Performance optimizations.

Do not provide only pseudo-code.

The implementation must be frontend-only and ready to integrate into a React + Vite application.

The final result should feel like a polished, cute, cinematic 3D astronaut that smoothly follows the user everywhere and is continuously alive.
