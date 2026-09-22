# Tagalong App — Architecture

## Stack
- **Vite + React 19 + TypeScript (strict)**, `pnpm`.
- Routing: `react-router` (declarative). State: `zustand` with a persist adapter over **IndexedDB** (`idb-keyval`), so blobs (name clips) persist.
- Validation: `zod` at every storage/transport boundary.
- Motion: `motion` (framer‑motion successor). Icons: `lucide-react`.
- PWA: `vite-plugin-pwa` (Workbox, `autoUpdate`), manifest + maskable icons, offline for everything.
- Tests: `vitest` + `@testing-library/react` + `jsdom`; e2e/screenshots: Playwright (Chromium pre‑installed at `/opt/pw-browsers`).
- Lint/format: ESLint (typescript‑eslint, react‑hooks, jsx‑a11y) + Prettier.
- **No backend. No network calls at runtime.** CSP: `default-src 'self'; connect-src 'none'; img-src 'self' data: blob:; media-src 'self' blob:`.

## Directory layout (`tagalong/app`)
```
src/
  main.tsx                       bootstraps providers + router + SW registration
  app/        App.tsx, router.tsx, TabBar.tsx, Providers.tsx, RootRedirect.tsx
  design/     tokens.css, global.css, components/<Name>.tsx (+ .module.css)
  domain/     types.ts (zod schemas + TS types), ageBands.ts, things.ts, personalities.ts, events.ts,
              store.ts (zustand + idb persist), selectors.ts, nicknames.ts
  content/    phrases/<thing>.ts, index.ts (catalog), pickPhrase.ts (no‑repeat random), guidelines.md
  transport/  types.ts, uuids.ts, codec.ts (binary config/event/info), webBluetooth.ts, simulated.ts,
              index.ts (chooses transport), errors.ts
  features/   onboarding/, tags/ (Home, TagDetail, AddTagWizard/, TagCard), kids/, settings/, privacy/, demo/
  lib/        speech.ts, haptics.ts, time.ts, id.ts, install.ts, exportData.ts, format.ts
  test/       setup.ts, factories.ts
e2e/          playwright.config.ts, screenshots.spec.ts
public/       icons/, manifest assets
```
Rule: a feature folder may import from `design`, `domain`, `content`, `transport`, `lib` — never from another feature.

## Domain model (all local)
```ts
type AgeBand = 'little' | 'kid' | 'big';            // 2–4, 5–7, 8–12
type Personality = 'silly' | 'sweet' | 'brave';
type ThingType = 'bottle'|'lunchbox'|'backpack'|'toothbrush'|'shoes'|'plush'|'helmet'|'jacket'|'other';
type TagEventType = 'pickup'|'putdown'|'drop'|'shake'|'tap'|'long_still'|'good_morning'|'low_battery'|'charging'
  |'filled'|'sip'|'empty'|'opened'|'closed'|'packed'|'left_behind'|'zipped'|'brush_start'|'brush_done'|'brush_short';

interface Kid { id; displayName?: string; ageBand: AgeBand; createdAt: number; nameClip?: { blobKey: string; durationMs: number } }
interface Tag  { id; deviceId: string; nickname: string; thing: ThingType; kidId: string; personality: Personality;
                 volume: number /*0–100*/; quiet: { enabled: boolean; startMin: number; endMin: number };
                 nudges: boolean; language: 'en'; createdAt; lastSyncAt?: number;
                 info?: { fw: string; hw: number; packId: number; packVersion: number; battery: number };
                 mutedUntil?: number; simulated?: boolean }
interface TagEvent { id; tagId; type: TagEventType; at: number; intensity?: number }
interface Settings { onboarded: boolean; appearance: 'system'|'light'|'dark'; haptics: boolean; demoMode: boolean;
                     eventLogEnabled: boolean; retentionDays: 7 }
```
Events older than `retentionDays` are pruned on app start and on each insert. Everything is exportable as one JSON (`exportData.ts`) and deletable in one call (`store.wipeAll()` which also clears IndexedDB blobs and unregisters nothing else — no remote state exists).

## Transport abstraction (ADR‑001)
```ts
interface TagTransport {
  readonly kind: 'web-bluetooth' | 'simulated' | 'capacitor';
  isAvailable(): boolean;
  requestTag(): Promise<DiscoveredTag>;           // user gesture → chooser (or demo list)
  connect(deviceId: string): Promise<TagConnection>;
}
interface TagConnection {
  readonly deviceId: string;
  readInfo(): Promise<TagInfo>;
  writeConfig(cfg: TagConfig): Promise<void>;     // encoded by codec.ts
  control(op: ControlOp): Promise<void>;          // identify | preview | mute | setTime | factoryReset
  onEvent(cb: (e: TagEventFrame) => void): () => void;
  onDisconnect(cb: () => void): () => void;
  disconnect(): Promise<void>;
}
```
`transport/index.ts` returns `SimulatedTransport` when `settings.demoMode` is on or Web Bluetooth is unavailable (with a UI explainer), else `WebBluetoothTransport`. A Capacitor implementation slots in later without touching features.

## Content engine
`content/index.ts` exports `catalog: Record<ThingType, Partial<Record<TagEventType, Record<AgeBand, Record<Personality, string[]>>>>>` with `generic` fallbacks for basic things. `pickPhrase(thing, event, ageBand, personality, recent[])` avoids the last 3 lines. Lines carry `{{name}}` placeholders that resolve to the kid's name (or a fallback like "amigo"/"friend"/"legend" per band) — on the tag this maps to the optional name clip.

## Speech preview
`lib/speech.ts` wraps `speechSynthesis`: picks an English voice, sets rate/pitch per age band + personality (silly = higher pitch, faster; sweet = slower, softer; brave = lower, punchy). Falls back to a toast if unsupported. Never sends text anywhere.

## Quality bar (CI locally)
`pnpm lint && pnpm typecheck && pnpm test && pnpm build` must pass. Lighthouse PWA installability ≥ 90, a11y ≥ 95. Bundle < 250 KB gz.
