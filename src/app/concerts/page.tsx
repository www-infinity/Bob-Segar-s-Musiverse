"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, ExternalLink, Loader2, AlertCircle, RefreshCw, Calendar, MapPin, Music } from "lucide-react";
import { BOB_SEGER_CONCERTS } from "@/lib/preloaded-tracks";
import { searchBobSegerConcerts } from "@/lib/archive-api";
import SocialShare from "@/components/ui/SocialShare";
import { usePlayer } from "@/components/player/PlayerContext";
import { triggerEarnEvent } from "@/components/ui/GameHUD";
import type { Concert } from "@/types/music";

type LoadState = "idle" | "loading" | "loaded" | "error";

export default function ConcertsPage() {
  const [archiveConcerts, setArchiveConcerts] = useState<Concert[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalArchive, setTotalArchive] = useState(0);
  const [activeConcert, setActiveConcert] = useState<Concert | null>(null);
  const { addToQueue } = usePlayer();

  const loadArchiveConcerts = useCallback(async (pageNum: number) => {
    setLoadState("loading");
    setErrorMessage("");
    try {
      const { concerts, total } = await searchBobSegerConcerts(pageNum);
      setArchiveConcerts((prev) =>
        pageNum === 1 ? concerts : [...prev, ...concerts]
      );
      setTotalArchive(total);
      setLoadState("loaded");
      triggerEarnEvent("search");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to load concerts. Check your internet connection.";
      setErrorMessage(msg);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    loadArchiveConcerts(1);
  }, [loadArchiveConcerts]);

  function handlePlayConcert(concert: Concert) {
    const fakeTrack = {
      id: `concert-play-${concert.id}`,
      title: concert.title,
      artist: concert.artist,
      album: `Live: ${concert.venue}`,
      year: concert.year,
      genre: "Classic Rock Live",
      duration: 0,
      archiveId: concert.archiveId,
      streamUrl: `https://archive.org/download/${concert.archiveId}`,
      imageUrl: concert.imageUrl,
      detailsUrl: `https://archive.org/details/${concert.archiveId}`,
      description: concert.description,
      source: "archive" as const,
    };
    addToQueue(fakeTrack);
    triggerEarnEvent("listen");
    setActiveConcert(concert);
  }

  const allConcerts: Concert[] = [...BOB_SEGER_CONCERTS, ...archiveConcerts];
  const hasMore = archiveConcerts.length < totalArchive - BOB_SEGER_CONCERTS.length;

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span>🎤</span>
            Live Concerts
          </h1>
          <p className="text-zinc-400">
            Bob Seger live recordings from 1974–1983, sourced from Internet Archive
          </p>
          <div className="mt-3">
            <SocialShare pageTitle="Bob Seger Live Concerts" />
          </div>
        </div>

        {/* Active Concert Player Embed */}
        {activeConcert && (
          <div className="mb-8 rounded-2xl bg-zinc-900/80 border border-orange-500/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Play size={16} className="text-orange-400" fill="currentColor" />
                Now Playing: {activeConcert.title}
              </h3>
              <button
                onClick={() => setActiveConcert(null)}
                className="text-zinc-500 hover:text-white text-xs"
                aria-label="Close concert player"
              >
                Close ✕
              </button>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden bg-zinc-800">
              <iframe
                src={`https://archive.org/embed/${activeConcert.archiveId}`}
                title={activeConcert.title}
                className="w-full h-full border-0"
                allowFullScreen
                allow="autoplay"
                aria-label={`Archive.org player for ${activeConcert.title}`}
              />
            </div>
            {activeConcert.setlist.length > 0 && (
              <div className="mt-3">
                <p className="text-zinc-500 text-xs mb-1 flex items-center gap-1">
                  <Music size={11} /> Setlist:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {activeConcert.setlist.map((song) => (
                    <span
                      key={song}
                      className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full"
                    >
                      {song}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Concert Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allConcerts.map((concert) => (
            <article
              key={concert.id}
              className="rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 overflow-hidden transition-all group"
              aria-label={concert.title}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-zinc-800">
                <img
                  src={concert.imageUrl}
                  alt={`${concert.title} - concert recording cover art`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225' fill='%2318181b'%3E%3Crect width='400' height='225'/%3E%3Ctext x='50%25' y='50%25' fill='%2352525b' text-anchor='middle' dy='.3em' font-size='40'%3E🎤%3C/text%3E%3C/svg%3E";
                  }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handlePlayConcert(concert)}
                    className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-400 transition-colors shadow-xl"
                    aria-label={`Play ${concert.title}`}
                  >
                    <Play size={24} fill="white" className="text-white translate-x-0.5" />
                  </button>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="text-xs bg-black/60 text-orange-400 px-2 py-0.5 rounded-full">
                    {concert.source}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-bold text-sm mb-1 line-clamp-2 group-hover:text-orange-300 transition-colors">
                  {concert.title}
                </h3>
                <div className="flex items-center gap-3 text-zinc-500 text-xs mb-2">
                  <span className="flex items-center gap-1">
                    <MapPin size={10} />
                    {concert.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={10} />
                    {concert.year}
                  </span>
                </div>
                <p className="text-zinc-600 text-xs line-clamp-2 mb-3">
                  {concert.description}
                </p>

                {/* Formats */}
                <div className="flex items-center gap-1.5 mb-3">
                  {concert.audioFormats.map((fmt) => (
                    <span
                      key={fmt}
                      className="text-xs bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePlayConcert(concert)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium transition-colors"
                    aria-label={`Play ${concert.title}`}
                  >
                    <Play size={12} fill="white" />
                    Play
                  </button>
                  <a
                    href={`https://archive.org/details/${concert.archiveId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 text-xs transition-colors"
                    aria-label={`View ${concert.title} on Internet Archive`}
                  >
                    <ExternalLink size={12} />
                    Archive
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Loading state */}
        {loadState === "loading" && (
          <div
            className="flex items-center justify-center py-12 gap-3 text-zinc-500"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 size={20} className="animate-spin" />
            <span>Loading concerts from Internet Archive...</span>
          </div>
        )}

        {/* Error state */}
        {loadState === "error" && (
          <div
            className="flex flex-col items-center gap-3 py-10 text-zinc-500"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle size={32} className="text-red-500 opacity-70" />
            <p className="text-sm">{errorMessage}</p>
            <button
              onClick={() => loadArchiveConcerts(1)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 text-zinc-400 hover:border-orange-500 hover:text-orange-400 text-sm transition-colors"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* Load More */}
        {loadState === "loaded" && hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => {
                const next = page + 1;
                setPage(next);
                loadArchiveConcerts(next);
              }}
              className="px-6 py-2.5 rounded-full border border-zinc-700 text-zinc-400 hover:border-orange-500 hover:text-orange-400 text-sm font-medium transition-colors"
              aria-label="Load more concerts from Internet Archive"
            >
              Load More ({totalArchive - allConcerts.length} remaining)
            </button>
          </div>
        )}

        {/* Empty state */}
        {loadState === "loaded" && allConcerts.length === 0 && (
          <div className="text-center py-16 text-zinc-600">
            <p className="text-4xl mb-3">🎤</p>
            <p className="text-lg font-medium text-zinc-500">No concerts found</p>
            <p className="text-sm mt-1">Try refreshing or checking the Archive search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
