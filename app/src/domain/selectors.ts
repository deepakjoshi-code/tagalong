import type { StoreData } from './store'
import type { Kid, Tag, TagEvent } from './types'

export const kidById = (s: StoreData, id: string): Kid | undefined => s.kids.find((k) => k.id === id)
export const tagById = (s: StoreData, id: string): Tag | undefined => s.tags.find((t) => t.id === id)
export const tagsForKid = (s: StoreData, kidId: string): Tag[] => s.tags.filter((t) => t.kidId === kidId)

export function eventsForTag(s: StoreData, tagId: string, sinceMs?: number): TagEvent[] {
  const list = s.events.filter((e) => e.tagId === tagId && (sinceMs === undefined || e.at >= sinceMs))
  return list.sort((a, b) => b.at - a.at)
}

export const lastEventForTag = (s: StoreData, tagId: string): TagEvent | undefined =>
  eventsForTag(s, tagId)[0]

export const isTagMuted = (tag: Tag, now = Date.now()): boolean =>
  tag.mutedUntil !== undefined && tag.mutedUntil > now

export function isWithinQuietHours(tag: Tag, minutesOfDay: number): boolean {
  if (!tag.quiet.enabled) return false
  const { startMin, endMin } = tag.quiet
  if (startMin === endMin) return false
  return startMin < endMin
    ? minutesOfDay >= startMin && minutesOfDay < endMin
    : minutesOfDay >= startMin || minutesOfDay < endMin
}

export interface PrivacyInventory {
  kids: number
  kidsWithNames: number
  nameClips: number
  tags: number
  events: number
  oldestEventAt?: number
}

/** What the app knows, for the Privacy Center. Everything counted here lives only on this device. */
export function privacyInventory(s: StoreData): PrivacyInventory {
  const oldest = s.events.reduce<number | undefined>(
    (min, e) => (min === undefined || e.at < min ? e.at : min),
    undefined,
  )
  return {
    kids: s.kids.length,
    kidsWithNames: s.kids.filter((k) => !!k.displayName).length,
    nameClips: s.kids.filter((k) => !!k.nameClip).length,
    tags: s.tags.length,
    events: s.events.length,
    oldestEventAt: oldest,
  }
}
