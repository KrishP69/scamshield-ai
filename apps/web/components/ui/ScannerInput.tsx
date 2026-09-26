"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, AlertCircle, CheckCircle2, ShieldCheck, CornerDownLeft } from "lucide-react";
import { Button } from "./Button";

const PRESET_SCENARIOS = [
  {
    name: "Marketplace Advance Scam",
    platform: "facebook",
    text: "Hello, I am interested in buying your sofa set. I am currently posted in the Indian Army at Pune Cantonment so I cannot come in person. I will send a military truck to pick it up tomorrow morning. Please transfer Rs. 2,000 as refundable gate pass security deposit via UPI to verify your account, and I will immediately send the full payment of Rs. 25,000. Urgently send it within 15 minutes to confirm booking.",
  },
  {
    name: "KYC Phishing Link",
    platform: "telegram",
    text: "Dear Customer, Your SBI Yono NetBanking account will be permanently deactivated today due to incomplete PAN KYC. Immediately update your KYC details to restore transactions: http://sbi-yono-kyc-update.xyz/login. Do not ignore or your funds will be seized.",
  },
  {
    name: "Crypto Giveaway Trap",
    platform: "telegram",
    text: "🎉 BINANCE OFFICIAL 10TH ANNIVERSARY AIRDROP 🎉 Send 0.5 ETH to official smart contract pool: 0x71C95911E9a5D330f4d621842EC243EE1343292e and immediately receive 3X back within 20 minutes! Guaranteed 300% instant returns. Connect your wallet now: https://t.me/BinanceGiftAirdropBot or enter your 12-word seed phrase.",
  },
  {
    name: "Genuine Seller (Safe)",
    platform: "facebook",
    text: "Hi! Yes, the bicycle is still available. You are welcome to come test ride it this Saturday in Bandra West between 4 PM and 7 PM. Cash or UPI on collection in person is completely fine with me. Let me know if that timing works for you!",
  },
];

export function ScannerInput() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [platform, setPlatform] = useState("facebook");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/v1/scans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          platform,
          store_history: false,
        }),
      });

      if (!res.ok) {
        throw new Error("Scan request could not be processed.");
      }

      const data = await res.json();
      router.push(`/report/${data.scan_id}`);
    } catch (err: any) {
      // Local fallback navigation with query state
      router.push(`/scan?text=${encodeURIComponent(text)}&platform=${platform}`);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setText(preset.text);
    setPlatform(preset.platform);
  };

  return (
    <div className="w-full bg-white dark:bg-ink-800 rounded-2xl shadow-xl border border-ink/10 dark:border-paper/10 p-4 sm:p-6 transition-all">
      {/* Preset scenario pill buttons */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
        <span className="text-[11px] font-semibold text-ink/50 dark:text-paper/50 uppercase tracking-wider mr-1">
          Try a scenario:
        </span>
        {PRESET_SCENARIOS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => loadPreset(p)}
            className="text-xs px-2.5 py-1 rounded-full bg-paper-200 dark:bg-ink-700 hover:bg-paper-300 dark:hover:bg-ink-600 text-ink/80 dark:text-paper/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine"
          >
            {p.name}
          </button>
        ))}
      </div>

      <form onSubmit={handleScan} className="space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Paste a suspicious Facebook Marketplace message, Telegram link, phone number, or crypto wallet address..."
            className="w-full p-3.5 sm:p-4 rounded-xl border border-ink/15 dark:border-paper/15 bg-paper/50 dark:bg-ink-900/50 text-ink dark:text-paper placeholder:text-ink/40 dark:placeholder:text-paper/40 focus:outline-none focus:ring-2 focus:ring-ultramarine text-sm sm:text-base resize-none transition-all"
            required
            aria-label="Input text message, link, or wallet address to inspect"
          />
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Platform chips */}
          <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Target Platform">
            <span className="text-xs text-ink/60 dark:text-paper/60 mr-1 hidden sm:inline">Platform:</span>
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
                {p === "unknown" ? "Other" : p}
              </button>
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading || !text.trim()}
            className="gap-2 px-5 py-2.5 ml-auto text-sm font-semibold"
          >
            {loading ? (
              <span>Analyzing...</span>
            ) : (
              <>
                <span>Check Message</span>
                <CornerDownLeft className="w-4 h-4 hidden sm:inline opacity-70" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
