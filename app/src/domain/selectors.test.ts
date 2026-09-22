import { describe, expect, it } from 'vitest'
import { isTagMuted, isWithinQuietHours, privacyInventory } from './selectors'
import type { StoreData } from './store'
import { DEFAULT_SETTINGS, type Tag } from './types'

const tag = (over: Partial<Tag> = {}): Tag => ({
  id: 't1',
  deviceId: 'sim-1',
  nickname: 'Bottle Buddy',
  thing: 'bottle',
  kidId: 'k1',
  personality: 'silly',
  volume: 70,
  quiet: { enabled: true, startMin: 20 * 60, endMin: 7 * 60 },
  nudges: false,
  language: 'en',
  createdAt: 0,
  ...over,
})

describe('isWithinQuietHours', () => {
  it('handles a window that wraps past midnight', () => {
    const t = tag()
    expect(isWithinQuietHours(t, 21 * 60)).toBe(true) // 9pm
    expect(isWithinQuietHours(t, 2 * 60)).toBe(true) // 2am
    expect(isWithinQuietHours(t, 12 * 60)).toBe(false) // noon
    expect(isWithinQuietHours(t, 7 * 60)).toBe(false) // exactly the end is awake
    expect(isWithinQuietHours(t, 20 * 60)).toBe(true) // exactly the start is quiet
  })
  it('handles a same-day window', () => {
    const t = tag({ quiet: { enabled: true, startMin: 9 * 60, endMin: 17 * 60 } })
    expect(isWithinQuietHours(t, 12 * 60)).toBe(true)
    expect(isWithinQuietHours(t, 8 * 60)).toBe(false)
  })
  it('is never quiet when disabled or when start equals end', () => {
    expect(isWithinQuietHours(tag({ quiet: { enabled: false, startMin: 0, endMin: 0 } }), 3 * 60)).toBe(false)
    expect(isWithinQuietHours(tag({ quiet: { enabled: true, startMin: 600, endMin: 600 } }), 600)).toBe(false)
  })
})

describe('isTagMuted', () => {
  it('is muted only until the deadline', () => {
    expect(isTagMuted(tag({ mutedUntil: 2000 }), 1000)).toBe(true)
    expect(isTagMuted(tag({ mutedUntil: 2000 }), 3000)).toBe(false)
    expect(isTagMuted(tag(), 3000)).toBe(false)
  })
})

describe('privacyInventory', () => {
  it('counts exactly what is stored, including names and clips', () => {
    const data: StoreData = {
      kids: [
        { id: 'k1', displayName: 'Ava', ageBand: 'kid', createdAt: 0, nameClip: { blobKey: 'clip:k1', durationMs: 900 } },
        { id: 'k2', ageBand: 'little', createdAt: 0 },
      ],
      tags: [tag()],
      events: [
        { id: 'e1', tagId: 't1', type: 'drop', at: 500 },
        { id: 'e2', tagId: 't1', type: 'filled', at: 900 },
      ],
      settings: DEFAULT_SETTINGS,
    }
    expect(privacyInventory(data)).toEqual({
      kids: 2,
      kidsWithNames: 1,
      nameClips: 1,
      tags: 1,
      events: 2,
      oldestEventAt: 500,
    })
  })
  it('reports nothing for a clean install', () => {
    const empty: StoreData = { kids: [], tags: [], events: [], settings: DEFAULT_SETTINGS }
    expect(privacyInventory(empty)).toEqual({ kids: 0, kidsWithNames: 0, nameClips: 0, tags: 0, events: 0, oldestEventAt: undefined })
  })
})

describe('school hours', () => {
  const schoolTag = (over: Partial<Tag['school']> = {}) =>
    tag({
      quiet: { enabled: true, startMin: 20 * 60, endMin: 7 * 60 },
      school: { enabled: true, startMin: 8 * 60 + 30, endMin: 15 * 60 + 30, days: 0b0011111, ...over },
    })

  it('silences the tag during class on school days', () => {
    // Wednesday is index 2 with a Monday-first mask.
    expect(isWithinQuietHours(schoolTag(), 12 * 60, 2)).toBe(true)
    expect(isWithinQuietHours(schoolTag(), 16 * 60, 2)).toBe(false)
  })

  it('leaves the weekend alone', () => {
    expect(isWithinQuietHours(schoolTag(), 12 * 60, 5)).toBe(false)
    expect(isWithinQuietHours(schoolTag(), 12 * 60, 6)).toBe(false)
  })

  it('still applies night quiet hours on any day', () => {
    expect(isWithinQuietHours(schoolTag(), 23 * 60, 6)).toBe(true)
  })

  it('treats an empty day mask as every day', () => {
    expect(isWithinQuietHours(schoolTag({ days: 0 }), 12 * 60, 5)).toBe(true)
  })

  it('errs towards silence when the weekday is unknown', () => {
    expect(isWithinQuietHours(schoolTag(), 12 * 60)).toBe(true)
  })

  it('does nothing when switched off', () => {
    expect(isWithinQuietHours(schoolTag({ enabled: false }), 12 * 60, 2)).toBe(false)
  })

  it('is absent on tags created before the feature existed', () => {
    expect(isWithinQuietHours(tag(), 12 * 60, 2)).toBe(false)
  })
})
