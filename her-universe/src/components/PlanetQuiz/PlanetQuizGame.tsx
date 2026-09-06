// ============================================================
// Her Universe — Planet Quiz Game State Machine
// ============================================================
// Pure logic hook — no Three.js / DOM.
// Manages the full quiz lifecycle as described in the spec.
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ALL_QUIZ_QUESTIONS,
  TOTAL_QUESTIONS,
  ASTRONAUT_INTROS,
  CORRECT_REACTIONS,
  WRONG_PLANET_MESSAGE,
  WRONG_PLANET_RETRY,
  INVITATION_FIRST,
  INVITATION_RETRY_MESSAGES,
  DECLINE_FIRST,
  DECLINE_RETRY_MESSAGES,
  ACCEPT_MESSAGE,
  COMPLETION_LINES,
  type PlanetQuizQuestion,
} from '../../data/planetQuiz';

// ── Game States ──────────────────────────────────────────────
export type QuizState =
  | 'IDLE'
  | 'INVITATION'
  | 'WAITING_FOR_RESPONSE'
  | 'QUESTION_ACTIVE'
  | 'CHECKING_ANSWER'
  | 'CORRECT_REACTION'
  | 'WRONG_REACTION'
  | 'NEXT_QUESTION'
  | 'COMPLETED';

export interface QuizGameState {
  quizState: QuizState;
  currentQuestion: PlanetQuizQuestion | null;
  currentIntro: string;
  progress: number;          // how many answered correctly so far
  total: number;             // always 40
  invitationMessage: string;
  astronautMessage: string | null;
  activePlanet: string | null;   // key of planet that was clicked correctly (for glow)
  wrongPlanet: string | null;    // key of planet clicked wrong (for shake)
  correctPlanet: string | null;  // key of planet just confirmed correct (for pulse)
  completionLines: string[];
  isGameActive: boolean;
}

export interface QuizGameActions {
  acceptInvitation: () => void;
  declineInvitation: () => void;
  handlePlanetClick: (planetKey: string) => void;
  replayGame: () => void;
  exitQuiz: () => void;
  dismissAstronautMessage: () => void;
}

// ── Shuffle helper ───────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Main hook ────────────────────────────────────────────────
export function usePlanetQuizGame(
  introComplete: boolean,
  _isFocused: boolean,      // is user zoomed into a planet?
  onAstronautSpeak: (msg: string | null) => void,
  onGuideAction: (action: 'idle' | 'happy-bounce' | 'celebrate' | 'turn-to-star') => void,
): QuizGameState & QuizGameActions {

  const [quizState, setQuizState] = useState<QuizState>('IDLE');
  const [shuffledQuestions, setShuffledQuestions] = useState<PlanetQuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [invitationMessage, setInvitationMessage] = useState(INVITATION_FIRST);
  const [astronautMessage, setAstronautMessage] = useState<string | null>(null);
  const [activePlanet, setActivePlanet] = useState<string | null>(null);
  const [wrongPlanet, setWrongPlanet] = useState<string | null>(null);
  const [correctPlanet, setCorrectPlanet] = useState<string | null>(null);

  const invitationCountRef = useRef(0);   // how many times invited
  const declineCountRef = useRef(0);      // how many times declined
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQuestion = shuffledQuestions[questionIndex] ?? null;
  const currentIntro = currentQuestion
    ? randomFrom(ASTRONAUT_INTROS)
    : '';

  // ── Speak helper ─────────────────────────────────────────
  const speak = useCallback((msg: string | null, duration?: number) => {
    setAstronautMessage(msg);
    onAstronautSpeak(msg);
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    if (msg && duration) {
      msgTimerRef.current = setTimeout(() => {
        setAstronautMessage(null);
        onAstronautSpeak(null);
      }, duration);
    }
  }, [onAstronautSpeak]);

  // ── Initial invitation trigger (30s after intro) ──────────
  useEffect(() => {
    if (!introComplete) return;
    const timer = setTimeout(() => {
      if (quizState === 'IDLE') {
        setInvitationMessage(INVITATION_FIRST);
        setQuizState('INVITATION');
      }
    }, 30000); // 30 seconds after intro

    return () => clearTimeout(timer);
  }, [introComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Accept invitation ────────────────────────────────────
  const acceptInvitation = useCallback(() => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    onGuideAction('celebrate');
    speak(ACCEPT_MESSAGE, 4000);
    setQuizState('WAITING_FOR_RESPONSE');

    // Give astronaut time to celebrate, then start first question
    setTimeout(() => {
      onGuideAction('idle');
      const questions = shuffle(ALL_QUIZ_QUESTIONS);
      setShuffledQuestions(questions);
      setQuestionIndex(0);
      setProgress(0);
      setQuizState('QUESTION_ACTIVE');
      speak(null);
    }, 3500);
  }, [onGuideAction, speak]);

  // ── Decline invitation ───────────────────────────────────
  const declineInvitation = useCallback(() => {
    const declineCount = declineCountRef.current;
    declineCountRef.current += 1;

    const msg =
      declineCount === 0
        ? DECLINE_FIRST
        : randomFrom(DECLINE_RETRY_MESSAGES);

    speak(msg, 3500);
    setQuizState('IDLE');

    // Schedule re-invitation after 1 minute
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    retryTimerRef.current = setTimeout(() => {
      const retryCount = invitationCountRef.current;
      invitationCountRef.current += 1;
      const retryMsg =
        retryCount < INVITATION_RETRY_MESSAGES.length
          ? INVITATION_RETRY_MESSAGES[retryCount]
          : randomFrom(INVITATION_RETRY_MESSAGES);
      setInvitationMessage(retryMsg);
      setQuizState('INVITATION');
    }, 60000); // 1 minute
  }, [speak]);

  // ── Handle planet click ──────────────────────────────────
  const handlePlanetClick = useCallback((planetKey: string) => {
    if (quizState !== 'QUESTION_ACTIVE' || !currentQuestion) return;

    setQuizState('CHECKING_ANSWER');

    if (planetKey === currentQuestion.planet) {
      // ── CORRECT ──────────────────────────────────────────
      setCorrectPlanet(planetKey);
      setActivePlanet(planetKey);
      onGuideAction('celebrate');

      const reaction = randomFrom(CORRECT_REACTIONS);
      speak(reaction, 3000);

      setProgress((p) => p + 1);
      setQuizState('CORRECT_REACTION');

      // Clear effects and advance to next question
      setTimeout(() => {
        setCorrectPlanet(null);
        setActivePlanet(null);
        onGuideAction('idle');
        speak(null);

        const nextIndex = questionIndex + 1;
        if (nextIndex >= TOTAL_QUESTIONS) {
          // All done!
          setQuizState('COMPLETED');
          onGuideAction('celebrate');
        } else {
          setQuestionIndex(nextIndex);
          setQuizState('QUESTION_ACTIVE');
        }
      }, 3200);

    } else {
      // ── WRONG ────────────────────────────────────────────
      setWrongPlanet(planetKey);
      onGuideAction('turn-to-star');
      speak(WRONG_PLANET_MESSAGE, 2500);
      setQuizState('WRONG_REACTION');

      setTimeout(() => {
        setWrongPlanet(null);
        onGuideAction('idle');
        // Show retry hint briefly
        speak(WRONG_PLANET_RETRY, 2000);
        setTimeout(() => speak(null), 2100);
        setQuizState('QUESTION_ACTIVE');
      }, 1800);
    }
  }, [quizState, currentQuestion, questionIndex, onGuideAction, speak]);

  // ── Replay game ──────────────────────────────────────────
  const replayGame = useCallback(() => {
    const questions = shuffle(ALL_QUIZ_QUESTIONS);
    setShuffledQuestions(questions);
    setQuestionIndex(0);
    setProgress(0);
    setActivePlanet(null);
    setWrongPlanet(null);
    setCorrectPlanet(null);
    declineCountRef.current = 0;
    invitationCountRef.current = 0;
    speak(null);
    setQuizState('QUESTION_ACTIVE');
  }, [speak]);

  // ── Exit quiz early ──────────────────────────────────────
  const exitQuiz = useCallback(() => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    setActivePlanet(null);
    setWrongPlanet(null);
    setCorrectPlanet(null);
    onGuideAction('idle');
    speak("We can play again anytime, sweetheart! ❤️", 3500);
    setQuizState('IDLE');
  }, [onGuideAction, speak]);

  // ── Dismiss astronaut message ────────────────────────────
  const dismissAstronautMessage = useCallback(() => {
    speak(null);
  }, [speak]);

  // ── Cleanup on unmount ───────────────────────────────────
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    };
  }, []);

  return {
    quizState,
    currentQuestion,
    currentIntro,
    progress,
    total: TOTAL_QUESTIONS,
    invitationMessage,
    astronautMessage,
    activePlanet,
    wrongPlanet,
    correctPlanet,
    completionLines: COMPLETION_LINES,
    isGameActive:
      quizState === 'INVITATION' ||
      quizState === 'WAITING_FOR_RESPONSE' ||
      quizState === 'QUESTION_ACTIVE' ||
      quizState === 'CHECKING_ANSWER' ||
      quizState === 'CORRECT_REACTION' ||
      quizState === 'WRONG_REACTION' ||
      quizState === 'NEXT_QUESTION' ||
      quizState === 'COMPLETED',
    acceptInvitation,
    declineInvitation,
    handlePlanetClick,
    replayGame,
    exitQuiz,
    dismissAstronautMessage,
  };
}
