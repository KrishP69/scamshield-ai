"use client";

import React, { useState } from "react";
import {
  Link2,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Layers,
  Sparkles,
  Info,
  Globe,
  Radio,
  Lock,
} from "lucide-react";
import { Button } from "./Button";

const SAMPLE_LINKS = [
  {
    name: "SBI KYC Phishing",
    url: "http://sbi-yono-kyc-update.xyz/login",
    desc: "Banking Brand Impersonation on .xyz TLD",
  },
  {
    name: "Punycode Homoglyph",
    url: "https://xn--80ak6aa92e.com",
    desc: "Cyrillic look-alike spoofing Apple",
  },
  {
    name: "SSRF Intranet IP",
    url: "http://192.168.1.1/admin-config",
    desc: "Private RFC 1918 Subnet Probe",
  },
  {
    name: "Telegram Airdrop Trap",
    url: "https://telegram-free-airdrop.top/claim",
    desc: "Seed Phrase & Wallet Drainage Lure",
  },
  {
    name: "Genuine Domain",
    url: "https://google.com",
    desc: "Official Authenticated Service",
  },
];

export interface RealtimeScanResult {
  url: string;
  final_url: string;
  is_fishy: boolean;
  risk_score: number;
  risk_level: string;
  primary_detection_method: string;
  detection_methods_used: string[];
  reasons: Array<{
    code: string;
    title: string;
    description: string;
    severity: string;
  }>;
  technical_breakdown: {
    unshortened_hops: number;
    is_punycode: boolean;
    has_homoglyphs: boolean;
    is_ip_host: boolean;
    ip_address?: string | null;
    entropy: number;
    tld: string;
    matched_keywords: string[];
    matched_brands: string[];
    threat_feed_source?: string;
  };
  latency_ms: number;
  timestamp: string;
}

interface RealtimeLinkScannerProps {
  initialUrl?: string;
  onScanComplete?: (result: RealtimeScanResult) => void;
}

export function RealtimeLinkScanner({ initialUrl = "", onScanComplete }: RealtimeLinkScannerProps) {
  const [url, setUrl] = useState<string>(initialUrl);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<RealtimeScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "hi">("en");

  const handleCheck = async (urlToCheck?: string) => {
    const target = (urlToCheck || url).trim();
    if (!target) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${apiUrl}/api/v1/links/check-realtime`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });

      if (!res.ok) {
        throw new Error(`API returned HTTP ${res.status}`);
      }

      const data: RealtimeScanResult = await res.json();
      setResult(data);
      if (onScanComplete) {
        onScanComplete(data);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to inspect link in real-time. Please verify backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    handleCheck(sampleUrl);
  };

  return (
    <div className="w-full bg-white dark:bg-ink-800 rounded-2xl border border-ink/10 dark:border-paper/10 shadow-xl p-4 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-ultramarine text-white flex items-center justify-center shadow-sm">
            <Link2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base sm:text-lg text-ink dark:text-paper leading-tight">
              Real-Time Fishy Link Interceptor
            </h3>
            <p className="text-xs text-ink/60 dark:text-paper/60">
              Live inspection across 6 autonomous vectors with instant detection method attribution
            </p>
          </div>
        </div>

        {/* Language Toggle for Explanations */}
        <div className="flex items-center gap-1 bg-paper-200 dark:bg-ink-700 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              lang === "en"
                ? "bg-white dark:bg-ink-800 text-ultramarine shadow-sm"
                : "text-ink/60 dark:text-paper/60"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang("hi")}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              lang === "hi"
                ? "bg-white dark:bg-ink-800 text-ultramarine shadow-sm"
                : "text-ink/60 dark:text-paper/60"
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Quick Test Chips */}
      <div className="mb-4">
        <span className="text-[11px] font-semibold text-ink/50 dark:text-paper/50 uppercase tracking-wider block mb-1.5">
          One-Click Test Real-Time Samples:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_LINKS.map((sample) => (
            <button
              key={sample.name}
              type="button"
              onClick={() => loadSample(sample.url)}
              className="text-xs px-2.5 py-1 rounded-full bg-paper-200 dark:bg-ink-700 hover:bg-paper-300 dark:hover:bg-ink-600 text-ink/80 dark:text-paper/80 border border-ink/5 dark:border-paper/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine"
            >
              <span className="font-semibold">{sample.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCheck();
        }}
        className="space-y-3"
      >
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste suspicious link (e.g., http://sbi-yono-kyc-update.xyz/login or short bit.ly link)..."
            className="w-full pl-3.5 pr-28 py-3 rounded-xl bg-paper-100 dark:bg-ink-700/60 border border-ink/15 dark:border-paper/15 text-ink dark:text-paper text-sm font-mono placeholder:font-sans placeholder:text-ink/40 dark:placeholder:text-paper/40 focus:outline-none focus:ring-2 focus:ring-ultramarine"
          />
          <div className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center">
            <Button
              type="submit"
              disabled={loading || !url.trim()}
              size="sm"
              className="h-full px-4 text-xs font-semibold gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <span>Inspect Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Real-time Result Card */}
      {result && (
        <div className="mt-5 rounded-xl border border-ink/15 dark:border-paper/15 overflow-hidden transition-all animate-in fade-in duration-300">
          {/* Status Banner */}
          <div
            className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              result.is_fishy
                ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-b border-rose-500/20"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-b border-emerald-500/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  result.is_fishy ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                }`}
              >
                {result.is_fishy ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-display font-bold text-base sm:text-lg leading-tight">
                    {result.is_fishy
                      ? "🚨 FISHY / MALICIOUS LINK DETECTED"
                      : "✅ CLEAN & VERIFIED DESTINATION"}
                  </h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                      result.risk_level === "CRITICAL"
                        ? "bg-rose-500 text-white"
                        : result.risk_level === "HIGH"
                        ? "bg-amber-500 text-white"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {result.risk_level} RISK
                  </span>
                </div>
                <p className="text-xs opacity-90 mt-0.5 font-mono truncate max-w-md sm:max-w-xl">
                  Target: {result.final_url}
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
              <span className="text-2xl font-display font-extrabold">
                {result.risk_score}
                <span className="text-sm font-normal opacity-70">/100</span>
              </span>
              <span className="text-[11px] opacity-75">
                Latency: {result.latency_ms}ms
              </span>
            </div>
          </div>

          {/* Primary Detection Method Highlight (KEY USER REQUIREMENT) */}
          <div className="p-4 bg-ultramarine/[0.04] dark:bg-ultramarine/[0.08] border-b border-ink/10 dark:border-paper/10">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-ultramarine text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ultramarine dark:text-ultramarine-light block">
                  Exact Detection Method Used:
                </span>
                <p className="text-sm sm:text-base font-display font-bold text-ink dark:text-paper">
                  {result.primary_detection_method}
                </p>
              </div>
            </div>

            {/* Other Triggered Detection Vectors */}
            {result.detection_methods_used.length > 1 && (
              <div className="mt-2.5 pt-2 border-t border-ultramarine/10 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-semibold text-ink/60 dark:text-paper/60 uppercase">
                  Additional Co-Detectors:
                </span>
                {result.detection_methods_used.slice(1).map((m, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded bg-paper-200 dark:bg-ink-700 text-ink/80 dark:text-paper/80 font-mono"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Technical Breakdown Grid */}
          <div className="p-4 bg-paper-50 dark:bg-ink-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b border-ink/10 dark:border-paper/10">
            <div className="p-2.5 rounded-lg bg-white dark:bg-ink-700/50 border border-ink/5 dark:border-paper/5">
              <span className="text-ink/50 dark:text-paper/50 block text-[10px] uppercase font-semibold">
                Homoglyph Spoofing
              </span>
              <span
                className={`font-semibold ${
                  result.technical_breakdown.has_homoglyphs || result.technical_breakdown.is_punycode
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {result.technical_breakdown.has_homoglyphs || result.technical_breakdown.is_punycode
                  ? "🚨 Detected (Look-alike)"
                  : "Clean ASCII"}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-ink-700/50 border border-ink/5 dark:border-paper/5">
              <span className="text-ink/50 dark:text-paper/50 block text-[10px] uppercase font-semibold">
                SSRF / IP Host
              </span>
              <span
                className={`font-semibold ${
                  result.technical_breakdown.is_ip_host
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {result.technical_breakdown.is_ip_host
                  ? `Blocked (${result.technical_breakdown.ip_address || "Private IP"})`
                  : "Safe Hostname"}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-ink-700/50 border border-ink/5 dark:border-paper/5">
              <span className="text-ink/50 dark:text-paper/50 block text-[10px] uppercase font-semibold">
                Domain Entropy (DGA)
              </span>
              <span className="font-semibold text-ink dark:text-paper">
                {result.technical_breakdown.entropy} bits/char
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-ink-700/50 border border-ink/5 dark:border-paper/5">
              <span className="text-ink/50 dark:text-paper/50 block text-[10px] uppercase font-semibold">
                Redirect Hops
              </span>
              <span className="font-semibold text-ink dark:text-paper">
                {result.technical_breakdown.unshortened_hops > 0
                  ? `${result.technical_breakdown.unshortened_hops} Redirect Hop(s)`
                  : "Direct Link"}
              </span>
            </div>
          </div>

          {/* Explainable Reasons */}
          <div className="p-4 space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-ink/70 dark:text-paper/70">
              {lang === "hi" ? "स्पष्टीकरण और साक्ष्य:" : "Explainable Findings & Evidence:"}
            </h5>
            {result.reasons.map((r, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-paper-100/70 dark:bg-ink-700/40 border border-ink/10 dark:border-paper/10 text-xs space-y-0.5"
              >
                <div className="font-semibold text-ink dark:text-paper flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      r.severity === "critical"
                        ? "bg-rose-500"
                        : r.severity === "high"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <span>{r.title}</span>
                </div>
                <p className="text-ink/75 dark:text-paper/75 text-[11px] pl-3.5">
                  {lang === "hi"
                    ? r.code === "PHISHING_URL_HOMOGLYPH"
                      ? "लिंक में असली वेबसाइट जैसे दिखने वाले नकली अक्षरों (हॉमोग्लिफ़ / प्यूनीकोड) का उपयोग किया गया है।"
                      : r.code === "PHISHING_URL_EXTERNAL_INTEL"
                      ? "यह लिंक वास्तविक समय थ्रेट डेटाबेस में एक पुष्टि की गई फ़िशिंग / मैलवेयर वेबसाइट है।"
                      : r.code === "PHISHING_URL_SSRF"
                      ? "यह लिंक आंतरिक या निजी आईपी नेटवर्क पते को निशाना बना रहा है (SSRF जोखिम)।"
                      : r.code === "PHISHING_URL_HEURISTICS"
                      ? "इस लिंक का डोमेन (.xyz / .top) और कीवर्ड्स बैंक या सरकारी पोर्टल की नकल करते हैं।"
                      : r.description
                    : r.description}
                </p>
              </div>
            ))}

            {result.is_fishy && (
              <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs">
                <span className="font-bold">⚠️ Recommended Action: </span>
                <span>
                  {lang === "hi"
                    ? "इस लिंक पर क्लिक न करें और न ही कोई विवरण या ओटीपी दर्ज करें। यदि बैंक से संबंधित है तो राष्ट्रीय साइबर क्राइम हेल्पलाइन 1930 पर रिपोर्ट करें।"
                    : "Do NOT click, enter passwords, or link your UPI wallet. Block the sender and report to national cybercrime helpline 1930."}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
