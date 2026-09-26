"use client";

import React, { useState } from "react";
import {
  FileText,
  Scan,
  Brain,
  ShieldCheck,
  Scale,
  Award,
  ChevronRight,
  ArrowDown,
} from "lucide-react";

export function PipelineSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: "01",
      title: "Input Ingestion",
      icon: FileText,
      subtitle: "Multi-Modal Ingestion",
      desc: "User submits text, screenshot, web link, phone number, crypto wallet, or APK package. No account required.",
      snippet: {
        label: "Ingestion Payload",
        data: `POST /api/v1/scans
{
  "content": "Dear customer, your electricity will be disconnected tonight. Pay via APK: update-power.apk",
  "platform": "facebook",
  "store_history": false
}`,
      },
    },
    {
      num: "02",
      title: "Pre-processing & Read",
      icon: Scan,
      subtitle: "OCR & Sanitization",
      desc: "Cleans zero-width characters, runs Tesseract OCR on images, detects language (EN, HI, MR), and extracts IOCs.",
      snippet: {
        label: "Extracted Entities",
        data: `Entities Discovered:
- URLs: ["https://quick-pay.in/bill"]
- Phones: ["+91 98765 43210"]
- APK Filename: "update-power.apk"
- Language: en-IN (Confidence: 0.98)`,
      },
    },
    {
      num: "03",
      title: "Tactical NLP Analysis",
      icon: Brain,
      subtitle: "AI Scam Guardian",
      desc: "Detects psychological coercion tactics (artificial urgency, authority intimidation, advance-fee lures) with character spans.",
      snippet: {
        label: "Guardian Findings",
        data: `Tactics Flagged:
- URGENCY: "will be disconnected tonight" [chars 34-62]
- FAKE_AUTHORITY: "Dear customer ... electricity" [chars 0-25]
Classification: UTILITY_IMPERSONATION (Score: 0.88)`,
      },
    },
    {
      num: "04",
      title: "Threat Intel Verification",
      icon: ShieldCheck,
      subtitle: "Parallel Verification",
      desc: "Runs 5 specialized modules simultaneously: Safe Link Scanner, Crypto Checker, File Inspector, and Reverse Search.",
      snippet: {
        label: "Module Findings",
        data: `Parallel Module Outputs:
- Link Scanner: GSB clean, but high-risk newly registered domain (<3 days)
- File Scanner: APK requests BIND_ACCESSIBILITY_SERVICE & RECEIVE_SMS
- Reverse Search: Phone linked to virtual VoIP carrier`,
      },
    },
    {
      num: "05",
      title: "Explainable Risk Engine",
      icon: Scale,
      subtitle: "Fusion & Overrides",
      desc: "Applies hard rule overrides (e.g. seed phrase or accessibility abuse = CRITICAL), then fuses findings using Noisy-OR mathematics.",
      snippet: {
        label: "Scoring Math",
        data: `Hard Overrides: TRIGGERED (Dangerous APK permissions)
Math: Max(Override(95), NoisyOR(0.88, 0.74, 0.40))
Final Risk Score: 95/100 -> CRITICAL
Confidence: 0.94`,
      },
    },
    {
      num: "06",
      title: "Trust Passport Generation",
      icon: Award,
      subtitle: "Decisive Intelligence",
      desc: "Produces an explainable Trust Passport report with machine-readable reasons, bilingual explanations, and clear next steps.",
      snippet: {
        label: "Generated Passport",
        data: `Trust Passport #SP-882194
Risk: CRITICAL (95/100)
Action: DO NOT INSTALL. File attempts to intercept SMS OTPs.
Reasons:
1. Malicious Android permission bundle detected
2. Artificial disconnection urgency tactic identified`,
      },
    },
  ];

  return (
    <section className="py-20 bg-paper dark:bg-ink-800 transition-colors" id="pipeline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="font-mono text-xs font-semibold text-ultramarine dark:text-ultramarine-light uppercase tracking-wider">
            6-Station Architecture
          </span>
          <h2 className="mt-2 font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-ink dark:text-paper tracking-tight">
            How ScamShield deconstructs a threat in milliseconds
          </h2>
          <p className="mt-3 text-sm sm:text-base text-ink/75 dark:text-paper/75">
            Every scan executes a deterministically orchestrated sequence of analysis modules. No black-box decisions, no untraced scores.
          </p>
        </div>

        {/* Step Selector for Desktop */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isSelected = activeStep === idx;
            return (
              <button
                key={s.num}
                onClick={() => setActiveStep(idx)}
                className={`flex flex-col p-4 rounded-xl text-left border transition-all ${
                  isSelected
                    ? "bg-white dark:bg-ink-700 border-ultramarine shadow-md ring-2 ring-ultramarine/20"
                    : "bg-paper-100 dark:bg-ink-900 border-ink/10 dark:border-paper/10 hover:border-ultramarine/50"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isSelected
                        ? "text-ultramarine dark:text-ultramarine-light"
                        : "text-ink/40 dark:text-paper/40"
                    }`}
                  >
                    Station {s.num}
                  </span>
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected
                        ? "text-ultramarine dark:text-ultramarine-light"
                        : "text-ink/60 dark:text-paper/60"
                    }`}
                  />
                </div>
                <span className="mt-2 font-display font-semibold text-xs sm:text-sm text-ink dark:text-paper leading-tight">
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Step Showcase */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-white dark:bg-ink-900 border border-ink/10 dark:border-paper/10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-ultramarine/10 text-ultramarine dark:text-ultramarine-light font-mono text-xs font-semibold">
              <span>Station {steps[activeStep].num}</span>
              <span>•</span>
              <span>{steps[activeStep].subtitle}</span>
            </div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-ink dark:text-paper">
              {steps[activeStep].title}
            </h3>
            <p className="text-sm sm:text-base text-ink/75 dark:text-paper/75 leading-relaxed">
              {steps[activeStep].desc}
            </p>

            <div className="pt-4 flex items-center gap-3">
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-lg border border-ink/20 dark:border-paper/20 text-xs font-medium disabled:opacity-30 hover:bg-paper-100 dark:hover:bg-ink-800"
              >
                Previous Station
              </button>
              <button
                disabled={activeStep === steps.length - 1}
                onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className="px-3 py-1.5 rounded-lg bg-ultramarine text-white text-xs font-medium disabled:opacity-30 hover:bg-ultramarine-dark"
              >
                Next Station
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-xl overflow-hidden border border-ink/15 dark:border-paper/15 bg-ink-900 text-paper font-mono text-xs">
              <div className="px-4 py-2.5 bg-ink-950 border-b border-paper/10 flex items-center justify-between text-[11px] text-paper/60">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-verify" />
                  {steps[activeStep].snippet.label}
                </span>
                <span>Live Fixture</span>
              </div>
              <pre className="p-4 overflow-x-auto text-[11px] sm:text-xs text-paper/90 leading-relaxed font-mono">
                {steps[activeStep].snippet.data}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
