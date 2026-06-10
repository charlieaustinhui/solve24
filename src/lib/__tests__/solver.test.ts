import { describe, expect, it } from 'vitest'
import { solve, isSolvable, applyOp } from '../solver'
import { rat } from '../rational'

describe('solver', () => {
  it('solves straightforward hands', () => {
    expect(isSolvable([1, 1, 4, 6])).toBe(true)
    expect(isSolvable([2, 3, 4, 6])).toBe(true)
    expect(isSolvable([1, 2, 3, 4])).toBe(true)
    expect(isSolvable([3, 8, 1, 1])).toBe(true)
  })

  it('solves hands that require fractional intermediates', () => {
    // 8 / (3 - 8/3) = 24 — fails with naive integer-only search
    expect(isSolvable([3, 3, 8, 8])).toBe(true)
    // 5 × (5 - 1/5) = 24
    expect(isSolvable([1, 5, 5, 5])).toBe(true)
  })

  it('rejects unsolvable hands', () => {
    expect(isSolvable([1, 1, 1, 1])).toBe(false)
    expect(isSolvable([2, 2, 2, 2])).toBe(false)
    expect(isSolvable([10, 10, 10, 10])).toBe(false)
    expect(isSolvable([1, 1, 1, 2])).toBe(false)
  })

  it('returns a human-readable expression with outer parens stripped', () => {
    // "(6 + 6) + (6 + 6)" is fine; "((6 + 6) + (6 + 6))" is not
    const fullyWrapped = (s: string): boolean => {
      if (!s.startsWith('(') || !s.endsWith(')')) return false
      let depth = 0
      for (let i = 0; i < s.length - 1; i++) {
        if (s[i] === '(') depth++
        if (s[i] === ')') depth--
        if (depth === 0) return false
      }
      return true
    }
    const expr = solve([6, 6, 6, 6])
    expect(expr).toBeTruthy()
    expect(fullyWrapped(expr!)).toBe(false)
    expect(expr).toMatch(/6/)
  })

  it('survives division-by-zero branches mid-search (5-5 intermediates)', () => {
    expect(isSolvable([5, 5, 4, 6])).toBe(true)
  })

  it('applyOp matches the four operators', () => {
    expect(applyOp('+', rat(2), rat(3))).toEqual(rat(5))
    expect(applyOp('-', rat(2), rat(3))).toEqual(rat(-1))
    expect(applyOp('×', rat(2), rat(3))).toEqual(rat(6))
    expect(applyOp('÷', rat(2), rat(3))).toEqual(rat(2, 3))
    expect(applyOp('÷', rat(2), rat(0))).toBeNull()
  })
})
