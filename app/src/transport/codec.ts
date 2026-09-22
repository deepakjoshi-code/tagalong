import { AGE_BANDS, PERSONALITIES, type AgeBand, type Personality, type ThingType } from '@/domain/types'
import { EVENT_BY_CODE, EVENT_META } from '@/domain/events'
import { TransportError } from './errors'
import type { ControlOp, TagConfig, TagEventFrame, TagInfoFrame, WireLanguage } from './types'

export const CONFIG_LENGTH = 13
export const INFO_LENGTH = 12
export const EVENT_LENGTH = 8

const THING_CODES: Record<ThingType, number> = {
  bottle: 0,
  lunchbox: 1,
  backpack: 2,
  toothbrush: 3,
  shoes: 4,
  plush: 5,
  helmet: 6,
  jacket: 7,
  other: 255,
}
const THING_BY_CODE = new Map<number, ThingType>(
  (Object.entries(THING_CODES) as [ThingType, number][]).map(([k, v]) => [v, k]),
)
const LANG_CODES: Record<WireLanguage, number> = { en: 0, es: 1, hi: 2 }
const LANG_BY_CODE = new Map<number, WireLanguage>(
  (Object.entries(LANG_CODES) as [WireLanguage, number][]).map(([k, v]) => [v, k]),
)

const QUIET_DISABLED = 255
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(n)))

function xorChecksum(bytes: Uint8Array, upto: number): number {
  let x = 0
  for (let i = 0; i < upto; i++) x ^= bytes[i] ?? 0
  return x
}

export function encodeConfig(cfg: TagConfig): Uint8Array {
  const b = new Uint8Array(CONFIG_LENGTH)
  const v = new DataView(b.buffer)
  b[0] = 1
  b[1] = AGE_BANDS.indexOf(cfg.ageBand)
  b[2] = THING_CODES[cfg.thing]
  b[3] = PERSONALITIES.indexOf(cfg.personality)
  b[4] = clamp(cfg.volume, 0, 100)
  b[5] = cfg.quiet.enabled ? clamp(cfg.quiet.startMin / 10, 0, 143) : QUIET_DISABLED
  b[6] = cfg.quiet.enabled ? clamp(cfg.quiet.endMin / 10, 0, 143) : QUIET_DISABLED
  b[7] = LANG_CODES[cfg.language]
  b[8] =
    (cfg.flags.nudges ? 1 : 0) |
    (cfg.flags.eventBuffer ? 2 : 0) |
    (cfg.flags.nameClipPresent ? 4 : 0) |
    (cfg.flags.led ? 8 : 0)
  b[9] = clamp(cfg.maxPerHour, 1, 30)
  v.setUint16(10, clamp(cfg.timeOfDayMin, 0, 1439), true)
  b[12] = xorChecksum(b, 12)
  return b
}

export function decodeConfig(data: DataView | Uint8Array): TagConfig {
  const b = data instanceof Uint8Array ? data : new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
  if (b.length < CONFIG_LENGTH) throw new TransportError('bad-frame', 'Config frame too short')
  if (b[0] !== 1) throw new TransportError('bad-frame', `Unknown config version ${b[0]}`)
  if (xorChecksum(b, 12) !== b[12]) throw new TransportError('bad-frame', 'Config checksum mismatch')
  const ageBand: AgeBand | undefined = AGE_BANDS[b[1] ?? 99]
  const personality: Personality | undefined = PERSONALITIES[b[3] ?? 99]
  const thing = THING_BY_CODE.get(b[2] ?? -1)
  const language = LANG_BY_CODE.get(b[7] ?? -1)
  if (!ageBand || !personality || !thing || !language) {
    throw new TransportError('bad-frame', 'Config frame has unknown enum values')
  }
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength)
  const flags = b[8] ?? 0
  const qs = b[5] ?? QUIET_DISABLED
  const qe = b[6] ?? QUIET_DISABLED
  const quietEnabled = qs !== QUIET_DISABLED && qe !== QUIET_DISABLED
  return {
    version: 1,
    ageBand,
    thing,
    personality,
    volume: b[4] ?? 0,
    quiet: { enabled: quietEnabled, startMin: quietEnabled ? qs * 10 : 0, endMin: quietEnabled ? qe * 10 : 0 },
    language,
    flags: {
      nudges: !!(flags & 1),
      eventBuffer: !!(flags & 2),
      nameClipPresent: !!(flags & 4),
      led: !!(flags & 8),
    },
    maxPerHour: b[9] ?? 12,
    timeOfDayMin: v.getUint16(10, true),
  }
}

export function decodeInfo(data: DataView | Uint8Array): TagInfoFrame {
  const b = data instanceof Uint8Array ? data : new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
  if (b.length < INFO_LENGTH) throw new TransportError('bad-frame', 'Info frame too short')
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength)
  const flags = b[11] ?? 0
  return {
    fw: { major: b[0] ?? 0, minor: b[1] ?? 0, patch: b[2] ?? 0 },
    hwRev: b[3] ?? 0,
    packId: v.getUint16(4, true),
    packVersion: v.getUint16(6, true),
    battery: Math.min(100, b[8] ?? 0),
    uptimeMin: v.getUint16(9, true),
    charging: !!(flags & 1),
    muted: !!(flags & 2),
    nameClipPresent: !!(flags & 4),
  }
}

export function encodeInfo(info: TagInfoFrame): Uint8Array {
  const b = new Uint8Array(INFO_LENGTH)
  const v = new DataView(b.buffer)
  b[0] = info.fw.major
  b[1] = info.fw.minor
  b[2] = info.fw.patch
  b[3] = info.hwRev
  v.setUint16(4, info.packId, true)
  v.setUint16(6, info.packVersion, true)
  b[8] = clamp(info.battery, 0, 100)
  v.setUint16(9, clamp(info.uptimeMin, 0, 65535), true)
  b[11] = (info.charging ? 1 : 0) | (info.muted ? 2 : 0) | (info.nameClipPresent ? 4 : 0)
  return b
}

export function decodeEvent(data: DataView | Uint8Array): TagEventFrame {
  const b = data instanceof Uint8Array ? data : new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
  if (b.length < EVENT_LENGTH) throw new TransportError('bad-frame', 'Event frame too short')
  if (b[0] !== 1) throw new TransportError('bad-frame', `Unknown event version ${b[0]}`)
  const type = EVENT_BY_CODE.get(b[1] ?? -1)
  if (!type) throw new TransportError('bad-frame', `Unknown event code ${b[1]}`)
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength)
  return { version: 1, type, uptimeSec: v.getUint32(2, true), battery: Math.min(100, b[6] ?? 0), aux: b[7] ?? 0 }
}

export function encodeEvent(frame: TagEventFrame): Uint8Array {
  const b = new Uint8Array(EVENT_LENGTH)
  const v = new DataView(b.buffer)
  b[0] = 1
  b[1] = EVENT_META[frame.type].code
  v.setUint32(2, frame.uptimeSec >>> 0, true)
  b[6] = clamp(frame.battery, 0, 100)
  b[7] = clamp(frame.aux, 0, 255)
  return b
}

export function encodeControl(op: ControlOp): Uint8Array {
  switch (op.op) {
    case 'identify':
      return Uint8Array.of(0x01)
    case 'preview':
      return Uint8Array.of(0x02, EVENT_META[op.event].code)
    case 'mute': {
      const b = new Uint8Array(3)
      b[0] = 0x03
      new DataView(b.buffer).setUint16(1, clamp(op.minutes, 0, 65535), true)
      return b
    }
    case 'setTime': {
      const b = new Uint8Array(3)
      b[0] = 0x04
      new DataView(b.buffer).setUint16(1, clamp(op.minutes, 0, 1439), true)
      return b
    }
    case 'factoryReset':
      return Uint8Array.of(0x05, 0xa5)
    case 'enterDfu':
      return Uint8Array.of(0x06)
  }
}

export const formatFirmware = (fw: TagInfoFrame['fw']): string => `${fw.major}.${fw.minor}.${fw.patch}`
