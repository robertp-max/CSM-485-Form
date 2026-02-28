import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { sfxClick, sfxSwipe, sfxModeToggle } from '../utils/sfx'
import {
  FileText, BookOpen, Settings, LayoutGrid, HeartPulse,
  GraduationCap, CheckCircle2, ArrowRight, Sun, Moon,
  Volume2, AlertTriangle, Lock, Trophy, Shield
} from 'lucide-react'

/* ── Glass style injector — identical to CIHHLightCard ── */
const StyleInjector = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Roboto:wght@300;400;500&display=swap');

    .font-heading { font-family: 'Montserrat', sans-serif; }
    .font-body   { font-family: 'Roboto', sans-serif; }

    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #FAFBF8; }
    ::-webkit-scrollbar-thumb { background: #D9D6D5; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #747474; }
    .dark ::-webkit-scrollbar-track { background: #020F10; }
    .dark ::-webkit-scrollbar-thumb { background: #07282A; }
    .dark ::-webkit-scrollbar-thumb:hover { background: #004142; }

    .glow-orange { box-shadow: 0 9px 28px -6px rgba(199, 70, 1, 0.46); }
    .glow-teal   { box-shadow: 0 9px 28px -6px rgba(0, 121, 112, 0.345); }
    .dark .glow-orange { box-shadow: 0 12px 36px -6px rgba(229, 110, 46, 0.55); }
    .dark .glow-teal   { box-shadow: 0 12px 36px -6px rgba(100, 244, 245, 0.45); }

    .night-transition,
    .night-transition *:not(svg):not(path) {
      transition-property: background-color, color, border-color, box-shadow, opacity, fill, stroke, filter;
      transition-duration: 1.8s;
      transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes edgeSweepToNight {
      0%   { clip-path: inset(0 100% 0 0); opacity: 0; }
      8%   { opacity: 1; }
      50%  { clip-path: inset(0 0% 0 0); opacity: 0.92; }
      70%  { clip-path: inset(0 0% 0 0); opacity: 0.7; }
      100% { clip-path: inset(0 0% 0 100%); opacity: 0; }
    }
    @keyframes edgeSweepToDay {
      0%   { clip-path: inset(0 0 0 100%); opacity: 0; }
      8%   { opacity: 1; }
      50%  { clip-path: inset(0 0% 0 0); opacity: 0.92; }
      70%  { clip-path: inset(0 0% 0 0); opacity: 0.7; }
      100% { clip-path: inset(0 100% 0 0); opacity: 0; }
    }
    .edge-sweep-night { animation: edgeSweepToNight 2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .edge-sweep-day   { animation: edgeSweepToDay   2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    @keyframes auroraFloatA {
      0%   { transform: translate3d(0, 0, 0) scale(1); }
      50%  { transform: translate3d(8%, -6%, 0) scale(1.12); }
      100% { transform: translate3d(0, 0, 0) scale(1); }
    }
    @keyframes auroraFloatB {
      0%   { transform: translate3d(0, 0, 0) scale(1); }
      50%  { transform: translate3d(-8%, 7%, 0) scale(1.1); }
      100% { transform: translate3d(0, 0, 0) scale(1); }
    }
    .animate-aurora-a { animation: auroraFloatA 10s ease-in-out infinite; }
    .animate-aurora-b { animation: auroraFloatB 12s ease-in-out infinite; }
  `}</style>
)

/*
 * Glass sub-card class string — matches mini's training card content panels:
 *   bg-transparent, left-accent only, glowing shadow, hover glass
 */
const glassPanel = (accentColor: string) =>
  `bg-transparent rounded-[24px] p-6 border-l-[3.3px] ${accentColor} shadow-[0_7px_17px_-5px_rgba(31,28,27,0.15),0_0_16px_-10px_rgba(0,121,112,0.3)] dark:shadow-[0_7px_17px_-5px_rgba(0,0,0,0.4),0_0_16px_-10px_rgba(100,244,245,0.15)] hover:shadow-[0_14px_34px_-10px_rgba(31,28,27,0.3),0_0_28px_-6px_rgba(0,121,112,0.68)] dark:hover:shadow-[0_14px_34px_-10px_rgba(0,0,0,0.5),0_0_28px_-6px_rgba(100,244,245,0.35)] transition-all duration-300 hover:bg-white/[0.30] dark:hover:bg-white/[0.04] -translate-y-[1px] hover:-translate-y-[2px]`

/* ── Animation variants ── */
const cardShellVariants = {
  enter: (direction: number) => ({ x: direction >= 0 ? '100vw' : '-100vw' }),
  center: { x: 0 },
  exit: (direction: number) => ({ x: direction >= 0 ? '-100vw' : '100vw' }),
}

const STEP_COUNT = 3

/* ── Props ── */
interface OnboardingCardFlowProps {
  onComplete: (result: { theme: 'day' | 'night' }) => void
}

/* ════════════════════════════════════════════════════════════
   OnboardingCardFlow
   ────────────────────────────────────────────────────────────
   3-card onboarding (Welcome → Calibrate → Challenge Notice)
   100 % glass design — mirrors CIHHLightCard card shell.
   ════════════════════════════════════════════════════════════ */
export default function OnboardingCardFlow({ onComplete }: OnboardingCardFlowProps) {
  const [step, setStep] = useState(0)
  const [navDirection, setNavDirection] = useState(1)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [audioTested, setAudioTested] = useState(false)

  const [showCurtain, setShowCurtain] = useState(false)
  const [curtainDirection, setCurtainDirection] = useState<'day' | 'night'>('day')
  const [modeTransitionKey, setModeTransitionKey] = useState(0)

  const pointerStartX = useRef<number | null>(null)
  const pointerStartY = useRef<number | null>(null)
  const pointerCurrentX = useRef<number | null>(null)
  const pointerCurrentY = useRef<number | null>(null)

  /* ── Navigation ── */
  const handleNext = useCallback(() => {
    if (step >= STEP_COUNT - 1) {
      sfxClick()
      onComplete({ theme: isDarkMode ? 'night' : 'day' })
      return
    }
    sfxSwipe()
    setNavDirection(1)
    setStep(s => s + 1)
  }, [step, isDarkMode, onComplete])

  const handleBack = useCallback(() => {
    if (step <= 0) return
    sfxSwipe()
    setNavDirection(-1)
    setStep(s => s - 1)
  }, [step])

  /* ── Pointer / swipe ── */
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX
    pointerStartY.current = e.clientY
    pointerCurrentX.current = e.clientX
    pointerCurrentY.current = e.clientY
  }
  const handlePointerMove = (e: React.PointerEvent) => {
    pointerCurrentX.current = e.clientX
    pointerCurrentY.current = e.clientY
  }
  const handlePointerUp = () => {
    if (pointerStartX.current == null || pointerCurrentX.current == null || pointerStartY.current == null || pointerCurrentY.current == null) return
    const dx = pointerCurrentX.current - pointerStartX.current
    const dy = pointerCurrentY.current - pointerStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 70) dx < 0 ? handleNext() : handleBack()
    pointerStartX.current = pointerStartY.current = pointerCurrentX.current = pointerCurrentY.current = null
  }

  /* ── Edge-click ── */
  const isInteractive = (t: EventTarget | null) => t instanceof HTMLElement && Boolean(t.closest('button, a, input, textarea, select, [role="button"], label'))
  const handleCardEdgeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isInteractive(e.target)) return
    const rect = e.currentTarget.getBoundingClientRect()
    const edge = Math.max(56, rect.width * 0.1)
    const ox = e.clientX - rect.left
    if (ox <= edge) { handleBack(); return }
    if (ox >= rect.width - edge) handleNext()
  }

  /* ── Keys ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') handleNext(); if (e.key === 'ArrowLeft') handleBack() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleNext, handleBack])

  /* ── Theme toggle ── */
  const toggleToNight = () => {
    if (isDarkMode) return
    sfxModeToggle(true); setCurtainDirection('night'); setShowCurtain(true); setModeTransitionKey(k => k + 1)
    setTimeout(() => setIsDarkMode(true), 500); setTimeout(() => setShowCurtain(false), 2000)
  }
  const toggleToDay = () => {
    if (!isDarkMode) return
    sfxModeToggle(false); setCurtainDirection('day'); setShowCurtain(true); setModeTransitionKey(k => k + 1)
    setTimeout(() => setIsDarkMode(false), 500); setTimeout(() => setShowCurtain(false), 2000)
  }

  /* ── Audio ── */
  const handleTestAudio = () => {
    try { const c = new AudioContext(); const o = c.createOscillator(); const g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = 440; g.gain.value = 0.3; o.start(); setTimeout(() => { o.stop(); c.close() }, 300); setAudioTested(true) } catch { setAudioTested(true) }
  }

  const logo = isDarkMode
    ? 'https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_White.png'
    : 'https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_Gray.png'

  /* ════════════════════════════════════════════════════════════
     RENDER — full glass, zero white borders
     ════════════════════════════════════════════════════════════ */
  return (
    <div className={`night-transition min-h-screen bg-[radial-gradient(circle_at_top_right,_#FAFBF8_0%,_#D9D6D5_100%)] dark:bg-[radial-gradient(circle_at_top_right,_#020F10_0%,_#010808_100%)] text-[#1F1C1B] dark:text-[#FAFBF8] font-body p-4 md:p-8 flex items-center overflow-hidden justify-center relative ${isDarkMode ? 'dark' : ''}`}>
      <StyleInjector />

      {/* ── Edge-sweep curtain ── */}
      {showCurtain && (
        <div key={modeTransitionKey} className={`${curtainDirection === 'night' ? 'edge-sweep-night' : 'edge-sweep-day'} fixed inset-0 z-[9999] pointer-events-none`}
          style={{ background: curtainDirection === 'night' ? 'linear-gradient(135deg, #020F10 0%, #004142 40%, #010808 100%)' : 'linear-gradient(135deg, #FAFBF8 0%, #E5FEFF 40%, #D9D6D5 100%)' }} />
      )}

      {/* ── Aurora blobs ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[44%] h-[44%] bg-[#007970] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] opacity-[0.13] dark:opacity-[0.18] animate-aurora-a pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[44%] h-[44%] bg-[#C74601] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] opacity-[0.13] dark:opacity-[0.18] animate-aurora-b pointer-events-none" />

      {/* ── Card shell ── */}
      <div className="w-full max-w-[1200px] min-h-[1000px] relative z-10">
        <AnimatePresence mode="wait" custom={navDirection}>
          <motion.div
            key={step}
            custom={navDirection}
            variants={cardShellVariants}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}
            onClick={handleCardEdgeClick}
            className="relative w-full min-h-[1000px] bg-white/0 dark:bg-[#010808]/55 backdrop-blur-2xl rounded-[32px] overflow-hidden flex flex-col border-l-[4.3px]"
            style={{
              touchAction: 'pan-y',
              borderLeftColor: isDarkMode ? '#64F4F5' : '#C74601',
              boxShadow: isDarkMode
                ? '0 24px 90px rgba(0, 10, 10, 0.82)'
                : '0 24px 60px rgba(31, 28, 27, 0.12)',
            }}
          >
            {/* ── Header ── */}
            <header className="px-8 pt-8 pb-4 flex justify-between items-end">
              <div>
                <p className="text-[#007970] dark:text-[#64F4F5] font-bold text-[1.059rem] tracking-widest uppercase mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Onboarding
                </p>
                <p className="font-heading text-[2.7225rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8] tracking-tight" aria-live="polite" aria-label={`Step ${step + 1} of ${STEP_COUNT}`}>
                  {step + 1} <span className="text-[#747474] dark:text-[#D9D6D5] text-[1.815rem]">/ {STEP_COUNT}</span>
                </p>
              </div>
              <img className="h-[2.8rem] w-auto object-contain" src={logo} alt="CareIndeed Logo" />
            </header>

            {/* ── Progress dots ── */}
            <div className="px-8 py-4 flex gap-3">
              {Array.from({ length: STEP_COUNT }).map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i === step ? 'w-12 bg-[#007970] dark:bg-[#64F4F5] glow-teal' : i < step ? 'w-6 bg-[#C4F4F5] dark:bg-[#004142]' : 'w-2 bg-[#E5E4E3] dark:bg-[#07282A]'}`} />
              ))}
            </div>

            {/* ── Content ── */}
            <section className="p-8 min-h-[520px] flex-1 flex flex-col items-center justify-center">
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 w-full max-w-4xl">

                {/* ═══════════ STEP 0 — Welcome ═══════════ */}
                {step === 0 && (
                  <div className="space-y-10 max-w-2xl w-full">
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-transparent backdrop-blur-md border-l-[3px] border-l-[#007970] dark:border-l-[#64F4F5] text-[#007970] dark:text-[#64F4F5] text-[0.75rem] font-bold uppercase tracking-[0.18em] shadow-[0_4px_14px_-6px_rgba(0,121,112,0.3)] dark:shadow-[0_4px_14px_-6px_rgba(100,244,245,0.2)]">
                      <BookOpen className="w-4 h-4" /> CMS-485 Documentation Module
                    </div>
                    <div className="space-y-5">
                      <h1 className="font-heading text-[2.8rem] md:text-[3.6rem] font-bold tracking-tight leading-[1.08] -translate-y-[1px] hover:-translate-y-[2px] transition-transform duration-300">
                        Master the{' '}
                        <span className="bg-gradient-to-r from-[#007970] via-[#00A89D] to-[#64F4F5] bg-clip-text text-transparent">Plan of Care</span>
                      </h1>
                      <p className="text-[#524048] dark:text-[#D9D6D5] text-[1.15rem] leading-[1.7] font-light max-w-lg mx-auto">
                        CareIndeed&apos;s clinical documentation training platform. Build mastery through guided lessons, real&#8209;world challenges, and competency assessments.
                      </p>
                    </div>

                    {/* Feature grid — glass panels, left-accent only */}
                    <div className="grid grid-cols-2 gap-4">
                      {([
                        { Icon: Settings, label: 'Environment Setup', desc: 'Personalize theme & audio', accent: 'border-l-[#007970] dark:border-l-[#64F4F5]' },
                        { Icon: LayoutGrid, label: 'Form Mastery', desc: 'CMS-485 structure challenge', accent: 'border-l-[#C74601] dark:border-l-[#E56E2E]' },
                        { Icon: HeartPulse, label: 'Clinical Scenario', desc: 'Henderson patient case study', accent: 'border-l-[#524048] dark:border-l-[#64F4F5]' },
                        { Icon: GraduationCap, label: 'Training Paths', desc: 'Card, Book & Interactive', accent: 'border-l-[#007970] dark:border-l-[#64F4F5]' },
                      ] as const).map((h, i) => (
                        <div key={i} className={glassPanel(h.accent) + ' text-left flex items-start gap-3.5 !p-4'}>
                          <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center flex-shrink-0">
                            <h.Icon className="w-5 h-5 text-[#007970] dark:text-[#64F4F5]" />
                          </div>
                          <div>
                            <p className="font-heading font-semibold text-[0.92rem] mb-0.5">{h.label}</p>
                            <p className="text-[0.8rem] text-[#747474] dark:text-[#D9D6D5] leading-snug">{h.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 space-y-3">
                      <button onClick={handleNext} className="group inline-flex items-center gap-3 px-12 py-[18px] rounded-2xl bg-[#007970] hover:bg-[#006059] text-white font-bold text-lg tracking-wide transition-all duration-300 hover:-translate-y-1 shadow-[0_12px_40px_rgba(0,121,112,0.25)] hover:shadow-[0_18px_50px_rgba(0,121,112,0.35)]">
                        Begin Training <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <p className="text-[0.82rem] text-[#747474] dark:text-[#D9D6D5]">25–35 min &middot; 5 onboarding steps</p>
                    </div>

                    <div className="flex items-center justify-center gap-5 text-[0.72rem] text-[#747474] dark:text-[#D9D6D5] tracking-widest uppercase pt-2">
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#007970] dark:text-[#64F4F5]" /> HIPAA Compliant</span>
                      <span className="h-3 w-px bg-[#D9D6D5]/40 dark:bg-[#07282A]" />
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#007970] dark:text-[#64F4F5]" /> SCORM Compatible</span>
                      <span className="h-3 w-px bg-[#D9D6D5]/40 dark:bg-[#07282A]" />
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#007970] dark:text-[#64F4F5]" /> CareIndeed Certified</span>
                    </div>
                  </div>
                )}

                {/* ═══════════ STEP 1 — Configure ═══════════ */}
                {step === 1 && (
                  <div className="space-y-8 max-w-md w-full">
                    <div className="w-20 h-20 rounded-2xl bg-transparent flex items-center justify-center mx-auto">
                      <Settings className="w-10 h-10 text-[#007970] dark:text-[#64F4F5]" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="font-heading text-[1.8rem] font-bold -translate-y-[1px] hover:-translate-y-[2px] transition-transform duration-300">Configure Your Environment</h2>
                      <p className="text-[#524048] dark:text-[#D9D6D5] text-base max-w-sm mx-auto">Personalize your learning experience before starting the training modules.</p>
                    </div>
                    <div className="space-y-4 text-left">
                      {/* Theme — glass panel */}
                      <div className={glassPanel('border-l-[#007970] dark:border-l-[#64F4F5]')}>
                        <div className="flex items-center gap-3 mb-3">
                          {isDarkMode ? <Moon className="w-5 h-5 text-[#64F4F5]" /> : <Sun className="w-5 h-5 text-[#C74601]" />}
                          <div>
                            <p className="font-heading font-semibold text-[0.95rem]">Display Theme</p>
                            <p className="text-[0.78rem] text-[#747474] dark:text-[#D9D6D5]">Choose your preferred visual mode</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={toggleToDay} className={`flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${!isDarkMode ? 'bg-[#007970] text-white shadow-[0_4px_16px_rgba(0,121,112,0.25)]' : 'bg-transparent text-[#747474] dark:text-[#D9D6D5] hover:text-[#007970] dark:hover:text-[#64F4F5]'}`}>
                            <Sun className="w-4 h-4" /> Light
                          </button>
                          <button onClick={toggleToNight} className={`flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${isDarkMode ? 'bg-[#64F4F5] text-[#010809] shadow-[0_4px_16px_rgba(100,244,245,0.25)]' : 'bg-transparent text-[#747474] hover:text-[#007970]'}`}>
                            <Moon className="w-4 h-4" /> Night
                          </button>
                        </div>
                      </div>
                      {/* Audio — glass panel */}
                      <div className={glassPanel('border-l-[#C74601] dark:border-l-[#E56E2E]')}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Volume2 className="w-5 h-5 text-[#007970] dark:text-[#64F4F5]" />
                            <div>
                              <p className="font-heading font-semibold text-[0.95rem]">Audio Verification</p>
                              <p className="text-[0.78rem] text-[#747474] dark:text-[#D9D6D5]">Confirm speakers or headphones</p>
                            </div>
                          </div>
                          <button onClick={handleTestAudio} className={`px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${audioTested ? 'bg-transparent text-[#007970] dark:text-[#64F4F5]' : 'bg-[#007970] dark:bg-[#64F4F5] text-white dark:text-[#010809] hover:opacity-90'}`}>
                            {audioTested
                              ? <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Verified</span>
                              : <span className="flex items-center gap-1.5"><Volume2 className="w-4 h-4" /> Test</span>}
                          </button>
                        </div>
                      </div>
                    </div>
                    <button onClick={handleNext} className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-[#007970] hover:bg-[#006059] text-white font-bold text-base tracking-wide transition-all duration-300 hover:-translate-y-0.5 shadow-[0_12px_40px_rgba(0,121,112,0.25)] hover:shadow-[0_18px_44px_rgba(0,121,112,0.3)]">
                      Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}

                {/* ═══════════ STEP 2 — Challenge Ahead ═══════════ */}
                {step === 2 && (
                  <div className="space-y-8 max-w-lg w-full">
                    <div className="w-20 h-20 rounded-2xl bg-transparent flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-10 h-10 text-[#C74601] dark:text-[#FFD5BF]" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="font-heading text-[1.8rem] font-bold -translate-y-[1px] hover:-translate-y-[2px] transition-transform duration-300">Challenge Ahead</h2>
                      <p className="text-[#524048] dark:text-[#D9D6D5] text-base max-w-sm mx-auto leading-relaxed">
                        You are about to begin the <strong className="text-[#007970] dark:text-[#64F4F5]">CMS-485 Challenges</strong>. These test your knowledge of form layout and clinical decision-making.
                      </p>
                    </div>
                    <div className="space-y-4 text-left">
                      {/* Lock — glass */}
                      <div className={glassPanel('border-l-[#C74601] dark:border-l-[#E56E2E]')}>
                        <div className="flex items-start gap-3">
                          <Lock className="w-5 h-5 mt-0.5 text-[#C74601] dark:text-[#FFD5BF] flex-shrink-0" />
                          <div>
                            <p className="font-heading font-semibold text-[0.95rem] mb-0.5">One Attempt Only</p>
                            <p className="text-[0.85rem] text-[#524048] dark:text-[#D9D6D5] leading-relaxed">Answers lock after submission. Take your time and read each question carefully.</p>
                          </div>
                        </div>
                      </div>
                      {/* Trophy — glass */}
                      <div className={glassPanel('border-l-[#007970] dark:border-l-[#64F4F5]')}>
                        <div className="flex items-start gap-3">
                          <Trophy className="w-5 h-5 mt-0.5 text-[#007970] dark:text-[#64F4F5] flex-shrink-0" />
                          <div>
                            <p className="font-heading font-semibold text-[0.95rem] mb-0.5">Clinical Master Badge</p>
                            <p className="text-[0.85rem] text-[#524048] dark:text-[#D9D6D5] leading-relaxed">Score 100% on your first try to earn the <strong className="text-[#007970] dark:text-[#64F4F5]">Clinical Master</strong> achievement.</p>
                          </div>
                        </div>
                      </div>
                      {/* Shield — glass */}
                      <div className={glassPanel('border-l-[#524048] dark:border-l-[#64F4F5]')}>
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 mt-0.5 text-[#524048] dark:text-[#D9D6D5] flex-shrink-0" />
                          <div>
                            <p className="font-heading font-semibold text-[0.95rem] mb-0.5">Two Challenges</p>
                            <p className="text-[0.85rem] text-[#524048] dark:text-[#D9D6D5] leading-relaxed">First, the <strong>Layout Challenge</strong> tests form structure knowledge. Then, the <strong>Henderson Scenario</strong> tests clinical decision-making.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button onClick={handleNext} className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-[#C74601] hover:bg-[#E56E2E] text-white font-bold text-base tracking-wide transition-all duration-300 hover:-translate-y-0.5 shadow-[0_12px_40px_rgba(199,70,1,0.25)] glow-orange hover:shadow-[0_18px_44px_rgba(199,70,1,0.35)]">
                      Begin Challenges <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}

              </div>
            </section>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
