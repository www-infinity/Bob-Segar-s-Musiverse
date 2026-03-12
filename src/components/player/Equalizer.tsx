"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePlayer } from "./PlayerContext";

// ─── Canvas-based animated equalizer visualizer ───────────────────────────────
// Uses Web Audio API AnalyserNode + requestAnimationFrame

interface EqualizerProps {
  className?: string;
  barCount?: number;
  colorStart?: string;
  colorEnd?: string;
  backgroundColor?: string;
}

export default function Equalizer({
  className = "",
  barCount = 64,
  colorStart = "#f97316",
  colorEnd = "#7c3aed",
  backgroundColor = "transparent",
}: EqualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const { state, audioRef } = usePlayer();

  // ─── Set up Web Audio API ─────────────────────────────────────────────────
  const setupAudioContext = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audioContextRef.current) return; // Already set up

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const source = ctx.createMediaElementSource(audio);
      sourceRef.current = source;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
      dataArrayRef.current = dataArray;

      source.connect(analyser);
      analyser.connect(ctx.destination);
    } catch {
      // Web Audio API not available — equalizer will show static animation
    }
  }, [audioRef]);

  // ─── Resume AudioContext on user interaction (browser autoplay policy) ────
  useEffect(() => {
    if (state.status === "playing" && audioContextRef.current) {
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().catch(() => {
          // Context resume failed — continue with static animation
        });
      }
    }
  }, [state.status]);

  // ─── Initialize on first play ─────────────────────────────────────────────
  useEffect(() => {
    if (state.status === "playing" || state.status === "loading") {
      setupAudioContext();
    }
  }, [state.status, setupAudioContext]);

  // ─── Animation Loop ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;

    function interpolateColor(
      color1: string,
      color2: string,
      ratio: number
    ): string {
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1] ?? "0", 16),
              g: parseInt(result[2] ?? "0", 16),
              b: parseInt(result[3] ?? "0", 16),
            }
          : { r: 0, g: 0, b: 0 };
      };
      const c1 = hexToRgb(color1);
      const c2 = hexToRgb(color2);
      const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
      const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
      const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
      return `rgb(${r},${g},${b})`;
    }

    function draw() {
      if (!canvas || !ctx) return;

      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      if (canvas.width !== W) canvas.width = W;
      if (canvas.height !== H) canvas.height = H;

      ctx.clearRect(0, 0, W, H);

      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, W, H);
      }

      const isPlaying = state.status === "playing";
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;

      const barWidth = W / barCount - 1;
      let bars: number[];

      if (analyser && dataArray && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
        // Resample to barCount
        const step = Math.floor(dataArray.length / barCount);
        bars = Array.from({ length: barCount }, (_, i) => {
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += dataArray[i * step + j] ?? 0;
          }
          return (sum / step / 255) * H;
        });
      } else {
        // Idle animation — gentle wave
        frame++;
        bars = Array.from({ length: barCount }, (_, i) => {
          const wave =
            Math.sin((i / barCount) * Math.PI * 2 + frame * 0.05) * 0.3 +
            0.5;
          const noise = Math.sin(i * 2.7 + frame * 0.03) * 0.1;
          const idle = isPlaying ? 1 : 0.15;
          return (wave + noise) * H * idle;
        });
      }

      bars.forEach((barH, i) => {
        const x = i * (barWidth + 1);
        const y = H - barH;
        const ratio = i / barCount;
        const color = interpolateColor(colorStart, colorEnd, ratio);

        // Main bar
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barH);

        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillRect(x, y, barWidth, 2);
        ctx.shadowBlur = 0;

        // Reflection
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = color;
        ctx.fillRect(x, H, barWidth, -barH * 0.4);
        ctx.globalAlpha = 1;
      });

      animationIdRef.current = requestAnimationFrame(draw);
    }

    animationIdRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [state.status, barCount, colorStart, colorEnd, backgroundColor]);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => undefined);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full ${className}`}
      aria-label="Audio equalizer visualizer"
      role="img"
    />
  );
}
