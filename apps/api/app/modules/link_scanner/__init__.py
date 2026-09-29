"""Safe Link Scanner module with real-time detection, homoglyphs, SSRF, and threat intel."""
from app.modules.link_scanner.scanner import (
    SafeLinkScannerModule,
    analyze_url_realtime,
    link_scanner,
)
from app.modules.link_scanner.threat_intel import (
    add_detected_threat_to_feed,
    get_live_threat_feed,
)

__all__ = [
    "link_scanner",
    "SafeLinkScannerModule",
    "analyze_url_realtime",
    "get_live_threat_feed",
    "add_detected_threat_to_feed",
]
