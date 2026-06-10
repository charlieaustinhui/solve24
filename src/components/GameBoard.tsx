import { useEffect, useRef, useState } from 'react'
import type { Rational } from '../lib/rational'
import { equals, format, rat } from '../lib/rational'
import type { Op } from '../lib/solver'
import { applyOp, solve, TARGET } from '../lib/solver'
import { HANZI, dealHand } from '../lib/deck'
import type { ComboTier } from '../lib/scoring'
import { ROUND_SECONDS, comboTier, handScore } from '../lib/scoring'
import { isMuted, sfx, toggleMuted } from '../lib/audio'
import Card from './Card'
import OperatorBar from './OperatorBar'
import Timer from './Timer'
import ScoreHud from './ScoreHud'
import Celebration from './effects/Celebration'

interface CardState {
  id: number
  value: Rational
  /** Set only for original dealt cards — drives the hanzi watermark. */
  base?: number
}

interface SolveFlash {
  points: number
  streak: number
  tier: ComboTier
  key: number
}

interface GameBoardProps {
  onGameOver: (score: number, hands: number) => void
}

export default function GameBoard({ onGameOver }: GameBoardProps) {
  const nextId = useRef(1)
  const makeCards = (hand: number[]): CardState[] =>
    hand.map((n) => ({ id: nextId.current++, value: rat(n), base: n }))

  const [hand, setHand] = useState<number[]>(() => dealHand())
  const [cards, setCards] = useState<CardState[]>(() => makeCards(hand))
  const [history, setHistory] = useState<CardState[][]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [op, setOp] = useState<Op | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [hands, setHands] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [toast, setToast] = useState<string | null>(null)
  const [flash, setFlash] = useState<SolveFlash | null>(null)
  const [muted, setMuted] = useState(isMuted)
  const handStart = useRef(Date.now())
  const endTime = useRef(Date.now() + ROUND_SECONDS * 1000)
  const over = useRef(false)

  // Refs mirror score/hands so the timer's closure always sees fresh values
  const scoreRef = useRef(score)
  const handsRef = useRef(hands)
  scoreRef.current = score
  handsRef.current = hands

  const lastTick = useRef(ROUND_SECONDS)

  useEffect(() => {
    const tick = setInterval(() => {
      const left = Math.max(0, (endTime.current - Date.now()) / 1000)
      setTimeLeft(left)
      const whole = Math.ceil(left)
      if (whole <= 10 && whole > 0 && whole !== lastTick.current) {
        lastTick.current = whole
        sfx.tick()
      }
      if (left <= 0 && !over.current) {
        over.current = true
        clearInterval(tick)
        sfx.gameOver()
        onGameOver(scoreRef.current, handsRef.current)
      }
    }, 200)
    return () => clearInterval(tick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (toast === null) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    if (flash === null) return
    const t = setTimeout(() => setFlash(null), 2200)
    return () => clearTimeout(t)
  }, [flash])

  function dealNext() {
    const fresh = dealHand()
    setHand(fresh)
    setCards(makeCards(fresh))
    setHistory([])
    setSelectedId(null)
    setOp(null)
    handStart.current = Date.now()
  }

  function handleSolve() {
    const seconds = (Date.now() - handStart.current) / 1000
    const newStreak = streak + 1
    const points = handScore(seconds, newStreak)
    const tier = comboTier(newStreak)
    setScore((s) => s + points)
    setStreak(newStreak)
    setHands((h) => h + 1)
    setFlash({ points, streak: newStreak, tier, key: Date.now() })
    sfx.solve()
    if (tier === 'samurai') sfx.slash()
    if (tier === 'emperor') sfx.fanfare()
    if (tier === 'dragon') sfx.dragon()
    dealNext()
  }

  function combine(aId: number, chosenOp: Op, bId: number) {
    const a = cards.find((c) => c.id === aId)!
    const b = cards.find((c) => c.id === bId)!
    const value = applyOp(chosenOp, a.value, b.value)
    if (value === null) {
      setToast('Cannot divide by zero!')
      sfx.error()
      setOp(null)
      return
    }
    const merged: CardState = { id: nextId.current++, value }
    const next = [...cards.filter((c) => c.id !== aId && c.id !== bId), merged]
    if (next.length === 1) {
      if (equals(value, TARGET)) {
        handleSolve()
        return
      }
      setToast(`That makes ${format(value)}, not 24 — undo and try again`)
      sfx.error()
    } else {
      sfx.merge()
    }
    setHistory((h) => [...h, cards])
    setCards(next)
    setSelectedId(null)
    setOp(null)
  }

  function handleCardClick(id: number) {
    sfx.tap()
    if (selectedId === null) {
      setSelectedId(id)
    } else if (selectedId === id) {
      setSelectedId(null)
      setOp(null)
    } else if (op === null) {
      setSelectedId(id)
    } else {
      combine(selectedId, op, id)
    }
  }

  function handleUndo() {
    const prev = history.at(-1)
    if (!prev) return
    setHistory((h) => h.slice(0, -1))
    setCards(prev)
    setSelectedId(null)
    setOp(null)
  }

  function handleReset() {
    setCards(makeCards(hand))
    setHistory([])
    setSelectedId(null)
    setOp(null)
  }

  function handleSkip() {
    const answer = solve(hand)
    setStreak(0)
    setToast(answer ? `One way: ${answer} = 24` : 'Skipped')
    dealNext()
  }

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-between gap-6 px-4 py-6 ${
        flash?.tier === 'dragon' ? 'anim-shake' : ''
      }`}
    >
      <header className="relative flex w-full max-w-2xl flex-col items-center gap-4">
        <ScoreHud score={score} streak={streak} hands={hands} />
        <Timer timeLeft={timeLeft} />
        <button
          type="button"
          onClick={() => setMuted(toggleMuted())}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          className={`absolute top-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border font-brush text-xl transition-colors ${
            muted
              ? 'border-paper-200/20 text-paper-200/40'
              : 'border-gold-500/60 text-gold-400'
          }`}
        >
          {muted ? '静' : '音'}
        </button>
      </header>

      <main className="flex flex-col items-center gap-8">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {cards.map((card) => (
            <Card
              key={card.id}
              label={format(card.value)}
              hanzi={card.base ? HANZI[card.base] : undefined}
              selected={selectedId === card.id}
              onClick={() => handleCardClick(card.id)}
            />
          ))}
        </div>
        <OperatorBar
          selected={op}
          onSelect={(o) => {
            sfx.tap()
            setOp(op === o ? null : o)
          }}
        />
      </main>

      <footer className="flex items-center gap-3 pb-2">
        <button
          type="button"
          onClick={handleUndo}
          disabled={history.length === 0}
          className="rounded-lg border border-paper-200/30 px-5 py-2 font-arcade text-lg text-paper-200 transition-colors hover:border-paper-200/60 disabled:opacity-30"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={history.length === 0}
          className="rounded-lg border border-paper-200/30 px-5 py-2 font-arcade text-lg text-paper-200 transition-colors hover:border-paper-200/60 disabled:opacity-30"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleSkip}
          className="rounded-lg border border-lantern-500/60 px-5 py-2 font-arcade text-lg text-lantern-400 transition-colors hover:border-lantern-400"
        >
          Skip
        </button>
      </footer>

      {toast && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-lg bg-ink-700 px-5 py-2 font-arcade text-lg text-paper-100 shadow-lg">
          {toast}
        </div>
      )}

      {flash && <Celebration key={flash.key} points={flash.points} tier={flash.tier} />}
    </div>
  )
}
