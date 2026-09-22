# Tagalong Tag — Mechanical and Industrial Design

Design intent: **the tag should disappear and the object should come alive.** A child should read the bottle as the character, not the gadget stuck to it. So the puck is small, soft, quiet in colour, and has exactly one visible affordance.

## 1. Form

| Property | Value |
|---|---|
| Diameter | **38.0 mm** |
| Thickness | **12.0 mm** at centre, tapering to 9.5 mm at the rim |
| Mass | **≈14 g** |
| Profile | Pebble. A continuous radius rolls from the top face into the rim so there is no hard edge anywhere a child can catch |
| Button | Single, ⌀11 mm, centred, under the overmould. Travel 0.35 mm, actuation 180 gf |
| LED | 270° ring, 1.2 mm wide, diffused, flush |
| Speaker port | 7 × ⌀0.8 mm holes in a 12 mm arc on the lower rim, angled 20° down so a bottle strap never covers them |
| Charge pads | 2 × ⌀3 mm gold pads on the back face, 9 mm apart, recessed 0.3 mm |

The taper matters: it keeps the tag from looking like a hockey puck in photographs, and it means the silhouette reads as "pebble" rather than "device" on a shelf.

## 2. Materials

| Part | Material | Why |
|---|---|---|
| Inner shell (2 pc) | **Polycarbonate**, unfilled, 1.6 mm wall | Impact strength at low wall thickness; takes the drop spec |
| Overmould | **Liquid silicone rubber, 50 Shore A**, food-contact grade (FDA 21 CFR 177.2600 / EU 10/2011) | Kids put things in their mouths. Soft-touch, grippy, and survives dishwasher-adjacent abuse even though we do not claim dishwasher safe |
| Light guide | Optical PC, frosted | Even ring, no hot spots |
| Acoustic membrane | ePTFE mesh, IP67-rated (Gore GAW or Saati Acoustex) | Water out, sound through. **The single most schedule-risky part** |
| Gaskets | Compression-moulded LSR, 0.8 mm bead | Continuous, no corners |
| Mounts | 60 Shore A silicone (strap, clip), PC + 3M VHB (adhesive base) | |

No painted surfaces. No printed graphics on the child-facing side. One moulded-in logo on the back face, 4 mm, matte.

## 3. Sealing — IP67

Three barriers, not one:
1. **Ultrasonic weld** between the two PC shell halves, 0.4 mm energy director, continuous.
2. **LSR overmould** shot over the welded shell, which also forms the button diaphragm and the gasket around the charge pads. The button is *not* a separate part with a seam; it is a thinned region of the overmould.
3. **Acoustic mesh** heat-staked over the speaker port from the inside, so water pressure seats it rather than lifting it.

The charge pads are the one deliberate breach. They are gold over nickel, recessed, and surrounded by a raised silicone lip so a wet pocket does not bridge them. Conformal coating on the PCB underneath as a second line of defence.

**Verification:** IEC 60529 IP67 — 1 m immersion, 30 min — on 20 DVT units, before and after 100 drops and 500 charge cycles. A unit that passes fresh but fails after drops has failed.

## 4. Acoustics

The tension: IP67 wants a sealed box, and 75 dB(A) wants an open one.

- Internal back volume behind the speaker: **≥ 1.6 cm³**. Below that the low end collapses and the voice sounds thin and toy-like, which undermines the character.
- Port area: 7 × ⌀0.8 mm ≈ **3.5 mm²**, tuned with the back volume to sit the Helmholtz resonance around 900 Hz, in the middle of the vocal band.
- Mesh insertion loss: budget **−3 to −5 dB**. Measure on printed housings at EVT, not on a flat coupon — the real number depends on how the mesh is seated.
- Rattle: every internal part is either potted, taped, or captured. A 14 g object that rattles reads as broken.

## 5. Drop and durability

| Test | Spec |
|---|---|
| Drop | **1.5 m onto concrete, 100 cycles**, 6 faces + 4 edges, at −10 °C, +23 °C and +50 °C |
| Tumble | 500 cycles in a 1 m tumble barrel (simulates a backpack) |
| Button life | 300,000 actuations |
| Charge cycles | 500 cycles to ≥ 80 % capacity |
| Crush | 150 N static on the face for 1 min (a kid standing on it) |
| Torsion | 5 Nm applied through the strap mount |
| Immersion | IP67, plus 20 cycles of 60 °C water (hand-wash, not dishwasher) |

Failure criteria: no crack, no loss of IP67, no change in SPL greater than 2 dB, no intermittent electrical behaviour.

## 6. Mount system

One tag, four mounts, all tool-free and all captive (no loose small parts):

| Mount | Fits | Mechanism |
|---|---|---|
| **Bottle strap** | 55–95 mm diameter bottles | Silicone loop, stretch-fit, with a moulded pocket that indexes the tag's flex-tail electrode against the bottle wall — the electrode orientation is not optional, so the pocket is keyed |
| **Loop clip** | Backpack tabs, zipper pulls, lunchbox handles | Silicone loop with an over-centre catch, 30 N pull-out |
| **Lace clip** | Shoes, jackets | PC clip, snaps over the tag rim |
| **Adhesive base** | Lunchbox lids, helmets, flat surfaces | 3M VHB 5952, pre-cut, with a PC cradle the tag twists into |

**Child-safety rule:** every mount, assembled or detached, must fail the **small-parts cylinder** test (16 CFR 1501 / EN 71‑1) — meaning it must be *too large* to fit, at every stage of disassembly a child can reach. The lace clip is the one to watch; it is sized at 42 mm minimum dimension for exactly this reason. Strap pull-out is also capped: it must release below **45 N** so it cannot become a strangulation point on a cord.

## 7. Colourways

Quiet colours, one accent. The objects kids own are already loud.

| Name | Shell | Overmould | Notes |
|---|---|---|---|
| **Pebble** | Warm white | Warm grey 50A | Default, ships in the 1-pack |
| **Tangerine** | Warm white | Tagalong orange | The brand shot |
| **Sea** | Warm white | Muted teal | |
| **Moss** | Warm white | Muted olive | |

Two-packs ship Pebble + Tangerine so siblings can tell theirs apart at a glance — a real support problem in families, not a styling choice.

## 8. Charging puck

A ⌀30 × 8 mm disc on a 1 m braided USB‑C cable. Two spring pogo pins and a pair of N42 magnets (**0.8 N pull**, deliberately weak — it should release rather than drag a bottle off a table). The tag lands on it one way only, because the magnets are polarised to reject the wrong orientation. A single white LED on the puck, not on the tag, so a charging tag in a bedroom stays dark.

## 9. What we deliberately did not do
- **No coin cell**, so no battery door, no screws, no ingestion hazard (ADR‑005).
- **No exposed USB port**, because it is a sealing liability and a poking target.
- **No screen**, because it turns a character into a gadget.
- **No lanyard**, because cords near necks are a hazard class we refuse to enter.
- **No metal shell**, because it detunes the antenna and gets cold and loud when dropped.
