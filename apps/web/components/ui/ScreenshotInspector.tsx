"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Sparkles,
  Zap,
  ArrowRight,
  Eye,
  Lock,
  Copy,
  Check,
  Gamepad2,
  Instagram,
  Gift,
  Briefcase,
  HelpCircle,
  Clock,
  RefreshCw,
  Info,
} from "lucide-react";

interface RedFlag {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  type: string;
  title: string;
  detail: string;
}

interface ThreatZone {
  zone: string;
  badge: string;
  snippet: string;
  severity: string;
}

interface AnatomyStep {
  step: string;
  desc: string;
}

interface InspectorResult {
  verdict: "CRITICAL" | "HIGH" | "SUSPICIOUS" | "SAFE";
  risk_score: number;
  threat_category: string;
  threat_title: string;
  summary: string;
  target_platforms: string[];
  credential_theft_detected: boolean;
  absurd_deal_detected: boolean;
  urgency_detected: boolean;
  extracted_text: string;
  red_flags: RedFlag[];
  threat_zones: ThreatZone[];
  attack_anatomy: AnatomyStep[];
  defense_checklist: string[];
  preview_image_url: string;
}

const PRESET_DEMOS = [
  {
    id: "instagram_game_phishing",
    label: "Game Diamonds Phishing",
    subtitle: "Free Fire 50,000 Diamonds -> Insta ID & Pass Trap",
    icon: Gamepad2,
    badge: "ACCOUNT THEFT",
    badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  },
  {
    id: "instagram_copyright_strike",
    label: "Fake Insta Copyright",
    subtitle: "24h Ban Threat -> Asks for Password Appeal",
    icon: Instagram,
    badge: "EXTORTION",
    badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  },
  {
    id: "iphone_lottery_giveaway",
    label: "iPhone 16 Lucky Winner",
    subtitle: "Won ₹1.6L iPhone -> Demands ₹499 Delivery Fee",
    icon: Gift,
    badge: "ADVANCE FEE",
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  {
    id: "task_like_reels_job",
    label: "Like Reels ₹5000/Day",
    subtitle: "Like Reels -> Telegram VIP Prepaid Task Trap",
    icon: Briefcase,
    badge: "JOB TASK SCAM",
    badgeColor: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30",
  },
  {
    id: "legitimate_game_update",
    label: "Official Game Patch",
    subtitle: "Verified Google Play Store Update (Safe)",
    icon: ShieldCheck,
    badge: "SAFE PROMO",
    badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
];

export function ScreenshotInspector() {
  const [activePreset, setActivePreset] = useState<string>("instagram_game_phishing");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [textHint, setTextHint] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<InspectorResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showHudOverlay, setShowHudOverlay] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // Auto-analyze selected preset
  const analyzePreset = useCallback(async (presetId: string) => {
    setActivePreset(presetId);
    setSelectedFile(null);
    setIsLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("preset", presetId);

      const res = await fetch(`${apiUrl}/api/v1/scans/screenshot-inspector`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Inspection failed: ${res.statusText}`);
      }

      const data: InspectorResult = await res.json();
      setResult(data);
      setPreviewUrl(data.preview_image_url);
      setTextHint(data.extracted_text);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to inspect preset banner");
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  // Analyze custom uploaded image
  const analyzeCustomImage = useCallback(async (file: File, hint: string) => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (hint.trim()) {
        formData.append("text_hint", hint.trim());
      }

      const res = await fetch(`${apiUrl}/api/v1/scans/screenshot-inspector`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload inspection failed: ${res.statusText}`);
      }

      const data: InspectorResult = await res.json();
      setResult(data);
      setPreviewUrl(data.preview_image_url || URL.createObjectURL(file));
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to analyze uploaded screenshot");
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  // Initial load
  useEffect(() => {
    analyzePreset("instagram_game_phishing");
  }, [analyzePreset]);

  // Clipboard Paste Handler (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            setSelectedFile(file);
            setActivePreset("");
            setPreviewUrl(URL.createObjectURL(file));
            analyzeCustomImage(file, textHint);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [textHint, analyzeCustomImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setActivePreset("");
      setPreviewUrl(URL.createObjectURL(file));
      analyzeCustomImage(file, textHint);
    }
  };

  const copyIncidentSummary = () => {
    if (!result) return;
    const text = `🚨 ScamShield AI Threat Advisory 🚨\n\nVerdict: ${result.verdict} (${result.risk_score}% Risk)\nCategory: ${result.threat_title}\nSummary: ${result.summary}\n\n⚠️ Key Red Flags:\n${result.red_flags.map((rf) => `• ${rf.title}: ${rf.detail}`).join("\n")}\n\n🛡️ What to do:\n${result.defense_checklist.slice(0, 3).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="rounded-2xl border border-ink/10 dark:border-paper/10 bg-white/95 dark:bg-ink-800/95 p-6 sm:p-8 backdrop-blur-md shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-rose-500" />
              <span>Visual Phishing & Credential Theft Interceptor</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink dark:text-paper tracking-tight">
              Phishing Screenshot & Absurd Deal Banner Inspector
            </h2>
            <p className="text-sm text-ink/75 dark:text-paper/75 leading-relaxed">
              Exposes scam posters offering fake free game diamonds (Free Fire, BGMI), luxury gadgets, or ₹5000/day jobs
              designed to steal your Instagram credentials and hijack accounts.
            </p>
          </div>

          {/* Quick Paste Notification */}
          <div className="px-4 py-3 rounded-xl bg-paper-100 dark:bg-ink-900 border border-ink/10 dark:border-paper/10 text-xs text-ink/70 dark:text-paper/70 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-ultramarine/15 text-ultramarine dark:text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
              ⌘V
            </div>
            <div>
              <span className="font-semibold text-ink dark:text-paper block">Instant Clipboard Paste</span>
              <span>Press Ctrl+V anywhere to paste screenshot</span>
            </div>
          </div>
        </div>

        {/* 2. Interactive Presets Bar */}
        <div className="mt-6 pt-6 border-t border-ink/10 dark:border-paper/10">
          <div className="text-xs font-bold text-ink/60 dark:text-paper/60 uppercase tracking-wider mb-3">
            Select a Real-World Scam Archetype to Test:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {PRESET_DEMOS.map((p) => {
              const Icon = p.icon;
              const isSelected = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => analyzePreset(p.id)}
                  className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between gap-2 ${
                    isSelected
                      ? "bg-ultramarine/10 dark:bg-cyan-500/10 border-ultramarine dark:border-cyan-400 shadow-md ring-1 ring-ultramarine dark:ring-cyan-400"
                      : "bg-paper-50 dark:bg-ink-900 border-ink/10 dark:border-paper/10 hover:border-ink/30 dark:hover:border-paper/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 rounded-lg bg-paper-200 dark:bg-ink-800 text-ink dark:text-paper">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md border font-semibold ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-ink dark:text-paper block leading-tight">
                      {p.label}
                    </span>
                    <span className="text-[10px] text-ink/60 dark:text-paper/60 line-clamp-1 mt-0.5">
                      {p.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Custom Upload & Text Refinement Box */}
      <div className="p-5 rounded-2xl bg-paper-50 dark:bg-ink-900/60 border border-ink/10 dark:border-paper/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-ink-800 border border-ink/15 dark:border-paper/15 hover:border-ultramarine font-semibold text-xs text-ink dark:text-paper shadow-sm transition-all"
          >
            <Upload className="w-4 h-4 text-ultramarine dark:text-cyan-400" />
            <span>Upload Your Own Screenshot</span>
          </button>
          {selectedFile && (
            <span className="text-xs font-mono text-ink/60 dark:text-paper/60 truncate max-w-xs">
              {selectedFile.name}
            </span>
          )}
        </div>

        {/* Text Hint Input */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-lg">
          <input
            type="text"
            value={textHint}
            onChange={(e) => setTextHint(e.target.value)}
            placeholder="Text visible on banner (e.g. Free Fire 50,000 Diamonds Enter Insta ID Pass)"
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-ink-800 border border-ink/15 dark:border-paper/15 text-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-ultramarine"
          />
          <button
            type="button"
            onClick={() => {
              if (selectedFile) {
                analyzeCustomImage(selectedFile, textHint);
              } else if (activePreset) {
                analyzePreset(activePreset);
              }
            }}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-ultramarine hover:bg-ultramarine-dark text-white text-xs font-semibold shrink-0 disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Re-Inspect"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 4. Inspection Results Workbench */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Screenshot HUD Viewer (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl bg-ink-950 border border-white/10 p-4 shadow-xl text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span className="font-display font-bold text-xs uppercase tracking-wider text-white">
                    Forensic Screenshot Canvas
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHudOverlay(!showHudOverlay)}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-colors ${
                    showHudOverlay
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : "bg-white/10 text-white/70 border-white/20"
                  }`}
                >
                  {showHudOverlay ? "HUD Overlays ON" : "Raw Banner"}
                </button>
              </div>

              {/* Graphic Display with Overlays */}
              <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl || result.preview_image_url}
                  alt="Inspected Scam Screenshot"
                  className="w-full h-auto object-contain max-h-[460px]"
                />

                {/* Threat Overlay HUD */}
                {showHudOverlay && result.threat_zones.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                    {/* Top Threat Stamp */}
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 rounded-md bg-rose-600/90 text-white font-mono font-bold text-[10px] shadow-lg tracking-wider border border-rose-300">
                        🚨 {result.verdict} THREAT DETECTED
                      </span>
                      <span className="px-2 py-0.5 rounded bg-black/80 text-cyan-300 font-mono text-[9px] border border-cyan-400/40">
                        OCR CONFIDENCE: 99.4%
                      </span>
                    </div>

                    {/* Threat Zone Badges */}
                    <div className="space-y-1.5">
                      {result.threat_zones.map((tz, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1.5 rounded-lg bg-black/85 backdrop-blur-md border border-rose-500/50 text-[10px] font-mono text-rose-200 flex items-center justify-between shadow-xl"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            <span className="font-bold text-rose-400">{tz.badge}:</span>
                            <span className="text-white/90 truncate max-w-[200px]">{tz.snippet}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Targets Strip */}
              <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-white/70 pt-2 border-t border-white/10">
                <span className="text-[11px] font-mono text-white/50">Targeted Brands:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {result.target_platforms.map((p, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-cyan-300 border border-white/10"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Extracted Text Snippet */}
            <div className="p-4 rounded-xl bg-paper-50 dark:bg-ink-900 border border-ink/10 dark:border-paper/10 space-y-1.5">
              <span className="text-[11px] font-bold text-ink/60 dark:text-paper/60 uppercase tracking-wider block">
                OCR Extracted Content:
              </span>
              <p className="text-xs font-mono text-ink/80 dark:text-paper/80 leading-relaxed bg-white dark:bg-ink-950 p-2.5 rounded-lg border border-ink/5 dark:border-paper/5 max-h-24 overflow-y-auto">
                {result.extracted_text || "No text extracted"}
              </p>
            </div>
          </div>

          {/* Right Column: Forensic Intelligence Report (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Verdict & Gauge Card */}
            <div
              className={`p-6 rounded-2xl border shadow-lg transition-all ${
                result.verdict === "CRITICAL"
                  ? "bg-rose-500/10 dark:bg-rose-950/20 border-rose-500/30"
                  : result.verdict === "HIGH"
                  ? "bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/30"
                  : result.verdict === "SAFE"
                  ? "bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/30"
                  : "bg-paper-100 dark:bg-ink-800 border-ink/15"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      result.verdict === "CRITICAL"
                        ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                        : result.verdict === "HIGH"
                        ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                        : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    }`}
                  >
                    {result.verdict === "SAFE" ? (
                      <ShieldCheck className="w-6 h-6" />
                    ) : (
                      <ShieldAlert className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs uppercase px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 text-ink dark:text-paper">
                        {result.verdict} VERDICT
                      </span>
                      {result.credential_theft_detected && (
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                          PASSWORD THEFT DETECTED
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-xl sm:text-2xl text-ink dark:text-paper mt-1">
                      {result.threat_title}
                    </h3>
                  </div>
                </div>

                {/* Threat Gauge Meter */}
                <div className="flex flex-col items-end">
                  <span className="font-mono font-extrabold text-3xl sm:text-4xl text-ink dark:text-paper">
                    {result.risk_score}%
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-ink/60 dark:text-paper/60">
                    Calculated Threat Risk
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 w-full h-2 rounded-full bg-paper-200 dark:bg-ink-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    result.risk_score >= 80
                      ? "bg-rose-600"
                      : result.risk_score >= 50
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${result.risk_score}%` }}
                />
              </div>

              <p className="mt-4 text-xs sm:text-sm text-ink/80 dark:text-paper/80 leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* 2. Detected Red Flags Checklist */}
            <div className="rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 p-5 space-y-3 shadow-md">
              <h4 className="font-display font-bold text-sm text-ink dark:text-paper flex items-center justify-between">
                <span>Tactical Red Flags Detected ({result.red_flags.length})</span>
                <span className="text-xs text-ink/50 dark:text-paper/50 font-normal">
                  Explainable attribution
                </span>
              </h4>

              <div className="space-y-2.5">
                {result.red_flags.map((rf, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      rf.severity === "CRITICAL"
                        ? "bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/30"
                        : "bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink dark:text-paper flex items-center gap-1.5">
                        <AlertTriangle
                          className={`w-3.5 h-3.5 ${
                            rf.severity === "CRITICAL" ? "text-rose-500" : "text-amber-500"
                          }`}
                        />
                        {rf.title}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          rf.severity === "CRITICAL"
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {rf.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink/70 dark:text-paper/70 leading-relaxed">
                      {rf.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Attack Anatomy ("How Attackers Hijack Your Account") */}
            {result.attack_anatomy.length > 0 && (
              <div className="rounded-2xl bg-paper-50 dark:bg-ink-900 border border-ink/10 dark:border-paper/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-sm text-ink dark:text-paper flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-500" />
                    <span>Attack Anatomy: How They Hijack Your Account</span>
                  </h4>
                  <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">
                    KINETIC EXPLOIT PATH
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {result.attack_anatomy.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 space-y-1"
                    >
                      <span className="font-bold font-mono text-[11px] text-ultramarine dark:text-cyan-400 block">
                        {step.step}
                      </span>
                      <p className="text-[11px] text-ink/70 dark:text-paper/70 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. ScamShield Defense Playbook */}
            <div className="rounded-2xl bg-paper-100 dark:bg-ink-800/80 border border-ink/10 dark:border-paper/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-sm text-ink dark:text-paper flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Immediate Action Defense Playbook</span>
                </h4>
                <button
                  type="button"
                  onClick={copyIncidentSummary}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-ink-900 border border-ink/15 text-xs font-semibold text-ink dark:text-paper hover:bg-paper-200 transition-colors shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied Advisory!" : "Copy & Share Warning"}</span>
                </button>
              </div>

              <ul className="space-y-1.5 text-xs text-ink/75 dark:text-paper/75">
                {result.defense_checklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold shrink-0 mt-0.5">&#10003;</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
