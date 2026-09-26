# ScamShield AI — System Architecture Specification

## 1. High-Level Architectural Model

ScamShield AI follows a clean, decoupled, layered event-driven architecture designed to analyze heterogeneous threat vectors with zero cross-module coupling.

```mermaid
flowchart TB
  subgraph ClientLayer["1. Client Layer"]
    WEB["Next.js 15 Web Application + 3D Marketing Experience"]
    EXT["Browser Extension (Chrome/Brave) - QuickScan Client"]
    AND["Android Accessibility Shield (Kotlin Prototype)"]
  end

  subgraph GatewayLayer["2. Gateway Layer (FastAPI)"]
    AUTH["JWT / Argon2 Authentication"]
    RATE["Token Bucket Rate Limiter (Redis / Memory)"]
    VAL["Pydantic v2 Request Validation & Sanitization"]
    SEC["Security Headers & Correlation ID Context"]
  end

  subgraph OrchestratorLayer["3. Orchestration & Preprocessing Layer"]
    ORCH["Async Fan-Out / Fan-In Orchestrator"]
    OCR["Tesseract OCR + OpenCV Preprocessing"]
    LEET["Obfuscation & Leetspeak Feature Normalizer"]
    ENT["Entity Extractor: URLs, Wallets, Phones, Usernames"]
  end

  subgraph DetectionLayer["4. Autonomous Detection Modules"]
    M1["Module 1: AI Scam Guardian (DistilBERT + Tactics)"]
    M2["Module 2: Reverse Search & Trust Passport"]
    M3["Module 3: Safe Link Scanner (SSRF-Guarded)"]
    M4["Module 4: Fake Crypto / Airdrop Detector"]
    M5["Module 5: Suspicious APK / File Scanner"]
    M8["Module 8: Voice & Call Verifier"]
  end

  subgraph DecisionLayer["5. Explainable Decision Engine"]
    FUSE["Noisy-OR Multi-Source Evidence Fusion"]
    RULES["Deterministic Hard-Rule Overrides"]
    REASONS["Bilingual Plain-Language Reason Synthesizer (EN/HI)"]
    PASSPORT["Trust Passport Builder"]
  end

  subgraph PersistenceLayer["6. Data Layer"]
    PG[("PostgreSQL 16 / Async SQLAlchemy")]
    RD[("Redis 7: Caching & SSE Broadcaster")]
    CRYPTO["Fernet Field-Level Encryption at Rest"]
  end

  ClientLayer --> GatewayLayer
  GatewayLayer --> OrchestratorLayer
  OrchestratorLayer --> DetectionLayer
  DetectionLayer --> DecisionLayer
  DecisionLayer --> GatewayLayer
  GatewayLayer --> PersistenceLayer
```

## 2. Request Lifecycle & Asynchronous Execution Sequence

1. **Submission:** User submits text, chat screenshot, URL, phone number, wallet, or APK.
2. **Gateway Ingestion:** Request is assigned a unique `X-Correlation-ID`, rate limits are checked, and validation occurs via Pydantic.
3. **Preprocessing:**
   - If image: OpenCV applies adaptive thresholding, bilateral filtering; Tesseract extracts text.
   - Text cleaner detects and normalizes obfuscations (`w.h.a.t.s.a.p.p`, emojis, zero-width chars) while retaining obfuscation as an indicator feature.
   - Regex & checksum extractors parse URLs, E.164 phone numbers, and crypto addresses (EIP-55, Base58Check, Bech32).
4. **Concurrent Fan-Out:** Orchestrator dispatches tasks to applicable modules concurrently using `asyncio.gather(return_exceptions=True)`.
5. **Partial Streaming:** Results are streamed to the client via Server-Sent Events (`GET /api/v1/scans/{id}/stream`).
6. **Evidence Fusion:** Module findings feed into the Noisy-OR compounding formula. Hard rules override if severe threats (confirmed phishing, seed-phrase demands) are identified.
7. **Trust Passport Emission:** Structured JSON containing score, level, word-level highlight spans, indicators, and emergency actions (1930 / cybercrime.gov.in) is returned.

## 3. Module Decoupling Rule
Detection modules **never** invoke each other directly. All inter-module communication is coordinated strictly through the Orchestrator, ensuring that every module can be unit-tested and benchmarked in total isolation.
