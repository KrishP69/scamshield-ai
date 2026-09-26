import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Cpu,
  AlertCircle,
  FileCode,
  CheckCircle,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ModuleDetail {
  slug: string;
  name: string;
  number: string;
  tier: string;
  description: string;
  methodology: string;
  rules: string[];
  offlineFallback: string;
  sampleInput: string;
  sampleOutput: string;
}

const MODULES_DETAIL: Record<string, ModuleDetail> = {
  "scam-guardian": {
    slug: "scam-guardian",
    name: "AI Scam Guardian",
    number: "01",
    tier: "V1 — Core",
    description:
      "Performs deep conversational NLP to detect psychological coercion tactics, artificial urgency, and advance-fee requests in English, Hindi, and Marathi.",
    methodology:
      "Combines deterministic character-span regex tactic detection (e.g. artificial urgency, fake authority, unverified UPI payment requests) with an n-gram TF-IDF Naive Bayes baseline classifier (to be augmented with multilingual DistilBERT in Phase 6).",
    rules: [
      "Artificial Urgency (e.g. 'within 2 hours', 'tonight at 9:30 PM')",
      "Fake Authority Impersonation (e.g. 'Army officer', 'Police cyber cell', 'Bank manager')",
      "Advance-Fee QR Payment Lures (e.g. 'scan QR and enter UPI PIN to receive money')",
      "Emotional Coercion & Distress (e.g. 'hospital emergency', 'bail deposit')",
    ],
    offlineFallback:
      "Fully local execution. Uses local rule definitions and cached tokenizer weights. Zero external network dependency.",
    sampleInput: `POST /api/v1/scans
{
  "content": "Dear user, your electricity power will be cut tonight at 9:30 PM due to unpaid bill. Immediately contact officer Sharma at 9876543210.",
  "platform": "facebook",
  "store_history": false
}`,
    sampleOutput: `{
  "module": "scam_guardian",
  "score": 0.88,
  "confidence": 0.95,
  "status": "completed",
  "findings": [
    {
      "code": "ARTIFICIAL_URGENCY",
      "severity": "HIGH",
      "description": "Artificial urgency coercion tactic detected",
      "evidence": { "span": "will be cut tonight at 9:30 PM" }
    }
  ]
}`,
  },
  "reverse-search": {
    slug: "reverse-search",
    name: "Reverse Search & Identity Intel",
    number: "02",
    tier: "V1 — Core",
    description:
      "Extracts phone numbers, usernames, and profile photos to compute perceptual image hashes and phone carrier intelligence.",
    methodology:
      "Uses Google's libphonenumber port to validate phone number structure, identify country prefixes, and determine line carrier types (VoIP vs mobile). Computes 64-bit perceptual image hashes (pHash) against a local index of known fraudulent profiles with Hamming distance threshold <= 10.",
    rules: [
      "Perceptual Image Hash (pHash) Hamming distance <= 10 flags cloned profile",
      "Virtual VoIP carrier detection (Twilio, TextNow, SkypeOut numbers)",
      "Country prefix mismatch (e.g., claiming to be in Mumbai while sending from +234)",
      "High report-count lookup in local reputation database",
    ],
    offlineFallback:
      "If reverse image search adapter is unavailable, falls back to internal pHash database match and returns an explicit 'intel_adapter_offline' status.",
    sampleInput: `POST /api/v1/scans
{
  "phone": "+919876543210",
  "image_hash": "a1b2c3d4e5f60718"
}`,
    sampleOutput: `{
  "module": "reverse_search",
  "score": 0.75,
  "status": "completed",
  "findings": [
    {
      "code": "VOIP_LINE_DETECTED",
      "severity": "MEDIUM",
      "description": "Phone number belongs to a virtual VoIP provider"
    }
  ]
}`,
  },
  "link-scanner": {
    slug: "link-scanner",
    name: "Safe Link Scanner",
    number: "03",
    tier: "V1 — Core",
    description:
      "Recursively unwraps shortened URLs through an SSRF-safe HTTP client and queries threat feeds (Google Safe Browsing, URLhaus) with domain age heuristics.",
    methodology:
      "Performs DNS pre-resolution to block private CIDRs (127.0.0.1, 10.0.0.0/8, 169.254.169.254) before initiating HTTP GET/HEAD requests. Canonicalizes target URLs and checks 32-bit SHA-256 prefixes against threat databases. Scores young domains (<30 days) and high-risk TLDs (.top, .xyz, .live).",
    rules: [
      "SSRF DNS resolution guard (blocks RFC 1918 and loopback addresses)",
      "Maximum 5 redirect hops with cookie stripping",
      "Domain age < 7 days triggers HIGH risk penalty",
      "Homoglyph and visual look-alike spoofing detection (e.g. sbi-kyc.com vs sbi.co.in)",
    ],
    offlineFallback:
      "If Google Safe Browsing API key is missing or quota-exceeded, switches to local lexical heuristics and URLhaus backup feed.",
    sampleInput: `POST /api/v1/scans
{
  "url": "https://bit.ly/3xPowerPay"
}`,
    sampleOutput: `{
  "module": "link_scanner",
  "score": 0.95,
  "status": "completed",
  "findings": [
    {
      "code": "NEWLY_REGISTERED_DOMAIN",
      "severity": "HIGH",
      "description": "Target domain registered less than 48 hours ago"
    },
    {
      "code": "SAFE_BROWSING_HIT",
      "severity": "CRITICAL",
      "description": "Flagged as social engineering phishing destination"
    }
  ]
}`,
  },
  "crypto-detector": {
    slug: "crypto-detector",
    name: "Fake Crypto & Airdrop Detector",
    number: "04",
    tier: "V1 — Core",
    description:
      "Extracts blockchain wallet addresses across Bitcoin, Ethereum, Tron, and Solana. Validates checksums and catches multiplier fraud schemes.",
    methodology:
      "Applies regex and cryptographic checksum routines: Base58Check for BTC/TRON, EIP-55 mixed-case Keccak-256 for ETH, and Base58 for Solana. Uses regular expressions to match 'send X receive 2X' patterns and triggers deterministic overrides on seed phrase requests.",
    rules: [
      "Seed phrase / Private key request triggers instant 95/100 CRITICAL override",
      "2x/3x deposit multiplier fraud language triggers 90/100 override",
      "Checksum validation ensures invalid addresses are flagged",
      "Known scam wallet hash lookup in local community registry",
    ],
    offlineFallback:
      "Checksum validation and fraud heuristics are 100% offline. Wallet reputation checks query local PostgreSQL database.",
    sampleInput: `POST /api/v1/scans
{
  "content": "Deposit 0.5 ETH to 0x71C...b4E9 and get 1.0 ETH returned instantly! Only 12 slots left."
}`,
    sampleOutput: `{
  "module": "crypto_detector",
  "score": 0.95,
  "status": "completed",
  "findings": [
    {
      "code": "CRYPTO_MULTIPLIER_FRAUD",
      "severity": "CRITICAL",
      "description": "Scheme promises guaranteed 2x investment returns"
    }
  ]
}`,
  },
  "file-scanner": {
    slug: "file-scanner",
    name: "Suspicious APK & File Scanner",
    number: "05",
    tier: "V1 — Core",
    description:
      "Performs SHA-256 hash lookup via VirusTotal without uploading file contents, and statically parses APK manifests for lethal permission pairings.",
    methodology:
      "Extracts file hash and queries VirusTotal v3 API. If the file is an Android APK, uses static manifest inspection (androguard/apkutils) to detect if the app requests dangerous accessibility or SMS permissions while masquerading under a financial or utility package name.",
    rules: [
      "Zero-upload policy: Only SHA-256 hash is sent externally unless explicit user consent is given",
      "Lethal permission combination: BIND_ACCESSIBILITY_SERVICE + RECEIVE_SMS",
      "Package name impersonation (e.g. com.sbi.banking vs com.sbi.secureupdate)",
      "Unsigned or self-signed debug certificate verification",
    ],
    offlineFallback:
      "Static manifest analysis runs 100% locally. If VirusTotal API key is absent, returns static permission findings with 'virustotal_not_checked' indicator.",
    sampleInput: `POST /api/v1/scans (Multipart file upload)
Content-Disposition: form-data; name="file"; filename="electricity-bill-update.apk"`,
    sampleOutput: `{
  "module": "file_scanner",
  "score": 0.90,
  "status": "completed",
  "findings": [
    {
      "code": "DANGEROUS_PERMISSIONS",
      "severity": "CRITICAL",
      "description": "APK requests SMS and Accessibility service interception"
    }
  ]
}`,
  },
  "explainable-scoring": {
    slug: "explainable-scoring",
    name: "Explainable Risk Scoring Engine",
    number: "06",
    tier: "V1 — Core",
    description:
      "Mathematical fusion engine that merges individual module findings using Noisy-OR statistics, deterministic hard overrides, and bilingual reason synthesis.",
    methodology:
      "Guarantees that every risk score is mathematically explainable. Enforces hard override rules for zero-tolerance patterns (seed phrase theft, malicious APK permissions, active phishing hits). Merges remaining probabilistic weights w_i and probabilities P_i using: 1 - Product(1 - w_i * P_i).",
    rules: [
      "Never output a bare score without machine-readable evidence reasons",
      "Hard rules bypass statistical fusion and assign fixed 90-99 scores",
      "Generate reason strings in English, Hindi, and Marathi",
      "Calibrated thresholds: 0-25 LOW, 26-50 CAUTION, 51-75 HIGH, 76-100 CRITICAL",
    ],
    offlineFallback:
      "100% deterministic mathematical execution on local API server.",
    sampleInput: `POST /api/v1/scans/{id}/score
(Executed automatically by ScanOrchestrator)`,
    sampleOutput: `{
  "risk_score": 95,
  "risk_level": "CRITICAL",
  "scam_type": "TELEGRAM_CRYPTO_FRAUD",
  "confidence": 0.96,
  "recommended_action": "Do not send funds. Block user and report channel.",
  "reasons": [
    {
      "code": "CRYPTO_MULTIPLIER_FRAUD",
      "title": "Double-Your-Money Multiplier Scam",
      "severity": "CRITICAL"
    }
  ]
}`,
  },
  "voice-verifier": {
    slug: "voice-verifier",
    name: "AI Voice & Call Verifier",
    number: "08",
    tier: "V1.5 — Prototype",
    description:
      "Analyzes voice notes and audio clips to detect synthetic voice cloning (deepfakes) used in emergency family-in-distress extortion calls.",
    methodology:
      "Extracts Mel-spectrogram acoustic features to inspect phase and spectral discontinuity artifacts characteristic of neural vocoders and text-to-speech engines. Transcribes speech to text to pass conversational content into AI Scam Guardian.",
    rules: [
      "Spectral discontinuity detection in upper frequency bands (>16 kHz)",
      "Robotic pitch flatlining and unnatural prosody markers",
      "Probabilistic output clearly labelled 'acoustic estimation'",
      "Guardian pipeline integration for transcript-level coercion detection",
    ],
    offlineFallback:
      "Local audio processing pipeline using PyTorch model weights on CPU.",
    sampleInput: `POST /api/v1/scans (Multipart audio upload)
Content-Disposition: form-data; name="file"; filename="bail_emergency.ogg"`,
    sampleOutput: `{
  "module": "voice_verifier",
  "score": 0.82,
  "status": "completed",
  "findings": [
    {
      "code": "SYNTHETIC_VOICE_ARTIFACTS",
      "severity": "HIGH",
      "description": "High probability of synthetic neural voice generation"
    }
  ]
}`,
  },
  "background-shield": {
    slug: "background-shield",
    name: "Real-Time Background Shield",
    number: "09",
    tier: "V2 — Stretch",
    description:
      "Autonomous Android companion app leveraging Accessibility Services to evaluate incoming chat messages and overlay warnings before actions occur.",
    methodology:
      "Inspects on-screen window nodes in Facebook Messenger and Telegram. Extracts links, phone numbers, and UPI handles, calling the lightweight ScamShield Quick API (/api/v1/scans/quick) using 32-bit K-anonymity hashes.",
    rules: [
      "Strict on-device privacy: No chat message logging or cloud sync without consent",
      "Lightweight latency target: Quick API evaluation < 300ms",
      "Non-intrusive warning heads overlay directly on active chat window",
      "Automatic temporary disabling during sensitive banking / password entry",
    ],
    offlineFallback:
      "Caches known malicious hashes locally on device for instant offline overlay.",
    sampleInput: `POST /api/v1/scans/quick
{
  "url_hash_prefix": "a4b1c9",
  "upi_handle": "merchant@scambank"
}`,
    sampleOutput: `{
  "status": "flagged",
  "risk_level": "CRITICAL",
  "message": "Known scam UPI handle reported by 14 users"
}`,
  },
};

export function generateStaticParams() {
  return Object.keys(MODULES_DETAIL).map((slug) => ({ slug }));
}

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = MODULES_DETAIL[slug];

  if (!mod) {
    notFound();
  }

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/modules"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-ink/60 dark:text-paper/60 hover:text-ultramarine mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Modules</span>
        </Link>

        {/* Header */}
        <div className="border-b border-ink/10 dark:border-paper/10 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-xs font-bold text-ultramarine dark:text-ultramarine-light">
              Module {mod.number}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-paper-200 dark:bg-ink-700 text-ink/70 dark:text-paper/70 font-semibold">
              {mod.tier}
            </span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink dark:text-paper tracking-tight">
            {mod.name}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-ink/75 dark:text-paper/75 leading-relaxed">
            {mod.description}
          </p>
        </div>

        {/* Content Sections */}
        <div className="mt-10 space-y-12">
          {/* Methodology */}
          <div>
            <h2 className="font-display font-bold text-xl text-ink dark:text-paper mb-3">
              Technical Methodology
            </h2>
            <p className="text-sm sm:text-base text-ink/75 dark:text-paper/75 leading-relaxed">
              {mod.methodology}
            </p>
          </div>

          {/* Rules & Detection Heuristics */}
          <div>
            <h2 className="font-display font-bold text-xl text-ink dark:text-paper mb-3">
              Detection Rules & Heuristics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mod.rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 text-xs sm:text-sm text-ink/80 dark:text-paper/80"
                >
                  <CheckCircle className="w-4 h-4 text-verify shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Offline Fallback */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm space-y-1">
                <strong className="font-semibold block">Offline Fallback Strategy:</strong>
                <p>{mod.offlineFallback}</p>
              </div>
            </div>
          </div>

          {/* Fixtures: Input and Output */}
          <div>
            <h2 className="font-display font-bold text-xl text-ink dark:text-paper mb-4">
              Contract Fixtures
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sample Input */}
              <div className="rounded-xl overflow-hidden border border-ink/10 dark:border-paper/10 bg-ink-900 text-paper font-mono text-xs">
                <div className="px-4 py-2 bg-ink-950 border-b border-paper/10 text-paper/60 text-[11px] font-semibold">
                  Sample Request Payload
                </div>
                <pre className="p-4 overflow-x-auto text-[11px] text-paper/90 leading-relaxed">
                  {mod.sampleInput}
                </pre>
              </div>

              {/* Sample Output */}
              <div className="rounded-xl overflow-hidden border border-ink/10 dark:border-paper/10 bg-ink-900 text-paper font-mono text-xs">
                <div className="px-4 py-2 bg-ink-950 border-b border-paper/10 text-paper/60 text-[11px] font-semibold">
                  Module Finding Response
                </div>
                <pre className="p-4 overflow-x-auto text-[11px] text-verify leading-relaxed">
                  {mod.sampleOutput}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-16 pt-8 border-t border-ink/10 dark:border-paper/10 flex items-center justify-between">
          <Link href="/modules">
            <Button variant="secondary" size="sm">
              All Modules
            </Button>
          </Link>
          <Link href="/scan">
            <Button size="sm" className="gap-1.5">
              <span>Test Module in App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
