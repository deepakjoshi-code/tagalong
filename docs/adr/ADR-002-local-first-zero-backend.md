# ADR‑002: Local‑first, zero‑backend, zero‑telemetry
**Status:** accepted · 2026‑09‑22

## Context
The product is for children. COPPA (US), GDPR‑K (EU), UK Age‑Appropriate Design Code, and Apple's Kids Category impose strict limits on data collection. Parents' top objection to connected kids' products is surveillance.

## Decision
- No server, no accounts, no sync, no analytics, no crash reporting, no third‑party requests. The app is static files.
- All data is stored on‑device (IndexedDB). Everything is exportable (JSON) and deletable in one tap.
- The tag stores only: age band, thing type, personality, sound settings, and the optional name clip. Never a name string, never a location.
- Any future cloud feature must be opt‑in, parent‑authenticated, end‑to‑end encrypted, and documented in a new ADR.

## Consequences
- We cannot measure usage remotely; we rely on user research and reviews. Product metrics are collected in sessions, not in software.
- Multi‑device sharing is a v2 problem (candidate: QR handoff between phones, still no server).
- Marketing gets a true, differentiating claim: *"We literally can't see your data."*
