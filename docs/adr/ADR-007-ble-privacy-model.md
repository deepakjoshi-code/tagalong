# ADR‑007: BLE privacy model
**Status:** accepted · 2026‑09‑22

## Decision
- Undirected connectable advertising **only** during the 60 s pairing window (button hold).
- Otherwise: connectable advertising only within 30 min after motion, at 1.28 s intervals, from a **resolvable private address** rotated every 15 min, so third parties cannot track a child's bottle across places.
- Bonding via LE Secure Connections; Config/Control characteristics require encryption; one bonded phone in v1 (factory reset clears).
- No name, no serial, no location in advertising. Manufacturer data carries only protocol version, hw rev, battery and a pairing flag.
- Events are buffered on the tag (64 frames) and delivered only to the bonded phone on connect.

## Consequences
- Finding a lost tag by radio is intentionally impossible in v1 (not a tracker; avoids stalking misuse and Apple/Google unwanted‑tracker alerts).
