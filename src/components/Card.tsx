import type { Difficulty } from '../lib/deck'

// Each scene gets its own card palette — always dark so cards stay distinct
// against the bright background art
const SKIN: Record<Difficulty, { base: string; watermark: string; corner: string }> = {
  easy: {
    base: 'border-[#7ba05b]/80 bg-[#16301c] hover:border-[#a8c686]',
    watermark: 'text-[#7ba05b]/30',
    corner: 'text-[#a8c686]/90',
  },
  medium: {
    base: 'border-gold-400/90 bg-[#3a1410] hover:border-gold-300',
    watermark: 'text-gold-500/25',
    corner: 'text-gold-300/90',
  },
  hard: {
    base: 'border-lantern-600/70 bg-ink-800 hover:border-gold-500/70',
    watermark: 'text-lantern-600/25',
    corner: 'text-gold-500/80',
  },
}

interface CardProps {
  label: string
  hanzi?: string
  selected: boolean
  difficulty: Difficulty
  /** Mount animation: fresh deals slide in, merged cards pop. GPU-only. */
  entrance?: 'deal' | 'pop'
  delayMs?: number
  onClick: () => void
}

/** A Chinese-tile-styled playing card. Merged cards show fractions like "8/3". */
export default function Card({
  label,
  hanzi,
  selected,
  difficulty,
  entrance,
  delayMs = 0,
  onClick,
}: CardProps) {
  const skin = SKIN[difficulty]
  const entranceClass = entrance === 'deal' ? 'anim-deal' : entrance === 'pop' ? 'anim-pop' : ''
  return (
    <button
      type="button"
      onClick={onClick}
      style={delayMs > 0 ? { animationDelay: `${delayMs}ms` } : undefined}
      className={`relative flex h-36 w-26 items-center justify-center overflow-hidden rounded-xl border-2 shadow-xl shadow-black/50 transition-transform duration-75 sm:h-44 sm:w-32 ${entranceClass} ${
        selected
          ? '-translate-y-3 scale-105 border-gold-300 bg-ink-700 shadow-gold-500/30'
          : `${skin.base} hover:-translate-y-1`
      }`}
    >
      {hanzi && (
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 flex items-center justify-center font-brush text-8xl ${skin.watermark}`}
        >
          {hanzi}
        </span>
      )}
      <span
        className={`relative font-arcade text-paper-100 ${
          label.length > 3 ? 'text-2xl' : label.length > 2 ? 'text-4xl' : 'text-6xl'
        }`}
      >
        {label}
      </span>
      <span className={`absolute top-1.5 left-2 font-arcade text-xs ${skin.corner}`}>
        {label}
      </span>
      <span className={`absolute right-2 bottom-1.5 rotate-180 font-arcade text-xs ${skin.corner}`}>
        {label}
      </span>
    </button>
  )
}
