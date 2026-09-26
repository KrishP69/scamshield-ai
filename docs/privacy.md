# ScamShield AI — Privacy by Design & Compliance Architecture

## 1. Privacy Principles

ScamShield AI is architected from the ground up on the principle of **Zero Knowledge & Minimal Data Exposure**. Because users frequently submit private chat messages and sensitive financial interactions, strict privacy controls are enforced across the entire stack.

### Core Tenets:
1. **Zero Retention by Default:** Anonymous scans are processed entirely in memory. Once the scan completes and the response is streamed to the user, message text and image buffers are discarded.
2. **Opt-in Storage Only:** A user must explicitly check "Save to my scan history" for any record to be persisted in PostgreSQL.
3. **Application-Level Encryption at Rest:** When a user opts in to save scan history, the raw message snippet is encrypted with 256-bit Fernet encryption using an isolated server key before writing to the database.
4. **Salted Hashing of Threat Indicators:** Phone numbers, wallet addresses, and URLs are stored as salted SHA-256 hashes (`value_hash`) for reputation lookups. Only truncated, defanged representations (`value_display`) are stored for user recognition.
5. **Right to Erasure (DPDP Act 2023 & GDPR):** Users can permanently delete individual scans or trigger an instantaneous purge of all historical account records with `DELETE /api/v1/history`.
6. **No Third-Party Tracker Fingerprinting:** No tracking cookies, session replay scripts, or external analytics SDKs that track user browsing behavior across the web are employed.

## 2. Statutory Legal & Safety Disclaimer
> **Disclaimer:** ScamShield AI provides automated risk guidance based on algorithmic pattern matching and threat intelligence feeds. It does not constitute legal, cyber-forensic, or financial advice. In the event of cyber fraud or financial loss, users must immediately notify national cyber authorities by dialing **1930** or filing a formal complaint at **[https://cybercrime.gov.in](https://cybercrime.gov.in)**.
