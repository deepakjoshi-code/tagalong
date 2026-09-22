# Tagalong Tag ↔ App Protocol (BLE GATT) — v1

Shared contract between `app/src/transport/codec.ts` and `firmware/`. All multi‑byte integers are **little‑endian**.

## Advertising
- Device name `Tagalong`, appearance 0x0000, flags LE General Discoverable, complete list of 128‑bit UUIDs = [Tagalong Service].
- Manufacturer data (company ID `0xFFFF` until SIG membership): `[proto u8=1, hwRev u8, battery u8, flags u8(bit0 pairing‑window)]`.
- **Pairing window:** hold button 3 s → 60 s of undirected connectable advertising (100 ms interval) + giggle + LED ring pulse.
- **Otherwise:** low‑duty (1.28 s) connectable advertising **only** during 30 min after motion, using a **resolvable private address** rotated every 15 min. Config writes require a bonded peer (LE Secure Connections, Just Works, MITM not possible — no display).

## Service `7A67A000-1E5E-4B2C-9B8D-0C4F7E1D2A30`
| Characteristic | UUID (`7A67Axxx-…`) | Props | Payload |
|---|---|---|---|
| Config | `7A67A001` | Read, Write (encrypted) | `TagConfig` 13 B |
| Info | `7A67A002` | Read | `TagInfo` 12 B |
| Event | `7A67A003` | Notify | `EventFrame` 8 B |
| Battery | `7A67A004` | Read, Notify | `u8` percent |
| Control | `7A67A005` | Write (encrypted) | `ControlOp` 1–4 B |
| PackXfer | `7A67A006` | Write w/o resp, Notify | v1.1 content updates (chunked, CRC32) |
Also exposes standard **Device Information** (0x180A: model, fw rev, hw rev) and **Battery** (0x180F) services.

## `TagConfig` (13 bytes)
| Off | Type | Field | Notes |
|---|---|---|---|
| 0 | u8 | version | `1` |
| 1 | u8 | ageBand | 0 little · 1 kid · 2 big |
| 2 | u8 | thing | 0 bottle · 1 lunchbox · 2 backpack · 3 toothbrush · 4 shoes · 5 plush · 6 helmet · 7 jacket · 255 other |
| 3 | u8 | personality | 0 silly · 1 sweet · 2 brave |
| 4 | u8 | volume | 0–100; firmware maps to ≤ 75 dB(A) @ 25 cm |
| 5 | u8 | quietStart | minutes‑since‑midnight ÷ 10 (0–143); `255` = quiet hours disabled |
| 6 | u8 | quietEnd | same encoding |
| 7 | u8 | language | 0 en · 1 es · 2 hi |
| 8 | u8 | flags | bit0 nudges · bit1 eventBuffer · bit2 nameClipPresent · bit3 led · bit4 hapticsReserved |
| 9 | u8 | maxPerHour | utterance rate limit, default 12 (hard cap 30) |
| 10 | u16 | timeOfDayMin | app's local minutes‑since‑midnight at write time (tag has no RTC) |
| 12 | u8 | checksum | XOR of bytes 0–11 |

## `TagInfo` (12 bytes)
`fwMajor u8, fwMinor u8, fwPatch u8, hwRev u8, packId u16, packVersion u16, battery u8, uptimeMin u16, flags u8 (bit0 charging, bit1 muted, bit2 nameClipPresent)`

## `EventFrame` (8 bytes)
`version u8=1, eventType u8, uptimeSec u32, battery u8, aux u8`
Event type codes: `0 pickup · 1 putdown · 2 drop · 3 shake · 4 tap · 5 long_still · 6 good_morning · 7 low_battery · 8 charging · 16 filled · 17 sip · 18 empty · 32 opened · 33 closed · 34 packed · 48 left_behind · 49 zipped · 64 brush_start · 65 brush_done · 66 brush_short`.
`aux`: drop = impact g×10 (clamped 255); sip = tilt degrees; brush = seconds ÷ 2.
The tag buffers up to 64 frames while disconnected and replays them on subscribe (oldest first).

## `ControlOp`
| Op | Bytes | Meaning |
|---|---|---|
| 0x01 | `01` | Identify: giggle + LED pulse 3 s |
| 0x02 | `02 <eventType>` | Play a preview line for that event with current config |
| 0x03 | `03 <minutes u16>` | Mute for N minutes (0 = unmute) |
| 0x04 | `04 <minutes u16>` | Set time of day (minutes since midnight) |
| 0x05 | `05 A5` | Factory reset (clears bonds + config; keeps content) |
| 0x06 | `06` | Enter DFU (signed images only) |

## Errors
GATT write rejected (0x80 application error) when: bad checksum, unknown version, unbonded peer for encrypted chars.
