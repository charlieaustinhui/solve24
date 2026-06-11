import { describe, expect, it } from 'vitest'
import type { HighScore } from '../highscores'
import {
  MAX_HAND_SCORE,
  globalQualifies,
  isNameAllowed,
  sanitizeEntry,
} from '../leaderboard'

const valid = { name: 'CHARLIE', score: 1200, hands: 9 }

describe('sanitizeEntry', () => {
  it('accepts a normal round and normalizes the name', () => {
    const r = sanitizeEntry({ name: '  charlie ', score: 1200, hands: 9 })
    expect(r).toEqual({ ok: true, entry: { name: 'CHARLIE', score: 1200, hands: 9 } })
  })

  it('rejects non-objects and missing fields', () => {
    for (const raw of [null, 'hi', 42, [], {}, { name: 'AB' }, { score: 5 }]) {
      expect(sanitizeEntry(raw).ok).toBe(false)
    }
  })

  it('rejects bad names', () => {
    for (const name of ['', '           ', 'ELEVENCHARS', 'BAD!', 'naïve', 'a,b']) {
      expect(sanitizeEntry({ ...valid, name })).toEqual({ ok: false, reason: 'invalid' })
    }
  })

  it('allows letters, digits, and inner spaces up to 10 chars', () => {
    for (const name of ['A', 'PLAYER 1', 'TOP GUN 99']) {
      expect(sanitizeEntry({ ...valid, name }).ok).toBe(true)
    }
  })

  it('rejects non-integer or impossible scores and hands', () => {
    expect(sanitizeEntry({ ...valid, score: 12.5 }).ok).toBe(false)
    expect(sanitizeEntry({ ...valid, hands: 2.5 }).ok).toBe(false)
    expect(sanitizeEntry({ ...valid, score: 0 }).ok).toBe(false)
    expect(sanitizeEntry({ ...valid, score: -100 }).ok).toBe(false)
    expect(sanitizeEntry({ ...valid, hands: 0 }).ok).toBe(false)
    expect(sanitizeEntry({ ...valid, hands: 999 }).ok).toBe(false)
    // more points than the streak cap + max speed bonus allow for the hand count
    expect(sanitizeEntry({ name: 'AAA', score: MAX_HAND_SCORE + 1, hands: 1 }).ok).toBe(false)
    expect(sanitizeEntry({ name: 'AAA', score: MAX_HAND_SCORE, hands: 1 }).ok).toBe(true)
  })

  it('rejects inappropriate names with a distinct reason', () => {
    expect(sanitizeEntry({ ...valid, name: 'FUCK' })).toEqual({
      ok: false,
      reason: 'inappropriate',
    })
    // leetspeak evasion
    expect(sanitizeEntry({ ...valid, name: 'SH1T' })).toEqual({
      ok: false,
      reason: 'inappropriate',
    })
  })
})

describe('isNameAllowed', () => {
  it('passes ordinary names', () => {
    // CLASS ACT checks the filter respects word boundaries ("ass" inside "class")
    for (const name of ['CHARLIE', 'PLAYER 1', 'DRAGON 88', 'CLASS ACT']) {
      expect(isNameAllowed(name)).toBe(true)
    }
  })
})

describe('globalQualifies', () => {
  const board = (n: number): HighScore[] =>
    Array.from({ length: n }, (_, i) => ({
      name: `P${i}`,
      score: (10 - i) * 100,
      hands: 5,
      date: '2026-06-10',
    }))

  it('any positive score qualifies while the board has room', () => {
    expect(globalQualifies(1, board(9))).toBe(true)
    expect(globalQualifies(0, board(0))).toBe(false)
  })

  it('must beat the lowest entry on a full board', () => {
    expect(globalQualifies(100, board(10))).toBe(false)
    expect(globalQualifies(101, board(10))).toBe(true)
  })
})
