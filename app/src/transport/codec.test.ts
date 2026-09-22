import { describe, expect, it } from 'vitest'
import {
  CONFIG_LENGTH,
  decodeConfig,
  decodeEvent,
  decodeInfo,
  encodeConfig,
  encodeControl,
  encodeEvent,
  encodeInfo,
} from './codec'
import type { TagConfig, TagEventFrame, TagInfoFrame } from './types'

const cfg: TagConfig = {
  version: 1,
  ageBand: 'kid',
  thing: 'bottle',
  personality: 'brave',
  volume: 70,
  quiet: { enabled: true, startMin: 20 * 60, endMin: 7 * 60 },
  language: 'en',
  flags: { nudges: false, eventBuffer: true, nameClipPresent: false, led: true },
  maxPerHour: 12,
  timeOfDayMin: 9 * 60 + 5,
}

describe('TagConfig codec', () => {
  it('encodes to 13 bytes matching the protocol layout', () => {
    const b = encodeConfig(cfg)
    expect(b.length).toBe(CONFIG_LENGTH)
    expect([...b.slice(0, 10)]).toEqual([1, 1, 0, 2, 70, 120, 42, 0, 0b1010, 12])
    expect(b[10]! | (b[11]! << 8)).toBe(545)
  })
  it('round-trips', () => {
    expect(decodeConfig(encodeConfig(cfg))).toEqual(cfg)
  })
  it('encodes disabled quiet hours as 255/255 and decodes them back', () => {
    const off = { ...cfg, quiet: { enabled: false, startMin: 0, endMin: 0 } }
    const b = encodeConfig(off)
    expect(b[5]).toBe(255)
    expect(b[6]).toBe(255)
    expect(decodeConfig(b).quiet.enabled).toBe(false)
  })
  it('rejects a bad checksum', () => {
    const b = encodeConfig(cfg)
    b[4] = 10
    expect(() => decodeConfig(b)).toThrowError(/checksum/i)
  })
  it('maps "other" to 255', () => {
    expect(encodeConfig({ ...cfg, thing: 'other' })[2]).toBe(255)
    expect(decodeConfig(encodeConfig({ ...cfg, thing: 'other' })).thing).toBe('other')
  })
})

describe('Event/Info codec', () => {
  it('round-trips an event frame', () => {
    const f: TagEventFrame = { version: 1, type: 'brush_done', uptimeSec: 123456, battery: 64, aux: 60 }
    const b = encodeEvent(f)
    expect(b[1]).toBe(65)
    expect(decodeEvent(b)).toEqual(f)
  })
  it('round-trips an info frame', () => {
    const i: TagInfoFrame = {
      fw: { major: 1, minor: 2, patch: 3 },
      hwRev: 1,
      packId: 1,
      packVersion: 7,
      battery: 88,
      uptimeMin: 4000,
      charging: true,
      muted: false,
      nameClipPresent: true,
    }
    expect(decodeInfo(encodeInfo(i))).toEqual(i)
  })
  it('rejects unknown event codes', () => {
    const b = Uint8Array.of(1, 200, 0, 0, 0, 0, 50, 0)
    expect(() => decodeEvent(b)).toThrow()
  })
})

describe('Control ops', () => {
  it('matches the protocol table', () => {
    expect([...encodeControl({ op: 'identify' })]).toEqual([0x01])
    expect([...encodeControl({ op: 'preview', event: 'filled' })]).toEqual([0x02, 16])
    expect([...encodeControl({ op: 'mute', minutes: 60 })]).toEqual([0x03, 60, 0])
    expect([...encodeControl({ op: 'setTime', minutes: 1439 })]).toEqual([0x04, 0x9f, 0x05])
    expect([...encodeControl({ op: 'factoryReset' })]).toEqual([0x05, 0xa5])
    expect([...encodeControl({ op: 'enterDfu' })]).toEqual([0x06])
  })
})
