import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Eye,
  Cpu,
  Layers,
  FileSearch,
  Lock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Product Overview — ScamShield AI",
  description:
    "Explore how ScamShield AI combines multi-modal threat analysis, real-time threat intelligence, and explainable scoring to stop social engineering fraud.",
};

export default function ProductPage() {
  const capabilities = [
    {
      title: "Multi-Modal Ingestion",
      desc: "Analyze unstructured chat transcripts, OCR-extracted screenshots, raw URLs, contact phone numbers, cryptocurrency wallet hashes, and Android APK binaries in a single unified pipeline.",
      icon: Layers,
    },
    {
      title: "Explainable Risk Scoring",
      desc: "No black-box probability guesses. ScamShield combines Noisy-OR statistical fusion with deterministic hard overrides, ensuring every risk level is supported by human-readable evidence.",
      icon: Cpu,
    },
    {
      title: "Privacy by Design",
      desc: "Zero-knowledge message scanning. We never harvest phone contacts or address books. Messages are processed in temporary memory and URLs are checked using 32-bit k-anonymity hash prefixes.",
      icon: Lock,
    },
    {
      title: "Trust Passport Reports",
      desc: "Receive an auditable security passport with interactive inline text highlighting, defanged threat indicators, and actionable guidance in English, Hindi, and Marathi.",
      icon: FileSearch,
    },
  ];

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <span className="font-mono text-xs font-semibold text-ultramarine dark:text-ultramarine-light uppercase tracking-wider">
            Product Architecture
          </span>
          <h1 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink dark:text-paper tracking-tight">
            Defense against social engineering, engineered for humans
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ink/75 dark:text-paper/75 leading-relaxed">
            Most security software scans for viruses, network intrusions, and spam emails. ScamShield AI is purpose-built for conversational social engineering across Facebook and Telegram—the primary vectors for financial loss in India.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {capabilities.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-ultramarine/10 text-ultramarine dark:text-ultramarine-light flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="font-display font-bold text-xl text-ink dark:text-paper">
                  {c.title}
                </h2>
                <p className="text-sm text-ink/70 dark:text-paper/70 leading-relaxed">
                  {c.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Target Threat Vectors */}
        <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-paper-100 dark:bg-ink-900 border border-ink/10 dark:border-paper/10">
          <div className="max-w-2xl mb-8">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink dark:text-paper">
              Engineered specifically for conversational platforms
            </h2>
            <p className="mt-2 text-sm text-ink/70 dark:text-paper/70">
              Scammers exploit the social fabric of popular platforms where traditional antivirus software has zero visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 space-y-3">
              <span className="font-mono text-xs font-semibold text-ultramarine uppercase">
                Vector 01: Facebook Ecosystem
              </span>
              <h3 className="font-display font-bold text-lg text-ink dark:text-paper">
                Marketplace Advance Payments & Cloned Profiles
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-ink/75 dark:text-paper/75">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-verify shrink-0 mt-0.5" />
                  <span>Fraudulent QR codes designed to debit accounts under guise of advance payment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-verify shrink-0 mt-0.5" />
                  <span>Army officer / NRI buyer identity impersonation with fake credentials.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-verify shrink-0 mt-0.5" />
                  <span>Cloned family accounts demanding hospital bail money or UPI transfers.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 space-y-3">
              <span className="font-mono text-xs font-semibold text-ultramarine uppercase">
                Vector 02: Telegram Channels & Groups
              </span>
              <h3 className="font-display font-bold text-lg text-ink dark:text-paper">
                Crypto Giveaways, Task Scams & Sideloaded APKs
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-ink/75 dark:text-paper/75">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-verify shrink-0 mt-0.5" />
                  <span>Part-time job & YouTube like-and-earn tasks leading to investment traps.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-verify shrink-0 mt-0.5" />
                  <span>Cryptocurrency multiplier bots requesting wallet deposits or seed phrases.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-verify shrink-0 mt-0.5" />
                  <span>Disguised utility APK files requesting SMS and Accessibility permissions.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link href="/scan">
            <Button size="lg" className="gap-2">
              <span>Test ScamShield Live</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
