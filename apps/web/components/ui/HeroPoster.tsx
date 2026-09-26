import React from "react";
import { ShieldCheck, ShieldAlert, Cpu, Eye, Lock } from "lucide-react";

export function HeroPoster() {
  return (
    <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[500px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-b from-paper-200/50 to-paper-300/30 dark:from-ink-800/50 dark:to-ink-900/30 border border-ink/5 dark:border-paper/5">
      {/* Ambient background glow */}
      <div className="absolute w-72 h-72 rounded-full bg-ultramarine/15 blur-3xl" />
      <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-signal/15 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-verify/15 blur-3xl" />

      {/* Layered Shield Core Vector Graphic */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Outer glowing ring */}
        <div className="relative w-48 h-56 sm:w-56 sm:h-64 flex items-center justify-center">
          {/* Layer 3: Base outer plate */}
          <div className="absolute inset-0 rounded-3xl border-2 border-ultramarine/30 bg-ultramarine/5 backdrop-blur-md transform -rotate-3 transition-transform hover:rotate-0 duration-700" />
          
          {/* Layer 2: Translucent middle defensive plate */}
          <div className="absolute inset-2 rounded-3xl border-2 border-ultramarine/50 bg-white/40 dark:bg-ink-800/60 backdrop-blur-lg transform rotate-2 transition-transform hover:rotate-0 duration-700 shadow-xl" />
          
          {/* Layer 1: Core shield plate */}
          <div className="absolute inset-4 rounded-2xl bg-gradient-to-tr from-ultramarine to-ultramarine-light text-white flex flex-col items-center justify-center p-6 shadow-2xl">
            <Cpu className="w-12 h-12 text-white/90 animate-pulse" />
            <span className="font-display font-bold text-xs uppercase tracking-wider mt-3 text-white/90">
              Shield Core
            </span>
            <span className="text-[10px] text-white/70 font-mono mt-0.5">
              6 Parallel Layers
            </span>
          </div>

          {/* Floating Intercepted Scam Fragment (Coral) */}
          <div className="absolute -top-4 -right-12 sm:-right-16 bg-white dark:bg-ink-800 border border-signal/40 shadow-lg rounded-xl p-3 flex items-center gap-2 transform rotate-6 animate-bounce">
            <div className="w-6 h-6 rounded-full bg-signal/20 text-signal flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div className="text-left font-mono text-[11px]">
              <span className="text-signal font-bold block leading-none">INTERCEPTED</span>
              <span className="text-ink/60 dark:text-paper/60 text-[10px]">advance_payment</span>
            </div>
          </div>

          {/* Floating Verified Clean Fragment (Mint) */}
          <div className="absolute -bottom-4 -left-12 sm:-left-16 bg-white dark:bg-ink-800 border border-verify/40 shadow-lg rounded-xl p-3 flex items-center gap-2 transform -rotate-6">
            <div className="w-6 h-6 rounded-full bg-verify/20 text-verify flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="text-left font-mono text-[11px]">
              <span className="text-verify font-bold block leading-none">PASSED CLEAN</span>
              <span className="text-ink/60 dark:text-paper/60 text-[10px]">authentic_seller</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-ink/60 dark:text-paper/60 font-mono text-center max-w-xs">
          Multi-layer defense: OCR &bull; DistilBERT &bull; Unshortener &bull; Checksums &bull; Fusion
        </p>
      </div>
    </div>
  );
}
