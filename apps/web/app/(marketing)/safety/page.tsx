import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Server,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Safety, Privacy & Threat Model — ScamShield AI",
  description:
    "Learn about ScamShield AI's privacy-first architecture, DPDP Act 2023 compliance, SSRF mitigations, and data retention standards.",
};

export default function SafetyPage() {
  const securityPillars = [
    {
      title: "SSRF Defense in URL Unshortening",
      desc: "To prevent Server-Side Request Forgery (SSRF) when tracing shortened URLs, our system pre-resolves DNS records and strictly rejects private, loopback (127.0.0.1), link-local, and cloud metadata (169.254.169.254) IP addresses before issuing HTTP GET or HEAD requests.",
      icon: Server,
    },
    {
      title: "Zero-Knowledge File Handling",
      desc: "Uploaded APKs and screenshots are analyzed inside non-privileged, isolated sandboxes. We compute SHA-256 hashes locally for threat lookup and never upload private file contents to external vendors without explicit consent. Files are automatically destroyed after analysis.",
      icon: FileCheck,
    },
    {
      title: "Defanged Threat Indicators",
      desc: "Extracted malicious URLs and wallets are defanged (e.g. hxxps://domain[.]top) in the UI to prevent accidental click-throughs by victims. URLs are rendered as inert text rather than clickable hyper-references.",
      icon: Lock,
    },
    {
      title: "K-Anonymity External Queries",
      desc: "When checking URLs against Google Safe Browsing, only truncated 32-bit SHA-256 hash prefixes are transmitted. External threat providers can never reconstruct the full target URL from the query.",
      icon: EyeOff,
    },
  ];

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="font-mono text-xs font-semibold text-verify uppercase tracking-wider">
            Security & Data Protection
          </span>
          <h1 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink dark:text-paper tracking-tight">
            Privacy by Design & Threat Architecture
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ink/75 dark:text-paper/75 leading-relaxed">
            ScamShield AI is built on the premise that security software must respect civil privacy. We do not harvest your phone contacts, scrape social networks, or monetize private communication.
          </p>
        </div>

        {/* Security Controls Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {securityPillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-verify/10 text-verify flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="font-display font-bold text-xl text-ink dark:text-paper">
                  {p.title}
                </h2>
                <p className="text-sm text-ink/70 dark:text-paper/70 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* DPDP Act Compliance Section */}
        <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-paper-100 dark:bg-ink-900 border border-ink/10 dark:border-paper/10">
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs font-semibold text-ultramarine uppercase">
              Regulatory Alignment
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink dark:text-paper">
              India&apos;s DPDP Act 2023 Principles
            </h2>
            <p className="text-sm sm:text-base text-ink/75 dark:text-paper/75 leading-relaxed">
              We proactively incorporate the foundational tenets of India&apos;s Digital Personal Data Protection Act:
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-ink/80 dark:text-paper/80 pt-2">
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-verify shrink-0 mt-0.5" />
                <span>
                  <strong>Purpose Limitation:</strong> Submitted text or media is processed strictly to generate the Trust Passport and never repurposed for marketing or profiling.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-verify shrink-0 mt-0.5" />
                <span>
                  <strong>Data Minimization:</strong> Anonymous scans do not require email or phone numbers. Input text is scrubbed of identifiable personal indicators.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-verify shrink-0 mt-0.5" />
                <span>
                  <strong>Right to Erasure:</strong> Users who authenticate and save scan history can trigger instantaneous cascade deletion across our database.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Statutory Legal Disclaimer */}
        <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-2">
              <strong className="font-semibold block text-base">Statutory Notice & Law Enforcement Reporting:</strong>
              <p>
                ScamShield AI provides automated algorithmic threat estimations and educational risk scores. It is not an authorized legal or cyber-forensic authority.
              </p>
              <p>
                If you have been a victim of financial fraud or extortion, immediately register a complaint with the Government of India&apos;s National Cyber Crime Reporting Portal at{" "}
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline hover:text-ultramarine"
                >
                  cybercrime.gov.in
                </a>{" "}
                or dial the national toll-free helpline{" "}
                <a href="tel:1930" className="font-bold underline hover:text-ultramarine">
                  1930
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
