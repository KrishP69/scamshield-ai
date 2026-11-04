"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  CornerDownLeft,
  RotateCcw,
  ExternalLink,
  Lock,
  Layers,
  AlertTriangle,
  ChevronRight,
  Shield,
} from "lucide-react";
import { Button } from "./Button";

import { resilientFetch } from "@/lib/api";
import { generateFallbackPassport, TrustPassportData } from "@/lib/offline-scanner";
import { useI18n } from "@/lib/i18n";

const PRESET_SCENARIOS = [
  {
    key: "scenarioMarketplace",
    name: "Marketplace Advance Scam",
    platform: "facebook",
    text: "Hello, I am interested in buying your sofa set. I am currently posted in the Indian Army at Pune Cantonment so I cannot come in person. I will send a military truck to pick it up tomorrow morning. Please transfer Rs. 2,000 as refundable gate pass security deposit via UPI to verify your account, and I will immediately send the full payment of Rs. 25,000. Urgently send it within 15 minutes to confirm booking.",
  },
  {
    key: "scenarioKyc",
    name: "KYC Phishing Link",
    platform: "telegram",
    text: "Dear Customer, Your SBI Yono NetBanking account will be permanently deactivated today due to incomplete PAN KYC. Immediately update your KYC details to restore transactions: http://sbi-yono-kyc-update.xyz/login. Do not ignore or your funds will be seized.",
  },
  {
    key: "scenarioCrypto",
    name: "Crypto Giveaway Trap",
    platform: "telegram",
    text: "🎉 BINANCE OFFICIAL 10TH ANNIVERSARY AIRDROP 🎉 Send 0.5 ETH to official smart contract pool: 0x71C95911E9a5D330f4d621842EC243EE1343292e and immediately receive 3X back within 20 minutes! Guaranteed 300% instant returns. Connect your wallet now: https://t.me/BinanceGiftAirdropBot or enter your 12-word seed phrase.",
  },
  {
    key: "scenarioGenuine",
    name: "Genuine Seller (Safe)",
    platform: "facebook",
    text: "Hi! Yes, the bicycle is still available. You are welcome to come test ride it this Saturday in Bandra West between 4 PM and 7 PM. Cash or UPI on collection in person is completely fine with me. Let me know if that timing works for you!",
  },
];

export function ScannerInput() {
  const router = useRouter();
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [platform, setPlatform] = useState("facebook");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<TrustPassportData | null>(null);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Attempt scan via resilient client (5s timeout to prevent hanging UI)
      const res = await resilientFetch(
        "/api/v1/scans",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            platform,
            store_history: false,
          }),
        },
        5000
      );

      if (res.ok) {
        const data = await res.json();
        const passport = data.passport || generateFallbackPassport(text, platform);
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(`scan_${data.scan_id || passport.scan_id}`, JSON.stringify(passport));
          } catch {
            // Ignore quota errors
          }
        }
        setScanResult(passport);
        return;
      }
      throw new Error(`API returned HTTP ${res.status}`);
    } catch {
      // 2. Resilient instant fallback: generate rich local TrustPassport
      const fallbackPassport = generateFallbackPassport(text, platform);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`scan_${fallbackPassport.scan_id}`, JSON.stringify(fallbackPassport));
        } catch {
          // Ignore quota errors
        }
      }
      setScanResult(fallbackPassport);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setText(preset.text);
    setPlatform(preset.platform);
    setScanResult(null);
  };

  const handleReset = () => {
    setScanResult(null);
    setText("");
    setError(null);
  };

  return (
    <div className="w-full bg-white dark:bg-ink-800 rounded-2xl shadow-xl border border-ink/10 dark:border-paper/10 p-4 sm:p-6 transition-all">
      {/* Preset scenario pill buttons */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
        <span className="text-[11px] font-semibold text-ink/50 dark:text-paper/50 uppercase tracking-wider mr-1">
          {t("hero.tryScenario", "Try a scenario:")}
        </span>
        {PRESET_SCENARIOS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => loadPreset(p)}
            className="text-xs px-2.5 py-1 rounded-full bg-paper-200 dark:bg-ink-700 hover:bg-paper-300 dark:hover:bg-ink-600 text-ink/80 dark:text-paper/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine"
          >
            {t(`hero.${p.key}`, p.name)}
          </button>
        ))}
      </div>

      <form onSubmit={handleScan} className="space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (scanResult) setScanResult(null);
            }}
            rows={scanResult ? 3 : 4}
            maxLength={5000}
            placeholder={t("hero.placeholder", "Paste a suspicious Facebook Marketplace message, Telegram link, phone number, or crypto wallet address...")}
            className="w-full p-3.5 sm:p-4 pb-7 rounded-xl border border-ink/15 dark:border-paper/15 bg-paper/50 dark:bg-ink-900/50 text-ink dark:text-paper placeholder:text-ink/40 dark:placeholder:text-paper/40 focus:outline-none focus:ring-2 focus:ring-ultramarine text-sm sm:text-base resize-none transition-all"
            required
            aria-label="Input text message, link, or wallet address to inspect"
          />
          {text.length > 0 && (
            <span className="absolute bottom-2 right-3 text-[10px] font-mono text-ink/40 dark:text-paper/40 pointer-events-none">
              {text.length.toLocaleString()} / 5,000
            </span>
          )}
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Platform chips */}
          <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Target Platform">
            <span className="text-xs text-ink/60 dark:text-paper/60 mr-1 hidden sm:inline">{t("hero.platform", "Platform:")}</span>
            {["facebook", "telegram", "unknown"].map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={platform === p}
                onClick={() => setPlatform(p)}
                className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-colors font-medium ${
                  platform === p
                    ? "bg-ink dark:bg-paper text-white dark:text-ink shadow-sm"
                    : "bg-paper-200 dark:bg-ink-700 text-ink/70 dark:text-paper/70 hover:bg-paper-300 dark:hover:bg-ink-600"
                }`}
              >
                {p === "unknown" ? t("hero.other", "Other") : p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {scanResult && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-ink/70 dark:text-paper/70 hover:bg-paper-200 dark:hover:bg-ink-700 border border-ink/15 dark:border-paper/15 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}

            <Button
              type="submit"
              disabled={loading || !text.trim()}
              className="gap-2 px-5 py-2.5 text-sm font-semibold"
            >
              {loading ? (
                <span>{t("hero.analyzing", "Analyzing...")}</span>
              ) : (
                <>
                  <span>{scanResult ? "Re-Analyze" : t("hero.checkMessage", "Check Message")}</span>
                  <CornerDownLeft className="w-4 h-4 hidden sm:inline opacity-70" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* INLINE THREAT ANALYSIS PASSPORT CARD (NO REDIRECT!) */}
      {scanResult && (
        <div className="mt-5 pt-5 border-t border-ink/10 dark:border-paper/10 animate-in fade-in slide-in-from-top-3 duration-300 space-y-4">
          {/* Header Banner */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              scanResult.risk_score >= 70
                ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                : scanResult.risk_score >= 40
                ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  scanResult.risk_score >= 70
                    ? "bg-rose-600 text-white"
                    : scanResult.risk_score >= 40
                    ? "bg-amber-600 text-white"
                    : "bg-emerald-600 text-white"
                }`}
              >
                {scanResult.risk_score >= 70 ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : scanResult.risk_score >= 40 ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-sm sm:text-base uppercase tracking-wide">
                    {scanResult.level === "CRITICAL"
                      ? "Critical Threat Detected"
                      : scanResult.level === "HIGH"
                      ? "High Threat Suspected"
                      : scanResult.level === "CAUTION"
                      ? "Suspicious Interaction"
                      : "Verified Safe Interaction"}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-white/40 dark:bg-black/30 border border-current">
                    {Math.round(scanResult.confidence * 100)}% Confidence
                  </span>
                </div>
                <p className="text-xs opacity-90 mt-0.5 font-medium">
                  Typology: <span className="font-mono uppercase">{scanResult.scam_type.replace(/_/g, " ")}</span>
                </p>
              </div>
            </div>

            {/* Score pill */}
            <div className="flex items-center gap-2 sm:text-right shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider block opacity-75">
                  Threat Score
                </span>
                <span className="font-mono font-black text-2xl leading-none">
                  {scanResult.risk_score}
                  <span className="text-xs font-normal opacity-70"> / 100</span>
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-paper-200 dark:bg-ink-900 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ease-out rounded-full ${
                scanResult.risk_score >= 70
                  ? "bg-rose-500"
                  : scanResult.risk_score >= 40
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(5, scanResult.risk_score))}%` }}
            />
          </div>

          {/* Forensic Reasons */}
          {scanResult.reasons && scanResult.reasons.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink/60 dark:text-paper/60">
                Key Threat Indicators:
              </span>
              <div className="space-y-1.5">
                {scanResult.reasons.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-paper-100/80 dark:bg-ink-900/80 border border-ink/10 dark:border-paper/10 text-xs flex items-start gap-2"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        r.severity === "critical"
                          ? "bg-rose-500"
                          : r.severity === "high"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    <div>
                      <span className="font-bold text-ink dark:text-paper mr-1.5">
                        {r.title}:
                      </span>
                      <span className="text-ink/80 dark:text-paper/80 leading-relaxed">
                        {r.plain_text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Immediate Defense Checklist */}
          {scanResult.actions && scanResult.actions.length > 0 && (
            <div className="p-3.5 rounded-xl bg-ink-900 text-paper dark:bg-ink-950 border border-ink/20 dark:border-paper/10 text-xs space-y-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Immediate Defense Checklist:
              </span>
              <ul className="space-y-1">
                {scanResult.actions.slice(0, 3).map((act, i) => (
                  <li key={i} className="flex items-start gap-2 text-paper/90">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Action to View Dedicated Full Report */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-[11px] font-mono text-ink/50 dark:text-paper/50">
              ID: {scanResult.scan_id}
            </span>
            <button
              type="button"
              onClick={() => router.push(`/report/${scanResult.scan_id}`)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ultramarine dark:text-ultramarine-light hover:underline"
            >
              <span>View Full Detailed Forensic Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
