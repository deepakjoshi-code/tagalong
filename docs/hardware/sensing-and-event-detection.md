# Tagalong Tag — Sensing and Event Detection

How each event in the brief is detected physically, with starting thresholds a firmware engineer can implement on day one and tune on real traces. Event names and wire codes come from `docs/protocol/tag-protocol.md`; behaviour must match `docs/firmware/event-engine-spec.md`.

Design rule: **a false positive is worse than a missed event.** A bottle that says "ouch!" when nothing happened breaks the illusion and annoys parents; a bottle that misses one drop in ten is forgivable.

## 1. Sensor configuration by thing

| Thing | Accel ODR | Accel mode | Cap sense | ALS | Notes |
|---|---|---|---|---|---|
| bottle | 100 Hz | High-perf when moving, 12.5 Hz LP when still | **1 Hz** (fill level) | Off | Cap is the star sensor |
| lunchbox | 50 Hz | Low-power | Off | **2 Hz** | Lid open = light step |
| backpack | 25 Hz | Low-power | Off | 0.2 Hz | Long stillness matters more than fine motion |
| toothbrush | 200 Hz | High-perf when moving | Off | Off | Needs the oscillation band |
| shoes / plush / helmet / jacket | 50 Hz | Low-power | Off | Off | Generic pack only |

Always armed, at every ODR: **free-fall interrupt** (hardware) and **wake-up interrupt** (hardware). The MCU never polls.

## 2. Common events

### 2.1 `drop` (code 2)
Two-stage, hardware-assisted:
1. **Free-fall**: LIS2DW12 FF interrupt, threshold **≤ 350 mg on all axes for ≥ 30 ms** (≈5 cm of fall). Arms stage 2.
2. **Impact**: within **600 ms** of free-fall ending, any axis exceeds **2.5 g**.

`aux` = peak impact in g × 10, clamped to 255.

- Free-fall alone (a kid lowering the bottle fast) does **not** fire. Impact alone (setting it down hard) does **not** fire. Both, in order, within the window.
- Debounce: one `drop` per **3 s**; a tumble down stairs is one event, not six.
- Starting thresholds; retune on ≥200 labelled traces across the four mounts.

### 2.2 `pickup` (code 0) and `putdown` (code 1)
State machine on the gravity vector and motion energy, computed on each 32-sample FIFO block:

```
still   = variance(|a|) < 0.01 g^2 over 320 ms
moving  = variance(|a|) > 0.04 g^2
upright = a_z > 0.8 g            (thing-relative, calibrated at mount time)

STILL --(moving for >=2 blocks, 640 ms)--> HANDLED   => emit pickup
HANDLED --(still for >=5 blocks, 1.6 s)--> STILL     => emit putdown
```
- Hysteresis (0.01 vs 0.04 g²) prevents chatter on a bus or in a moving car.
- **Vehicle rejection:** if `still` is false but the dominant frequency sits in **4–18 Hz with low amplitude** for >10 s, classify as *transport* and suppress `pickup`/`putdown` until it ends. A bottle should not chat for the whole car journey.
- `pickup` is suppressed within 2 s of a `drop` so the "ouch → thank you" pair lands in the right order with a beat between them.

### 2.3 `shake` (code 3)
Band-limited energy: ≥ **4 zero-crossings of the high-passed (>3 Hz) signal within 1 s** with peak > 1.2 g. Debounce 2 s. Deliberately harder to trigger than walking.

### 2.4 `tap` (code 4)
LIS2DW12 **hardware single-tap**: threshold 1.6 g, quiet 30 ms, shock 70 ms, latency 200 ms. Double-tap (hardware) is reserved for mute and never produces a `tap` event.

### 2.5 `long_still` (code 5)
No motion interrupt for **45 min** *and* the local time is between 07:00 and 20:00 *and* not in quiet hours. At most **once per 4 hours**. Purpose is charm, not nagging — see the content guidelines.

### 2.6 `good_morning` (code 6)
First motion event after **06:00** local, once per calendar day, and only if quiet hours have ended. The tag has no RTC; `timeOfDayMin` is written by the app on each connection (`TagConfig` byte 10) and advanced by the RTC counter, with drift up to ±3 min/day accepted. If the tag has not synced for **>72 h**, `good_morning` and quiet hours are suppressed rather than risk speaking at 3 a.m.

### 2.7 `low_battery` (7) / `charging` (8)
- `low_battery`: fuel gauge (voltage curve + coulomb estimate) crosses **15 %**, announced at most **once per day** and only on motion. Below **5 %**, the tag stops speaking entirely but stays connectable.
- `charging`: BQ25100 `/CHG` asserted. One line, then silence.

## 3. Bottle events

### 3.1 `filled` (code 16)
Requires **both** a capacitance step and stillness, which is what distinguishes filling from sloshing:
1. Cap reading rises by **> 18 %** of the empty-to-full span within a **10 s** window.
2. The tag is **still** for **≥ 2 s** after the rise (the bottle has been set down or capped).
3. The new level is **> 60 %** of full.

Then emit `filled`. Debounce: one per **60 s**, and one per fill cycle (must drop below 40 % before `filled` can fire again).

**Calibration.** The empty-to-full span is learned, not assumed:
- First run: 60 s of readings while the app shows "screw the lid on and give it a shake" → establishes the empty baseline.
- The running max over 7 days establishes full.
- A leaky integrator (τ ≈ 10 min) tracks temperature and mounting drift so a warm car does not read as a refill.

**Known limitation.** This does not work through **vacuum-insulated steel**. Detection:  if the cap channel's dynamic range over 24 h is **< 5 %** of the expected span, the tag sets a flag in `TagInfo` and the firmware falls back to §3.4. The app should surface this honestly rather than pretend.

### 3.2 `sip` (code 17)
Tilt signature, not level:
1. Pitch exceeds **45° from vertical** for **0.8–6 s** (a drinking tilt, not a tumble).
2. Returns to within **25° of vertical**.
3. Cap level has fallen by **≥ 3 %**, or on non-cap bottles the tilt alone is accepted with a longer debounce.

`aux` = peak tilt in degrees. Debounce **20 s** — nobody wants commentary on every gulp.

### 3.3 `empty` (code 18)
Cap level below **8 %** of span **and** the bottle has been picked up at least once since the last `filled`. At most once per 2 h, and suppressed entirely if `nudges` is off, because "I'm empty" is a nudge.

### 3.4 Fallback for insulated bottles
Fill state is inferred from **the pendulum period of the sloshing mass**: after a `pickup`, the decay envelope and dominant frequency of lateral acceleration differ measurably between full (low frequency, slow decay) and empty (high frequency, fast decay). Classify into three buckets — full / part / empty — with a confidence threshold, and emit `filled` only on a confident empty→full transition. Expect **~75 % accuracy** versus ~95 % for capacitive; this is why the bottle strap ships with a note recommending plastic bottles.

## 4. Lunchbox events

| Event | Detection |
|---|---|
| `opened` (32) | ALS step from **< 5 lx to > 50 lx within 1 s**, having been dark ≥ 5 min. Debounce 30 s. Suppressed if the step is gradual (a bag opening). |
| `closed` (33) | Inverse: **> 50 lx to < 5 lx**, stable 3 s. |
| `packed` (34) | `closed` **plus** motion within 60 s **plus** local time between 06:00 and 09:00. Once per day. |

Dark-bag confusion is the main risk: a lunchbox opened inside a dark classroom bag never sees the light step. Accepted; the miss is silent and harmless.

## 5. Backpack events

| Event | Detection |
|---|---|
| `zipped` (49) | Accelerometer signature of a zipper: **8–20 Hz burst lasting 0.3–1.5 s** with peak < 0.8 g, distinct from a shake. Debounce 10 s. |
| `left_behind` (48) | Still for **> 20 min** **and** the preceding 10 min contained ≥ 3 `pickup`/`putdown` transitions (the room was busy) **and** local time is 07:00–09:00 or 14:00–17:00 **and** `nudges` is on. At most **once per 3 h**. |

`left_behind` is the most dangerous event in the product: get it wrong and the tag becomes a nag. All four conditions must hold, and the content guidelines require an invitation, never a demand.

## 6. Toothbrush events

Brushing is a **narrowband oscillation**, which is easy to separate from everything else a toothbrush does.

```
Sample at 200 Hz. Every 256 samples (1.28 s):
  band = RMS energy in 2-8 Hz (manual) or 20-80 Hz (electric) after high-pass
  brushing = band > 0.15 g and total energy > 0.3 g and orientation within 60 deg of horizontal-ish
```

| Event | Detection |
|---|---|
| `brush_start` (64) | 3 consecutive brushing windows (≈4 s). Emitted once per session. |
| `brush_done` (65) | Cumulative brushing time in the session reaches **120 s**, allowing gaps of ≤ 15 s. `aux` = seconds ÷ 2. |
| `brush_short` (66) | Session ends (≥ 20 s of no brushing) with cumulative time **between 15 s and 110 s**. Below 15 s: no event at all — a toothbrush knocked in a drawer must stay silent. |

Session resets after 5 min of stillness. Maximum two sessions announced per day (morning and evening windows), so a kid playing with the brush does not farm celebrations.

## 7. False-positive controls (global)

| Control | Rule |
|---|---|
| Rate limit | `maxPerHour` from `TagConfig`, default 12, hard cap 30. Token bucket, refilled continuously. |
| Quiet hours | No audio between `quietStart` and `quietEnd`. Events are still buffered and reported to the app. |
| Mute | `ControlOp 0x03`. No audio, no LED. Events still buffered. |
| Per-event debounce | As listed above; every event has one. |
| Transport suppression | Vehicle detection (§2.2) suppresses `pickup`/`putdown`/`shake`. |
| Cold start | No events for the first **20 s** after boot, while baselines settle. |
| Confidence floor | Any classifier below its confidence threshold emits nothing. Silence is always a valid output. |

## 8. Calibration and tuning plan

1. **Instrumented build.** A firmware variant streams raw accel/cap/ALS over BLE to a laptop at 100 Hz for capture sessions.
2. **Labelled corpus.** Target ≥ 2,000 labelled segments: 200 drops (4 surfaces × 3 heights), 300 pickups, 200 sips, 150 fills, 100 brushing sessions (manual + electric, 3 kids per age band), 200 negatives (car, bus, walking, backpack jostle, sibling interference).
3. **Offline tuning.** Score thresholds on the corpus; optimise for **precision first** (target ≥ 95 % precision, ≥ 80 % recall per event).
4. **Field validation.** 20 families, 2 weeks, tag logs events and parents flag anything that felt wrong in the app. Any event with > 1 complaint per family-week goes back to step 3.
5. **Lock at DVT.** Thresholds ship as a versioned table in the content pack so they can be tuned in a firmware update without a code change.

## 9. What is deliberately *not* sensed
No microphone (ADR‑004). No location, GPS, Wi-Fi scanning or UWB (ADR‑007). No camera. No heart rate or any biometric. The tag cannot tell who is holding it, and that is a feature.
