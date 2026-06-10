import { describe, expect, it } from 'vitest'
import {
  HARD_AT,
  MEDIUM_AT,
  ROUND_SECONDS,
  comboTier,
  difficultyForScore,
  handScore,
  speedBonus,
  streakMultiplier,
} from '../scoring'

describe('scoring', () => {
  it('awards up to +150 speed bonus, fading to 0 at 15s', () => {
    expect(speedBonus(0)).toBe(150)
    expect(speedBonus(0.9)).toBe(150)
    expect(speedBonus(5)).toBe(100)
    expect(speedBonus(14.9)).toBe(10)
    expect(speedBonus(15)).toBe(0)
    expect(speedBonus(40)).toBe(0)
  })

  it('multiplies streaks, capped at x2', () => {
    expect(streakMultiplier(1)).toBe(1)
    expect(streakMultiplier(2)).toBeCloseTo(1.1)
    expect(streakMultiplier(5)).toBeCloseTo(1.4)
    expect(streakMultiplier(11)).toBe(2)
    expect(streakMultiplier(99)).toBe(2)
  })

  it('combines base, speed, and streak into the hand score', () => {
    expect(handScore(20, 1)).toBe(100)
    expect(handScore(0, 1)).toBe(250)
    expect(handScore(0, 11)).toBe(500)
  })

  it('escalates difficulty by score at the MEDIUM_AT / HARD_AT thresholds', () => {
    expect(ROUND_SECONDS).toBe(180)
    expect(difficultyForScore(0)).toBe('easy')
    expect(difficultyForScore(MEDIUM_AT - 1)).toBe('easy')
    expect(difficultyForScore(MEDIUM_AT)).toBe('medium')
    expect(difficultyForScore(HARD_AT - 1)).toBe('medium')
    expect(difficultyForScore(HARD_AT)).toBe('hard')
    expect(difficultyForScore(99999)).toBe('hard')
  })

  it('maps streaks to combo tiers', () => {
    expect(comboTier(0)).toBe('none')
    expect(comboTier(2)).toBe('none')
    expect(comboTier(3)).toBe('samurai')
    expect(comboTier(4)).toBe('samurai')
    expect(comboTier(5)).toBe('emperor')
    expect(comboTier(7)).toBe('emperor')
    expect(comboTier(8)).toBe('dragon')
    expect(comboTier(20)).toBe('dragon')
  })
})
