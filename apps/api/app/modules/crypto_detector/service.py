import re
import time
from typing import Any, Dict, List
from app.modules.base import DetectionModule, ScanContext
from app.modules.crypto_detector.validators import validate_wallet_checksum
from app.schemas.common import ScanSource, SeverityLevel, Verdict
from app.schemas.finding import Evidence, Finding

KNOWN_SCAM_WALLETS = {
    "0x71c95911e9a5d330f4d621842ec243ee1343292e": {
        "reports": 42,
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

CRYPTO_SCAM_PATTERNS = [
    {
        "pattern": r"\b(?:send \d+(?:\.\d+)?\s*(?:eth|btc|sol|usdt).*?receive \d+x)\b",
        "code": "MULTIPLIER_GIVEAWAY_FRAUD",
        "severity": SeverityLevel.CRITICAL,
        "title": "Send X to Receive 2X/3X Multiplier Trap",
        "explanation": "Claims sending crypto to a pool will instantly return 2X to 10X your deposit.",
        "weight": 0.95,
    },
    {
        "pattern": r"\b(?:seed phrase|private key|recovery phrase|12-word phrase)\b",
        "code": "SEED_PHRASE_DEMAND",
        "severity": SeverityLevel.CRITICAL,
        "title": "Private Key / Seed Phrase Request",
        "explanation": "Legitimate platforms or admins NEVER ask for your 12-word seed phrase or private key.",
        "weight": 0.99,
    },
    {
        "pattern": r"\b(?:guaranteed \d+%\s*instant returns?|300% instant returns?)\b",
        "code": "UNREALISTIC_GUARANTEED_RETURNS",
        "severity": SeverityLevel.CRITICAL,
        "title": "Guaranteed Unrealistic Crypto Yield",
        "explanation": "Guaranteed high-yield investment schemes in crypto are textbook Ponzi or advance-fee traps.",
        "weight": 0.90,
    },
    {
        "pattern": r"\b(?:connect (?:your )?wallet|connect metamask|connect trust wallet)\b",
        "code": "DRAINER_LURE",
        "severity": SeverityLevel.HIGH,
        "title": "Connect Wallet Prompt",
        "explanation": "Prompts to connect wallet to unverified bots or airdrop claims often deploy token drainers.",
        "weight": 0.75,
    },
    {
        "pattern": r"\b(?:vip signals? group|admin will never dm first)\b",
        "code": "VIP_SIGNALS_GROUP",
        "severity": SeverityLevel.MEDIUM,
        "title": "Telegram Signal Channel Pattern",
        "explanation": "Typical marketing language used by fraudulent Telegram investment syndicates.",
        "weight": 0.45,
    },
]


class CryptoDetectorModule(DetectionModule):
    name: str = "crypto_detector"

    async def analyze(self, ctx: ScanContext) -> Finding:
        start_time = time.time()
        text = ctx.raw_text or ctx.cleaned_text or ""
        extracted_wallets = ctx.entities.get("wallets", []) if ctx.entities else []

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
        validated_wallets = []

        for w in extracted_wallets:
            addr = w["address"] if isinstance(w, dict) else str(w)
            chain = w.get("chain", "ethereum") if isinstance(w, dict) else "ethereum"
            is_valid, validation_msg = validate_wallet_checksum(addr, chain)
            validated_wallets.append({"address": addr, "chain": chain, "is_valid": is_valid, "check": validation_msg})

            # Check known scam wallet database
            addr_lower = addr.lower()
            if addr_lower in KNOWN_SCAM_WALLETS and KNOWN_SCAM_WALLETS[addr_lower]["reports"] > 0:
                meta = KNOWN_SCAM_WALLETS[addr_lower]
                max_score = max(max_score, 0.98)
                evidence_list.append(
                    Evidence(
                        code="KNOWN_SCAM_WALLET",
                        severity=SeverityLevel.CRITICAL,
                        title="Identified Threat Wallet in Intelligence DB",
                        plain_text=f"Address matches {meta['reports']} verified scam reports ({meta['scam_type']}).",
                        source=ScanSource.RULE,
                        span=None,
                    )
                )

        # Pattern scan across text
        for item in CRYPTO_SCAM_PATTERNS:
            match = re.search(item["pattern"], text, re.IGNORECASE)
            if match:
                max_score = max(max_score, item["weight"])
                span = match.span()
                evidence_list.append(
                    Evidence(
                        code=item["code"],
                        severity=item["severity"],
                        title=item["title"],
                        plain_text=item["explanation"],
                        source=ScanSource.RULE,
                        span=span,
                    )
                )

        latency_ms = int((time.time() - start_time) * 1000)
        if max_score >= 0.70:
            verdict = Verdict.DANGEROUS
        elif max_score >= 0.30:
            verdict = Verdict.SUSPICIOUS
        else:
            verdict = Verdict.SAFE

        confidence = 0.95 if max_score >= 0.70 else 0.85

        return Finding(
            module=self.name,
            score=round(max_score, 2),
            confidence=confidence,
            verdict=verdict,
            evidence=evidence_list,
            indicators={"wallets": validated_wallets, "total_wallets": len(validated_wallets)},
            source=ScanSource.RULE,
            latency_ms=latency_ms,
        )


crypto_detector = CryptoDetectorModule()

