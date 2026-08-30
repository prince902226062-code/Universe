// ============================================================
// Her Universe — Planet Quiz Data
// ============================================================
// 40 romantic questions, 5 per planet, with hints.
// "planet" field matches the canonical lowercase planet key
// derived from PlanetConfig.name (strip parenthetical suffixes).
// ============================================================

export interface PlanetQuizQuestion {
  id: string;
  planet: string; // canonical key: mercury | venus | earth | mars | jupiter | saturn | uranus | neptune
  question: string;
  hint: string;
}

// ─── Astronaut intro sentences (randomly picked before each question) ───────
export const ASTRONAUT_INTROS: string[] = [
  "Okay sweetheart... here's your next one. ❤️",
  "Hmmmm... let's see if you remember this one, baby. 👀❤️",
  "Alright love, look carefully at the planets... 🌌",
  "Okayyy, my clever girl... which one do you think it is? 🥰",
  "Don't rush, sweetheart... take a good look. ❤️",
  "This one's a little tricky... but I believe in you! 🌟",
  "Look around our little universe, baby... 💫❤️",
  "Hehe, here comes another one! 🥰🌌",
  "Ready? Think carefully, sweetheart... 💕",
  "I love watching you think... okay, here we go! ❤️✨",
];

// ─── Correct answer reactions ───────────────────────────────
export const CORRECT_REACTIONS: string[] = [
  "Yesss baby! You got it! 💋❤️",
  "That's my sweetheart! I knew you'd get it! 🥰❤️",
  "Perfect! You're so smart, my love! ✨💋",
  "Awww you're amazing! Absolutely right! 🥰🌟",
  "YES! I'm so proud of you, sweetheart! 💕💋",
  "You got it right, baby! My heart is full! ❤️🎉",
];

// ─── Wrong answer reactions ──────────────────────────────────
export const WRONG_PLANET_MESSAGE = "Ohhh wrong ans baby 🥺❤️";
export const WRONG_PLANET_RETRY = "Try again, sweetheart... 👀";

// ─── Invitation messages ─────────────────────────────────────
export const INVITATION_FIRST =
  "Hey sweetheart... let's play a little game? ❤️🌎";

export const INVITATION_RETRY_MESSAGES: string[] = [
  "Hey sweetheart... changed your mind? Want to play with me now? ❤️🥺",
  "Psst... I'm still here, baby. Ready to play? 🌌❤️",
  "I miss playing with you... want to try? 🥺💕",
];

export const DECLINE_FIRST = "Awww... okay sweetheart 🥺❤️";

export const DECLINE_RETRY_MESSAGES: string[] = [
  "Okay okayyy... I'll ask you again later, baby. ❤️",
  "No worries, my love... I'll be here whenever you're ready 💕",
  "Hehe okay okay... later then, sweetheart 🥺🌌",
];

// ─── Accept message ──────────────────────────────────────────
export const ACCEPT_MESSAGE =
  "Yayyy! I knew you'd say yes. 🥰\nLet's see how well you know our little universe... ❤️🌌";

// ─── Completion message ──────────────────────────────────────
export const COMPLETION_LINES: string[] = [
  "YOU DID IT, SWEETHEART! ❤️🌌",
  "You know the planets pretty well...",
  "But there's still one thing I know for sure...",
  "Out of all the worlds in my universe,",
  "YOU are still my favorite. ❤️",
  "Happy Birthday, my love. 💋❤️",
];

// ─── Mercury Questions (5) ───────────────────────────────────
const mercuryQuestions: PlanetQuizQuestion[] = [
  {
    id: "mercury-01",
    planet: "mercury",
    question:
      "Sweetheart, if I wanted to take you to the planet that stays closest to our Sun, which little world should we visit? ☀️❤️",
    hint: "It's the smallest, swiftest grey world orbiting right next to the Sun! ☀️",
  },
  {
    id: "mercury-02",
    planet: "mercury",
    question:
      "Baby, which planet is the tiniest in our whole solar system — small but mighty, just like the biggest feelings fit in the smallest hearts? 🥺❤️",
    hint: "Look for the tiny grey planet closest to the Sun's bright core! 🌟",
  },
  {
    id: "mercury-03",
    planet: "mercury",
    question:
      "My love, which planet zooms around the Sun faster than any other — completing its year in just 88 Earth days? ⚡❤️",
    hint: "Find the fast little planet on the innermost orbit! ⚡",
  },
  {
    id: "mercury-04",
    planet: "mercury",
    question:
      "Sweetheart, which world has the most dramatic temperature swings — scorching hot by day and freezing cold at night, almost like missing someone terribly? 🌡️❤️",
    hint: "It's the rocky world closest to the central star! ☀️",
  },
  {
    id: "mercury-05",
    planet: "mercury",
    question:
      "Which little rocky planet is covered in ancient craters, each one like a little mark left by a memory long ago? 🌑❤️",
    hint: "Look for the heavily cratered planet nearest to the Sun! 🌘",
  },
];

// ─── Venus Questions (5) ─────────────────────────────────────
const venusQuestions: PlanetQuizQuestion[] = [
  {
    id: "venus-01",
    planet: "venus",
    question:
      "Baby, which planet is the hottest in our solar system — its surface blazing with passion even hotter than Mercury? 🔥❤️",
    hint: "Look for the glowing golden Padu planet on the 2nd orbit from the Sun! ✨",
  },
  {
    id: "venus-02",
    planet: "venus",
    question:
      "Sweetheart, which planet is almost exactly the same size as Earth — like a twin world orbiting our star? 💑❤️",
    hint: "Find the golden-yellow Padu planet between Mercury and Earth! 💛",
  },
  {
    id: "venus-03",
    planet: "venus",
    question:
      "My love, which planet has such a thick, golden atmosphere that it traps heat like a warm embrace that never lets go? 🌫️❤️",
    hint: "Look for the bright golden planet with a thick atmosphere! 🌫️",
  },
  {
    id: "venus-04",
    planet: "venus",
    question:
      "Which beautifully rebellious planet spins backwards — so its Sun rises in the west and sets in the east, dancing to its own rhythm? 🔄💕",
    hint: "It's the Padu planet with the warm golden atmospheric glow! 🌟",
  },
  {
    id: "venus-05",
    planet: "venus",
    question:
      "Sweetheart, which planet shines so brightly in our night sky that it's called the Morning Star and the Evening Star? ✨❤️",
    hint: "Look for the second planet out from the Sun, shining bright yellow! ✨",
  },
];

// ─── Earth Questions (5) ─────────────────────────────────────
const earthQuestions: PlanetQuizQuestion[] = [
  {
    id: "earth-01",
    planet: "earth",
    question:
      "Out of all these beautiful worlds, which one is our little home together — the one where I get to share every day with you? 🌎❤️",
    hint: "Look for our beautiful blue and green home planet with its Moon! 🌎",
  },
  {
    id: "earth-02",
    planet: "earth",
    question:
      "Baby, which is the only planet we know of with oceans of liquid water glittering on its surface like a million tiny stars? 🌊❤️",
    hint: "Find the vibrant blue ocean world on the 3rd orbit! 🌊",
  },
  {
    id: "earth-03",
    planet: "earth",
    question:
      "My love, which planet has a Moon that watches over it every night — keeping it company just like I watch over you? 🌙💕",
    hint: "Look for the blue planet with a silver moon orbiting around it! 🌙",
  },
  {
    id: "earth-04",
    planet: "earth",
    question:
      "Sweetheart, which planet is wrapped in just the perfect atmosphere — not too thick, not too thin — to make life bloom like our love? 🌿❤️",
    hint: "It's the 3rd planet from the Sun, surrounded by blue oceans and clouds! 🌿",
  },
  {
    id: "earth-05",
    planet: "earth",
    question:
      "Which world is the only known planet in the universe bursting with life, laughter, and love? 🌸❤️",
    hint: "Find our home planet — the blue oasis where we share our love! 💙",
  },
];

// ─── Mars Questions (5) ──────────────────────────────────────
const marsQuestions: PlanetQuizQuestion[] = [
  {
    id: "mars-01",
    planet: "mars",
    question:
      "Baby, which planet looks like it has been painted red just for our romantic space adventure? ❤️🔴",
    hint: "Look for the fiery crimson red planet on the 4th orbit! 🔴",
  },
  {
    id: "mars-02",
    planet: "mars",
    question:
      "Sweetheart, which planet is home to the tallest volcano in the entire solar system — Olympus Mons, towering like an eternal mountain of dreams? 🌋❤️",
    hint: "Find the red world with the giant Olympus Mons mountain! 🌋",
  },
  {
    id: "mars-03",
    planet: "mars",
    question:
      "My love, which planet has two tiny moons — Phobos and Deimos — orbiting it like little guardians in the dark? 🌑🌑❤️",
    hint: "Look for the rusty reddish planet orbiting right after Earth! 🔴",
  },
  {
    id: "mars-04",
    planet: "mars",
    question:
      "Which planet has such a thin, wispy atmosphere that standing there would feel like standing on the edge of everything — just you and the cosmos? 🌬️❤️",
    hint: "It's the red planet standing between Earth and Jupiter! 🔴",
  },
  {
    id: "mars-05",
    planet: "mars",
    question:
      "Sweetheart, which red world shows ancient river valleys and dry lake beds — proof that water once flowed there, like memories of a life once lived? 💧❤️",
    hint: "Look for the famous Red Planet glowing in space! 🔴",
  },
];

// ─── Jupiter Questions (5) ───────────────────────────────────
const jupiterQuestions: PlanetQuizQuestion[] = [
  {
    id: "jupiter-01",
    planet: "jupiter",
    question:
      "Baby, which planet is so enormous that all the other planets in our solar system could fit inside it — as big as the love I have for you? 🪐❤️",
    hint: "Look for the giant orange-striped planet — the biggest of them all! 🪐",
  },
  {
    id: "jupiter-02",
    planet: "jupiter",
    question:
      "Sweetheart, which gas giant has a storm called the Great Red Spot that has been swirling for hundreds of years — unstoppable, like the feelings in my heart? 🌀❤️",
    hint: "Find the massive gas giant with the swirling Great Red Spot! 🌀",
  },
  {
    id: "jupiter-03",
    planet: "jupiter",
    question:
      "My love, which planet has more moons than any other — over 90 little worlds orbiting it, like so many moments orbiting our love story? 🌙❤️",
    hint: "Look for the largest planet in our solar system, with orange bands! 💛",
  },
  {
    id: "jupiter-04",
    planet: "jupiter",
    question:
      "Which planet is a swirling gas giant — made of hydrogen and helium instead of rock and water, majestic and mysterious? 💛❤️",
    hint: "It's the giant striped world orbiting beyond the asteroid field! 🪐",
  },
  {
    id: "jupiter-05",
    planet: "jupiter",
    question:
      "Baby, which planet spins so fast that a full day lasts only about 10 hours — spinning with excitement, just like my heart beats faster when I think of you? ⚡❤️",
    hint: "Find the huge gas giant spinning fast on the 5th orbit! ⚡",
  },
];

// ─── Saturn Questions (5) ────────────────────────────────────
const saturnQuestions: PlanetQuizQuestion[] = [
  {
    id: "saturn-01",
    planet: "saturn",
    question:
      "Which beautiful planet wears the prettiest rings around itself — almost like the universe gave it a little piece of jewelry just for being so lovely? 💍❤️",
    hint: "Look for the magnificent planet crowned with shining rings! 💍",
  },
  {
    id: "saturn-02",
    planet: "saturn",
    question:
      "Sweetheart, which giant planet is made mostly of gas — a gentle floating giant drifting through space like a dream? ☁️❤️",
    hint: "Find the elegant beige world wearing a wide ring halo! 💍",
  },
  {
    id: "saturn-03",
    planet: "saturn",
    question:
      "Baby, which planet is so light it could float on water if there were an ocean big enough — buoyant and wonderful, like joy? 🌊❤️",
    hint: "Look for the 6th planet from the Sun with the iconic ring system! 💍",
  },
  {
    id: "saturn-04",
    planet: "saturn",
    question:
      "My love, which ringed planet has over 80 moons including Titan — a moon so special it has its own thick golden atmosphere? 🌕❤️",
    hint: "It's the crowned jewel of the solar system with celestial rings! ✨",
  },
  {
    id: "saturn-05",
    planet: "saturn",
    question:
      "Which planet's gorgeous rings are made of billions of ice chunks and rocky bits — sparkling like a billion tiny diamonds in space? ✨❤️",
    hint: "Find the beautiful planet adorned with shimmering icy rings! 💍",
  },
];

// ─── Uranus Questions (5) ────────────────────────────────────
const uranusQuestions: PlanetQuizQuestion[] = [
  {
    id: "uranus-01",
    planet: "uranus",
    question:
      "Sweetheart, which planet is tilted so far over on its side that it practically rolls around the Sun — wonderfully unique, just like you? 🔄❤️",
    hint: "Look for the bright cyan blue-green ice giant spinning on its side! 🩵",
  },
  {
    id: "uranus-02",
    planet: "uranus",
    question:
      "Baby, which planet is an ice giant — made of water, methane and ammonia ices deep inside — cold and mysterious like the edge of the universe? 🧊❤️",
    hint: "Find the cyan planet with faint vertical rings orbiting beyond Saturn! 🧊",
  },
  {
    id: "uranus-03",
    planet: "uranus",
    question:
      "My love, which planet glows in the most beautiful blue-green color — like the ocean meeting the sky at the horizon? 🩵❤️",
    hint: "Look for the emerald-cyan icy planet on the 7th orbit! 🩵",
  },
  {
    id: "uranus-04",
    planet: "uranus",
    question:
      "Which planet has its own set of faint, dark rings that are barely visible — secrets hidden in the dark, waiting to be discovered? 💜❤️",
    hint: "It's the pale cyan world tilted 98 degrees on its axis! 🔄",
  },
  {
    id: "uranus-05",
    planet: "uranus",
    question:
      "Sweetheart, which planet has the most extreme axial tilt of any planet — 98 degrees — so its poles take turns facing the Sun for 42 Earth years each? 🌀❤️",
    hint: "Find the serene turquoise ice giant in the outer solar system! 🩵",
  },
];

// ─── Neptune Questions (5) ───────────────────────────────────
const neptuneQuestions: PlanetQuizQuestion[] = [
  {
    id: "neptune-01",
    planet: "neptune",
    question:
      "Baby, which planet is the farthest major world from our Sun — out at the very edge of everything, like a lighthouse at the end of the universe? 🌌❤️",
    hint: "Look for the deep royal-blue ocean planet on the outermost 8th orbit! 💙",
  },
  {
    id: "neptune-02",
    planet: "neptune",
    question:
      "Sweetheart, which planet shines a deep, breathtaking blue — the color of the deepest ocean, calm and endlessly beautiful? 💙❤️",
    hint: "Find the intense deep-blue world at the very edge of the main planets! 🌊",
  },
  {
    id: "neptune-03",
    planet: "neptune",
    question:
      "My love, which planet has the fiercest winds in the entire solar system — storms raging at over 2,000 km/h, wild and passionate? 🌬️❤️",
    hint: "Look for the deep blue ice giant with wild supersonic winds! 🌬️",
  },
  {
    id: "neptune-04",
    planet: "neptune",
    question:
      "Which distant planet is also an ice giant — a deep, cold, magnificent world of icy oceans churning beneath its clouds? 🧊💙❤️",
    hint: "It's the farthest blue planet orbiting far away from the Sun! 🌌",
  },
  {
    id: "neptune-05",
    planet: "neptune",
    question:
      "Sweetheart, which planet takes 165 Earth years to complete one orbit around the Sun — patient and eternal, like a love that never fades? ⏳❤️",
    hint: "Find the dark blue planet taking 165 years for one slow orbit! 💙",
  },
];

// ─── All Questions Combined ──────────────────────────────────
export const ALL_QUIZ_QUESTIONS: PlanetQuizQuestion[] = [
  ...mercuryQuestions,
  ...venusQuestions,
  ...earthQuestions,
  ...marsQuestions,
  ...jupiterQuestions,
  ...saturnQuestions,
  ...uranusQuestions,
  ...neptuneQuestions,
];

export const TOTAL_QUESTIONS = ALL_QUIZ_QUESTIONS.length; // 40

// ─── Helper: get canonical planet key from PlanetConfig.name ────
export function getPlanetKey(planetName: string): string {
  return planetName.toLowerCase().replace(/\s*\(.*\)/, '').trim();
}
