import { z } from 'zod'
import { THING_META } from '@/domain/things'
import type { AgeBand, Personality, TagEventType, ThingType } from '@/domain/types'

/**
 * Phrase catalog. Packs live in tagalong/content/packs/*.json (shared with the firmware
 * content build) and are bundled at build time. Nothing is fetched at runtime.
 */
const Lines = z.array(z.string().min(1)).min(1)
const Cell = z.object({ silly: Lines, sweet: Lines, brave: Lines })
const BandCell = z.object({ little: Cell, kid: Cell, big: Cell })
const EventMap = z.record(z.string(), BandCell)
export const PackSchema = z.object({
  thing: z.string(),
  language: z.string(),
  version: z.number(),
  events: EventMap,
  // generic pack: optional per-thing flavour sections
  shoes: EventMap.optional(),
  plush: EventMap.optional(),
  helmet: EventMap.optional(),
  jacket: EventMap.optional(),
})
export type Pack = z.infer<typeof PackSchema>

const raw = import.meta.glob('../../../content/packs/*.json', { eager: true, import: 'default' }) as Record<
  string,
  unknown
>

const packs = new Map<string, Pack>()
for (const [path, value] of Object.entries(raw)) {
  const parsed = PackSchema.safeParse(value)
  if (parsed.success) packs.set(parsed.data.thing, parsed.data)
  else if (import.meta.env.DEV) console.warn(`Invalid content pack at ${path}`)
}

export const loadedPacks = (): readonly string[] => [...packs.keys()]

type FlavourKey = 'shoes' | 'plush' | 'helmet' | 'jacket'
const isFlavourKey = (t: ThingType): t is FlavourKey =>
  t === 'shoes' || t === 'plush' || t === 'helmet' || t === 'jacket'

/** Lines for a cell, falling back to the generic pack (and its per-thing flavour) when needed. */
export function getLines(thing: ThingType, event: TagEventType, band: AgeBand, personality: Personality): string[] {
  const own = packs.get(THING_META[thing].pack)
  const fromOwn = own?.events[event]?.[band]?.[personality]
  if (fromOwn?.length) return fromOwn
  const generic = packs.get('generic')
  if (!generic) return []
  if (isFlavourKey(thing)) {
    const flavour = generic[thing]?.[event]?.[band]?.[personality]
    if (flavour?.length) return flavour
  }
  return generic.events[event]?.[band]?.[personality] ?? []
}

export const hasLines = (thing: ThingType, event: TagEventType): boolean =>
  getLines(thing, event, 'kid', 'silly').length > 0
