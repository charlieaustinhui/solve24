interface CardProps {
  label: string
  hanzi?: string
  selected: boolean
  onClick: () => void
}

/** A Chinese-tile-styled playing card. Merged cards show fractions like "8/3". */
export default function Card({ label, hanzi, selected, onClick }: CardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-36 w-26 items-center justify-center overflow-hidden rounded-xl border-2 shadow-lg transition-all duration-150 sm:h-44 sm:w-32 ${
        selected
          ? '-translate-y-3 scale-105 border-gold-400 bg-ink-700 shadow-gold-500/30'
          : 'border-lantern-600/70 bg-ink-800 hover:-translate-y-1 hover:border-gold-500/70'
      }`}
    >
      {hanzi && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center font-brush text-8xl text-lantern-600/25"
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
      <span className="absolute top-1.5 left-2 font-arcade text-xs text-gold-500/80">
        {label}
      </span>
      <span className="absolute right-2 bottom-1.5 rotate-180 font-arcade text-xs text-gold-500/80">
        {label}
      </span>
    </button>
  )
}
