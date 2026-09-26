import React from "react";
import Link from "next/link";
import {
  FileCode,
  Terminal,
  ExternalLink,
  Copy,
  Layers,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "API Documentation & Developer Quickstart — ScamShield AI",
  description:
    "Explore the OpenAPI v3 specification, REST endpoints, Server-Sent Events protocols, and TypeScript client integration for ScamShield AI.",
};

export default function DocsPage() {
  const endpoints = [
    {
      method: "POST",
      path: "/api/v1/scans",
      summary: "Create Scan",
      desc: "Submits message text, URL, phone number, wallet address, or multipart file/image for multi-layered analysis.",
    },
    {
      method: "GET",
      path: "/api/v1/scans/{id}",
      summary: "Get Trust Passport",
      desc: "Retrieves complete Trust Passport with explainable reasons, IOC indicators, and risk score.",
    },
    {
      method: "GET",
      path: "/api/v1/scans/{id}/stream",
      summary: "Stream Partial Findings",
      desc: "Server-Sent Events (SSE) endpoint providing real-time progress events as detection modules finish.",
    },
    {
      method: "POST",
      path: "/api/v1/scans/quick",
      summary: "Quick Evaluation",
      desc: "Lightweight sub-100ms endpoint for the Android Accessibility Service and browser extensions.",
    },
    {
      method: "GET",
      path: "/api/v1/history",
      summary: "Scan History",
      desc: "Returns paginated list of previous scans for authenticated users with search filtering.",
    },
    {
      method: "DELETE",
      path: "/api/v1/history/{id}",
      summary: "Delete Scan & Erasure",
      desc: "Permanently deletes scan data and associated records from database.",
    },
    {
      method: "GET",
      path: "/api/v1/health",
      summary: "Readiness & Adapters",
      desc: "Reports service health and connection statuses for external threat adapters (GSB, VirusTotal).",
    },
  ];

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="font-mono text-xs font-semibold text-ultramarine dark:text-ultramarine-light uppercase tracking-wider">
            Developer Reference
          </span>
          <h1 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink dark:text-paper tracking-tight">
            API Documentation & Architecture
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ink/75 dark:text-paper/75 leading-relaxed">
            ScamShield AI exposes a versioned REST API documented with OpenAPI v3. All responses adhere to typed Pydantic contracts and include machine-readable evidence.
          </p>
        </div>

        {/* Quickstart Code */}
        <div className="mt-12 rounded-2xl overflow-hidden border border-ink/10 dark:border-paper/10 bg-ink-950 text-paper font-mono text-xs shadow-lg">
          <div className="px-5 py-3 bg-ink-900 border-b border-paper/10 flex items-center justify-between text-paper/60 text-[11px]">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-verify" />
              <span>Quickstart: Scan a suspicious message via curl</span>
            </span>
            <span>REST API v1</span>
          </div>
          <pre className="p-5 overflow-x-auto text-paper/90 leading-relaxed text-xs">
{`curl -X POST "http://localhost:8000/api/v1/scans" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "Urgent: Your electricity will be disconnected tonight. Pay immediately at https://maha-bill-pay.live",
    "platform": "facebook",
    "store_history": false
  }'`}
          </pre>
        </div>

        {/* Endpoints Table */}
        <div className="mt-16">
          <h2 className="font-display font-bold text-2xl text-ink dark:text-paper mb-6">
            Core REST Endpoints
          </h2>

          <div className="space-y-4">
            {endpoints.map((ep, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                        ep.method === "POST"
                          ? "bg-ultramarine/15 text-ultramarine dark:text-ultramarine-light"
                          : ep.method === "DELETE"
                          ? "bg-signal/15 text-signal"
                          : "bg-verify/15 text-verify"
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-semibold text-ink dark:text-paper">
                      {ep.path}
                    </span>
                  </div>
                  <p className="text-xs text-ink/70 dark:text-paper/70 leading-relaxed">
                    {ep.desc}
                  </p>
                </div>

                <span className="text-[11px] font-mono text-ink/40 dark:text-paper/40 shrink-0">
                  {ep.summary}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TypeScript Client */}
        <div className="mt-16 p-8 rounded-3xl bg-paper-100 dark:bg-ink-900 border border-ink/10 dark:border-paper/10">
          <div className="max-w-2xl space-y-4">
            <h2 className="font-display font-bold text-2xl text-ink dark:text-paper">
              Type-Safe TypeScript Client
            </h2>
            <p className="text-sm text-ink/75 dark:text-paper/75 leading-relaxed">
              Our frontend and external integrations consume an auto-generated client built directly from OpenAPI schemas in <code>packages/contracts</code>, ensuring contract sync across the entire monorepo.
            </p>
            <div className="p-4 rounded-xl bg-ink-950 font-mono text-xs text-paper/90">
              <code>npm install @scamshield/contracts</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
