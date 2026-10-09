"use client";

import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck, ArrowRight, Instagram, Gamepad2, Gift } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ScreenshotInspector } from "@/components/ui/ScreenshotInspector";

export default function ScreenshotInspectorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper dark:bg-[#090D1F] text-ink dark:text-paper">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header Title */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-rose-500" />
              <span>Multi-Signal Visual Phishing Intelligence</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-ink dark:text-paper tracking-tight">
              Phishing Screenshot & Absurd Deal Inspector
            </h1>
            <p className="text-sm sm:text-base text-ink/75 dark:text-paper/75 leading-relaxed">
              Upload or paste fishy promotional graphics, fake game currency banners (Free Fire, BGMI), and Instagram account takeover traps to detect credential phishing before you lose your profile.
            </p>
          </div>

          {/* Screenshot Inspector Interactive Workbench */}
          <ScreenshotInspector />

          {/* Educational Explainer Section */}
          <div className="rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 p-6 sm:p-8 shadow-lg card-3d">
            <h3 className="font-display font-bold text-lg sm:text-xl text-ink dark:text-paper mb-4">
              Common Visual Phishing Traps & How They Work
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-ink/75 dark:text-paper/75">
              <div className="p-4 rounded-xl bg-paper-50 dark:bg-ink-900/60 border border-ink/10 dark:border-paper/10 space-y-2">
                <div className="font-display font-bold text-ink dark:text-paper flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-rose-500" />
                  <span>Free Game Diamonds Lure</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Posters offering 50,000 Free Fire Diamonds or 10,000 BGMI UC claim you only need to &ldquo;sync&rdquo; your Instagram or game ID &amp; password. In reality, attackers use your password to hijack your account.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-paper-50 dark:bg-ink-900/60 border border-ink/10 dark:border-paper/10 space-y-2">
                <div className="font-display font-bold text-ink dark:text-paper flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-purple-500" />
                  <span>Fake Copyright Deletion</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Screenshots claiming to be official Instagram Legal warnings threaten that your profile will be deleted in 24 hours unless you log in to appeal. Official platforms never send warnings as random banners or DMs.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-paper-50 dark:bg-ink-900/60 border border-ink/10 dark:border-paper/10 space-y-2">
                <div className="font-display font-bold text-ink dark:text-paper flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-500" />
                  <span>Absurd Prize Advance Fee</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Festive graphics claiming you won an iPhone 16 Pro Max demand an upfront ₹499 courier customs charge or asking you to enter your UPI PIN. UPI PINs are only required to send money, never to receive prizes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
