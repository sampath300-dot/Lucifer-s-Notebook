'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title?: string;
  duration?: string;
  className?: string;
  onDurationDetected?: (durationStr: string) => void;
}

export function AudioPlayer({ src, title, duration: initialDuration, className = '', onDurationDetected }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
        if (onDurationDetected) {
          const mins = Math.floor(audio.duration / 60);
          const secs = Math.floor(audio.duration % 60);
          onDurationDetected(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
        }
      }
    };

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isSeeking, onDurationDetected]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch((e) => console.error(e));
    }
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = Math.max(0, Math.min(duration || 1000, audio.currentTime + seconds));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
  };

  const handleSeekCommit = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const targetTime = parseFloat((e.target as HTMLInputElement).value);
    audio.currentTime = targetTime;
    setIsSeeking(false);
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.muted = false;
      setIsMuted(false);
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVol = parseFloat(e.target.value);
    audio.volume = newVol;
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      audio.muted = false;
      setIsMuted(false);
    }
  };

  const cyclePlaybackRate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const rates = [1, 1.25, 1.5];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatTime = (timeInSecs: number) => {
    if (isNaN(timeInSecs) || !isFinite(timeInSecs) || timeInSecs < 0) return '0:00';
    const minutes = Math.floor(timeInSecs / 60);
    const seconds = Math.floor(timeInSecs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const displayDuration = duration > 0 ? formatTime(duration) : (initialDuration || '0:00');
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] p-3.5 sm:p-5 transition-all shadow-none select-none ${className}`}
      role="region"
      aria-label={title ? `Audio player: ${title}` : 'Audio player'}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {title && (
        <div className="mb-2 sm:mb-3">
          <p className="font-serif text-sm sm:text-base font-medium text-[var(--theme-text)] leading-snug">
            {title}
          </p>
        </div>
      )}

      {/* Scrubber Progress Bar with comfortable touch target */}
      <div className="space-y-1 mb-3 sm:mb-4">
        <div className="relative py-1 flex items-center touch-none">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeekChange}
            onMouseDown={handleSeekStart}
            onTouchStart={handleSeekStart}
            onMouseUp={handleSeekCommit}
            onTouchEnd={handleSeekCommit}
            aria-label="Seek audio"
            className="w-full h-1 sm:h-1.5 rounded-full appearance-none cursor-pointer bg-[var(--theme-border)] focus:outline-none"
            style={{
              background: `linear-gradient(to right, var(--theme-accent) ${progressPercent}%, var(--theme-border) ${progressPercent}%)`,
            }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-[var(--theme-secondary)] tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>{displayDuration}</span>
        </div>
      </div>

      {/* Control Buttons Bar */}
      <div className="flex items-center justify-between gap-1 pt-0.5">
        {/* Left: Playback controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            className="min-h-[42px] min-w-[42px] sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-[var(--theme-accent)] text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 ml-0.5 fill-current" />
            )}
          </button>

          <button
            type="button"
            onClick={() => skip(-10)}
            title="Rewind 10 seconds"
            aria-label="Rewind 10 seconds"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded text-[var(--theme-secondary)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          <button
            type="button"
            onClick={() => skip(10)}
            title="Forward 10 seconds"
            aria-label="Forward 10 seconds"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded text-[var(--theme-secondary)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Right: Speed & Volume */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={cyclePlaybackRate}
            aria-label={`Playback speed: ${playbackRate}x`}
            className="min-h-[36px] px-2 text-[11px] font-medium rounded border border-[var(--theme-border)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)] transition-colors cursor-pointer flex items-center justify-center"
          >
            {playbackRate}x
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[var(--theme-secondary)] hover:text-[var(--theme-text)] cursor-pointer"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </button>

          <div className="hidden md:flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              aria-label="Volume slider"
              className="w-14 h-1 rounded-full appearance-none cursor-pointer bg-[var(--theme-border)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
