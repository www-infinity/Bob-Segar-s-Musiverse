import type { Metadata } from "next";
import JukeboxClient from "@/components/player/JukeboxClient";

export const metadata: Metadata = {
  title: "Jukebox — 200 Preloaded Tracks",
  description:
    "Stream 100 Bob Seger classics and 100 70s/80s rock anthems with a live animated equalizer. Powered by Internet Archive.",
};

export default function JukeboxPage() {
  return <JukeboxClient />;
}
