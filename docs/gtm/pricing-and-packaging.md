# Tagalong — Pricing and Packaging (commercial)

| | |
|---|---|
| **Status** | v1 · plan of record · 2026‑09‑22 · prices lock at **G2 (Apr 2027)** before artwork lock |
| **Owner** | Head of Sales (ladder, channel terms) · VP Marketing (bundles, gifting) · Finance (unit economics) |
| **Derives from** | `docs/00-product-brief.md` §5.1 · `docs/hardware/bom.md` · `docs/03-unboxing-and-packaging.md` §2 |
| **Consistent with** | `docs/research/market-research.md` §3.3, §4.1, §6 · `docs/research/competitive-analysis.md` §1, §5 |
| **Scope** | This file covers the commercial package: prices, SKUs, unit economics, bundles, warranty. The physical package (structure, artwork, unboxing) is `docs/03-unboxing-and-packaging.md`. |

**Currency:** USD, US market, at the 10k first production order. **Units:** a "tag" is one puck; a "unit" is one saleable SKU.

---

## 1. Pricing principles

1. **$29.99 is a position, not a number.** It sits on the learned AirTag/SmartTag2/Bitzee anchor and at the floor of the fastest‑growing US toy price tier ($30–69.99, +18% in 2025). Sub‑$20 toys are in decline. We never discount into that tier.
2. **The 1‑pack buys the shelf; the multi‑packs and accessories pay the bills.** At a $12 BOM the 1‑pack is close to breakeven on Amazon. Every commercial decision downstream follows from that one fact (§5).
3. **One MSRP in every channel.** Channel‑specific list prices invite Buy Box suppression and erode trust with specialty partners. Promotions are time‑boxed and identical everywhere.
4. **Accessories carry the mix.** Mounts and the spare charger contribute 35–70% and are pure attach revenue. Mount attach rate is a tracked KPI, not a hope.
5. **Gift SKUs are presentation, not discount.** A gift buyer pays for a box that looks like a gift. We do not teach the market that $29.99 is negotiable.
6. **No subscription. Ever.** It is the differentiator against every competitor in the landscape, and it is priced into the hardware, not deferred.
7. **The price we print is the price we can hold for two years.** Artwork, listings, retail agreements and MAP all reference it. One change costs a full artwork cycle.

---

## 2. Price ladder

| SKU | MSRP | Contents | Role | Channel |
|---|---|---|---|---|
| **Tagalong 1‑pack** | **$29.99** | 1 tag · bottle strap · zipper loop · charging puck + USB‑C cable · quick‑start + privacy cards | Anchor and entry. 4 colours: Tangerine, Sky, Grape, Mint | All |
| **Tagalong 2‑pack** | **$49.99** | 2 tags (Tangerine + Sky) · 2 straps · 2 zipper loops · **1 charging puck** (see §5.4) · card set | "The real gift price"; two kids or two things | All |
| **Family 4‑pack** | **$99.99** | 4 tags (one of each colour) · 4 straps · 4 zipper loops · 2 charging pucks · card set | Siblings, grandparents buying for a household. **The best SKU on Amazon** | Amazon, DTC |
| **Mount kit** | **$7.99** | 4 cradle rings: large bottle strap · zipper loop · lace clip · 2 adhesive bases · leaflet | Makes one tag serve four objects. DTC attach hero | DTC attach, specialty; Amazon as 3‑pack |
| **Mount kit 3‑pack** | **$19.99** | 3 × Mount kit | The Amazon‑viable mount SKU (a $7.99 item cannot carry FBA alone) | Amazon, DTC |
| **Spare charging puck** | **$14.99** | Charging puck + captive 1 m USB‑C cable | Highest‑margin SKU; removes the top support ticket | DTC, Amazon |
| **Holiday Gift Box** | **$59.99** | 2 tags · 1 charger · every mount · gift sleeve and message card | Q4 and Diwali gift shelf; seasonal artwork | DTC, Amazon, specialty |
| **Gift card** | **$35 / $55** | Physical card + QR to the demo, redeemable against any SKU | Lets a grandparent give the gift **before hardware ships** (pre‑order window) | DTC only |
| Gift‑ready wrap | **free** | Paper gift sleeve + printed message card | DTC checkout option. Never charged for — it costs $0.35 and buys a five‑star gift experience | DTC |

**Deliberate omissions.** No $19.99 SKU (that tier is shrinking and it would strand the anchor). No wall adapter (packaging §11 assumption 3). No single loose mount below $7.99 — the kit is the unit, because per‑piece picking and packing costs more than the part. No colour surcharge.

**SKU count at launch: 9 saleable SKUs (12 with colour variants of the 1‑pack).** Every additional SKU is a forecast, a master carton, a barcode and a stockout. Hold the line until Y2.

---

## 3. Cost build‑up

### 3.1 From BOM to factory cost — 1‑pack

Sourced from `docs/hardware/bom.md` (rev A, 10k units). Treat ±15% as normal until RFQ.

| Line | $ | Source |
|---|---|---|
| Tag BOM incl. 3% scrap/yield | 11.77 | bom.md §1 (target ≤ $12.00 — **met**) |
| Magnetic charging puck + captive USB‑C cable | 2.35 | bom.md §2 |
| Bottle strap mount (silicone on cradle ring) | 0.42 | bom.md §2 |
| Zipper loop mount | 0.31 | bom.md §2 |
| Adhesive base | 0.18 | bom.md §2 — **see note** |
| Retail box, insert, quick‑start + privacy cards, leaflet | 1.15 | bom.md §2 (packaging doc ceiling is $1.60) |
| **Factory cost, ex‑works** | **$16.18** | matches bom.md §2 |

*Note on the adhesive base.* `bom.md` costs it in the 1‑pack; `03-unboxing-and-packaging.md` §2 ships it only in the Mount kit and flags the lunchbox mounting question as open until EVT. We carry the $0.18 here so this document does not contradict the BOM. If the G1 decision confirms kit‑only, factory cost falls to $16.00 and every margin below improves by ~0.6 points. If instead the 1‑pack gains a second adhesive base, it worsens by the same amount. Either way the decision is worth $0.18, not an argument.

### 3.2 From factory cost to landed cost

"Landed" here means **duty‑paid, in our US 3PL**, which is the only number a margin calculation may use. `bom.md` §2 calls $16.18 "landed"; it is ex‑works. We add freight, duty and brokerage.

| Line | Y1 | Steady state | Basis |
|---|---|---|---|
| Factory cost ex‑works | 16.18 | 16.00–16.18 | §3.1 |
| Inbound freight, blended | 0.70 | 0.35 | 100 × 100 × 44 mm at ~180 g; master carton of 20. Ocean LCL for replenishment (~$0.35); **20% of the launch tranche by air** so pre‑orders ship on the promised date (~$2.00) |
| Customs brokerage, compliance filings, drayage, palletisation | 0.32 | 0.30 | ≈2% of declared value |
| Duty — **base case, non‑China origin** | 0.00 | 0.00 | Toy classification, duty‑free in the US; Vietnam or Malaysia CM |
| **Landed cost, 1‑pack (base case)** | **$17.20** | **$16.65** | |

**Duty scenarios.** The BOM's own risk register puts tariffs on Chinese‑origin electronics at up to +25% landed and tells us to quote a Vietnam or Malaysia CM in parallel at DVT. This is not a finance footnote; it decides whether the ladder works.

| Origin / duty assumption | Duty per unit | Landed | 1‑pack Amazon contribution | Verdict |
|---|---|---|---|---|
| **Vietnam / Malaysia, toy classification, duty‑free** | 0.00 | **17.20** | **$1.89 (6.3%)** | **Base case. Plan on this.** |
| China, 7.5% | 1.21 | 18.41 | $0.68 (2.3%) | Survivable only with the §5.4 fixes |
| China, 25% | 4.05 | 21.25 | **−$2.36 (loss)** | **Not viable at $29.99.** Forces $34.99 |

**Recommendation to the hardware lead: make non‑China final assembly a selection criterion for the CM, not a contingency.** A CM decision in January 2027 that lands us in the 25% case invalidates the printed price four weeks before artwork lock. This is a GTM veto, and it should be recorded as one at G1.

### 3.3 Factory and landed cost, all SKUs

| SKU | Factory | Inbound + duty (Y1) | **Landed** |
|---|---|---|---|
| 1‑pack | 16.18 | 1.02 | **17.20** |
| 2‑pack — as packaged today (2 chargers) | 31.25 | 1.78 | **33.03** |
| 2‑pack — **recommended (1 charger)** | 28.90 | 1.63 | **30.53** |
| Family 4‑pack (2 chargers) | 57.00 | 3.09 | **60.09** |
| Mount kit | 2.17 | 0.23 | **2.40** |
| Mount kit 3‑pack | 6.86 | 0.64 | **7.50** |
| Spare charging puck | 2.70 | 0.25 | **2.95** |
| Holiday Gift Box (2 tags, 1 charger, all mounts) | 31.92 | 1.96 | **33.88** |

---

## 4. Channel economics

### 4.1 Channel fee model

| Channel | Fees applied | Notes |
|---|---|---|
| **DTC** (Shopify) | Payment 2.9% + $0.30 on the collected total; pick, pack and outbound parcel; shipping revenue collected at **$4.95 flat, free over $60** | The $60 threshold matters — see §4.4 |
| **Amazon FBA** | Referral **15%** (Toys & Games); FBA fulfilment by size/weight tier; inbound placement, monthly storage and returns processing allocated per unit | Confirm the current fee schedule at Brand Registry (Dec 2026) and again at listing prep (Feb 2027) |
| **Specialty wholesale** | Wholesale discount off MSRP; freight; no fulfilment cost to us | Not viable at v1 costs — see `sales-playbook.md` §5 |

**Returns and warranty reserve: 6.7% of MSRP.** Derived bottom‑up: an 8% return rate (the electronics online benchmark is 8–15%) at an average loss of $16.40 per returned 1‑pack ($6.50 reverse shipping + $3.00 inspection and refurbishment + a 40% chance the unit is unsellable), plus 2% warranty replacements at $23.70 → $1.78, held at **$2.00 per 1‑pack** and scaled by MSRP for other SKUs. The brief's target is a <3% return rate (G6); we reserve for 8% and treat the difference as upside, not as a plan.

### 4.2 The table that decides the business

FBA tiers: the 1‑pack box is 44 mm thick, so it is **large standard**, not small standard — thickness, not weight, is the binding constraint. Keeping every box under 16 oz and inside large standard is a packaging requirement with a dollar value; it is worth more than the board it saves.

| SKU | MSRP | Channel | Fees | Net revenue | Landed | Reserve | **Contribution** | **% of MSRP** |
|---|---|---|---|---|---|---|---|---|
| 1‑pack | 29.99 | **DTC** | 1.31 payment · 1.38 net shipping | 27.30 | 17.20 | 2.00 | **$8.10** | **27.0%** |
| 1‑pack | 29.99 | **Amazon** | 4.50 referral · 3.85 FBA · 0.55 storage/placement | 21.09 | 17.20 | 2.00 | **$1.89** | **6.3%** |
| 2‑pack (2 chargers, as packaged) | 49.99 | DTC | 1.89 · 1.85 | 46.25 | 33.03 | 3.35 | **$9.87** | 19.7% |
| 2‑pack (2 chargers, as packaged) | 49.99 | **Amazon** | 7.50 · 5.30 · 0.75 | 36.44 | 33.03 | 3.35 | **$0.06** | **0.1%** |
| 2‑pack (**1 charger**) | 49.99 | DTC | 1.89 · 1.85 | 46.25 | 30.53 | 3.35 | **$12.37** | 24.7% |
| 2‑pack (**1 charger**) | 49.99 | Amazon | 7.50 · 5.30 · 0.75 | 36.44 | 30.53 | 3.35 | **$2.56** | 5.1% |
| Family 4‑pack | 99.99 | DTC | 3.20 · 7.60 | 89.19 | 60.09 | 6.70 | **$22.40** | 22.4% |
| Family 4‑pack | 99.99 | **Amazon** | 15.00 · 6.10 · 1.10 | 77.79 | 60.09 | 6.70 | **$11.00** | **11.0%** |
| Holiday Gift Box | 59.99 | DTC | 2.04 · 7.00 | 50.95 | 33.88 | 4.00 | **$13.07** | 21.8% |
| Holiday Gift Box | 59.99 | Amazon | 9.00 · 5.70 · 0.85 | 44.44 | 33.88 | 4.00 | **$6.56** | 10.9% |
| Mount kit | 7.99 | DTC (attached to an order) | 0.23 payment share | 7.76 | 2.40 | 0.55 | **$4.81** | **60.2%** |
| Mount kit | 7.99 | Amazon standalone | 1.20 · 2.60 low‑price FBA · 0.25 | 3.94 | 2.40 | 0.55 | **$0.99** | 12.4% |
| Mount kit 3‑pack | 19.99 | Amazon | 3.00 · 3.60 · 0.35 | 13.04 | 7.50 | 1.35 | **$4.19** | 21.0% |
| Spare charging puck | 14.99 | DTC (attached) | 0.44 | 14.55 | 2.95 | 1.00 | **$10.60** | **70.7%** |
| Spare charging puck | 14.99 | Amazon | 2.25 · 3.30 · 0.30 | 9.14 | 2.95 | 1.00 | **$5.19** | 34.6% |

### 4.3 Margin waterfall, and reconciling the 46% in `bom.md`

`bom.md` §2 reports "46% gross margin on DTC and roughly 28% after Amazon fees". Both numbers are defensible **at their own stage** and neither is the number a financial model may use. The stages, for the 1‑pack:

| Stage | Definition | DTC | Amazon |
|---|---|---|---|
| 1 · Product margin at list | (MSRP − factory cost) / MSRP | **46.0%** ← the `bom.md` figure | 46.0% |
| 2 · Landed margin | less inbound freight, duty, brokerage | 42.6% | 42.6% |
| 3 · Channel margin | net revenue less landed cost | 33.7% | 13.0% |
| 4 · **Contribution margin** | less payment, shipping and the returns/warranty reserve | **27.0%** | **6.3%** |

**Use stage 4 everywhere.** Stages 1–3 are engineering and channel diagnostics. No forecast, investor deck or retail negotiation may quote stage 1. This document does not change `bom.md`; it adds the channel layer that `bom.md` explicitly defers to it (`bom.md` §2 points here by name). The two files should be reconciled with a one‑line cross‑reference at the next hardware review.

### 4.4 Three policy decisions hiding in the fee model

1. **Set the free‑shipping threshold at $60, not $49.** A $49 threshold hands free shipping to the 2‑pack and costs $4.95 of margin on the SKU we most want to sell — worth roughly $2.50 per 2‑pack, or about $19k a year at base volumes. $60 catches the 4‑pack and the Gift Box, which can afford it.
2. **Ship one charging puck in the 2‑pack, not two.** The packaging plan accepts a ~$1.50 delta for "a home for each tag" (packaging §11 assumption 5). At Amazon fees that decision is the difference between **0.1% and 5.1%** contribution — it is the single most expensive experience choice in the box. Recommendation: one puck, plus a checkout and in‑box prompt for the $14.99 spare, which is a 70% margin SKU and makes the "each tag has a home" experience available to the parents who want it. **Founder decision at G1.**
3. **Never run the 1‑pack as an Amazon Lightning Deal.** A 15% promotion takes $4.50 from a $1.89 contribution. Amazon promotions run on the 4‑pack, the Gift Box and the Mount 3‑pack only.

### 4.5 Blended contribution per tag shipped

Y1 mix assumptions: channel **Amazon 53% / DTC 47%** (specialty deferred — §5); SKU mix by tags **1‑pack 45%, 2‑pack 30%, 4‑pack 15%, Gift Box 10%**; 30% mount attach (market research §3.3), 8% charger attach; 2‑pack with one charger.

| SKU | DTC / tag | Amazon / tag | Blended / tag |
|---|---|---|---|
| 1‑pack | 8.10 | 1.89 | 4.81 |
| 2‑pack | 6.19 | 1.28 | 3.59 |
| 4‑pack | 5.60 | 2.75 | 4.09 |
| Gift Box | 6.54 | 3.28 | 4.81 |
| **Weighted tag contribution** | | | **$4.33** |
| + mount attach at 30% | | | +0.83 |
| + charger attach at 8% | | | +0.62 |
| **Total contribution per tag shipped** | | | **≈ $5.78** |

At the market‑research base case (Y1 25k tags, Y2 80k, Y3 180k) and a 10% BOM reduction at 50k volume from Y2:

| | Y1 | Y2 | Y3 | 3‑year |
|---|---|---|---|---|
| Tags | 25k | 80k | 180k | 285k |
| Contribution per tag | $5.78 | $6.96 | $8.00 **[E]** | |
| **Gross contribution** | **$145k** | **$557k** | **$1.44M** | **≈ $2.14M** |

Cross‑check: ≈$2.14M on ≈$8.4M of 3‑year retail is a 25% blended contribution margin, inside the 18–45% band in market research §3.3. **Consequence, stated plainly: Y1 hardware contribution does not repay the $248–325k of NRE, let alone the GTM budget. The base case pays for the launch during Y2.** Pricing, BOM and channel mix are the only three dials that change that, and §7 values each one.

---

## 5. Bundles, gifting and promotional policy

### 5.1 Bundles

| Bundle | MSRP | À‑la‑carte | Saving | Purpose |
|---|---|---|---|---|
| 2‑pack | $49.99 | $59.98 | $9.99 | The gift price point; two kids or two things |
| Family 4‑pack | $99.99 | $119.96 | $19.97 | Households with three or more kids; best Amazon economics |
| **Bottle Starter** (1‑pack + Mount kit) | $34.99 | $37.98 | $2.99 | DTC and specialty only — an AOV builder, not an Amazon SKU (its Amazon contribution is $2.99, worse per tag than the plain 1‑pack) |
| **Everything Kit** (2‑pack + Mount kit 3‑pack + spare charger) | $84.99 | $84.97 | $0 | DTC only; sold on convenience, not on price. 33% contribution |
| Holiday Gift Box | $59.99 | $57.98 | −$2.01 | **A premium, not a discount.** The gift buyer pays for the presentation |

**Rule: no bundle discount exceeds 17% of the à‑la‑carte total.** Beyond that we are training the market to wait.

### 5.2 Gifting SKUs

The gift buyer is a distinct customer with a distinct fear, and 86% of US grandparents buy gifts averaging $805 a year (market research §4). Three instruments:

1. **Holiday Gift Box, $59.99.** Seasonal sleeve over the standard 2‑pack structure — one artwork change, no new tooling. Contains every mount so nothing else needs buying. Ships with the message card and a "hand this to a grown‑up" QR card, which is the answer to the gift‑buyer‑is‑not‑the‑setup‑person problem in packaging §4.
2. **Gift card, $35 / $55.** Physical card, printed, with a QR to the demo playground. **This is the pre‑order window's most important SKU**: it lets a grandparent give Tagalong at Christmas 2026 and Christmas 2027‑minus‑one, eight months before a tag exists, and it converts attention in the two peaks we would otherwise waste. Redeemable against any SKU, no expiry (required in several US states anyway), and the $55 denomination nudges toward the 2‑pack.
3. **Free gift‑ready wrap at DTC checkout.** A paper sleeve and a printed message line, $0.35 landed. Never charged for. It removes the last reason to buy from Amazon instead of us.

### 5.3 Promotional calendar and MAP

| Window | Depth | SKUs | Rationale |
|---|---|---|---|
| Pre‑order (Mar–Apr 2027) | Founding price, $5 off the 1‑pack, capped at the first 3,000 units | 1‑pack, 2‑pack | Pays for early reviews and a real forecast. **Framed as founding, not as a sale** |
| Prime Day (Jul) | 10% | 4‑pack, Gift Box, Mount 3‑pack | Never the 1‑pack (§4.4) |
| Back‑to‑school (Aug–early Sep US/UK; late Jan–Feb AU) | Mount kit free with a 2‑pack | 2‑pack | Attach, not discount |
| Black Friday / Cyber Monday | 15%, the deepest of the year | 4‑pack, Gift Box, bundles | Matches category expectation without touching the anchor |
| Diwali / Children's Day 14 Nov (IN, v1.1+) | 10% | Gift Box | Festive gifting runs 3–5× in the final week |

**MAP policy: MSRP, with a permitted 15% promotional floor inside the four named windows above, maximum 14 days each.** Applies to every reseller and to our own channels. First breach: written notice. Second: supply suspended. MAP is what makes specialty retail willing to stock a product we also sell online, and it is unenforceable if we break it ourselves first.

---

## 6. Warranty, returns and support policy

Public policy, in the words we will publish. The commercial reserve behind it is §4.1.

| Element | Policy | Why |
|---|---|---|
| **Limited warranty** | **1 year** from purchase against defects in materials and workmanship, worldwide | Matches the in‑box leaflet and PRD §13 (`warranty (1 year)`); consistent with the toy and consumer‑electronics norm |
| **EU / UK statutory** | **2‑year** legal conformity guarantee under EU and UK consumer law, stated plainly alongside the 1‑year commercial warranty | The statutory right exists whether or not we print it. Printing it costs nothing and buys trust; hiding it invites a regulator |
| **"First laugh" guarantee** | **60 days**, full refund including return shipping, no questions. If the kid did not laugh, we did not deliver | The novelty‑decay risk is real (market research §9). A generous window converts the objection into a review and gives us the diary data telemetry cannot |
| **Battery** | Sealed and not user‑serviceable. Covered for 12 months if capacity falls below 70% of rated | ADR‑005; sets an explicit, testable promise instead of an argument |
| **Out of warranty** | **Tag Rescue: a replacement tag at $14.99**, any reason, including "the dog ate it", one per tag per year | Cheaper than a return, keeps the customer, and beats a one‑star review. Landed cost $17.20 makes this a deliberate ~$2 retention spend, not a profit line |
| **Mounts** | 90 days. Silicone and adhesive are wear parts; Mount kits are $7.99 | Honest, and it protects the reserve |
| **Lost tags** | Not covered. There is no finding feature and no insurance | Consistent with ADR‑007. Never imply otherwise |
| **Returns** | 60 days DTC (above). Amazon's own policy applies on Amazon. Specialty: defective‑only RMA, no stock balancing in year 1 | Amazon's policy is not negotiable; specialty terms are in `sales-playbook.md` §5 |
| **Security support period** | **5 years from the last date of sale**, with a published vulnerability‑disclosure address and `security.txt` | Required in substance by UK PSTI and EU CRA, and it is what makes "works forever" a commitment rather than a slogan |
| **End of life / take‑back** | Sealed battery: return the whole tag, prepaid, to the address on the leaflet. We recycle it | Packaging §7; WEEE and battery regulations; also a brand asset |
| **What we will not do** | No advance replacement without proof of purchase. No cross‑ship to a third party. No warranty on units bought from unauthorised resellers | Grey‑market discipline protects MAP and the specialty channel |

**Support model.** Email only at launch, published 2‑business‑day response, with a self‑serve help centre. There is no telemetry, so **support tickets are our instrumentation** — every ticket is tagged to a cause code and reviewed weekly against the brief's battery‑complaint (<1%) and return‑rate (<3%) targets. Budget one support FTE‑equivalent from launch minus 30 days.

---

## 7. Sensitivities and the five levers

Ranked by value at base‑case volumes. Values are contribution, not revenue.

| # | Lever | Mechanism | Value | Decision point |
|---|---|---|---|---|
| **1** | **1‑pack at $34.99** | DTC contribution $8.10 → $12.63; Amazon $1.89 → $5.79 | **+$4.20 per 1‑pack tag ≈ +$47k in Y1, ≈ +$540k over the 3‑year base case** | **G2 (Apr 2027)**, on the pre‑order A/B result. Market research §4.1 explicitly invites this test and notes >80% of US consumers already expect tariff‑driven price rises |
| 2 | **Bare nRF52840 instead of the pre‑certified module** | −$1.60 BOM for ~$35k of certification; break‑even at 22k units | +$1.60 per tag from Y2 ≈ +$416k over Y2–Y3 | G1, jointly with the EE. Note this reverses the module's 3‑week schedule saving — a Y1 schedule cost for a Y2 margin gain |
| 3 | **Non‑China final assembly** | Avoids a 7.5–25% duty | Up to **+$4.05 per unit**; at 25% it is the difference between a business and a loss | **CM selection, Jan 2027.** Treat as a GTM veto |
| 4 | **Shift 10 points of mix from Amazon to DTC** | DTC contributes $6.21 more per 1‑pack | +$0.62 per tag ≈ +$16k Y1, +$177k over 3 years | Continuous. This is what the waitlist, the demo funnel and the gift card are *for* |
| 5 | **One charger in the 2‑pack** | −$2.50 landed on 30% of tags | +$2.50 per 2‑pack unit ($1.25 per tag) ≈ +$9k Y1 | G1, with packaging |
| 6 | Mount attach 30% → 45% | +$2.78 blended per attached kit | +$0.42 per tag | Continuous: PDP cross‑sell, in‑box card, the app's "what else can it be?" prompt |

**Break‑even sanity check.** At $5.78 contribution per tag, recovering the $248–325k of NRE alone needs **43,000–56,000 tags** — roughly all of Y1 plus half of Y2 in the base case, and that is before a dollar of GTM spend.

Apply the +$5 move across the whole ladder (1‑pack $34.99, 2‑pack $54.99, 4‑pack $109.99) and contribution rises to **≈$9.97 per tag** — the $5 less the Amazon referral on 53% of volume, the payment fee on the rest, and the larger reserve. NRE payback then falls to **25,000–33,000 tags**, inside Y1 plus one quarter. Lever 3 does not add to this; it prevents the 25% duty case from erasing it. **Levers 1 and 3 are not optimisations. They are the difference between a self‑funding launch and a second raise.**

---

## 8. Assumptions and open decisions

| # | Item | Owner | Needed by |
|---|---|---|---|
| A1 | All costs are budgetary estimates at 10k units, ±15% until RFQ (`bom.md` preamble) | Hardware | re‑quote at G1 |
| A2 | Amazon referral 15% and the FBA tier rates above are estimates; confirm the live schedule | Sales | Brand Registry, Dec 2026 |
| A3 | Non‑China final assembly, toy classification, duty‑free into the US | Hardware + Finance | **CM selection, Jan 2027** |
| A4 | 20% of the launch tranche moves by air to protect the pre‑order ship date | Ops | Mar 2027 |
| A5 | Returns reserve of 6.7% of MSRP (8% return rate, $16.40 average loss) | Finance | review 60 days post‑launch |
| A6 | 2‑pack ships **one** charger, reversing packaging §11 assumption 5 | Founder | **G1** |
| A7 | Free‑shipping threshold $60; $4.95 flat below it | Sales | DTC store build, Feb 2027 |
| A8 | Adhesive base stays kit‑only, reconciling `bom.md` §2 with packaging §2 (worth $0.18) | Hardware + Packaging | **G1 (EVT, Dec 2026)** |
| A9 | Published prices are US; UK/CA/AU prices are set at G2 on landed cost and local VAT/GST, not by FX conversion — expect £29.99 / C$39.99 / A$49.99 as the working assumption | Sales | G2 |
| A10 | The $5 founding discount is capped at 3,000 units and is never repeated | Marketing | pre‑order open |
