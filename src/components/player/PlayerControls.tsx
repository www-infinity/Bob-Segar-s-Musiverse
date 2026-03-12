"use client";

import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Music,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { usePlayer } from "./PlayerContext";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlayerControls() {
  const {
    state,
    play,
    pause,
    resume,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    setRepeatMode,
    nextTrack,
    prevTrack,
  } = usePlayer();

  const { currentTrack, status, currentTime, duration, volume, isMuted, isShuffled, repeatMode } = state;

  const isPlaying = status === "playing";
  const isLoading = status === "loading";
  const hasError = status === "error";
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  function handlePlayPause() {
    if (isLoading) return;
    if (isPlaying) {
      pause();
    } else if (status === "paused") {
      resume();
    } else if (currentTrack) {
      play(currentTrack);
    } else {
      const firstTrack = state.queue[0];
      if (firstTrack) play(firstTrack);
    }
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(duration, ratio * duration)));
  }

  function cycleRepeat() {
    if (repeatMode === "none") setRepeatMode("all");
    else if (repeatMode === "all") setRepeatMode("one");
    else setRepeatMode("none");
  }

  return (
    <div className="flex flex-col gap-3 w-full" aria-label="Music player controls">
      {/* Track Info */}
      <div className="flex items-center gap-3 min-h-[56px]">
        {currentTrack ? (
          <>
            <div
              className="w-12 h-12 rounded-lg bg-cover bg-center shrink-0 shadow-md ring-2 ring-orange-500/40"
              style={{ backgroundImage: `url(${currentTrack.imageUrl})` }}
              role="img"
              aria-label={`Album art for ${currentTrack.album}`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate text-sm">
                {currentTrack.title}
              </p>
              <p className="text-zinc-400 text-xs truncate">
                {currentTrack.artist} · {currentTrack.year}
              </p>
            </div>
            {hasError && (
              <div
                className="flex items-center gap-1 text-red-400 text-xs shrink-0"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle size={14} />
                <span>Load error</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-3 text-zinc-500">
            <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
              <Music size={20} />
            </div>
            <span className="text-sm">Select a track to play</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 text-zinc-400 text-xs">
        <span className="w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
        <div
          className="flex-1 h-2 bg-zinc-700 rounded-full cursor-pointer group relative"
          onClick={handleSeek}
          role="slider"
          aria-label="Seek position"
          aria-valuemin={0}
          aria-valuemax={duration || 100}
          aria-valuenow={currentTime}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") seek(Math.min(duration, currentTime + 10));
            if (e.key === "ArrowLeft") seek(Math.max(0, currentTime - 10));
          }}
        >
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-purple-600 rounded-full transition-all relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <span className="w-8 tabular-nums">{formatTime(duration)}</span>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Shuffle */}
        <button
          onClick={toggleShuffle}
          className={`p-1.5 rounded-full transition-colors ${
            isShuffled ? "text-orange-400" : "text-zinc-400 hover:text-white"
          }`}
          aria-label={`Shuffle ${isShuffled ? "on" : "off"}`}
          aria-pressed={isShuffled}
        >
          <Shuffle size={16} />
        </button>

        {/* Previous */}
        <button
          onClick={prevTrack}
          className="p-2 rounded-full text-zinc-300 hover:text-white transition-colors disabled:opacity-30"
          aria-label="Previous track"
          disabled={state.queue.length === 0}
        >
          <SkipBack size={20} />
        </button>

        {/* Play / Pause */}
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isLoading
              ? "bg-zinc-700 cursor-wait"
              : "bg-gradient-to-br from-orange-500 to-purple-600 hover:scale-105 active:scale-95"
          }`}
          aria-label={isPlaying ? "Pause" : "Play"}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <Loader2 size={22} className="text-white animate-spin" />
          ) : isPlaying ? (
            <Pause size={22} className="text-white" fill="white" />
          ) : (
            <Play size={22} className="text-white translate-x-0.5" fill="white" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={nextTrack}
          className="p-2 rounded-full text-zinc-300 hover:text-white transition-colors disabled:opacity-30"
          aria-label="Next track"
          disabled={state.queue.length === 0}
        >
          <SkipForward size={20} />
        </button>

        {/* Repeat */}
        <button
          onClick={cycleRepeat}
          className={`p-1.5 rounded-full transition-colors ${
            repeatMode !== "none"
              ? "text-purple-400"
              : "text-zinc-400 hover:text-white"
          }`}
          aria-label={`Repeat: ${repeatMode}`}
          aria-pressed={repeatMode !== "none"}
        >
          {repeatMode === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleMute}
          className="text-zinc-400 hover:text-white transition-colors"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(parseInt(e.target.value, 10))}
          className="flex-1 h-1.5 accent-orange-500 cursor-pointer"
          aria-label="Volume"
        />
        <span className="text-zinc-500 text-xs w-6 tabular-nums">
          {isMuted ? 0 : volume}
        </span>
      </div>
    </div>
  );
}
