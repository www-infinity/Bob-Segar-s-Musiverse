import type { UserProgress, EarnEvent, LevelStage } from "@/types/music";

const STORAGE_KEY = "musiverse_progress";

const STAGE_THRESHOLDS: { stage: LevelStage; minLevel: number }[] = [
  { stage: "club", minLevel: 0 },
  { stage: "diamond", minLevel: 5 },
  { stage: "heart", minLevel: 10 },
  { stage: "spade", minLevel: 20 },
];

const POINTS_TABLE: Record<EarnEvent["type"], number> = {
  watch: 15,
  listen: 10,
  share: 25,
  search: 5,
  add_track: 30,
  level_up: 100,
};

export function getInitialProgress(): UserProgress {
  return {
    points: 0,
    stars: 0,
    level: 1,
    stage: "club",
    mushrooms: 0,
    bugsFound: 0,
    songsPlayed: 0,
    minutesListened: 0,
    unlockedGames: [],
    trendingBoosts: 0,
  };
}

export function loadProgress(): UserProgress {
  if (typeof window === "undefined") return getInitialProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialProgress();
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    return { ...getInitialProgress(), ...parsed };
  } catch {
    return getInitialProgress();
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function calculateLevel(points: number): number {
  return Math.floor(points / 200) + 1;
}

export function getStageForLevel(level: number): LevelStage {
  let stage: LevelStage = "club";
  for (const threshold of STAGE_THRESHOLDS) {
    if (level >= threshold.minLevel) {
      stage = threshold.stage;
    }
  }
  return stage;
}

export function stageEmoji(stage: LevelStage): string {
  const map: Record<LevelStage, string> = {
    club: "♣️",
    diamond: "♦️",
    heart: "♥️",
    spade: "♠️",
  };
  return map[stage];
}

export function applyEarnEvent(
  progress: UserProgress,
  eventType: EarnEvent["type"]
): { updated: UserProgress; event: EarnEvent; leveledUp: boolean } {
  const basePoints = POINTS_TABLE[eventType];

  // Mushroom doubles research (star/discovery events)
  const multiplier =
    progress.mushrooms > 0 &&
    ["search", "watch", "listen"].includes(eventType)
      ? 2
      : 1;

  const earned = basePoints * multiplier;
  const newPoints = progress.points + earned;
  const newLevel = calculateLevel(newPoints);
  const leveledUp = newLevel > progress.level;
  const newStage = getStageForLevel(newLevel);

  // Stars from trending boosts (every 10 listens earns a star)
  const newSongsPlayed =
    eventType === "listen"
      ? progress.songsPlayed + 1
      : progress.songsPlayed;
  const newStars =
    Math.floor(newSongsPlayed / 10) + progress.trendingBoosts;

  // Unlock games at point milestones
  const newUnlockedGames = [...progress.unlockedGames];
  const gameUnlocks: { points: number; game: string }[] = [
    { points: 500, game: "trivia" },
    { points: 1000, game: "lyric-match" },
    { points: 2500, game: "album-quiz" },
  ];
  for (const unlock of gameUnlocks) {
    if (
      newPoints >= unlock.points &&
      !newUnlockedGames.includes(unlock.game)
    ) {
      newUnlockedGames.push(unlock.game);
    }
  }

  const updated: UserProgress = {
    ...progress,
    points: newPoints,
    stars: newStars,
    level: newLevel,
    stage: newStage,
    songsPlayed: newSongsPlayed,
    minutesListened:
      eventType === "listen"
        ? progress.minutesListened + 4
        : progress.minutesListened,
    mushrooms:
      progress.mushrooms > 0 &&
      ["search", "watch", "listen"].includes(eventType)
        ? Math.max(0, progress.mushrooms - 1)
        : progress.mushrooms,
    unlockedGames: newUnlockedGames,
  };

  const event: EarnEvent = {
    type: eventType,
    points: earned,
    label: buildEventLabel(eventType, earned, multiplier > 1),
    timestamp: Date.now(),
  };

  return { updated, event, leveledUp };
}

function buildEventLabel(
  type: EarnEvent["type"],
  points: number,
  doubled: boolean
): string {
  const base: Record<EarnEvent["type"], string> = {
    watch: "Watched a video",
    listen: "Listened to a track",
    share: "Shared to social",
    search: "Searched the archive",
    add_track: "Added a custom track",
    level_up: "Leveled up!",
  };
  const doubleNote = doubled ? " 🍄 (Doubled!)" : "";
  return `+${points} pts — ${base[type]}${doubleNote}`;
}

export function getPointsForNextLevel(progress: UserProgress): number {
  const nextLevelPoints = (progress.level) * 200;
  return Math.max(0, nextLevelPoints - progress.points);
}

export function getLevelProgress(progress: UserProgress): number {
  const currentLevelStart = (progress.level - 1) * 200;
  const nextLevelStart = progress.level * 200;
  const rangeSize = nextLevelStart - currentLevelStart;
  const progressInLevel = progress.points - currentLevelStart;
  return Math.min(100, Math.round((progressInLevel / rangeSize) * 100));
}
