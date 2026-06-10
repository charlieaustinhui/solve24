import { useState } from 'react'
import type { Difficulty } from '../../lib/deck'

function Leaf({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 0.45} viewBox="0 0 40 18" aria-hidden>
      <path d="M2 9 Q12 0 38 7 Q14 18 2 9 Z" fill="#7ba05b" />
      <path d="M2 9 Q20 8 38 7" fill="none" stroke="#4a7340" strokeWidth="1.2" />
    </svg>
  )
}

function Coin({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#e0a93c" stroke="#c9931f" strokeWidth="1.5" />
      <rect x="8.5" y="8.5" width="7" height="7" fill="#16301c" opacity="0.35" />
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="#f5d56a" strokeWidth="1" />
    </svg>
  )
}

function StormCloud({ width }: { width: number }) {
  return (
    <svg width={width} height={width * 0.4} viewBox="0 0 160 64" aria-hidden>
      <g fill="#1d1838" opacity="0.85">
        <ellipse cx="42" cy="44" rx="40" ry="18" />
        <ellipse cx="88" cy="32" rx="46" ry="24" />
        <ellipse cx="128" cy="46" rx="34" ry="16" />
      </g>
    </svg>
  )
}

const LEAVES = Array.from({ length: 10 }, (_, i) => ({
  left: `${(i * 9.7 + 3) % 96}%`,
  size: 22 + ((i * 7) % 18),
  duration: `${9 + (i % 5) * 1.7}s`,
  delay: `${-(i * 1.9)}s`,
}))

const GOLD = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7.3 + 2) % 97}%`,
  size: i % 3 === 0 ? 16 : 9,
  duration: `${3.5 + (i % 4) * 0.8}s`,
  delay: `${-(i * 0.9)}s`,
}))

const STORM = [
  { top: '8%', width: 260, duration: '55s', delay: '-30s' },
  { top: '30%', width: 340, duration: '38s', delay: '-10s' },
  { top: '58%', width: 220, duration: '70s', delay: '-50s' },
  { top: '78%', width: 300, duration: '45s', delay: '-22s' },
]

/**
 * Per-difficulty scene: user-supplied art from /public/backgrounds/{tier}.png
 * (hidden if missing — the ink body background shows through), a readability
 * scrim, and an ambient particle layer: bamboo leaves / falling gold / storm clouds.
 */
export default function Background({ difficulty }: { difficulty: Difficulty }) {
  const [failed, setFailed] = useState<Partial<Record<Difficulty, boolean>>>({})

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {!failed[difficulty] && (
        <img
          key={difficulty}
          src={`/backgrounds/${difficulty}.png`}
          onError={() => setFailed((f) => ({ ...f, [difficulty]: true }))}
          alt=""
          className="anim-bg-drift absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-ink-950/60" />

      {difficulty === 'easy' &&
        LEAVES.map((l, i) => (
          <div
            key={i}
            className="anim-leaf absolute top-0"
            style={{ left: l.left, animationDuration: l.duration, animationDelay: l.delay }}
          >
            <Leaf size={l.size} />
          </div>
        ))}

      {difficulty === 'medium' &&
        GOLD.map((g, i) => (
          <div
            key={i}
            className="anim-gold absolute top-0"
            style={{ left: g.left, animationDuration: g.duration, animationDelay: g.delay }}
          >
            <Coin size={g.size} />
          </div>
        ))}

      {difficulty === 'hard' &&
        STORM.map((c, i) => (
          <div
            key={i}
            className="anim-cloud absolute"
            style={{ top: c.top, animationDuration: c.duration, animationDelay: c.delay }}
          >
            <StormCloud width={c.width} />
          </div>
        ))}
    </div>
  )
}
