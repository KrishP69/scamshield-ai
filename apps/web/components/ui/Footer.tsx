import React from "react";
import Link from "next/link";
import { ShieldAlert, PhoneCall, ExternalLink, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 dark:border-paper/10 bg-white/95 dark:bg-[#070B18] backdrop-blur-md text-slate-800 dark:text-slate-200 transition-colors">
      {/* Emergency Cybercrime Helpline Banner */}
      <div className="bg-rose-500/10 dark:bg-rose-950/50 border-b border-rose-500/25 py-3 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-semibold">
            <PhoneCall className="w-4 h-4 animate-pulse text-rose-600 dark:text-rose-400" />
            <span>Faced financial loss or cyber extortion?</span>
          </div>
          <span className="text-slate-700 dark:text-slate-200 font-medium">
            Immediately dial National Cyber Helpline:{" "}
            <a
              href="tel:1930"
              className="font-bold underline text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-100"
            >
              1930
            </a>
          </span>
          <span className="hidden sm:inline text-slate-400 dark:text-slate-600">|</span>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-200 hover:text-ultramarine dark:hover:text-cyan-400 font-medium underline"
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
            <Link href="/" className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100">
              <div className="w-8 h-8 rounded-lg bg-ultramarine text-white flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-lg">ScamShield AI</span>
            </Link>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
              Autonomous multi-layered social engineering detection platform engineered for Facebook
              and Telegram communication channels. Provides explainable evidence and transparent
              Trust Passports.
            </p>
            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p>
                <strong className="text-slate-700 dark:text-slate-300">Academic Development:</strong> Shrushti Dayma & Chanchal Jadhav
              </p>
              <p>Usha Mittal Institute of Technology, SNDT Women&apos;s University</p>
            </div>
          </div>

          {/* Product & Modules */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              Platform
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li>
                <Link href="/product" className="hover:text-ultramarine dark:hover:text-cyan-400 transition-colors">
                  Product Overview
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-ultramarine dark:hover:text-cyan-400 transition-colors">
                  8 Detection Modules
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-ultramarine dark:hover:text-cyan-400 transition-colors">
                  6-Stage Pipeline
                </Link>
              </li>
              <li>
                <Link href="/scan" className="hover:text-ultramarine dark:hover:text-cyan-400 transition-colors">
                  Web Scanner App
                </Link>
              </li>
            </ul>
          </div>

          {/* Research & Education */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              Research & Trust
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li>
                <Link href="/research" className="hover:text-ultramarine dark:hover:text-cyan-400 transition-colors">
                  Literature Survey & Model Card
                </Link>
              </li>
              <li>
                <Link href="/learn" className="hover:text-ultramarine dark:hover:text-cyan-400 transition-colors">
                  Scam Awareness Library
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-ultramarine dark:hover:text-cyan-400 transition-colors">
                  Privacy by Design (DPDP Act)
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-ultramarine dark:hover:text-cyan-400 transition-colors">
                  API Docs (OpenAPI)
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional & Legal */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              Institution
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li>
                <Link href="/about" className="hover:text-ultramarine dark:hover:text-cyan-400 transition-colors">
                  Team & Mentorship
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-ultramarine dark:hover:text-cyan-400 transition-colors">
                  Incident Support
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/scamshield-ai/scamshield-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-ultramarine dark:hover:text-cyan-400 transition-colors"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-12 pt-8 border-t border-ink/10 dark:border-paper/10 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>
            &copy; 2026 ScamShield AI. Distributed under the Apache 2.0 open-source license.
          </p>
          <p className="max-w-xl text-center sm:text-right">
            <strong className="text-slate-700 dark:text-slate-300">Statutory Disclaimer:</strong> ScamShield AI provides automated algorithmic risk guidance, not formal cyber-forensic or legal counsel. For actual financial loss, file a complaint on{" "}
            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="underline hover:text-ultramarine dark:hover:text-cyan-400 font-medium">
              cybercrime.gov.in
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
