import type { RoundSummary, Stats } from './stats'

export interface Achievement {
  id: string
  hanzi: string
  name: string
  description: string
  earned: (round: RoundSummary, stats: Stats) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-blood',
    hanzi: '初',
    name: 'First Blood',
    description: 'Solve your first hand',
    earned: (r) => r.hands >= 1,
  },
  {
    id: 'samurai',
    hanzi: '斬',
    name: 'Samurai Summoner',
    description: 'Reach a 3-solve streak',
    earned: (r) => r.bestStreak >= 3,
  },
  {
    id: 'emperor',
    hanzi: '皇',
    name: "Emperor's Favor",
    description: 'Reach a 5-solve streak',
    earned: (r) => r.bestStreak >= 5,
  },
  {
    id: 'dragon',
    hanzi: '龍',
    name: 'Dragon Rider',
    description: 'Reach an 8-solve streak',
    earned: (r) => r.bestStreak >= 8,
  },
  {
    id: 'club-1000',
    hanzi: '千',
    name: '1000 Club',
    description: 'Score 1000 in one round',
    earned: (r) => r.score >= 1000,
  },
  {
    id: 'club-2000',
    hanzi: '双',
    name: '2000 Club',
    description: 'Score 2000 in one round',
    earned: (r) => r.score >= 2000,
  },
  {
    id: 'no-skip',
    hanzi: '完',
    name: 'Flawless',
    description: 'Solve 5+ hands with no skips',
    earned: (r) => r.skips === 0 && r.hands >= 5,
  },
  {
    id: 'lightning',
    hanzi: '速',
    name: 'Lightning',
    description: 'Solve a hand in under 3 seconds',
    earned: (r) => r.fastestSolve > 0 && r.fastestSolve <= 3,
  },
  {
    id: 'veteran',
    hanzi: '老',
    name: 'Veteran',
    description: 'Play 10 rounds',
    earned: (_r, s) => s.gamesPlayed >= 10,
  },
]

const KEY = 'solve24-achievements'

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export function loadUnlocked(): Set<string> {
  const raw = storage()?.getItem(KEY)
  if (!raw) return new Set()
  try {
    const parsed: unknown = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? (parsed as string[]) : [])
  } catch {
    return new Set()
  }
}

/**
 * Returns achievements newly earned this round (already-unlocked ones never
 * re-announce) and persists the updated set. `stats` must already include
 * this round (call recordRound first).
 */
export function evaluateRound(round: RoundSummary, stats: Stats): Achievement[] {
  const unlocked = loadUnlocked()
  const fresh = ACHIEVEMENTS.filter((a) => !unlocked.has(a.id) && a.earned(round, stats))
  if (fresh.length > 0) {
    for (const a of fresh) unlocked.add(a.id)
    storage()?.setItem(KEY, JSON.stringify([...unlocked]))
  }
  return fresh
}
