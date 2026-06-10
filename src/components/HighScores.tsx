import type { HighScore } from '../lib/highscores'

const RANK_HANZI = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

interface HighScoresProps {
  scores: HighScore[]
  /** Rank (0-based) to highlight as the freshly added entry. */
  highlight?: number
}

/** 英雄榜 — the hall of heroes. */
export default function HighScores({ scores, highlight }: HighScoresProps) {
  if (scores.length === 0) {
    return (
      <p className="text-sm text-paper-200/50">
        No scores yet — be the first hero on the board.
      </p>
    )
  }
  return (
    <div className="w-full max-w-sm rounded-xl border border-gold-600/40 bg-ink-900/80 px-5 py-4">
      <h2 className="mb-3 text-center font-brush text-3xl text-gold-400">英雄榜</h2>
      <ol className="flex flex-col gap-1">
        {scores.map((s, i) => (
          <li
            key={`${s.initials}-${s.score}-${i}`}
            className={`flex items-center gap-3 rounded-md px-2 py-1 font-arcade text-lg ${
              i === highlight
                ? 'bg-lantern-600/40 text-gold-300'
                : i === 0
                  ? 'text-gold-400'
                  : 'text-paper-200'
            }`}
          >
            <span className="w-6 text-center font-brush text-xl text-lantern-400">
              {RANK_HANZI[i]}
            </span>
            <span className="w-12 tracking-widest">{s.initials}</span>
            <span className="flex-1 text-right tabular-nums">{s.score}</span>
            <span className="w-16 text-right text-xs text-paper-200/50">
              {s.hands} hand{s.hands === 1 ? '' : 's'}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
