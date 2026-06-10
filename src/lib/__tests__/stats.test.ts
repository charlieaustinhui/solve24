import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadStats, recordRound } from '../stats'

beforeEach(() => {
  const store = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
  })
})

const round = (over = {}) => ({
  score: 600,
  hands: 4,
  bestStreak: 3,
  fastestSolve: 6,
  skips: 1,
  ...over,
})

describe('stats', () => {
  it('starts empty and survives garbage', () => {
    expect(loadStats().gamesPlayed).toBe(0)
    localStorage.setItem('solve24-stats', '{{nope')
    expect(loadStats().gamesPlayed).toBe(0)
  })

  it('accumulates rounds and keeps bests', () => {
    recordRound(round())
    const s = recordRound(round({ score: 900, bestStreak: 6, fastestSolve: 2.5, skips: 0 }))
    expect(s.gamesPlayed).toBe(2)
    expect(s.handsSolved).toBe(8)
    expect(s.skips).toBe(1)
    expect(s.bestScore).toBe(900)
    expect(s.bestStreak).toBe(6)
    expect(s.fastestSolve).toBe(2.5)
    expect(s.totalScore).toBe(1500)
    expect(loadStats()).toEqual(s)
  })

  it('ignores fastestSolve of 0 (no solves that round)', () => {
    recordRound(round({ fastestSolve: 4 }))
    const s = recordRound(round({ hands: 0, fastestSolve: 0 }))
    expect(s.fastestSolve).toBe(4)
  })
})
