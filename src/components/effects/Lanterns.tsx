/** A single paper lantern — reused for ambience and the dragon's lantern rain. */
export function Lantern({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 40 60" aria-hidden>
      <line x1="20" y1="0" x2="20" y2="8" stroke="#6b5a3a" strokeWidth="1.5" />
      <rect x="14" y="7" width="12" height="3" rx="1" fill="#e0a93c" />
      <ellipse cx="20" cy="28" rx="14" ry="18" fill="#c0392b" />
      <ellipse cx="20" cy="28" rx="14" ry="18" fill="none" stroke="#8f1d16" strokeWidth="1" />
      <path d="M8 22 Q20 26 32 22" fill="none" stroke="#f0c33c" strokeWidth="1" />
      <path d="M8 34 Q20 38 32 34" fill="none" stroke="#f0c33c" strokeWidth="1" />
      <line x1="20" y1="11" x2="20" y2="45" stroke="#f0c33c" strokeWidth="0.8" opacity="0.6" />
      <rect x="15" y="45" width="10" height="3" rx="1" fill="#e0a93c" />
      <line x1="18" y1="48" x2="17" y2="58" stroke="#f0c33c" strokeWidth="1.2" />
      <line x1="22" y1="48" x2="23" y2="58" stroke="#f0c33c" strokeWidth="1.2" />
    </svg>
  )
}

function Cloud({ width = 160 }: { width?: number }) {
  return (
    <svg width={width} height={width * 0.35} viewBox="0 0 160 56" aria-hidden>
      <g fill="#252b52" opacity="0.55">
        <ellipse cx="40" cy="38" rx="38" ry="16" />
        <ellipse cx="85" cy="28" rx="42" ry="20" />
        <ellipse cx="125" cy="40" rx="32" ry="14" />
      </g>
    </svg>
  )
}

const LANTERNS = [
  { left: '6%', top: '12%', size: 40, delay: '0s' },
  { left: '88%', top: '8%', size: 52, delay: '1.4s' },
  { left: '78%', top: '70%', size: 34, delay: '2.6s' },
  { left: '12%', top: '74%', size: 30, delay: '0.8s' },
]

const CLOUDS = [
  { top: '18%', width: 200, duration: '70s', delay: '-20s' },
  { top: '55%', width: 150, duration: '95s', delay: '-60s' },
  { top: '82%', width: 240, duration: '120s', delay: '-35s' },
]

/** Ambient night-sky backdrop: floating lanterns and slow-drifting clouds. */
export default function Lanterns() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="anim-cloud absolute"
          style={{ top: c.top, animationDuration: c.duration, animationDelay: c.delay }}
        >
          <Cloud width={c.width} />
        </div>
      ))}
      {LANTERNS.map((l, i) => (
        <div
          key={i}
          className="anim-lantern absolute opacity-70"
          style={{ left: l.left, top: l.top, animationDelay: l.delay }}
        >
          <Lantern size={l.size} />
        </div>
      ))}
    </div>
  )
}
