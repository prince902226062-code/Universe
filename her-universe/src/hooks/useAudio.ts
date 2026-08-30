// ============================================================
// Her Universe — useAudio Hook
// ============================================================

import { useRef, useCallback, useEffect, useState } from 'react';

export function useAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = 'auto';

    audio.addEventListener('canplaythrough', () => setIsReady(true), { once: true });
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [src]);

  const play = useCallback(() => {
    audioRef.current?.play().catch(() => {
      // Autoplay blocked — will play on first user interaction
    });
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(audioRef.current.muted);
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, vol));
    }
  }, []);

  return { play, toggleMute, setVolume, isMuted, isReady };
}
