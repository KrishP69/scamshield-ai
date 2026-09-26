import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Award,
  Milestone,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "About the Team & Institutional Roadmap — ScamShield AI",
  description:
    "Learn about the student engineers and academic mentors behind ScamShield AI at UMIT, SNDT Women's University, and review our development roadmap.",
};

export default function AboutPage() {
  const roadmap = [
    { phase: "Phase 0", title: "Foundation & Monorepo Contracts", status: "complete" },
    { phase: "Phase 1", title: "Core Pipeline, OCR & Explainable Scoring", status: "complete" },
    { phase: "Phase 2", title: "Detection Modules (Link, Crypto, APK, Reverse Search)", status: "complete" },
    { phase: "Phase 3", title: "Design System & Accessible Marketing Pages", status: "current" },
    { phase: "Phase 4", title: "3D Experience (Layered HeroShield & PipelineTrack)", status: "upcoming" },
    { phase: "Phase 5", title: "Interactive App UI, History & Live Scans", status: "upcoming" },
    { phase: "Phase 6", title: "DistilBERT Fine-Tuning & Model Evaluation", status: "upcoming" },
    { phase: "Phase 7", title: "AI Voice & Call Verifier Prototype", status: "upcoming" },
    { phase: "Phase 8", title: "Hardening, Rate Limiting & a11y Audit", status: "upcoming" },
    { phase: "Phase 9", title: "Android Background Shield Accessibility Service", status: "upcoming" },
    { phase: "Phase 10", title: "Public Deployment & Capstone Demonstration", status: "upcoming" },
  ];

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="font-mono text-xs font-semibold text-ultramarine dark:text-ultramarine-light uppercase tracking-wider">
            Academic Origins
          </span>
          <h1 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink dark:text-paper tracking-tight">
            About ScamShield AI & The Team
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ink/75 dark:text-paper/75 leading-relaxed">
            ScamShield AI is an academic engineering capstone initiative engineered to defend digital citizens from deceptive social engineering attacks on Facebook and Telegram.
          </p>
        </div>

        {/* Team Cards */}
        <div className="mt-16">
          <h2 className="font-display font-bold text-2xl text-ink dark:text-paper mb-6">
            Engineering Team
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-ultramarine text-white flex items-center justify-center font-display font-bold text-lg">
                SD
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-ink dark:text-paper">
                  Shrushti Dayma
                </h3>
                <p className="text-xs font-mono text-ultramarine dark:text-ultramarine-light font-semibold">
                  Lead Software Architect & Full-Stack Engineer
                </p>
                <p className="text-xs text-ink/60 dark:text-paper/60 mt-0.5">
                  B.Tech Information Technology, UMIT, SNDT Women&apos;s University
                </p>
              </div>
              <p className="text-xs sm:text-sm text-ink/75 dark:text-paper/75 leading-relaxed">
                Specializes in asynchronous system orchestration, mathematical risk scoring fusion, and 3D human-computer visual interfaces.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-ultramarine text-white flex items-center justify-center font-display font-bold text-lg">
                CJ
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-ink dark:text-paper">
                  Chanchal Jadhav
                </h3>
                <p className="text-xs font-mono text-ultramarine dark:text-ultramarine-light font-semibold">
                  Lead ML Engineer & Security Researcher
                </p>
                <p className="text-xs text-ink/60 dark:text-paper/60 mt-0.5">
                  B.Tech Information Technology, UMIT, SNDT Women&apos;s University
                </p>
              </div>
              <p className="text-xs sm:text-sm text-ink/75 dark:text-paper/75 leading-relaxed">
                Specializes in natural language processing tactic engineering, static Android binary decomposition, and threat intelligence ingestion pipelines.
              </p>
            </div>
          </div>
        </div>

        {/* Institution & Mentors */}
        <div className="mt-16 p-8 rounded-3xl bg-paper-100 dark:bg-ink-900 border border-ink/10 dark:border-paper/10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-ultramarine/10 text-ultramarine dark:text-ultramarine-light text-xs font-semibold">
              <GraduationCap className="w-4 h-4" />
              <span>Academic Supervision</span>
            </div>
            <h2 className="font-display font-bold text-2xl text-ink dark:text-paper">
              Usha Mittal Institute of Technology (UMIT)
            </h2>
            <p className="text-sm sm:text-base text-ink/75 dark:text-paper/75 leading-relaxed">
              Developed under the expert guidance and mentorship of <strong>Dr. Shikha Nema</strong> and <strong>Dr. Sanjeevani Shah</strong> at the Department of Information Technology, SNDT Women&apos;s University, Juhu Campus, Mumbai.
            </p>
          </div>
        </div>

        {/* 10-Phase Roadmap */}
        <div className="mt-16">
          <div className="flex items-center gap-2 mb-6">
            <Milestone className="w-5 h-5 text-ultramarine dark:text-ultramarine-light" />
            <h2 className="font-display font-bold text-2xl text-ink dark:text-paper">
              10-Phase Engineering Roadmap
            </h2>
          </div>

          <div className="space-y-3">
            {roadmap.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-ink/50 dark:text-paper/50 w-20">
                    {item.phase}
                  </span>
                  <span className="font-display font-semibold text-xs sm:text-sm text-ink dark:text-paper">
                    {item.title}
                  </span>
                </div>

                <div>
                  {item.status === "complete" ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-verify bg-verify/10 px-2 py-0.5 rounded">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </span>
                  ) : item.status === "current" ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-ultramarine bg-ultramarine/10 px-2 py-0.5 rounded animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Active Build</span>
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-ink/40 dark:text-paper/40 px-2 py-0.5">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
