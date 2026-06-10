// All game audio is synthesized with the Web Audio API — no sound files.
// Each sfx call builds a tiny graph of oscillators/noise -> gain envelope -> output.

const STORAGE_KEY = 'solve24-muted'

let ctx: AudioContext | null = null
let mutedFlag =
  typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1'

export function isMuted(): boolean {
  return mutedFlag
}

export function toggleMuted(): boolean {
  mutedFlag = !mutedFlag
  localStorage.setItem(STORAGE_KEY, mutedFlag ? '1' : '0')
  return mutedFlag
}

/** Browsers only allow audio after a user gesture — call from any click handler. */
function ac(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

interface ToneOpts {
  freq: number
  dur: number
  /** Frequency to glide to by the end (slides/gongs). */
  end?: number
  type?: OscillatorType
  vol?: number
  /** Delay in seconds relative to now. */
  at?: number
  attack?: number
}

function tone({ freq, dur, end, type = 'sine', vol = 0.18, at = 0, attack = 0.005 }: ToneOpts) {
  const c = ac()
  const t0 = c.currentTime + at
  const osc = c.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (end) osc.frequency.exponentialRampToValueAtTime(end, t0 + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(vol, t0 + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g)
  g.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

interface NoiseOpts {
  dur: number
  vol?: number
  at?: number
  /** Bandpass center frequency sweep. */
  from?: number
  to?: number
}

function noise({ dur, vol = 0.15, at = 0, from = 800, to = 200 }: NoiseOpts) {
  const c = ac()
  const t0 = c.currentTime + at
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 0.8
  filter.frequency.setValueAtTime(from, t0)
  filter.frequency.exponentialRampToValueAtTime(to, t0 + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(vol, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(filter)
  filter.connect(g)
  g.connect(c.destination)
  src.start(t0)
}

/** Low gong: stacked inharmonic partials with a long decay, like a temple bell. */
function gong(base: number, dur: number, vol: number, at = 0) {
  tone({ freq: base, dur, type: 'sine', vol, at, attack: 0.01 })
  tone({ freq: base * 1.5, dur: dur * 0.8, type: 'sine', vol: vol * 0.5, at, attack: 0.01 })
  tone({ freq: base * 2.76, dur: dur * 0.5, type: 'sine', vol: vol * 0.3, at, attack: 0.01 })
  noise({ dur: 0.08, vol: vol * 0.6, at, from: 3000, to: 600 })
}

// Rising C-major pentatonic — the "Chinese scale" victory arpeggio
const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880.0]

export const sfx = {
  /** Woodblock click on card select. */
  tap() {
    if (mutedFlag) return
    tone({ freq: 1100, dur: 0.06, type: 'square', vol: 0.06 })
    tone({ freq: 700, dur: 0.04, type: 'sine', vol: 0.12 })
  },

  /** Air whoosh when two cards merge. */
  merge() {
    if (mutedFlag) return
    noise({ dur: 0.18, vol: 0.12, from: 400, to: 2400 })
  },

  /** Gong + pentatonic run on every solve. */
  solve() {
    if (mutedFlag) return
    gong(160, 1.1, 0.22)
    PENTATONIC.forEach((f, i) =>
      tone({ freq: f, dur: 0.25, type: 'triangle', vol: 0.14, at: 0.08 + i * 0.07 }),
    )
  },

  /** Muted buzz: final card isn't 24, or divide by zero. */
  error() {
    if (mutedFlag) return
    tone({ freq: 130, dur: 0.25, type: 'sawtooth', vol: 0.1 })
    tone({ freq: 98, dur: 0.3, type: 'sawtooth', vol: 0.08, at: 0.02 })
  },

  /** Metallic katana "shing" for the samurai tier. */
  slash() {
    if (mutedFlag) return
    noise({ dur: 0.3, vol: 0.18, from: 6000, to: 1200 })
    tone({ freq: 3200, dur: 0.35, end: 1800, type: 'triangle', vol: 0.1 })
  },

  /** Short imperial fanfare for the emperor tier. */
  fanfare() {
    if (mutedFlag) return
    const notes = [392, 523.25, 659.25, 783.99]
    notes.forEach((f, i) =>
      tone({ freq: f, dur: 0.32, type: 'square', vol: 0.08, at: i * 0.11 }),
    )
    tone({ freq: 1046.5, dur: 0.6, type: 'square', vol: 0.09, at: 0.44 })
  },

  /** Deep gong + rumble when the dragon arrives. */
  dragon() {
    if (mutedFlag) return
    gong(80, 2.2, 0.3)
    noise({ dur: 1.6, vol: 0.12, from: 220, to: 50 })
  },

  /** Accelerating tick in the final 10 seconds. */
  tick() {
    if (mutedFlag) return
    tone({ freq: 1400, dur: 0.03, type: 'square', vol: 0.05 })
  },

  /** Big gong at time's up. */
  gameOver() {
    if (mutedFlag) return
    gong(110, 2.5, 0.28)
  },

  /** Full celebration for a new high score. */
  highScore() {
    if (mutedFlag) return
    gong(120, 2, 0.22)
    PENTATONIC.concat([1046.5]).forEach((f, i) =>
      tone({ freq: f, dur: 0.4, type: 'triangle', vol: 0.13, at: 0.1 + i * 0.1 }),
    )
  },
}
