import { beforeEach, describe, expect, it, vi } from 'vitest'

// vi.mock is hoisted above module scope, so the backing map must be hoisted too.
const { mem } = vi.hoisted(() => ({ mem: new Map<string, unknown>() }))
vi.mock('idb-keyval', () => ({
  get: async (k: string) => mem.get(k),
  set: async (k: string, v: unknown) => void mem.set(k, v),
  del: async (k: string) => void mem.delete(k),
  clear: async () => mem.clear(),
  keys: async () => [...mem.keys()],
}))

import { useStore } from './store'
import { snapToQuietStep } from '@/lib/time'
import { decodeConfig, encodeConfig } from '@/transport/codec'
import type { TagConfig } from '@/transport/types'

describe('quiet hours survive the round trip to the tag', () => {
  // The wire format carries minutes/10, so the UI must only offer values that
  // come back unchanged. Anything else silently lies to the parent.
  const base: TagConfig = {
    version: 1,
    ageBand: 'kid',
    thing: 'bottle',
    personality: 'silly',
    volume: 70,
    quiet: { enabled: true, startMin: 0, endMin: 0 },
    language: 'en',
    flags: { nudges: false, eventBuffer: true, nameClipPresent: false, led: true },
    maxPerHour: 12,
    timeOfDayMin: 0,
  }

  it('snaps to the protocol grid', () => {
    expect(snapToQuietStep(1439)).toBe(1430) // 23:59 rounds up, then clamps to the last valid slot
    expect(snapToQuietStep(1430)).toBe(1430)
    expect(snapToQuietStep(1234)).toBe(1230)
    expect(snapToQuietStep(1235)).toBe(1240)
    expect(snapToQuietStep(-5)).toBe(0)
  })

  it('round-trips every snapped value unchanged', () => {
    for (let min = 0; min <= 1430; min += 10) {
      const cfg = { ...base, quiet: { enabled: true, startMin: min, endMin: snapToQuietStep(1430 - min) } }
      const back = decodeConfig(encodeConfig(cfg))
      expect(back.quiet.startMin).toBe(cfg.quiet.startMin)
      expect(back.quiet.endMin).toBe(cfg.quiet.endMin)
    }
  })
})

describe('store stays usable when storage fails', () => {
  beforeEach(async () => {
    await useStore.getState().wipeAll()
    useStore.setState({ storageError: false })
  })

  it('defaults to no storage error', () => {
    expect(useStore.getState().storageError).toBe(false)
  })

  it('still accepts data in memory once a storage error is flagged', () => {
    useStore.setState({ hydrated: true, storageError: true })
    const kid = useStore.getState().addKid({ ageBand: 'kid' })
    expect(useStore.getState().kids).toHaveLength(1)
    expect(kid.id).toBeTruthy()
    // The app must render rather than sit on the splash screen forever.
    expect(useStore.getState().hydrated).toBe(true)
  })
})
