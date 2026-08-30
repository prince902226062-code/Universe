// ============================================================
// Her Universe — VideoHologramModal Component
// ============================================================
// Floating 3D holographic video player overlay with rounded glow,
// HTML5 video controls, canvas fallback preview, and audio dimming.
// ============================================================

import { useEffect, useRef, useState } from 'react';
import type { TreasureConfig } from '../../data/treasures';

interface VideoHologramModalProps {
  treasure: TreasureConfig | null;
  onClose: () => void;
}

export function VideoHologramModal({ treasure, onClose }: VideoHologramModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const bufferingTimerRef = useRef<number | null>(null);

  const handleWaiting = () => {
    if (bufferingTimerRef.current) window.clearTimeout(bufferingTimerRef.current);
    bufferingTimerRef.current = window.setTimeout(() => {
      setIsBuffering(true);
    }, 1200);
  };

  const handlePlaying = () => {
    if (bufferingTimerRef.current) window.clearTimeout(bufferingTimerRef.current);
    setIsBuffering(false);
    setIsPlaying(true);
  };

  const handleCanPlay = () => {
    if (bufferingTimerRef.current) window.clearTimeout(bufferingTimerRef.current);
    setIsBuffering(false);
  };
  const [rotation, setRotation] = useState(0);

  // Reset rotation when treasure changes
  useEffect(() => {
    setRotation(0);
  }, [treasure]);

  // Key shortcuts (Escape to close, R to rotate)
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

  // Video playback initialization
  useEffect(() => {
    if (!treasure) return;
    setVideoError(false);
    setIsPlaying(true);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Fall back gracefully if autoplay is restricted by browser policy
        setIsPlaying(false);
      });
    }
  }, [treasure]);

  // Canvas animated fallback preview generator (when mp4 file is not yet placed)
  useEffect(() => {
    if (!treasure || !videoError || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const renderFallback = () => {
      t += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep space gradient
      const grad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        10,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 1.4
      );
      grad.addColorStop(0, '#2d0f40');
      grad.addColorStop(0.5, '#12082b');
      grad.addColorStop(1, '#050212');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floating holographic particles
      for (let i = 0; i < 30; i++) {
        const x = (Math.sin(t + i * 1.5) * 0.4 + 0.5) * canvas.width;
        const y = (Math.cos(t * 0.8 + i * 2.1) * 0.4 + 0.5) * canvas.height;
        const r = Math.sin(t + i) * 2 + 3;

        ctx.fillStyle = treasure.color;
        ctx.shadowColor = treasure.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, r), 0, Math.PI * 2);
        ctx.fill();
      }

      // Center title text
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#ffb6c1';
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 20px "Outfit", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(treasure.title, canvas.width / 2, canvas.height / 2 - 10);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = '13px "Outfit", system-ui, sans-serif';
      ctx.fillText('Personal Video Memory ✨', canvas.width / 2, canvas.height / 2 + 18);

      animId = requestAnimationFrame(renderFallback);
    };

    renderFallback();
    return () => cancelAnimationFrame(animId);
  }, [treasure, videoError]);

  if (!treasure) return null;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(2, 1, 10, 0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        animation: 'hologramFadeIn 0.4s ease-out forwards',
      }}
    >
      {/* Holographic Video Screen Container */}
      <div
        style={{
          position: 'relative',
          width: '90vw',
          maxWidth: '680px',
          background: 'linear-gradient(135deg, rgba(18, 10, 38, 0.94), rgba(35, 12, 55, 0.94))',
          border: `2px solid ${treasure.color}`,
          borderRadius: '24px',
          boxShadow: `0 0 35px ${treasure.color}66, 0 16px 48px rgba(0,0,0,0.8)`,
          padding: '24px',
          color: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Holographic Scanlines Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
            backgroundSize: '100% 4px',
            opacity: 0.35,
          }}
        />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: treasure.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {treasure.subtitle}
            </div>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', fontWeight: 700, color: '#ffffff' }}>
              {treasure.title}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Rotate Video 90° (Press R)"
            >
              🔄 Rotate {rotation > 0 ? `${rotation}°` : ''}
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              title="Close Video Memory (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Video Player Display Screen */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: '16px',
            overflow: 'hidden',
            background: '#000000',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          {!videoError ? (
            <>
              <video
                ref={videoRef}
                src={treasure.videoUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                playsInline
                preload="auto"
                controls
                onWaiting={handleWaiting}
                onPlaying={handlePlaying}
                onPause={() => setIsPlaying(false)}
                onCanPlay={handleCanPlay}
                onEnded={() => setIsPlaying(false)}
                onError={() => setVideoError(true)}
              />

              {/* Video Buffering / Loading Spinner */}
              {isBuffering && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid rgba(255, 255, 255, 0.2)',
                      borderTop: `3px solid ${treasure.color}`,
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span style={{ marginTop: '10px', fontSize: '12px', color: '#ffffff', letterSpacing: '0.05em' }}>
                    Buffering Video Memory... ✨
                  </span>
                </div>
              )}
            </>
          ) : (
            <canvas ref={canvasRef} width={640} height={360} style={{ width: '100%', height: '100%' }} />
          )}

          {/* Hologram Corner Target Brackets */}
          <div style={{ position: 'absolute', top: 12, left: 12, width: 16, height: 16, borderTop: `2px solid ${treasure.color}`, borderLeft: `2px solid ${treasure.color}` }} />
          <div style={{ position: 'absolute', top: 12, right: 12, width: 16, height: 16, borderTop: `2px solid ${treasure.color}`, borderRight: `2px solid ${treasure.color}` }} />
          <div style={{ position: 'absolute', bottom: 12, left: 12, width: 16, height: 16, borderBottom: `2px solid ${treasure.color}`, borderLeft: `2px solid ${treasure.color}` }} />
          <div style={{ position: 'absolute', bottom: 12, right: 12, width: 16, height: 16, borderBottom: `2px solid ${treasure.color}`, borderRight: `2px solid ${treasure.color}` }} />
        </div>

        {/* Description & Controls Bar */}
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)', maxWidth: '380px', lineHeight: 1.4 }}>
            {treasure.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={togglePlay}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>

            <button
              onClick={handleReplay}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              🔄 Replay
            </button>

            <button
              onClick={toggleMute}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {isMuted ? '🔇 Unmute' : '🔊 Mute'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
