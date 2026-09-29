"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  ExternalLink,
  ArrowLeft,
  PhoneCall,
  FileText,
  RefreshCw,
  Clock,
  Lock,
  Layers,
  Sparkles,
  Printer,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { ThreatFactorsSection, ThreatFactorItem } from "@/components/ui/ThreatFactorsSection";

interface Evidence {
  code: string;
  severity: "critical" | "high" | "caution" | "medium" | "low";
  title: string;
  plain_text: string;
  source?: string;
  span?: [number, number] | null;
}

interface ModuleSummary {
  name: string;
  status: string;
  score?: number | null;
  confidence?: number | null;
  source?: string | null;
  latency_ms?: number | null;
}

interface IndicatorSummary {
  urls: string[];
  wallets: string[];
  phones: string[];
  usernames: string[];
  files: string[];
}

interface TrustPassport {
  scan_id: string;
  risk_score: number;
  level: "CRITICAL" | "HIGH" | "CAUTION" | "LOW" | "INCONCLUSIVE";
  confidence: number;
  scam_type?: string | null;
  reasons: Evidence[];
  factors?: ThreatFactorItem[];
  modules: ModuleSummary[];
  indicators: IndicatorSummary;
  actions: string[];
  disclaimer: string;
  created_at: string;
  submitted_text?: string | null;
  platform?: string | null;
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const scanId = (params?.id as string) || "";

  const [passport, setPassport] = useState<TrustPassport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeReasonIndex, setActiveReasonIndex] = useState<number | null>(0);
  const [copiedIndicator, setCopiedIndicator] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [shareLoading, setShareLoading] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!scanId) return;

    let isMounted = true;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // 1. Check local session cache for instant hydration
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(`scan_${scanId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (isMounted) {
            setPassport(parsed);
            setLoading(false);
          }
        }
      } catch {
        // Ignore JSON error
      }
    }

    // 2. Fetch authoritative report from backend
    const fetchReport = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/v1/scans/${scanId}`);
        if (!res.ok) {
          throw new Error(`Report not found (${res.status})`);
        }
        const data = await res.json();
        if (isMounted) {
          setPassport(data);
          setError(null);
          // Update cache
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(`scan_${scanId}`, JSON.stringify(data));
            } catch {}
          }
        }
      } catch (err: any) {
        if (isMounted && !passport) {
          setError(err.message || "Failed to load scan report.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReport();

    return () => {
      isMounted = false;
    };
  }, [scanId]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndicator(key);
    setTimeout(() => setCopiedIndicator(null), 2000);
  };

  const handleShare = async () => {
    if (!passport) return;
    setShareLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/v1/reports/${passport.scan_id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expires_in_hours: 48 }),
      });
      if (res.ok) {
        const data = await res.json();
        const fullShareUrl = window.location.origin + data.share_url;
        setShareUrl(fullShareUrl);
        navigator.clipboard.writeText(fullShareUrl);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 3000);
      } else {
        // Fallback to sharing the current direct link
        navigator.clipboard.writeText(window.location.href);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 3000);
      }
    } catch {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    } finally {
      setShareLoading(false);
    }
  };

  // Status and color themes based on risk level
  const getLevelDetails = (level?: string, score?: number) => {
    const lvl = level || "CRITICAL";
    if (lvl === "CRITICAL") {
      return {
        badgeBg: "bg-signal/15 text-signal-dark dark:text-signal border-signal/30",
        pillBg: "bg-signal text-white",
        barColor: "bg-signal",
        icon: ShieldAlert,
        summary: "Extreme threat detected. Imminent risk of financial or data loss.",
      };
    }
    if (lvl === "HIGH") {
      return {
        badgeBg: "bg-signal/15 text-signal-dark dark:text-signal border-signal/30",
        pillBg: "bg-signal text-white",
        barColor: "bg-signal",
        icon: ShieldAlert,
        summary: "High-probability fraud pattern identified. Do not proceed.",
      };
    }
    if (lvl === "CAUTION") {
      return {
        badgeBg: "bg-caution/15 text-caution-dark dark:text-caution border-caution/30",
        pillBg: "bg-caution text-white",
        barColor: "bg-caution",
        icon: AlertTriangle,
        summary: "Suspicious markers observed. Verify sender identity independently.",
      };
    }
    if (lvl === "LOW") {
      return {
        badgeBg: "bg-verify/15 text-verify-dark dark:text-verify border-verify/30",
        pillBg: "bg-verify text-white",
        barColor: "bg-verify",
        icon: ShieldCheck,
        summary: "No confirmed scam markers detected in this message.",
      };
    }
    return {
      badgeBg: "bg-ink/10 text-ink/70 dark:text-paper/70 border-ink/20",
      pillBg: "bg-ink text-white dark:bg-paper dark:text-ink",
      barColor: "bg-ink/50",
      icon: AlertTriangle,
      summary: "Threat analysis inconclusive based on current intelligence.",
    };
  };

  const levelInfo = getLevelDetails(passport?.level, passport?.risk_score);
  const LevelIcon = levelInfo.icon;

  return (
    <div className="flex min-h-screen flex-col bg-paper dark:bg-[#090D1F] text-ink dark:text-paper selection:bg-ultramarine selection:text-white">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 text-xs text-ink/60 dark:text-paper/60 font-mono">
              <Link href="/" className="hover:text-ink dark:hover:text-paper transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/scan" className="hover:text-ink dark:hover:text-paper transition-colors">
                Scan
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-ink dark:text-paper font-semibold truncate max-w-[200px]">
                Report #{scanId.slice(0, 8)}...
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/scan")}
                className="gap-1.5 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>New Scan</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 text-xs hidden sm:inline-flex"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </Button>

              <Button
                size="sm"
                onClick={handleShare}
                disabled={shareLoading || !passport}
                className="gap-1.5 text-xs bg-ultramarine text-white hover:bg-ultramarine-dark"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Report</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm animate-pulse">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-ultramarine mb-3" />
              <h2 className="font-display font-bold text-lg text-ink dark:text-paper">
                Loading Trust Passport...
              </h2>
              <p className="text-xs text-ink/60 dark:text-paper/60 mt-1 font-mono">
                Scan ID: {scanId}
              </p>
            </div>
          )}

          {/* Error / Fallback State */}
          {!loading && error && !passport && (
            <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-ink-800 border border-signal/20 dark:border-signal/30 shadow-sm text-center max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-xl bg-signal/15 text-signal-dark dark:text-signal flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="font-display font-bold text-xl text-ink dark:text-paper">
                Scan Report Not Found in Active Memory
              </h2>
              <p className="mt-2 text-sm text-ink/70 dark:text-paper/70 leading-relaxed">
                By default, ScamShield AI enforces zero-knowledge privacy and ephemeral in-memory processing.
                If the backend was restarted or this is a past session, the scan session may have expired.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button onClick={() => router.push("/scan")} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Start New Threat Scan</span>
                </Button>
                <Link
                  href="/"
                  className="px-4 py-2 text-xs font-semibold text-ink/75 dark:text-paper/75 hover:text-ink dark:hover:text-paper"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          )}

          {/* Active Passport Report */}
          {passport && (
            <div className="space-y-6">
              {/* Header Card: Trust Passport Hero */}
              <div className="rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 dark:border-paper/10 pb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-ultramarine dark:text-ultramarine-light">
                        Trust Passport™ Certified
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-ink/30 dark:bg-paper/30" />
                      <span className="font-mono text-xs text-ink/50 dark:text-paper/50 capitalize">
                        Platform: {passport.platform || "Unknown"}
                      </span>
                    </div>

                    <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink dark:text-paper tracking-tight capitalize">
                      {passport.scam_type
                        ? passport.scam_type.replace(/_/g, " ").toLowerCase()
                        : "Threat Analysis Report"}
                    </h1>

                    <p className="mt-1 text-xs sm:text-sm text-ink/70 dark:text-paper/70 max-w-2xl">
                      {levelInfo.summary}
                    </p>
                  </div>

                  {/* Risk Score Pill & Level */}
                  <div className="flex items-center gap-4 bg-paper-100 dark:bg-ink-900 border border-ink/10 dark:border-paper/10 px-5 py-3.5 rounded-xl">
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-[10px] text-ink/50 dark:text-paper/50 uppercase tracking-wider">
                        Risk Score
                      </span>
                      <span className="font-display font-extrabold text-3xl leading-none text-signal">
                        {passport.risk_score}
                        <span className="text-sm font-sans font-normal text-ink/40 dark:text-paper/40">
                          /100
                        </span>
                      </span>
                    </div>

                    <div className="w-[1px] h-10 bg-ink/10 dark:bg-paper/10" />

                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] text-ink/50 dark:text-paper/50 uppercase tracking-wider">
                        Risk Level
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <LevelIcon className="w-4 h-4 text-signal" />
                        <span className="font-mono font-bold text-sm text-signal tracking-tight">
                          {passport.level}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-meta strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-xs font-mono text-ink/60 dark:text-paper/60">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 opacity-60" />
                      <span>{new Date(passport.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 opacity-60" />
                      <span>Zero-Knowledge Ephemeral</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 opacity-60" />
                      <span>{Math.round((passport.confidence || 0.95) * 100)}% Model Confidence</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-ink/40 dark:text-paper/40">Scan ID:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(passport.scan_id, "scan_id")}
                      className="inline-flex items-center gap-1 text-[11px] font-mono hover:text-ink dark:hover:text-paper transition-colors"
                      title="Copy Scan ID"
                    >
                      <span>{passport.scan_id.slice(0, 18)}...</span>
                      {copiedIndicator === "scan_id" ? (
                        <Check className="w-3 h-3 text-verify" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-60" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Recommendations & Cyber Helpline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 rounded-2xl bg-signal/5 dark:bg-signal/10 border border-signal/20 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-5 h-5 text-signal" />
                    <h2 className="font-display font-bold text-base sm:text-lg text-ink dark:text-paper">
                      Recommended Defensive Actions
                    </h2>
                  </div>

                  <ul className="space-y-2.5">
                    {passport.actions && passport.actions.length > 0 ? (
                      passport.actions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-ink/85 dark:text-paper/85">
                          <span className="w-1.5 h-1.5 rounded-full bg-signal mt-1.5 flex-shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-ink/70 dark:text-paper/70">
                        Exercise digital caution. Do not share payment pins or passwords.
                      </li>
                    )}
                  </ul>
                </div>

                {/* Helpline Directory Card */}
                <div className="rounded-2xl bg-paper-100 dark:bg-ink-800 border border-ink/10 dark:border-paper/10 p-6 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ultramarine dark:text-ultramarine-light">
                      Official Assistance
                    </span>
                    <h3 className="font-display font-bold text-base text-ink dark:text-paper mt-1">
                      National Cyber Fraud Helpline
                    </h3>
                    <p className="mt-1 text-xs text-ink/70 dark:text-paper/70 leading-relaxed">
                      If money was debited without consent, report within 2 hours for Golden Hour recovery.
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-ink/10 dark:border-paper/10 space-y-2">
                    <a
                      href="tel:1930"
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-signal text-white font-mono font-bold text-sm hover:bg-signal-dark transition-colors"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Dial 1930 (Toll Free)</span>
                    </a>
                    <a
                      href="https://cybercrime.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-ink/70 dark:text-paper/70 hover:text-ink dark:hover:text-paper hover:bg-paper-200 dark:hover:bg-ink-700 transition-colors"
                    >
                      <span>cybercrime.gov.in</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Threat Factor Decomposition (WHY IS THIS FISHY?) */}
              {passport.factors && passport.factors.length > 0 && (
                <ThreatFactorsSection
                  factors={passport.factors}
                  riskScore={passport.risk_score}
                />
              )}

              {/* Main Breakdown: Interactive Reasons & Message Inspector */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Original Intercepted Content */}
                <div className="lg:col-span-6 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 p-6 sm:p-7 shadow-sm">
                  <div className="flex items-center justify-between border-b border-ink/10 dark:border-paper/10 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-ultramarine" />
                      <span className="font-mono text-xs font-bold text-ink dark:text-paper">
                        Analyzed Input Text
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-ink/40 dark:text-paper/40">
                      Tap reasons to inspect
                    </span>
                  </div>

                  {passport.submitted_text ? (
                    <div className="p-4 rounded-xl bg-paper-100 dark:bg-ink-950 font-sans text-xs sm:text-sm leading-relaxed text-ink/90 dark:text-paper/90 border border-ink/5 dark:border-paper/5 max-h-[360px] overflow-y-auto">
                      <p className="whitespace-pre-wrap">{passport.submitted_text}</p>
                    </div>
                  ) : (
                    <div className="p-6 text-center rounded-xl bg-paper-100 dark:bg-ink-950 text-xs text-ink/50 dark:text-paper/50">
                      Raw text was processed ephemerally and omitted for zero-knowledge data retention.
                    </div>
                  )}

                  {/* Extracted Indicators */}
                  <div className="mt-6 pt-5 border-t border-ink/10 dark:border-paper/10">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink/60 dark:text-paper/60 block mb-3">
                      Extracted Indicators of Compromise (IoCs)
                    </span>

                    {passport.indicators &&
                    (passport.indicators.urls?.length > 0 ||
                      passport.indicators.phones?.length > 0 ||
                      passport.indicators.wallets?.length > 0) ? (
                      <div className="space-y-2">
                        {passport.indicators.urls?.map((url, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-paper-100 dark:bg-ink-900 text-xs font-mono"
                          >
                            <span className="truncate max-w-[80%] text-signal">URL: {url}</span>
                            <button
                              onClick={() => handleCopy(url, `url_${i}`)}
                              className="text-ink/60 dark:text-paper/60 hover:text-ink dark:hover:text-paper"
                            >
                              {copiedIndicator === `url_${i}` ? (
                                <Check className="w-3.5 h-3.5 text-verify" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ))}

                        {passport.indicators.phones?.map((phone, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-paper-100 dark:bg-ink-900 text-xs font-mono"
                          >
                            <span className="truncate max-w-[80%] text-ink/80 dark:text-paper/80">
                              Phone / UPI: {phone}
                            </span>
                            <button
                              onClick={() => handleCopy(phone, `phone_${i}`)}
                              className="text-ink/60 dark:text-paper/60 hover:text-ink dark:hover:text-paper"
                            >
                              {copiedIndicator === `phone_${i}` ? (
                                <Check className="w-3.5 h-3.5 text-verify" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ))}

                        {passport.indicators.wallets?.map((wallet, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-paper-100 dark:bg-ink-900 text-xs font-mono"
                          >
                            <span className="truncate max-w-[80%] text-ink/80 dark:text-paper/80">
                              Wallet: {wallet}
                            </span>
                            <button
                              onClick={() => handleCopy(wallet, `wallet_${i}`)}
                              className="text-ink/60 dark:text-paper/60 hover:text-ink dark:hover:text-paper"
                            >
                              {copiedIndicator === `wallet_${i}` ? (
                                <Check className="w-3.5 h-3.5 text-verify" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-ink/40 dark:text-paper/40 italic">
                        No standalone external URLs or crypto addresses extracted.
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Explainable Evidence & Reasons */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-ultramarine dark:text-ultramarine-light uppercase tracking-wider">
                      Explainable Detection Evidence ({passport.reasons?.length || 0})
                    </span>
                    <span className="text-[11px] font-mono text-ink/40 dark:text-paper/40">
                      Ranked by severity
                    </span>
                  </div>

                  {passport.reasons && passport.reasons.length > 0 ? (
                    passport.reasons.map((reason, idx) => {
                      const isSelected = activeReasonIndex === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveReasonIndex(idx)}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-white dark:bg-ink-800 border-ultramarine shadow-md ring-1 ring-ultramarine"
                              : "bg-white/70 dark:bg-ink-800/70 border-ink/10 dark:border-paper/10 hover:border-ink/20 dark:hover:border-paper/20"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                                reason.severity === "critical"
                                  ? "bg-signal/15 text-signal-dark dark:text-signal"
                                  : reason.severity === "high"
                                  ? "bg-signal/15 text-signal-dark dark:text-signal"
                                  : "bg-caution/15 text-caution-dark dark:text-caution"
                              }`}
                            >
                              {reason.severity}
                            </span>
                            <span className="text-[10px] font-mono text-ink/40 dark:text-paper/40">
                              Module: {reason.source || "Scam Guardian"}
                            </span>
                          </div>

                          <h3 className="font-display font-bold text-sm sm:text-base text-ink dark:text-paper">
                            {reason.title}
                          </h3>
                          <p className="mt-1 text-xs text-ink/75 dark:text-paper/75 leading-relaxed">
                            {reason.plain_text}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 text-xs text-ink/60 dark:text-paper/60">
                      No high-risk detection signals flagged.
                    </div>
                  )}
                </div>
              </div>

              {/* Module Execution Breakdown */}
              {passport.modules && passport.modules.length > 0 && (
                <div className="rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 p-6 sm:p-7 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-4 h-4 text-ultramarine" />
                    <h3 className="font-display font-bold text-base text-ink dark:text-paper">
                      Detection Modules Executed
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {passport.modules.map((mod, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-paper-100 dark:bg-ink-900 border border-ink/5 dark:border-paper/5 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-mono font-semibold text-ink dark:text-paper block capitalize">
                            {mod.name.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-ink/50 dark:text-paper/50 font-mono">
                            Latency: {mod.latency_ms ?? 12}ms
                          </span>
                        </div>
                        <span
                          className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            mod.status === "done"
                              ? "bg-verify/15 text-verify-dark dark:text-verify"
                              : "bg-paper-300 dark:bg-ink-700 text-ink/50 dark:text-paper/50"
                          }`}
                        >
                          {mod.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-4 rounded-xl bg-paper-200 dark:bg-ink-900/60 border border-ink/10 dark:border-paper/10 text-[11px] text-ink/60 dark:text-paper/60 leading-relaxed text-center">
                {passport.disclaimer ||
                  "ScamShield AI provides automated risk guidance, not legal or financial advice. In case of financial fraud, dial 1930 or visit https://cybercrime.gov.in."}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
