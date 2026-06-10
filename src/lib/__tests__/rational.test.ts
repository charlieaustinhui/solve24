import { describe, expect, it } from 'vitest'
import { rat, add, sub, mul, div, equals, format, isInteger, toNumber } from '../rational'

describe('rational', () => {
  it('normalizes and reduces fractions', () => {
    expect(rat(4, 8)).toEqual({ num: 1, den: 2 })
    expect(rat(3, -6)).toEqual({ num: -1, den: 2 })
    expect(rat(0, 5)).toEqual({ num: 0, den: 1 })
  })

  it('throws on a zero denominator', () => {
    expect(() => rat(1, 0)).toThrow()
  })

  it('adds, subtracts, and multiplies exactly', () => {
    expect(add(rat(1, 3), rat(1, 6))).toEqual(rat(1, 2))
    expect(sub(rat(3), rat(8, 3))).toEqual(rat(1, 3))
    expect(mul(rat(2, 3), rat(3, 4))).toEqual(rat(1, 2))
  })

  it('divides exactly and returns null for division by zero', () => {
    expect(div(rat(8), rat(1, 3))).toEqual(rat(24))
    expect(div(rat(5), rat(0))).toBeNull()
  })

  it('supports the 3,3,8,8 critical path: 8 / (3 - 8/3) = 24', () => {
    const inner = sub(rat(3), div(rat(8), rat(3))!)
    expect(div(rat(8), inner)).toEqual(rat(24))
  })

  it('formats integers and fractions for card display', () => {
    expect(format(rat(24))).toBe('24')
    expect(format(rat(8, 3))).toBe('8/3')
    expect(isInteger(rat(6, 3))).toBe(true)
    expect(toNumber(rat(1, 2))).toBe(0.5)
    expect(equals(rat(2, 4), rat(1, 2))).toBe(true)
  })
})
