# ADR‑005: Sealed rechargeable Li‑Po with magnetic charging; no coin cell
**Status:** accepted · 2026‑09‑22

## Context
iTag‑class devices use CR2032 cells. Coin cells are a documented ingestion hazard for young children (US Reese's Law, 16 CFR 1263, requires secured compartments and warnings) and cannot drive a speaker for long.

## Decision
- **150 mAh Li‑Po pouch**, sealed inside an IP67 enclosure, charged via a **magnetic 2‑pin pogo puck** (5 V, 100 mA). No user‑replaceable battery, no openable compartment, no exposed USB port.
- Charger IC with thermal and over‑charge protection; battery with PCM; UN38.3 + IEC 62133‑2 certified cell.
- Low‑battery behaviour: warn at 15 % (one gentle line/day), silent mode at 5 %, BLE still works for status.

## Consequences
- Slightly higher BOM (+$1.20) and a charger accessory in the box.
- Battery life target ≥30 days at 30 utterances/day (see `docs/hardware/power-budget.md`).
- Alternative rejected: Qi wireless (cost, thickness, coil vs. speaker space), USB‑C port (sealing, kid‑poking risk).
