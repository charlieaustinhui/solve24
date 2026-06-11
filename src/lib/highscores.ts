export interface HighScore {
  name: string
  score: number
  hands: number
  date: string
}

const KEY = 'solve24-highscores'
export const MAX_SCORES = 10
export const MAX_NAME_LENGTH = 10

/** localStorage is missing in tests (node) and can throw in private browsing. */
function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

/** Entries saved before the global leaderboard used 3-letter `initials`. */
function migrate(entry: unknown): HighScore | null {
  if (typeof entry !== 'object' || entry === null) return null
  const e = entry as Record<string, unknown>
  const name = e.name ?? e.initials
  if (typeof name !== 'string' || typeof e.score !== 'number') return null
  return {
    name,
    score: e.score,
    hands: typeof e.hands === 'number' ? e.hands : 0,
    date: typeof e.date === 'string' ? e.date : '',
  }
}

export function loadHighScores(): HighScore[] {
  const raw = storage()?.getItem(KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(migrate).filter((e): e is HighScore => e !== null)
  } catch {
    return []
  }
}

/** Does this score earn a spot on the board? */
export function qualifies(score: number): boolean {
  if (score <= 0) return false
  const scores = loadHighScores()
  if (scores.length < MAX_SCORES) return true
  return score > scores[scores.length - 1].score
}

/** Insert, sort descending, trim to top 10, persist. Returns the new board. */
export function addHighScore(entry: Omit<HighScore, 'date'>): HighScore[] {
  const scores = loadHighScores()
  scores.push({ ...entry, date: new Date().toISOString().slice(0, 10) })
  scores.sort((a, b) => b.score - a.score)
  const trimmed = scores.slice(0, MAX_SCORES)
  storage()?.setItem(KEY, JSON.stringify(trimmed))
  return trimmed
}
