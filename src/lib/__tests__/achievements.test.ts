import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ACHIEVEMENTS, evaluateRound, loadUnlocked } from '../achievements'
import { recordRound } from '../stats'

beforeEach(() => {
  const store = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
  })
})

describe('achievements', () => {
  it('unlocks the right badges for a round and persists them', () => {
    const round = { score: 1200, hands: 6, bestStreak: 5, fastestSolve: 2, skips: 0 }
    const stats = recordRound(round)
    const fresh = evaluateRound(round, stats)
    const ids = fresh.map((a) => a.id).sort()
    expect(ids).toEqual(
      ['club-1000', 'emperor', 'first-blood', 'lightning', 'no-skip', 'samurai'].sort(),
    )
    expect(loadUnlocked().has('emperor')).toBe(true)
    expect(loadUnlocked().has('dragon')).toBe(false)
  })

  it('never re-announces already-unlocked badges', () => {
    const round = { score: 300, hands: 2, bestStreak: 2, fastestSolve: 8, skips: 1 }
    const stats = recordRound(round)
    expect(evaluateRound(round, stats).map((a) => a.id)).toEqual(['first-blood'])
    expect(evaluateRound(round, stats)).toEqual([])
  })

  it('unlocks veteran from lifetime stats', () => {
    const round = { score: 100, hands: 1, bestStreak: 1, fastestSolve: 10, skips: 0 }
    let stats = recordRound(round)
    for (let i = 0; i < 9; i++) stats = recordRound(round)
    expect(stats.gamesPlayed).toBe(10)
    expect(evaluateRound(round, stats).some((a) => a.id === 'veteran')).toBe(true)
  })

  it('every achievement has unique id and hanzi', () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length)
    expect(new Set(ACHIEVEMENTS.map((a) => a.hanzi)).size).toBe(ACHIEVEMENTS.length)
  })
})
