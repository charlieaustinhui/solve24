import { useState } from 'react'
import StartScreen from './components/StartScreen'
import GameBoard from './components/GameBoard'
import GameOverModal from './components/GameOverModal'

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
      <GameOverModal
        score={result.score}
        hands={result.hands}
        onPlayAgain={onStart}
        onMenu={onMenu}
      />
    )
  }

  return <StartScreen onStart={onStart} />
}

export default App
