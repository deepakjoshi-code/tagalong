# ADR‑004: No microphone in v1
**Status:** accepted · 2026‑09‑22

## Context
"Voice‑activated" in the brief means the tag *has a voice* and reacts to physical events. A microphone would enable "it knows its name" but is the #1 trust risk for a kids' product and adds certification burden (it becomes a recording device in several jurisdictions).

## Decision
No microphone or audio input path in v1 hardware. The tag reacts to motion, capacitance, light and time only. Marketing states it plainly: *No microphone. No camera. Nothing to hack.*

## Consequences
- v2 may add a mic with a **physical** slide switch and on‑device‑only wake‑word (no audio leaves the device), under a new ADR and a new privacy review.
- Config must come over BLE (ADR‑001), not acoustic provisioning.
