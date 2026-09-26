import React from "react";
import Link from "next/link";
import {
  Brain,
  Search,
  Link2,
  Coins,
  FileCode,
  Scale,
  Mic,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  Tag,
} from "lucide-react";

export const metadata = {
  title: "Detection Modules — ScamShield AI",
  description:
    "Explore the 8 specialized detection modules powering ScamShield AI's multi-layered defense architecture.",
};

const MODULES_DATA = [
  {
    slug: "scam-guardian",
    name: "AI Scam Guardian",
    number: "01",
    tier: "V1 — Core",
    icon: Brain,
    endpoint: "POST /api/v1/scans",
    summary:
      "Performs deep conversational NLP on raw text or OCR-extracted screenshots to identify psychological coercion tactics, artificial urgency, and impersonation.",
    tactics: ["Artificial Urgency", "Authority Impersonation", "Advance-Fee Lures", "Emotional Coercion"],
  },
  {
    slug: "reverse-search",
    name: "Reverse Search & Identity Intel",
    number: "02",
    tier: "V1 — Core",
    icon: Search,
    endpoint: "POST /api/v1/scans",
    summary:
      "Calculates 64-bit perceptual hashes (pHash) against known scam profile photos, and inspects phone number carrier types to flag disposable VoIP lines.",
    tactics: ["Perceptual Image Hashing", "VoIP Detection", "Carrier Intelligence", "Profile Homoglyphs"],
  },
  {
    slug: "link-scanner",
    name: "Safe Link Scanner",
    number: "03",
    tier: "V1 — Core",
    icon: Link2,
    endpoint: "POST /api/v1/scans",
    summary:
      "Recursively unrolls shortened URLs through an SSRF-safe HTTP unshortener, verifies against Google Safe Browsing and URLhaus, and calculates domain age heuristics.",
    tactics: ["SSRF-Safe Unshortener", "Google Safe Browsing", "Domain Age Scoring", "Homoglyph TLD Detection"],
  },
  {
    slug: "crypto-detector",
    name: "Fake Crypto & Airdrop Detector",
    number: "04",
    tier: "V1 — Core",
    icon: Coins,
    endpoint: "POST /api/v1/scans",
    summary:
      "Extracts blockchain addresses with cryptographic checksums (BTC, ETH, TRON, SOL). Flags 2x/3x multiplier frauds and triggers instant critical overrides on seed phrases.",
    tactics: ["Checksum Validation (EIP-55/Base58)", "Seed Phrase Override", "Multiplier Fraud Heuristics", "Scam Wallet Registry"],
  },
  {
    slug: "file-scanner",
    name: "Suspicious APK & File Scanner",
    number: "05",
    tier: "V1 — Core",
    icon: FileCode,
    endpoint: "POST /api/v1/scans",
    summary:
      "Computes SHA-256 binary hashes for VirusTotal intelligence. Statically inspects Android manifests for lethal permission pairings (SMS + Accessibility Service).",
    tactics: ["VirusTotal Hash Intel", "Manifest Permission Analysis", "Package Impersonation", "Zero-Upload Privacy"],
  },
  {
    slug: "explainable-scoring",
    name: "Explainable Risk Scoring Engine",
    number: "06",
    tier: "V1 — Core",
    icon: Scale,
    endpoint: "POST /api/v1/scans",
    summary:
      "Fuses findings from all parallel modules using Noisy-OR mathematics combined with deterministic hard override rules. Generates bilingual human-readable reasons.",
    tactics: ["Noisy-OR Fusion Math", "Deterministic Hard Rules", "Bilingual Reason Generator", "Trust Passport Contract"],
  },
  {
    slug: "voice-verifier",
    name: "AI Voice & Call Verifier",
    number: "08",
    tier: "V1.5 — Prototype",
    icon: Mic,
    endpoint: "POST /api/v1/scans",
    summary:
      "Analyzes acoustic spectral fingerprints to detect synthetic text-to-speech voice clones used in emergency extortion calls, presented with honest probabilistic metrics.",
    tactics: ["Acoustic Spectral Analysis", "Synthetic Voice Fingerprinting", "Transcript Guardian Pipeline", "Probabilistic Scoring"],
  },
  {
    slug: "background-shield",
    name: "Real-Time Background Shield",
    number: "09",
    tier: "V2 — Stretch",
    icon: Smartphone,
    endpoint: "POST /api/v1/scans/quick",
    summary:
      "Android Accessibility Service prototype that monitors on-screen messages in real time, alerting users before they tap dangerous links or execute fraudulent transactions.",
    tactics: ["Accessibility Service Hook", "On-Screen Text Analysis", "Lightweight Quick API", "Non-Intrusive Warning HUD"],
  },
];

export default function ModulesPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="font-mono text-xs font-semibold text-ultramarine dark:text-ultramarine-light uppercase tracking-wider">
            Architecture Directory
          </span>
          <h1 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink dark:text-paper tracking-tight">
            The 8 Detection Modules
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ink/75 dark:text-paper/75 leading-relaxed">
            ScamShield AI employs a decentralized multi-module design. Each service is independently testable, implements a strict typed interface, and reports transparent confidence scores.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {MODULES_DATA.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.slug}
                className="group flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm hover:border-ultramarine/40 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-ultramarine dark:text-ultramarine-light font-bold">
                      Module {mod.number}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-paper-200 dark:bg-ink-700 text-ink/70 dark:text-paper/70 font-semibold">
                      {mod.tier}
                    </span>
                  </div>

                  <h2 className="font-display font-bold text-xl text-ink dark:text-paper mb-2">
                    {mod.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-ink/70 dark:text-paper/70 leading-relaxed mb-4">
                    {mod.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {mod.tactics.map((tactic, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-paper-100 dark:bg-ink-900 border border-ink/5 dark:border-paper/5 text-ink/60 dark:text-paper/60"
                      >
                        {tactic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-ink/10 dark:border-paper/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-ink/50 dark:text-paper/50">
                    {mod.endpoint}
                  </span>
                  <Link
                    href={`/modules/${mod.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-ultramarine dark:text-ultramarine-light hover:underline"
                  >
                    <span>Technical Spec</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
