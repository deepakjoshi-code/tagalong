import type { TagEventType, ThingType } from './types'

export type PackKey = 'bottle' | 'lunchbox' | 'backpack' | 'toothbrush' | 'generic'

export interface ThingMeta {
  label: string
  /** CSS custom property names from tokens.css */
  tint: string
  tintSoft: string
  /** Events this thing can produce, in display order. */
  events: readonly TagEventType[]
  /** Which content pack supplies its lines. */
  pack: PackKey
  /** How the tag attaches. */
  mountHint: string
  /** Nickname suggestions, first is the default. */
  nicknames: readonly string[]
  /** Where the face sits on the ThingIcon glyph (64×64 space). */
  face: { x: number; y: number; scale: number }
}

const COMMON: readonly TagEventType[] = [
  'pickup',
  'putdown',
  'drop',
  'shake',
  'tap',
  'long_still',
  'good_morning',
  'low_battery',
  'charging',
]

export const THING_META: Record<ThingType, ThingMeta> = {
  bottle: {
    label: 'Water bottle',
    tint: 'var(--tint-bottle)',
    tintSoft: 'var(--tint-bottle-soft)',
    events: ['filled', 'sip', 'empty', ...COMMON],
    pack: 'bottle',
    mountHint: 'Strap it around the bottle, flush against the side.',
    nicknames: ['Bottle Buddy', 'Splash', 'Gulp', 'Sippy', 'Bubbles'],
    face: { x: 32, y: 40, scale: 1 },
  },
  lunchbox: {
    label: 'Lunchbox',
    tint: 'var(--tint-lunchbox)',
    tintSoft: 'var(--tint-lunchbox-soft)',
    events: ['opened', 'closed', 'packed', ...COMMON],
    pack: 'lunchbox',
    mountHint: 'Stick it inside the lid, near the latch.',
    nicknames: ['Lunch Pal', 'Munchie', 'Crunch', 'Boxy', 'Nibbles'],
    face: { x: 32, y: 38, scale: 1 },
  },
  backpack: {
    label: 'Backpack',
    tint: 'var(--tint-backpack)',
    tintSoft: 'var(--tint-backpack-soft)',
    events: ['left_behind', 'zipped', ...COMMON],
    pack: 'backpack',
    mountHint: 'Clip it to the top loop or an inside pocket.',
    nicknames: ['Packy', 'Sherpa', 'Pockets', 'Zip', 'Scout'],
    face: { x: 32, y: 34, scale: 1 },
  },
  toothbrush: {
    label: 'Toothbrush',
    tint: 'var(--tint-toothbrush)',
    tintSoft: 'var(--tint-toothbrush-soft)',
    events: ['brush_start', 'brush_done', 'brush_short', ...COMMON],
    pack: 'toothbrush',
    mountHint: 'Slide the sleeve onto the base of the handle.',
    nicknames: ['Brushy', 'Sparkle', 'Minty', 'Pearl', 'Swish'],
    face: { x: 32, y: 42, scale: 0.9 },
  },
  shoes: {
    label: 'Shoes',
    tint: 'var(--tint-shoes)',
    tintSoft: 'var(--tint-shoes-soft)',
    events: COMMON,
    pack: 'generic',
    mountHint: 'Clip it to the laces or strap.',
    nicknames: ['Zoomers', 'Kicks', 'Stompy', 'Dash'],
    face: { x: 30, y: 36, scale: 0.9 },
  },
  plush: {
    label: 'Stuffed friend',
    tint: 'var(--tint-plush)',
    tintSoft: 'var(--tint-plush-soft)',
    events: COMMON,
    pack: 'generic',
    mountHint: 'Tuck it into a pocket or clip it to a tag loop.',
    nicknames: ['Snuggles', 'Cuddles', 'Fuzzy', 'Beans'],
    face: { x: 32, y: 26, scale: 0.8 },
  },
  helmet: {
    label: 'Helmet',
    tint: 'var(--tint-helmet)',
    tintSoft: 'var(--tint-helmet-soft)',
    events: COMMON,
    pack: 'generic',
    mountHint: 'Stick it inside the shell, near the back.',
    nicknames: ['Domey', 'Guardian', 'Shelly', 'Rocket'],
    face: { x: 32, y: 32, scale: 1 },
  },
  jacket: {
    label: 'Jacket',
    tint: 'var(--tint-jacket)',
    tintSoft: 'var(--tint-jacket-soft)',
    events: COMMON,
    pack: 'generic',
    mountHint: 'Clip it to the zipper pull or inside pocket.',
    nicknames: ['Cozy', 'Zippy', 'Puff', 'Breezy'],
    face: { x: 32, y: 34, scale: 1 },
  },
  other: {
    label: 'Something else',
    tint: 'var(--tint-other)',
    tintSoft: 'var(--tint-other-soft)',
    events: COMMON,
    pack: 'generic',
    mountHint: 'Attach it however fits best.',
    nicknames: ['Tagalong', 'Pip', 'Blip', 'Buddy'],
    face: { x: 32, y: 36, scale: 1 },
  },
}

/** Things that get their own full content pack. */
export const FULL_PACK_THINGS: readonly ThingType[] = ['bottle', 'lunchbox', 'backpack', 'toothbrush']
