import { useEffect, useState, lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import { Bug, Minimize2, Maximize2 } from 'lucide-react'

// Lazy load components
const CIHHNightCard = lazy(() => import('./components/design/CIHHNightCard'))
const CIHHLightCard = lazy(() => import('./components/design/CIHHLightCard'))
const CIHHNightWeb = lazy(() => import('./components/design/CIHHNightWeb'))
const CIHHLightWeb = lazy(() => import('./components/design/CIHHLightWeb'))
const LearningProfessional = lazy(() => import('./LearningProfessional'))
const HelpCenter = lazy(() => import('./components/HelpCenter'))
const Interactive485Form = lazy(() => import('./components/Interactive485Form'))
const FinalExamWeb = lazy(() => import('./components/FinalExamWeb'))
const WelcomeBanner = lazy(() => import('./components/WelcomeBanner'))
const SystemsCalibration = lazy(() => import('./components/SystemsCalibration'))
const LayoutChallenge = lazy(() => import('./components/LayoutChallenge'))
const HendersonChallenge = lazy(() => import('./components/HendersonChallenge'))
const CourseSelectionPage = lazy(() => import('./components/CourseSelectionPage'))
const BlobCursor = lazy(() => import('./components/BlobCursor'))
const SplashCursor = lazy(() => import('./components/SplashCursor'))
const RewardToggle = lazy(() => import('./components/RewardToggle'))
import { applyTheme, getStoredTheme } from './theme'
import type { CourseModule } from './components/CourseSelectionPage'

// ─── App Phase: welcome → calibration → layout-challenge → henderson-challenge → course-selection → training ───
type AppPhase = 'welcome' | 'calibration' | 'layout-challenge' | 'henderson-challenge' | 'course-selection' | 'training'
type LearningStartTarget = 'course-selection' | 'first-card' | 'quiz'
type DockNavigationTarget =
  | 'welcome-banner'
  | 'system-calibration'
  | 'layout-challenge'
  | 'henderson-challenge'
  | 'interactive-form'
  | 'night-card'
  | 'light-card'
  | 'night-web'
  | 'light-web'
  | 'final-exam'
  | 'course-selection'
  | 'first-card'
  | 'quiz'
  | 'glossary'
  | 'cms-485'
type PrizeId = 'retake-challenge' | 'blob-cursor' | 'splash-cursor' | null

export default function App() {
  const location = useLocation()
  const [appPhase, setAppPhase] = useState<AppPhase>('welcome')
  const [activePrize, setActivePrize] = useState<PrizeId>(null)
  const [cursorEnabled, setCursorEnabled] = useState(true)
  const [viewMode, setViewMode] = useState('DEFAULT')
  const [learningStartTarget, setLearningStartTarget] = useState<LearningStartTarget>('course-selection')
  const [learningNavigationNonce, setLearningNavigationNonce] = useState(0)
  const [qaModeEnabled, setQaModeEnabled] = useState(true)
  const [isDebugDockMinimized, setIsDebugDockMinimized] = useState(false)
  const [theme, setTheme] = useState(getStoredTheme() === 'night' ? 'night' : 'day')

  useEffect(() => {
    const handleThemeChanged = (event: Event) => {
      const detail = (event as CustomEvent<'light' | 'night'>).detail
      setTheme(detail === 'night' ? 'night' : 'day')
    }

    window.addEventListener('theme-changed', handleThemeChanged)
    return () => window.removeEventListener('theme-changed', handleThemeChanged)
  }, [])



  // ─── Module selection handler ───
  const handleModuleSelect = (moduleId: CourseModule) => {
    switch (moduleId) {
      case 'card-training':
        setViewMode(theme === 'night' ? 'NC' : 'LC')
        break
      case 'book-training':
        setViewMode(theme === 'night' ? 'NW' : 'LW')
        break
      case 'learning-pro':
        setViewMode('LP')
        break
      case 'interactive-form':
        setViewMode('485')
        break
      case 'final-exam':
        setViewMode('FE')
        break
      case 'glossary':
        setViewMode('HELP')
        break
    }
    setAppPhase('training')
  }


  const navigateFromDock = (target: DockNavigationTarget) => {
    switch (target) {
      case 'welcome-banner':
        setAppPhase('welcome')
        return
      case 'system-calibration':
        setAppPhase('calibration')
        return
      case 'layout-challenge':
        setAppPhase('layout-challenge')
        return
      case 'henderson-challenge':
        setAppPhase('henderson-challenge')
        return
      case 'interactive-form':
        setAppPhase('training')
        setViewMode('485')
        return
      case 'night-card':
        setAppPhase('training')
        setViewMode('NC')
        return
      case 'light-card':
        setAppPhase('training')
        setViewMode('LC')
        return
      case 'night-web':
        setAppPhase('training')
        setViewMode('NW')
        return
      case 'light-web':
        setAppPhase('training')
        setViewMode('LW')
        return
      case 'final-exam':
        setAppPhase('training')
        setViewMode('FE')
        return
      case 'course-selection':
        setAppPhase('course-selection')
        return
      case 'first-card':
        setLearningStartTarget('first-card')
        setLearningNavigationNonce(prev => prev + 1)
        setAppPhase('training')
        setViewMode('LP')
        return
      case 'quiz':
        setLearningStartTarget('quiz')
        setLearningNavigationNonce(prev => prev + 1)
        setAppPhase('training')
        setViewMode('LP')
        return
      case 'glossary':
        setAppPhase('training')
        setViewMode('HELP')
        return
      case 'cms-485':
        setAppPhase('training')
        setViewMode('485')
        return
      default:
        return
    }
  }

  useEffect(() => {
    const hashQuery = (() => {
      const hash = window.location.hash ?? ''
      const queryStart = hash.indexOf('?')
      if (queryStart === -1) return ''
      return hash.slice(queryStart + 1)
    })()

    const params = new URLSearchParams(location.search || hashQuery)
    const rawTarget = params.get('dock')
    const allowedTargets: DockNavigationTarget[] = [
      'welcome-banner',
      'system-calibration',
      'layout-challenge',
      'henderson-challenge',
      'interactive-form',
      'night-card',
      'light-card',
      'night-web',
      'light-web',
      'final-exam',
      'course-selection',
      'first-card',
      'quiz',
      'glossary',
      'cms-485',
    ]
    const target = allowedTargets.includes(rawTarget as DockNavigationTarget)
      ? (rawTarget as DockNavigationTarget)
      : null
    if (!target) return
    navigateFromDock(target)
  }, [location.search])

  const renderViewContent = () => {
    switch (viewMode) {
      case 'NC': return <CIHHNightCard onNavigate={(p) => setAppPhase(p as AppPhase)} />
      case 'LC': return <CIHHLightCard onNavigate={(p) => setAppPhase(p as AppPhase)} />
      case 'NW': return <CIHHNightWeb onNavigate={(p) => setAppPhase(p as AppPhase)} />
      case 'LW': return <CIHHLightWeb onNavigate={(p) => setAppPhase(p as AppPhase)} />
      case 'FE': return <FinalExamWeb theme={theme as 'night' | 'day'} onExit={() => setViewMode(theme === 'day' ? 'LW' : 'NW')} />
      case 'LP': return <LearningProfessional qaEnabled={qaModeEnabled} startAtModuleSelection={learningStartTarget === 'course-selection'} startTarget={learningStartTarget} navigationNonce={learningNavigationNonce} />
      case 'HELP': return <HelpCenter />
      case '485': return <Interactive485Form theme={theme as 'night' | 'day'} />
      default: return null
    }
  }

  // ─── Phase-level rendering ───────────────────────────────────
  const loadingFallback = (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFBF8] text-[#007970] font-mono animate-pulse">Loading…</div>
  )

  if (appPhase === 'welcome') {
    return (
      <Suspense fallback={loadingFallback}>
        <WelcomeBanner onStart={() => setAppPhase('calibration')} />
      </Suspense>
    )
  }

  if (appPhase === 'calibration') {
    return (
      <Suspense fallback={loadingFallback}>
        <SystemsCalibration
          onComplete={(result) => {
            const newTheme = result.mode === 'light' ? 'day' : 'night'
            setTheme(newTheme)
            applyTheme(result.mode === 'light' ? 'light' : 'night')
            setActivePrize(result.prize)
            setAppPhase('layout-challenge')
          }}
        />
      </Suspense>
    )
  }

  if (appPhase === 'layout-challenge') {
    return (
      <Suspense fallback={loadingFallback}>
        {cursorEnabled && activePrize === 'blob-cursor' && <BlobCursor />}
        {cursorEnabled && activePrize === 'splash-cursor' && <SplashCursor />}
        <LayoutChallenge
          theme={theme === 'night' ? 'night' : 'day'}
          onComplete={() => setAppPhase('henderson-challenge')}
          onBack={() => setAppPhase('calibration')}
        />
        <RewardToggle prize={activePrize} enabled={cursorEnabled} onToggle={() => setCursorEnabled(e => !e)} />
      </Suspense>
    )
  }

  if (appPhase === 'henderson-challenge') {
    return (
      <Suspense fallback={loadingFallback}>
        {cursorEnabled && activePrize === 'blob-cursor' && <BlobCursor />}
        {cursorEnabled && activePrize === 'splash-cursor' && <SplashCursor />}
        <HendersonChallenge onExit={() => setAppPhase('course-selection')} />
        <RewardToggle prize={activePrize} enabled={cursorEnabled} onToggle={() => setCursorEnabled(e => !e)} />
      </Suspense>
    )
  }

  if (appPhase === 'course-selection') {
    return (
      <Suspense fallback={loadingFallback}>
        {cursorEnabled && activePrize === 'blob-cursor' && <BlobCursor />}
        {cursorEnabled && activePrize === 'splash-cursor' && <SplashCursor />}
        <CourseSelectionPage
          theme={theme === 'night' ? 'night' : 'day'}
          onSelect={handleModuleSelect}
        />
        <RewardToggle prize={activePrize} enabled={cursorEnabled} onToggle={() => setCursorEnabled(e => !e)} />
      </Suspense>
    )
  }

  // appPhase === 'training'
  return (
    <>
      {cursorEnabled && activePrize === 'blob-cursor' && <Suspense fallback={null}><BlobCursor /></Suspense>}
      {cursorEnabled && activePrize === 'splash-cursor' && <Suspense fallback={null}><SplashCursor /></Suspense>}
      <Suspense fallback={null}><RewardToggle prize={activePrize} enabled={cursorEnabled} onToggle={() => setCursorEnabled(e => !e)} /></Suspense>
      <div className="relative z-10 w-full h-screen">
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-transparent text-white font-mono uppercase tracking-widest animate-pulse">Loading View...</div>}>
          {renderViewContent()}
        </Suspense>
      </div>
      {/* Debug Shortcuts */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 p-2 bg-black/85 backdrop-blur-md rounded-full border border-white/20">
          <button
            onClick={() => setQaModeEnabled(prev => !prev)}
            className={`px-3 h-8 rounded-full text-[10px] font-black uppercase tracking-wide transition-all ${
              qaModeEnabled
                ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300/40'
                : 'bg-slate-700 text-slate-200'
            }`}
            title="Toggle QA mode"
          >
            QA: {qaModeEnabled ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setIsDebugDockMinimized(prev => !prev)}
            className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
            title={isDebugDockMinimized ? 'Expand debug dock' : 'Minimize debug dock'}
          >
            {isDebugDockMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
        </div>

        {isDebugDockMinimized ? (
          <button
            onClick={() => setIsDebugDockMinimized(false)}
            className="w-12 h-12 rounded-full bg-black/90 border-2 border-red-500 text-red-300 shadow-[0_0_30px_rgba(239,68,68,0.35)] hover:scale-105 transition-all flex items-center justify-center"
            title="Open debug dock"
          >
            <Bug size={18} />
          </button>
        ) : (
          <>
            {/* View mode shortcuts */}
            <div className="flex gap-2 p-2 bg-black/90 backdrop-blur-xl rounded-full border-2 border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.3)] hover:scale-105 transition-all">
              <div className="flex items-center px-2 mr-1 border-r border-white/20">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping mr-2" />
                <span className="text-[9px] font-black text-white tracking-widest uppercase italic">View</span>
              </div>
              {[
                { id: 'NC', label: 'Night-Card', color: 'bg-teal-500 text-slate-950' },
                { id: 'LC', label: 'Light-Card', color: 'bg-orange-500 text-white' },
                { id: 'NW', label: 'Night-Web', color: 'bg-indigo-600 text-white' },
                { id: 'LW', label: 'Light-Web', color: 'bg-sky-500 text-white' },
                { id: 'LP', label: 'Learn-Pro', color: 'bg-emerald-600 text-white' },
                { id: 'HELP', label: 'Glossary', color: 'bg-rose-500 text-white' },
                { id: '485', label: 'CMS-485', color: 'bg-amber-600 text-white' },
                { id: 'FE', label: 'Final Exam', color: 'bg-purple-600 text-white' },
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
            <div className="flex gap-2 p-2 bg-black/80 backdrop-blur-xl rounded-full border-2 border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:scale-105 transition-all">
              <div className="flex items-center px-2 mr-1 border-r border-white/20">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping mr-2" />
                <span className="text-[9px] font-black text-white tracking-widest uppercase italic">Phase</span>
              </div>
              {([
                { id: 'welcome' as AppPhase, label: 'Welcome', color: 'bg-cyan-500 text-slate-950' },
                { id: 'calibration' as AppPhase, label: 'Calibrate', color: 'bg-teal-500 text-slate-950' },
                { id: 'layout-challenge' as AppPhase, label: 'Layout', color: 'bg-orange-500 text-white' },
                { id: 'henderson-challenge' as AppPhase, label: 'Henderson', color: 'bg-rose-500 text-white' },
                { id: 'course-selection' as AppPhase, label: 'Courses', color: 'bg-indigo-500 text-white' },
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
          </>
        )}
      </div>
    </>
  )
}
