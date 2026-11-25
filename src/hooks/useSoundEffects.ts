"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SOUND_STORAGE_KEY = "jal_portfolio_sound";

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function useSoundEffects() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  const ensureContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;

    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Pre-build a 1-second mono white-noise buffer for low-overhead percussive bursts
      const sampleRate = ctx.sampleRate;
      const buffer = ctx.createBuffer(1, sampleRate, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < sampleRate; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noiseBufferRef.current = buffer;
    }

    return audioCtxRef.current;
  }, []);

  // Load persisted preference & unlock AudioContext on first user gesture
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SOUND_STORAGE_KEY);
      if (saved === "off") {
        soundEnabledRef.current = false;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSoundEnabled(false);
      }
    } catch {
      // Ignore storage failures
    }

    const unlock = () => {
      const ctx = ensureContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
    };

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock, { passive: true });
    window.addEventListener("click", unlock, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("click", unlock);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
        noiseBufferRef.current = null;
      }
    };
  }, [ensureContext]);

  const playKeystroke = useCallback(
    (isSpace = false) => {
      if (!soundEnabledRef.current) return;
      const ctx = ensureContext();
      if (!ctx || ctx.state !== "running" || !noiseBufferRef.current) return;

      const now = ctx.currentTime;

      // 1. Soft 20ms bandpass-filtered white noise transient
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBufferRef.current;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(
        isSpace ? randomRange(620, 760) : randomRange(1180, 1540),
        now
      );
      filter.Q.setValueAtTime(isSpace ? 1.5 : 1.9, now);

      const noiseGain = ctx.createGain();
      const noisePeak = (isSpace ? 0.04 : 0.045) * randomRange(0.85, 1.15);
      noiseGain.gain.setValueAtTime(0.0001, now);
      noiseGain.gain.linearRampToValueAtTime(noisePeak, now + 0.002);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now, randomRange(0, 0.5), 0.025);

      // 2. Warm sine body thump (130Hz -> 60Hz, deeper for spacebar)
      const osc = ctx.createOscillator();
      osc.type = "sine";
      const startFreq = isSpace
        ? randomRange(88, 102)
        : 130 * randomRange(0.94, 1.07);
      const endFreq = isSpace ? 44 : 60;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.026);

      const oscGain = ctx.createGain();
      const oscPeak = (isSpace ? 0.055 : 0.04) * randomRange(0.88, 1.12);
      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.linearRampToValueAtTime(oscPeak, now + 0.002);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    },
    [ensureContext]
  );

  const playHoverTick = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = ensureContext();
    if (!ctx || ctx.state !== "running" || !noiseBufferRef.current) return;

    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBufferRef.current;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(randomRange(3200, 3800), now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.014 * randomRange(0.85, 1.15), now + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.007);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now, randomRange(0, 0.5), 0.01);
  }, [ensureContext]);

  const playClick = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = ensureContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (noiseBufferRef.current) {
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBufferRef.current;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(randomRange(1650, 1950), now);
      filter.Q.setValueAtTime(2.2, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, now);
      noiseGain.gain.linearRampToValueAtTime(0.042, now + 0.0015);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now, randomRange(0, 0.5), 0.016);
    }

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(randomRange(175, 195), now);
    osc.frequency.exponentialRampToValueAtTime(68, now + 0.025);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.0001, now);
    oscGain.gain.linearRampToValueAtTime(0.048, now + 0.0015);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }, [ensureContext]);

  const toggleSound = useCallback(() => {
    const next = !soundEnabledRef.current;
    soundEnabledRef.current = next;
    setSoundEnabled(next);
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, next ? "on" : "off");
    } catch {
      // Ignore storage failures
    }
    if (next) {
      const ctx = ensureContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      playClick();
    }
  }, [ensureContext, playClick]);

  return {
    soundEnabled,
    toggleSound,
    playKeystroke,
    playHoverTick,
    playClick,
  };
}
