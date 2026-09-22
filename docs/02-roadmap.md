# Tagalong — Roadmap and 12‑Month Plan

| | |
|---|---|
| **Status** | Plan of record · 2026‑09‑22 |
| **Horizon** | October 2026 → September 2027 (12 months), plus v2 direction |
| **Derives from** | `docs/00-product-brief.md` §8, ADR‑001…007, `docs/01-prd.md` (esp. §5.9 build state) |
| **Owner** | Product; hardware dates owned jointly with the (to‑be‑hired) electrical engineer and the contract manufacturer |

## 0. Where we are today (2026‑09‑22)

| Stream | State | Consequence for this plan |
|---|---|---|
| App | **v0.1.0 exists and works.** Every screen in the design spec's IA, both transports, the full content engine, unit tests, Playwright smoke and screenshots, ≈ 212 KB gz, zero third‑party requests | The app is *ahead* of the plan. The October–November app columns below are hardening and firmware integration, not construction. The remaining app work is enumerated in PRD §5.9 and is small: 7 P0 items, all of which need firmware to exist |
| Content | 5 EN packs, 513 cells, **2,052 lines**, 4 per cell, validator in place | Scripts are done. The next content milestone is a studio, not a writing room (December) |
| Protocol | `tag-protocol.md` v1 fully implemented in `codec.ts` both ways, with a simulated device that behaves like firmware | Firmware can be written against a working reference and a test double from day one |
| Firmware | Nothing exists | The critical path is entirely hardware and firmware |
| Hardware | Nothing exists; no EE hired | **Hiring the EE is the single most schedule‑critical action in this document** |

The practical read: we are not building an app and a tag in parallel any more. We are building a tag, and finishing an app against it. Plan reviews should look first at the EE hire and the CM shortlist, not at app velocity.

## 1. Planning principles

0. **The app is not the constraint; the tag is.** Anything that trades app polish for hardware or firmware progress is the right trade until DVT.
1. **Hardware ships once in this horizon.** One tag (hw rev 1) carries v1.0, v1.1 and v1.2. Everything else — app, firmware, content, mounts — iterates.
2. **Signed firmware DFU ships in v1.0.** It is the only field‑fix path and the insurance that makes a single hardware revision viable.
3. **Privacy review precedes every feature.** Any new data type or radio behaviour needs a new ADR before code (ADR‑002/007).
4. **The PWA can go public before the hardware does.** Demo mode is a complete product experience and the pre‑order demo.
5. **Gates are exit criteria, not dates.** Dates below are targets with named buffers; slipping a gate slips the launch, never the criteria.
6. **Certification starts on DVT units with final materials and colours.** Anything that changes after DVT forces re‑tests; CMF locks at DVT.

## 2. Release matrix

### v1.0 — "First laugh" (hardware launch · target May 2027)

| Stream | Scope |
|---|---|
| App (PWA) | v0.1.0 today (all screens, both transports, content engine, offline, install) **plus** the PRD §5.9 P0 list — tag‑voice preview in the wizard, signed firmware DFU, factory reset on Forget with reset copy in both destructive sheets, age‑band fan‑out to a kid's tags, foreign‑bond copy, honest name‑clip footer, About legal/support content — and P1 items 1–5, of which connection state (H‑05/TD‑01) and the Attached‑to / For rows (TD‑02a) are the two the founder should treat as near‑P0 |
| Firmware 1.0 | GATT service v1; all events for 4 full things + generic; utterance policy, quiet hours, mute, battery states, LED, button gestures incl. charger‑gated factory reset; 64‑frame buffer; ship mode; RPA advertising per ADR‑007; signed DFU |
| Hardware rev 1 | ⌀38 × 12 mm puck; nRF52840; 16 MB QSPI; accel + cap‑sense + ALS + temp; I²S amp + 20 mm speaker; 150 mAh Li‑Po; magnetic 2‑pin charger; RGB LED ring; one button; IP67; cradle‑ring mount system with bottle strap and zipper loop in‑box |
| Content | EN matrix **written and validated** (5 packs, 513 cells, 2,052 lines, 4 per cell); remaining work is recording: `{{name}}` lines in two versions incl. every band fallback vocative (PRD TAG‑NC‑01), sound effects, mastered ADPCM packs pre‑loaded at the factory |
| GTM | US launch on DTC + Amazon; UK/CA/AU listings as markings allow; 1‑pack $29.99 in 4 colours, 2‑pack $49.99, Mount kit $7.99; Android Play listing (TWA); press and creator seeding |

**Dependencies:** EE hire by mid‑Oct 2026 · CM selected by Jan 2027 · voice talent booked for Dec 2026 · certified Li‑Po cell selected by Nov 2026 · trademark decision by Nov 2026 (box artwork).

**Exit criteria (G3):** all `01-prd.md` §12 items green; PVT yield ≥ 97 %; every certificate/DoC in hand for the launch markets; in‑home study hits G1 (≥ 80 % first‑minute laugh) and G2 (≥ 90 % setup ≤ 90 s); zero‑network audit report signed.

### v1.1 — "Hello, iPhone" (target July 2027)

| Stream | Scope |
|---|---|
| App | Same codebase in a Capacitor shell with `CapacitorTransport` (`@capacitor-community/bluetooth-le`) → iOS App Store; Android via Capacitor or TWA (choose one at G3 based on Play policy); ES and HI UI; **Language** row in Settings; **Restore from export** in Privacy Center; name‑clip transfer UI; pack update flow with progress. **Two prerequisites land first, in the 1.1 track's opening weeks, not next to the recordings:** string externalisation to ICU (nothing is externalised today) and code‑splitting the phrase packs per language, since they are bundled into the app chunk and are its largest contributor (PRD L10N‑00, X‑09) |
| Firmware 1.1 | `PackXfer` (chunked, CRC32, resumable); name‑clip region write/erase and `{{name}}` splicing; mute‑state visibility improvement if protocol v1.1 adds it; battery‑life tuning from field data (support tickets, not telemetry) |
| Content | ES (Latin‑American neutral) and HI packs, transcreated and reviewed; 3 voices each; EN patch pack from in‑home findings |
| GTM | iPhone launch campaign ("now for iPhone"); India readiness pending WPC/BIS (see §5); Spanish/Hindi landing pages |

**Dependencies:** v1.0 shipped and stable (≤ 1 % battery complaints in first 60 days) · Apple Developer account and App Store category decision · ES/HI scripts complete by April 2027, recorded by May 2027 · PackXfer bench test: 6.5 MB in ≤ 8 min at ≤ 2 m with ≥ 99 % success over 100 trials.

**Exit criteria:** iOS pairing success ≥ 95 % on iPhone 11 and newer (iOS 16+) in lab; App Store approved; pack transfer meets the bench criterion in the field on ≥ 50 units; name‑clip splice judged natural by ≥ 80 % of parents in sessions; export→restore round‑trips 100 % of data in tests.

### v1.2 — "More friends" (target September 2027)

| Stream | Scope |
|---|---|
| App | New things: bike, piggy bank, plant; helmet promoted to a full pack; seasonal packs (install/remove per tag); **Tag talk** setup (pair two tags of one kid as "friends") |
| Firmware 1.2 | Event detection for new things (bike: ride start/stop via cadence; piggy bank: coin drop impulse; plant: `long_still` + light‑based "thirsty" schedule); tag talk: family‑key‑based recognition of sibling tags' adverts (ADR‑008 required) |
| Content | New packs at ≥ 4 lines/cell; seasonal packs (culturally reviewed per market); tag‑talk duet lines |
| GTM | Accessory revenue (new mount SKUs: bike/handlebar, plant stake); holiday bundle |

**Dependencies:** ADR‑008 (tag talk privacy model: how two tags recognise each other without becoming trackable — proposal: app‑provisioned 128‑bit family key, tags advertise a rotating HMAC token only within 30 min of motion, no phone in the loop) · content budget for ~600 new lines per language · 16 MB flash budget review (EN + one extra pack + seasonal must fit).

**Exit criteria:** tag talk passes the ADR‑008 privacy review and a field trial of 20 families with no cross‑household detection; new packs reviewed; seasonal packs removable in one tap; firmware 1.2 DFU success ≥ 99 % in field.

### v2 — "It knows its name" (definition Q3 2027 · hardware rev 2 in 2028)

| Stream | Scope |
|---|---|
| Hardware rev 2 | Microphone with a **physical slide switch** that breaks the mic circuit (verified by teardown, not firmware); everything else carried over |
| Firmware 2.0 | On‑device wake word ("Hey Bottle Buddy"); no audio stored or transmitted, ever; wake‑word only when the switch is on |
| App | Wake‑word enablement UI with the switch state shown live; privacy notice revision |
| Governance | New ADRs (mic hardware, on‑device audio processing), independent privacy review, re‑certification as a device with audio input in relevant jurisdictions |

**Exit criteria (definition gate):** ADRs accepted; privacy review scope approved; BOM impact ≤ +$1.50; battery life impact ≤ 20 %; user research shows ≥ 60 % of parents would enable the switch.

## 3. 12‑month timeline

Chinese New Year 2027 falls on 6 February; most CMs close ~30 Jan – 14 Feb. DVT PCBAs are built before the break; DVT assembly after.

| Month | Hardware / Mechanical | Firmware | App | Content | Compliance | GTM / Ops | Gate |
|---|---|---|---|---|---|---|---|
| **Oct 2026** | EE hired; architecture and part selection; ID concepts → 1 direction; P0 rig (nRF52840‑DK + sensor breakouts + MAX98357A + speaker) | 0.1: GATT v1 against the app's `codec.ts` reference and its simulated device; config/event round trip on the DK | 0.5: **first real pairing** — the shipped wizard against the P0 rig; connection state (H‑05); chooser filter on the pairing flag (AT‑1.1a); zero‑network CI test | Guidelines final; **scripts already written** — content review pass and casting brief | Pre‑compliance plan; lab RFQs; certified cell shortlist | Trademark search and name decision; domain; CM long‑list | **G0** definition frozen (PRD, design, protocol) |
| **Nov 2026** | Schematic + layout rev A; ID surface model; cradle‑ring mount system CAD; speaker chamber simulation | 0.3: sensors on P0, first detection algorithms, audio pipeline, power modes | 0.7: tag‑voice preview (AT‑4.4/6.6), Attached‑to + For rows, mute over the wire, config read‑back and retry, `setTime` on connect, buffered‑frame timestamps | Child‑development review of the 2,052 lines; voice casting; patch list for anything the review rejects | Cell chosen (IEC 62133‑2 + UN38.3 docs); optional EMC pre‑scan on rev A | Brand identity; packaging concepts; CM short‑list visits | |
| **Dec 2026** | **EVT build**: 30 units, rev A PCBA, SLA housings, hand‑cast silicone; power, acoustics, sensor, RF, thermal tests on real bottles/bags/brushes | 0.5: full event set, quiet hours, mute, battery/LED states, buffer | 0.9 beta: DFU flow, factory reset on Forget, band fan‑out, About legal/support content — the whole §5.9 P0 list closed; closed beta with 10 supervised families on EVT units | Studio week: EN, 3 voices; mastering; pack build | Acoustic pre‑test (SPL cap) | Photography plan; pre‑order page design | |
| **Jan 2027** | **G1 EVT exit**; rev B (antenna, electrode, sealing); soft‑tool kickoff (4–6 wks); DFM with CM; rev B PCBAs built pre‑CNY | 0.8: feature complete; signed DFU; time‑unknown policy; factory test mode | 1.0 RC: DFU flow, a11y audit, perf budgets, Playwright screenshots | Fixes from beta; sound effects final | Formal test slots booked (RF, toy safety); IP67 method agreed | CM contract; usability round 1 (setup time) | **G1** |
| **Feb 2027** | **DVT build** (late Feb, post‑CNY): 250 units, soft tools, production materials and colours (CMF lock); reliability starts (drop, IP67, thermal, button, strap, battery cycle) | 0.9: tuning on DVT; power measurements → budget report | 1.0 RC2; iOS Capacitor spike (1.1 track) | Pack v1.0 frozen | RF testing starts (FCC/IC/CE‑RED/UKCA); toy safety samples submitted (ASTM/EN 71/CPSIA); RoHS/REACH declarations | Packaging DVT samples; Amazon brand registry; support help‑centre drafts | |
| **Mar 2027** | Reliability complete; **in‑home study** (30 families, 2 weeks, DVT units labelled not‑for‑sale); hard‑tool kickoff (6–8 wks) | 1.0.0‑rc signed | **1.0.0 public PWA** at pre‑order open (Demo mode for everyone; pairing for study units) | Patch recording for flagged lines | RF reports → TCB filing; SIG Declaration ID; IP67 report; toy safety results begin | **Pre‑orders open**; press embargo briefings; creator seeding list | |
| **Apr 2027** | **G2 DVT exit**; **PVT build**: 1,500 units on hard tools and the production line; test jigs (acoustic, sensor, BLE, cap‑sense cal); packaging PVT; ISTA‑3A | 1.0.0 release (signed, factory image) | 1.0.x fixes from study; Play (TWA) listing prep | ES/HI scripts complete (for 1.1) | FCC/IC grants; CE + UKCA DoC compiled (RED + Toy Safety + EN IEC 62115); CPC issued; RCM registration | Amazon listing + A+ content; DTC store final; RMA process; India WPC/BIS filings start | **G2** |
| **May 2027** | **G3 PVT exit** → MP PO 10k; ORT starts; first MP lot | 1.0.x hotfix capability proven (DFU dry run on PVT fleet) | **1.0 GA** (PWA + Play TWA) | Content patch pack ready for 1.1 PackXfer | All launch‑market certificates on file | **v1.0 launch**: pre‑orders ship; DTC + Amazon US live; UK/CA/AU listings go live with bilingual (EN/FR) mandatory info on the box | **G3 / Launch** |
| **Jun 2027** | MP ramp; mount‑kit tooling for kit‑only mounts (lace clip, adhesive base) | 1.1: PackXfer, name clip splice; field battery tuning | 1.1 RC: Capacitor iOS, Language row, Restore from export; App Store submission (allow 2–3 weeks incl. one rejection loop) | ES/HI recording and mastering | India WPC ETA + BIS CRS in progress | Launch retro; review‑response playbook; UK/AU/CA marketing | |
| **Jul 2027** | Second MP lot per sell‑through | 1.1.0 GA via DFU | **1.1.0 GA**: iOS App Store, ES/HI, name clip, restore | ES/HI packs released over PackXfer | India approvals expected (if filed April) | "Now for iPhone" campaign; India soft launch if approved | v1.1 exit |
| **Aug 2027** | Bike/plant mounts industrial design; no PCBA change | 1.2 beta: new thing detectors, tag‑talk radio behaviour per ADR‑008 | 1.2 beta: new things, seasonal packs UI, tag‑talk setup | Bike, piggy bank, plant, helmet‑full, seasonal packs written and recorded | ADR‑008 privacy review | Holiday bundle planning; accessory SKUs | |
| **Sep 2027** | Rev 2 (mic + switch) feasibility; EVT‑2 plan for Q1 2028 | 1.2.0 GA | **1.2.0 GA** | Seasonal packs live | v2 privacy review scoping | Year‑2 plan; retail (specialty toy) pilot conversations | v1.2 exit; v2 definition gate |

## 4. Hardware milestones

| Build | Timing | Qty | Enclosure | PCBA | Purpose | Exit criteria |
|---|---|---|---|---|---|---|
| **P0 rig** | Oct–Nov 2026 | 5 | None (DK + breakouts on a 3D‑printed puck shell for sensor placement) | Dev kit | Firmware bring‑up, sensor algorithms, protocol with the app | App pairs, configures and receives events; drop/pickup detection ≥ 90 % on a bottle |
| **EVT** | Dec 2026 | 30 | SLA prints, hand‑cast silicone, prototype straps | Rev A, low‑volume SMT | Validate electrical design, acoustics, power, sensors, RF | Measured sleep/active currents support ≥ 30 days at 30 utterances/day; ≤ 75 dB(A) @ 25 cm cap verified; drop ≥ 95 %, pickup ≥ 90 %, filled ≥ 85 % on 10 popular bottles; BLE range ≥ 10 m line of sight; no red‑flag EMI; no ingress at 30 min/1 m |
| **DVT** | Late Feb 2027 | 250 | Soft tools (aluminium), final materials and colours | Rev B, CM SMT line | Reliability, certification samples, in‑home study, DFM | 100 × 1.5 m drops on concrete pass on 10 units; IP67 pass; button 100k cycles; strap loop 5 kg; battery ≥ 300 cycles to 80 %; all cert tests started with no failures requiring redesign; study metrics met |
| **PVT** | Apr 2027 | 1,500 | Hard tools | Rev B/C, production line | Production process, yield, test fixtures, packaging | Yield ≥ 97 %; test‑jig Cpk ≥ 1.33 on acoustic and cap‑sense; packaging ISTA‑3A pass; golden samples signed; ORT started (200 units) |
| **MP** | May 2027 → | 10,000 first PO | | | Launch supply | ORT clean; field return < 1 % in first 60 days; second lot released on sell‑through |

Buffers embedded: 2 weeks after EVT (rev B), 3 weeks between cert results and PVT, 2 weeks before launch. Total ≈ 7 weeks. A failed RF or toy‑safety test consumes 3–4 weeks (fix + re‑test); one such failure is absorbed by the buffers, two are not.

## 5. Certification plan and lead times

Planning estimates; labs confirm at booking. "Start" assumes DVT units with final materials.

| Certification | Markets | Covers | Test time | Admin / issue | Prerequisite | Start | Needed by |
|---|---|---|---|---|---|---|---|
| FCC Part 15.247 + 15.209 (intentional radiator); Part 15B | US | Radio, EMC | 2–4 wks | TCB grant 1–2 wks | DVT with final antenna and enclosure | Feb 2027 | Apr 2027 |
| ISED RSS‑247 / RSS‑Gen | CA | Radio | With FCC | Certificate 1–2 wks | Same | Feb 2027 | Apr 2027 |
| CE — RED (EN 300 328, EN 301 489‑1/‑17, EN 62479 / EN 50663) + Toy Safety Directive (EN 71‑1/‑2/‑3 incl. acoustics, EN IEC 62115) | EU | Radio, EMC, toy safety | 4–6 wks | Self‑declared DoC; Notified Body optional | DVT | Feb 2027 | Apr 2027 |
| UKCA (same designated standards) | UK | As CE | With CE | DoC | Same reports | Feb 2027 | Apr 2027 |
| RCM (ACMA) | AU | Radio, EMC | Uses CE reports | Supplier registration 1–2 wks | CE reports | Apr 2027 | May 2027 |
| Bluetooth SIG qualification | Global | BLE | 1–2 wks (pre‑qualified Nordic controller + Zephyr host; combination listing) | Declaration ID (fee; small‑company programme may apply) | Firmware feature‑complete | Mar 2027 | Apr 2027 |
| ASTM F963‑23 / 16 CFR 1250 + CPSIA (lead, phthalates, small parts, sound, battery) → CPC | US | Toy | 4–6 wks at a CPSC‑accepted lab | CPC self‑issued from reports | DVT with final materials and colours | Feb 2027 | Apr 2027 |
| IEC 62133‑2 + UN38.3 (cell) | Global | Battery | 0 if a certified cell is used; pack‑level UN38.3 4–6 wks if the PCM/pack is ours | Test summary for shipping | Cell decision | Nov 2026 | Mar 2027 |
| IP67 (IEC 60529) | Global | Enclosure | 1–2 wks | Lab report | DVT | Feb 2027 | Mar 2027 |
| RoHS / REACH / California Prop 65 | EU / US | Materials | 2–3 wks (XRF + supplier declarations) | Technical file | DVT BOM | Feb 2027 | Apr 2027 |
| India: WPC ETA (2.4 GHz de‑licensed; self‑declaration route where eligible) + BIS CRS for the Li‑ion battery (IS 16046) | IN | Radio, battery | ETA 2–6 wks; BIS 8–12 wks | Portal filings, Indian importer | CE/FCC reports; cell/battery test reports | Apr 2027 | Jul 2027 |
| Apple App Store review (v1.1) | Global | App | 1–2 wks per submission; plan one rejection loop | Privacy nutrition label; category decision | Capacitor build | Jun 2027 | Jul 2027 |

**Optional de‑risking (EE decision at EVT):** a pre‑certified nRF52840 module (modular FCC/IC/CE approval) removes the intentional‑radiator tests and ~3 weeks of critical path for roughly +$1.50–2.00 BOM; evaluate against the ≤ $12 BOM target.

## 6. App releases

| Version | Date | Channel | Contents |
|---|---|---|---|
| **0.1.0** | **Sep 2026 (exists)** | Internal | All screens, both transports, content engine, offline install, tests and screenshots (PRD §5.9) |
| 0.5 | Oct 2026 | Internal | First pairing against the P0 rig; connection state; pairing‑flag chooser filter; zero‑network CI test |
| 0.7 | Nov 2026 | Internal | Tag‑voice preview; Attached‑to / For; mute over the wire; config read‑back + retry; time and buffer handling |
| 0.9 beta | Dec 2026 | Closed (10 families, EVT, supervised) | §5.9 P0 list closed: DFU, factory reset, band fan‑out, legal/support content. Feature complete |
| 1.0 RC / RC2 | Jan–Feb 2027 | Closed | DFU, a11y, performance, screenshots |
| 1.0.0 | Mar 2027 | **Public PWA** at pre‑order open | Demo mode public; pairing for study units |
| 1.0.x | Apr–May 2027 | Public | Fixes from in‑home study |
| 1.0 GA | May 2027 | Public PWA + Play (TWA) | Launch |
| 1.1.0 | Jul 2027 | iOS App Store + Play + PWA | iOS pairing, ES/HI, name clip, PackXfer, restore from export, Language row |
| 1.2.0 | Sep 2027 | All | New things, seasonal packs, tag talk |

Firmware ships in lock‑step: 1.0.0 (factory, Apr 2027), 1.1.0 (DFU, Jul 2027), 1.2.0 (DFU, Sep 2027). Every app version bundles the newest signed image for its protocol version.

## 7. Critical path

EE hire → rev A → **EVT exit (G1)** → soft tools → **DVT** (post‑CNY) → certification on DVT → grants/DoCs → **PVT** on hard tools → **G3** → launch.

**The app is not on the critical path and should not be scheduled as if it were.** Its remaining P0 work is all firmware‑dependent (PRD §5.9), so it tracks firmware maturity rather than its own calendar; an app team idle in October is a signal to pull the EE hire forward, not to add app scope.

Items not on the critical path but with long lead: voice recording (book studio by Nov — scripts are already written), trademark (box artwork lock in Mar), CM contract (Jan), Indian approvals (v1.1), Apple developer/category decision (Feb), ICU externalisation and pack code‑splitting (start of the 1.1 track).

## 8. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Capacitive fill detection fails on metal/insulated bottles | High | The marquee `filled` moment is absent for many families | EVT test matrix of 10 top‑selling kids' bottles; tilt/slosh‑based fallback for `filled` where cap‑sense is blind; honest wording on box and in‑app ("Fill detection works best on plastic bottles"); founder decision if the claim must be narrowed |
| Small‑parts test forces 3+ age grading | Medium | `little` marketing and packaging copy change | Cradle‑ring mount system designed to fail the small‑parts cylinder; early lab pre‑check on EVT mounts (Dec) |
| 20 mm speaker cannot deliver clear speech at ≤ 75 dB(A) with personality | Medium | Delight suffers | Acoustic chamber design in Nov; EQ per voice; test with kids at EVT |
| Battery life < 30 days | Medium | Brief target missed; reviews | Power budget doc from EVT measurements; wake‑on‑motion tuning; advertising duty per ADR‑007; ship‑mode discipline |
| Certification failure (RF or toy) | Medium | 3–4 weeks per loop | Pre‑scan on rev A; optional pre‑certified module; buffers in §4 |
| Chinese New Year collides with DVT | Certain | 2‑week factory closure | PCBAs built pre‑CNY; assembly post‑CNY; already scheduled |
| Web Bluetooth capability changes (permitted‑device reconnect, filters) | Medium | Reconnect UX degrades on some browsers | Transport abstraction; PRD X‑05 defines the tap‑to‑connect fallback; monitor Chrome release notes |
| Apple App Store rejection (v1.1) | Medium | v1.1 slips 2–4 weeks | Submit early with a TestFlight build; no third‑party SDKs; category decision made in Feb |
| Trademark conflict on "Tagalong" | Medium | Rebrand before artwork lock | Search in Oct; alternates ready (Blip, Pipsy, Chatterbug); artwork lock in Mar |
| Content tone misses a band (e.g., `big` finds it babyish) | Medium | Reviews from the 8–12 segment | Kid panels per band at script stage; beta feedback loop; patch pack via PackXfer at 1.1 |
| BOM > $12 at 10k | Medium | Margin | Cost roll‑up at every gate; module vs. chip trade; single‑colour silicone masters |
| Founder bandwidth (single approver) | High | Gate delays | Gates need one decision each; open questions are batched per gate (PRD §14 has eight waiting on G0/G1) |
| EE hire slips past mid‑Oct 2026 | Medium | **Slips everything**; the app cannot absorb the delay because its remaining work needs firmware | Two parallel routes from week 1: a contract EE through the CM and an independent design house; decide by 15 Oct with whoever can start soonest |
| Preview voices resolve to cloud TTS on some Android builds | Medium | Undermines the zero‑network claim, which is the whole positioning | Filter to `localService` voices and disclose the fallback (PRD §14 Q6) — decide at G0, before any press briefing |
| Docs and code drift apart again | Medium | The PRD stops being trustworthy and gates get argued instead of checked | PRD §5.9 is the one reality table; it is reviewed at every gate and no gate passes with it stale |

## 9. Decision gates

| Gate | When | Criteria | Founder decisions due |
|---|---|---|---|
| **G0** Definition | Oct 2026 | PRD, design spec, protocol v1, ADRs accepted; content guidelines final; PRD §5.9 P0/P1 split agreed | Name/trademark; age‑grade target (2+ vs 3+); PWA‑before‑hardware; preview‑voice policy and `connect-src` (PRD §14 Q6–Q7); lunchbox mounting story (Q8) |
| **G1** EVT exit | Jan 2027 | §4 EVT criteria; BOM roll‑up ≤ $12 path; risks reviewed | Module vs. chip; bottle‑material claim wording; CM choice |
| **G2** DVT exit | Apr 2027 | §4 DVT criteria; certification underway without redesign; study metrics met; packaging final | Launch date confirmation; App Store category; MP quantity |
| **G3** Launch readiness | May 2027 | `01-prd.md` §12 complete; certificates on file; PVT yield ≥ 97 %; support live | Go/no‑go |
| **v1.1 exit** | Jul 2027 | §2 v1.1 exit criteria | India go/no‑go |
| **v1.2 exit / v2 definition** | Sep 2027 | §2 v1.2 exit criteria; ADR‑008 accepted; v2 ADR drafts | v2 funding |

## 10. Assumptions

1. An electrical engineer (contract or hire) starts by mid‑October 2026; mechanical/ID is contracted through the same firm or the CM.
2. A contract manufacturer with in‑house silicone over‑moulding and a BLE test line is selected by January 2027; location is not fixed (China, Vietnam or India are all viable for this class of device).
3. Launch markets for v1.0 are US, UK, CA, AU; India follows in v1.1 pending WPC/BIS. One box artwork carries all launch‑market marks with EN/FR mandatory information.
4. Certified cell and PCM are sourced as a certified assembly (no pack‑level UN38.3 on our side).
5. Bluetooth qualification uses the combination route with Nordic's pre‑qualified controller and the Zephyr host stack.
6. Voice recording uses human voice actors (three personalities) for EN; ES/HI may use high‑quality neural TTS with native‑speaker direction if studio budget is constrained (ADR‑003 allows both).
7. No telemetry exists, so every "exit criterion" measured on users comes from moderated sessions, support tickets, reviews and returns data.
8. The app team is one to two engineers. The plan assumes they spend October and November on firmware integration (PRD §5.9) rather than new surface area, and that no new screen is added before G2.
9. Content scripts are complete and frozen at G0. The December studio week records what exists; anything the child‑development review rejects in November is patched in the same week, not after.
