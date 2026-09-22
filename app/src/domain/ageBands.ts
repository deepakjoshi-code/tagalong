import type { AgeBand } from './types'

export interface AgeBandMeta {
  label: string
  range: string
  blurb: string
  /** Used when a line contains {{name}} and the kid has no name set. */
  fallbackNames: readonly string[]
  minAge: number
  maxAge: number
}

export const AGE_BAND_META: Record<AgeBand, AgeBandMeta> = {
  little: {
    label: 'Little',
    range: '2–4',
    blurb: 'Short words, big giggles',
    fallbackNames: ['buddy', 'friend', 'sunshine'],
    minAge: 2,
    maxAge: 4,
  },
  kid: {
    label: 'Kid',
    range: '5–7',
    blurb: 'Jokes and sidekick energy',
    fallbackNames: ['amigo', 'champ', 'buddy'],
    minAge: 5,
    maxAge: 7,
  },
  big: {
    label: 'Big kid',
    range: '8–12',
    blurb: 'Witty, never babyish',
    fallbackNames: ['legend', 'captain', 'friend'],
    minAge: 8,
    maxAge: 12,
  },
}

export function ageBandFromAge(age: number): AgeBand {
  if (age <= 4) return 'little'
  if (age <= 7) return 'kid'
  return 'big'
}
