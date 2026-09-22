# Tagalong — User Research Plan

**Owner:** Product / research · **Date:** 2026‑09‑22 · **Status:** v1 (pre‑launch)
**Why this plan matters more than usual:** ADR‑002 forbids telemetry. Every success metric in the brief (§7) — setup ≤ 90 s, "kid laughed in the first minute", return rate, NPS — is measured **only** in sessions like these. This is our instrumentation.

Related: `docs/00-product-brief.md` §2 (personas), §7 (metrics), §9 (voice & tone); `docs/design/design-spec.md` §3 (flows); `docs/content/content-guidelines.md` (line rules); `docs/research/market-research.md` §9 (risks this plan must de‑risk).

---

## 1. Research questions and hypotheses

| # | Question | Hypothesis (falsifiable) | Method |
|---|---|---|---|
| RQ1 | Does the object‑as‑character idea produce delight in the first minute across all three age bands? | ≥ 80% of kids laugh/smile/repeat a line within 60 s of the first event (brief §7) | Play‑tests P1–P3 |
| RQ2 | Does delight survive a week of daily use? | ≥ 50% of kids still initiate an interaction (tap, shake, talk to it) on day 7 without prompting | In‑home diary P5 |
| RQ3 | Can a parent (or grandparent) set up a tag in under 90 s with no account? | ≥ 90% complete the wizard in ≤ 90 s unaided | Usability sessions U1 |
| RQ4 | Do parents believe and value "nothing leaves the phone"? | ≥ 70% rank privacy in their top‑3 purchase reasons after seeing the Privacy Center; 0 parents ask "where do I log in?" | Interviews + U1 |
| RQ5 | Is $29.99 / $49.99 the right price and is the box giftable? | Van Westendorp acceptable range contains $29.99; ≥ 60% of gift buyers pick the 2‑pack or Starter Kit | Interviews, pricing card sort |
| RQ6 | Does the noise profile cause parent/teacher rejection? | < 10% of parents lower volume below 50% in week 1; 0 teachers object when shown "school mode" | P5 + teacher panel |
| RQ7 | Which thing wins as the launch hero? | Bottle chosen first by ≥ 50% of parents; toothbrush shows the highest completed‑habit delta | P2, P5 |
| RQ8 | Are any lines shame‑adjacent or repeatable as taunts? | 0 lines flagged by ≥ 2 parents or the content reviewer | All sessions, line audit |

---

## 2. Personas (expanded from the brief)

Parent/buyer personas carry the purchase; child personas carry the play. Each row lists the job‑to‑be‑done, the trigger, the objection, and the line that wins them.

### 2.1 Parents and buyers

| Persona | Snapshot | Job‑to‑be‑done | Trigger to buy | Top objection | Line that wins them |
|---|---|---|---|---|---|
| **Priya, 34 — "Gentle routines"** (Bengaluru / Leicester; kid 3) | Android phone, product manager, dislikes screens for toddlers, buys on Amazon/FirstCry | Make the water bottle and toothbrush *want* to be used, without a tablet | Toddler refuses bottle at daycare; sees a 10‑s clip of a bottle saying "Glug glug! Yum!" | "Is it loud? Does it need Wi‑Fi?" | "No screen, no Wi‑Fi, no account. It just giggles when she fills it." |
| **Marcus, 38 — "Lost‑and‑found dad"** (Austin; kids 6 & 8) | iPhone, two working parents, third replacement bottle this term | Fewer lost bottles/lunchboxes; kids owning their stuff | Back‑to‑school shopping; sees "Bottle Buddy says 'don't forget me!'" | "Can it find the bottle like an AirTag?" and "iPhone?" | "It reminds him before he leaves it — and it works with the app in v1.1 on iPhone; today, try demo mode." (Honest; he is the v1.0 iOS gap persona.) |
| **Dana, 41 — "No more nagging"** (Manchester; kid 10) | Android, single parent, tired of the hydration/brushing fight | A habit prompt that isn't *her* voice | Dentist flags short brushing; kid rolls eyes at reminders | "My 10‑year‑old will find it babyish." | "Big‑kid mode is dry, not cute. He picks the personality." |
| **Jean, 67 — "Grandma gift‑buyer"** (Adelaide; grandkids 4 & 7) | iPhone, buys birthday + Christmas gifts, avoids "tech I have to set up" | A delightful gift that makes her the fun grandma, no setup burden | Christmas catalogue; a friend's grandchild has one | "Will the parents have to make an account? Will I have to?" | "60‑second setup by the parent. No account. Beautiful box." |
| **Tom, 36 — "Privacy skeptic"** (Berlin/Portland; kid 5) | Android (GrapheneOS), engineer, read the Mozilla toys report | Give his kid fun tech without giving anyone data | Learns it has no mic, no server | "Prove it. Where's the network traffic?" | "Static PWA, `connect-src 'none'`, no backend. Export or delete everything in one tap." |
| **Ms. Alvarez, 29 — "Teacher gatekeeper"** (influencer, not buyer) | Year‑2 teacher; 28 bottles on a shelf | Zero classroom disruption | A tag speaks during story time | "Can it be silent 8:30–15:00?" | "School mode: silent on schedule. LED only." |

### 2.2 Children (by age band)

| Band | Persona | What delights | What fails | Watch for |
|---|---|---|---|---|
| **little (2–4)** | **Ayaan, 3** — repeats sounds, loves cause‑and‑effect, drops things on purpose | Sound effects, giggles, repetition, being thanked | Long sentences, sarcasm, surprise sounds when tired | Fear response to "ouch"; repeated intentional dropping (design: reduce drop reactions after 3 in a minute) |
| **kid (5–7)** | **Maya, 6** — sidekick fantasy, jokes, wants to show friends | "Amigo" energy, jokes, names, being the hero who rescued the bottle | Being told what to do; babyish voice | Whether she introduces the bottle to others by name (bonding signal) |
| **big (8–12)** | **Leo, 10** — allergic to cringe, values wit and autonomy | Dry humour, respect, choosing the personality, mute control | Cute voice, moralising, anything friends could mock | Whether he hides it or shows it at school (social acceptability) |

Recruit on **child age band × parent phone OS × household type** (single/dual parent, grandparent‑involved) and include at least 2 neurodivergent children per band (sensory sensitivity to unexpected sounds is a real risk).

---

## 3. Parent interviews (discovery, weeks 1–3)

Format: 45‑minute remote or in‑home semi‑structured interview, n = 18 (6 per age band), mixed US/UK/AU/IN, ≥ 40% Android, ≥ 3 grandparent gift‑buyers, 2 teachers as a separate 30‑minute panel. Incentive: $60 / £45 / A$80 / ₹3,000 voucher. No product shown until Q7; concept clip shown at Q8.

**Ten questions (with probes):**

1. Walk me through yesterday morning from wake‑up to leaving the house. Where did water, food, teeth and bags come up? *(Probe: who carried what; what went wrong.)*
2. What's the last thing your child lost or forgot, and what happened next? *(Probe: cost, emotion, who was blamed.)*
3. How do you currently get your child to drink water / brush for two minutes / pack their bag? What works for a week and then stops? *(Probe: rewards, charts, apps, nagging.)*
4. Tell me about a toy or gadget your child bonded with. What made it "theirs"? How long did it last? *(Probe: did it have a name or voice?)*
5. Which connected products for kids have you bought or refused to buy, and why? *(Probe: accounts, subscriptions, microphones, location — let them name the fear.)*
6. If a product for your child collected no data at all — no account, nothing on the internet — how would you know? What would convince you? *(Probe: box copy, app screen, a friend, a review, a teardown.)*
7. **[Show box + tag, no explanation]** What do you think this is and what does it cost? *(Record first guess: "AirTag" is the expected failure; note the price anchor.)*
8. **[Play the 20‑s demo clip: fill → giggle, drop → "ouch", pick‑up → "thank you"]** What's your gut reaction? Who in your family would react most? *(Probe: annoying vs delightful; would you turn it off at night?)*
9. Where would you expect to buy this, and would you rather it arrive as a gift to give or a product to set up yourself? *(Probe: Amazon vs brand site vs store; gift wrap; who does setup after Christmas dinner.)*
10. Pricing: **[card sort at $19.99 / $29.99 / $39.99 / $49.99 2‑pack / $59.99 starter kit]** At which price is it "too cheap to be good", "a bargain", "getting expensive", "too expensive"? Would a $7.99 mount for a second object be an obvious add‑on or an upsell you'd resent?

Analysis: affinity map to the personas; count unprompted mentions of privacy, noise, iOS, and finding; Van Westendorp curve from Q10; update the concept clip and box copy before play‑tests begin.

---

## 4. Play‑test protocols for children (weeks 4–8)

Common setup for all protocols: parent present throughout; two researchers (one facilitates, one observes and codes — never one adult alone with a child); simulated tag via **Demo mode** on a test phone plus a **works‑like prototype puck** with speaker for physical events; a real bottle/lunchbox/backpack/toothbrush from the child's own home when possible; volume at the shipping default (≈ 65 dB(A) at 25 cm); sessions in the home or a playroom, not a lab. Coding scheme: **Delight** (laugh, smile, repeat line, look at parent), **Bond** (names it, talks to it, protects it), **Confusion**, **Distress**, **Ignore**, timestamped to the triggering event.

### P1 — *little* (2–4): "First giggle" (15–20 min)

| Step | Minutes | Procedure |
|---|---|---|
| 1 | 0–3 | Free play with the child's own bottle, tag attached but **silent**. Baseline behaviour. |
| 2 | 3–8 | Parent fills the bottle → `filled` line (sweet personality first). Observe first 60 s. Repeat fill twice more, with the shipped no‑repeat variation. |
| 3 | 8–12 | Parent "accidentally" knocks the bottle off a low table onto a mat → `drop` "ouch" line. Watch for fear versus laughter. If distress, stop drops and switch to `pickup` thank‑you. |
| 4 | 12–16 | Child picks it up → `pickup`. Then leave it alone 3 min → `long_still` "waiting patiently" nudge (nudges are off by default — this tests whether they should be). |
| 5 | 16–20 | Try silly personality on the same events. Ask the child "Is bottle happy or sad?" — a 3‑year‑old's emotional reading of the voice. |

Success: laugh/smile within 60 s in ≥ 80% of sessions; **no** distress on `drop`; child re‑engages (touches, talks to, or brings the bottle to parent) ≥ 2 times unprompted. Design outputs: which `drop` lines read as funny vs frightening for 2‑year‑olds; whether `long_still` nudges should exist for this band at all.

### P2 — *kid* (5–7): "A day with Bottle Buddy" (30 min, in‑home)

| Step | Minutes | Procedure |
|---|---|---|
| 1 | 0–5 | Child chooses thing (bottle vs lunchbox vs backpack) and personality from the wizard step‑4 cards with ▶ previews (parent drives the phone). Record choice and reason in the child's words. |
| 2 | 5–15 | Scripted "school morning": pack lunchbox (`packed`), zip backpack (`zipped`), fill bottle (`filled`), walk to the door and *leave the bottle behind* (`left_behind`). Does the child go back for it? |
| 3 | 15–22 | Playground simulation: shake, drop onto grass, pick up, tap. Ask "What do you think it'll say if…?" before each — tests the child's mental model of the character. |
| 4 | 22–27 | Child introduces Bottle Buddy to a sibling or the parent as if to a friend. Coding: does it have a name, a personality description, a story? |
| 5 | 27–30 | Child rates "silly / sweet / brave" with smiley cards and says which one is "like me". |

Success: `left_behind` line causes the child to retrieve the object in ≥ 60% of sessions; **Bond** codes ≥ 3 per session; personality choice is explained in the child's own words; no line judged "mean" by the child.

### P3 — *big* (8–12): "Cringe test and co‑design" (40 min, pairs of friends where possible)

| Step | Minutes | Procedure |
|---|---|---|
| 1 | 0–5 | Show the tag on a bottle with **no** audio. "What is this? Would you carry it?" (social acceptability before any content). |
| 2 | 5–15 | Play 12 `big`‑band lines across events and personalities. Each child holds a red/green card: green = "I'd let my friends hear this", red = "cringe". Record the split per line. |
| 3 | 15–25 | Co‑design: kids write or say 3 lines they *would* accept for `drop`, `filled`, `brush_done`. Content team keeps the vocabulary, not the lines (ethics: no verbatim child content without written consent). |
| 4 | 25–33 | Give the child the phone (demo mode) and the tag detail screen: can they mute for an hour, change personality, and preview? Autonomy = adoption for this band. |
| 5 | 33–40 | "Would you rather have this or an AirTag on your bag? Why?" and "Which object should it go on for someone your age?" (bottle, backpack, bike helmet, skateboard, piggy bank — informs v1.2 things). |

Success: ≥ 70% of lines green‑carded by ≥ 75% of kids; ≥ 50% would carry it visibly at school; kids can find mute and personality switch unaided in < 30 s; a ranked list of v1.2 things.

### P4 — Cross‑band sibling session (25 min): one tag, two kids

Purpose: real households have a 3‑year‑old and a 7‑year‑old sharing a kitchen. Set the tag to the younger child's band on the bottle; run `filled`, `drop`, `pickup`. Observe whether the older sibling mocks the voice, hijacks the bottle, or teaches the younger one. Then swap to the older band and repeat. Ask parents to set two tags (one each) in the wizard — measures kid‑switching UX and whether two tags in one room feel like noise. Success: no sibling teasing that uses the tag's lines against the younger child (RQ8); parents complete two‑tag setup ≤ 3 min; informs v1.2 "tag talk" and per‑band volume defaults.

### P5 — Seven‑day in‑home diary (all bands, n = 8 per band)

Families receive a works‑like tag on their chosen object plus the PWA on their own Android phone (or a loaner). Parents log once a day in a paper or PWA‑local diary (no upload — export JSON at the end, consistent with ADR‑002): did the child interact unprompted? Any annoyance? Volume changed? Quiet hours changed? Any line they disliked? Day 1 and day 7 include a 10‑minute video call where we watch one fill + one pick‑up. Battery reading recorded daily (validates the 30‑day target trajectory). Success: ≥ 50% of children still initiating on day 7 (RQ2); volume reduced below 50% by < 10% of parents (RQ6); zero safety incidents (mouthing the tag, strap detachment); ≥ 80% of parents say they would keep it if it were theirs.

### Usability session U1 — parent/grandparent setup (20 min, n = 12 incl. 4 grandparents)

Unboxing to "Bottle Buddy is ready!" on the participant's own phone (Android Chrome) or a loaner. Think‑aloud, timed from box open. Then: find the Privacy Center, export data, delete everything. Success: ≤ 90 s wizard completion by ≥ 90% (brief §7); 0 participants look for a login; ≥ 80% correctly describe where their data lives afterwards ("on this phone") in their own words.

---

## 5. Consent, ethics and safeguarding

These rules are non‑negotiable and are the operational form of the brief's "private by design" principle applied to our *own* research.

| Area | Rule |
|---|---|
| **Consent** | Written informed consent from a parent/legal guardian before any session; separate opt‑ins for (a) audio recording, (b) video recording, (c) photographs, (d) quoting the child. Any tick can be declined and the session still runs. |
| **Child assent** | Age‑appropriate assent script at the start ("We're going to play with a talking bottle. You can stop any time and nobody will be upset."). The child's "no", turning away, or distress ends the activity immediately. For 2–4s the parent reads the child's cues with us. |
| **Two‑adult rule** | Two researchers present, or one researcher plus the parent in the room at all times. No researcher is ever alone with a child. Researchers hold current background checks (DBS/WWCC/state equivalents). |
| **Data minimisation** | Participants are IDs (e.g., `K‑little‑07`), never names, in notes and reports. Faces blurred or video used only internally; no child audio/video in marketing without a separate, revocable release. Raw recordings deleted 90 days after the study report; transcripts retained 12 months. Storage: encrypted local drives, not consumer cloud. |
| **Prototype data** | Test phones run the real PWA — local‑only by design; diary export is a JSON handed to us by the parent, then deleted from the device in front of them. |
| **Content safety** | Every line played to a child has passed `docs/content/content-guidelines.md` review (no shame, fear, food/body talk, brands). Researchers stop and log any line a child or parent reads as unkind. |
| **Physical safety** | Works‑like pucks are pre‑production: strap and shell inspected before each session; no session with a child under 3 unless the puck has passed a small‑parts check and the battery is protected; a parent handles the toothbrush mount. Drops are onto mats, never near faces. |
| **Compensation & withdrawal** | Paid regardless of completion; right to withdraw and have data deleted up to the report date. |
| **Regulatory** | Comply with COPPA (no online collection from children), UK/EU GDPR‑K and AADC principles (data minimisation, high‑privacy defaults) and, for Indian participants, DPDP verifiable parental consent — obtained the same way (signed consent by the parent present). Where a formal IRB isn't available, an independent reviewer (paediatric OT or child‑development academic) signs off the protocols before fieldwork. |
| **Neurodiversity & sensory needs** | Screening question on sound sensitivity; volume can be lowered to 40% for those children; no unannounced first sound — the parent triggers the first event. |

---

## 6. Success signals and decision gates

All signals are measured in sessions (ADR‑002: no telemetry). Gates map to the hardware programme so research can stop or redirect spend.

| Signal | Threshold | Source | Gate |
|---|---|---|---|
| First‑minute delight | ≥ 80% of kids laugh/smile/repeat within 60 s | P1–P3 | **Content sign‑off** before studio recording |
| Day‑7 engagement | ≥ 50% initiate unprompted on day 7 | P5 | **Tooling sign‑off** (EVT → DVT) |
| Distress on `drop` | 0 sustained distress episodes in *little* band | P1 | Line rework / drop‑response damping |
| Shame/taunt audit | 0 lines flagged by ≥ 2 parents or reviewer | All | Content guidelines update |
| Setup time | ≥ 90% ≤ 90 s, unaided, no login sought | U1 | **App v1.0 release** |
| Privacy comprehension | ≥ 80% correctly say "on this phone"; ≥ 70% rank privacy top‑3 | U1 + interviews | Box & PDP copy lock |
| Noise acceptance | < 10% of parents drop volume < 50%; teacher panel accepts school mode | P5 + teachers | Default volume / quiet‑hours defaults |
| Left‑behind efficacy | ≥ 60% retrieval in *kid* band | P2 | Keep `left_behind` in v1 bottle/backpack packs |
| Social acceptability | ≥ 50% of *big* kids would carry it visibly | P3 | Big‑band voice direction; industrial design colourways |
| Price acceptance | Van Westendorp acceptable range includes $29.99; ≥ 60% of gift buyers choose 2‑pack/kit | Interviews | Price list lock |
| Battery trajectory | Diary readings consistent with ≥ 30 days at ≤ 30 utterances/day | P5 | Power budget validation |
| Hero thing | Bottle first choice ≥ 50% | Interviews, P2 | Launch packaging hero image |

Leading indicators after launch (still session‑based, since no analytics): quarterly 6‑family diary refresh; reading of Amazon reviews for words "annoying", "loud", "battery", "creepy" (target: each < 3% of reviews); return‑reason coding from the DTC store (target return rate < 3%, brief §7).

---

## 7. Timeline and staffing

| Weeks | Activity | Output |
|---|---|---|
| 1–3 | 18 parent interviews + 2‑teacher panel; concept clip + box mock | Persona validation, price curve, copy changes |
| 4–6 | P1–P4 play‑tests (n ≈ 24 kids) with demo mode + works‑like puck | Delight/distress line audit, personality direction, v1.2 things list |
| 6–8 | U1 setup sessions (n = 12) on the v1.0 PWA | Wizard fixes before release |
| 7–10 | P5 seven‑day diaries (n = 24 families) | Day‑7 engagement gate; noise defaults; battery trajectory |
| 11 | Synthesis, gate decisions, content re‑record list | Go/no‑go for studio week and DVT tooling |

Team: 1 lead researcher, 1 second researcher/observer per session, content lead attends P1–P3, hardware lead attends P5 kick‑offs. Budget **[E]**: incentives ≈ $6–8k, independent ethics review ≈ $2k, works‑like pucks (10) ≈ $4k.

---

## 8. Open items for the founder (recorded here, not blocking)

- Recruit country mix: US‑heavy (launch market) or balanced across UK/AU/IN? Plan assumes 50% US.
- Whether children's co‑designed lines (P3) may be *adapted* into the content pack under a signed release, or kept strictly as inspiration.
- Whether to add a Spanish‑ or Hindi‑speaking household cohort now (informs v1.1 packs) or wait.
