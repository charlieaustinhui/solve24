import { describe, expect, it } from 'vitest'
import { dealHand, CARD_MIN, CARD_MAX, HANZI } from '../deck'
import { isSolvable } from '../solver'

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
    const hand = dealHand(rand)
    expect(isSolvable(hand)).toBe(true)
    expect(hand).not.toEqual([1, 1, 1, 1])
  })

  it('has a hanzi watermark for every card value', () => {
    for (let v = CARD_MIN; v <= CARD_MAX; v++) {
      expect(HANZI[v]).toBeTruthy()
    }
  })
})
