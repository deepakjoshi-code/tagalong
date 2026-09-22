import { describe, expect, it, vi } from 'vitest'

vi.mock('./index', () => ({
  getLines: (_t: string, event: string) =>
    event === 'filled' ? ['Full tank, {{name}}!', 'Glug glug!', 'All topped up.', 'Splash!'] : [],
}))

import { pickPhrase, resolveName, samplePhrases } from './pickPhrase'

describe('resolveName', () => {
  it('uses the kid name when present', () => {
    expect(resolveName('Hi {{name}}!', 'kid', 'Ava')).toBe('Hi Ava!')
  })
  it('falls back to a band-appropriate word', () => {
    expect(resolveName('Hi {{name}}!', 'big', undefined, () => 0)).toBe('Hi legend!')
    expect(resolveName('Hi {{name}}!', 'little', '   ', () => 0)).toBe('Hi buddy!')
  })
})

describe('pickPhrase', () => {
  const base = { thing: 'bottle', event: 'filled', ageBand: 'kid', personality: 'silly' } as const
  it('returns null when a cell is empty', () => {
    expect(pickPhrase({ ...base, event: 'sip' })).toBeNull()
  })
  it('avoids the recent lines', () => {
    const p = pickPhrase({ ...base, recent: ['Full tank, {{name}}!', 'Glug glug!', 'All topped up.'], random: () => 0 })
    expect(p?.raw).toBe('Splash!')
  })
  it('falls back to any line when everything is recent', () => {
    const p = pickPhrase({ ...base, recent: ['Full tank, {{name}}!', 'Glug glug!', 'All topped up.', 'Splash!'], random: () => 0 })
    expect(p).not.toBeNull()
  })
  it('samplePhrases returns distinct lines', () => {
    const s = samplePhrases(base, 3)
    expect(new Set(s.map((x) => x.raw)).size).toBe(3)
  })
})
