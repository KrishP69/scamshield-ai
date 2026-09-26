import React from "react";
import Link from "next/link";
import { ShieldAlert, PhoneCall, ExternalLink, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 dark:border-paper/10 bg-white dark:bg-[#070B18] text-ink dark:text-paper/90 transition-colors">
      {/* Emergency Cybercrime Helpline Banner */}
      <div className="bg-signal/10 dark:bg-signal/15 border-b border-signal/20 py-3.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-signal-dark dark:text-signal font-semibold">
            <PhoneCall className="w-4 h-4 animate-pulse" />
            <span>Faced financial loss or cyber extortion?</span>
          </div>
          <span className="text-ink/80 dark:text-paper/80">
            Immediately dial National Cyber Helpline:{" "}
            <a
              href="tel:1930"
              className="font-bold underline text-signal-dark dark:text-signal hover:opacity-80"
            >
              1930
            </a>
          </span>
          <span className="hidden sm:inline text-ink/30 dark:text-paper/30">|</span>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-ink/75 dark:text-paper/75 hover:text-ultramarine underline"
          >
            <span>Report incident on cybercrime.gov.in</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 text-ink dark:text-paper">
              <div className="w-8 h-8 rounded-lg bg-ultramarine text-white flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-lg">ScamShield AI</span>
            </Link>
            <p className="mt-3 text-xs sm:text-sm text-ink/70 dark:text-paper/70 leading-relaxed max-w-sm">
              Autonomous multi-layered social engineering detection platform engineered for Facebook
              and Telegram communication channels. Provides explainable evidence and transparent
              Trust Passports.
            </p>
            <div className="mt-4 text-xs text-ink/60 dark:text-paper/60 space-y-1">
              <p>
                <strong>Academic Development:</strong> Shrushti Dayma & Chanchal Jadhav
              </p>
              <p>Usha Mittal Institute of Technology, SNDT Women&apos;s University</p>
            </div>
          </div>

          {/* Product & Modules */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-ink/75 dark:text-paper/75">
              <li>
                <Link href="/product" className="hover:text-ultramarine transition-colors">
                  Product Overview
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-ultramarine transition-colors">
                  8 Detection Modules
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-ultramarine transition-colors">
                  6-Stage Pipeline
                </Link>
              </li>
              <li>
                <Link href="/scan" className="hover:text-ultramarine transition-colors">
                  Web Scanner App
                </Link>
              </li>
            </ul>
          </div>

          {/* Research & Education */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-3">
              Research & Trust
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-ink/75 dark:text-paper/75">
              <li>
                <Link href="/research" className="hover:text-ultramarine transition-colors">
                  Literature Survey & Model Card
                </Link>
              </li>
              <li>
                <Link href="/learn" className="hover:text-ultramarine transition-colors">
                  Scam Awareness Library
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-ultramarine transition-colors">
                  Privacy by Design (DPDP Act)
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-ultramarine transition-colors">
                  API Docs (OpenAPI)
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional & Legal */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-3">
              Institution
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-ink/75 dark:text-paper/75">
              <li>
                <Link href="/about" className="hover:text-ultramarine transition-colors">
                  Team & Mentorship
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-ultramarine transition-colors">
                  Incident Support
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/scamshield-ai/scamshield-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-ultramarine transition-colors"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-12 pt-8 border-t border-ink/10 dark:border-paper/10 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-ink/60 dark:text-paper/60">
          <p>
            &copy; 2026 ScamShield AI. Distributed under the Apache 2.0 open-source license.
          </p>
          <p className="max-w-xl text-center sm:text-right">
            <strong>Statutory Disclaimer:</strong> ScamShield AI provides automated algorithmic risk guidance, not formal cyber-forensic or legal counsel. For actual financial loss, file a complaint on{" "}
            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="underline hover:text-ultramarine">
              cybercrime.gov.in
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
