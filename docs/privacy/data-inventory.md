# Tagalong — Data Inventory (v1.0)

| | |
|---|---|
| **Status** | Accepted for build · 2026‑09‑22 |
| **Owner** | Privacy engineering · App engineering keeps it true |
| **Authority** | `app/src/domain/types.ts` and `app/src/domain/store.ts` are the definition of record. This document describes them; if they diverge, the code is right and this document is a bug. |
| **Scope** | Every datum the app, the phone platform, the tag or the charger holds, plus the paths by which a parent exports or deletes it |
| **Companions** | `threat-model.md` (PRV requirements), `compliance-matrix.md` (regulatory mapping), `privacy-policy.md` (what parents are told) |
| **Build verified** | `app/src` as of 2026‑09‑22 |

## 0. Classification scheme

| Class | Meaning | Handling |
|---|---|---|
| **C0** | Public | No restriction |
| **C1** | Non‑personal technical data | Stays local anyway; may appear in an export |
| **C2** | Personal data about an adult (the parent) | Local only; exportable; deletable |
| **C3** | **Personal data about a child**, or a child‑safety asset | Local only; never transmitted; minimised; 7‑day cap where it is behavioural; deletable in one tap |

Three facts apply to every row in this document and are not repeated in each line:

1. **Nothing here is ever transmitted to Tagalong or to any third party.** There is no backend (ADR‑002). The app makes no runtime network requests (PRV‑01).
2. **Everything in the app's own store is deletable by one control** — Privacy Center → *Delete everything* → `store.wipeAll()` + `deleteAllClips()` + `idbClear()`.
3. **Data at rest is protected by the phone's own encryption and lock screen.** A browser origin has no stronger primitive; we disclose this rather than imply otherwise (PRV‑09).

## 1. Where data physically lives

| # | Location | Technology | Contents | Cleared by |
|---|---|---|---|---|
| L1 | Phone, app store | IndexedDB database `keyval-store`, object store `keyval`, key **`tagalong:v1`** (via `idb-keyval`) | One JSON string: `{"state":{kids,tags,events,settings},"version":1}` (zustand `persist` envelope) | `wipeAll()` → `idbClear()`; browser site‑data clear; app uninstall |
| L2 | Phone, app store | Same object store, keys **`clip:<kidId>`** | One audio `Blob` per kid (the optional name clip) | `deleteClip()`, `deleteAllClips()`, `wipeAll()` |
| L3 | Phone, browser‑managed | Service worker + Cache Storage (Workbox precache) | The app itself: JS/CSS/HTML, icons, and the bundled content packs (2,052 EN phrase lines). **No personal data.** | Browser site‑data clear; app uninstall |
| L4 | Phone, browser‑managed | Web Bluetooth device permission store | The origin‑scoped device ids the parent chose in the chooser, so `getDevices()` can reconnect | Browser site settings → reset permissions; app uninstall |
| L5 | Phone, browser‑managed | Microphone permission grant | A boolean per origin | Browser site settings |
| L6 | Phone, user‑visible filesystem | Downloads / share target | `tagalong-data.json`, only when the parent taps *Export my data* | The parent deletes the file |
| L7 | Tag | nRF52840 NVM | 13‑byte config, mute/time state, bond keys (LTK/IRK), 64‑frame event ring | Factory reset: `Control 05 A5`, or 10 s hold **on the charger** |
| L8 | Tag | 16 MB QSPI NOR | Content packs (pre‑rendered audio), DFU staging slot, reserved name‑clip region (used from v1.1) | Factory reset keeps packs; PRV‑35 requires it to zero the clip region |
| L9 | Charger puck | — | **Nothing.** Two pogo pins, power only, no memory, no data path (PRV‑32) | n/a |
| L10 | Our static host | Web server logs | Standard HTTP request records when the app is installed or updated (IP, user agent, path, timestamp) — **never any app data** | Host retention, ≤ 30 days (PRV‑51) |

There is no L11. No other copy of any datum exists anywhere in the system.

## 2. App store contents — field by field

Field names, types and constraints below are exactly those in `app/src/domain/types.ts`.

### 2.1 `kids[]` — `KidSchema`

| ID | Field | Type / constraint | Source | Class | Retention | Notes |
|---|---|---|---|---|---|---|
| DI‑01 | `id` | `string` — `crypto.randomUUID()` (`lib/id.ts`) | Generated | C1 | Until the kid is deleted | Random; not derived from anything personal; never sent to the tag |
| DI‑02 | `displayName` | `string`, trimmed, **max 24**, **optional** | Parent types it; the field is labelled "First name (optional)" with "Leave blank if you'd rather not" | **C3** | Until changed or deleted | Never leaves the phone and **never reaches the tag as text** (config has no name field — see §4.1) |
| DI‑03 | `ageBand` | `'little' \| 'kid' \| 'big'` | Parent picks | **C3** | Until changed or deleted | A band, not a birth date. ADR‑006: a birth year, if ever offered, is used to suggest the band and is not stored |
| DI‑04 | `createdAt` | `number` epoch ms | Generated | C1 | With the record | — |
| DI‑05 | `nameClip.blobKey` | `string` — `clip:<kidId>` | Generated when a clip is recorded | C1 | With the record | Pointer into L2 |
| DI‑06 | `nameClip.durationMs` | `number`, capped at `MAX_CLIP_MS` = 1500 | Measured | C1 | With the record | — |

### 2.2 `tags[]` — `TagSchema`

| ID | Field | Type / constraint | Source | Class | Retention | Notes |
|---|---|---|---|---|---|---|
| DI‑07 | `id` | UUID | Generated | C1 | Until forgotten | — |
| DI‑08 | `deviceId` | `string` | Web Bluetooth `BluetoothDevice.id`, or `sim-*` for a simulated tag | C2 | Until forgotten | **Origin‑scoped random identifier, not a MAC address and not a serial.** It is meaningless to any other origin, app or device |
| DI‑09 | `nickname` | `string`, 1–30, free text | Auto‑suggested ("Bottle Buddy"), parent may edit | **C3 if edited** | Until changed | The **one free‑text field a parent could type a child's name into**. Treated as C3 for that reason (see §7 risk) |
| DI‑10 | `thing` | 9‑value enum | Parent picks | C2 | Until changed | Reveals what objects the household owns |
| DI‑11 | `kidId` | UUID reference | Generated | C1 | Until forgotten | Links the tag to a child record |
| DI‑12 | `personality` | `'silly' \| 'sweet' \| 'brave'` | Parent picks | C1 | Until changed | — |
| DI‑13 | `volume` | `number` 0–100 | Parent sets | C1 | Until changed | Firmware clamps to ≤ 75 dB(A) @ 25 cm regardless (PRV‑38) |
| DI‑14 | `quiet` | `{enabled, startMin 0–1439, endMin 0–1439}` | Parent sets; default 20:00–07:00 | C2 | Until changed | Implies household sleep routine |
| DI‑15 | `nudges` | `boolean`, **default `false`** | Parent sets | C1 | Until changed | Off by default on purpose |
| DI‑16 | `language` | `'en'` | Fixed in v1 | C0 | — | Wire protocol also allows `es`/`hi` for v1.1 |
| DI‑17 | `createdAt` | epoch ms | Generated | C1 | With the record | — |
| DI‑18 | `lastSyncAt` | epoch ms, optional | Set on connect and on config write | **C2** | Until overwritten | A **co‑presence signal**: "this tag was within Bluetooth range of this phone at this time". The closest thing in the system to location data, and it is neither a place nor a coordinate |
| DI‑19 | `info.fw` / `info.hw` / `info.packId` / `info.packVersion` | strings/ints from `TagInfo` | Read from the tag | C1 | Until next read | Product telemetry that never leaves the phone |
| DI‑20 | `info.battery` / `info.charging` | `0–100` / `boolean` | Read from the tag and from notifications | C1 | Until next read | — |
| DI‑21 | `mutedUntil` | epoch ms, optional | Parent mutes | C1 | Expires | — |
| DI‑22 | `simulated` | `boolean`, optional | Set for demo tags (`sim-*`) | C0 | Until forgotten | Not real data about a child; see §7 (PRV‑17) |

### 2.3 `events[]` — `TagEventSchema`

| ID | Field | Type / constraint | Source | Class | Retention | Notes |
|---|---|---|---|---|---|---|
| DI‑23 | `id` | UUID | Generated | C1 | ≤ 7 days | — |
| DI‑24 | `tagId` | UUID reference | Generated | C1 | ≤ 7 days | — |
| DI‑25 | `type` | One of 20 event types | The tag's sensors, via `EventFrame` | **C3** | **≤ 7 days, hard** | This is behavioural data about a child: when they picked the bottle up, dropped it, drank, opened the lunchbox, brushed |
| DI‑26 | `at` | epoch ms | App clock, corrected with the frame's `uptimeSec` | **C3** | ≤ 7 days | Times are shown relatively ("2 min ago"); never seconds (PRD X‑11) |
| DI‑27 | `intensity` | `number`, optional | `EventFrame.aux`: drop = impact g×10, sip = tilt degrees, brush = seconds ÷ 2 | C2 | ≤ 7 days | Physical, not personal, but it enriches the behavioural record |

**Retention mechanics (exact).** `retentionDays` is the literal `7`; it is not user‑configurable, and the schema (`z.literal(7)`) rejects any other value. Pruning happens in two places: `logEvent()` drops everything older than `at − 7 days` on **every insert**, and `onRehydrateStorage` calls `pruneEvents()` on **every app start**. `logEvent()` returns early and writes nothing when `settings.eventLogEnabled` is `false`.

### 2.4 `settings` — `SettingsSchema`

| ID | Field | Default | Class | Notes |
|---|---|---|---|---|
| DI‑28 | `onboarded` | `false` | C0 | — |
| DI‑29 | `appearance` | `'system'` | C0 | — |
| DI‑30 | `haptics` | `true` | C0 | — |
| DI‑31 | `demoMode` | `false` | C0 | — |
| DI‑32 | `eventLogEnabled` | **`true`** | C1 | The one privacy default that is "on". Accepted with compensating controls — `threat-model.md` §9 R‑2 |
| DI‑33 | `retentionDays` | `7` (literal) | C0 | Not configurable by design |

## 3. Data the platform holds on our behalf

A parent who asks "what does this app know about my child?" deserves these rows too, even though we cannot read or delete them ourselves.

| ID | Datum | Where | Class | Who controls it | How a parent clears it |
|---|---|---|---|---|---|
| DI‑34 | Web Bluetooth device grants (the chooser's remembered devices) | Browser permission store (L4) | C2 | Browser | Browser site settings → reset permissions |
| DI‑35 | Microphone permission grant | Browser (L5) | C1 | Browser | Browser site settings |
| DI‑36 | Service‑worker cache of the app + content packs | Browser (L3) | C1 | Browser | Clear site data; uninstall |
| DI‑37 | Installed‑PWA metadata (icon, name, start URL) | OS launcher | C0 | OS | Uninstall |
| DI‑38 | Speech synthesis voice list | OS | C0 | OS | n/a. We use **only** `localService` voices, so no preview text reaches a vendor (PRV‑04) |
| DI‑39 | HTTP request records for installing/updating the app | Our host (L10) | C2 (IP is personal data in the EEA/UK) | Us — minimised per PRV‑51 | Not individually erasable; disclosed in the policy and retained ≤ 30 days |
| DI‑40 | App store download records, if the app is installed from Apple's or Google's store (v1.1) | Apple / Google | C2 | Apple / Google | Their own controls; disclosed in the policy |
| DI‑41 | The export file the parent saved or shared | Wherever they put it (L6) | **C3** | The parent | They delete it. The app cannot |

## 4. What the tag holds

### 4.1 `TagConfig` — 13 bytes, the whole of what we tell the tag

| Byte | Field | Personal? | Note |
|---|---|---|---|
| 0 | `version` | No | — |
| 1 | `ageBand` | **Yes (C3)** | One of three values. The only attribute of the child that reaches the tag |
| 2 | `thing` | No | — |
| 3 | `personality` | No | — |
| 4 | `volume` | No | — |
| 5–6 | `quietStart`, `quietEnd` | Household routine (C2) | 10‑minute resolution |
| 7 | `language` | No | — |
| 8 | `flags` | No | `nudges`, `eventBuffer`, `nameClipPresent`, `led` |
| 9 | `maxPerHour` | No | — |
| 10–11 | `timeOfDayMin` | No | Time of day only — **the tag never learns the date** (TAG‑TIME‑02) |
| 12 | `checksum` | No | — |

**There is no name field, no kid id, no phone id, no household id and no serial in the config.** A tag recovered by a stranger yields: an age band, an object type, a volume, a quiet window and a language. It cannot be traced to a child, a phone or a purchase.

### 4.2 Other tag‑resident data

| ID | Datum | Where | Class | Retention | Delete path |
|---|---|---|---|---|---|
| DI‑42 | Event ring buffer, 64 × 8‑byte frames (`type`, `uptimeSec`, `battery`, `aux`) | L7 | **C3** | Overwritten oldest‑first; flushed once delivered to the bonded phone | Factory reset; or simply time |
| DI‑43 | Bond keys (LTK, IRK) for exactly one phone | L7 | C2 (a linkable identity if extracted) | Until factory reset | Factory reset; also cleared by "second bond rejected" logic never creating a second one |
| DI‑44 | Mute state, time‑of‑day, uptime | L7 | C1 | Volatile / reset on reboot | — |
| DI‑45 | Content packs: pre‑rendered audio for every cell | L8 | C0 (our content, identical on every tag) | Life of the product | Not deleted by factory reset, by design |
| DI‑46 | **Name clip region** (v1.1): ≤ 1.5 s, 16 kHz IMA ADPCM, the child's name as audio | L8 | **C3** | Until deleted or overwritten | App: delete the clip (zeroes the region). PRV‑35 additionally requires factory reset to zero it |
| DI‑47 | DFU staging slot | L8 | C0 | Until next update | — |
| DI‑48 | Firmware public key for signature verification | L7 | C0 | Life of the product | A **public** key — extracting it yields nothing (`threat-model.md` §5.3) |

In v1.0 the clip stays on the phone only and `flags.nameClipPresent = 0` (TAG‑NC‑01); DI‑46 becomes live at v1.1 with `PackXfer`.

## 5. Export

`lib/exportData.ts` → `buildExport()`, downloaded as **`tagalong-data.json`** via a Blob object URL that is revoked after one second.

```json
{
  "app": "tagalong",
  "format": 1,
  "exportedAt": "2026-09-22T09:14:03.117Z",
  "note": "This file was created on your device by the Tagalong app. Name clips (audio) are not included.",
  "data": { "kids": [...], "tags": [...], "events": [...], "settings": {...} }
}
```

| Property | Value |
|---|---|
| Covers | DI‑01 … DI‑33 in full (every field of `kids`, `tags`, `events`, `settings`) |
| Excludes | Name clips (DI‑46/L2 blobs), platform data (DI‑34 … DI‑40), tag‑resident data (§4) |
| Format | Unencrypted, human‑readable JSON — deliberate: portability beats obscurity for a file the parent chose to create. The UI must say it is unencrypted (PRV‑07) |
| Transport | The browser's own download or share sheet. The app performs no upload |
| Divergence from the PRD | PRD PC‑02 specifies `tagalong-export-YYYYMMDD.json` **with clips base64‑encoded**. The build ships `tagalong-data.json` **without** clips. See §7 D‑1 — the build's behaviour is the more privacy‑protective of the two, and it is what this inventory documents |

## 6. Deletion matrix

| Control | Where | Clears | Leaves |
|---|---|---|---|
| Edit the kid's name to blank | Kids → kid | DI‑02 | Everything else |
| Delete the name recording | Kids → kid → Name recording → Delete | DI‑05, DI‑06, the L2 blob | The kid record |
| **Clear activity** | Privacy Center | All of `events[]` (DI‑23 … DI‑27) | Kids, tags, settings, clips |
| Turn off *Keep an activity log* | Settings | Stops new writes (`logEvent` returns early) | Existing events until pruned or cleared |
| Forget this tag | Tag detail | That tag and its events | The kid, other tags, **the bond on the tag itself** — the parent must also reset the tag (PRV‑62) |
| Delete this kid | Kids → kid | The kid, **their tags and those tags' events** (`removeKid`) | Other kids; L2 blobs are removed by the clip delete path or by *Delete everything* |
| **Delete everything** | Settings or Privacy Center, typed "DELETE" | `disconnectAll()` → `deleteAllClips()` → `wipeAll()` → `idbClear()`: L1 **and** L2, i.e. every row in §2 and every clip | L3 (the app itself), L4/L5 (browser permissions), L7/L8 (the tag — reset it separately), L6 (any export file already saved) |
| Factory reset the tag | Charger + 10 s hold, or the app's Control op | L7 entirely: config, bond, mute, time, event buffer | Content packs (DI‑45) by design; PRV‑35 adds the clip region |
| Uninstall the app / clear site data | OS or browser | L1, L2, L3, and typically L4/L5 | The tag |
| Time | Automatic | Events older than 7 days, on every insert and every app start | — |

## 7. Divergences and risks in the current build

| ID | Finding | Impact | Requirement |
|---|---|---|---|
| D‑1 | Export filename and clip handling differ from PRD PC‑02 (§5) | Low. The build excludes audio, which is safer; but the PRD and the build should not disagree | Align the PRD to the build, or implement the PRD's base64 clips **with** an explicit warning. Decide before G1 |
| D‑2 | `privacyInventory()` counts simulated tags and their events alongside real ones | A parent in demo mode sees inflated counts and cannot tell what is real; PRD E‑16 requires separate counting | PRV‑17 |
| D‑3 | `nickname` (DI‑09) is free text and the obvious place a parent types the child's name, which then appears in the export and in the tag's UI label | Medium: it silently upgrades a C1 field to C3 | Keep it local (it already is), never send it to the tag, and treat it as C3 in the policy and the export warning. No input filtering — a parent may name their child's bottle whatever they like |
| D‑4 | Privacy Center has no storage‑size row (PRD PC‑01 asks for one) | Cosmetic | Add `navigator.storage.estimate()` when convenient |
| D‑5 | `KidEditor.playClip()` revokes the clip's object URL only on `onended`; an aborted playback leaves the URL resolvable for the page's lifetime | Low, same‑origin only | PRV‑08 |
| D‑6 | `console.*` is not stripped from production builds | Low but it breaks a stated rule (PRD X‑10, `AGENTS.md`) | PRV‑16 |
| D‑7 | The app's own `events[]` timestamps depend on the tag's `uptimeSec` arithmetic (TAG‑BUF‑02); after a tag reboot they are approximate | Accuracy, not privacy — do not present approximate times as exact | PRD TAG‑BUF‑02 already requires the "earlier" flag |

## 8. Answering a parent, a regulator and an app store from this document

| Question | Answer | Rows |
|---|---|---|
| "What do you know about my child?" | An optional first name, an age band, which objects are tagged, and up to 7 days of what those objects did — all of it on your phone, none of it with us | DI‑02, DI‑03, DI‑10, DI‑25 |
| "Do you collect voice recordings?" | Only if the parent chooses to record the name. It stays in the phone's own storage, and from v1.1 on the tag. It is never uploaded and is deletable in one tap | DI‑05, DI‑06, DI‑46, L2 |
| "Any location data?" | None. No coordinates, no place names, no ranging. The nearest thing is a timestamp for "the tag was within Bluetooth range of this phone" | DI‑18, `threat-model.md` §7 |
| "Any identifiers?" | Random UUIDs generated on the phone, and an origin‑scoped Bluetooth device id. No advertising id, no device fingerprint, no serial, no account | DI‑01, DI‑08 |
| "What do you share with third parties?" | Nothing. There are no third parties in the runtime. The only third parties in the whole system are the phone's OS, the browser, and — if the app is installed from a store — that store | DI‑38, DI‑40 |
| "Data retention policy?" | Behavioural events: 7 days, enforced in code, not configurable. Everything else: until the parent deletes it or uninstalls | DI‑25, §6 |
| "How does a parent exercise deletion and portability?" | Two controls in the Privacy Center, both instant, both offline, no request to us and no identity check — because we have no copy to match them against | §5, §6 |
