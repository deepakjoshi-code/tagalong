import type { TagEventType } from './types'

export type FaceMood = 'neutral' | 'happy' | 'excited' | 'surprised' | 'ouch' | 'sleepy' | 'curious'

export interface EventMeta {
  label: string
  /** Kid-friendly past-tense phrase for timelines ("Took a tumble"). */
  kidWords: string
  mood: FaceMood
  /** Wire code, see docs/protocol/tag-protocol.md */
  code: number
  /** Whether it's worth highlighting in the wizard preview. */
  star?: boolean
}

export const EVENT_META: Record<TagEventType, EventMeta> = {
  pickup: { label: 'Pick up', kidWords: 'Picked up', mood: 'happy', code: 0, star: true },
  putdown: { label: 'Put down', kidWords: 'Put down', mood: 'neutral', code: 1 },
  drop: { label: 'Drop', kidWords: 'Took a tumble', mood: 'ouch', code: 2, star: true },
  shake: { label: 'Shake', kidWords: 'Got a shake', mood: 'excited', code: 3 },
  tap: { label: 'Tap', kidWords: 'Got a tap', mood: 'curious', code: 4 },
  long_still: { label: 'Waiting', kidWords: 'Waited patiently', mood: 'sleepy', code: 5 },
  good_morning: { label: 'Good morning', kidWords: 'Said good morning', mood: 'happy', code: 6 },
  low_battery: { label: 'Low battery', kidWords: 'Got sleepy (low battery)', mood: 'sleepy', code: 7 },
  charging: { label: 'Charging', kidWords: 'Had a nap on the charger', mood: 'sleepy', code: 8 },
  filled: { label: 'Filled', kidWords: 'Filled up', mood: 'excited', code: 16, star: true },
  sip: { label: 'Sip', kidWords: 'Had a sip', mood: 'happy', code: 17 },
  empty: { label: 'Empty', kidWords: 'Ran empty', mood: 'curious', code: 18 },
  opened: { label: 'Opened', kidWords: 'Opened up', mood: 'excited', code: 32, star: true },
  closed: { label: 'Closed', kidWords: 'Closed up', mood: 'happy', code: 33 },
  packed: { label: 'Packed', kidWords: 'Got packed', mood: 'happy', code: 34 },
  left_behind: { label: 'Left behind', kidWords: 'Waited to be remembered', mood: 'curious', code: 48, star: true },
  zipped: { label: 'Zipped', kidWords: 'Got zipped up', mood: 'happy', code: 49 },
  brush_start: { label: 'Brushing started', kidWords: 'Started brushing', mood: 'excited', code: 64, star: true },
  brush_done: { label: 'Brushing done', kidWords: 'Finished two minutes', mood: 'excited', code: 65 },
  brush_short: { label: 'Brushing stopped early', kidWords: 'Stopped early', mood: 'curious', code: 66 },
}

export const EVENT_BY_CODE: ReadonlyMap<number, TagEventType> = new Map(
  (Object.keys(EVENT_META) as TagEventType[]).map((t) => [EVENT_META[t].code, t]),
)
