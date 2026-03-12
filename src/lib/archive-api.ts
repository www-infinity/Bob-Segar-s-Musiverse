import type {
  ArchiveSearchResponse,
  ArchiveDoc,
  ArchiveMetadata,
  ArchiveFile,
  Track,
  Concert,
  ArchiveVideo,
  ArchiveImage,
} from "@/types/music";

const ARCHIVE_API_BASE = "https://archive.org";
const SEARCH_ENDPOINT = `${ARCHIVE_API_BASE}/advancedsearch.php`;
const METADATA_ENDPOINT = `${ARCHIVE_API_BASE}/metadata`;

// ─── Utility ──────────────────────────────────────────────────────────────────

function coerceString(value: string | string[] | undefined): string {
  if (!value) return "";
  if (Array.isArray(value)) return value[0] ?? "";
  return value;
}

function buildStreamUrl(identifier: string, filename: string): string {
  return `${ARCHIVE_API_BASE}/download/${identifier}/${encodeURIComponent(filename)}`;
}

function buildThumbnailUrl(identifier: string): string {
  return `${ARCHIVE_API_BASE}/services/img/${identifier}`;
}

function buildDetailsUrl(identifier: string): string {
  return `${ARCHIVE_API_BASE}/details/${identifier}`;
}

function guessDuration(file: ArchiveFile): number {
  if (file.length) {
    const parts = file.length.split(":").map(Number);
    if (parts.length === 3) {
      const [h, m, s] = parts;
      return (h ?? 0) * 3600 + (m ?? 0) * 60 + (s ?? 0);
    }
    if (parts.length === 2) {
      const [m, s] = parts;
      return (m ?? 0) * 60 + (s ?? 0);
    }
    return parseInt(file.length, 10) || 0;
  }
  return 0;
}

// ─── Search Functions ─────────────────────────────────────────────────────────

export async function searchArchive(
  query: string,
  mediaType: "audio" | "movies" | "image" = "audio",
  rows = 20,
  page = 1
): Promise<ArchiveSearchResponse> {
  const start = (page - 1) * rows;
  const params = new URLSearchParams({
    q: query,
    "fl[]": "identifier,title,description,creator,date,year,mediatype,format,downloads,avg_rating,thumbs",
    sort: "downloads desc",
    rows: String(rows),
    start: String(start),
    output: "json",
    mediatype: mediaType,
  });

  const response = await fetch(`${SEARCH_ENDPOINT}?${params.toString()}`, {
    next: { revalidate: 3600 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Archive search failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<ArchiveSearchResponse>;
}

export async function fetchArchiveMetadata(
  identifier: string
): Promise<ArchiveMetadata> {
  const response = await fetch(`${METADATA_ENDPOINT}/${identifier}`, {
    next: { revalidate: 86400 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Archive metadata failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<ArchiveMetadata>;
}

// ─── Bob Seger Specific Searches ─────────────────────────────────────────────

export async function searchBobSegerAudio(
  page = 1
): Promise<{ tracks: Track[]; total: number }> {
  const data = await searchArchive(
    'creator:"Bob Seger" OR subject:"Bob Seger"',
    "audio",
    20,
    page
  );

  const tracks: Track[] = data.response.docs
    .map((doc) => archiveDocToTrack(doc))
    .filter((t): t is Track => t !== null);

  return { tracks, total: data.response.numFound };
}

export async function searchBobSegerConcerts(
  page = 1
): Promise<{ concerts: Concert[]; total: number }> {
  const data = await searchArchive(
    'creator:"Bob Seger" AND (subject:"live" OR subject:"concert" OR collection:etree)',
    "audio",
    20,
    page
  );

  const concerts: Concert[] = data.response.docs
    .map((doc) => archiveDocToConcert(doc))
    .filter((c): c is Concert => c !== null);

  return { concerts, total: data.response.numFound };
}

export async function searchBobSegerVideos(
  page = 1
): Promise<{ videos: ArchiveVideo[]; total: number }> {
  const data = await searchArchive(
    'creator:"Bob Seger" OR title:"Bob Seger"',
    "movies",
    20,
    page
  );

  const videos: ArchiveVideo[] = data.response.docs
    .map((doc) => archiveDocToVideo(doc))
    .filter((v): v is ArchiveVideo => v !== null);

  return { videos, total: data.response.numFound };
}

export async function searchBobSegerImages(
  page = 1
): Promise<{ images: ArchiveImage[]; total: number }> {
  const data = await searchArchive(
    'creator:"Bob Seger" OR subject:"Bob Seger"',
    "image",
    20,
    page
  );

  const images: ArchiveImage[] = data.response.docs
    .map((doc) => archiveDocToImage(doc))
    .filter((img): img is ArchiveImage => img !== null);

  return { images, total: data.response.numFound };
}

export async function searchClassicRock(
  query: string,
  page = 1
): Promise<{ tracks: Track[]; total: number }> {
  const data = await searchArchive(
    `(${query}) AND (subject:"rock" OR subject:"classic rock")`,
    "audio",
    20,
    page
  );

  const tracks: Track[] = data.response.docs
    .map((doc) => archiveDocToTrack(doc))
    .filter((t): t is Track => t !== null);

  return { tracks, total: data.response.numFound };
}

// ─── Free-form user URL submission ────────────────────────────────────────────

export function parseUserSubmittedUrl(url: string): Track {
  const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Extract Internet Archive identifier if it's an archive.org URL
  let archiveId = "";
  let streamUrl = url;

  const archiveMatch = url.match(
    /archive\.org\/(?:details|download)\/([^/?#]+)/
  );
  if (archiveMatch?.[1]) {
    archiveId = archiveMatch[1];
    streamUrl = url.includes("/download/")
      ? url
      : `https://archive.org/download/${archiveId}`;
  }

  return {
    id,
    title: archiveId
      ? archiveId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "User Added Track",
    artist: "Unknown Artist",
    album: "User Added",
    year: new Date().getFullYear(),
    genre: "Unknown",
    duration: 0,
    archiveId,
    streamUrl,
    imageUrl: archiveId
      ? `https://archive.org/services/img/${archiveId}`
      : "/images/default-album.png",
    description: `User-submitted track from: ${url}`,
    source: "user",
    userAdded: true,
    addedAt: Date.now(),
  };
}

// ─── Converters ───────────────────────────────────────────────────────────────

function archiveDocToTrack(doc: ArchiveDoc): Track | null {
  if (!doc.identifier) return null;

  const identifier = doc.identifier;
  const title = coerceString(doc.title) || identifier;
  const creator = coerceString(doc.creator) || "Bob Seger";
  const year =
    doc.year ?? (doc.date ? parseInt(doc.date.slice(0, 4), 10) : 0);

  const formats = Array.isArray(doc.format) ? doc.format : [doc.format ?? ""];
  const hasAudio = formats.some((f) =>
    ["MP3", "OGG", "FLAC", "SHN", "VBR MP3"].includes(f?.toUpperCase() ?? "")
  );

  if (!hasAudio && doc.mediatype !== "audio") return null;

  return {
    id: `archive-${identifier}`,
    title,
    artist: creator,
    album: title,
    year,
    genre: "Classic Rock",
    duration: 0,
    archiveId: identifier,
    streamUrl: `https://archive.org/download/${identifier}`,
    imageUrl: buildThumbnailUrl(identifier),
    description: coerceString(doc.description),
    source: "archive",
  };
}

function archiveDocToConcert(doc: ArchiveDoc): Concert | null {
  if (!doc.identifier) return null;

  const identifier = doc.identifier;
  const title = coerceString(doc.title) || identifier;
  const creator = coerceString(doc.creator) || "Bob Seger";
  const dateStr = doc.date ?? `${doc.year ?? 1970}-01-01`;
  const year = doc.year ?? parseInt(dateStr.slice(0, 4), 10);

  return {
    id: `concert-archive-${identifier}`,
    title,
    artist: creator,
    venue: "Live Venue",
    city: "Unknown City",
    date: dateStr,
    year,
    archiveId: identifier,
    streamUrl: buildDetailsUrl(identifier),
    imageUrl: buildThumbnailUrl(identifier),
    description: coerceString(doc.description) || title,
    setlist: [],
    audioFormats: ["MP3"],
    source: "Internet Archive",
  };
}

function archiveDocToVideo(doc: ArchiveDoc): ArchiveVideo | null {
  if (!doc.identifier) return null;

  const identifier = doc.identifier;
  const title = coerceString(doc.title) || identifier;
  const creator = coerceString(doc.creator) || "Bob Seger";
  const year =
    doc.year ?? (doc.date ? parseInt(doc.date.slice(0, 4), 10) : 0);

  return {
    id: `video-${identifier}`,
    title,
    artist: creator,
    description: coerceString(doc.description) || title,
    archiveId: identifier,
    embedUrl: `https://archive.org/embed/${identifier}`,
    thumbnailUrl: buildThumbnailUrl(identifier),
    year,
    duration: 0,
    format: "video",
  };
}

function archiveDocToImage(doc: ArchiveDoc): ArchiveImage | null {
  if (!doc.identifier) return null;

  const identifier = doc.identifier;
  const title = coerceString(doc.title) || identifier;
  const year =
    doc.year ?? (doc.date ? parseInt(doc.date.slice(0, 4), 10) : 0);

  return {
    id: `image-${identifier}`,
    title,
    description: coerceString(doc.description) || title,
    archiveId: identifier,
    imageUrl: buildThumbnailUrl(identifier),
    thumbnailUrl: buildThumbnailUrl(identifier),
    year,
    source: "Internet Archive",
  };
}

// ─── Detail Page Helpers ──────────────────────────────────────────────────────

export async function getArchiveAudioFiles(
  identifier: string
): Promise<{ files: ArchiveFile[]; imageUrl: string }> {
  const metadata = await fetchArchiveMetadata(identifier);

  const audioFiles = metadata.files.filter((f) =>
    ["mp3", "ogg", "flac", "vbr mp3", "shn"].includes(
      f.format?.toLowerCase() ?? ""
    )
  );

  return {
    files: audioFiles,
    imageUrl: buildThumbnailUrl(identifier),
  };
}

export function archiveFilesToTracks(
  identifier: string,
  files: ArchiveFile[],
  imageUrl: string
): Track[] {
  return files
    .filter((f) => f.name)
    .map((f, i) => ({
      id: `${identifier}-${i}`,
      title:
        f.title ??
        f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      artist: f.creator ?? "Bob Seger",
      album: f.album ?? identifier,
      year: 0,
      genre: "Classic Rock",
      duration: guessDuration(f),
      archiveId: identifier,
      streamUrl: buildStreamUrl(identifier, f.name),
      imageUrl,
      description: `Track ${f.track ?? i + 1} from ${identifier}`,
      source: "archive" as const,
    }));
}
