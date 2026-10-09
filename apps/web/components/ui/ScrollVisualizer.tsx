"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Eye,
  Zap,
  Play,
  Pause,
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  Activity,
  Lock,
} from "lucide-react";
import { playCyberHover, playCyberClick, playRadarPing } from "@/lib/audio";

interface VisualStage {
  id: string;
  stationNumber: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  badge: string;
  badgeColor: string;
  statusText: string;
  telemetry: { label: string; value: string }[];
  description: string;
}

const VISUAL_STAGES: VisualStage[] = [
  {
    id: "neural_core",
    stationNumber: "STATION 01",
    title: "3D Neural Defense Core & Gyroscopic Radar",
    subtitle: "24x7 Real-Time Telemetry & Heuristic Scam Interceptor",
    imageSrc: "/assets/cyber_shield_radar.jpg",
    badge: "CORE SHIELD ACTIVE",
    badgeColor: "bg-blue-500/15 text-blue-600 dark:text-cyan-400 border-blue-500/30",
    statusText: "98.4% INTEGRITY // 24x7 PING ACTIVE",
    telemetry: [
      { label: "Shield Strength", value: "98.4%" },
      { label: "Threat Latency", value: "12ms" },
      { label: "Active Firewall", value: "v6.1 PRO" },
      { label: "Detection Engine", value: "Multi-Signal" },
    ],
    description:
      "Deep neural classification engine processing psychological coercion, artificial urgency cues, and Telegram channel vectors across live threat feeds.",
  },
  {
    id: "phishing_matrix",
    stationNumber: "STATION 02",
    title: "Visual Phishing & Credential Interception Matrix",
    subtitle: "Catches Malicious Homoglyph Domains & URLhaus Targets",
    imageSrc: "/assets/phishing_threat_matrix.jpg",
    badge: "THREAT INTERCEPTOR",
    badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    statusText: "THREAT ALERT: PHISHING CAMPAIGN DETECTED",
    telemetry: [
      { label: "Critical Traps Caught", value: "4,892" },
      { label: "Credential Theft", value: "DISARMED" },
      { label: "Homoglyph Engine", value: "ACTIVE" },
      { label: "URLhaus Telemetry", value: "LIVE FEED" },
    ],
    description:
      "Intercepts spoofed banking gateways, Punycode homoglyphs, and SSRF loopback endpoints across Facebook and Telegram channels.",
  },
  {
    id: "screenshot_lab",
    stationNumber: "STATION 03",
    title: "Forensic Screenshot & Absurd Deal Lab",
    subtitle: "Catches Fake 50k Free Game Diamonds & Instagram Phishing",
    imageSrc: "/assets/screenshot_forensics_lab.jpg",
    badge: "FORENSIC VISION",
    badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    statusText: "DECEPTIVE BANNER DETECTED // CREDENTIAL TRAP FLAGGED",
    telemetry: [
      { label: "Absurd Deal Risk", value: "99/100" },
      { label: "OCR OCR Text Scan", value: "50,000 GEMS" },
      { label: "Phish Indicator", value: "LOGIN FORM" },
      { label: "Account Takeover", value: "PREVENTED" },
    ],
    description:
      "Inspects screenshot banners offering absurd free diamonds or fake Instagram security notices engineered to hijack user credentials.",
  },
  {
    id: "trust_passport",
    stationNumber: "STATION 04",
    title: "Zero-Knowledge Cryptographic Trust Passport",
    subtitle: "Explainable Risk Scoring with Complete Privacy Preservation",
    imageSrc: "/assets/trust_passport_core.jpg",
    badge: "ZK-SNARK VERIFIED",
    badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    statusText: "DECENTRALIZED IDENTITY // BLOCKCHAIN VERIFIED",
    telemetry: [
      { label: "Privacy Protection", value: "100% ZK" },
      { label: "Tamper Proofing", value: "SHA-256" },
      { label: "Evidence Attributions", value: "8 Stations" },
      { label: "Exportable Token", value: "JSON-LD" },
    ],
    description:
      "Generates an explainable 3D Trust Passport breaking down the exact psychological tactics, suspicious URL structures, and safety recommendations.",
  },
];

export function ScrollVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [isAutoLooping, setIsAutoLooping] = useState<boolean>(true);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const activeStage = VISUAL_STAGES[activeStageIndex];

  // 1. Scroll-driven animation listener
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const elementTop = rect.top;
      const elementHeight = rect.height;
      const totalDist = windowHeight + elementHeight;
      const currentDist = windowHeight - elementTop;

      const progress = Math.min(Math.max(currentDist / totalDist, 0), 1);
      setScrollProgress(progress);

      // Scroll-driven stage change when scrolling through the container
      if (progress >= 0.1 && progress < 0.35) {
        setActiveStageIndex(0);
      } else if (progress >= 0.35 && progress < 0.6) {
        setActiveStageIndex(1);
      } else if (progress >= 0.6 && progress < 0.85) {
        setActiveStageIndex(2);
      } else if (progress >= 0.85) {
        setActiveStageIndex(3);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Ambient Continuous Looping Timer
  useEffect(() => {
    if (!isAutoLooping || isHovered) return;

    const interval = setInterval(() => {
      setActiveStageIndex((prev) => (prev + 1) % VISUAL_STAGES.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isAutoLooping, isHovered]);

  // 3. Interactive Mouse Parallax Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 7;
    const rotateY = ((x - centerX) / centerX) * 7;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section
      ref={containerRef}
      className="py-16 sm:py-24 bg-paper/60 dark:bg-[#070B18]/60 backdrop-blur-md border-b border-ink/10 dark:border-paper/10 overflow-hidden relative"
    >
      {/* Ambient Cyber Background Grid Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-ultramarine/15 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 cyber-grid-floor opacity-30 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ultramarine/10 border border-ultramarine/20 text-ultramarine dark:text-cyan-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scroll-Driven Cinema // Interactive Threat Loop</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-ink dark:text-paper tracking-tight">
              ScamShield AI Holographic Threat Engine
            </h2>
            <p className="text-sm sm:text-base text-ink/75 dark:text-paper/75 leading-relaxed">
              Scroll down to navigate through our 4-station visual detection pipeline, or watch the automated continuous
              telemetry loop scan live digital battlefields in real time.
            </p>
          </div>

          {/* Interactive Play/Pause & Loop Indicator */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onMouseEnter={playCyberHover}
              onClick={() => {
                playCyberClick();
                setIsAutoLooping(!isAutoLooping);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-ink-800 border border-ink/15 dark:border-paper/15 text-xs font-semibold text-ink dark:text-paper hover:border-ultramarine shadow-sm transition-all"
            >
              {isAutoLooping ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Pause Loop</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Resume Loop</span>
                </>
              )}
            </button>

            {/* Scroll Depth Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-paper-100 dark:bg-ink-900 border border-ink/10 dark:border-paper/10 text-xs font-mono text-ink/70 dark:text-paper/70">
              <Activity className="w-3.5 h-3.5 text-ultramarine dark:text-cyan-400" />
              <span>SCROLL: {Math.round(scrollProgress * 100)}%</span>
            </div>
          </div>
        </div>

        {/* 4 Stage Selector Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {VISUAL_STAGES.map((stage, idx) => {
            const isSelected = activeStageIndex === idx;
            return (
              <button
                key={stage.id}
                type="button"
                onMouseEnter={playCyberHover}
                onClick={() => {
                  playRadarPing();
                  setActiveStageIndex(idx);
                  setIsAutoLooping(false);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? "bg-white dark:bg-ink-800 border-ultramarine dark:border-cyan-400 shadow-xl ring-2 ring-ultramarine/20 dark:ring-cyan-400/20"
                    : "bg-paper-100/70 dark:bg-ink-900/50 border-ink/10 dark:border-paper/10 hover:border-ink/30 dark:hover:border-paper/30 opacity-75 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-ink/60 dark:text-paper/60">
                    {stage.stationNumber}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold ${stage.badgeColor}`}
                  >
                    {stage.badge}
                  </span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-ink dark:text-paper leading-tight line-clamp-1">
                    {stage.title}
                  </h4>
                  <p className="text-[11px] text-ink/60 dark:text-paper/60 line-clamp-1 mt-0.5">
                    {stage.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* 3D Holographic Visual Stage Canvas */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative rounded-3xl overflow-hidden border-2 border-ink/15 dark:border-white/15 bg-black shadow-2xl preserve-3d transition-transform duration-200 ease-out animate-hologram-glow select-none"
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          }}
        >
          {/* Main Visual Image */}
          <div className="relative w-full h-[380px] sm:h-[480px] md:h-[540px] overflow-hidden bg-black flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={activeStage.imageSrc}
              src={activeStage.imageSrc}
              alt={activeStage.title}
              className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            />

            {/* Infinite Scanning Laser Bar (Sweeps Vertically) */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] animate-laser-scan pointer-events-none z-20" />

            {/* Cyber Corner HUD Brackets */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none z-20" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none z-20" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none z-20" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none z-20" />

            {/* Top Telemetry Overlay Ribbon */}
            <div className="absolute top-5 inset-x-6 flex items-center justify-between text-[11px] font-mono text-cyan-300 z-20 pointer-events-none">
              <div className="px-3 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-cyan-400/30 flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold">{activeStage.statusText}</span>
              </div>
              <div className="hidden sm:flex px-3 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-cyan-400/30 items-center gap-2 shadow-lg text-white/80">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>SCAMSHIELD // NEURAL PIPELINE ACTIVE</span>
              </div>
            </div>

            {/* Bottom Telemetry HUD Grid Bar */}
            <div className="absolute bottom-5 inset-x-6 z-20 pointer-events-none">
              <div className="p-4 rounded-2xl bg-black/85 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {stagePrefix(activeStage.stationNumber)}
                    </span>
                    <h3 className="font-display font-bold text-sm sm:text-base text-white">
                      {activeStage.title}
                    </h3>
                  </div>
                  <p className="text-xs text-white/70 line-clamp-2">
                    {activeStage.description}
                  </p>
                </div>

                {/* 4 Telemetry Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                  {activeStage.telemetry.map((t, i) => (
                    <div
                      key={i}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-center font-mono"
                    >
                      <span className="text-[9px] text-white/50 block leading-none">
                        {t.label}
                      </span>
                      <span className="text-xs font-bold text-cyan-300 mt-1 block">
                        {t.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Looping Progress Track Bar */}
          <div className="h-1.5 w-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-ultramarine via-cyan-400 to-emerald-400 transition-all duration-300"
              style={{
                width: `${((activeStageIndex + 1) / VISUAL_STAGES.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Quick Jump Action Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ultramarine hover:bg-ultramarine-dark text-white font-semibold text-xs shadow-md transition-all hover:scale-105"
          >
            <Zap className="w-4 h-4 text-white" />
            <span>Launch Live Threat Scanner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/screenshot-inspector"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-ink-800 border border-ink/15 dark:border-paper/15 text-xs font-semibold text-ink dark:text-paper hover:border-ultramarine shadow-sm transition-all"
          >
            <Eye className="w-4 h-4 text-rose-500" />
            <span>Open Screenshot & Deal Inspector</span>
          </Link>
          <Link
            href="/radar"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-paper-100 dark:bg-ink-900 border border-ink/10 dark:border-paper/10 text-xs font-semibold text-ink dark:text-paper hover:bg-paper-200 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>24x7 Telegram Threat Radar</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function stagePrefix(text: string) {
  return text;
}
