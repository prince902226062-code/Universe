// ============================================================
// Her Universe — FinalLetterModal Component
// ============================================================
// Translucent, elegant glassmorphic letter modal revealing the
// personal birthday message while keeping the 3D universe visible.
// ============================================================

import { useState } from 'react';
import { FINAL_LETTER } from '../../data/constellationData';

interface FinalLetterModalProps {
  isVisible: boolean;
  onClose?: () => void;
}

export function FinalLetterModal({ isVisible, onClose }: FinalLetterModalProps) {
  const [minimized, setMinimized] = useState(false);

  if (!isVisible) return null;

  return (
    <div className={`final-letter-overlay ${minimized ? 'minimized' : ''}`}>
      <div className="final-letter-card">
        {/* Header decoration */}
        <div className="final-letter-header">
          <div className="sparkle-badge">✨ Celestial Birthday Note ✨</div>
          <h2>{FINAL_LETTER.title}</h2>
          <p className="subtitle">{FINAL_LETTER.subtitle}</p>
        </div>

        {/* Content body */}
        <div className="final-letter-body">
          <p className="salutation">{FINAL_LETTER.salutation}</p>
          <div className="letter-paragraphs">
            {FINAL_LETTER.content.split('\n\n').map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
          <div className="final-letter-footer">
            <p className="signature">{FINAL_LETTER.signature}</p>
            <p className="date">{FINAL_LETTER.date}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="final-letter-actions">
          <button
            className="letter-btn toggle-view-btn"
            onClick={() => setMinimized((prev) => !prev)}
          >
            {minimized ? '📖 Read Letter' : '🌌 View Star Message'}
          </button>
          {onClose && (
            <button className="letter-btn close-btn" onClick={onClose}>
              ✨ Keep Exploring
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
