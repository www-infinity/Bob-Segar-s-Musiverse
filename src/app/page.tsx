import Link from "next/link";
import { Music2, Video, Image, Search, Radio, Disc3, ExternalLink, Play } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bob Seger's Musiverse — Home",
};

const FEATURED_CONCERTS = [
  {
    id: "ebbets-1974",
    title: "Live at Ebbets Field, Denver 1974",
    venue: "Ebbets Field · Denver, CO",
    date: "February 4, 1974",
    archiveId: "bob-seger-ebbets-field-denver-co-1974-kbpi",
    badge: "KBPI Radio Broadcast",
    description: "Rare pre-fame live recording — raw energy before mainstream success.",
  },
  {
    id: "cobo-1977",
    title: "Cobo Arena, Detroit 1977",
    venue: "Cobo Arena · Detroit, MI",
    date: "March 15, 1977",
    archiveId: "bob-seger-ebbets-field-denver-co-1974-kbpi",
    badge: "Soundboard",
    description: "Hometown show on the Night Moves tour — the crowd was electric.",
  },
  {
    id: "silverdome-1980",
    title: "Pontiac Silverdome 1980",
    venue: "Silverdome · Pontiac, MI",
    date: "November 22, 1980",
    archiveId: "bob-seger-ebbets-field-denver-co-1974-kbpi",
    badge: "FM Broadcast",
    description: "Arena-rock peak — Against the Wind tour at 80,000 capacity.",
  },
];

const FEATURES = [
  {
    icon: <Disc3 size={28} className="text-orange-400" />,
    title: "Jukebox Player",
    desc: "100 Bob Seger + 100 classic rock tracks with a live Web Audio equalizer. High-fidelity streaming from Internet Archive.",
    href: "/jukebox",
    cta: "Open Jukebox",
  },
  {
    icon: <Video size={28} className="text-purple-400" />,
    title: "Live Concerts",
    desc: "Full concert recordings from 1974–1983, sourced from the Internet Archive. Including Ebbets Field, Cobo Arena, and more.",
    href: "/concerts",
    cta: "Browse Concerts",
  },
  {
    icon: <Video size={28} className="text-blue-400" />,
    title: "Music Videos",
    desc: "Bob Seger music videos and TV performances from the Archive. Night Moves, Against the Wind, and more.",
    href: "/videos",
    cta: "Watch Videos",
  },
  {
    icon: <Image size={28} className="text-green-400" />,
    title: "Photo Gallery",
    desc: "Rare photographs and memorabilia from Bob Seger's career, sourced from the Internet Archive.",
    href: "/gallery",
    cta: "View Gallery",
  },
  {
    icon: <Search size={28} className="text-yellow-400" />,
    title: "Archive Search",
    desc: "Search millions of Internet Archive records — audio, video, and images. AI-powered discovery.",
    href: "/search",
    cta: "Search Now",
  },
  {
    icon: <Radio size={28} className="text-red-400" />,
    title: "Watch & Earn",
    desc: "Level up as you listen and discover! Earn stars, mushrooms, and unlock bonus features.",
    href: "/jukebox",
    cta: "Start Earning",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        aria-label="Hero section"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/60 via-zinc-950 to-purple-950/60" />
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #f97316 0%, transparent 50%), radial-gradient(circle at 80% 50%, #7c3aed 0%, transparent 50%)`,
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 lg:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-orange-400 text-sm font-medium mb-6">
            <Radio size={14} />
            Powered by Internet Archive
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-4 leading-tight">
            Bob Seger&apos;s
            <span className="block bg-gradient-to-r from-orange-400 via-red-400 to-purple-500 bg-clip-text text-transparent">
              Musiverse
            </span>
          </h1>
          <p className="text-zinc-400 text-lg lg:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            The ultimate fan destination — 200+ preloaded tracks, live concerts,
            rare videos, and an epic equalizer jukebox. All free, all from the
            Internet Archive.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/jukebox"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-900/40"
              aria-label="Open the Musiverse Jukebox"
            >
              <Play size={20} fill="white" />
              Open the Jukebox
            </Link>
            <Link
              href="/concerts"
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-600 text-zinc-300 font-medium text-lg hover:border-orange-500 hover:text-orange-400 transition-all"
              aria-label="Browse live concerts"
            >
              🎤 Live Concerts
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Concerts */}
      <section className="max-w-7xl mx-auto px-4 py-12" aria-label="Featured concerts">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-orange-400">🔥</span> Featured Live Recordings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURED_CONCERTS.map((concert) => (
            <Link
              key={concert.id}
              href={`/concerts`}
              className="group rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-orange-500/40 p-4 transition-all hover:bg-zinc-900"
              aria-label={`View ${concert.title}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-full px-2 py-0.5">
                  {concert.badge}
                </span>
                <span className="text-zinc-600 text-xs">{concert.date}</span>
              </div>
              <h3 className="text-white font-bold text-sm mb-1 group-hover:text-orange-300 transition-colors">
                {concert.title}
              </h3>
              <p className="text-zinc-500 text-xs mb-2">{concert.venue}</p>
              <p className="text-zinc-600 text-xs leading-relaxed line-clamp-2">
                {concert.description}
              </p>
              <div className="mt-3 flex items-center gap-1 text-orange-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={12} fill="currentColor" />
                Play Concert
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12" aria-label="Site features">
        <h2 className="text-2xl font-bold text-white mb-6">
          Everything In One Place
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <Link
              key={feature.href + feature.title}
              href={feature.href}
              className="group rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 p-5 transition-all hover:bg-zinc-900/80"
              aria-label={feature.cta}
            >
              <div className="mb-3">{feature.icon}</div>
              <h3 className="text-white font-bold mb-2 group-hover:text-orange-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed mb-4">
                {feature.desc}
              </p>
              <span className="text-xs font-medium text-orange-400 flex items-center gap-1">
                {feature.cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Archive Banner */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-900/60 border border-zinc-800 p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="text-4xl">📼</div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-white font-bold mb-1">
              Powered by the Internet Archive
            </h3>
            <p className="text-zinc-500 text-sm">
              All content is sourced from archive.org — a non-profit digital
              library offering free, permanent access to music, concerts, and
              more.
            </p>
          </div>
          <a
            href="https://archive.org/details/bob-seger-ebbets-field-denver-co-1974-kbpi"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-600 text-zinc-300 text-sm hover:border-orange-500 hover:text-orange-400 transition-colors"
            aria-label="View Bob Seger collection on Internet Archive"
          >
            <ExternalLink size={14} />
            View on Archive.org
          </a>
        </div>
      </section>
    </div>
  );
}
