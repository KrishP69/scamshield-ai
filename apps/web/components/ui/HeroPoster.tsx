"use client";

import React, { useState, useRef } from "react";
import { ShieldCheck, ShieldAlert, Cpu, Eye, Sparkles, Radio, Zap } from "lucide-react";

export function HeroPoster() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation between -16deg and +16deg
    const rotateY = ((x - centerX) / centerX) * 16;
    const rotateX = -((y - centerY) / centerY) * 16;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[480px] h-[400px] sm:h-[480px] flex items-center justify-center select-none perspective-container cursor-grab active:cursor-grabbing"
    >
      {/* 3D Ambient Radial Glows */}
      <div className="absolute w-80 h-80 rounded-full bg-ultramarine/20 dark:bg-ultramarine/30 blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute -top-6 -right-6 w-60 h-60 rounded-full bg-violet-600/20 blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-6 -left-6 w-60 h-60 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none -z-10" />

      {/* 3D Transform Pivot Stage */}
      <div
        className="relative w-full h-full flex items-center justify-center preserve-3d transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.03 : 1})`,
        }}
      >
        {/* Deep Layer 0: Receding 3D Cyber Floor */}
        <div className="absolute bottom-0 w-72 h-44 cyber-grid-floor pointer-events-none opacity-80" />

        {/* Layer 1: Rotating Gyroscopic Radar Ring */}
        <div
          className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-ultramarine/25 dark:border-ultramarine/40 flex items-center justify-center"
          style={{ transform: "translateZ(-20px)" }}
        >
          <div className="w-full h-full rounded-full border-t-2 border-r border-ultramarine/60 animate-spin [animation-duration:14s]" />
          <div className="absolute w-[85%] h-[85%] rounded-full border border-dashed border-ultramarine/30 dark:border-cyan-400/30 animate-spin [animation-duration:22s] [animation-direction:reverse]" />
          {/* Radar Scan Needle */}
          <div className="absolute inset-0 flex items-center justify-center animate-radar-sweep pointer-events-none">
            <div className="w-1/2 h-[1px] bg-gradient-to-r from-transparent to-cyan-400 dark:to-cyan-300 ml-auto" />
          </div>
        </div>

        {/* Layer 2: Main Holographic 3D Shield */}
        <div
          className="relative w-52 h-64 sm:w-60 sm:h-72 preserve-3d flex items-center justify-center transition-transform duration-500"
          style={{ transform: "translateZ(30px)" }}
        >
          {/* Outer Glass Backplate */}
          <div className="absolute inset-0 rounded-[28px] border-2 border-ultramarine/40 dark:border-ultramarine-light/50 bg-gradient-to-br from-white/60 via-white/20 to-transparent dark:from-ink-800/80 dark:via-ink-900/60 dark:to-ink-950/80 backdrop-blur-xl shadow-2xl transform -rotate-3 transition-transform duration-500 hover:rotate-0" />

          {/* Inner Neon Core Plate */}
          <div className="absolute inset-2.5 rounded-[22px] border border-cyan-400/40 bg-gradient-to-tr from-ultramarine via-indigo-600 to-ultramarine-light text-white flex flex-col items-center justify-center p-6 shadow-[0_15px_35px_rgba(47,69,255,0.45)] transform rotate-2 transition-transform duration-500 hover:rotate-0">
            {/* Specular sheen reflection */}
            <div className="absolute inset-0 rounded-[22px] bg-gradient-to-tr from-white/25 via-transparent to-transparent pointer-events-none" />

            {/* Glowing Core Microchip */}
            <div className="relative mb-3 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/30 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Cpu className="w-8 h-8 text-white animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400" />
            </div>

            <span className="font-display font-extrabold text-sm uppercase tracking-wider text-white drop-shadow-md text-center">
              ScamShield AI
            </span>
            <span className="text-[10px] text-cyan-200 font-mono mt-0.5 tracking-tight">
              3D Neural Threat Radar
            </span>

            {/* Live Core Status */}
            <div className="mt-4 px-2.5 py-1 rounded-full bg-black/25 border border-white/20 flex items-center gap-1.5 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>24x7 TELEMETRY ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Layer 3: Floating 3D Telemetry Chips (Pop forward in Z space) */}
        {/* Chip A: Telegram Interceptor (Top Right) */}
        <div
          className="absolute -top-3 -right-8 sm:-right-12 preserve-3d animate-float-slow"
          style={{ transform: "translateZ(65px)" }}
        >
          <div className="px-3.5 py-2.5 rounded-xl bg-white/95 dark:bg-ink-800/95 border border-rose-500/40 shadow-xl backdrop-blur-md flex items-center gap-2.5 hover:scale-105 transition-transform">
            <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="text-left font-mono">
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block leading-tight">
                TELEGRAM INTERCEPTOR
              </span>
              <span className="text-[9px] text-ink/60 dark:text-paper/60">
                Fishy link caught &bull; 98% risk
              </span>
            </div>
          </div>
        </div>

        {/* Chip B: AI Image & Deepfake Detector (Bottom Left) */}
        <div
          className="absolute -bottom-4 -left-8 sm:-left-12 preserve-3d animate-float-slow [animation-delay:1.5s]"
          style={{ transform: "translateZ(60px)" }}
        >
          <div className="px-3.5 py-2.5 rounded-xl bg-white/95 dark:bg-ink-800/95 border border-violet-500/40 shadow-xl backdrop-blur-md flex items-center gap-2.5 hover:scale-105 transition-transform">
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div className="text-left font-mono">
              <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 block leading-tight">
                AI DEEPFAKE FORENSICS
              </span>
              <span className="text-[9px] text-ink/60 dark:text-paper/60">
                FFT Spectrum &bull; 99.4% precision
              </span>
            </div>
          </div>
        </div>

        {/* Chip C: Verified Clean Authentication (Top Left) */}
        <div
          className="absolute top-10 -left-6 sm:-left-10 preserve-3d animate-float-slow [animation-delay:3s]"
          style={{ transform: "translateZ(50px)" }}
        >
          <div className="px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-ink-800/90 border border-emerald-500/30 shadow-lg backdrop-blur-md flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              ZERO-KNOWLEDGE PRIVACY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
