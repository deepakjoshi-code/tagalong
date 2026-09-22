import { describe, expect, it } from 'vitest'
import { formatRelative, isSameDay } from './time'

describe('formatRelative', () => {
  const now = Date.UTC(2026, 8, 22, 12, 0, 0)
  it('handles the near past', () => {
    expect(formatRelative(now - 10_000, now)).toBe('just now')
    expect(formatRelative(now - 5 * 60_000, now)).toBe('5 min ago')
    expect(formatRelative(now - 3 * 3_600_000, now)).toBe('3 hr ago')
    expect(formatRelative(now - 30 * 3_600_000, now)).toBe('yesterday')
  })
})

describe('isSameDay', () => {
  it('compares calendar days', () => {
    const a = new Date(2026, 8, 22, 1).getTime()
    const b = new Date(2026, 8, 22, 23).getTime()
    expect(isSameDay(a, b)).toBe(true)
    expect(isSameDay(a, b + 2 * 3_600_000)).toBe(false)
  })
})
