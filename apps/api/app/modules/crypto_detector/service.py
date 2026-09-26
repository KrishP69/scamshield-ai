import re
import time
from typing import Any, Dict, List
from app.modules.base import DetectionModule, ScanContext
from app.modules.crypto_detector.validators import validate_wallet_checksum
from app.schemas.common import ScanSource, SeverityLevel, Verdict
from app.schemas.finding import Evidence, Finding

# Local database of verified malicious crypto scam addresses
KNOWN_SCAM_WALLETS = {
    # Demo Scenario 4 wallet
    "0x71c95911e9a5d330f4d621842ec243ee1343292e": {
        "reports": 18,
        "scam_type": "fake_giveaway_airdrop",
        "first_seen": "2026-08-10",
        "notes": "Impersonates Binance official smart contract pool",
    },
    "1a1zp1ep5qgefi2dmptftl5slmv7divfna": {
        "reports": 0,
        "scam_type": "genesis_control",
        "notes": "Satoshi Nakamoto genesis block",
    },
}

# High-risk crypto scam phrases
CRYPTO_SCAM_PATTERNS = [
    (r"\b(?:send \d+(?:\.\d+)?\s*(?:eth|btc|sol|usdt).*?receive \d+x)\b", "MULTIPLIER_GIVEAWAY_FRAUD", SeverityLevel.CRITICAL, "Send X to Receive 2X/3X Multiplier Trap", "Claims sending crypto to a pool will instantly return 2X to 10X your deposit."),
    (r"\b(?:seed phrase|private key|recovery phrase|12-word phrase)\b", "SEED_PHRASE_DEMAND", SeverityLevel.CRITICAL, "Private Key / Seed Phrase Request", "Legitimate platforms or admins NEVER ask for your 12-word seed phrase or private key."),
    (r"\b(?:guaranteed \d+%\s*instant returns?|300% instant returns?)\b", "UNREALISTIC_GUARANTEED_RETURNS", SeverityLevel.CRITICAL, "Guaranteed Unrealistic Crypto Yield", "Guaranteed high-yield investment schemes in crypto are textbook Ponzi or advance-fee traps."),
    (r"\b(?:connect (?:your )?wallet|connect metamask|connect trust wallet)\b", "DRAINER_LURE", SeverityLevel.HIGH, "Connect Wallet Prompt", "Prompts to connect wallet to unverified bots or airdrop claims often deploy token drainers."),
    (r"\b(?:vip signals? group|admin will never dm first)\b", "VIP_SIGNALS_GROUP", SeverityLevel.MEDIUM, "Telegram Signal Channel Pattern", "Typical marketing language used by fraudulent Telegram investment syndicates."),
]


class CryptoDetectorModule:
    name: str = "crypto_detector"

    async def analyze(self, ctx: ScanContext) -> Finding:
        start_time = time.time()
        text = ctx.cleaned_text or ctx.raw_text
        extracted_wallets = ctx.entities.get("wallets", [])

        if not text and not extracted_wallets:
            return Finding(
                module=self.name,
                score=0.0,
                confidence=1.0,
                verdict=Verdict.SAFE,
                evidence=[],
                indicators={"wallets_scanned": 0},
                source=ScanSource.RULE,
                latency_ms=0,
            )

        evidence_list: List[Evidence] = []
        max_score = 0.0
        validated_wallets: List[Dict[str, Any]] = []

        # 1. Inspect Wallets
        for w in extracted_wallets:
            addr = w["address"]
            chain = w["chain"]
            is_valid, validation_msg = validate_wallet_checksum(addr, chain)

            # Check known scam wallet database
            addr_lower = addr.lower()
            is_known_scam = addr_lower in KNOWN_SCAM_WALLETS and KNOWN_SCAM_WALLETS[addr_lower]["reports"] > 0
            if is_known_scam:
                scam_meta = KNOWN_SCAM_WALLETS[addr_lower]
                max_score = max(max_score, 0.98)
                evidence_list.append(
                    Evidence(
                        code="KNOWN_SCAM_WALLET",
                        severity=SeverityLevel.CRITICAL,
                        title=f"Reported Scam Wallet ({chain.upper()})",
                        plain_text=f"The wallet address {addr} is flagged in our scam database ({scam_meta['reports']} corroborating reports).",
                        source=ScanSource.RULE,
                        span=(w.get("start"), w.get("end")) if w.get("start") else None,
                    )
                )

            validated_wallets.append({
                "address": addr,
                "chain": chain,
                "valid": is_valid,
                "validation_status": validation_msg,
                "known_scam": is_known_scam,
            })

        # 2. Inspect Crypto Language Rules
        text_lower = text.lower()
        for pat, code, severity, title, explanation in CRYPTO_SCAM_PATTERNS:
            match = re.search(pat, text_lower)
            if match:
                if severity == SeverityLevel.CRITICAL:
                    max_score = max(max_score, 0.95)
                elif severity == SeverityLevel.HIGH:
                    max_score = max(max_score, 0.75)
                else:
                    max_score = max(max_score, 0.45)

                evidence_list.append(
                    Evidence(
                        code=code,
                        severity=severity,
                        title=title,
                        plain_text=explanation,
                        source=ScanSource.RULE,
                        span=(match.start(), match.end()),
                    )
                )

        latency_ms = int((time.time() - start_time) * 1000)
        verdict = Verdict.DANGEROUS if max_score >= 0.70 else (Verdict.SUSPICIOUS if max_score >= 0.30 else Verdict.SAFE)

        return Finding(
            module=self.name,
            score=round(max_score, 2),
            confidence=0.95 if max_score >= 0.70 else 0.85,
            verdict=verdict,
            evidence=evidence_list,
            indicators={
                "wallets": validated_wallets,
                "total_wallets": len(validated_wallets),
            },
            source=ScanSource.RULE,
            latency_ms=latency_ms,
        )


crypto_detector = CryptoDetectorModule()
