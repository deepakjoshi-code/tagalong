# Tagalong Tag — Content Pack Format

| | |
|---|---|
| **Status** | Accepted for build · 2026‑09‑22 |
| **Owner** | Firmware, with Content for the recording scope |
| **Authority** | ADR‑003 (pre‑rendered audio in QSPI) · `docs/01-prd.md` §6.12/§6.13 · `content/guidelines.md` · `docs/hardware/system-architecture.md` §2.6 · `docs/protocol/tag-protocol.md` |
| **Inputs** | `content/packs/*.json` — the shipped EN packs, **2,052 lines across 513 cells** |
| **Companions** | `firmware-architecture.md` §§3.2/8 · `event-engine-spec.md` §§9/12 · `dfu-and-security.md` §9 |

A content pack is the tag's whole vocabulary: audio, an index, and a threshold table. It is read‑only in normal operation, memory‑mapped by offset rather than parsed, and it contains **no text** — the tag never stores a phrase string, which makes it smaller, faster and uninteresting to steal.

Every number in §9 is computed from the real packs. The computation is reproducible: `tools/packbuild.py --report` prints the same table.

---

## 1. What one tag holds

A tag is configured for one thing, one age band and one personality — but the parent can change any of them at any time from the app (wizard step 3/4, Tag detail, Kids). A round trip to the phone for content would break the "reacts in one second" promise, so **a tag holds the entire language pack**: all 9 thing codes × all 20 event codes × 3 bands × 3 personalities, plus sound effects and the fallback vocatives. One language at a time (ADR‑003).

---

## 2. Audio format

| Property | Value | Note |
|---|---|---|
| Codec | IMA ADPCM, 4 bit/sample, mono | ADR‑003 |
| Block | **256 B** = 4 B header (predictor `i16`, step index `u8`, reserved `u8`) + 252 data bytes | the header sample is the block's first sample → **505 samples/block**, and every block is self‑contained |
| Sample rate, v1 EN | **12,000 Hz** → 8.111 kB/s at 505 samples/block; block period 42.08 ms | see the decision below |
| Playback clock | I²S `MCKFREQ = 32 MHz/21`, `RATIO = 128` → 11,904.76 Hz (−0.79 %, 14 cents) | `firmware-architecture.md` §8 |
| Supported rates | 8,000 / 12,000 / 16,000 Hz, carried in the header | a rate change is one `RATIO` value |
| Loudness | normalised to −16 LUFS at build time | PRD §6.13 |
| Fades | 30 ms in and out, baked in | PRD §6.13, avoids amp clicks |
| Trim | ≤ 30 ms head, ≤ 60 ms tail of silence retained | the recording brief asks for 120 ms each (`guidelines.md` §7); the builder trims and the player re‑inserts timing for free |

### The sample‑rate decision

ADR‑003 specifies 16 kHz. The shipped packs contain 2,052 lines, which reduce to **1,592 distinct recordings**. Measured against those, the three candidate builds are:

| Build | Audio | Pack total | Fits the 14 MiB pack region? |
|---|---|---|---|
| 16 kHz, spliced `{{name}}` | 17.71 MB | **16.98 MiB** | **No** — larger than the entire 16 MiB flash part |
| 12 kHz, spliced `{{name}}` | 13.46 MB | **12.89 MiB** (92.1 %) | **Yes**, 1.10 MiB spare |
| 12 kHz, PRD §6.12 literal (3 baked vocative variants **and** a spliced version per `{{name}}` line) | 16.20 MB | **15.55 MiB** | No |
| 8 kHz, spliced `{{name}}` | 8.94 MB | **8.58 MiB** | Yes, with 5.4 MiB spare |

So the v1 EN build is **12 kHz with spliced vocatives**. 12 kHz gives 6 kHz of audio bandwidth, which is at or beyond what a 20 mm 8 Ω micro speaker behind an IP67 mesh actually reproduces, so the audible cost is small and the budget cost is decisive. The format is rate‑agnostic, so this is reversible the moment the flash part grows.

**This needs an ADR‑003 amendment** — the ADR's own worked example ("a 400‑line pack ≈ 6 MB", i.e. ≈ 15 kB/line) is consistent with 8 kB/s compressed audio, not with the "≈ 32 kB/s" figure quoted beside it, which is the uncompressed 16‑bit PCM rate. The conclusion is right and the rate line is a slip; the amendment should fix the rate line and record the 12 kHz decision. Carried in the open questions.

---

## 3. Flash layout

QSPI (W25Q128JVSIQ, 16 MiB, 4 KiB sectors, 64 KiB blocks). Full map in `firmware-architecture.md` §3.2; the pack's own region is:

| Offset | Size | Contents |
|---|---|---|
| `0x000000` | 65,536 B | **index block** — header, LUTs, tables, threshold table (34,716 B used) |
| `0x010000` | 13,456,128 B | **audio blob** — 256 B blocks, back to back |
| … | to `0xDFFFFF` | free: 1,158,400 B (1.10 MiB) |

The index occupies one 64 KiB erase block so that a future index‑only rewrite touches nothing else. Audio starts 64 KiB in, which is both sector‑ and block‑aligned.

---

## 4. Binary layout

All integers little‑endian, matching the wire protocol. Offsets in the header are relative to the start of the pack region, so the index can be relocated without rewriting it.

### 4.1 Header (64 B, offset 0)

| Off | Type | Field | Value in the v1 EN pack |
|---|---|---|---|
| 0 | `u8[4]` | magic | `"TGPK"` |
| 4 | `u8` | `format_version` | 1 |
| 5 | `u8` | `codec` | 1 = IMA ADPCM 4‑bit mono |
| 6 | `u16` | `sample_rate_hz` | 12000 |
| 8 | `u16` | `pack_id` | 1 (1 = EN, 2 = ES, 3 = HI) — surfaced in `TagInfo` |
| 10 | `u16` | `pack_version` | monotonic build number, surfaced in `TagInfo` |
| 12 | `u8` | `language` | 0 = en (matches `TagConfig.language`) |
| 13 | `u8` | `thing_slots` | 9 |
| 14 | `u8` | `event_slots` | 20 |
| 15 | `u8` | `flags` | bit0 has sound effects · bit1 has fallback vocatives · bit2 delta‑built |
| 16 | `u32` | `cell_table_off` | 0x0240 |
| 20 | `u32` | `clipref_table_off` | 0x1BB0 |
| 24 | `u32` | `clip_table_off` | 0x3590 |
| 28 | `u32` | `segment_table_off` | 0x4EEC |
| 32 | `u32` | `audio_off` | 0x010000 |
| 36 | `u32` | `audio_len` | 13,456,128 |
| 40 | `u16` | `clip_count` | 1,631 |
| 42 | `u16` | `segment_count` | 1,736 |
| 44 | `u16` | `clipref_count` | 3,312 |
| 46 | `u16` | `fallback_table_off_lo` / `sfx_table_off_lo` | packed section offsets (16‑bit, index‑relative) |
| 48 | `u16` | `threshold_table_off` | index‑relative |
| 50 | `u16` | `threshold_version` | 1 |
| 52 | `u32` | `audio_crc32` | CRC‑32/IEEE over the audio blob |
| 56 | `u32` | `index_crc32` | CRC‑32/IEEE over bytes 64 … end of the threshold table |
| 60 | `u32` | `header_crc32` | CRC‑32/IEEE over bytes 0–59 |

CRC‑32 is the standard reflected IEEE polynomial (`0xEDB88320`, init and final XOR `0xFFFFFFFF`) so `zlib.crc32` in the builder and `crc32_ieee()` in Zephyr agree without a custom table.

At mount the firmware verifies `header_crc32` (64 B, microseconds) and `index_crc32` (34 KB, ≈ 2 ms). `audio_crc32` covers 13 MB and is **not** verified at every boot; it is verified after a PackXfer commit, at EOL test, and on a `FAULT_PACK` retry. A per‑clip check would cost more flash than it is worth: a corrupt clip is audible, not dangerous.

### 4.2 Slot LUTs (256 B each)

```c
uint8_t thing_slot[256];   /* thing code -> 0..8, 0xFF invalid.  codes 0..7 -> 0..7, code 255 -> 8 */
uint8_t event_slot[256];   /* event code -> 0..19, 0xFF invalid. 0..8 -> 0..8, 16..18 -> 9..11,
                              32..34 -> 12..14, 48..49 -> 15..16, 64..66 -> 17..19 */
```

Two 256‑byte tables buy O(1) lookup with no branching and, importantly, they are the **same** dense mapping `event-engine-spec.md` §7 uses for the debouncer, so the firmware has exactly one event‑slot definition.

### 4.3 Cell table and clipref table

```c
typedef struct {            /* 4 B */
    uint16_t clipref_off;   /* index into the clipref table          */
    uint8_t  count;         /* clips in this cell, 0 = nothing here  */
    uint8_t  flags;         /* bit0 = resolved from the generic pack */
} pack_cell_t;              /* [thing_slot][event_slot][band][personality] */
```

Dense: 9 × 20 × 3 × 3 = **1,620 cells × 4 B = 6,480 B**. 828 are populated, 792 are empty (`count == 0`) — a `filled` line for a helmet does not exist and never will. Dense beats sparse here because the whole table is 6.5 KB and the lookup becomes arithmetic.

```c
uint16_t clipref[3312];     /* clip ids, grouped by cell */
```

**Fallback is flattened at build time.** The app resolves a missing cell at runtime (`content/index.ts`: own pack → generic flavour → generic events). The builder does the same walk once and writes the resolved clip ids into every cell, so the firmware has no fallback chain, no `generic` special case and no way to disagree with the app. Shared clips are referenced from many cells and stored once: 2,052 authored slots become 3,312 clip references over 1,592 distinct recordings.

### 4.4 Clip table and segment table

```c
typedef struct {            /* 4 B */
    uint16_t first_segment;
    uint8_t  segment_count; /* 1, or 2 for a spliced {{name}} clip */
    uint8_t  flags;         /* bit0 SPLICE_AFTER_SEG0 · bit1 SFX · bit2 VOCATIVE */
} pack_clip_t;              /* 1,631 entries = 6,524 B */

typedef struct {            /* 8 B */
    uint32_t block_index;   /* offset into the audio blob, in 256 B blocks */
    uint16_t block_count;
    uint16_t duration_ms;   /* decoded duration, for the LED flash and the pending slot */
} pack_segment_t;           /* 1,736 entries = 13,888 B */
```

Block indices rather than byte offsets keep the field at `u32` with room for 1 TB of audio and make every read naturally aligned. `duration_ms` is stored because the LED flash has to be synced to speech onset (TAG‑LED‑02) and the pending slot needs to know when the tag stops talking, and deriving it from `block_count` alone would be off by up to 42 ms.

### 4.5 Fallback vocative table (64 B)

```c
uint16_t fallback_clip[27];  /* [band * 9 + personality * 3 + variant] */
```

27 entries: 3 bands × 3 personalities × 3 words — `little` {buddy, friend, sunshine}, `kid` {amigo, champ, buddy}, `big` {legend, captain, friend}, exactly `AGE_BAND_META[band].fallbackNames` from `app/src/domain/ageBands.ts`. The PRD is explicit that "each band needs its fallback set recorded, not one word" (TAG‑NC‑01); this is that set, recorded once per voice instead of baked into 105 lines three times over.

### 4.6 Sound‑effect table (48 B)

```c
uint16_t sfx_clip[12];       /* indexed by pack_sfx_id_t */
```

| Id | Effect | Used by |
|---|---|---|
| 0 | giggle | pairing window, `Control 0x01` identify, unpaired tap, ship‑mode wake |
| 1 | oof | unpaired `drop` |
| 2 | yawn | `low_battery` |
| 3 | zzzip | `zipped` |
| 4 | glug‑glug | `filled` |
| 5 | sparkle | `brush_done` |
| 6 | boop | button feedback in quiet hours is LED‑only, so this is for previews |
| 7 | hiccup | `shake` |
| 8 | whoosh | `pickup` on basic things |
| 9 | charge chime | `charging` |
| 10 | sleepy sigh | `long_still` |
| 11 | pop | `opened` |

Effects are **shared across bands** (PRD §6.13) — they carry no language and no vocabulary, so one recording serves all nine cells. This is also what makes an unpaired tag possible: it has no age band, so it answers with effects and no words.

### 4.7 Threshold table (512 B)

The tuning constants listed in `event-engine-spec.md` §12, as a versioned `u16` array with a fixed field order. `threshold_version` in the header says which layout; firmware applies the fields it knows, ignores the rest, and range‑checks every value against a compiled default. A pack cannot break detection, only tune it.

---

## 5. Lookup

```c
const uint16_t *pack_cell_clips(const pack_t *p, uint8_t thing_code, uint8_t event_code,
                                tag_age_band_t band, tag_personality_t pers, uint8_t *count)
{
    uint8_t ts = p->thing_slot[thing_code];
    uint8_t es = p->event_slot[event_code];
    if (ts == 0xFFu || es == 0xFFu) { *count = 0; return NULL; }

    uint32_t i = (((uint32_t)ts * p->event_slots + es) * 3u + (uint32_t)band) * 3u + (uint32_t)pers;
    const pack_cell_t *cell = &p->cells[i];
    *count = cell->count;
    return cell->count ? &p->cliprefs[cell->clipref_off] : NULL;
}
```

Three loads and two multiplies, no search, no allocation, and the returned slice is exactly what `tag_policy_pick_clip_ref()` wants (`event-engine-spec.md` §9). `count == 0` means the tag stays silent — which is correct and is why `content/validate.mjs` runs in CI: a missing `generic` cell is a silent tag (PRD §6.13).

---

## 6. Mounting and fallback

```
mount(pack_primary):
    read 64 B header
    magic == "TGPK" and header_crc32 ok?          else -> fallback
    format_version <= FW_MAX_PACK_FORMAT?         else -> fallback
    codec and sample_rate_hz supported?           else -> fallback
    language == cfg.language?                     else -> fallback (wrong-language pack)
    read index (34 KB), index_crc32 ok?           else -> fallback
    apply threshold table
    ready

fallback:
    set FAULT_PACK, LED per TAG-LED-17
    mount `essentials` (8 kHz, 40 clips, 200 KB, QSPI 0xE00000)
    Info.packId = 0xFFFF so the app can say "content needs repair"
```

`essentials` holds the 12 sound effects plus one line per band × personality for `tap`, `low_battery` and `charging`. It is written at the factory and never written again, so it cannot be damaged by a failed PackXfer. Without it, an interrupted content update produces a silent tag — which for a talking toy is indistinguishable from a dead one.

---

## 7. `{{name}}` splicing

`content/guidelines.md` §5 allows at most one line in three per cell to carry `{{name}}`. The real packs are well inside that: **147 of 2,052 slots (7.2 %)**, reducing to **105 of 1,592 distinct clips (6.6 %)** — 23 `little`, 43 `kid`, 39 `big`.

Every `{{name}}` line is stored **once**, as two segments with the vocative removed:

```
"All zipped up, {{name}}. Thank you."
  segment 0: "All zipped up,"
  <splice point>
  segment 1: "Thank you."
```

The player concatenates `segment[0] → name clip → segment[1]` with a 20 ms cross‑fade at each seam, re‑initialising the ADPCM decoder per segment (free: every block is self‑contained). The spliced clip is either the parent's recording (v1.1, `flags.nameClipPresent` set and the region valid) or one of the band's three fallback vocatives chosen through the same RNG the line choice uses — which mirrors `resolveName()` in `app/src/content/pickPhrase.ts` picking at random from `AGE_BAND_META[band].fallbackNames`.

Why splicing rather than baking, given TAG‑NC‑01 asks for both a baked and a spliced version:

| | Splice‑only (chosen) | Baked + spliced (PRD literal) |
|---|---|---|
| Distinct recordings | 1,592 + 27 vocatives | 1,907 + 27 |
| Pack size at 12 kHz | 12.89 MiB — fits | 15.55 MiB — **does not fit** |
| Studio time | 14 min of finished audio per voice | 17 min per voice |
| Exercises the v1.1 name‑clip path | **from day one** | only after v1.1 |
| Risk | a prosody seam at the splice | none |

The seam risk is real and is managed, not ignored: **82 of the 105 name lines put `{{name}}` between two punctuation marks** and the remaining 23 place it after a single opening word ("Hi {{name}}! Ready?"), so every splice point is a natural phrase boundary. The fallback vocatives are recorded in carrier phrases at the band's pitch and pace, not as isolated words. If the VO review at DVT rejects a specific seam, the builder can bake that one line's three variants — `segment_count = 1`, splice flag clear — at a cost of about 33 kB per line. The format supports both; the default is splice.

### 7.1 Name‑clip region

| Property | Value |
|---|---|
| Location | `name_clip_a` `0xE40000`, `name_clip_b` `0xE50000`, 64 KiB each |
| Format | same codec and **same sample rate as the mounted pack** (12 kHz for the v1 EN pack) |
| Length | ≤ 1.5 s → 36 blocks → 9,216 B; the region allows far more, the cap is enforced on write |
| Layout | 16 B header (magic `"TGNC"`, length, duration_ms, sample_rate_hz, crc32) + blocks |
| Write | always into the inactive slot, then the active‑slot pointer in NVS flips — a re‑record can never leave the tag with half a name |
| Delete | zero the header of both slots, clear `flags.nameClipPresent`; the app's "delete" is a real erase |
| Never | copied anywhere, exposed over GATT, included in a coredump (there are none), or logged |

TAG‑NC‑02 specifies 16 kHz for the name clip. Splicing a 16 kHz clip into a 12 kHz phrase would need a resampler in the audio thread for no audible gain, so the clip is stored at the pack's rate and the **phone converts before sending** — the phone has Web Audio and no power budget. The tag states its required rate and codec in the PackXfer `PX_BEGIN` acknowledgement (§11.2), so no v1 GATT field changes. Flagged in the open questions.

---

## 8. Recording scope

Derived from the shipped packs, for the studio week (roadmap: December 2026).

| | Value |
|---|---|
| Authored line slots | 2,052 across 513 cells, 5 packs |
| Distinct recordings after de‑duplication | **1,592** (460 slots are the same text in the same band and personality) |
| Per voice | silly 575 · sweet 491 · brave 526 |
| Fallback vocatives | 27 (9 per voice) |
| Sound effects | 12, shared across all bands and voices |
| Total recordings | 1,631 |
| Finished audio | ≈ 41 minutes, ≈ 14 minutes per voice |

The PRD's estimate of "~684 lines per voice" counts authored slots; de‑duplication brings the studio down to ≈ 531 lines per voice plus 9 vocatives. One voice per personality across all three bands, with pitch and pace shifting by band (`guidelines.md` §7).

**Two findings for Content**, both at DVT‑or‑earlier:

| Finding | Detail |
|---|---|
| Duration | Modelled playback is mean **1.53 s**, p90 2.04 s, max 3.02 s. All 1,592 clips are inside the PRD's ≤ 4 s ceiling and all `little` clips are inside its ≤ 2.5 s (`little` max 1.98 s). But `guidelines.md` §7 asks for takes under **2.0 s**, and **207 clips (13 %) exceed it** — 138 `kid` and 69 `big`. Either the read is brisker than modelled, or those lines get trimmed at script lock. |
| Power | 1.53 s average confirms the 1.5 s the power budget assumes, so the speaking line in `power-budget.md` §2 stands as written. |

---

## 9. Size budget — v1 EN pack

**Index**

| Section | Entries | Bytes |
|---|---|---|
| Header | 1 | 64 |
| `thing_slot` LUT | 256 | 256 |
| `event_slot` LUT | 256 | 256 |
| Cell table | 1,620 | 6,480 |
| Clipref table | 3,312 | 6,624 |
| Clip table | 1,631 | 6,524 |
| Segment table | 1,736 | 13,888 |
| Fallback vocative table | 27 | 64 |
| Sound‑effect table | 12 | 48 |
| Threshold table | — | 512 |
| **Index total** | | **34,716** (region 65,536, 53 % used) |

**Audio** (12 kHz, 8,111 B/s, block‑aligned per segment)

| Content | Segments | Bytes |
|---|---|---|
| Phrase clips (1,592 clips, 105 of them two‑segment) | 1,697 | 13,325,568 |
| Fallback vocatives | 27 | 77,568 |
| Sound effects | 12 | 52,992 |
| **Audio total** | **1,736** | **13,456,128** |

**Pack total: 13,521,664 B = 12.89 MiB**

| Against | Bytes | Utilisation |
|---|---|---|
| `pack_primary` region (14 MiB) | 14,680,064 | **92.1 %**, 1,158,400 B (1.10 MiB) spare |
| Whole QSPI part (16 MiB) | 16,777,216 | 80.6 % |

Headroom analysis: 1.10 MiB is ≈ 135 more clips at the measured average, or ≈ 8 % growth. That is enough for a seasonal patch or one extra thing, and **not** enough for a second language — which matches ADR‑003's "one language per tag". If the pack needs to grow beyond that, the levers in order of preference are (1) drop to 8 kHz for `little` only, whose clips are shortest and whose listeners are least sensitive to bandwidth, saving ≈ 2.1 MiB; (2) 8 kHz throughout, saving 4.3 MiB; (3) the 32 MiB W25Q256, +≈ $0.55 at 10k against $0.23 of BOM headroom, which is a founder decision, not a firmware one.

---

## 10. Versioning and compatibility

| Field | Rule |
|---|---|
| `format_version` | firmware accepts `<= FW_MAX_PACK_FORMAT` (1 today). Newer → `essentials`, `Info.packId = 0xFFFF`. |
| `pack_id` | identifies the language and content set; surfaced in `TagInfo.packId`. 1 = EN, 2 = ES, 3 = HI. |
| `pack_version` | monotonic build number, surfaced in `TagInfo.packVersion`. The app compares it against its bundled catalogue and offers "Update available" once PackXfer ships (PRD §6.13). |
| `threshold_version` | independent of `pack_version`; a tuning‑only change bumps this and `pack_version`, not `format_version`. |
| Adding an index section | append it and add its offset to the header's reserved space. Old firmware skips it by offset. Backwards compatible. |
| Changing a struct width | `format_version` bump. Not backwards compatible, and therefore requires a firmware update to ship first. |
| Language mismatch | a pack whose `language` differs from `TagConfig.language` is refused at mount rather than played in the wrong language. |

---

## 11. PackXfer (v1.1)

`7A67A006`, Write Without Response for data, Notify for status, encrypted and bonded like everything else. Not used in v1.0: the factory pre‑loads the pack and the name clip lives on the phone (decision A‑02).

### 11.1 What it has to carry, and how long it takes

| Payload kind | Typical size | Chunks at 224 B | Realistic duration |
|---|---|---|---|
| `KIND_NAME_CLIP` | 9,232 B | 42 | **< 1 s** |
| `KIND_PACK_DELTA` | 200 kB – 1 MB | 893 – 4,682 | **10 s – 1.5 min** |
| `KIND_PACK_FULL` | 13,521,664 B | 60,365 | **11 – 19 min** |

Throughput assumption: 244‑byte writes without response, 30 ms connection interval, 4–6 packets per interval over Web Bluetooth ≈ 12–20 kB/s. A full pack replacement is therefore a "put the tag next to the phone and go and make tea" operation, which is exactly why **v1.1 ships delta packs** (the roadmap's "content patch pack") and treats `KIND_PACK_FULL` as a factory and recovery path rather than a normal update. The app must show real progress, allow the screen to lock, and resume rather than restart.

`chunk_count` is a `u16`, and a full pack needs 60,365 of them — 92 % of the field. A pack larger than 14.6 MB at this chunk size would overflow it, which is a second, independent reason the pack has to stay inside its region. A larger flash part would need `chunk_size` raised or `chunk_count` widened, and that is a `format_version` change.

### 11.2 Opcodes

App → tag (Write Without Response, ≤ 244 B):

| Op | Payload | Notes |
|---|---|---|
| `0x01 PX_BEGIN` | `session u8, kind u8, pack_id u16, pack_version u16, total_len u32, chunk_size u16, chunk_count u16, content_crc32 u32, sig_len u16, sig[64]` | ECDSA P‑256 signature over `SHA-256(header‖content)`, split across two writes when it does not fit |
| `0x02 PX_DATA` | `session u8, chunk_index u16, payload[chunk_size]` | `chunk_size` = 224 for the default MTU; the tag rejects a size it cannot buffer |
| `0x03 PX_END` | `session u8, content_crc32 u32` | triggers verify and commit |
| `0x04 PX_ABORT` | `session u8` | tag erases staging, keeps the current pack |
| `0x05 PX_QUERY` | `session u8, from_chunk u16` | asks for the missing‑chunk bitmap, for resume |

Tag → app (Notify):

| Op | Payload |
|---|---|
| `0x81 PX_STATUS` | `session u8, state u8, chunks_received u16, next_expected u16, err u8` |
| `0x82 PX_BITMAP` | `session u8, from_chunk u16, bitmap[≤ 200]` — 1,600 chunks per notification |
| `0x83 PX_READY` | `session u8, codec u8, sample_rate_hz u16, max_name_clip_bytes u16, max_chunk_size u16` — the tag's answer to `PX_BEGIN`, and how the app learns the rate to convert a name clip to (§7.1) |

Errors in `err`: `0` none · `1` bad session · `2` bad kind · `3` too large · `4` chunk out of range · `5` CRC mismatch · `6` signature invalid · `7` version not newer · `8` flash write failed · `9` busy.

### 11.3 Staging and commit

| Kind | Path |
|---|---|
| `KIND_NAME_CLIP` | staged in `pack_stage`, verified, written to the inactive `name_clip_*` slot, NVS pointer flipped. Atomic. |
| `KIND_PACK_DELTA` | staged in `pack_stage` (512 KiB), verified, then applied clip by clip into `pack_primary` followed by a new index block. Atomic at the index: the old index stays valid until the new one is written and CRC‑verified. |
| `KIND_PACK_FULL` | cannot be staged (13.5 MB against 512 KiB), so it is written **directly** into `pack_primary` after its header is invalidated. A power loss mid‑write leaves an invalid header → `essentials` → the app can retry. This failure mode is survivable precisely because `essentials` exists. |

Resume: the chunk bitmap lives in `pack_stage` and survives a disconnect and a reboot. On reconnect the app sends `PX_QUERY` and retransmits only the gaps. A session older than 24 h is discarded.

Authenticity: **CRC32 is integrity, not authenticity** (threat model T‑23, PRV‑34). Every pack and name clip carries an ECDSA P‑256 signature verified before commit, with the same key hierarchy as firmware images — `dfu-and-security.md` §9. A name clip is signed by nothing, because it comes from the parent's own phone over a bonded link; it is instead length‑, rate‑ and CRC‑checked, and it can only ever be played back to the child whose parent recorded it.

---

## 12. Builder

`tools/packbuild.py`, deterministic: same inputs, byte‑identical output, so a pack hash can be published (PRV‑49).

```
packbuild.py --packs content/packs --audio build/audio --lang en \
             --rate 12000 --pack-id 1 --pack-version 7 \
             --thresholds firmware/thresholds/v1.toml \
             --out build/pack-en-v7.tgpk --report
```

Stages: validate (`content/validate.mjs` semantics, re‑implemented so the builder never emits an invalid pack) → de‑duplicate by `(band, personality, text)` → split `{{name}}` into segments → look up the mastered WAV per recording → encode ADPCM, block‑align → flatten the fallback chain into the cell table → emit tables → compute CRCs → sign → report.

`--report` prints the §9 budget table and **fails the build** when the pack exceeds the region, when a cell resolves to zero clips, when a clip exceeds 4 s (PRD §6.13), when a `little` clip exceeds 2.5 s, or when any `{{name}}` cell exceeds one line in three.

---

## 13. Tests

Host suite `firmware/tests/test_pack.c`, dependency‑free harness as elsewhere.

| Test | Asserts |
|---|---|
| `header_round_trip` | a fixture pack mounts; bad magic, bad CRC, newer `format_version`, unsupported rate and wrong language each fail mount with a distinct reason |
| `cell_lookup_matches_the_app` | for all 9 things × 20 events × 9 cells, the resolved clip count matches a JSON dump of `getLines()` from `app/src/content/index.ts` — the fallback chain is proved identical, not assumed |
| `every_reachable_cell_is_populated` | every `(thing, event)` pair in `THING_META.events` resolves to ≥ 4 clips, in every band and personality (TAG‑EV‑01) |
| `segment_bounds` | every segment lies inside the audio blob; no overlap between the index block and the audio |
| `splice_clips_have_two_segments` | all 105 `{{name}}` clips have `segment_count == 2` and the splice flag set; no non‑name clip has it |
| `fallback_table_matches_age_bands` | the 27 vocatives are exactly `AGE_BAND_META[*].fallbackNames` in order |
| `threshold_table_ranges` | out‑of‑range and unknown fields fall back to compiled defaults; a newer `threshold_version` still mounts |
| `budget` | the real `content/packs` build stays under the region size — a content commit that overflows flash fails CI, not the factory |
| `adpcm_decode_is_exact` | `test_adpcm.c`: decoding fixture blocks matches a reference decode sample for sample, including the header sample and step‑index clamping |
| `packxfer_state_machine` | begin/data/end happy path; out‑of‑range chunk, CRC mismatch, bad signature, stale session and resume‑after‑disconnect all behave per §11.2 |

---

## 14. Assumptions recorded here

1. **12 kHz, not 16 kHz** (§2). Needs an ADR‑003 amendment; the ADR's own pack‑size arithmetic already implies ≈ 8 kB/s compressed.
2. **`{{name}}` lines are spliced, not baked** (§7), which is what makes the pack fit. The format supports baking per line if VO review demands it.
3. **The name clip is stored at the pack's sample rate**, not TAG‑NC‑02's 16 kHz, and the phone converts (§7.1).
4. **Fallback resolution is flattened at build time** (§4.3), so the firmware cannot disagree with `content/index.ts`.
5. **`essentials` mini‑pack** (§6) is a firmware addition; it costs 256 KiB and removes the "silent brick after a failed pack write" failure mode.
6. **A full pack transfer over BLE takes 12–25 minutes**, so v1.1's real update mechanism is delta packs.
7. **`audio_crc32` is not verified at boot** (§4.1) — 13 MB at every wake would be visible in the power budget, and a corrupt clip is audible rather than dangerous.
8. **The tag stores no phrase text.** Everything in this format is audio, integers and offsets.
