# Tagalong Tag — Event Engine Specification

| | |
|---|---|
| **Status** | Accepted for build · 2026‑09‑22 |
| **Owner** | Firmware |
| **Authority** | `docs/01-prd.md` §6.2/§6.3 (semantics, cooldowns, priorities, nudge classification) · `docs/hardware/sensing-and-event-detection.md` (physics and starting thresholds) · `docs/protocol/tag-protocol.md` (codes, `aux`, config) · `content/guidelines.md` §4 |
| **Implements** | `firmware/src/tagalong_policy.c`, `firmware/src/engine/*` |
| **Companions** | `firmware-architecture.md` §5/§7 · `content-pack-format.md` §§5–7 · `test-plan.md` §§2–4 |

This document is implementable: every threshold has a number, every state machine has pseudo‑code, and every rule has a host test. Where the sensing document and the PRD disagree, §1.2 says which wins and why.

---

## 1. Ground rules

### 1.1 Precision over recall

`sensing-and-event-detection.md` states the trade plainly and it is repeated here because every threshold below is chosen against it: **a false positive is worse than a missed event.** Targets per event: **≥ 95 % precision, ≥ 80 % recall** on the labelled corpus (§11). A classifier that cannot reach 95 % precision at any threshold ships disabled rather than noisy.

### 1.2 Two tables, not one

The built code has a single `tag_event_debounce_ms()` that carries the sensing document's values and is consulted inside `tag_policy_check()`. The PRD specifies different numbers for the same events. Both are right about different things, so this specification separates them:

| Layer | Name | Question it answers | Source | Keyed on |
|---|---|---|---|---|
| Detector | **detect debounce** | "is this the same physical event I just saw?" | `sensing-and-event-detection.md` | last **detection**, spoken or not |
| Policy | **utterance cooldown** | "have I already talked about this recently?" | `docs/01-prd.md` §6.2 | last **utterance** of that type |

A `drop` down the stairs is one detection (3 s detect debounce) and one utterance (20 s cooldown). Six bounces produce one event frame and one line. Without the split you either log six events or wait 20 s before noticing a second, genuinely separate drop.

Implementation: `tag_event_detect_debounce_ms(type)` in `engine/engine.c`, `tag_event_cooldown_ms(type)` in `tagalong_policy.c`. `tag_event_debounce_ms()` keeps its current name and values and becomes the detector function; the policy gains the new one (FW‑GAP‑01).

### 1.3 Time base

Everything is `uint32_t` monotonic milliseconds since boot, wrapping correctly (`now - last` on unsigned is right across the 49.7‑day wrap). `minute_of_day` (0–1439) and `day_of_week` (0 = Monday, `0xFF` = unknown) come from the app (`firmware-architecture.md` §9.7). Any rule that needs the wall clock states what it does when the time or the weekday is unknown.

---

## 2. Sampling and FIFO configuration

Set by `tag_accel_profile(thing)` at boot and re‑applied whenever `TagConfig.thing` changes.

| Thing | Accel ODR | Accel mode | FIFO watermark | Block period | Cap sense | ALS |
|---|---|---|---|---|---|---|
| bottle | 100 Hz | high‑perf while moving, 12.5 Hz LP while still | 32 | 320 ms | **1 Hz** | off |
| lunchbox | 50 Hz | low‑power | 32 | 640 ms | off | **2 Hz** |
| backpack | 25 Hz | low‑power | 32 | 1,280 ms | off | 0.2 Hz |
| toothbrush | 200 Hz | high‑perf while moving | 32 | 160 ms | off | off |
| shoes / plush / helmet / jacket / other | 50 Hz | low‑power | 32 | 640 ms | off | off |

Always armed at every ODR, in hardware: **free‑fall** and **wake‑up**. The MCU never polls the accelerometer — FW‑R1 and the second‑largest lever in the power budget.

LIS2DW12 register intent (exact values belong in `drivers/accel.c`, verified by the driver's own test at EVT):

| Function | Setting |
|---|---|
| Full scale | ±4 g (14‑bit high‑perf, 12‑bit low‑power) — 2.5 g and 3 g impact thresholds need headroom above ±2 g |
| FIFO | continuous‑to‑FIFO mode, watermark 32, `INT1_FTH` |
| Free‑fall | threshold ≤ 350 mg, duration ≥ 30 ms, routed to `INT1_FF` |
| Wake‑up | threshold ≈ 125 mg (2 LSB at ±4 g low‑power), duration 0, `INT1_WU`, `HP_REF` filter |
| Tap / double‑tap | configured but **not routed** — `tap` comes from the button (decision A‑01) |
| 6D orientation | enabled, polled from the block features rather than interrupt‑driven |

**Toothbrush at 200 Hz needs a 160 ms block**, which is finer than the 1.28 s analysis window §6 wants; the brushing classifier accumulates 8 blocks before it evaluates. This is deliberate: a 256‑sample FIFO does not exist on this part, so the accumulation happens in RAM.

Bottle ODR switching: `still → moving` promotes 12.5 Hz LP to 100 Hz high‑perf on the wake‑up interrupt; 30 s of stillness demotes. The promotion costs ≈ 90 µA while handled and is the difference between a usable `sip` tilt signature and a guess.

---

## 3. Feature extraction

One `tag_feature_block_t` (`firmware-architecture.md` §5.1) per FIFO drain. Fixed point throughout, no FPU use in the hot path — the M4F has one, but keeping the classifiers integer‑only is what lets them run unchanged in host tests.

```
on FIFO watermark:
  raw[32][3] <- burst read (I2C, ~4 ms)
  for each sample:
      a[i]      = sqrt(x^2 + y^2 + z^2)            # milli-g, integer sqrt
      g_lp[i]   = g_lp[i-1] + (a_vec[i] - g_lp[i-1]) >> 4   # gravity, tau ~ 5 blocks
      hp[i]     = a[i] - mean_prev                 # 3 Hz single-pole high-pass
  mean_g        = sum(a) / 32
  var           = sum((a - mean_g)^2) / 32         # (milli-g)^2
  hp_rms        = isqrt(sum(hp^2) / 32)
  zero_cross    = count of sign changes in hp[]
  peak_g        = max(a)
  dom_freq      = zero_cross * ODR / (2 * 32)      # coarse, adequate for 2-80 Hz bands
  gx,gy,gz      = g_lp at block end
  flags        |= FREEFALL_SEEN if the free-fall ISR fired since the last block
  flags        |= IMPACT_SEEN   if peak_g > 2500
  flags        |= CLIPPED       if any axis saturated
  push to engine_wq
```

The `mean_prev` used by the high‑pass carries across blocks, so the filter does not reset every 320 ms. An 8‑block ring of feature blocks (2.56 s at 100 Hz) is retained for the windowed classifiers.

Thresholds are expressed in milli‑g and (milli‑g)² so the published figures translate directly: `0.01 g² = 10,000 (mg)²`, `0.04 g² = 40,000 (mg)²`.

---

## 4. Common event state machines

### 4.1 `drop` (code 2, priority 1, `aux` = impact g × 10)

Two stages, both hardware‑assisted. Free‑fall alone (a fast lowering) does not fire; impact alone (a firm set‑down) does not fire.

```
STATE armed:
  on FREEFALL_SEEN:
      ff_end_ms = now
      -> STATE falling

STATE falling:
  if now - ff_end_ms > DROP_IMPACT_WINDOW_MS:      # 600 ms
      -> STATE armed
  if peak_g >= DROP_IMPACT_MG:                     # 2500 mg
      impact = peak_g
      emit(DROP, aux = clamp(impact / 100, 0, 255))
      suppress(PICKUP, 2000 ms)                    # so "ouch" lands before "thanks"
      -> STATE cooling (detect debounce 3000 ms)
```

| Constant | Value | Source |
|---|---|---|
| `DROP_FREEFALL_MG` | ≤ 350 mg on all axes for ≥ 30 ms (hardware) | sensing §2.1 |
| `DROP_IMPACT_WINDOW_MS` | 600 | sensing §2.1 |
| `DROP_IMPACT_MG` | 2,500 | sensing §2.1 |
| detect debounce | 3,000 ms | sensing §2.1, current code |
| utterance cooldown | 20,000 ms | PRD §6.2 |
| pre‑speech delay | ≤ 300 ms | TAG‑UT‑03 |

The PRD's alternative reading (free‑fall ≥ 120 ms below 0.3 g, impact ≥ 3 g) is a *stricter* detector: it would miss table‑height drops, which are the common case for a bottle. The sensing document's 30 ms / 2.5 g is the starting point; the corpus decides, and the tuned pair ships in the pack's threshold table (§12) so it can be changed without a firmware release. `aux` is the peak in g × 10, clamped at 255, which saturates at 25.5 g — well above anything survivable.

### 4.2 `pickup` (0) and `putdown` (1)

```
still   := var < 10000        # 0.01 g^2
moving  := var > 40000        # 0.04 g^2

STATE still:
  if moving for >= 2 consecutive blocks:        # 640 ms at 100 Hz
      if not transport_active:
          emit(PICKUP)
      -> STATE handled

STATE handled:
  if still for >= 5 consecutive blocks:         # 1.6 s
      if not transport_active:
          emit(PUTDOWN)                         # spoken 1 in 3, always logged
      -> STATE still
```

The 0.01 / 0.04 g² hysteresis is what stops chatter on a bus. Neither edge fires while `transport_active` (§4.8) or inside the 20 s cold‑start window.

| | `pickup` | `putdown` |
|---|---|---|
| Priority | 3 | 5 |
| Detect debounce | 2,000 ms | 2,000 ms |
| Utterance cooldown | 60,000 ms | 120,000 ms |
| Speak probability | 1/1 | **1/3, randomised** (PRD §6.2) |
| Suppressed for | toothbrush | backpack, toothbrush, shoes, helmet |

`putdown` speaking one time in three, while always logging, is the single largest contributor to the product feeling calm rather than needy. It is a policy gate, not a detector gate (§8.4).

### 4.3 `shake` (3, priority 3)

```
if zero_cross >= 4 within a 1 s window and peak_g > 1200:
    emit(SHAKE)
```

Deliberately harder to trigger than walking: a walking gait produces 2–3 crossings per second at 300–600 mg. Detect debounce 2,000 ms, utterance cooldown 45,000 ms. Suppressed for lunchbox, backpack and toothbrush (PRD §6.2). Not emitted while `transport_active`.

### 4.4 `tap` (4, priority 2)

Source: **the button**, single press ≤ 400 ms, 20 ms debounce (TAG‑BTN‑01, decision A‑01). Not an accelerometer event. Detect debounce 1,000 ms, utterance cooldown 5,000 ms, plus its own 20/hour bucket (§8.2). Unpaired tags answer a tap with a giggle sound effect and no words, because the age band is unknown (PRD §6.13).

### 4.5 `long_still` (5, priority 6, nudge)

```
if no wake-up interrupt for T(thing)
   and time is known
   and 07:00 <= minute_of_day < 20:00
   and not in either silence window
   and nudges enabled
   and fired_today < 3:
       emit(LONG_STILL)
```

| Thing | `T` | Source |
|---|---|---|
| bottle | 90 min | PRD §6.2 |
| backpack | 120 min | PRD §6.2 |
| toothbrush | 14 h | PRD §6.2 |
| shoes / plush / helmet / jacket / other | 120 min | PRD §6.2 |
| lunchbox | **never emitted** | PRD §6.2 |

Utterance cooldown 60 min, at most 3 per day. The sensing document's 45 min / once per 4 h is the same rule with different numbers; the PRD's per‑thing table is more specific and wins. Content rule: the tag is content waiting, never abandoned (`guidelines.md` §4).

### 4.6 `good_morning` (6, priority 4, nudge)

```
if first PICKUP of the day
   and preceding stillness >= 5 h
   and time is known
   and 05:00 <= minute_of_day < 10:00
   and not fired today:
       emit(GOOD_MORNING)
```

Utterance cooldown 24 h; the day counter resets at local midnight. Suppressed entirely when the time is unknown. `nudges` off means it is neither spoken nor emitted (decision A‑08).

### 4.7 `low_battery` (7) and `charging` (8), priority 4, system

| Event | Rule |
|---|---|
| `low_battery` | fuel gauge crosses **below 15 %** (exit at ≥ 18 %); announced at most **once per day**, only on motion, outside both silence windows. Below **5 %** (exit ≥ 8 %) the tag stops speaking entirely and stays connectable. |
| `charging` | `/CHG` asserted or VBUS detected. One line per attach, never inside a silence window or while muted. Sensor events other than `tap` are suppressed while charging (TAG‑BAT‑05). |

Battery state is resolved with hysteresis in the engine and handed to the policy as an enum, rather than the policy re‑deriving it from a raw percent (FW‑GAP‑07). The current code's `battery <= 5` denies at exactly 5 %, half a point stricter than the PRD; the hysteresis version supersedes it.

### 4.8 Global suppressors

| Suppressor | Rule | Affects |
|---|---|---|
| **Cold start** | no events for the first **20 s** after boot | everything |
| **Transport / vehicle** | `still` false but `dom_freq` in **4–18 Hz** with `hp_rms < 300 mg` for **> 10 s** → `transport_active`, cleared after 10 s outside the band | `pickup`, `putdown`, `shake` |
| **Confidence floor** | any classifier below its threshold emits nothing | everything |
| **Per‑thing speech suppression** | PRD §6.2 per‑thing "Suppressed" rows | speech only; the frame is still logged unless the row says "not emitted" |
| **Charging** | only `tap` survives | sensor events |
| **Post‑drop** | `pickup` suppressed for 2,000 ms after a `drop` | ordering, not noise |

`transport_active` is worth the code: without it a bottle in a backpack on a school bus produces a `pickup`/`putdown` pair every few seconds for twenty minutes.

---

## 5. Bottle events

### 5.1 Capacitive level, baseline and calibration

```
every 1 s:
    raw = capsense_window()                  # 8 x 10 ms relaxation-oscillator counts, averaged
    baseline += (raw - baseline) >> 10       # leaky integrator, tau ~ 10 min at 1 Hz
    level_pct = clamp(100 * (raw - empty) / (full - empty), 0, 100)
```

- `empty` is captured over the first 60 s of the first run, while the app shows "screw the lid on and give it a shake".
- `full` is the running maximum over 7 days.
- The leaky integrator absorbs temperature and mounting drift so a warm car does not read as a refill. Baseline and span are committed to NVS at most every 30 min.
- **Insulated‑steel detection:** if the channel's dynamic range over 24 h is **< 5 %** of the expected span, set `FAULT_CAP_BLIND`, and fall back to §5.4. The app should surface this honestly rather than pretend.

### 5.2 `filled` (16, priority 2)

```
if level rose by > 18 % of span within a 10 s window
   and still for >= 2 s after the rise
   and level_pct > 60
   and level_pct dropped below 40 since the last FILLED:
       emit(FILLED)
```

All four conditions are load bearing: the rise distinguishes filling from sloshing, the stillness means the bottle was set down or capped, the absolute level rejects a half‑fill, and the below‑40 % gate makes it one event per fill cycle. Detect debounce 60 s; utterance cooldown 5 min (PRD).

### 5.3 `sip` (17, priority 4, `aux` = peak tilt degrees) and `empty` (18, priority 4)

```
SIP:
  if pitch > 45 deg from vertical, held 0.8-6 s
     and returns within 25 deg of vertical (within 10 s)
     and (level fell by >= 3 %  OR  cap channel is blind):
         emit(SIP, aux = peak_tilt_deg)     # spoken 1 in 2

EMPTY:
  if level_pct < 8 and stable 30 s while upright
     and at least one PICKUP since the last FILLED:
         emit(EMPTY)
```

`sip` detect debounce 20 s, utterance cooldown 3 min, spoken one time in two. `empty` detect debounce 2 h, utterance cooldown 10 min. Pitch is derived from the gravity vector, referenced to the orientation captured when the tag was mounted, so it survives a strap fitted at an angle.

`empty` is **reactive, not a nudge** (decision A‑08), which is a change from the current `tag_event_is_nudge()` (FW‑GAP‑02). Its content is still written as an invitation, never a demand (`guidelines.md` §4).

### 5.4 Fallback for insulated bottles

With `FAULT_CAP_BLIND` set, fill state comes from the sloshing mass: after a `pickup`, the dominant frequency and decay envelope of lateral acceleration separate full (lower frequency, slow decay) from empty (higher frequency, fast decay).

```
after PICKUP, over the next 3 s:
    f_dom   = dominant frequency of lateral acceleration, 1-8 Hz
    decay   = blocks until hp_rms falls below 25 % of its peak
    bucket  = classify(f_dom, decay) -> FULL | PART | EMPTY, with confidence
    if confidence < 0.8: bucket = UNKNOWN          # silence is valid
    emit FILLED only on a confident EMPTY -> FULL transition
```

Expect ≈ 75 % accuracy against ≈ 95 % for capacitive. `sip` falls back to tilt alone with the longer 20 s debounce; `empty` is not emitted at all in this mode, because a wrong "I'm empty" is worse than no "I'm empty".

---

## 6. Lunchbox, backpack and toothbrush

### 6.1 Lunchbox

| Event | Pri | Detection | Detect debounce | Cooldown |
|---|---|---|---|---|
| `opened` (32) | 2 | ALS step from **< 5 lx to > 50 lx within 1 s** after ≥ 5 min dark; **or**, when lid‑mounted, lid rotation ≥ 60° then still ≥ 1 s. A gradual rise (a bag opening) is rejected. | 30 s | 2 min |
| `closed` (33) | 3 | inverse: **> 50 lx to < 5 lx**, stable 3 s; or reverse rotation to the closed orientation, still ≥ 1 s | 30 s | 2 min |
| `packed` (34) | 3 | `closed`, then light → dark within 10 min, with `minute_of_day` in **05:00–11:00** and the time known. Once per day. Reactive, not a nudge. | 12 h | 24 h |

Two mounting stories exist because the lunchbox mount is an open product question (PRD §14 Q8): adhesive inside the lid gives the light step, a handle strap gives the rotation. The classifier runs both detectors and takes whichever fires; which one is present is a calibration constant in the threshold table, not a build flag.

Known miss: a lunchbox opened inside a dark classroom bag never sees the light step. Accepted — the miss is silent.

### 6.2 Backpack

| Event | Pri | Detection | Detect debounce | Cooldown |
|---|---|---|---|---|
| `zipped` (49) | 3 | **8–20 Hz** burst lasting **0.3–1.5 s** with peak **< 800 mg** (a zipper is fast and light; a shake is slow and heavy) | 10 s | 60 s |
| `left_behind` (48) | 5 | all of: still **> 15 min**; the preceding 10 min contained **≥ 3** `pickup`/`putdown` transitions; `minute_of_day` in **07:00–09:00**; time known; `nudges` on. Once per day. | 3 h | 24 h |

`left_behind` is the most dangerous event in the product — get it wrong and the tag becomes a nag. All five conditions must hold. The sensing document also allows a 14:00–17:00 window; the PRD restricts it to the morning and to once per day, which is the calmer reading and wins. The afternoon window is a threshold‑table constant, disabled by default, so it can be enabled for a field trial without a firmware change.

### 6.3 Toothbrush

Brushing is a narrowband oscillation, which separates cleanly from everything else a toothbrush does.

```
accumulate 8 blocks (8 x 160 ms = 1.28 s) at 200 Hz:
    band_manual   = RMS energy in 2-8 Hz after high-pass
    band_electric = RMS energy in 20-80 Hz after high-pass
    band  = max(band_manual, band_electric)
    total = RMS of the whole block set
    brushing = band > 150 mg and total > 300 mg
               and orientation within 60 deg of horizontal-ish
```

| Event | Pri | Rule | `aux` | Cooldown |
|---|---|---|---|---|
| `brush_start` (64) | 2 | 3 consecutive brushing windows (≈ 4 s); once per session. The PRD's stricter 5 s / 1.2 g p‑p reading is the threshold‑table default for manual brushes. | – | 10 min |
| `brush_done` (65) | **1** | cumulative brushing reaches **120 s**, gaps of ≤ 15 s tolerated, within 4 min of `brush_start` | seconds ÷ 2 | per session |
| `brush_short` (66) | 3 | session ends (≥ 20 s no brushing) with cumulative time **15 s ≤ t < 120 s**. Below 15 s: **no event at all** — a brush knocked in a drawer stays silent. | seconds ÷ 2 | per session |

Session resets after 5 min of stillness. **At most two announced sessions per day** (a morning and an evening window), so a kid playing with the brush cannot farm celebrations. `pickup`, `putdown` and `shake` are speech‑suppressed for this thing.

`aux` for `brush_done` at 120 s is 60; the field saturates at 510 s, which is longer than any real session.

---

## 7. The debouncer

```c
/* engine/engine.c — runs before the ring and before the policy */
bool detector_accept(tag_engine_t *e, tag_event_type_t type, uint32_t now_ms)
{
    uint8_t slot = tag_event_slot(type);              /* dense 0..19, shared with the pack LUT */
    uint32_t last = e->last_detect_ms[slot];
    if (last != 0u && (now_ms - last) < tag_event_detect_debounce_ms(type)) return false;
    e->last_detect_ms[slot] = now_ms ? now_ms : 1u;
    return true;
}
```

Accepted detections are appended to the 64‑frame ring **before** the policy runs (TAG‑EV‑02: everything emitted is logged, spoken or not). Events that a suppressor rejected, and nudge events with `nudges` off, are neither emitted nor logged (decision A‑08).

`tag_event_slot()` is the same dense mapping the content pack uses (`content-pack-format.md` §4.2), which is also the fix for the 1 KiB `last_event_ms[256]` array (FW‑GAP‑11).

---

## 8. Utterance policy

Order matters, and it is the order already in `tag_policy_check()` with the additions marked.

```
 1. unknown event code                  -> DENY_UNKNOWN_EVENT
 2. battery critical (< 5 %, exit 8 %)  -> DENY_BATTERY_CRITICAL      [hysteresis: new]
 3. muted                               -> DENY_MUTED
 4. inside night OR school window       -> DENY_QUIET_HOURS
 5. nudge event with nudges off         -> DENY_NUDGES_OFF
 6. per-thing speech suppression        -> DENY_THING_SUPPRESSED      [new]
 7. probability gate (putdown 1/3, sip 1/2) -> DENY_PROBABILITY       [new]
 8. min gap since last utterance (6 s)  -> DENY_MIN_GAP
 9. utterance cooldown for this type    -> DENY_COOLDOWN
10. token bucket (drop and tap exempt;
    tap has its own 20/hour bucket)     -> DENY_RATE_LIMIT            [exemptions: new]
    -> ALLOW
```

`tag_policy_check()` stays **pure** — it never mutates state. `tag_policy_commit()` runs only when a clip actually starts playing. That is what makes the pending slot correct.

### 8.1 Silence windows

Both windows come from `TagConfig` and `tag_in_quiet_hours()` already implements them: the tag is silent inside the night window **or** the school window, and the school window applies on every day when `schoolDays == 0` or the weekday is unknown. Inside a window, sensor events are still logged; nudge events are not emitted at all (TAG‑QH‑02).

**Control ops `01` (identify) and `02` (preview) bypass both windows** (TAG‑QH‑04, decision A‑09) — the parent asked explicitly, and the app confirms first. They do not bypass mute or critical battery. This needs a separate entry point; using `tag_policy_check()` for a control op is the bug FW‑GAP‑08 describes.

If the time is unknown the night window cannot be evaluated and does not block audio; the school window is unaffected because it does not depend on the weekday being known.

### 8.2 Rate limiting

| Rule | Value |
|---|---|
| Main bucket | `maxPerHour` tokens, default 12, hard cap 30, refilled continuously (`tokens_now()` in milli‑tokens) |
| Exempt from the main bucket | `drop`, `tap` — both keep their cooldowns (TAG‑UT‑01) |
| `tap` bucket | 20 per hour, same continuous refill |
| When exhausted | LED flash only, no audio (TAG‑LED‑13); the frame is still logged |

`drop` is exempt because an object that has been knocked about and says nothing is broken, not calm. `tap` is exempt because the child pressed the button and expects an answer; its own 20/hour bucket stops a button‑mashing session from draining the battery.

### 8.3 Minimum gap, priority and the pending slot

`TAG_MIN_GAP_MS` is 6,000 ms: the tag never talks over itself and never interrupts a clip. A denied event goes into a **single** pending slot:

```
on DENY_MIN_GAP:
    if pending is empty or priority(new) < priority(pending):
        pending = { type, aux, deadline = now + TAG_PENDING_HOLD_MS }   # 3000 ms
    # the event is already in the ring either way

every 100 ms:
    if pending and now >= gap_expiry and check(pending) == ALLOW:
        speak(pending); pending = empty
    else if pending and now > pending.deadline:
        pending = empty          # dropped, still logged
```

Priorities, from PRD §6.2 (1 is highest):

| Pri | Events |
|---|---|
| 1 | `drop`, `brush_done` |
| 2 | `tap`, `filled`, `opened`, `brush_start` |
| 3 | `pickup`, `shake`, `closed`, `packed`, `zipped`, `brush_short` |
| 4 | `good_morning`, `low_battery`, `charging`, `sip`, `empty` |
| 5 | `putdown`, `left_behind` |
| 6 | `long_still` |

### 8.4 Probability gate and pre‑speech delay

```c
/* 1 in 3 for putdown, 1 in 2 for sip, 1 in 1 otherwise */
bool speak_this_time(tag_policy_t *p, tag_event_type_t t)
{
    uint8_t den = tag_event_speak_denominator(t);      /* 3, 2, or 1 */
    return den <= 1u || (tag_policy_rand(p) % den) == 0u;
}

uint16_t pre_speech_delay_ms(tag_policy_t *p, tag_event_type_t t)
{
    if (t == TAG_EVT_DROP) return 0u;                  /* start immediately, <= 300 ms to audio */
    return (uint16_t)(tag_policy_rand(p) % 801u);      /* 0-800 ms, TAG-UT-03 */
}
```

The randomised delay is not decoration: it de‑synchronises two tags on the same bottle or in the same bag (edge case E‑02), and it makes the tag feel like it noticed rather than like it fired an interrupt.

### 8.5 Volume and LED

`volume` 0–100 maps through the Q15 curve capped by the per‑unit SPL ceiling (`firmware-architecture.md` §8). `volume == 0` means **light only**: the amp is never enabled and the LED flash still happens, so a parent can keep a silent tag that still shows it noticed. Every utterance carries an LED flash (TAG‑UT‑06, A11Y‑10).

---

## 9. Phrase selection — no repeats

This must match `app/src/content/pickPhrase.ts` so that Demo mode and the real tag feel like the same product. The app's algorithm:

```ts
const recent = new Set((args.recent ?? []).slice(-3))
const fresh  = lines.filter((l) => !recent.has(l))
const pool   = fresh.length > 0 ? fresh : lines
const raw    = pool[Math.floor(random() * pool.length)] ?? pool[0]!
```

The firmware's `tag_policy_pick_clip()` is the same three steps: build the pool of clips not in `recent`, fall back to the whole set when the pool is empty, choose uniformly, then push the choice into a 3‑deep FIFO.

| Property | App (`pickPhrase.ts`) | Firmware (`tag_policy_pick_clip`) | Same? |
|---|---|---|---|
| Recent memory depth | last 3 (`slice(-3)`) | `TAG_RECENT_MEMORY = 3` | yes |
| Empty pool → whole set | yes | yes | yes |
| Uniform choice | `floor(random() * len)` | `xorshift32() % len` | yes in effect; modulo bias for a 4‑element pool is ≈ 1 in 10⁹ |
| Recent list scope | **global**, keyed by line text (`DemoPlayground` keeps one list, `slice(-4)`) | **per cell**, keyed by index within the cell | **no — FW‑GAP‑10** |
| Randomness source | `Math.random` | seeded xorshift32, deterministic | intentional: repeatable tests, no entropy source needed |

**FW‑GAP‑10 in detail.** The firmware stores indices *within the current cell*, so clip 2 of `filled` and clip 2 of `drop` collide: playing `filled[2]` wrongly excludes `drop[2]` from the next `drop`. With 4 lines per cell that removes a quarter of the available variety, which is exactly what the no‑repeat rule exists to protect. The app has no such collision because line strings are globally distinct.

Fix, and the only signature change this specification asks for:

```c
/* pack-global clip ids in recent[], so cells cannot collide */
uint16_t tag_policy_pick_clip_ref(tag_policy_t *p, const uint16_t *clip_refs, uint16_t count);
/* returns the chosen pack-global clip id; recent[] holds clip ids, not indices */
```

`clip_refs` is the cell's slice of the pack's clipref table (`content-pack-format.md` §4.3), so the engine passes what it already has and no lookup is duplicated. The existing `tag_policy_pick_clip(p, count)` stays as a thin wrapper for the tests that already use it.

**Seeding.** `tag_policy_init(p, cfg, now_ms, seed)` takes the seed from `sys_rand32_get()` at boot, mixed with the provisioning serial, so two tags in the same bag do not choose the same lines in the same order. Host tests pass a fixed seed and get identical sequences (`test-plan.md` §2.5).

**Name resolution.** A chosen clip with the splice flag set plays `segment[0] → name clip → segment[1]`. The name clip is the parent's recording when `flags.nameClipPresent` is set and the region validates (v1.1), otherwise one of the band's three fallback‑word clips chosen through the same RNG — which mirrors the app's `resolveName()` picking randomly from `AGE_BAND_META[band].fallbackNames`. Details in `content-pack-format.md` §7.

---

## 10. Full constant table

Everything a reviewer needs on one screen. Detect debounce is the detector layer, cooldown the policy layer (§1.2).

| Event | Code | Pri | Nudge | Detect debounce | Utterance cooldown | Speak prob. | `aux` | Notes |
|---|---|---|---|---|---|---|---|---|
| `pickup` | 0 | 3 | no | 2 s | 60 s | 1/1 | – | suppressed while transport active |
| `putdown` | 1 | 5 | no | 2 s | 120 s | **1/3** | – | |
| `drop` | 2 | **1** | no | 3 s | 20 s | 1/1 | impact g×10 | exempt from the hourly bucket |
| `shake` | 3 | 3 | no | 2 s | 45 s | 1/1 | – | suppressed while transport active |
| `tap` | 4 | 2 | no | 1 s | 5 s | 1/1 | – | button only; own 20/hour bucket |
| `long_still` | 5 | 6 | **yes** | 4 h | 60 min | 1/1 | – | per‑thing `T`, ≤ 3/day, waking hours |
| `good_morning` | 6 | 4 | **yes** | 12 h | 24 h | 1/1 | – | 05:00–10:00, once/day, time must be known |
| `low_battery` | 7 | 4 | system | 24 h | 24 h | 1/1 | – | < 15 %, exit 18 %, on motion only |
| `charging` | 8 | 4 | system | 60 s | per attach | 1/1 | – | one line per attach |
| `filled` | 16 | 2 | no | 60 s | 5 min | 1/1 | – | one per fill cycle |
| `sip` | 17 | 4 | no | 20 s | 3 min | **1/2** | tilt ° | |
| `empty` | 18 | 4 | **no** (A‑08) | 2 h | 10 min | 1/1 | – | not emitted in cap‑blind mode |
| `opened` | 32 | 2 | no | 30 s | 2 min | 1/1 | – | |
| `closed` | 33 | 3 | no | 30 s | 2 min | 1/1 | – | |
| `packed` | 34 | 3 | no | 12 h | 24 h | 1/1 | – | 05:00–11:00, once/day |
| `left_behind` | 48 | 5 | **yes** | 3 h | 24 h | 1/1 | – | 07:00–09:00, once/day, five conditions |
| `zipped` | 49 | 3 | no | 10 s | 60 s | 1/1 | – | |
| `brush_start` | 64 | 2 | no | 5 min | 10 min | 1/1 | – | once per session |
| `brush_done` | 65 | **1** | no | 5 min | per session | 1/1 | sec ÷ 2 | ≤ 2 sessions/day |
| `brush_short` | 66 | 3 | no | 5 min | per session | 1/1 | sec ÷ 2 | silent below 15 s |

Global: min gap 6 s · pending hold 3 s · `maxPerHour` default 12, hard cap 30 · cold start 20 s · pre‑speech delay 0–800 ms (`drop` ≤ 300 ms) · recent memory 3.

---

## 11. Unit‑test plan

### 11.1 Trace format

The `instrumented` build streams raw samples over BLE; `tools/tracereplay.py` writes them as a self‑describing binary that host tests read directly.

```
header  16 B: magic "TGTR", version u8, thing u8, accel_odr u16,
              als_hz u8, cap_hz u8, sample_count u32, reserved u16
record   8 B: t_ms u16 (delta), ax i16, ay i16, az i16  (milli-g)
aux      6 B: t_ms u16 (delta), lux u16, cap_raw u16    (interleaved, tagged)
labels      : CSV sidecar, one row per segment:
              start_ms,end_ms,label,mount,surface,height_cm,notes
```

Traces are physics, not personal data: no names, no clip ids, no timestamps of day. They are committed under `firmware/tests/traces/` (git‑lfs for anything over 1 MB) so a threshold change is always testable by anyone, forever.

### 11.2 Corpus

Per `sensing-and-event-detection.md` §8, ≥ 2,000 labelled segments:

| Class | Count | Coverage |
|---|---|---|
| `drop` | 200 | 4 surfaces (concrete, wood, carpet, tile) × 3 heights (40, 80, 150 cm) × 4 mounts |
| `pickup` / `putdown` | 300 | 3 age bands of real children, 4 mounts |
| `sip` | 200 | 5 bottle types including 2 insulated steel |
| `filled` | 150 | 5 bottle types, tap and jug, part‑fills included |
| brushing | 100 sessions | manual and electric, 3 kids per band, plus 20 "playing with the brush" negatives |
| `opened` / `closed` | 120 | both mounts, lit room and dark bag |
| `zipped` | 80 | 3 backpacks, 2 zipper sizes |
| **negatives** | 200 | car, bus, walking, running, backpack jostle, sibling interference, washing‑up, dropped *onto* a sofa |

The negatives set is the one that decides whether the product is charming or annoying, so it is sized like a first‑class class, not an afterthought.

### 11.3 Suites

All host suites use the existing dependency‑free harness (`firmware/tests/test_support.h`): `TEST`, `RUN`, `CHECK`, `CHECK_EQ`, `CHECK_BYTES`, `test_report`. No framework, runs anywhere `gcc` does.

| Suite | File | What it proves |
|---|---|---|
| Protocol vectors | `test_protocol.c` (exists) | 16‑byte `TagConfig` round trip, checksum over bytes 0–14, both quiet windows, weekday mask, `0x04` with and without the weekday byte, byte‑identical to `tools/vectors.json` shared with `codec.test.ts` |
| Policy | `test_policy.c` (exists) | min gap, cooldowns, both silence windows and their weekday behaviour, mute, nudges, token bucket, battery hysteresis, priority and the pending slot, probability gate, `tap` bucket |
| Phrase selection | `test_policy.c` | no repeat within 3; whole‑set fallback; **cross‑cell independence** (the FW‑GAP‑10 regression); identical sequence for a fixed seed; distribution over 10,000 draws within ±3 % of uniform |
| Feature extraction | `test_engine.c` | synthetic signals: DC, 5 Hz sine, 40 Hz sine, impulse, free‑fall step — each feature within tolerance of the analytic value |
| Classifiers | `test_traces.c` | every labelled trace replayed; per‑event precision and recall against the corpus |
| Pack | `test_pack.c` | `content-pack-format.md` §13 |
| ADPCM | `test_adpcm.c` | decoder matches a reference decode of `tools/` fixtures, sample‑exact |

### 11.4 Trace replay harness

```c
TEST(drop_precision_and_recall_meet_the_gate)
{
    tag_trace_t tr;  tag_engine_t e;  tag_metrics_t m = {0};
    for (const char *path : DROP_TRACES) {
        CHECK(tag_trace_open(&tr, path) == 0);
        tag_engine_init(&e, TAG_THING_BOTTLE, /* now_ms */ 0);
        tag_engine_skip_cold_start(&e);            /* the 20 s window is tested separately */
        while (tag_trace_next_block(&tr, &block)) tag_engine_feed(&e, &block);
        tag_metrics_accumulate(&m, &e, tag_trace_labels(&tr));
        tag_trace_close(&tr);
    }
    CHECK(m.precision_pct[TAG_EVT_DROP] >= 95);
    CHECK(m.recall_pct[TAG_EVT_DROP]    >= 80);
}
```

The engine takes feature blocks, not raw samples, so the replay harness runs the *same* feature extraction the firmware runs — there is one implementation, tested once.

### 11.5 CI gates

| Gate | Threshold |
|---|---|
| All host suites | pass, zero failures |
| Per‑event precision | ≥ 95 % on the corpus |
| Per‑event recall | ≥ 80 % on the corpus |
| False positives on the negatives set | **zero** spoken events per negative trace |
| Precision regression | any drop > 1 point against the previous release fails the build |
| Sanitizers | ASan + UBSan clean on every host suite |
| Coverage | ≥ 90 % line coverage on `engine/`, `tagalong_policy.c`, `tagalong_protocol.c`, `pack/` |
| Log hygiene | no `%s` in any `LOG_*` under `src/` |

---

## 12. Tuning table in the content pack

`sensing-and-event-detection.md` §8.5 requires thresholds to ship as a versioned table in the content pack, so tuning does not need a code change. The table is 512 B in the pack index (`content-pack-format.md` §4.7), CRC‑protected, and read once at mount:

| Group | Constants |
|---|---|
| Drop | free‑fall mg, free‑fall ms, impact window ms, impact mg |
| Motion | still var, moving var, blocks‑to‑pickup, blocks‑to‑putdown, transport band lo/hi Hz, transport amplitude mg, transport dwell ms |
| Shake | zero crossings, window ms, peak mg |
| Bottle | fill rise %, fill window ms, fill still ms, fill level %, refill reset %, sip tilt °, sip hold lo/hi ms, sip return °, sip level Δ%, empty level %, empty stable ms, cap‑blind range % |
| Lunchbox | dark lx, light lx, step ms, closed stable ms, rotation °, mount mode |
| Backpack | zip band lo/hi Hz, zip duration lo/hi ms, zip peak mg, left‑behind still min, transitions, window start/end, afternoon window enable |
| Toothbrush | manual band lo/hi Hz, electric band lo/hi Hz, band mg, total mg, orientation °, start windows, done s, gap s, short lo/hi s, session reset s, sessions/day |
| Per‑thing `long_still` | T minutes × 9 things |

Firmware ships compiled‑in defaults identical to the v1 pack's table, so a tag whose pack fails CRC and falls back to `essentials` still behaves correctly. A pack whose threshold‑table version is newer than the firmware understands is rejected field by field: unknown fields are ignored, known fields applied. Values are range‑checked on load; anything out of range falls back to the compiled default rather than bricking detection.

---

## 13. Assumptions recorded here

1. **Two debounce tables** (§1.2). The sensing document's values become the detector layer, the PRD's the policy layer. This is the only reading under which both documents and the shipped code are simultaneously correct.
2. **`empty` is not a nudge** (decision A‑08), superseding both `tag_event_is_nudge()` and the sensing document's §3.3 wording.
3. **`drop` uses the sensing document's 30 ms / 2.5 g**, not the PRD's 120 ms / 3 g, because the stricter pair misses table‑height drops. Both live in the threshold table; the corpus decides at EVT.
4. **`left_behind` runs in the morning window only**, per the PRD. The afternoon window is present but disabled.
5. **`long_still` uses the PRD's per‑thing timeouts**, not the sensing document's flat 45 min.
6. **The lunchbox runs both detectors** (light step and lid rotation) with a calibration constant selecting which is trusted, because the mount is still an open product question.
7. **Feature extraction is integer‑only**, so host tests and firmware share one implementation bit for bit.
8. **`tag_policy_pick_clip_ref()` is a new function** (§9) — the one API change this specification requires, and the only way to make firmware phrase variety match the app's.
