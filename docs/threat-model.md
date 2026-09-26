# ScamShield AI — STRIDE Threat Model & Mitigations

This document outlines the security architecture and defensive controls implemented across ScamShield AI to protect both users and infrastructure.

## 1. Threat Identification & Mitigation Matrix (STRIDE)

| Threat Category | Potential Attack Vector | Impact | Mitigation Strategy |
|---|---|---|---|
| **Spoofing** | Attacker impersonates legitimate user or injects spoofed scan reports | Integrity loss, deceptive trust passports | Cryptographic JWT signing with Argon2id password hashes; shareable reports require random unguessable 64-char UUID tokens. |
| **Tampering** | Modifying scan parameters or manipulating model weights | False negatives, bypassed detection | Strict Pydantic v2 input schemas; signed model artifacts; model card checksum verification upon startup. |
| **Repudiation** | Denying submission of malicious indicators or abuse | Audit failure | Structured JSON logging with immutable correlation IDs; user ID binding for authenticated reports. |
| **Information Disclosure** | Data leak of sensitive user messages, screenshots, or private keys | Severe privacy breach | Zero-retention by default. For opt-in history, messages are encrypted at rest with Fernet. Indicators stored as salted SHA-256 hashes. |
| **Denial of Service** | Volumetric scanning requests or ReDoS on regex extractors | Server exhaustion | Redis token-bucket rate limiter per IP/user; bounded regex patterns; strict timeouts on external HTTP adapter calls. |
| **Elevation of Privilege** | Normal user attempting admin actions (label review, metric inspection) | Unauthorized access | Role-Based Access Control (RBAC) enforced via FastAPI dependency injection checking JWT claims. |

## 2. Specific Security Controls

### 2.1 SSRF Mitigation in Safe Link Scanner
- The unshortener must resolve DNS hostnames prior to issuing requests.
- Private IP ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, link-local `169.254.0.0/16`, IPv6 loopbacks) and AWS/cloud metadata IPs (`169.254.169.254`) are blocked.
- Max redirect depth is capped at 5; requests are limited to 3 seconds with capped payload reads (500 KB).

### 2.2 Malicious File / APK Upload Handling
- Uploaded files are verified via magic byte inspections, not client-supplied extensions.
- Static APK inspection (`androguard`) runs without executing Dalvik bytecode.
- Quarantine directory with automated 24-hour cleanup cron job.
- Files are never uploaded to third parties (e.g., VirusTotal) without explicit, informed user consent.

### 2.3 XSS Defanging
- When displaying suspected scam URLs or indicators in the UI or Trust Passport, links are defanged (e.g. `hxxp[://]example[.]com`) and escaped to prevent browser execution.
