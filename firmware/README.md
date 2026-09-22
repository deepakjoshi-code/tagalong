# Tagalong Firmware

Firmware for the tag: nRF52840 under Zephyr (nRF Connect SDK). Design docs live in [`../docs/firmware/`](../docs/firmware/); the wire contract is [`../docs/protocol/tag-protocol.md`](../docs/protocol/tag-protocol.md).

## What is here today

| Module | Status | Notes |
|---|---|---|
| `src/tagalong_protocol.c` | **Done, tested** | Encode/decode for Config, Info, Event and Control frames. Byte-identical to the app's TypeScript codec, enforced by a test. |
| `src/tagalong_policy.c` | **Done, tested** | Rate limiting, quiet hours, mute, per-event debounce, minimum gap, no-repeat clip selection. |
| `src/tagalong_events.c` | **Done, tested** | Sensor fusion and per-thing classifiers: drop, pickup/putdown, shake, long-still, transport rejection, bottle fill/sip/empty, brushing sessions, lunchbox lid, backpack zip and left-behind. Thresholds: `../docs/hardware/sensing-and-event-detection.md`. |
| `src/ble_service.c` | To write | GATT table and advertising policy per ADR‑007. |
| `src/audio.c` | To write | QSPI read, ADPCM decode, I²S playback, SPL clamp. |
| `src/power.c` | To write | Power states from `../docs/hardware/system-architecture.md` §3. |

The finished modules are deliberately the ones that are pure logic: they carry the product's promises (never talk over itself, silent at night, never nag, never react to nothing) and they are testable without hardware, so they are worth getting right before a board exists.

The event tests are written against synthetic sensor traces and are checked by **negative controls**: disabling transport rejection, the drop's free-fall gate, the fill stillness requirement or the lunchbox dark-duration rule each makes a specific test fail. A test that still passes when you break the thing it claims to test is not a test.

## Host tests — no hardware needed

```bash
cd tagalong/firmware
make test
```

Builds with `-Wall -Wextra -Werror -Wconversion` and runs both suites. There is no test framework to install.

```bash
make vectors   # print the canonical wire vectors as JSON
```

## Codec parity with the app

The tag and the app must encode identical bytes. `tagalong/app/src/transport/parity.test.ts` compiles this firmware's vector dumper and compares it against the TypeScript codec, so a one-byte divergence fails `pnpm test` in the app. If you change the wire format, change `docs/protocol/tag-protocol.md`, both codecs, and the vectors together.

## On-target build

```bash
west build -b tagalong_nrf52840 tagalong/firmware
```

`prj.conf` carries the Bluetooth privacy settings (bonding, LE Secure Connections, resolvable private addresses), MCUboot for signed updates, and the power-management options the 30-day battery target depends on. A board definition for the real hardware goes in `boards/` once the EE fixes the pinout.

## Rules for this directory

- Anything that can be plain C99 with no Zephyr dependency should be, so it can be unit-tested on the host.
- No logging of a child's name, a recorded clip, or an event history — at any log level.
- Every behaviour that the product brief promises gets a host test, not a comment.
