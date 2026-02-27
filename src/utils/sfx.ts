/**
 * Subtle, professional UI sound effects using the Web Audio API.
 * All sounds are synthesised — no external files required.
 * Volume is kept intentionally low (≤ 0.08) for a refined feel.
 */

let ctx: AudioContext | null = null

const getCtx = (): AudioContext => {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

/* ── helper: quick gain envelope ── */
const env = (
  gain: GainNode,
  peak: number,
  attackMs: number,
  holdMs: number,
  releaseMs: number,
  t0: number,
) => {
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(peak, t0 + attackMs / 1000)
  gain.gain.setValueAtTime(peak, t0 + (attackMs + holdMs) / 1000)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + (attackMs + holdMs + releaseMs) / 1000)
}

/* ────────────────────────────────────────────────────────────── */
/*  PUBLIC API                                                   */
/* ────────────────────────────────────────────────────────────── */

/** Soft tick — dock hover, interactive element hover */
export const sfxHover = () => {
  const c = getCtx()
  const t = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(3200, t)
  osc.frequency.exponentialRampToValueAtTime(2400, t + 0.06)
  env(g, 0.04, 5, 10, 50, t)
  osc.connect(g).connect(c.destination)
  osc.start(t)
  osc.stop(t + 0.08)
}

/** Gentle snap — button click, option select */
export const sfxClick = () => {
  const c = getCtx()
  const t = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(1800, t)
  osc.frequency.exponentialRampToValueAtTime(900, t + 0.06)
  env(g, 0.06, 3, 8, 80, t)
  osc.connect(g).connect(c.destination)
  osc.start(t)
  osc.stop(t + 0.1)
}

/** Smooth whoosh — card/panel transitions */
export const sfxSwipe = () => {
  const c = getCtx()
  const t = c.currentTime

  // Filtered noise via oscillator + modulation for a breathy sweep
  const osc = c.createOscillator()
  const mod = c.createOscillator()
  const modG = c.createGain()
  const g = c.createGain()

  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(220, t)
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.35)

  mod.type = 'sine'
  mod.frequency.setValueAtTime(40, t)
  modG.gain.setValueAtTime(60, t)
  mod.connect(modG).connect(osc.frequency)

  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(600, t)
  filter.frequency.exponentialRampToValueAtTime(200, t + 0.35)
  filter.Q.setValueAtTime(1.5, t)

  env(g, 0.05, 20, 40, 300, t)
  osc.connect(filter).connect(g).connect(c.destination)
  osc.start(t)
  osc.stop(t + 0.4)
  mod.start(t)
  mod.stop(t + 0.4)
}

/** Atmospheric chime — night ↔ light mode toggle */
export const sfxModeToggle = (toNight: boolean) => {
  const c = getCtx()
  const t = c.currentTime

  // Two-note chime: descending for night, ascending for light
  const freqs = toNight ? [660, 440] : [440, 660]

  freqs.forEach((freq, i) => {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, t + i * 0.18)
    env(g, 0.06, 10, 60, 600, t + i * 0.18)
    osc.connect(g).connect(c.destination)
    osc.start(t + i * 0.18)
    osc.stop(t + i * 0.18 + 0.7)
  })

  // Sub-harmonic bed for depth
  const sub = c.createOscillator()
  const sg = c.createGain()
  sub.type = 'sine'
  sub.frequency.setValueAtTime(toNight ? 110 : 165, t)
  env(sg, 0.035, 50, 200, 800, t)
  sub.connect(sg).connect(c.destination)
  sub.start(t)
  sub.stop(t + 1.1)
}
