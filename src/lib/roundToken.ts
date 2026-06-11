// SERVER-ONLY. Imports node:crypto and reads a server secret — must never be
// imported by client code (it's excluded from tsconfig.app and lives outside the
// Vite bundle; only api/* and tests reference it).
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

/** How long a freshly issued token stays acceptable. Generous: a round is 180s
 *  plus however long the player lingers on the name-entry screen. Past this the
 *  token is treated as stale (also bounds the replay-nonce TTL in Redis). */
export const MAX_TOKEN_AGE_MS = 15 * 60 * 1000

interface TokenPayload {
  t: number // issued-at, epoch ms
  n: string // random nonce, single-use
}

function secret(): string {
  const s = process.env.ROUND_TOKEN_SECRET
  if (!s) throw new Error('ROUND_TOKEN_SECRET is not configured')
  return s
}

function sign(payloadB64: string): string {
  return createHmac('sha256', secret()).update(payloadB64).digest('hex')
}

function b64url(s: string): string {
  return Buffer.from(s, 'utf8').toString('base64url')
}

/** Mint a token for a freshly started round: `base64url(payload).hmacHex`. */
export function signToken(now: number = Date.now()): string {
  const payload: TokenPayload = { t: now, n: randomBytes(12).toString('hex') }
  const payloadB64 = b64url(JSON.stringify(payload))
  return `${payloadB64}.${sign(payloadB64)}`
}

export type VerifyResult =
  | { ok: true; issuedAt: number; nonce: string }
  | { ok: false }

/**
 * Validate a token's signature and freshness. Does NOT check single-use — that
 * needs Redis and is enforced in the leaderboard route.
 */
export function verifyToken(token: unknown, now: number = Date.now()): VerifyResult {
  if (typeof token !== 'string') return { ok: false }
  const dot = token.indexOf('.')
  if (dot <= 0) return { ok: false }
  const payloadB64 = token.slice(0, dot)
  const sig = token.slice(dot + 1)

  const expected = sign(payloadB64)
  // Compare as fixed-length hex buffers; timingSafeEqual throws on length mismatch.
  if (sig.length !== expected.length) return { ok: false }
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return { ok: false }

  let payload: TokenPayload
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
  } catch {
    return { ok: false }
  }
  if (typeof payload.t !== 'number' || typeof payload.n !== 'string') return { ok: false }
  const age = now - payload.t
  if (age < 0 || age > MAX_TOKEN_AGE_MS) return { ok: false }

  return { ok: true, issuedAt: payload.t, nonce: payload.n }
}
