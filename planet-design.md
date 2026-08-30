# Planet Design Specification — Her Universe

## 1\. Design Philosophy

All planets should be:

* Similar to their real-world counterparts.
* Immediately recognizable.
* Semi-realistic, not hyper-realistic.
* Slightly cinematic and animated.
* Optimized for extremely smooth browser performance.

Target visual balance:

```text
70% Realistic
30% Stylized Cinematic
```

Recommended construction:

```text
Optimized Sphere Geometry
        +
High-Quality Textures
        +
Layered Materials
        +
Atmospheric Effects
        +
Procedural Animation
```

\---

# 2\. Universal Planet Rules

Every standard planet should have:

* Smooth spherical 3D geometry.
* Real-world-inspired surface details.
* Individual scale.
* Individual orbit radius and speed.
* Individual self-rotation.
* Axial tilt.
* Appropriate material properties.
* Subtle cinematic lighting.
* Animation only where it improves realism.

\---

# 3\. The Sun ☀️

The Sun must be the most visually powerful object.

## Design

* Bright yellow/orange core.
* Deep red/orange animated surface patterns.
* Plasma-like movement.
* Emissive material.
* Strong but controlled bloom.
* Optional subtle solar particles and flares.

## Construction

```text
Sphere
  +
Animated Noise Shader
  +
Emissive Surface
  +
Glow
  +
Bloom
```

## Motion

* Continuous animated surface.
* Slow rotation.
* Gentle glow variation.
* Subtle plasma distortion.

The Sun must never look like a static flat texture.

\---

# 4\. Mercury ☿

## Design

* Small.
* Dark grey/brown.
* Rocky and cratered.
* Rough material.
* No visible atmosphere.

## Animation

* Self-rotation.
* Orbit around the Sun.
* Natural lighting changes.

Keep Mercury visually simple and efficient.

\---

# 5\. Venus ♀

## Design

* Warm yellow, cream, and orange tones.
* Dense swirling cloud appearance.
* Soft atmospheric glow.

## Layers

```text
Venus Core
     +
Dense Cloud Layer
     +
Soft Atmosphere
```

## Animation

* Slow independent cloud movement or subtle shader distortion.
* Self-rotation.
* Smooth orbit.

\---

# 6\. Earth 🌍

Earth should be one of the most detailed planets.

## Layers

```text
Earth Surface
     +
Cloud Sphere
     +
Blue Atmosphere
     +
Optional Night Lights
```

### Surface

* Realistic continents.
* Blue oceans.
* Green and brown land.
* White polar ice.

### Clouds

Use a second transparent sphere slightly larger than Earth.

Clouds should:

* Rotate independently.
* Move slightly differently from the surface.
* Add depth.

### Atmosphere

* Blue edge glow.
* Fresnel effect.
* Subtle bloom.

\---

# 7\. Mars ♂

## Design

* Red-orange terrain.
* Dark rocky areas.
* Craters.
* Subtle polar ice caps.
* Rough dusty material.

## Animation

* Slow self-rotation.
* Optional extremely subtle dust.
* No excessive effects.

Mars should look dry, calm, and realistic.

\---

# 8\. Jupiter ♃

Jupiter should be large and visually active.

## Design

* Cream, orange, brown, and white cloud bands.
* Clearly recognizable Great Red Spot.
* High-quality banded texture.

## Construction

```text
Jupiter Sphere
      +
High-Quality Band Texture
      +
Subtle Animated Shader Distortion
```

## Animation

* Self-rotation.
* Very subtle cloud-band movement.
* Gentle shader distortion.

Do not make Jupiter look like rapidly moving liquid.

\---

# 9\. Saturn ♄

## Planet

* Soft golden/beige tones.
* Subtle horizontal atmospheric bands.

## Rings

```text
Outer Ring
   +
Ring Gaps
   +
Middle Ring
   +
Inner Ring
```

The rings should have:

* Semi-transparent texture.
* Visible density variation.
* Soft lighting.
* Thin, realistic appearance.

## Animation

* Slow self-rotation.
* Optional extremely subtle independent ring movement.

\---

# 10\. Uranus ♅

## Design

* Pale cyan and light blue.
* Soft atmospheric gradients.
* Very smooth surface.
* Minimal visible texture.

## Animation

* Slow rotation.
* Very subtle atmospheric movement.

Uranus should feel calm and minimal.

\---

# 11\. Neptune ♆

## Design

* Deep rich blue.
* Darker blue bands.
* Subtle storm-like patterns.
* Mysterious atmospheric appearance.

## Animation

* Smooth rotation.
* Slow cloud/storm movement.
* Gentle shader distortion.
* Subtle edge glow.

\---

# 12\. Her Planet ❤️

This is the most personal and important planet.

It should feel:

* Magical.
* Beautiful.
* Personal.
* Warm.
* Discoverable.
* Emotionally significant.

## Layers

```text
Planet Core
      +
Personal Surface Design
      +
Photo Memory Layer
      +
Magical Atmosphere
      +
Subtle Glow
```

## Recommended colors

* Deep blue or violet base.
* Subtle pink.
* Soft purple.
* Tiny warm gold highlights.

Avoid making the entire planet pink or filling it with hearts. It should still feel like a real magical planet.

## Photo memory layer

Photos are distributed around the full 3D sphere.

Each photo stores:

```text
Photo
├── ID
├── Image
├── Title
├── Optional Description
├── Spherical Coordinates
├── 3D Position
├── Surface Normal
└── Orientation
```

Photos must:

* Follow the planet while it rotates.
* Remain attached to the spherical surface.
* Feel integrated into the planet.
* Become more discoverable when the camera approaches.

## Click interaction

```text
Click Planet Surface
        ↓
Raycast
        ↓
Exact 3D Intersection
        ↓
Identify Memory Near That Region
        ↓
Photo Emerges Outward
        ↓
Moves Along Surface Normal
        ↓
Focused Memory
```

The selected photo must emerge from the actual region where it belongs.

On close:

```text
Focused Photo
      ↓
Smooth Return
      ↓
Original Position
      ↓
Reattaches to Planet
```

\---

# 13\. Atmosphere Rules

Not every planet should have the same atmospheric effect.

### Strong

* Earth.
* Venus.
* Her Planet.

### Subtle

* Neptune.
* Uranus.
* Optional Mars.

### None

* Mercury.

Use:

* Fresnel effects.
* Transparent outer spheres.
* Custom shaders.
* Controlled bloom.

Avoid excessive glow.

\---

# 14\. Animation Rules

## Primary animation for every planet

* Orbit around the Sun.
* Self-rotation.

## Secondary animation

* Venus → moving clouds.
* Earth → independent cloud rotation.
* Jupiter → subtle cloud-band motion.
* Saturn → subtle ring motion.
* Neptune → subtle storm movement.
* Sun → animated plasma surface.
* Her Planet → magical energy and interactive photo memories.

All motion should be:

* Slow.
* Smooth.
* Continuous.
* Frame-rate independent.
* Subtle.

\---

# 15\. Orbit Design

Every planet must have:

* A distinct orbit radius.
* Its own orbit speed.
* Smooth continuous movement.
* A subtle visible orbit path.

Orbit paths should be:

* Thin.
* Low opacity.
* Elegant.
* Secondary to the planets.

The solar system must always feel alive because every planet continuously travels through its own orbit.

\---

# 16\. Lighting and Materials

Use cinematic lighting rather than uniform bright lighting.

```text
Sun
├── Warm primary light
├── Emissive appearance
└── Soft cinematic glow

Space
├── Dark environment
├── Subtle ambient illumination
└── Occasional cool rim lighting
```

Use PBR-style material properties where useful:

* Roughness.
* Normal maps.
* Roughness maps.
* Emissive maps.

The Sun should primarily use shader/emissive visuals rather than normal physical lighting.

\---

# 17\. Performance Strategy

Do not use 8–10 heavy animated 3D models.

Preferred strategy:

```text
Reusable Sphere Geometry
        +
Optimized Textures
        +
Layered Effects
        +
Procedural Animation
```

Use:

* Texture compression.
* Optimized texture sizes.
* Lower detail for distant planets.
* Shared geometry where practical.
* Limited post-processing.

This gives the best balance of realism, animation, and smooth browser performance.

\---

# 18\. Quality Checklist

Every planet should be checked for:

### Recognition

Can the user instantly recognize it?

### Realism

Does it resemble the real planet?

### Animation

Is its motion subtle and appropriate?

### Consistency

Does it match the rest of Her Universe?

### Performance

Does it remain smooth in the browser?

### Cinematic atmosphere

Does it look beautiful without excessive effects?

\---

# 19\. Planet Style Summary

|Object|Main Visual Style|Main Animation|
|-|-|-|
|Sun|Animated plasma|Surface movement and glow|
|Mercury|Rocky and cratered|Rotation|
|Venus|Dense yellow clouds|Cloud movement|
|Earth|Layered realistic world|Surface + cloud rotation|
|Mars|Dry red terrain|Rotation|
|Jupiter|Detailed cloud bands|Rotation + subtle band motion|
|Saturn|Golden planet + rings|Rotation + subtle ring motion|
|Uranus|Smooth pale cyan|Slow rotation|
|Neptune|Deep blue and stormy|Rotation + subtle storms|
|Her Planet|Magical personal world|Rotation + glow + interactive photos|

\---

# 20\. Final Recommendation

The ideal formula is:

```text
Real Planet Identity
       +
High-Quality Texture
       +
Subtle Layered Detail
       +
Procedural Animation
       +
Cinematic Lighting
       =
Her Universe Planet Style
```

This creates the best balance between realistic appearance, cinematic animation, and extremely smooth performance.

