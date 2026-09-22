# Tagalong Tag — Compliance and Test Plan

A connected, battery-powered, sound-making toy for children aged 2–12 is one of the most heavily regulated consumer categories there is. This is the full list, with lead times, because certification schedule — not engineering — is usually what sets a hardware launch date.

## 1. Certification matrix

| Domain | Standard / regulation | Market | What it covers for us | Lead time | Est. cost |
|---|---|---|---|---|---|
| **Toy safety, mechanical** | ASTM F963‑23 | US | Small parts, sharp edges, drop, torque, tension, battery accessibility | 4–6 wks | $6–9k |
| | EN 71‑1 | EU/UK | Mechanical and physical properties | 4–6 wks | $5–8k |
| **Toy safety, chemical** | EN 71‑3, CPSIA (lead, phthalates) | EU/UK/US | Migration of elements from silicone and PC | 3–4 wks | $4–6k |
| **Toy acoustics** | EN 71‑1 §4.20 / ASTM F963 §4.5 | EU/UK/US | ≤ 85 dB(A) impulsive, ≤ 65 dB(A) continuous at 50 cm | 2 wks | $2–3k |
| **Flammability** | EN 71‑2 | EU/UK | Overmould and shell | 2 wks | $1.5k |
| **Battery, cell** | IEC 62133‑2 | Global | Li-ion cell safety | Vendor holds | — (require at PO) |
| **Battery, transport** | UN 38.3 | Global | Shipping lithium cells | Vendor holds | — (require at PO) |
| **Battery, product** | 16 CFR 1263 (Reese's Law) | US | Button/coin cell rules — **N/A**, we use a sealed Li-Po (ADR‑005). Document the rationale in the file | — | — |
| **Radio, US** | FCC Part 15.247 | US | Intentional radiator — **covered by the module's grant**; we file a Class II permissive change or use the module grant with a compliant antenna | 2–3 wks | $4–7k |
| **Radio, Canada** | ISED RSS‑247 | CA | Module grant | 1–2 wks | $2–3k |
| **Radio, EU/UK** | CE‑RED 2014/53/EU; EN 300 328, EN 301 489, **EN 18031‑1/‑2** | EU/UK | ⚠️ EN 18031 (cybersecurity for radio equipment) applies to internet-connected and toy radio equipment. Our zero-backend design helps, but bonding, DFU signing and factory reset must be documented | 6–10 wks | $12–18k |
| **Radio, unintentional** | FCC Part 15B / EN 55032 | US/EU | Digital emissions | With the above | incl. |
| **Bluetooth** | Bluetooth SIG QDID + Declaration | Global | Required to use the trademark; module carries a QDID, we file an End Product Declaration | 2 wks | $2.5k (member fee) |
| **RoHS / REACH** | EU 2011/65, EC 1907/2006 | EU/UK | Substance declarations from suppliers | 2–3 wks | $2–4k |
| **WEEE / Batteries Directive** | EU 2012/19, EU 2023/1542 | EU | Registration, marking, take-back | 3–4 wks | $3–5k |
| **Ingress** | IEC 60529 IP67 | Global | Our own claim; must be substantiated | 2 wks | $2–3k |
| **Packaging** | EN 71‑1 (packaging film), CPSIA tracking label | EU/US | Suffocation warnings, traceability | 1 wk | $1k |
| **UK** | UKCA + PSTI (Product Security) | UK | PSTI statement of compliance: no default passwords, vulnerability disclosure policy, defined support period | 2–3 wks | $3–5k |
| | | | | **Total** | **$50–77k** |

Add **$15–20k** contingency for a failed first pass (assume one). Budget **$68–95k** and **14–18 weeks** from DVT-complete to full certification, running domains in parallel.

**The two schedule traps:**
1. **EN 18031** is newer than most people's mental model of CE for toys and can add 4 weeks if the security documentation is written after the fact. Write it during firmware development (`docs/firmware/dfu-and-security.md` is the input).
2. **EN 71‑3 chemical** needs production-representative material from the real tool. Do not test prototype silicone; it will not be the same compound.

## 2. Compliance requirements that constrain design

| ID | Requirement | Source | Where it is enforced |
|---|---|---|---|
| CMP‑01 | Sound ≤ 75 dB(A) @ 25 cm at max volume, all clips | EN 71‑1 (85 limit, we hold 10 dB margin) | Firmware gain clamp + EOL test |
| CMP‑02 | No accessible small parts at any stage of disassembly a child can reach | 16 CFR 1501, EN 71‑1 | Mechanical design review + ASTM test |
| CMP‑03 | Battery not user-accessible; no tools-free opening | ASTM F963, Reese's Law rationale | Ultrasonic weld + overmould |
| CMP‑04 | Strap releases below 45 N; no cord longer than 220 mm | EN 71‑1 strangulation | Mount design |
| CMP‑05 | No default password, no shared secret; bonding required for config | PSTI, EN 18031 | BLE stack config (ADR‑007) |
| CMP‑06 | Signed firmware only; anti-rollback | EN 18031, PSTI | MCUboot (see firmware docs) |
| CMP‑07 | Published support period and vulnerability disclosure contact | PSTI | Website + in-box card |
| CMP‑08 | Factory reset clears all bonds and config | EN 18031, GDPR | `ControlOp 0x05` |
| CMP‑09 | Materials in mouth-contact areas food-contact safe | EN 71‑3, FDA | LSR material selection |
| CMP‑10 | CPSIA tracking label: batch, date, location | CPSIA §103 | Moulded-in + box |

## 3. Development test plan

### 3.1 EVT (Engineering Validation, ~50 units)
Goal: **does the physics work?**

| Test | Pass criteria |
|---|---|
| Sleep current | ≤ 25 µA idle, ≤ 1 µA amp off |
| SPL sweep | ≥ 73 dB(A) @ 25 cm through the real mesh and housing |
| RF radiation pattern | ≤ 4 dB degradation strapped to a plastic bottle; characterise steel |
| Cap sensing range | ≥ 20 % dynamic range on 5 bottle types; document steel failure |
| Accel event capture | Instrumented build streams traces; corpus collection begins |
| Charge and thermal | ≤ 45 °C surface at full charge current, 25 °C ambient |
| Drop, informal | 20 drops, 1.5 m, no functional failure |

Exit: BOM frozen, no open electrical unknowns, threshold tuning corpus in hand.

### 3.2 DVT (Design Validation, ~300 units)
Goal: **does the product work, from the real tools?**

| Test | Pass criteria |
|---|---|
| Full drop matrix | 100 drops × 3 temperatures, 10 units, zero cracks or IP loss |
| Tumble | 500 cycles, 10 units |
| IP67 | 1 m / 30 min, 20 units, before and after drops |
| Battery life | 20 units, scripted synthetic day, ≥ 30 days extrapolated |
| Charge cycling | 500 cycles, ≥ 80 % capacity |
| Button life | 300k actuations, 5 units |
| BLE conformance | Bluetooth SIG test suite passes |
| Event accuracy | ≥ 95 % precision, ≥ 80 % recall per event on the field corpus |
| Pre-scan EMC | Margin ≥ 6 dB below limits before formal testing |
| Chemical | EN 71‑3 on production materials |

Exit: certification submissions filed, field trial (20 families, 14 days) complete.

### 3.3 PVT (Production Validation, ~2,000 units)
Goal: **can the factory build it repeatably?**

| Test | Pass criteria |
|---|---|
| Line yield | ≥ 97 % first-pass |
| EOL test coverage | Every unit, every station (below) |
| Golden-sample SPL | ±2 dB across 50 random units |
| Cpk on critical dims | ≥ 1.33 on shell weld, port area, pad position |

### 3.4 End-of-line factory test (every unit, ~45 s)
1. Boot, read firmware and hardware revision.
2. **Sleep current ≤ 25 µA** with the amp asserted off. *(Catches the class of bug that turns 50 days into 2.)*
3. Accelerometer self-test; ALS reading within a window under a fixed lamp.
4. Cap electrode baseline within window (detects a cracked flex tail).
5. **SPL at 1 kHz ≥ 73 and ≤ 77 dB(A) @ 25 cm** in an anechoic fixture.
6. BLE TX power and frequency check.
7. Charge current 110–130 mA with a load.
8. Button actuation, LED colour check by photodiode.
9. Write serial + calibration constants, set ship mode, print label.

Reject any unit failing any step. No rework on sealed units — they are scrapped, which is why step 2 and step 5 sit before final assembly in the line layout.

## 4. Ongoing obligations after launch
- **EU CRA / PSTI:** maintain a vulnerability disclosure channel and a published support window (recommend **5 years** from last ship date). Report actively exploited vulnerabilities to ENISA within the CRA's reporting windows.
- **Firmware updates:** signed only; anti-rollback enforced. Publish a changelog.
- **Incident file:** keep the technical file, test reports and DoC for **10 years** after the last unit ships.
- **Annual review:** ASTM F963 and EN 71 are revised periodically; re-check before each production run.
