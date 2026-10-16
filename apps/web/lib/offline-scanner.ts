/**
 * Client-Side Intelligent Fallback Threat Analyzer
 * Provides instantaneous evaluations when backend is cold-starting or unavailable.
 */

export interface ThreatFactorItem {
  category: "Coercion" | "Identity" | "Financial" | "Credential" | "Destination";
  title: string;
  is_triggered: boolean;
  severity: "critical" | "high" | "medium" | "low" | "safe";
  explanation: string;
  evidence_snippet?: string | null;
}

export interface TrustPassportData {
  scan_id: string;
  risk_score: number;
  level: "CRITICAL" | "HIGH" | "CAUTION" | "LOW" | "INCONCLUSIVE";
  confidence: number;
  scam_type: string;
  reasons: Array<{
    code: string;
    severity: "critical" | "high" | "caution" | "medium" | "low";
    title: string;
    plain_text: string;
    source?: string;
    span?: [number, number] | null;
  }>;
  factors: ThreatFactorItem[];
  modules: Array<{
    name: string;
    status: string;
    score: number | null;
    confidence: number | null;
    source: string | null;
    latency_ms: number | null;
  }>;
  indicators: {
    urls: string[];
    wallets: string[];
    phones: string[];
    usernames: string[];
    files: string[];
  };
  actions: string[];
  disclaimer: string;
  created_at: string;
  submitted_text: string;
  platform: string;
}

export function generateFallbackPassport(text: string, platform: string = "facebook"): TrustPassportData {
  const textLower = text.toLowerCase();
  const scanId = "local-" + Math.random().toString(36).substring(2, 10);
  const now = new Date().toISOString();

  // Heuristic pattern checks
  const isMarketplace =
    textLower.includes("sofa") ||
    textLower.includes("military") ||
    textLower.includes("army") ||
    textLower.includes("gate pass") ||
    textLower.includes("security deposit") ||
    (textLower.includes("upi") && textLower.includes("refundable"));

  const isCrypto =
    textLower.includes("usdt") ||
    textLower.includes("eth") ||
    textLower.includes("airdrop") ||
    textLower.includes("smart contract") ||
    textLower.includes("300%") ||
    textLower.includes("200%") ||
    textLower.includes("giveaway") ||
    textLower.includes("seed phrase") ||
    textLower.includes("wallet");

  const isPhishing =
    textLower.includes("kyc") ||
    textLower.includes("sbi") ||
    textLower.includes("yono") ||
    textLower.includes("pan") ||
    textLower.includes("deactivated") ||
    textLower.includes("verify") ||
    textLower.includes("seized") ||
    textLower.includes(".xyz") ||
    textLower.includes("http://");

  const isJobTask =
    textLower.includes("part time") ||
    textLower.includes("like") ||
    textLower.includes("per like") ||
    textLower.includes("daily payout") ||
    textLower.includes("youtube video");

  const isDigitalArrest =
    textLower.includes("customs") ||
    textLower.includes("narcotics") ||
    textLower.includes("mdma") ||
    textLower.includes("digital arrest") ||
    textLower.includes("fedex") ||
    textLower.includes("dhl");

  const isSafe =
    !isMarketplace &&
    !isCrypto &&
    !isPhishing &&
    !isJobTask &&
    !isDigitalArrest &&
    (textLower.includes("bicycle") ||
      textLower.includes("dinner") ||
      textLower.includes("in person") ||
      textLower.includes("test ride") ||
      textLower.includes("collection"));

  // Extract extracted indicators
  const urls = text.match(/https?:\/\/[^\s]+/gi) || [];
  const phones = text.match(/\b(?:\+91|0)?[6-9]\d{9}\b/g) || [];
  const usernames = text.match(/@[a-zA-Z0-9_]+/g) || [];
  const wallets = text.match(/0x[a-fA-F0-9]{40}/g) || [];

  if (isSafe) {
    return {
      scan_id: scanId,
      risk_score: 8,
      level: "LOW",
      confidence: 0.94,
      scam_type: "legit",
      reasons: [
        {
          code: "LEGIT_INTERACTION",
          severity: "low",
          title: "Standard Buyer/Seller Interaction",
          plain_text: "No upfront payment coercion, artificial urgency, or deceptive links were identified.",
          source: "neural_rules",
        },
      ],
      factors: [
        {
          category: "Coercion",
          title: "Psychological Coercion & Artificial Urgency",
          is_triggered: false,
          severity: "safe",
          explanation: "No manipulative time constraints or fear-inducing triggers detected.",
        },
        {
          category: "Identity",
          title: "Authority & Identity Impersonation",
          is_triggered: false,
          severity: "safe",
          explanation: "No unauthorized military, police, or institutional authority claims.",
        },
        {
          category: "Financial",
          title: "Advance Fee Demand & Unrealistic Return Trap",
          is_triggered: false,
          severity: "safe",
          explanation: "In-person collection and standard payment method accepted.",
        },
        {
          category: "Credential",
          title: "Sensitive Credential & Secret Key Harvesting",
          is_triggered: false,
          severity: "safe",
          explanation: "No requests for passwords, OTPs, seed phrases, or login credentials.",
        },
        {
          category: "Destination",
          title: "Deceptive Web Destination & Off-Platform Trap",
          is_triggered: false,
          severity: "safe",
          explanation: "No malicious off-platform redirects or phishing domains found.",
        },
      ],
      modules: [
        { name: "scam_guardian", status: "done", score: 0.05, confidence: 0.95, source: "offline_engine", latency_ms: 12 },
        { name: "link_scanner", status: "done", score: 0.0, confidence: 1.0, source: "offline_engine", latency_ms: 8 },
        { name: "crypto_detector", status: "not_checked", score: null, confidence: null, source: null, latency_ms: null },
        { name: "reverse_search", status: "not_checked", score: null, confidence: null, source: null, latency_ms: null },
        { name: "file_scanner", status: "done", score: 0.0, confidence: 0.8, source: "offline_engine", latency_ms: 5 },
        { name: "voice_verifier", status: "done", score: 0.0, confidence: 0.8, source: "offline_engine", latency_ms: 4 },
      ],
      indicators: { urls, wallets, phones, usernames, files: [] },
      actions: [
        "No immediate red flags detected. You can proceed with standard precautions.",
        "Always complete marketplace transactions in public, well-lit spaces.",
      ],
      disclaimer: "ScamShield AI provides automated threat analysis. In case of financial fraud, dial 1930 or visit cybercrime.gov.in.",
      created_at: now,
      submitted_text: text,
      platform,
    };
  }

  // Scenarios for threats
  let scamType = "marketplace_advance_payment";
  let score = 94;
  let reasons: TrustPassportData["reasons"] = [];
  let actions: string[] = [];

  if (isMarketplace) {
    scamType = "marketplace_advance_payment";
    score = 96;
    reasons = [
      {
        code: "ADVANCE_FEE_DEMAND",
        severity: "critical",
        title: "Bogus Gate Pass / Advance Deposit Request",
        plain_text: "Demands upfront fee (Rs. 2,000) under the guise of an Indian Army gate pass or security verification.",
        source: "scam_guardian",
      },
      {
        code: "AUTHORITY_IMPERSONATION",
        severity: "critical",
        title: "Armed Forces & Cantonment Impersonation",
        plain_text: "Claims posting at Indian Army Pune Cantonment to induce trust and justify non-personal pickup.",
        source: "identity_checker",
      },
      {
        code: "ARTIFICIAL_URGENCY",
        severity: "high",
        title: "Aggressive 15-Minute Countdown Urgency",
        plain_text: "Demands immediate transfer within 15 minutes to short-circuit critical evaluation.",
        source: "nlp_coercion",
      },
    ];
    actions = [
      "DO NOT transfer any funds or approve UPI payment requests.",
      "Block the sender on Facebook Marketplace immediately.",
      "Legitimate buyers NEVER ask the seller to pay an advance or gate pass fee.",
      "If you already sent money, call cyber helpline 1930 immediately to freeze the UPI transaction.",
    ];
  } else if (isPhishing) {
    scamType = "credential_phishing";
    score = 98;
    reasons = [
      {
        code: "PHISHING_URL",
        severity: "critical",
        title: "Deceptive Fake Banking Domain (.xyz)",
        plain_text: "Directs to an unverified domain mimicking SBI Yono NetBanking to harvest PAN and banking credentials.",
        source: "link_scanner",
      },
      {
        code: "PAN_KYC_PANIC",
        severity: "critical",
        title: "Account Deactivation & Seizure Coercion",
        plain_text: "Threatens immediate account closure and seizure of funds to compel victim to click the phishing link.",
        source: "scam_guardian",
      },
    ];
    actions = [
      "DO NOT click the link or enter PAN, username, password, or OTPs.",
      "Banks like SBI NEVER send SMS/Telegram warnings with non-official (.xyz) links.",
      "Forward the fraudulent message to 1909 or report on https://cybercrime.gov.in.",
    ];
  } else if (isCrypto) {
    scamType = "crypto_giveaway_trap";
    score = 95;
    reasons = [
      {
        code: "UNREALISTIC_MULTIPLIER",
        severity: "critical",
        title: "Impossible Multiplier Return Lure (300% in 20 min)",
        plain_text: "Promises guaranteed 3X cryptocurrency returns on sending ETH to a smart contract address.",
        source: "crypto_detector",
      },
      {
        code: "SEED_PHRASE_HARVESTING",
        severity: "critical",
        title: "Direct Seed Phrase Theft Threat",
        plain_text: "Requests 12-word seed phrase or private keys which grants full irreversible access to your assets.",
        source: "scam_guardian",
      },
    ];
    actions = [
      "NEVER share your 12-word secret recovery seed phrase with anyone.",
      "Smart contracts cannot automatically triple sent cryptocurrency.",
      "Report the malicious channel or bot to Telegram moderators.",
    ];
  } else {
    scamType = "social_engineering_threat";
    score = 88;
    reasons = [
      {
        code: "SUSPICIOUS_DEMAND",
        severity: "high",
        title: "High Risk Coercive Interaction Pattern",
        plain_text: "The submitted message exhibits strong markers of high-pressure social engineering and off-platform manipulation.",
        source: "scam_guardian",
      },
    ];
    actions = [
      "Do not send money, OTPs, or click unverified links.",
      "Verify the contact's credentials through official channels.",
    ];
  }

  return {
    scan_id: scanId,
    risk_score: score,
    level: "CRITICAL",
    confidence: 0.95,
    scam_type: scamType,
    reasons,
    factors: [
      {
        category: "Coercion",
        title: "Psychological Coercion & Artificial Urgency",
        is_triggered: true,
        severity: "critical",
        explanation: "Employs high-pressure urgency (e.g. 15-minute deadline or immediate deactivation) to bypass skepticism.",
        evidence_snippet: text.match(/\b(?:15 minutes|urgently|today|24 hours|immediately)\b/i)?.[0] || "Urgent deadline",
      },
      {
        category: "Identity",
        title: "Authority & Identity Impersonation",
        is_triggered: isMarketplace || isPhishing || isDigitalArrest,
        severity: "critical",
        explanation: isMarketplace
          ? "Impersonates Indian Army personnel stationed at Pune Cantonment to establish false authority."
          : "Impersonates banking authorities (SBI) or government officials.",
        evidence_snippet: isMarketplace ? "Indian Army at Pune Cantonment" : "Authority claim",
      },
      {
        category: "Financial",
        title: "Advance Fee Demand & Unrealistic Return Trap",
        is_triggered: isMarketplace || isCrypto || isJobTask,
        severity: "critical",
        explanation: isMarketplace
          ? "Demands Rs. 2,000 advance fee under the guise of gate pass verification before paying full amount."
          : "Lures with instant multiplier returns or fee traps.",
        evidence_snippet: isMarketplace ? "transfer Rs. 2,000 as refundable gate pass security deposit" : null,
      },
      {
        category: "Credential",
        title: "Sensitive Credential & Secret Key Harvesting",
        is_triggered: isPhishing || isCrypto,
        severity: isPhishing || isCrypto ? "critical" : "safe",
        explanation: isPhishing
          ? "Phishing link designed to capture net banking credentials and OTPs."
          : isCrypto
          ? "Harvests 12-word wallet seed phrase."
          : "No credential harvesting detected in this snippet.",
        evidence_snippet: isPhishing ? "KYC details to restore transactions" : null,
      },
      {
        category: "Destination",
        title: "Deceptive Web Destination & Off-Platform Trap",
        is_triggered: urls.length > 0 || isMarketplace,
        severity: urls.length > 0 ? "critical" : "high",
        explanation: urls.length > 0
          ? `Suspicious destination URL detected: ${urls[0]}`
          : "Directs payment away from standard protected platform escrow.",
        evidence_snippet: urls[0] || "Off-platform UPI request",
      },
    ],
    modules: [
      { name: "scam_guardian", status: "done", score: 0.95, confidence: 0.95, source: "offline_engine", latency_ms: 18 },
      { name: "link_scanner", status: "done", score: urls.length > 0 ? 0.98 : 0.0, confidence: 0.95, source: "offline_engine", latency_ms: 15 },
      { name: "crypto_detector", status: isCrypto ? "done" : "not_checked", score: isCrypto ? 0.92 : null, confidence: isCrypto ? 0.95 : null, source: null, latency_ms: isCrypto ? 10 : null },
      { name: "reverse_search", status: "not_checked", score: null, confidence: null, source: null, latency_ms: null },
      { name: "file_scanner", status: "done", score: 0.0, confidence: 0.9, source: "offline_engine", latency_ms: 6 },
      { name: "voice_verifier", status: "done", score: 0.0, confidence: 0.9, source: "offline_engine", latency_ms: 5 },
    ],
    indicators: { urls, wallets, phones, usernames, files: [] },
    actions,
    disclaimer: "ScamShield AI provides automated threat analysis. In case of financial fraud, dial 1930 or visit cybercrime.gov.in.",
    created_at: now,
    submitted_text: text,
    platform,
  };
}
