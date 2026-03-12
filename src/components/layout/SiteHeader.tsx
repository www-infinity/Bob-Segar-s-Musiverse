"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Music2,
  Video,
  Image,
  Radio,
  Search,
  Database,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import GameHUD from "@/components/ui/GameHUD";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: <Radio size={16} /> },
  { href: "/jukebox", label: "Jukebox", icon: <Music2 size={16} /> },
  { href: "/concerts", label: "Concerts", icon: <Video size={16} /> },
  { href: "/videos", label: "Videos", icon: <Video size={16} /> },
  { href: "/gallery", label: "Gallery", icon: <Image size={16} /> },
  { href: "/search", label: "Search", icon: <Search size={16} /> },
  { href: "/database", label: "∞ DB", icon: <Database size={16} /> },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="Bob Seger's Musiverse - Home"
          >
            <span className="text-2xl" aria-hidden="true">🎸</span>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-white font-bold text-sm group-hover:text-orange-400 transition-colors">
                Bob Seger&apos;s
              </span>
              <span className="text-orange-400 font-bold text-xs tracking-widest uppercase">
                Musiverse
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-orange-500/20 text-orange-400"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side: Game HUD compact + mobile menu */}
          <div className="flex items-center gap-2">
            <GameHUD compact />

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-3 space-y-1"
          aria-label="Mobile navigation"
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-orange-500/20 text-orange-400"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
