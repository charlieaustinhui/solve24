import { beforeAll, describe, expect, it } from 'vitest'
import { MAX_TOKEN_AGE_MS, signToken, verifyToken } from '../roundToken'

beforeAll(() => {
  process.env.ROUND_TOKEN_SECRET = 'test-secret-do-not-use-in-prod'
})

describe('roundToken', () => {
  it('round-trips a freshly minted token', () => {
    const now = 1_000_000
    const token = signToken(now)
    const r = verifyToken(token, now + 5000)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.issuedAt).toBe(now)
  })

  it('issues a distinct nonce each time', () => {
    const a = verifyToken(signToken())
    const b = verifyToken(signToken())
    expect(a.ok && b.ok).toBe(true)
    if (a.ok && b.ok) expect(a.nonce).not.toBe(b.nonce)
  })

  it('rejects a tampered payload (signature no longer matches)', () => {
    const token = signToken()
    const [payload, sig] = token.split('.')
    // flip a character in the payload
    const badPayload = (payload[0] === 'A' ? 'B' : 'A') + payload.slice(1)
    expect(verifyToken(`${badPayload}.${sig}`).ok).toBe(false)
  })

  it('rejects a tampered signature', () => {
    const token = signToken()
    const [payload, sig] = token.split('.')
    const badSig = (sig[0] === 'a' ? 'b' : 'a') + sig.slice(1)
    expect(verifyToken(`${payload}.${badSig}`).ok).toBe(false)
  })

  it('rejects garbage and the wrong shape', () => {
    for (const bad of ['', 'nodot', '.', 'x.y', 123, null, undefined, {}]) {
      expect(verifyToken(bad as unknown).ok).toBe(false)
    }
  })

  it('rejects a token forged with a different secret', () => {
    const token = signToken()
    process.env.ROUND_TOKEN_SECRET = 'a-different-secret'
    expect(verifyToken(token).ok).toBe(false)
    process.env.ROUND_TOKEN_SECRET = 'test-secret-do-not-use-in-prod'
  })

  it('honors expiry and rejects future-dated tokens', () => {
    const now = 5_000_000
    const token = signToken(now)
    expect(verifyToken(token, now + MAX_TOKEN_AGE_MS - 1).ok).toBe(true)
    expect(verifyToken(token, now + MAX_TOKEN_AGE_MS + 1).ok).toBe(false)
    expect(verifyToken(token, now - 1000).ok).toBe(false) // clock-skew / replay from the past
  })
})
