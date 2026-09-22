# Tagalong — Positioning and Messaging

| | |
|---|---|
| **Status** | v1 · plan of record for all outbound copy · 2026‑09‑22 |
| **Owner** | VP Marketing (positioning, voice, taglines) · Head of Sales (persona and objection sheets) · Legal (trademark, claims) |
| **Derives from** | `docs/00-product-brief.md` §1–3, §9 · ADR‑002/004/006/007 · `content/guidelines.md` |
| **Consistent with** | `docs/research/market-research.md` §4, §7, §9 · `docs/research/competitive-analysis.md` §3–5 · `docs/03-unboxing-and-packaging.md` §1, §3, §6 |
| **Gates** | Name decision due **15 Nov 2026** (roadmap §2, G0) · claims locked at **G2 (Apr 2027)** before artwork lock |

**How to use this document.** It is the source for every outbound word: site, box, Amazon listing, press kit, sales deck, creator briefs. Where this document and a product doc disagree about a *fact*, the product doc wins and this document is wrong. Where they disagree about *phrasing*, this document wins. The tag's own spoken lines are governed by `content/guidelines.md`, not by this file — they are two different voices (§9).

---

## 1. Positioning statement

> **For** parents of children aged 2–12 who want calmer routines and fewer lost bottles, and who will not put a camera, a microphone or an account in their child's day,
> **Tagalong** is a small waterproof talking tag that gives a child's own things a voice.
> **It** reacts to what actually just happened — filled, dropped, picked up, two minutes of brushing — in words written for that child's age, and it adapts as they grow.
> **Unlike** item finders, which report where things are, and cloud companions, which need an account, a subscription and a server that can be switched off,
> **Tagalong** collects nothing, because there is nothing on it that can collect: no microphone, no camera, no location, no account, no server, no analytics.

**One sentence (site hero, press, sales):** Strap it to a bottle, lunchbox, backpack or toothbrush, and the thing comes alive — private by design, no account, no cloud.

**Ten seconds (retail buyer, journalist, investor):** Parents already pay $100–150 for screen‑free kids' audio and $29 for a Bluetooth tag. Tagalong is a $29.99 tag that makes the child's *own* object into a character — it giggles when the bottle is filled, says "ouch" when it's dropped, and thanks the kid who picks it up. It has no microphone, no camera, no location and no server, so it satisfies every 2025–2027 children's privacy rule by construction rather than by promise.

### 1.1 Frame of reference

The shelf a buyer will put us on decides the objection we spend money answering. We choose the frame; if we do not, Amazon's "Bluetooth tracker" category will choose it for us.

| Frame | Consequence | Verdict |
|---|---|---|
| Bluetooth tracker / finder | Compared with AirTag on finding. We cannot find anything (ADR‑007). Losing frame. | **Reject.** Never use *find*, *locate*, *track*, *where*. |
| Smart water bottle | Compared with HidrateSpark on intake data. Ties us to one object; the product's whole point is that it moves. | **Reject.** |
| Screen‑free kids' character toy | Compared with Bitzee ($29.99), Furby ($69.99), Tonies/Yoto ($109–140). We win on price, privacy, and on being attached to the child's real things. | **Primary frame.** |
| Habit / routine helper for families | Compared with Skylight Buddy ($139 + $39/yr) and Hatch. We win on price, portability and no subscription. | **Secondary frame** — the reason to buy, once they know what it is. |

**Category line we use in listings and PR:** *a talking tag for kids' things.* Four words, no competitor owns it, and it contains no claim we cannot substantiate.

---

## 2. Brand pillars

Five pillars. Every asset must carry at least two, and pillar 3 appears on every first screen.

| # | Pillar | The claim, in parent words | Proof we can show |
|---|---|---|---|
| 1 | **The object is the character** | "The tag disappears. The bottle becomes Bottle Buddy." | 5 content packs, 513 cells, **2,052 written lines**, 4 per cell (`content/packs`); quarter‑turn cradle ring moves one tag between bottle, lunchbox, backpack, toothbrush, shoes, helmet, jacket, stuffed friend |
| 2 | **It reacts to real life** | "It knows it was filled, dropped, picked up, or brushed for two whole minutes." | Accelerometer + capacitive channel + ambient light + time; 20 event types (`docs/protocol/tag-protocol.md`); `brush_done` fires at a cumulative 120 s |
| 3 | **Structurally private** | "No microphone. No camera. No location. No account. No cloud. We literally can't see your data." | ADR‑002 (zero backend), ADR‑004 (no mic in v1), ADR‑007 (rotating private BLE address, no name or serial in advertising); Privacy Center lists everything stored and deletes it in one tap; the tag holds settings only, never a name as text |
| 4 | **Calm and kind by design** | "Silent at night, silent at school, one‑tap mute, a hard volume cap — and it never nags or shames." | Firmware cap **≤75 dB(A) at 25 cm** (toy limit is 85); **two independent quiet windows** — a night window (default 8 pm–7 am) and a school window with its own weekday mask, both held in the tag's own config (`docs/protocol/tag-protocol.md`); 12 utterances/hour default; `content/guidelines.md` §3 bans shame, fear, food and body talk |
| 5 | **Buy once, works forever** | "No subscription. No server to shut down. Charge it monthly." | Target ≥30 days per charge at 30 utterances/day; sealed Li‑Po, no coin cell; IP67; 100 × 1.5 m drops onto concrete; content and firmware update over Bluetooth from a static app |

**Pillar 3 is the wedge.** More than eight in ten parents say they worry about connected toys collecting children's data (market research §4). Every competitor either holds an account or uploads location. We are the only product in the landscape that can say *cannot* instead of *does not*.

---

## 3. Taglines

Scored 1–5 on: **Distinct** (nobody else could say it) · **True** (survives Legal and §10) · **Kid** (a seven‑year‑old repeats it) · **Trust** (a parent relaxes) · **Global** (translates into ES/HI without a pun tax).

| # | Line | Dist | True | Kid | Trust | Global | Use |
|---|---|---|---|---|---|---|---|
| **1** | **Give anything a voice.** | 5 | 5 | 5 | 3 | 5 | **Master brand line** |
| 2 | It talks. It doesn't track. | 5 | 5 | 3 | 5 | 4 | Shelf / listing qualifier |
| 3 | Your kid's stuff, but it talks back. | 4 | 5 | 5 | 2 | 3 | Social, creator briefs |
| 4 | Made to be funny. Built to be private. | 4 | 5 | 2 | 5 | 4 | Privacy campaign headline |
| 5 | The bottle that talks back. | 3 | 4 | 5 | 2 | 4 | Bottle‑pack ads only (too narrow for the brand) |
| 6 | No screen. No cloud. No kidding. | 3 | 5 | 3 | 5 | 2 | US/UK paid social; the pun does not travel |
| 7 | Nothing to hack. Nothing to hide. | 3 | 4 | 1 | 5 | 4 | Press kit, tech press |
| 8 | Every thing has something to say. | 4 | 5 | 4 | 3 | 5 | Brand film, retail endcap |
| 9 | Chores, but make it a friend. | 3 | 3 | 4 | 3 | 2 | Weak — reintroduces "chores". Do not use for `little` |
| 10 | A little voice for their favourite things. | 3 | 5 | 4 | 4 | 5 | ES/HI lead line (translates cleanly) |

**Recommendation: keep "Give anything a voice." as the master line, and pair it with "It talks. It doesn't track." wherever a shopper can mistake us for a finder.**

Reasons: it is already the north‑star line in the product brief and is designed into the sleeve face (`docs/03-unboxing-and-packaging.md` §3), so changing it costs artwork, not just words; it states the whole product in four words; it carries no claim to substantiate; and it survives the two localisations planned for v1.1. Line 2 is not a second brand line — it is a **disambiguator**, printed and pinned wherever AirTag adjacency is possible (Amazon title suffix, PDP first bullet, box front, retail shelf card). Line 4 leads the privacy campaign in month 2 of the launch plan.

**Lock‑up:** wordmark + master line. Never stack two lines. Never put a line inside a speech bubble — speech bubbles belong to the tag, and the tag never advertises.

---

## 4. Messaging by persona

The order of proof matters more than the words. Each persona below gets **one line**, then the **one proof** that closes them, and the thing that loses the sale.

### 4.1 Parent of a 2–4 year old (`little`)

| | |
|---|---|
| Job to be done | Get through the day with fewer battles, without a screen |
| Line | "It giggles when the bottle is filled, and it says 'ouch' when it's dropped. Six words, big laughs, no screen." |
| Proof that closes | The demo, with the age band set to **Little** — "Glug glug! I am full!" — plus *sealed battery, no coin cell, IP67, hand‑wash* |
| Loses the sale | Anything that sounds loud or over‑stimulating; any hint of a screen; small parts |
| Must say | Quiet hours are on by default; volume is capped in the hardware; there is no coin cell to swallow |
| Channel | Instagram and TikTok parent creators; gift guides; paediatric‑dentist and nursery waiting rooms (toothbrush pack) |

### 4.2 Parent of a 5–7 year old (`kid`)

| | |
|---|---|
| Job to be done | Independence at school; stop replacing bottles and jumpers |
| Line | "Your backpack notices when it's been sitting still on a school morning — and asks nicely, once." |
| Proof that closes | `left_behind` needs four conditions to fire and fires at most once every three hours (`docs/hardware/sensing-and-event-detection.md`); "asks, never nags" from the content guidelines |
| Loses the sale | Sounding like a nag, or sounding like a tracker; the school noise objection |
| Must say | **Classroom‑quiet**: quiet hours on a schedule, one‑tap mute, hard 75 dB cap |
| Channel | Back‑to‑school content (Aug–Sep US/UK, Jan–Feb AU); school‑parent Facebook groups; lunchbox and bottle creators |

### 4.3 Parent of an 8–12 year old (`big`)

| | |
|---|---|
| Job to be done | Habits without nagging, from a parent who has run out of reminders |
| Line | "Dry, not babyish. 'Hydration complete. Autographs later.' Your kid picks the personality." |
| Proof that closes | Three personalities, previewed in the wizard and in the demo; `big` lines capped at 12 words with no baby talk |
| Loses the sale | Anything that reads as a toy for toddlers; packaging that photographs young |
| Must say | The kid chooses the personality and can change it; changing personality is "a new toy" |
| Channel | Demo playground shared directly with the child; YouTube family channels; sibling‑set bundles |

### 4.4 Gift buyer (grandparents, aunts, uncles, godparents)

| | |
|---|---|
| Job to be done | A delightful gift that will not embarrass them by being hard to set up |
| Line | "Beautiful box, sixty‑second setup, no account to create. Press the button and it giggles in the shop." |
| Proof that closes | The unboxing: the kid's first press works with no phone, no app and no adult decision (`docs/03-unboxing-and-packaging.md` §4) |
| Loses the sale | "Download the app and create an account"; any mention of Bluetooth pairing as the first step |
| Must say | It works out of the box for the first laugh; the parent does the two‑minute setup later; **there is no subscription to inherit** |
| Channel | Q4 gift guides; grandparent‑targeted paid social; retail shelf; gift cards during pre‑order |

86% of US grandparents buy gifts, averaging $805 a year (market research §4). They are the second wallet and the least technical buyer, so the gift SKUs carry a different first sentence from the parent SKUs: **the box does the demo, not the phone.**

### 4.5 Channel audiences (not consumers — different sheet, same facts)

| Audience | Line | Proof they ask for |
|---|---|---|
| **Specialty retail buyer** | "A $29.99 impulse gift in the fastest‑growing US price tier, with a privacy story your customers are already asking for." | $30–69.99 tier grew 18% in 2025; certificates on file (ASTM F963, EN 71, FCC/CE/UKCA/RCM, IP67); packaging is paper‑only, FSC, no plastic window; demo needs no Wi‑Fi on the shop floor |
| **Journalist / reviewer** | "The connected kids' product that cannot collect anything — and the company could not change its mind without changing the hardware." | ADR‑002/004/007 published; zero‑network audit report; the app is static files and makes no runtime requests |
| **Paediatric dentist / practice** | "Two minutes of brushing, celebrated by the toothbrush, with no app for the child and no data leaving the family." | `brush_done` at a cumulative 120 s; no screen in the bathroom; **no clinical claims** (§10) |
| **School / occupational‑therapy buyer** | "A routine cue that lives on the child's own things, silent during class hours by default." | Quiet‑hours schedule preset; ≤75 dB cap; no location, no account, nothing for a district privacy review to assess |

---

## 5. Objection handling

Answers are written to be said out loud, in three sentences or fewer. The **never say** column is as binding as the answer.

### 5.1 "Is it a tracker? Can I find the bottle with it?"

> **No — and that is deliberate.** Tagalong has no GPS and no finding network; it cannot tell you or anyone else where anything is. It is a voice for your child's things, not a locator, so it can never be turned against a child.

**Proof:** ADR‑007 — the tag advertises only in a 60‑second pairing window or briefly after motion, from a private address that rotates every 15 minutes; no name, no serial, no location in the advertisement.
**Then pivot:** "What it does instead is speak up when it has been sitting still on a school morning — which is usually what you actually wanted."
**Never say:** find, locate, track, tracker, monitor, "know where", "keep tabs". Never appear in a comparison chart against AirTag or Tile. US state tracker‑misuse laws and the DULT anti‑stalking alerts are a reason to stay out of that category entirely, not a feature gap to apologise for (market research §7).

### 5.2 "What about our privacy? Is it listening?"

> **There is no microphone and no camera in it.** It reacts to movement, touch, light and time — that is all the hardware can do. Everything you set up lives in the app on your phone; there is no account and no server of ours, so there is nothing for us to see, sell or lose.

**Proof:** ADR‑004 (no audio input path exists in v1 hardware); ADR‑002 (no backend, no analytics, no crash reporting, no third‑party code); the Privacy Center lists every stored item and deletes all of it in one tap; the tag stores age band, thing, personality, sound settings — never a name as text, never a place.
**Escalation for the sceptical parent:** "The app is static files with no network permission it can use at runtime. Our own support team cannot look up your child; there is no database to look in." Point them at the published privacy notice (grade‑6 reading level) and the ADRs.
**Never say:** "we don't sell your data" (implies we hold it), "bank‑grade encryption", "anonymised", "we take privacy seriously". Say *cannot*, not *won't*. See also §10 on the shop and marketing site — never claim "no analytics anywhere".

### 5.3 "How's the battery? I'm not charging another thing."

> **About a month on a charge**, then it snaps onto its magnet for a couple of hours. It tells you when it is getting sleepy, and it keeps working on Bluetooth even when it has gone quiet.

**Proof:** 150 mAh sealed Li‑Po; target ≥30 days at 30 utterances per day; warns gently once a day at 15%, goes silent at 5%; magnetic two‑pin charger, no port to poke, no coin cell to swallow (ADR‑005).
**The honest edge:** a tag that gets talked to all day charges sooner. Say so — "a very chatty week is more like three".
**Never say** a battery number in weeks or days in any published asset until the EVT power measurements are signed (G1, Jan 2027). Until then: "designed for about a month between charges" is the ceiling of what marketing may print (§10).

### 5.4 "It's another gadget. One more thing to lose, charge and argue about."

> It is not a new thing in the house — it is a voice for the things you already bought. One tag moves between the bottle, the lunchbox, the backpack and the toothbrush with a quarter turn, so it follows what your child actually cares about this month.

**Proof:** the cradle‑ring mount system; nine thing types in the app today; personality switch reads as a new toy; no screen, no app for the child, nothing to feed.
**Then reframe the gadget fear:** "It has one button and one light. If you never open the app again, it keeps working."
**Never say** "smart", "AI", "connected ecosystem", "companion platform". The word *gadget* is their word; do not adopt it.

### 5.5 "$29.99 for a tag?"

> It is the price of an AirTag and it does something a bottle can't: it turns the bottle your child already loves into a character. Buy once, keep forever — no subscription, no account, and nothing that stops working if we do.

**Proof:** $29 AirTag / $29.99 SmartTag2 / $29.99 Bitzee anchors; competitors charge $5–18 a month (Jiobit, Gabb, Fitbit Ace, Hatch, Skylight, Miko); Moxie's $799 robot was bricked when its cloud shut down in December 2024.
**If they still hesitate:** move them to value, not discount — the 2‑pack at $49.99 ("the real gift price"), or the Mount kit so one tag serves four objects.
**Never** discount the 1‑pack below MAP to win a single sale; the $30–69.99 tier is growing and sub‑$20 toys are declining (market research §4.1). Price is a positioning instrument, not a lever.

### 5.6 "It'll be noisy. Our school has banned water bottles."

> Volume is capped in the hardware, below the toy standard. It has **two quiet windows** — one for the night and a separate one for school hours, on the weekdays you choose — and a double tap mutes it for an hour. It speaks when something happens, never on a timer.

**Proof:** ≤75 dB(A) at 25 cm firmware clamp with an end‑of‑line test (the EN 71 limit is 85); the school window and its weekday mask live in the tag's own configuration, so the tag stays silent in class even with the phone switched off or out of range, and a parent can turn it off in the holidays without losing bedtime quiet (`docs/protocol/tag-protocol.md`); 12 utterances/hour default; `left_behind` at most once in three hours; **Classroom‑quiet** printed on the sleeve.
**For teachers specifically:** offer the mute gesture and the silent‑during‑class preset in the first sentence. Several US districts banned stainless bottles over classroom disruption in 2025 — that is our objection to pre‑empt, not theirs to raise.

### 5.7 "I have an iPhone."

> The app pairs tags on Android today; the iPhone app follows in the 1.1 update. Everything else — the demo, the content, the setup — is identical, and you can try the whole experience on your iPhone right now in the browser.

**Proof:** ADR‑001 — Web Bluetooth is not in iOS Safari, so iOS pairing ships in a Capacitor app (target July 2027); the same codebase, no rewrite, no new hardware.
**Commercial rule:** until the iOS app ships, **do not spend US acquisition budget against iPhone audiences.** Say this in every creator brief. An iPhone household that pre‑orders and cannot pair is a refund, a one‑star review and a lost advocate.
**Never** imply iOS pairing exists. Never hide it either; the disclosure goes above the buy button, not in the FAQ.

### 5.8 "Won't they get bored in a week?"

> There are 2,052 written lines, four or more for every situation, and it never repeats the last three. It changes as your child grows — the words for a three‑year‑old are not the words for a ten‑year‑old — and switching the personality feels like a new toy.

**Proof:** ADR‑006 (3 bands × 3 personalities × thing packs); no‑repeat selection; event‑driven rather than scheduled speech; seasonal and new packs over Bluetooth from v1.1.
**Internal honesty:** novelty decay is our most likely failure mode (market research §9, competitive analysis §4). Marketing does not paper over it — the 7‑day diary study has a published kill criterion, and the answer to a bored kid is a content patch, not a louder ad.

---

## 6. Tone of voice

Tagalong has **two voices** and they must never blend.

| | **The tag's voice** | **The brand's voice** |
|---|---|---|
| Speaks to | The child | The parent, buyer or reporter |
| Governed by | `content/guidelines.md` (Content owns it) | This document (Marketing owns it) |
| Sounds like | Short. Warm. Surprising. "Bonk! Still standing, captain." | Calm, plain and specific. "Volume is capped in the hardware." |
| Exclamation marks | Yes, often | Almost never — only inside a quoted tag line |
| First person | "I'm full!" | "We" only for commitments; otherwise write about the product |
| Register | 2–12 years old | Grade 6 reading level for anything privacy, safety or legal |

**The brand voice in eight rules.**

1. **Numbers beat adjectives.** "≤75 dB at 25 cm" not "gentle volume". "2,052 lines" not "tons of content".
2. **Say *cannot*, not *won't*.** Our privacy claims are architectural. Using the language of promises throws away the whole advantage.
3. **Short sentences. One idea each.** If a sentence needs a comma to survive, it needs a full stop instead.
4. **Verbs first, sentence case.** Matches the app's own copy rules (`design-spec.md` §5) so the box, the site and the screen never sound like three companies.
5. **Name the thing, not the technology.** "The bottle notices" beats "capacitive sensing detects". "Bluetooth" is allowed; "GATT", "BLE", "RPA", "nRF52840" are for the spec table and nowhere else.
6. **Lead with the child's experience, close with the parent's control.** Giggle first, quiet hours second. Never the reverse.
7. **Admit the edges.** Android first. It does not find anything. A chatty week charges sooner. Every honest limit we publish buys a privacy claim that is believed.
8. **Never be cute about privacy.** Jokes belong to the tag. A parent reading the privacy section wants plain sentences and a full stop.

**Word list.**

| Use | Avoid, and why |
|---|---|
| tag, talking tag, thing, character, personality, age band | *smart* (meaningless and cloud‑coded), *AI* (we have none), *IoT*, *device ecosystem* |
| notices, reacts, speaks up, says hi, giggles | *tracks*, *finds*, *locates*, *monitors*, *detects your child*, *knows where* |
| asks once, invites, celebrates | *reminds*, *nags*, *alerts*, *warns*, *makes them* |
| quiet hours, school hours, mute, volume cap | *loud*, *alarm*, *notification*, *buzzer* |
| stays on your phone, nothing to collect, no account | *we don't sell your data*, *anonymised*, *bank‑grade*, *military‑grade*, *we take privacy seriously* |
| drinks more water when it's fun *(never as a claim — see §10)* | *healthy*, *unhealthy*, *hydration goals*, *screen time is bad*, any food or body framing |
| for ages 2–12 *(pending the age‑grade decision)* | *for toddlers*, *for babies*, *educational*, *developmental*, *therapeutic* |

**Three examples, rewritten.**

| Draft | Fixed |
|---|---|
| "Tagalong is a smart AI companion that helps your child build healthy hydration habits." | "Tagalong gives your child's water bottle a voice. It giggles when it's filled and says 'ouch' when it's dropped." |
| "We take your family's privacy seriously and never sell your data." | "There is no microphone, no camera and no account. Nothing about your child leaves your phone, because there is nowhere for it to go." |
| "Never lose a bottle again — Tagalong keeps track of your kid's stuff!" | "It talks. It doesn't track. When the backpack has been sitting still all morning, it says so — once." |

---

## 7. Proof architecture

Every claim in outbound copy maps to one of four proofs. If a claim has no proof in this table, it does not ship.

| Proof | What it is | Where it lives |
|---|---|---|
| **The demo** | The playground in the shipped app: pick a thing, an age band and a personality, tap Fill or Drop, hear the line. Works on any phone, including iPhone, with no hardware and no account. | `app/src/features/demo` — public at pre‑order open (Mar 2027) |
| **The architecture** | Published ADRs and a zero‑network audit. A reader can verify the claim without trusting us. | `docs/adr/`, `docs/privacy/` |
| **The certificates** | ASTM F963, EN 71 (incl. acoustics), CPSIA/CPC, FCC/ISED/CE‑RED/UKCA/RCM, IP67, IEC 62133‑2 + UN38.3 | On file at G3 (May 2027); summarised on the site |
| **The content** | 2,052 lines a buyer can read; the guidelines that produced them | `content/packs`, `content/guidelines.md` |

**The demo is the marketing asset of this launch.** It removes the hardware from the critical path of every campaign: creators can make real content eight months before a tag exists, and iPhone parents can experience the product they cannot yet pair. Treat demo quality as a marketing deliverable, not an app nicety.

---

## 8. Message hierarchy by surface

| Surface | First thing | Second | Third | Never |
|---|---|---|---|---|
| Site hero | Give anything a voice. | 8‑second demo video | No mic, no camera, no account | Spec numbers |
| Amazon title/bullets | Talking tag for kids' bottles, lunchboxes, backpacks and toothbrushes | It talks. It doesn't track. | No account, no subscription, quiet hours | The word *tracker* in any field, including back‑end keywords |
| Box sleeve | Give anything a voice. | No microphone. No camera. No account. | Classroom‑quiet: quiet hours, one‑tap mute, 75 dB cap | Battery weeks before G1 |
| Creator brief | The reaction shot | The personality switch | "Ask them to read the privacy card on camera" | Scripted superlatives; undisclosed paid posts |
| Press kit | The company that cannot collect | Architecture and ADRs | Price, dates, markets | Roadmap features as if shipped |
| Retail shelf card | It talks. It doesn't track. | Three example lines | Ages, price, what's in the box | Anything requiring Wi‑Fi to demonstrate |

---

## 9. Claims discipline

A children's product's advertising is regulated in every launch market, and the CPSC/ASA/ACCC all read packaging as advertising. **Green** = usable today. **Amber** = usable only after a named gate. **Red** = never.

| Claim | Status | Condition / substitute |
|---|---|---|
| "No microphone. No camera." | **Green** | ADR‑004; verifiable by teardown |
| "No account, no cloud, no analytics *in the tag and the app*" | **Green** | ADR‑002. Must be scoped to the product — see the shop caveat below |
| "Nothing about your child leaves your phone" | **Green** | ADR‑002 |
| "It cannot tell anyone where your child is" | **Green** | ADR‑007 |
| "Waterproof" / "IP67" | **Amber** | Only after the IP67 report (Mar 2027). Until then: "designed to survive the sink and the school bag". Never "dishwasher safe" — the leaflet says hand‑wash only |
| "About a month between charges" | **Amber** | Only after EVT power measurement at **G1**. No day or week number in print until then |
| "It knows when it's filled" | **Amber** | Depends on the EVT bottle‑material test. If cap‑sense fails on metal bottles, narrows to "on plastic bottles" in the same words on box, site and app (roadmap §8) |
| "Survives a 1.5 m drop" | **Amber** | After DVT reliability (Feb–Mar 2027); state the protocol, not a vibe |
| "Ages 2+" | **Amber** | Age grade is 2+ target, 3+ fallback, decided after the December small‑parts pre‑check. Marketing copy uses the age **bands** ("Little / Kid / Big kid") until the grade is fixed |
| "Helps kids drink more water" / "builds healthy habits" | **Red** | A behavioural health claim we have not measured, and food/body framing is banned by the content guidelines. Say what it does: "celebrates the two minutes" |
| "Improves brushing" / anything dental | **Red** | No clinical claims in any channel, including the paediatric‑dentist channel. It celebrates the timer; it does not treat anything |
| "Educational" / "developmental" | **Red** | Unsubstantiated and invites a different regulatory frame |
| "Find", "locate", "track", "keep tabs on" | **Red** | ADR‑007 makes it false, and it invites tracker‑misuse scrutiny |
| "Subscription‑free forever" | **Green, with care** | True and differentiating. Pair with the published support period (see below) so it is a commitment, not a slogan |

**Two disclosures we make before anyone asks.**

1. **Android first.** Pairing needs Android 10+ with Chrome or Edge at v1.0; the iPhone app is in the 1.1 update. This sits above the buy button on every page and in the first three bullets of every listing.
2. **The shop is a shop.** The tag and the app collect nothing. The marketing site and the store are ordinary web properties on a **separate origin** from the app, and they use cookieless, self‑hosted measurement with no third‑party advertising pixels. Never write "we have no analytics anywhere" — write "the tag and the app collect nothing" and link to the site's own short notice. Attribution for paid media runs on promo codes and post‑purchase surveys, not pixels. *This needs a founder ack alongside PRD §14 Q6–Q7; it is a marketing decision with a brand‑promise edge.*

**Support commitment (needed for UK PSTI and EU CRA, and it is good marketing):** publish a security‑update period of **five years from the last date of sale**, a vulnerability‑disclosure address and a `security.txt`. "Works forever" is credible only next to a date.

---

## 10. Trademark risk: "Tagalong"

**Assessment: moderate‑to‑high risk as a word mark, and weaker than it looks.** This is a marketing opinion for planning, not a legal clearance opinion; the searches below have not been run (the brief records the search as pending). Counsel must clear the name before **15 Nov 2026**.

| Risk | Why it matters | Severity |
|---|---|---|
| **Suggestive‑to‑descriptive of the goods** | The product *is* a tag that *tags along*. A mark that describes the goods is harder to register in the relevant classes, narrower to enforce, and cheap for a copycat to skirt. This is the risk most often missed, and it is the one that matters over ten years. | **High** |
| **Crowded field in general commerce** | "Tagalong" / "Tag‑A‑Long" is a common English compound used across tours, trailers, pet products, children's clothing and media. Expect prior users and a busy search report. | **High** |
| **A well‑known food mark in Class 30** | A widely recognised US cookie brand uses the plural form and is actively enforced. Different class from toys and consumer electronics, but well‑known marks attract broad opposition and consumer‑confusion arguments, and an opposition costs months we do not have before artwork lock. | **Medium** |
| **Domain and handle scarcity** | The exact‑match `.com` and clean social handles are unlikely to be available, forcing a compound domain — which weakens paid search and word‑of‑mouth. | **Medium** |
| **Amazon Brand Registry timing** | Registry needs a registered or pending mark (IP Accelerator route). Filing late pushes Brand Registry past the February 2027 listing prep and costs us A+ content and brand protection at launch. | **Medium — schedule risk** |

### 10.1 What a rename actually costs

Cheap now, expensive after two dates. Both are earlier than people assume.

| Asset | Cost to rename | Deadline |
|---|---|---|
| **The 2,052 recorded lines** | **Zero.** The content guidelines ban brand names, and the packs contain no occurrence of the product name — verified. A rename does not force a re‑record. | — |
| Firmware advertised BLE name | Near zero **if decided before firmware 0.1** (Oct 2026). The app already holds the name as one constant (`ADVERTISED_NAME` in `app/src/transport/uuids.ts`) and the protocol doc specifies `Tagalong` as the advertised name. After firmware, factory images and the protocol version are in play. | **firmware 0.1, Oct 2026** |
| App strings, manifest, icons, export‑file text | ~33 occurrences across 16 files; a day of work | Before the public PWA (Mar 2027) |
| Box, sleeve, cards, leaflet, Pantone artwork | Full artwork cycle | **Artwork lock, Mar–Apr 2027** |
| Domains, handles, Brand Registry, App Store name | Weeks of lead time each | Before pre‑order open (Mar 2027) |

**Therefore: the name decision is gated by firmware, not by packaging.** Bring the decision forward to **15 Oct 2026** or make the advertised name a build‑time constant in the firmware from day one so the decision can slip to November without rework. The second option is one line of firmware and is the recommendation.

### 10.2 Five alternates

Coined, sound‑symbolic names are the strongest trademark class and the easiest to own in nine jurisdictions. The first three are the brief's own alternates and are kept for continuity; the last two are proposed here because they score better on distinctiveness.

| # | Name | Why it works | Known risk | Fit |
|---|---|---|---|---|
| 1 | **Bloop** | Sound‑symbolic, coined in this use, two‑phoneme, says what the product does. The tag already says "Bloop! Yum!" in the shipped bottle pack, so the name and the content reinforce each other. Travels into ES and HI without a pun tax. | Used by some apps and small consumer brands; needs Class 9/28 clearance | **Strongest of the five** |
| 2 | **Gigglet** | Coined from the product's first promise ("first reaction must be a giggle"); warm, distinctly kid without being babyish; ownable | "Giggle" is a crowded root in children's goods; the coined suffix is what carries registrability | Strong |
| 3 | **Pipsy** | From the brief. Coined, distinctive, easy for a two‑year‑old to say | Reads young; may not carry the 8–12 `big` band | Medium |
| 4 | **Blip** | From the brief. Short, memorable, technical‑warm | Heavily used across tech and media; expect a crowded field and a compound domain | Medium‑low |
| 5 | **Chatterbug** | From the brief. Says "talks" and "small and friendly" in one word | A known language‑learning company operates under this name; likely conflict in adjacent classes | **Low — deprioritise** |

For any alternate, budget a **stylised composite mark** (wordmark + the face device) as well as the word mark. The face — two dots and a mouth on a thing icon — is the most defensible asset the brand owns, is already built (`app/src/design/components/Face.tsx`), and should be filed as a figurative mark regardless of which name wins.

### 10.3 Clearance checklist

Legal owns rows 1–6; Marketing owns 7–12. Nothing below is optional, and the whole list runs for the incumbent name **and** the top two alternates in parallel — running them in series is what turns a rebrand into a slipped launch.

| # | Step | Classes / scope | Owner | Due |
|---|---|---|---|---|
| 1 | Knock‑out search: identical and near‑identical marks | USPTO, UKIPO, EUIPO, IP Australia, CIPO, India TM registry | Legal | **1 Oct 2026** |
| 2 | Full availability search and written opinion | **Class 9** (electronic apparatus, downloadable software), **Class 28** (toys, playthings) — add Class 41 only if content becomes a service | Trademark counsel | **22 Oct 2026** |
| 3 | Common‑law and marketplace sweep | Amazon, Etsy, Walmart, App Store, Google Play, Kickstarter, Companies House / state registries, GitHub | Legal + Marketing | 22 Oct 2026 |
| 4 | Well‑known‑mark and opposition‑risk review, incl. plural and hyphenated variants | All launch markets | Counsel | 29 Oct 2026 |
| 5 | File intent‑to‑use applications for the winner and one backup | US (1(b)), UK, EU, AU, CA; Madrid where cheaper | Counsel | **within 5 days of the decision** |
| 6 | Amazon Brand Registry via IP Accelerator on the pending mark | US, UK, AU, CA | Legal + Sales | **Dec 2026** (must precede Feb 2027 listing prep) |
| 7 | Domain acquisition: exact `.com` plus defensive `.co`, `.app`, country TLDs for launch markets | — | Marketing | within 48 h of the decision |
| 8 | Social handles on Instagram, TikTok, YouTube, Pinterest, Reddit, Facebook | — | Marketing | within 48 h |
| 9 | Linguistic and vulgarity screen in **ES (LatAm) and HI**, plus a native‑speaker pronunciation check | v1.1 markets | Marketing + content reviewers | before filing |
| 10 | Pronunciation and spell‑back test with 20 parents and 10 kids: hear it once, spell it, type it | US/UK | Marketing | before filing |
| 11 | App Store and Play name availability, plus PWA manifest name | — | Marketing + App | before Mar 2027 |
| 12 | Standing watch service on the registered mark and marketplace copycat monitoring | All markets | Legal | from grant |

**Contingency (write it down now, do not improvise it in March).** If counsel returns a "high risk" opinion after 15 Nov 2026: the launch name becomes the highest‑scoring cleared alternate; the master line "Give anything a voice." and the face device carry all brand recognition across the change; the `other` thing type's nickname list in the app (which currently suggests "Tagalong") and the advertised BLE name are updated in the same commit; no content is re‑recorded.

---

## 11. Assumptions and open decisions

| # | Assumption or decision | Owner | Needed by |
|---|---|---|---|
| A1 | The master line "Give anything a voice." is fixed and will not be re‑litigated after artwork lock | Founder | G0 |
| A2 | The marketing site and store are a separate origin from the app and may use cookieless self‑hosted measurement and no third‑party pixels; the product's zero‑collection claim is always scoped to "the tag and the app" | Founder + Marketing | **Oct 2026** (before the waitlist page ships) |
| A3 | No paid acquisition against iPhone audiences in the US until the v1.1 App Store release | Marketing | standing |
| A4 | Age‑grade copy uses bands, not "2+", until the small‑parts pre‑check resolves | Marketing + Compliance | Dec 2026 |
| A5 | Battery, IP67, drop and fill claims stay in Amber until their gate; no exceptions for a launch deadline | Marketing + Compliance | G1 / G2 |
| A6 | The advertised BLE name becomes a firmware build‑time constant, so the trademark decision can slip to 15 Nov without firmware rework | Firmware | **firmware 0.1, Oct 2026** |
| A7 | A published five‑year security‑support period accompanies the "works forever" message | Founder + Compliance | before pre‑order open |
| A8 | The face device is filed as a figurative mark in parallel with whichever word mark wins | Legal | with the filing |
