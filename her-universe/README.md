# Her Universe 🌌❤️

A cinematic, romantic 3D solar system built for **Prapti**.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Adding Your Photos

1. Drop your couple photos into `public/memories/`
2. Name them: `photo-01.jpg`, `photo-02.jpg`, ..., or any name you like
3. Open `src/data/memories.ts`
4. Update the `PLACEHOLDER_MEMORIES` array with your real photo filenames and titles

### For 1000+ photos (auto-layout):

```ts
// In src/App.tsx, replace PLACEHOLDER_MEMORIES with:
import { generateMemoriesFromFileList } from './data/memories';

const myPhotoFiles = [
  'IMG_001.jpg',
  'IMG_002.jpg',
  // ... all your filenames
];

const allMemories = generateMemoriesFromFileList(myPhotoFiles);
```

The Fibonacci sphere algorithm will automatically distribute all your photos evenly across the planet surface. No need to manually assign positions!

## Adding Background Music

Drop your MP3 file into `public/audio/background-music.mp3`.
The music will play automatically when the site loads.

## Building for Deployment

```bash
npm run build
```

The output in `dist/` can be deployed to:
- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages

No backend required — 100% static.

## File Structure

```
public/
├── memories/       ← Drop your couple photos here
├── textures/       ← Planet textures (optional, uses colors as fallback)
├── audio/          ← background-music.mp3
└── favicon.svg

src/
├── data/
│   ├── config.ts   ← Change girlfriend name, colors, camera settings here
│   ├── planets.ts  ← Planet sizes, speeds, orbits
│   └── memories.ts ← Photo data and titles
└── ...
```

## Customization

Edit `src/data/config.ts` to change:
- `GIRLFRIEND_NAME` — her name on the planet
- Camera settings
- Bloom intensity
- Star count
