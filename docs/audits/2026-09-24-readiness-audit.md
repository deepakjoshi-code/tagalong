# Readiness audit — 2026-09-24

Five independent auditors (security, privacy, child safety, stress, journey
coverage) read the whole repository. Every finding was then handed to a separate
adversarial verifier whose job was to refute it against the code. **14 findings
were thrown out that way; 82 survived.** Only the survivors are listed here.

This file is the backlog. Delete an entry when it is fixed, not when it is read.

## Status

| | Confirmed | Fixed | Open |
|---|---|---|---|
| Critical | 1 | 1 | 0 |
| High | 23 | 23 | 0 |
| Medium | 37 | 0 | 37 |
| Low | 21 | 0 | 21 |
| **Total** | **82** | **24** | **58** |

## Fixed

Closed in the three commits following the audit. Each fix has a test, and each
new guard was verified by deleting it and watching a specific test fail.

- **[Critical]** Quiet hours and the school window silently become "never" when start equals end
- **[High]** The charger puck's dimension was specified two ways, and ⌀30 mm fails the small-parts cylinder
- **[High]** Nothing in the app said whether a tag was connected or whether its settings arrived
- **[High]** No way to release a tag from the app, and the deletion sheets omitted the "this does not reset your tag" warning
- **[High]** left_behind implements two of its five documented guards, and the transition counter never decays
- **[High]** "Hi there. I'm listening." — the tag claims to hear, contradicting ADR-004 and the product's central trust claim
- **[High]** brush_done can be farmed every five minutes, and the spec's two-sessions-a-day cap is not implemented
- **[High]** "Mute for an hour" is never sent to the tag — the app confirms an emergency stop that did not happen
- **[High]** With Demo mode on, every action on a real tag is silently routed to an in-memory fake — including quiet hours and battery
- **[High]** Deselecting every school day means "silent every day", the exact opposite of what the parent chose
- **[High]** On iOS Safari the primary "Search" button silently fabricates a pretend tag and reports setup success
- **[High]** "Forget this tag" leaves the tag permanently bonded, and the confirm sheet tells the parent the opposite
- **[High]** Changing a kid's age band never reaches their tags, so a tag keeps talking to a child who has outgrown it
- **[High]** "Make it giggle" plays at any hour: the quiet-hours confirm was never built, and the app's own quiet-hours check is dead code
- **[High]** The name-clip footer promises tags will say the child's name; v1.0 never sends the clip anywhere
- **[High]** The app makes absolute "no servers" claims with the hosting qualification (PRV-52) nowhere in the UI, while the SW revalidates against the host on every launch
- **[High]** The school-day weekday mask can never take effect: neither side implements the dayOfWeek byte, so the tag is silent during school hours seven days a week
- **[High]** recent_transitions never decays — transitions_window_ms is written and never read — so LEFT_BEHIND fires 20 minutes after any ordinary putdown
- **[High]** "Mute for an hour" never reaches the tag — it only sets a flag on the phone
- **[High]** Brushing trips the shake detector: the tag says "shake" 12 times and never celebrates the two minutes
- **[High]** The school-day weekday mask can never reach the tag, so "silent Mon–Fri" is silent every day
- **[High]** Unticking every school day means "silent every day", the exact opposite of the parent's intent
- **[High]** A config write that fails leaves the app showing the parent's intent as if it were the tag's state
- **[High]** LEFT_BEHIND fires twenty minutes after a backpack is simply put down at home

## Open


### Medium (37)

#### brush_short shames the 2–4 band twice a day, and a parent cannot switch it off
`/home/user/tagalong/content/packs/toothbrush.json:134` · found by the childsafety auditor

**What breaks.** brush_short fires whenever accumulated brushing lands in 15 s–119 s (TAG_BRUSH_SHORT_MIN_MS=15000, TAG_BRUSH_TARGET_MS=120000, /home/user/tagalong/firmware/include/tagalong_events.h:70-71). For a 2–4 year old that band is the normal outcome, not the exception

**Suggested fix.** Add TAG_EVT_BRUSH_SHORT to tag_event_is_nudge() so it is opt-in like the other invitation events, and delete the two "That was quick… Even for you" lines and "Wait! Not finished!" outright. Rewrite the little cell as pur

#### The tag tells a 2–4 year old it is guarding their room at bedtime
`/home/user/tagalong/content/packs/generic.json:252` · found by the childsafety auditor

**What breaks.** plush/putdown/little/brave is ["Guarding your room!", "On watch!", "Holding post!", "Standing by!"], and the kid/big cells (lines 257, 262) add "On watch. Nothing sneaks past." Guarding presupposes something to guard against; "nothing sneaks past" names it. gu

**Suggested fix.** Delete the guarding/watch framing from the little band entirely and re-voice the brave personality at bedtime as companionship rather than sentry duty ("Right here all night!"). Rewrite the long_still little cells so the

#### The bottle praises and asks for drinking at the 2–4 band, which is the one banned category with a clinical tail
`/home/user/tagalong/content/packs/bottle.json:26` · found by the childsafety auditor

**What breaks.** sip/little/sweet is ["Mmm. Good job.", "Yay, you drank!", "So good for you.", "Sip sip. Nice."] (line 26) and sip/little/silly includes "Glug! More please!" (line 25). empty/little/sweet is ["All gone. More please?", "Empty now. Fill me?", "I am thirsty too.",

**Suggested fix.** Strip evaluative and soliciting language from the little band: sip lines should be sound and sensation ("Slurp! Tickles!") with no "good job", no "good for you", and no "more please". Keep "more" framing only at kid/big,

#### The `big` band is largely copy-pasted from `kid`, so the 3x3 matrix is not what is claimed
`/home/user/tagalong/content/packs/generic.json:186` · found by the childsafety auditor

**What breaks.** Of 171 (thing × event × personality) cell pairs, 29 are 100% identical between kid (5–7) and big (8–12) and 99 share at least one line. Example: generic.json:186 (shoes/putdown/kid/sweet) and generic.json:191 (shoes/putdown/big/sweet) are byte-identical arrays

**Suggested fix.** Rewrite the big band for shoes, plush, helmet, jacket and the sweet/brave drop and putdown cells with genuine dry wit, then add a cross-band duplicate check to validate.mjs (fail when a line appears in more than one band

#### The weekday is never transmitted, so the school-day mask does nothing and the DayPicker is decorative
`/home/user/tagalong/app/src/transport/codec.ts:174` · found by the childsafety auditor

**What breaks.** docs/protocol/tag-protocol.md:63 defines ControlOp 0x04 as `04 <minutes u16> [dayOfWeek u8]` and ADR-008 says the tag needs that byte to apply the mask. encodeControl's setTime branch (codec.ts:174-179) always emits exactly 3 bytes and the ControlOp type (/hom

**Suggested fix.** Extend ControlOp setTime to carry dayOfWeek, emit the 4-byte form in encodeControl, read it in tag_control_decode, and maintain it across midnight on the tag. Until that ships, either hide the DayPicker or label it clear

#### Two different brush-pause constants silently discard accumulated brushing time
`/home/user/tagalong/firmware/src/tagalong_events.c:358` · found by the childsafety auditor

**What breaks.** TAG_BRUSH_GAP_MS is 15000 (/home/user/tagalong/firmware/include/tagalong_events.h:72, "pause allowed inside one session") but the session-end check at events.c:358 hardcodes 20000u. In the 15–20 s dead zone a new session starts on resume (the new_session test

**Suggested fix.** Use TAG_BRUSH_GAP_MS in both places (or define a separate, longer TAG_BRUSH_SESSION_END_MS that is strictly greater than the new-session gap), and carry brush_accum_ms across pauses shorter than the session-end threshold

#### volume is the only config field the decoder does not validate, and no SPL enforcement exists in this repo
`/home/user/tagalong/firmware/src/tagalong_protocol.c:100` · found by the childsafety auditor

**What breaks.** tag_config_decode validates age_band, personality, thing and language and returns TAG_ERR_VALUE for each (lines 93-94), but line 100 is a bare `out->volume = in[4];` — 0..255 accepted. tag_config_encode clamps to 0..100 (line 63), so only the sender is guarded

**Suggested fix.** Clamp or reject: `if (in[4] > 100) return TAG_ERR_VALUE;` in tag_config_decode, plus a defensive clamp at the point of use, and the same clamp in codec.ts's decodeConfig. Add the volume=101..255 case to the protocol test

#### The lunchbox `packed` event is never emitted by the engine
`/home/user/tagalong/firmware/src/tagalong_events.c:371` · found by the childsafety auditor

**What breaks.** detect_lunchbox emits only TAG_EVT_OPENED and TAG_EVT_CLOSED (lines 391, 396). Grepping every `emit(out, TAG_EVT` in the file shows 15 emissions and TAG_EVT_PACKED is not among them. Yet packed has a protocol code (34), a 12 h policy debounce (/home/user/tagal

**Suggested fix.** Implement packed in detect_lunchbox using the closed→dark transition it already tracks, gated on the 05:00–11:00 window once minute_of_day reaches the engine, or remove packed from the v1 event list and the pack so the s

#### The content validator enforces almost none of the guidelines it is cited as enforcing
`/home/user/tagalong/content/validate.mjs:52` · found by the childsafety auditor

**What breaks.** validate.mjs checks schema shape, per-band word limits, within-cell duplicates, {{name}} density and non-ASCII — and nothing else. There is no check for any of guidelines.md §3's hard bans (shame, fear, food/body, sight/hearing claims, sarcasm at the child), w

**Suggested fix.** Add a ban-list pass: regex families for shame/blame ("you forgot", "don't stop", "even for you"), food and body words, health judgements ("good for you", "healthy"), sight/hearing/location verbs, and fear/guard/danger wo

#### Roughly a dozen `little` lines are idioms or abstractions the band explicitly forbids
`/home/user/tagalong/content/packs/generic.json:182` · found by the childsafety auditor

**What breaks.** guidelines.md §1 defines little (2–4) as "Concrete nouns, repetition, spelled-out sounds. No idioms, no sarcasm, no abstractions." The packs violate this repeatedly: "On standby!" (generic.json:182 and :392), "Holding my post!" (generic.json:27, bottle.json:78

**Suggested fix.** Replace each with something a 2-year-old can picture: "Waiting right here!" for "On standby!", "Charging up! Zzz!" for "Stay tuned!", "Hat on! Let's ride!" for "Safety first!". Add an idiom/abstraction word-list check to

#### Some little-band drop lines ask for help instead of reassuring, inverting the drop rule
`/home/user/tagalong/content/packs/generic.json:268` · found by the childsafety auditor

**What breaks.** guidelines.md §4 for drop: "a comic 'ouch', never pain or fear. The object is fine within one sentence." Most lines obey, but these do not: "Bump. Hug me?" and "Ow. Pick me up?" (generic.json:268, plush/drop/little/sweet), "Ow. Help me up?" (backpack.json:77,

**Suggested fix.** Add reassurance inside the same line: "Bump! Still soft. Hug?", "Ow — all fine. Up please?". Add a check that every drop line contains a resolution token (fine/okay/still/good/safe/tough) so the rule is mechanically enfo

#### The school-hours weekday picker does nothing: the weekday never reaches the tag, so the tag is silent every day of the week
`app/src/transport/codec.ts:174` · found by the journeys auditor

**What breaks.** `encodeControl({ op: 'setTime' })` emits exactly 3 bytes (`04` + u16 minutes). `docs/protocol/tag-protocol.md:63` and ADR-008 both specify an optional 4th byte carrying the weekday, "needed for the school-day mask". Nothing sends it: `app/src/lib/time.ts:48` d

**Suggested fix.** Extend `ControlOp` and `encodeControl` to the protocol's 4-byte `04 <minutes u16> <dayOfWeek u8>` form, send `mondayFirstDayOfWeek()` with it on every connect (it already rides the same call site in `manager.ts:90`), and

#### A tag cannot be moved to a new object or a sibling — the two rows that make that possible were never built
`app/src/features/tags/TagDetail.tsx:147` · found by the journeys auditor

**What breaks.** Tag detail has Personality, Sound, School hours, Recent activity, Tag and Forget sections. There is no "Attached to" row (thing) and no "For" row (kid): `tag.thing` and `tag.kidId` are set once by the wizard and are unreachable afterwards — `grep` shows no `up

**Suggested fix.** Add "Attached to" (thing grid, re-suggest nickname, re-write config) and "For" (kid picker, re-write config with the new band) rows on tag detail, plus "Move tags to…" in the kid delete sheet. These three are what make E

#### `drop` and `tap` are inside the hourly rate limit, so the moment the product is sold on goes silent after ~12 lines
`firmware/src/tagalong_policy.c:88` · found by the journeys auditor

**What breaks.** `tag_policy_check` applies the token bucket to every event; there is no bypass for `drop` or `tap` and no separate 20/hour `tap` bucket, contrary to TAG-UT-01 ("`drop` and `tap` bypass the hourly limit but keep their cooldowns"). `firmware/tests/test_policy.c:

**Suggested fix.** Implement the split the firmware spec already describes: `tag_event_detect_debounce_ms()` (sensing values, detector layer) and `tag_event_cooldown_ms()` (PRD values, policy layer); skip the main bucket for `drop` and `ta

#### `good_morning` is not classified as a nudge, so the tag greets the child even though nudges are off by default
`firmware/src/tagalong_policy.c:37` · found by the journeys auditor

**What breaks.** `tag_event_is_nudge()` returns `{empty, left_behind, long_still}`. Decision A-08, the §6.2 table (`good_morning` Nudge = **yes**) and `docs/firmware/event-engine-spec.md:211` ("`nudges` off means it is neither spoken nor emitted") all put `good_morning` in the

**Suggested fix.** Make `tag_event_is_nudge()` return `{long_still, good_morning, left_behind}` per A-08, give `empty` its own 10-minute cooldown as a reactive event, and add the test the test plan already specifies (`docs/firmware/test-pl

#### No per-thing speech suppression: a toothbrush and a backpack chatter on pickup, putdown and shake — and the sales demo shows it
`firmware/src/tagalong_events.c:454` · found by the journeys auditor

**What breaks.** `detect_motion()` (pickup/putdown/shake) runs for every thing before the per-thing switch at line 457, and no layer filters it: `grep -rn "tag_thing_suppresses"` finds nothing. §6.2 requires toothbrush to suppress `pickup`/`putdown`/`shake`, backpack to suppre

**Suggested fix.** Add `tag_thing_suppresses(thing, event)` ahead of the policy in the engine, and trim `THING_META[thing].events` to the events each thing actually speaks so the playground, the timeline and the headline preview all inheri

#### A kid with no name recorded is labelled "Big kid kid"
`app/src/features/kids/KidsList.tsx:41` · found by the journeys auditor

**What breaks.** Both fallbacks build the label as `${AGE_BAND_META[band].label} kid` — `KidsList.tsx:41` and `TagCard.tsx:39` (`who`). The band labels are "Little", "Kid" and "Big kid" (`app/src/domain/ageBands.ts`), so the three outputs are "Little kid", "Kid kid" and "Big k

**Suggested fix.** Use a single helper for the nameless label that does not concatenate ("Little one", "Kid", "Big kid"), and add a component test for a kid with no `displayName` — the case the current e2e seeds never exercise.

#### Going Back on the "Who's it for?" step hides the new child a parent just typed and disables Continue
`app/src/features/tags/AddTagWizard/steps/StepKid.tsx:12` · found by the journeys auditor

**What breaks.** `creating` is initialised from `useState(kids.length === 0)` and the step unmounts when the wizard advances (`AddTagWizard/index.tsx:50-65` swaps the body by step). The new kid is not created until step 6 (`StepSend.tsx:43-48`), so `draft.kidId` stays undefine

**Suggested fix.** Derive `creating` from the draft rather than from `kids.length` — treat a non-empty `newKidName`/touched band or an absent `kidId` as "still creating" — and add an e2e case that adds a second kid and navigates back and f

#### Before the voice list loads, the app tells the parent their phone "only has online voices"
`app/src/lib/speech.ts:34` · found by the journeys auditor

**What breaks.** `pickLocalVoice()` returns `null` when `speechSynthesis.getVoices()` is still empty (real line 34, correctly leaving the cache unset), but `speechUnavailableReason()` (real line 53) maps that same `null` to `'no-local-voice'`, whose copy is "This device only h

**Suggested fix.** Distinguish "voices not loaded yet" from "no local voice": return a `'loading'` reason (or await one `voiceschanged` tick / re-check after a short timeout) before showing the online-voices sentence, and add tests for the

#### About claims bundled open-source licences that are not in the build, and none of the launch-gating legal content exists
`app/src/features/settings/About.tsx:31` · found by the journeys auditor

**What breaks.** The Open source group's footer says "Their licences are included in the app bundle." They are not: `grep -rlio "MIT License" app/dist` after a build returns nothing, and no licence text exists anywhere in `app/src` or `app/public`. S-04 also requires a bundled

**Suggested fix.** Generate a licences file at build time and actually render or link it, add the privacy notice, safety information, support address and build hash, and take the version from `package.json` rather than a literal.

#### The viewport meta blocks pinch-zoom on the app's primary platform
`app/index.html:7` · found by the journeys auditor

**What breaks.** `content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1"`. Chrome on Android honours `maximum-scale=1` and disables pinch-zoom unless the user has turned on "Force enable zoom"; Android Chrome/Edge is the only platform that can pair

**Suggested fix.** Drop `maximum-scale=1` (keep `width=device-width, initial-scale=1, viewport-fit=cover`) and add an assertion to `quality.spec.ts` that the viewport allows a scale of at least 5.

#### Both destructive "Clear activity" actions fire on a single tap with no confirmation
`app/src/features/tags/TagDetail.tsx:361` · found by the journeys auditor

**What breaks.** `<ListRow title="Clear activity" onClick={() => clearEvents(tag.id)} destructive />` deletes that tag's events immediately, and `PrivacyCenter.tsx:124` does the same for every tag's events with one tap and a "Activity cleared" toast. Every other destructive ac

**Suggested fix.** Put both Clear activity actions behind the same `Sheet` confirm the app already uses for Forget.

#### The PRD has no requirements at all for the school quiet window, the feature the company is selling as its answer to classroom bans
`docs/01-prd.md:284` · found by the journeys auditor

**What breaks.** `grep -n school docs/01-prd.md` returns three hits, all incidental prose — no requirement, no Given/When/Then, nothing in §5.3 step 5 or §5.4 TD-03, and no entry in §5.9, which the PRD declares is "the single list of gaps between this document and the code" wi

**Suggested fix.** Add a school-hours requirement block to §5.3/§5.4 with acceptance criteria (including the weekday mask, the empty-mask case and the holidays toggle), correct the "13 B" references to 16 B, and fold the firmware gap regis

#### No test covers any real multi-kid, multi-tag, failure or platform journey — and there are no component tests at all
`app/e2e/smoke.spec.ts:67` · found by the journeys auditor

**What breaks.** 54 unit tests in 9 files pass, but they are all pure logic: codec, parity, store, selectors, pickPhrase, time, debouncedStorage, scale. There are no component or hook tests (`@testing-library/react` is a dependency and is imported by nothing), and no tests for

**Suggested fix.** Add unit tests for `getTransport`/`transportForDevice` (all three reasons, including the real-id-under-demo-mode case), for `connectTag`/`syncTagConfig` against a fake connection, and for `speech` state resolution; add c

#### Export writes an unencrypted file of the child's name, age band and 7 days of behaviour with no warning (PRV-07 unimplemented)
`app/src/features/privacy/PrivacyCenter.tsx:111` · found by the privacy auditor

**What breaks.** The "Your data" footer says only `Export gives you a readable JSON file of everything except audio recordings.` The required sentence — "It is not password-protected, so keep it somewhere you trust" (docs/privacy/privacy-policy.md:111, PRV-07) — is absent, and

**Suggested fix.** Add the PRV-07 sentence to the footer and repeat it in a confirm step before the download, naming what is inside in plain words ("your kids' names, ages, tag settings and the last 7 days of activity") and that the file i

#### PRV-04, the only control between the child's name and a cloud TTS vendor, has no test — and neither does "Delete everything"
`docs/privacy/threat-model.md:392` · found by the privacy auditor

**What breaks.** PRV-04 is recorded as "Implemented" with verification "Unit test over a stubbed voice list including a `localService: false` voice". No such test exists: the suite is pickPhrase, scale, selectors, store, store.regression, debouncedStorage, time, codec, parity

**Suggested fix.** Add speech.test.ts stubbing window.speechSynthesis with (a) only localService:false voices — expect canSpeak() false and speak() to resolve without calling speechSynthesis.speak, (b) an empty list then a voiceschanged, (

#### data-inventory §4.1 documents a 13-byte tag config; the wire format is 16 bytes and now carries the child's school schedule
`docs/privacy/data-inventory.md:120` · found by the privacy auditor

**What breaks.** The heading says "`TagConfig` — 13 bytes, the whole of what we tell the tag" and the byte table ends at 12 = checksum. The code sends 16: `CONFIG_LENGTH = 16` (app/src/transport/codec.ts:6), with byte 12 = school start, 13 = school end, 14 = weekday mask and 1

**Suggested fix.** Extend the §4.1 table to 16 bytes with the three school-window rows classified C2 alongside quiet hours, fix the checksum row to byte 15, fix L7's "13-byte config", and revise the closing paragraph to include the school

#### MCUmgr firmware-update service over BLE is left unauthenticated, and the config line that was supposed to hide it makes the documented mitigation impossible
`firmware/prj.conf:63` · found by the security auditor

**What breaks.** prj.conf:63-66 enables `CONFIG_MCUMGR=y`, `CONFIG_MCUMGR_TRANSPORT_BT=y`, `CONFIG_MCUMGR_GRP_IMG=y`, `CONFIG_MCUMGR_GRP_OS=y` but omits every access control that docs/firmware/dfu-and-security.md:132-141 says must be set: `CONFIG_MCUMGR_TRANSPORT_BT_PERM_RW_EN

**Suggested fix.** Add `CONFIG_MCUMGR_TRANSPORT_BT_PERM_RW_ENCRYPT=y`, `CONFIG_MCUMGR_TRANSPORT_BT_AUTHEN=y`, `CONFIG_MCUBOOT_DOWNGRADE_PREVENTION=y` and `CONFIG_BT_FILTER_ACCEPT_LIST=y` to prj.conf, and either set `CONFIG_BT_GATT_DYNAMIC_

#### "Delete everything" and "Forget this tag" never reset the tag and never release the browser's Bluetooth grant, so the child's data and the pairing survive both
`app/src/features/privacy/PrivacyCenter.tsx:32` · found by the security auditor

**What breaks.** `wipe()` (PrivacyCenter.tsx:32-39, duplicated at SettingsHome.tsx:18-25) calls disconnectAll, deleteAllClips and wipeAll — all phone-side only. `forget()` (app/src/features/tags/TagDetail.tsx:121-127) only disconnects and calls `removeTag`. `encodeControl({op:

**Suggested fix.** Before clearing local state, iterate live/known tags and send `{op:'factoryReset'}`, then call `device.forget()` where available (Chrome 101+), then disconnect. Do the same in `forget()` for a single tag. Say in both she

#### detect_backpack emits ZIPPED on every sensor block with no debounce — I measured 200 events in 64 seconds
`firmware/src/tagalong_events.c:408` · found by the security auditor

**What breaks.** Every other classifier in the file guards its emit with `elapsed_at_least`: drop 3000 ms (line 152), shake TAG_SHAKE_DEBOUNCE_MS (line 224), long_still 4 h (line 231), lid 30000/3000 ms (lines 390, 395), fill 60000 ms (line 272), left_behind 3 h (line 420). Th

**Suggested fix.** Give the zip branch the same treatment as shake: `elapsed_at_least(b->now_ms, e->last_zip_ms, 10000u)` with a new `last_zip_ms` field, and make it edge-triggered (require a non-zip block in between). Add a host test asse

#### The tag's replayed event buffer is silently discarded: the app attaches its event listener only after a GATT read round trip
`app/src/transport/manager.ts:87` · found by the security auditor

**What breaks.** `WebBluetoothConnection.open()` calls `event.startNotifications()` at webBluetooth.ts:54, so the tag starts replaying its buffer (docs/protocol/tag-protocol.md: "buffers up to 64 frames while disconnected and replays them on subscribe, oldest first") the momen

**Suggested fix.** Attach before the first read: either move `attach(tag.id, conn)` above the `readInfo()` call, or buffer frames inside `WebBluetoothConnection` (push to a queue when `eventListeners.size === 0` and flush on first `onEvent

#### The Privacy Center lists "Audio or video: Never" under "Never collected" on the same screen that counts the child's voice recordings
`app/src/features/privacy/PrivacyCenter.tsx:64` · found by the security auditor

**What breaks.** Line 62 opens a ListGroup headed "Never collected" with the footer "Tags have no microphone, no camera and no location hardware"; line 64 is `<ListRow title="Audio or video" value="Never" />`. Seven lines earlier, line 57 renders "Name recordings: N recording"

**Suggested fix.** Change the row to name the real boundary, e.g. "Audio or video sent anywhere: Never", and add a row or footer stating that the optional name recording is made with this phone's microphone and stays in this phone's storag

#### CI workflow declares no permissions, so every job runs with the repository's default GITHUB_TOKEN scope
`.github/workflows/ci.yml:20` · found by the security auditor

**What breaks.** There is no `permissions:` key anywhere in the workflow (grep for `permissions:` across .github/workflows returns nothing), so all three jobs inherit the repository or org default, which on many repos is still contents:write plus packages/issues/PR write. The

**Suggested fix.** Add `permissions: contents: read` at workflow level and grant more only per-job where needed. Pin each action to a commit SHA with the version in a trailing comment. Add `pnpm audit --audit-level high` (PRV-46 is listed

#### tag_config_decode accepts quiet and school bytes in the 144-254 range, producing windows outside 0-1439 that can never match — bedtime quiet silently turns itself off
`firmware/src/tagalong_protocol.c:101` · found by the security auditor

**What breaks.** docs/protocol/tag-protocol.md:30-31 defines bytes 5, 6, 12 and 13 as minutes/10 in the range 0-143, with 255 meaning disabled. `tag_config_encode` clamps to 143 (lines 66-67, 77-78). `tag_config_decode` treats only the single value 255 as disabled and multipli

**Suggested fix.** Reject with TAG_ERR_VALUE when any of bytes 5, 6, 12, 13 is greater than 143 and not equal to TAGALONG_QUIET_DISABLED, so a malformed window is refused at the boundary rather than half-applied. Add a host test for byte=1

#### A failed storage write is silent, never retried, and permanently breaks "Delete everything"
`/home/user/tagalong/app/src/lib/debouncedStorage.ts:45` · found by the stress auditor

**What breaks.** writeNow() clears pending before it attempts the write (lines 45-46), so a rejected raw.set loses that state with no retry, and storageError (store.ts:87) is never set — it is only set from onRehydrateStorage (store.ts:221), i.e. read failures. Worse, the reje

**Suggested fix.** Catch raw.set rejections in writeNow, keep the value pending so it retries on the next tick, set storageError (and surface it somewhere the parent will see, not only the Privacy Center), and never return a rejected inFli

#### A quiet or school window whose start equals its end silently does nothing, and the app reports success
`/home/user/tagalong/firmware/src/tagalong_protocol.c:238` · found by the stress auditor

**What breaks.** tag_minute_in_window returns false when start_min == end_min, as does the app's isWithinWindow (app/src/domain/selectors.ts:20-21). Nothing prevents that state: the time inputs at TagDetail.tsx:227/241/308/322 and StepSound.tsx:324/338/377/391 accept any value

**Suggested fix.** Reject start == end in QuietHoursSchema and SchoolHoursSchema and in the input handlers (nudge the end by one step, or disable the toggle with an explanatory hint), and make parseTime return the previous value on an unpa

#### LONG_STILL never gives up: an unused object talks to an empty room every four hours forever
`/home/user/tagalong/firmware/src/tagalong_events.c:230` · found by the stress auditor

**What breaks.** Once 45 minutes of stillness pass, LONG_STILL re-fires on a fixed 4-hour debounce with no cap and no back-off, indefinitely. I measured 12 emissions in 48 simulated hours of a bottle sitting untouched. Quiet hours suppress the night ones only if the parent set

**Suggested fix.** Give LONG_STILL exponential back-off or a hard cap (two or three per continuous still period, then silence until real motion resets it). The 4-hour debounce alone does not express "this object has been abandoned, stop as

### Low (21)

#### `opened` needs the lux to cross 5→50 within one block, so a dim room silently kills the lunchbox pack
`/home/user/tagalong/firmware/src/tagalong_events.c:388` · found by the childsafety auditor

**What breaks.** The open test is `previous < TAG_LUX_DARK && b->lux > TAG_LUX_OPEN` (5 and 50, events.h:73-74) with last_lux overwritten every block at line 377. Any intermediate reading in 5..50 poisons the state: previous becomes e.g. 30, the next block's 300 lux no longer

**Suggested fix.** Track a debounced dark/light state with hysteresis rather than comparing only the immediately preceding block: latch "was dark" when lux stays under 5 for a few blocks, and fire opened on the first block above 50 while t

#### tag_policy_check is pure and separate from commit, so a natural caller can fire four utterances on one token
`/home/user/tagalong/firmware/include/tagalong_policy.h:74` · found by the childsafety auditor

**What breaks.** tag_policy_check takes a const tag_policy_t* and explicitly "does not mutate p"; only tag_policy_commit updates last_utterance_ms and the token bucket. tag_events_process can return up to TAG_MAX_EVENTS_PER_BLOCK = 4 events with one shared now_ms. A caller tha

**Suggested fix.** Either document in the header that exactly one check/commit pair may be in flight per decision point, or (better) give the policy an arbitration entry point that takes the whole tag_event_batch_t, picks the single highes

#### The hourly rate cap has no daily companion, so the battery model and the calm promise can be exceeded 13x
`/home/user/tagalong/firmware/src/tagalong_policy.c:40` · found by the childsafety auditor

**What breaks.** max_tokens_milli clamps to TAG_MAX_PER_HOUR_CAP = 30 per hour and there is no per-day budget anywhere in the policy. The brief (docs/00-product-brief.md:57) and TAG-BAT-08 size the battery at "≥30 days per charge at 30 utterances/day". A parent who slides the

**Suggested fix.** Add a per-day token budget alongside the hourly bucket (the engine spec already assumes per-day caps for several individual events), and surface the battery consequence in the UI next to the rate control.

#### Lunchbox lines comment on the amount and appearance of a child's food
`/home/user/tagalong/content/packs/lunchbox.json:47` · found by the childsafety auditor

**What breaks.** packed/kid/silly includes "Ooh, heavy! Someone's hungry." (line 47) and the big equivalent "Ooh, heavy. Ambitious lunch today." opened/kid/sweet includes "Ooh, that looks nice." (line 14). guidelines.md §3 bans "Food, body, weight or 'healthy/unhealthy' judgem

**Suggested fix.** Delete all three. Lunchbox lines should be about the box ("Lunch is served!", "Open sesame!"), never about the contents, their quantity or their appearance.

#### Two tags on one object speak in perfect unison — the documented mitigation does not exist
`firmware/include/tagalong_policy.h:17` · found by the journeys auditor

**What breaks.** TAG-UT-03 requires a randomised 0–800 ms pre-speech delay for every event except `drop`, and H-08/E-02 name it as "the real mitigation" for two tags on one object. There is no implementation: `grep -rn "delay|jitter|pre_speech"` over `firmware/include` and `fi

**Suggested fix.** Implement the delay from `tag_policy_rand` (drop ≤ 300 ms, everything else uniform 0–800 ms) and add the one-time Home hint when a kid has two tags of the same thing type.

#### Buffered events all land at the same minute and are never de-duplicated
`app/src/transport/manager.ts:51` · found by the journeys auditor

**What breaks.** `attach()` logs every incoming frame with `store.logEvent(tagId, frame.type, Date.now(), frame.aux)`. `frame.uptimeSec` is decoded (`codec.ts:148`) and thrown away, and there is no `(deviceId, uptimeSec, eventType)` dedupe. TAG-BUF-02 specifies `at = now − (In

**Suggested fix.** Compute `at` from `Info.uptimeMin` and `frame.uptimeSec` as TAG-BUF-02 specifies, dedupe on `(deviceId, uptimeSec, eventType)` before inserting, and suppress the mirror toast for frames older than a few seconds so replay

#### Demo tags do not react in the playground, which is what three separate pieces of copy promise
`app/src/features/demo/DemoPlayground.tsx:48` · found by the journeys auditor

**What breaks.** The playground holds its own `useState` for thing, band and personality (lines 48-50) and drives the content engine directly; it never reads the store and never touches `SimulatedTransport` (`grep` shows no `useStore` in the file). Three places tell the parent

**Suggested fix.** Either seed the playground from the demo tag the parent just created (thing, band, personality, nickname in the bubble) and route it through `SimulatedTransport` as D-04 suggests, or change all three strings to stop prom

#### README points at a documentation index that does not exist, and the architecture doc contradicts the shipped CSP
`README.md:12` · found by the journeys auditor

**What breaks.** README line 12 says "then `docs/README.md` for the index" — `test -f docs/README.md` is false; there is no index. `docs/architecture/app-architecture.md:11` states the CSP is `connect-src 'none'`, while `app/index.html:11` and `app/public/_headers:4` ship `con

**Suggested fix.** Add `docs/README.md` (or drop the link), reconcile the CSP sentence with the build per open question 7, and refresh §5.9's shipped/gap rows — the table itself warns that it goes stale fast.

#### "Delete everything" leaves the Web Bluetooth device grant, so the origin keeps a per-household identifier after erasure
`app/src/features/privacy/PrivacyCenter.tsx:35` · found by the privacy auditor

**What breaks.** `wipe()` calls disconnectAll + deleteAllClips + wipeAll, and wipeAll clears IndexedDB (app/src/domain/store.ts:195). Nothing calls `BluetoothDevice.forget()`, which Chrome — the only browser this transport runs on — has exposed since v101; grep over app/src fi

**Suggested fix.** In wipe() and in forget(), call `device.forget()` on each known BluetoothDevice (feature-detected, inside try/catch) before dropping the record. Where the browser does not support it, say so in the sheet and point at bro

#### First-render speechSynthesis race makes the app tell parents their device "only has online voices" when it does not
`app/src/lib/speech.ts:34` · found by the privacy auditor

**What breaks.** `pickLocalVoice()` correctly returns null without caching when `getVoices()` is empty, so no network voice can ever be used — that part is airtight. But `canSpeak()` (line 50) and `speechUnavailableReason()` (line 55) cannot distinguish "not loaded yet" from "

**Suggested fix.** Return a third state, 'loading', when hasSpeechApi() is true and getVoices() is empty, and render nothing (or "Warming up voices…") for it. Turn the voiceschanged handler into a subscription (a tiny store or useSyncExter

#### Security headers exist only as a Netlify/Cloudflare `_headers` file, while the build is parameterised for GitHub Pages, which ignores it
`app/public/_headers:1` · found by the privacy auditor

**What breaks.** HSTS, `frame-ancestors 'none'`, `Referrer-Policy`, `X-Content-Type-Options` and `Permissions-Policy: geolocation=(), camera=(), microphone=(self)` are delivered only by this file, and its own comment notes frame-ancestors and HSTS are ignored in a meta CSP — s

**Suggested fix.** Pick the host and say so in the repo, and make CI assert the headers on a preview URL (a curl in the existing check job). If GitHub Pages is a real target, add X-Frame-Options via the only mechanism available there — or

#### About screen claims dependency licences are included in the bundle; nothing in the build contains any licence text
`app/src/features/settings/About.tsx:31` · found by the privacy auditor

**What breaks.** The Open source footer states "Tagalong is built with React, Vite, Zustand, Zod, Motion and Lucide icons. Their licences are included in the app bundle." Grepping the built output for "MIT License" or "Copyright (c)" across dist returns nothing, and dist conta

**Suggested fix.** Either generate a licences file at build time (a vite plugin or a small script over the pnpm lockfile) and link it from that row, or reword the footer to "Built with open-source software; see the repository for licences.

#### Retention pruning has no timer, and removeKid does not delete the child's clip blob
`app/src/domain/store.ts:111` · found by the privacy auditor

**What breaks.** Two small gaps in the otherwise sound retention path. (1) pruneEvents runs on rehydrate (store.ts:214) and on visibilitychange (app/src/app/Providers.tsx:21), and logEvent prunes on insert — so a session that stays foregrounded for days without a tag connected

**Suggested fix.** Make removeKid delete the clip itself (await deleteClip for any kid.nameClip before the set), so the invariant cannot be bypassed, and drop the now-redundant call in KidEditor. Add a low-frequency interval (or an idle ca

#### tag_config_decode accepts a volume of 255 with no clamp, so the only shared implementation of the ≤75 dB(A) cap does not enforce it
`firmware/src/tagalong_protocol.c:100` · found by the security auditor

**What breaks.** `tag_config_encode` clamps volume to 0-100 (line 63) but `tag_config_decode` does `out->volume = in[4];` with no range check, while every neighbouring field is validated (age band, personality, thing and language all return TAG_ERR_VALUE). docs/protocol/tag-pr

**Suggested fix.** In `tag_config_decode`, either reject `in[4] > 100` with TAG_ERR_VALUE or clamp: `out->volume = in[4] > 100 ? 100 : in[4];`. Add a host test asserting a 255 volume byte cannot survive decode, and extend the parity suite

#### frame-ancestors, HSTS, nosniff and COOP exist only in public/_headers, while the build explicitly supports GitHub Pages, which ignores that file
`app/public/_headers:4` · found by the security auditor

**What breaks.** The meta CSP in app/index.html:11 is genuinely tight (`default-src 'self'`, `script-src 'self'`, `object-src 'none'`, `connect-src 'self'`, `form-action 'none'`, no unsafe-inline for scripts, and I grepped the whole app for innerHTML / dangerouslySetInnerHTML

**Suggested fix.** Either commit a host config that serves the headers on the actual deploy target, or stop shipping a GitHub Pages path. Until then add `frame-ancestors` equivalents you can enforce client-side (a top-level frame-busting c

#### Signed integer overflow in compute_stats' variance accumulation
`firmware/src/tagalong_events.c:109` · found by the security auditor

**What breaks.** Line 108-109: `int32_t d = (int32_t)tag_accel_magnitude(...) - (int32_t)mean; var_acc += (uint64_t)(d * d);`. The cast to uint64_t happens after the multiply, so `d * d` is evaluated in int32. `tag_accel_magnitude` returns a uint16 clamped to UINT16_MAX (line

**Suggested fix.** Cast before multiplying: `var_acc += (uint64_t)((int64_t)d * d);` or compute on unsigned magnitudes. Add a host test with a synthetic block containing a near-UINT16_MAX magnitude so the arithmetic is exercised at the bou

#### prj.conf enables logging while claiming release builds ship with it off, and the promised build variants do not exist
`firmware/prj.conf:76` · found by the security auditor

**What breaks.** Lines 74-78 carry the comment "PRIVACY: logs must never contain a child's name, a recorded clip, or an event history. Release builds ship with logging off entirely" and then set `CONFIG_LOG=y`. docs/firmware/firmware-architecture.md:39 says there are four vari

**Suggested fix.** Create the fragments the architecture doc describes (prj_prod.conf with CONFIG_LOG=n, prj_dev.conf with logging and RTT) and make the default build the prod one, so the comment describes a file that exists.

#### Three specified utterance-policy mechanisms are missing, so every putdown and sip is spoken
`/home/user/tagalong/firmware/include/tagalong_policy.h:20` · found by the stress auditor

**What breaks.** docs/firmware/event-engine-spec.md section 8.3 specifies a priority table and a pending slot, and section 8.4 a probability gate with tag_event_speak_denominator (1-in-3 for putdown, 1-in-2 for sip). None of it is implemented: grepping firmware/ for "priorit"

**Suggested fix.** Implement tag_event_priority, the pending slot using TAG_PENDING_HOLD_MS, and tag_event_speak_denominator with the RNG already in tag_policy_t, then add the test_policy.c cases the test plan already claims exist.

#### good_morning and packed have authored phrase lines but the engine structurally cannot produce them
`/home/user/tagalong/firmware/include/tagalong_events.h:30` · found by the stress auditor

**What breaks.** tag_sensor_block_t carries now_ms, samples, rate, cap_raw and lux — no minute_of_day and no day_of_week — and tag_events_init takes only thing and now_ms. Both events are defined by time of day: event-engine-spec.md:309 requires packed to see minute_of_day in

**Suggested fix.** Add minute_of_day and day_of_week to tag_sensor_block_t (the policy context already carries both) and implement the two time-gated detectors, or remove the events from THING_META and the packs so the app stops advertisin

#### The reboot-recovery path is effectively dead, so a tag that loses its settings silently keeps firmware defaults
`/home/user/tagalong/app/src/transport/manager.ts:93` · found by the stress auditor

**What breaks.** connectTag re-pushes the config only when info.uptimeMin is lower than a previously seen value. lastUptime is a module-level Map that is never persisted and is deleted by disconnectTag (line 130), and installBackgroundDisconnect drops every connection 10 s aft

**Suggested fix.** Stop inferring reboots from uptime. On every connection, readConfig() and compare against buildTagConfig(); write when they differ. That is one extra read and it makes the whole class of drift self-healing. If uptime is

#### An emoji or astral-plane first character renders as a broken glyph in the kid avatar
`/home/user/tagalong/app/src/lib/format.ts:3` · found by the stress auditor

**What breaks.** initialOf takes name.trim()[0], a single UTF-16 code unit. For a name starting with an emoji or any character outside the BMP that is a lone surrogate, which renders as a replacement box. The maxLength={24} inputs (KidEditor.tsx:95, StepKid.tsx:259) and KidSch

**Suggested fix.** Use [...name.trim()][0] so the initial is a whole grapheme, and consider counting grapheme clusters rather than code units for the 24-character limit.

