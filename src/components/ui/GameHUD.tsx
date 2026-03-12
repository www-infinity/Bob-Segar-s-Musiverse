"use client";

import { useEffect, useState } from "react";
import { Star, Zap, Shield, Trophy, Bug, ChevronUp } from "lucide-react";
import {
  loadProgress,
  saveProgress,
  applyEarnEvent,
  getLevelProgress,
  getPointsForNextLevel,
  stageEmoji,
} from "@/lib/gamification";
import type { UserProgress, EarnEvent } from "@/types/music";

interface GameHUDProps {
  compact?: boolean;
}

export default function GameHUD({ compact = false }: GameHUDProps) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [recentEvent, setRecentEvent] = useState<EarnEvent | null>(null);
  const [levelUpFlash, setLevelUpFlash] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  // Expose event trigger globally so other components can call it
  useEffect(() => {
    function handleEarnEvent(e: CustomEvent<{ type: EarnEvent["type"] }>) {
      setProgress((prev) => {
        if (!prev) return prev;
        const { updated, event, leveledUp } = applyEarnEvent(prev, e.detail.type);
        saveProgress(updated);
        setRecentEvent(event);
        setTimeout(() => setRecentEvent(null), 3000);
        if (leveledUp) {
          setLevelUpFlash(true);
          setTimeout(() => setLevelUpFlash(false), 2000);
        }
        return updated;
      });
    }

    window.addEventListener("musiverse:earn", handleEarnEvent as EventListener);
    return () => {
      window.removeEventListener("musiverse:earn", handleEarnEvent as EventListener);
    };
  }, []);

  if (!progress) return null;

  const levelPct = getLevelProgress(progress);
  const pointsToNext = getPointsForNextLevel(progress);

  if (compact) {
    return (
      <div
        className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-700/50 rounded-full px-3 py-1.5"
        aria-label="Game progress"
      >
        <span className="text-xs text-orange-400 font-bold">
          {stageEmoji(progress.stage)} Lvl {progress.level}
        </span>
        <span className="text-xs text-yellow-400">⭐ {progress.stars}</span>
        <span className="text-xs text-zinc-400">{progress.points.toLocaleString()} pts</span>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-xl border p-4 space-y-3 transition-all ${
        levelUpFlash
          ? "border-yellow-400 bg-yellow-500/10 shadow-lg shadow-yellow-500/20"
          : "border-zinc-700/50 bg-zinc-900/60"
      }`}
      aria-label="Watch & Earn game progress panel"
      role="region"
    >
      {/* Level Up Flash */}
      {levelUpFlash && (
        <div
          className="absolute inset-0 rounded-xl flex items-center justify-center pointer-events-none z-10"
          aria-live="assertive"
        >
          <div className="text-yellow-400 font-bold text-xl flex items-center gap-2 animate-bounce">
            <ChevronUp size={24} />
            LEVEL UP! {stageEmoji(progress.stage)}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-yellow-400" />
          <span className="text-white font-semibold text-sm">Watch & Earn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg" aria-label={`Stage: ${progress.stage}`}>
            {stageEmoji(progress.stage)}
          </span>
          <span className="text-white font-bold text-sm">
            Level {progress.level}
          </span>
        </div>
      </div>

      {/* Level Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-zinc-500 mb-1">
          <span>{progress.points.toLocaleString()} pts</span>
          <span>{pointsToNext} to next level</span>
        </div>
        <div
          className="h-2 bg-zinc-800 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={levelPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Level progress: ${levelPct}%`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
            style={{ width: `${levelPct}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <StatBadge
          icon={<Star size={13} className="text-yellow-400" />}
          label="Stars"
          value={progress.stars}
          tooltip="Trending boost — earned every 10 plays"
        />
        <StatBadge
          icon={<span className="text-green-400 text-sm">🍄</span>}
          label="Mushrooms"
          value={progress.mushrooms}
          tooltip="Doubles your research points"
        />
        <StatBadge
          icon={<Bug size={13} className="text-red-400" />}
          label="Bugs Fixed"
          value={progress.bugsFound}
          tooltip="Bugs stomped in early systems"
        />
        <StatBadge
          icon={<Zap size={13} className="text-orange-400" />}
          label="Songs"
          value={progress.songsPlayed}
          tooltip="Total songs listened"
        />
        <StatBadge
          icon={<Shield size={13} className="text-purple-400" />}
          label="Minutes"
          value={progress.minutesListened}
          tooltip="Total minutes listened"
        />
        <StatBadge
          icon={<Trophy size={13} className="text-blue-400" />}
          label="Games"
          value={progress.unlockedGames.length}
          tooltip="Unlocked games"
        />
      </div>

      {/* Unlocked Games */}
      {progress.unlockedGames.length > 0 && (
        <div className="border-t border-zinc-800 pt-2">
          <p className="text-zinc-500 text-xs mb-1.5">🎮 Unlocked Games:</p>
          <div className="flex flex-wrap gap-1.5">
            {progress.unlockedGames.map((game) => (
              <span
                key={game}
                className="text-xs bg-purple-900/40 text-purple-300 border border-purple-700/30 px-2 py-0.5 rounded-full capitalize"
              >
                {game.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Earn Event */}
      {recentEvent && (
        <div
          className="text-xs text-green-400 bg-green-900/20 border border-green-700/30 rounded-lg px-3 py-2 font-medium"
          role="status"
          aria-live="polite"
        >
          🎉 {recentEvent.label}
        </div>
      )}

      {/* How to Earn Points */}
      <details className="group">
        <summary className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors list-none flex items-center gap-1">
          <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
          How to earn points
        </summary>
        <div className="mt-2 space-y-1 text-xs text-zinc-500">
          <p>🎵 Listen to tracks = +10 pts</p>
          <p>🎥 Watch videos = +15 pts</p>
          <p>🔗 Share content = +25 pts</p>
          <p>➕ Add custom track = +30 pts</p>
          <p>🔍 Search archives = +5 pts</p>
          <p>🍄 Mushroom active = points doubled</p>
          <p>⭐ Stars = every 10 songs played</p>
        </div>
      </details>
    </div>
  );
}

interface StatBadgeProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  tooltip: string;
}

function StatBadge({ icon, label, value, tooltip }: StatBadgeProps) {
  return (
    <div
      className="flex flex-col items-center gap-0.5 bg-zinc-800/50 rounded-lg p-2"
      title={tooltip}
    >
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-white font-bold text-sm tabular-nums">
          {value}
        </span>
      </div>
      <span className="text-zinc-600 text-xs">{label}</span>
    </div>
  );
}

// ─── Helper to trigger earn events from other components ──────────────────────
export function triggerEarnEvent(type: EarnEvent["type"]): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("musiverse:earn", { detail: { type } })
  );
}
