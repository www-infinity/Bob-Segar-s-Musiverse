"use client";

import { useState } from "react";
import { Link2, Plus, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { parseUserSubmittedUrl } from "@/lib/archive-api";
import { usePlayer } from "@/components/player/PlayerContext";
import type { Track } from "@/types/music";

interface AddTrackFormProps {
  onTrackAdded?: (track: Track) => void;
}

type FormStatus = "idle" | "loading" | "success" | "error";

export default function AddTrackForm({ onTrackAdded }: AddTrackFormProps) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [lastAdded, setLastAdded] = useState<Track | null>(null);
  const { addToQueue } = usePlayer();

  function validateUrl(value: string): string | null {
    try {
      const parsed = new URL(value);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return "Only HTTP/HTTPS URLs are supported.";
      }
      return null;
    } catch {
      return "Please enter a valid URL.";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = url.trim();

    if (!trimmed) {
      setErrorMessage("Please enter a URL.");
      setStatus("error");
      return;
    }

    const validationError = validateUrl(trimmed);
    if (validationError) {
      setErrorMessage(validationError);
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      // Simulate small delay so users see loading state
      await new Promise<void>((resolve) => setTimeout(resolve, 300));

      const track = parseUserSubmittedUrl(trimmed);
      addToQueue(track);
      setLastAdded(track);
      setStatus("success");
      setUrl("");
      onTrackAdded?.(track);

      // Reset to idle after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add track. Try again.";
      setErrorMessage(message);
      setStatus("error");
    }
  }

  return (
    <div className="rounded-xl bg-zinc-900/80 border border-zinc-700/50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Link2 size={14} className="text-purple-400" />
        <h4 className="text-white text-sm font-semibold">Add Your Own Music</h4>
      </div>
      <p className="text-zinc-500 text-xs leading-relaxed">
        Paste any Internet Archive URL, direct audio link, or stream URL to add
        it to the jukebox.
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="https://archive.org/details/..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
            aria-label="Music URL to add"
            aria-describedby={
              status === "error" ? "add-track-error" : undefined
            }
            disabled={status === "loading"}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={status === "loading" || !url.trim()}
            className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-1.5 text-sm font-medium"
            aria-label="Add track to jukebox"
          >
            {status === "loading" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Add
          </button>
        </div>

        {/* Error state */}
        {status === "error" && (
          <div
            id="add-track-error"
            className="flex items-start gap-1.5 text-red-400 text-xs"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle size={12} className="mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success state */}
        {status === "success" && lastAdded && (
          <div
            className="flex items-center gap-1.5 text-green-400 text-xs"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={12} className="shrink-0" />
            <span>
              &quot;{lastAdded.title}&quot; added to queue!
            </span>
          </div>
        )}
      </form>

      <p className="text-zinc-600 text-xs">
        Supported: Internet Archive, direct MP3/OGG/FLAC links, radio streams
      </p>
    </div>
  );
}
