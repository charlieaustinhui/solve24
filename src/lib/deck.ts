import { isSolvable } from './solver'

export const CARD_MIN = 1
export const CARD_MAX = 10

/** Chinese numerals for the card watermark art. Index = card value. */
export const HANZI = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

/**
 * Deal 4 random cards (1-10) guaranteed solvable for 24.
 * Roughly 85% of random hands are solvable, so the redraw loop is short.
 */
export function dealHand(rand: () => number = Math.random): number[] {
  for (;;) {
    const hand = Array.from(
      { length: 4 },
      () => CARD_MIN + Math.floor(rand() * (CARD_MAX - CARD_MIN + 1)),
    )
    if (isSolvable(hand)) return hand
  }
}
