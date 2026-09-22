# Tagalong — Engineering Rules

This directory is a **separate product** from the FinalSpec code at the repo root. The root `AGENTS.md` does not apply here; this file does. It will be split into its own repository (`git subtree split -P tagalong`).

Source of truth: `docs/00-product-brief.md`, then `docs/design/design-spec.md`, `docs/architecture/app-architecture.md`, `docs/protocol/tag-protocol.md`. If code and docs disagree, fix whichever is wrong and say so.

## Privacy (hard rules)
- No backend, no network calls at runtime, no third‑party scripts/fonts/CDNs, no analytics, no crash reporting.
- Never log names, clips, or event logs. `console.*` only in dev and only for non‑personal data.
- All personal data (kid names, age bands, name clips, event logs) lives in IndexedDB on the parent's device and must be exportable and deletable from the Privacy Center.
- Web Bluetooth only on a user gesture; never auto‑reconnect without the user having paired in‑app.

## Child safety (content)
- Lines must pass `docs/content/content-guidelines.md`: encouraging, no shame/fear/food‑body talk, no brands, age‑appropriate vocabulary and length.

## Code
- TypeScript strict, no `any`, zod at boundaries. No new dependency without a one‑line justification in the PR/commit.
- Components: accessible (labels, focus, 44 px targets), themed via tokens only (no hard‑coded colours), reduced‑motion aware.
- Feature folders never import from each other.
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` must pass before commit.

## Commits
Conventional commits: `feat(app): …`, `docs(hw): …`, `fw: …`. Small, scoped.
