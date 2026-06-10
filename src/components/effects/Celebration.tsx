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
      {/* Banner anchors to the board layout (absolute, above the footer
          controls), never over the cards — fixed positioning would drift
          with viewport scroll */}
      <div className="pointer-events-none absolute inset-x-0 bottom-24 z-50 flex flex-row items-center justify-center gap-4">
        <div className="absolute">
          <svg width="280" height="280" viewBox="0 0 280 280" aria-hidden className="anim-speed-lines">
            <g stroke="#f4ead8" strokeWidth="1.5" opacity="0.6">
              {Array.from({ length: 18 }, (_, i) => {
                const a = (i * Math.PI) / 9
                return (
                  <line
                    key={i}
                    x1={140 + Math.cos(a) * 55}
                    y1={140 + Math.sin(a) * 55}
                    x2={140 + Math.cos(a) * 135}
                    y2={140 + Math.sin(a) * 135}
                  />
                )
              })}
            </g>
          </svg>
        </div>
        {tier === 'none' && (
          <span className="anim-stamp inline-block rounded-lg border-4 border-lantern-500 bg-lantern-600/90 px-4 py-1 font-brush text-4xl text-paper-100 shadow-2xl">
            正解!
          </span>
        )}
        <span className="anim-points font-arcade text-4xl text-gold-300 drop-shadow-lg">
          +{points} 分
        </span>
      </div>
    </>
  )
}
