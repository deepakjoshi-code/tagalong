import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { clear as idbClear, del as idbDel, get as idbGet, set as idbSet } from 'idb-keyval'
import { newId } from '@/lib/id'
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

/** IndexedDB-backed storage so blobs and larger logs survive; nothing ever leaves the device. */
const idbStorage: StateStorage = {
  getItem: async (name) => (await idbGet<string>(name)) ?? null,
  setItem: async (name, value) => {
    await idbSet(name, value)
  },
  removeItem: async (name) => {
    await idbDel(name)
  },
}

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
  setHydrated: (v: boolean) => void
}

const initialData: StoreData = { kids: [], tags: [], events: [], settings: DEFAULT_SETTINGS }

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...initialData,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),

      addKid: (input) => {
        const kid: Kid = KidSchema.parse({ ...input, id: newId(), createdAt: Date.now() })
        set((s) => ({ kids: [...s.kids, kid] }))
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
        return tag
      },
      updateTag: (id, patch) =>
        set((s) => ({
          tags: s.tags.map((t) => (t.id === id ? TagSchema.parse({ ...t, ...patch, id }) : t)),
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
        const event = TagEventSchema.parse({ id: newId(), tagId, type, at, intensity })
        const cutoff = at - s.settings.retentionDays * DAY_MS
        set({ events: [...s.events.filter((e) => e.at >= cutoff), event] })
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
        await idbClear()
      },
    }),
    {
      name: STORE_KEY,
      version: 1,
      storage: createJSONStorage(() => idbStorage),
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
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
        state?.pruneEvents()
      },
    },
  ),
)

export const useHydrated = () => useStore((s) => s.hydrated)
export const useSettings = () => useStore((s) => s.settings)
