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

describe('store', () => {
  beforeEach(async () => {
    await useStore.getState().wipeAll()
  })

  it('adds a kid and a tag with defaults', () => {
    const kid = useStore.getState().addKid({ ageBand: 'kid', displayName: 'Ava' })
    const tag = useStore.getState().addTag({ deviceId: 'sim-1', nickname: 'Bottle Buddy', thing: 'bottle', kidId: kid.id, personality: 'silly' })
    expect(tag.volume).toBe(70)
    expect(tag.quiet).toEqual({ enabled: true, startMin: 1200, endMin: 420 })
    expect(useStore.getState().tags).toHaveLength(1)
  })

  it('refuses an event that is already older than the retention window', () => {
    const kid = useStore.getState().addKid({ ageBand: 'little' })
    const tag = useStore.getState().addTag({ deviceId: 'sim-2', nickname: 'Splash', thing: 'bottle', kidId: kid.id, personality: 'sweet' })
    const now = Date.now()
    // A tag replaying a long-buffered event must not reopen a closed window.
    expect(useStore.getState().logEvent(tag.id, 'drop', now - 8 * 24 * 3_600_000)).toBeUndefined()
    useStore.getState().logEvent(tag.id, 'filled', now)
    expect(useStore.getState().events.map((e) => e.type)).toEqual(['filled'])
  })

  it('drops entries as they age out of the window', () => {
    const kid = useStore.getState().addKid({ ageBand: 'little' })
    const tag = useStore.getState().addTag({ deviceId: 'sim-2b', nickname: 'Splash', thing: 'bottle', kidId: kid.id, personality: 'sweet' })
    const now = Date.now()
    // Logged while still inside the window...
    useStore.getState().logEvent(tag.id, 'drop', now - 6.9 * 24 * 3_600_000)
    expect(useStore.getState().events).toHaveLength(1)
    // ...then the clock moves past its seventh day and the next write clears it.
    vi.setSystemTime(now + 0.2 * 24 * 3_600_000)
    useStore.getState().logEvent(tag.id, 'filled')
    expect(useStore.getState().events.map((e) => e.type)).toEqual(['filled'])
    vi.useRealTimers()
  })

  it('does not log when the event log is disabled', () => {
    const kid = useStore.getState().addKid({ ageBand: 'big' })
    const tag = useStore.getState().addTag({ deviceId: 'sim-3', nickname: 'Packy', thing: 'backpack', kidId: kid.id, personality: 'brave' })
    useStore.getState().updateSettings({ eventLogEnabled: false })
    expect(useStore.getState().logEvent(tag.id, 'pickup')).toBeUndefined()
  })

  it('removing a kid cascades to tags and events', () => {
    const kid = useStore.getState().addKid({ ageBand: 'kid' })
    const tag = useStore.getState().addTag({ deviceId: 'sim-4', nickname: 'Brushy', thing: 'toothbrush', kidId: kid.id, personality: 'silly' })
    useStore.getState().logEvent(tag.id, 'brush_done')
    useStore.getState().removeKid(kid.id)
    expect(useStore.getState().tags).toHaveLength(0)
    expect(useStore.getState().events).toHaveLength(0)
  })

  it('mutes and unmutes', () => {
    const kid = useStore.getState().addKid({ ageBand: 'kid' })
    const tag = useStore.getState().addTag({ deviceId: 'sim-5', nickname: 'Zip', thing: 'backpack', kidId: kid.id, personality: 'brave' })
    useStore.getState().muteTag(tag.id, 60)
    expect(useStore.getState().tags[0]?.mutedUntil).toBeGreaterThan(Date.now())
    useStore.getState().muteTag(tag.id, 0)
    expect(useStore.getState().tags[0]?.mutedUntil).toBeUndefined()
  })
})
