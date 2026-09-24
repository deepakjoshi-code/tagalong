import { describe, expect, it, vi } from 'vitest'
import { createDebouncedPersistStorage } from './debouncedStorage'

interface Slice {
  events: number[]
}

function recordingStorage() {
  const writes: { key: string; value: unknown }[] = []
  const data = new Map<string, unknown>()
  return {
    writes,
    data,
    raw: {
      get: async (key: string) => data.get(key),
      set: async (key: string, value: unknown) => {
        writes.push({ key, value })
        data.set(key, value)
      },
      del: async (key: string) => {
        data.delete(key)
      },
    },
  }
}

describe('debounced persist storage', () => {
  it('collapses a burst of writes into one', async () => {
    vi.useFakeTimers()
    const { writes, raw } = recordingStorage()
    const d = createDebouncedPersistStorage<Slice>(raw, 800)
    for (let i = 0; i < 200; i++) d.setItem('k', { state: { events: [i] }, version: 1 })
    expect(writes).toHaveLength(0)
    await vi.advanceTimersByTimeAsync(900)
    expect(writes).toHaveLength(1)
    expect((writes[0]!.value as { state: Slice }).state.events).toEqual([199])
    expect(d.coalesced).toBe(199)
    vi.useRealTimers()
  })

  it('stores the object itself, with no JSON step', async () => {
    vi.useFakeTimers()
    const { writes, raw } = recordingStorage()
    const d = createDebouncedPersistStorage<Slice>(raw, 800)
    d.setItem('k', { state: { events: [1, 2, 3] }, version: 1 })
    await d.flush()
    expect(typeof writes[0]!.value).toBe('object')
    vi.useRealTimers()
  })

  it('reads back a value that has not been flushed yet', async () => {
    vi.useFakeTimers()
    const { raw } = recordingStorage()
    const d = createDebouncedPersistStorage<Slice>(raw, 800)
    d.setItem('k', { state: { events: [7] }, version: 1 })
    await expect(d.getItem('k')).resolves.toEqual({ state: { events: [7] }, version: 1 })
    vi.useRealTimers()
  })

  it('still reads a JSON string written by an older build', async () => {
    const { raw, data } = recordingStorage()
    data.set('k', JSON.stringify({ state: { events: [42] }, version: 1 }))
    const d = createDebouncedPersistStorage<Slice>(raw, 800)
    await expect(d.getItem('k')).resolves.toEqual({ state: { events: [42] }, version: 1 })
  })

  it('returns null rather than throwing on a corrupt legacy value', async () => {
    const { raw, data } = recordingStorage()
    data.set('k', '{not json')
    const d = createDebouncedPersistStorage<Slice>(raw, 800)
    await expect(d.getItem('k')).resolves.toBeNull()
  })

  it('removeItem drops a pending write for that key', async () => {
    vi.useFakeTimers()
    const { writes, raw } = recordingStorage()
    const d = createDebouncedPersistStorage<Slice>(raw, 800)
    d.setItem('k', { state: { events: [1] }, version: 1 })
    await d.removeItem('k')
    await vi.advanceTimersByTimeAsync(900)
    // Critical for "delete everything": nothing may land after the clear.
    expect(writes).toHaveLength(0)
    vi.useRealTimers()
  })

  it('flushing with nothing pending is harmless', async () => {
    const { writes, raw } = recordingStorage()
    const d = createDebouncedPersistStorage<Slice>(raw, 800)
    await d.flush()
    await d.flush()
    expect(writes).toHaveLength(0)
  })
})
