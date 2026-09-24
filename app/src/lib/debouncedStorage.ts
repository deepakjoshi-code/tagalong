import type { PersistStorage, StorageValue } from 'zustand/middleware'

/**
 * Persistence that does its expensive work once per burst, not once per change.
 *
 * zustand's default `createJSONStorage` runs `JSON.stringify` over the whole
 * persisted slice on every single `set()`. Tag events arrive in bursts, so a
 * busy afternoon re-serialises the entire store hundreds of times: measured at
 * 3 GB of string work and 18 seconds of CPU for a 10,000-event log. On a phone
 * that is battery drain, storage churn and visible jank.
 *
 * This keeps the latest state object in memory, coalesces writes into one per
 * `delayMs`, and hands the object straight to IndexedDB, which stores it by
 * structured clone — so there is no JSON step at all. Pending state is flushed
 * when the page is hidden or unloaded, so nothing is lost if the parent
 * switches apps.
 */
export interface DebouncedPersistStorage<S> extends PersistStorage<S> {
  /** Writes any pending value immediately. Safe to call at any time. */
  flush: () => Promise<void>
  /** Writes that were coalesced away. Exposed for tests. */
  readonly coalesced: number
}

export interface RawStorage {
  get: (key: string) => Promise<unknown>
  set: (key: string, value: unknown) => Promise<void>
  del: (key: string) => Promise<void>
}

export function createDebouncedPersistStorage<S>(
  raw: RawStorage,
  delayMs = 800,
): DebouncedPersistStorage<S> {
  let pending: { name: string; value: StorageValue<S> } | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  let inFlight: Promise<void> = Promise.resolve()
  let coalesced = 0

  const writeNow = (): Promise<void> => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    const next = pending
    pending = null
    if (!next) return inFlight
    inFlight = inFlight
      .catch(() => undefined)
      .then(() => raw.set(next.name, next.value))
      .then(() => undefined)
    return inFlight
  }

  const storage: DebouncedPersistStorage<S> = {
    getItem: async (name) => {
      // A read must never see a stale value just because a write is pending.
      if (pending?.name === name) return pending.value
      const stored = await raw.get(name)
      if (stored == null) return null
      // Tolerate a value written by an older build that used JSON strings.
      if (typeof stored === 'string') {
        try {
          return JSON.parse(stored) as StorageValue<S>
        } catch {
          return null
        }
      }
      return stored as StorageValue<S>
    },
    setItem: (name, value) => {
      if (pending) coalesced++
      pending = { name, value }
      if (!timer) timer = setTimeout(() => void writeNow(), delayMs)
    },
    removeItem: async (name) => {
      if (pending?.name === name) {
        pending = null
        if (timer) {
          clearTimeout(timer)
          timer = null
        }
      }
      await raw.del(name)
    },
    flush: () => writeNow(),
    get coalesced() {
      return coalesced
    },
  }

  if (typeof document !== 'undefined') {
    // Losing the last second of an event log is survivable; losing a tag the
    // parent just added is not. Flush on every exit path the browser offers.
    const flush = () => void writeNow()
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush()
    })
    window.addEventListener('pagehide', flush)
    window.addEventListener('beforeunload', flush)
  }

  return storage
}
