// ============================================================
// Her Universe — Astronaut Speech Bubble Overlay
// ============================================================
// Interactive floating speech bubble showing companion dialogs
// when interacting with the 3D astronaut.
// ============================================================

import { useEffect, useRef, useState } from 'react';

interface AstronautSpeechBubbleProps {
  message: string | null;
  position?: { x: number; y: number };
  onClose?: () => void;
}

export function AstronautSpeechBubble({ message, onClose }: AstronautSpeechBubbleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [message]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const posX = e.clientX + 35;
      const posY = Math.max(20, e.clientY - 75);
      containerRef.current.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  if (!message || !visible) return null;

  return (
    <div
      ref={containerRef}
      className="astronaut-speech-bubble"
      style={{
        position: 'fixed',
        left: '0px',
        top: '0px',
        zIndex: 999999,
        pointerEvents: 'auto',
        background: 'linear-gradient(135deg, rgba(20, 10, 45, 0.92) 0%, rgba(45, 15, 65, 0.92) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 150, 210, 0.4)',
        borderRadius: '16px',
        padding: '10px 16px',
        color: '#ffffff',
        fontSize: '0.85rem',
        boxShadow: '0 8px 24px rgba(255, 110, 180, 0.25)',
        maxWidth: '240px',
        lineHeight: 1.4,
        animation: 'bubblePopIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        willChange: 'transform',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '0 2px',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Bubble Triangle Pointer */}
      <div
        style={{
          position: 'absolute',
          bottom: '-7px',
          left: '18px',
          width: 0,
          height: 0,
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderTop: '7px solid rgba(45, 15, 65, 0.92)',
        }}
      />
    </div>
  );
}
