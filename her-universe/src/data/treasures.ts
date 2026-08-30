// ============================================================
// Her Universe — Video Treasure Hunt Configuration
// ============================================================
// Centralized configuration for hidden 3D space treasures
// holding personal video memories.
// ============================================================

export type TreasureType = 'memory-capsule' | 'space-probe' | 'cosmic-crystal' | 'solar-relic';

export interface TreasureConfig {
  id: string;
  type: TreasureType;
  title: string;
  subtitle: string;
  description: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  videoUrl: string;
  color: string;
}

export const TREASURES: TreasureConfig[] = [
  {
    id: 'treasure-01',
    type: 'memory-capsule',
    title: 'First Starlight Memory 💖',
    subtitle: 'Chapter I — The Beginning',
    description: 'A glowing cosmic capsule floating near Venus, preserving an unforgettable smile.',
    position: [25, 8, -18],
    rotation: [0.2, 0.4, 0.1],
    videoUrl: '/videos/8376ba453ffe84e2f3051273eee97d81.mp4',
    color: '#ff77c8',
  },
  {
    id: 'treasure-02',
    type: 'space-probe',
    title: 'Voyager of Joy 🚀',
    subtitle: 'Chapter II — Sweet Moments',
    description: 'An ancient lost probe broadcasting sweet laughter across the asteroid belt.',
    position: [-38, 14, 28],
    rotation: [0.1, -0.6, 0.3],
    videoUrl: '/videos/ed67ec32fe6d7cbc482f8b656a9c9531.mp4',
    color: '#70d6ff',
  },
  {
    id: 'treasure-03',
    type: 'cosmic-crystal',
    title: 'Crystalized Wish ✨',
    subtitle: 'Chapter III — Pure Magic',
    description: 'A pulsing stellar crystal shining with magical birthday wishes near Jupiter.',
    position: [62, -6, -38],
    rotation: [0.5, 0.2, -0.4],
    videoUrl: '/videos/VID20260129141028.mp4',
    color: '#ffd166',
  },
  {
    id: 'treasure-04',
    type: 'solar-relic',
    title: 'Heart of the Cosmos 🌸',
    subtitle: 'Chapter IV — Precious Smiles',
    description: 'A mini glowing relic radiating warmth near Saturn.',
    position: [-72, 20, -28],
    rotation: [-0.3, 0.5, 0.2],
    videoUrl: '/videos/VID-20260209-WA0020.mp4',
    color: '#ff55aa',
  },
  {
    id: 'treasure-05',
    type: 'memory-capsule',
    title: 'Galactic Laughter 😄',
    subtitle: 'Chapter V — Unforgettable Fun',
    description: 'A shimmering capsule floating near Uranus, holding joyful memories.',
    position: [45, -15, 52],
    rotation: [0.3, -0.2, 0.5],
    videoUrl: '/videos/VID-20260223-WA0065.mp4',
    color: '#06d6a0',
  },
  {
    id: 'treasure-06',
    type: 'space-probe',
    title: 'Celestial Harmony 🎶',
    subtitle: 'Chapter VI — Radiant Energy',
    description: 'A probe beaming radiant melodies from the edge of Neptune.',
    position: [-55, -8, -60],
    rotation: [-0.4, 0.3, -0.2],
    videoUrl: '/videos/6c7bb20f0f2e7bbd0b2aef6094c34ed0.mp4',
    color: '#118ab2',
  },
  {
    id: 'treasure-07',
    type: 'cosmic-crystal',
    title: 'Starlight Serenade 🌟',
    subtitle: 'Chapter VII — Midnight Magic',
    description: 'A brilliant crystal shimmering in deep space with sparkling happiness.',
    position: [30, 22, -75],
    rotation: [0.6, -0.4, 0.1],
    videoUrl: '/videos/VID20260211084314.mp4',
    color: '#9c89ff',
  },
  {
    id: 'treasure-08',
    type: 'solar-relic',
    title: 'Eternal Sparkle 💖',
    subtitle: 'Chapter VIII — Sweet Memories',
    description: 'An ancient stellar relic glowing brightly in high solar orbit.',
    position: [-20, 30, 40],
    rotation: [-0.2, 0.6, 0.4],
    videoUrl: '/videos/VID20260128081558.mp4',
    color: '#ff70a6',
  },
  {
    id: 'treasure-09',
    type: 'memory-capsule',
    title: 'Cosmic Celebration 🎉',
    subtitle: 'Chapter IX — Sunshine Moments',
    description: 'A celebratory capsule floating through a bright star cluster.',
    position: [78, 12, 15],
    rotation: [0.4, 0.1, -0.3],
    videoUrl: '/videos/3100f53083475f7b3ab9b74fd0bd5502.mp4',
    color: '#ff9f1c',
  },
  {
    id: 'treasure-10',
    type: 'space-probe',
    title: 'Infinite Birthday Joy 🎂',
    subtitle: 'Chapter X — Special Treasure',
    description: 'A deep space probe broadcasting heartwarming birthday wishes.',
    position: [-65, -20, 35],
    rotation: [-0.5, -0.3, 0.6],
    videoUrl: '/videos/VID20260220235836.mp4',
    color: '#e71d36',
  },
  {
    id: 'treasure-11',
    type: 'solar-relic',
    title: "Prapti's Birthday Universe 🌌",
    subtitle: 'Grand Chapter — Forever & Always',
    description: 'The ultimate golden relic shining brightly near Prapti\'s World.',
    position: [15, -25, -45],
    rotation: [0.2, 0.5, -0.1],
    videoUrl: '/videos/0b88e5e8f978b023faea9320f1ca12f7.mp4',
    color: '#ff4d6d',
  },
];

export const TREASURE_HUNT_CONFIG = {
  proximityDetectionRadius: 28, // Distance for astronaut guide to notice treasure
  cameraFocusDistance: 16,     // Distance camera moves to when focusing on treasure
  glowIntensity: 2.2,
};
