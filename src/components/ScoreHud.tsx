import { streakMultiplier } from '../lib/scoring'

interface ScoreHudProps {
  score: number
  streak: number
  hands: number
}

export default function ScoreHud({ score, streak, hands }: ScoreHudProps) {
  const mult = streakMultiplier(streak + 1)
  return (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center">
        <span className="text-xs tracking-widest text-paper-200/60 uppercase">Score</span>
        <span className="font-arcade text-3xl text-gold-400 tabular-nums">{score}</span>
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
    </div>
  )
}
