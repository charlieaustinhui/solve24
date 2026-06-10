/** Streak 3-4: a samurai dashes across the screen behind a katana slash. */
export default function Samurai() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <div className="anim-white-flash absolute inset-0 bg-white" />
      <div
        className="anim-slash absolute top-1/2 left-1/2 h-1 w-[160vw] origin-center bg-white"
        style={{ boxShadow: '0 0 24px 6px rgba(255,255,255,0.8)' }}
      />
      <div className="anim-dash absolute top-1/2 left-0 -translate-y-1/2">
        <svg width="220" height="200" viewBox="0 0 110 100" aria-hidden>
          <g fill="#14141c">
            <path d="M30 32 L80 32 L55 12 Z" />
            <rect x="49" y="32" width="12" height="9" />
            <path d="M40 41 L70 41 L75 70 L35 70 Z" />
            <path d="M42 68 L36 92 L44 92 L50 70 Z" />
            <path d="M64 68 L74 92 L66 92 L58 70 Z" />
            <path d="M44 46 L24 58 L27 63 L46 52 Z" />
            <path d="M66 46 L86 40 L88 45 L68 52 Z" />
          </g>
          <line x1="86" y1="42" x2="108" y2="18" stroke="#d8d8e0" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="absolute top-[22%] left-1/2 -translate-x-1/2">
        <span className="anim-stamp inline-block rounded-lg border-4 border-lantern-500 bg-lantern-600/90 px-5 py-2 font-brush text-7xl text-paper-100 shadow-2xl">
          斬!
        </span>
      </div>
    </div>
  )
}
