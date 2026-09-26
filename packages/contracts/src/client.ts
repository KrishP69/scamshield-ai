import {
  AdminMetrics,
  CommunityReportCreate,
  CommunityReportResponse,
  HistoryListResponse,
  QuickScanRequest,
  QuickScanResponse,
  ScanCreateRequest,
  ScanResponse,
  ShareReportResponse,
  Token,
  TrustPassport,
} from "./types";

export interface ClientConfig {
  baseUrl: string;
  token?: string;
}

export class ScamShieldClient {
  private baseUrl: string;
  private token?: string;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.token = config.token;
  }

  setToken(token: string | undefined) {
    this.token = token;
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Scans & Analysis
  async createScan(payload: ScanCreateRequest): Promise<ScanResponse> {
    return this.fetch<ScanResponse>("/api/v1/scans", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getScan(scanId: string): Promise<TrustPassport> {
    return this.fetch<TrustPassport>(`/api/v1/scans/${scanId}`);
  }

  async quickScan(payload: QuickScanRequest): Promise<QuickScanResponse> {
    return this.fetch<QuickScanResponse>("/api/v1/scans/quick", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // SSE Stream Generator
  createScanEventSource(scanId: string): EventSource {
    return new EventSource(`${this.baseUrl}/api/v1/scans/${scanId}/stream`);
  }

  // History
  async getHistory(page = 1, size = 10): Promise<HistoryListResponse> {
    return this.fetch<HistoryListResponse>(`/api/v1/history?page=${page}&size=${size}`);
  }

  async deleteHistoryItem(scanId: string): Promise<{ message: string }> {
    return this.fetch<{ message: string }>(`/api/v1/history/${scanId}`, {
      method: "DELETE",
    });
  }

  async deleteAllHistory(): Promise<{ message: string }> {
    return this.fetch<{ message: string }>("/api/v1/history", {
      method: "DELETE",
    });
  }

  // Sharing & Reports
  async shareReport(scanId: string, expiresInHours = 72): Promise<ShareReportResponse> {
    return this.fetch<ShareReportResponse>(`/api/v1/reports/${scanId}/share`, {
      method: "POST",
      body: JSON.stringify({ expires_in_hours: expiresInHours }),
    });
  }

  // Community Intel
  async submitCommunityReport(payload: CommunityReportCreate): Promise<CommunityReportResponse> {
    return this.fetch<CommunityReportResponse>("/api/v1/community/report", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Health & Status
  async getHealth(): Promise<{ status: string; service: string; version: string }> {
    return this.fetch<{ status: string; service: string; version: string }>("/api/v1/health");
  }

  async getStatus(): Promise<Record<string, any>> {
    return this.fetch<Record<string, any>>("/api/v1/status");
  }

  async getAdminMetrics(): Promise<AdminMetrics> {
    return this.fetch<AdminMetrics>("/api/v1/admin/metrics");
  }
}
