import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MAX_SCORES, addHighScore, loadHighScores, qualifies } from '../highscores'

beforeEach(() => {
  const store = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
  })
})

describe('highscores', () => {
  it('starts empty and survives garbage data', () => {
    expect(loadHighScores()).toEqual([])
    localStorage.setItem('solve24-highscores', 'not json{{')
    expect(loadHighScores()).toEqual([])
  })

  it('adds scores sorted descending and persists', () => {
    addHighScore({ name: 'AAA', score: 300, hands: 2 })
    addHighScore({ name: 'BBB', score: 700, hands: 5 })
    addHighScore({ name: 'CCC', score: 500, hands: 3 })
    const board = loadHighScores()
    expect(board.map((s) => s.name)).toEqual(['BBB', 'CCC', 'AAA'])
    expect(board[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('migrates pre-leaderboard entries that used `initials`', () => {
    localStorage.setItem(
      'solve24-highscores',
      JSON.stringify([
        { initials: 'OLD', score: 400, hands: 3, date: '2026-06-01' },
        { name: 'NEW NAME', score: 200, hands: 1, date: '2026-06-09' },
        { score: 999 }, // neither name nor initials — dropped
      ]),
    )
    expect(loadHighScores()).toEqual([
      { name: 'OLD', score: 400, hands: 3, date: '2026-06-01' },
      { name: 'NEW NAME', score: 200, hands: 1, date: '2026-06-09' },
    ])
  })

  it('keeps only the top 10', () => {
    for (let i = 1; i <= 14; i++) {
      addHighScore({ name: 'P' + i, score: i * 100, hands: i })
    }
    const board = loadHighScores()
    expect(board).toHaveLength(MAX_SCORES)
    expect(board[0].score).toBe(1400)
    expect(board[9].score).toBe(500)
  })

  it('qualifies when the board has room, or the score beats the lowest', () => {
    expect(qualifies(0)).toBe(false)
    expect(qualifies(50)).toBe(true)
    for (let i = 1; i <= 10; i++) {
      addHighScore({ name: 'XXX', score: i * 100, hands: i })
    }
    expect(qualifies(100)).toBe(false)
    expect(qualifies(101)).toBe(true)
  })
})
