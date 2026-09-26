import React from "react";
import Link from "next/link";
import {
  FileText,
  Scan,
  Brain,
  ShieldCheck,
  Scale,
  Award,
  ArrowRight,
  Server,
  Radio,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "How It Works — 6-Stage Detection Architecture — ScamShield AI",
  description:
    "An in-depth look at ScamShield AI's multi-stage pipeline: OCR, tactical NLP, parallel threat intel adapters, and Noisy-OR explainable scoring.",
};

export default function HowItWorksPage() {
  const stages = [
    {
      step: "01",
      title: "Input Ingestion & Sanitization",
      icon: FileText,
      desc: "Users submit multi-modal inputs: raw text, OCR screenshots, URLs, phone numbers, crypto wallet addresses, APK files, or audio recordings. Pre-processing strips zero-width characters, normalizes Unicode homoglyphs, and detects message language.",
    },
    {
      step: "02",
      title: "Preprocessing, OCR & Entity Extraction",
      icon: Scan,
      desc: "Tesseract OCR extracts high-confidence text lines from uploaded screenshots. Regex extractors identify IOCs (URLs, phone numbers, UPI VPA handles, crypto addresses). Personal names are masked to uphold zero-knowledge privacy.",
    },
    {
      step: "03",
      title: "Tactical NLP Scam Guardian",
      icon: Brain,
      desc: "Evaluates conversational mechanics. Detects high-pressure urgency spans, authority impersonation, advance-fee triggers, and emotional distress coercion using character-span offsets and statistical classifiers.",
    },
    {
      step: "04",
      title: "Parallel Threat Intel Verification",
      icon: ShieldCheck,
      desc: "Asynchronous fan-out dispatches queries to Safe Link Scanner (SSRF unshortening, Google Safe Browsing, URLhaus), Crypto Detector (Base58/EIP-55 checksums), APK Scanner (dangerous permissions), and Reverse Search (pHash Hamming distance).",
    },
    {
      step: "05",
      title: "Explainable Risk Scoring Engine",
      icon: Scale,
      desc: "Deterministic hard override rules bypass statistical fusion when zero-tolerance threats (seed phrase requests, dangerous APK permissions) are detected. Remaining findings are combined using probabilistic Noisy-OR mathematics.",
    },
    {
      step: "06",
      title: "Auditable Trust Passport Delivery",
      icon: Award,
      desc: "The final passport is streamed via Server-Sent Events (SSE). It includes the numerical score, risk tier, defanged threat indicators, recommended actions, and bilingual explanations in English, Hindi, and Marathi.",
    },
  ];

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="font-mono text-xs font-semibold text-ultramarine dark:text-ultramarine-light uppercase tracking-wider">
            Deep-Dive Architecture
          </span>
          <h1 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink dark:text-paper tracking-tight">
            How ScamShield AI Analyzes Threats
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ink/75 dark:text-paper/75 leading-relaxed">
            From the moment an input arrives at the FastAPI gateway to the final Trust Passport delivery, every calculation is deterministic, transparent, and auditable.
          </p>
        </div>

        {/* 6 Stages Timeline */}
        <div className="mt-16 space-y-8">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm items-start"
              >
                <div className="md:col-span-3 flex items-center gap-4">
                  <span className="font-mono font-extrabold text-3xl text-ultramarine dark:text-ultramarine-light">
                    {stage.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-ultramarine/10 text-ultramarine dark:text-ultramarine-light flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="md:col-span-9 space-y-2">
                  <h2 className="font-display font-bold text-lg sm:text-xl text-ink dark:text-paper">
                    {stage.title}
                  </h2>
                  <p className="text-sm sm:text-base text-ink/70 dark:text-paper/70 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Real-Time SSE Architecture */}
        <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-paper-100 dark:bg-ink-900 border border-ink/10 dark:border-paper/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-verify/10 text-verify font-mono text-xs font-semibold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Live Streaming Architecture</span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink dark:text-paper">
                Partial Results Stream in Real Time via SSE
              </h2>
              <p className="text-sm sm:text-base text-ink/75 dark:text-paper/75 leading-relaxed">
                Rather than forcing users to stare at a spinner while slow external threat lookups resolve, our async orchestrator streams findings progressively via Server-Sent Events (`/api/v1/scans/{'{id}'}/stream`).
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-ink/70 dark:text-paper/70">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-verify" />
                  <span>Instant OCR and NLP tactical flags in under 350ms</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-verify" />
                  <span>External threat lookups complete concurrently in background</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-verify" />
                  <span>Final Trust Passport seals when all modules settle</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-xl overflow-hidden border border-ink/10 dark:border-paper/10 bg-ink-950 font-mono text-xs text-paper p-5">
                <div className="text-[11px] text-paper/50 pb-2 border-b border-paper/10 mb-3">
                  SSE Event Stream Protocol (GET /api/v1/scans/c4a9.../stream)
                </div>
                <div className="space-y-2 text-[11px] text-paper/85">
                  <p><span className="text-ultramarine-light">event:</span> progress</p>
                  <p className="pl-4 text-paper/60">data: {"{\"stage\": \"ocr_completed\", \"confidence\": 0.98}"}</p>
                  <p><span className="text-ultramarine-light">event:</span> module_finding</p>
                  <p className="pl-4 text-paper/60">data: {"{\"module\": \"scam_guardian\", \"finding\": \"ARTIFICIAL_URGENCY\"}"}</p>
                  <p><span className="text-ultramarine-light">event:</span> module_finding</p>
                  <p className="pl-4 text-paper/60">data: {"{\"module\": \"link_scanner\", \"finding\": \"SAFE_BROWSING_HIT\"}"}</p>
                  <p><span className="text-verify">event:</span> complete</p>
                  <p className="pl-4 text-verify">data: {"{\"risk_score\": 95, \"risk_level\": \"CRITICAL\"}"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="mt-16 text-center">
          <Link href="/scan">
            <Button size="lg" className="gap-2">
              <span>Try a Live Scan Now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
