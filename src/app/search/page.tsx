"use client";

import { useState, useCallback, useRef } from "react";
import {
  Search,
  Music2,
  Video,
  Image,
  Globe,
  Loader2,
  AlertCircle,
  ExternalLink,
  Play,
  RefreshCw,
} from "lucide-react";
import { searchArchive } from "@/lib/archive-api";
import { usePlayer } from "@/components/player/PlayerContext";
import { triggerEarnEvent } from "@/components/ui/GameHUD";
import type { SearchTab, SearchResult } from "@/types/music";
import type { ArchiveDoc } from "@/types/music";

const SEARCH_TABS: { id: SearchTab; label: string; icon: React.ReactNode }[] =
  [
    { id: "all", label: "All", icon: <Globe size={13} /> },
    { id: "music", label: "Music", icon: <Music2 size={13} /> },
    { id: "videos", label: "Videos", icon: <Video size={13} /> },
    { id: "images", label: "Images", icon: <Image size={13} /> },
    { id: "concerts", label: "Concerts", icon: <Music2 size={13} /> },
  ];

function archiveDocToResult(doc: ArchiveDoc, tab: SearchTab): SearchResult {
  const description = Array.isArray(doc.description)
    ? doc.description[0] ?? ""
    : doc.description ?? "";
  const creator = Array.isArray(doc.creator)
    ? doc.creator[0] ?? ""
    : doc.creator ?? "";

  return {
    id: doc.identifier,
    title: doc.title ?? doc.identifier,
    description: description || creator || "Internet Archive item",
    url: `https://archive.org/details/${doc.identifier}`,
    thumbnailUrl: `https://archive.org/services/img/${doc.identifier}`,
    type: tab,
    source: "Internet Archive",
    date: doc.date ?? doc.publicdate ?? "",
  };
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToQueue } = usePlayer();

  const doSearch = useCallback(
    async (q: string, tab: SearchTab, pageNum: number) => {
      if (!q.trim()) return;
      setLoadState("loading");
      setErrorMessage("");

      try {
        const mediaType =
          tab === "videos"
            ? "movies"
            : tab === "images"
            ? "image"
            : "audio";

        const queryStr =
          tab === "all" || tab === "concerts"
            ? `(${q}) AND (creator:"Bob Seger" OR subject:"Bob Seger" OR (${q}))`
            : q;

        const response = await searchArchive(queryStr, mediaType, 20, pageNum);
        const newResults = response.response.docs.map((doc) =>
          archiveDocToResult(doc, tab)
        );

        setResults((prev) =>
          pageNum === 1 ? newResults : [...prev, ...newResults]
        );
        setTotal(response.response.numFound);
        setLoadState("loaded");
        triggerEarnEvent("search");
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Search failed. Try again."
        );
        setLoadState("error");
      }
    },
    []
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPage(1);
    setResults([]);
    doSearch(query, activeTab, 1);
  }

  function handleTabChange(tab: SearchTab) {
    setActiveTab(tab);
    setPage(1);
    setResults([]);
    if (query.trim()) {
      doSearch(query, tab, 1);
    }
  }

  function handleAddToJukebox(result: SearchResult) {
    addToQueue({
      id: `search-${result.id}`,
      title: result.title,
      artist: result.description.slice(0, 40),
      album: "Internet Archive",
      year: result.date ? parseInt(result.date.slice(0, 4), 10) || 0 : 0,
      genre: "Classic Rock",
      duration: 0,
      archiveId: result.id,
      streamUrl: `https://archive.org/download/${result.id}`,
      imageUrl: result.thumbnailUrl ?? "",
      detailsUrl: `https://archive.org/details/${result.id}`,
      description: result.description,
      source: "archive",
    });
    triggerEarnEvent("add_track");
  }

  const SUGGESTED = [
    "Bob Seger Night Moves",
    "Silver Bullet Band live",
    "Bob Seger concert 1976",
    "Old Time Rock Roll",
    "Against the Wind",
    "Bob Seger Ebbets Field",
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            🔍 Archive Search
          </h1>
          <p className="text-zinc-400 text-sm">
            Search millions of recordings, concerts, videos, and images from
            the Internet Archive
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} noValidate className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search Internet Archive... (e.g. "Bob Seger" live 1976)'
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-4 py-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors text-sm"
                aria-label="Search Internet Archive"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <button
              type="submit"
              disabled={!query.trim() || loadState === "loading"}
              className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors flex items-center gap-2"
              aria-label="Search"
            >
              {loadState === "loading" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </form>

        {/* Suggestions (shown before any search) */}
        {loadState === "idle" && (
          <div className="mb-8">
            <p className="text-zinc-600 text-xs mb-2">Try searching:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setQuery(s);
                    setPage(1);
                    setResults([]);
                    doSearch(s, activeTab, 1);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 hover:border-orange-500 hover:text-orange-400 transition-colors"
                  aria-label={`Search for ${s}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div
          className="flex gap-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800 mb-6"
          role="tablist"
          aria-label="Search filter tabs"
        >
          {SEARCH_TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-orange-600 text-white shadow"
                  : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Results Count */}
        {loadState === "loaded" && results.length > 0 && (
          <p className="text-zinc-500 text-xs mb-4">
            {total.toLocaleString()} results for &quot;{query}&quot;
          </p>
        )}

        {/* Results List */}
        {loadState === "loading" && results.length === 0 ? (
          <div
            className="flex items-center justify-center py-16 gap-3 text-zinc-500"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 size={24} className="animate-spin" />
            <span>Searching Internet Archive...</span>
          </div>
        ) : loadState === "error" ? (
          <div
            className="flex flex-col items-center gap-3 py-12"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle size={32} className="text-red-500 opacity-60" />
            <p className="text-zinc-500 text-sm">{errorMessage}</p>
            <button
              onClick={() => doSearch(query, activeTab, 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 text-zinc-400 hover:border-orange-500 hover:text-orange-400 text-sm transition-colors"
            >
              <RefreshCw size={14} />
              Retry Search
            </button>
          </div>
        ) : loadState === "loaded" && results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-600 text-4xl mb-3">🔍</p>
            <p className="text-zinc-500 font-medium">No results found</p>
            <p className="text-zinc-600 text-sm mt-1">
              Try different keywords or broaden your search
            </p>
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="Search results">
            {results.map((result) => (
              <div
                key={result.id}
                role="listitem"
                className="flex gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 transition-all group"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                  <img
                    src={result.thumbnailUrl}
                    alt={result.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' fill='%2318181b'%3E%3Crect width='64' height='64'/%3E%3Ctext x='50%25' y='50%25' fill='%2352525b' text-anchor='middle' dy='.3em' font-size='20'%3E🎵%3C/text%3E%3C/svg%3E";
                    }}
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate group-hover:text-orange-300 transition-colors">
                    {result.title}
                  </h3>
                  <p className="text-zinc-500 text-xs line-clamp-2 mt-0.5">
                    {result.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-zinc-600 text-xs">{result.source}</span>
                    {result.date && (
                      <span className="text-zinc-700 text-xs">· {result.date.slice(0, 4)}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => handleAddToJukebox(result)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 text-xs font-medium transition-colors"
                    aria-label={`Add ${result.title} to jukebox`}
                  >
                    <Play size={10} fill="currentColor" />
                    Add
                  </button>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-700 text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
                    aria-label={`View ${result.title} on Archive.org`}
                  >
                    <ExternalLink size={10} />
                    View
                  </a>
                </div>
              </div>
            ))}

            {/* Load More */}
            {results.length < total && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    doSearch(query, activeTab, next);
                  }}
                  disabled={loadState === "loading"}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-zinc-700 text-zinc-400 hover:border-orange-500 hover:text-orange-400 text-sm transition-colors disabled:opacity-40"
                >
                  {loadState === "loading" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : null}
                  Load More ({total - results.length} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
