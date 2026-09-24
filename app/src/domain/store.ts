import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { clear as idbClear, del as idbDel, get as idbGet, set as idbSet } from 'idb-keyval'
import { createDebouncedPersistStorage } from '@/lib/debouncedStorage'
import { newId } from '@/lib/id'
import { requestPersistentStorage } from '@/lib/persistence'
import {
  DEFAULT_QUIET_HOURS,
  DEFAULT_SETTINGS,
  KidSchema,
  SettingsSchema,
  TagEventSchema,
  TagSchema,
  type Kid,
  type Settings,
  type Tag,
  type TagEvent,
  type TagEventType,
} from './types'

export const STORE_KEY = 'tagalong:v1'
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Hard ceiling on the event log, independent of the 7-day retention window.
 * A tag replaying a buffer, or a fault, must never be able to grow the log
 * without bound: everything here is serialised to storage on save.
 */
export const MAX_EVENTS = 2000
/**
 * How far below the ceiling a trim cuts. Trimming to exactly the ceiling would
 * re-sort on every subsequent insert; leaving headroom amortises it to one sort
 * per TRIM_HEADROOM events.
 */
const TRIM_HEADROOM = 200

/**
 * IndexedDB-backed and debounced: events arrive in bursts, so the store is
 * written once per burst, and as a structured clone rather than JSON.
 * Nothing ever leaves the device.
 */
const persistedStorage = createDebouncedPersistStorage<StoreData>({
  get: (key) => idbGet(key),
  set: async (key, value) => {
    await idbSet(key, value)
  },
  del: async (key) => {
    await idbDel(key)
  },
})

/** Writes any pending state immediately. Call before anything destructive. */
export const flushStore = () => persistedStorage.flush()

export interface StoreData {
  kids: Kid[]
  tags: Tag[]
  events: TagEvent[]
  settings: Settings
}

export type NewKid = Omit<Kid, 'id' | 'createdAt'>
export type NewTag = Omit<Tag, 'id' | 'createdAt' | 'quiet' | 'volume' | 'nudges' | 'language'> &
  Partial<Pick<Tag, 'quiet' | 'volume' | 'nudges' | 'language'>>

export interface StoreActions {
  addKid: (input: NewKid) => Kid
  updateKid: (id: string, patch: Partial<Omit<Kid, 'id'>>) => void
  /** Removes the kid and every tag (and event) that belonged to them. */
  removeKid: (id: string) => void
  addTag: (input: NewTag) => Tag
  updateTag: (id: string, patch: Partial<Omit<Tag, 'id'>>) => void
  markTagDirty: (id: string) => void
  markTagSynced: (id: string, at?: number) => void
  removeTag: (id: string) => void
  muteTag: (id: string, minutes: number) => void
  logEvent: (tagId: string, type: TagEventType, at?: number, intensity?: number) => TagEvent | undefined
  clearEvents: (tagId?: string) => void
  pruneEvents: (now?: number) => void
  updateSettings: (patch: Partial<Settings>) => void
  completeOnboarding: () => void
  /** Deletes everything on this device, including name clips. */
  wipeAll: () => Promise<void>
}

export interface StoreState extends StoreData, StoreActions {
  hydrated: boolean
  /** True when this device's storage could not be read; data lives in memory only. */
  storageError: boolean
  setHydrated: (v: boolean) => void
}

const initialData: StoreData = { kids: [], tags: [], events: [], settings: DEFAULT_SETTINGS }

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...initialData,
      hydrated: false,
      storageError: false,
      setHydrated: (v) => set({ hydrated: v }),

      addKid: (input) => {
        const kid: Kid = KidSchema.parse({ ...input, id: newId(), createdAt: Date.now() })
        set((s) => ({ kids: [...s.kids, kid] }))
        void requestPersistentStorage()
        return kid
      },
      updateKid: (id, patch) =>
        set((s) => ({
          kids: s.kids.map((k) => (k.id === id ? KidSchema.parse({ ...k, ...patch, id }) : k)),
        })),
      removeKid: (id) =>
        set((s) => {
          const tagIds = new Set(s.tags.filter((t) => t.kidId === id).map((t) => t.id))
          return {
            kids: s.kids.filter((k) => k.id !== id),
            tags: s.tags.filter((t) => !tagIds.has(t.id)),
            events: s.events.filter((e) => !tagIds.has(e.tagId)),
          }
        }),

      addTag: (input) => {
        const tag: Tag = TagSchema.parse({
          volume: 70,
          quiet: DEFAULT_QUIET_HOURS,
          nudges: false,
          language: 'en',
          ...input,
          id: newId(),
          createdAt: Date.now(),
        })
        set((s) => ({ tags: [...s.tags, tag] }))
        void requestPersistentStorage()
        return tag
      },
      updateTag: (id, patch) =>
        set((s) => ({
          tags: s.tags.map((t) => (t.id === id ? TagSchema.parse({ ...t, ...patch, id }) : t)),
        })),
      /**
       * Marks settings as changed but not yet delivered. Everything the tag acts
       * on lives in TagConfig, so any change to those fields leaves the tag
       * stale until a write succeeds.
       */
      markTagDirty: (id) =>
        set((s) => ({
          tags: s.tags.map((t) => (t.id === id ? { ...t, pendingSync: true } : t)),
        })),
      markTagSynced: (id, at = Date.now()) =>
        set((s) => ({
          tags: s.tags.map((t) =>
            t.id === id ? { ...t, pendingSync: false, lastSyncAt: at } : t,
          ),
        })),
      removeTag: (id) =>
        set((s) => ({
          tags: s.tags.filter((t) => t.id !== id),
          events: s.events.filter((e) => e.tagId !== id),
        })),
      muteTag: (id, minutes) =>
        get().updateTag(id, { mutedUntil: minutes > 0 ? Date.now() + minutes * 60_000 : undefined }),

      logEvent: (tagId, type, at = Date.now(), intensity) => {
        const s = get()
        if (!s.settings.eventLogEnabled) return undefined
        if (!s.tags.some((t) => t.id === tagId)) return undefined
        // Retention is a privacy promise, so an event that is already older than
        // the window never enters the log at all. A tag replaying a long-buffered
        // event is the realistic source of one.
        const now = Date.now()
        const cutoff = now - s.settings.retentionDays * DAY_MS
        if (at < cutoff) return undefined

        const event = TagEventSchema.parse({ id: newId(), tagId, type, at, intensity })

        // Appending is O(1). Filtering the whole log on every insert was
        // quadratic, so instead the head is checked cheaply: the array is in
        // insertion order, so if the oldest entry has not expired, none has.
        const oldest = s.events[0]
        const base = oldest && oldest.at < cutoff ? s.events.filter((e) => e.at >= cutoff) : s.events
        const next = [...base, event]
        if (next.length > MAX_EVENTS) {
          // Sort rather than slice from the end: a tag replaying its buffer can
          // deliver older events after newer ones, and dropping the newest
          // arrivals instead of the oldest would be wrong.
          next.sort((a, b) => a.at - b.at)
          next.splice(0, next.length - (MAX_EVENTS - TRIM_HEADROOM))
        }
        set({ events: next })
        return event
      },
      clearEvents: (tagId) =>
        set((s) => ({ events: tagId ? s.events.filter((e) => e.tagId !== tagId) : [] })),
      pruneEvents: (now = Date.now()) =>
        set((s) => {
          const cutoff = now - s.settings.retentionDays * DAY_MS
          const kept = s.events.filter((e) => e.at >= cutoff)
          return kept.length === s.events.length ? {} : { events: kept }
        }),

      updateSettings: (patch) =>
        set((s) => ({ settings: SettingsSchema.parse({ ...s.settings, ...patch }) })),
      completeOnboarding: () => get().updateSettings({ onboarded: true }),

      wipeAll: async () => {
        set({ ...initialData })
        // Order matters. A debounced write holding the old state must be
        // resolved before the store is cleared, or a pending value carrying a
        // child's name could land back in storage after "delete everything".
        await persistedStorage.flush()
        await idbClear()
      },
    }),
    {
      name: STORE_KEY,
      version: 1,
      storage: persistedStorage,
      partialize: (s) => ({ kids: s.kids, tags: s.tags, events: s.events, settings: s.settings }),
      merge: (persisted, current) => {
        // Validate item-by-item so one corrupt record never wipes a family's setup.
        const p = (persisted ?? {}) as Partial<StoreData>
        const kids = (p.kids ?? []).filter((k) => KidSchema.safeParse(k).success)
        const tags = (p.tags ?? []).filter((t) => TagSchema.safeParse(t).success)
        const events = (p.events ?? []).filter((e) => TagEventSchema.safeParse(e).success)
        const settings = SettingsSchema.safeParse({ ...DEFAULT_SETTINGS, ...(p.settings ?? {}) })
        return {
          ...current,
          kids,
          tags,
          events,
          settings: settings.success ? settings.data : DEFAULT_SETTINGS,
        }
      },
      onRehydrateStorage: () => (state, error) => {
        // Even when storage is blocked or corrupt we must render: the app still
        // works in memory, and the parent can see and fix it in the Privacy Center.
        if (error) useStore.setState({ hydrated: true, storageError: true })
        else {
          state?.setHydrated(true)
          state?.pruneEvents()
        }
      },
    },
  ),
)

export const useHydrated = () => useStore((s) => s.hydrated)
export const useSettings = () => useStore((s) => s.settings)
