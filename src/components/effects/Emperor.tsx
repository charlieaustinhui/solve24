/** Streak 5-7: the emperor rises with a rotating golden aura. */
export default function Emperor() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <div className="anim-rise absolute inset-0 bg-gold-400/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="anim-spin-slow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <svg width="420" height="420" viewBox="0 0 420 420" aria-hidden className="opacity-50">
            <g stroke="#f0c33c" strokeWidth="6" strokeLinecap="round">
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i * Math.PI) / 6
                const x1 = 210 + Math.cos(a) * 120
                const y1 = 210 + Math.sin(a) * 120
                const x2 = 210 + Math.cos(a) * 200
                const y2 = 210 + Math.sin(a) * 200
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
              })}
            </g>
          </svg>
        </div>
        <div className="anim-rise relative">
          <svg width="180" height="220" viewBox="0 0 90 110" aria-hidden>
            <circle cx="45" cy="40" r="34" fill="#f5d56a" opacity="0.9" />
            <path d="M26 104 L64 104 L57 52 L33 52 Z" fill="#b3261e" />
            <path d="M33 56 L20 76 L30 81 Z" fill="#b3261e" />
            <path d="M57 56 L70 76 L60 81 Z" fill="#b3261e" />
            <line x1="45" y1="56" x2="45" y2="100" stroke="#f0c33c" strokeWidth="2.5" />
            <rect x="34" y="49" width="22" height="7" fill="#b3261e" />
            <circle cx="45" cy="38" r="9" fill="#e8b88a" />
            <rect x="32" y="22" width="26" height="7" fill="#2c2c38" />
            <rect x="27" y="18" width="36" height="4" fill="#1d1d28" />
            <line x1="30" y1="22" x2="30" y2="33" stroke="#f0c33c" strokeWidth="1.2" />
            <line x1="60" y1="22" x2="60" y2="33" stroke="#f0c33c" strokeWidth="1.2" />
            <circle cx="30" cy="34" r="1.8" fill="#f0c33c" />
            <circle cx="60" cy="34" r="1.8" fill="#f0c33c" />
          </svg>
        </div>
      </div>
      <div className="absolute top-[18%] left-1/2 -translate-x-1/2">
        <span className="anim-stamp inline-block rounded-lg border-4 border-gold-500 bg-gold-500/90 px-5 py-2 font-brush text-5xl whitespace-nowrap text-ink-950 shadow-2xl">
          皇帝の威光!
        </span>
      </div>
    </div>
  )
}
