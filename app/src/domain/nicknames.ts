import { THING_META } from './things'
import type { Personality, ThingType } from './types'

/** Default nickname for a new tag. Personality nudges the pick a little. */
export function suggestNickname(thing: ThingType, personality: Personality): string {
  const list = THING_META[thing].nicknames
  const idx = personality === 'silly' ? 0 : personality === 'sweet' ? Math.min(1, list.length - 1) : 0
  return list[idx] ?? list[0] ?? 'Tagalong'
}

export function nicknameOptions(thing: ThingType): readonly string[] {
  return THING_META[thing].nicknames
}
