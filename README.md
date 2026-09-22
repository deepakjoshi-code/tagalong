# Tagalong

**Give anything a voice.** A small, waterproof talking tag that adapts to the thing it's attached to and the kid it belongs to — plus a privacy‑first companion app (PWA) with no accounts, no cloud, no microphone.

| Part | Path | Status |
|---|---|---|
| Companion app (PWA) | `app/` | building |
| Product docs (brief, PRD, research, GTM) | `docs/` | building |
| Tag hardware package (architecture, BOM, mechanical, compliance) | `docs/hardware/`, `hardware/` | planned |
| Firmware reference (nRF52840 / Zephyr) | `firmware/` | planned |
| Content packs (phrases by age × personality × thing × event) | `content/` | building |

Start with [`docs/00-product-brief.md`](docs/00-product-brief.md).

## Run the app
```bash
cd app && pnpm install && pnpm dev
```
