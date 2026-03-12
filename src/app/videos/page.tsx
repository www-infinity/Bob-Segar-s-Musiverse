"use client";

import { useState, useEffect, useCallback } from "react";
import { ExternalLink, Loader2, AlertCircle, RefreshCw, Play } from "lucide-react";
import { searchBobSegerVideos } from "@/lib/archive-api";
import SocialShare from "@/components/ui/SocialShare";
import { triggerEarnEvent } from "@/components/ui/GameHUD";
import type { ArchiveVideo } from "@/types/music";

type LoadState = "idle" | "loading" | "loaded" | "error";

// Preloaded featured video identifiers
const FEATURED_VIDEO_IDS = [
  "bob-seger-ebbets-field-denver-co-1974-kbpi",
];

export default function VideosPage() {
  const [videos, setVideos] = useState<ArchiveVideo[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeVideo, setActiveVideo] = useState<ArchiveVideo | null>(null);

  const loadVideos = useCallback(async (pageNum: number) => {
    setLoadState("loading");
    setErrorMessage("");
    try {
      const result = await searchBobSegerVideos(pageNum);
      setVideos((prev) =>
        pageNum === 1 ? result.videos : [...prev, ...result.videos]
      );
      setTotal(result.total);
      setLoadState("loaded");
      triggerEarnEvent("search");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load videos."
      );
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    loadVideos(1);
  }, [loadVideos]);

  // Seed preloaded video entries if archive returns none
  const displayVideos: ArchiveVideo[] =
    videos.length > 0
      ? videos
      : FEATURED_VIDEO_IDS.map((id) => ({
          id: `preloaded-${id}`,
          title: "Bob Seger — Live at Ebbets Field, Denver 1974",
          artist: "Bob Seger & the Silver Bullet Band",
          description:
            "Rare KBPI radio broadcast — Bob Seger live in Denver, February 4, 1974.",
          archiveId: id,
          embedUrl: `https://archive.org/embed/${id}`,
          thumbnailUrl: `https://archive.org/services/img/${id}`,
          year: 1974,
          duration: 3600,
          format: "audio/video",
        }));

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span>🎬</span>
            Music Videos & Performances
          </h1>
          <p className="text-zinc-400">
            Bob Seger videos and live performances from the Internet Archive
          </p>
          <div className="mt-3">
            <SocialShare pageTitle="Bob Seger Videos" />
          </div>
        </div>

        {/* Active Video Embed */}
        {activeVideo && (
          <div className="mb-8 rounded-2xl bg-zinc-900/80 border border-purple-500/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Play size={16} className="text-purple-400" fill="currentColor" />
                {activeVideo.title}
              </h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-zinc-500 hover:text-white text-xs"
                aria-label="Close video player"
              >
                Close ✕
              </button>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden bg-zinc-800">
              <iframe
                src={activeVideo.embedUrl}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allowFullScreen
                allow="autoplay"
                aria-label={`Video player for ${activeVideo.title}`}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-zinc-500 text-sm">{activeVideo.description}</p>
              <a
                href={`https://archive.org/details/${activeVideo.archiveId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors shrink-0 ml-3"
              >
                <ExternalLink size={12} />
                Full Page
              </a>
            </div>
          </div>
        )}

        {/* Videos Grid */}
        {loadState === "loading" && videos.length === 0 ? (
          <div
            className="flex items-center justify-center py-20 gap-3 text-zinc-500"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 size={24} className="animate-spin" />
            <span>Searching Internet Archive for videos...</span>
          </div>
        ) : loadState === "error" && videos.length === 0 ? (
          <div
            className="flex flex-col items-center gap-4 py-16 text-zinc-500"
            role="alert"
          >
            <AlertCircle size={36} className="text-red-500 opacity-60" />
            <p className="text-sm">{errorMessage}</p>
            <button
              onClick={() => loadVideos(1)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 text-zinc-400 hover:border-purple-500 hover:text-purple-400 text-sm transition-colors"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayVideos.map((video) => (
                <article
                  key={video.id}
                  className="rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 overflow-hidden group transition-all"
                  aria-label={video.title}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-zinc-800">
                    <img
                      src={video.thumbnailUrl}
                      alt={`Thumbnail for ${video.title}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225' fill='%2318181b'%3E%3Crect width='400' height='225'/%3E%3Ctext x='50%25' y='50%25' fill='%2352525b' text-anchor='middle' dy='.3em' font-size='40'%3E🎬%3C/text%3E%3C/svg%3E";
                      }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => {
                          setActiveVideo(video);
                          triggerEarnEvent("watch");
                        }}
                        className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-500 transition-colors shadow-xl"
                        aria-label={`Watch ${video.title}`}
                      >
                        <Play size={24} fill="white" className="text-white translate-x-0.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span className="text-xs bg-black/70 text-zinc-300 px-1.5 py-0.5 rounded">
                        {video.year || "Archive"}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-purple-300 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-zinc-600 text-xs line-clamp-2 mb-3">
                      {video.description}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setActiveVideo(video);
                          triggerEarnEvent("watch");
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-medium transition-colors"
                        aria-label={`Watch ${video.title}`}
                      >
                        <Play size={12} fill="white" />
                        Watch
                      </button>
                      <a
                        href={`https://archive.org/details/${video.archiveId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 text-xs transition-colors"
                        aria-label={`View ${video.title} on Internet Archive`}
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Load more */}
            {displayVideos.length < total && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    loadVideos(next);
                  }}
                  disabled={loadState === "loading"}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-zinc-700 text-zinc-400 hover:border-purple-500 hover:text-purple-400 text-sm transition-colors disabled:opacity-50"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
