// ============================================================
// Her Universe — Constellation & Star Letter Configuration
// ============================================================

export interface PuzzleStarConfig {
  id: string;
  order: number;
  label: string;
  position: [number, number, number];
  color?: string;
}

export interface FinalLetterConfig {
  title: string;
  subtitle: string;
  salutation: string;
  content: string;
  signature: string;
  date: string;
}

// 7 Puzzle Stars placed in clear upper-right space [35, 32, 5], perfectly
// framed in camera view and easy to reach without orbit clutter
export const PUZZLE_STARS: PuzzleStarConfig[] = [
  {
    id: 'star-1',
    order: 1,
    label: 'First Spark',
    position: [35, 18, 20],
    color: '#ff77aa',
  },
  {
    id: 'star-2',
    order: 2,
    label: 'Laughter',
    position: [20, 28, 10],
    color: '#ffaae5',
  },
  {
    id: 'star-3',
    order: 3,
    label: 'Sweet Memories',
    position: [14, 42, -5],
    color: '#ff80bf',
  },
  {
    id: 'star-4',
    order: 4,
    label: 'Warmth',
    position: [35, 36, -10],
    color: '#ffd166',
  },
  {
    id: 'star-5',
    order: 5,
    label: 'Adventures',
    position: [56, 42, -5],
    color: '#ff80bf',
  },
  {
    id: 'star-6',
    order: 6,
    label: 'Forever',
    position: [50, 28, 10],
    color: '#ffaae5',
  },
  {
    id: 'star-7',
    order: 7,
    label: 'My Universe',
    position: [35, 30, 2],
    color: '#ff44aa',
  },
];

// Configurable short opening message formed by moving stars in 3D
export const FINAL_STAR_MESSAGE = 'Happy Birthday, My Universe';

// Personal birthday letter configuration
export const FINAL_LETTER: FinalLetterConfig = {
  title: 'To My Dearest Universe ❤️',
  subtitle: 'A birthday letter written among the stars',
  salutation: 'Dearest Prapti,',
  content: `On this special day, as I look up at the infinite cosmos, every star reminds me of your warmth, your smile, and the joy you bring into my life.

Out of billions of galaxies and endless solar systems, finding you was the grandest discovery of my entire universe. You make every day brighter, sweeter, and infinitely more magical.

Thank you for being my constant light, my best friend, and my whole universe. Wishing you the happiest birthday filled with endless love, laughter, and starry dreams! ✨🎂🎉`,
  signature: 'Forever & Always Yours,',
  date: 'August 25th',
};

export const CONSTELLATION_CONFIG = {
  hintCooldown: 12, // seconds of inactivity before astronaut hints next star
  starGlowIntensity: 2.0,
  connectionLineWidth: 2.5,
  connectionLineColor: '#ff77c8',
  starLetterDuration: 3.5, // seconds for stars to morph into letter message
  cameraCinematicPosition: [0, 30, 75] as [number, number, number],
  cameraCinematicLookAt: [0, 30, 0] as [number, number, number],
  cameraPuzzlePosition: [35, 45, 80] as [number, number, number],
  cameraPuzzleLookAt: [35, 30, 0] as [number, number, number],
};
