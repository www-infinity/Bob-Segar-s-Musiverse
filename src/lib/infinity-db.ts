import type { InfinityDB, InfinityMediaFile, MediaFileType } from "@/types/music";

const DB_KEY = "infinity_db";
const DB_VERSION = 1;

function getEmptyDB(): InfinityDB {
  return {
    files: [],
    lastSync: 0,
    totalFiles: 0,
    version: DB_VERSION,
  };
}

export function loadInfinityDB(): InfinityDB {
  if (typeof window === "undefined") return getEmptyDB();
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) return getEmptyDB();
    const parsed = JSON.parse(raw) as Partial<InfinityDB>;
    return {
      ...getEmptyDB(),
      ...parsed,
      files: parsed.files ?? [],
    };
  } catch {
    return getEmptyDB();
  }
}

export function saveInfinityDB(db: InfinityDB): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // Storage quota exceeded — remove oldest entries
    const trimmed: InfinityDB = {
      ...db,
      files: db.files.slice(-500), // keep last 500 entries
    };
    try {
      window.localStorage.setItem(DB_KEY, JSON.stringify(trimmed));
    } catch {
      // Silently fail if still too large
    }
  }
}

export function addFileToInfinityDB(
  db: InfinityDB,
  file: Omit<InfinityMediaFile, "id" | "syncedAt">
): { db: InfinityDB; file: InfinityMediaFile } {
  // Deduplicate by URL
  const existing = db.files.find((f) => f.url === file.url);
  if (existing) {
    return { db, file: existing };
  }

  const newFile: InfinityMediaFile = {
    ...file,
    id: `inf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    syncedAt: Date.now(),
  };

  const updated: InfinityDB = {
    ...db,
    files: [newFile, ...db.files],
    lastSync: Date.now(),
    totalFiles: db.totalFiles + 1,
  };

  return { db: updated, file: newFile };
}

export function removeFileFromInfinityDB(
  db: InfinityDB,
  fileId: string
): InfinityDB {
  return {
    ...db,
    files: db.files.filter((f) => f.id !== fileId),
    totalFiles: Math.max(0, db.totalFiles - 1),
  };
}

export function filterDBByType(
  db: InfinityDB,
  type: MediaFileType
): InfinityMediaFile[] {
  return db.files.filter((f) => f.type === type);
}

export function searchInfinityDB(
  db: InfinityDB,
  query: string
): InfinityMediaFile[] {
  const lower = query.toLowerCase();
  return db.files.filter(
    (f) =>
      f.title.toLowerCase().includes(lower) ||
      (f.metadata["artist"] as string | undefined)
        ?.toLowerCase()
        .includes(lower) ||
      false
  );
}

export function syncArchiveItemToDB(
  db: InfinityDB,
  item: {
    identifier: string;
    title: string;
    type: MediaFileType;
    url: string;
    thumbnailUrl?: string;
    metadata?: Record<string, string | number | boolean>;
  }
): { db: InfinityDB; file: InfinityMediaFile } {
  return addFileToInfinityDB(db, {
    title: item.title,
    type: item.type,
    url: item.url,
    thumbnailUrl: item.thumbnailUrl,
    archiveId: item.identifier,
    source: "archive",
    metadata: item.metadata ?? {},
  });
}

export function getDBStats(db: InfinityDB): {
  audio: number;
  video: number;
  image: number;
  total: number;
  lastSync: string;
} {
  const audio = db.files.filter((f) => f.type === "audio").length;
  const video = db.files.filter((f) => f.type === "video").length;
  const image = db.files.filter((f) => f.type === "image").length;
  const lastSync =
    db.lastSync > 0
      ? new Date(db.lastSync).toLocaleString()
      : "Never";

  return { audio, video, image, total: db.files.length, lastSync };
}
