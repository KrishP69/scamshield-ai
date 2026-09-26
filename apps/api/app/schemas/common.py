from enum import Enum


class RiskLevel(str, Enum):
    LOW = "LOW"
    CAUTION = "CAUTION"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"
    INCONCLUSIVE = "INCONCLUSIVE"


class Verdict(str, Enum):
    SAFE = "safe"
    SUSPICIOUS = "suspicious"
    DANGEROUS = "dangerous"
    UNKNOWN = "unknown"


class SeverityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class PlatformType(str, Enum):
    FACEBOOK = "facebook"
    TELEGRAM = "telegram"
    WHATSAPP = "whatsapp"
    UNKNOWN = "unknown"


class ScanSource(str, Enum):
    MODEL = "model"
    RULE = "rule"
    EXTERNAL_API = "external_api"
    OFFLINE_FALLBACK = "offline_fallback"


class ModuleStatus(str, Enum):
    DONE = "done"
    FAILED = "failed"
    SKIPPED = "skipped"
    NOT_CHECKED = "not_checked"
