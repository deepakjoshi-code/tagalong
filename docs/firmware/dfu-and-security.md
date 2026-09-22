# Tagalong Tag — DFU, Secure Boot and Key Management

| | |
|---|---|
| **Status** | Accepted for build · 2026‑09‑22 |
| **Owner** | Firmware, with Release for key custody |
| **Authority** | ADR‑007 (BLE privacy) · `docs/privacy/threat-model.md` §8 (PRV requirements) · `docs/hardware/compliance-and-test-plan.md` §2 (CMP requirements) · `docs/01-prd.md` §6.11 · `docs/protocol/tag-protocol.md` (`ControlOp 0x06`) |
| **Compliance role** | This document is the **input** to the EN 18031 and UK PSTI submissions (`compliance-and-test-plan.md` §1: "write it during firmware development, not after the fact"). It is written first for that reason. |
| **Companions** | `firmware-architecture.md` §§3/9 · `content-pack-format.md` §11 · `test-plan.md` §9 |

The tag is a sealed object that sits in a child's bedroom and speaks with a voice the child trusts. The only thing that may change that voice is us, and the only thing that may change its settings is the bonded phone. Everything below exists to make those two sentences true.

---

## 1. Requirements this document discharges

| ID | Requirement | Where |
|---|---|---|
| CMP‑05 | No default password, no shared secret; bonding required for config | §3, and `firmware-architecture.md` §9.5/§9.6 |
| CMP‑06 | Signed firmware only; anti‑rollback | §§4, 6, 7 |
| CMP‑07 | Published support period and vulnerability disclosure contact | §11 |
| CMP‑08 | Factory reset clears all bonds and config | §3.2 |
| PRV‑18/19/20 | Bonded‑and‑encrypted GATT; buffer not consumed by a foreign peer; no per‑device identifier | `firmware-architecture.md` §9.5, §3 |
| PRV‑29 | DFU accepts only images signed by the production key, verified by the bootloader | §§4, 6 |
| PRV‑30 | Buttonless DFU entry reachable only over the bonded encrypted link | §5.1 |
| PRV‑31 | Production images enable APPROTECT; EOL verifies SWD is closed | §7.2, §10 |
| PRV‑32 | No SWD on user‑accessible pads | §7.2 (hardware, verified by teardown) |
| PRV‑33 | Monotonic version, anti‑rollback | §6 |
| PRV‑34 | Signed content packs (v1.1) | §9 |
| PRV‑58 | Signing key in an HSM under dual control; never reaches the CM, a laptop, CI logs or the repository | §8 |
| T‑18/21/22/23/37/40 | Threat model entries closed or reduced | §12 |

---

## 2. Boot chain and the root of trust

```
reset
 └─ MCUboot  (boot_partition, 48 KiB, 0x000000)
     ├─ verify slot0 image: SHA-256 + ECDSA P-256 over the image, key hash compiled in
     ├─ enforce the security counter (anti-rollback, §6)
     ├─ FPROTECT: ACL write-protect 0x000000..0x00BFFF for the rest of this boot
     ├─ lock APPROTECT (CONFIG_NRF_APPROTECT_LOCK)
     └─ jump to slot0
         └─ application
             ├─ mark the image "test" pending confirmation, if this is the first boot after an update
             ├─ bring up BLE and mount the pack
             └─ confirm the image once both succeeded (§5.3)
```

**The root of trust is MCUboot, made immutable in practice rather than by ROM.** The nRF52840 has no vendor secure‑boot ROM, so the chain is anchored by three things acting together: MCUboot's region is ACL write‑protected on every boot before any application code runs; APPROTECT is locked so SWD cannot read or write flash; and there is no code path in the application that writes below `0x00C000`. An attacker who can defeat that combination already has the device open on a bench with a decapping budget, which is outside the threat model (§12).

### 2.1 Why both slots are in internal flash

| Option | Revert on failure | Internal flash cost | Verdict |
|---|---|---|---|
| **slot0 + slot1 internal, swap‑using‑move** | **yes, automatic** | 896 KiB of 1,024 | **chosen** |
| slot0 internal, slot1 in QSPI, overwrite‑only | no | 448 KiB | rejected: a bad image is unrecoverable on a sealed device with no USB port and no exposed SWD |
| NSIB (`b0`) + upgradable MCUboot (`s0`/`s1`) + dual app slots | yes, plus an immutable first stage and a hardware monotonic counter | ≈ 128 KiB of bootloaders, app slots shrink to ≈ 412 KiB | held in reserve, §2.2 |

The application image is ≈ 300–340 KiB, so 448 KiB slots carry ≈ 25 % headroom. `storage_partition` (64 KiB) and `provision_partition` (8 KiB) take the rest. Full map in `firmware-architecture.md` §3.1.

The deciding argument is bricking. There is no port, no accessible SWD, no removable battery and no way for a parent to recover a tag that boots into a broken image. Automatic revert is worth 448 KiB of flash that nothing else needs.

### 2.2 If a notified body asks for an immutable first stage

EN 18031 asks for a verified boot chain, not specifically for immutable ROM‑anchored boot. If an assessor rejects the FPROTECT argument, the escalation is **NSIB (`b0`) + upgradable MCUboot**, which also brings a hardware monotonic counter in UICR OTP for anti‑rollback. It costs ≈ 80 KiB of extra bootloader and shrinks the app slots to ≈ 412 KiB, still comfortable. The decision needs to be taken before the first signed release ships, because moving the partition layout afterwards is a flag‑day update. Raised as an open question; the default is MCUboot alone.

---

## 3. What the bonded phone may and may not do

### 3.1 Authority model

| Actor | May | May not |
|---|---|---|
| The one bonded phone | read `Info`, write `Config`, send every `ControlOp`, receive `Event` and `Battery` notifications, transfer a pack or name clip (v1.1) | install unsigned firmware, read the bond keys, read the name clip back, learn a serial number |
| Any other phone | nothing. Every Tagalong characteristic requires an encrypted link with the bonded peer; outside the pairing window the controller's accept list refuses the connection before the host sees it | — |
| A person holding the tag | open a pairing window, mute, factory‑reset **on the charger** | read anything without the bond; extract firmware or the name clip |
| Us | ship signed firmware and signed content | read any child's data — there is no server and no telemetry (ADR‑002) |

Pairing is LE Secure Connections **Just Works**: the tag has no display and no keyboard, so authenticated pairing is impossible and MITM protection cannot be claimed. That is stated plainly rather than papered over. The residual risk is bond‑jacking during the 60 s window (threat model T‑13), mitigated by physical presence (the window only opens on a 3 s button hold), by visible confirmation on the tag (green pulse for success, red ×2 for a rejected foreign bond), and by charger‑gated factory reset as the recovery path.

There is **no default password, no PIN, no shared secret and no per‑device key** anywhere in the product (CMP‑05). The tag holds no secret that is not generated during bonding.

### 3.2 Factory reset

Two routes, identical effect (TAG‑PAIR‑05, TAG‑BTN‑04, CMP‑08, PRV‑23):

| Route | Gate |
|---|---|
| `ControlOp 0x05 A5` | bonded, encrypted link |
| Button hold 10 s **while on the charger** | the charger is the parent gate; a 10 s hold off the charger does nothing, which is what stops a determined six‑year‑old |

Clears: the bond (`bt_unpair`), the IRK, `TagConfig`, the mute deadline, the time and weekday, the event ring, the day counters and the name‑clip region. Keeps: content packs, `essentials`, the provisioning record and the capsense calibration span (it describes the bottle, not the child). The tag returns to `Unpaired` and is radio‑silent until somebody holds the button.

---

## 4. Image format and signing

| Property | Value |
|---|---|
| Container | MCUboot image with a TLV trailer |
| Hash | SHA‑256 over the image |
| Signature | **ECDSA P‑256**, `CONFIG_BOOT_SIGNATURE_TYPE_ECDSA_P256` |
| Acceleration | nRF52840 CryptoCell CC310 via nrf_oberon; verification ≈ 15 ms, invisible at boot |
| Key material in the image | the **public key hash** only, compiled into MCUboot; the full public key travels in the image TLV and is checked against the hash |
| Version | `MAJOR.MINOR.PATCH+BUILD`, surfaced as `TagInfo.fwMajor/Minor/Patch` and in the Device Information service |
| Security counter | monotonic `u32` in the image TLV, independent of the marketing version (§6) |
| Encryption | **none.** The image is not a secret; encrypting it would add a key to protect on every device and would buy nothing, since the firmware is not confidential and the tag holds no secrets worth hiding behind it |

Why ECDSA P‑256 rather than RSA‑2048 or Ed25519: CC310 accelerates P‑256 natively, the signature is 64 bytes rather than 256, and P‑256 is the algorithm HSMs and every certification lab already accept. Ed25519 would need a software implementation on this part.

---

## 5. DFU over BLE

### 5.1 Entry

DFU is entered only by `ControlOp 0x06` from the bonded phone over the encrypted link (PRV‑30). There is no button gesture for DFU, no unauthenticated "buttonless DFU" service and no DFU advertising mode.

```
on Control 0x06 (bonded, encrypted):
    if battery < 40 %            -> reject with 0x80   # a failed update on a flat cell is a support ticket
    if charging                  -> allowed regardless of level
    stop the engine, silence the amp, disable sensor interrupts
    bt_gatt_service_register(smp_svc)      # MCUmgr SMP over BLE, appears only now
    LED: blue slow blink (TAG-LED-16), no speech
    state = DFU, watchdog channel re-registered with a 60 s window
```

The SMP service is registered dynamically and unregistered on reboot, so a tag that is not updating does not advertise a firmware‑update surface at all. Its transport is permission‑gated regardless (`CONFIG_MCUMGR_TRANSPORT_BT_PERM_RW_ENCRYPT=y`, `CONFIG_MCUMGR_TRANSPORT_BT_AUTHEN=y`), so even if a future refactor made it static, an unbonded peer could not use it.

| Kconfig | Value |
|---|---|
| `CONFIG_MCUMGR` | y |
| `CONFIG_MCUMGR_TRANSPORT_BT` | y |
| `CONFIG_MCUMGR_TRANSPORT_BT_PERM_RW_ENCRYPT` | y |
| `CONFIG_MCUMGR_TRANSPORT_BT_AUTHEN` | y |
| `CONFIG_MCUMGR_GRP_IMG` | y |
| `CONFIG_MCUMGR_GRP_OS` | y (reset only) |
| `CONFIG_MCUMGR_GRP_FS`, `..._SHELL`, `..._STAT` | **n** — no file, shell or statistics access over the air |
| `CONFIG_BOOT_UPGRADE_ONLY` | n (swap‑using‑move, so revert works) |
| `CONFIG_MCUBOOT_DOWNGRADE_PREVENTION` | y |
| `CONFIG_BOOT_VALIDATE_SLOT0` | y (verify on every boot, not just after an update) |

### 5.2 Transfer and verification

```
app                              tag / MCUboot
 |-- image upload (SMP, chunked) --> slot1, written as it arrives
 |<-- progress ---------------------|
 |-- image confirm? no: TEST ------>| MCUboot marks slot1 "test"
 |-- os reset --------------------->|
                                    MCUboot: SHA-256 + ECDSA verify slot1
                                            security counter >= stored?
                                            swap slot0 <-> slot1 (move)
                                            boot slot0 (the new image)
```

The image is verified **by the bootloader**, not by the application, so a compromised static host that swapped the published image achieves nothing (threat model T‑37). The app fetches the signed image same‑origin (decision A‑06) and a modified file simply fails verification.

Rejection reasons, all surfaced to the app as SMP errors: bad magic, hash mismatch, signature invalid, security counter older than stored, image larger than the slot, slot write failure.

### 5.3 Confirm and automatic revert

The new image boots as **test**. It confirms itself only after both of these succeed:

1. BLE is up and the GATT table is registered.
2. The content pack mounted (or `essentials` mounted and `FAULT_PACK` was already set before the update).

If either fails, or the image crashes, or the watchdog fires, the image is never confirmed and **MCUboot reverts to the previous image on the next boot**. A boot loop therefore costs one power cycle, not a dead tag. `test-plan.md` §9 includes a deliberately broken image as a release gate.

The app should also confirm from its side — reconnect, read `Info`, check the version, and only then tell the parent the update worked. Both confirmations are useful: the tag's proves it runs, the app's proves it is still reachable.

### 5.4 What DFU may not touch

| Region | Protected how |
|---|---|
| `boot_partition` | ACL write‑protected at every boot; no application write path |
| `provision_partition` | write‑once at the factory; the application treats it as read‑only, MCUboot writes only the security counter word |
| `pack_primary`, `essentials` | not in any firmware image; content changes go through PackXfer (§9), never through SMP |
| `name_clip_*` | a firmware update never reads, copies or erases it. It survives DFU and is erased only by a factory reset or an explicit delete from the app. |

---

## 6. Anti‑rollback

Two independent mechanisms, because version comparison alone is only as strong as the flash write protection.

| Mechanism | What it stops |
|---|---|
| **Version comparison** — `CONFIG_MCUBOOT_DOWNGRADE_PREVENTION`: an image whose semantic version is not greater than the running image is refused | an attacker with a bonded phone replaying an older signed release to reintroduce a fixed vulnerability (threat model T‑22) |
| **Security counter** — a monotonic `u32` in the image TLV, compared against a counter word in `provision_partition` that only MCUboot writes, and only upwards | a downgrade across a version‑numbering change, and a downgrade attempted after an attacker has manipulated the image header |

The security counter is bumped **only** when a release fixes a security issue, so routine releases do not burn counter values and a customer on an old build can still receive an ordinary update. The counter's current value is part of the release manifest and is reviewed at the release gate; bumping it is a deliberate, recorded act.

The counter word lives in `provision_partition` rather than UICR OTP because UICR can only be erased by a full chip erase, which APPROTECT prevents, but which also means a factory rework would lose it. If the NSIB escalation in §2.2 is taken, the counter moves to the hardware OTP counter and this paragraph is superseded.

---

## 7. Hardening

### 7.1 Flash protection

| Region | Mechanism |
|---|---|
| MCUboot | `CONFIG_FPROTECT=y` — ACL write‑protects `0x000000..0x00BFFF` before the application starts. Re‑applied every boot; ACL cannot be cleared without a reset. |
| `slot0` | not self‑protected: MCUboot has to write it during a swap. Protected instead by the signature check on every boot (`CONFIG_BOOT_VALIDATE_SLOT0=y`), so a modified slot0 fails to boot rather than running. |
| `provision_partition` | application writes rejected by a compile‑time guard and a runtime offset check; the only writer is the factory image and MCUboot's counter word |

### 7.2 Debug and readback

| Control | Setting |
|---|---|
| APPROTECT | `CONFIG_NRF_APPROTECT_LOCK=y` — locked by MCUboot on every boot. On nRF52840 revision 3 hardware this closes the access port until a full erase, which is itself blocked. |
| Factory flashing window | APPROTECT is enabled as the **last** programming step at EOL (§10 step 9), after all flashing and all tests |
| EOL verification | a finished unit must fail an SWD ID‑code read. Any unit whose debug port answers is scrapped, not reworked (PRV‑31). |
| SWD pads | internal test points only, under the ultrasonic weld and the overmould; no user‑accessible pads (PRV‑32). Verified by teardown at PVT. |
| UART / RTT / shell | absent from the production build (`firmware-architecture.md` §13) |
| Coredump | `CONFIG_DEBUG_COREDUMP=n`. A dump would contain decoded audio buffers and, from v1.1, the name clip. |

### 7.3 Attack surface inventory

| Surface | Exposure |
|---|---|
| BLE GATT | 6 characteristics, all bonded‑and‑encrypted, all fixed‑length except PackXfer, all validated by `tagalong_protocol.c` before any state changes |
| BLE SMP (DFU) | registered only in DFU mode, encrypted, authenticated transport, image group and reset only |
| Advertising | 29 bytes, no per‑device field (PRV‑25) |
| Button | 4 gestures, one of them charger‑gated |
| Charger pads | power only, no data. Reverse‑polarity and short‑circuit are release‑gating tests (PRV‑40) |
| QSPI flash | content only, no secrets, no code |
| SWD | closed |
| Microphone, camera, location | **do not exist** (ADR‑004, ADR‑007) |

The most valuable thing an attacker can take from a stolen tag is up to 64 buffered event frames — "something moved at uptime 41,203 s" — and no identity to attach them to. That is the design working as intended (threat model §7.5, residual R‑4).

---

## 8. Key management

### 8.1 Hierarchy

| Key | Algorithm | Lives | Signs |
|---|---|---|---|
| **Firmware signing key** | ECDSA P‑256 | HSM, dual control | application images |
| **Content signing key** | ECDSA P‑256 | same HSM, separate key slot | content packs and threshold tables (v1.1, §9) |
| Bond keys (LTK, IRK) | generated per bond | tag NVM and the phone's Bluetooth stack | nothing; they are link keys |

Firmware and content are separate keys so that a content‑publishing compromise cannot ship code, and so content signing can be delegated to the content team's release process later without touching the firmware key. Neither key exists on any tag — tags hold **public key hashes only**.

### 8.2 Custody (PRV‑58)

- The private keys live in an **HSM** (cloud HSM or a pair of hardware tokens; either is acceptable, and the choice is recorded in the key ceremony record). They are generated in the HSM and have never existed outside it.
- **Dual control**: two named holders must both authorise a signing operation. Neither can sign alone.
- The keys never reach a laptop, CI, a build log, the repository or the CM. The CM receives **signed artefacts only**, under a transfer record.
- Access is reviewed quarterly against a written list, and the review is evidenced.

### 8.3 Signing in the build

CI builds the unsigned image and computes the payload digest; the HSM signs the digest; CI attaches the detached signature. The key is never present in CI.

```
west build -b tagalong_tag_nrf52840 -- -DCONFIG_...        # unsigned
imgtool sign --sig-out build/app.sig.req ...               # emit the digest to sign
hsm-sign --slot tagalong-fw --require-two-approvers \
         --in build/app.sig.req --out build/app.sig        # HSM, dual control
imgtool sign --fix-sig build/app.sig \
             --fix-sig-pubkey keys/tagalong-fw.pub ...     # attach
sha256sum build/app.signed.bin >> release-manifest.txt     # published (PRV-49)
```

The release manifest records: semantic version, security counter, `west.yml` revision, toolchain SHA, content pack id and version, the image SHA‑256, and the two approvers. It is published so anyone can verify the image the app serves is the image we built.

### 8.4 Rotation and compromise

| Scenario | Response |
|---|---|
| Scheduled rotation | Not automatic. MCUboot can hold **two** valid key hashes, so a rotation ships as: release N accepts old+new, wait for fleet adoption, release N+1 accepts new only. Planned for year 3, before the P‑256 key has signed more than a handful of releases. |
| Suspected firmware‑key compromise | Written before the first signed release, not after: revoke at the HSM; generate a new key; ship a release signed by the **old** key that accepts only the **new** key hash; bump the security counter; disclose per §11. Tags that never take that release keep accepting the old key — an unavoidable consequence of a mutable bootloader, and the reason §2.2 exists. |
| Content‑key compromise | Rotate the content key in a firmware release; refuse packs signed by the old key; re‑sign and re‑publish the packs. No tag is bricked, because content is verified before commit and the previous pack stays valid. |
| Lost HSM access | Two holders, two regions, documented recovery. A key we cannot use is as bad as a key somebody else can. |

---

## 9. Content‑pack authenticity (v1.1)

`content-pack-format.md` §11 specifies CRC32 over the transfer. **CRC32 is integrity, not authenticity** — the threat model raises this as T‑23 with PRV‑34, and the mitigation is here:

| Payload | Verification before commit |
|---|---|
| `KIND_PACK_FULL`, `KIND_PACK_DELTA` | ECDSA P‑256 signature over `SHA-256(pack header ‖ content)` with the **content signing key**, plus the CRC32 for transport integrity. Either check failing aborts the session and leaves the current pack untouched. |
| `KIND_NAME_CLIP` | length, sample rate, codec and CRC32 only. It is **not signed**: it comes from the parent's own phone over a bonded link, it is audio of their own child's name, and requiring us to sign it would mean the clip travelling through our infrastructure — the opposite of ADR‑002. |

Threshold‑table changes ride inside a signed pack, so tuning cannot be injected separately. A pack whose signature fails is not stored, not partially applied, and not retried automatically.

---

## 10. Factory provisioning

What the contract manufacturer receives, what it never receives, and the order of operations. `compliance-and-test-plan.md` §3.4 owns the electrical pass/fail criteria; this is the security and firmware sequence.

### 10.1 What the CM gets

| Gets | Never gets |
|---|---|
| The signed MCUboot + application binary, with its SHA‑256 | any private key |
| A pre‑programmed QSPI flash part, content already written (§10.3) | the ability to sign anything |
| The factory test image (also signed) and the EOL test script | customer data of any kind — there is none |
| A serial‑number range and the label format | a per‑device secret to inject — there isn't one |

Because the tag holds no per‑device secret, provisioning writes **only non‑confidential data**. That removes the entire class of "the factory leaked the device keys" risk (threat model T‑40/T‑42) rather than mitigating it.

### 10.2 Sequence, per unit

| Step | Action | Security note |
|---|---|---|
| 1 | Flash MCUboot + signed application over SWD | image SHA‑256 verified against the manifest by the jig |
| 2 | Boot; read back firmware and hardware revision | proves the image runs |
| 3 | Verify the pre‑programmed content pack: header CRC, index CRC, **`audio_crc32` over the full 13 MB**, and the pack signature | the one place the full audio CRC is checked |
| 4 | Sensor self‑tests: accelerometer, ALS under a fixed lamp, capsense baseline window | catches a cracked flex tail |
| 5 | **Sleep current ≤ 25 µA with the amp asserted off** | catches the bug class that turns 50 days into 2 |
| 6 | SPL at 1 kHz, 73–77 dB(A) @ 25 cm in an anechoic fixture | derives the per‑unit SPL ceiling |
| 7 | BLE TX power and frequency check; confirm advertising carries no serial | PRV‑20 verified on the line, not just in review |
| 8 | Charge current 110–130 mA; button and LED check | |
| 9 | Write `provision_partition`: serial, hw rev, **SPL ceiling**, sensor trims, security counter = release value. Then **enable APPROTECT**. Then verify SWD is closed. | order matters: APPROTECT last, verification after it |
| 10 | Set ship mode; print and apply the label | tag leaves at ≈ 2 µA |

Any failure scraps the unit. Sealed units are not reworked, which is why steps 5 and 6 sit before final assembly in the line layout.

### 10.3 Pre‑programmed content flash

The v1 EN pack is 13.5 MB. Writing it per unit on the line at QSPI speeds would add tens of seconds to a 45 s test cycle, and the tag has no USB port to stream it through. So the **QSPI parts are programmed by the distributor or on a gang programmer before SMT**, and the line verifies rather than writes (step 3).

This is safe because content is not secret: the risk is authenticity, not confidentiality, and step 3's signature check closes it. A part programmed with the wrong or a tampered pack fails at EOL.

`essentials` is written in the same pre‑programming pass, from the same image, so it is verified by the same CRC.

### 10.4 Counterfeits

The tag exposes no serial over GATT or on air (PRV‑20), so we cannot authenticate a tag remotely and deliberately do not try. Counterfeit mitigation is commercial: serialised tray labels, firmware provenance in the release manifest, and brand enforcement (threat model PRV‑53/54). A counterfeit tag with an uncertified cell is a safety problem we address through the supply chain, not through cryptography a counterfeiter would simply omit.

---

## 11. Disclosure, support window and ongoing obligations

| Obligation | Commitment |
|---|---|
| **Support period** (PSTI, CMP‑07) | **5 years from the last ship date**, published on the website and printed on the in‑box card |
| **Vulnerability disclosure** | a published contact and policy, a 90‑day coordinated‑disclosure default, and an acknowledgement within 5 working days. Live before the first unit ships, not after the first report. |
| **CRA reporting** | actively exploited vulnerabilities reported to ENISA within the CRA windows |
| **Changelog** | every signed release published with its version, security counter and image hash |
| **Technical file** | retained 10 years after the last unit ships, including this document, the key ceremony record and the DFU test evidence |
| **No silent updates** | a tag is never updated without the parent tapping Update in the app. There is no server, so there is no mechanism for a silent update even if we wanted one. |

---

## 12. Threat‑model coverage

| Threat | Firmware control | Residual |
|---|---|---|
| T‑11 unbonded peer subscribes to `Event` | every Tagalong characteristic bonded‑and‑encrypted; accept‑list filtering outside the pairing window | low |
| T‑12 unbonded peer reads `Info` | as above; no serial characteristic | low |
| T‑13 bond‑jacking in the 60 s window | physical 3 s hold to open it; one bond only; visible green/red feedback; charger‑gated reset as recovery | low — accepted, Just Works has no better answer without a display |
| T‑18 `Control 0x06` from a non‑bonded peer | encrypted bonded write only; SMP service not registered until then; signed images regardless | low |
| T‑21 SWD readout | APPROTECT locked at every boot, verified at EOL, no user‑accessible pads | low |
| T‑22 unsigned or downgraded firmware | ECDSA P‑256 verified by the bootloader on every boot; version comparison **and** security counter | low |
| T‑23 PackXfer accepts any audio | signed packs with a separate content key (§9) | low from v1.1; not applicable in v1.0 |
| T‑37 published image swapped on the host | the tag verifies the signature — host compromise is not sufficient | low |
| T‑40 signing key handed to the CM | the CM receives signed artefacts only; keys never leave the HSM; dual control | low |
| T‑42 factory logs correlate devices to customers | provisioning writes no customer data; serials are never exposed on air or over GATT | low |

---

## 13. Assumptions recorded here

1. **MCUboot alone is the root of trust**, made immutable by FPROTECT/ACL plus APPROTECT, with NSIB held as a documented escalation (§2.2). Simpler, and it keeps 448 KiB app slots.
2. **Both slots are internal** so a bad image reverts automatically; the QSPI region previously earmarked for DFU staging is reassigned to PackXfer.
3. **Images are signed but not encrypted.** The firmware is not confidential and the tag holds no secret to hide behind encryption.
4. **The security counter lives in `provision_partition`**, not UICR OTP, and moves to OTP only if NSIB is adopted.
5. **QSPI parts are pre‑programmed with content before assembly** and verified at EOL, rather than written on the line.
6. **The name clip is not signed** — it is the parent's own recording, and requiring a signature would require it to pass through us.
7. **DFU requires ≥ 40 % battery or a charger.** Not in any upstream document; it exists because an update that dies at 80 % on a flat cell is a support ticket and, on a sealed device, potentially an RMA.
8. **The tag holds no per‑device secret**, which is what makes factory provisioning a non‑confidential operation.
