import { useState, useEffect, useCallback, useRef } from 'react';

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on mount
  useEffect(() => {
    const audio = new Audio('https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3');
    audio.loop = true;
    audioRef.current = audio;

    // Try to autoplay
    audio.play().catch(err => {
      console.warn('Autoplay prevented:', err);
      setIsPlaying(false);
    });

    // Persist playback state
    const savedPlaybackState = localStorage.getItem('audioPlaybackState');
    if (savedPlaybackState === 'playing') {
      audio.play().catch(console.warn);
      setIsPlaying(true);
    }

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        const wasPlaying = !audioRef.current.paused;
        localStorage.setItem('audioPlaybackState', wasPlaying ? 'playing' : 'paused');
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle audio play/pause
  const toggleAudio = useCallback(() => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        localStorage.setItem('audioPlaybackState', 'paused');
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setError(null);
              localStorage.setItem('audioPlaybackState', 'playing');
            })
            .catch((err) => {
              console.warn('Audio playback failed:', err);
              setError('Audio playback failed. Please try again.');
              setIsPlaying(false);
              localStorage.setItem('audioPlaybackState', 'paused');
            });
        }
      }
      setIsPlaying(!isPlaying);
    } catch (err) {
      console.warn('Audio toggle failed:', err);
      setError('Audio system error. Please try again.');
      setIsPlaying(false);
      localStorage.setItem('audioPlaybackState', 'paused');
    }
  }, [isPlaying]);

  return {
    isPlaying,
    toggleAudio,
    error,
  };
}