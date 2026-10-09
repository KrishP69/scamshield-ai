"""
ScamShield AI - Telegram Bot & Channel Scam Analyzer
Detects automated fraud bots, malicious deep-links, fake admin impersonation,
and social engineering tactics deployed across Telegram channels.
"""

import re
import time
from typing import Any, Dict, List
from app.modules.base import DetectionModule, ScanContext
from app.schemas.common import ScanSource, SeverityLevel, Verdict
from app.schemas.finding import Evidence, Finding

TELEGRAM_SCAM_PATTERNS = [
    {
        "code": "CRYPTO_DOUBLER_BOT",
        "pattern": r"(?:double\s*your\s*(?:crypto|btc|eth|usdt)|investment\s*bot|guaranteed\s*roi|hourly\s*payout|auto\s*trading\s*bot)",
        "severity": SeverityLevel.CRITICAL,
        "title": "Automated Ponzi & Crypto Doubler Bot",
        "detail": "Promotes high-yield automated investment returns or crypto doubling traps that steal deposited funds.",
        "weight": 0.94,
    },
    {
        "code": "FAKE_SUPPORT_BOT",
        "pattern": r"(?:(?:official|support|helpdesk|unban|security|verify).*(?:bot|admin|team)|(?:t\.me\/(?:.*support.*bot|.*unban.*bot)))",
        "severity": SeverityLevel.CRITICAL,
        "title": "Impersonated Official Telegram Support Bot",
        "detail": "Presents as official Telegram support or verification staff to coerce account recovery codes and session strings.",
        "weight": 0.92,
    },
    {
        "code": "MALICIOUS_BOT_DEEPLINK",
        "pattern": r"(?:t\.me\/[a-zA-Z0-9_]+bot\?start=(?:claim|bonus|airdrop|reward|free|gift|crypto))",
        "severity": SeverityLevel.HIGH,
        "title": "Airdrop / Bonus Bot Deep-Link Lure",
        "detail": "Uses a pre-configured bot start parameter to funnel victims directly into credential or crypto deposit funnels.",
        "weight": 0.88,
    },
    {
        "code": "MANDATORY_CONTACT_SHARE",
        "pattern": r"(?:share\s*your\s*(?:contact|phone\s*number)\s*to\s*(?:verify|continue|claim|activate))",
        "severity": SeverityLevel.HIGH,
        "title": "Forced Contact Book / Phone Number Extraction",
        "detail": "Demands user contact card sharing to harvest real phone numbers for secondary SIM swap or voice extortion fraud.",
        "weight": 0.85,
    },
    {
        "code": "PUMP_AND_DUMP_VIP",
        "pattern": r"(?:vip\s*signals|insider\s*pumps|100x\s*gem|guaranteed\s*profit|binance\s*leak|send\s*\d+\s*(?:usdt|sol|ton)\s*for\s*vip)",
        "severity": SeverityLevel.HIGH,
        "title": "Paid VIP Pump-and-Dump Signal Scheme",
        "detail": "Lures members to transfer subscription fees or invest in rug-pull tokens with fabricated insider claims.",
        "weight": 0.82,
    },
]


class TelegramBotScanner(DetectionModule):
    name = "telegram_bot_scanner"

    async def analyze(self, ctx: ScanContext) -> Finding:
        start_time = time.time()
        text = f"{ctx.raw_text} {ctx.cleaned_text}"
        urls = ctx.entities.get("urls", [])
        evidence_list: List[Evidence] = []
        indicators: Dict[str, Any] = {
            "flagged_bots": [],
            "identified_tactics": [],
            "telegram_urls": [],
        }

        # Check if context involves Telegram
        is_telegram = (
            ctx.platform.value == "telegram"
            or "t.me" in text.lower()
            or "telegram" in text.lower()
            or "@" in text
            or any("t.me" in u.lower() for u in urls)
        )

        if not is_telegram:
            latency_ms = int((time.time() - start_time) * 1000)
            return Finding(
                module=self.name,
                score=0.0,
                confidence=0.5,
                verdict=Verdict.SAFE,
                evidence=[],
                indicators=indicators,
                source=ScanSource.RULE,
                latency_ms=latency_ms,
            )

        highest_score = 0.0

        # Extract Telegram usernames & links
        tg_handles = re.findall(r"@[a-zA-Z0-9_]{4,32}", text)
        tg_links = [u for u in urls if "t.me" in u.lower()] + re.findall(r"https?:\/\/t\.me\/[a-zA-Z0-9_?=&]+", text)
        indicators["flagged_bots"] = [h for h in tg_handles if h.lower().endswith("bot")]
        indicators["telegram_urls"] = list(set(tg_links))

        for item in TELEGRAM_SCAM_PATTERNS:
            match = re.search(item["pattern"], text, re.IGNORECASE)
            if match:
                highest_score = max(highest_score, item["weight"])
                indicators["identified_tactics"].append(item["code"])
                span = match.span() if match else None

                evidence_list.append(
                    Evidence(
                        code=item["code"],
                        severity=item["severity"],
                        title=item["title"],
                        plain_text=item["detail"],
                        source=ScanSource.RULE,
                        span=span,
                    )
                )

        # Baseline check if bot handle detected with generic coercion
        if indicators["flagged_bots"] and highest_score == 0.0 and ("claim" in text.lower() or "free" in text.lower()):
            highest_score = 0.65
            evidence_list.append(
                Evidence(
                    code="UNVERIFIED_GIVEAWAY_BOT",
                    severity=SeverityLevel.MEDIUM,
                    title="Suspicious Unverified Giveaway Bot",
                    plain_text=f"Bot handle {indicators['flagged_bots'][0]} is offering unverified rewards.",
                    source=ScanSource.RULE,
                    span=None,
                )
            )

        latency_ms = int((time.time() - start_time) * 1000)

        if highest_score >= 0.75:
            verdict = Verdict.DANGEROUS
        elif highest_score >= 0.40:
            verdict = Verdict.SUSPICIOUS
        else:
            verdict = Verdict.SAFE

        confidence = 0.92 if evidence_list else 0.70

        return Finding(
            module=self.name,
            score=round(highest_score, 3),
            confidence=confidence,
            verdict=verdict,
            evidence=evidence_list,
            indicators=indicators,
            source=ScanSource.RULE,
            latency_ms=latency_ms,
        )


telegram_bot_scanner = TelegramBotScanner()
