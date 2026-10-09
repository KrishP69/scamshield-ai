"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Radio,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Send,
  ExternalLink,
  Flame,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { RealtimeLinkScanner } from "@/components/ui/RealtimeLinkScanner";
import { LiveThreatStream } from "@/components/ui/LiveThreatStream";

const TELEGRAM_QUICK_PRESETS = [
  {
    label: "Telegram VIP Signals",
    url: "https://t.me/crypto_vip_pumps",
    threat: "Telegram Multiplier Scam",
    badge: "t.me Crypto",
  },
  {
    label: "Telegram TON Airdrop",
    url: "https://t.me/claim_ton_airdrop",
    threat: "Web3 Wallet Drainer",
    badge: "t.me Drainer",
  },
  {
    label: "Telegram Task Job",
    url: "https://t.me/dailyearn",
    threat: "Task & Rating Job Pyramid",
    badge: "t.me Task",
  },
  {
    label: "Fake Telegram Verify Bot",
    url: "https://t.me/TelegramVerificationBot",
    threat: "Session Hijack Bot",
    badge: "t.me Spoof",
  },
  {
    label: "Telegram Phishing Domain",
    url: "https://telegram-login-web.xyz/auth",
    threat: "Brand Impersonation Phishing",
    badge: "Lookalike Web",
  },
  {
    label: "UPI Cashback Trap",
    url: "http://paytm-instant-cashback.xyz/qr-collect",
    threat: "UPI Auto-Debit Trap",
    badge: "UPI Collect",
  },
];

export default function RadarPage() {
  const [activeUrl, setActiveUrl] = useState<string>("https://t.me/crypto_vip_pumps");
  const [scanKey, setScanKey] = useState<number>(1);

  const handleSelectPreset = (url: string) => {
    setActiveUrl(url);
    setScanKey((prev) => prev + 1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper dark:bg-[#090D1F] text-ink dark:text-paper">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Dedicated 24x7 Threat Telemetry Engine</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-ink dark:text-paper tracking-tight">
              Real-Time Fishy Link Interceptor & Telegram Radar
            </h1>
            <p className="text-sm sm:text-base text-ink/75 dark:text-paper/75 leading-relaxed">
              Open Telegram or copy any fishy link from chats, SMS, or websites. ScamShield inspects it instantly in real time and streams newly discovered active digital threats 24x7.
            </p>
          </div>

          {/* Quick Telegram Presets Bar */}
          <div className="rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 p-5 shadow-lg card-3d">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink/60 dark:text-paper/60 flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-sky-500" />
                <span>Test Real Telegram Scams & Phishing Links (1-Click):</span>
              </span>
              <span className="text-[11px] text-ink/40 dark:text-paper/40 font-mono">
                Click any link to inspect immediately
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {TELEGRAM_QUICK_PRESETS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSelectPreset(item.url)}
                  className={`p-2.5 rounded-xl border text-left transition-all group ${
                    activeUrl === item.url
                      ? "border-ultramarine bg-ultramarine/10 ring-2 ring-ultramarine/20 shadow-sm"
                      : "border-ink/10 dark:border-paper/10 bg-paper-50 dark:bg-ink-900/60 hover:border-ultramarine/40 hover:bg-ultramarine/5"
                  }`}
                >
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 block w-fit mb-1">
                    {item.badge}
                  </span>
                  <div className="font-semibold text-xs text-ink dark:text-paper group-hover:text-ultramarine dark:group-hover:text-ultramarine-light truncate">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-ink/50 dark:text-paper/50 truncate font-mono mt-0.5">
                    {item.threat}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main 2-Column Radar Interface (Even Heights) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left: Real-Time Interceptor Scanner */}
            <div className="lg:col-span-7 flex flex-col">
              <RealtimeLinkScanner
                key={`radar-scanner-${scanKey}`}
                initialUrl={activeUrl}
              />
            </div>

            {/* Right: 24x7 Live Threat Telemetry Feed */}
            <div className="lg:col-span-5 flex flex-col">
              <LiveThreatStream
                maxDisplay={6}
                onSelectThreat={(selectedUrl) => {
                  setActiveUrl(selectedUrl);
                  setScanKey((prev) => prev + 1);
                  window.scrollTo({ top: 220, behavior: "smooth" });
                }}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
