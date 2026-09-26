import React from "react";
import { Check, X, AlertCircle } from "lucide-react";

export function ComparisonTable() {
  const features = [
    {
      capability: "Conversational NLP & Urgency Tactic Detection",
      scamshield: true,
      truecaller: false,
      gsb: false,
      vt: false,
      note: "Detects psychological coercion, artificial urgency, and impersonation spans in chat text.",
    },
    {
      capability: "Explainable Risk Reasons (No Black-Box Score)",
      scamshield: true,
      truecaller: false,
      gsb: false,
      vt: "partial",
      note: "Every score maps directly to verifiable character spans and specific threat heuristics.",
    },
    {
      capability: "Cryptocurrency Multiplier & Seed Phrase Traps",
      scamshield: true,
      truecaller: false,
      gsb: false,
      vt: false,
      note: "Checksum validation across BTC/ETH/TRON/SOL with immediate overrides on seed requests.",
    },
    {
      capability: "Android APK Static Permission Profiler",
      scamshield: true,
      truecaller: false,
      gsb: false,
      vt: true,
      note: "Flags lethal SMS and Accessibility Service permission bundles without requiring execution.",
    },
    {
      capability: "Privacy-Preserving (Zero Address Book Scraping)",
      scamshield: true,
      truecaller: false,
      gsb: true,
      vt: false,
      note: "Never uploads or indexes your contacts. Scans run on local server instances.",
    },
    {
      capability: "Free & Open-Source Academic Tooling",
      scamshield: true,
      truecaller: false,
      gsb: true,
      vt: "partial",
      note: "Fully inspectable code, transparent weights, zero commercial ad-trackers.",
    },
  ];

  return (
    <section className="py-20 bg-paper-100 dark:bg-ink-900 border-t border-ink/10 dark:border-paper/10 transition-colors" id="comparison">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="font-mono text-xs font-semibold text-ultramarine dark:text-ultramarine-light uppercase tracking-wider">
            Honest Comparative Analysis
          </span>
          <h2 className="mt-2 font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-ink dark:text-paper tracking-tight">
            How ScamShield complements existing security tools
          </h2>
          <p className="mt-3 text-sm sm:text-base text-ink/75 dark:text-paper/75">
            Single-vector solutions leave massive blind spots in cross-platform attacks. Here is an objective comparison based on our published literature survey.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-ink/10 dark:border-paper/10 bg-white dark:bg-ink-800 shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-ink/10 dark:border-paper/10 bg-paper-50 dark:bg-ink-950 font-mono text-xs">
                <th className="py-4 px-4 sm:px-6 text-ink/70 dark:text-paper/70 font-semibold w-1/3">
                  Capability / Feature
                </th>
                <th className="py-4 px-3 sm:px-4 text-center font-bold text-ultramarine dark:text-ultramarine-light bg-ultramarine/5 dark:bg-ultramarine/10">
                  ScamShield AI
                </th>
                <th className="py-4 px-3 sm:px-4 text-center text-ink/60 dark:text-paper/60 font-semibold">
                  Truecaller
                </th>
                <th className="py-4 px-3 sm:px-4 text-center text-ink/60 dark:text-paper/60 font-semibold">
                  Google Safe Browsing
                </th>
                <th className="py-4 px-3 sm:px-4 text-center text-ink/60 dark:text-paper/60 font-semibold">
                  VirusTotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 dark:divide-paper/10">
              {features.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-paper-50/50 dark:hover:bg-ink-700/50 transition-colors"
                >
                  <td className="py-4 px-4 sm:px-6">
                    <span className="font-medium text-ink dark:text-paper block">
                      {item.capability}
                    </span>
                    <span className="text-[11px] text-ink/60 dark:text-paper/60 mt-0.5 block">
                      {item.note}
                    </span>
                  </td>

                  {/* ScamShield */}
                  <td className="py-4 px-3 sm:px-4 text-center bg-ultramarine/5 dark:bg-ultramarine/10">
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-verify/20 text-verify">
                      <Check className="w-4 h-4" />
                    </div>
                  </td>

                  {/* Truecaller */}
                  <td className="py-4 px-3 sm:px-4 text-center">
                    {item.truecaller ? (
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-verify/20 text-verify">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-signal/15 text-signal">
                        <X className="w-4 h-4" />
                      </div>
                    )}
                  </td>

                  {/* Google Safe Browsing */}
                  <td className="py-4 px-3 sm:px-4 text-center">
                    {item.gsb ? (
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-verify/20 text-verify">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-signal/15 text-signal">
                        <X className="w-4 h-4" />
                      </div>
                    )}
                  </td>

                  {/* VirusTotal */}
                  <td className="py-4 px-3 sm:px-4 text-center">
                    {item.vt === true ? (
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-verify/20 text-verify">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : item.vt === "partial" ? (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold">
                        Partial
                      </span>
                    ) : (
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-signal/15 text-signal">
                        <X className="w-4 h-4" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Candid Limitations Section */}
        <div className="mt-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1">
              <strong className="font-semibold block">Honest Architectural Limitations:</strong>
              <p>
                ScamShield AI is deliberately client-initiated: we do not violate end-to-end encryption or scrape private platforms without consent. Consequently, scams transmitted via ephemeral messaging that are deleted before user submission cannot be retroactively audited.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
