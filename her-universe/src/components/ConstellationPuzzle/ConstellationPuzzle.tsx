// ============================================================
// Her Universe — ConstellationPuzzle Master 3D Component
// ============================================================
// Orchestrates 3D puzzle stars, connection lines, hover cues,
// wrong click feedback, and final star message activation.
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { PUZZLE_STARS, type PuzzleStarConfig } from '../../data/constellationData';
import { PuzzleStar } from './PuzzleStar';
import { ConstellationLines } from './ConstellationLines';
import { FinalStarMessage } from './FinalStarMessage';

export interface ConstellationPuzzleProps {
  isActive: boolean;
  onCorrectStarClick: (star: PuzzleStarConfig) => void;
  onWrongStarClick: () => void;
  onHoverStar: (star: PuzzleStarConfig | null) => void;
  onPuzzleComplete: () => void;
  onStarMessageFormed: () => void;
  showStarMessage: boolean;
  isStarMessageFading?: boolean;
}

export function ConstellationPuzzle({
  isActive,
  onCorrectStarClick,
  onWrongStarClick,
  onHoverStar,
  onPuzzleComplete,
  onStarMessageFormed,
  showStarMessage,
  isStarMessageFading,
}: ConstellationPuzzleProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [discoveredIds, setDiscoveredIds] = useState<string[]>([]);
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [wrongTrigger, setWrongTrigger] = useState(0);

  // Reset puzzle when message deactivates after 15s
  const prevShowStarMessage = useRef(showStarMessage);
  useEffect(() => {
    if (prevShowStarMessage.current && !showStarMessage) {
      setCurrentStep(1);
      setDiscoveredIds([]);
      setConnectedIds([]);
      setIsCompleted(false);
    }
    prevShowStarMessage.current = showStarMessage;
  }, [showStarMessage]);

  const handleSelectStar = useCallback(
    (star: PuzzleStarConfig) => {
      if (!isActive || isCompleted) return;

      // Check if star matches current expected order step
      if (star.order === currentStep) {
        // Correct click!
        const nextConnected = [...connectedIds, star.id];
        const nextDiscovered = Array.from(new Set([...discoveredIds, star.id]));

        setConnectedIds(nextConnected);
        setDiscoveredIds(nextDiscovered);
        onCorrectStarClick(star);

        if (currentStep >= PUZZLE_STARS.length) {
          // Constellation completed!
          setIsCompleted(true);
          onPuzzleComplete();
        } else {
          setCurrentStep((prev) => prev + 1);
        }
      } else if (!connectedIds.includes(star.id)) {
        // Wrong click (not yet connected star clicked out of order)
        setWrongTrigger((prev) => prev + 1);
        onWrongStarClick();
      }
    },
    [isActive, isCompleted, currentStep, connectedIds, discoveredIds, onCorrectStarClick, onWrongStarClick, onPuzzleComplete]
  );

  return (
    <group>
      {/* 3D Puzzle Stars (visible until final star message sequence) */}
      {!showStarMessage &&
        PUZZLE_STARS.map((star) => {
          const isDiscovered = discoveredIds.includes(star.id);
          const isConnected = connectedIds.includes(star.id);
          const isNext = star.order === currentStep;

          return (
            <PuzzleStar
              key={star.id}
              star={star}
              isDiscovered={isDiscovered}
              isConnected={isConnected}
              isNext={isNext && !isCompleted}
              wrongTrigger={wrongTrigger}
              onSelectStar={handleSelectStar}
              onHoverStar={onHoverStar}
            />
          );
        })}

      {/* Connected Constellation Lines */}
      {!showStarMessage && (
        <ConstellationLines
          stars={PUZZLE_STARS}
          connectedIds={connectedIds}
          isCompleted={isCompleted}
        />
      )}

      {/* Morphing Star Message for Final Sequence */}
      <FinalStarMessage
        isActive={showStarMessage}
        isFadingOut={isStarMessageFading}
        onMessageFormed={onStarMessageFormed}
      />
    </group>
  );
}
