# ADR‑003: nRF52840 + pre‑rendered phrase audio in QSPI flash
**Status:** accepted · 2026‑09‑22

## Context
The tag must speak hundreds of distinct lines with real personality, run for weeks on a small battery, and fit in a ⌀38 mm puck. On‑device TTS at this power class sounds robotic and needs a much larger MCU.

## Decision
- MCU/radio: **Nordic nRF52840** (Cortex‑M4F, 1 MB flash, 256 KB RAM, BLE 5, USB, QSPI, I²S). Mature Zephyr/nRF Connect SDK, proven in trackers.
- Audio: lines recorded/generated offline by a voice actor or a high‑quality neural TTS, mastered, encoded as **IMA ADPCM 16 kHz mono** (≈32 kB/s → 1 s ≈ 32 kB; a 400‑line pack ≈ 6 MB) and stored in a **16 MB QSPI NOR flash** as a content pack with an index table. Decoder cost is trivial.
- Playback: I²S → class‑D amp (MAX98357A) → 20 mm 8 Ω speaker. Volume applied in software with a hard SPL cap.
- Name clip (optional): 16 kHz ADPCM, ≤1.5 s, stored in a reserved region, spliced at `{{name}}` markers.

## Consequences
- Content updates ride over BLE (`PackXfer`, v1.1) or USB at the factory. Factory pre‑loads all v1 packs.
- Languages are separate packs; a tag holds one language at a time in v1.
- Alternative rejected: ESP32‑S3 (Wi‑Fi unnecessary, 5–10× sleep power), MP3 (decode cost, licensing).
