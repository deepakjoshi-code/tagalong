import { beforeAll, describe, expect, it, vi } from 'vitest'
import { MAX_EVENTS } from '@/domain/store'

const { mem } = vi.hoisted(() => ({ mem: new Map<string, unknown>() }))
vi.mock('idb-keyval', () => ({
  get: async (k: string) => mem.get(k),
  set: async (k: string, v: unknown) => void mem.set(k, v),
  del: async (k: string) => void mem.delete(k),
  clear: async () => mem.clear(),
  keys: async () => [...mem.keys()],
}))

import { useStore } from '@/domain/store'
import { eventsForTag, privacyInventory } from '@/domain/selectors'
import { buildExport } from '@/lib/exportData'

const KIDS = 20
const TAGS = 50
const EVENTS = 10_000

describe('scale', () => {
  const tagIds: string[] = []

  beforeAll(async () => {
    await useStore.getState().wipeAll()
    const kidIds: string[] = []
    for (let i = 0; i < KIDS; i++) {
      kidIds.push(useStore.getState().addKid({ ageBand: 'kid', displayName: `Kid ${i}` }).id)
    }
    for (let i = 0; i < TAGS; i++) {
      tagIds.push(
        useStore.getState().addTag({
          deviceId: `sim-${i}`,
          nickname: `Tag ${i}`,
          thing: 'bottle',
          kidId: kidIds[i % KIDS]!,
          personality: 'silly',
        }).id,
      )
    }
    const now = Date.now()
    for (let i = 0; i < EVENTS; i++) {
      // Inside the 7-day retention window so nothing is pruned away.
      useStore.getState().logEvent(tagIds[i % TAGS]!, 'drop', now - (i % 6) * 3600_000)
    }
  })

  it('holds the data it was given, bounded by the log ceiling', () => {
    const s = useStore.getState()
    expect(s.kids).toHaveLength(KIDS)
    expect(s.tags).toHaveLength(TAGS)
    // The log is deliberately capped: everything here is serialised on save.
    expect(s.events.length).toBeLessThanOrEqual(MAX_EVENTS)
    expect(s.events.length).toBeGreaterThan(MAX_EVENTS - 400)
  })

  it('logs an event in reasonable time at 10k events', () => {
    const t0 = performance.now()
    for (let i = 0; i < 100; i++) useStore.getState().logEvent(tagIds[0]!, 'shake')
    const perOp = (performance.now() - t0) / 100
    console.log(`logEvent at ${EVENTS} events: ${perOp.toFixed(2)} ms/op`)
    expect(perOp).toBeLessThan(20)
  })

  it('computes the home screen view in reasonable time', () => {
    const s = useStore.getState()
    const t0 = performance.now()
    const latest = new Map<string, { at: number }>()
    for (const e of s.events) {
      const cur = latest.get(e.tagId)
      if (!cur || e.at > cur.at) latest.set(e.tagId, e)
    }
    const ms = performance.now() - t0
    console.log(`home latest-event pass: ${ms.toFixed(2)} ms`)
    expect(latest.size).toBeLessThanOrEqual(TAGS)
    expect(ms).toBeLessThan(50)
  })

  it('computes one tag detail timeline in reasonable time', () => {
    const s = useStore.getState()
    const t0 = performance.now()
    const list = eventsForTag(s, tagIds[0]!)
    const ms = performance.now() - t0
    console.log(`eventsForTag: ${ms.toFixed(2)} ms for ${list.length} events`)
    expect(ms).toBeLessThan(50)
  })

  it('computes the privacy inventory in reasonable time', () => {
    const t0 = performance.now()
    const inv = privacyInventory(useStore.getState())
    const ms = performance.now() - t0
    console.log(`privacyInventory: ${ms.toFixed(2)} ms`)
    expect(inv.tags).toBe(TAGS)
    expect(ms).toBeLessThan(50)
  })

  it('exports without blowing up', () => {
    const t0 = performance.now()
    const json = JSON.stringify(buildExport(useStore.getState()))
    const ms = performance.now() - t0
    console.log(`export: ${ms.toFixed(2)} ms, ${(json.length / 1024 / 1024).toFixed(2)} MB`)
    expect(ms).toBeLessThan(2000)
  })
})
