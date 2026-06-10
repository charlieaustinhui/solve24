import { useEffect, useRef, useState } from 'react'
import type { Rational } from '../lib/rational'
import { equals, format, rat } from '../lib/rational'
import type { Op } from '../lib/solver'
import { applyOp, solve, TARGET } from '../lib/solver'
import type { Difficulty } from '../lib/deck'
import { HANZI, dealHand } from '../lib/deck'
import type { ComboTier } from '../lib/scoring'
import { ROUND_SECONDS, comboTier, difficultyForScore, handScore } from '../lib/scoring'
import { isMuted, sfx, toggleMuted } from '../lib/audio'
import Card from './Card'
import OperatorBar from './OperatorBar'
import Timer from './Timer'
import type { RoundSummary } from '../lib/stats'
import ScoreHud from './ScoreHud'
import Celebration from './effects/Celebration'
import Background from './effects/Background'

// ?level=easy|medium|hard pins the scene for previews/testing
function forcedLevelFromUrl(): Difficulty | null {
  const p = new URLSearchParams(window.location.search).get('level')
  return p === 'easy' || p === 'medium' || p === 'hard' ? p : null
}

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
  onGameOver: (summary: RoundSummary) => void
}

export default function GameBoard({ onGameOver }: GameBoardProps) {
  const [forcedLevel] = useState(forcedLevelFromUrl)
  const [hand, setHand] = useState<number[]>(() => dealHand(forcedLevel ?? 'easy'))
  const [cards, setCards] = useState<CardState[]>(() =>
    hand.map((n, i) => ({ id: i + 1, value: rat(n), base: n })),
  )
  const nextId = useRef(hand.length + 1)
  // Only called from event handlers — refs must not be touched during render
  const makeCards = (fresh: number[]): CardState[] =>
    fresh.map((n) => ({ id: nextId.current++, value: rat(n), base: n }))
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
  const [finished, setFinished] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>(forcedLevel ?? 'easy')
  const [levelUp, setLevelUp] = useState<Difficulty | null>(null)
  // Wall-clock time flows only through these refs, written in effects/handlers,
  // so render stays pure (react-hooks/purity)
  const nowRef = useRef(0)
  const handStart = useRef(0)
  const endTime = useRef(0)
  const lastTick = useRef(ROUND_SECONDS)
  const shownSecond = useRef(ROUND_SECONDS)
  const flashKey = useRef(0)
  // Round-summary tracking for stats/achievements (refs: written in handlers)
  const bestStreakRef = useRef(0)
  const fastestRef = useRef(0)
  const skipsRef = useRef(0)

  useEffect(() => {
    const start = Date.now()
    nowRef.current = start
    handStart.current = start
    endTime.current = start + ROUND_SECONDS * 1000
    const tick = setInterval(() => {
      const now = Date.now()
      nowRef.current = now
      const left = Math.max(0, (endTime.current - now) / 1000)
      const whole = Math.ceil(left)
      // Only re-render when the displayed second changes (1/sec), not every
      // 200ms poll — constant full-tree renders were delaying click handling
      if (whole !== shownSecond.current) {
        shownSecond.current = whole
        setTimeLeft(left)
      }
      if (whole <= 10 && whole > 0 && whole !== lastTick.current) {
        lastTick.current = whole
        sfx.tick()
      }
      if (left <= 0) {
        clearInterval(tick)
        sfx.gameOver()
        setFinished(true)
      }
    }, 200)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    if (finished)
      onGameOver({
        score,
        hands,
        bestStreak: bestStreakRef.current,
        fastestSolve: fastestRef.current,
        skips: skipsRef.current,
      })
  }, [finished, score, hands, onGameOver])

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

  useEffect(() => {
    if (levelUp === null) return
    const t = setTimeout(() => setLevelUp(null), 2200)
    return () => clearTimeout(t)
  }, [levelUp])

  function dealNext(currentScore: number) {
    const tier = forcedLevel ?? difficultyForScore(currentScore)
    if (tier !== difficulty) {
      setDifficulty(tier)
      setLevelUp(tier)
      sfx.levelUp()
    }
    const fresh = dealHand(tier)
    setHand(fresh)
    setCards(makeCards(fresh))
    setHistory([])
    setSelectedId(null)
    setOp(null)
    handStart.current = nowRef.current
  }

  function handleSolve() {
    const seconds = (nowRef.current - handStart.current) / 1000
    const newStreak = streak + 1
    const points = handScore(seconds, newStreak)
    const tier = comboTier(newStreak)
    bestStreakRef.current = Math.max(bestStreakRef.current, newStreak)
    if (fastestRef.current === 0 || seconds < fastestRef.current) fastestRef.current = seconds
    setScore((s) => s + points)
    setStreak(newStreak)
    setHands((h) => h + 1)
    flashKey.current += 1
    setFlash({ points, streak: newStreak, tier, key: flashKey.current })
    sfx.solve()
    if (tier === 'samurai') sfx.slash()
    if (tier === 'emperor') sfx.fanfare()
    if (tier === 'dragon') sfx.dragon()
    dealNext(score + points)
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
    skipsRef.current += 1
    setStreak(0)
    setToast(answer ? `One way: ${answer} = 24` : 'Skipped')
    dealNext(score)
  }

  function handleEndEarly() {
    sfx.gameOver()
    setFinished(true)
  }

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-between gap-6 px-4 py-6 ${
        flash?.tier === 'dragon' ? 'anim-shake' : ''
      }`}
    >
      <Background difficulty={difficulty} />
      <header className="relative flex w-full max-w-2xl flex-col items-center gap-4">
        {forcedLevel && (
          <span className="absolute top-0 left-0 rounded-md border border-gold-500/40 bg-ink-900/80 px-2 py-1 font-arcade text-xs text-gold-400/90">
            scene pinned ({forcedLevel}) — remove ?level from the URL to play normally
          </span>
        )}
        <ScoreHud score={score} streak={streak} hands={hands} difficulty={difficulty} />
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
          {cards.map((card, i) => (
            <Card
              key={card.id}
              label={format(card.value)}
              hanzi={card.base ? HANZI[card.base] : undefined}
              selected={selectedId === card.id}
              difficulty={difficulty}
              entrance={card.base ? 'deal' : 'pop'}
              delayMs={card.base ? i * 60 : 0}
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
        <button
          type="button"
          onClick={handleEndEarly}
          className="rounded-lg border border-gold-500/50 px-5 py-2 font-arcade text-lg text-gold-400 transition-colors hover:border-gold-400"
        >
          End round
        </button>
      </footer>

      {toast && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-lg bg-ink-700 px-5 py-2 font-arcade text-lg text-paper-100 shadow-lg">
          {toast}
        </div>
      )}

      {flash && <Celebration key={flash.key} points={flash.points} tier={flash.tier} />}

      {levelUp && (
        <div
          key={levelUp}
          className="pointer-events-none absolute top-[10%] left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-1"
        >
          <span
            className={`anim-stamp inline-block rounded-lg border-4 px-5 py-2 font-brush text-7xl shadow-2xl ${
              levelUp === 'hard'
                ? 'border-lantern-400 bg-lantern-600/95 text-gold-300'
                : 'border-gold-300 bg-gold-500/95 text-ink-950'
            }`}
          >
            {levelUp === 'hard' ? '難' : '中'}
          </span>
          <span className="anim-points font-arcade text-2xl tracking-[0.3em] text-paper-100">
            LEVEL UP
          </span>
        </div>
      )}
    </div>
  )
}
