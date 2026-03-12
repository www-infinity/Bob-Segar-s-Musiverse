"use client";

import { useState, useMemo } from "react";
import { Play, Search, Plus, Music2, Star } from "lucide-react";
import { usePlayer } from "./PlayerContext";
import type { Track } from "@/types/music";

interface TrackListProps {
  tracks?: Track[];
  title?: string;
  showSearch?: boolean;
  maxHeight?: string;
}

export default function TrackList({
  tracks,
  title = "Queue",
  showSearch = true,
  maxHeight = "400px",
}: TrackListProps) {
  const { state, play, addToQueue } = usePlayer();
  const [searchQuery, setSearchQuery] = useState("");

  const displayTracks = tracks ?? state.queue;

  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return displayTracks;
    const lower = searchQuery.toLowerCase();
    return displayTracks.filter(
      (t) =>
        t.title.toLowerCase().includes(lower) ||
        t.artist.toLowerCase().includes(lower) ||
        t.album.toLowerCase().includes(lower) ||
        String(t.year).includes(lower)
    );
  }, [displayTracks, searchQuery]);

  function formatDuration(seconds: number): string {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function isCurrentTrack(track: Track): boolean {
    return state.currentTrack?.id === track.id;
  }

  if (displayTracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-3">
        <Music2 size={40} className="opacity-30" />
        <p className="text-sm">No tracks in queue</p>
        <p className="text-xs text-zinc-600">
          Search and add tracks to get started
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm flex items-center gap-1.5">
          <Music2 size={14} className="text-orange-400" />
          {title}
          <span className="text-zinc-500 font-normal text-xs ml-1">
            ({filteredTracks.length})
          </span>
        </h3>
      </div>

      {/* Search within tracklist */}
      {showSearch && (
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="search"
            placeholder="Filter tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800 text-zinc-300 text-xs pl-7 pr-3 py-1.5 rounded-md border border-zinc-700 focus:outline-none focus:border-orange-500 transition-colors placeholder:text-zinc-600"
            aria-label="Filter tracks in queue"
          />
        </div>
      )}

      {/* Track List */}
      <div
        className="overflow-y-auto scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700 space-y-0.5"
        style={{ maxHeight }}
        role="list"
        aria-label="Track list"
      >
        {filteredTracks.length === 0 ? (
          <div className="text-center py-6 text-zinc-600 text-xs">
            No tracks match &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredTracks.map((track, index) => {
            const isCurrent = isCurrentTrack(track);
            return (
              <div
                key={track.id}
                role="listitem"
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer group transition-all ${
                  isCurrent
                    ? "bg-orange-500/15 border border-orange-500/30"
                    : "hover:bg-zinc-800/70 border border-transparent"
                }`}
                onClick={() => play(track)}
                onKeyDown={(e) => e.key === "Enter" && play(track)}
                tabIndex={0}
                aria-label={`Play ${track.title} by ${track.artist}`}
                aria-current={isCurrent ? "true" : undefined}
              >
                {/* Track number / play indicator */}
                <div className="w-6 text-center shrink-0">
                  {isCurrent ? (
                    <span className="text-orange-400 text-xs" aria-label="Now playing">
                      ▶
                    </span>
                  ) : (
                    <>
                      <span className="text-zinc-600 text-xs group-hover:hidden">
                        {index + 1}
                      </span>
                      <Play
                        size={12}
                        className="text-zinc-400 hidden group-hover:block mx-auto"
                      />
                    </>
                  )}
                </div>

                {/* Thumbnail */}
                <div
                  className={`w-8 h-8 rounded bg-zinc-800 shrink-0 bg-cover bg-center ${
                    isCurrent ? "ring-1 ring-orange-500" : ""
                  }`}
                  style={{
                    backgroundImage: `url(${track.imageUrl})`,
                  }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium truncate ${
                      isCurrent ? "text-orange-300" : "text-zinc-200"
                    }`}
                  >
                    {track.title}
                  </p>
                  <p className="text-zinc-500 text-xs truncate">
                    {track.artist}
                  </p>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1 shrink-0">
                  {track.userAdded && (
                    <span
                      className="text-xs text-purple-400 bg-purple-900/30 px-1 rounded"
                      title="User added track"
                    >
                      <Plus size={10} />
                    </span>
                  )}
                  {track.source === "archive" && (
                    <span
                      className="text-xs text-blue-400 bg-blue-900/20 px-1 rounded"
                      title="Internet Archive"
                    >
                      IA
                    </span>
                  )}
                </div>

                {/* Duration */}
                <span className="text-zinc-600 text-xs tabular-nums w-8 text-right shrink-0">
                  {formatDuration(track.duration)}
                </span>

                {/* Add to queue */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToQueue(track);
                  }}
                  className="p-1 text-zinc-600 hover:text-orange-400 opacity-0 group-hover:opacity-100 transition-all"
                  aria-label={`Add ${track.title} to queue`}
                  title="Add to queue"
                >
                  <Star size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
