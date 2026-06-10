import { ROUND_SECONDS } from '../lib/scoring'

interface TimerProps {
  timeLeft: number
}

function formatClock(seconds: number): string {
  const whole = Math.ceil(seconds)
  const m = Math.floor(whole / 60)
  const s = whole % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function Timer({ timeLeft }: TimerProps) {
  const urgent = timeLeft <= 10
  const pct = Math.max(0, (timeLeft / ROUND_SECONDS) * 100)
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-1">
      <span
        className={`font-arcade text-4xl tabular-nums ${
          urgent ? 'animate-pulse text-lantern-400' : 'text-paper-100'
        }`}
      >
        {formatClock(timeLeft)}
      </span>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-700">
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${
            urgent ? 'bg-lantern-500' : 'bg-gold-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
