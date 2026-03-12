"use client";

import { Twitter, Facebook, Link2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { Track } from "@/types/music";

interface SocialShareProps {
  track?: Track | null;
  pageTitle?: string;
  pageUrl?: string;
}

export default function SocialShare({
  track,
  pageTitle = "Bob Seger's Musiverse",
  pageUrl,
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    pageUrl ??
    (typeof window !== "undefined" ? window.location.href : "https://musiverse.app");

  const shareText = track
    ? `🎸 Listening to "${track.title}" by ${track.artist} on Bob Seger's Musiverse!`
    : `🎸 Explore Bob Seger's music history, live concerts, and the ultimate classic rock jukebox!`;

  const twitterUrl = new URL("https://twitter.com/intent/tweet");
  twitterUrl.searchParams.set("text", shareText);
  twitterUrl.searchParams.set("url", shareUrl);
  twitterUrl.searchParams.set("hashtags", "BobSeger,ClassicRock,Musiverse");

  const facebookUrl = new URL("https://www.facebook.com/sharer/sharer.php");
  facebookUrl.searchParams.set("u", shareUrl);
  facebookUrl.searchParams.set("quote", shareText);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        `${shareText}\n${shareUrl}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API not available
      const el = document.createElement("textarea");
      el.value = `${shareText}\n${shareUrl}`;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const buttonBase =
    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 active:scale-95";

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-label="Social sharing options"
    >
      <span className="text-zinc-500 text-xs">Share:</span>

      {/* Twitter / X */}
      <a
        href={twitterUrl.toString()}
        target="_blank"
        rel="noopener noreferrer"
        className={`${buttonBase} bg-[#1d9bf0]/20 text-[#1d9bf0] hover:bg-[#1d9bf0]/30`}
        aria-label="Share on X (Twitter)"
      >
        <Twitter size={13} fill="currentColor" />
        Twitter
      </a>

      {/* Facebook */}
      <a
        href={facebookUrl.toString()}
        target="_blank"
        rel="noopener noreferrer"
        className={`${buttonBase} bg-[#1877f2]/20 text-[#1877f2] hover:bg-[#1877f2]/30`}
        aria-label="Share on Facebook"
      >
        <Facebook size={13} fill="currentColor" />
        Facebook
      </a>

      {/* Fan Club */}
      <a
        href="https://twitter.com/search?q=%23BobSeger&src=typed_query&f=live"
        target="_blank"
        rel="noopener noreferrer"
        className={`${buttonBase} bg-orange-500/20 text-orange-400 hover:bg-orange-500/30`}
        aria-label="View Bob Seger fan community on Twitter"
      >
        <span className="text-xs">🎸</span>
        Fan Club
      </a>

      {/* Copy Link */}
      <button
        onClick={copyLink}
        className={`${buttonBase} ${
          copied
            ? "bg-green-500/20 text-green-400"
            : "bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700"
        }`}
        aria-label={copied ? "Link copied!" : "Copy link to clipboard"}
        aria-pressed={copied}
      >
        {copied ? (
          <CheckCircle2 size={13} />
        ) : (
          <Link2 size={13} />
        )}
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}
