import Link from "next/link";
import { Twitter, Github, ExternalLink } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer
      className="border-t border-zinc-800 bg-zinc-950 mt-auto"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎸</span>
              <span className="text-white font-bold">Bob Seger&apos;s Musiverse</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              The ultimate destination for Bob Seger fans. Powered by the
              Internet Archive.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Explore</h3>
            <nav aria-label="Footer navigation" className="space-y-2">
              {[
                { href: "/jukebox", label: "Jukebox" },
                { href: "/concerts", label: "Live Concerts" },
                { href: "/videos", label: "Videos" },
                { href: "/gallery", label: "Photo Gallery" },
                { href: "/search", label: "Archive Search" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-zinc-500 text-sm hover:text-orange-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">
              Bob Seger Community
            </h3>
            <div className="space-y-2">
              <a
                href="https://twitter.com/search?q=%23BobSeger&src=typed_query&f=live"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-zinc-500 text-sm hover:text-[#1d9bf0] transition-colors"
                aria-label="Bob Seger community on Twitter"
              >
                <Twitter size={14} />
                #BobSeger on Twitter
              </a>
              <a
                href="https://archive.org/search?query=bob+seger&mediatype=audio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-zinc-500 text-sm hover:text-orange-400 transition-colors"
                aria-label="Bob Seger audio on Internet Archive"
              >
                <ExternalLink size={14} />
                Internet Archive
              </a>
              <a
                href="https://archive.org/details/bob-seger-ebbets-field-denver-co-1974-kbpi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-zinc-500 text-sm hover:text-orange-400 transition-colors"
                aria-label="Ebbets Field 1974 concert archive"
              >
                <ExternalLink size={14} />
                Ebbets Field 1974 Concert
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-zinc-600 text-xs">
          <p>© 2024 Musiverse · For fans, by fans · Non-commercial</p>
          <p>
            Music streamed from{" "}
            <a
              href="https://archive.org"
              className="text-orange-500 hover:text-orange-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              Internet Archive
            </a>{" "}
            · Free to use
          </p>
        </div>
      </div>
    </footer>
  );
}
