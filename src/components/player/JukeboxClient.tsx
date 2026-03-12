"use client";

import { useState } from "react";
import { Music, Radio, Disc3, Sliders } from "lucide-react";
import PlayerControls from "@/components/player/PlayerControls";
import Equalizer from "@/components/player/Equalizer";
import TrackList from "@/components/player/TrackList";
import AddTrackForm from "@/components/ui/AddTrackForm";
import SocialShare from "@/components/ui/SocialShare";
import GameHUD from "@/components/ui/GameHUD";
import { usePlayer } from "@/components/player/PlayerContext";
import { BOB_SEGER_TRACKS, CLASSIC_ROCK_TRACKS } from "@/lib/preloaded-tracks";
import { triggerEarnEvent } from "@/components/ui/GameHUD";

type JukeboxTab = "bob-seger" | "classic-rock" | "queue" | "equalizer";

export default function JukeboxClient() {
  const [activeTab, setActiveTab] = useState<JukeboxTab>("bob-seger");
  const [showEQBands, setShowEQBands] = useState(false);
  const { state, setQueue, setEQBand } = usePlayer();

  const EQ_BAND_LABELS = [
    "32Hz", "64Hz", "125Hz", "250Hz", "500Hz",
    "1kHz", "2kHz", "4kHz", "8kHz", "16kHz",
  ];

  function loadBobSegerPlaylist() {
    setQueue(BOB_SEGER_TRACKS);
    triggerEarnEvent("listen");
  }

  function loadClassicRockPlaylist() {
    setQueue(CLASSIC_ROCK_TRACKS);
    triggerEarnEvent("listen");
  }

  const tabs: { id: JukeboxTab; label: string; icon: React.ReactNode }[] = [
    { id: "bob-seger", label: "Bob Seger", icon: <Disc3 size={14} /> },
    { id: "classic-rock", label: "Classic Rock", icon: <Radio size={14} /> },
    { id: "queue", label: "Queue", icon: <Music size={14} /> },
    { id: "equalizer", label: "EQ", icon: <Sliders size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-[#1a0a2e] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 lg:py-10">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent">
            🎸 The Musiverse Jukebox
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">
            100 Bob Seger classics · 100 rock anthems · All from Internet Archive
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Player Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Equalizer Visualizer */}
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 overflow-hidden">
              <Equalizer
                className="h-28 rounded-lg"
                barCount={48}
                colorStart="#f97316"
                colorEnd="#7c3aed"
              />
              <div className="mt-4">
                <PlayerControls />
              </div>
            </div>

            {/* Social Share */}
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
              <SocialShare track={state.currentTrack} />
            </div>

            {/* Game HUD */}
            <GameHUD />
          </div>

          {/* Right: Track Browser */}
          <div className="lg:col-span-2 space-y-4">
            {/* Playlist Quick-Load Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={loadBobSegerPlaylist}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-900/40"
                aria-label="Load all 100 Bob Seger tracks"
              >
                <Disc3 size={14} />
                Load Bob Seger (100 tracks)
              </button>
              <button
                onClick={loadClassicRockPlaylist}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-700 hover:bg-purple-600 text-white text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/40"
                aria-label="Load all 100 classic rock tracks"
              >
                <Radio size={14} />
                Load Classic Rock (100 tracks)
              </button>
            </div>

            {/* Tab Navigation */}
            <div
              className="flex gap-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800"
              role="tablist"
              aria-label="Jukebox content tabs"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`tabpanel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-orange-600 to-purple-700 text-white shadow-md"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Panels */}
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
              {activeTab === "bob-seger" && (
                <div
                  id="tabpanel-bob-seger"
                  role="tabpanel"
                  aria-label="Bob Seger tracks"
                >
                  <TrackList
                    tracks={BOB_SEGER_TRACKS}
                    title="Bob Seger & Silver Bullet Band"
                    maxHeight="500px"
                  />
                </div>
              )}

              {activeTab === "classic-rock" && (
                <div
                  id="tabpanel-classic-rock"
                  role="tabpanel"
                  aria-label="Classic rock tracks"
                >
                  <TrackList
                    tracks={CLASSIC_ROCK_TRACKS}
                    title="Classic Rock Anthems"
                    maxHeight="500px"
                  />
                </div>
              )}

              {activeTab === "queue" && (
                <div
                  id="tabpanel-queue"
                  role="tabpanel"
                  aria-label="Current queue"
                >
                  <TrackList
                    title="Current Queue"
                    maxHeight="400px"
                  />
                  <div className="mt-4 border-t border-zinc-800 pt-4">
                    <AddTrackForm
                      onTrackAdded={() => triggerEarnEvent("add_track")}
                    />
                  </div>
                </div>
              )}

              {activeTab === "equalizer" && (
                <div
                  id="tabpanel-equalizer"
                  role="tabpanel"
                  aria-label="Equalizer settings"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <Sliders size={16} className="text-orange-400" />
                        10-Band Equalizer
                      </h3>
                      <button
                        onClick={() => {
                          for (let i = 0; i < 10; i++) setEQBand(i, 50);
                        }}
                        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        Reset All
                      </button>
                    </div>

                    <p className="text-zinc-500 text-xs">
                      Adjust frequency bands to shape your sound. Center (50) is
                      flat — drag up to boost, down to cut.
                    </p>

                    {/* EQ Bands */}
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {state.equalizerBands.map((value, i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center gap-2"
                        >
                          {/* Vertical slider */}
                          <div className="relative h-32 flex items-center justify-center">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={value}
                              onChange={(e) =>
                                setEQBand(i, parseInt(e.target.value, 10))
                              }
                              className="appearance-none w-full accent-orange-500 cursor-pointer"
                              style={{
                                writingMode: "vertical-lr",
                                direction: "rtl",
                                height: "120px",
                              }}
                              aria-label={`${EQ_BAND_LABELS[i]} equalizer band: ${value}`}
                            />
                          </div>
                          {/* Value */}
                          <span
                            className={`text-xs tabular-nums font-mono ${
                              value > 60
                                ? "text-orange-400"
                                : value < 40
                                ? "text-blue-400"
                                : "text-zinc-500"
                            }`}
                          >
                            {value > 50 ? `+${value - 50}` : value < 50 ? `${value - 50}` : "0"}
                          </span>
                          {/* Frequency label */}
                          <span className="text-zinc-600 text-xs text-center leading-tight">
                            {EQ_BAND_LABELS[i]}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Presets */}
                    <div className="border-t border-zinc-800 pt-4">
                      <p className="text-zinc-500 text-xs mb-2">Presets:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          {
                            name: "Flat",
                            bands: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
                          },
                          {
                            name: "Bass Boost",
                            bands: [80, 75, 65, 55, 50, 48, 46, 44, 42, 40],
                          },
                          {
                            name: "Rock",
                            bands: [70, 65, 55, 48, 50, 52, 58, 65, 68, 70],
                          },
                          {
                            name: "Vocal",
                            bands: [40, 42, 50, 62, 68, 68, 65, 58, 52, 48],
                          },
                          {
                            name: "Live",
                            bands: [55, 52, 50, 58, 65, 65, 58, 50, 55, 58],
                          },
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => {
                              preset.bands.forEach((v, i) => setEQBand(i, v));
                            }}
                            className="px-3 py-1.5 text-xs rounded-full border border-zinc-700 text-zinc-400 hover:border-orange-500 hover:text-orange-400 transition-colors"
                            aria-label={`Apply ${preset.name} EQ preset`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
