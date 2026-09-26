"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Info,
  Copy,
  Check,
} from "lucide-react";

interface Scenario {
  id: string;
  name: string;
  platform: "Facebook" | "Telegram";
  riskScore: number;
  riskLevel: "CRITICAL" | "HIGH";
  scamType: string;
  recommendedAction: string;
  textParts: { text: string; reasonId?: number }[];
  reasons: {
    id: number;
    title: string;
    description: string;
    highlightText: string;
    severity: string;
  }[];
  indicators: { type: string; value: string; defanged: string }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "fb-marketplace",
    name: "Facebook Marketplace Advance-Payment",
    platform: "Facebook",
    riskScore: 92,
    riskLevel: "CRITICAL",
    scamType: "MARKETPLACE_QR_ADVANCE_FEE",
    recommendedAction: "DO NOT scan the QR code or enter your UPI PIN. UPI PIN is only used to DEBIT funds.",
    textParts: [
      { text: "Hello, I want to purchase your listed furniture " },
      { text: "immediately without any inspection", reasonId: 2 },
      { text: ". I am sending an advance payment of ₹5,000 right now. I have generated a " },
      { text: "special merchant QR code", reasonId: 3 },
      { text: ". Please " },
      { text: "scan this QR and enter your 6-digit UPI PIN to receive the money", reasonId: 1 },
      { text: " into your account right away." },
    ],
    reasons: [
      {
        id: 1,
        title: "Demanding UPI PIN to receive money",
        description: "UPI PIN is cryptographically designed exclusively to authorize outgoing transfers. Legitimate transfers into your account never require your PIN.",
        highlightText: "scan this QR and enter your 6-digit UPI PIN to receive the money",
        severity: "CRITICAL",
      },
      {
        id: 2,
        title: "Artificial purchase urgency & sight-unseen offer",
        description: "Buyer pushes to finalize without inspecting goods, a classic marker of advance-fee social engineering.",
        highlightText: "immediately without any inspection",
        severity: "HIGH",
      },
      {
        id: 3,
        title: "Fraudulent 'Merchant Reverse-Collect' QR Code",
        description: "Scammer presents a collect-request QR code disguised as a credit transfer voucher.",
        highlightText: "special merchant QR code",
        severity: "HIGH",
      },
    ],
    indicators: [
      { type: "Payment Lure", value: "₹5,000 QR Code", defanged: "QR_PAY_REVERSE_COLLECT" },
      { type: "Platform Vector", value: "Facebook Marketplace", defanged: "marketplace.facebook.com" },
    ],
  },
  {
    id: "tg-crypto",
    name: "Telegram Crypto Giveaway Lure",
    platform: "Telegram",
    riskScore: 98,
    riskLevel: "CRITICAL",
    scamType: "CRYPTO_MULTIPLIER_FRAUD",
    recommendedAction: "Block user and channel. Any promise to double cryptocurrency transfers is guaranteed theft.",
    textParts: [
      { text: "🚀 Official Binance & Vitalik Birthday Giveaway! " },
      { text: "Send 0.5 ETH to 0x71C...b4E9 and get 1.0 ETH returned instantly", reasonId: 1 },
      { text: "! Smart contract verified. " },
      { text: "Only 12 slots left before giveaway closes forever", reasonId: 2 },
      { text: ". Check proof at " },
      { text: "https://eth-giveaway-official-promo.top", reasonId: 3 },
      { text: " right now!" },
    ],
    reasons: [
      {
        id: 1,
        title: "Double-Your-Money Multiplier Scam",
        description: "Zero legitimate smart contract or blockchain entity returns 2x deposited funds. Hard rule override triggered.",
        highlightText: "Send 0.5 ETH to 0x71C...b4E9 and get 1.0 ETH returned instantly",
        severity: "CRITICAL",
      },
      {
        id: 2,
        title: "Artificial Scarcity Countdown Urgency",
        description: "Pressure tactic designed to bypass critical thinking and prevent independent verification.",
        highlightText: "Only 12 slots left before giveaway closes forever",
        severity: "HIGH",
      },
      {
        id: 3,
        title: "Newly Registered Phishing TLD (.top)",
        description: "Domain registered less than 48 hours ago impersonating official Ethereum foundation branding.",
        highlightText: "https://eth-giveaway-official-promo.top",
        severity: "CRITICAL",
      },
    ],
    indicators: [
      { type: "Crypto Address (ETH)", value: "0x71C...b4E9", defanged: "0x71C[.]b4E9" },
      { type: "Phishing URL", value: "https://eth-giveaway-official-promo.top", defanged: "hxxps://eth-giveaway-official-promo[.]top" },
    ],
  },
  {
    id: "cloned-friend",
    name: "Cloned Friend Urgent Medical Distress",
    platform: "Facebook",
    riskScore: 89,
    riskLevel: "HIGH",
    scamType: "IMPERSONATION_EMERGENCY_COERCION",
    recommendedAction: "Call your friend directly on their regular, verified phone number before sending any money.",
    textParts: [
      { text: "Hey! It is me. " },
      { text: "I had a sudden emergency at the hospital and my primary UPI daily limit is exhausted", reasonId: 1 },
      { text: ". Please transfer ₹12,000 urgently to " },
      { text: "doctor's personal phone +91 91234 56789", reasonId: 2 },
      { text: ". I will " },
      { text: "pay you back first thing tomorrow morning", reasonId: 3 },
      { text: " without fail." },
    ],
    reasons: [
      {
        id: 1,
        title: "High-Stress Emergency Coercion Pattern",
        description: "Fabricating hospital bills or police emergencies induces panic to prevent the victim from checking secondary channels.",
        highlightText: "I had a sudden emergency at the hospital and my primary UPI daily limit is exhausted",
        severity: "HIGH",
      },
      {
        id: 2,
        title: "Diversion to Unregistered Virtual Number",
        description: "Payment is directed to a temporary burner number rather than your actual friend's known UPI ID.",
        highlightText: "doctor's personal phone +91 91234 56789",
        severity: "HIGH",
      },
      {
        id: 3,
        title: "Unbacked Verbal Promise of Next-Day Repayment",
        description: "Common psychological anchor to reduce financial hesitation.",
        highlightText: "pay you back first thing tomorrow morning",
        severity: "CAUTION",
      },
    ],
    indicators: [
      { type: "Phone / UPI IOC", value: "+91 91234 56789", defanged: "+91 91234 56789" },
      { type: "Modus Operandi", value: "Cloned Social Profile", defanged: "account_cloning" },
    ],
  },
];

export function InteractivePassportPreview() {
  const [activeScenarioId, setActiveScenarioId] = useState("fb-marketplace");
  const [activeReasonId, setActiveReasonId] = useState<number | null>(1);
  const [copiedIndicator, setCopiedIndicator] = useState<string | null>(null);

  const scenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedIndicator(val);
    setTimeout(() => setCopiedIndicator(null), 2000);
  };

  return (
    <section className="py-20 bg-paper dark:bg-ink-800 transition-colors" id="trust-passport">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="font-mono text-xs font-semibold text-ultramarine dark:text-ultramarine-light uppercase tracking-wider">
            Explainability Is The Product
          </span>
          <h2 className="mt-2 font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-ink dark:text-paper tracking-tight">
            The Trust Passport: Every score explained in plain sight
          </h2>
          <p className="mt-3 text-sm sm:text-base text-ink/75 dark:text-paper/75">
            A black-box score is dangerous. Click any reason below to see the exact text span that triggered the threat detection.
          </p>

          {/* Scenario Tabs */}
          <div className="mt-8 inline-flex p-1 rounded-xl bg-paper-200 dark:bg-ink-900 border border-ink/10 dark:border-paper/10 flex-wrap justify-center gap-1">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveScenarioId(s.id);
                  setActiveReasonId(s.reasons[0].id);
                }}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeScenarioId === s.id
                    ? "bg-white dark:bg-ink-800 text-ultramarine dark:text-ultramarine-light shadow-sm"
                    : "text-ink/60 dark:text-paper/60 hover:text-ink dark:hover:text-paper"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Passport Card Layout */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Original Message with Interactive Highlighting */}
          <div className="lg:col-span-6 rounded-2xl bg-white dark:bg-ink-900 border border-ink/10 dark:border-paper/10 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-ink/10 dark:border-paper/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-signal" />
                <span className="font-mono text-xs font-semibold text-ink/70 dark:text-paper/70">
                  Intercepted Message • {scenario.platform}
                </span>
              </div>
              <span className="text-[11px] font-mono text-ink/40 dark:text-paper/40">
                Tap a reason to highlight
              </span>
            </div>

            <div className="p-4 rounded-xl bg-paper-100 dark:bg-ink-950 font-sans text-sm sm:text-base leading-relaxed text-ink/90 dark:text-paper/90 border border-ink/5 dark:border-paper/5">
              {scenario.textParts.map((part, index) => {
                const isTargetReason = part.reasonId !== undefined;
                const isSelected = part.reasonId === activeReasonId;
                return (
                  <span
                    key={index}
                    onClick={() => part.reasonId && setActiveReasonId(part.reasonId)}
                    className={`transition-colors duration-200 ${
                      isTargetReason
                        ? isSelected
                          ? "bg-signal/25 text-signal-dark dark:text-signal font-semibold px-1 rounded ring-2 ring-signal/40 cursor-pointer"
                          : "bg-amber-100/60 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 px-0.5 rounded cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-800/40"
                        : ""
                    }`}
                  >
                    {part.text}
                  </span>
                );
              })}
            </div>

            {/* Extracted IOCs */}
            <div className="mt-6 pt-4 border-t border-ink/10 dark:border-paper/10">
              <h4 className="font-mono text-xs uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-3">
                Extracted Indicators (Defanged for Safety)
              </h4>
              <div className="space-y-2">
                {scenario.indicators.map((ioc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-paper-100 dark:bg-ink-950 border border-ink/5 dark:border-paper/5 text-xs font-mono"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] text-ink/50 dark:text-paper/50">{ioc.type}</span>
                      <span className="text-ink dark:text-paper font-semibold">{ioc.defanged}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(ioc.value)}
                      className="p-1.5 rounded hover:bg-paper-200 dark:hover:bg-ink-800 text-ink/60 dark:text-paper/60 transition-colors"
                      title="Copy indicator value"
                    >
                      {copiedIndicator === ioc.value ? (
                        <Check className="w-3.5 h-3.5 text-verify" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: The Trust Passport Display */}
          <div className="lg:col-span-6 rounded-2xl bg-white dark:bg-ink-900 border border-ink/10 dark:border-paper/10 p-6 sm:p-8 shadow-sm">
            {/* Header / Risk Gauge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink/10 dark:border-paper/10 pb-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-ink/50 dark:text-paper/50">
                  Trust Passport Evaluation
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-ink dark:text-paper mt-0.5">
                  {scenario.scamType.replace(/_/g, " ")}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-display font-extrabold text-3xl text-signal">
                    {scenario.riskScore}
                    <span className="text-sm font-normal text-ink/50 dark:text-paper/50">/100</span>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-signal/15 text-signal">
                    {scenario.riskLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommended Action Checklist */}
            <div className="mt-5 p-4 rounded-xl bg-signal/10 border border-signal/20 text-xs sm:text-sm text-signal-dark dark:text-signal">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Immediate Recommendation:</strong>
                  <p className="mt-0.5">{scenario.recommendedAction}</p>
                </div>
              </div>
            </div>

            {/* Reasons List */}
            <div className="mt-6 space-y-3">
              <h4 className="font-mono text-xs uppercase tracking-wider text-ink/50 dark:text-paper/50">
                Machine-Generated Evidence Reasons
              </h4>
              {scenario.reasons.map((r) => {
                const isSelected = r.id === activeReasonId;
                return (
                  <button
                    key={r.id}
                    onClick={() => setActiveReasonId(r.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-ultramarine/5 dark:bg-ultramarine/10 border-ultramarine ring-1 ring-ultramarine"
                        : "bg-paper-50 dark:bg-ink-950 border-ink/10 dark:border-paper/10 hover:border-ink/30 dark:hover:border-paper/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-display font-semibold text-xs sm:text-sm text-ink dark:text-paper">
                        {r.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          r.severity === "CRITICAL"
                            ? "bg-signal/15 text-signal"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {r.severity}
                      </span>
                    </div>
                    <p className="text-xs text-ink/70 dark:text-paper/70 leading-relaxed">
                      {r.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
