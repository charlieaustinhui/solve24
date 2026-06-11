import { Redis } from '@upstash/redis'
// Explicit .js extensions: deployed functions run as native Node ESM, which
// (unlike vercel dev's bundler) refuses extensionless relative imports.
import type { HighScore } from '../src/lib/highscores.js'
import { MAX_SCORES } from '../src/lib/highscores.js'
import { sanitizeEntry } from '../src/lib/leaderboard.js'
import { MAX_TOKEN_AGE_MS, verifyToken } from '../src/lib/roundToken.js'

const KEY = 'lb:scores'
/** Keep a deeper history than the visible top 10 so the tail can shift. */
const MAX_KEPT = 100
/** Spent round-token nonces live here just long enough to outlast the token. */
const NONCE_TTL_SECONDS = Math.ceil(MAX_TOKEN_AGE_MS / 1000)

/** Compact member stored in the sorted set; the score lives in the zset itself. */
interface Member {
  i: string // name
  h: number // hands
  d: string // date (set server-side)
  n: number // nonce so identical rounds stay distinct members
}

function redis(): Redis {
  // The Vercel Marketplace integration injects UPSTASH_*; older KV stores use KV_*.
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  if (!url || !token) throw new Error('Redis is not configured')
  return new Redis({ url, token })
}

async function topScores(client: Redis): Promise<HighScore[]> {
  // withScores flattens to [member, score, member, score, ...]
  const flat = await client.zrange<(Member | number)[]>(KEY, 0, MAX_SCORES - 1, {
    rev: true,
    withScores: true,
  })
  const scores: HighScore[] = []
  for (let k = 0; k + 1 < flat.length; k += 2) {
    const m = flat[k] as Member
    scores.push({ name: m.i, score: flat[k + 1] as number, hands: m.h, date: m.d })
  }
  return scores
}

export async function GET(): Promise<Response> {
  try {
    return Response.json(await topScores(redis()))
  } catch {
    return Response.json({ error: 'unavailable' }, { status: 503 })
  }
}

export async function POST(req: Request): Promise<Response> {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return Response.json({ error: 'invalid' }, { status: 400 })
  }
  // The token proves the server itself opened this round (kills bare forges) and
  // is checked for signature + freshness here; single-use is enforced below.
  // A thrown error here means misconfiguration (no secret), not a bad token.
  let token: ReturnType<typeof verifyToken>
  try {
    token = verifyToken((raw as { token?: unknown })?.token)
  } catch {
    return Response.json({ error: 'unavailable' }, { status: 503 })
  }
  if (!token.ok) {
    return Response.json({ error: 'invalid' }, { status: 400 })
  }
  const result = sanitizeEntry(raw)
  if (!result.ok) {
    return Response.json({ error: result.reason }, { status: 400 })
  }
  const { name, score, hands } = result.entry
  const member: Member = {
    i: name,
    h: hands,
    d: new Date().toISOString().slice(0, 10),
    n: Math.floor(Math.random() * 1e9),
  }
  try {
    const client = redis()
    // Single-use: claim the nonce atomically. If it's already set, the token was
    // already spent (replay) — reject without writing a score.
    const claimed = await client.set(`lb:nonce:${token.nonce}`, 1, {
      nx: true,
      ex: NONCE_TTL_SECONDS,
    })
    if (claimed === null) {
      return Response.json({ error: 'invalid' }, { status: 400 })
    }
    await client.zadd(KEY, { score, member })
    // Drop everything below the kept range (negative ranks count from the top).
    await client.zremrangebyrank(KEY, 0, -(MAX_KEPT + 1))
    return Response.json(await topScores(client), { status: 201 })
  } catch {
    return Response.json({ error: 'unavailable' }, { status: 503 })
  }
}
