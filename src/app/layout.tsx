import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { PlayerProvider } from "@/components/player/PlayerContext";

export const metadata: Metadata = {
  title: {
    default: "Bob Seger's Musiverse — Classic Rock Jukebox & Archive",
    template: "%s | Bob Seger's Musiverse",
  },
  description:
    "The ultimate Bob Seger fan site. 100 preloaded songs, live concerts, videos, and an epic jukebox with 70s/80s classic rock — all powered by Internet Archive.",
  keywords: [
    "Bob Seger",
    "Silver Bullet Band",
    "Night Moves",
    "Old Time Rock and Roll",
    "Classic Rock",
    "Internet Archive",
    "Jukebox",
    "Live Concerts",
  ],
  openGraph: {
    title: "Bob Seger's Musiverse",
    description: "The ultimate Bob Seger fan site with live concerts, jukebox, and archive.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-zinc-950 text-zinc-100 flex flex-col min-h-screen font-sans">
        <PlayerProvider>
          <SiteHeader />
          <main className="flex-1" id="main-content" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter />
        </PlayerProvider>
      </body>
    </html>
  );
}
