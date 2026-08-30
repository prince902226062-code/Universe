# Her Universe — Interactive 3D Solar System Project

## 1. Project Overview

**Project Name:** Her Universe  
**Concept:** A cinematic, fully interactive 3D solar system experience created as a romantic project for the user's girlfriend.

The website presents a living solar system in deep space. All planets orbit the Sun smoothly in real time, while the user's girlfriend has a special additional planet named after her. That planet is the emotional center of the experience: its surface is covered with the couple's photos, and clicking on any area of the planet causes the memory located at that area to emerge from the 3D surface and float toward the user.

The goal is to make the project feel like a premium cinematic universe rather than a normal website.

---

## 2. Core Experience

The visitor enters a beautiful 3D universe containing:

- A glowing Sun at the center.
- The planets of the solar system.
- A unique orbit path for every planet.
- Smooth, continuous planetary motion.
- Planetary self-rotation.
- A deep-space background with stars and subtle galaxy effects.
- An additional special planet named after the girlfriend.
- Couple photos distributed across the surface of the special planet.
- Mouse/cursor-based parallax movement.
- Click interaction that reveals an individual memory from the exact region of the special planet.

Everything should feel extremely smooth, cinematic, responsive, and alive.

---

## 3. Solar System Design

### The Sun

- Positioned at the center of the solar system.
- Has a realistic or stylized high-quality 3D appearance.
- Uses emissive materials and glow/bloom effects.
- Acts as the visual center of the entire experience.
- Produces a warm cinematic light for nearby planets.

### Normal Planets

Each planet should have:

- Its own orbit radius.
- Its own orbit speed.
- Its own size.
- Its own self-rotation speed.
- Its own rotation axis or tilt.
- A visible but subtle orbit path.
- Appropriate materials/textures.
- Smooth continuous animation.

The solar system should never feel static.

---

## 4. Planetary Motion

Every planet must continuously orbit around the Sun.

Each planet moves along its own orbit and has a different orbital speed. The movement should be smooth and frame-rate independent.

Example:

- Mercury: fastest orbit.
- Venus: slower.
- Earth: medium speed.
- Mars: medium/slow.
- Jupiter: slower.
- Saturn: slow with rotating rings.
- Outer planets: progressively slower.
- Girlfriend's planet: a special custom orbit and speed designed for visual beauty.

At the same time, every planet should rotate on its own axis.

Conceptually:

Planet
├── Distance from Sun
├── Orbit speed
├── Orbit radius
├── Orbit path
├── Orbit tilt
├── Planet size
└── Self-rotation speed

The planets should smoothly travel around the Sun without snapping, jittering, or unnecessary pauses.

---

## 5. Orbit Paths

Every planet should have its own visible orbit around the Sun.

Requirements:

- Orbit paths should be elegant and subtle.
- They should not overpower the planets.
- Elliptical or circular paths can be used depending on the desired realism.
- Planets must accurately follow their own paths.
- Each orbit should have a distinct radius.
- Orbit motion should be continuous.

The visual result should clearly communicate that the entire solar system is alive and moving.

---

## 6. Girlfriend's Special Planet

The most important feature of the project is an extra planet that does not exist in the real solar system.

This planet should:

- Be named after the girlfriend.
- Have a special custom orbit.
- Be visually more magical and emotionally significant than the other planets.
- Have a subtle glow.
- Use romantic but elegant visual effects.
- Become the main interactive destination of the experience.

Possible introductory text:

**Welcome to [HER NAME]'s Planet ❤️**  
*A world where every memory has a place.*

The exact girlfriend name should be configurable.

---

## 7. Photo Planet Concept

The girlfriend's planet is covered with the couple's photos.

The photos should be distributed around the entire spherical surface of the planet, not placed in a flat gallery.

The user should feel that the planet itself contains all of their memories.

Possible visual behavior:

- From far away, the planet looks beautiful and mysterious.
- As the camera approaches, individual photos become visible.
- Photos can be integrated into the surface as image tiles, cards, panels, or a carefully designed spherical collage.
- Each photo must have a stored position and orientation on the planet.

The distribution should cover the entire planet so that memories can be discovered from different areas.

---

## 8. Click Any Part of the Planet

This is the signature interaction.

When the user clicks anywhere on the girlfriend's planet:

1. The system uses raycasting to detect the exact 3D click position.
2. The photo associated with that area is identified.
3. The selected photo separates from the surface.
4. The photo smoothly emerges outward from the exact area where it was located.
5. It moves toward the camera or into a focused presentation.
6. The selected memory becomes clearly visible.
7. The rest of the photos remain part of the planet.
8. The background can subtly dim or blur to focus attention on the memory.

The interaction should feel like:

**Planet surface → Click → Photo emerges → Floats toward viewer → Memory is revealed**

When the user closes the memory:

**Focused photo → Smoothly returns → Reattaches to planet → Planet continues normally**

There should be no sudden position jumps.

---

## 9. Exact Surface-Based Photo Interaction

The project should not simply select a random photo after a click.

The interaction should be spatial.

Each photo should correspond to a region or position on the planet. The selected photo should emerge from the actual region associated with the click.

Technical approaches may include:

- Raycasting from the pointer into the 3D planet.
- Converting the intersection point into spherical coordinates.
- Mapping the intersection to a photo region.
- Finding the nearest photo anchor point.
- Animating the selected photo outward along the sphere's surface normal.

This makes it possible for photos to appear from anywhere on the visible planet depending on where the user clicks.

---

## 10. Smooth Cursor Interaction

Moving the cursor should create an extremely smooth cinematic parallax effect.

The cursor must not directly or instantly snap the solar system to a new position.

Desired behavior:

**Cursor movement → Target offset → Smooth interpolation → Gentle camera/system response**

The effect should have:

- Slight inertia.
- Smooth interpolation.
- A small cinematic delay.
- No harsh movement.
- No visible jitter.
- Subtle depth perception.

The user should feel like they are gently looking around the universe.

---

## 11. Camera Interaction

The camera should support:

- Gentle cursor-based parallax.
- Smooth zooming if enabled.
- Controlled rotation if appropriate.
- Cinematic movement toward the special planet.
- Smooth transitions between the solar-system overview and photo-memory focus.

Suggested flow:

1. Website opens.
2. The camera begins in deep space.
3. A cinematic reveal introduces the solar system.
4. The Sun and planets become visible.
5. The special planet is subtly highlighted.
6. The user explores using cursor movement.
7. Clicking the special planet begins a smooth focus transition.
8. Clicking its surface reveals individual memories.

The camera should never move abruptly.

---

## 12. Cinematic Intro Sequence

Suggested opening sequence:

🌌 Deep space  
↓  
✨ Stars slowly appear  
↓  
☀️ Camera reveals the Sun  
↓  
🪐 The full solar system becomes visible  
↓  
✨ Planets orbit around the Sun  
↓  
❤️ The special planet receives a subtle highlight  
↓  
📝 Optional text introduces the planet by the girlfriend's name  
↓  
🖱️ User gains full interactive control

The sequence should be skippable.

---

## 13. Visual Style

Recommended visual style:

- Dark cinematic space.
- Deep blue, purple, and subtle pink tones.
- Thousands of tiny stars.
- Distant galaxies and nebula-like atmosphere.
- Realistic or premium stylized 3D planets.
- Soft bloom around the Sun and special planet.
- Romantic effects used carefully.
- No excessive hearts or childish decorations.
- Elegant, emotional, premium, and immersive.

The girlfriend's planet should feel magical without looking completely unrelated to the rest of the universe.

---

## 14. Extreme Smoothness Requirements

Extreme smoothness is one of the highest priorities.

Requirements:

- Use `requestAnimationFrame` through the rendering framework.
- Use frame-rate independent movement with delta time.
- Use smooth interpolation/lerp for camera movement.
- Use spring or tween animations for focus transitions.
- Avoid unnecessary React re-renders every frame.
- Keep animation logic efficient.
- Use optimized and compressed textures.
- Optimize couple photos before loading.
- Lazy-load heavy assets when appropriate.
- Use adaptive quality for lower-performance devices.
- Reduce expensive post-processing on weaker hardware.
- Target a stable 60 FPS whenever the hardware permits.
- Avoid layout shifts.
- Avoid sudden animation changes.

---

## 15. Technology Stack

Recommended stack:

### Frontend
- React
- Vite
- TypeScript

### 3D
- Three.js
- React Three Fiber
- @react-three/drei

### Animation
- GSAP for cinematic sequences and complex transitions
- Framer Motion for UI elements if needed

### Visual Effects
- Postprocessing
- Bloom
- Glow
- Selective atmospheric effects

### Interaction
- Three.js raycasting
- Pointer events through React Three Fiber

---

## 16. Suggested Project Architecture

A clean architecture could be:

```text
src/
├── components/
│   ├── Scene/
│   │   ├── SolarSystem
│   │   ├── Sun
│   │   ├── Planet
│   │   ├── OrbitPath
│   │   ├── SpecialPhotoPlanet
│   │   └── StarField
│   ├── Camera/
│   │   └── CinematicCamera
│   ├── Memories/
│   │   ├── PhotoSurface
│   │   ├── PhotoMemory
│   │   └── MemoryViewer
│   └── UI/
│       ├── IntroOverlay
│       └── Controls
│
├── hooks/
│   ├── useSmoothPointer
│   └── usePhotoRaycast
│
├── data/
│   ├── planets
│   └── memories
│
├── utils/
│   ├── orbitMath
│   ├── sphericalCoordinates
│   └── performance
│
├── assets/
│   ├── photos
│   └── textures
│
├── App
└── main
```

The actual architecture may be improved as needed, but the code should remain modular.

---

## 17. Photo Data Structure

Each memory should contain information such as:

```text
Memory
├── id
├── image source
├── title
├── optional description
├── spherical position
├── 3D position
├── surface normal
└── optional rotation
```

The spherical position allows the memory to remain attached to the planet while it rotates.

---

## 18. Special Planet Interaction States

The special planet can have multiple states:

### Overview
The planet orbits normally with the solar system.

### Hover
The planet receives a subtle highlight or glow.

### Focus
The camera smoothly moves closer to the planet.

### Explore
Photos become more discoverable and the user can click different surface regions.

### Memory Open
The selected photo emerges and becomes the visual focus.

### Return
The photo smoothly returns to the correct location on the planet.

State transitions should be smooth and interrupt-safe.

---

## 19. Optional Features

Possible additional features:

- Romantic background music with mute/unmute control.
- Sound effects for memory discovery.
- Planet labels.
- A custom message from the user.
- A final surprise section.
- A hidden easter egg.
- A timeline of memories.
- A constellation that forms a special word.
- A final birthday or love message.
- Mobile device gyroscope interaction.
- Screenshot or share mode.
- A loading screen styled as a journey through space.

These should remain optional and should not reduce performance.

---

## 20. Mobile Responsiveness

The experience should also work on mobile devices.

On mobile:

- Touch dragging can replace mouse movement.
- Pinch gestures can control zoom if enabled.
- Tap can replace click.
- Device orientation can optionally create a subtle parallax effect.
- Post-processing quality can be reduced automatically if necessary.
- High-resolution photo assets should be optimized.

The mobile version should preserve the main emotional experience.

---

## 21. Performance Rules

The project must prioritize performance.

Important rules:

- Do not create unnecessary geometry every frame.
- Do not trigger React state updates continuously inside the render loop.
- Reuse geometry and materials where possible.
- Dispose resources correctly.
- Compress large image textures.
- Use lower-resolution textures for distant objects.
- Consider mipmaps and texture optimization.
- Use level-of-detail techniques where useful.
- Limit the number of expensive post-processing passes.
- Avoid loading all extremely high-resolution photos simultaneously.
- Keep UI outside the expensive 3D render loop where possible.

---

## 22. Quality Bar

The final project should feel:

- Cinematic.
- Extremely smooth.
- Emotionally personal.
- Premium.
- Technically impressive.
- Fully immersive.
- 3D from beginning to end.

It should not feel like a normal photo gallery with a solar-system background.

The main goal is to make the girlfriend feel that:

**She has her own planet inside the user's universe, and every part of that planet contains a memory they created together.**

---

# Frontend-Only Architecture (Mandatory)

## Strict Project Requirement

This entire project must be **frontend-only**.

**Do not use a backend, database, server, API for application data, authentication system, or server-side code.**

The complete experience must run directly in the user's browser as a static web application.

### All Features Must Be Handled on the Frontend

- 3D rendering → frontend only.
- Solar system calculations → frontend only.
- Planet orbit calculations → frontend only.
- Planet self-rotation → frontend only.
- Cursor interaction → frontend only.
- Camera movement → frontend only.
- Raycasting → frontend only.
- Photo selection → frontend only.
- Photo emergence animations → frontend only.
- Memory data → local frontend data files.
- Couple photos → local static assets.
- Music and sound effects → local static assets.
- UI state → React/frontend state only.
- Configuration → local TypeScript/JSON data.

### No Backend Technologies

Do not use:

- Node.js/Express backend servers.
- Spring Boot.
- Django.
- Flask.
- PHP.
- Databases.
- MySQL.
- PostgreSQL.
- MongoDB.
- Firebase database.
- Supabase database.
- Authentication systems.
- Login systems.
- User accounts.
- Server-side API routes.
- Backend microservices.

The project may use Node.js only for local development tooling such as Vite and npm. Node.js must **not** be used as a runtime backend for the deployed application.

### Local Assets

Store all couple photos and static assets inside the frontend project.

Suggested structure:

```text
public/
├── memories/
│   ├── photo-01.jpg
│   ├── photo-02.jpg
│   ├── photo-03.jpg
│   └── ...
├── audio/
│   └── background-music.mp3
└── textures/
    ├── sun.jpg
    ├── earth.jpg
    └── ...
```

The photo metadata can be stored in a local TypeScript configuration file:

```text
src/data/
└── memories.ts
```

### Deployment

The final project should be deployable as a static website.

The build output should be generated by:

```bash
npm run build
```

The resulting static files can be deployed to a static hosting service such as:

- GitHub Pages.
- Vercel.
- Netlify.
- Cloudflare Pages.

No backend infrastructure should be required.

### Important Privacy Note

Because the project is completely frontend-only, photos and static assets served by the website can potentially be accessible to someone who can access the deployed website assets. Therefore, the project should be treated as a personal/private experience rather than a secure private photo-storage platform.

---

# Master Prompt for Claude Sonnet

You are a senior creative frontend engineer, 3D web developer, Three.js specialist, React Three Fiber specialist, motion designer, and performance engineer.

Build a complete production-quality **frontend-only** interactive website project called **“Her Universe”** using **React + Vite + TypeScript + Three.js + React Three Fiber + Drei**.

## Mandatory Frontend-Only Requirement

The entire project must run as a static frontend application inside the user's browser.

**Do not create or require any backend. Do not use databases, server-side APIs, authentication, user accounts, Express servers, Spring Boot, Firebase database, Supabase database, MongoDB, MySQL, PostgreSQL, or any server-side application logic.**

Node.js may only be used for development tooling such as Vite and npm. It must not be used as a deployed runtime backend.

All 3D rendering, planetary calculations, cursor interaction, camera movement, raycasting, photo selection, photo animations, UI state, and memory data must be handled entirely on the frontend.

Store couple photos as local static assets and store memory metadata in local TypeScript or JSON configuration files.

The finished project must be deployable as a static website without backend infrastructure.

The project is a cinematic, romantic, fully interactive 3D solar system. This is not a simple landing page. The entire experience must feel like exploring a living universe.

## Core Concept

Create a complete 3D solar system in deep space.

- The Sun is positioned at the center.
- Every planet has its own orbit path.
- Every planet continuously orbits around the Sun.
- Every planet has its own unique orbit radius, orbit speed, size, tilt, and self-rotation speed.
- All planetary movement must be extremely smooth and frame-rate independent.
- Every planet should continuously rotate on its own axis while orbiting.
- Orbit paths should be visible but subtle and elegant.
- The solar system should feel alive at all times.

Add one additional special planet named **[GIRLFRIEND_NAME]**. This is the most important planet in the project.

## Visual Style

Create a premium cinematic deep-space atmosphere:

- Dark universe.
- Rich stars.
- Subtle distant galaxy or nebula atmosphere.
- Realistic or high-quality stylized planets.
- A glowing emissive Sun.
- Beautiful bloom and post-processing.
- Deep blue, purple, and subtle pink accents.
- Elegant romantic atmosphere.
- Avoid excessive hearts or childish decoration.
- Everything should look polished, immersive, and high-end.

## Extreme Smoothness

This requirement is critical.

The website must feel extremely smooth.

Use:

- React Three Fiber's render loop efficiently.
- Delta-time-based orbital motion.
- Smooth interpolation and damping.
- Lerp or spring-based cursor/camera movement.
- GSAP where appropriate for cinematic sequences.
- Minimal unnecessary React re-renders.
- Optimized textures.
- Proper cleanup and resource management.
- Adaptive quality where possible.
- No jitter.
- No snapping.
- No abrupt camera movement.

The target is a stable 60 FPS on capable devices.

## Cursor Interaction

When the user moves the mouse, the 3D experience should gently respond.

Do not directly map the cursor to camera movement.

Instead use a smooth system:

Cursor position → target camera offset → interpolation/damping → gentle camera movement

The result should create subtle cinematic parallax with inertia.

The user should feel like they are gently looking around the universe.

The effect should be subtle, premium, and extremely smooth.

## Special Planet

Create one extra planet named after the girlfriend.

This planet should:

- Have its own orbit around the Sun.
- Continuously rotate.
- Have a subtle magical glow.
- Be the emotional center of the experience.
- Have a custom orbit speed and distance.
- Be visually distinguishable but still part of the same universe.

Optional introductory text:

“Welcome to [GIRLFRIEND_NAME]'s Planet ❤️”
“A world where every memory has a place.”

The name must be configurable.

## The Photo Planet

The special planet must be covered with the couple's photos.

The photos should be distributed over the entire spherical surface of the planet.

Do not create a flat gallery.

Every memory must have a spatial position on the 3D sphere.

Each memory should store or derive:

- id
- image URL
- title
- optional description
- spherical coordinates
- 3D position
- surface normal
- orientation

The photos should remain attached to the planet while it rotates.

## Signature Click Interaction

This is the most important interactive feature.

When the user clicks on any visible part of the special planet:

1. Use raycasting to detect the exact 3D intersection point.
2. Determine which photo corresponds to that clicked region.
3. Select the nearest or mapped photo.
4. Animate that exact photo outward from the planet.
5. Move the photo along the surface normal so it appears to emerge from the exact area where it was located.
6. Continue the animation so the photo gently floats toward the camera or into a focused memory viewer.
7. Keep the motion extremely smooth.
8. Dim or subtly blur the background if appropriate.
9. Display the photo clearly with optional title and description.
10. When closed, animate the photo smoothly back to its exact original location and orientation on the planet.

The photo must not simply appear randomly in the center. It should visibly emerge from the actual region of the 3D planet that was clicked.

The experience should feel like:

Planet surface → click → exact photo emerges → floats toward the user → memory is revealed

And when closed:

Memory → smoothly returns → reconnects with the planet

Use raycasting and spherical-coordinate mapping or nearest-photo-anchor logic to achieve this.

## Camera

Create a cinematic camera system.

Support:

- Smooth cursor parallax.
- Gentle cinematic drift.
- Smooth camera focus transitions.
- Smooth movement toward the special planet.
- Smooth return to the solar-system overview.
- No abrupt jumps.

Suggested sequence:

1. Start in deep space.
2. Reveal stars.
3. Reveal the Sun.
4. Reveal the orbiting solar system.
5. Subtly highlight the girlfriend's planet.
6. Allow interactive exploration.
7. When the special planet is selected, smoothly transition toward it.
8. Allow surface clicks to reveal individual memories.

The intro should be skippable.

## Suggested Components

Use a clean modular architecture, for example:

- App
- Scene
- SolarSystem
- Sun
- Planet
- OrbitPath
- StarField
- SpecialPhotoPlanet
- PhotoMemory
- MemoryViewer
- CinematicCamera
- IntroOverlay
- Controls

Create reusable configuration data for all planets.

## Planet Configuration

Each planet configuration should support:

- name
- size
- orbitRadius
- orbitSpeed
- orbitTilt
- rotationSpeed
- axialTilt
- texture or material configuration
- optional rings
- optional label

Do not hard-code animation logic separately for every planet.

Create a reusable orbital system.

## Technology Requirements

Use:

- React
- Vite
- TypeScript
- Three.js
- @react-three/fiber
- @react-three/drei
- GSAP for cinematic transitions where useful
- Postprocessing for bloom and high-quality visual effects

Use pointer/raycast interaction through React Three Fiber or Three.js.

## Performance

Pay close attention to performance:

- Use `useFrame` correctly.
- Avoid React state updates every frame.
- Reuse geometry and materials.
- Use texture optimization.
- Use compressed or appropriately sized photo assets.
- Consider lazy loading.
- Reduce post-processing on lower-performance devices if needed.
- Dispose resources correctly.
- Keep the project clean and maintainable.

## Mobile

Make the experience responsive.

On mobile:

- Touch interaction replaces mouse interaction.
- Tap can select the planet and memories.
- Touch drag can control exploration where appropriate.
- Optional device orientation can create subtle parallax.
- Automatically reduce expensive visual effects when needed.

## Important Output Requirements

Generate the complete runnable project, not just an explanation.

Provide:

1. Complete project structure.
2. All required source files.
3. `package.json`.
4. Installation instructions.
5. Exact commands to run the project.
6. Strong TypeScript types.
7. Clean component architecture.
8. Reusable planet data.
9. Placeholder image support for couple photos.
10. Clear comments only where useful.
11. No pseudo-code for the core functionality.
12. Working raycast-based photo selection.
13. Working orbital motion.
14. Working self-rotation.
15. Smooth cursor parallax.
16. Smooth focus transitions.
17. Smooth photo emergence and return animation.

If external textures or assets are not included, use placeholders and clearly structure the asset system so they can be replaced later.

Before writing the final code, briefly explain the architecture and interaction flow. Then provide the complete implementation file by file.

Prioritize visual quality, interaction quality, smoothness, and emotional impact.

The final experience should feel like a premium interactive 3D universe where the girlfriend owns a planet full of shared memories.
