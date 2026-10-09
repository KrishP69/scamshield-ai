"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isAudioMuted, toggleAudioMuted, playCyberHover } from "@/lib/audio";

interface AudioToggleProps {
  className?: string;
  compact?: boolean;
}

export function AudioToggle({ className = "", compact = false }: AudioToggleProps) {
  const [muted, setMuted] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    setMuted(isAudioMuted());

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ muted: boolean }>;
      if (customEvent.detail) {
        setMuted(customEvent.detail.muted);
      }
    };

    window.addEventListener("scamshield-audio-toggle", handleSync);
    return () => window.removeEventListener("scamshield-audio-toggle", handleSync);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-lg bg-paper-200/50 dark:bg-ink-800/50 ${className}`} />
    );
  }

  const handleToggle = () => {
    const nextMuted = toggleAudioMuted();
    setMuted(nextMuted);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      onMouseEnter={playCyberHover}
      className={`relative inline-flex items-center justify-center rounded-xl transition-all ${
        compact
          ? "p-1.5 text-xs text-ink/70 dark:text-paper/70 hover:text-ultramarine dark:hover:text-cyan-400"
          : "p-2 bg-paper-100 dark:bg-ink-900 border border-ink/10 dark:border-paper/10 text-ink dark:text-paper hover:border-ultramarine dark:hover:border-cyan-400 shadow-sm hover:shadow"
      } ${className}`}
      aria-label={muted ? "Unmute cyber sound effects" : "Mute cyber sound effects"}
      title={muted ? "Cyber Sound Effects: MUTED (Click to enable)" : "Cyber Sound Effects: ACTIVE (Click to mute)"}
    >
      {muted ? (
        <VolumeX className="w-4 h-4 text-rose-500 transition-transform hover:scale-110" />
      ) : (
        <div className="relative flex items-center justify-center">
          <Volume2 className="w-4 h-4 text-ultramarine dark:text-cyan-400 transition-transform hover:scale-110" />
          <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        </div>
      )}
    </button>
  );
}
