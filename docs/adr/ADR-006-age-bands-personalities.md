# ADR‑006: 3 age bands × 3 personalities content matrix
**Status:** accepted · 2026‑09‑22

## Context
"Adapt to the kid's age" could mean per‑year tuning. Content cost scales linearly with cells; audio must be recorded per cell.

## Decision
- Age bands: **little (2–4)**, **kid (5–7)**, **big (8–12)** — matching developmental stages (pre‑operational language, early literacy, concrete‑operational humour).
- Personalities: **silly**, **sweet**, **brave**. Each is a distinct voice character across all bands.
- Every (thing, event) cell has ≥4 lines per band × personality; basic things fall back to a `generic` pack.
- Parents pick the band; the app suggests it from a birth year if given (never stored — only the band is).

## Consequences
- v1 EN content ≈ 4 full things × ~8 events × 9 cells × 4 lines ≈ 1,150 lines + generic ≈ 300. Recordable in one studio week per voice.
- Adding a language = re‑recording the same matrix; scripts are the asset.
