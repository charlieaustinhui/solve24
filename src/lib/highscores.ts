export interface HighScore {
  initials: string
  score: number
  hands: number
  date: string
}

const KEY = 'solve24-highscores'
export const MAX_SCORES = 10

/** localStorage is missing in tests (node) and can throw in private browsing. */
function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export function loadHighScores(): HighScore[] {
  const raw = storage()?.getItem(KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as HighScore[]
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
