// @vitest-environment node
/**
 * Cross-language codec parity.
 *
 * The tag's firmware (C, in tagalong/firmware) and this app both implement
 * docs/protocol/tag-protocol.md. If they disagree by one byte, pairing breaks in
 * the field and it looks like broken hardware. This compiles the firmware's
 * vector dumper and checks every frame against the TypeScript encoders.
 *
 * Skips cleanly where there is no C compiler, so it never blocks a front-end dev.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import { encodeConfig, encodeControl, encodeEvent, encodeInfo } from './codec'
import type { TagConfig } from './types'

const here = dirname(fileURLToPath(import.meta.url))
const firmware = resolve(here, '../../../firmware')

function hasCompiler(): boolean {
  try {
    execFileSync('gcc', ['--version'], { stdio: 'ignore' })
    return existsSync(join(firmware, 'tests', 'dump_vectors.c'))
  } catch {
    return false
  }
}

const enabled = hasCompiler()
let work: string | null = null

function firmwareVectors(): Record<string, Record<string, number[]>> {
  work = mkdtempSync(join(tmpdir(), 'tagalong-parity-'))
  const bin = join(work, 'dump_vectors')
  execFileSync('gcc', [
    '-std=c99', '-Wall', '-Wextra', '-Werror',
    '-I', join(firmware, 'include'),
    '-I', join(firmware, 'tests'),
    join(firmware, 'src', 'tagalong_protocol.c'),
    join(firmware, 'tests', 'dump_vectors.c'),
    '-o', bin,
  ])
  return JSON.parse(execFileSync(bin, { encoding: 'utf8' }))
}

afterAll(() => {
  if (work) rmSync(work, { recursive: true, force: true })
})

const cfg = (over: Partial<TagConfig> = {}): TagConfig => ({
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
  ...over,
})

const appVectors = (): Record<string, Record<string, number[]>> => ({
  config: {
    kid_bottle_brave: [...encodeConfig(cfg())],
    little_toothbrush_sweet_no_quiet: [
      ...encodeConfig(
        cfg({
          ageBand: 'little',
          thing: 'toothbrush',
          personality: 'sweet',
          volume: 100,
          quiet: { enabled: false, startMin: 0, endMin: 0 },
          flags: { nudges: true, eventBuffer: false, nameClipPresent: true, led: false },
          maxPerHour: 30,
          timeOfDayMin: 0,
        }),
      ),
    ],
    big_other_silly_edges: [
      ...encodeConfig(
        cfg({
          ageBand: 'big',
          thing: 'other',
          personality: 'silly',
          volume: 0,
          quiet: { enabled: true, startMin: 0, endMin: 1430 },
          flags: { nudges: false, eventBuffer: false, nameClipPresent: false, led: false },
          maxPerHour: 1,
          timeOfDayMin: 1439,
        }),
      ),
    ],
  },
  event: {
    drop: [...encodeEvent({ version: 1, type: 'drop', uptimeSec: 42, battery: 86, aux: 35 })],
    brush_done: [...encodeEvent({ version: 1, type: 'brush_done', uptimeSec: 123456, battery: 64, aux: 60 })],
  },
  info: {
    charging: [
      ...encodeInfo({
        fw: { major: 0, minor: 9, patch: 0 },
        hwRev: 1,
        packId: 1,
        packVersion: 1,
        battery: 86,
        uptimeMin: 1234,
        charging: true,
        muted: false,
        nameClipPresent: false,
      }),
    ],
  },
  control: {
    identify: [...encodeControl({ op: 'identify' })],
    preview_filled: [...encodeControl({ op: 'preview', event: 'filled' })],
    mute_60: [...encodeControl({ op: 'mute', minutes: 60 })],
    set_time_1439: [...encodeControl({ op: 'setTime', minutes: 1439 })],
    factory_reset: [...encodeControl({ op: 'factoryReset' })],
    enter_dfu: [...encodeControl({ op: 'enterDfu' })],
  },
})

describe.skipIf(!enabled)('the app and the tag firmware encode identical frames', () => {
  it('agrees on every wire vector', () => {
    const fw = firmwareVectors()
    const app = appVectors()
    // Compare as one object so a failure prints every difference at once.
    expect(app).toEqual(fw)
  })
})
