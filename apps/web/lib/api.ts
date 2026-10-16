/**
 * ScamShield AI API Configuration & Resilient Fetch Client
 */

export const PRODUCTION_API_URL = "https://scamshield-u6c4.onrender.com";
export const LOCAL_API_URL = "http://localhost:8000";

/**
 * Resolves the appropriate backend API base URL depending on runtime environment.
 * Prevents Mixed-Content (HTTPS -> HTTP) and unreachable localhost:8000 in production deployments.
 */
export function getApiUrl(): string {
  // 1. Explicit environment variable if provided
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim() !== "") {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }

  // 2. Client-side browser checks
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Local development
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") {
      return LOCAL_API_URL;
    }
    // Remote or Vercel preview/production deployment
    return PRODUCTION_API_URL;
  }

  // 3. Server-side rendering (SSR) fallback
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_API_URL;
  }

  return LOCAL_API_URL;
}

/**
 * Robust fetch wrapper with timeout and AbortController to prevent indefinite UI hangs.
 */
export async function resilientFetch(
  endpointOrUrl: string,
  options: RequestInit = {},
  timeoutMs: number = 7000
): Promise<Response> {
  const url = endpointOrUrl.startsWith("http")
    ? endpointOrUrl
    : `${getApiUrl()}${endpointOrUrl.startsWith("/") ? "" : "/"}${endpointOrUrl}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Request to ${url} timed out after ${timeoutMs}ms`));
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
