import React from "react";
import { AlertCircle, TrendingUp, ShieldAlert, ExternalLink } from "lucide-react";

export function StatsSection() {
  const stats = [
    {
      stat: "1.1+ Million",
      metric: "Cyber fraud complaints in India (2023)",
      source: "MHA Indian Cyber Crime Coordination Centre (I4C)",
      sourceUrl: "https://cybercrime.gov.in",
      note: "Over ₹7,488 crore reported stolen via social engineering and digital financial fraud in a single calendar year.",
    },
    {
      stat: "334%",
      metric: "Surge in digital payment fraud volume",
      source: "Reserve Bank of India (RBI) Annual Report 2023–24",
      sourceUrl: "https://rbi.org.in",
      note: "Card and internet-banking fraud surged to ₹1,457 crore, driven predominantly by phishing and fraudulent QR codes.",
    },
    {
      stat: "70%+",
      metric: "Cross-platform lure movement",
      source: "CERT-In Cyber Security Advisory & Literature Survey",
      sourceUrl: "https://www.cert-in.org.in",
      note: "Attacks originating on Facebook Marketplace or comments funnel victims to private Telegram channels within 3 messages.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-paper-100 dark:bg-ink-900 border-y border-ink/10 dark:border-paper/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-signal/10 border border-signal/20 text-signal font-mono text-xs font-semibold uppercase tracking-wider mb-4">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>The Reality of Social Engineering</span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-ink dark:text-paper tracking-tight">
            Scammers don&apos;t hack databases. They manipulate people across platforms.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink/75 dark:text-paper/75 leading-relaxed">
            The modern cyber scam is not a brute-force assault. Fraudsters establish initial trust on public Facebook Marketplace listings or sponsored posts, then redirect victims to private Telegram channels or malicious APK downloads. By the time bank accounts are debited, the chat history is wiped.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((item, index) => (
            <div
              key={index}
              className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm"
            >
              <div>
                <span className="font-display font-extrabold text-3xl sm:text-4xl text-ultramarine dark:text-ultramarine-light">
                  {item.stat}
                </span>
                <h3 className="mt-2 text-sm sm:text-base font-semibold text-ink dark:text-paper">
                  {item.metric}
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-ink/70 dark:text-paper/70 leading-relaxed">
                  {item.note}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-ink/10 dark:border-paper/10 flex items-center justify-between text-xs text-ink/50 dark:text-paper/50">
                <span className="truncate pr-2">{item.source}</span>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ultramarine inline-flex items-center gap-1 shrink-0"
                  aria-label={`View source at ${item.source}`}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
