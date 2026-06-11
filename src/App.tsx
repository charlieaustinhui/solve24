import { useState } from 'react'
import StartScreen from './components/StartScreen'
import GameBoard from './components/GameBoard'
import GameOverModal from './components/GameOverModal'
import type { Achievement } from './lib/achievements'
import { evaluateRound } from './lib/achievements'
import type { RoundSummary } from './lib/stats'
import { recordRound } from './lib/stats'

type Phase = 'idle' | 'playing' | 'gameover'

interface Result {
  summary: RoundSummary
  newAchievements: Achievement[]
  /** Signed round token to submit with a global high score (null if offline). */
  token: string | null
}

const EMPTY_RESULT: Result = {
  summary: { score: 0, hands: 0, bestStreak: 0, fastestSolve: 0, skips: 0 },
  newAchievements: [],
  token: null,
}

function App() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<Result>(EMPTY_RESULT)

  return (
    <>
      {phase !== 'playing' && (
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <img
            src="/backgrounds/menu.png"
            alt=""
            className="anim-bg-drift absolute inset-0 h-full w-full object-cover will-change-transform"
          />
          <div className="absolute inset-0 bg-ink-950/55" />
        </div>
      )}
      <div className="relative">
        <Screen
          phase={phase}
          result={result}
          onStart={() => setPhase('playing')}
          onMenu={() => setPhase('idle')}
          onGameOver={(summary, token) => {
            // Event handler runs exactly once per round (effects can double
            // under StrictMode) — safe place to write stats
            const stats = recordRound(summary)
            setResult({ summary, newAchievements: evaluateRound(summary, stats), token })
            setPhase('gameover')
          }}
        />
      </div>
    </>
  )
}

interface ScreenProps {
  phase: Phase
  result: Result
  onStart: () => void
  onMenu: () => void
  onGameOver: (summary: RoundSummary, token: string | null) => void
}

function Screen({ phase, result, onStart, onMenu, onGameOver }: ScreenProps) {
  if (phase === 'playing') {
    return <GameBoard onGameOver={onGameOver} />
  }

  if (phase === 'gameover') {
    return (
      <GameOverModal
        score={result.summary.score}
        hands={result.summary.hands}
        newAchievements={result.newAchievements}
        roundToken={result.token}
        onPlayAgain={onStart}
        onMenu={onMenu}
      />
    )
  }

  return <StartScreen onStart={onStart} />
}

export default App
