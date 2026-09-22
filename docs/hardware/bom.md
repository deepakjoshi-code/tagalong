# Tagalong Tag — Bill of Materials (HW rev A)

Target from the brief: **BOM ≤ $12.00 at 10k units.** Prices are budgetary distributor/broker estimates as of 2026‑09; treat ±15 % as normal and re-quote at RFQ. Currency USD.

## 1. Line items

| # | Function | MPN | Manufacturer | Qty | @1k | @10k | Ext @10k | Notes / risk |
|---|---|---|---|---|---|---|---|---|
| 1 | MCU + BLE module (pre-certified) | MDBT50Q‑1MV2 | Raytac (nRF52840) | 1 | 5.10 | **4.10** | 4.10 | ⚠️ Largest line. Pre-cert saves ~$30k + 8 wks |
| 2 | Content flash, 16 MB QSPI NOR | W25Q128JVSIQ | Winbond | 1 | 1.35 | **1.02** | 1.02 | 2nd src: MX25L12835F. NOR pricing is cyclical |
| 3 | Accelerometer | LIS2DW12TR | ST | 1 | 0.79 | **0.62** | 0.62 | 2nd src: BMA400 |
| 4 | I²S class-D amplifier | MAX98357AETE+T | Analog Devices | 1 | 1.18 | **0.92** | 0.92 | 2nd src: PAM8302 (analog, needs DAC) |
| 5 | Speaker, 20 mm 8 Ω 1 W | AS02008MR‑3‑R | PUI Audio | 1 | 1.05 | **0.78** | 0.78 | Drives the SPL budget; do not substitute blind |
| 6 | Ambient light sensor | VEML6030 | Vishay | 1 | 0.68 | **0.51** | 0.51 | Could be dropped for non-lunchbox SKUs |
| 7 | Li-Po cell 150 mAh + PCM | custom 502025 | Grepow / EVE | 1 | 1.90 | **1.45** | 1.45 | ⚠️ Needs IEC 62133‑2 + UN38.3 certs on file |
| 8 | Battery charger | BQ25100YFPR | TI | 1 | 0.62 | **0.44** | 0.44 | |
| 9 | Buck 1.8 V logic rail | TPS62740DSSR | TI | 1 | 0.71 | **0.53** | 0.53 | 360 nA Iq is load-bearing for battery life |
| 10 | Boost 3.0 V audio rail | TPS61099YFFR | TI | 1 | 0.48 | **0.35** | 0.35 | Gated; only on while speaking |
| 11 | RGB LED, side-fire | 19‑337C/R6GHBHC | Everlight | 2 | 0.13 | **0.09** | 0.18 | |
| 12 | Tactile switch, sealed | PTS815 SJM | C&K | 1 | 0.22 | **0.16** | 0.16 | 300k cycle rating |
| 13 | Pogo pads + magnets (tag side) | custom | — | 1 set | 0.55 | **0.38** | 0.38 | Gold-plated; magnet pull ≤ 0.8 N |
| 14 | TVS + Schottky protection | PESD5V0X1BT, RB751 | Nexperia / Rohm | 3 | 0.10 | **0.07** | 0.21 | On pogo pins |
| 15 | Passives (0402 R/C, ferrites, inductors) | — | — | ~48 | 0.62 | **0.41** | 0.41 | |
| 16 | PCB, 4-layer ⌀34 mm + flex tail | — | — | 1 | 1.45 | **0.88** | 0.88 | Rigid-flex adds cost; see note |
| 17 | Housing, PC shell (2 pc) | — | — | 1 set | 0.95 | **0.62** | 0.62 | Tooling amortised separately |
| 18 | LSR silicone overmould | — | — | 1 | 0.74 | **0.48** | 0.48 | Food-contact-safe grade |
| 19 | Acoustic mesh, IP67 | GAW334 or Saati equiv. | Gore / Saati | 1 | 0.36 | **0.24** | 0.24 | ⚠️ Drives the SPL insertion loss |
| 20 | Gaskets, adhesive, light pipe | — | — | 1 set | 0.30 | **0.20** | 0.20 | |
| 21 | SMT assembly + test | — | — | 1 | 1.60 | **0.95** | 0.95 | Incl. EOL SPL + RF test time |
| | | | | | | **Subtotal** | **$11.43** | |
| | | | | | | Scrap/yield 3 % | 0.34 | |
| | | | | | | **BOM total @10k** | **$11.77** | **under the $12.00 target** |

## 2. Not in the BOM above (accessories and packaging, costed separately)

| Item | @10k | Note |
|---|---|---|
| Magnetic charging puck + USB‑C cable | 2.35 | One per 1-pack; shared in multi-packs |
| Bottle strap mount (silicone) | 0.42 | In box |
| Zipper/lace clip mount | 0.31 | In box |
| Adhesive base (3M VHB pre-cut) | 0.18 | In box |
| Retail box, insert, quick-start + privacy cards | 1.15 | See `docs/03-unboxing-and-packaging.md` |
| **Landed accessory + packaging** | **4.41** | |

**All-in landed per 1-pack unit: ≈ $16.18** before duty and freight. At $29.99 retail that is a 46 % gross margin on DTC and roughly 28 % after Amazon fees — see `docs/gtm/pricing-and-packaging.md`.

## 3. Single-source and supply risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Raytac module allocation** | Line stop | Qualify Fanstel BT840F footprint-compatible at EVT; keep 8 weeks of buffer stock |
| **NOR flash price cycling** | +$0.40/unit | Dual-source Winbond/Macronix on the same footprint and SFDP profile |
| **Li-Po cell certification** | 6–10 week delay if the vendor's UN38.3 is stale | Require current certs at PO; audit at DVT |
| **Speaker substitution** | Fails EN 71‑2 acoustics or under-delivers SPL | Treat the speaker + mesh as a matched pair; re-test SPL on any change |
| **Tariffs on Chinese-origin electronics** | Up to +25 % landed | Quote a Vietnam or Malaysia CM in parallel at DVT |

## 4. Tooling and NRE (one-time)

| Item | Estimate |
|---|---|
| Injection tooling, PC shell (2 cavities) | $22,000 |
| LSR overmould tool | $14,000 |
| Mount family tooling (strap, clip, base) | $11,000 |
| Charging puck tooling | $8,000 |
| EVT/DVT/PVT builds (3 × 50–500 units) | $35,000 |
| Certification (see `compliance-and-test-plan.md`) | $68,000–$95,000 |
| Contract EE + ID (see `ee-hiring-brief.md`) | $90,000–$140,000 |
| **Total NRE to PVT** | **$248,000–$325,000** |

## 5. Cost-down levers (post-launch, not for rev A)
1. Bare nRF52840 instead of the module: **−$1.60**, costs ~$35k certification. Break-even ≈ 22k units.
2. Drop the ambient light sensor on bottle-only SKUs: **−$0.51**.
3. 8 MB flash if the EN pack compresses under 6 MB: **−$0.35**.
4. Move to a 2-layer rigid PCB with a separate electrode film: **−$0.30**, costs mechanical complexity.
5. Volume pricing at 50k: expect **−8 to −12 %** across silicon.
