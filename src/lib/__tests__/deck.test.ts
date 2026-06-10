import { describe, expect, it } from 'vitest'
import type { Difficulty } from '../deck'
import { dealHand, CARD_MIN, CARD_MAX, HANZI } from '../deck'
import { countSolutions, isSolvable } from '../solver'

describe('deck', () => {
  it('always deals 4 solvable cards in range', () => {
    for (let i = 0; i < 50; i++) {
      const hand = dealHand()
      expect(hand).toHaveLength(4)
      for (const card of hand) {
        expect(card).toBeGreaterThanOrEqual(CARD_MIN)
        expect(card).toBeLessThanOrEqual(CARD_MAX)
        expect(Number.isInteger(card)).toBe(true)
      }
      expect(isSolvable(hand)).toBe(true)
    }
  })

  it('redraws past unsolvable hands from a seeded generator', () => {
    // First four draws produce 1,1,1,1 (unsolvable) — must keep drawing
    const seq = [0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5]
    let i = 0
    const rand = () => seq[Math.min(i++, seq.length - 1)]
    const hand = dealHand('easy', rand)
    expect(isSolvable(hand)).toBe(true)
    expect(hand).not.toEqual([1, 1, 1, 1])
  })

  it('deals hands inside each difficulty band', () => {
    const bands: Record<Difficulty, (c: number) => boolean> = {
      easy: (c) => c >= 35,
      medium: (c) => c >= 14 && c < 35,
      hard: (c) => c >= 4 && c < 14,
    }
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      for (let i = 0; i < 20; i++) {
        const hand = dealHand(difficulty)
        expect(isSolvable(hand)).toBe(true)
        expect(bands[difficulty](countSolutions(hand))).toBe(true)
      }
    }
  })

  it('falls back to any solvable hand when the RNG is degenerate', () => {
    // rand stuck at one value cannot satisfy every band, but must not hang
    const hand = dealHand('hard', () => 0.55)
    expect(isSolvable(hand)).toBe(true)
  })

  it('has a hanzi watermark for every card value', () => {
    for (let v = CARD_MIN; v <= CARD_MAX; v++) {
      expect(HANZI[v]).toBeTruthy()
    }
  })
})
