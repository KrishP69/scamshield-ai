import React from "react";
import Link from "next/link";
import { BentoCard } from "./BentoCard";
import {
  Brain,
  Link2,
  Coins,
  FileCode,
  Search,
  Mic,
  Scale,
  Smartphone,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export function BentoGrid() {
  return (
    <section className="py-20 bg-paper-100 dark:bg-ink-900 border-t border-ink/10 dark:border-paper/10 transition-colors" id="modules">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="font-mono text-xs font-semibold text-ultramarine dark:text-ultramarine-light uppercase tracking-wider">
              Comprehensive Defense Stack
            </span>
            <h2 className="mt-2 font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-ink dark:text-paper tracking-tight">
              8 Specialized Detection Modules
            </h2>
            <p className="mt-3 text-sm sm:text-base text-ink/75 dark:text-paper/75 max-w-xl">
              Each module isolates one vector of deception, from NLP coercion tactics and homoglyph URLs to APK permission abuse and synthetic voice cloning.
            </p>
          </div>
          <Link
            href="/modules"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-ultramarine dark:text-ultramarine-light hover:underline"
          >
            <span>View detailed module specifications</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Scam Guardian (Large 2-column on desktop) */}
          <BentoCard
            title="AI Scam Guardian"
            category="Module 01 • NLP & Tactics"
            slug="scam-guardian"
            description="Deep linguistic analysis using character-span tactical tagging and a fine-tuned classifier to expose artificial urgency and impersonation."
            className="lg:col-span-2"
          >
            <div className="rounded-xl border border-ink/10 dark:border-paper/10 bg-paper/60 dark:bg-ink-950 p-4 space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between border-b border-ink/10 dark:border-paper/10 pb-2 text-[11px] font-mono text-ink/60 dark:text-paper/60">
                <span>Intercepted Message Snippet</span>
                <span className="text-signal font-semibold">URGENCY DETECTED</span>
              </div>
              <p className="leading-relaxed text-ink/80 dark:text-paper/80">
                &ldquo;Dear customer,{" "}
                <mark className="bg-signal/20 text-signal-dark dark:text-signal font-semibold px-1 rounded">
                  your electricity power will be cut tonight at 9:30 PM
                </mark>{" "}
                due to unpaid bill. Immediately contact officer Sharma at{" "}
                <mark className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-1 rounded">
                  +91-9876543210
                </mark>{" "}
                or install our payment APK.&rdquo;
              </p>
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
                <span className="px-2 py-0.5 rounded bg-signal/15 text-signal font-semibold">
                  Tactic: ARTIFICIAL_URGENCY (0.94)
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold">
                  Tactic: AUTHORITY_IMPERSONATION (0.87)
                </span>
              </div>
            </div>
          </BentoCard>

          {/* 2. Safe Link Scanner */}
          <BentoCard
            title="Safe Link Scanner"
            category="Module 03 • URL & Domain Intel"
            slug="link-scanner"
            description="SSRF-safe unshortener, canonicalization, Google Safe Browsing, PhishTank, and homoglyph character spoofing detection."
          >
            <div className="rounded-xl border border-ink/10 dark:border-paper/10 bg-paper/60 dark:bg-ink-950 p-3.5 space-y-2.5 font-mono text-[11px]">
              <div className="space-y-1">
                <span className="text-[10px] text-ink/50 dark:text-paper/50">Shortened Link:</span>
                <div className="p-1.5 rounded bg-paper-200 dark:bg-ink-800 text-ink/80 dark:text-paper/80 truncate">
                  https://bit.ly/3xPowerPay
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-signal font-semibold">Unwrapped Target:</span>
                <div className="p-1.5 rounded bg-signal/10 text-signal truncate">
                  https://pay-electricity-bill-mahaupdate.live/pay
                </div>
              </div>
              <div className="text-[10px] text-ink/60 dark:text-paper/60 flex items-center justify-between pt-1">
                <span>Domain Age: <strong>2 days</strong></span>
                <span className="text-signal font-semibold">TLD: .live (High Risk)</span>
              </div>
            </div>
          </BentoCard>

          {/* 3. Crypto & Airdrop Detector */}
          <BentoCard
            title="Crypto & Airdrop Detector"
            category="Module 04 • Web3 & Wallets"
            slug="crypto-detector"
            description="Extracts BTC, ETH, TRON, and SOL addresses with checksum validation. Enforces zero-tolerance overrides on seed phrases."
          >
            <div className="rounded-xl border border-ink/10 dark:border-paper/10 bg-paper/60 dark:bg-ink-950 p-3.5 space-y-2.5 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-ink/60 dark:text-paper/60 text-[10px]">Extracted Address</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-verify text-[10px] font-semibold">
                  Valid EIP-55
                </span>
              </div>
              <div className="p-1.5 rounded bg-paper-200 dark:bg-ink-800 text-ink dark:text-paper font-mono truncate text-[10px]">
                0x71C...b4E9 (ETH)
              </div>
              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className="text-signal font-semibold">Pattern: 2x Multiplier Scam</span>
                <span className="text-signal font-mono font-bold">Risk: 95/100</span>
              </div>
            </div>
          </BentoCard>

          {/* 4. Suspicious APK/File Scanner */}
          <BentoCard
            title="APK & File Scanner"
            category="Module 05 • Static Analysis"
            slug="file-scanner"
            description="SHA-256 hash lookup via VirusTotal without non-consensual upload. Static permission inspector reveals SMS/Accessibility abuse."
          >
            <div className="rounded-xl border border-ink/10 dark:border-paper/10 bg-paper/60 dark:bg-ink-950 p-3.5 space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-ink/60 dark:text-paper/60">Declared Permissions</span>
                <span className="text-signal font-bold">2 CRITICAL</span>
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center justify-between px-2 py-1 rounded bg-signal/10 text-signal">
                  <span>BIND_ACCESSIBILITY_SERVICE</span>
                  <span>Intercept UI</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 rounded bg-signal/10 text-signal">
                  <span>RECEIVE_SMS</span>
                  <span>Steal OTP</span>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* 5. Reverse Search & Trust Passport */}
          <BentoCard
            title="Reverse Search & Identity"
            category="Module 02 • Phone & Visual IOCs"
            slug="reverse-search"
            description="Perceptual hashing (pHash) for re-used scam profile photos, combined with phone carrier intelligence and international VoIP detection."
          >
            <div className="rounded-xl border border-ink/10 dark:border-paper/10 bg-paper/60 dark:bg-ink-950 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-ink/60 dark:text-paper/60">pHash Visual Match</span>
                <span className="text-signal font-semibold">Hamming: 3 (Match)</span>
              </div>
              <p className="text-[11px] text-ink/75 dark:text-paper/75">
                Avatar image matches 14 previously flagged romance and advance-fee scam profiles.
              </p>
              <div className="text-[10px] font-mono text-ink/60 dark:text-paper/60 border-t border-ink/10 dark:border-paper/10 pt-1">
                Line Type: Virtual VoIP (No physical SIM registered)
              </div>
            </div>
          </BentoCard>

          {/* 6. Voice & Call Verifier */}
          <BentoCard
            title="AI Voice & Call Verifier"
            category="Module 08 • Audio Anti-Spoofing"
            slug="voice-verifier"
            description="Acoustic spectral inspection designed to detect synthetic voice clones and TTS audio used in urgent family-in-distress fraud."
          >
            <div className="rounded-xl border border-ink/10 dark:border-paper/10 bg-paper/60 dark:bg-ink-950 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-ink/60 dark:text-paper/60">Acoustic Analysis</span>
                <span className="text-amber-500 font-semibold">PROBABILISTIC</span>
              </div>
              <div className="h-6 flex items-end gap-1 px-2 bg-paper-200 dark:bg-ink-800 rounded">
                {[40, 70, 95, 30, 85, 60, 90, 45, 80, 20, 90, 65, 30, 75].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-ultramarine rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <span className="block text-[10px] text-ink/50 dark:text-paper/50">
                High-frequency spectral artifact pattern detected (82% synthetic likelihood)
              </span>
            </div>
          </BentoCard>

          {/* 7. Explainable Risk Scoring Engine */}
          <BentoCard
            title="Explainable Scoring Engine"
            category="Module 06 • Mathematical Fusion"
            slug="explainable-scoring"
            description="Replaces opaque neural scores with Noisy-OR probability fusion, hard deterministic overrides, and bilingual reason generation."
            className="lg:col-span-2"
          >
            <div className="rounded-xl border border-ink/10 dark:border-paper/10 bg-paper/60 dark:bg-ink-950 p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-ink/60 dark:text-paper/60">Risk Fusion Formula</span>
                <span className="text-verify font-semibold">100% Explainable</span>
              </div>
              <div className="p-2 rounded bg-paper-200 dark:bg-ink-800 text-[11px] text-ink/90 dark:text-paper/90 overflow-x-auto">
                Score = Max(HardOverrides) || 100 * (1 - &prod; (1 - w_i * P_i))
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded border border-ink/10 dark:border-paper/10 bg-white dark:bg-ink-900">
                  <span className="text-verify font-bold">Hard Overrides:</span> Triggers instant 90+ score for seed phrases, known scam wallets, or APK SMS interceptors.
                </div>
                <div className="p-2 rounded border border-ink/10 dark:border-paper/10 bg-white dark:bg-ink-900">
                  <span className="text-ultramarine font-bold">Reason Generator:</span> Synthesizes plain English, Hindi, and Marathi explanations for non-technical users.
                </div>
              </div>
            </div>
          </BentoCard>

          {/* 8. Real-Time Background Shield */}
          <BentoCard
            title="Background Shield (V2)"
            category="Module 09 • Android Companion"
            slug="background-shield"
            description="Autonomous on-device Accessibility Service that inspects incoming chat bubbles and warns users before they tap dangerous links or send money."
          >
            <div className="rounded-xl border border-ink/10 dark:border-paper/10 bg-paper/60 dark:bg-ink-950 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span>Android Accessibility Overlay</span>
                <span className="text-ultramarine font-semibold">V2 Prototype</span>
              </div>
              <div className="p-2 rounded bg-signal/15 border border-signal/30 text-signal-dark dark:text-signal text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Warning: Unverified UPI handle requested via Telegram</span>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
