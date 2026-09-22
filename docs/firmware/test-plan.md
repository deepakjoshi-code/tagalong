# Tagalong Tag — Firmware Test Plan

| | |
|---|---|
| **Status** | Accepted for build · 2026‑09‑22 |
| **Owner** | Firmware |
| **Authority** | `docs/hardware/compliance-and-test-plan.md` (product‑level gates, EOL) · `docs/02-roadmap.md` §§3/4/9 (milestones and gates) · `docs/01-prd.md` §6 · `docs/hardware/power-budget.md` §5 · `docs/privacy/threat-model.md` §10 |
| **Companions** | `firmware-architecture.md` · `event-engine-spec.md` §11 · `content-pack-format.md` §13 · `dfu-and-security.md` |

`compliance-and-test-plan.md` covers the product: drop matrices, IP67, chemical, EMC, certification. This document covers **what firmware has to prove, and how a machine proves it**. The split matters because firmware regressions are the failure class that reaches customers after launch, when the tooling either exists or does not.

Everything in §§2–4 runs on a laptop in under two minutes. Everything in §§5–9 runs on a rig, unattended, on every release.

---

## 1. Levels, and what each one is for

| Level | Where | Runs | Catches |
|---|---|---|---|
| **L1 host unit** | laptop / CI, `gcc` and `clang` | every commit | protocol and policy logic, pack parsing, ADPCM, arithmetic |
| **L2 trace replay** | laptop / CI | every commit | detection precision and recall against recorded reality |
| **L3 Zephyr on `native_sim`** | laptop / CI | every commit | driver shims, state machines, NVS, timekeeping |
| **L4 HIL** | rig | every release, nightly on `main` | real radio, real audio, real power, real flash |
| **L5 conformance and compliance** | rig + lab | per gate | Bluetooth SIG, EN 71 acoustics, EN 18031, PRV‑65 |
| **L6 factory** | production line | every unit | the build the factory actually shipped |

Gate mapping from the roadmap: **G0** (Oct 2026) needs L1–L3 running against the protocol reference; **G1** (Jan 2027, EVT exit) needs L4 and the tuning corpus; **G2** (Apr 2027, DVT exit) needs L5 complete; **G3** (May 2027, PVT exit) needs L6 proven on the line and one DFU dry run across the PVT fleet.

---

## 2. L1 — host unit tests

The harness already in the tree (`firmware/tests/test_support.h`) is dependency‑free: `TEST`, `RUN`, `CHECK`, `CHECK_EQ`, `CHECK_BYTES`, `test_report`. It runs anywhere `gcc` does, with no Python, no CMake and no Zephyr. That is a feature, not a limitation — it is why a contract EE or a new firmware hire can run the whole suite five minutes after cloning.

```
cc -std=c99 -Wall -Wextra -Werror -Wconversion -O1 -g \
   -fsanitize=address,undefined \
   -Iinclude -Itests \
   src/tagalong_protocol.c src/tagalong_policy.c src/engine/*.c src/pack/pack.c \
   src/audio/adpcm.c tests/test_*.c -o build/hosttests && ./build/hosttests
```

### 2.1 Suites

| Suite | File | Status | Covers |
|---|---|---|---|
| Protocol | `test_protocol.c` | exists | frame codecs, checksums, enum validation, quiet windows |
| Policy | `test_policy.c` | exists | the whole utterance policy |
| Engine | `test_engine.c` | new | feature extraction and classifier state machines |
| Traces | `test_traces.c` | new | §3 |
| Pack | `test_pack.c` | new | `content-pack-format.md` §13 |
| ADPCM | `test_adpcm.c` | new | sample‑exact decode against reference fixtures |

### 2.2 Protocol suite — the cases that must not rot

| Test | Asserts |
|---|---|
| `config_round_trip_16_bytes` | encode → decode is the identity; `TAGALONG_CONFIG_LEN == 16` |
| `config_checksum_covers_bytes_0_to_14` | flipping any of bytes 0–14 is detected; byte 15 is the checksum itself |
| `config_rejects_short_frame` | 13 and 15 byte writes → `TAG_ERR_LENGTH` (the length check runs before anything is parsed) |
| `config_rejects_bad_version_and_enums` | version ≠ 1 → `TAG_ERR_VERSION`; band 3, personality 3, thing 8, language 3 → `TAG_ERR_VALUE` |
| `quiet_hours_wrap_midnight` | 20:00–07:00 is true at 23:00 and 03:00, false at 12:00 |
| `quiet_hours_start_equals_end_disables` | a zero‑width window never silences |
| `school_window_independent_of_night_window` | either window silences; both disabled means never |
| `school_mask_zero_means_every_day` | `schoolDays == 0` silences on all seven days |
| `school_window_applies_when_weekday_unknown` | `TAG_DAY_UNKNOWN` → the window applies. **This is the fail‑safe; it is a test, not a comment.** |
| `school_mask_respects_named_days` | mask `0b0011111` (Mon–Fri) silences Tue, does not silence Sun |
| `control_set_time_accepts_three_and_four_bytes` | `04 <min>` sets time only; `04 <min> <dow>` sets both; `dow > 6` → `TAG_ERR_VALUE` |
| `control_factory_reset_needs_the_magic` | `05 00` rejected, `05 A5` accepted |
| `event_frame_unknown_code_rejected` | code 9, 15, 67, 255 → `TAG_ERR_VALUE` |
| `event_aux_semantics` | `drop` aux clamps at 255 (25.5 g); `brush_done` at 120 s → 60 |
| `uptime_wraps_cleanly` | `uptimeSec` at `0xFFFFFFFF` encodes and decodes |

### 2.3 Cross‑language vectors

The app and the firmware are two implementations of one wire format, and the only way that stays true is a shared fixture.

`tools/vectors.json` holds ≈ 40 cases, each `{name, kind, fields, bytes}`. `test_protocol.c` reads it through a tiny parser; `app/src/transport/codec.test.ts` reads the same file. A change to either implementation that breaks the other fails both test suites, in both languages, on the same commit.

Required vectors: a default config; both quiet windows on; night only; school only; all seven weekday masks; quiet disabled; `maxPerHour` at 1 and 30; volume 0 and 100; thing `other` (255); every event code with representative `aux`; every `ControlOp` including `04` in both lengths; a deliberately corrupt checksum; a short frame.

### 2.4 Policy suite

| Group | Tests |
|---|---|
| Min gap | a second event 2 s later is `DENY_MIN_GAP`; at 6,001 ms it is allowed; a **different** event type is still blocked (the tag never talks over itself, whatever it is about) |
| Cooldown | each of the 20 events blocked for its own cooldown and allowed after it; cooldowns are independent per type |
| Detector vs policy | a detection inside the detector debounce never reaches the ring; a detection outside it but inside the utterance cooldown **does** reach the ring and is not spoken (TAG‑EV‑02) |
| Silence windows | night, school, both, neither; weekday behaviour per §2.2; nudges not emitted inside a window; reactive events still logged |
| Control bypass | `01` and `02` play inside both windows; they do **not** play when muted or at critical battery |
| Mute | no audio for any event including `tap`, `charging`, `low_battery`; events still logged; expiry on the timer; cleared by reboot |
| Nudges | with `nudges` off, `long_still`, `good_morning` and `left_behind` are neither spoken nor logged; **`empty` is unaffected** (decision A‑08 — this test is what pins FW‑GAP‑02 shut) |
| Rate limit | 12 utterances then `DENY_RATE_LIMIT`; continuous refill grants one more after 5 min; `drop` and `tap` still allowed when the main bucket is empty; `tap` blocked after 20 in an hour |
| Battery | allowed at 6 %, denied at 4 %, hysteresis holds denial until 8 %; `charging` is the one event allowed at critical |
| Priority and pending | a `drop` denied by min gap displaces a pending `putdown`; a `long_still` does not displace a pending `drop`; a pending event expires after 3 s and is not spoken; a pending event that plays consumed no token while it waited |
| Probability | over 30,000 draws, `putdown` speaks 33 % ± 1 and `sip` 50 % ± 1; both are logged 100 % of the time |
| Pre‑speech delay | `drop` returns 0; every other event returns 0–800 inclusive; the distribution is flat within ±3 % |
| Purity | `tag_policy_check` leaves `tag_policy_t` byte‑identical (`CHECK_BYTES` before and after) — the property the pending slot depends on |

### 2.5 Phrase selection

| Test | Asserts |
|---|---|
| `no_repeat_within_three` | 1,000 draws from a 4‑clip cell never repeat within a window of 3 |
| `whole_set_fallback` | with a 3‑clip cell and 3 remembered, a draw still returns a clip (never a failure, never a hang) |
| `cross_cell_independence` | drawing from cell A does not shrink the pool in cell B. **The FW‑GAP‑10 regression test**: it fails against today's `tag_policy_pick_clip` and passes against `tag_policy_pick_clip_ref`. |
| `deterministic_for_a_fixed_seed` | the same seed produces the same 100‑draw sequence, on every platform, in every build |
| `distribution_is_flat` | 10,000 draws from a 4‑clip cell land within ±3 % of 25 % each |
| `matches_the_app` | replaying the exact `recent` sequences from `app/src/content/pickPhrase.test.ts` produces the same choices for the same synthetic random stream |

### 2.6 Non‑functional gates

| Gate | Threshold |
|---|---|
| Sanitizers | ASan + UBSan clean, both `gcc` and `clang` |
| Warnings | `-Wall -Wextra -Werror -Wconversion` clean on `tagalong_*.c`, `engine/`, `pack/`, `audio/adpcm.c` |
| Coverage | ≥ 90 % lines, ≥ 85 % branches on those files |
| Runtime | the whole L1 suite under 5 s, so nobody is tempted to skip it |
| Determinism | two consecutive runs produce identical output |

---

## 3. L2 — trace replay

Format, corpus and metrics are specified in `event-engine-spec.md` §11; this is the execution side.

| Property | Value |
|---|---|
| Input | `firmware/tests/traces/*.tgtr` + CSV label sidecars, git‑lfs above 1 MB |
| Path under test | the **production** feature extractor and classifiers, unmodified |
| Corpus size at G1 | ≥ 2,000 labelled segments, including 200 negatives |
| Runtime | ≤ 60 s for the full corpus on one core |
| Gates | per‑event precision ≥ 95 %, recall ≥ 80 %, **zero spoken events across the entire negatives set**, and no precision regression greater than 1 point against the previous release |

Traces are physics, not personal data: accelerometer, lux and capacitance counts, with no name, no clip id and no time of day. They are committed so that a threshold change three years from now is still testable by whoever inherits this.

Per‑release output is a one‑page confusion matrix per event, archived with the release manifest. A tuning change that improves recall while costing precision is visible in one glance and is a conversation, not a silent regression.

---

## 4. L3 — Zephyr tests on `native_sim`

`ztest` under `twister`, for everything that needs Zephyr but not hardware.

```
west twister -T firmware/tests/zephyr -p native_sim -p qemu_cortex_m3 --inline-logs
```

| Suite | Covers |
|---|---|
| `settings_persistence` | config survives a simulated reboot; a corrupt NVS record is discarded rather than applied; mute is cleared on boot (TAG‑MU‑03) |
| `timekeeping` | minute rollover, midnight rollover advancing `day_of_week`, day counters resetting at midnight, `TAG_DAY_UNKNOWN` after boot and after 72 h without sync |
| `event_ring` | 64‑frame wrap drops the oldest; replay is oldest‑first; frames are released only after the link layer acknowledges (PRV‑19); a foreign or failed connection does **not** consume the buffer |
| `gatt_permissions` | a mock unbonded peer is refused on every read, write and CCCD write of all six characteristics (PRV‑18) |
| `adv_payload` | the assembled `ADV_IND` is ≤ 31 B and byte‑exact against a fixture; `SCAN_RSP` carries the name; no per‑device field is present (PRV‑25) |
| `state_machine` | every PRD §6.1 transition, driven by injected events |
| `button_gestures` | all seven TAG‑BTN cases including the charger gate on the 10 s hold |
| `audio_sequencing` | amp enable/disable ordering and the ≤ 50 ms `SD_MODE` deadline against a mock GPIO with timestamps |
| `watchdog` | a stalled thread trips its `task_wdt` channel within its window |

---

## 5. L4 — hardware in the loop

### 5.1 The rig

Built on the P0 rig from `02-roadmap.md` §4 and kept for the life of the product.

| Element | Part | Purpose |
|---|---|---|
| DUT | tag (EVT/DVT/PVT) or the P0 rig board | the thing under test |
| Central | nRF52840‑DK + host Python (`bleak`) | drives the protocol: pair, configure, control, subscribe, PackXfer, DFU |
| Sniffer | second nRF52840‑DK with nRF Sniffer + Wireshark | captures every advertisement and every packet; captures are archived per run |
| Power | **Nordic PPK2** in series with the cell (or Joulescope JS220) | per‑state current and integrated charge |
| Motion | 2‑axis servo tilt fixture + solenoid drop rig + eccentric shaker | reproducible `sip`, `drop`, `shake`, `zipped`, brushing |
| Acoustic | small anechoic box, calibrated Class 1 mic at 25 cm, and a second position at 50 cm for the EN 71 method | SPL |
| Light | programmable LED panel | `opened` / `closed` / `packed` steps |
| Liquid | peristaltic pump + 5 reference bottles including 2 insulated steel | `filled` / `empty` / cap‑blind detection |
| Charger | programmable 5 V supply on pogo pads, with a relay for reverse polarity and short | charging, `/CHG`, and the PRV‑40 abuse tests |
| Thermal | small chamber, −10 to +50 °C | crystal drift, cap drift, charge temperature hold |
| Control | one Python harness, one YAML test list, JUnit XML out | runs unattended, reports like any other CI job |

### 5.2 Cases

| Group | Cases |
|---|---|
| Bring‑up | boot time to first possible utterance ≤ 400 ms; sleep current ≤ 25 µA; amp off < 1 µA |
| Protocol | full pairing, config write, `Info` read, event subscribe and replay, every `ControlOp`, every error path returning `0x80`. Run against **the shipped app** as well as the harness, because the app is the only client that matters. |
| Detection | 20 repetitions of each mechanised event per mount position; per‑event precision and recall on hardware, compared against the L2 figures to catch a driver‑layer difference |
| Audio | every one of the 1,631 clips played end to end; no underruns, no clicks, no truncation; `SD_MODE` low within 50 ms of the last sample, measured on the PPK2 trace |
| Power | §8 |
| Radio | §6 |
| DFU | §9 |
| Thermal | detection and timekeeping at −10, 0, 25, 40, 50 °C; charge held outside 0–45 °C (TAG‑BAT‑04) |
| Endurance | 72 h soak with a scripted synthetic day: zero resets, zero watchdog trips, zero memory growth, event ring behaving at every wrap |
| Abuse | pogo pads shorted with keys, coins and foil; reverse polarity; wrong 5 V source — each with thermal imaging (PRV‑40, release‑gating) |

### 5.3 What makes it a gate rather than a demo

The rig produces JUnit XML and a signed run record. A release cannot be tagged unless the nightly rig run on that commit is green, the sniffer capture is archived, and the power run is within budget. "It worked on my desk" is not a result.

---

## 6. L5 — BLE conformance, privacy and protocol

### 6.1 Bluetooth qualification

| Item | Detail |
|---|---|
| Qualification route | module carries a QDID; we file an **End Product Declaration** (`compliance-and-test-plan.md` §1) |
| PTS | Profile Tuning Suite against GAP (Peripheral), GATT (Server), SM (Peripheral, LESC), DIS and BAS |
| ICS / IXIT | filled from this firmware's actual Kconfig, not from a template — Just Works, no MITM, one bond, privacy enabled, RPA timeout 900 s |
| Timing | run at DVT, before the formal RF submissions, so a conformance failure does not collide with certification (roadmap §5) |

### 6.2 Protocol conformance (ours, not the SIG's)

A machine‑checkable list derived from `tag-protocol.md`, run on the rig and asserted against sniffer captures:

| Check | Pass criterion |
|---|---|
| Pairing‑window advertising | undirected connectable, interval 100 ms ± jitter, exactly 60 s, `flags` bit0 set |
| Post‑motion advertising | connectable, 1.28 s ± 10 ms jitter, starts on motion, **stops at 30 min**, `flags` bit0 clear |
| No advertising otherwise | 8 h capture with the tag still: **zero** packets |
| RPA rotation | 24 h capture: the address changes at most every 15 min and never repeats |
| No stable per‑device field | 24 h capture: only the address and the battery byte change (PRV‑25) |
| Payload size | `ADV_IND` ≤ 31 B, `SCAN_RSP` ≤ 31 B |
| Unbonded peer | every read, write and CCCD write on all six characteristics refused; disconnected within 2 s (PRV‑18) |
| Second bond | refused; tag shows red ×2 (TAG‑PAIR‑02, TAG‑LED‑14) |
| Buffer integrity | connect unbonded, disconnect, then verify the bonded phone still receives **all** frames (PRV‑19) |
| No serial | full GATT dump contains no Serial Number String and no per‑device value (PRV‑20) |
| Factory reset | both routes clear bond, config, mute, time, weekday, ring and name clip; content survives (CMP‑08) |
| Time and weekday | `04` in both lengths; weekday drives the school mask; unknown weekday makes the school window apply daily |

### 6.3 Privacy field tests

| Test | Method | Gate |
|---|---|---|
| **PRV‑65 unwanted‑tracker** | three testers each carry a tag bonded to somebody else's phone for 72 h on current iOS and Android; record device and OS versions | **no unwanted‑tracker alert may fire and no finding app may report the device.** A fired alert is a launch blocker. |
| Linkability | a passive observer with the 24 h capture attempts to re‑link one tag across RPA rotations among five tags in range | re‑linking must require more than the advertised payload; the result drives the PRV‑24 battery‑quantisation decision |
| Range | measured connectable range, so support can answer "how far does it work" truthfully | ≥ 10 m line of sight (roadmap EVT criterion) |

### 6.4 EN 18031 / PSTI evidence

Each row of `dfu-and-security.md` §1 gets a test and an artefact, collected as they are produced rather than assembled at submission time: signed‑image acceptance and rejection logs, downgrade rejection log, APPROTECT verification record, GATT permission capture, factory‑reset capture, the key ceremony record, and the published disclosure policy and support window.

---

## 7. Audio and SPL verification

CMP‑01 is the hardest number in the product to hold: **≤ 75 dB(A) @ 25 cm at maximum volume, on every clip, on every unit.**

### 7.1 Method

| Measurement | Method |
|---|---|
| Reference | Class 1 mic on axis at 25 cm in the anechoic box, A‑weighted, `LAFmax` per clip and `LAeq` over a 30 s loop |
| EN 71 method | same clips at **50 cm** for the certification measurement (EN 71‑1 §4.20 / ASTM F963 §4.5: ≤ 85 dB(A) impulsive, ≤ 65 dB(A) continuous) |
| Sweep | **all 1,631 clips** at `volume = 100`, through the real housing and the real IP67 mesh |
| Spectrum | third‑octave, to catch a resonance that a broadband figure hides |
| Volume curve | 0, 10, 25, 50, 75, 100 — monotonic, no step greater than 6 dB, and `volume = 0` produces **no** measurable output and no amp enable |

### 7.2 Gates

| Gate | Criterion |
|---|---|
| Loudest clip at volume 100 | ≤ **75 dB(A)** `LAFmax` @ 25 cm |
| Quietest clip at volume 100 | ≥ **70 dB(A)** — a cap that makes some lines inaudible is a different defect with the same cause |
| Continuous loop | ≤ 65 dB(A) `LAeq` @ 50 cm |
| Per‑unit ceiling | the EOL‑measured `spl_ceiling_q15` brings every unit into 73–77 dB(A) @ 25 cm at volume 100 (`firmware-architecture.md` §8) |
| Golden samples | ±2 dB across 50 random units (`compliance-and-test-plan.md` §3.3) |
| Clipping | no clip shows digital clipping at volume 100; ADPCM decode plus gain never saturates the I²S word |
| Loudness consistency | all clips within ±2 LU of −16 LUFS, measured on the decoded stream, not the source WAV — so an encoder regression is caught |

The per‑clip sweep matters because the cap is applied as a gain, and one clip mastered 4 dB hotter than the rest would exceed the limit while the golden sample passes. 1,631 clips at ≈ 1.5 s each is 41 minutes of playback — an overnight run, automated, once per release.

---

## 8. Battery‑life test

`power-budget.md` §5 sets the method; this is the firmware harness.

### 8.1 Per‑state bench measurement

PPK2 in series with the cell, ≥ 10 min per state, compared against `power-budget.md` §1. **Any state more than 25 % over budget is a bug, not a tolerance.**

| State | Budget |
|---|---|
| Ship | ≈ 2 µA |
| Idle | ≈ 12 µA |
| Active (classifying) | ≈ 230 µA |
| Advertising (1.28 s) | ≈ 45 µA |
| Pairing window | ≈ 2 mA for 60 s |
| Connected (30 ms) | ≈ 180 µA |
| Speaking | ≈ 85 mA for ≈ 1.53 s |
| Charging | ≈ 120 mA in, ≈ 80 min to full |

### 8.2 Synthetic day

A scripted day compressed into 30 minutes of wall time: motion traces for 4.5 h of handling, 19 h idle, six advertising windows, 10 min connected, 30 forced utterances, and the LED activity from `power-budget.md` §2. The harness integrates charge and extrapolates days.

| Gate | Criterion |
|---|---|
| Predicted life, baseline | ≥ 30 days (the budget predicts 50.6) |
| Regression | **+10 % on daily mAh fails the build** |
| Heavy user (80 utterances/day) | ≥ 25 days, with the rate limiter at its default of 12/hour demonstrated to be what holds it |
| Cold (0 °C) | ≥ 30 days |
| Amp discipline | `SD_MODE` low within 50 ms of every clip end, on every clip in the run — the 20× bug, caught continuously rather than once |
| Accel discipline | the accelerometer is never left in high‑performance mode after 30 s of stillness, asserted from the current trace |
| QSPI discipline | deep power‑down entered after every read burst |

### 8.3 Real‑world

20 units in homes for 45 days, battery percent logged on each app connection. **Report the 10th percentile, not the mean** — the 10th percentile is the number that generates support tickets. Runs alongside the in‑home study (roadmap, March 2027).

---

## 9. DFU and security tests

Every row is a release gate. A firmware that cannot prove these does not ship.

| Test | Expected |
|---|---|
| Happy path | signed image uploads over BLE, verifies, swaps, boots, confirms; `Info` reports the new version |
| Unsigned image | rejected by MCUboot; the previous image boots |
| Wrong‑key image | rejected |
| Corrupted image (one bit flipped in the payload, in the header, in the TLV) | rejected in all three cases |
| Downgrade by version | rejected |
| Downgrade past a security‑counter bump | rejected |
| **Deliberately broken image** (crashes before confirming) | not confirmed → **automatic revert on the next boot**; the tag is functional afterwards. Run every release. |
| Power loss mid‑upload | slot1 incomplete, slot0 still boots, transfer resumable |
| Power loss mid‑swap | MCUboot completes or rolls back the swap; the tag boots |
| DFU entry from an unbonded peer | refused; no SMP service is even present (PRV‑30) |
| DFU entry below 40 % battery, off charger | refused with `0x80` |
| SMP surface outside DFU mode | a full GATT dump contains no SMP service |
| SMP groups | file, shell and statistics groups absent |
| APPROTECT | SWD ID‑code read fails on a provisioned unit (PRV‑31) |
| Name clip after DFU | survives an update; erased by factory reset and by an explicit delete |
| PackXfer (v1.1) | signed pack accepted; unsigned rejected; CRC mismatch rejected; older `pack_version` rejected; resume after disconnect completes; **power loss during a `KIND_PACK_FULL` write leaves an invalid header and the tag falls back to `essentials` and still giggles** |
| Log hygiene | the production binary contains no format string reachable from a `LOG_*` call, and `strings` on it reveals no phrase text, no vocative and no name |

That last row is cheap and catches the whole class of accidental disclosure: if the binary contains no text, no log can leak text.

---

## 10. L6 — factory test, firmware's part

`compliance-and-test-plan.md` §3.4 owns the pass/fail values; firmware owns the `factory` build that executes them and the order they run in (`dfu-and-security.md` §10.2). Two firmware‑specific obligations:

1. **The factory image is signed with the production key** and is a normal release artefact with its own version. A factory build that is not in the release manifest may not be loaded onto a unit that ships.
2. **APPROTECT is the last programming step, and closure is verified after it.** A unit whose debug port answers after step 9 is scrapped.

The single highest‑value step on the line is the 2 s sleep‑current measurement with the amp asserted off, rejecting above 25 µA. It costs two seconds and catches the class of bug that turns a 50‑day product into a 2‑day one.

---

## 11. CI pipeline

| Stage | Trigger | Content | Blocking |
|---|---|---|---|
| `lint` | every push | `clang-format --dry-run -Werror`, `-Wall -Wextra -Werror -Wconversion`, the **no‑`%s`‑in‑logs** grep, `west build` for all four variants | yes |
| `host` | every push | L1 suites under ASan and UBSan, `gcc` and `clang`, coverage gate | yes |
| `traces` | every push | L2 replay, precision/recall/negatives gates, confusion matrices archived | yes |
| `zephyr` | every push | L3 via `twister` on `native_sim` and `qemu_cortex_m3` | yes |
| `vectors` | every push | `tools/vectors.json` checked from both C and TypeScript, so app and firmware cannot drift | yes |
| `size` | every push | image ≤ 448 KiB with ≥ 15 % headroom; pack ≤ its region; RAM budget per `firmware-architecture.md` §3.3 | yes |
| `hil` | nightly on `main`, and every release tag | L4 rig run, sniffer capture and power run archived | release‑blocking |
| `audio` | weekly and every release tag | the full 1,631‑clip SPL sweep | release‑blocking |
| `security` | every release tag | §9 in full, including the broken‑image revert | release‑blocking |

The log‑hygiene grep is in `lint` rather than review because it is the one privacy rule a well‑meaning debugging session breaks at 2 a.m.

---

## 12. Traceability

Every requirement id has at least one test id, and the mapping is generated from test names rather than maintained by hand — a requirement with no test is a build warning at the release gate.

| Source | Ids | Level |
|---|---|---|
| PRD §6.1 states | TAG‑ST‑01…11 | L3 `state_machine` |
| PRD §6.2 events | TAG‑EV‑01…04 | L2 traces, L4 detection, L1 pack |
| PRD §6.3 utterance policy | TAG‑UT‑01…06 | L1 policy, L4 audio |
| PRD §6.4 quiet hours | TAG‑QH‑01…05 | L1 protocol + policy |
| PRD §6.5 mute | TAG‑MU‑01…04 | L1 policy, L3 settings |
| PRD §6.6 battery | TAG‑BAT‑01…09 | L1 policy, L4 power/thermal |
| PRD §6.7 LED | TAG‑LED‑01…18 | L4 photodiode capture |
| PRD §6.8 button | TAG‑BTN‑01…07 | L3 gestures, L4 |
| PRD §6.9 time | TAG‑TIME‑01…03 | L3 timekeeping, L4 thermal drift |
| PRD §6.10 buffer | TAG‑BUF‑01…03 | L3 event ring, L6.2 |
| PRD §6.11 pairing | TAG‑PAIR‑01…06 | L5 conformance, §9 |
| PRD §6.12 name clip | TAG‑NC‑01…02 | L1 pack, §9 |
| Compliance | CMP‑01, 05–08 | §7, §6.4, §9 |
| Threat model | PRV‑18–34, 40, 58, 65 | §6, §9, §5.2 |
| Firmware gaps | FW‑GAP‑01…12 | each has a failing test written **before** the fix |

`FW-GAP-10` is the worked example of that last rule: `cross_cell_independence` (§2.5) fails today and passes after the fix, so the gap cannot be quietly closed or quietly reopened.

---

## 13. Assumptions recorded here

1. **The host suite stays dependency‑free.** No framework, no Python for L1. The five‑minute onboarding matters more than the convenience of fixtures.
2. **`tools/vectors.json` is shared with the app** and is the mechanism that keeps two implementations of one protocol honest.
3. **Traces are committed to the repository** (git‑lfs above 1 MB). They are physics, not personal data, and a threshold change is untestable without them.
4. **The full SPL sweep covers every clip, not a sample.** The cap is a gain, so one hot master defeats a golden‑sample measurement.
5. **A deliberately broken image is a release gate**, because automatic revert is the only recovery path a sealed tag has.
6. **`strings` on the production binary is a privacy test.** Cheap, and it makes the "no text on the tag" claim mechanically true.
7. **The rig outlives the project.** It is specified as production equipment, not as bring‑up scaffolding, because the tests that matter most are the ones still running in year three.
