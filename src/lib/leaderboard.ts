import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from 'obscenity'
// .js extensions because this module is also imported by api/leaderboard.ts,
// which runs as native Node ESM on Vercel (extensionless imports crash there)
import type { HighScore } from './highscores.js'
import { MAX_NAME_LENGTH, MAX_SCORES } from './highscores.js'
import { BASE_POINTS, MAX_HANDS_PER_ROUND, speedBonus, streakMultiplier } from './scoring.js'

/** Best possible single hand: instant solve at the streak cap. */
export const MAX_HAND_SCORE = Math.round(
  (BASE_POINTS + speedBonus(0)) * streakMultiplier(Infinity),
)
/** Most hands a real 180s round can plausibly produce — see scoring.ts. */
export const MAX_HANDS = MAX_HANDS_PER_ROUND

export const NAME_RE = /^[A-Z0-9 ]+$/

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
})

/** Blocklist-based — catches the obvious and common evasions, not the determined. */
export function isNameAllowed(name: string): boolean {
  return !matcher.hasMatch(name)
}

export interface LeaderboardEntry {
  name: string
  score: number
  hands: number
}

export type SanitizeResult =
  | { ok: true; entry: LeaderboardEntry }
  | { ok: false; reason: 'invalid' | 'inappropriate' }

/**
 * Authoritative validation, shared by the form (instant feedback) and the API
 * (bypassing the UI doesn't bypass the rules). The score itself is whatever the
 * game computed — but it must be arithmetically possible for the claimed hands.
 */
export function sanitizeEntry(raw: unknown): SanitizeResult {
  if (typeof raw !== 'object' || raw === null) return { ok: false, reason: 'invalid' }
  const e = raw as Record<string, unknown>
  if (typeof e.name !== 'string' || typeof e.score !== 'number' || typeof e.hands !== 'number') {
    return { ok: false, reason: 'invalid' }
  }
  const name = e.name.trim().toUpperCase()
  if (name.length < 1 || name.length > MAX_NAME_LENGTH || !NAME_RE.test(name)) {
    return { ok: false, reason: 'invalid' }
  }
  const { score, hands } = e
  if (!Number.isInteger(score) || !Number.isInteger(hands)) {
    return { ok: false, reason: 'invalid' }
  }
  if (hands < 1 || hands > MAX_HANDS) return { ok: false, reason: 'invalid' }
  if (score < 1 || score > hands * MAX_HAND_SCORE) return { ok: false, reason: 'invalid' }
  if (!isNameAllowed(name)) return { ok: false, reason: 'inappropriate' }
  return { ok: true, entry: { name, score, hands } }
}

/** Would this score crack the global top 10? */
export function globalQualifies(score: number, board: HighScore[]): boolean {
  if (score <= 0) return false
  if (board.length < MAX_SCORES) return true
  return score > board[board.length - 1].score
}

const ENDPOINT = '/api/leaderboard'
const START_ENDPOINT = '/api/round/start'

/**
 * Ask the server to open a round; returns a signed token to submit later, or
 * null if the API is unreachable (the round still plays; it just can't post
 * globally). Called when a round starts.
 */
export async function startRound(): Promise<string | null> {
  try {
    const res = await fetch(START_ENDPOINT, { method: 'POST' })
    if (!res.ok) return null
    const data: unknown = await res.json()
    return data && typeof (data as { token?: unknown }).token === 'string'
      ? (data as { token: string }).token
      : null
  } catch {
    return null
  }
}

/** Top 10 from the server, or null when offline / API unreachable. */
export async function fetchGlobalScores(): Promise<HighScore[] | null> {
  try {
    const res = await fetch(ENDPOINT)
    if (!res.ok) return null
    const data: unknown = await res.json()
    return Array.isArray(data) ? (data as HighScore[]) : null
  } catch {
    return null
  }
}

/**
 * Submit a finished round with its round token; returns the fresh top 10, or
 * null on failure (including a rejected/expired token). A null token means the
 * round started while offline — the server will reject it, so we don't bother.
 */
export async function submitGlobalScore(
  entry: LeaderboardEntry,
  token: string | null,
): Promise<HighScore[] | null> {
  if (token === null) return null
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...entry, token }),
    })
    if (!res.ok) return null
    const data: unknown = await res.json()
    return Array.isArray(data) ? (data as HighScore[]) : null
  } catch {
    return null
  }
}
