import type { AgeBand, Personality } from './types'

export interface PersonalityMeta {
  label: string
  blurb: string
  /** One sample line per band for pickers/previews. */
  sample: Record<AgeBand, string>
  /** speechSynthesis tuning for in-app previews */
  speech: { rate: number; pitch: number }
  icon: 'party' | 'heart' | 'zap'
}

export const PERSONALITY_META: Record<Personality, PersonalityMeta> = {
  silly: {
    label: 'Silly',
    blurb: 'Goofball. Sound effects. Puns.',
    sample: {
      little: 'Glug glug! I’m full! Wheee!',
      kid: 'Full tank, amigo! Blast off!',
      big: 'Hydration: complete. Autographs later.',
    },
    speech: { rate: 1.08, pitch: 1.25 },
    icon: 'party',
  },
  sweet: {
    label: 'Sweet',
    blurb: 'Warm, cosy, always cheering you on.',
    sample: {
      little: 'All full. Thank you, friend.',
      kid: 'Filled up with love. Thanks, {{name}}!',
      big: 'Refilled. You take good care of me.',
    },
    speech: { rate: 0.95, pitch: 1.1 },
    icon: 'heart',
  },
  brave: {
    label: 'Brave',
    blurb: 'Adventurer. Hero. Hype squad of one.',
    sample: {
      little: 'Water power! Let’s go!',
      kid: 'Fuel loaded. Adventure awaits, captain!',
      big: 'Tank full. Mission: conquer today.',
    },
    speech: { rate: 1.0, pitch: 0.9 },
    icon: 'zap',
  },
}
