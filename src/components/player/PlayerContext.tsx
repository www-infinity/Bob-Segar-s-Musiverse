"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import type { Track, PlayerState, PlayerStatus } from "@/types/music";
import { ALL_TRACKS } from "@/lib/preloaded-tracks";

// ─── Action Types ─────────────────────────────────────────────────────────────

type PlayerAction =
  | { type: "LOAD_TRACK"; track: Track }
  | { type: "SET_STATUS"; status: PlayerStatus }
  | { type: "SET_TIME"; currentTime: number; duration: number }
  | { type: "SET_VOLUME"; volume: number }
  | { type: "TOGGLE_MUTE" }
  | { type: "TOGGLE_SHUFFLE" }
  | { type: "SET_REPEAT"; mode: PlayerState["repeatMode"] }
  | { type: "SET_QUEUE"; queue: Track[] }
  | { type: "ADD_TO_QUEUE"; track: Track }
  | { type: "NEXT_TRACK" }
  | { type: "PREV_TRACK" }
  | { type: "SET_EQ_BAND"; bandIndex: number; value: number };

// ─── Context Interface ────────────────────────────────────────────────────────

interface PlayerContextValue {
  state: PlayerState;
  play: (track?: Track) => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: PlayerState["repeatMode"]) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  addToQueue: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
  setEQBand: (bandIndex: number, value: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const DEFAULT_EQ_BANDS = Array.from({ length: 10 }, () => 50);

const initialState: PlayerState = {
  currentTrack: null,
  queue: ALL_TRACKS.slice(0, 50),
  status: "idle",
  currentTime: 0,
  duration: 0,
  volume: 80,
  isMuted: false,
  isShuffled: false,
  repeatMode: "none",
  equalizerBands: DEFAULT_EQ_BANDS,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "LOAD_TRACK":
      return { ...state, currentTrack: action.track, status: "loading", currentTime: 0 };

    case "SET_STATUS":
      return { ...state, status: action.status };

    case "SET_TIME":
      return {
        ...state,
        currentTime: action.currentTime,
        duration: action.duration || state.duration,
      };

    case "SET_VOLUME":
      return { ...state, volume: action.volume, isMuted: action.volume === 0 };

    case "TOGGLE_MUTE":
      return { ...state, isMuted: !state.isMuted };

    case "TOGGLE_SHUFFLE":
      return { ...state, isShuffled: !state.isShuffled };

    case "SET_REPEAT":
      return { ...state, repeatMode: action.mode };

    case "SET_QUEUE":
      return { ...state, queue: action.queue };

    case "ADD_TO_QUEUE":
      return { ...state, queue: [...state.queue, action.track] };

    case "NEXT_TRACK": {
      if (!state.currentTrack || state.queue.length === 0) return state;
      const currentIndex = state.queue.findIndex(
        (t) => t.id === state.currentTrack?.id
      );
      let nextIndex: number;
      if (state.isShuffled) {
        nextIndex = Math.floor(Math.random() * state.queue.length);
      } else {
        nextIndex = (currentIndex + 1) % state.queue.length;
      }
      const nextTrack = state.queue[nextIndex];
      if (!nextTrack) return state;
      return { ...state, currentTrack: nextTrack, status: "loading", currentTime: 0 };
    }

    case "PREV_TRACK": {
      if (!state.currentTrack || state.queue.length === 0) return state;
      if (state.currentTime > 3) {
        // Restart current track if past 3 seconds
        return { ...state, currentTime: 0 };
      }
      const currentIndex = state.queue.findIndex(
        (t) => t.id === state.currentTrack?.id
      );
      const prevIndex =
        (currentIndex - 1 + state.queue.length) % state.queue.length;
      const prevTrack = state.queue[prevIndex];
      if (!prevTrack) return state;
      return { ...state, currentTrack: prevTrack, status: "loading", currentTime: 0 };
    }

    case "SET_EQ_BAND": {
      const newBands = [...state.equalizerBands];
      newBands[action.bandIndex] = action.value;
      return { ...state, equalizerBands: newBands };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync audio element with state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.currentTrack) {
      if (audio.src !== state.currentTrack.streamUrl) {
        audio.src = state.currentTrack.streamUrl;
        audio.load();
      }
    }
  }, [state.currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = state.isMuted ? 0 : state.volume / 100;
  }, [state.volume, state.isMuted]);

  // Audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      dispatch({
        type: "SET_TIME",
        currentTime: 0,
        duration: audio.duration,
      });
    };

    const onCanPlay = () => {
      dispatch({ type: "SET_STATUS", status: "playing" });
      audio.play().catch(() => {
        dispatch({ type: "SET_STATUS", status: "paused" });
      });
    };

    const onTimeUpdate = () => {
      dispatch({
        type: "SET_TIME",
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
      });
    };

    const onEnded = () => {
      if (state.repeatMode === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {
          dispatch({ type: "SET_STATUS", status: "paused" });
        });
      } else {
        dispatch({ type: "NEXT_TRACK" });
      }
    };

    const onError = () => {
      dispatch({ type: "SET_STATUS", status: "error" });
    };

    const onPause = () => {
      dispatch({ type: "SET_STATUS", status: "paused" });
    };

    const onPlay = () => {
      dispatch({ type: "SET_STATUS", status: "playing" });
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, [state.repeatMode]);

  const play = useCallback((track?: Track) => {
    if (track) {
      dispatch({ type: "LOAD_TRACK", track });
    } else {
      audioRef.current?.play().catch(() => {
        dispatch({ type: "SET_STATUS", status: "error" });
      });
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    dispatch({ type: "SET_STATUS", status: "paused" });
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {
      dispatch({ type: "SET_STATUS", status: "error" });
    });
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: "SET_VOLUME", volume });
  }, []);

  const toggleMute = useCallback(() => {
    dispatch({ type: "TOGGLE_MUTE" });
  }, []);

  const toggleShuffle = useCallback(() => {
    dispatch({ type: "TOGGLE_SHUFFLE" });
  }, []);

  const setRepeatMode = useCallback((mode: PlayerState["repeatMode"]) => {
    dispatch({ type: "SET_REPEAT", mode });
  }, []);

  const nextTrack = useCallback(() => {
    dispatch({ type: "NEXT_TRACK" });
  }, []);

  const prevTrack = useCallback(() => {
    dispatch({ type: "PREV_TRACK" });
  }, []);

  const addToQueue = useCallback((track: Track) => {
    dispatch({ type: "ADD_TO_QUEUE", track });
  }, []);

  const setQueue = useCallback((tracks: Track[]) => {
    dispatch({ type: "SET_QUEUE", queue: tracks });
  }, []);

  const setEQBand = useCallback((bandIndex: number, value: number) => {
    dispatch({ type: "SET_EQ_BAND", bandIndex, value });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        state,
        play,
        pause,
        resume,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        setRepeatMode,
        nextTrack,
        prevTrack,
        addToQueue,
        setQueue,
        setEQBand,
        audioRef,
      }}
    >
      <audio ref={audioRef} preload="metadata" style={{ display: "none" }} />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return ctx;
}
