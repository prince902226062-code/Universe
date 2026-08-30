// ============================================================
// Her Universe — IntroOverlay Component
// ============================================================
// Cinematic HTML overlay shown during/after the intro animation.
// Displays romantic introductory text and a skip button.
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { GIRLFRIEND_NAME } from '../../data/config';

interface IntroOverlayProps {
  onSkip: () => void;
  onComplete: () => void;
  isVisible: boolean;
}

const INTRO_LINES = [
  { text: 'Somewhere in the universe...', delay: 600 },
  { text: `There is a world that belongs only to you.`, delay: 2200 },
  { text: `Welcome to ${GIRLFRIEND_NAME}'s Universe ❤️`, delay: 4000 },
  { text: 'Every star, every orbit — made for you.', delay: 5800 },
];

export function IntroOverlay({ onSkip, onComplete, isVisible }: IntroOverlayProps) {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [fading, setFading] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!isVisible) return;

    // Sequentially reveal each line
    INTRO_LINES.forEach(({ delay }, i) => {
      const t = setTimeout(() => {
        setVisibleLines((prev) => [...prev, i]);
      }, delay);
      timersRef.current.push(t);
    });

    // Auto-complete after last line + 2s
    const completionDelay = INTRO_LINES[INTRO_LINES.length - 1].delay + 2000;
    const t = setTimeout(() => {
      handleComplete();
    }, completionDelay);
    timersRef.current.push(t);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [isVisible]);

  const handleComplete = () => {
    setFading(true);
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  const handleSkip = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    handleComplete();
    onSkip();
  };

  if (!isVisible) return null;

  return (
    <div className={`intro-overlay ${fading ? 'intro-fading' : ''}`}>
      <div className="intro-content">
        {INTRO_LINES.map((line, i) => (
          <p
            key={i}
            className={`intro-line ${visibleLines.includes(i) ? 'intro-line-visible' : ''} ${i === 2 ? 'intro-line-hero' : ''}`}
          >
            {line.text}
          </p>
        ))}
      </div>

      <button className="intro-skip-btn" onClick={handleSkip}>
        Skip intro →
      </button>

      <div className="intro-stars-hint">
        <span>✦</span>
        <span>✦</span>
        <span>✦</span>
      </div>
    </div>
  );
}
