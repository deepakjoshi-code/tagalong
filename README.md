# Tagalong

**Give anything a voice.** A small, waterproof talking tag that adapts to the thing it's attached to and the kid it belongs to — plus a privacy‑first companion app (PWA) with no accounts, no cloud, no microphone.

| Part | Path | Status |
|---|---|---|
| Companion app (PWA) | `app/` | working — onboarding, pairing wizard, tag detail, kids, settings, privacy centre, demo playground |
| Content packs (2,052 phrases by thing × event × age × personality) | `content/` | complete for English |
| Firmware reference (nRF52840 / Zephyr) | `firmware/` | wire protocol, utterance policy and event engine done and tested on the host |
| Product, hardware, privacy and go-to-market docs | `docs/` | complete for v1 definition |

Start with [`docs/00-product-brief.md`](docs/00-product-brief.md), then [`docs/README.md`](docs/README.md) for the index.

## Run the app

```bash
cd app && pnpm install && pnpm dev
```

Open `/demo` to try the whole thing with no hardware: a simulated tag reacts and
the phone speaks its lines.

## Checks

```bash
node content/validate.mjs            # phrase packs: word limits, bans, duplicates
cd app && pnpm lint && pnpm typecheck && pnpm test && pnpm build
cd app && pnpm e2e                   # 13 browser journeys incl. accessibility gates
cd firmware && make test             # 45 host tests, no hardware needed
```

The app's test suite includes a **codec parity** check that compiles the C
firmware and asserts it encodes byte-identical frames. If the tag and the app
ever disagree, `pnpm test` fails.
