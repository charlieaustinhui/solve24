import { useState } from 'react'
import StartScreen from './components/StartScreen'
import GameBoard from './components/GameBoard'
import GameOverModal from './components/GameOverModal'
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
      {phase !== 'playing' && <Lanterns />}
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
