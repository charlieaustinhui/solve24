export interface RoundSummary {
  score: number
  hands: number
  bestStreak: number
  /** Fastest single solve this round in seconds; 0 = no solves. */
  fastestSolve: number
  skips: number
}

export interface Stats {
  gamesPlayed: number
  handsSolved: number
  skips: number
  bestScore: number
  bestStreak: number
  /** All-time fastest solve in seconds; 0 = none yet. */
  fastestSolve: number
  totalScore: number
}

const KEY = 'solve24-stats'

const EMPTY: Stats = {
  gamesPlayed: 0,
  handsSolved: 0,
  skips: 0,
  bestScore: 0,
  bestStreak: 0,
  fastestSolve: 0,
  totalScore: 0,
}

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export function loadStats(): Stats {
  const raw = storage()?.getItem(KEY)
  if (!raw) return { ...EMPTY }
  try {
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<Stats>) }
  } catch {
    return { ...EMPTY }
  }
}

/** Fold a finished round into the lifetime stats and persist. */
export function recordRound(round: RoundSummary): Stats {
  const s = loadStats()
  const next: Stats = {
    gamesPlayed: s.gamesPlayed + 1,
    handsSolved: s.handsSolved + round.hands,
    skips: s.skips + round.skips,
    bestScore: Math.max(s.bestScore, round.score),
    bestStreak: Math.max(s.bestStreak, round.bestStreak),
    fastestSolve:
      round.fastestSolve > 0 && (s.fastestSolve === 0 || round.fastestSolve < s.fastestSolve)
        ? round.fastestSolve
        : s.fastestSolve,
    totalScore: s.totalScore + round.score,
  }
  storage()?.setItem(KEY, JSON.stringify(next))
  return next
}
