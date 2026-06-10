import { loadHighScores } from '../lib/highscores'
import HighScores from './HighScores'

interface StartScreenProps {
  onStart: () => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
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
          Tap a card, an operator, then another card to merge them. Hands get harder
          as your score climbs (中 at 500 · 難 at 1000). Solve fast for bonus points —
          chain solves to summon the samurai, the emperor… and the dragon. Cash out
          anytime with End round.
        </p>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="rounded-xl border-2 border-gold-400 bg-lantern-600 px-12 py-4 font-brush text-4xl text-paper-100 shadow-lg shadow-lantern-600/40 transition-transform hover:scale-105"
      >
        開始 · Start
      </button>

      <HighScores scores={loadHighScores()} />
    </main>
  )
}
