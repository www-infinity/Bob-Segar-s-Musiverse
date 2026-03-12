// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  genre: string;
  duration: number; // seconds
  archiveId: string; // Internet Archive identifier
  streamUrl: string;
  imageUrl: string;
  detailsUrl: string; // Direct link to archive.org details page
  description: string;
  source: "archive" | "user";
  userAdded?: boolean;
  addedAt?: number; // timestamp
}

export interface Concert {
  id: string;
  title: string;
  artist: string;
  venue: string;
  city: string;
  date: string; // ISO date string
  year: number;
  archiveId: string;
  streamUrl: string;
  imageUrl: string;
  detailsUrl: string; // Direct link to archive.org details page
  description: string;
  setlist: string[];
  audioFormats: string[];
  source: string;
}

export interface ArchiveVideo {
  id: string;
  title: string;
  artist: string;
  description: string;
  archiveId: string;
  embedUrl: string;
  thumbnailUrl: string;
  detailsUrl: string; // Direct link to archive.org details page
  year: number;
  duration: number;
  format: string;
}

export interface ArchiveImage {
  id: string;
  title: string;
  description: string;
  archiveId: string;
  imageUrl: string;
  thumbnailUrl: string;
  detailsUrl: string; // Direct link to archive.org details page
  year: number;
  source: string;
}

// ─── Internet Archive API Types ───────────────────────────────────────────────

export interface ArchiveSearchResponse {
  responseHeader: {
    status: number;
    QTime: number;
    params: Record<string, string>;
  };
  response: {
    numFound: number;
    start: number;
    docs: ArchiveDoc[];
  };
}

export interface ArchiveDoc {
  identifier: string;
  title: string;
  description?: string | string[];
  creator?: string | string[];
  date?: string;
  year?: number;
  subject?: string | string[];
  mediatype: string;
  format?: string | string[];
  downloads?: number;
  avg_rating?: number;
  num_reviews?: number;
  oai_updatedate?: string[];
  publicdate?: string;
  addeddate?: string;
  item_size?: number;
  files_count?: number;
  thumbs?: string;
}

export interface ArchiveMetadata {
  metadata: {
    identifier: string;
    title: string;
    description?: string | string[];
    creator?: string | string[];
    date?: string;
    mediatype: string;
    subject?: string | string[];
  };
  files: ArchiveFile[];
  reviews?: ArchiveReview[];
}

export interface ArchiveFile {
  name: string;
  format: string;
  size?: string;
  length?: string;
  title?: string;
  track?: string;
  creator?: string;
  album?: string;
  bitrate?: string;
}

export interface ArchiveReview {
  reviewbody: string;
  reviewtitle: string;
  reviewer: string;
  reviewdate: string;
  stars: string;
}

// ─── Player State Types ───────────────────────────────────────────────────────

export type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  status: PlayerStatus;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: "none" | "one" | "all";
  equalizerBands: number[]; // 0-100 for each of 10 bands
}

// ─── Gamification Types ───────────────────────────────────────────────────────

export type LevelStage = "club" | "diamond" | "heart" | "spade";

export interface UserProgress {
  points: number;
  stars: number;
  level: number;
  stage: LevelStage;
  mushrooms: number; // doubles research/discovery
  bugsFound: number; // "guys stomped out"
  songsPlayed: number;
  minutesListened: number;
  unlockedGames: string[];
  trendingBoosts: number;
}

export interface EarnEvent {
  type: "watch" | "listen" | "share" | "search" | "add_track" | "level_up";
  points: number;
  label: string;
  timestamp: number;
}

// ─── Infinity DB Types ────────────────────────────────────────────────────────

export type MediaFileType = "audio" | "video" | "image" | "document";

export interface InfinityMediaFile {
  id: string;
  title: string;
  type: MediaFileType;
  url: string;
  thumbnailUrl?: string;
  archiveId?: string;
  source: "archive" | "user" | "youtube" | "other";
  syncedAt: number;
  metadata: Record<string, string | number | boolean>;
}

export interface InfinityDB {
  files: InfinityMediaFile[];
  lastSync: number;
  totalFiles: number;
  version: number;
}

// ─── Search Types ─────────────────────────────────────────────────────────────

export type SearchTab =
  | "all"
  | "images"
  | "videos"
  | "music"
  | "news"
  | "concerts";

export interface SearchState {
  query: string;
  tab: SearchTab;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  type: SearchTab;
  source: string;
  date?: string;
}

// ─── Social Sharing Types ─────────────────────────────────────────────────────

export interface ShareTarget {
  platform: "twitter" | "facebook" | "reddit" | "copy";
  label: string;
  url: string;
}
