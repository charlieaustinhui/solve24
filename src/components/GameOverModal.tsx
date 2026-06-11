import { useEffect, useState } from 'react'
import type { Achievement } from '../lib/achievements'
import type { HighScore } from '../lib/highscores'
import { MAX_NAME_LENGTH, addHighScore, loadHighScores, qualifies } from '../lib/highscores'
import {
  fetchGlobalScores,
  globalQualifies,
  isNameAllowed,
  submitGlobalScore,
} from '../lib/leaderboard'
import { sfx } from '../lib/audio'
import LeaderboardTabs from './LeaderboardTabs'
import Dragon from './effects/Dragon'

interface GameOverModalProps {
  score: number
  hands: number
  newAchievements: Achievement[]
  onPlayAgain: () => void
  onMenu: () => void
}

interface SavedBoards {
  local: HighScore[]
  localRank?: number
  global: HighScore[] | null
  globalRank?: number
}

export default function GameOverModal({
  score,
  hands,
  newAchievements,
  onPlayAgain,
  onMenu,
}: GameOverModalProps) {
  const [localRecord] = useState(() => qualifies(score))
  const [globalBoard, setGlobalBoard] = useState<HighScore[] | null | 'loading'>('loading')
  const [name, setName] = useState('')
  const [nameRejected, setNameRejected] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<SavedBoards | null>(null)
  const [dragonDone, setDragonDone] = useState(false)

  useEffect(() => {
    let alive = true
    void fetchGlobalScores().then((board) => {
      if (alive) setGlobalBoard(board)
    })
    return () => {
      alive = false
    }
  }, [])

  // A global-only record can arrive after the fetch resolves, flipping this on late.
  const globalRecord = Array.isArray(globalBoard) && globalQualifies(score, globalBoard)
  const isRecord = localRecord || globalRecord
  const entering = isRecord && saved === null

  useEffect(() => {
    if (!isRecord) return
    sfx.highScore()
    const t = setTimeout(() => setDragonDone(true), 2400)
    return () => clearTimeout(t)
  }, [isRecord])
  const showDragon = isRecord && !dragonDone

  async function save() {
    const trimmed = name.trim()
    if (trimmed.length === 0 || saving) return
    if (!isNameAllowed(trimmed)) {
      setNameRejected(true)
      return
    }
    setSaving(true)
    // Local board first — synchronous, can't fail.
    const local = localRecord
      ? addHighScore({ name: trimmed, score, hands })
      : loadHighScores()
    const localRank = local.findIndex((s) => s.name === trimmed && s.score === score)
    // The game submits its own score; the player only contributed the name.
    const global = await submitGlobalScore({ name: trimmed, score, hands })
    const globalRank = global?.findIndex((s) => s.name === trimmed && s.score === score)
    setSaved({
      local,
      localRank: localRank >= 0 ? localRank : undefined,
      global,
      globalRank: globalRank !== undefined && globalRank >= 0 ? globalRank : undefined,
    })
    setSaving(false)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-8">
      {showDragon && <Dragon />}
      {isRecord ? (
        <h1 className="font-brush text-5xl whitespace-nowrap text-gold-400 sm:text-7xl">
          新紀錄!
        </h1>
      ) : (
        <h1 className="font-brush text-5xl whitespace-nowrap text-lantern-400 sm:text-7xl">
          時間到
        </h1>
      )}
      <p className="font-arcade text-xl tracking-widest text-paper-200">
        {isRecord ? 'NEW HIGH SCORE' : "TIME'S UP"}
      </p>

      <div className="flex flex-col items-center gap-1">
        <span className="font-arcade text-6xl text-gold-400 tabular-nums">{score}</span>
        <span className="text-sm text-paper-200/70">
          {hands} hand{hands === 1 ? '' : 's'} solved
        </span>
      </div>

      {newAchievements.length > 0 && (
        <div className="flex max-w-md flex-wrap items-center justify-center gap-2">
          {newAchievements.map((a) => (
            <span
              key={a.id}
              className="flex items-center gap-2 rounded-lg border border-gold-500/60 bg-ink-900/90 px-3 py-1.5"
            >
              <span className="font-brush text-2xl text-gold-400">{a.hanzi}</span>
              <span className="font-arcade text-sm text-paper-100">{a.name}</span>
            </span>
          ))}
        </div>
      )}

      {entering ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void save()
          }}
          className="flex flex-col items-center gap-3 rounded-xl border border-gold-600/40 bg-ink-900/80 px-8 py-5"
        >
          <label htmlFor="player-name" className="font-arcade text-sm tracking-widest text-paper-200">
            ENTER YOUR NAME
          </label>
          <input
            id="player-name"
            autoFocus
            value={name}
            onChange={(e) => {
              setNameRejected(false)
              setName(
                e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9 ]/g, '')
                  .slice(0, MAX_NAME_LENGTH),
              )
            }}
            placeholder="YOUR NAME"
            className="w-72 rounded-lg border-2 border-gold-500 bg-ink-950 px-3 py-2 text-center font-arcade text-2xl tracking-[0.15em] text-gold-300 outline-none placeholder:text-paper-200/20"
          />
          {nameRejected && (
            <p className="font-arcade text-xs text-lantern-400">
              THAT NAME ISN'T ALLOWED — PICK ANOTHER
            </p>
          )}
          <button
            type="submit"
            disabled={name.trim().length === 0 || saving}
            className="rounded-lg border-2 border-gold-400 bg-lantern-600 px-6 py-2 font-brush text-2xl text-paper-100 transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {saving ? '刻名中…' : '刻名 · Engrave'}
          </button>
        </form>
      ) : saved !== null ? (
        <LeaderboardTabs
          globalScores={saved.global}
          localScores={saved.local}
          globalHighlight={saved.globalRank}
          localHighlight={saved.localRank}
        />
      ) : (
        <LeaderboardTabs globalScores={globalBoard} />
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onPlayAgain}
          className="rounded-xl border-2 border-gold-400 bg-lantern-600 px-8 py-3 font-brush text-2xl text-paper-100 transition-transform hover:scale-105"
        >
          再来 · Play again
        </button>
        <button
          type="button"
          onClick={onMenu}
          className="rounded-xl border border-paper-200/30 px-8 py-3 font-arcade text-lg text-paper-200 transition-colors hover:border-paper-200/60"
        >
          Menu
        </button>
      </div>
    </main>
  )
}
