"use client";

import React, { useState } from "react";
import {
  Clock,
  ShieldAlert,
  Coins,
  Key,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  ShieldCheck,
  Send,
  HelpCircle,
} from "lucide-react";

export interface ThreatFactorItem {
  category: string;
  title: string;
  is_triggered: boolean;
  severity: "critical" | "high" | "caution" | "medium" | "low" | "safe";
  explanation: string;
  evidence_snippet?: string | null;
}

interface ThreatFactorsSectionProps {
  factors?: ThreatFactorItem[];
  riskScore?: number;
  className?: string;
}

const FACTOR_ICONS: Record<string, React.ElementType> = {
  coercion: Clock,
  identity: ShieldAlert,
  financial: Coins,
  credential: Key,
  destination: ExternalLink,
};

const FACTOR_DEFENSE_TIPS: Record<string, string> = {
  coercion: "Defensive Rule: Legitimate organizations never impose immediate 15-minute deadlines or threaten immediate digital arrest.",
  identity: "Defensive Rule: Always verify claims independently through official corporate apps or numbers—never through links or handles provided in chat.",
  financial: "Defensive Rule: In genuine commerce and employment, you never pay money to receive money or get paid for simple app ratings.",
  credential: "Defensive Rule: Zero-trust standard: Never disclose OTPs, login verification codes, UPI PINs, or 12-word seed phrases to anyone.",
  destination: "Defensive Rule: Beware of migration traps. Scammers move you to Telegram (@username or t.me) to operate outside platform fraud monitoring.",
};

export function ThreatFactorsSection({
  factors = [],
  riskScore = 0,
  className = "",
}: ThreatFactorsSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!factors || factors.length === 0) {
    return null;
  }

  const triggeredCount = factors.filter((f) => f.is_triggered).length;
  const isAllClean = triggeredCount === 0;

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm p-5 sm:p-7 transition-all ${className}`}
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 dark:border-paper/10 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-ultramarine/10 text-ultramarine dark:text-ultramarine-light">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Factor Analysis Engine</span>
            </span>
            <span className="text-xs text-ink/40 dark:text-paper/40 font-mono">
              • 5-Pillar Scam Decomposition
            </span>
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-ink dark:text-paper tracking-tight">
            Why is this fishy? (Threat Breakdown)
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-ink/70 dark:text-paper/70 max-w-2xl leading-relaxed">
            Our multi-vector intelligence dissects the psychological, financial, and technical factors used by modern fraudsters across Telegram, WhatsApp, and the web.
          </p>
        </div>

        {/* Aggregate Status Indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono font-semibold ${
              isAllClean
                ? "bg-verify/10 border-verify/30 text-verify-dark dark:text-verify"
                : triggeredCount >= 3
                ? "bg-signal/10 border-signal/30 text-signal-dark dark:text-signal"
                : "bg-caution/10 border-caution/30 text-caution-dark dark:text-caution"
            }`}
          >
            {isAllClean ? (
              <>
                <ShieldCheck className="w-4 h-4 text-verify" />
                <span>All 5 Threat Factors Clean</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>
                  {triggeredCount} of {factors.length} Threat Factors Triggered
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Factor Cards Grid */}
      <div className="space-y-3.5">
        {factors.map((factor, idx) => {
          const categoryKey = factor.category.toLowerCase();
          const IconComponent = FACTOR_ICONS[categoryKey] || HelpCircle;
          const isExpanded = expandedIndex === idx;
          const isTriggered = factor.is_triggered;
          const defenseTip = FACTOR_DEFENSE_TIPS[categoryKey];

          // Severity styling
          let badgeStyles = "bg-paper-200 dark:bg-ink-700 text-ink/60 dark:text-paper/60 border-transparent";
          let borderHighlight = "border-ink/10 dark:border-paper/10";
          let iconBg = "bg-paper-100 dark:bg-ink-900 text-ink/60 dark:text-paper/60";

          if (isTriggered) {
            if (factor.severity === "critical") {
              badgeStyles = "bg-signal/15 text-signal-dark dark:text-signal border-signal/30";
              borderHighlight = "border-signal/30 dark:border-signal/30 bg-signal/[0.02]";
              iconBg = "bg-signal/15 text-signal";
            } else if (factor.severity === "high") {
              badgeStyles = "bg-signal/15 text-signal-dark dark:text-signal border-signal/30";
              borderHighlight = "border-signal/25 dark:border-signal/25 bg-signal/[0.01]";
              iconBg = "bg-signal/15 text-signal";
            } else {
              badgeStyles = "bg-caution/15 text-caution-dark dark:text-caution border-caution/30";
              borderHighlight = "border-caution/25 dark:border-caution/25";
              iconBg = "bg-caution/15 text-caution";
            }
          } else {
            badgeStyles = "bg-verify/10 text-verify-dark dark:text-verify border-verify/20";
            iconBg = "bg-verify/10 text-verify";
          }

          return (
            <div
              key={idx}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${borderHighlight} ${
                isExpanded ? "ring-1 ring-ultramarine/40 shadow-sm" : "hover:border-ink/20 dark:hover:border-paper/20"
              }`}
            >
              {/* Card Header (Clickable) */}
              <button
                type="button"
                onClick={() => toggleExpand(idx)}
                className="w-full text-left p-4 sm:p-4.5 flex items-start sm:items-center justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine"
                aria-expanded={isExpanded}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold text-sm sm:text-base text-ink dark:text-paper">
                        {factor.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${badgeStyles}`}
                      >
                        {isTriggered ? `${factor.severity.toUpperCase()} RISK` : "CLEAN / SAFE"}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-ink/50 dark:text-paper/50 capitalize block mt-0.5">
                      Pillar: {factor.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 pt-1 sm:pt-0">
                  {factor.evidence_snippet && isTriggered && (
                    <span className="hidden md:inline-flex text-[11px] font-mono px-2 py-0.5 rounded bg-paper-100 dark:bg-ink-900 border border-ink/10 dark:border-paper/10 text-ink/80 dark:text-paper/80 max-w-[200px] truncate">
                      Clue: {factor.evidence_snippet}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-ink/40 dark:text-paper/40" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-ink/40 dark:text-paper/40" />
                  )}
                </div>
              </button>

              {/* Card Body: Why it is fishy breakdown */}
              <div
                className={`px-4 sm:px-4.5 pb-4 pt-1 border-t border-ink/5 dark:border-paper/5 ${
                  isExpanded ? "block" : "hidden sm:block"
                }`}
              >
                {/* Explanation text */}
                <div className="space-y-2.5">
                  <p className="text-xs sm:text-sm text-ink/80 dark:text-paper/80 leading-relaxed">
                    <strong className="text-ink dark:text-paper font-semibold block sm:inline mr-1">
                      {isTriggered ? "Why this is fishy:" : "Safety Assessment:"}
                    </strong>
                    {factor.explanation}
                  </p>

                  {/* Highlighted Evidence Snippet if triggered */}
                  {isTriggered && factor.evidence_snippet && (
                    <div className="p-2.5 rounded-lg bg-paper-100 dark:bg-ink-950 border border-ink/10 dark:border-paper/10 text-xs flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase font-bold text-signal px-1.5 py-0.5 rounded bg-signal/10 flex-shrink-0">
                        Triggered by Text
                      </span>
                      <span className="font-mono text-ink/90 dark:text-paper/90 truncate">
                        &ldquo;{factor.evidence_snippet}&rdquo;
                      </span>
                    </div>
                  )}

                  {/* Defensive Protection Rule (Visible when expanded or triggered) */}
                  {(isExpanded || isTriggered) && defenseTip && (
                    <div className="pt-2 text-[11px] text-ink/65 dark:text-paper/65 flex items-start gap-1.5 border-t border-ink/5 dark:border-paper/5">
                      <Info className="w-3.5 h-3.5 text-ultramarine flex-shrink-0 mt-0.5" />
                      <span>{defenseTip}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
