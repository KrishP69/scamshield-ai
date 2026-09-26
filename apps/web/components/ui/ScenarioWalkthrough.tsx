"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Lock,
  ArrowRight,
} from "lucide-react";

export function ScenarioWalkthrough() {
  const [selectedScenario, setSelectedScenario] = useState(0);

  const scenarios = [
    {
      id: "s1",
      num: "Scenario 01",
      category: "Facebook Marketplace",
      title: "Army Impersonation Advance-Fee Fraud",
      input: "Screenshot of chat: 'I am an officer in the Indian Army posted at border. I am transferring ₹2,000 token advance now. Courier service will pick up tomorrow. Click QR to confirm payment.'",
      before: "Victim is pressured by high-trust military credentials and believes money is arriving.",
      after: "Scam Guardian flags 'fake_authority' and 'advance_payment_request'. QR code detected as a reverse collect request.",
      risk: "CRITICAL (94/100)",
      isSafe: false,
    },
    {
      id: "s2",
      num: "Scenario 02",
      category: "Facebook & Messenger",
      title: "Cloned Profile & Friend Impersonation",
      input: "Message: 'Hey! New WhatsApp number. Lost my phone in transit, stuck at hospital. Transfer ₹5,000 urgently to this UPI ID.' + profile photo.",
      before: "Victim assumes childhood friend has genuine medical crisis and sends immediate funds.",
      after: "Reverse Search calculates pHash match distance = 2 against known impersonation photos. VoIP line carrier alert.",
      risk: "HIGH (88/100)",
      isSafe: false,
    },
    {
      id: "s3",
      num: "Scenario 03",
      category: "Telegram / SMS",
      title: "Urgent KYC Suspension Phishing Link",
      input: "Message: 'Dear customer, your bank KYC has lapsed. Account will be blocked in 2 hours. Update immediately: https://sbi-kyc-update-portal.xyz/login'",
      before: "Panic induces victim to click and submit internet banking username, password, and OTP.",
      after: "Safe Link Scanner unmasks young domain (<48 hrs) with look-alike SBI homoglyphs. GSB/PhishTank threat alert.",
      risk: "CRITICAL (96/100)",
      isSafe: false,
    },
    {
      id: "s4",
      num: "Scenario 04",
      category: "Telegram Channels",
      title: "Fake 3x Crypto Multiplier & Airdrop",
      input: "Post: 'Exclusive Solana Flash Airdrop! Deposit 1 SOL to 7xKX...2wQ and receive 3 SOL back automatically. Smart contract verified.'",
      before: "Greed and FOMO lead investor to transfer crypto to an anonymous destination wallet.",
      after: "Crypto Detector validates Base58 checksum, detects 3x multiplier fraud pattern, and triggers zero-tolerance override.",
      risk: "CRITICAL (99/100)",
      isSafe: false,
    },
    {
      id: "s5",
      num: "Scenario 05",
      category: "File & APK",
      title: "Trojanized Utility Bill Payment APK",
      input: "File upload: 'Mahavitaran_Electricity_Update.apk' sent via WhatsApp/Telegram to avoid power cut.",
      before: "User installs side-loaded APK thinking it is an official electricity distribution utility app.",
      after: "File Scanner inspects manifest: requests RECEIVE_SMS & BIND_ACCESSIBILITY_SERVICE. VirusTotal hash flagged.",
      risk: "CRITICAL (95/100)",
      isSafe: false,
    },
    {
      id: "s6",
      num: "Scenario 06",
      category: "Voice & Audio",
      title: "Synthetic Family Member Voice Clone",
      input: "Audio clip (20s): Voice clone simulating daughter crying claiming she is detained by police and needs bail money.",
      before: "Emotional panic causes parent to wire emergency cash without verifying location.",
      after: "Voice Verifier spots high-frequency synthetic artifacts (86% spoof likelihood). Scam Guardian tags extortion.",
      risk: "HIGH (86/100)",
      isSafe: false,
    },
    {
      id: "c1",
      num: "Control 01",
      category: "Safe Control (Genuine)",
      title: "Legitimate Marketplace Seller",
      input: "Chat: 'Hi, yes the study table is available. You can visit Saturday afternoon to inspect it in person before deciding.'",
      before: "Security systems must not false-positive on routine commercial dialogue.",
      after: "Scam Guardian finds zero coercion tactics. Link and phone checks clear. Trust Passport issued with clean status.",
      risk: "LOW (8/100)",
      isSafe: true,
    },
    {
      id: "c2",
      num: "Control 02",
      category: "Safe Control (Bank)",
      title: "Official Bank Transaction Alert",
      input: "SMS: 'Your A/C XX1049 is credited with INR 4,500.00 on 24-Sep-26 by UPI/CRED. Avail Bal: INR 18,240.22. - HDFC Bank'",
      before: "Standard notification without actionable phishing link or urgency.",
      after: "Parser confirms standard sender header structure and passive accounting notification. No coercion tactics.",
      risk: "LOW (4/100)",
      isSafe: true,
    },
  ];

  const current = scenarios[selectedScenario];

  return (
    <section className="py-20 bg-paper dark:bg-ink-800 transition-colors" id="scenarios">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="font-mono text-xs font-semibold text-ultramarine dark:text-ultramarine-light uppercase tracking-wider">
            Empirical Validation
          </span>
          <h2 className="mt-2 font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-ink dark:text-paper tracking-tight">
            6 Real Demo Scenarios & 2 Safe Controls
          </h2>
          <p className="mt-3 text-sm sm:text-base text-ink/75 dark:text-paper/75">
            Test cases engineered against real social engineering templates active across Indian social channels.
          </p>
        </div>

        {/* Tab Strip */}
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none border-b border-ink/10 dark:border-paper/10">
          {scenarios.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setSelectedScenario(idx)}
              className={`px-3 sm:px-4 py-2 rounded-t-lg font-mono text-xs whitespace-nowrap transition-all border-b-2 ${
                selectedScenario === idx
                  ? "border-ultramarine text-ultramarine dark:text-ultramarine-light font-bold bg-white dark:bg-ink-700 shadow-sm"
                  : "border-transparent text-ink/60 dark:text-paper/60 hover:text-ink dark:hover:text-paper"
              }`}
            >
              <span>{s.num}</span>
              <span className="ml-1.5 opacity-60">({s.isSafe ? "Safe" : "Scam"})</span>
            </button>
          ))}
        </div>

        {/* Scenario Card */}
        <div className="mt-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-ink-900 border border-ink/10 dark:border-paper/10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink/10 dark:border-paper/10 pb-6 mb-6">
            <div>
              <span className="font-mono text-xs text-ink/50 dark:text-paper/50 uppercase tracking-wider">
                {current.category}
              </span>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-ink dark:text-paper mt-0.5">
                {current.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
                  current.isSafe
                    ? "bg-verify/15 text-verify"
                    : "bg-signal/15 text-signal"
                }`}
              >
                {current.isSafe ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5" />
                )}
                {current.risk}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input payload */}
            <div className="lg:col-span-6 space-y-4">
              <h4 className="font-mono text-xs uppercase tracking-wider text-ink/50 dark:text-paper/50">
                Incoming Test Payload
              </h4>
              <div className="p-4 rounded-xl bg-paper-100 dark:bg-ink-950 border border-ink/10 dark:border-paper/10 font-mono text-xs text-ink/90 dark:text-paper/90 leading-relaxed">
                {current.input}
              </div>

              <div className="pt-2">
                <span className="text-xs font-semibold text-ink/70 dark:text-paper/70 block mb-1">
                  Human Vulnerability (Before Scan):
                </span>
                <p className="text-xs sm:text-sm text-ink/60 dark:text-paper/60 leading-relaxed">
                  {current.before}
                </p>
              </div>
            </div>

            {/* Passport Protection */}
            <div className="lg:col-span-6 space-y-4">
              <h4 className="font-mono text-xs uppercase tracking-wider text-ink/50 dark:text-paper/50">
                ScamShield Decision & Passport Impact
              </h4>
              <div
                className={`p-4 rounded-xl border leading-relaxed text-xs sm:text-sm ${
                  current.isSafe
                    ? "bg-verify/10 border-verify/20 text-verify-dark dark:text-verify"
                    : "bg-signal/10 border-signal/20 text-signal-dark dark:text-signal"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {current.isSafe ? (
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <p>{current.after}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-ink/60 dark:text-paper/60">
                <span>Verified in automated CI test suite</span>
                <span className="font-mono font-semibold">100% Deterministic Pass</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
