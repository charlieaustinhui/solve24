import { useEffect, useState } from 'react'
import type { HighScore } from '../lib/highscores'
import { addHighScore, loadHighScores, qualifies } from '../lib/highscores'
import { sfx } from '../lib/audio'
import HighScores from './HighScores'
import Dragon from './effects/Dragon'

interface GameOverModalProps {
  score: number
  hands: number
  onPlayAgain: () => void
  onMenu: () => void
}

export default function GameOverModal({ score, hands, onPlayAgain, onMenu }: GameOverModalProps) {
  const [isRecord] = useState(() => qualifies(score))
  const [initials, setInitials] = useState('')
  const [scores, setScores] = useState<HighScore[]>(loadHighScores)
  const [savedRank, setSavedRank] = useState<number | undefined>(undefined)
  const [showDragon, setShowDragon] = useState(isRecord)
  const entering = isRecord && savedRank === undefined

  useEffect(() => {
    if (!isRecord) return
    sfx.highScore()
    const t = setTimeout(() => setShowDragon(false), 2400)
    return () => clearTimeout(t)
  }, [isRecord])

  function save() {
    const name = (initials || 'AAA').padEnd(3, 'A').slice(0, 3)
    const board = addHighScore({ initials: name, score, hands })
    setScores(board)
    setSavedRank(board.findIndex((s) => s.initials === name && s.score === score))
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-8">
      {showDragon && <Dragon />}
      {isRecord ? (
        <h1 className="font-brush text-7xl text-gold-400">新紀錄!</h1>
      ) : (
        <h1 className="font-brush text-7xl text-lantern-400">時間到</h1>
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

      {entering ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
          className="flex flex-col items-center gap-3 rounded-xl border border-gold-600/40 bg-ink-900/80 px-8 py-5"
        >
          <label htmlFor="initials" className="font-arcade text-sm tracking-widest text-paper-200">
            ENTER YOUR INITIALS
          </label>
          <input
            id="initials"
            autoFocus
            value={initials}
            onChange={(e) =>
              setInitials(
                e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z]/g, '')
                  .slice(0, 3),
              )
            }
            placeholder="AAA"
            className="w-32 rounded-lg border-2 border-gold-500 bg-ink-950 px-3 py-2 text-center font-arcade text-4xl tracking-[0.3em] text-gold-300 outline-none placeholder:text-paper-200/20"
          />
          <button
            type="submit"
            className="rounded-lg border-2 border-gold-400 bg-lantern-600 px-6 py-2 font-brush text-2xl text-paper-100 transition-transform hover:scale-105"
          >
            刻名 · Engrave
          </button>
        </form>
      ) : (
        <HighScores scores={scores} highlight={savedRank} />
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
