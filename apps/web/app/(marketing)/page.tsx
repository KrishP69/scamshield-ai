import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
  Users,
  Award,
} from "lucide-react";
import { HeroPoster } from "@/components/ui/HeroPoster";
import { ScannerInput } from "@/components/ui/ScannerInput";
import { StatsSection } from "@/components/ui/StatsSection";
import { PipelineSection } from "@/components/ui/PipelineSection";
import { BentoGrid } from "@/components/ui/BentoGrid";
import { InteractivePassportPreview } from "@/components/ui/InteractivePassportPreview";
import { ScenarioWalkthrough } from "@/components/ui/ScenarioWalkthrough";
import { ComparisonTable } from "@/components/ui/ComparisonTable";
import { Button } from "@/components/ui/Button";
import { RealtimeLinkScanner } from "@/components/ui/RealtimeLinkScanner";
import { LiveThreatStream } from "@/components/ui/LiveThreatStream";

export default function HomePage() {
  return (
    <div>
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ultramarine/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content & Live Scanner */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ultramarine/10 border border-ultramarine/20 text-ultramarine dark:text-ultramarine-light text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Explainable Threat Defense for Indian Digital Spaces</span>
              </div>

              <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-ink dark:text-paper tracking-tight leading-[1.1]">
                Know if it&apos;s a scam <br className="hidden sm:inline" />
                <span className="text-ultramarine dark:text-ultramarine-light">before you reply.</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-ink/75 dark:text-paper/75 max-w-xl leading-relaxed">
                Paste a Facebook or Telegram message, link, profile, or file. ScamShield reveals the hidden psychological coercion, malicious links, and dangerous permissions in seconds.
              </p>

              {/* Platform Badges */}
              <div className="flex items-center gap-3 text-xs font-medium text-ink/60 dark:text-paper/60">
                <span>Optimized vectors:</span>
                <span className="px-2.5 py-1 rounded-md bg-paper-200 dark:bg-ink-800 text-ink dark:text-paper">
                  Facebook Marketplace & Groups
                </span>
                <span className="px-2.5 py-1 rounded-md bg-paper-200 dark:bg-ink-800 text-ink dark:text-paper">
                  Telegram Channels & DMs
                </span>
              </div>

              {/* Interactive Live Scanner Box */}
              <div className="pt-2">
                <ScannerInput />
              </div>
            </div>

            {/* Right Hero Poster (Phase 4 3D placeholder) */}
            <div className="lg:col-span-5 flex justify-center">
              <HeroPoster />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Sourced Statistics Section */}
      <StatsSection />

      {/* Real-Time Fishy Link Interception & Telemetry Radar */}
      <section className="py-14 sm:py-20 bg-paper-100/60 dark:bg-ink-900/60 border-y border-ink/10 dark:border-paper/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Active Threat Intelligence Engine</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-ink dark:text-paper tracking-tight">
              Real-Time Fishy Link Interceptor & Live Threat Feed
            </h2>
            <p className="mt-3 text-sm sm:text-base text-ink/75 dark:text-paper/75 leading-relaxed">
              Test any suspicious link in real time. Our 6-layered engine detects Punycode homoglyphs, SSRF IP targets, high-risk TLDs, and queries live URLhaus threat intelligence feeds, displaying the exact detection method used.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <RealtimeLinkScanner />
            </div>
            <div className="lg:col-span-5">
              <LiveThreatStream maxDisplay={5} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. 6-Station Pipeline Section */}
      <PipelineSection />

      {/* 4. Bento Grid (8 Modules) */}
      <BentoGrid />

      {/* 5. Interactive Trust Passport */}
      <InteractivePassportPreview />

      {/* 6. Demo Scenarios Walkthrough */}
      <ScenarioWalkthrough />

      {/* 7. Comparative Analysis */}
      <ComparisonTable />

      {/* 8. Privacy & DPDP Highlights */}
      <section className="py-20 bg-paper dark:bg-ink-800 border-t border-ink/10 dark:border-paper/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="font-mono text-xs font-semibold text-verify uppercase tracking-wider">
              Privacy by Design
            </span>
            <h2 className="mt-2 font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-ink dark:text-paper tracking-tight">
              We inspect threats, not your personal life
            </h2>
            <p className="mt-3 text-sm sm:text-base text-ink/75 dark:text-paper/75 leading-relaxed">
              ScamShield AI aligns with India&apos;s Digital Personal Data Protection (DPDP) Act 2023 principles. Anonymous scans are processed ephemerally in server memory and instantly discarded. We never harvest your address books or contacts.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-ink-900 border border-ink/10 dark:border-paper/10">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-verify flex items-center justify-center mb-4">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-display font-semibold text-base text-ink dark:text-paper">
                Zero-Knowledge Ingestion
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-ink/70 dark:text-paper/70 leading-relaxed">
                Raw message text and screenshots are scrubbed of phone numbers and names before passing to detection models.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-ink-900 border border-ink/10 dark:border-paper/10">
              <div className="w-8 h-8 rounded-lg bg-ultramarine/10 text-ultramarine dark:text-ultramarine-light flex items-center justify-center mb-4">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-display font-semibold text-base text-ink dark:text-paper">
                K-Anonymity Hashes
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-ink/70 dark:text-paper/70 leading-relaxed">
                URLs and indicators are looked up using 32-bit prefix hashes. External threat providers never receive full destination URLs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-ink-900 border border-ink/10 dark:border-paper/10">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-display font-semibold text-base text-ink dark:text-paper">
                One-Click Right to Erasure
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-ink/70 dark:text-paper/70 leading-relaxed">
                If you opt in to save scan history, a single button in settings purges all associated records with immediate cascade deletion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Team & Institution */}
      <section className="py-20 bg-paper-100 dark:bg-ink-900 border-t border-ink/10 dark:border-paper/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="font-mono text-xs font-semibold text-ultramarine dark:text-ultramarine-light uppercase tracking-wider">
                Academic Engineering
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink dark:text-paper tracking-tight">
                Engineered at UMIT, SNDT Women&apos;s University
              </h2>
              <p className="text-sm sm:text-base text-ink/75 dark:text-paper/75 leading-relaxed">
                ScamShield AI is an engineering capstone initiative by <strong>Shrushti Dayma</strong> and <strong>Chanchal Jadhav</strong> under the faculty mentorship of <strong>Dr. Shikha Nema</strong> and <strong>Dr. Sanjeevani Shah</strong> at the Department of Information Technology, Usha Mittal Institute of Technology (UMIT), Mumbai.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/about">
                  <Button variant="secondary" size="sm" className="gap-1.5">
                    <span>Read team bio & roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Link href="/research">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <span>View literature review</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10">
                <span className="text-xs font-mono text-ultramarine font-semibold block mb-1">Lead Architect</span>
                <h3 className="font-display font-bold text-base text-ink dark:text-paper">Shrushti Dayma</h3>
                <p className="text-xs text-ink/60 dark:text-paper/60 mt-1">B.Tech Information Technology, UMIT</p>
                <p className="text-xs text-ink/75 dark:text-paper/75 mt-3">
                  Detection pipeline orchestration, explainable risk scoring, and 3D visual intelligence systems.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10">
                <span className="text-xs font-mono text-ultramarine font-semibold block mb-1">Lead ML & Security</span>
                <h3 className="font-display font-bold text-base text-ink dark:text-paper">Chanchal Jadhav</h3>
                <p className="text-xs text-ink/60 dark:text-paper/60 mt-1">B.Tech Information Technology, UMIT</p>
                <p className="text-xs text-ink/75 dark:text-paper/75 mt-3">
                  NLP tactical feature engineering, threat intelligence adapters, and Android static APK analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Bottom CTA Section */}
      <section className="py-20 bg-ultramarine text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
            Protect yourself before making that transaction
          </h2>
          <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto leading-relaxed">
            Scan suspicious messages, links, files, and crypto addresses without creating an account or paying a rupee.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/scan">
              <Button size="lg" className="bg-white text-ultramarine hover:bg-paper-100 font-semibold gap-2 shadow-lg">
                <span>Open Instant Scanner</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/learn">
              <Button size="lg" variant="ghost" className="text-white border-white/30 hover:bg-white/10">
                <span>Explore Awareness Library</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
