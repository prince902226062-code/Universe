// ============================================================
// Her Universe — Controls / HUD Component
// ============================================================

import { SUN_CONFIG, PLANETS, SPECIAL_PLANET, type PlanetConfig } from '../../data/planets';
import { PlanetCard } from './PlanetCard';

interface ControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isFocused: boolean;
  focusedPlanet: PlanetConfig | null;
  onSelectPlanet: (planet: PlanetConfig) => void;
  onReturnToOverview: () => void;
  showPlanetHint: boolean;
  astronautEnabled?: boolean;
  onToggleAstronaut?: () => void;
  onFocusConstellation?: () => void;
  isPuzzleFocused?: boolean;
}

export function Controls({
  isMuted,
  onToggleMute,
  isFocused,
  focusedPlanet,
  onSelectPlanet,
  onReturnToOverview,
  showPlanetHint,
  astronautEnabled = true,
  onToggleAstronaut,
  onFocusConstellation,
  isPuzzleFocused = false,
}: ControlsProps) {
  const allBodies: PlanetConfig[] = [SUN_CONFIG, ...PLANETS, SPECIAL_PLANET];

  return (
    <div className="controls-hud">
      {/* Brand watermark */}
      <div className="brand-watermark">
        Her Universe ✦
      </div>

      {/* Top-right controls */}
      <div className="controls-top-right">
        {onToggleAstronaut && (
          <button
            className="hud-btn"
            onClick={onToggleAstronaut}
            aria-label={astronautEnabled ? 'Disable Astronaut Pointer' : 'Enable Astronaut Pointer'}
            title={astronautEnabled ? 'Astronaut Companion: ON (Click to toggle)' : 'Astronaut Companion: OFF (Click to toggle)'}
            style={{
              background: astronautEnabled
                ? 'linear-gradient(135deg, rgba(255, 110, 180, 0.35), rgba(112, 214, 255, 0.35))'
                : 'rgba(15, 8, 40, 0.75)',
              borderColor: astronautEnabled
                ? 'rgba(255, 180, 220, 0.6)'
                : 'rgba(255, 255, 255, 0.15)',
              boxShadow: astronautEnabled
                ? '0 0 14px rgba(255, 110, 180, 0.4)'
                : 'none',
            }}
          >
            <span>👨‍🚀</span>
          </button>
        )}
        <button
          className="hud-btn"
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute music' : 'Mute music'}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🎵'}
        </button>
      </div>

      {/* Planet Info Card (when focused on any celestial body) */}
      {isFocused && focusedPlanet && (
        <PlanetCard planet={focusedPlanet} onReturnToOverview={onReturnToOverview} />
      )}

      {/* Bottom Celestial Navigation Dock */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: 'rgba(5, 5, 20, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          maxWidth: '95vw',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        <button
          onClick={onReturnToOverview}
          style={{
            background: !isFocused && !isPuzzleFocused ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
            border: isFocused ? '1px dashed rgba(255, 255, 255, 0.25)' : 'none',
            color: '#ffffff',
            padding: '5px 10px',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s ease',
          }}
          title="Return to full overview (or press Esc on keyboard)"
        >
          <span>🌌 Overview</span>
          {isFocused && (
            <span
              style={{
                fontSize: '9px',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '1px 4px',
                borderRadius: '4px',
              }}
            >
              ESC
            </span>
          )}
        </button>

        {onFocusConstellation && (
          <button
            onClick={onFocusConstellation}
            style={{
              background: isPuzzleFocused
                ? 'linear-gradient(135deg, rgba(255, 110, 180, 0.6), rgba(200, 80, 192, 0.6))'
                : 'rgba(255, 110, 180, 0.2)',
              border: '1px solid rgba(255, 150, 210, 0.5)',
              color: '#ffb6c1',
              padding: '5px 11px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.2s ease',
              boxShadow: isPuzzleFocused ? '0 0 12px rgba(255, 110, 180, 0.4)' : 'none',
            }}
            title="Focus camera directly on the Constellation Puzzle ✨"
          >
            <span>💖 Constellation</span>
          </button>
        )}

        <div style={{ width: '1px', height: '14px', background: 'rgba(255, 255, 255, 0.2)' }} />

        {allBodies.map((body) => {
          const isSelected = isFocused && focusedPlanet?.name === body.name;
          const isSpecial = body.name === SPECIAL_PLANET.name;

          return (
            <button
              key={body.name}
              onClick={() => onSelectPlanet(body)}
              style={{
                background: isSelected
                  ? isSpecial
                    ? 'linear-gradient(135deg, #ff69b4, #ba1873)'
                    : 'rgba(255, 255, 255, 0.25)'
                  : isSpecial
                  ? 'rgba(255, 105, 180, 0.2)'
                  : 'transparent',
                border: isSpecial
                  ? '1px solid rgba(255, 105, 180, 0.5)'
                  : '1px solid transparent',
                color: isSelected ? '#ffffff' : isSpecial ? '#ffb6c1' : 'rgba(255, 255, 255, 0.75)',
                padding: '5px 9px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: isSelected || isSpecial ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = isSpecial
                    ? 'rgba(255, 105, 180, 0.35)'
                    : 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = isSpecial
                    ? 'rgba(255, 105, 180, 0.2)'
                    : 'transparent';
                  e.currentTarget.style.color = isSpecial ? '#ffb6c1' : 'rgba(255, 255, 255, 0.75)';
                }
              }}
            >
              <span>{isSpecial ? '🌸' : body.name === 'The Sun' ? '☀️' : '🪐'}</span>
              <span>{body.name}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom hint when in overview */}
      {showPlanetHint && !isFocused && (
        <div className="planet-hint" style={{ bottom: '70px' }}>
          <span className="planet-hint-dot" />
          <span>🖱️ <strong>Double-click / Drag</strong> to adjust view  •  <strong>Scroll</strong> to zoom  •  <strong>[Esc]</strong> resets view ✨</span>
        </div>
      )}
    </div>
  );
}
