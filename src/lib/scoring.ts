import type { Difficulty } from './deck'

export const ROUND_SECONDS = 180
export const BASE_POINTS = 100

/** Hands get harder as the round progresses: one minute per difficulty tier. */
export function difficultyAt(elapsedSeconds: number): Difficulty {
  if (elapsedSeconds < 60) return 'easy'
  if (elapsedSeconds < 120) return 'medium'
  return 'hard'
}

/** Up to +150 for instant solves, fading to 0 at 15 seconds per hand. */
export function speedBonus(secondsOnHand: number): number {
  return Math.max(0, 15 - Math.floor(secondsOnHand)) * 10
}

/**
 * Streak = consecutive solves without skipping.
 * 1st solve ×1.0, 2nd ×1.1, 3rd ×1.2 ... capped at ×2.0.
 */
export function streakMultiplier(streak: number): number {
  if (streak <= 1) return 1
  return Math.min(2, 1 + (streak - 1) * 0.1)
}

export function handScore(secondsOnHand: number, streak: number): number {
  return Math.round((BASE_POINTS + speedBonus(secondsOnHand)) * streakMultiplier(streak))
}

export type ComboTier = 'none' | 'samurai' | 'emperor' | 'dragon'

/** Which celebration character appears at this streak. */
export function comboTier(streak: number): ComboTier {
  if (streak >= 8) return 'dragon'
  if (streak >= 5) return 'emperor'
  if (streak >= 3) return 'samurai'
  return 'none'
}
