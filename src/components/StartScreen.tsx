import { useState } from 'react'
import { ACHIEVEMENTS, loadUnlocked } from '../lib/achievements'
import { loadStats } from '../lib/stats'
import LeaderboardTabs from './LeaderboardTabs'

interface StartScreenProps {
  onStart: () => void
}

type Panel = 'none' | 'stats' | 'badges'

function StatsPanel() {
  const s = loadStats()
  const attempts = s.handsSolved + s.skips
  const rows: [string, string][] = [
    ['Rounds played', String(s.gamesPlayed)],
    ['Hands solved', String(s.handsSolved)],
    ['Solve rate', attempts > 0 ? `${Math.round((s.handsSolved / attempts) * 100)}%` : '—'],
    ['Best score', String(s.bestScore)],
    ['Best streak', String(s.bestStreak)],
    ['Fastest solve', s.fastestSolve > 0 ? `${s.fastestSolve.toFixed(1)}s` : '—'],
  ]
  return (
    <div className="grid w-full max-w-sm grid-cols-2 gap-x-6 gap-y-2 rounded-xl border border-gold-600/40 bg-ink-900/80 px-5 py-4">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-paper-200/60">{label}</span>
          <span className="font-arcade text-lg text-gold-300 tabular-nums">{value}</span>
        </div>
      ))}
    </div>
  )
}

function BadgesPanel() {
  const unlocked = loadUnlocked()
  return (
    <div className="grid w-full max-w-sm grid-cols-3 gap-2 rounded-xl border border-gold-600/40 bg-ink-900/80 p-4">
      {ACHIEVEMENTS.map((a) => {
        const got = unlocked.has(a.id)
        return (
          <div
            key={a.id}
            title={a.description}
            className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-center ${
              got ? 'border-gold-500/60 bg-ink-800' : 'border-paper-200/10 opacity-40'
            }`}
          >
            <span className={`font-brush text-3xl ${got ? 'text-gold-400' : 'text-paper-200/50'}`}>
              {a.hanzi}
            </span>
            <span className="text-[10px] leading-tight text-paper-200/80">{a.name}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const [panel, setPanel] = useState<Panel>('none')
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="font-brush text-6xl whitespace-nowrap text-gold-400 sm:text-8xl">
          算二十四
        </h1>
        <p className="font-arcade text-2xl tracking-[0.4em] text-paper-200 sm:text-3xl">
          SOLVE 24
        </p>
      </div>

      <div className="max-w-md rounded-xl border border-gold-600/40 bg-ink-900/80 p-6 text-center">
        <p className="text-lg leading-relaxed text-paper-200">
          Four cards. Three minutes. Combine{' '}
          <span className="text-gold-400">all four</span> with{' '}
          <span className="font-arcade text-gold-400">+ − × ÷</span> to make{' '}
          <span className="font-arcade text-2xl text-lantern-400">24</span>.
        </p>
        <p className="mt-3 text-sm text-paper-200/70">
          Tap a card, an operator, then another card to merge them. Climb from the
          bamboo forest to the emperor's court to the dragon sky (中 at 1000 · 難 at
          1750). Solve fast for bonus points — chain solves to summon the samurai,
          the emperor… and the dragon. Cash out anytime with End round.
        </p>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="rounded-xl border-2 border-gold-400 bg-lantern-600 px-12 py-4 font-brush text-4xl text-paper-100 shadow-lg shadow-lantern-600/40 transition-transform hover:scale-105"
      >
        開始 · Start
      </button>

      <LeaderboardTabs />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setPanel(panel === 'stats' ? 'none' : 'stats')}
          className={`rounded-lg border px-4 py-1.5 font-arcade text-sm transition-transform ${
            panel === 'stats'
              ? 'border-gold-400 text-gold-300'
              : 'border-paper-200/30 text-paper-200 hover:border-paper-200/60'
          }`}
        >
          戰績 · Stats
        </button>
        <button
          type="button"
          onClick={() => setPanel(panel === 'badges' ? 'none' : 'badges')}
          className={`rounded-lg border px-4 py-1.5 font-arcade text-sm transition-transform ${
            panel === 'badges'
              ? 'border-gold-400 text-gold-300'
              : 'border-paper-200/30 text-paper-200 hover:border-paper-200/60'
          }`}
        >
          成就 · Badges
        </button>
      </div>

      {panel === 'stats' && <StatsPanel />}
      {panel === 'badges' && <BadgesPanel />}
    </main>
  )
}
