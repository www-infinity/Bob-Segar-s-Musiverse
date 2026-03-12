"use client";

import { useState, useEffect, useCallback } from "react";
import { ExternalLink, Loader2, AlertCircle, RefreshCw, ZoomIn, X } from "lucide-react";
import { searchBobSegerImages } from "@/lib/archive-api";
import SocialShare from "@/components/ui/SocialShare";
import { triggerEarnEvent } from "@/components/ui/GameHUD";
import type { ArchiveImage } from "@/types/music";

type LoadState = "idle" | "loading" | "loaded" | "error";

// Preloaded known image identifiers
const PRELOADED_IMAGES: ArchiveImage[] = [
  {
    id: "pre-01",
    title: "Bob Seger at Ebbets Field, Denver 1974",
    description: "Live concert photograph from the KBPI radio broadcast show.",
    archiveId: "bob-seger-ebbets-field-denver-co-1974-kbpi",
    imageUrl: "https://archive.org/services/img/bob-seger-ebbets-field-denver-co-1974-kbpi",
    thumbnailUrl: "https://archive.org/services/img/bob-seger-ebbets-field-denver-co-1974-kbpi",
    detailsUrl: "https://archive.org/details/bob-seger-ebbets-field-denver-co-1974-kbpi",
    year: 1974,
    source: "Internet Archive",
  },
];

export default function GalleryPage() {
  const [images, setImages] = useState<ArchiveImage[]>(PRELOADED_IMAGES);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<ArchiveImage | null>(null);

  const loadImages = useCallback(async (pageNum: number) => {
    setLoadState("loading");
    setErrorMessage("");
    try {
      const result = await searchBobSegerImages(pageNum);
      setImages((prev) =>
        pageNum === 1
          ? [...PRELOADED_IMAGES, ...result.images]
          : [...prev, ...result.images]
      );
      setTotal(result.total + PRELOADED_IMAGES.length);
      setLoadState("loaded");
      triggerEarnEvent("search");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load images."
      );
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    loadImages(1);
  }, [loadImages]);

  // Close lightbox on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxImage(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo: ${lightboxImage.title}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxImage(null);
          }}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
              aria-label="Close photo lightbox"
            >
              <X size={24} />
            </button>
            <img
              src={lightboxImage.imageUrl}
              alt={lightboxImage.title}
              className="w-full rounded-xl shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' fill='%2318181b'%3E%3Crect width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' fill='%2352525b' text-anchor='middle' dy='.3em' font-size='60'%3E📷%3C/text%3E%3C/svg%3E";
              }}
            />
            <div className="mt-3 text-center">
              <h3 className="text-white font-semibold">{lightboxImage.title}</h3>
              <p className="text-zinc-500 text-sm mt-1">{lightboxImage.description}</p>
              <a
                href={`https://archive.org/details/${lightboxImage.archiveId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-orange-400 hover:text-orange-300"
              >
                <ExternalLink size={12} />
                View on Archive.org
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span>📷</span>
            Photo Gallery
          </h1>
          <p className="text-zinc-400">
            Rare Bob Seger photographs and memorabilia from Internet Archive
          </p>
          <div className="mt-3">
            <SocialShare pageTitle="Bob Seger Photo Gallery" />
          </div>
        </div>

        {/* Loading initial */}
        {loadState === "loading" && images.length <= PRELOADED_IMAGES.length ? (
          <div
            className="flex items-center justify-center py-20 gap-3 text-zinc-500"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 size={24} className="animate-spin" />
            <span>Loading images from Internet Archive...</span>
          </div>
        ) : (
          <>
            {/* Masonry-style grid */}
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="break-inside-avoid rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 cursor-pointer group transition-all"
                  onClick={() => setLightboxImage(image)}
                  onKeyDown={(e) => e.key === "Enter" && setLightboxImage(image)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View larger: ${image.title}`}
                >
                  <div className="relative">
                    <img
                      src={image.thumbnailUrl}
                      alt={image.title}
                      className="w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' fill='%2318181b'%3E%3Crect width='300' height='300'/%3E%3Ctext x='50%25' y='50%25' fill='%2352525b' text-anchor='middle' dy='.3em' font-size='50'%3E📷%3C/text%3E%3C/svg%3E";
                      }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn size={24} className="text-white" />
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-zinc-400 text-xs line-clamp-2">{image.title}</p>
                    {image.year > 0 && (
                      <p className="text-zinc-600 text-xs mt-0.5">{image.year}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Error inline */}
            {loadState === "error" && (
              <div
                className="flex flex-col items-center gap-3 py-8 text-zinc-500"
                role="alert"
              >
                <AlertCircle size={28} className="text-red-500 opacity-60" />
                <p className="text-sm">{errorMessage}</p>
                <button
                  onClick={() => loadImages(1)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 text-zinc-400 hover:border-green-500 hover:text-green-400 text-sm transition-colors"
                >
                  <RefreshCw size={14} />
                  Retry
                </button>
              </div>
            )}

            {/* Load more */}
            {loadState === "loaded" && images.length < total && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    loadImages(next);
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-zinc-700 text-zinc-400 hover:border-green-500 hover:text-green-400 text-sm transition-colors"
                >
                  Load More Photos
                </button>
              </div>
            )}

            {/* Load more loading state */}
            {loadState === "loading" && images.length > PRELOADED_IMAGES.length && (
              <div className="flex justify-center mt-6">
                <Loader2 size={20} className="animate-spin text-zinc-500" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
