# Contract Electrical Engineer — Scope of Work

**Project:** Tagalong — a ⌀38 × 12 mm sealed BLE tag for children's objects that senses what happens to the object and speaks a short pre-recorded line about it.
**Engagement:** contract, ~4–6 months, EVT through PVT support.
**Budget guide:** $90–140k for EE + ID combined, or $55–85k for EE alone if industrial design is contracted separately.

You are joining a project where the product definition, protocol, firmware architecture and companion app are already done. The app is built and working with a simulated tag. What is missing is the physical thing.

## 1. What already exists (read these first)
| Document | What it fixes |
|---|---|
| `docs/00-product-brief.md` | Product, size, price, battery and safety targets |
| `docs/hardware/system-architecture.md` | Proposed block diagram, part choices with alternates, power states |
| `docs/hardware/bom.md` | Target BOM of $11.77 @10k against a $12.00 ceiling |
| `docs/hardware/power-budget.md` | The 177 µA average budget and where it is spent |
| `docs/hardware/sensing-and-event-detection.md` | What each sensor must detect and to what accuracy |
| `docs/hardware/mechanical-and-id.md` | Enclosure, sealing, acoustics, mounts |
| `docs/hardware/compliance-and-test-plan.md` | Certification matrix and the EVT/DVT/PVT plan |
| `docs/protocol/tag-protocol.md` | The BLE contract the app already speaks |
| `docs/adr/` | Seven decisions that are settled; challenge them with evidence, not preference |

Treat these as a strong starting proposal, not scripture. If the accelerometer choice is wrong, say so and show the numbers.

## 2. Deliverables

### Phase 1 — Architecture review and schematic (weeks 1–4)
1. Written review of `system-architecture.md`: what you would change and why, with cost and power deltas.
2. Full schematic (KiCad or Altium), reviewed and annotated.
3. Updated BOM with real quotes at 1k/10k/50k, second sources identified, lead times flagged.
4. Power budget verification against your schematic, in the same format as `power-budget.md`.
5. Risk register: the five things most likely to go wrong, with mitigations.

### Phase 2 — EVT boards (weeks 5–10)
6. 4-layer PCB layout, ⌀34 mm, with the flex tail carrying the capacitive electrode. RF layout reviewed against the module vendor's guidelines.
7. 50 assembled EVT units, plus 10 bare boards.
8. **Antenna characterisation**: measured radiation pattern in all four mount configurations, including a steel bottle. This is the highest-risk unknown.
9. **Capacitive sensing bring-up**: demonstrate ≥ 20 % dynamic range through plastic bottle walls across five bottle types; characterise and document the steel failure mode.
10. **Acoustic bring-up**: measured SPL at 25 cm through the real mesh and a printed housing, with the insertion loss quantified.
11. Measured current in every power state from `power-budget.md` §1, on a PPK2 or Joulescope.

### Phase 3 — DVT (weeks 11–18)
12. Schematic and layout revisions from EVT findings.
13. 300 DVT units built to production intent.
14. Pre-scan EMC with ≥ 6 dB margin before formal testing.
15. Design for test: EOL fixture design and the nine-step test script in `compliance-and-test-plan.md` §3.4.
16. Support the certification labs through submission and any retests.

### Phase 4 — PVT and handover (weeks 19–24)
17. PVT build support at the CM, on site for the first run.
18. Yield analysis and any last design changes.
19. Complete handover pack: schematics, layout, Gerbers, BOM with approved vendors, test fixtures, EOL scripts, assembly drawings, and a written theory-of-operation.

## 3. Acceptance criteria
- BOM **≤ $12.00** at 10k, excluding accessories and packaging.
- Measured idle current **≤ 25 µA**; measured daily consumption implying **≥ 30 days** at 30 utterances/day.
- Measured SPL **73–77 dB(A) @ 25 cm** at max volume through the production acoustic path.
- **IP67** verified on 20 units before and after the 100-drop matrix.
- Event detection meeting **≥ 95 % precision / ≥ 80 % recall** per event on the field corpus (joint with firmware).
- Passes FCC, CE‑RED (including EN 18031), ASTM F963 and EN 71 on **first submission**, or with a single documented retest.
- All design files delivered in editable source form, owned by us, with no vendor lock.

## 4. Must-haves in a candidate
- Shipped **at least two** battery-powered BLE consumer products to mass production. Ask for the units, not the résumé.
- Has personally taken a product through **FCC and CE‑RED**, and can describe a time a pre-scan failed and what they did.
- Fluent in **nRF52-series** design: RF layout, module vs. bare-die tradeoffs, Nordic's power profiler.
- Has done **sub-100 µA** design and can talk about where the leakage actually came from on a real board.
- Has worked with **capacitive sensing through plastic** and knows why it is harder than the app notes suggest.
- Comfortable with **children's product safety** constraints, or willing to learn them fast and take them seriously.

## 5. Interview questions

1. Walk me through the last battery-powered BLE product you took to production. What was the measured sleep current, and what was the biggest contributor you had to hunt down?
2. Our budget is 177 µA average for 30 days on 150 mAh. Where would you expect to find the surprise that blows it?
3. We drive a 20 mm speaker to 75 dB(A) at 25 cm through an IP67 mesh. How would you validate the acoustic path before we cut the tool?
4. The tag straps to a steel vacuum bottle. What happens to a PCB-antenna BLE module, and what would you do about it?
5. We plan to sense water level capacitively through a 2 mm plastic wall, with a child's hand nearby. How do you reject the hand?
6. We chose a pre-certified module over bare nRF52840 silicon, paying $1.60/unit. At what volume would you reverse that, and what is the true cost of the switch?
7. Two exposed gold pogo pads on a product that lives in a school bag full of keys and coins. Design the protection.
8. We need ≥ 95 % precision on drop detection. How do you structure the data collection, and how do you know when you are done?
9. EN 18031 now applies to our CE marking. What does that change about how you and the firmware engineer work?
10. Tell me about a time you shipped something you knew had a latent hardware problem. What was it, how did you decide, and what happened?

## 6. Red flags
- Quotes a schedule without asking about certification. Certification, not engineering, sets this date.
- Says "we'll just use an ESP32" without addressing the sleep current. It is 5–10× worse here and Wi-Fi buys us nothing (ADR‑003).
- Dismisses the acoustic mesh insertion loss as a detail. It is a 5 dB swing on a 10 dB margin.
- Wants to skip EVT and go straight to DVT to "save time". On a sealed, certified, child-facing product this always costs more than it saves.
- Proposes a coin cell. Read ADR‑005; this is a safety decision, not a cost one.
- Will not hand over editable source files, or wants to own the design.
- Has never physically measured a sleep current below 100 µA.

## 7. How to work with us
- Weekly written update: what moved, what is blocked, what changed in the numbers.
- Every claim about power, SPL or RF comes with a measurement and the setup used.
- Design reviews are recorded against the documents above; if a document is wrong, we change the document in the same pull request.
- Bad news early is free. Bad news at PVT costs a tooling cycle.
