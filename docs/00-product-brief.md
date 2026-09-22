# Tagalong — Product Brief (North Star)

> **Give anything a voice.**
> Tagalong is a small, waterproof talking tag. Strap it to a kid's water bottle, lunchbox, backpack or toothbrush and the object comes alive: it giggles when it's filled, says "ouch" when it's dropped, and thanks the kid who picks it up. It adapts to what it's attached to and how old the kid is. Parents set it up in under a minute. Nothing ever leaves the phone.

Working name: **Tagalong** (trademark search pending; alternates: *Blip*, *Pipsy*, *Chatterbug*).
Status: pre-launch, v1 definition. Owner: founder. This document is the single source of truth; every other doc must agree with it.

---

## 1. Why this exists

Kids lose bottles, forget backpacks, skip brushing and don't drink enough water. Nagging doesn't work; **play does**. A thing that talks back turns chores into a relationship. Parents want that magic without a camera, a microphone, an account, or a cloud watching their child.

**Insight:** the object is the character. The tag disappears; the bottle becomes "Bottle Buddy".

## 2. Who it's for

| Persona | Need | What wins them |
|---|---|---|
| **Parent of a 2–4 year old** | Gentle routines, no screens | Sweet voice, simple words, sound effects, safe & waterproof |
| **Parent of a 5–7 year old** | Independence at school, fewer lost items | Jokes, "amigo" energy, backpack/lunchbox reminders |
| **Parent of an 8–12 year old** | Habits without nagging | Witty, not babyish; kid picks the personality |
| **Gift buyers (grandparents, aunts)** | Delightful, easy gift | Beautiful box, 60‑second setup, no account |

Primary market: US/UK/AU/CA/IN English first; Spanish + Hindi packs at launch+1.

## 3. Product principles (non‑negotiable)

1. **Delight in one second.** First reaction must be a giggle.
2. **Private by design.** No account. No cloud. No microphone. No camera. No location. No analytics. Ever. Everything lives on the parent's phone and the tag.
3. **Adapts to the kid.** Age band shapes vocabulary, pacing and humour.
4. **Adapts to the thing.** Sensors + content packs per object type.
5. **Never shames.** Encouragement only. No guilt, no fear, no food/body talk, no "bad kid".
6. **Calm by default.** Rate‑limited, quiet hours, hard volume cap.
7. **Parents in control.** One tap to mute, forget, or delete everything.
8. **Beautiful and durable.** Apple‑grade fit and finish, IP67, survives a 1.5 m drop onto concrete 100 times.

## 4. The system

```
┌──────────────┐   BLE 5 (bonded, RPA)   ┌────────────────────────┐
│  Tagalong    │ ◄──────────────────────► │  Tagalong app (PWA)    │
│  tag         │  config ▸  ◂ events      │  parent's phone        │
│  nRF52840    │                          │  local‑only, no server │
└──────────────┘                          └────────────────────────┘
```
There is **no backend**. The app is a static PWA. The tag holds pre‑rendered phrase audio for every age band × personality × event of its content pack.

## 5. v1 scope

### 5.1 Tag (hardware)
- Puck **⌀38 mm × 12 mm, ≈14 g**, soft‑touch silicone over polycarbonate, one colour‑matched strap loop; swappable mounts: bottle strap, backpack/zipper loop, lace clip, adhesive base.
- **MCU/radio:** Nordic nRF52840 (BLE 5.x). **Storage:** 16 MB QSPI flash for audio packs.
- **Sensors:** 3‑axis accelerometer with wake‑on‑motion & FIFO; 1 capacitive channel (liquid level / touch through ≤2 mm plastic); ambient light (lid open / in bag); coarse temperature.
- **Audio:** I²S class‑D amp + 20 mm speaker, firmware‑capped at **≤75 dB(A) @ 25 cm** (toy limit is 85; we stay well under).
- **Power:** sealed **150 mAh Li‑Po**, magnetic 2‑pin charger. Target **≥30 days** per charge at 30 utterances/day. **No coin cell** (ingestion hazard).
- **UI:** one soft button (hold 3 s = pair, tap = "say hi", double‑tap = mute 1 h), one diffused LED ring.
- **Safety/compliance:** ASTM F963 & EN 71 (incl. acoustics), CPSIA, FCC/IC/CE‑RED, Bluetooth SIG QDID, IP67, IEC 62133 + UN38.3, RoHS/REACH. No detachable small parts.
- **Cost:** BOM ≤ $12 @ 10k units. Retail **$29.99** (1‑pack) / **$49.99** (2‑pack) / mounts $7.99.

### 5.2 App (PWA first)
- Installable PWA (offline‑first). Web Bluetooth on Android Chrome/Edge today; the same code ships inside a Capacitor shell for iOS (App Store) at v1.1 — see ADR‑001.
- Flows: Welcome → Add tag (pair · kid · thing · personality · sound) → Home → Tag detail · Kids · Settings · Privacy Center · Demo mode.
- **Demo mode** works with no hardware: a simulated tag fires events and the phone speaks the lines (on‑device speech synthesis). This is also our sales demo.
- Zero third‑party requests (no fonts, CDNs, analytics). Strict CSP. Export/delete all data in one tap.

### 5.3 Content
- **Age bands:** `little` (2–4) · `kid` (5–7) · `big` (8–12).
- **Personalities:** `silly` · `sweet` · `brave`.
- **Things (full packs):** water bottle · lunchbox · backpack · toothbrush. **Basic pack:** shoes · stuffed friend · helmet · jacket · "something else".
- **Events:** common — `pickup`, `putdown`, `drop`, `shake`, `tap`, `long_still`, `good_morning`, `low_battery`, `charging`. Bottle — `filled`, `sip`, `empty`. Lunchbox — `opened`, `closed`, `packed`. Backpack — `left_behind`, `zipped`. Toothbrush — `brush_start`, `brush_done` (2 min), `brush_short`.
- **Optional name clip:** parent records the kid's name once (≈1 s); the tag splices it in. Stored on phone + tag only; deletable.

### 5.4 Out of scope for v1
Microphone / voice recognition (v2 "it knows its name", on‑device only), cloud sync, multi‑phone sharing, location, GPS/UWB finding, subscriptions, third‑party integrations, ads.

## 6. Key decisions (see `docs/adr/`)
| # | Decision |
|---|---|
| ADR‑001 | PWA first with a `TagTransport` abstraction; Web Bluetooth now, Capacitor BLE for iOS at v1.1 |
| ADR‑002 | Local‑first, zero‑backend, zero‑telemetry privacy architecture |
| ADR‑003 | nRF52840 + pre‑rendered phrase audio in QSPI flash (no on‑device TTS) |
| ADR‑004 | No microphone in v1 |
| ADR‑005 | Sealed rechargeable battery, magnetic charging; no coin cell |
| ADR‑006 | 3 age bands × 3 personalities content matrix |
| ADR‑007 | BLE privacy: advertise only in pairing window or low‑duty directed to bonded phone; RPA rotation |

## 7. Success metrics (launch + 90 days)
- Setup completion ≥ 90 % within 90 s (measured in user tests only; the app has no telemetry).
- "Kid laughed in first minute" ≥ 80 % in usability sessions.
- Return rate < 3 %; battery complaints < 1 %.
- 4.7★ average review; NPS ≥ 60.
- 10k units in first 6 months across DTC + Amazon.

## 8. Roadmap
- **v1.0 (this repo):** PWA + tag design package + firmware reference + content packs (EN).
- **v1.1:** iOS App Store via Capacitor; Spanish & Hindi packs; name clip.
- **v1.2:** More things (bike, helmet, piggy bank, plant), seasonal packs, sibling "tag talk" (two tags react to each other).
- **v2:** On‑device wake word ("Hey Bottle Buddy") with a mic that is *physically* switchable off.

## 9. Voice & tone (for every line the tag says)
- Short. Warm. Surprising. Never sarcastic *at* the kid.
- `little`: ≤ 6 words, concrete, repetition, sound effects ("Glug glug! Yum!").
- `kid`: ≤ 10 words, playful, sidekick energy ("Full tank, amigo! Let's roll!").
- `big`: ≤ 12 words, dry wit, respects them ("Hydration: complete. You're welcome, legend.").
- Banned: shame, fear, food/body judgement, "good/bad kid", brands, adult sarcasm, anything a kid would repeat to hurt another kid.
