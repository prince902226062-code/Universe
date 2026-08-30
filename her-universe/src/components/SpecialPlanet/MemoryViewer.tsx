import { useEffect, useRef, useState } from 'react';
import type { MemoryEntry } from '../../data/memories';
import { GIRLFRIEND_NAME } from '../../data/config';

interface MemoryViewerProps {
  memory: MemoryEntry | null;
  onClose: () => void;
}

export function MemoryViewer({ memory, onClose }: MemoryViewerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);

  // Reset rotation when memory changes
  useEffect(() => {
    setRotation(0);
  }, [memory]);

  useEffect(() => {
    if (!overlayRef.current) return;
    if (memory) {
      overlayRef.current.style.opacity = '0';
      overlayRef.current.style.transform = 'scale(0.92)';
      requestAnimationFrame(() => {
        if (!overlayRef.current) return;
        overlayRef.current.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        overlayRef.current.style.opacity = '1';
        overlayRef.current.style.transform = 'scale(1)';
      });
    }
  }, [memory]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'r' || e.key === 'R') {
        setRotation((prev) => (prev + 90) % 360);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!memory) return null;

  return (
    <div className="memory-viewer-backdrop" onClick={onClose}>
      <div
        ref={overlayRef}
        className="memory-viewer-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Rotate Button & Close Button */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
          <button
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Rotate photo 90° (Press R)"
          >
            🔄 Rotate {rotation > 0 ? `${rotation}°` : ''}
          </button>

          <button className="memory-close-btn" onClick={onClose} aria-label="Close memory" style={{ position: 'static' }}>
            ✕
          </button>
        </div>

        <div className="memory-photo-container" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={memory.imageUrl}
            alt={memory.title}
            className="memory-photo"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="memory-photo-fallback">
            <span>❤</span>
          </div>
        </div>

        <div className="memory-content">
          <p className="memory-planet-label">✨ {GIRLFRIEND_NAME}'s Universe</p>
          <h2 className="memory-title">{memory.title}</h2>
          {memory.description && (
            <p className="memory-description">{memory.description}</p>
          )}
          <div className="memory-footer">
            <span className="memory-id">Memory #{memory.id}</span>
            <button className="memory-return-btn" onClick={onClose}>
              Return to planet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
