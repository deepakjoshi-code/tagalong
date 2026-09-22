# Tagalong — Product Requirements Document (v1.0)

| | |
|---|---|
| **Status** | Draft for build · 2026‑09‑22 |
| **Owner** | Product (founder is approver) |
| **Derives from** | `docs/00-product-brief.md` (north star), `docs/adr/ADR-001…007`, `docs/design/design-spec.md`, `docs/architecture/app-architecture.md`, `docs/protocol/tag-protocol.md` |
| **Scope** | v1.0 app (PWA) + v1.0 tag behaviour. v1.1+ items are marked and live in `docs/02-roadmap.md` |

## 0. How to read this document

- Where this PRD and the brief/ADRs/design spec/protocol overlap, **they win**. This PRD adds detail; it never overrides. Items that need a follow‑up change elsewhere are listed in §13.
- Requirement IDs: `X‑` cross‑cutting app · `W‑` Welcome · `H‑` Home · `AT‑n.m` Add‑tag step n · `TD‑` Tag detail · `K‑` Kids · `S‑` Settings · `PC‑` Privacy Center · `D‑` Demo · `TAG‑` tag behaviour · `E‑` edge case · `A11Y‑` · `L10N‑`.
- Priority: **P0** must ship in v1.0; **P1** ship in v1.0 unless it slips the date; **P2** target v1.1. Unmarked = P0.
- "Parent" = the app user. "Kid" = the tag's audience. "Thing" = the object the tag is attached to.
- Acceptance criteria are Given/When/Then and are the definition of done for engineering and QA.

---

## 1. Problem

Kids lose bottles, forget bags, skip brushing and under‑drink. Parents nag; nagging fails. Existing "smart" kids' products fix this with screens, apps for the child, microphones and cloud accounts — exactly what parents distrust. There is no product that makes the **object itself** playful, works with zero data collection, and sets up in a minute.

**Insight (from brief):** the object is the character. The tag disappears; the bottle becomes "Bottle Buddy".

## 2. Goals and non‑goals

### 2.1 Goals (v1.0)

| # | Goal | Measure (research sessions — the app has no telemetry) |
|---|---|---|
| G1 | Delight in one second | ≥ 80 % of kids laugh/smile within the first minute of first use |
| G2 | Setup in under a minute, no account | ≥ 90 % of parents complete Add‑tag in ≤ 90 s unaided |
| G3 | Private by design, provably | Zero network requests at runtime; every byte of personal data visible, exportable, deletable in‑app |
| G4 | Calm by default | ≤ 12 utterances/hour default; silent in quiet hours; one‑gesture mute |
| G5 | Works on the phones parents own | Android Chrome/Edge pairs; every other browser gets a complete demo and a clear path |
| G6 | Commercially viable | Return rate < 3 %, battery complaints < 1 %, 4.7★, 10k units in 6 months |

### 2.2 Non‑goals (v1.0)

Microphone/voice recognition (ADR‑004), cloud sync or accounts (ADR‑002), multi‑phone sharing, location/finding (ADR‑007), subscriptions, third‑party integrations, ads, kid‑facing app UI, per‑year age tuning (ADR‑006), languages other than English (v1.1), iOS native pairing (v1.1, ADR‑001), content updates over BLE (v1.1), two tags talking to each other (v1.2).

## 3. Personas

| Persona | Role | Situation | Wins when | Fails when |
|---|---|---|---|---|
| **Priya, 34** — parent of Aarav (3) | Buyer, setter‑upper | Toddler refuses water; hates screens for him; privacy‑anxious after news stories | Sweet voice, simple words, sound effects; nothing to sign up for | Any account wall; anything that could "listen" |
| **Marcus, 41** — parent of Zoe (6) | Buyer, occasional app user | Zoe leaves bottle/backpack at school weekly | Jokes with "amigo" energy; backpack nudge; durable | Tag is chatty in class; battery dies unnoticed |
| **Dana, 38** — parent of Leo (10) | Buyer; Leo co‑configures | Leo finds "kid stuff" cringe | Dry wit, Leo picks the personality himself | Babyish lines; anything he'd be teased for |
| **Grandpa Joe, 67** — gift buyer | Buyer, not user | Wants a "wow" gift, hates setup | Beautiful box; the parent sets it up in 60 s | Setup requires him |
| **Aarav (little), Zoe (kid), Leo (big)** | Audience | Interact only with the tag | Immediate, funny, kind reactions | Shame, fear, nagging tone, talking over itself |

## 4. End‑to‑end journeys

Each step lists the actor, what happens, how it should feel, and the requirements that make it true.

### 4.1 Unboxing (target: sleeve → first giggle ≤ 20 s)

| Step | Actor | What happens | Feel | Reqs |
|---|---|---|---|---|
| 1 | Parent | Slides the sleeve off; lifts the lid | Slow reveal, premium | `03-unboxing-and-packaging.md` |
| 2 | Parent/Kid | Tag sits face‑up in a pulp cradle under a printed speech bubble: "Press my button!" | Invitation | TAG‑BTN‑06 |
| 3 | Kid | Presses the button; tag wakes from ship mode, giggles, LED ring sweeps white | **First laugh** | TAG‑ST‑01, TAG‑LED‑01 |
| 4 | Parent | Reads the 58‑word quick‑start card; puts tag on the magnetic charger (amber breathe) | Effortless | TAG‑BAT‑05 |
| 5 | Parent | Scans QR → PWA opens in the browser → Welcome | No download, no account | W‑01, X‑01 |

### 4.2 Pairing and setup (target ≤ 90 s from Welcome to "ready")

| Step | Actor | What happens | Reqs |
|---|---|---|---|
| 1 | Parent | Welcome slides (3) → **Get started** | W‑01…W‑04 |
| 2 | Parent | Add‑tag step 1 "Find your tag": holds the tag button 3 s → giggle + white pulse (60 s window); taps **Search**; picks "Tagalong" in the chooser; accepts the phone's Pair prompt | AT‑1.x, TAG‑PAIR‑01 |
| 3 | Parent | Step 2 picks/creates a kid (optional first name, age band) | AT‑2.x |
| 4 | Parent | Step 3 picks the thing (bottle) — the icon gets a face | AT‑3.x |
| 5 | Parent (kid over the shoulder) | Step 4 previews Silly/Sweet/Brave on the phone; nickname "Bottle Buddy" | AT‑4.x |
| 6 | Parent | Step 5 volume with live preview; quiet hours default 8 pm–7 am; nudges off | AT‑5.x |
| 7 | App | Step 6 writes config (13 B) + time; tag says its first configured line; confetti; **Done** | AT‑6.x, TAG‑CFG‑01 |
| 8 | Parent | Home shows the Bottle Buddy card with battery and "Just set up · now" | H‑02 |

### 4.3 First laugh (the moment we sell)

| Step | Kid does | Tag says (kid · silly, examples) | Reqs |
|---|---|---|---|
| 1 | Fills the bottle | "Glug glug glug… full tank, amigo!" | TAG‑EV‑bottle `filled` |
| 2 | Knocks it off the table | "Whoa! Ouch, my back! I'm okay, I'm okay." | TAG‑EV `drop`, priority 1, ≤ 300 ms |
| 3 | Picks it up | "You saved me! You're my bestie." | TAG‑EV `pickup` |
| 4 | Takes a sip | "Mmm. Hydration achieved." | TAG‑EV bottle `sip` |
| 5 | Shakes it | "Wheee— okay, okay, I'm dizzy!" | TAG‑EV `shake` |
| — | Parent glances at the app | Card: "Took a tumble · just now"; Today timeline fills in when connected | H‑02, TD‑05 |

### 4.4 Daily use

Morning: first pickup after a long still → `good_morning` (if nudges on). School: rate limits keep it to ≤ 12 lines/hour; backpack/lunchbox `shake` and `putdown` are silent by design. Dinner: parent double‑taps to mute for an hour; LED confirms. Evening: quiet hours from 8 pm — the tag lights softly on a tap but stays silent. Weekly: parent opens the app near the tags; events sync; Today shows the last 7 days; nothing to manage.

### 4.5 Battery (≈ day 25–35)

| State | Tag | App | Reqs |
|---|---|---|---|
| 15 % | One gentle "I'm getting sleepy — could you charge me tonight?" per day (outside quiet hours) | Amber battery pill, "Charge soon" | TAG‑BAT‑02 |
| 5 % | Silent; two red LED blinks on tap; BLE status still works | Red pill, "Needs a charge" | TAG‑BAT‑03 |
| On charger | "Ahh, snack time." once; amber breathe → dim green when full | Card shows charging bolt | TAG‑BAT‑05/06 |
| Dead → charged | Boots into time‑unknown state; reactive lines only until the app connects | Home hint: "Open near the tag to set its clock" | TAG‑TIME‑03 |

### 4.6 Forgetting a tag (hand‑me‑down, resale, or gone for good)

| Step | Actor | What happens | Reqs |
|---|---|---|---|
| 1 | Parent | Tag detail → **Forget this tag** → confirm sheet explains: removes from this phone, resets the tag, deletes its activity here | TD‑07 |
| 2 | App | If connected: sends factory reset `05 A5`; tag blinks red ×3 and says a short goodbye (outside quiet hours) | TAG‑PAIR‑05 |
| 3 | App | If not connected: offers "Reset it later: on the charger, hold the button 10 s" and still deletes local data | TD‑07, TAG‑BTN‑04 |
| 4 | App | Kid record stays (other tags may use it); Home updates; Privacy Center counts drop | K‑05, PC‑01 |

---

## 5. App functional requirements

### 5.0 Cross‑cutting

**X‑01 Installable PWA.**
- Given a supported browser, When the site is first loaded, Then it is installable (manifest with name, maskable icons, `display: standalone`, theme colour = `--bg`), Lighthouse installability ≥ 90, and all routes render without network after the first load.
- Given `beforeinstallprompt` fired and the app is not installed, Then Home shows a dismissible install banner (H‑06); dismissal persists 30 days.

**X‑02 Zero network at runtime.**
- Given any screen, When the app runs, Then the only requests are same‑origin static assets; CSP is as in the architecture doc; an automated test fails the build on any cross‑origin request, `<link>` font, or inline script.
- Given the service worker updates, Then the new version activates silently (`autoUpdate`) and a non‑blocking toast reads "Tagalong updated".

**X‑03 Local storage and durability.**
- Given the first tag or kid is saved, Then the app calls `navigator.storage.persist()` inside that user gesture; if denied, Privacy Center shows "Your browser may clear this data if you don't use the app for a while — install the app to keep it safe."
- Given iOS Safari not installed to the Home Screen, Then Welcome slide 3 and Settings show an "Add to Home Screen" explainer with the 7‑day eviction warning (E‑06).
- Given app start or any event insert, Then events older than 7 days are pruned.
- Soft limits: 6 kids, 8 tags. Exceeding shows a friendly limit message, no crash.

**X‑04 Transport selection (ADR‑001).**
- Given `settings.demoMode` is on **or** Web Bluetooth is unavailable, Then the simulated transport is used and every tag‑facing screen carries a visible "Demo" chip.
- Given Web Bluetooth is available and demo mode off, Then `WebBluetoothTransport` is used. Features never reference a concrete transport.

**X‑05 Connection lifecycle and consent.**
- Given a tag was paired **in this app**, When the app comes to the foreground or the parent taps a card, Then the app may reconnect without a chooser **only where the browser exposes previously permitted devices**; otherwise reconnect requires a tap on **Connect** which opens the chooser (the tag must be in its pairing window or within 30 min of motion).
- Never connect to, or list, a device the parent did not pair in‑app. Never auto‑reconnect in the background.
- On every connect: read `Info`, validate `proto = 1`, subscribe to `Event` and `Battery`, replay buffered frames, send `04 <minutes>` (set time). If `Info.uptimeMin` is lower than the last seen value, treat it as a reboot (TAG‑TIME‑03).
- Disconnect within 10 s of the app going to background, after the sync completes.

**X‑06 Error language.** Every transport/storage error maps to one plain sentence and one action (Retry · Turn on Bluetooth · Use demo tag · Hold the button again). No error codes, no "GATT", no stack traces.

**X‑07 Speech preview (phone).**
- Uses `speechSynthesis`; prefers voices with `localService === true`; rate/pitch per band × personality (architecture doc). The spoken text is always shown on screen as a caption (A11Y‑07).
- Given no local voice exists, Then the app still speaks with the available voice and Privacy Center notes "Preview voices are provided by your phone's operating system."
- Given speech is unsupported, Then a toast reads "Your browser can't speak previews — the tag will."
- Given iOS, Then speech starts only from a tap (WebKit gesture rule); the ▶ affordance is the gesture.

**X‑08 Appearance & haptics.** System/light/dark follows `settings.appearance`; all colours via tokens; haptics via `navigator.vibrate` only when `settings.haptics` and supported.

**X‑09 Performance budgets.** Cold start to interactive ≤ 2.0 s on a 2022 mid‑range Android (Pixel 6a class) over the installed SW; route transitions ≤ 100 ms to first frame; JS bundle < 250 KB gz (architecture); config write round trip ≤ 2 s; event shows on Home ≤ 1 s after notify.

**X‑10 No personal data in logs.** `console.*` stripped in production; dev logging never includes names, clips, or event payloads (AGENTS.md).

**X‑11 Kid‑friendly event words (UI copy, design spec §5 extended).**

| Event | Card/timeline text | Event | Text |
|---|---|---|---|
| pickup | Picked up | filled | Filled up |
| putdown | Set down | sip | Had a sip |
| drop | Took a tumble | empty | Ran dry |
| shake | Got a shake | opened | Opened up |
| tap | Said hi | closed | Closed up |
| long_still | Waiting patiently | packed | Packed and ready |
| good_morning | Said good morning | left_behind | Waited for you |
| low_battery | Getting sleepy | zipped | Zipped up |
| charging | Charging up | brush_start | Started brushing |
| | | brush_done | Brushed the full two minutes |
| | | brush_short | Quick brush |

Relative time: "just now" (< 60 s), "N min ago", "N h ago", "Yesterday", weekday name (≤ 7 days). Never show exact seconds.

**X‑12 Nickname suggestions (`domain/nicknames.ts`).** bottle → Bottle Buddy · lunchbox → Lunch Pal · backpack → Pack Pal · toothbrush → Brushy · shoes → Zoomers · plush → Snuggle Pal · helmet → Captain Helmet · jacket → Cozy · other → Buddy. If the kid already has a tag with that nickname, append " 2".

### 5.1 Welcome (`/welcome`)

| ID | Given / When / Then |
|---|---|
| W‑01 | Given first launch (`settings.onboarded = false`), When the app opens, Then `/welcome` shows slide 1 ("Give anything a voice.") with the bottle ThingIcon face doing a subtle bounce (crossfade only under reduced motion), progress dots (1/3) and **Skip** top‑right. |
| W‑02 | Given slide 1, When the parent swipes or taps next, Then slide 2 shows the lock glyph, "Made for kids. Private by design." and the sub‑copy *No account. No cloud. No microphone. Everything stays on your phone.* |
| W‑03 | Given slide 3, Then the CTA **Get started** routes to `/tags/new` and marks onboarded; secondary **Try the demo** turns demo mode on and routes to `/demo`. |
| W‑04 | Given onboarded = true, When the app opens, Then `/welcome` is skipped; it stays reachable from Settings → About → "See the welcome tour". |
| W‑05 | Given an unsupported browser (no Web Bluetooth), Then slide 3 adds one footnote line: "Pairing a real tag needs Chrome or Edge on Android. Everything else works here." — no modal, no blocker. |
| W‑06 | Given keyboard or screen‑reader use, Then slides are a labelled carousel (`role="group"`, `aria-roledescription="slide"`, "Slide 1 of 3"), arrow keys move, Skip is the first focusable element. |

### 5.2 Tags — Home (`/tags`)

| ID | Given / When / Then |
|---|---|
| H‑01 | Given no tags, Then the empty state shows the ThingIcon trio, "No tags yet", primary **Add a tag**, tertiary **Try the demo**. |
| H‑02 | Given ≥ 1 tag, Then each card shows: ThingIcon with Face (reacting to the last event for 4 s after it arrives; idle blink every 4–7 s), nickname, line 2 "Kid name · Personality" chip (kid name falls back to the age‑band label when no name), line 3 last event in kid words + relative time, BatteryPill top‑right (percent + icon; amber < 15 %, red < 5 %, bolt when charging, "—" when never synced). Cards are ordered by last event time, most recent first. |
| H‑03 | Given a card, When tapped, Then `/tags/:id` opens with a shared‑element transition of the ThingIcon (crossfade under reduced motion). |
| H‑04 | Given a card, When long‑pressed (500 ms) or the context key is used, Then a bottom Sheet offers **Mute for an hour** and **Forget…** (destructive). Mute sends `03 3C 00` when connected, otherwise stores `mutedUntil` and sends on next connect; the card shows a "Muted · 59 min" chip. |
| H‑05 | Given a tag that is not connected, Then the card shows a subtle "Not connected · synced 2 h ago" footer; When tapped, Then detail offers **Connect**. Connected tags show a small live dot. |
| H‑06 | Given the install banner conditions (X‑01), Then a dismissible banner "Add Tagalong to your Home Screen" sits above the list; **Install** calls the deferred prompt; **Not now** hides it for 30 days. |
| H‑07 | Given demo mode on, Then a "Demo" chip appears on simulated cards and a header pill "Demo mode" links to Settings. |
| H‑08 | Given the same kid has two or more tags of the same thing type, Then a one‑time dismissible hint appears: "Two Bottle Buddies for the same kid? They may chat over each other." (E‑02). |
| H‑09 | Given the `+` button, When tapped, Then `/tags/new` opens as a full‑screen sheet; the tab bar hides. |

### 5.3 Add‑tag wizard (`/tags/new`, full‑screen sheet, stepper 1–6)

**Common:** Back returns one step preserving input; Close (X) asks "Discard this setup?" only after step 1 has connected a tag (disconnects it; no config written). The wizard is a single route with internal steps; browser Back behaves like the Back button. Step header shows "Step n of 6".

**Step 1 — Find your tag**

| ID | Given / When / Then |
|---|---|
| AT‑1.1 | Given Web Bluetooth and demo off, When **Search** is tapped, Then the chooser opens filtered to `services: [Tagalong]` **and** `manufacturerData: {companyIdentifier: 0xFFFF, dataPrefix: [1,0,0,1], mask: [0xFF,0,0,0x01]}` (pairing flag set), so only tags in their pairing window are listed. The screen shows "Looking for tags…" and **Cancel**. |
| AT‑1.2 | Given the parent selects a tag, Then the app connects, reads `Info`, validates `proto = 1`, and advances to step 2 within 3 s; the tag confirms with two white LED pulses. The tag's `deviceId` is held in wizard state; nothing is persisted yet. |
| AT‑1.3 | Given the phone shows a system pairing prompt (Just Works), When accepted, Then bonding completes and the wizard continues; When declined, Then inline text reads "Pairing was cancelled." with **Try again** (tag may need the button held again after 60 s). |
| AT‑1.4 | Given the chooser closes with no selection, Then the step shows "No tag selected" inline, no modal; **Search** remains primary. |
| AT‑1.5 | Given Bluetooth is off or the OS permission is denied, Then a sheet explains the exact OS steps (Android: Bluetooth on; Chrome "Nearby devices" permission) with **Retry**. |
| AT‑1.6 | Given Web Bluetooth is unavailable (iOS Safari, Firefox, desktop Safari), Then step 1 shows the illustrated tag greyed, copy "Pairing needs Chrome or Edge on Android. On iPhone, the Tagalong app is coming soon." and primary **Use demo tag**; nothing is hidden or broken. |
| AT‑1.7 | Given the selected tag is bonded to another phone (encrypted read fails / pairing rejected), Then copy reads "This tag is set up with another phone. To reset it: put it on the charger and hold the button for 10 seconds until the light blinks red." with **Try again**. |
| AT‑1.8 | Given the selected `deviceId` already exists in this app, Then the wizard closes and opens that tag's detail with toast "Bottle Buddy is already set up." |
| AT‑1.9 | Given the connection drops at any later step, Then a non‑blocking banner "Tag disconnected — hold its button again" appears; the parent may continue filling steps; step 6 reconnects before writing. |
| AT‑1.10 | Given demo mode on, Then **Search** shows an in‑app list with one "Demo tag" (no chooser). |

**Step 2 — Who's it for?**

| ID | Given / When / Then |
|---|---|
| AT‑2.1 | Given existing kids, Then their Avatars (initial or age‑band glyph) appear first; **New kid** is always last. Selecting an existing kid advances. |
| AT‑2.2 | Given **New kid**, Then the form shows: first name (optional; helper "Only shown on this phone. Never sent to the tag.") and three large age‑band cards: **Little** 2–4 · **Kid** 5–7 · **Big kid** 8–12, each with a one‑line description of the voice style. |
| AT‑2.3 | Given a name is typed, Then it is trimmed, max 24 chars, any script; it is never stored anywhere but this device's IndexedDB. |
| AT‑2.4 | Given no age band is selected, Then **Next** is disabled with the reason in the button's accessible description. |
| AT‑2.5 | (P2) Given the parent prefers, Then a "Help me choose" link accepts a birth year and highlights the band; the birth year is not stored (ADR‑006). |

**Step 3 — What's it attached to?**

| ID | Given / When / Then |
|---|---|
| AT‑3.1 | Then a 3‑column grid shows the 9 things in this order: bottle, lunchbox, backpack, toothbrush, shoes, plush, helmet, jacket, other; full‑pack things carry a "Full pack" micro‑label. |
| AT‑3.2 | When a thing is selected, Then only it shows a Face; the header tint changes to the thing tint; **Next** enables. |
| AT‑3.3 | Given a basic thing (shoes, plush, helmet, jacket, other), Then a footnote reads "Reacts to pickups, drops, shakes and taps." |

**Step 4 — Pick a personality**

| ID | Given / When / Then |
|---|---|
| AT‑4.1 | Then three cards (Silly, Sweet, Brave) each show one sample line for the chosen thing × band and a ▶ button; ▶ speaks it on the phone (X‑07) and shows the caption; the Face reacts. |
| AT‑4.2 | When a card is selected, Then the nickname field pre‑fills from X‑12 and remains editable (max 20 chars, no emoji stripping — any script allowed). |
| AT‑4.3 | Given the tag is connected and outside quiet hours, When ▶ is tapped, Then the app **also** sends `02 <eventType>` so the tag speaks the line; if the tag is disconnected the phone alone speaks. (Parent hears the real voice; the sample event is `pickup`.) |
| AT‑4.4 | When ▶ is tapped again on the same card, Then a different line from the same cell plays (no repeat within 3). |

**Step 5 — Sound**

| ID | Given / When / Then |
|---|---|
| AT‑5.1 | Then a volume slider 0–100 in steps of 5 (default 60) with labels "Silent (light only)" at 0 and "Max" at 100; releasing the thumb previews a short line on the tag when connected (phone otherwise). |
| AT‑5.2 | Then Quiet hours toggle default **on**, 20:00–07:00, with two time pickers in 10‑minute steps (protocol encoding), 12/24 h per device locale; ranges may cross midnight; helper "Silent between these times. A tap still lights up." |
| AT‑5.3 | Then **Gentle nudges** toggle default **off** with helper "Lets the tag speak up on its own — a good morning, or 'don't forget me' when it's been left still. Off by default." |
| AT‑5.4 | Given the parent sets start = end, Then the app treats quiet hours as disabled and says so. |

**Step 6 — Sending to tag…**

| ID | Given / When / Then |
|---|---|
| AT‑6.1 | When step 6 opens, Then the app (re)connects if needed, writes `TagConfig` (version 1, band, thing, personality, volume, quiet, language 0, flags: nudges, eventBuffer=1, nameClipPresent=0, led=1; maxPerHour 12; timeOfDayMin) then reads it back and compares; progress shows three labelled stages: Connecting · Sending · Checking. |
| AT‑6.2 | Given the read‑back matches, Then the tag speaks one configured line (outside quiet hours) and the app shows confetti (skipped under reduced motion), "Bottle Buddy is ready!", three example lines with ▶, and **Done**; Tag, Kid (if new) and a synthetic first event are persisted **only now**. |
| AT‑6.3 | Given the write is rejected (0x80) or the read‑back differs, Then retry once automatically, then show "Couldn't reach the tag. Hold its button and try again." with **Retry** and **Save for later** (saves the tag as "Not sent yet"; Home card shows a **Finish setup** button). |
| AT‑6.4 | Given demo mode, Then stages animate for ≈ 1.2 s and the phone speaks the first line. |
| AT‑6.5 | When **Done** is tapped, Then Home opens with the new card at the top and a success haptic. |

### 5.4 Tag detail (`/tags/:id`)

| ID | Given / When / Then |
|---|---|
| TD‑01 | Then the hero shows the thing‑tinted gradient, ThingIcon 120 with Face, nickname (tap to rename inline), "Kid · Age band", connection state, and **Connect** when disconnected. |
| TD‑02 | **Personality** section: row with personality chip → Sheet with the three cards (as AT‑4); **Attached to** row → thing grid (E‑03 flow); **For** row → kid picker. Changing any writes config immediately when connected, else queues "Not sent yet" and shows a pending chip. **Says things like…** shows 3 lines with ▶ (phone + tag when connected, outside quiet hours) and a shuffle button. |
| TD‑03 | **Sound** section: volume slider (as AT‑5.1), quiet hours row (as AT‑5.2), nudges toggle, **Mute for an hour** (sends `03 3C 00`; becomes **Unmute** with remaining time; `03 00 00` on unmute). Mute state reflects `Info.flags.muted` when connected. |
| TD‑04 | Given quiet hours are active now, When ▶ or **Identify** is tapped, Then a confirm sheet "It's quiet hours — play anyway?" precedes the control op (control ops bypass quiet hours on the tag, TAG‑QH‑04). |
| TD‑05 | **Today** section: mini timeline grouped by day (Today, Yesterday, weekdays) of the last 7 days, kid words + time, drop shows impact chip ("a big one" ≥ 6 g / "a little one"); **Clear** wipes this tag's events after confirm. Empty state: "Nothing yet — Bottle Buddy will remember what happens when it's near your phone." |
| TD‑06 | **Tag** section: battery (percent, last read time), firmware `x.y.z`, content pack `name vX`, **Identify** (`01`), **Update** (opens firmware DFU flow when a newer signed image is bundled with the app; else "Up to date"). Hardware revision in a footnote. |
| TD‑07 | **Forget this tag** (destructive): confirm Sheet with the consequences (§4.6); on confirm: send `05 A5` if connected (or show the 10‑s reset instruction), delete tag + its events, keep the kid, return Home with toast "Bottle Buddy forgotten." |
| TD‑08 | Given the tag is "Not sent yet", Then a banner at the top offers **Send settings now**. |

### 5.5 Kids (`/kids`, `/kids/new`, `/kids/:id`)

| ID | Given / When / Then |
|---|---|
| K‑01 | List shows Avatar (initial or band glyph), name or band label, band, "N tags". Empty state: "Add a kid when you add a tag" with **Add a tag**. |
| K‑02 | `/kids/new` reuses the AT‑2.2 form; saving returns to the list. |
| K‑03 | Detail: name (inline edit), age band (segmented; changing re‑sends config to all this kid's tags with a note "Updates N tags"), tags list (tap → detail). |
| K‑04 | **Name clip**: **Record** (≤ 1.5 s, auto‑stops; mic permission requested inside the tap; red recording indicator; the raw stream is closed immediately after; stored as 16 kHz mono PCM WAV in IndexedDB), ▶ play, **Delete**. Explainer: "Stored only on this phone and, after the 1.1 update, on your tags. Never anywhere else." In v1.0 the clip is not transferred to the tag (§13, A‑02). |
| K‑05 | **Delete kid** (destructive): if the kid has tags, the sheet requires choosing **Move tags to…** (another kid) or **Forget their tags too**; deleting removes name, band and clip blob. |

### 5.6 Settings (`/settings`, `/settings/about`)

| ID | Given / When / Then |
|---|---|
| S‑01 | **App** group: Appearance segmented (System/Light/Dark, applies instantly), Haptics toggle, **Install app** row (visible only when installable) or "Installed ✓". |
| S‑02 | **Privacy** row → `/settings/privacy`. |
| S‑03 | **Demo mode** toggle: turning on shows a one‑line explainer and adds a simulated tag if none exists; turning off removes simulated tags and their events after confirm. |
| S‑04 | **About**: version + build hash, "Open source licences" (bundled text), "Welcome tour", "Privacy notice" (bundled, plain language), hardware safety information. No external links in v1.0 except a copy‑to‑clipboard support email. |
| S‑05 | **Delete everything** (destructive, at the bottom): typed confirmation "DELETE" → `store.wipeAll()` clears IndexedDB, blobs, settings, unregisters nothing remote (none exists) → returns to Welcome. Tags are **not** reset remotely (they are no longer known); the sheet says how to reset each tag by hand. |

### 5.7 Privacy Center (`/settings/privacy`)

| ID | Given / When / Then |
|---|---|
| PC‑01 | Card "What Tagalong knows" is a live inventory: N kids (names: yes/no), N tags, N events in the last 7 days, name clips: yes/no, storage size, "All stored on this phone." Updates instantly on changes. |
| PC‑02 | **Export my data** → JSON file `tagalong-export-YYYYMMDD.json` (schema‑versioned; clips base64) via download/share sheet; nothing leaves the device except through the OS share the parent chooses. |
| PC‑03 | **Clear activity** → deletes all events after confirm. |
| PC‑04 | **Delete everything** → same as S‑05. |
| PC‑05 | Footer: "No servers. No accounts. No analytics. We literally can't see your data." plus the durability note (X‑03) and the OS‑voice note (X‑07) when applicable. |
| PC‑06 | (P2 · v1.1) **Restore from export** — imports a JSON export on a new phone (schema‑validated; tags still need re‑pairing). |

### 5.8 Demo playground (`/demo`)

| ID | Given / When / Then |
|---|---|
| D‑01 | Top: three selectors — Age band (segmented), Thing (horizontal chip scroller), Personality (segmented). Changing any updates the hero and the log header immediately. |
| D‑02 | Hero: ThingIcon 120 with Face, tinted gradient; buttons appropriate to the thing: common **Pick up · Drop · Shake · Tap · Put down**, plus bottle **Fill · Sip · Empty**, lunchbox **Open · Close · Pack**, backpack **Zip · Left behind**, toothbrush **Start brushing · Done (2 min) · Short brush**. |
| D‑03 | When a button is tapped, Then the simulated transport emits an `EventFrame`, the phone speaks the picked line (caption shown), the Face reacts (surprised on drop, happy on pickup, sleepy on long still), and the event appears at the top of the in‑screen log with kid words. |
| D‑04 | Then the playground honours quiet hours/mute of the simulated tag only if the parent toggles "Simulate quiet hours" in a small footer; default off so demos always speak. |
| D‑05 | Then the screen is presentation‑grade: no dev labels; works offline; landscape tablet layout puts controls beside the hero. |
| D‑06 | Given demo mode is off, Then `/demo` still works (it never touches real tags) and offers **Add a real tag**. |

---

## 6. Tag functional requirements

### 6.1 Tag states

| State | Enter | Behaviour | Exit |
|---|---|---|---|
| **Ship** | Factory | Deep sleep; no advertising; no motion wake; ≈ 2 µA | Any button press or charger attach → giggle + white sweep → **Unpaired** |
| **Unpaired** | Ship exit or factory reset | No config; reacts to `tap` (giggle only, no words), `drop` (short "oof" sound effect), LED per table; no other speech; advertises only per ADR‑007 (pairing window on hold) | Bond + config write → **Paired** |
| **Paired‑active** | Config written | Full behaviour per §6.2–6.10 | — |
| **Quiet** | Time in quiet window | §6.4 | Window ends |
| **Muted** | Double‑tap / `03 N` | §6.5 | Timer / double‑tap / `03 0` |
| **Low** | Battery < 15 % | §6.6 | ≥ 18 % (hysteresis) |
| **Critical** | Battery < 5 % | Silent; status only | ≥ 8 % |
| **Charging / Charged** | VBUS present | §6.6 | Charger removed |
| **Time‑unknown** | Boot without time | §6.9 | `04` set time or config write |
| **Pairing window** | Hold 3 s | 60 s undirected advertising, giggle + white pulse | Bond or timeout |
| **DFU** | `06` from bonded app | Signed image only; blue slow blink; no speech | Reboot |

### 6.2 Events per thing

Detection thresholds are firmware defaults to tune at EVT; the **semantics, cooldowns, priorities and nudge classification are product requirements**. Priority 1 is highest. "Nudge" events are emitted and spoken only when `flags.nudges = 1`.

**Common events (all things unless suppressed in the per‑thing table)**

| Event | Detection (sensor) | Cooldown | Pri | Nudge | `aux` |
|---|---|---|---|---|---|
| `pickup` | Accelerometer: motion begins after ≥ 3 s still (Δ ≥ 0.3 g for 300 ms) | 60 s | 3 | no | – |
| `putdown` | Still ≥ 2 s with stable orientation after ≥ 10 s of motion; spoken on ~1 in 3 occurrences (randomised) to stay calm; always logged | 120 s | 5 | no | – |
| `drop` | Free‑fall ≥ 120 ms (|a| < 0.3 g) followed by impact ≥ 3 g | 20 s | **1** | no | impact g × 10 |
| `shake` | ≥ 3 sign reversals > 1.5 g within 1 s | 45 s | 3 | no | – |
| `tap` | Button single press (§6.8) | 5 s | 2 | no | – |
| `long_still` | No motion for T (bottle 90 min · backpack 120 min · basic things 120 min · toothbrush 14 h · lunchbox: not emitted), waking hours only, ≤ 3/day | 60 min | 6 | **yes** | – |
| `good_morning` | First `pickup` after ≥ 5 h still while time is known and 05:00–10:00; once/day | 24 h | 4 | **yes** | – |
| `low_battery` | Battery crosses below 15 %; once/day; spoken standalone or appended to the next reactive line within 2 h | 24 h | 4 | system | – |
| `charging` | Charger attached | per attach | 4 | system | – |

**Bottle (full pack)**

| Event | Detection | Cooldown | Pri | `aux` |
|---|---|---|---|---|
| `filled` | Capacitive level low → high, held 3 s while upright and still | 5 min | 2 | – |
| `sip` | Tilt ≥ 45° for 1–6 s, back upright within 10 s, level not "empty"; spoken on ~1 in 2 sips | 3 min | 4 | tilt degrees |
| `empty` | Level high → low, stable 30 s while upright | 10 min | 4 | – |

**Lunchbox (full pack; strap on lid handle or adhesive inside lid)**

| Event | Detection | Cooldown | Pri | Notes |
|---|---|---|---|---|
| `opened` | Lid rotation ≥ 60° then still ≥ 1 s (accel), or light step when inside‑mounted | 2 min | 2 | |
| `closed` | Reverse rotation to closed orientation, still ≥ 1 s | 2 min | 3 | |
| `packed` | `closed` followed by light → dark (in a bag) within 10 min, 05:00–11:00 when time known; once/day | 24 h | 3 | Not a nudge (reactive to packing) |
| Suppressed | `shake` not spoken; `long_still` not emitted | | | |

**Backpack (full pack; zipper‑loop mount)**

| Event | Detection | Cooldown | Pri | Nudge |
|---|---|---|---|---|
| `zipped` | High‑frequency ripple (20–60 Hz) 0.3–2 s at the zipper pull | 60 s | 3 | no |
| `left_behind` | Bag moved this morning, then still ≥ 15 min during 07:00–09:00 (time known); once/day | 24 h | 5 | **yes** |
| Suppressed | `shake`, `putdown` not spoken (bags move constantly) | | | |

**Toothbrush (full pack; handle strap)**

| Event | Detection | Cooldown | Pri | `aux` |
|---|---|---|---|---|
| `brush_start` | Oscillation 2–6 Hz, ≥ 1.2 g p‑p, sustained 5 s | 10 min | 2 | – |
| `brush_done` | Cumulative brushing ≥ 120 s within 4 min of start | per session | **1** | seconds ÷ 2 |
| `brush_short` | Brushing stops ≥ 20 s with 15 s ≤ cumulative < 120 s; **encouraging only** ("Round two? The back teeth are waiting!") | per session | 3 | seconds ÷ 2 |
| Suppressed | `pickup`, `putdown`, `shake` not spoken | | | |

**Basic things (shoes, plush, helmet, jacket, other)** — common events only, `generic` pack; helmet and shoes suppress `putdown` speech; plush keeps all.

**TAG‑EV‑01** Every spoken event has ≥ 4 lines per band × personality (ADR‑006); lines pass `docs/content/content-guidelines.md`.
**TAG‑EV‑02** Every emitted event is written to the 64‑frame buffer whether or not it was spoken (except suppressed/nudge‑off events, which are neither spoken nor emitted).
**TAG‑EV‑03** Sensor thresholds must survive the mount: bottle strap, zipper loop and handle strap orientations are all tested at EVT.

### 6.3 Utterance policy

| ID | Rule |
|---|---|
| TAG‑UT‑01 | Sliding‑window rate limit `maxPerHour` (default 12, firmware hard cap 30). When exhausted, reactive events get an LED flash only. `drop` and `tap` bypass the hourly limit but keep their cooldowns; `tap` is additionally capped at 20/hour. |
| TAG‑UT‑02 | Minimum gap between utterances 6 s. The tag never talks over itself: no interruption; a single pending slot holds the highest‑priority event for ≤ 3 s, then it is dropped (still logged). |
| TAG‑UT‑03 | Pre‑speech delay: `drop` ≤ 300 ms after impact (the moment must feel instant); all other events 0–800 ms randomised (feels natural; de‑synchronises two tags, E‑02). |
| TAG‑UT‑04 | Line selection avoids the last 3 lines of the same cell (mirrors `pickPhrase`). |
| TAG‑UT‑05 | Volume 0–100 maps to a firmware curve capped at **≤ 75 dB(A) @ 25 cm** at 100; 0 = light only. |
| TAG‑UT‑06 | Every utterance is accompanied by an LED flash (A11Y‑10). |

### 6.4 Quiet hours

| ID | Rule |
|---|---|
| TAG‑QH‑01 | Window `[quietStart, quietEnd)` in 10‑min units; may cross midnight; `255` disables; start = end disables. |
| TAG‑QH‑02 | During quiet hours: no audio for any sensor event; nudge events are not emitted; reactive events are still logged. |
| TAG‑QH‑03 | Button during quiet hours: tap → soft white breathe 1 s, no audio; double‑tap mute/unmute works with LED confirmation; hold 3 s opens the pairing window with LED only (no giggle). Charger attach → LED only. LED brightness 30 % of daytime. |
| TAG‑QH‑04 | Control ops from the bonded app (`01` identify, `02` preview) **bypass** quiet hours — the parent asked explicitly (app confirms first, TD‑04). |
| TAG‑QH‑05 | If time is unknown, quiet hours cannot be evaluated → §6.9 policy applies. |

### 6.5 Mute

| ID | Rule |
|---|---|
| TAG‑MU‑01 | Sources: double‑tap on the tag (toggle 60 min), `03 <minutes>` from the app (0 = unmute). Latest command wins. |
| TAG‑MU‑02 | Muted: no audio at all (including `tap`, `charging`, `low_battery`); one amber blink on tap; events still logged. |
| TAG‑MU‑03 | Mute and quiet hours are independent; mute expires on its timer; a reboot clears mute. |
| TAG‑MU‑04 | Mute state is exposed in `Info.flags bit1`; the app reads it on connect (no mute‑change event exists in protocol v1 — see §13). |

### 6.6 Battery states (ADR‑005)

| State | Threshold | Tag behaviour | App |
|---|---|---|---|
| Normal | ≥ 15 % | — | Pill with % |
| Low | < 15 % (exit ≥ 18 %) | `low_battery` once/day; amber blink accompanies any LED response | Amber pill, "Charge soon" |
| Critical | < 5 % (exit ≥ 8 %) | Silent; two red blinks on tap; advertising per ADR‑007 continues so status can be read; sensors keep logging | Red pill, "Needs a charge" |
| Charging | VBUS | `charging` line once (not in quiet/mute); amber breathe at low brightness; sensor events suppressed except `tap`; BLE available | Bolt on pill |
| Charged | ≥ 95 % and taper | Dim green solid while on charger (off during quiet hours); tap shows state 3 s | "Charged" |
| Temperature hold | Outside 0–45 °C while charging | Charging paused; amber double‑blink every 5 s; speech unaffected | — |
| Dead | Brown‑out | Off; boots into **Time‑unknown** when charged | Home hint (TAG‑TIME‑03) |

**TAG‑BAT‑07** Battery % is reported via `Battery` characteristic, `Info` and advertising; the app smooths readings and never shows a value jumping by > 5 points within a minute unless charging. **TAG‑BAT‑08** Target ≥ 30 days at 30 utterances/day; ≥ 45 days at 10/day.

### 6.7 LED states (single diffused RGB ring; never > 3 Hz; off by default)

| State | Pattern | Duration |
|---|---|---|
| Ship‑mode wake | White sweep around the ring | 1.5 s |
| Utterance | White flash synced to speech onset | ≤ 1 s |
| Pairing window | White slow pulse (0.5 Hz) | 60 s or until bonded |
| Connected/identify (`01`) | White pulse ×3 | 3 s |
| Mute on / off | Amber ×3 slow / green ×1 | 2 s / 0.5 s |
| Tap while muted | Amber ×1 | 0.3 s |
| Quiet‑hours tap | White breathe at 30 % | 1 s |
| Low battery accent | Amber tint on any response | — |
| Critical tap | Red ×2 | 0.6 s |
| Charging | Amber breathe (0.25 Hz), low brightness | while charging |
| Charged | Dim green solid (off in quiet hours) | while on charger |
| Charge temperature hold | Amber double‑blink every 5 s | while held |
| Rate‑limited event | White flash only | 0.3 s |
| Bond rejected (foreign phone) | Red ×2 | 0.6 s |
| Factory reset countdown / done | Red breathe accelerating from 7 s → red ×3 | 3 s / 1 s |
| DFU | Blue slow blink | until reboot |
| Fault (sensor/flash) | Red slow blink on tap only | — |
| Time‑unknown tap | White double‑blink before the line | 0.4 s |

### 6.8 Button gestures (one soft button, 20 ms debounce, ≥ 100k cycles)

| ID | Gesture | Result |
|---|---|---|
| TAG‑BTN‑01 | Single tap (≤ 400 ms) | `tap` event: "say hi" line (giggle only when unpaired) |
| TAG‑BTN‑02 | Double tap (2 presses within 500 ms) | Toggle mute 60 min; LED confirms |
| TAG‑BTN‑03 | Hold 3 s | Pairing window 60 s (giggle + white pulse). If already bonded: connectable window for the bonded phone only; a foreign bond attempt is rejected (red ×2) |
| TAG‑BTN‑04 | Hold 10 s **while on the charger** | Factory reset: clears bond + config, keeps content; LED countdown; short goodbye sound (not in quiet hours); enters Unpaired. The charger requirement is the parent gate |
| TAG‑BTN‑05 | Hold 10 s off the charger | No reset; pairing pulse continues (kid‑proof) |
| TAG‑BTN‑06 | Any press in Ship mode | Wake (§6.1) |
| TAG‑BTN‑07 | Triple tap and longer holds | Reserved; no effect |

### 6.9 Time handling (no RTC)

| ID | Rule |
|---|---|
| TAG‑TIME‑01 | Time of day comes from `TagConfig.timeOfDayMin` and `04 <minutes>`; the app sends `04` on every connect. Tag keeps time from its low‑frequency crystal (≤ ±3 s/day drift). |
| TAG‑TIME‑02 | Date is not needed: all time‑based rules are time‑of‑day only; "once/day" resets at the tag's local midnight. |
| TAG‑TIME‑03 | After a boot without time (battery dead): **Time‑unknown** — reactive events speak normally, nudges and `good_morning` are suppressed, quiet hours cannot apply, the tap LED double‑blinks (A11Y‑ and parent cue). The app detects the reboot (uptime decreased) and shows a Home hint. |

### 6.10 Event buffer and sync

| ID | Rule |
|---|---|
| TAG‑BUF‑01 | 64‑frame ring buffer; oldest dropped when full; replayed oldest‑first on `Event` subscribe; cleared once notifications are acknowledged by the link layer. |
| TAG‑BUF‑02 | App timestamps: `at = now − (Info.uptimeMin·60 − frame.uptimeSec)·1000`; frames from before a reboot (uptime went backwards) are stamped at the previous `lastSyncAt` and flagged approximate ("earlier"). |
| TAG‑BUF‑03 | App dedupes on `(deviceId, uptimeSec, eventType)`. Malformed frames (zod) are dropped silently and counted in dev only. |

### 6.11 Pairing and security (ADR‑007, protocol)

| ID | Rule |
|---|---|
| TAG‑PAIR‑01 | Undirected connectable advertising only in the 60‑s pairing window (100 ms interval); otherwise low‑duty (1.28 s) advertising for 30 min after motion from an RPA rotated every 15 min. |
| TAG‑PAIR‑02 | LE Secure Connections, Just Works; `Config`, `Control` and `PackXfer` require encryption; exactly one bond; a second bond attempt is rejected. |
| TAG‑PAIR‑03 | Advertising carries no name string beyond "Tagalong", no serial, no location; manufacturer data = `[proto, hwRev, battery, flags]`. |
| TAG‑PAIR‑04 | Config write validation: version = 1, XOR checksum, enum ranges; otherwise 0x80. Unknown event codes from newer firmware are ignored by the app, not fatal. |
| TAG‑PAIR‑05 | Factory reset (`05 A5` or TAG‑BTN‑04) clears bond, config, mute, time and buffer; keeps content packs. |
| TAG‑PAIR‑06 | DFU accepts signed images only; the app bundles the current signed image (same‑origin asset — see §13 A‑06). |

### 6.12 Name clip

| ID | Rule |
|---|---|
| TAG‑NC‑01 | v1.0: recorded and stored on the phone only (K‑04). `flags.nameClipPresent = 0`. Lines containing `{{name}}` are recorded in two versions: with the band fallback vocative baked in (little "friend", kid "amigo", big "legend") and with a splice gap. v1.0 tags play the fallback version. |
| TAG‑NC‑02 | v1.1: clip (16 kHz IMA ADPCM, ≤ 1.5 s) transferred over `PackXfer`, stored in the reserved region, spliced at `{{name}}`; `flags.nameClipPresent = 1`; deletable from the app (zeroes the region). |

### 6.13 Audio and content constraints

- Pre‑rendered IMA ADPCM 16 kHz mono (ADR‑003); every line ≤ 4 s (`little` ≤ 2.5 s); loudness‑normalised to −16 LUFS before the volume curve; 30 ms fade‑in/out to avoid clicks.
- Sound effects (giggle, "oof", sleepy yawn) are shared across bands; words are per cell.
- Unpaired tags speak **no words** (age unknown) — sound effects only.
- Content pack index carries pack id/version for `Info`; a tag with a pack older than the app's catalogue shows "Update available" once PackXfer ships (v1.1).

---

## 7. Edge cases

| ID | Scenario | Expected behaviour |
|---|---|---|
| E‑01 | **Multiple kids** | Kids are first‑class (`/kids`); each tag belongs to one kid; a kid may have many tags; changing a kid's band re‑sends config to all their tags (K‑03); deleting a kid forces reassign‑or‑forget (K‑05); Home cards show the kid on line 2; soft limit 6 kids. |
| E‑02 | **Two tags on one bottle** (or two bottles in one bag) | Both react; randomised 0–800 ms pre‑speech delay avoids perfect unison (TAG‑UT‑03); Home shows a one‑time hint when a kid has two tags of the same thing (H‑08). v1.2 "tag talk" turns this into a feature. |
| E‑03 | **Tag moved to a new object** | Tag detail → **Attached to** → pick thing → config re‑written; thing‑specific state machines reset on the tag; nickname re‑suggested (parent confirms); past events keep their original labels; mounts swap (packaging doc). |
| E‑04 | **Phone lost / replaced** | No cloud, so the new phone starts empty. Tags stay bonded to the lost phone → parent factory‑resets each tag (charger + 10 s) and re‑pairs; kids are re‑created. Data on the lost phone is protected by the phone's lock/encryption and the OS remote‑wipe; the privacy card says so. v1.1 adds **Restore from export** (PC‑06) to bring kids and clips across. |
| E‑05 | **Bluetooth denied / off / cancelled** | AT‑1.4/1.5 flows: inline message, OS steps, Retry; never a dead end; **Use demo tag** always available. |
| E‑06 | **iOS Safari** | No Web Bluetooth: AT‑1.6 explainer + full demo + "iPhone app coming soon"; PWA installs via Add to Home Screen; when not installed, warn about Safari's 7‑day storage eviction (X‑03); speech only from a tap (X‑07). |
| E‑07 | **Tag out of range / config not sent** | Tag saved as "Not sent yet"; Home card offers **Finish setup**; detail banner **Send settings now** (TD‑08). |
| E‑08 | **Quiet hours cross midnight; device timezone changes** | Encoding supports wrap (TAG‑QH‑01); app sends fresh time on every connect; a timezone change is just a new `04`. |
| E‑09 | **Tag battery died** | Time‑unknown policy (TAG‑TIME‑03); app hint; resolved on next connect. |
| E‑10 | **Browser site data cleared** | App behaves as first launch; tags stay bonded to the phone's BT stack — Welcome adds "Set up before? Your tags need a quick reset: charger + 10 s." |
| E‑11 | **Second phone tries to pair** | Rejected; red ×2 on the tag; AT‑1.7 copy on the second phone. |
| E‑12 | **Firmware newer than app** | Unknown event codes ignored; `proto ≠ 1` → "Update the app to use this tag" (the PWA auto‑updates). |
| E‑13 | **Kid mashes the button** | `tap` cooldown 5 s and 20/hour cap; LED still responds; nothing breaks. |
| E‑14 | **Tag in a dishwasher / hot car** | IP67 protects splashes and submersion to 1 m, not 70 °C wash cycles — packaging and About copy say "hand‑wash the bottle with the tag on; no dishwasher". Charging pauses outside 0–45 °C. |
| E‑15 | **Kid too young/old for band** | Parent can change the band any time (K‑03); band suggestion (AT‑2.5) is advisory. |
| E‑16 | **Demo tag and real tags together** | Simulated tags carry `simulated: true`, show a Demo chip, and are removed when demo mode is turned off (S‑03); they never appear in the Privacy Center inventory as real data (counted separately as "demo"). |
| E‑17 | **Large text / small phone** | Layouts reflow at 200 % text (A11Y‑03); wizard steps scroll; CTAs stay above the keyboard. |
| E‑18 | **Speech synthesis missing or network‑only voices** | X‑07 fallbacks; Privacy Center note. |
| E‑19 | **App backgrounded mid‑write** | Write is atomic on the tag (checksum); on resume the app re‑reads config and reconciles; "Not sent yet" if mismatch. |
| E‑20 | **Return/refurbish** | Forget → factory reset keeps content; mounts are replaceable; battery sealed (no user service). |

---

## 8. Non‑functional requirements

| Area | Requirement |
|---|---|
| Privacy | ADR‑002 in full; zero network at runtime (X‑02); no personal data in logs (X‑10); export/delete in one tap (PC‑02/04); the tag never stores a name string or location. |
| Security | LESC bonding, encrypted characteristics, checksums, signed DFU (§6.11); strict CSP; no `eval`; dependencies pinned with lockfile and licence check; zod at every boundary. Data at rest relies on the phone's OS encryption (documented in About). |
| Reliability | Config write success ≥ 99 % within 2 attempts at ≤ 2 m; no data loss on app crash (IndexedDB transactions); events never duplicated (TAG‑BUF‑03). |
| Performance | X‑09 budgets; tag responds to `drop` within 300 ms; pairing window discoverable within 1 s of the button hold completing. |
| Safety (hardware, from brief) | ASTM F963/EN 71 incl. acoustics; ≤ 75 dB(A) @ 25 cm; no small parts (see packaging doc); no coin cell; sealed battery with protection; IP67; 1.5 m × 100 drops. |
| Durability | Button 100k cycles; strap loop 5 kg pull; silicone colour‑fast to UV and dishwater splashes. |
| Compatibility | Android 10+ Chrome/Edge stable (last 2 versions); iOS 16+ Safari for the demo/PWA; Chrome desktop for demos. |
| Content | Every line passes content guidelines; ≥ 4 lines per cell; reviewed by a child‑development advisor before recording. |

---

## 9. Accessibility requirements (WCAG 2.2 AA; app and tag)

| ID | Requirement |
|---|---|
| A11Y‑01 | All interactive elements ≥ 44 × 44 CSS px with ≥ 8 px spacing; visible focus ring (2 px accent, 2 px offset) on every focusable element. |
| A11Y‑02 | Full keyboard operation: tab order follows visual order; Sheets trap focus and close on Escape; the wizard stepper announces "Step n of 6". |
| A11Y‑03 | Text scales to 200 % (rem‑based) without clipping or horizontal scroll; layouts reflow at 320 px width. |
| A11Y‑04 | Contrast ≥ 4.5:1 for text, ≥ 3:1 for UI glyphs and tint backgrounds (design spec); never colour alone: BatteryPill has text, connection state has a label, thing selection shows the Face plus a check. |
| A11Y‑05 | `prefers-reduced-motion`: crossfades only, no confetti, no bounce, Face still blinks (it is content, not motion decoration) at ≤ 1 blink/4 s. |
| A11Y‑06 | Screen readers: every ThingIcon has an `aria-label` ("Bottle Buddy, water bottle, silly, 82 % battery, last event took a tumble 2 minutes ago"); Face is `aria-hidden`; sliders expose value text ("Volume 60 percent"); toasts use `role="status"`. |
| A11Y‑07 | Every spoken preview is captioned on screen; the demo log is a text transcript. |
| A11Y‑08 | Haptics are optional and never the sole feedback. |
| A11Y‑09 | Forms: labels always visible, errors inline and announced, names optional, no time limits except the tag's 60‑s pairing window (with a clear "hold the button again" recovery). |
| A11Y‑10 | Tag: every utterance has a synchronous LED flash so deaf/hard‑of‑hearing kids get feedback; LED patterns never exceed 3 Hz; volume 0 = light‑only mode for sound‑sensitive kids; button has a tactile centre dimple; the strap loop is usable one‑handed. |
| A11Y‑11 | Language attribute set per UI locale; plain language at a Grade 6 reading level for all parent copy. |
| A11Y‑12 | Audited with axe + manual TalkBack (Android) and VoiceOver (iOS PWA) before each release; Lighthouse a11y ≥ 95. |

---

## 10. Localisation plan

| Phase | UI languages | Tag voice packs | Notes |
|---|---|---|---|
| v1.0 (launch) | English (single `en`, neutral spelling; avoid words that differ across US/UK/AU/CA/IN where possible) | `en` — one neutral‑accent voice per personality (3 voices), all bands | Tags factory‑loaded with `en`; language field = 0 |
| v1.1 | Spanish (`es`, Latin‑American neutral), Hindi (`hi`) | `es`, `hi` packs; 3 voices each | Delivered over `PackXfer`; one language per tag (ADR‑003); Settings gains a **Language** row (§13) |
| v1.2 | Regional English review (en‑GB/en‑AU/en‑IN word list) | Optional regional English voices if demand shows | Based on reviews/research, not telemetry |

**L10N‑01** All UI strings are externalised with ICU MessageFormat; no string concatenation; plurals/genders handled by ICU. **L10N‑02** Dates, times, numbers via `Intl` (12/24 h from the device). **L10N‑03** Pseudo‑localisation (+30 % length, accented) runs in CI; layouts must not clip. **L10N‑04** Content is **transcreated**, not translated: jokes are rewritten per language by a native writer, then reviewed by a child‑development reviewer against the content guidelines. **L10N‑05** Scripts are the asset (ADR‑006): the phrase catalogue is language‑keyed; the same matrix is recorded per language. **L10N‑06** UI language follows `navigator.language` with an in‑app override (v1.1). **L10N‑07** System fonts only; Devanagari renders with the platform stack. **L10N‑08** Pack size budget per language ≤ 6.5 MB so two languages fit alongside the reserved regions in 16 MB (enables a future dual‑language tag without hardware change). **L10N‑09** Region compliance (labels, warnings) is handled in packaging per market; the app shows the same privacy notice everywhere, plus a GDPR‑K/COPPA paragraph.

---

## 11. Success metrics and how we measure without telemetry

| Metric (brief §7) | Method | Cadence |
|---|---|---|
| Setup ≤ 90 s, ≥ 90 % | Moderated usability sessions (n ≥ 12 per round), stopwatch, unaided | Rounds at app RC, DVT, PVT |
| Kid laughed in first minute ≥ 80 % | In‑home first‑use sessions, observer coding | DVT (30 families) |
| Return rate < 3 %, battery complaints < 1 % | Retail/DTC returns data and support tickets (business data, not app data) | Weekly post‑launch |
| 4.7★, NPS ≥ 60 | Store reviews; opt‑in email survey to DTC buyers (business email list only) | Monthly |
| Zero network requests | Automated CI test + third‑party privacy audit of the shipped build | Every release |

---

## 12. Launch checklist (gate G3 unless noted)

| Area | Item | Owner role | Gate |
|---|---|---|---|
| Product | PRD signed off; all P0 requirements verified by QA against this document | PM | G1 |
| App | `pnpm lint/typecheck/test/build` green; Lighthouse PWA ≥ 90, a11y ≥ 95; bundle < 250 KB gz | Eng | Each release |
| App | Zero‑network CI test; CSP verified in production headers; third‑party privacy audit report | Eng/Privacy | G3 |
| App | Manual TalkBack + VoiceOver pass; reduced‑motion pass; 200 % text pass | Design/QA | G3 |
| App | Pairing verified on ≥ 6 Android devices (Samsung, Pixel, OnePlus, Xiaomi; Android 10–16), Chrome and Edge | QA | G2 |
| App | Demo playground reviewed by marketing as the sales demo | Marketing | G2 |
| App | Firmware DFU flow tested with a real signed image; downgrade prevented | Eng/FW | G3 |
| Firmware | All §6 behaviours verified on DVT units; power budget ≥ 30 days measured; 75 dB(A) cap measured by the acoustics lab | FW/EE | G2 |
| Hardware | EVT/DVT/PVT exit reports; IP67; 100 × 1.5 m drops; button 100k; strap pull; battery cycle ≥ 300 to 80 % | EE/ME | G2/G3 |
| Compliance | FCC/IC grant, CE‑RED + Toy Safety Directive DoC, UKCA DoC, Bluetooth SIG Declaration ID, ASTM F963 + CPSIA CPC, EN 71‑1/2/3, IEC 62133‑2 + UN38.3 for the cell, RoHS/REACH, Prop 65 review | Compliance | G3 |
| Content | EN matrix complete (≥ 4 lines/cell), recorded, mastered, packed; guideline review sign‑off; two versions for `{{name}}` lines | Content | G2 |
| Privacy/Legal | Privacy notice (plain language + legal), COPPA/GDPR‑K/AADC review memo, terms of sale, warranty (1 year), battery shipping paperwork | Legal | G3 |
| Packaging | Final artwork with regulatory marks; drop/ISTA‑3A test; quick‑start and privacy cards proofed | Design/Ops | G3 |
| GTM | DTC store live with demo link; Amazon listing (A+ content, video of the first‑laugh moment); press kit; review units to 20 family creators | Marketing | G3 |
| Support | Help centre articles: pairing, iPhone status, reset, battery, cleaning; support email SLA 24 h; RMA flow | Support | G3 |
| Ops | 10k unit MP PO; safety stock of straps/chargers; serialised QC records; RMA tag reflashing procedure | Ops | G3 |

---

## 13. Assumptions and decisions made in this PRD (follow‑ups noted)

| # | Decision / assumption | Rationale | Follow‑up |
|---|---|---|---|
| A‑01 | `tap` event = the **button** single press ("say hi"), not an accelerometer tap. | Brief §5.1 defines tap as the button gesture; avoids false positives on hard surfaces. | Protocol note in `events.ts` docs |
| A‑02 | **Name clip:** recorded/stored/played on the phone in v1.0 (design spec §3.5, domain model); transferred to the tag in v1.1 with `PackXfer` (brief §8, ADR‑003). v1.0 tags play the fallback vocative. | Protocol v1 has no clip transfer path; UI is honest about it. | Design spec K‑04 copy; founder may prefer hiding the recorder until 1.1 (open question) |
| A‑03 | **Factory reset gesture:** hold 10 s **on the charger**. | Needed for lost‑phone recovery (E‑04, ADR‑007 one bond); charger acts as a parent gate against kid resets. | Add to brief §5.1 UI line and firmware spec |
| A‑04 | Tag detail gains **Attached to** and **For** rows. | Needed for E‑03 and E‑01; design spec lists sections but not these rows. | Design spec §3.4 |
| A‑05 | Settings gains a **Language** row at v1.1; Privacy Center gains **Restore from export** at v1.1. | L10N‑06; E‑04. | Design spec §3.6/§3.7 (v1.1) |
| A‑06 | **Firmware DFU in the v1.0 app** (`06`), image bundled with the PWA. With `connect-src 'none'`, page `fetch()` of a same‑origin `.bin` is blocked; ship the image as a lazily imported base64 module or relax to `connect-src 'self'`. | Only field‑fix path for firmware bugs; no network is added either way. | Architecture doc CSP line; ADR if `connect-src` changes |
| A‑07 | Chooser filter uses manufacturer‑data mask on the pairing flag. | Lists only tags in their pairing window; prevents pairing a neighbour's tag. | `webBluetooth.ts` |
| A‑08 | Nudges = `long_still`, `good_morning`, `left_behind`; off ⇒ neither spoken nor emitted. `packed` is reactive, not a nudge. | Calm by default; less data. | Content/firmware |
| A‑09 | Control ops (`01`, `02`) bypass quiet hours; the app confirms first. | Parent‑initiated; identification at night is legitimate. | Firmware |
| A‑10 | Default volume 60; rate limit fixed at 12/h with no UI in v1.0. | Design spec Sound step has no chatty‑level control. | Consider "Chattiness" in v1.1 |
| A‑11 | Unpaired tags make sound effects only (no words). | Age band unknown; avoids mismatched vocabulary. | Content |
| A‑12 | Protocol lacks a mute‑change event; the app learns mute state from `Info` on connect. | Acceptable for v1. | Consider `aux` flag or event code in protocol v1.1 |
| A‑13 | `left_behind` fires only in the 07:00–09:00 leave‑home window, once/day. | Avoids classroom disruption; matches the "left the bag" moment. | Firmware |
| A‑14 | App Store listing category is a business decision (Kids vs Lifestyle); the app complies with Kids Category rules regardless. | ADR‑001 speaks to compliance, not the category. | Open question |
| A‑15 | Lunchbox detection works from an outside lid‑handle strap (accelerometer) so no adhesive is required in the box. | Small‑parts and cleaning concerns. | EVT validation |

## 14. Open questions (for the founder)

1. **Age grading 2+ vs 3+.** With `little` = 2–4, the whole product incl. straps must pass the under‑3 small‑parts test. If flexible straps cannot pass, the product becomes 3+ and `little` marketing copy shifts to 3–4 (band unchanged). See packaging doc §8.
2. **App Store category** at v1.1: Kids (discoverability, strictest review) or Lifestyle (parent tool). Recommendation: Lifestyle, age rating 4+.
3. **Ship the name‑clip recorder in 1.0** with the honest "used after the 1.1 update" note, or hide it until 1.1? Recommendation: hide until 1.1 unless the demo benefits.
4. **Launch the PWA publicly before hardware ships** (with Demo mode as the pre‑order experience)? Recommendation: yes, at pre‑order open.
5. **India in v1.1** requires WPC ETA approval and BIS considerations (roadmap); confirm priority versus UK/AU/CA.
