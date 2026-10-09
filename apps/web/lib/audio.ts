"use client";

/**
 * ScamShield AI - Cyber Audio Synthesis Engine
 * Pure Web Audio API programmatic sound synthesizer.
 * Zero external audio files, 0ms latency, 100% reliable.
 */

let audioCtx: AudioContext | null = null;
let isMuted: boolean = false;

// Initialize mute state from localStorage if available in browser
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("scamshield_audio_muted");
    if (saved !== null) {
      isMuted = saved === "true";
    }
  } catch {
    // Ignore storage errors
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isAudioMuted(): boolean {
  return isMuted;
}

export function setAudioMuted(muted: boolean): void {
  isMuted = muted;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("scamshield_audio_muted", String(muted));
      window.dispatchEvent(new CustomEvent("scamshield-audio-toggle", { detail: { muted } }));
    } catch {
      // Ignore storage errors
    }
  }
}

export function toggleAudioMuted(): boolean {
  const next = !isMuted;
  setAudioMuted(next);
  if (!next) {
    playCyberClick();
  }
  return next;
}

/**
 * 1. Subtle Cyber Hover Micro-Blip
 * 1200Hz -> 1700Hz sine wave, 12ms duration, whisper volume.
 */
export function playCyberHover(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(1700, now + 0.012);

    gain.gain.setValueAtTime(0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.015);
  } catch {
    // Fail gracefully
  }
}

/**
 * 2. Crisp Tactile Confirmation Click
 * High-tech glass tactile tap (600Hz -> 1000Hz).
 */
export function playCyberClick(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.025);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  } catch {
    // Fail gracefully
  }
}

/**
 * 3. Sonar Radar Ping
 * Harmonic 880Hz / 1320Hz ping with an exponential acoustic decay tail.
 */
export function playRadarPing(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Fundamental Tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(850, now + 0.6);

    gain1.gain.setValueAtTime(0.05, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Harmonic Overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1760, now);

    gain2.gain.setValueAtTime(0.015, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.65);
    osc2.stop(now + 0.35);
  } catch {
    // Fail gracefully
  }
}

/**
 * 4. Critical Threat Warning Beep
 * Dual alert pulses (440Hz -> 880Hz).
 */
export function playThreatAlert(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(880, now + 0.08);
    osc.frequency.setValueAtTime(440, now + 0.16);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  } catch {
    // Fail gracefully
  }
}

/**
 * 5. Clean Verification Chime
 * Harmonic C-Major Triad (523.25Hz, 659.25Hz, 783.99Hz)
 */
export function playCleanChime(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.05;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.035, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.42);
    });
  } catch {
    // Fail gracefully
  }
}

/**
 * 6. Smooth Scroll Phase Transition Whoosh
 * Low-frequency filtered harmonic sweep.
 */
export function playPhaseWhoosh(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.15);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    // Fail gracefully
  }
}
