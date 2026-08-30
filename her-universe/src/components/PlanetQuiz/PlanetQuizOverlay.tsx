// ============================================================
// Her Universe — Planet Quiz Overlay UI
// ============================================================
// Pure DOM overlay — no Three.js.
// Renders invitation, question card, reaction overlays,
// progress indicator, and completion screen.
// ============================================================

import { useEffect, useState, useRef } from 'react';
import type { QuizState } from './PlanetQuizGame';
import type { PlanetQuizQuestion } from '../../data/planetQuiz';

interface PlanetQuizOverlayProps {
  quizState: QuizState;
  currentQuestion: PlanetQuizQuestion | null;
  currentIntro: string;
  progress: number;
  total: number;
  invitationMessage: string;
  completionLines: string[];
  wrongPlanet: string | null;
  correctPlanet: string | null;
  onAccept: () => void;
  onDecline: () => void;
  onReplay: () => void;
  onExit: () => void;
}

// ── Floating Hearts ──────────────────────────────────────────
function FloatingHearts({ count = 8 }: { count?: number }) {
  return (
    <div className="quiz-hearts-container" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="quiz-heart"
          style={{
            left: `${10 + Math.random() * 80}%`,
            animationDelay: `${Math.random() * 0.8}s`,
            animationDuration: `${1.2 + Math.random() * 0.8}s`,
            fontSize: `${14 + Math.random() * 14}px`,
          }}
        >
          {['❤️', '💕', '💖', '💗', '💝'][Math.floor(Math.random() * 5)]}
        </div>
      ))}
    </div>
  );
}

// ── Sparkle burst ────────────────────────────────────────────
function SparkleBurst() {
  return (
    <div className="quiz-sparkle-burst" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="quiz-sparkle"
          style={{
            transform: `rotate(${i * 30}deg)`,
            animationDelay: `${i * 0.04}s`,
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
}

// ── Invitation Card (Floating Speech Bubble matching Image 2) ──
function InvitationCard({
  message,
  onAccept,
  onDecline,
  visible,
}: {
  message: string;
  onAccept: () => void;
  onDecline: () => void;
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <div className="quiz-invitation-bubble quiz-bubble-visible">
      <div className="quiz-astronaut-avatar" aria-hidden>
        <span>👨‍🚀</span>
      </div>
      <div className="quiz-bubble-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <p className="quiz-invitation-message">{message}</p>
          <button
            className="quiz-card-exit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDecline();
            }}
            title="Close (or press ESC)"
            aria-label="Close"
            style={{ flexShrink: 0, marginTop: '-2px', marginRight: '-4px' }}
          >
            ✕
          </button>
        </div>
        <div className="quiz-invitation-buttons">
          <button
            id="quiz-accept-btn"
            className="quiz-btn quiz-btn-yes"
            onClick={(e) => {
              e.stopPropagation();
              onAccept();
            }}
          >
            YES ❤️
          </button>
          <button
            id="quiz-decline-btn"
            className="quiz-btn quiz-btn-no"
            onClick={(e) => {
              e.stopPropagation();
              onDecline();
            }}
          >
            NOT NOW 🥺
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Question Card ────────────────────────────────────────────
function QuestionCard({
  question,
  intro,
  progress,
  total,
  visible,
  onExit,
}: {
  question: PlanetQuizQuestion | null;
  intro: string;
  progress: number;
  total: number;
  visible: boolean;
  onExit: () => void;
}) {
  const [displayedQuestion, setDisplayedQuestion] = useState(question);
  const [displayedIntro, setDisplayedIntro] = useState(intro);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (question && visible) {
      setDisplayedQuestion(question);
      setDisplayedIntro(intro);
      setShowHint(false);
    }
  }, [question?.id, visible]);

  if (!visible || !displayedQuestion) return null;

  return (
    <div className="quiz-question-card quiz-card-visible">
      {/* Header with Progress & Exit Button */}
      <div className="quiz-progress">
        <span className="quiz-progress-label">PLANET LOVE QUIZ ❤️</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="quiz-progress-count">
            Question {progress + 1} of {total} ❤️
          </span>
          <button
            className="quiz-card-exit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onExit();
            }}
            title="Exit Quiz (or press ESC)"
            aria-label="Exit Quiz"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Astronaut intro */}
      <p className="quiz-intro-text">{displayedIntro}</p>

      {/* Question */}
      <p className="quiz-question-text">{displayedQuestion.question}</p>

      {/* Hint toggle & display */}
      {displayedQuestion.hint && (
        <div className="quiz-hint-box">
          {!showHint ? (
            <button
              className="quiz-hint-btn"
              onClick={() => setShowHint(true)}
            >
              💡 Need a Hint?
            </button>
          ) : (
            <p className="quiz-hint-text">
              💡 <strong>Hint:</strong> {displayedQuestion.hint}
            </p>
          )}
        </div>
      )}

      {/* Hint instruction */}
      <p className="quiz-hint">✨ Click the existing 3D planet you think is the answer</p>
    </div>
  );
}

// ── Correct Reaction Overlay ─────────────────────────────────
function CorrectReactionOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="quiz-correct-overlay quiz-overlay-visible" aria-hidden>
      <FloatingHearts count={12} />
      <SparkleBurst />
    </div>
  );
}

// ── Wrong Reaction Banner ────────────────────────────────────
function WrongReactionBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="quiz-wrong-banner quiz-overlay-visible">
      <span className="quiz-wrong-text">Ohhh wrong ans baby 🥺❤️</span>
    </div>
  );
}

// ── Completion Screen ────────────────────────────────────────
function CompletionScreen({
  visible,
  lines,
  onReplay,
}: {
  visible: boolean;
  lines: string[];
  onReplay: () => void;
}) {
  const [shownLines, setShownLines] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      setShownLines(0);
      return;
    }
    let count = 0;
    const showNext = () => {
      count += 1;
      setShownLines(count);
      if (count < lines.length) {
        timerRef.current = setTimeout(showNext, 900);
      }
    };
    timerRef.current = setTimeout(showNext, 400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [visible, lines.length]);

  if (!visible) return null;

  return (
    <div className="quiz-completion-screen quiz-overlay-visible">
      <FloatingHearts count={20} />

      <div className="quiz-completion-content">
        {lines.map((line, i) => (
          <p
            key={i}
            className={`quiz-completion-line ${
              i === 0 ? 'quiz-completion-title' : ''
            } ${
              i === lines.length - 1 ? 'quiz-completion-final' : ''
            } ${
              shownLines > i ? 'quiz-line-visible' : 'quiz-line-hidden'
            }`}
          >
            {line}
          </p>
        ))}

        {shownLines >= lines.length && (
          <button
            id="quiz-replay-btn"
            className="quiz-btn quiz-btn-replay"
            onClick={onReplay}
          >
            PLAY AGAIN ❤️
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Overlay Component ───────────────────────────────────
export function PlanetQuizOverlay({
  quizState,
  currentQuestion,
  currentIntro,
  progress,
  total,
  invitationMessage,
  completionLines,
  wrongPlanet,
  correctPlanet,
  onAccept,
  onDecline,
  onReplay,
  onExit,
}: PlanetQuizOverlayProps) {

  const showInvitation = quizState === 'INVITATION';
  const showQuestion =
    quizState === 'QUESTION_ACTIVE' ||
    quizState === 'CHECKING_ANSWER' ||
    quizState === 'WRONG_REACTION';
  const showCorrect = quizState === 'CORRECT_REACTION';
  const showWrong = quizState === 'WRONG_REACTION';
  const showCompletion = quizState === 'COMPLETED';

  // Don't render anything in IDLE or WAITING_FOR_RESPONSE
  const hasAnything =
    showInvitation || showQuestion || showCorrect || showWrong || showCompletion;

  if (!hasAnything) return null;

  return (
    <div className="quiz-overlay-root" aria-live="polite">
      {/* Invitation */}
      <InvitationCard
        message={invitationMessage}
        onAccept={onAccept}
        onDecline={onDecline}
        visible={showInvitation}
      />

      {/* Question */}
      <QuestionCard
        question={currentQuestion}
        intro={currentIntro}
        progress={progress}
        total={total}
        visible={showQuestion}
        onExit={onExit}
      />

      {/* Correct reaction burst */}
      <CorrectReactionOverlay visible={showCorrect} />

      {/* Wrong banner */}
      <WrongReactionBanner visible={showWrong} />

      {/* Completion */}
      <CompletionScreen
        visible={showCompletion}
        lines={completionLines}
        onReplay={onReplay}
      />
    </div>
  );
}
