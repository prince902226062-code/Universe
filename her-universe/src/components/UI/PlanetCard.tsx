import { useState, useEffect } from 'react';
import type { PlanetConfig } from '../../data/planets';

interface PlanetCardProps {
  planet: PlanetConfig | null;
  onReturnToOverview: () => void;
}

export function PlanetCard({ planet, onReturnToOverview }: PlanetCardProps) {
  const [hideDescription, setHideDescription] = useState(false);

  useEffect(() => {
    setHideDescription(false);
  }, [planet?.name]);

  if (!planet) return null;

  const isSpecial = planet.name === 'Prapti';

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        bottom: '88px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        pointerEvents: 'auto',
        width: 'min(90vw, 460px)',
        background: isSpecial
          ? 'linear-gradient(135deg, rgba(35, 10, 40, 0.88), rgba(15, 5, 25, 0.92))'
          : 'linear-gradient(135deg, rgba(15, 15, 30, 0.88), rgba(5, 5, 15, 0.94))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: isSpecial
          ? '1px solid rgba(255, 105, 180, 0.45)'
          : '1px solid rgba(255, 255, 255, 0.16)',
        borderRadius: '20px',
        padding: hideDescription ? '14px 22px' : '18px 22px',
        boxShadow: isSpecial
          ? '0 12px 36px rgba(255, 105, 180, 0.25), 0 4px 16px rgba(0, 0, 0, 0.6)'
          : '0 12px 36px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(255, 255, 255, 0.05)',
        color: '#ffffff',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: hideDescription ? '0' : '8px' }}>
        <div>
          <div
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontWeight: 600,
              color: isSpecial ? '#ff9de2' : planet.color || '#a0a0ff',
              marginBottom: '2px',
            }}
          >
            {planet.tag || 'Celestial Body'}
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 600,
              fontFamily: "'Outfit', 'Inter', sans-serif",
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>{isSpecial ? '🌸' : planet.name === 'The Sun' ? '☀️' : '🪐'}</span>
            <span>{planet.name}</span>
          </h3>
        </div>

        {/* Action Buttons Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Hide / Show Description Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setHideDescription((prev) => !prev);
            }}
            style={{
              pointerEvents: 'auto',
              background: hideDescription
                ? 'linear-gradient(135deg, rgba(255, 105, 180, 0.45), rgba(186, 24, 115, 0.6))'
                : 'rgba(255, 255, 255, 0.12)',
              border: hideDescription
                ? '1px solid rgba(255, 192, 203, 0.6)'
                : '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: hideDescription ? '0 0 12px rgba(255, 105, 180, 0.4)' : 'none',
            }}
            title={hideDescription ? "Show quote & description" : "Hide description & quote text"}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1.0)';
            }}
          >
            <span>{hideDescription ? '📖 Show Description' : '👁️ Hide Description'}</span>
          </button>

          {/* Return to Overview Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReturnToOverview();
            }}
            style={{
              pointerEvents: 'auto',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            title="Press Escape or click to return to full solar system"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
              e.currentTarget.style.transform = 'scale(1.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.transform = 'scale(1.0)';
            }}
          >
            <span>← Overview</span>
            <kbd
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                padding: '1px 5px',
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              ESC
            </kbd>
          </button>
        </div>
      </div>

      {/* Quote & Subtitle Body — Hidden when hideDescription is active */}
      {!hideDescription && (
        <div style={{ animation: 'fadeIn 0.25s ease' }}>
          {planet.subtitle && (
            <div
              style={{
                fontSize: '12px',
                fontStyle: 'italic',
                color: 'rgba(255, 255, 255, 0.65)',
                marginBottom: '8px',
              }}
            >
              {planet.subtitle}
            </div>
          )}

          {planet.description && (
            <p
              style={{
                margin: '0 0 10px 0',
                fontSize: '13px',
                lineHeight: 1.5,
                color: 'rgba(255, 255, 255, 0.88)',
              }}
            >
              {planet.description}
            </p>
          )}

          {isSpecial ? (
            <div
              style={{
                background: 'rgba(255, 105, 180, 0.18)',
                border: '1px solid rgba(255, 105, 180, 0.35)',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '12px',
                color: '#ffcce6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>✨</span>
                <span>Click any photo on the surface to open!</span>
              </div>
              <span style={{ fontSize: '10px', opacity: 0.75 }}>🖱️ Scroll to zoom</span>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.55)',
                paddingTop: '6px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span>🖱️ Scroll mouse wheel to zoom in/out</span>
              <span>🌌 Click space or Esc to exit</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
