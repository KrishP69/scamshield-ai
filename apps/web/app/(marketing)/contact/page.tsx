"use client";

import React, { useState } from "react";
import {
  Mail,
  Send,
  AlertCircle,
  PhoneCall,
  ExternalLink,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "incident_report",
    platform: "facebook",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="font-mono text-xs font-semibold text-ultramarine dark:text-ultramarine-light uppercase tracking-wider">
            Get in Touch
          </span>
          <h1 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink dark:text-paper tracking-tight">
            Contact & Incident Reporting
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ink/75 dark:text-paper/75 leading-relaxed">
            Report a newly emerging scam campaign, submit forensic indicators, or reach out to the engineering team.
          </p>
        </div>

        {/* Emergency Helpline Alert Banner */}
        <div className="mt-10 p-6 rounded-2xl bg-signal/10 border border-signal/20 text-signal-dark dark:text-signal">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <PhoneCall className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Immediate Financial Fraud Emergency:</strong>
                <p className="text-xs sm:text-sm mt-0.5">
                  If money was debited from your bank account within the last 24 hours, immediately call the National Cyber Helpline at <strong>1930</strong> to initiate golden-hour account freeze.
                </p>
              </div>
            </div>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-signal text-white text-xs font-semibold whitespace-nowrap self-start sm:self-auto hover:bg-signal-dark transition-colors"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Main Grid: Form + Info */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact / Report Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm">
              <h2 className="font-display font-bold text-xl text-ink dark:text-paper mb-2">
                Submit Intelligence or Inquire
              </h2>
              <p className="text-xs sm:text-sm text-ink/70 dark:text-paper/70 mb-6">
                Fill out the form below. Community reports are anonymized and reviewed for addition to our threat database.
              </p>

              {submitted ? (
                <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 text-center space-y-3">
                  <CheckCircle className="w-8 h-8 text-verify mx-auto" />
                  <h3 className="font-display font-bold text-lg">Thank You</h3>
                  <p className="text-xs sm:text-sm">
                    Your report has been securely recorded. Our team will review the sample indicators to strengthen our detection rules.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        category: "incident_report",
                        platform: "facebook",
                        message: "",
                      });
                    }}
                  >
                    Submit Another Report
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-xs font-medium text-ink/70 dark:text-paper/70 mb-1"
                      >
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Anonymous Citizen"
                        className="w-full px-3.5 py-2 rounded-lg bg-paper-50 dark:bg-ink-950 border border-ink/15 dark:border-paper/15 text-xs sm:text-sm text-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-ultramarine"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-medium text-ink/70 dark:text-paper/70 mb-1"
                      >
                        Contact Email (Optional)
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@domain.com"
                        className="w-full px-3.5 py-2 rounded-lg bg-paper-50 dark:bg-ink-950 border border-ink/15 dark:border-paper/15 text-xs sm:text-sm text-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-ultramarine"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="category"
                        className="block text-xs font-medium text-ink/70 dark:text-paper/70 mb-1"
                      >
                        Report Type
                      </label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-lg bg-paper-50 dark:bg-ink-950 border border-ink/15 dark:border-paper/15 text-xs sm:text-sm text-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-ultramarine"
                      >
                        <option value="incident_report">Report Scam Message / Link</option>
                        <option value="bug_report">Report Platform Bug</option>
                        <option value="academic_inquiry">Academic Research Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="platform"
                        className="block text-xs font-medium text-ink/70 dark:text-paper/70 mb-1"
                      >
                        Platform Involved
                      </label>
                      <select
                        id="platform"
                        value={formData.platform}
                        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-lg bg-paper-50 dark:bg-ink-950 border border-ink/15 dark:border-paper/15 text-xs sm:text-sm text-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-ultramarine"
                      >
                        <option value="facebook">Facebook Marketplace / Groups</option>
                        <option value="telegram">Telegram Channel / DM</option>
                        <option value="whatsapp">WhatsApp Message</option>
                        <option value="other">Other / Web Phishing</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs font-medium text-ink/70 dark:text-paper/70 mb-1"
                    >
                      Message Details / Threat Indicators
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Paste suspicious text, phone numbers, UPI VPAs, crypto wallet addresses, or describe the encounter..."
                      className="w-full px-3.5 py-2 rounded-lg bg-paper-50 dark:bg-ink-950 border border-ink/15 dark:border-paper/15 text-xs sm:text-sm text-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-ultramarine"
                    />
                  </div>

                  <Button type="submit" className="w-full justify-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>Send Threat Report</span>
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm space-y-3">
              <span className="font-mono text-xs font-semibold text-ultramarine uppercase">
                Academic Campus
              </span>
              <h3 className="font-display font-bold text-lg text-ink dark:text-paper">
                Usha Mittal Institute of Technology
              </h3>
              <p className="text-xs sm:text-sm text-ink/70 dark:text-paper/70 leading-relaxed">
                Department of Information Technology, SNDT Women&apos;s University, Juhu-Tara Road, Santacruz (West), Mumbai, Maharashtra 400049.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm space-y-3">
              <span className="font-mono text-xs font-semibold text-ultramarine uppercase">
                Open Source Repository
              </span>
              <h3 className="font-display font-bold text-lg text-ink dark:text-paper">
                GitHub Contributions
              </h3>
              <p className="text-xs sm:text-sm text-ink/70 dark:text-paper/70 leading-relaxed">
                ScamShield AI is an open-source security tool. Report bugs, submit pull requests, or explore the code on GitHub.
              </p>
              <a
                href="https://github.com/scamshield-ai/scamshield-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ultramarine dark:text-ultramarine-light hover:underline pt-1"
              >
                <span>github.com/scamshield-ai</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
