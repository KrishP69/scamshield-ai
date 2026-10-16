"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Link2,
  Phone,
  Coins,
  FileCode,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  AlertTriangle,
  Loader2,
  Sparkles,
  Radio,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { RealtimeLinkScanner } from "@/components/ui/RealtimeLinkScanner";
import { LiveThreatStream } from "@/components/ui/LiveThreatStream";
import { ThreatFactorsSection } from "@/components/ui/ThreatFactorsSection";
import { ScreenshotInspector } from "@/components/ui/ScreenshotInspector";
import { resilientFetch } from "@/lib/api";
import { generateFallbackPassport } from "@/lib/offline-scanner";

const PRESET_MESSAGES = [
  {
    label: "Telegram VIP Crypto Signals",
    platform: "telegram",
    text: "VIP Crypto Signals Channel! Daily 200% - 500% guaranteed profit. Join our exclusive insider group: t.me/crypto_vip_pumps. Send 100 USDT get 500 USDT in 2 hours!",
  },
  {
    label: "Telegram Task & Rating Job",
    platform: "telegram",
    text: "Part time job online: Watch youtube videos, like and get ₹50 per like. Daily payout 2000-5000 INR on UPI. Just need 20-30 mins daily. Contact manager on Telegram: @hr_priya or t.me/dailyearn",
  },
  {
    label: "Telegram Security Bot Phishing",
    platform: "telegram",
    text: "Telegram Notification: Your account will be terminated in 24 hours due to spam report. Click t.me/TelegramVerificationBot to verify identity or enter your login code.",
  },
  {
    label: "Electricity Power Cut Tonight",
    platform: "other",
    text: "Dear User, Your electricity line will be disconnected tonight at 9.30 pm from electricity office because your previous month bill was not updated. Please immediately contact with our electricity officer 8250000000.",
  },
  {
    label: "FedEx Digital Arrest Warrant",
    platform: "other",
    text: "Your parcel from FedEx / DHL tracking number 892189 is on hold at Delhi Airport Customs due to illegal narcotics MDMA found. Non-bailable arrest warrant issued. Connect on Skype for digital arrest.",
  },
  {
    label: "Genuine Safe Message",
    platform: "facebook",
    text: "Hi! Yes, the bicycle is still available. You can come test ride it this Saturday in Bandra West between 4 PM and 7 PM. Cash or UPI on collection in person is completely fine with me!",
  },
];

function ScanContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("link");
  const [platform, setPlatform] = useState("telegram");
  const [content, setContent] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [selectedThreatUrl, setSelectedThreatUrl] = useState<string>("");

  useEffect(() => {
    const textParam = searchParams.get("text");
    const platParam = searchParams.get("platform");
    if (textParam) {
      setContent(textParam);
      setActiveTab("message");
      if (platParam) {
        setPlatform(platParam);
      }
      const fallback = generateFallbackPassport(textParam, platParam || "facebook");
      setResult(fallback);
    }
  }, [searchParams]);

  const tabs = [
    { id: "link", label: "Telegram & Fishy Link Interceptor", icon: Link2, badge: "REALTIME" },
    { id: "screenshot", label: "Fishy Screenshot & Absurd Deals", icon: ImageIcon, badge: "VISUAL AI" },
    { id: "message", label: "Chat & Social Engineering", icon: FileText },
    { id: "phone", label: "Phone / Profile", icon: Phone },
    { id: "crypto", label: "Crypto Wallet", icon: Coins },
    { id: "apk", label: "APK / File", icon: FileCode },
  ];

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;

    setScanning(true);
    setResult(null);

    try {
      const res = await resilientFetch(
        "/api/v1/scans",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: content,
            content,
            platform,
            store_history: false,
          }),
        },
        6000
      );

      if (res.ok) {
        const data = await res.json();
        if (data.passport) {
          setResult(data.passport);
          return;
        } else if (data.scan_id) {
          const pRes = await resilientFetch(`/api/v1/scans/${data.scan_id}`, {}, 5000);
          if (pRes.ok) {
            const passport = await pRes.json();
            setResult(passport);
            return;
          }
        }
      }
      const fallback = generateFallbackPassport(content, platform);
      setResult(fallback);
    } catch {
      const fallback = generateFallbackPassport(content, platform);
      setResult(fallback);
    } finally {
      setScanning(false);
    }
  };

  const loadPreset = (preset: typeof PRESET_MESSAGES[0]) => {
    setContent(preset.text);
    setPlatform(preset.platform);
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper dark:bg-[#090D1F] text-ink dark:text-paper">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="font-mono text-xs font-semibold text-ultramarine dark:text-ultramarine-light uppercase tracking-wider">
              ScamShield AI Scanner
            </span>
            <h1 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl text-ink dark:text-paper tracking-tight">
              Submit Input for Multi-Layered Threat Analysis
            </h1>
            <p className="mt-2 text-sm text-ink/70 dark:text-paper/70">
              Evaluated concurrently across 6 detection modules with zero-knowledge privacy.
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm p-6 sm:p-8">
            {/* Platform Selector */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-ink/10 dark:border-paper/10 text-xs">
              <span className="font-medium text-ink/60 dark:text-paper/60">Source Platform:</span>
              <div className="flex gap-2">
                {["facebook", "telegram", "other"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`px-3 py-1 rounded-md font-mono capitalize transition-all ${
                      platform === p
                        ? "bg-ultramarine text-white font-semibold"
                        : "bg-paper-100 dark:bg-ink-900 text-ink/70 dark:text-paper/70 hover:bg-paper-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Tabs with 3D aesthetic */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none border-b border-ink/10 dark:border-paper/10 mb-6">
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      activeTab === t.id
                        ? "bg-ultramarine text-white shadow-md scale-[1.02]"
                        : "text-ink/70 dark:text-paper/70 bg-paper-100/60 dark:bg-ink-900/60 hover:bg-paper-200 dark:hover:bg-ink-900 border border-ink/10 dark:border-paper/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                    {t.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                          activeTab === t.id
                            ? "bg-white/20 text-white"
                            : "bg-ultramarine/15 text-ultramarine dark:text-ultramarine-light"
                        }`}
                      >
                        {t.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Link Tab: Real-Time Deep Scanner */}
            {activeTab === "link" ? (
              <RealtimeLinkScanner
                key={selectedThreatUrl || "realtime-link-scanner"}
                initialUrl={selectedThreatUrl}
              />
            ) : activeTab === "screenshot" ? (
              <ScreenshotInspector />
            ) : (
              /* Message & Other Tab Form */
              <form onSubmit={handleScan} className="space-y-4">
                {/* Preset Chips */}
                {activeTab === "message" && (
                  <div className="space-y-1.5 pb-2">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink/50 dark:text-paper/50">
                      Try Real-World Telegram & Web Scam Samples:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_MESSAGES.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => loadPreset(preset)}
                          className="px-2.5 py-1 rounded-full text-xs bg-paper-100 dark:bg-ink-900 border border-ink/10 dark:border-paper/10 text-ink/75 dark:text-paper/75 hover:bg-ultramarine/10 hover:text-ultramarine dark:hover:text-ultramarine-light hover:border-ultramarine/30 transition-all font-medium"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="scan-input" className="sr-only">
                    Threat Input
                  </label>
                  <textarea
                    id="scan-input"
                    required
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                      activeTab === "message"
                        ? "Paste suspicious chat text from Telegram, WhatsApp, Facebook, or SMS (e.g. VIP crypto signals, rating job tasks, account deletion notices...)"
                        : activeTab === "crypto"
                        ? "Paste crypto wallet address (BTC, ETH, TRON, or SOL)"
                        : "Enter details to inspect..."
                    }
                    className="w-full p-4 rounded-xl bg-paper-50 dark:bg-ink-950 border border-ink/15 dark:border-paper/15 text-xs sm:text-sm text-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-ultramarine"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-ink/50 dark:text-paper/50">
                    Zero logging. Ephemeral processing in volatile memory.
                  </span>
                  <Button type="submit" disabled={scanning} className="gap-2">
                    {scanning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing Threat...</span>
                      </>
                    ) : (
                      <>
                        <span>Inspect with ScamShield</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Scan Result for Message Form */}
            {activeTab !== "link" && activeTab !== "screenshot" && result && (
              <div className="mt-8 pt-8 border-t border-ink/10 dark:border-paper/10 space-y-6">
                {/* Result Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-paper-50 dark:bg-ink-950 border border-ink/10 dark:border-paper/10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono uppercase tracking-wider text-ultramarine dark:text-ultramarine-light font-bold">
                        Trust Passport™ Assessment
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-ink/20 dark:bg-paper/20" />
                      <span className="text-xs font-mono text-ink/50 dark:text-paper/50 capitalize">
                        Platform: {result.platform || platform}
                      </span>
                    </div>
                    <h3 className="font-display font-extrabold text-xl sm:text-2xl text-ink dark:text-paper capitalize">
                      {result.scam_type ? result.scam_type.replace(/_/g, " ") : "Threat Assessment"}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 bg-white dark:bg-ink-900 border border-ink/10 dark:border-paper/10 px-4 py-3 rounded-xl shadow-sm">
                    <div className="text-right">
                      <span className="block text-[10px] font-mono text-ink/40 dark:text-paper/40 uppercase">
                        Calibrated Risk
                      </span>
                      <span
                        className={`font-display font-extrabold text-2xl sm:text-3xl leading-none ${
                          (result.risk_score || 0) >= 70
                            ? "text-signal"
                            : (result.risk_score || 0) >= 30
                            ? "text-caution"
                            : "text-verify"
                        }`}
                      >
                        {result.risk_score}
                        <span className="text-xs font-normal text-ink/40 dark:text-paper/40">/100</span>
                      </span>
                    </div>

                    <div className="w-[1px] h-8 bg-ink/10 dark:bg-paper/10" />

                    <div>
                      <span className="block text-[10px] font-mono text-ink/40 dark:text-paper/40 uppercase">
                        Threat Level
                      </span>
                      <span
                        className={`font-mono font-bold text-sm uppercase ${
                          (result.level || result.risk_level) === "CRITICAL" || (result.level || result.risk_level) === "HIGH"
                            ? "text-signal"
                            : (result.level || result.risk_level) === "CAUTION"
                            ? "text-caution"
                            : "text-verify"
                        }`}
                      >
                        {result.level || result.risk_level}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Threat Factor Analysis Breakdown (WHY IS THIS FISHY?) */}
                {result.factors && result.factors.length > 0 && (
                  <ThreatFactorsSection
                    factors={result.factors}
                    riskScore={result.risk_score}
                  />
                )}

                {/* Recommended Actions */}
                {result.actions && result.actions.length > 0 ? (
                  <div className="p-4 sm:p-5 rounded-xl bg-signal/5 dark:bg-signal/10 border border-signal/20 text-xs sm:text-sm text-ink dark:text-paper">
                    <div className="flex items-center gap-2 mb-2 font-display font-bold text-signal-dark dark:text-signal">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Recommended Defensive Actions:</span>
                    </div>
                    <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm text-ink/80 dark:text-paper/80">
                      {result.actions.map((act: string, i: number) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                ) : result.recommended_action ? (
                  <div className="p-4 rounded-xl bg-signal/10 border border-signal/20 text-xs sm:text-sm text-signal-dark dark:text-signal">
                    <strong className="block font-semibold">Recommended Action:</strong>
                    <p className="mt-0.5">{result.recommended_action}</p>
                  </div>
                ) : null}

                {/* Primary Reasons */}
                {result.reasons && result.reasons.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-ink/50 dark:text-paper/50">
                      Detection Signal Logs ({result.reasons.length}):
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {result.reasons.map((r: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-paper-50 dark:bg-ink-950 border border-ink/10 dark:border-paper/10 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-ink dark:text-paper">
                              {r.title}
                            </span>
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-paper-200 dark:bg-ink-900 text-ink/60 dark:text-paper/60">
                              {r.severity || "medium"}
                            </span>
                          </div>
                          <p className="text-ink/75 dark:text-paper/75 mt-1">
                            {r.plain_text || r.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Report Link if scan_id present */}
                {result.scan_id && !result.scan_id.startsWith("scan-local") && (
                  <div className="pt-2 text-center">
                    <Link
                      href={`/report/${result.scan_id}`}
                      className="inline-flex items-center gap-2 text-xs font-mono font-bold text-ultramarine dark:text-ultramarine-light hover:underline"
                    >
                      <span>Open Full Certified Trust Passport™ Report #{result.scan_id.slice(0, 8)}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live Real-Time Threat Stream Telemetry Radar */}
          <div className="mt-8">
            <LiveThreatStream
              onSelectThreat={(threatUrl) => {
                setActiveTab("link");
                setSelectedThreatUrl(threatUrl);
                window.scrollTo({ top: 180, behavior: "smooth" });
              }}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper dark:bg-[#090D1F] text-ink dark:text-paper">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-ultramarine border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-mono text-ink/60 dark:text-paper/60">Loading Threat Scanner...</p>
          </div>
        </div>
      }
    >
      <ScanContent />
    </Suspense>
  );
}
