/* ── SystemsCalibration — Multi-step calibration flow ──────────
 *  Guides learners through environment setup with mode/view
 *  selection, culminating in a prize selection reward.
 *  Supports light/night themes and web/card layout views.
 * ─────────────────────────────────────────────────────────────── */

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Gift,
  Loader2,
  Monitor,
  Moon,
  MousePointer2,
  Music,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Tablet,
  Volume2,
} from 'lucide-react'
import BlobCursor from './BlobCursor'
import SplashCursor from './SplashCursor'

// ─── Types ─────────────────────────────────────────────────────
export type CalibrationMode = 'light' | 'night'
export type CalibrationView = 'card' | 'web'
export type PrizeId = 'retake-challenge' | 'blob-cursor' | 'splash-cursor'

interface CalibrationResult {
  mode: CalibrationMode
  view: CalibrationView
  device: string
  audioGain: number
  prize: PrizeId
}

interface SystemsCalibrationProps {
  onComplete: (result: CalibrationResult) => void
}

// ─── Palettes ──────────────────────────────────────────────────
const LIGHT = {
  bg: '#FAFBF8',
  bgAlt: '#ffffff',
  card: '#ffffff',
  cardBorder: '#E5E4E3',
  cardHover: '#F7FEFF',
  text: '#1F1C1B',
  textMuted: '#524048',
  textDim: '#747474',
  accent: '#007970',
  accentBg: '#E5FEFF',
  accentBorder: '#C4F4F5',
  accent2: '#C74601',
  accent2Bg: '#FFEEE5',
  accent2Border: '#FFD5BF',
  headerBg: 'rgba(255,255,255,0.95)',
  footerBg: '#FAFBF8',
  progressBg: '#E5E4E3',
  progressFill: '#007970',
  selected: '#007970',
  selectedBg: '#E5FEFF',
  logo: 'https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_Gray.png',
}

const NIGHT = {
  bg: '#010809',
  bgAlt: '#031213',
  card: '#031213',
  cardBorder: '#004142',
  cardHover: '#002B2C',
  text: '#FAFBF8',
  textMuted: '#D9D6D5',
  textDim: '#747474',
  accent: '#64F4F5',
  accentBg: '#002B2C',
  accentBorder: '#007970',
  accent2: '#C74601',
  accent2Bg: 'rgba(199,70,1,0.15)',
  accent2Border: 'rgba(199,70,1,0.4)',
  headerBg: 'rgba(1,8,9,0.95)',
  footerBg: '#0A0A0C',
  progressBg: '#004142',
  progressFill: '#64F4F5',
  selected: '#64F4F5',
  selectedBg: 'rgba(100,244,245,0.1)',
  logo: 'https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_White.png',
}

// ─── Steps ─────────────────────────────────────────────────────
const STEP_KEYS = ['audio', 'device', 'visual', 'view', 'sync', 'prize'] as const
type StepKey = (typeof STEP_KEYS)[number]

const STEP_META: Record<StepKey, { title: string; subtitle: string }> = {
  audio: { title: 'Audio Check', subtitle: 'Verify your device can play clinical alerts' },
  device: { title: 'Device Profile', subtitle: 'Select your primary workspace interface' },
  visual: { title: 'Visual Mode', subtitle: 'Choose your preferred display theme' },
  view: { title: 'Layout Preference', subtitle: 'Select your content display style' },
  sync: { title: 'System Sync', subtitle: 'Connecting to clinical records…' },
  prize: { title: 'Calibration Complete!', subtitle: 'Choose your reward for completing setup' },
}

// ─── Component ─────────────────────────────────────────────────
export default function SystemsCalibration({ onComplete }: SystemsCalibrationProps) {
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<CalibrationMode>('light')
  const [view, setView] = useState<CalibrationView>('card')
  const [device, setDevice] = useState('Standard Workstation')
  const [audioGain, setAudioGain] = useState(60)
  const [testingAudio, setTestingAudio] = useState(false)
  const [syncDone, setSyncDone] = useState(false)
  const [selectedPrize, setSelectedPrize] = useState<PrizeId | null>(null)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const currentKey = STEP_KEYS[step] ?? 'audio'
  const meta = STEP_META[currentKey]
  const p = mode === 'light' ? LIGHT : NIGHT
  const isCard = view === 'card'

  // Auto-advance sync step
  useEffect(() => {
    if (currentKey !== 'sync') return
    if (syncDone) {
      setStep((s) => Math.min(s + 1, STEP_KEYS.length - 1))
      return
    }
    const t = setTimeout(() => {
      setSyncDone(true)
      setStep((s) => Math.min(s + 1, STEP_KEYS.length - 1))
    }, 2200)
    return () => clearTimeout(t)
  }, [step, syncDone, currentKey])

  const handleTestAudio = useCallback(() => {
    setTestingAudio(true)
    const ctx = audioCtxRef.current || new AudioContext()
    audioCtxRef.current = ctx
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 659.25
    gainNode.gain.value = Math.max(0.05, audioGain / 250)
    osc.connect(gainNode).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.25)
    setTimeout(() => setTestingAudio(false), 500)
  }, [audioGain])

  const goNext = () => setStep((s) => Math.min(s + 1, STEP_KEYS.length - 1))
  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const handleFinish = () => {
    if (!selectedPrize) return
    onComplete({ mode, view, device, audioGain, prize: selectedPrize })
  }

  const progress = ((step + 1) / STEP_KEYS.length) * 100

  // ─── Step content ──────────────────────────────────────────
  const renderStepContent = () => {
    switch (currentKey) {
      case 'audio':
        return (
          <div className="flex flex-col items-center gap-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: p.accentBg, border: `2px solid ${p.accentBorder}` }}
            >
              <Volume2 className="w-10 h-10" style={{ color: p.accent }} />
            </div>
            <p className="text-center text-sm max-w-sm" style={{ color: p.textMuted }}>
              We'll play a brief tone to confirm your speakers or headphones are working correctly.
            </p>
            <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between text-xs" style={{ color: p.textDim }}>
                <span>Volume</span>
                <span>{audioGain}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={audioGain}
                onChange={(e) => setAudioGain(Number(e.target.value))}
                className="w-full accent-[#007970]"
              />
              <button
                onClick={handleTestAudio}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                style={{
                  background: testingAudio ? p.accentBg : 'transparent',
                  border: `2px solid ${testingAudio ? p.accent : p.cardBorder}`,
                  color: testingAudio ? p.accent : p.text,
                }}
              >
                <Music className={`w-4 h-4 ${testingAudio ? 'animate-bounce' : ''}`} />
                {testingAudio ? 'Playing Tone…' : 'Test Audio'}
              </button>
            </div>
          </div>
        )

      case 'device':
        return (
          <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
            {[
              { id: 'Standard Workstation', icon: Monitor, desc: 'Desktop or laptop' },
              { id: 'Remote Tablet', icon: Tablet, desc: 'Tablet or mobile' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDevice(d.id)}
                className="rounded-2xl p-5 border-2 transition-all text-left"
                style={{
                  background: device === d.id ? p.selectedBg : p.card,
                  borderColor: device === d.id ? p.selected : p.cardBorder,
                  boxShadow: device === d.id ? `0 8px 24px ${p.accent}15` : 'none',
                }}
              >
                <d.icon className="w-7 h-7 mb-3" style={{ color: device === d.id ? p.accent : p.textDim }} />
                <p className="font-semibold text-sm" style={{ color: p.text }}>{d.id}</p>
                <p className="text-xs mt-0.5" style={{ color: p.textDim }}>{d.desc}</p>
                {device === d.id && <CheckCircle2 className="w-4 h-4 mt-2" style={{ color: p.accent }} />}
              </button>
            ))}
          </div>
        )

      case 'visual':
        return (
          <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
            {[
              { id: 'light' as const, label: 'Light Mode', icon: Sun, desc: 'Clean, bright interface' },
              { id: 'night' as const, label: 'Night Mode', icon: Moon, desc: 'Easy on the eyes, dark' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className="rounded-2xl p-5 border-2 transition-all text-left"
                style={{
                  background: mode === m.id ? p.selectedBg : p.card,
                  borderColor: mode === m.id ? p.selected : p.cardBorder,
                  boxShadow: mode === m.id ? `0 8px 24px ${p.accent}15` : 'none',
                }}
              >
                <m.icon className="w-7 h-7 mb-3" style={{ color: mode === m.id ? p.accent : p.textDim }} />
                <p className="font-semibold text-sm" style={{ color: p.text }}>{m.label}</p>
                <p className="text-xs mt-0.5" style={{ color: p.textDim }}>{m.desc}</p>
                {mode === m.id && <CheckCircle2 className="w-4 h-4 mt-2" style={{ color: p.accent }} />}
              </button>
            ))}
          </div>
        )

      case 'view':
        return (
          <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
            {[
              { id: 'card' as const, label: 'Card View', desc: 'Focused, one-at-a-time cards' },
              { id: 'web' as const, label: 'Book View', desc: 'Two-page spread layout' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className="rounded-2xl p-5 border-2 transition-all text-left"
                style={{
                  background: view === v.id ? p.selectedBg : p.card,
                  borderColor: view === v.id ? p.selected : p.cardBorder,
                  boxShadow: view === v.id ? `0 8px 24px ${p.accent}15` : 'none',
                }}
              >
                {/* Mini layout preview */}
                <div className="w-full h-14 rounded-lg mb-3 flex items-center justify-center overflow-hidden" style={{ background: p.accentBg, border: `1px solid ${p.accentBorder}` }}>
                  {v.id === 'card' ? (
                    <div className="w-10 h-8 rounded border" style={{ borderColor: p.accent, background: p.card }} />
                  ) : (
                    <div className="w-full px-2 space-y-1">
                      <div className="h-1.5 rounded-full w-full" style={{ background: p.accent + '40' }} />
                      <div className="h-1.5 rounded-full w-3/4" style={{ background: p.accent + '40' }} />
                      <div className="h-1.5 rounded-full w-1/2" style={{ background: p.accent + '40' }} />
                    </div>
                  )}
                </div>
                <p className="font-semibold text-sm" style={{ color: p.text }}>{v.label}</p>
                <p className="text-xs mt-0.5" style={{ color: p.textDim }}>{v.desc}</p>
                {view === v.id && <CheckCircle2 className="w-4 h-4 mt-2" style={{ color: p.accent }} />}
              </button>
            ))}
          </div>
        )

      case 'sync':
        return (
          <div className="flex flex-col items-center gap-6 py-8">
            <Loader2 className="w-16 h-16 animate-spin" style={{ color: p.accent }} />
            <p className="font-mono text-sm tracking-[0.2em] uppercase" style={{ color: p.accent }}>
              Calibrating Environment
            </p>
            <p className="text-xs text-center max-w-xs" style={{ color: p.textDim }}>
              Applying your preferences and syncing clinical training data…
            </p>
          </div>
        )

      case 'prize':
        return (
          <div className="space-y-5 w-full max-w-md mx-auto">
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: p.accent2Bg, border: `2px solid ${p.accent2Border}` }}
              >
                <Gift className="w-8 h-8" style={{ color: p.accent2 }} />
              </div>
              <p className="text-sm" style={{ color: p.textMuted }}>
                You've completed calibration! Choose a reward:
              </p>
            </div>

            {([
              {
                id: 'retake-challenge' as PrizeId,
                icon: RotateCcw,
                label: 'Challenge Retry',
                desc: 'Earn a one-time power-up to retry any challenge you didn\'t pass. Use it when you need it most!',
              },
              {
                id: 'blob-cursor' as PrizeId,
                icon: MousePointer2,
                label: 'Blob Cursor',
                desc: 'Unlock a smooth, morphing blob cursor effect that follows your mouse throughout the training.',
              },
              {
                id: 'splash-cursor' as PrizeId,
                icon: Sparkles,
                label: 'Splash Cursor',
                desc: 'Unlock a sparkling ripple cursor effect with CareIndeed brand colors as you navigate.',
              },
            ]).map((prize) => (
              <button
                key={prize.id}
                onClick={() => setSelectedPrize(prize.id)}
                className="w-full rounded-2xl p-5 border-2 transition-all text-left flex items-start gap-4"
                style={{
                  background: selectedPrize === prize.id ? p.selectedBg : p.card,
                  borderColor: selectedPrize === prize.id ? p.selected : p.cardBorder,
                  boxShadow: selectedPrize === prize.id ? `0 8px 24px ${p.accent}15` : 'none',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: selectedPrize === prize.id ? p.accent + '20' : p.accentBg,
                    border: `1px solid ${selectedPrize === prize.id ? p.accent : p.accentBorder}`,
                  }}
                >
                  <prize.icon className="w-5 h-5" style={{ color: selectedPrize === prize.id ? p.accent : p.textDim }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm" style={{ color: p.text }}>{prize.label}</p>
                    {selectedPrize === prize.id && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: p.accent }} />}
                  </div>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: p.textDim }}>
                    {prize.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  // ─── Card View Wrapper ─────────────────────────────────────
  const cardWrapper = () => (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden"
      style={{
        background: mode === 'light'
          ? 'radial-gradient(circle at top right, #FAFBF8 0%, #D9D6D5 100%)'
          : 'radial-gradient(circle at top right, #004142 0%, #001A1A 80%)',
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      {/* Ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full filter blur-[120px] pointer-events-none"
           style={{ background: p.accent, opacity: mode === 'light' ? 0.06 : 0.12, mixBlendMode: mode === 'light' ? 'multiply' : 'screen' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full filter blur-[120px] pointer-events-none"
           style={{ background: p.accent2, opacity: mode === 'light' ? 0.04 : 0.1, mixBlendMode: mode === 'light' ? 'multiply' : 'screen' }} />

      <div
        className="w-full max-w-2xl rounded-[32px] border backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col relative z-10"
        style={{ background: mode === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(3,18,19,0.95)', borderColor: p.cardBorder }}
      >
        {/* Header */}
        <header className="px-8 pt-8 pb-4 flex justify-between items-center border-b" style={{ borderColor: p.cardBorder }}>
          <div>
            <p className="text-xs font-bold tracking-[0.16em] uppercase mb-1 flex items-center gap-2" style={{ color: p.accent }}>
              <ShieldCheck className="w-4 h-4" /> Systems Calibration
            </p>
            <div style={{ fontFamily: 'Montserrat, sans-serif', color: p.text }} className="text-2xl font-bold">
              Step {step + 1} <span className="text-lg" style={{ color: p.textDim }}>/ {STEP_KEYS.length}</span>
            </div>
          </div>
          <img src={p.logo} alt="CareIndeed" className="h-8 w-auto object-contain" />
        </header>

        {/* Progress dots */}
        <div className="px-8 py-3 flex gap-2.5">
          {STEP_KEYS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i === step ? 48 : i < step ? 32 : 8,
                background: i <= step ? p.accent : p.progressBg,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <section className="px-8 py-8 min-h-[400px] flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1" style={{ color: p.text, fontFamily: 'Montserrat, sans-serif' }}>{meta.title}</h2>
            <p className="text-sm" style={{ color: p.textMuted }}>{meta.subtitle}</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {renderStepContent()}
          </div>
        </section>

        {/* Footer */}
        <footer className="px-8 py-5 border-t flex items-center justify-between" style={{ background: p.footerBg, borderColor: p.cardBorder }}>
          <button
            onClick={goBack}
            disabled={step === 0}
            className="flex items-center gap-2 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            style={{ color: p.textDim }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {currentKey === 'prize' ? (
            <button
              onClick={handleFinish}
              disabled={!selectedPrize}
              className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: p.accent2, boxShadow: selectedPrize ? `0 8px 24px ${p.accent2}40` : 'none' }}
            >
              Claim Reward & Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : currentKey !== 'sync' ? (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
              style={{ background: p.accent, color: mode === 'light' ? '#fff' : '#010809', boxShadow: `0 8px 24px ${p.accent}25` }}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  )

  // ─── Book View Wrapper ──────────────────────────────────────
  const webWrapper = () => (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{
        background: mode === 'light'
          ? 'radial-gradient(circle at top right, #FAFBF8 0%, #E5E4E3 100%)'
          : 'radial-gradient(circle at top right, #004142 0%, #001A1A 80%)',
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      {/* Ambient glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full filter blur-[150px] pointer-events-none z-0"
           style={{ background: p.accent, opacity: mode === 'light' ? 0.06 : 0.1, mixBlendMode: mode === 'light' ? 'multiply' : 'screen' }} />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full filter blur-[150px] pointer-events-none z-0"
           style={{ background: p.accent2, opacity: mode === 'light' ? 0.04 : 0.08, mixBlendMode: mode === 'light' ? 'multiply' : 'screen' }} />

      {/* Navbar */}
      <header
        className="h-16 border-b backdrop-blur-xl flex items-center justify-between px-8 z-10 relative"
        style={{ background: p.headerBg, borderColor: p.cardBorder }}
      >
        {/* Progress bar at bottom */}
        <div className="absolute bottom-0 left-0 h-[3px] w-full" style={{ background: p.progressBg }}>
          <div className="h-full transition-all duration-700 ease-out" style={{ width: `${progress}%`, background: p.progressFill }} />
        </div>
        <div className="flex items-center gap-5">
          <img src={p.logo} alt="CareIndeed" className="h-7 w-auto object-contain" />
          <div className="hidden sm:block h-5 w-px" style={{ background: p.cardBorder }} />
          <span className="text-xs font-bold tracking-[0.14em] uppercase" style={{ color: p.accent }}>
            Systems Calibration
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold tracking-wider uppercase" style={{ color: p.textDim }}>
            Step {step + 1} / {STEP_KEYS.length}
          </span>
        </div>
      </header>

      {/* Content body */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 md:p-12 lg:p-16 z-10">
        <div className="w-full max-w-2xl space-y-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: p.text, fontFamily: 'Montserrat, sans-serif' }}>
              {meta.title}
            </h1>
            <p className="text-base" style={{ color: p.textMuted }}>{meta.subtitle}</p>
          </div>
          <div className="min-h-[380px] flex items-center justify-center">
            {renderStepContent()}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="border-t backdrop-blur-xl px-6 md:px-8 py-5 flex items-center justify-between z-20"
        style={{ background: p.headerBg, borderColor: p.cardBorder }}
      >
        <button
          onClick={goBack}
          disabled={step === 0}
          className="flex items-center gap-2 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{ color: p.textDim }}
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        {currentKey === 'prize' ? (
          <button
            onClick={handleFinish}
            disabled={!selectedPrize}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white transition-all hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: p.accent2, boxShadow: selectedPrize ? `0 8px 24px ${p.accent2}40` : 'none' }}
          >
            Claim Reward & Continue <ArrowRight className="w-5 h-5" />
          </button>
        ) : currentKey !== 'sync' ? (
          <button
            onClick={goNext}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all hover:-translate-y-1"
            style={{ background: p.accent, color: mode === 'light' ? '#fff' : '#010809', boxShadow: `0 8px 24px ${p.accent}25` }}
          >
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        ) : null}
      </footer>
    </div>
  )

  // ─── Render ────────────────────────────────────────────────
  const layout = isCard ? cardWrapper() : webWrapper()

  // Show the actual cursor effect on the prize page so users can try it
  const showLiveCursor = currentKey === 'prize' && selectedPrize

  return (
    <>
      {showLiveCursor && selectedPrize === 'blob-cursor' && <BlobCursor />}
      {showLiveCursor && selectedPrize === 'splash-cursor' && <SplashCursor />}
      {layout}
    </>
  )
}
