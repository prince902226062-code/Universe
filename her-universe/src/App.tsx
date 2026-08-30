import { useState, useCallback, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene/Scene';
import { IntroOverlay } from './components/UI/IntroOverlay';
import { Controls } from './components/UI/Controls';
import { MemoryViewer } from './components/SpecialPlanet/MemoryViewer';
import { FinalLetterModal } from './components/UI/FinalLetterModal';
import { AstronautCursor } from './components/AstronautCursor';
import { useAudio } from './hooks/useAudio';
import type { MemoryEntry } from './data/memories';
import { type PlanetConfig } from './data/planets';
import type { PuzzleStarConfig } from './data/constellationData';
import { AstronautSpeechBubble } from './components/AstronautCursor/AstronautSpeechBubble';
import { VideoHologramModal } from './components/TreasureHunt/VideoHologramModal';
import type { TreasureConfig } from './data/treasures';
import { getPerformanceTier } from './utils/performance';
import { usePlanetQuizGame } from './components/PlanetQuiz/PlanetQuizGame';
import { PlanetQuizOverlay } from './components/PlanetQuiz/PlanetQuizOverlay';
import { getPlanetKey } from './data/planetQuiz';

const perf = getPerformanceTier();

export type ExperienceState =
  | 'exploring'
  | 'puzzle-active'
  | 'constellation-complete'
  | 'final-star-message'
  | 'final-letter';

export type GuideAction =
  | 'idle'
  | 'turn-to-star'
  | 'happy-bounce'
  | 'celebrate'
  | 'hint'
  | 'side-observe';

export default function App() {
  // Intro state
  const [showIntro, setShowIntro] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);

  // Astronaut cursor companion state
  const [astronautEnabled, setAstronautEnabled] = useState(true);
  const [guideAction, setGuideAction] = useState<GuideAction>('idle');
  const [targetStarPos, setTargetStarPos] = useState<[number, number, number] | null>(null);
  const [speechMessage, setSpeechMessage] = useState<string | null>(null);

  // Video Treasure Hunt state
  const [discoveredTreasureIds, setDiscoveredTreasureIds] = useState<string[]>([]);
  const [focusedTreasure, setFocusedTreasure] = useState<TreasureConfig | null>(null);

  // Experience & Puzzle state
  const [experienceState, setExperienceState] = useState<ExperienceState>('puzzle-active');
  const [showStarMessage, setShowStarMessage] = useState(false);
  const [isStarMessageFading, setIsStarMessageFading] = useState(false);
  const [showFinalLetterModal, setShowFinalLetterModal] = useState(false);
  const [isPuzzleFocused, setIsPuzzleFocused] = useState(false);

  // Camera / focus state
  const [isFocused, setIsFocused] = useState(false);
  const [focusedPlanet, setFocusedPlanet] = useState<PlanetConfig | null>(null);

  // Memory viewer state
  const [openMemory, setOpenMemory] = useState<MemoryEntry | null>(null);

  // Show hint after intro
  const [showPlanetHint, setShowPlanetHint] = useState(false);

  // Audio
  const { toggleMute, isMuted, play, setVolume } = useAudio('/audio/background-music.mp3');

  // ── Quiz game speech/guide adapter ─────────────────────────────
  const handleQuizAstronautSpeak = useCallback((msg: string | null) => {
    setSpeechMessage(msg);
  }, []);

  const handleQuizGuideAction = useCallback(
    (action: 'idle' | 'happy-bounce' | 'celebrate' | 'turn-to-star') => {
      setGuideAction(action as GuideAction);
    },
    []
  );

  // ── Planet Quiz Game ────────────────────────────────────────────
  const quiz = usePlanetQuizGame(
    introComplete,
    isFocused,
    handleQuizAstronautSpeak,
    handleQuizGuideAction,
  );

  // Inactivity tracking for subtle astronaut guide hints
  const lastInteractionTimeRef = useRef(Date.now());

  useEffect(() => {
    const handleActivity = () => {
      lastInteractionTimeRef.current = Date.now();
    };

    window.addEventListener('pointermove', handleActivity);
    window.addEventListener('pointerdown', handleActivity);
    return () => {
      window.removeEventListener('pointermove', handleActivity);
      window.removeEventListener('pointerdown', handleActivity);
    };
  }, []);

  // Inactivity checker loop
  useEffect(() => {
    if (experienceState !== 'puzzle-active') return;

    const interval = setInterval(() => {
      const idleTimeSec = (Date.now() - lastInteractionTimeRef.current) / 1000;

      if (idleTimeSec > 12 && guideAction === 'idle') {
        // Astronaut gently hints toward undiscovered puzzle star in outer space
        setTargetStarPos([110, 15, 20]);
        setGuideAction('hint');
        setTimeout(() => {
          setGuideAction((prev) => (prev === 'hint' ? 'idle' : prev));
        }, 3200);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [experienceState, guideAction]);

  const startAstronautGreetingSequence = useCallback(() => {
    // 1. Personal Greeting & Intro (0.8s)
    setTimeout(() => {
      setGuideAction('happy-bounce');
      setSpeechMessage("Welcome to your universe! I am the guide of your universe as I am in real life ✨");
    }, 800);

    // 2. Solar system & Planet zoom guide (6.0s)
    setTimeout(() => {
      setGuideAction('idle');
      setSpeechMessage("Explore the solar system! Click on any planet to zoom in and discover your quotes & memories 🪐✨");
    }, 6000);

    // 3. Treasure Hunt & Constellation Puzzle guide (11.5s)
    setTimeout(() => {
      setSpeechMessage("Find the 11 glowing video treasures hidden across space & solve the constellation puzzle for a surprise 🌟💖");
    }, 11500);

    // 4. Fade out speech bubble (17.0s)
    setTimeout(() => {
      setSpeechMessage((currentMsg) =>
        currentMsg?.includes("constellation puzzle") ? null : currentMsg
      );
    }, 17000);
  }, []);

  const handleIntroSkip = useCallback(() => {
    setShowIntro(false);
    setIntroComplete(true);
    setTimeout(() => setShowPlanetHint(true), 1000);
    startAstronautGreetingSequence();
    play();
  }, [play, startAstronautGreetingSequence]);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    setIntroComplete(true);
    setTimeout(() => setShowPlanetHint(true), 1500);
    startAstronautGreetingSequence();
    play();
  }, [play, startAstronautGreetingSequence]);

  const handle3DIntroComplete = useCallback(() => {
    // 3D camera intro done
  }, []);

  // Universal Planet Selection (from 3D scene or UI dock)
  // When the quiz is active, route click to the quiz checker instead of focusing.
  const handleSelectPlanet = useCallback((planet: PlanetConfig) => {
    if (quiz.isGameActive && quiz.quizState === 'QUESTION_ACTIVE') {
      const key = getPlanetKey(planet.name);
      quiz.handlePlanetClick(key);
      return;
    }
    setFocusedPlanet(planet);
    setIsFocused(true);
    setIsPuzzleFocused(false);
    setShowPlanetHint(false);
  }, [quiz]);

  const handleMemoryOpen = useCallback((memory: MemoryEntry) => {
    setOpenMemory(memory);
  }, []);

  const handleMemoryClose = useCallback(() => {
    setOpenMemory(null);
  }, []);

  const handleReturnToOverview = useCallback(() => {
    setIsFocused(false);
    setIsPuzzleFocused(false);
    setFocusedPlanet(null);
    setOpenMemory(null);
    setTimeout(() => setShowPlanetHint(true), 1500);
  }, []);

  const handleFocusConstellation = useCallback(() => {
    setIsPuzzleFocused(true);
    setIsFocused(false);
    setFocusedPlanet(null);
    setOpenMemory(null);
    setFocusedTreasure(null);
    setGuideAction('hint');
    setTargetStarPos([35, 18, 20]);
    setTimeout(() => setGuideAction('idle'), 2000);
  }, []);

  // ── Video Treasure Hunt Handlers ────────────────────────────────
  const handleSelectTreasure = useCallback(
    (treasure: TreasureConfig) => {
      setFocusedTreasure(treasure);
      setIsFocused(false);
      setIsPuzzleFocused(false);
      setGuideAction('happy-bounce');
      setVolume(0.08); // dim background music while watching video
    },
    [setVolume]
  );

  const handleCloseTreasure = useCallback(() => {
    if (focusedTreasure) {
      setDiscoveredTreasureIds((prev) => Array.from(new Set([...prev, focusedTreasure.id])));
    }
    setFocusedTreasure(null);
    setVolume(0.35); // restore background music
    setGuideAction('idle');
  }, [focusedTreasure, setVolume]);

  const handleHoverTreasure = useCallback((treasure: TreasureConfig | null) => {
    if (treasure) {
      setTargetStarPos(treasure.position);
      setGuideAction('turn-to-star');
    } else {
      setGuideAction((prev) => (prev === 'turn-to-star' ? 'idle' : prev));
    }
  }, []);

  const astronautQuotes = useMemo(
    () => [
      "Hey there! I'm your cosmic companion 👩‍🚀✨",
      "Click 'Constellation 💖' or find the glowing stars to draw our heart! 🌟",
      "Out of billions of stars in the galaxy, finding you was my favorite discovery! 🌸",
      "Click the next glowing star in space to connect our constellation! 🚀",
      "Happy Birthday, Prapti! Let's explore this universe together! 🎂🎉",
    ],
    []
  );
  const quoteIndexRef = useRef(0);

  const handleAstronautClick = useCallback(() => {
    setAstronautEnabled(true);
    setGuideAction('celebrate');
    setIsPuzzleFocused(true);
    setIsFocused(false);

    const quote = astronautQuotes[quoteIndexRef.current % astronautQuotes.length];
    quoteIndexRef.current += 1;
    setSpeechMessage(quote);

    setTimeout(() => {
      setGuideAction((prev) => (prev === 'celebrate' ? 'idle' : prev));
    }, 2200);

    setTimeout(() => {
      setSpeechMessage(null);
    }, 5000);
  }, [astronautQuotes]);

  // ── Constellation Puzzle Handlers ──────────────────────────────
  const handleCorrectStarClick = useCallback((star: PuzzleStarConfig) => {
    setTargetStarPos(star.position);
    setGuideAction('happy-bounce');

    setTimeout(() => {
      setGuideAction((prev) => (prev === 'happy-bounce' ? 'idle' : prev));
    }, 1800);
  }, []);

  const handleWrongStarClick = useCallback(() => {
    // Gentle wrong click feedback — briefly turn helmet
    setGuideAction('turn-to-star');
    setTimeout(() => {
      setGuideAction((prev) => (prev === 'turn-to-star' ? 'idle' : prev));
    }, 1200);
  }, []);

  const handleHoverStar = useCallback((star: PuzzleStarConfig | null) => {
    if (star) {
      setTargetStarPos(star.position);
      setGuideAction('turn-to-star');
    } else {
      setGuideAction((prev) => (prev === 'turn-to-star' ? 'idle' : prev));
    }
  }, []);

  const handlePuzzleComplete = useCallback(() => {
    // Celebrate constellation completion
    setExperienceState('constellation-complete');
    setGuideAction('celebrate');
    setVolume(0.15); // quiet ambient music for emotional climax

    setTimeout(() => {
      setShowStarMessage(true);
      setExperienceState('final-star-message');
      setGuideAction('side-observe'); // float aside without obstructing view
    }, 2800);
  }, [setVolume]);

  const handleStarMessageFormed = useCallback(() => {
    // Stars formed final message -> reveal personal letter modal
    setTimeout(() => {
      setExperienceState('final-letter');
      setShowFinalLetterModal(true);
    }, 1500);
  }, []);

  const handleCloseFinalLetter = useCallback(() => {
    setShowFinalLetterModal(false);

    // 15-second timer starts AFTER closing the letter:
    // Dissolves text at 12s, fully unmounts at 15s post-closing
    setTimeout(() => {
      setIsStarMessageFading(true);
    }, 12000);

    setTimeout(() => {
      setShowStarMessage(false);
      setIsStarMessageFading(false);
      setExperienceState('puzzle-active');
      setGuideAction('idle');
      setVolume(0.35); // restore normal ambient volume
    }, 15000);
  }, [setVolume]);

  // ── Global Escape Key Listener ──────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (quiz.isGameActive) {
          quiz.exitQuiz();
        } else if (focusedTreasure) {
          handleCloseTreasure();
        } else if (openMemory) {
          setOpenMemory(null);
        } else if (showFinalLetterModal) {
          handleCloseFinalLetter();
        } else if (isFocused || isPuzzleFocused) {
          handleReturnToOverview();
        } else if (showIntro) {
          handleIntroSkip();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quiz.isGameActive, quiz.exitQuiz, focusedTreasure, openMemory, showFinalLetterModal, isFocused, isPuzzleFocused, showIntro, handleCloseTreasure, handleReturnToOverview, handleIntroSkip, handleCloseFinalLetter]);

  return (
    <>
      {/* 3D Canvas */}
      <div className="canvas-container">
        <Canvas
          frameloop={focusedTreasure ? 'never' : 'always'}
          camera={{
            fov: 60,
            near: 0.1,
            far: 2000,
            position: [0, 85, 110],
          }}
          gl={{
            antialias: perf.antialias,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          dpr={perf.pixelRatio}
          performance={{ min: 0.5 }}
          onPointerMissed={() => {
            // Random space clicks will NEVER kick user out of planet view
          }}
        >
          <Suspense fallback={null}>
            <Scene
              onIntroComplete={handle3DIntroComplete}
              introComplete={introComplete}
              onMemoryOpen={handleMemoryOpen}
              onMemoryClose={handleMemoryClose}
              isFocused={isFocused}
              focusedPlanet={focusedPlanet}
              onSelectPlanet={handleSelectPlanet}
              puzzleActive={experienceState === 'puzzle-active' || experienceState === 'constellation-complete'}
              showStarMessage={showStarMessage}
              isStarMessageFading={isStarMessageFading}
              isFinalCinematic={experienceState === 'final-star-message' || experienceState === 'final-letter'}
              isPuzzleFocused={isPuzzleFocused}
              discoveredTreasureIds={discoveredTreasureIds}
              focusedTreasure={focusedTreasure}
              onSelectTreasure={handleSelectTreasure}
              onHoverTreasure={handleHoverTreasure}
              onCorrectStarClick={handleCorrectStarClick}
              onWrongStarClick={handleWrongStarClick}
              onHoverStar={handleHoverStar}
              onPuzzleComplete={handlePuzzleComplete}
              onStarMessageFormed={handleStarMessageFormed}
              isGameMode={quiz.isGameActive}
              gameWrongPlanet={quiz.wrongPlanet}
              gameCorrectPlanet={quiz.correctPlanet}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Intro overlay */}
      {showIntro && (
        <IntroOverlay
          isVisible={showIntro}
          onSkip={handleIntroSkip}
          onComplete={handleIntroComplete}
        />
      )}

      {/* HUD Controls */}
      <Controls
        isMuted={isMuted}
        onToggleMute={toggleMute}
        isFocused={isFocused}
        focusedPlanet={focusedPlanet}
        onSelectPlanet={handleSelectPlanet}
        onReturnToOverview={handleReturnToOverview}
        showPlanetHint={showPlanetHint}
        astronautEnabled={astronautEnabled}
        onToggleAstronaut={handleAstronautClick}
        onFocusConstellation={handleFocusConstellation}
        isPuzzleFocused={isPuzzleFocused}
      />

      {/* Memory Viewer */}
      <MemoryViewer memory={openMemory} onClose={handleMemoryClose} />

      {/* Holographic Video Treasure Player */}
      <VideoHologramModal treasure={focusedTreasure} onClose={handleCloseTreasure} />

      {/* Final Personal Birthday Letter Modal */}
      <FinalLetterModal
        isVisible={showFinalLetterModal}
        onClose={handleCloseFinalLetter}
      />

      {/* Floating Interactive Astronaut Companion Speech Bubble */}
      <AstronautSpeechBubble
        message={speechMessage}
        onClose={() => setSpeechMessage(null)}
      />

      {/* ── Planet Quiz Game Overlay ─────────────────────────── */}
      <PlanetQuizOverlay
        quizState={quiz.quizState}
        currentQuestion={quiz.currentQuestion}
        currentIntro={quiz.currentIntro}
        progress={quiz.progress}
        total={quiz.total}
        invitationMessage={quiz.invitationMessage}
        completionLines={quiz.completionLines}
        wrongPlanet={quiz.wrongPlanet}
        correctPlanet={quiz.correctPlanet}
        onAccept={quiz.acceptInvitation}
        onDecline={quiz.declineInvitation}
        onReplay={quiz.replayGame}
        onExit={quiz.exitQuiz}
      />

      {/* Custom 3D Astronaut Mouse Pointer Companion */}
      <AstronautCursor
        enabled={astronautEnabled}
        guideAction={guideAction}
        targetStarPos={targetStarPos}
      />
    </>
  );
}

