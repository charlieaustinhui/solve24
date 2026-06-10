// Exact fraction arithmetic so intermediate results like 8/3 stay precise.
// Floating point would make hands like 3,3,8,8 (solved via 8/(3-8/3)) unreliable.

export interface Rational {
  num: number
  den: number
}

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) {
    ;[a, b] = [b, a % b]
  }
  return a
}

/** Build a normalized rational: reduced, denominator always positive. */
export function rat(num: number, den = 1): Rational {
  if (den === 0) throw new Error('denominator cannot be zero')
  if (den < 0) {
    num = -num
    den = -den
  }
  const g = gcd(num, den) || 1
  return { num: num / g, den: den / g }
}

export function add(a: Rational, b: Rational): Rational {
  return rat(a.num * b.den + b.num * a.den, a.den * b.den)
}

export function sub(a: Rational, b: Rational): Rational {
  return rat(a.num * b.den - b.num * a.den, a.den * b.den)
}

export function mul(a: Rational, b: Rational): Rational {
  return rat(a.num * b.num, a.den * b.den)
}

/** Returns null on division by zero (e.g. dividing by a 5-5 intermediate). */
export function div(a: Rational, b: Rational): Rational | null {
  if (b.num === 0) return null
  return rat(a.num * b.den, a.den * b.num)
}

export function equals(a: Rational, b: Rational): boolean {
  return a.num === b.num && a.den === b.den
}

export function isInteger(r: Rational): boolean {
  return r.den === 1
}

export function toNumber(r: Rational): number {
  return r.num / r.den
}

/** "8" for integers, "8/3" for fractions — shown on merged cards mid-solve. */
export function format(r: Rational): string {
  return r.den === 1 ? String(r.num) : `${r.num}/${r.den}`
}
