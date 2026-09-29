"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Radio,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Flame,
  Clock,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
} from "lucide-react";

export interface LiveThreatItem {
  id: string;
  url: string;
  display_domain: string;
  threat_type: string;
  risk_score: number;
  risk_level: string;
  detection_method: string;
  timestamp: string;
  origin?: string;
}

interface LiveThreatStreamProps {
  onSelectThreat?: (url: string) => void;
  maxDisplay?: number;
}

export function LiveThreatStream({ onSelectThreat, maxDisplay = 6 }: LiveThreatStreamProps) {
  const [threats, setThreats] = useState<LiveThreatItem[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // 1. Initial snapshot fetch
    const fetchInitialFeed = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/v1/links/live-feed?limit=${maxDisplay}`);
        if (res.ok) {
          const data = await res.json();
          setThreats(data);
          setLastUpdated(new Date());
          setIsConnected(true);
        }
      } catch (err) {
        console.warn("Could not fetch initial threat feed:", err);
      }
    };

    fetchInitialFeed();

    // 2. Establish Real-time SSE connection
    try {
      const es = new EventSource(`${apiUrl}/api/v1/links/stream`);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
      };

      es.onmessage = (event) => {
        if (isPaused) return;
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "new_threat_detected" && payload.threat) {
            setThreats((prev) => {
              const updated = [payload.threat, ...prev.filter((t) => t.id !== payload.threat.id)];
              return updated.slice(0, maxDisplay * 2);
            });
            setLastUpdated(new Date());
          } else if (payload.type === "snapshot" && Array.isArray(payload.threats)) {
            setThreats(payload.threats);
            setLastUpdated(new Date());
          }
        } catch {
          // ignore parsing error
        }
      };

      es.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }

    // 3. Fallback polling interval every 8 seconds if SSE disconnected
    const pollTimer = setInterval(() => {
      if (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
        fetchInitialFeed();
      }
    }, 8000);

    return () => {
      clearInterval(pollTimer);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [isPaused, maxDisplay]);

  const getTimeAgo = (isoString: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diff < 5) return "just now";
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      return `${Math.floor(diff / 3600)}h ago`;
    } catch {
      return "recently";
    }
  };

  return (
    <div className="w-full bg-white dark:bg-ink-800 rounded-2xl border border-ink/10 dark:border-paper/10 shadow-lg p-4 sm:p-6 overflow-hidden">
      {/* Stream Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-ink/10 dark:border-paper/10">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-emerald-500 animate-ping opacity-75" : "bg-amber-500"
              } absolute`}
            />
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? "bg-emerald-500" : "bg-amber-500"
              } relative`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-display font-bold text-ink dark:text-paper">
                Live Phishing Threat Radar
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                REAL-TIME TELEMETRY
              </span>
            </div>
            <p className="text-xs text-ink/60 dark:text-paper/60">
              Live intercepted fishy links with real-time detection method attribution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="text-xs px-2.5 py-1 rounded-md border border-ink/15 dark:border-paper/15 text-ink/70 dark:text-paper/70 hover:bg-paper-200 dark:hover:bg-ink-700 transition-colors"
          >
            {isPaused ? "Resume Live Stream" : "Pause Stream"}
          </button>
        </div>
      </div>

      {/* Threats Ticker List */}
      <div className="mt-4 space-y-2.5">
        {threats.slice(0, maxDisplay).map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => onSelectThreat && onSelectThreat(item.url)}
            className={`group p-3 sm:p-3.5 rounded-xl border transition-all ${
              onSelectThreat ? "cursor-pointer hover:border-ultramarine hover:shadow-md" : ""
            } ${
              item.risk_score >= 90
                ? "bg-rose-500/[0.03] border-rose-500/20 hover:bg-rose-500/[0.06]"
                : "bg-paper-100/60 dark:bg-ink-700/40 border-ink/10 dark:border-paper/10"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              {/* Left: Domain & Method */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-xs font-bold text-ink dark:text-paper truncate max-w-[260px] sm:max-w-md">
                    {item.display_domain || item.url}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.risk_score >= 90
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25"
                    }`}
                  >
                    {item.threat_type}
                  </span>
                </div>

                {/* Highlighted Detection Method */}
                <div className="flex items-center gap-1.5 text-xs text-ultramarine dark:text-ultramarine-light font-medium flex-wrap">
                  <span className="font-semibold text-ink/75 dark:text-paper/75">Method Used:</span>
                  <span className="bg-ultramarine/10 dark:bg-ultramarine/20 px-2 py-0.5 rounded text-[11px] border border-ultramarine/20">
                    🛡️ {item.detection_method}
                  </span>
                </div>
              </div>

              {/* Right: Score & Time */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-1 sm:pt-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                    {item.risk_score}/100
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    {item.risk_level}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-ink/40 dark:text-paper/40">
                  <Clock className="w-3 h-3" />
                  <span>{getTimeAgo(item.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {threats.length === 0 && (
          <div className="text-center py-8 text-ink/50 dark:text-paper/50 text-xs">
            Listening for live phishing and threat intelligence feeds...
          </div>
        )}
      </div>

      {/* Stream Footer Telemetry */}
      <div className="mt-4 pt-3 border-t border-ink/10 dark:border-paper/10 flex flex-wrap items-center justify-between text-[11px] text-ink/60 dark:text-paper/60 gap-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            URLhaus API: Active
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            OpenPhish: Online
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Homoglyph Scanner: Active
          </span>
        </div>
        <span className="text-ink/40 dark:text-paper/40">
          Auto-updates via Server-Sent Events
        </span>
      </div>
    </div>
  );
}
