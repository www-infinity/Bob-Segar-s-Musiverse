"use client";

import { useState, useEffect } from "react";
import {
  Database,
  Music2,
  Video,
  Image,
  RefreshCw,
  Trash2,
  Plus,
  Clock,
} from "lucide-react";
import {
  loadInfinityDB,
  saveInfinityDB,
  getDBStats,
  filterDBByType,
  searchInfinityDB,
  removeFileFromInfinityDB,
  syncArchiveItemToDB,
} from "@/lib/infinity-db";
import { triggerEarnEvent } from "@/components/ui/GameHUD";
import type { InfinityDB, InfinityMediaFile, MediaFileType } from "@/types/music";

export default function DatabasePage() {
  const [db, setDB] = useState<InfinityDB | null>(null);
  const [activeType, setActiveType] = useState<MediaFileType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setDB(loadInfinityDB());
  }, []);

  async function handleSync() {
    if (!db) return;
    setIsSyncing(true);

    try {
      const itemsToSync = [
        {
          identifier: "bob-seger-ebbets-field-denver-co-1974-kbpi",
          title: "Bob Seger — Ebbets Field, Denver CO 1974 (KBPI)",
          type: "audio" as MediaFileType,
          url: "https://archive.org/details/bob-seger-ebbets-field-denver-co-1974-kbpi",
          thumbnailUrl: "https://archive.org/services/img/bob-seger-ebbets-field-denver-co-1974-kbpi",
          metadata: { artist: "Bob Seger", year: 1974 },
        },
        {
          identifier: "GratefulDead_1974_09_18_SoundBoard",
          title: "Classic Rock Archive Collection 1974",
          type: "audio" as MediaFileType,
          url: "https://archive.org/details/GratefulDead_1974_09_18_SoundBoard",
          thumbnailUrl: "https://archive.org/services/img/GratefulDead_1974_09_18_SoundBoard",
          metadata: { artist: "Various Artists", year: 1974 },
        },
      ];

      let current = db;
      for (const item of itemsToSync) {
        const { db: next } = syncArchiveItemToDB(current, item);
        current = next;
      }
      saveInfinityDB(current);
      setDB(current);
      triggerEarnEvent("search");
    } finally {
      setIsSyncing(false);
    }
  }

  function handleRemove(fileId: string) {
    if (!db) return;
    const updated = removeFileFromInfinityDB(db, fileId);
    saveInfinityDB(updated);
    setDB(updated);
  }

  if (!db) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500 flex items-center gap-2">
          <Database size={20} className="animate-pulse" />
          Loading Infinity Database...
        </div>
      </div>
    );
  }

  const stats = getDBStats(db);
  const filteredFiles: InfinityMediaFile[] = searchQuery.trim()
    ? searchInfinityDB(db, searchQuery)
    : activeType === "all"
    ? db.files
    : filterDBByType(db, activeType);

  const tabs: { id: MediaFileType | "all"; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "all", label: "All Files", icon: <Database size={13} />, count: stats.total },
    { id: "audio", label: "Audio", icon: <Music2 size={13} />, count: stats.audio },
    { id: "video", label: "Video", icon: <Video size={13} />, count: stats.video },
    { id: "image", label: "Images", icon: <Image size={13} />, count: stats.image },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Database size={28} className="text-blue-400" />
            Infinity Database
          </h1>
          <p className="text-zinc-400">
            Media files automatically synced and stored locally from Internet Archive
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Files", value: stats.total, color: "text-blue-400", icon: <Database size={16} className="text-blue-400" /> },
            { label: "Audio", value: stats.audio, color: "text-orange-400", icon: <Music2 size={16} className="text-orange-400" /> },
            { label: "Video", value: stats.video, color: "text-purple-400", icon: <Video size={16} className="text-purple-400" /> },
            { label: "Images", value: stats.image, color: "text-green-400", icon: <Image size={16} className="text-green-400" /> },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
              <div className="flex items-center justify-between mb-1">
                {s.icon}
                <span className="text-white font-bold text-xl tabular-nums">{s.value}</span>
              </div>
              <span className="text-zinc-500 text-xs">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex-1 min-w-48">
            <input
              type="search"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              aria-label="Search database files"
            />
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            aria-label="Sync Internet Archive content to database"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing..." : "Sync Archive"}
          </button>
          <span className="text-zinc-600 text-xs flex items-center gap-1">
            <Clock size={12} />
            Last: {stats.lastSync}
          </span>
        </div>

        <div className="flex gap-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800 mb-6" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeType === tab.id}
              onClick={() => setActiveType(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeType === tab.id
                  ? "bg-blue-700 text-white shadow"
                  : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className={`text-xs rounded-full px-1.5 ${activeType === tab.id ? "bg-white/20 text-white" : "bg-zinc-800 text-zinc-500"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {filteredFiles.length === 0 ? (
          <div className="text-center py-16">
            <Database size={48} className="mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-medium">
              {searchQuery ? `No files match "${searchQuery}"` : "No files synced yet"}
            </p>
            <p className="text-zinc-600 text-sm mt-2">Click Sync Archive to load content</p>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
            >
              <Plus size={14} />
              Start Syncing
            </button>
          </div>
        ) : (
          <div className="space-y-2" role="list" aria-label="Database files">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                role="listitem"
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                  {file.type === "audio" ? <Music2 size={14} className="text-orange-400" /> :
                   file.type === "video" ? <Video size={14} className="text-purple-400" /> :
                   <Image size={14} className="text-green-400" />}
                </div>
                {file.thumbnailUrl && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                    <img src={file.thumbnailUrl} alt={file.title} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} loading="lazy" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{file.title}</p>
                  <div className="flex items-center gap-2 text-zinc-600 text-xs mt-0.5">
                    <span className="capitalize">{file.source}</span>
                    {file.archiveId && <span className="text-zinc-700">· {file.archiveId}</span>}
                    <span className="text-zinc-700">· {new Date(file.syncedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={file.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    aria-label={`Open ${file.title}`}>
                    View
                  </a>
                  <button onClick={() => handleRemove(file.id)}
                    className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                    aria-label={`Remove ${file.title}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
