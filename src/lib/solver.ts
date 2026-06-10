import type { Rational } from './rational'
import { rat, add, sub, mul, div, equals } from './rational'

export type Op = '+' | '-' | '×' | '÷'
export const OPS: Op[] = ['+', '-', '×', '÷']

export const TARGET = rat(24)

export function applyOp(op: Op, a: Rational, b: Rational): Rational | null {
  switch (op) {
    case '+':
      return add(a, b)
    case '-':
      return sub(a, b)
    case '×':
      return mul(a, b)
    case '÷':
      return div(a, b)
  }
}

interface Node {
  value: Rational
  expr: string
}

// Repeatedly combine any ordered pair of remaining values with any operator.
// This covers every permutation and parenthesization of the 4 cards.
function search(nodes: Node[]): string | null {
  if (nodes.length === 1) {
    return equals(nodes[0].value, TARGET) ? nodes[0].expr : null
  }
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue
      const a = nodes[i]
      const b = nodes[j]
      const rest = nodes.filter((_, k) => k !== i && k !== j)
      for (const op of OPS) {
        // + and × are commutative; only try them once per unordered pair
        if ((op === '+' || op === '×') && i > j) continue
        const value = applyOp(op, a.value, b.value)
        if (value === null) continue
        const expr = `(${a.expr} ${op} ${b.expr})`
        const found = search([...rest, { value, expr }])
        if (found !== null) return found
      }
    }
  }
  return null
}

/** Returns one expression that makes 24 (outer parens stripped), or null. */
export function solve(cards: number[]): string | null {
  const result = search(cards.map((c) => ({ value: rat(c), expr: String(c) })))
  if (result === null) return null
  return result.replace(/^\((.*)\)$/, '$1')
}

export function isSolvable(cards: number[]): boolean {
  return solve(cards) !== null
}

/**
 * Counts every derivation path that reaches 24 (not deduplicated, so numbers
 * run high). Used as a difficulty proxy: many paths = easy, few = hard.
 */
export function countSolutions(cards: number[]): number {
  let count = 0
  function go(values: Rational[]) {
    if (values.length === 1) {
      if (equals(values[0], TARGET)) count++
      return
    }
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < values.length; j++) {
        if (i === j) continue
        const rest = values.filter((_, k) => k !== i && k !== j)
        for (const op of OPS) {
          if ((op === '+' || op === '×') && i > j) continue
          const value = applyOp(op, values[i], values[j])
          if (value === null) continue
          go([...rest, value])
        }
      }
    }
  }
  go(cards.map((c) => rat(c)))
  return count
}
