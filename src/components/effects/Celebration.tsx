import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import type { ComboTier } from '../../lib/scoring'
import Samurai from './Samurai'
import Emperor from './Emperor'
import Dragon from './Dragon'

const GOLD_RED = ['#f0c33c', '#e0a93c', '#c0392b', '#f5d56a', '#f4ead8']

function burst(tier: ComboTier) {
  const power = { none: 1, samurai: 1.5, emperor: 2.2, dragon: 3.2 }[tier]
  confetti({
    particleCount: Math.round(60 * power),
    spread: 70 + 30 * power,
    startVelocity: 35 + 10 * power,
    origin: { y: 0.6 },
    colors: GOLD_RED,
  })
  if (tier === 'emperor' || tier === 'dragon') {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: GOLD_RED,
    })
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: GOLD_RED,
    })
  }
}

interface CelebrationProps {
  points: number
  tier: ComboTier
}

/**
 * Full celebration overlay for a solved hand. The parent mounts this with a
 * unique key per solve and unmounts it ~2.2s later.
 */
export default function Celebration({ points, tier }: CelebrationProps) {
  useEffect(() => {
    burst(tier)
  }, [tier])

  return (
    <>
      {tier === 'samurai' && <Samurai />}
      {tier === 'emperor' && <Emperor />}
      {tier === 'dragon' && <Dragon />}
      <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-2">
        <div className="anim-speed-lines absolute">
          <svg width="480" height="480" viewBox="0 0 480 480" aria-hidden>
            <g stroke="#f4ead8" strokeWidth="2" opacity="0.7">
              {Array.from({ length: 18 }, (_, i) => {
                const a = (i * Math.PI) / 9
                return (
                  <line
                    key={i}
                    x1={240 + Math.cos(a) * 90}
                    y1={240 + Math.sin(a) * 90}
                    x2={240 + Math.cos(a) * 230}
                    y2={240 + Math.sin(a) * 230}
                  />
                )
              })}
            </g>
          </svg>
        </div>
        {tier === 'none' && (
          <span className="anim-stamp inline-block rounded-lg border-4 border-lantern-500 bg-lantern-600/90 px-5 py-2 font-brush text-6xl text-paper-100 shadow-2xl">
            正解!
          </span>
        )}
        <span className="anim-points font-arcade text-5xl text-gold-300 drop-shadow-lg">
          +{points} 分
        </span>
      </div>
    </>
  )
}
