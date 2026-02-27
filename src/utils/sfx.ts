/**
 * Soft piano-key UI sound effects using the Web Audio API.
 * Mimics a felt-dampened upright piano — warm sine + triangle harmonics
 * with a fast attack and long exponential decay.
 * Volume is kept intentionally low (≤ 0.07) for a refined, subtle feel.
 */

let ctx: AudioContext | null = null

const getCtx = (): AudioContext => {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

/* ── helper: piano-style ADSR envelope ── */
const pianoEnv = (
  gain: GainNode,
  peak: number,
  decayMs: number,
  t0: number,
) => {
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.008)          // ~8 ms attack (hammer strike)
  gain.gain.exponentialRampToValueAtTime(peak * 0.35, t0 + 0.08) // quick initial drop
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + decayMs / 1000)  // long tail
}

/* ── helper: single piano note with harmonics ── */
const playNote = (freq: number, vol: number, decay: number, t0?: number) => {
  const c = getCtx()
  const t = t0 ?? c.currentTime

  // Fundamental (warm sine)
  const osc1 = c.createOscillator()
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(freq, t)

  // 2nd harmonic (softer triangle, adds body)
  const osc2 = c.createOscillator()
  osc2.type = 'triangle'
  osc2.frequency.setValueAtTime(freq * 2, t)

  // 3rd harmonic (very quiet sine, adds shimmer)
  const osc3 = c.createOscillator()
  osc3.type = 'sine'
  osc3.frequency.setValueAtTime(freq * 3, t)

  const g1 = c.createGain()
  const g2 = c.createGain()
  const g3 = c.createGain()

  pianoEnv(g1, vol, decay, t)
  pianoEnv(g2, vol * 0.25, decay * 0.7, t)
  pianoEnv(g3, vol * 0.08, decay * 0.4, t)

  // Gentle low-pass to soften the attack
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(2800, t)
  lp.frequency.exponentialRampToValueAtTime(800, t + decay / 1000)
  lp.Q.setValueAtTime(0.7, t)

  osc1.connect(g1).connect(lp)
  osc2.connect(g2).connect(lp)
  osc3.connect(g3).connect(lp)
  lp.connect(c.destination)

  const dur = decay / 1000 + 0.05
  osc1.start(t); osc1.stop(t + dur)
  osc2.start(t); osc2.stop(t + dur)
  osc3.start(t); osc3.stop(t + dur)
}

/* ────────────────────────────────────────────────────────────── */
/*  PUBLIC API                                                   */
/* ────────────────────────────────────────────────────────────── */

/** Soft piano tap — dock hover, interactive element hover (C6, very quiet) */
export const sfxHover = () => {
  playNote(1047, 0.025, 200)
}

/** Gentle piano key — button click, option select (E5) */
export const sfxClick = () => {
  playNote(659, 0.045, 350)
}

/** Two-note piano glide — card/panel transitions (C4 → G4) */
export const sfxSwipe = () => {
  const c = getCtx()
  const t = c.currentTime
  playNote(262, 0.04, 500, t)
  playNote(392, 0.04, 500, t + 0.12)
}

/** Piano chord — night ↔ light mode toggle */
export const sfxModeToggle = (toNight: boolean) => {
  const c = getCtx()
  const t = c.currentTime

  if (toNight) {
    // Descending: Am chord feeling — A4, E4, C4
    playNote(440, 0.05, 1200, t)
    playNote(330, 0.045, 1200, t + 0.15)
    playNote(262, 0.04, 1400, t + 0.30)
  } else {
    // Ascending: C major — C4, E4, G4
    playNote(262, 0.04, 1200, t)
    playNote(330, 0.045, 1200, t + 0.15)
    playNote(392, 0.05, 1400, t + 0.30)
  }
}
