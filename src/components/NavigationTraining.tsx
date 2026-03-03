/* ── NavigationTraining ─────────────────────────────────────────────
 *  Three interactive micro-lessons that teach the user how to navigate
 *  training cards.  Each card gates progression until the learner
 *  successfully demonstrates the required action.
 *
 *  Card 1 – Keyboard: Right → Left → Right again
 *  Card 2 – Click/Tap zones: right zone → left zone → right zone
 *  Card 3 – Informational: press Space to acknowledge
 *
 *  Completion is persisted in localStorage.
 * ─────────────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { sfxClick, sfxSwipe } from '../utils/sfx'
import { Keyboard, MousePointerClick, VolumeX, ChevronRight, ChevronLeft, Check } from 'lucide-react'

/* ── Persistence ── */
const STORAGE_KEY = 'cms485.nav-training.completed'

export function isNavTrainingComplete(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}
function markNavTrainingComplete() {
  try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* noop */ }
}

/* ── Types ── */
type Step = 0 | 1 | 2
type SubStep = number

interface Props {
  theme: 'night' | 'day'
  onComplete: () => void
}

/* ── Card transition variants ── */
const cardVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '55%' : '-55%', opacity: 0, scale: 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-55%' : '55%', opacity: 0, scale: 0.96 }),
}

/* ── Palette helper ── */
function palette(dark: boolean) {
  return {
    bg: dark
      ? 'radial-gradient(ellipse at 20% 0%, rgba(0,121,112,0.08) 0%, transparent 55%), #010809'
      : 'linear-gradient(180deg, #FAFBF8 0%, #F0EBE6 100%)',
    card: dark ? 'rgba(1,8,8,0.65)' : 'rgba(255,255,255,0.82)',
    cardBorder: dark ? '#004142' : '#E5E4E3',
    accent: dark ? '#64F4F5' : '#007970',
    accent2: dark ? '#E56E2E' : '#C74601',
    text: dark ? '#FAFBF8' : '#1F1C1B',
    textMuted: dark ? '#D9D6D5' : '#747474',
    success: dark ? '#34D399' : '#059669',
    successBg: dark ? 'rgba(52,211,153,0.10)' : 'rgba(5,150,105,0.06)',
    hintBg: dark ? 'rgba(100,244,245,0.06)' : 'rgba(0,121,112,0.04)',
    edgeGlow: dark ? 'rgba(100,244,245,0.12)' : 'rgba(0,121,112,0.08)',
  }
}

/* ════════════════════════════════════════════════════════════════ */
export default function NavigationTraining({ theme, onComplete }: Props) {
  const isDark = theme === 'night'
  const p = useMemo(() => palette(isDark), [isDark])

  const [step, setStep] = useState<Step>(0)
  const [dir, setDir] = useState(1)

  /* ── Card 1: keyboard ── */
  const [kb1, setKb1] = useState(false) // Right pressed?
  const [kb2, setKb2] = useState(false) // Left pressed?
  const [kb3, setKb3] = useState(false) // Right again?
  const kbPhase: SubStep = kb3 ? 3 : kb2 ? 2 : kb1 ? 1 : 0

  /* ── Card 2: click zones ── */
  const [cz1, setCz1] = useState(false) // Right zone clicked?
  const [cz2, setCz2] = useState(false) // Left zone clicked?
  const [cz3, setCz3] = useState(false) // Right zone again?
  const czPhase: SubStep = cz3 ? 3 : cz2 ? 2 : cz1 ? 1 : 0

  /* ── Card 3: confirmation ── */
  const [ack, setAck] = useState(false)

  /* ── Hover glow for Card 2 ── */
  const [hoverZone, setHoverZone] = useState<'left' | 'right' | null>(null)

  /* ── Container ref for click zones ── */
  const card2Ref = useRef<HTMLDivElement>(null)

  /* ── Auto-advance after step completion ── */
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const advance = useCallback((next: Step) => {
    setDir(1)
    sfxSwipe()
    autoTimer.current = setTimeout(() => {
      setStep(next)
    }, 600)
  }, [])

  // Card 1 – auto-advance when kb3 achieved
  useEffect(() => {
    if (step === 0 && kb3) advance(1)
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current) }
  }, [kb3, step, advance])

  // Card 2 – auto-advance when cz3 achieved
  useEffect(() => {
    if (step === 1 && cz3) advance(2)
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current) }
  }, [cz3, step, advance])

  // Card 3 – complete after ack
  useEffect(() => {
    if (step === 2 && ack) {
      const t = setTimeout(() => {
        markNavTrainingComplete()
        onComplete()
      }, 700)
      return () => clearTimeout(t)
    }
  }, [ack, step, onComplete])

  /* ═══════════════  Keyboard listener  ═══════════════ */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack arrows inside inputs/textareas
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      /* ── Card 1: Keyboard training ── */
      if (step === 0) {
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          if (!kb1) {
            sfxClick(); setKb1(true)
          } else if (kb2 && !kb3) {
            sfxClick(); setKb3(true)
          }
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          if (kb1 && !kb2) {
            sfxClick(); setKb2(true)
          }
        }
        return
      }

      /* ── Card 3: Space to acknowledge ── */
      if (step === 2) {
        if (e.key === ' ') {
          e.preventDefault()
          if (!ack) { sfxClick(); setAck(true) }
        }
        return
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, kb1, kb2, kb3, ack])

  /* ═══════════════  Click-zone handler (Card 2)  ═══════════════ */
  const handleZoneClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (step !== 1) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = x / rect.width

    if (pct >= 0.6) {
      // Right 40%
      if (!cz1) { sfxClick(); setCz1(true) }
      else if (cz2 && !cz3) { sfxClick(); setCz3(true) }
    } else if (pct <= 0.4) {
      // Left 40%
      if (cz1 && !cz2) { sfxClick(); setCz2(true) }
    }
    // Middle 20% – nothing
  }, [step, cz1, cz2, cz3])

  const handleZoneMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (step !== 1) { setHoverZone(null); return }
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    if (pct >= 0.6) setHoverZone('right')
    else if (pct <= 0.4) setHoverZone('left')
    else setHoverZone(null)
  }, [step])

  /* ── Checklist item helper ── */
  const CheckItem = ({ done, label, active }: { done: boolean; label: string; active: boolean }) => (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300"
      style={{
        background: done ? p.successBg : active ? p.hintBg : 'transparent',
        borderLeft: `3px solid ${done ? p.success : active ? p.accent : 'transparent'}`,
      }}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
        style={{
          background: done ? p.success : 'transparent',
          border: done ? 'none' : `2px solid ${active ? p.accent : p.textMuted}`,
        }}
      >
        {done && <Check className="w-3 h-3 text-white" />}
      </div>
      <span
        className="text-[0.88rem] font-medium transition-colors duration-300"
        style={{ color: done ? p.success : active ? p.text : p.textMuted }}
      >
        {label}
      </span>
    </div>
  )

  /* ── Progress dots ── */
  const dots = [0, 1, 2].map(i => (
    <span
      key={i}
      className="h-[5px] rounded-full transition-all duration-500"
      style={{
        width: i === step ? 28 : 14,
        background: i < step ? p.success : i === step ? p.accent : (isDark ? '#07282A' : '#E5E4E3'),
      }}
    />
  ))

  /* ── Render ── */
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 font-sans transition-colors duration-300"
      style={{ background: p.bg, color: p.text }}
    >
      {/* ARIA live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {step === 0 && kbPhase === 0 && 'Card 1 of 3: Keyboard Navigation. Press the Right Arrow key to begin.'}
        {step === 0 && kbPhase === 1 && 'Good! Now press the Left Arrow key.'}
        {step === 0 && kbPhase === 2 && 'Great! Press Right Arrow one more time to continue.'}
        {step === 0 && kbPhase === 3 && 'Success! Advancing to Card 2.'}
        {step === 1 && czPhase === 0 && 'Card 2 of 3: Click or tap navigation. Click or tap the right side of this card.'}
        {step === 1 && czPhase === 1 && 'Good! Now click or tap the left side.'}
        {step === 1 && czPhase === 2 && 'Great! Click the right side once more to continue.'}
        {step === 1 && czPhase === 3 && 'Success! Advancing to Card 3.'}
        {step === 2 && !ack && 'Card 3 of 3: Navigation is disabled during challenges and voice-overs. Press Space to acknowledge.'}
        {step === 2 && ack && 'Acknowledged. Entering training.'}
      </div>

      {/* ── Header ── */}
      <div className="w-full max-w-xl mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.22em]"
            style={{ color: p.accent }}
          >
            Navigation Training
          </span>
          <span className="text-[0.82rem] font-heading font-bold" style={{ color: p.text }}>
            {step + 1} <span className="text-[0.72rem] font-normal" style={{ color: p.textMuted }}>/ 3</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">{dots}</div>
      </div>

      {/* ── Card area ── */}
      <div className="w-full max-w-xl relative" style={{ minHeight: 400 }}>
        <AnimatePresence mode="wait" custom={dir}>
          {/* ═══════════════  CARD 1 — Keyboard  ═══════════════ */}
          {step === 0 && (
            <motion.div
              key="card-1"
              custom={dir}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="rounded-[28px] border shadow-2xl overflow-hidden"
              style={{ background: p.card, borderColor: p.cardBorder }}
            >
              <div className="p-7 md:p-9 space-y-6">
                {/* Icon + title */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: p.hintBg }}>
                    <Keyboard className="w-5 h-5" style={{ color: p.accent }} />
                  </div>
                  <div>
                    <h2 className="font-heading text-[1.35rem] font-bold">Keyboard Navigation</h2>
                    <p className="text-[0.78rem]" style={{ color: p.textMuted }}>Use arrow keys to move between cards</p>
                  </div>
                </div>

                {/* Instructions */}
                <p className="text-[0.92rem] leading-relaxed" style={{ color: p.textMuted }}>
                  Training cards can be navigated with your keyboard. Complete each step below to continue.
                </p>

                {/* Checklist */}
                <div className="space-y-2">
                  <CheckItem done={kb1} active={kbPhase === 0} label="Press → Right Arrow" />
                  <CheckItem done={kb2} active={kbPhase === 1} label="Press ← Left Arrow" />
                  <CheckItem done={kb3} active={kbPhase === 2} label="Press → Right Arrow again to continue" />
                </div>

                {/* Subtle key hint */}
                {kbPhase < 3 && (
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <kbd
                      className="px-3 py-1.5 rounded-lg text-[0.78rem] font-mono font-semibold border transition-all duration-300"
                      style={{
                        borderColor: (kbPhase === 1) ? p.accent : p.cardBorder,
                        color: (kbPhase === 1) ? p.accent : p.textMuted,
                        background: (kbPhase === 1) ? p.hintBg : 'transparent',
                        boxShadow: (kbPhase === 1) ? `0 0 12px ${p.edgeGlow}` : 'none',
                      }}
                    >
                      <ChevronLeft className="inline w-3 h-3 -mt-0.5" /> ←
                    </kbd>
                    <kbd
                      className="px-3 py-1.5 rounded-lg text-[0.78rem] font-mono font-semibold border transition-all duration-300"
                      style={{
                        borderColor: (kbPhase === 0 || kbPhase === 2) ? p.accent : p.cardBorder,
                        color: (kbPhase === 0 || kbPhase === 2) ? p.accent : p.textMuted,
                        background: (kbPhase === 0 || kbPhase === 2) ? p.hintBg : 'transparent',
                        boxShadow: (kbPhase === 0 || kbPhase === 2) ? `0 0 12px ${p.edgeGlow}` : 'none',
                      }}
                    >
                      → <ChevronRight className="inline w-3 h-3 -mt-0.5" />
                    </kbd>
                  </div>
                )}

                {/* Success state */}
                {kbPhase === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 py-2 text-[0.88rem] font-semibold"
                    style={{ color: p.success }}
                  >
                    <Check className="w-4 h-4" /> Keyboard navigation complete
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══════════════  CARD 2 — Click / Tap Zones  ═══════════════ */}
          {step === 1 && (
            <motion.div
              key="card-2"
              custom={dir}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              ref={card2Ref}
              className="rounded-[28px] border shadow-2xl overflow-hidden relative select-none"
              style={{ background: p.card, borderColor: p.cardBorder, cursor: 'pointer' }}
              onClick={handleZoneClick}
              onMouseMove={handleZoneMove}
              onMouseLeave={() => setHoverZone(null)}
            >
              {/* Left edge glow */}
              <div
                className="absolute inset-y-0 left-0 w-[40%] pointer-events-none transition-opacity duration-300 rounded-l-[28px]"
                style={{
                  background: `linear-gradient(90deg, ${p.edgeGlow}, transparent)`,
                  opacity: hoverZone === 'left' ? 1 : 0,
                }}
              />
              {/* Right edge glow */}
              <div
                className="absolute inset-y-0 right-0 w-[40%] pointer-events-none transition-opacity duration-300 rounded-r-[28px]"
                style={{
                  background: `linear-gradient(270deg, ${p.edgeGlow}, transparent)`,
                  opacity: hoverZone === 'right' ? 1 : 0,
                }}
              />

              <div className="relative z-10 p-7 md:p-9 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: p.hintBg }}>
                    <MousePointerClick className="w-5 h-5" style={{ color: p.accent }} />
                  </div>
                  <div>
                    <h2 className="font-heading text-[1.35rem] font-bold">Click &amp; Tap Zones</h2>
                    <p className="text-[0.78rem]" style={{ color: p.textMuted }}>Click or tap left / right edges to navigate</p>
                  </div>
                </div>

                <p className="text-[0.92rem] leading-relaxed" style={{ color: p.textMuted }}>
                  You can also navigate by clicking or tapping the edges of a card. The left 40% goes back; the right 40% goes forward. The middle 20% is a dead zone.
                </p>

                <div className="space-y-2">
                  <CheckItem done={cz1} active={czPhase === 0} label="Click / tap the right edge of this card" />
                  <CheckItem done={cz2} active={czPhase === 1} label="Click / tap the left edge of this card" />
                  <CheckItem done={cz3} active={czPhase === 2} label="Click / tap right edge again to continue" />
                </div>

                {/* Zone diagram */}
                {czPhase < 3 && (
                  <div className="flex items-center justify-center gap-1 pt-1">
                    <div
                      className="flex items-center justify-center h-9 rounded-l-xl text-[0.7rem] font-bold uppercase tracking-widest transition-all duration-300"
                      style={{
                        width: '38%',
                        border: `1.5px dashed ${czPhase === 1 ? p.accent : p.cardBorder}`,
                        color: czPhase === 1 ? p.accent : p.textMuted,
                        background: czPhase === 1 ? p.hintBg : 'transparent',
                      }}
                    >
                      ← back
                    </div>
                    <div
                      className="flex items-center justify-center h-9 text-[0.65rem] uppercase tracking-widest"
                      style={{ width: '18%', color: p.textMuted, opacity: 0.5 }}
                    >
                      ∅
                    </div>
                    <div
                      className="flex items-center justify-center h-9 rounded-r-xl text-[0.7rem] font-bold uppercase tracking-widest transition-all duration-300"
                      style={{
                        width: '38%',
                        border: `1.5px dashed ${(czPhase === 0 || czPhase === 2) ? p.accent : p.cardBorder}`,
                        color: (czPhase === 0 || czPhase === 2) ? p.accent : p.textMuted,
                        background: (czPhase === 0 || czPhase === 2) ? p.hintBg : 'transparent',
                      }}
                    >
                      next →
                    </div>
                  </div>
                )}

                {czPhase === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 py-2 text-[0.88rem] font-semibold"
                    style={{ color: p.success }}
                  >
                    <Check className="w-4 h-4" /> Click / tap navigation complete
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══════════════  CARD 3 — Nav Disabled Info  ═══════════════ */}
          {step === 2 && (
            <motion.div
              key="card-3"
              custom={dir}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="rounded-[28px] border shadow-2xl overflow-hidden"
              style={{ background: p.card, borderColor: p.cardBorder }}
            >
              <div className="p-7 md:p-9 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: p.hintBg }}>
                    <VolumeX className="w-5 h-5" style={{ color: p.accent2 }} />
                  </div>
                  <div>
                    <h2 className="font-heading text-[1.35rem] font-bold">Navigation Pause</h2>
                    <p className="text-[0.78rem]" style={{ color: p.textMuted }}>When navigation is temporarily disabled</p>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-5 border-l-[3px] space-y-3"
                  style={{
                    borderColor: p.accent2,
                    background: isDark ? 'rgba(199,70,1,0.05)' : 'rgba(199,70,1,0.03)',
                  }}
                >
                  <p className="text-[0.92rem] leading-relaxed font-medium" style={{ color: p.text }}>
                    During challenges or while a voice-over is playing, navigation is turned off.
                  </p>
                  <p className="text-[0.84rem] leading-relaxed" style={{ color: p.textMuted }}>
                    Arrow keys, click zones, and swipe gestures will be temporarily disabled until the activity finishes. If you try to navigate, a brief hint will appear to let you know.
                  </p>
                </div>

                {/* Acknowledgement */}
                <div className="flex flex-col items-center gap-3 pt-1">
                  {!ack ? (
                    <>
                      <button
                        onClick={() => { sfxClick(); setAck(true) }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.84rem] font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          background: 'transparent',
                          border: `1.5px solid ${p.accent}`,
                          color: p.accent,
                        }}
                      >
                        <Check className="w-3.5 h-3.5" /> I understand
                      </button>
                      <span className="text-[0.72rem]" style={{ color: p.textMuted }}>
                        or press <kbd className="px-1.5 py-0.5 rounded border text-[0.68rem] font-mono" style={{ borderColor: p.cardBorder }}>Space</kbd>
                      </span>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-2 py-2 text-[0.88rem] font-semibold"
                      style={{ color: p.success }}
                    >
                      <Check className="w-4 h-4" /> Acknowledged — entering training…
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom microcopy ── */}
      <p className="mt-6 text-[0.72rem] tracking-widest uppercase" style={{ color: p.textMuted }}>
        CareIndeed · CMS-485 Training
      </p>
    </div>
  )
}
