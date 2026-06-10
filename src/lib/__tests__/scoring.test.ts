import { describe, expect, it } from 'vitest'
import {
  ROUND_SECONDS,
  comboTier,
  difficultyAt,
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

  it('escalates difficulty one tier per minute across the 3-minute round', () => {
    expect(ROUND_SECONDS).toBe(180)
    expect(difficultyAt(0)).toBe('easy')
    expect(difficultyAt(59.9)).toBe('easy')
    expect(difficultyAt(60)).toBe('medium')
    expect(difficultyAt(119.9)).toBe('medium')
    expect(difficultyAt(120)).toBe('hard')
    expect(difficultyAt(180)).toBe('hard')
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
