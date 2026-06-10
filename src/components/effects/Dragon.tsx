import { Lantern } from './Lanterns'

const RAIN = [
  { left: '8%', delay: '0.3s', size: 30 },
  { left: '24%', delay: '0.9s', size: 38 },
  { left: '42%', delay: '0.5s', size: 26 },
  { left: '58%', delay: '1.1s', size: 40 },
  { left: '74%', delay: '0.7s', size: 30 },
  { left: '90%', delay: '1.3s', size: 34 },
]

/** Streak 8+: the divine dragon sweeps the screen with lantern rain. */
export default function Dragon() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {RAIN.map((r, i) => (
        <div
          key={i}
          className="anim-lantern-fall absolute top-0"
          style={{ left: r.left, animationDelay: r.delay }}
        >
          <Lantern size={r.size} />
        </div>
      ))}
      <div className="anim-dragon absolute top-[30%] left-0">
        <svg width="560" height="240" viewBox="0 0 280 120" aria-hidden>
          <path
            d="M6 96 C46 40 70 116 116 60 C148 22 176 64 208 44 C228 32 244 24 258 16"
            fill="none"
            stroke="#e0a93c"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <path
            d="M6 96 C46 40 70 116 116 60 C148 22 176 64 208 44 C228 32 244 24 258 16"
            fill="none"
            stroke="#b3261e"
            strokeWidth="3.5"
            strokeDasharray="7 7"
            strokeLinecap="round"
          />
          <path d="M250 20 L274 0 L270 20 Z" fill="#e0a93c" />
          <path d="M252 22 L278 26 L262 34 Z" fill="#e0a93c" />
          <line x1="264" y1="4" x2="258" y2="-8" stroke="#e0a93c" strokeWidth="3" strokeLinecap="round" />
          <line x1="270" y1="6" x2="272" y2="-8" stroke="#e0a93c" strokeWidth="3" strokeLinecap="round" />
          <circle cx="263" cy="14" r="2.5" fill="#0b0e23" />
          <path d="M272 18 C282 22 280 32 270 36" fill="none" stroke="#e0a93c" strokeWidth="1.5" />
          <path d="M270 26 C278 32 274 42 264 44" fill="none" stroke="#e0a93c" strokeWidth="1.5" />
          <g fill="#252b52" opacity="0.8">
            <circle cx="30" cy="104" r="12" />
            <circle cx="48" cy="100" r="15" />
            <circle cx="66" cy="106" r="11" />
          </g>
        </svg>
      </div>
      <div className="absolute top-[14%] left-1/2 -translate-x-1/2">
        <span className="anim-stamp inline-block rounded-lg border-4 border-gold-400 bg-lantern-600/95 px-6 py-3 font-brush text-6xl whitespace-nowrap text-gold-300 shadow-2xl">
          神龍降臨!!
        </span>
      </div>
    </div>
  )
}
