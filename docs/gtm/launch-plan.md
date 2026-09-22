# Tagalong — Launch Plan, Days 0–90

| | |
|---|---|
| **Status** | v1 · plan of record · **Day 0 = 2026‑09‑22 · Day 90 = 2026‑12‑21** |
| **Owner** | VP Marketing (brand, audience, PR, creators) · Head of Sales (channels, retail, Amazon) · Founder (name, price, go/no‑go) |
| **Derives from** | `docs/02-roadmap.md` §3 (Oct–Dec 2026 GTM rows), §9 (gates) · `docs/gtm/positioning-and-messaging.md` · `docs/gtm/pricing-and-packaging.md` |
| **Consistent with** | `docs/research/market-research.md` §5, §6, §9 · `docs/research/competitive-analysis.md` §5 |

---

## 1. What "launch" means in this window

**Hardware ships in May 2027. Pre‑orders open in March 2027. Nothing can be sold in the next 90 days.** Any plan that treats this window as a product launch will spend the launch news cycle eight months early and arrive at May 2027 with an audience that has forgotten us.

The window has exactly four jobs. Everything below serves one of them.

| # | Job | Why it is in this window and not later |
|---|---|---|
| 1 | **Clear and file the name** | It gates the domain, the Amazon Brand Registry, the App Store name, the box artwork — and, less obviously, the firmware's advertised Bluetooth name, which is written in October (`positioning-and-messaging.md` §10.1). Decision due **15 Nov 2026** |
| 2 | **Build an owned audience of 15,000 parents** | The pre‑order in March converts a list, not a cold market. A list takes months; it cannot be bought in four weeks |
| 3 | **Turn the demo into the marketing engine** | The shipped app's demo playground is a complete product experience with no hardware. It lets creators, press, retail buyers and iPhone parents experience the product **eight months before a tag exists.** No competitor's asset works this way |
| 4 | **Decide the funding and channel architecture** | Kickstarter vs pre‑order (§2), Amazon's role (§7) and the retail horizon (§8) all change what we build in Q1 2027. Deciding them in February is deciding them late |

**One sentence to the team:** in these 90 days we are not selling a tag, we are building the list, the name and the proof that make March's pre‑order convert.

### 1.1 The three launches

| Launch | When | Audience | Success |
|---|---|---|---|
| **L1 · Brand and waitlist** | Oct–Dec 2026 (this plan) | Parents who already buy screen‑free and privacy‑minded kids' products | 15,000 emails, name filed, 50 creator pieces |
| **L2 · Pre‑order** | Mar 2027, on DVT units and the public PWA | The list, plus one press exclusive | 3,000 pre‑orders; the founding cap fills |
| **L3 · GA** | May 2027, DTC + Amazon US, then UK/CA/AU | Everyone | 10,000 units in six months (brief §7); 4.7★ |

---

## 2. Kickstarter or pre‑order

**Recommendation: no Kickstarter. Open a deposit‑based pre‑order in March 2027, after DVT units exist. Fund the tooling with equity or debt, not with parents' money.**

| | Kickstarter (Nov 2026, pre‑EVT) | Deposit pre‑order (Mar 2027, post‑DVT) |
|---|---|---|
| Capital raised | $150–400k before fees, non‑dilutive | ~$15k of refundable deposits. Not financing |
| Platform cost | 8–10% (5% platform + 3–5% payment) | 2.9% + $0.30 |
| Validation quality | Strong — real money against a promise | Strong — real money against a working demo and a dated ship date |
| Press | One reliable cycle, but a *crowdfunding* cycle | One cycle, framed as a company shipping a product |
| **Brand fit** | **This is the disqualifier.** Our entire positioning is "no subscription, no server to die, we will not disappear." 61% of crowdfunded hardware ships late and 9% never delivers. Asking parents of two‑year‑olds to prepay a promise is the exact trust posture we are selling against — and the Moxie shutdown made "what happens if the company dies?" a mainstream parent question | Consistent. A dated ship date, a refundable deposit, and a product a buyer can already hear |
| Claim risk | In November we cannot yet substantiate battery life, IP67, drop survival, fill detection on metal bottles, **or the age grade** (the small‑parts pre‑check is December). A campaign page is advertising; every Amber claim in `positioning-and-messaging.md` §9 would have to be either broken or omitted | By March, EVT and DVT have converted the Ambers into measurements |
| Roadmap damage | Stretch goals and backer votes fragment a single‑hardware‑revision plan (roadmap §1 principle 1) | None |
| Price damage | Backer pricing anchors below MSRP permanently and is public forever | A capped, named founding price expires |

Market research reached the same conclusion from the finance side: *"no crowdfunding — sell demo‑mode pre‑orders only after DVT"* (§9 risk 4). This plan adopts it as policy.

**Pre‑order mechanics, specified now so Q1 can build it.**

- **$5 fully refundable deposit**, credited to the order. Card charged in full only when the unit is boxed and has a tracking number. This keeps us clear of the FTC Mail‑Order Rule's 30‑day shipping obligation and the equivalent UK/AU rules, and it means a slipped gate costs us an apology, not a refund crisis.
- **Founding price $24.99 on the 1‑pack, first 3,000 units, once, never repeated** (`pricing-and-packaging.md` §5.3). Cost: $4.53 of contribution per unit, ≈$13.6k in total — which buys 3,000 committed customers and a real forecast for the 10k MP order. At a $1.20 target cost per waitlist email that is the cheapest acquisition available to us.
- Deposits held in a segregated account, refundable in one click, stated on the page in the brand voice.
- **Go/no‑go trigger:** if the list is under **35,000** at pre‑order open, the 3,000‑unit founding cap will not fill, and the 10k MP quantity is re‑examined at G2 before the PO is placed.

---

## 3. The 90 days

Three sprints. Each has a dated exit criterion; a sprint that misses its exit is reported at the next gate rather than quietly absorbed.

### Sprint 1 · Days 0–30 · 22 Sep – 21 Oct 2026 — **Name, foundations, decisions**

| # | Deliverable | Owner | Due |
|---|---|---|---|
| 1.1 | Knock‑out trademark search on the incumbent name and the top two alternates, five jurisdictions (`positioning-and-messaging.md` §10.3 rows 1–3) | Legal | 1 Oct |
| 1.2 | **Firmware instruction: the advertised Bluetooth name is a build‑time constant**, so the naming decision can land in November without firmware rework | VP Marketing → Firmware | **5 Oct** |
| 1.3 | Positioning and messaging signed off as binding for all outbound copy | Founder | 8 Oct |
| 1.4 | **Kickstarter‑vs‑pre‑order decision recorded** (this document, §2) | Founder | 8 Oct |
| 1.5 | Marketing‑measurement policy decided: separate origin, cookieless self‑hosted analytics, no third‑party pixels, claim always scoped to "the tag and the app" (`positioning-and-messaging.md` §9 A2) | Founder | 8 Oct |
| 1.6 | Full availability search and written opinion, Classes 9 and 28 | Counsel | 22 Oct |
| 1.7 | Brand identity kickoff — wordmark, the **face device**, lock‑up, guidelines. The palette and thing icons already exist in `app/src/design`; the brand is extracted from the product, not invented beside it | VP Marketing | 12 Oct |
| 1.8 | Waitlist landing page live on a holding domain (§5), with the demo embedded | VP Marketing | **21 Oct** |
| 1.9 | Creator long‑list: 250 parent creators scored on niche, audience geography, Android share, brand safety | Marketing | 21 Oct |
| 1.10 | Press map: 60 named journalists across privacy/tech, design, parenting, trade; no outreach yet | Marketing | 21 Oct |
| 1.11 | GS1 company prefix purchased (real prefix — Amazon rejects resold barcodes); Amazon Professional seller account opened | Sales | 21 Oct |
| 1.12 | Retail target list: 40 specialty accounts across US/UK/AU + 3 rep groups, with 2028 assortment calendars | Sales | 21 Oct |

**Exit:** page live, name opinion in hand, pre‑order decision recorded, 1,500 emails.

### Sprint 2 · Days 31–60 · 22 Oct – 20 Nov 2026 — **Name landed, audience engine running**

| # | Deliverable | Owner | Due |
|---|---|---|---|
| 2.1 | **Name decision and intent‑to‑use filings** in US/UK/EU/AU/CA for the winner and one backup | Founder + Counsel | **15 Nov** |
| 2.2 | Domains, social handles, App Store and Play name reservations within 48 h of the decision | Marketing | 17 Nov |
| 2.3 | Brand identity delivered; site rebuilt on the real name | Marketing | 20 Nov |
| 2.4 | **Demo Drop wave 1**: 15 micro‑creators live (§6) | Marketing | 10 Nov |
| 2.5 | Paid social learning test, $20k, Android‑targeted only, message‑test four hooks (§9) | Marketing | 30 Oct – 20 Nov |
| 2.6 | "Voice Notes" letter issue 1 and 2 shipped to the list (§8.3) | Marketing | 6 + 20 Nov |
| 2.7 | One thought‑leadership placement pitched and placed (§7.2) | PR | 20 Nov |
| 2.8 | Amazon: browse‑node and keyword research, with the **"tracker" keyword exclusion list** written down; A+ content wireframes | Sales | 20 Nov |
| 2.9 | 15 retail buyer conversations held **with the demo on a phone** — no sample needed | Sales | 20 Nov |
| 2.10 | Pre‑order page specification and the deposit/refund flow written for Q1 build | Marketing + Sales | 20 Nov |

**Exit:** name filed, 7,000 emails, cost per email ≤$1.40, four hooks ranked with real data.

### Sprint 3 · Days 61–90 · 21 Nov – 21 Dec 2026 — **Proof, Q4 attention, and a forecast**

December is when the product becomes real internally: the EVT build lands, the studio records 2,052 lines with three voices, and ten families use EVT units in a supervised closed beta. It is also the biggest attention window of the year and we have nothing to ship. The gift card is the answer.

| # | Deliverable | Owner | Due |
|---|---|---|---|
| 3.1 | **Demo Drop wave 2**: 35 more creators, including 10 in the 8–12 "big kid" niche | Marketing | 8 Dec |
| 3.2 | **Gift card presell live** ($35 / $55, DTC, redeemable at GA) with a printable card so it can go under a tree | Marketing + Sales | **1 Dec** |
| 3.3 | Q4 "notify me / gift it now" push to the list and to creator audiences | Marketing | 1–20 Dec |
| 3.4 | Commentary placement timed to the Australian Children's Online Privacy Code (final due **10 Dec 2026**) — a live news hook inside our window (§7.2) | PR | 10 Dec |
| 3.5 | First real footage: EVT units filmed under NDA by us, not by the study families (§6.4) | Marketing | 18 Dec |
| 3.6 | Amazon **Brand Registry** application filed on the pending mark via IP Accelerator | Sales | 18 Dec |
| 3.7 | Waitlist survey fielded: age bands, phone OS, price top‑2‑box, reason‑to‑buy ranking | Marketing | 12 Dec |
| 3.8 | 15 further retail conversations; 8 accounts qualified for a **Q4 2027 or 2028** assortment | Sales | 18 Dec |
| 3.9 | Photography and film plan for DVT units (shoot in March, the first units with production colours) | Marketing | 18 Dec |
| 3.10 | 90‑day report into the **G0/G1 gate pack**: list size, cost per email, hook ranking, price test, Android share, forecast for the 10k PO | VP Marketing | **21 Dec** |

**Exit:** 15,000 emails, 50 creator pieces live, Brand Registry filed, a forecast the founder can put against the MP order.

---

## 4. Message sequence across the window

| Weeks | Hook | Asset | Why now |
|---|---|---|---|
| 1–4 | "Give anything a voice." | The demo | Curiosity before credentials. Nobody has seen this before |
| 5–8 | "Made to be funny. Built to be private." | Privacy explainer + ADRs | Once they want it, remove the reason not to want it |
| 9–11 | "It talks. It doesn't track." | Side‑by‑side with the finder shelf | Pre‑empt the AirTag mis‑frame before Q4 shopping habits form |
| 12–13 | "Give it now, it arrives in May." | Gift card | December is attention; a gift card converts it |

---

## 5. Waitlist landing page

Full copy is in `landing-page-copy.md` (§10 there is the waitlist variant). This section is the build spec.

| Requirement | Detail |
|---|---|
| **Origin** | Separate domain from the app. The app stays zero‑network; the site is an ordinary website and says so in one line |
| **Stack** | Static, self‑hosted. **No third‑party scripts, no advertising pixels, no hosted fonts.** Cookieless self‑hosted analytics with IP truncation |
| **The hero is the demo** | An 8‑second autoplaying muted loop of the phone speaking a line, with a tap‑to‑hear control, and a prominent **Try the demo** button opening the real app. The demo is the product; do not replace it with a render |
| **Signup** | Email only. One optional question — "Which phone do you use?" — because the Android/iOS split determines v1.0 paid targeting (ADR‑001) and nothing else will tell us |
| **Referral** | Server‑side referral codes, no cookies, no fingerprinting. Three referrals move a position and unlock a set of printable "Hi, I'm yours" gift cards |
| **Above the buy area** | Android‑first disclosure and the May 2027 ship window, in plain words. Never in a footnote |
| **Proof block** | No mic, no camera, no location, no account, no cloud, no subscription — six icons, six four‑word lines, one link to the published privacy notice |
| **Not on the page** | Countdown timers, fake scarcity, "join 10,000 parents" before it is true, stock photography of children we do not have consent for, any Amber claim from §9 of the messaging doc |

---

## 6. Parent‑creator seeding: "Demo Drop"

### 6.1 Why it works here and nowhere else

Every other pre‑launch hardware brand must send a creator a prototype. We send a **link**. The demo playground lets a creator set the age band to match their own child, pick a personality, tap **Drop**, and film a real reaction to a real line — on an iPhone, today, with no unit, no NDA and no shipping. Fifty creators can be live in six weeks for the cost of two prototypes.

### 6.2 The programme

| Wave | When | Creators | Profile | Fee |
|---|---|---|---|---|
| 1 | Nov | 15 | Micro (10k–80k): screen‑free parenting, lunchbox and bottle accounts, US/UK/AU | $250–400 flat |
| 2 | Dec | 35 | 25 micro + **10 "big kid" (8–12) creators** — the band our content most needs defended | $250–400, three at $1,000 for longer‑form |
| 3 (Q1, outside this plan) | Feb–Mar | 12 | Mid‑tier (100k–500k), for the pre‑order cycle | Negotiated |

**Deliverable per creator:** one 15–30 s vertical video of the demo with their own child's age band and a chosen personality, plus a named referral code. No scripts, no forced superlatives — the product is funnier than a brief.

### 6.3 Non‑negotiables in every creator brief

1. **Paid partnerships are disclosed** clearly and in‑platform (FTC Endorsement Guides, ASA CAP, ACCC). No exceptions, no "gifted" ambiguity.
2. **Creators do not make privacy claims in their own words.** We supply a claim card of approved sentences; anything else is ours to say, not theirs to paraphrase.
3. **Never the words** find, locate, track, tracker, monitor. A single creator video calling it a tracker undoes a quarter of positioning work.
4. **No battery, waterproof, drop or age‑grade claims** — all Amber until their gates.
5. **Android‑first is stated** in the caption when the video links to the waitlist.
6. **Children's faces:** the creator decides what to post about their own child. We do not re‑publish a child's face without separate written consent from the parent, and we never use a child's image in paid media at this stage.

### 6.4 The boundary with research

The ten families in the December closed beta (roadmap, Dec 2026) are **research subjects, not creators.** Their units are labelled not‑for‑sale, their feedback is confidential, and they are not asked to post. Any content from EVT units in this window is filmed by us, under NDA, with written consent. Mixing the two contaminates the study that the G1 gate depends on.

---

## 7. PR

### 7.1 The discipline

We get one product news cycle. It breaks at **pre‑order (March 2027)**, with one exclusive to a single outlet 48 hours ahead of a broad embargo. In this window PR does relationships, not announcements — with one exception (§7.2).

### 7.2 Angles, in priority order

| # | Angle | The story | Targets |
|---|---|---|---|
| 1 | **"The kids' toy company that cannot spy on your child"** | Not a promise — an architecture. No microphone, no camera, no location, no account, no server, published as decision records anyone can read. More than eight in ten parents say they worry about connected toys collecting children's data | Wired, The Verge, Fast Company, WSJ family tech, Which?, Choice (AU) |
| 2 | **"What happens when the toy company dies?"** | Moxie's $799 robot was bricked in December 2024 with refunds refused. Our answer is *nothing happens*: no server to switch off, and a published five‑year security‑support period | Axios, Ars Technica, consumer affairs desks |
| 3 | **"The tag that refuses to find anything"** | We deliberately made radio finding impossible so the product can never be turned against a child, and we accept losing the lost‑bottle buyer for it | 404 Media, Ars Technica, tech‑policy press |
| 4 | **"We wrote 2,052 lines so a toy would never shame a child"** | The content guidelines: no shame, no fear, no food or body talk, nothing a child would repeat to hurt another child. Plus the child‑development review in November | Romper, Motherly, Good Housekeeping, NPR Life Kit, The Guardian family |
| 5 | **"The object is the character"** | Design story: the face, the thing icons, paper‑only FSC packaging, the 20‑second unboxing to the first giggle | Core77, Dezeen, Fast Company Design, It's Nice That |
| 6 | **Trade** | A new entrant in the fastest‑growing US toy price tier, certificate‑complete, MAP‑disciplined | The Toy Book, Toy World, Kidscreen, Licensing/Toy Association channels |

**The one placement in this window:** angle 1 or 2 as a founder‑bylined commentary, timed to the Australian Children's Online Privacy Code, whose final text is due **10 December 2026**. It is a real news hook, it is inside our 90 days, it costs no product claims, and it seeds the relationships that the March embargo will need.

### 7.3 Press kit (built in this window, published at L2)

Product one‑pager · the ADRs in plain English · a zero‑network audit summary · demo link and 8‑second clips · the face and wordmark in both themes · founder bio · **and a "what we cannot yet claim" page**, which is unusual, quotable and buys the rest of the kit its credibility.

---

## 8. Amazon

### 8.1 The channel insight that shapes everything

**Amazon is a harvesting channel for this product, not an acquisition channel.**

The 1‑pack contributes **$1.89** on Amazon (`pricing-and-packaging.md` §4.2). At toy‑category CPCs of roughly $0.80–1.50 and a 12% conversion rate, a sponsored‑product click costs about $8 per order. Paid Amazon traffic therefore loses roughly $6 on every 1‑pack it sells, and is barely break‑even on the 4‑pack at $11.00.

Consequences, adopted as policy:

1. Demand is created **off** Amazon — creators, PR, the demo, the list — and harvested on Amazon by people searching our name.
2. Sponsored Products run only on the **4‑pack, Gift Box and Mount 3‑pack**, and only to defend branded search terms.
3. **Branded search defence** is the one paid line item worth funding on Amazon, because competitors will bid on our name the week we launch.
4. The DTC store is not a vanity channel — it is worth **$6.21 more per 1‑pack** than Amazon, which is why the waitlist and the gift card exist.

### 8.2 What happens in these 90 days

| Item | When | Note |
|---|---|---|
| GS1 company prefix; Professional seller account | Oct | Real GS1 prefix only |
| Browse node, title/bullet drafts, keyword research | Nov | With a written **negative keyword list**: tracker, GPS, find my, locator, air tag |
| A+ content wireframes, brand store plan | Nov–Dec | Content built in Feb 2027 |
| **Brand Registry via IP Accelerator on the pending mark** | Dec | Must precede February listing prep. This is the schedule item most likely to be missed |
| Review strategy written | Dec | Vine on 30 units at GA; a compliant post‑purchase review request on DTC; **no incentives, ever** — a kids' privacy brand caught manipulating reviews is finished |
| FBA prep plan, carton dimensions confirmed against tier boundaries | Dec | The 44 mm box is large standard; keep every SKU under 16 oz |

### 8.3 Later, for completeness

Feb 2027 listing build and A+ content · Apr 2027 FBA inbound so stock lands before GA · **May 2027 listings live** (Amazon does not pre‑order non‑media, so pre‑orders are DTC‑only) · Jul 2027 first Prime Day on multi‑packs only · UK/CA/AU listings as markings allow.

---

## 9. Retail: what is realistic

**Honest position: there is no retail at GA, and traditional wholesale does not work at v1 unit costs.** A 50% keystone wholesale on a $29.99 tag is $14.99 against a $17.20 landed cost — a loss on every unit (`sales-playbook.md` §5 does the arithmetic and gives the alternatives).

| Horizon | What is realistic | Requires |
|---|---|---|
| **May 2027 (GA)** | None. Certificates land in April; buyers' assortments were locked months earlier | — |
| **Q4 2027** | 3–8 independent specialty doors on **consignment or commission** (we own the inventory, they take 35–40%): independent toy shops, museum and aquarium shops, design‑led gift stores, paediatric‑dental retail shelves | Six months of sell‑through data, a shelf card that demos with no Wi‑Fi, MAP discipline |
| **2028 assortments (decided Q1 2028)** | First chain conversations — Target, Smyths, Argos, Big W, Kohl's, FirstCry | 12 months of sell‑through, EDI, vendor compliance, chargeback tolerance, a 2‑year warranty reserve, and **a BOM reduction that makes 50% wholesale viable** |
| **Never at v1 costs** | Mass‑market keystone wholesale | — |

**Trade shows:** do not exhibit. UK Toy Fair (Jan) and Toy Fair New York fall right after this window and a booth costs $15–30k for a product that ships nine months later. **Walk them.** The demo runs on a phone in a buyer meeting, and the conversations we want are about the 2028 assortment. Re‑evaluate exhibiting for the January 2028 shows, when there is stock, reviews and sell‑through.

**What we do in this window:** 30 buyer conversations with the demo, 8 accounts qualified, and one rep group identified per region. Buyer conversations now are free, and they tell us the packaging and MAP requirements before artwork locks in April.

---

## 10. Community

Small, owned, and honest. We have no analytics, so the community *is* our instrumentation.

| Programme | What it is | Cost | Why |
|---|---|---|---|
| **"Voice Notes"** | A fortnightly letter: one new line from the packs, one design decision, one privacy fact. Written in the brand voice, never a newsletter about a newsletter | ~0 | Email is the only channel we own that needs no pixels. It is also the pre‑order list |
| **Line of the week** | One of the 2,052 written lines, typeset on a thing icon, posted weekly | ~0 | Infinite organic content from an asset that already exists, and it demonstrates the product with no hardware. The best content‑to‑cost ratio available to us |
| **Try the demo** | The demo link shared as an object, not an ad. "Set it to your kid's age and tap Drop" | ~0 | Parents share a toy; nobody shares a landing page |
| **Founding Families** | 200 volunteers from the list: app beta, vote on nicknames, first units at GA, named in the app's About screen | ~$4k | Advocacy, plus qualitative signal telemetry will never give us. **Separate from the 10 EVT study families** (§6.4) |
| **Public changelog and privacy page** | Every release and every privacy decision, in plain words | ~0 | Trust content that also satisfies the PSTI/CRA disclosure duty |
| **Forums** | Participate under our own name in parenting and screen‑free communities. Answer questions, never plant them | ~0 | **No astroturfing, no incentivised reviews, no sock puppets.** One exposure would cost more than the whole plan |

No Discord at this stage. A server with 200 members and no product is a support burden that photographs as abandonment.

---

## 11. KPIs

### 11.1 The 90‑day scorecard

| # | KPI | Target at Day 90 | Measured how |
|---|---|---|---|
| 1 | Name cleared and filed | Binary — done by **15 Nov** | Counsel confirmation |
| 2 | Waitlist emails | **15,000** | Email platform |
| 3 | Blended cost per email | **≤ $1.20** | Spend ÷ net new emails |
| 4 | Demo sessions | 25,000 | Self‑hosted site analytics on the demo's own page view; the app itself reports nothing |
| 5 | Demo engagement | ≥ 55% fire three or more events | Site‑side event on the demo wrapper page only |
| 6 | Creator pieces live | **50**, median watch‑through ≥ 35% | Creator reporting |
| 7 | Referral share of signups | ≥ 20% | Referral codes |
| 8 | Android share of the list | **≥ 45%** | The one optional signup question |
| 9 | Price acceptance at $29.99 | ≥ 40% top‑2‑box | December waitlist survey |
| 10 | Privacy ranked the #1 reason to buy | ≥ 30% | Same survey |
| 11 | Press | 1 placement, 25 relationships mapped, **0 embargo breaks** | PR log |
| 12 | Retail | 30 conversations, 8 qualified | Sales CRM |
| 13 | Brand Registry | Filed by 18 Dec | Amazon case |

KPI 8 is the one that changes spend: the list's Android share tells us how much of the pre‑order market can actually pair a tag at v1.0.

### 11.2 The funnel to "10,000 units in six months"

| Stage | Requirement | Where it comes from |
|---|---|---|
| Pre‑orders by GA | **3,000** (the founding cap) | 5% conversion of a 60,000 list |
| List at pre‑order open (Mar 2027) | **60,000** | 15,000 at Day 90 → 25,000 by Feb (pre‑announcement push) → 60,000+ on the March news cycle |
| DTC units, months 1–6 | 4,500 | 180,000 sessions at 2.5% conversion — 30,000 sessions a month from creators, PR, organic and the demo |
| Amazon units, months 1–6 | 5,500 | ≈30/day, which needs organic rank, which needs ≈150 reviews in 60 days: Vine (30) + a 1.5–3% organic review rate |
| **Total** | **10,000** | Brief §7 |

**The trigger to watch:** a list under 35,000 at pre‑order open means the founding cap will not fill and the 10k MP quantity is re‑examined at G2 (§2).

---

## 12. Budget

### 12.1 Days 0–90

| Line | $ | Note |
|---|---|---|
| Trademark: knock‑out and full searches plus filings, 5 jurisdictions, name + 2 alternates | 22,000 | Run in parallel, not in series. Serial searches are how a rebrand becomes a slipped launch |
| Brand identity: wordmark, face device, lock‑up, guidelines | 18,000 | Extracted from the existing design system, not invented beside it |
| Waitlist site: design and build, static, no pixels | 14,000 | |
| Illustration and motion for demo films | 12,000 | No product photography is possible until DVT (Mar 2027) |
| Creator seeding: 50 creators across two waves | 17,500 | |
| Paid social learning test, Android‑targeted | 20,000 | Buying *learning*, not volume: four hooks, four audiences |
| PR: fractional senior consultant, 3 months | 12,000 | |
| Tooling: domains, email, Shopify pre‑launch, help centre, GS1 prefix | 2,500 | |
| **Committed** | **118,000** | |
| Contingency, 10% | 11,800 | Most likely use: a rebrand after a bad trademark opinion |
| **Total, Days 0–90** | **$129,800** | |

### 12.2 The twelve‑month envelope, for context

| Period | $ | Main lines |
|---|---|---|
| Days 0–90 (Oct–Dec 2026) | 130k | Above |
| Jan–Apr 2027 (pre‑order) | 220k | DVT photography and film, pre‑order site, press cycle, mid‑tier creators, packaging artwork, trade‑show travel |
| May–Oct 2027 (GA + first six months) | 450k | Launch campaign, Amazon branded defence, iOS "now for iPhone" campaign at v1.1, review programme, support |
| **Total to GA + 5 months** | **≈ $800k** | Incremental to the $248–325k of NRE in `bom.md` §4, which excludes GTM |

**State this next to the contribution model and do not look away from it:** Y1 hardware contribution is ≈$145k against ≈$800k of GTM spend (`pricing-and-packaging.md` §4.5). Year 1 is an investment year by design. The two decisions that shorten the payback are the **+$5 price move** and **non‑China assembly** — both worth more than this entire budget, and both due at G1/G2.

---

## 13. GTM risks in this window

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **Trademark opinion comes back high‑risk** | Medium | Rebrand; artwork, domains, handles, Brand Registry all restart | Alternates cleared in parallel from day 1; advertised BLE name made a build constant (1.2); the master line and the face device carry recognition across a name change; **no content re‑recording is needed** — the packs contain no product name |
| 2 | **The list stalls below 10,000** | Medium | March pre‑order under‑converts; forecast for the 10k PO is guesswork | Creator waves are the variable lever, not paid social; if cost per email exceeds $2.00, stop paid and double creators — they produce assets that keep working |
| 3 | **A creator calls it a tracker** | Medium‑high | Re‑frames the product into the losing category | Claim card, banned‑word list, pre‑publication review of wave 1, correction within 24 h |
| 4 | **We spend the news cycle early** | Medium | No product news left for March | One placement in this window, commentary only, no product embargo. PR has a written no‑announce rule |
| 5 | **An Amber claim leaks into copy** | Medium | Regulatory and review risk on a children's product | Claims table in `positioning-and-messaging.md` §9 is a review gate on every asset; Compliance signs the site before it ships |
| 6 | **EE hire slips, and with it the May 2027 date** | Medium | The whole plan's dates move; a list built on a broken promise is worse than no list | Never publish a ship date more precise than a month until G2; the roadmap's own top risk. Marketing publishes "May 2027" only after G1 |
| 7 | **Q4 attention wasted for want of something to sell** | High if unmanaged | Two peaks missed | The gift card, live 1 December |
| 8 | **Android/iOS split worse than assumed** | Medium | US paid acquisition has half the addressable audience | KPI 8; gate US paid spend to Android audiences; consider leading UK/AU, where Android share is higher |

---

## 14. Assumptions

| # | Assumption | Consequence if wrong |
|---|---|---|
| A1 | Hardware GA is May 2027 and pre‑order opens March 2027 (roadmap §3) | Every date here shifts with the gates, not with the calendar |
| A2 | The public PWA with demo mode goes live at pre‑order open (PRD §14 Q4, recommendation "yes") | If the PWA stays private, the demo cannot be the marketing engine and this plan needs rewriting from §1 |
| A3 | The marketing site is a separate origin and may use cookieless self‑hosted measurement | Without it we are flying blind on a $130k spend |
| A4 | No Kickstarter; funding from equity or debt, not pre‑orders | If pre‑orders must fund tooling, the deposit model changes and consumer‑law exposure rises materially |
| A5 | No paid acquisition against iPhone audiences in the US before v1.1 | Refunds and one‑star reviews from households that cannot pair |
| A6 | Creator fees of $250–400 secure 15–35 micro‑creators per wave | If the market prices higher, cut wave size, not the disclosure standards |
| A7 | Specialty retail is deferred; no wholesale at v1 unit costs | Chasing wholesale in this window burns sales time on unprofitable volume |
| A8 | The 10 EVT closed‑beta families stay research‑only | Using them for marketing contaminates the G1 study the launch date depends on |
