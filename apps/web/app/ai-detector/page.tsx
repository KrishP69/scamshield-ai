"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Eye, ShieldCheck, ArrowRight, Activity, Cpu } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { AiImageDetector } from "@/components/ui/AiImageDetector";

export default function AiDetectorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper dark:bg-[#090D1F] text-ink dark:text-paper">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header Banner with 3D Depth */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Signal Forensic Intelligence</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-ink dark:text-paper tracking-tight">
              State-of-the-Art AI Image & Deepfake Detector
            </h1>
            <p className="text-sm sm:text-base text-ink/75 dark:text-paper/75 leading-relaxed">
              Forensic frequency domain inspection engineered to unmask Midjourney, DALL-E, Stable Diffusion, Flux, and synthetic face-swap deepfakes before fraud happens.
            </p>
          </div>

          {/* Interactive Forensic Detector Workspace */}
          <AiImageDetector />

          {/* Scientific Methodology Explainer */}
          <div className="rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 p-6 sm:p-8 shadow-lg card-3d">
            <h3 className="font-display font-bold text-lg sm:text-xl text-ink dark:text-paper mb-4">
              How ScamShield AI Inspects Synthetic Deepfakes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-ink/75 dark:text-paper/75">
              <div className="p-4 rounded-xl bg-paper-50 dark:bg-ink-900/60 border border-ink/10 dark:border-paper/10 space-y-2">
                <div className="font-display font-bold text-ink dark:text-paper flex items-center gap-2">
                  <Activity className="w-4 h-4 text-violet-500" />
                  <span>1. 2D Fourier (FFT) Residuals</span>
                </div>
                <p className="leading-relaxed">
                  Natural camera optics produce a clean power spectral decay ($1/f^2$). Generative latent diffusion models use transposed convolutions that imprint unmistakable periodic harmonic grid spikes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-paper-50 dark:bg-ink-900/60 border border-ink/10 dark:border-paper/10 space-y-2">
                <div className="font-display font-bold text-ink dark:text-paper flex items-center gap-2">
                  <Eye className="w-4 h-4 text-violet-500" />
                  <span>2. Error Level Analysis (ELA)</span>
                </div>
                <p className="leading-relaxed">
                  Measures pixel-wise compression surface inconsistencies. Authentic camera captures show balanced error gradients, while synthetic composites exhibit sharp boundary anomalies.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-paper-50 dark:bg-ink-900/60 border border-ink/10 dark:border-paper/10 space-y-2">
                <div className="font-display font-bold text-ink dark:text-paper flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-violet-500" />
                  <span>3. PRNU Sensor Noise Variance</span>
                </div>
                <p className="leading-relaxed">
                  Real physical camera sensors possess photon-shot noise and photo-response non-uniformity (PRNU). AI-generated imagery lacks natural sensor noise, exhibiting synthetic smoothness.
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
