import type { Op } from '../lib/solver'
import { OPS } from '../lib/solver'

interface OperatorBarProps {
  selected: Op | null
  onSelect: (op: Op) => void
}

export default function OperatorBar({ selected, onSelect }: OperatorBarProps) {
  return (
    <div className="flex gap-4">
      {OPS.map((op) => (
        <button
          key={op}
          type="button"
          onClick={() => onSelect(op)}
          aria-pressed={selected === op}
          className={`flex h-14 w-14 items-center justify-center rounded-full border-2 font-arcade text-3xl transition-transform duration-75 sm:h-16 sm:w-16 ${
            selected === op
              ? 'scale-110 border-gold-300 bg-gold-500 text-ink-950 shadow-lg shadow-gold-500/40'
              : 'border-gold-600/60 bg-ink-800 text-gold-400 hover:scale-105 hover:border-gold-400'
          }`}
        >
          {op}
        </button>
      ))}
    </div>
  )
}
