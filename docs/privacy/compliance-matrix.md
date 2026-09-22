# Tagalong — Compliance Matrix (v1.0)

| | |
|---|---|
| **Status** | Working register · 2026‑09‑22 |
| **Owner** | Child‑safety compliance lead (this document) · founder approves · outside counsel signs the rows marked **Legal** |
| **Scope** | The v1.0 tag, its charger and mounts, and the companion PWA, for the launch markets **US · UK · CA · AU** (and IN/EU as noted) |
| **Not in scope** | The DTC storefront and marketing site — see §12 O‑1. That system takes names, addresses and payments and is squarely in scope for every privacy law here, while the *product* collects nothing. Do not let this document's good news leak across that line. |
| **Companions** | `threat-model.md` (PRV requirements), `data-inventory.md` (what exists), `privacy-policy.md` (what parents are told) |
| **Caveat** | This is an engineering register, not legal advice. Every conclusion about statutory scope is a position to be confirmed by counsel and recorded in the evidence register. |

## 0. How to read this

- **Status**: `Designed in` (the architecture already satisfies it) · `Evidence needed` (satisfied, but the paperwork does not exist yet) · `Action` (work to do) · `Decision` (a founder or counsel call is pending) · `N/A` (with a written determination, because "not applicable" still needs a document).
- **Gate**: when it must be closed — **G0** definition (Oct 2026) · **G1** EVT exit (Jan 2027) · **G2** DVT exit (Apr 2027) · **G3** launch readiness (May 2027).
- **Owners**: Compl = compliance consultant · Legal = outside counsel · FW / App = engineering · EE / ME = contract electrical / mechanical · Ops = operations & logistics · Content = content lead · Design = design · Rel = release engineering · Founder.
- Requirement references of the form **PRV‑nn** point at `threat-model.md` §8, which is where the implementable, testable version of each control lives. This document says *why a regulator cares*; that one says *what an engineer builds*.

## 1. Summary

| Framework | Applies? | Status | Gate | Owner |
|---|---|---|---|---|
| COPPA (16 CFR 312, as amended 2025) | Yes — assume in scope | Designed in · Evidence needed | G3 | Legal |
| GDPR‑K (Art 8 + Arts 5, 12, 25, 32, 35) | On EEA market entry; UK GDPR applies at launch | Designed in · Evidence needed | G3 | Legal |
| UK Age Appropriate Design Code | Yes — UK is a launch market | Designed in · 2 actions | G3 | Legal, Design |
| CCPA/CPRA minors' provisions | Thresholds may not be met; comply anyway | Designed in | G3 | Legal |
| Apple Kids Category + App Privacy labels | v1.1 (iOS via Capacitor) | Decision pending (category) | v1.1 | Founder, App |
| Google Play Families | v1.0 (TWA) or v1.1 | Action | G3 | App, Legal |
| Bluetooth SIG qualification | Yes — mandatory before shipping | Action (incl. Company ID) | G2 | FW, Ops |
| ASTM F963‑23 (via 16 CFR 1250) | Yes — it is a toy | Action | G2 | Compl, ME |
| EN 71 series + EN IEC 62115 | Yes for UK/EU | Action | G2 | Compl, ME |
| CPSIA (CPC, tracking label, lead, phthalates) | Yes | Action | G2 | Compl, Ops |
| 16 CFR 1263 (Reese's Law) | **N/A** — no button/coin cell | Evidence needed (determination) | G1 | Compl |
| IEC 62133‑2 | Yes — cell **and** pack | Action | G2 | EE, Compl |
| UN 38.3 | Yes | Action | G2 | EE, Ops |
| FCC Part 15 (B and C) | Yes | Action (module route) | G2 | EE, Compl |
| CE‑RED 2014/53/EU + EN 18031 | Yes for EU; UKCA mirror for UK | Action | G2 | EE, Compl, FW |
| IP67 (IEC 60529) | Yes — it is a marketing claim | Action | G2 | ME, Compl |

---

## Part A — Children's privacy

### A.1 COPPA — Children's Online Privacy Protection Rule, 16 CFR Part 312 (as amended 2025, general compliance date April 2026)

**Applicability.** We operate an online service (the PWA and its host). The product is for children aged 2–12; the app is used by the parent. That is a mixed audience at best, so **we assume COPPA applies and satisfy it by collecting nothing**, rather than arguing our way out of scope. The 2025 amendments matter to us in three specific ways: personal information now expressly includes biometric identifiers, a **written data‑retention policy must be published**, and a **written children's information security programme** is required.

| ID | Obligation | What we do | Evidence needed | Owner | Status | Gate |
|---|---|---|---|---|---|---|
| COPPA‑1 | No collection of a child's personal information without verifiable parental consent | **Nothing is collected.** No account, no server, no telemetry; every datum stays in the phone's own storage (ADR‑002, PRV‑01/02). The FTC's position on information that never reaches the operator is the crux — it needs counsel's written conclusion, not ours | Legal memo: "no collection by the operator", citing the data inventory and the zero‑network audit | Legal | Designed in | G3 |
| COPPA‑2 | Voice recordings are personal information | The optional name clip is recorded by the parent, stored in IndexedDB (`clip:<kidId>`), never transmitted, deletable in one tap, and from v1.1 written only to the tag the parent owns. We do not rely on the FTC's 2017 audio‑recording enforcement policy, because we never receive the audio at all | Data inventory DI‑05/06/46; deletion test record; policy §"The name recording" | Legal, App | Designed in | G3 |
| COPPA‑3 | Direct notice and a clear privacy policy | `privacy-policy.md`, bundled in the app (About), printed in condensed form on the in‑box privacy card, and published at the app URL | Published policy, versioned; packaging proof | Legal, Design | Evidence needed | G3 |
| COPPA‑4 | **Written retention policy, publicly disclosed; no indefinite retention** | Behavioural events: 7 days, enforced in code (`retentionDays: 7`, `pruneEvents`). Everything else: until the parent deletes it. Stated in the policy in plain words | Policy §Retention; `store.test.ts` prune test (PRV‑10) | Legal, App | Designed in | G3 |
| COPPA‑5 | **Written children's personal information security programme**, with a designated coordinator | A short, real document: the PRV register, the release‑integrity controls (PRV‑45…PRV‑52), the signing‑key procedure (PRV‑58) and the disclosure policy (PRV‑66), with the privacy lead named as coordinator | The security programme document, signed | Privacy, Legal | Action | G3 |
| COPPA‑6 | No conditioning participation on unnecessary disclosure | The child's name is optional; the age band is the only mandatory attribute, and it exists to make the toy age‑appropriate | Screenshots of the Add‑tag wizard and Kid editor | App | Designed in | G2 |
| COPPA‑7 | No disclosure to third parties; no targeted advertising to children | There are no third parties in the runtime. No ads, no analytics, no SDKs | Dependency manifest; zero‑network audit (PRV‑63) | Rel | Designed in | G3 |
| COPPA‑8 | Parental access and deletion | Both are on‑device, instant, and require no identity check — we have no copy to match a request against. Export (JSON) and *Delete everything* | Privacy Center screenshots; deletion matrix (`data-inventory.md` §6) | App | Designed in | G2 |

### A.2 GDPR and children (GDPR‑K) — Regulation (EU) 2016/679 and UK GDPR

**Applicability.** The UK is a launch market, so **UK GDPR and PECR apply at v1.0**. EU/EEA obligations attach on EEA market entry (the CE file is being compiled, so plan for it). Article 8's consent‑age rules bite on services offered *directly to a child*; ours is offered to the parent, which does not exempt us from Articles 5, 12, 25, 32 and 35.

| ID | Obligation | What we do | Evidence needed | Owner | Status | Gate |
|---|---|---|---|---|---|---|
| GDPRK‑1 | Lawful basis; Art 8 consent age where applicable | The parent sets the product up for their own child, on their own device, with no transmission to us. Counsel must record whether we are a controller at all for on‑device data, and on what basis | Legal memo on controllership for local‑only processing | Legal | Decision | G3 |
| GDPRK‑2 | Art 5(1)(c) data minimisation | Age **band**, not a birth date. First name **optional**. 7‑day event cap. The tag receives 13 bytes and no name | Data inventory §2, §4.1 | App, FW | Designed in | G1 |
| GDPRK‑3 | Art 25 data protection by design and by default | The zero‑backend architecture is the control (ADR‑002). Nudges default off; quiet hours default on; no location capability exists to switch off | ADR‑002; `DEFAULT_SETTINGS`; this matrix | App | Designed in | G1 |
| GDPRK‑4 | Art 35 DPIA — high risk: children's data, connected device, new technology | Produce a DPIA that reuses `threat-model.md` and `data-inventory.md` wholesale. The AADC makes it mandatory in the UK regardless of the Art 35 threshold | Signed DPIA | Legal, Privacy | Action | G3 |
| GDPRK‑5 | Arts 12–14 transparency in language a child could follow | Policy written to a Grade‑6 reading level (PRD A11Y‑11); a kid‑facing explanation of what the tag tells a grown‑up (PRV‑61) | Readability score; child‑development reviewer sign‑off | Design, Content | Action | G3 |
| GDPRK‑6 | Arts 15–20 access, erasure, portability | On‑device export (machine‑readable JSON) and one‑tap deletion. No request queue, because there is no controller‑side copy | Privacy Center; export schema | App | Designed in | G2 |
| GDPRK‑7 | Art 32 security of processing | Device encryption (platform), bonded LESC BLE link, signed firmware, strict CSP, no network surface (PRV‑18, PRV‑29, PRV‑03) | Threat model; firmware test records | FW, App | Designed in | G2 |
| GDPRK‑8 | Art 33/34 breach notification | Nothing of ours to breach. The realistic incident is a hostile app release: PRV‑50 playbook doubles as the notification procedure | Incident playbook with a notification annex | Privacy, Legal | Action | G3 |
| GDPRK‑9 | Art 27 EU representative; UK representative if applicable | Required on EEA market entry | Appointment letter | Legal | Action | EEA entry |
| GDPRK‑10 | ePrivacy Art 5(3) / PECR reg 6 — storage on terminal equipment | IndexedDB storage is **strictly necessary** for the service the parent asked for, so the consent exemption applies. There are no analytics, no cookies, no third‑party storage. No consent banner, and none would be honest | Written exemption analysis; a build with zero cookies | Legal | Designed in | G3 |
| GDPRK‑11 | Art 44+ international transfers | None. No data crosses any border because no data leaves the phone | Zero‑network audit | Rel | Designed in | G3 |

### A.3 UK Age Appropriate Design Code (ICO Children's code) — 15 standards

The UK is a launch market and the code applies to an information society service likely to be accessed by children. Two standards need work; the rest the architecture already answers.

| ID | Standard | What we do | Evidence needed | Owner | Status | Gate |
|---|---|---|---|---|---|---|
| AADC‑1 | 1 Best interests of the child | The product principles (brief §3) are a best‑interests statement: never shames, calm by default, rate‑limited, hard volume cap, no surveillance | Best‑interests assessment inside the DPIA | Privacy | Evidence needed | G3 |
| AADC‑2 | 2 DPIA | See GDPRK‑4 — mandatory under the code | Signed DPIA | Legal | Action | G3 |
| AADC‑3 | 3 Age‑appropriate application | Three developmental bands drive vocabulary, pacing and humour (ADR‑006); no age‑gating is needed because the app is the parent's | ADR‑006; content guidelines §1 | Content | Designed in | G1 |
| AADC‑4 | 4 Transparency | Privacy Center is a live inventory, not a policy link. Policy at Grade‑6 reading level | Screenshots; readability score | Design | Designed in | G2 |
| AADC‑5 | 5 Detrimental use of data | No profiling, no engagement optimisation, no behavioural advertising, no streaks or rewards that would pressure a child | This matrix; content guidelines §3 | Content | Designed in | G1 |
| AADC‑6 | 6 Policies and community standards | Content guidelines are enforced by a validator and a two‑person review (PRV‑55, PRV‑57) | `content/validate.mjs` output; sign‑off records | Content | Designed in | G2 |
| AADC‑7 | **7 Default settings (high privacy by default)** | Nudges off; quiet hours on; name optional; no location to disable; demo mode off. **The activity log defaults on** — accepted with compensating controls and flagged for counsel (`threat-model.md` §9 R‑2, §11 Q‑5) | Defaults table; counsel's view on the log default | Legal, App | **Decision** | G3 |
| AADC‑8 | 8 Data minimisation | See GDPRK‑2 | Data inventory | App | Designed in | G1 |
| AADC‑9 | 9 Data sharing | None, ever | Zero‑network audit | Rel | Designed in | G3 |
| AADC‑10 | 10 Geolocation | **No location capability exists** in hardware or software (`threat-model.md` §7.3). Nothing to default to off | ADR‑007; threat model §7 | FW | Designed in | G1 |
| AADC‑11 | **11 Parental controls — give the child an obvious sign when they are being monitored** | A parent can see 7 days of what the object did. So: every utterance is accompanied by an LED flash (TAG‑UT‑06), and a kid‑facing card and in‑app page say it in the child's words — *"I tell your grown‑up when I get filled, dropped or picked up. I can't see you, hear you, or know where you are."* (PRV‑61) | Kid card artwork; in‑app copy; child‑development reviewer sign‑off | **Design, Content** | **Action** | G3 |
| AADC‑12 | 12 Profiling | None. No cross‑session inference, no behavioural model, no recommendations. Phrase selection is a no‑repeat random choice within the parent's own settings | `pickPhrase.ts` and its test | App | Designed in | G1 |
| AADC‑13 | 13 Nudge techniques | Nudges are a named, opt‑in feature that is **off by default**, rate‑limited, and forbidden from nagging or shaming (content guidelines §4) | Defaults; guidelines; review records | Content | Designed in | G1 |
| AADC‑14 | 14 Connected toys and devices | Clear information about who processes what (nobody but the parent's phone); the tag has no mic, no camera, no location; pairing requires a physical button hold; the tag can be wiped by hand | Policy; packaging privacy card; threat model | Design, FW | Designed in | G3 |
| AADC‑15 | 15 Online tools | Export, clear activity, delete everything, mute, forget a tag — all prominent, all one or two taps | Privacy Center screenshots | App | Designed in | G2 |

### A.4 CCPA / CPRA — minors

**Applicability.** A pre‑launch company is unlikely to meet any of the CCPA business thresholds, and the *product* processes no personal information on our side in any case. We design to the law anyway, and re‑test applicability annually once the storefront is trading.

| ID | Obligation | What we do | Evidence needed | Owner | Status | Gate |
|---|---|---|---|---|---|---|
| CPRA‑1 | Opt‑in consent to sell or share PI of consumers under 16 (parental consent under 13) | **We do not sell or share any personal information, of any age, ever.** There is no mechanism by which we could | Policy statement; architecture | Legal | Designed in | G3 |
| CPRA‑2 | Notice at collection | The Privacy Center *is* the notice: a live list of what exists, on the screen where it exists | Screenshots | App | Designed in | G2 |
| CPRA‑3 | Sensitive personal information limits | The only sensitive‑adjacent datum is a child's voice clip, which never leaves the device | Data inventory DI‑46 | App | Designed in | G2 |
| CPRA‑4 | Deletion, access, portability, correction | On‑device, instant (COPPA‑8) | Privacy Center | App | Designed in | G2 |
| CPRA‑5 | Opt‑out signals (GPC) on web properties | Not required for the app (no sale/share). **The storefront must still handle GPC** — §12 O‑1 | Storefront review | Legal | Action | G3 |
| CPRA‑6 | California AADC (AB 2273) | Substantially enjoined in litigation; we design to the UK code, which is stricter than the enjoined provisions on every point that matters here | Note in the legal memo; annual re‑check | Legal | Designed in | annual |

---

## Part B — Platform rules

### B.1 Apple: Kids Category and App Privacy labels (v1.1, iOS via Capacitor — ADR‑001)

**Recommended decision.** Ship **outside** the Kids Category, as a parent utility (Lifestyle or Utilities), while meeting every substantive Kids‑Category rule. Rationale: the Kids Category requires selecting a single age band (5 and under / 6–8 / 9–11), and our product spans 2–12, so any choice misrepresents it; the app itself is a parent's setup tool, not a child‑facing experience; and the substantive protections cost us nothing because we already comply. This is PRD §13 A‑14's open question, and it is a founder decision at G2.

| ID | Rule | What we do | Evidence needed | Owner | Status | Gate |
|---|---|---|---|---|---|---|
| APPL‑1 | Guideline 5.1.4 — kids apps must not send personal or device information to third parties | Nothing is sent anywhere | Zero‑network audit | Rel | Designed in | v1.1 |
| APPL‑2 | Guideline 1.3 — no third‑party analytics or advertising; links out and purchases behind a parental gate | No analytics, no ads, no purchases, and in v1.0 no external links at all except a copy‑to‑clipboard support address (PRD S‑04) | Build review | App | Designed in | v1.1 |
| APPL‑3 | Guideline 5.1.1 — privacy policy required, linked in the listing and in the app | `privacy-policy.md`, bundled and published | Listing screenshot | Legal | Evidence needed | v1.1 |
| APPL‑4 | App Privacy details ("nutrition label") must be accurate | **"Data Not Collected" across every category** — see B.2. Apple's definition of *collect* is transmitting data off the device for access beyond real‑time servicing; our data never leaves the device | Completed label + the reasoning memo | App, Legal | Designed in | v1.1 |
| APPL‑5 | Purpose strings for protected resources | `NSMicrophoneUsageDescription` — "To record your child's name once, so a tag can say it. The recording stays on this phone." · `NSBluetoothAlwaysUsageDescription` — "To set up and talk to your Tagalong tags." | Info.plist | App | Action | v1.1 |
| APPL‑6 | Kids Category age‑band selection (only if we enter it) | Would force one of three bands for a 2–12 product — the reason for the recommendation above | Founder decision record | Founder | **Decision** | G2 |
| APPL‑7 | No account requirement (Guideline 5.1.1(v): no forced sign‑in for features that do not need it) | There is no account at all | Build review | App | Designed in | v1.1 |

### B.2 App Privacy label and Play Data safety — field by field

Declare these exactly. Both stores treat an inaccurate declaration as a policy violation, and a "Data Not Collected" claim is the most audited claim there is — which is why PRV‑02 and PRV‑63 exist.

| Apple category | Declaration | Why |
|---|---|---|
| Contact Info | Not collected | No account, no email, no address in the app |
| Health & Fitness | Not collected | Drink/brush events stay on the device and are never transmitted |
| Financial Info | Not collected | No purchases in the app |
| Location | Not collected | No location capability exists |
| Sensitive Info | Not collected | — |
| Contacts | Not collected | — |
| User Content (incl. audio) | Not collected | The name clip is stored on device only; recording is not collection under Apple's definition |
| Browsing / Search History | Not collected | — |
| Identifiers | Not collected | UUIDs are generated on device and never transmitted; no IDFA, no device id |
| Purchases | Not collected | — |
| Usage Data | Not collected | No analytics of any kind |
| Diagnostics | Not collected | No crash reporting |
| Other Data | Not collected | — |

| Play Data safety field | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Is all user data encrypted in transit? | Not applicable — no user data is transmitted |
| Do you provide a way for users to request data deletion? | Yes — deletion is performed on the device, immediately, with no request needed (describe the Privacy Center) |
| Data types collected / shared | None |
| Committed to Play Families policy | Yes (see B.3) |
| Independent security review | Declare the third‑party privacy/zero‑network audit once complete (PRV‑63) |
| Target audience and content settings | Mixed: the app is for parents; the product is for children — declare per B.3 and accept Families policy obligations |

### B.3 Google Play Families

| ID | Rule | What we do | Evidence needed | Owner | Status | Gate |
|---|---|---|---|---|---|---|
| PLAY‑1 | Families policy: apps targeting children must comply with COPPA/GDPR and must not transmit children's data without consent | Nothing is transmitted (Part A) | Policy declarations in Console | App, Legal | Designed in | G3 |
| PLAY‑2 | No AAID or other persistent identifier collected from children; no ads SDKs (Families Self‑Certified Ads SDK list) | No SDKs at all; the app has nine runtime dependencies and none touches the network | Dependency manifest | Rel | Designed in | G3 |
| PLAY‑3 | Data safety form must match actual behaviour | See B.2; re‑verify on every release with PRV‑02 | Form screenshot per release | App | Action | G3 |
| PLAY‑4 | Privacy policy URL required | Published policy | Console entry | Legal | Evidence needed | G3 |
| PLAY‑5 | IARC content rating questionnaire | Answer honestly: no user‑generated content, no ads, no purchases, no location sharing, no unmoderated social features | Rating certificate | Ops | Action | G3 |
| PLAY‑6 | If shipped as a Trusted Web Activity, Play policies apply to the web content too | Same bundle, same guarantees; the TWA cannot widen the app's capabilities | TWA manifest; asset‑links file | App | Action | G3 |
| PLAY‑7 | Target audience declaration decides which policy set applies | Declare accurately and accept the stricter set rather than gaming the classification | Console record | Founder | Decision | G3 |

---

## Part C — Radio, interoperability and cybersecurity

### C.1 Bluetooth SIG

| ID | Obligation | What we do | Evidence needed | Owner | Status | Gate |
|---|---|---|---|---|---|---|
| SIG‑1 | Membership before using the trademarks or shipping | Join as an Adopter (no fee) at G0/G1 | Membership record | Ops | Action | G1 |
| SIG‑2 | Qualification and listing before shipping; a Declaration ID per end product | Component‑based qualification referencing the pre‑qualified Raytac MDBT50Q module's QDID — this is precisely why the module was chosen (HW arch §2.1) | Declaration ID; listing entry | FW, Ops | Action | G2 |
| SIG‑3 | **Assigned Company Identifier for manufacturer‑specific advertising data** | The protocol currently uses `0xFFFF`, which is reserved for internal/test use and **must not ship** | Assigned Company ID; protocol doc updated (`threat-model.md` §11 Q‑6) | FW | **Action** | G2 |
| SIG‑4 | Brand guidelines for the word mark and logo | Packaging leaflet §7 carries the mark per the guidelines | Artwork proof | Design | Evidence needed | G2 |
| SIG‑5 | Declared GATT behaviour must match the qualified profile usage | Custom service plus standard Device Information and Battery services; both are gated per PRV‑18 and expose no serial (PRV‑20) | GATT dump; test report | FW | Action | G2 |

### C.2 FCC Part 15 (US)

| ID | Obligation | What we do | Evidence needed | Owner | Status | Gate |
|---|---|---|---|---|---|---|
| FCC‑1 | Subpart C intentional radiator authorisation for the 2.4 GHz radio | Use the module's modular grant; product label reads "Contains FCC ID: …" | Module grant; label artwork | EE, Compl | Action | G2 |
| FCC‑2 | Module integration conditions (KDB 996369) — antenna, host layout, co‑location | Antenna is the module's PCB antenna, unmodified; document the integration against the module's conditions, including detuning when strapped to a steel bottle (HW open question 4) | Integration statement; radiated measurements in all four mount positions | EE | Action | G2 |
| FCC‑3 | Subpart B unintentional emissions — Class B digital device (SDoC) | Host testing of the finished tag and the charger puck | Test report; SDoC | EE, Compl | Action | G2 |
| FCC‑4 | RF exposure | Document the SAR/MPE exemption for a sub‑milliwatt BLE device at the applicable separation distance rather than assuming it | Exemption calculation in the file | EE, Compl | Action | G2 |
| FCC‑5 | §§15.19 / 15.21 / 15.105 labelling and user‑information statements | On the safety leaflet (packaging §7); e‑label not used, because the tag has no screen | Artwork proof | Design, Compl | Action | G2 |
| FCC‑6 | ISED Canada equivalence (RSS‑247, RSS‑Gen) | "Contains IC: …", EN/FR statements on one artwork (packaging §3) | ISED number; artwork | Compl | Action | G2 |

### C.3 CE‑RED (Directive 2014/53/EU) and EN 18031 — plus the UKCA mirror

**Article 3(3)(d)(e)(f) applies from 1 August 2025.** Delegated Regulation (EU) 2022/30 brings **toys** expressly within 3(3)(e) (protection of personal data and privacy), so EN 18031‑2 is our standard whether or not the tag is "internet‑connected". EN 18031‑1/‑2/‑3 were cited in the OJ with **restrictions**, so the presumption of conformity does not cover every clause; plan for either notified‑body involvement or a documented equivalent assessment on the restricted clauses. Build this into the schedule at G1, not G3 — it is the most commonly underestimated item on this page.

| ID | Obligation | What we do | Evidence needed | Owner | Status | Gate |
|---|---|---|---|---|---|---|
| RED‑1 | Art 3.1(a) health and safety | EN IEC 62115 (electric toys) and/or EN IEC 62368‑1 as the lab advises; acoustics handled under Part D | Test reports | Compl | Action | G2 |
| RED‑2 | Art 3.1(b) EMC | EN 301 489‑1 and ‑17 | Test report | EE, Compl | Action | G2 |
| RED‑3 | Art 3.2 efficient spectrum use | EN 300 328 | Test report | EE, Compl | Action | G2 |
| RED‑4 | RF exposure | EN 62479 or EN 50665 | Assessment | EE | Action | G2 |
| RED‑5 | Art 3(3)(d) network protection — **EN 18031‑1** | The tag cannot reach the internet by any path; the app makes no network requests. Argue (d) either way and satisfy ‑1 regardless: bonded access control, no open interfaces, no default credentials (there are no credentials), signed updates | EN 18031‑1 assessment with the mechanism‑applicability justifications | FW, Compl | Action | G2 |
| RED‑6 | Art 3(3)(e) personal data and privacy — **EN 18031‑2** (toys are in scope explicitly) | Maps directly onto our existing requirements: access control and secure communication → PRV‑18; secure update → PRV‑29/PRV‑30/PRV‑34; secure storage and deletion of personal data → PRV‑35, PRV‑36; user notification → LED/audio on every utterance; minimisation → 13‑byte config with no name | EN 18031‑2 assessment; firmware test records; the decision log for every "not applicable" mechanism | FW, Compl | **Action** | G2 |
| RED‑7 | Art 3(3)(f) fraud protection — EN 18031‑3 | N/A: no payments, no financial data | Written determination | Compl | N/A | G2 |
| RED‑8 | Art 10(8) information in instructions (frequency band, max RF power) | On the safety leaflet | Artwork proof | Compl | Action | G2 |
| RED‑9 | EU Declaration of Conformity; technical file held 10 years | Single DoC covering RED + Toy Safety; UKCA DoC mirrors it | Signed DoC; technical file index | Compl | Action | G3 |
| RED‑10 | Economic‑operator obligations: EU/UK responsible person, addresses on the product or packaging | Importer/responsible‑person addresses on the box back panel (packaging §7) | Artwork; appointment letters | Ops, Legal | Action | G3 |

---

## Part D — Toy and product safety

### D.1 ASTM F963‑23 (mandatory in the US via 16 CFR Part 1250)

Confirm with the lab which edition is in force at test time and test to that edition.

| ID | Requirement | What we do | Evidence needed | Owner | Status | Gate |
|---|---|---|---|---|---|---|
| F963‑1 | §4.5 sound‑producing toys — 85 dB(A) limit for hand‑held/table‑top/floor toys, 65 dB(A) continuous, measured at the standard distance | Firmware clamps to **≤ 75 dB(A) @ 25 cm** at every volume setting (HW arch §2.5, TAG‑UT‑05, PRV‑38); the internal spec is deliberately stricter than the standard, and at the standard 50 cm measurement distance it is about 6 dB lower again. **PRV‑39 additionally requires measurement at 2.5 cm and 10 cm**, because children hold talking objects to their ear | Lab acoustic report at the standard distance plus the close‑range assessment; EOL per‑unit jig data | Compl, FW | Action | G2 |
| F963‑2 | §4.6 small objects, and §8 use‑and‑abuse before assessment | No detachable small parts; mounts are ring‑based and exceed the cylinder in two axes (packaging §8); the age grade follows the December 2026 lab pre‑check | Lab report on every SKU including mounts; **PRV‑37** | ME, Compl | Action | G2 |
| F963‑3 | §4.38 magnets | Charger magnets encapsulated and not liberable; flux index below the hazardous threshold, verified at DVT (**PRV‑41**) | Lab report | ME, Compl | Action | G2 |
| F963‑4 | §4.25 batteries in toys | Sealed, non‑accessible Li‑Po; no openable compartment; no coin cell (ADR‑005); protection circuitry and thermal fold‑back (**PRV‑42**) | Cell/pack certificates; construction review | EE, Compl | Action | G2 |
| F963‑5 | §4.3.5 heavy‑element migration; §4.7/4.9 edges and points | Silicone over polycarbonate, no sharp edges; material declarations from the CM | EN 71‑3 / F963 migration report; material declarations | Compl, Ops | Action | G2 |
| F963‑6 | §5/§6/§7 labelling, instructions, producer marking, age grading | Packaging §7 leaflet plus box back panel; tracking label per CPSIA‑2 | Artwork proof | Design, Compl | Action | G3 |
| F963‑7 | Strangulation and entanglement: cords, straps and loops | **PRV‑44** — no mount may form a closed loop that can pass over a child's head, and every mount releases below the force at which it could become a neck loop. Not covered explicitly in the packaging doc today | Mechanical lab report per mount SKU; design review | **ME, Compl** | **Action** | G2 |

### D.2 EN 71 series (EU/UK) and EN IEC 62115

| ID | Requirement | What we do | Evidence needed | Owner | Status | Gate |
|---|---|---|---|---|---|---|
| EN71‑1 | EN 71‑1 mechanical and physical, including acoustics | Same design basis as F963‑1/‑2, tested to the EN method and distance | Test report | Compl | Action | G2 |
| EN71‑2 | EN 71‑2 flammability | Material selection; lab test | Test report | Compl | Action | G2 |
| EN71‑3 | EN 71‑3 migration of 19 elements | Silicone, PC, inks and the strap all tested | Test report | Compl | Action | G2 |
| EN71‑4 | **EN 71‑12 N‑nitrosamines** — elastomer toys intended for children under 36 months or intended to be mouthed | The target age grade is 2+ and the tag is a soft‑touch silicone puck a toddler will mouth. **Do not skip this**: confirm applicability with the lab at G1, not at certification | Applicability determination; test report if in scope | **Compl** | **Action** | G1 |
| EN71‑5 | EN 71‑9/‑10/‑11 organic chemical compounds | Applicability determination based on materials | Determination | Compl | Action | G2 |
| EN71‑6 | EN IEC 62115 electric toys | Battery toy requirements: heating, abnormal operation, charging | Test report | Compl, EE | Action | G2 |
| EN71‑7 | Toy Safety Directive 2009/48/EC: safety assessment, technical file, CE mark, warnings in the language of each market | Compiled with the RED file; EN/FR on one artwork (packaging §3) | Safety assessment; DoC | Compl | Action | G3 |
| EN71‑8 | **Watch item:** the new EU Toy Safety Regulation agreed in 2025 will replace 2009/48/EC and adds a Digital Product Passport and a documented safety assessment | Our 2027 launch sits in the transition period. Track the Official Journal dates and the transition length; design the traceability data so a passport is a formatting exercise, not a re‑engineering one | Quarterly regulatory watch note | Compl | Action | quarterly |

### D.3 CPSIA (US)

| ID | Requirement | What we do | Evidence needed | Owner | Status | Gate |
|---|---|---|---|---|---|---|
| CPSIA‑1 | Children's Product Certificate based on third‑party testing at a CPSC‑accepted laboratory | Issue the CPC per production lot from the accredited lab reports | CPC; lab accreditation scope | Compl | Action | G2 |
| CPSIA‑2 | §14(a)(5) tracking label: permanent, distinguishing marks on product **and** packaging (manufacturer, location, date, cohort) | Batch code and serial window label on the tray bottom (packaging §9); confirm a permanent mark also appears on the tag itself — laser or moulded, not a sticker | Artwork and moulding drawings | ME, Compl | Action | G2 |
| CPSIA‑3 | Lead: 100 ppm total in accessible substrate, 90 ppm in surface coatings | Material declarations plus testing | Test report | Compl | Action | G2 |
| CPSIA‑4 | Phthalates: eight prohibited at 0.1 % in children's toys | Silicone and strap tested | Test report | Compl | Action | G2 |
| CPSIA‑5 | Certificate eFiling for imports | Confirm the current phase‑in date and mechanics with the customs broker before the first import; build the data fields into the CM's paperwork | Broker confirmation; test filing | Ops | Action | G2 |
| CPSIA‑6 | Age grading consistent with the CPSC's age‑determination guidelines | 2+ target, 3+ fallback per the December 2026 pre‑check (packaging §8); the `little` band would be marketed as 3–4 with the band definition unchanged | Founder decision record; lab pre‑check | Founder, Compl | Decision | G1 |

### D.4 16 CFR Part 1263 — Reese's Law (button cell and coin batteries)

| ID | Question | Determination | Evidence needed | Owner | Status | Gate |
|---|---|---|---|---|---|---|
| REESE‑1 | Does the product contain or use a button cell or coin battery? | **No.** A sealed 150 mAh Li‑Po pouch cell, permanently enclosed, no compartment, no user‑replaceable battery (ADR‑005). 16 CFR 1263 and the corresponding ASTM F963‑23 button‑cell clauses do not apply | Written applicability determination, the BOM and the cell datasheet, held in the compliance file | Compl | **Evidence needed** | G1 |
| REESE‑2 | Do the accessories contain one? | No. The charger puck is passive: two pogo pins, magnets, a captive cable, no cell | Same file | Compl | Evidence needed | G1 |
| REESE‑3 | Marketplace and retailer attestations about button cells | Answer "none", and attach REESE‑1 rather than leaving the question to a listing operator's default | Attestation records | Ops | Action | G3 |

---

## Part E — Battery and transport

### E.1 IEC 62133‑2

| ID | Requirement | What we do | Evidence needed | Owner | Status | Gate |
|---|---|---|---|---|---|---|
| IEC‑1 | Certified **cell** | Specify only cells with a current IEC 62133‑2 certificate (ADR‑005) | Cell certificate and test report | EE | Action | G1 |
| IEC‑2 | Certified **pack** | A certified cell is **not** sufficient: the assembled pack — cell plus protection circuit plus leads plus tabs — normally needs its own 62133‑2 report unless the vendor's certificate covers that exact configuration. Verify at G1, not at certification (**PRV‑42**) | Pack report, or a written confirmation that the cell certificate covers our configuration | **EE, Compl** | **Action** | G1 |
| IEC‑3 | Charging safety across temperature | BQ25100 with thermal fold‑back and an NTC on the cell; charging inhibited outside 0–45 °C (PRD §6.6) | Charge‑profile test across temperature | EE | Action | G2 |
| IEC‑4 | Abuse and fault behaviour | Short circuit, reverse polarity, wrong 5 V source, keys across the pogo pads — each with thermal imaging (**PRV‑40**) | DVT test report | EE | Action | G2 |
| IEC‑5 | **EU Battery Regulation (EU) 2023/1542 — removability** | Article 11 requires portable batteries in appliances to be removable and replaceable by the end user, with derogations including appliances **designed to operate in a wet environment**. An IP67 tag strapped to a water bottle is the textbook derogation case, but it must be *claimed and documented*, not assumed. Also plan for the Regulation's labelling, capacity marking, separate‑collection symbol and take‑back duties | Written derogation justification; labelling artwork; take‑back process (packaging §7 already prints an address) | **Compl, Legal** | **Action** | G2 |

### E.2 UN 38.3 (UN Manual of Tests and Criteria, Part III §38.3)

| ID | Requirement | What we do | Evidence needed | Owner | Status | Gate |
|---|---|---|---|---|---|---|
| UN‑1 | T1–T8 tests on the cell/battery | Obtain the report from the cell vendor; if we build the pack, confirm whether re‑testing is triggered | UN 38.3 test report | EE | Action | G1 |
| UN‑2 | Test summary must be made available on request | Hold it with the shipping paperwork and give it to every forwarder and marketplace | Test summary PDF | Ops | Action | G2 |
| UN‑3 | Classification and packing | ~0.555 Wh (150 mAh at 3.7 V) shipped **contained in equipment** → UN3481. The UN3481 mark goes on master cartons and on any mailer holding a retail box alone (packaging §3) | Shipping instructions; artwork | Ops | Action | G2 |
| UN‑4 | Packing‑instruction edition in force at the ship date | The provisions for small cells in equipment have been changing between IATA/ICAO editions. **Re‑confirm at G3 with the forwarder** rather than relying on this note | Forwarder confirmation, dated | Ops | Action | G3 |
| UN‑5 | State of charge | Tags ship at ~50 % (packaging §9). The ≤ 30 % SoC rule applies to standalone cells (UN3480), not to cells contained in equipment, so 50 % is acceptable — record the reasoning | Shipping file note | Ops | Evidence needed | G2 |

---

## Part F — Environmental sealing

### F.1 IP67 (IEC 60529)

| ID | Requirement | What we do | Evidence needed | Owner | Status | Gate |
|---|---|---|---|---|---|---|
| IP‑1 | IP6X: no dust ingress | Sealed enclosure, no seams at the button (silicone over‑mould), acoustic mesh over the speaker port | Lab report | ME | Action | G2 |
| IP‑2 | IPX7: immersion 1 m for 30 min | Same; the acoustic mesh is the risk item (HW open question 2) | Lab report | ME | Action | G2 |
| IP‑3 | **Test order** | Run the IP test **after** mechanical abuse — 100 × 1.5 m drops and the strap pull — because that is the state the product is in when a child drops it in the bath. A pristine‑sample IP result is not the claim we are making | Test plan showing the sequence; post‑abuse report | **ME, Compl** | **Action** | G2 |
| IP‑4 | Claim substantiation | Marketing says "waterproof"; the file must support the exact words used, and the packaging must keep saying hand‑wash, not dishwasher (IP67 is not a 70 °C pressure‑wash rating — PRD E‑14) | Claim table (§11); artwork proof | Compl, Design | Action | G3 |

---

## 11. Marketing claim substantiation

Every claim below is load‑bearing for the brand and therefore a regulatory exposure (FTC Act §5 in the US, CAP/ASA in the UK, ACL in Australia). Each needs a file entry, not a founder's confidence.

| Claim (as printed or spoken) | True? | What substantiates it | Wording guard |
|---|---|---|---|
| "No microphone. No camera. No account." | Yes | ADR‑004; the BOM has no microphone or image sensor; teardown photographs | The **phone's** microphone is used for the optional name clip. Never let the box's claim be read as "this app never touches a mic" — the policy says both things plainly |
| "Nothing ever leaves the phone" | Yes, with one honest qualification | PRV‑01/02 zero‑network test; PRV‑63 independent audit | Downloading and updating the app is a web request our host can see (PRV‑52). The policy states this; marketing must not contradict it |
| "We literally can't see your data" | Yes | No backend exists; no credential could reveal anything | — |
| "No analytics. Ever." | Yes | Dependency manifest; audit | Applies to the app. The storefront must not quietly install trackers and break the claim by association (§12 O‑1) |
| "It can't be used to find your child" | Yes | `threat-model.md` §7: no position source, no network, no ranging UI | Never add a "find my tag" feature without reversing this claim first |
| "≤ 75 dB(A) at 25 cm" | Design intent | Acoustic lab report + per‑unit EOL jig (PRV‑38) | Report the standard measurement distance alongside ours so the numbers cannot look like a dodge |
| "IP67" / "waterproof" | Pending test | IP‑1…IP‑4, tested post‑abuse | Hand‑wash, not dishwasher |
| "30 days per charge" | Design target | Power budget plus measured ORT data at 30 utterances/day | State the usage assumption wherever the number appears |
| "Private by design" | Yes | This entire document set | — |

## 12. Open items and decisions needed

| ID | Item | Owner | Needed by |
|---|---|---|---|
| O‑1 | **The storefront and marketing site are a separate privacy universe**: orders, addresses, payments, email marketing, cookies, GPC signals, and a CCPA/GDPR footprint the product does not have. It needs its own privacy notice, its own DPIA where applicable, and a cookie posture that does not embarrass the product's claims | Legal, Ops | G2 |
| O‑2 | App Store category: Kids Category versus a parent utility (recommendation in B.1; PRD §13 A‑14) | Founder | G2 |
| O‑3 | Activity‑log default (AADC‑7, `threat-model.md` §9 R‑2): keep on with compensating controls, or default off | Founder, Legal | G3 |
| O‑4 | Age grade 2+ versus 3+, which drives small‑parts, EN 71‑12 and marketing copy (CPSIA‑6, packaging §8) | Founder, Compl | G1 |
| O‑5 | Bluetooth Company Identifier to replace `0xFFFF` in manufacturer data (SIG‑3) | FW, Ops | G2 |
| O‑6 | EN 18031‑2 route: notified body or documented equivalent assessment on the restricted clauses (RED‑6) | Compl | G1 |
| O‑7 | EU Battery Regulation Article 11 removability derogation for a sealed IP67 product (IEC‑5) | Compl, Legal | G2 |
| O‑8 | EEA market entry timing, which triggers GDPR Art 27, the EU responsible person and GPSR obligations | Founder, Legal | G3 |
| O‑9 | Independent privacy and zero‑network audit vendor selection (PRV‑63) | Privacy | G2 |
| O‑10 | Kid‑facing "obvious sign" card for AADC‑11 — new in‑box printed matter, so it must reach packaging before artwork lock (Apr 2027) | Design, Content | G2 |

## 13. Evidence register

One folder per row, one owner per folder, all of it assembled before G3. An audit that cannot be reconstructed from this list is not finished.

| # | Evidence | Holder | Gate |
|---|---|---|---|
| E‑01 | Zero‑network CI test output and the independent audit report | Rel | G3 |
| E‑02 | Data inventory, DPIA and best‑interests assessment | Privacy | G3 |
| E‑03 | COPPA legal memo (no collection by the operator) and the written security programme | Legal | G3 |
| E‑04 | Published privacy policy, versioned, plus the in‑box privacy card proof | Legal, Design | G3 |
| E‑05 | Firmware security test records: bonded‑only GATT, signed DFU, APPROTECT, advertising captures | FW | G2 |
| E‑06 | Unwanted‑tracker field test record (PRV‑65) | FW, Compl | G2 |
| E‑07 | Acoustic reports (standard distance and close range) and EOL jig data | Compl | G2 |
| E‑08 | Toy safety: ASTM F963‑23, EN 71‑1/‑2/‑3/‑12, EN IEC 62115, use‑and‑abuse, magnets, small parts, loops | Compl | G2 |
| E‑09 | CPC, tracking‑label artwork, lead and phthalate reports, eFiling confirmation | Compl | G2 |
| E‑10 | Reese's Law applicability determination with the BOM and cell datasheet | Compl | G1 |
| E‑11 | Cell and pack IEC 62133‑2 certificates; charge‑profile and abuse test reports | EE | G2 |
| E‑12 | UN 38.3 report, test summary, shipping classification file | Ops | G2 |
| E‑13 | FCC/ISED grants, module integration statement, SDoC, RF exposure exemption | EE, Compl | G2 |
| E‑14 | CE/UKCA DoC, RED test reports, EN 18031‑1/‑2 assessments with mechanism justifications | Compl | G3 |
| E‑15 | IP67 reports including the post‑abuse sequence | ME | G2 |
| E‑16 | Bluetooth Declaration ID, listing, Company Identifier assignment | FW, Ops | G2 |
| E‑17 | Store submissions: App Privacy label, Play Data safety form, IARC rating, purpose strings | App | v1.1 |
| E‑18 | Content sign‑off records per pack version, including the child‑development reviewer | Content | G2 |
| E‑19 | Signing‑key ceremony record and access list (PRV‑58) | Rel | G2 |
| E‑20 | Claim substantiation file (§11) | Compl | G3 |
