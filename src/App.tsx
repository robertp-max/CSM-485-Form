import React, { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Droplets,
  FileText,
  HeartPulse,
  Layout,
  Loader2,
  Lock,
  Monitor,
  Moon,
  MousePointer2,
  Music,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Volume2,
  Zap,
} from 'lucide-react'

// Lazy load TSX components for shortcuts
const CIHHNightCard = lazy(() => import('./components/design/CIHHNightCard'))
const CIHHLightCard = lazy(() => import('./components/design/CIHHLightCard'))
const CIHHNightWeb = lazy(() => import('./components/design/CIHHNightWeb'))
const CIHHLightWeb = lazy(() => import('./components/design/CIHHLightWeb'))
const LearningProfessional = lazy(() => import('./LearningProfessional'))
const HelpCenter = lazy(() => import('./components/HelpCenter'))
const Interactive485Form = lazy(() => import('./components/Interactive485Form'))
const WelcomeBanner = lazy(() => import('./components/WelcomeBanner'))
const SystemsCalibration = lazy(() => import('./components/SystemsCalibration'))
const BlobCursor = lazy(() => import('./components/BlobCursor'))
const SplashCursor = lazy(() => import('./components/SplashCursor'))
const RewardToggle = lazy(() => import('./components/RewardToggle'))

// Design tokens and animation primitives
const CSS_STYLES = `
  :root {
    --night-bg: radial-gradient(circle at 20% 20%, rgba(0, 121, 112, 0.12), transparent 32%),
                radial-gradient(circle at 80% 0%, rgba(100, 244, 245, 0.18), transparent 28%),
                #020617;
    --day-bg: radial-gradient(circle at 18% 10%, rgba(0, 121, 112, 0.12), transparent 35%),
              radial-gradient(circle at 72% 8%, rgba(255, 213, 191, 0.35), transparent 38%),
              #F8FAFC;
    --card-glass: rgba(255, 255, 255, 0.08);
    --card-border: rgba(255, 255, 255, 0.18);
    --shadow-strong: 0 25px 80px rgba(0, 0, 0, 0.32);
    --shadow-soft: 0 18px 48px rgba(0, 0, 0, 0.18);
    --blur-hero: blur(60px);
    --radius-xl: 48px;
  }

  .theme-night {
    --bg: var(--night-bg);
    --card: rgba(15, 23, 42, 0.65);
    --text: #E9F5FF;
    --muted: #9FB3C8;
    --accent: #64F4F5;
    --accent-2: #C74601;
    color-scheme: dark;
  }

  .theme-day {
    --bg: var(--day-bg);
    --card: rgba(255, 255, 255, 0.8);
    --text: #0F172A;
    --muted: #556178;
    --accent: #007970;
    --accent-2: #C74601;
    color-scheme: light;
  }

  .glass-card {
    background: var(--card);
    backdrop-filter: var(--blur-hero);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-strong);
  }

  .pulse-ring {
    box-shadow: 0 0 0 0 rgba(100, 244, 245, 0.25);
    animation: pulse 2.8s infinite;
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(100, 244, 245, 0.18); }
    50% { box-shadow: 0 0 0 24px rgba(100, 244, 245, 0); }
    100% { box-shadow: 0 0 0 0 rgba(100, 244, 245, 0); }
  }

  .card-3d {
    transition: transform 0.9s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.5s ease;
    transform-style: preserve-3d;
  }

  .particle {
    position: fixed;
    width: 8px;
    height: 8px;
    background: var(--accent);
    border-radius: 999px;
    pointer-events: none;
    filter: drop-shadow(0 0 12px rgba(100, 244, 245, 0.6));
    animation: particleFade 700ms ease-out forwards;
    z-index: 90;
  }

  @keyframes particleFade {
    0% { opacity: 1; transform: scale(1) translate(var(--dx), var(--dy)); }
    100% { opacity: 0; transform: scale(0.2) translate(calc(var(--dx) * 2), calc(var(--dy) * 2)); }
  }

  .orange-blob {
    position: fixed;
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(199, 70, 1, 0.26) 0%, transparent 70%);
    filter: blur(90px);
    pointer-events: none;
    z-index: 80;
    transition: transform 120ms ease-out;
  }

  .gradient-border {
    position: relative;
  }
  .gradient-border:before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: calc(var(--radius-xl) + 2px);
    background: linear-gradient(120deg, rgba(100, 244, 245, 0.55), rgba(199, 70, 1, 0.45));
    opacity: 0.9;
    filter: blur(12px);
    z-index: 0;
  }
  .gradient-border > * { position: relative; z-index: 1; }
`

const vitals = [
  { label: 'BS', value: '342', tone: 'accent-2' },
  { label: 'HR', value: '48 (Ashen)', tone: 'accent' },
  { label: 'BP', value: '158/92', tone: 'accent-2' },
  { label: 'Left Leg', value: 'Cold / Pulseless', tone: 'accent-2' },
]

const hazards = [
  { icon: AlertTriangle, text: 'Unsecured firearm', severity: 'Critical' },
  { icon: Zap, text: 'Power out', severity: 'Caution' },
  { icon: ShieldAlert, text: 'Primary caregiver quit', severity: 'Critical' },
]

const narrative = [
  {
    title: 'Narrative Assessment',
    text: 'Upon arrival, a loaded handgun required tactical communication to establish a safe perimeter. Patient is ashen/bradycardic (HR 48). Diabetic neuropathy masks chest pressure. Wagner Grade 3 great toe ulcer probes to bone.',
  },
  {
    title: 'Coordination Data',
    text: 'Stabilization requires 72h oversight (3w1 in week one). Then twice-weekly (2w3) for remainder of month one. Final month is once-weekly (1w4). PT starts after 48h vascular hold: 2x/wk for 3 wks (2w3), then 1x/wk for 2 wks (1w2).',
  },
]

const cards = [
  { id: 'box24', title: 'Box 24: Safety / 911', prompt: 'Determine the primary safety protocol before any wound action.' },
  { id: 'box18', title: 'Box 18: Wound Care', prompt: 'Establish wound care frequency for Wagner Grade 3 ulceration.' },
]

// ─── Draggable Wrapper (resets on refresh) ─────────────────────────
function DraggableWrapper({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragState = useRef<{ dragging: boolean; startX: number; startY: number; origX: number; origY: number }>({
    dragging: false, startX: 0, startY: 0, origX: 0, origY: 0,
  })
  const elRef = useRef<HTMLDivElement>(null)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Only initiate drag from the drag handle (data-drag-handle) or the wrapper background itself
    const target = e.target as HTMLElement
    if (!target.closest('[data-drag-handle]')) return
    e.preventDefault()
    dragState.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y }
    elRef.current?.setPointerCapture(e.pointerId)
  }, [pos])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.dragging) return
    setPos({
      x: dragState.current.origX + (e.clientX - dragState.current.startX),
      y: dragState.current.origY + (e.clientY - dragState.current.startY),
    })
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.dragging) return
    dragState.current.dragging = false
    elRef.current?.releasePointerCapture(e.pointerId)
  }, [])

  return (
    <div
      ref={elRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={`relative ${className}`}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, willChange: pos.x || pos.y ? 'transform' : undefined }}
    >
      {/* Drag handle bar */}
      <div
        data-drag-handle
        className="absolute -top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-1.5 rounded-full cursor-grab active:cursor-grabbing select-none
                   bg-black/70 backdrop-blur-md border border-white/20 shadow-lg hover:border-white/40 transition-all opacity-0 hover:opacity-100 focus-within:opacity-100 group-hover:opacity-100"
        style={{ touchAction: 'none' }}
      >
        <svg width="16" height="6" viewBox="0 0 16 6" className="text-white/50">
          <circle cx="2" cy="1" r="1" fill="currentColor"/><circle cx="6" cy="1" r="1" fill="currentColor"/><circle cx="10" cy="1" r="1" fill="currentColor"/><circle cx="14" cy="1" r="1" fill="currentColor"/>
          <circle cx="2" cy="5" r="1" fill="currentColor"/><circle cx="6" cy="5" r="1" fill="currentColor"/><circle cx="10" cy="5" r="1" fill="currentColor"/><circle cx="14" cy="5" r="1" fill="currentColor"/>
        </svg>
        <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Drag</span>
      </div>
      {children}
    </div>
  )
}

// Interactive Cursor Effect Component
const Cursor = ({ utility, mousePos, theme }) => {
  if (!utility || utility === 'Audit Lifeline') return null

  return (
    <div
      className="fixed pointer-events-none z-[9999] transition-transform duration-150 ease-out"
      style={{
        left: mousePos.x,
        top: mousePos.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {utility === 'Teal Splash Cursor' && (
        <div className="relative">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] animate-ping absolute inset-0" />
          <div className="w-4 h-4 rounded-full bg-[var(--accent)] shadow-[0_0_15px_var(--accent)]" />
          <MousePointer2
            size={16}
            className="absolute -bottom-4 -right-4 text-[var(--accent)]"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
          />
        </div>
      )}
      {utility === 'Ambient Orange Blob' && (
        <div className="w-8 h-8 rounded-full bg-orange-500/40 blur-sm scale-150" />
      )}
    </div>
  )
}

// ─── App Phase: welcome → calibration → practice → training ───
type AppPhase = 'welcome' | 'calibration' | 'practice' | 'training'
type PrizeId = 'retake-challenge' | 'blob-cursor' | 'splash-cursor' | null

export default function App() {
  const [appPhase, setAppPhase] = useState<AppPhase>('welcome')
  const [activePrize, setActivePrize] = useState<PrizeId>(null)
  const [cursorEnabled, setCursorEnabled] = useState(true)
  const [viewMode, setViewMode] = useState('DEFAULT')
  const [stage, setStage] = useState(0)
  const [theme, setTheme] = useState('night')
  const [layout, setLayout] = useState('Tactical View')
  const [utility, setUtility] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState([])
  const [syncComplete, setSyncComplete] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSimulationActive, setIsSimulationActive] = useState(false)
  const [gain, setGain] = useState(52)
  const [testingAudio, setTestingAudio] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState('Standard Workstation')
  const [selectedUtility, setSelectedUtility] = useState(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [answers, setAnswers] = useState({ box24: null, box18: null })
  const [modal, setModal] = useState(null)
  const lifelineUsedRef = useRef(false)
  const audioCtxRef = useRef(null)

  useEffect(() => {
    const handleMove = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  const handleTestAudio = () => {
    setTestingAudio(true)
    const ctx = audioCtxRef.current || new AudioContext()
    audioCtxRef.current = ctx
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 659.25 // E5 piano-ish
    gainNode.gain.value = Math.max(0.05, gain / 250)
    osc.connect(gainNode).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.25)
    setTimeout(() => setTestingAudio(false), 500)
  }

  const onboardingStages = useMemo(
    () => [
      {
        key: 'audio',
        title: 'Audio Readiness',
        description: 'Initialize clinical alert pathways.',
        script: "Welcome to CareIndeed. Let's start by testing your audio settings to ensure all clinical alerts and patient notifications are audible.",
        content: (
          <div className="flex flex-col items-center gap-6">
            <div className="p-8 rounded-full bg-emerald-500/10 border border-emerald-400/30 pulse-ring">
              <Volume2 size={48} className="text-[var(--accent)]" />
            </div>
            <button
              onClick={() => setStage((s) => s + 1)}
              className="px-12 py-4 rounded-full bg-[var(--accent)] text-slate-950 font-semibold shadow-[0_15px_40px_rgba(100,244,245,0.35)] hover:translate-y-[-2px] transition-transform"
            >
              Start Audio Test
            </button>
          </div>
        ),
      },
      {
        key: 'device',
        title: 'Device Setup',
        description: 'Select your clinical workspace interface.',
        script: 'Choose your primary device. This ensures the CMS-485 forms are scaled correctly for your documentation style.',
        content: (
          <div className="grid grid-cols-2 gap-4 w-full">
            {['Standard Workstation', 'Remote Tablet'].map((device) => (
              <div
                key={device}
                onClick={() => setSelectedDevice(device)}
                className={`glass-card cursor-pointer p-6 border-2 transition-all flex flex-col gap-3 ${
                  selectedDevice === device ? 'border-[var(--accent)] shadow-[0_12px_40px_rgba(100,244,245,0.25)]' : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Monitor className={selectedDevice === device ? 'text-[var(--accent)]' : 'text-[var(--muted)]'} size={28} />
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">{device}</p>
                    <p className="text-xs text-[var(--muted)]">Scaled clinical UI</p>
                  </div>
                </div>
                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full ${selectedDevice === device ? 'bg-[var(--accent)] w-full' : 'bg-white/20 w-1/3'} transition-all`} />
                </div>
              </div>
            ))}
            <div className="col-span-2 flex gap-3 pt-2">
              <button onClick={() => setStage((s) => s - 1)} className="flex-1 h-12 rounded-full border border-white/15 text-[var(--muted)] flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={() => setStage((s) => s + 1)} className="flex-[1.6] h-12 rounded-full bg-[var(--accent)] text-slate-950 font-semibold">Confirm Selection</button>
            </div>
          </div>
        ),
      },
      {
        key: 'sync',
        title: 'Clinical Data Sync',
        description: 'Connecting to secure CMS records…',
        script: "We're syncing with the Henderson patient file. Please stay with us while we securely load the clinical history.",
        content: (
          <div className="flex flex-col items-center gap-6 h-full justify-center">
            <Loader2 size={64} className={`animate-spin ${theme === 'night' ? 'text-[var(--accent)]' : 'text-[var(--accent-2)]'}`} />
            <p className="font-mono text-sm tracking-[0.3em] text-[var(--accent)] uppercase">Syncing Patient Records</p>
            {syncComplete && <p className="text-[var(--muted)] text-sm">Cache warm — returning you to flow.</p>}
          </div>
        ),
      },
      {
        key: 'alert',
        title: 'Alert Verification',
        description: 'Test notification volume and clarity.',
        script: "Use the slider to set your preferred volume. Let's make sure you can hear high-priority alerts during your shift.",
        content: (
          <div className="w-full flex flex-col gap-6">
            <div className="flex justify-between text-xs uppercase text-[var(--muted)]">
              <span>Alert Volume</span>
              <span>{gain}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={gain}
              onChange={(e) => setGain(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
            <button
              onClick={handleTestAudio}
              className={`h-14 rounded-[24px] border-2 flex items-center justify-center gap-3 transition-all ${testingAudio ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-white/12 text-[var(--text)]'}`}
            >
              <Music className={testingAudio ? 'animate-bounce' : ''} />
              {testingAudio ? 'Piano Ping Playing' : 'Test Audible Notifications'}
            </button>
            <div className="flex gap-3">
              <button onClick={() => setStage((s) => s - 1)} className="flex-1 h-12 rounded-full border border-white/15 text-[var(--muted)] flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={() => setStage((s) => s + 1)} className="flex-[1.6] h-12 rounded-full bg-[var(--accent)] text-slate-950 font-semibold">Continue</button>
            </div>
          </div>
        ),
      },
      {
        key: 'visual',
        title: 'Visual Preference',
        description: 'Select comfortable interface lighting.',
        script: "Choose the atmosphere that works best for your eyes. Most clinicians prefer Night Ops for reduced glare during late charts.",
        content: (
          <div className="grid grid-cols-2 gap-4 w-full">
            {[{ id: 'day', label: 'Day Shift', icon: Sun }, { id: 'night', label: 'Night Ops', icon: Moon }].map((m) => (
              <div
                key={m.id}
                onClick={() => setTheme(m.id === 'day' ? 'day' : 'night')}
                className={`glass-card cursor-pointer p-6 border-2 flex flex-col gap-2 transition-all ${
                  theme === m.id ? 'border-[var(--accent)] shadow-[0_12px_36px_rgba(100,244,245,0.24)]' : 'border-white/10'
                }`}
              >
                <m.icon size={30} className={theme === m.id ? 'text-[var(--accent)]' : 'text-[var(--muted)]'} />
                <p className="text-[var(--text)] font-semibold">{m.label}</p>
                <p className="text-[var(--muted)] text-xs">Live theme switch</p>
              </div>
            ))}
            <div className="col-span-2 flex gap-3 pt-2">
              <button onClick={() => setStage((s) => s - 1)} className="flex-1 h-12 rounded-full border border-white/15 text-[var(--muted)] flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={() => setStage((s) => s + 1)} className="flex-[1.6] h-12 rounded-full bg-[var(--accent)] text-slate-950 font-semibold">Apply Visuals</button>
            </div>
          </div>
        ),
      },
      {
        key: 'layout',
        title: 'Dashboard Layout',
        description: 'Choose your patient visualization style.',
        script: 'How do you prefer to view case data? Tactical is broad; Focused guides step-by-step.',
        content: (
          <div className="grid grid-cols-2 gap-4 w-full">
            {[
              { id: 'Tactical View', label: 'Tactical View', desc: 'Web grid, multi-box' },
              { id: 'Focused View', label: 'Focused View', desc: '3D carousel, one-at-a-time' },
            ].map((mode) => (
              <div
                key={mode.id}
                onClick={() => setLayout(mode.id)}
                className={`glass-card cursor-pointer p-6 border-2 flex flex-col gap-2 transition-all ${
                  layout === mode.id ? 'border-[var(--accent)] shadow-[0_12px_36px_rgba(100,244,245,0.24)]' : 'border-white/10'
                }`}
              >
                <Layout size={26} className={layout === mode.id ? 'text-[var(--accent)]' : 'text-[var(--muted)]'} />
                <p className="text-[var(--text)] font-semibold">{mode.label}</p>
                <p className="text-[var(--muted)] text-xs">{mode.desc}</p>
              </div>
            ))}
            <div className="col-span-2 flex gap-3 pt-2">
              <button onClick={() => setStage((s) => s - 1)} className="flex-1 h-12 rounded-full border border-white/15 text-[var(--muted)] flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={() => setStage((s) => s + 1)} className="flex-[1.6] h-12 rounded-full bg-[var(--accent)] text-slate-950 font-semibold">Save Layout</button>
            </div>
          </div>
        ),
      },
      {
        key: 'orientation',
        title: 'Orientation Progress',
        description: 'Training modules verified.',
        script: "Great job completing setup. Clinical utilities unlock next.",
        content: (
          <div className="flex flex-col items-center gap-6 h-full justify-center">
            <div className="relative">
              <ClipboardCheck size={80} className="text-[var(--accent)]" />
              <div className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)]/15" />
            </div>
            <p className="text-2xl font-bold text-[var(--text)]">Orientation Verified</p>
            <p className="text-sm text-[var(--muted)]">Support utilities enabled</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStage((s) => s - 1)} className="flex-1 h-12 rounded-full border border-white/15 text-[var(--muted)] flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={() => setStage((s) => s + 1)} className="flex-[1.6] h-12 rounded-full bg-[var(--accent)] text-slate-950 font-semibold">Continue</button>
            </div>
          </div>
        ),
      },
      {
        key: 'utilities',
        title: 'Clinical Utilities',
        description: 'Select real-time documentation assistance.',
        script: 'I recommend the Audit Lifeline. It intercepts sequence errors.',
        content: (
          <div className="flex flex-col gap-3 w-full">
            {['Teal Splash Cursor', 'Ambient Orange Blob', 'Audit Lifeline'].map((tool) => (
              <div
                key={tool}
                onClick={() => {
                  setUtility(tool)
                  setSelectedUtility(tool)
                }}
                className={`glass-card cursor-pointer p-5 border-2 flex items-center justify-between transition-all ${
                  selectedUtility === tool ? 'border-[var(--accent)] shadow-[0_12px_36px_rgba(100,244,245,0.24)]' : 'border-white/12'
                }`}
              >
                <div className="flex items-center gap-3">
                  {tool === 'Audit Lifeline' ? (
                    <ShieldCheck className="text-[var(--accent)]" />
                  ) : (
                    <MousePointer2 className="text-[var(--accent)]" />
                  )}
                  <div>
                    <p className="text-[var(--text)] font-semibold">{tool}</p>
                    <p className="text-xs text-[var(--muted)]">{tool === 'Audit Lifeline' ? 'Intercepts first safety error' : 'Interactive cursor aesthetic'}</p>
                  </div>
                </div>
                {selectedUtility === tool && <CheckCircle2 size={18} className="text-[var(--accent)]" />}
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStage((s) => s - 1)} className="flex-1 h-12 rounded-full border border-white/15 text-[var(--muted)] flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={() => setStage((s) => s + 1)} className="flex-[1.6] h-12 rounded-full bg-[var(--accent)] text-slate-950 font-semibold">Confirm Utilities</button>
            </div>
          </div>
        ),
      },
      {
        key: 'lock',
        title: 'System Readiness Locked',
        description: 'Finalize readiness before simulation.',
        script: "Everything is set. You're ready to start the Henderson case.",
        content: (
          <div className="flex flex-col items-center gap-6 h-full justify-center">
            <div className="w-full glass-card p-8 border border-white/12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center mx-auto mb-4">
                <Lock size={28} />
              </div>
              <p className="text-xl font-semibold text-[var(--text)]">System Readiness Locked</p>
              <p className="text-sm text-[var(--muted)] mt-2">All settings saved. Safety-first sequence enforced.</p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => setStage((s) => s - 1)} className="flex-1 h-12 rounded-full border border-white/15 text-[var(--muted)] flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={() => setIsSimulationActive(true)}
                className="flex-[1.6] h-12 rounded-full bg-[var(--accent)] text-slate-950 font-semibold shadow-[0_15px_40px_rgba(100,244,245,0.35)]"
              >
                Start Clinical Case
              </button>
            </div>
          </div>
        ),
      },
    ],
    [gain, layout, selectedDevice, selectedUtility, theme]
  )

  const currentStage = onboardingStages[stage]

  // Auto-advance sync stage; skip delay if already completed and user navigates back
  useEffect(() => {
    if (onboardingStages[stage]?.key !== 'sync') {
      setIsSyncing(false)
      return
    }
    if (syncComplete) {
      setStage((prev) => Math.min(prev + 1, onboardingStages.length - 1))
      return
    }
    setIsSyncing(true)
    const t = setTimeout(() => {
      setSyncComplete(true)
      setIsSyncing(false)
      setStage((prev) => Math.min(prev + 1, onboardingStages.length - 1))
    }, 2000)
    return () => clearTimeout(t)
  }, [stage, syncComplete, onboardingStages])

  const handlePointerDown = (e) => {
    if (utility !== 'Teal Splash Cursor') return
    const burst = Array.from({ length: 10 }).map((_, i) => ({
      id: `${Date.now()}-${i}`,
      x: e.clientX,
      y: e.clientY,
      dx: (Math.random() - 0.5) * 160,
      dy: (Math.random() - 0.5) * 160,
    }))
    setParticles((prev) => [...prev, ...burst])
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !burst.find((b) => b.id === p.id)))
    }, 720)
  }

  const handleBoxSelection = (box, value) => {
    if (box === 'box18' && !answers.box24) {
      if (selectedUtility === 'Audit Lifeline' && !lifelineUsedRef.current) {
        lifelineUsedRef.current = true
        setModal('lifeline')
      } else {
        setModal('failure')
      }
      return
    }
    setAnswers((prev) => ({ ...prev, [box]: value }))
  }

  const resetSimulation = () => {
    setAnswers({ box24: null, box18: null })
    setModal(null)
  }

  const completeProtocol = () => setModal('success')

  const renderViewContent = () => {
    switch (viewMode) {
      case 'NC': return <CIHHNightCard />
      case 'LC': return <CIHHLightCard />
      case 'NW': return <CIHHNightWeb />
      case 'LW': return <CIHHLightWeb />
      case 'LP': return <LearningProfessional />
      case 'HELP': return <HelpCenter />
      case '485': return <Interactive485Form theme={theme as 'night' | 'day'} />
      default: return null
    }
  }

  const headerRibbon = (
    <div className="glass-card px-6 py-3 flex items-center justify-between w-full border border-white/10">
      <div className="flex items-center gap-3 text-[var(--muted)] text-xs uppercase tracking-[0.24em]">
        <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
        CareIndeed CMS-485 Master Challenge
      </div>
      <div className="flex items-center gap-2 text-[var(--muted)] text-xs">
        <span className="hidden sm:inline">Pre-Banner · Leads to POC Challenge</span>
        <div className="h-6 px-3 rounded-full bg-white/5 border border-white/10 text-[var(--text)] flex items-center gap-1">
          <HeartPulse size={14} /> Henderson Case
        </div>
      </div>
    </div>
  )

  // ─── Phase-level rendering ───────────────────────────────────
  if (appPhase === 'welcome') {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FAFBF8] text-[#007970] font-mono animate-pulse">Loading…</div>}>
        <WelcomeBanner onStart={() => setAppPhase('calibration')} />
      </Suspense>
    )
  }

  if (appPhase === 'calibration') {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FAFBF8] text-[#007970] font-mono animate-pulse">Loading…</div>}>
        <SystemsCalibration
          onComplete={(result) => {
            setTheme(result.mode === 'light' ? 'day' : 'night')
            setActivePrize(result.prize)
            setAppPhase('practice')
          }}
        />
      </Suspense>
    )
  }

  if (appPhase === 'practice') {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FAFBF8] text-[#007970] font-mono animate-pulse">Loading…</div>}>
        {cursorEnabled && activePrize === 'blob-cursor' && <BlobCursor />}
        {cursorEnabled && activePrize === 'splash-cursor' && <SplashCursor />}
        <Interactive485Form
          theme={theme as 'night' | 'day'}
          onProceed={() => setAppPhase('training')}
        />
        <RewardToggle prize={activePrize} enabled={cursorEnabled} onToggle={() => setCursorEnabled(e => !e)} />
      </Suspense>
    )
  }

  // appPhase === 'training' — original experience
  return (
    <>
      {cursorEnabled && activePrize === 'blob-cursor' && <Suspense fallback={null}><BlobCursor /></Suspense>}
      {cursorEnabled && activePrize === 'splash-cursor' && <Suspense fallback={null}><SplashCursor /></Suspense>}
      <Suspense fallback={null}><RewardToggle prize={activePrize} enabled={cursorEnabled} onToggle={() => setCursorEnabled(e => !e)} /></Suspense>
      <div
        className={`min-h-screen ${theme === 'night' ? 'theme-night' : 'theme-day'} relative overflow-hidden font-sans`}
        style={{ background: 'var(--bg)' }}
        onPointerDown={handlePointerDown}
      >
        <style>{CSS_STYLES}</style>

        {utility === 'Ambient Orange Blob' && (
          <div
            className="orange-blob"
            style={{ transform: `translate(${mousePos.x - 160}px, ${mousePos.y - 160}px)` }}
          />
        )}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{ left: p.x, top: p.y, '--dx': `${p.dx}px`, '--dy': `${p.dy}px` }}
        />
      ))}

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[10%] w-[380px] h-[380px] bg-[var(--accent)]/10 blur-[120px]" />
        <div className="absolute bottom-[-140px] right-[8%] w-[420px] h-[420px] bg-[var(--accent-2)]/12 blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 lg:py-14 flex flex-col gap-6">
        {viewMode === 'DEFAULT' && headerRibbon}

        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-transparent text-white font-mono uppercase tracking-widest animate-pulse">Loading View...</div>}>
          {viewMode !== 'DEFAULT' ? (
            renderViewContent()
          ) : !isSimulationActive ? (
          <div className="glass-card border border-white/12 p-8 lg:p-10 grid lg:grid-cols-2 gap-10 items-stretch">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)] mb-1">Stage 0{stage + 1} · System Readiness</p>
                  <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text)]">{currentStage?.title || 'Loading Stage...'}</h1>
                  <p className="text-[var(--muted)] mt-2">{currentStage?.description || 'Please wait while we initialize the clinical module.'}</p>
                </div>
                <div className="hidden lg:flex items-center gap-2 text-[var(--muted)]">
                  <Sun size={16} className={theme === 'day' ? 'text-[var(--accent)]' : ''} />
                  <div className="w-10 h-6 rounded-full bg-white/10 border border-white/15 relative flex items-center px-1">
                    <div className={`w-4 h-4 rounded-full bg-[var(--accent)] transition-all ${theme === 'night' ? 'translate-x-4' : ''}`} />
                  </div>
                  <Moon size={16} className={theme === 'night' ? 'text-[var(--accent)]' : ''} />
                </div>
              </div>

              <div className="relative h-[520px]">
                <div className="absolute inset-0 glass-card border border-white/10 p-6 lg:p-7 flex flex-col justify-between overflow-hidden">
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-xl">{currentStage.content}</div>
                  </div>

                  <div className="mt-6 flex items-start gap-3 bg-white/5 border border-white/10 rounded-[24px] p-4">
                    <Volume2 size={16} className="text-[var(--accent)] mt-1" />
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]">HR Briefing Script</p>
                      <p className="text-xs text-[var(--muted)] italic leading-relaxed">“{currentStage.script}”</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {onboardingStages.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all ${i <= stage ? 'w-8 bg-[var(--accent)]' : 'w-4 bg-white/12'}`}
                    />
                  ))}
                </div>
                <p className="text-[var(--muted)] font-mono text-xs">READY_STATE_0{stage + 1}</p>
              </div>
            </div>

            <div className="glass-card border border-white/10 p-6 lg:p-7 flex flex-col gap-6 justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Preview · Henderson POC</p>
                  <p className="text-lg font-semibold text-[var(--text)]">The banner routes into this challenge</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center">
                  <Activity />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {vitals.map((v) => (
                  <div key={v.label} className="glass-card p-4 border border-white/10">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-1">{v.label}</p>
                    <p className={`text-lg font-semibold ${v.tone === 'accent-2' ? 'text-[var(--accent-2)]' : 'text-[var(--accent)]'}`}>{v.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {hazards.map((h, idx) => (
                  <div key={idx} className="glass-card p-4 border border-white/10 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${h.severity === 'Critical' ? 'bg-[var(--accent-2)]/15 text-[var(--accent-2)]' : 'bg-amber-500/15 text-amber-400'}`}>
                      <h.icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">{h.text}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Priority: {h.severity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {narrative.map((n, idx) => (
                  <div key={idx} className="glass-card p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={14} className="text-[var(--accent)]" />
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">{n.title}</p>
                    </div>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[var(--muted)] text-xs">
                <span>POC Challenge unlocks after readiness</span>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[var(--accent)]" />
                  Safety Engine Armed
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card border border-white/12 p-6 lg:p-8 grid lg:grid-cols-[420px_1fr] gap-6">
            <aside className="glass-card border border-white/10 p-6 flex flex-col gap-6 max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center text-slate-950 font-bold">CI</div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">Patient Clinical File</p>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">ID: HENDERSON-485-M</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-[var(--accent-2)]/15 text-[var(--accent-2)] text-[10px] uppercase font-semibold">Critical</div>
              </div>

              <section>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)] mb-3">Current Vitals</p>
                <div className="grid grid-cols-2 gap-3">
                  {vitals.map((v) => (
                    <div key={v.label} className="glass-card p-4 border border-white/10">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-1">{v.label}</p>
                      <p className={`text-lg font-semibold ${v.tone === 'accent-2' ? 'text-[var(--accent-2)]' : 'text-[var(--accent)]'}`}>{v.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">Safety Hazards</p>
                {hazards.map((h, idx) => (
                  <div key={idx} className="glass-card p-4 border border-white/10 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${h.severity === 'Critical' ? 'bg-[var(--accent-2)]/15 text-[var(--accent-2)]' : 'bg-amber-500/15 text-amber-400'}`}>
                      <h.icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">{h.text}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Priority: {h.severity}</p>
                    </div>
                  </div>
                ))}
              </section>

              <section className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">Clinical Narrative</p>
                {narrative.map((n, idx) => (
                  <div key={idx} className="glass-card p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={14} className="text-[var(--accent)]" />
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">{n.title}</p>
                    </div>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </section>
            </aside>

            <main className="glass-card border border-white/10 p-6 lg:p-8 flex flex-col gap-6">
              <header className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">CMS-485 Audit Simulation</p>
                    <p className="text-2xl font-bold text-[var(--text)]">Safety First Engine (Critical)</p>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--muted)] text-sm">
                    <Activity size={16} className="text-[var(--accent)]" />
                    Layout: <span className="text-[var(--accent)]">{layout}</span>
                  </div>
                </div>
                <div className="text-[var(--muted)] text-sm">Audit Lifeline is {selectedUtility === 'Audit Lifeline' && !lifelineUsedRef.current ? 'armed for first violation' : 'inactive'}.</div>
              </header>

              {layout === 'Tactical View' ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      className={`glass-card p-5 border-2 transition-all ${
                        answers[card.id] ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-white/12'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        {card.id === 'box24' ? (
                          <ShieldAlert className="text-[var(--accent-2)]" />
                        ) : (
                          <Droplets className="text-[var(--accent-2)]" />
                        )}
                        <div>
                          <p className="text-lg font-semibold text-[var(--text)]">{card.title}</p>
                          <p className="text-sm text-[var(--muted)]">{card.prompt}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        {(card.id === 'box24'
                          ? ['Standard Home Precautions', '911 Emergency Activation', 'Caregiver Refresher Training']
                          : ['Standard Daily Cleanse', 'Vascular Specialist Referral', '2w1 Complex Wound Protocol']
                        ).map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleBoxSelection(card.id, opt)}
                            className={`text-left px-4 py-3 rounded-[18px] border-2 font-semibold transition-all ${
                              answers[card.id] === opt
                                ? 'bg-[var(--accent)] text-slate-950 border-[var(--accent)]'
                                : 'border-white/10 bg-white/5 text-[var(--text)] hover:border-[var(--accent)]/50'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 perspective-1000">
                  <div className="relative w-full max-w-xl h-[360px]">
                    {cards.map((card, idx) => (
                      <div
                        key={card.id}
                        className="absolute inset-0 glass-card border-2 border-white/12 card-3d p-6 flex flex-col justify-between"
                        style={{
                          opacity: carouselIndex === idx ? 1 : 0,
                          transform: carouselIndex === idx ? 'rotateX(0deg) translateZ(0)' : 'rotateX(38deg) translateZ(-120px)',
                          zIndex: carouselIndex === idx ? 2 : 0,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {card.id === 'box24' ? (
                            <ShieldAlert className="text-[var(--accent-2)]" />
                          ) : (
                            <Droplets className="text-[var(--accent-2)]" />
                          )}
                          <div>
                            <p className="text-lg font-semibold text-[var(--text)]">{card.title}</p>
                            <p className="text-sm text-[var(--muted)]">{card.prompt}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          {(card.id === 'box24'
                            ? ['Standard Home Precautions', '911 Emergency Activation', 'Caregiver Refresher Training']
                            : ['Standard Daily Cleanse', 'Vascular Specialist Referral', '2w1 Complex Wound Protocol']
                          ).map((opt) => (
                            <button
                              key={opt}
                              onClick={() => handleBoxSelection(card.id, opt)}
                              className={`text-left px-4 py-3 rounded-[18px] border-2 font-semibold transition-all ${
                                answers[card.id] === opt
                                  ? 'bg-[var(--accent)] text-slate-950 border-[var(--accent)]'
                                  : 'border-white/10 bg-white/5 text-[var(--text)] hover:border-[var(--accent)]/50'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {cards.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCarouselIndex(idx)}
                        className={`h-2 rounded-full transition-all ${carouselIndex === idx ? 'w-10 bg-[var(--accent)]' : 'w-6 bg-white/15'}`}
                        aria-label={`Go to card ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="text-[var(--muted)] text-sm">
                  Sequence rule: Box 24 (Safety) must be answered before Box 18 (Wound Care).
                </div>
                {answers.box24 && answers.box18 && (
                  <button
                    onClick={completeProtocol}
                    className="h-12 px-6 rounded-full bg-[var(--accent)] text-slate-950 font-semibold shadow-[0_12px_32px_rgba(100,244,245,0.25)] flex items-center gap-2"
                  >
                    Commit Protocol <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </main>
          </div>
        )}
      </Suspense>
    </div>

    {modal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-[10px] z-[200] flex items-center justify-center px-4">
        <div className="glass-card border-2 border-white/15 max-w-md w-full p-8 text-center">
          {modal === 'failure' && (
            <>
              <div className="w-16 h-16 rounded-full bg-[var(--accent-2)]/15 text-[var(--accent-2)] flex items-center justify-center mx-auto mb-4">
                <ShieldAlert size={28} />
              </div>
              <p className="text-2xl font-bold text-[var(--text)] mb-2">Clinical Sequence Error</p>
              <p className="text-[var(--muted)] mb-6">Safety (Box 24) must be documented before specialized wound treatment (Box 18).</p>
              <button onClick={() => setModal(null)} className="h-12 px-6 rounded-full bg-[var(--accent-2)] text-white font-semibold w-full">Rectify Documentation</button>
            </>
          )}
          {modal === 'lifeline' && (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={28} />
              </div>
              <p className="text-2xl font-bold text-[var(--text)] mb-2">Audit Lifeline Applied</p>
              <p className="text-[var(--muted)] mb-6">Your documentation sequence was intercepted. Document Box 24 prior to clinical intervention.</p>
              <button onClick={() => setModal(null)} className="h-12 px-6 rounded-full bg-[var(--accent)] text-slate-950 font-semibold w-full">Resume Audit</button>
            </>
          )}
          {modal === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} />
              </div>
              <p className="text-2xl font-bold text-[var(--text)] mb-2">Documentation Verified</p>
              <p className="text-[var(--muted)] mb-6">CMS-485 mapping for the Henderson case is complete. Compliance check passed.</p>
              <div className="flex gap-3">
                <button onClick={resetSimulation} className="flex-1 h-12 rounded-full border border-white/15 text-[var(--muted)]">Reset</button>
                <button onClick={() => setModal(null)} className="flex-1 h-12 rounded-full bg-[var(--accent)] text-slate-950 font-semibold">Close</button>
              </div>
            </>
          )}
        </div>
      </div>
    )}

    <Cursor utility={selectedUtility} mousePos={mousePos} theme={theme} />

    {/* Debug Shortcuts */}
    <DraggableWrapper className="group fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
        {/* Module/Simulation Stage Shortcuts (Only in DEFAULT view) */}
        {viewMode === 'DEFAULT' && (
          <div className="flex gap-2 p-2 bg-black/60 backdrop-blur-sm rounded-full border border-white/20 shadow-2xl scale-75 hover:scale-100 transition-all pointer-events-auto">
            {onboardingStages.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setStage(i)
                  setIsSimulationActive(false)
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  !isSimulationActive && stage === i 
                    ? 'bg-[var(--accent)] text-slate-950 scale-110' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={s.title}
              >
                {i + 1}
              </button>
            ))}
            <div className="w-px h-8 bg-white/20 mx-1" />
            <button
              onClick={() => setIsSimulationActive(true)}
              className={`px-3 h-8 rounded-full text-[10px] font-bold transition-all ${
                isSimulationActive 
                  ? 'bg-[var(--accent-2)] text-white scale-110' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              SIM
            </button>
          </div>
        )}

        {/* Global Component Content Shortcuts */}
        <div className="flex gap-2 p-2 bg-black/90 backdrop-blur-xl rounded-full border-2 border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.3)] hover:scale-105 transition-all pointer-events-auto">
          <div className="flex items-center px-2 mr-1 border-r border-white/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping mr-2" />
            <span className="text-[9px] font-black text-white tracking-widest uppercase italic">Debug_Nav</span>
          </div>
          {[
            { id: 'DEFAULT', label: 'Dashboard', color: 'bg-white text-slate-950' },
            { id: 'NC', label: 'Night-Card', color: 'bg-teal-500 text-slate-950' },
            { id: 'LC', label: 'Light-Card', color: 'bg-orange-500 text-white' },
            { id: 'NW', label: 'Night-Web', color: 'bg-indigo-600 text-white' },
            { id: 'LW', label: 'Light-Web', color: 'bg-sky-500 text-white' },
            { id: 'LP', label: 'Learn-Pro', color: 'bg-emerald-600 text-white' },
            { id: 'HELP', label: 'Glossary', color: 'bg-rose-500 text-white' },
            { id: '485', label: 'CMS-485', color: 'bg-amber-600 text-white' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id)}
              className={`px-4 h-9 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap shadow-sm ${
                viewMode === v.id ? v.color + ' ring-4 ring-white/30 scale-110' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Phase shortcuts */}
        <div className="flex gap-2 p-2 bg-black/80 backdrop-blur-xl rounded-full border-2 border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:scale-105 transition-all pointer-events-auto">
          <div className="flex items-center px-2 mr-1 border-r border-white/20">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping mr-2" />
            <span className="text-[9px] font-black text-white tracking-widest uppercase italic">Phase</span>
          </div>
          {([
            { id: 'welcome' as AppPhase, label: 'Welcome', color: 'bg-cyan-500 text-slate-950' },
            { id: 'calibration' as AppPhase, label: 'Calibrate', color: 'bg-teal-500 text-slate-950' },
            { id: 'practice' as AppPhase, label: 'Practice', color: 'bg-orange-500 text-white' },
            { id: 'training' as AppPhase, label: 'Training', color: 'bg-emerald-600 text-white' },
          ]).map((ph) => (
            <button
              key={ph.id}
              onClick={() => setAppPhase(ph.id)}
              className={`px-4 h-9 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap shadow-sm ${
                appPhase === ph.id ? ph.color + ' ring-4 ring-white/30 scale-110' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {ph.label}
            </button>
          ))}
        </div>
      </DraggableWrapper>
    </div>
    </>
  )
}
