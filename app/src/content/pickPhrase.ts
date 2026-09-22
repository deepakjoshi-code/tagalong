import { AGE_BAND_META } from '@/domain/ageBands'
import type { AgeBand, Personality, TagEventType, ThingType } from '@/domain/types'
import { getLines } from './index'

export interface PickArgs {
  thing: ThingType
  event: TagEventType
  ageBand: AgeBand
  personality: Personality
  /** Kid's display name; when absent a band-appropriate fallback is used. */
  kidName?: string
  /** Raw lines used recently, to avoid repeats. */
  recent?: readonly string[]
  random?: () => number
}

export interface PickedPhrase {
  /** Ready to display/speak, with {{name}} resolved. */
  text: string
  /** The template line as authored. */
  raw: string
}

export function resolveName(line: string, ageBand: AgeBand, kidName?: string, random: () => number = Math.random): string {
  if (!line.includes('{{name}}')) return line
  const name = kidName?.trim()
  const fallbacks = AGE_BAND_META[ageBand].fallbackNames
  const chosen = name || fallbacks[Math.floor(random() * fallbacks.length)] || 'friend'
  return line.replaceAll('{{name}}', chosen)
}

/** Picks a line, avoiding the last few used. Returns null if the pack has nothing for this cell. */
export function pickPhrase(args: PickArgs): PickedPhrase | null {
  const random = args.random ?? Math.random
  const lines = getLines(args.thing, args.event, args.ageBand, args.personality)
  if (lines.length === 0) return null
  const recent = new Set((args.recent ?? []).slice(-3))
  const fresh = lines.filter((l) => !recent.has(l))
  const pool = fresh.length > 0 ? fresh : lines
  const raw = pool[Math.floor(random() * pool.length)] ?? pool[0]!
  return { raw, text: resolveName(raw, args.ageBand, args.kidName, random) }
}

/** Several distinct sample lines for previews. */
export function samplePhrases(args: Omit<PickArgs, 'recent'>, count = 3): PickedPhrase[] {
  const out: PickedPhrase[] = []
  const used: string[] = []
  for (let i = 0; i < count; i++) {
    const p = pickPhrase({ ...args, recent: used })
    if (!p || used.includes(p.raw)) break
    used.push(p.raw)
    out.push(p)
  }
  return out
}
