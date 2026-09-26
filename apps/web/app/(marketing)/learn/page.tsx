"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface QuizQuestion {
  id: number;
  scenario: string;
  isScam: boolean;
  explanation: string;
  tactics: string[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    scenario:
      "A buyer on Facebook Marketplace agrees to your price immediately and sends a QR code: 'Scan this merchant QR code and enter your 6-digit UPI PIN to receive ₹4,000 into your bank account.'",
    isScam: true,
    explanation:
      "SCAM! In the Unified Payments Interface (UPI) architecture, your UPI PIN is cryptographically required ONLY to debit money from your account. You NEVER need to enter a PIN to receive payments.",
    tactics: ["Reverse-Collect QR", "Artificial Urgency"],
  },
  {
    id: 2,
    scenario:
      "A message from 'SBI-ALERT': 'Dear Customer, your NetBanking access is blocked. To unblock within 2 hours, download the official update APK at https://sbi-netbanking-update.xyz/app.apk'",
    isScam: true,
    explanation:
      "SCAM! Banks never distribute Android APKs via random web links or SMS. Official updates are only distributed via Google Play Store and Apple App Store.",
    tactics: ["Malicious APK", "Look-alike Domain", "Suspension Urgency"],
  },
  {
    id: 3,
    scenario:
      "An SMS from 'VK-HDFCBK': 'Rs 1,200.00 debited from A/C XX4921 on 24-Sep-26 at RELIANCE RETAIL. Avail Bal: Rs 24,190.40. If not you, SMS BLOCK to 56767.'",
    isScam: false,
    explanation:
      "LEGITIMATE! This is a standard passive transaction notification with a verified SMS sender header (VK-HDFCBK) and an official bank shortcode, without any suspicious links or demands for OTP.",
    tactics: ["Standard Bank Alert"],
  },
  {
    id: 4,
    scenario:
      "A Telegram message from an admin: 'VIP Trading Group: Guaranteed 300% returns in 24 hours. Send 0.2 ETH to our verified smart contract wallet and our AI bot triples it automatically.'",
    isScam: true,
    explanation:
      "SCAM! Guaranteed investment multipliers are mathematically impossible. Once cryptocurrency leaves your wallet, transactions are irreversible.",
    tactics: ["Crypto Multiplier Fraud", "Fake Investment Scheme"],
  },
];

export default function LearnPage() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, boolean>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const handleSelect = (qId: number, answer: boolean) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: answer }));
    setRevealed((prev) => ({ ...prev, [qId]: true }));
  };

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="font-mono text-xs font-semibold text-ultramarine dark:text-ultramarine-light uppercase tracking-wider">
            Public Education & Awareness
          </span>
          <h1 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink dark:text-paper tracking-tight">
            Scam Awareness Library & Spot-The-Scam Quiz
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ink/75 dark:text-paper/75 leading-relaxed">
            The strongest defense against social engineering is education. Learn how fraudsters manipulate digital payment protocols and test your instincts below.
          </p>
        </div>

        {/* 5 Common Scam Blueprints */}
        <div className="mt-16">
          <h2 className="font-display font-bold text-2xl text-ink dark:text-paper mb-6">
            Anatomy of the 5 Major Scam Modus Operandi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm space-y-3">
              <span className="font-mono text-xs font-semibold text-signal uppercase">
                Pattern 01
              </span>
              <h3 className="font-display font-bold text-lg text-ink dark:text-paper">
                The UPI Reverse-Collect Scam
              </h3>
              <p className="text-xs sm:text-sm text-ink/70 dark:text-paper/70 leading-relaxed">
                Fraudsters pose as buyers on Facebook Marketplace or OLX. They claim to send an advance payment via a QR code, instructing you to scan and enter your UPI PIN. Entering your PIN authorises an outgoing debit.
              </p>
              <div className="text-[11px] font-mono text-verify font-semibold pt-1">
                Golden Rule: UPI PIN is ONLY for paying, never for receiving.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm space-y-3">
              <span className="font-mono text-xs font-semibold text-signal uppercase">
                Pattern 02
              </span>
              <h3 className="font-display font-bold text-lg text-ink dark:text-paper">
                Part-Time Task & Like-and-Earn
              </h3>
              <p className="text-xs sm:text-sm text-ink/70 dark:text-paper/70 leading-relaxed">
                You receive a WhatsApp/Telegram message offering ₹3,000/day for liking YouTube videos or rating Google maps. After paying small initial bonuses, they demand ₹10,000+ deposits for &ldquo;VIP prepaid tasks&rdquo; and freeze funds.
              </p>
              <div className="text-[11px] font-mono text-verify font-semibold pt-1">
                Golden Rule: Legitimate companies never charge you to work.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm space-y-3">
              <span className="font-mono text-xs font-semibold text-signal uppercase">
                Pattern 03
              </span>
              <h3 className="font-display font-bold text-lg text-ink dark:text-paper">
                Digital Arrest & Fake Police Threat
              </h3>
              <p className="text-xs sm:text-sm text-ink/70 dark:text-paper/70 leading-relaxed">
                A caller claims a courier parcel with narcotics was booked in your name, placing you under fake &ldquo;digital arrest&rdquo; via Skype/WhatsApp video with actors wearing police uniforms, demanding bail funds.
              </p>
              <div className="text-[11px] font-mono text-verify font-semibold pt-1">
                Golden Rule: Indian law enforcement never arrests via video call.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm space-y-3">
              <span className="font-mono text-xs font-semibold text-signal uppercase">
                Pattern 04
              </span>
              <h3 className="font-display font-bold text-lg text-ink dark:text-paper">
                Electricity Bill Power Cut APK
              </h3>
              <p className="text-xs sm:text-sm text-ink/70 dark:text-paper/70 leading-relaxed">
                An urgent SMS warns your power will be disconnected at 9:30 PM tonight for an unpaid bill. The provided officer asks you to install an APK file that intercepts your two-factor authentication SMS codes.
              </p>
              <div className="text-[11px] font-mono text-verify font-semibold pt-1">
                Golden Rule: Never sideload an APK sent over messaging apps.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm space-y-3">
              <span className="font-mono text-xs font-semibold text-signal uppercase">
                Pattern 05
              </span>
              <h3 className="font-display font-bold text-lg text-ink dark:text-paper">
                Crypto Double-Your-Money Multiplier
              </h3>
              <p className="text-xs sm:text-sm text-ink/70 dark:text-paper/70 leading-relaxed">
                Telegram channels impersonate Binance or Ethereum foundations, announcing giveaways where depositing 1 ETH returns 2 ETH. In reality, the attacker withdraws deposited funds immediately.
              </p>
              <div className="text-[11px] font-mono text-verify font-semibold pt-1">
                Golden Rule: No blockchain system can double your money.
              </div>
            </div>
          </div>
        </div>

        {/* Spot The Scam Interactive Quiz */}
        <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-paper-100 dark:bg-ink-900 border border-ink/10 dark:border-paper/10">
          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-ultramarine/10 text-ultramarine dark:text-ultramarine-light text-xs font-semibold mb-3">
              <GraduationCap className="w-4 h-4" />
              <span>Interactive Simulator</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink dark:text-paper">
              Spot the Scam: Test Your Judgment
            </h2>
            <p className="mt-2 text-sm text-ink/70 dark:text-paper/70">
              Evaluate real scenario messages. Click your answer to reveal the underlying forensic analysis.
            </p>
          </div>

          <div className="space-y-6">
            {QUIZ_QUESTIONS.map((q) => {
              const isAnswered = revealed[q.id];
              const userAnswer = selectedAnswers[q.id];
              const isCorrect = isAnswered && userAnswer === q.isScam;

              return (
                <div
                  key={q.id}
                  className="p-6 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm space-y-4"
                >
                  <div className="p-4 rounded-xl bg-paper-50 dark:bg-ink-950 font-sans text-sm sm:text-base leading-relaxed text-ink/90 dark:text-paper/90 border border-ink/5 dark:border-paper/5">
                    &ldquo;{q.scenario}&rdquo;
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      disabled={isAnswered}
                      onClick={() => handleSelect(q.id, true)}
                      className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                        isAnswered && q.isScam
                          ? "bg-signal text-white"
                          : "bg-paper-200 dark:bg-ink-700 text-ink dark:text-paper hover:bg-signal/20 hover:text-signal"
                      }`}
                    >
                      Flag as Scam
                    </button>
                    <button
                      disabled={isAnswered}
                      onClick={() => handleSelect(q.id, false)}
                      className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                        isAnswered && !q.isScam
                          ? "bg-verify text-white"
                          : "bg-paper-200 dark:bg-ink-700 text-ink dark:text-paper hover:bg-verify/20 hover:text-verify"
                      }`}
                    >
                      Mark as Legitimate
                    </button>
                  </div>

                  {/* Reveal Explanation */}
                  {isAnswered && (
                    <div
                      className={`mt-4 p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                        isCorrect
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-verify shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-signal shrink-0 mt-0.5" />
                        )}
                        <div>
                          <strong className="block font-semibold mb-1">
                            {isCorrect ? "Correct Diagnosis!" : "Careful! Look closely at the tactics:"}
                          </strong>
                          <p>{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action */}
        <div className="mt-16 text-center">
          <Link href="/scan">
            <Button size="lg" className="gap-2">
              <span>Have a suspicious message? Scan it now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
