# Tagalong Tag — Power Budget

**Target: ≥30 days per charge at 30 utterances/day** (brief §5.1), on a **150 mAh** cell (ADR‑005).

Usable capacity: 150 mAh × 0.85 (cut-off at 3.4 V, ageing margin, PCM overhead) = **127.5 mAh usable**.
Daily allowance for 30 days: **127.5 / 30 = 4.25 mAh/day = 177 µA average**, continuous.

That number is the whole design constraint. Everything below is spent against it.

## 1. Current draw by state (measured targets; verify on EVT hardware)

| State | Contributors | Current | Source |
|---|---|---|---|
| **Idle** | nRF52840 System ON, RAM retained, RTC running (1.9 µA) + LIS2DW12 @12.5 Hz low-power wake-on-motion (0.38 µA) + W25Q128 deep power-down (1 µA) + VEML6030 shutdown (0.5 µA) + TPS62740 Iq (0.36 µA) + BQ25100 battery drain (1.5 µA) + leakage/divider (~5 µA) | **~12 µA** | Datasheet typicals @25 °C |
| **Active** (classifying) | Accel @100 Hz high-perf (90 µA) + CPU awake ~15 % duty @3.3 mA (495 µA equivalent... see note) + cap sense bursts (~25 µA avg) + ALS 1 Hz (~2 µA) | **~230 µA** | CPU runs in short bursts off the FIFO watermark, not continuously |
| **Advertising** (1.28 s, RPA) | Radio TX 4.8 mA for ~1.4 ms per event, 3 channels | **~45 µA avg** | nRF52840 PS v1.8 |
| **Pairing window** (100 ms undirected, 60 s) | 10× the advertising rate | **~2 mA avg**, 60 s only | |
| **Connected** (30 ms interval) | Radio + link supervision | **~180 µA avg** | |
| **Speaking** | Boost (3.0 V) + MAX98357A (2.4 mA idle, ~75 mA at 0.25 W into 8 Ω at 92 % eff.) + QSPI read (12 mA) + CPU decode (3.3 mA) | **~85 mA for ~1.5 s** | Peak, not average |
| **Charging** | BQ25100 at 120 mA | ~120 mA in, ~80 min to full | |

**Note on Active CPU duty:** the accelerometer FIFO is what makes this survivable. The MCU sleeps while the LIS2DW12 fills a 32-sample FIFO at 100 Hz (320 ms), wakes on the watermark interrupt, classifies in ~4 ms, sleeps again. Duty ≈ 1.3 %, not 15 %; the 230 µA figure above is deliberately pessimistic to leave headroom.

## 2. Daily energy model

Assumed day for a 5–7 year old with a bottle at school:

| Activity | Duration / count | Avg current | mAh/day |
|---|---|---|---|
| Idle (asleep, in a bag, overnight) | 19.0 h | 12 µA | 0.228 |
| Active (handled, moving, classifying) | 4.5 h | 230 µA | 1.035 |
| Advertising (30 min after motion, ~6 windows) | 3.0 h | 45 µA | 0.135 |
| Connected (app open, config writes) | 10 min | 180 µA | 0.030 |
| **Speaking, 30 utterances × 1.5 s** | 45 s | 85 mA | **1.063** |
| LED (low battery blink, identify, pairing) | ~20 s | 6 mA | 0.033 |
| **Total** | | | **2.52 mAh/day** |

**Predicted life: 127.5 / 2.52 = 50.6 days.**

Against the 30-day target that is **1.7× margin**, which is the right place to be before real-world losses (cold weather, a chatty 4-year-old, self-discharge, cell ageing) eat into it.

## 3. Sensitivity — what actually breaks the target

| Scenario | mAh/day | Days | Verdict |
|---|---|---|---|
| Baseline (30 utterances) | 2.52 | **51** | ✅ |
| Heavy user, 80 utterances/day | 4.35 | **29** | ⚠️ Just misses; rate limiter (`maxPerHour`, default 12) is what prevents this |
| Amp `SD_MODE` left enabled (bug) | 2.52 + 57.6 | **2.1** | ❌ Catastrophic. Must be caught in EOL test |
| Accel left at 100 Hz high-perf always | 2.52 + 2.16 | **27** | ❌ Misses. Wake-on-motion is mandatory |
| Advertising continuously at 1.28 s | 2.52 + 0.95 | **37** | ⚠️ Survivable, but ADR‑007 forbids it anyway |
| QSPI left out of deep power-down | 2.52 + 0.14 | **48** | Minor |
| Cold (0 °C, cell capacity −25 %) | 2.52 | **38** | ✅ |
| Cell at 80 % health (year 2) | 2.52 | **40** | ✅ |
| Heavy user **and** cold **and** aged | 4.35 | **17** | ⚠️ Worst realistic case. Acceptable; the app warns at 15 % |

## 4. The four levers, in order of impact
1. **Amp shutdown between clips** — 20× difference. Non-negotiable; assert `SD_MODE` low within 50 ms of clip end.
2. **Accelerometer wake-on-motion + FIFO** — 2× difference. Never poll the accelerometer from the MCU.
3. **Utterance rate limiting** — linear in utterance count. `maxPerHour` default 12, hard cap 30 (see the protocol's `TagConfig`). Quiet hours contribute here too.
4. **Advertising policy** — ~0.9 mAh/day between "always" and "30 min after motion". ADR‑007 already requires the restrained policy for privacy; it pays for itself in battery.

## 5. Verification plan
- **Bench:** Nordic PPK2 (or Joulescope JS220) in series with the cell, logging each state for ≥10 min; compare against the table in §1. Any state more than 25 % over budget is a bug, not a tolerance.
- **Automated:** a HIL script that scripts a synthetic day (motion traces + forced utterances) in 30 min of wall time and integrates charge; run on every firmware release. Regression threshold: +10 % on daily mAh fails the build.
- **Real-world:** 20 units in homes for 45 days, logging battery percent on each app connection. Report the 10th percentile, not the mean — the 10th percentile is the number that generates support tickets.
- **EOL factory test:** measure sleep current for 2 s with the amp asserted off. Reject above 25 µA. This single test catches the class of bug that turns a 50-day product into a 2-day one.
