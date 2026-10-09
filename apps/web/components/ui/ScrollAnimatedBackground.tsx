"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, ShieldCheck, Eye, Lock, Activity, ChevronUp } from "lucide-react";
import { playPhaseWhoosh, playRadarPing, playCyberHover, playCyberClick } from "@/lib/audio";
import { AudioToggle } from "./AudioToggle";

interface PhaseConfig {
  name: string;
  code: string;
  sectionId?: string;
  primaryColor: string;
  secondaryColor: string;
  glowRgba: string;
  bgImage: string;
  statusText: string;
  icon: any;
}

export const PHASES: PhaseConfig[] = [
  {
    name: "Neural Core Defense",
    code: "PHASE 01 // NEURAL RADAR",
    sectionId: "main-content",
    primaryColor: "#2F45FF",
    secondaryColor: "#00F0FF",
    glowRgba: "rgba(47, 69, 255, 0.4)",
    bgImage: "/assets/cyber_shield_radar.jpg",
    statusText: "98.4% SHIELD INTEGRITY &bull; 24x7 ACTIVE",
    icon: ShieldCheck,
  },
  {
    name: "Live Threat Interceptor",
    code: "PHASE 02 // THREAT RADAR",
    sectionId: "live-scanner",
    primaryColor: "#EF4444",
    secondaryColor: "#F97316",
    glowRgba: "rgba(239, 68, 68, 0.4)",
    bgImage: "/assets/phishing_threat_matrix.jpg",
    statusText: "CRITICAL PHISHING & HOMOGLYPHS BLOCKED",
    icon: ShieldAlert,
  },
  {
    name: "Forensic Screenshot Lab",
    code: "PHASE 03 // FORENSIC VISION",
    sectionId: "screenshot-lab",
    primaryColor: "#A855F7",
    secondaryColor: "#EC4899",
    glowRgba: "rgba(168, 85, 247, 0.4)",
    bgImage: "/assets/screenshot_forensics_lab.jpg",
    statusText: "50,000 DIAMONDS & CREDENTIAL TRAP DISARMED",
    icon: Eye,
  },
  {
    name: "Zero-Knowledge Passport",
    code: "PHASE 04 // ZK-SNARK VERIFY",
    sectionId: "trust-passport",
    primaryColor: "#10B981",
    secondaryColor: "#06B6D4",
    glowRgba: "rgba(16, 185, 129, 0.4)",
    bgImage: "/assets/trust_passport_core.jpg",
    statusText: "100% ZERO-KNOWLEDGE PROOF &bull; SHIELDED",
    icon: Lock,
  },
];

export function ScrollAnimatedBackground() {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [scrollY, setScrollY] = useState<number>(0);
  const [isClient, setIsClient] = useState<boolean>(false);

  const prevPhaseRef = React.useRef<number>(0);

  useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      const y = window.scrollY;
      setScrollY(y);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const progress = Math.min(Math.max(y / docHeight, 0), 1);
      setScrollProgress(progress);

      // 4 Continuous scroll stages across 0% to 100%
      let nextPhase = 0;
      if (progress < 0.22) {
        nextPhase = 0;
      } else if (progress < 0.50) {
        nextPhase = 1;
      } else if (progress < 0.75) {
        nextPhase = 2;
      } else {
        nextPhase = 3;
      }

      if (nextPhase !== prevPhaseRef.current) {
        prevPhaseRef.current = nextPhase;
        setCurrentPhaseIndex(nextPhase);
        playPhaseWhoosh();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activePhase = PHASES[currentPhaseIndex];
  const Icon = activePhase.icon;

  const scrollToPhase = (index: number) => {
    playRadarPing();
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const targetPercentages = [0, 0.32, 0.62, 0.88];
    window.scrollTo({
      top: targetPercentages[index] * docHeight,
      behavior: "smooth",
    });
  };

  if (!isClient) return null;

  return (
    <>
      {/* 1. Top Fixed Scroll Indicator Bar */}
      <div className="fixed top-0 inset-x-0 h-1.5 z-50 pointer-events-none bg-black/20">
        <div
          className="h-full transition-all duration-300 ease-out shadow-[0_0_12px_currentColor]"
          style={{
            width: `${Math.round(scrollProgress * 100)}%`,
            color: activePhase.secondaryColor,
            background: `linear-gradient(90deg, ${activePhase.primaryColor}, ${activePhase.secondaryColor})`,
          }}
        />
      </div>

      {/* 2. Full-Viewport Master Animated Background Layer */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-1000 ease-out"
        aria-hidden="true"
      >
        {/* Dynamic Rotating Aurora Gradient Mesh (Color shifts with active phase) */}
        <div
          className="absolute -top-1/4 -left-1/4 w-[160vw] h-[160vh] animate-aurora-spin opacity-35 dark:opacity-40 blur-3xl transition-all duration-1000 ease-in-out pointer-events-none"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${activePhase.primaryColor} 0%, ${activePhase.secondaryColor} 25%, transparent 65%)`,
          }}
        />

        {/* Secondary Opposite Aurora Glow */}
        <div
          className="absolute -bottom-1/4 -right-1/4 w-[140vw] h-[140vh] animate-aurora-spin opacity-25 dark:opacity-35 blur-3xl transition-all duration-1000 ease-in-out pointer-events-none [animation-direction:reverse]"
          style={{
            background: `radial-gradient(circle at 65% 65%, ${activePhase.secondaryColor} 0%, ${activePhase.primaryColor} 30%, transparent 60%)`,
          }}
        />

        {/* 4 Multi-Image Pre-Rendered Layers (Cross-fade smoothly on scroll) */}
        {PHASES.map((phase, idx) => {
          const isActive = currentPhaseIndex === idx;
          return (
            <div
              key={phase.bgImage}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                isActive
                  ? "opacity-20 sm:opacity-25 dark:opacity-35 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
              style={{
                transform: isActive
                  ? `translateY(${-scrollY * 0.04}px) scale(1.04)`
                  : undefined,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={phase.bgImage}
                alt={phase.name}
                className="w-full h-full object-cover filter blur-[1px] brightness-90 contrast-105"
              />
              <div
                className="absolute inset-0 transition-colors duration-1000"
                style={{
                  background: `radial-gradient(ellipse at center, transparent 30%, ${phase.glowRgba} 100%)`,
                }}
              />
            </div>
          );
        })}

        {/* Continuous Looping Sonar Radar Rings (Always pulsing in the background) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-80 h-80 md:w-96 md:h-96 rounded-full border-2 animate-sonar-wave transition-colors duration-700"
            style={{ borderColor: activePhase.primaryColor }}
          />
          <div
            className="w-[520px] h-[520px] md:w-[620px] md:h-[620px] rounded-full border animate-sonar-wave [animation-delay:1.3s] transition-colors duration-700"
            style={{ borderColor: activePhase.secondaryColor }}
          />
          <div
            className="w-[780px] h-[780px] md:w-[960px] md:h-[960px] rounded-full border animate-sonar-wave [animation-delay:2.6s] transition-colors duration-700 opacity-60"
            style={{ borderColor: activePhase.primaryColor }}
          />
        </div>

        {/* Continuous Looping Laser Scanline (Sweeps vertically across screen) */}
        <div
          className="absolute inset-x-0 h-[2.5px] animate-laser-scan shadow-[0_0_25px_currentColor] transition-colors duration-700 z-10"
          style={{
            color: activePhase.secondaryColor,
            background: `linear-gradient(90deg, transparent 0%, ${activePhase.secondaryColor} 50%, transparent 100%)`,
          }}
        />

        {/* Continuous Looping Cyber Grid Floor with Infinite Scroll Flow */}
        <div className="absolute bottom-0 inset-x-0 h-96 cyber-grid-floor animate-grid-flow opacity-40 dark:opacity-60" />

        {/* Floating Cyber Particle Nodes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 left-1/6 w-3 h-3 rounded-full blur-sm animate-cyber-float"
            style={{ backgroundColor: activePhase.secondaryColor }}
          />
          <div
            className="absolute top-1/2 right-1/5 w-2 h-2 rounded-full blur-sm animate-cyber-float-delayed"
            style={{ backgroundColor: activePhase.primaryColor }}
          />
          <div
            className="absolute bottom-1/3 left-1/3 w-3.5 h-3.5 rounded-full blur-sm animate-cyber-float"
            style={{ backgroundColor: activePhase.primaryColor }}
          />
        </div>

        {/* Subtle Vignette Mask to keep text razor sharp */}
        <div className="absolute inset-0 bg-radial-vignette opacity-40 dark:opacity-60" />
      </div>

      {/* 3. Floating Cyber Telemetry Scroll HUD (Bottom-Right Floating Widget) */}
      <aside
        aria-label="Threat Telemetry HUD"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 p-3 rounded-2xl bg-white/90 dark:bg-ink-900/90 backdrop-blur-xl border border-ink/15 dark:border-white/15 shadow-2xl transition-all duration-500 hover:scale-105 select-none"
        style={{
          boxShadow: `0 15px 35px -10px ${activePhase.glowRgba}`,
        }}
      >
        {/* Animated Radial Pulse Icon */}
        <button
          type="button"
          onClick={() => scrollToPhase((currentPhaseIndex + 1) % PHASES.length)}
          className="relative w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-colors duration-500 hover:opacity-90"
          style={{ backgroundColor: activePhase.primaryColor }}
          title="Jump to next detection phase"
        >
          <Icon className="w-5 h-5 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white animate-ping" />
        </button>

        {/* Telemetry Readout */}
        <div className="space-y-0.5 pr-2 font-mono">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold tracking-wider uppercase transition-colors duration-500"
              style={{ color: activePhase.primaryColor }}
            >
              {activePhase.code}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-paper-200 dark:bg-ink-800 text-ink/80 dark:text-paper/80 font-semibold">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>

          <div className="text-xs font-bold text-ink dark:text-paper font-sans leading-tight">
            {activePhase.name}
          </div>

          {/* Micro Equalizer Frequency Bars (Bouncing in Loop via GPU CSS) */}
          <div className="flex items-center gap-1 pt-1 h-3.5">
            <div
              className="w-1 rounded-full animate-eq-1 transition-colors duration-500"
              style={{ backgroundColor: activePhase.primaryColor }}
            />
            <div
              className="w-1 rounded-full animate-eq-2 transition-colors duration-500"
              style={{ backgroundColor: activePhase.secondaryColor }}
            />
            <div
              className="w-1 rounded-full animate-eq-3 transition-colors duration-500"
              style={{ backgroundColor: activePhase.primaryColor }}
            />
            <div
              className="w-1 rounded-full animate-eq-4 transition-colors duration-500"
              style={{ backgroundColor: activePhase.secondaryColor }}
            />
            <div
              className="w-1 rounded-full animate-eq-2 transition-colors duration-500"
              style={{ backgroundColor: activePhase.primaryColor }}
            />
            <span className="text-[9px] text-ink/60 dark:text-paper/60 pl-1 font-mono">
              ACTIVE TELEMETRY
            </span>
          </div>
        </div>

        {/* Phase Step Navigation Dots & Audio Controls */}
        <div className="flex flex-col items-center gap-1.5 pl-2 border-l border-ink/10 dark:border-paper/10">
          <AudioToggle compact={true} />
          {PHASES.map((p, idx) => (
            <button
              key={p.code}
              type="button"
              onMouseEnter={playCyberHover}
              onClick={() => scrollToPhase(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentPhaseIndex === idx
                  ? "scale-125 shadow-sm"
                  : "bg-ink/20 dark:bg-paper/20 scale-100 hover:scale-110"
              }`}
              style={{
                backgroundColor: currentPhaseIndex === idx ? activePhase.primaryColor : undefined,
              }}
              title={`Jump to ${p.name}`}
            />
          ))}
        </div>
      </aside>
    </>
  );
}
