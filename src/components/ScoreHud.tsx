import type { Difficulty } from '../lib/deck'
import { streakMultiplier } from '../lib/scoring'
import ScoreTicker from './ScoreTicker'

const DIFFICULTY_LABEL: Record<Difficulty, { hanzi: string; className: string }> = {
  easy: { hanzi: '易', className: 'text-paper-200' },
  medium: { hanzi: '中', className: 'text-gold-400' },
  hard: { hanzi: '難', className: 'text-lantern-400' },
}

interface ScoreHudProps {
  score: number
  streak: number
  hands: number
  difficulty: Difficulty
}

export default function ScoreHud({ score, streak, hands, difficulty }: ScoreHudProps) {
  const mult = streakMultiplier(streak + 1)
  const level = DIFFICULTY_LABEL[difficulty]
  return (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center">
        <span className="text-xs tracking-widest text-paper-200/60 uppercase">Score</span>
        <span className="font-arcade text-3xl text-gold-400 tabular-nums">
          <ScoreTicker value={score} />
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs tracking-widest text-paper-200/60 uppercase">Streak</span>
        <span className="font-arcade text-3xl text-lantern-400 tabular-nums">
          {streak}
          {streak > 0 && (
            <span className="ml-1 text-sm text-gold-300">×{mult.toFixed(1)}</span>
          )}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs tracking-widest text-paper-200/60 uppercase">Solved</span>
        <span className="font-arcade text-3xl text-paper-100 tabular-nums">{hands}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs tracking-widest text-paper-200/60 uppercase">Level</span>
        <span className={`font-brush text-3xl ${level.className}`}>{level.hanzi}</span>
      </div>
    </div>
  )
}
