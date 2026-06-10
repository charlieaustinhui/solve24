import { useState } from 'react'
import StartScreen from './components/StartScreen'
import GameBoard from './components/GameBoard'
import Lanterns from './components/effects/Lanterns'

type Phase = 'idle' | 'playing' | 'gameover'

interface Result {
  score: number
  hands: number
}

function App() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<Result>({ score: 0, hands: 0 })

  return (
    <>
      <Lanterns />
      <div className="relative">
        <Screen
          phase={phase}
          result={result}
          onStart={() => setPhase('playing')}
          onMenu={() => setPhase('idle')}
          onGameOver={(score, hands) => {
            setResult({ score, hands })
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
  onGameOver: (score: number, hands: number) => void
}

function Screen({ phase, result, onStart, onMenu, onGameOver }: ScreenProps) {
  if (phase === 'playing') {
    return <GameBoard onGameOver={onGameOver} />
  }

  if (phase === 'gameover') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-brush text-7xl text-lantern-400">時間到</h1>
        <p className="font-arcade text-xl tracking-widest text-paper-200">TIME'S UP</p>
        <div className="flex flex-col items-center gap-1">
          <span className="font-arcade text-6xl text-gold-400 tabular-nums">
            {result.score}
          </span>
          <span className="text-sm text-paper-200/70">
            {result.hands} hand{result.hands === 1 ? '' : 's'} solved
          </span>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onStart}
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

  return <StartScreen onStart={onStart} />
}

export default App
