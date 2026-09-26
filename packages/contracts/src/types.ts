/**
 * ScamShield AI — TypeScript Contracts (Generated from Pydantic Schemas)
 * DO NOT MODIFY MANUALLY. Any changes must originate from Pydantic schemas in Phase 0.
 */

export type RiskLevel = "LOW" | "CAUTION" | "HIGH" | "CRITICAL" | "INCONCLUSIVE";

export type Verdict = "safe" | "suspicious" | "dangerous" | "unknown";

export type SeverityLevel = "low" | "medium" | "high" | "critical";

export type PlatformType = "facebook" | "telegram" | "whatsapp" | "unknown";

export type ScanSource = "model" | "rule" | "external_api" | "offline_fallback";

export type ModuleStatus = "done" | "failed" | "skipped" | "not_checked";

export interface Evidence {
  code: string;
  severity: SeverityLevel;
  title: string;
  plain_text: string;
  source: ScanSource;
  span?: [number, number] | null;
}

export interface Finding {
  module: string;
  score: number;
  confidence: number;
  verdict: Verdict;
  evidence: Evidence[];
  indicators: Record<string, any>;
  source: ScanSource;
  latency_ms: number;
}

export interface ModuleSummary {
  name: string;
  status: ModuleStatus;
  score?: number | null;
  confidence?: number | null;
  source?: string | null;
  latency_ms?: number | null;
}

export interface IndicatorSummary {
  urls: string[];
  wallets: string[];
  phones: string[];
  usernames: string[];
  files: string[];
}

export interface TrustPassport {
  scan_id: string;
  risk_score: number;
  level: RiskLevel;
  confidence: number;
  scam_type?: string | null;
  reasons: Evidence[];
  modules: ModuleSummary[];
  indicators: IndicatorSummary;
  actions: string[];
  disclaimer: string;
  created_at: string;
}

export interface ScanCreateRequest {
  text?: string;
  platform?: PlatformType;
  url?: string;
  phone?: string;
  username?: string;
  wallet_address?: string;
  store_history?: boolean;
}

export interface QuickScanRequest {
  url_hashes: string[];
  text_snippet?: string;
  platform?: PlatformType;
}

export interface QuickScanResponse {
  is_flagged: boolean;
  risk_hint: string;
  reasons: string[];
}

export interface ScanResponse {
  scan_id: string;
  status: string;
  passport?: TrustPassport | null;
}

export interface UserResponse {
  id: string;
  email: string;
  role: string;
  store_history: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface HistoryItem {
  id: string;
  input_type: string;
  platform: string;
  risk_score: number;
  level: string;
  scam_type?: string | null;
  passport: TrustPassport;
  created_at: string;
}

export interface HistoryListResponse {
  items: HistoryItem[];
  total: number;
  page: number;
  size: number;
}

export interface ShareReportResponse {
  share_token: string;
  share_url: string;
  expires_at: string;
}

export interface CommunityReportCreate {
  kind: string;
  indicator_value: string;
  platform?: string;
  note?: string;
}

export interface CommunityReportResponse {
  reputation_id: string;
  report_count: number;
  status: string;
  message: string;
}

export interface AdminMetrics {
  total_scans: number;
  scans_last_24h: number;
  threat_breakdown: Record<string, number>;
  avg_latency_ms: number;
  adapter_health: Record<string, string>;
}
