import { countSolutions, isSolvable } from './solver'

export const CARD_MIN = 1
export const CARD_MAX = 10

/** Chinese numerals for the card watermark art. Index = card value. */
export const HANZI = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

export type Difficulty = 'easy' | 'medium' | 'hard'

// Bands calibrated over 3000 random hands: countSolutions() terciles ≈ 8 and 18.
// More derivation paths to 24 = easier to stumble onto one.
const BANDS: Record<Difficulty, (count: number) => boolean> = {
  easy: (c) => c >= 18,
  medium: (c) => c >= 8 && c < 18,
  hard: (c) => c >= 1 && c < 8,
}

/** Stop redrawing after this many tries and accept any solvable hand. */
const MAX_ATTEMPTS = 200

/**
 * Deal 4 random cards (1-10), guaranteed solvable, matching the difficulty
 * band. Roughly a third of solvable hands fall in each band, so the redraw
 * loop stays short.
 */
export function dealHand(
  difficulty: Difficulty = 'easy',
  rand: () => number = Math.random,
): number[] {
  let fallback: number[] | null = null
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const hand = Array.from(
      { length: 4 },
      () => CARD_MIN + Math.floor(rand() * (CARD_MAX - CARD_MIN + 1)),
    )
    if (!isSolvable(hand)) continue
    if (BANDS[difficulty](countSolutions(hand))) return hand
    fallback ??= hand
  }
  // Degenerate RNG or impossibly strict band — any solvable hand beats hanging
  return fallback ?? [1, 2, 3, 4]
}
