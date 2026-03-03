/* ── App.tsx — Backup-pattern rendering + extended flow ─────────
 *  Uses backup's simple AppPhase if/else rendering (NOT state machine).
 *  All visual wrappers match backup EXACTLY.
 *
 *  Extended FLOW:
 *    welcome-orientation → onboarding (11 cards) → nav-training →
 *    challenge-landing → layout-challenge → henderson-challenge →
 *    course-selection → training → summary → complete
 *
 *  Dock: rendered at App level for phases without component docks.
 *        Components with their own docks (LC, LW, NW, FE) render
 *        their own; App dock is hidden for those views.
 * ─────────────────────────────────────────────────────────────── */

import { useEffect, useState, lazy, Suspense, useMemo, useRef } from 'react'

// Lazy load components — backup set
const CIHHNightCard = lazy(() => import('./components/design/CIHHNightCard'))
const CIHHLightCard = lazy(() => import('./components/design/CIHHLightCard'))
const CIHHNightWeb = lazy(() => import('./components/design/CIHHNightWeb'))
const CIHHLightWeb = lazy(() => import('./components/design/CIHHLightWeb'))
const LearningProfessional = lazy(() => import('./LearningProfessional'))
const HelpCenter = lazy(() => import('./components/HelpCenter'))
const Interactive485Form = lazy(() => import('./components/Interactive485Form'))
const FinalExamWeb = lazy(() => import('./components/FinalExamWeb'))
const OnboardingCardFlow = lazy(() => import('./components/OnboardingCardFlow'))
const LayoutChallenge = lazy(() => import('./components/LayoutChallenge'))
const CourseSelectionPage = lazy(() => import('./components/CourseSelectionPage'))
const BlobCursor = lazy(() => import('./components/BlobCursor'))
const SplashCursor = lazy(() => import('./components/SplashCursor'))
const RewardToggle = lazy(() => import('./components/RewardToggle'))
// New components for extended flow
const NavigationTraining = lazy(() => import('./components/NavigationTraining'))
const PreChallengeCoursePage = lazy(() => import('./components/PreChallengeCoursePage'))
const WelcomeOrientationCard = lazy(() => import('./components/WelcomeOrientationCard'))
const SummaryPage = lazy(() => import('./components/SummaryPage'))

import { applyTheme, getStoredTheme } from './theme'
import type { CourseModule } from './components/CourseSelectionPage'
import { Dock, type DockItem } from './components/Dock'
import {
  Home,
  BookOpen,
  FileText,
  ClipboardCheck,
  LayoutGrid,
  HeartPulse,
  Sun,
  Moon,
} from 'lucide-react'

// ─── Extended App Phase ───────────────────────────────────────
type AppPhase =
  | 'welcome-orientation'
  | 'welcome' | 'calibration' | 'challenge-notice'
  | 'nav-training'
  | 'challenge-landing'
  | 'layout-challenge'
  | 'henderson-challenge'
  | 'course-selection'
  | 'training'
  | 'summary'
  | 'complete'

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

// Phases where dock navigation is locked (except theme toggle)
const LOCKED_PHASES: AppPhase[] = [
  'welcome-orientation', 'welcome', 'calibration', 'challenge-notice',
  'nav-training', 'challenge-landing', 'layout-challenge', 'henderson-challenge',
]

export default function App() {
  const [appPhase, setAppPhase] = useState<AppPhase>('welcome-orientation')
  const activePrize: PrizeId = null
  const [cursorEnabled, setCursorEnabled] = useState(true)
  const [viewMode, setViewMode] = useState('DEFAULT')
  const [learningStartTarget, setLearningStartTarget] = useState<LearningStartTarget>('course-selection')
  const [learningNavigationNonce, setLearningNavigationNonce] = useState(0)
  const qaModeEnabled = true
  const [theme, setTheme] = useState(getStoredTheme() === 'night' ? 'night' : 'day')

  // Ref for reading current phase in event-handler closures
  const appPhaseRef = useRef<AppPhase>(appPhase)
  appPhaseRef.current = appPhase

  useEffect(() => {
    const handleThemeChanged = (event: Event) => {
      const detail = (event as CustomEvent<'light' | 'night'>).detail
      setTheme(detail === 'night' ? 'night' : 'day')
    }
    window.addEventListener('theme-changed', handleThemeChanged)
    return () => window.removeEventListener('theme-changed', handleThemeChanged)
  }, [])

  // ─── Module selection handler (backup pattern) ─────────────
  const handleModuleSelect = (moduleId: CourseModule) => {
    switch (moduleId) {
      case 'card-training':
        setLearningStartTarget('course-selection')
        setLearningNavigationNonce(prev => prev + 1)
        setViewMode('LP')
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

  // ─── Dock navigation (backup pattern + onboarding lock) ────
  const navigateFromDock = (target: DockNavigationTarget) => {
    // During locked phases, block all navigation (theme handled separately)
    if (LOCKED_PHASES.includes(appPhaseRef.current)) return

    switch (target) {
      case 'welcome-banner':
        setAppPhase('welcome-orientation')
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

  // ─── Hash routing (backup pattern) ─────────────────────────
  const parseDockTarget = (): DockNavigationTarget | null => {
    const hash = window.location.hash ?? ''
    const queryStart = hash.indexOf('?')
    if (queryStart === -1) return null
    const params = new URLSearchParams(hash.slice(queryStart + 1))
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
    if (!rawTarget) return null
    return allowedTargets.includes(rawTarget as DockNavigationTarget)
      ? (rawTarget as DockNavigationTarget)
      : 'light-card'
  }

  useEffect(() => {
    const applyDockFromHash = () => {
      const target = parseDockTarget()
      if (!target) {
        // No hash — during locked phases stay put; otherwise default to light-card
        if (LOCKED_PHASES.includes(appPhaseRef.current)) return
        const nonce = Date.now()
        const hash = `/?dock=light-card&n=${nonce}`
        if (window.location.hash !== hash) {
          window.location.hash = hash
        }
        navigateFromDock('light-card')
        return
      }
      navigateFromDock(target)
    }

    const handleDockNav = (event: Event) => {
      const detail = (event as CustomEvent<DockNavigationTarget>).detail
      if (!detail) return
      navigateFromDock(detail)
    }

    applyDockFromHash()
    window.addEventListener('hashchange', applyDockFromHash)
    window.addEventListener('dock-nav', handleDockNav as EventListener)
    return () => {
      window.removeEventListener('hashchange', applyDockFromHash)
      window.removeEventListener('dock-nav', handleDockNav as EventListener)
    }
  }, [])

  // ─── App-level Dock ────────────────────────────────────────
  const isDarkMode = theme === 'night'
  const isLocked = LOCKED_PHASES.includes(appPhase)

  // Hide App dock when component renders its own (LC, LW, NW, FE)
  const showAppDock = !(appPhase === 'training' && ['LC', 'LW', 'NW', 'FE'].includes(viewMode))

  const appDockItems: DockItem[] = useMemo(() => {
    const fire = (target: DockNavigationTarget) => {
      const nonce = Date.now()
      window.location.hash = `/?dock=${target}&n=${nonce}`
    }

    const items: DockItem[] = [
      { icon: <Home className="w-5 h-5" />, label: 'Home', onClick: () => fire('welcome-banner'),
        isActive: appPhase === 'welcome-orientation' },
      { icon: isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />,
        label: isDarkMode ? 'Night Mode' : 'Light Mode',
        onClick: () => {
          const newTheme = isDarkMode ? 'light' : 'night'
          applyTheme(newTheme)
          setTheme(newTheme === 'night' ? 'night' : 'day')
        },
        isActive: false },
      { icon: <BookOpen className="w-5 h-5" />, label: 'Training Cards', onClick: () => fire('light-card'),
        isActive: viewMode === 'LC' || viewMode === 'NC' },
      { icon: <FileText className="w-5 h-5" />, label: 'Help Center', onClick: () => fire('glossary'),
        isActive: viewMode === 'HELP' },
      { icon: <LayoutGrid className="w-5 h-5" />, label: 'Course Selection', onClick: () => fire('course-selection'),
        isActive: appPhase === 'course-selection' },
      { icon: <HeartPulse className="w-5 h-5" />, label: 'CMS-485 Form', onClick: () => fire('cms-485'),
        isActive: viewMode === '485' },
      { icon: <ClipboardCheck className="w-5 h-5" />, label: 'Final Test', onClick: () => fire('final-exam'),
        isActive: viewMode === 'FE' },
    ]

    // Lock nav items during onboarding/challenge (allow theme toggle at index 1)
    if (isLocked) {
      return items.map((item, i) => i === 1 ? item : { ...item, onClick: () => { /* locked */ } })
    }
    return items
  }, [appPhase, isDarkMode, viewMode, isLocked])

  // ─── View content renderer (backup pattern) ────────────────
  const renderViewContent = () => {
    switch (viewMode) {
      case 'NC': return <CIHHNightCard onNavigate={(p: string) => setAppPhase(p as AppPhase)} />
      case 'LC': return <CIHHLightCard onNavigate={(p: string) => setAppPhase(p as AppPhase)} />
      case 'NW': return <CIHHNightWeb onNavigate={(p: string) => setAppPhase(p as AppPhase)} />
      case 'LW': return <CIHHLightWeb onNavigate={(p: string) => setAppPhase(p as AppPhase)} />
      case 'FE': return <FinalExamWeb theme={theme as 'night' | 'day'} onExit={() => setAppPhase('summary')} />
      case 'LP': return <LearningProfessional qaEnabled={qaModeEnabled} startAtModuleSelection={learningStartTarget === 'course-selection'} startTarget={learningStartTarget} navigationNonce={learningNavigationNonce} />
      case 'HELP': return <HelpCenter />
      case '485': return <Interactive485Form theme={theme as 'night' | 'day'} qaMode={qaModeEnabled} />
      default: return null
    }
  }

  // ─── Loading fallback ──────────────────────────────────────
  const loadingFallback = (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFBF8] text-[#007970] font-mono animate-pulse">Loading…</div>
  )

  // ═══════════════════════════════════════════════════════════
  // PHASE RENDERING — backup if/else pattern + extended phases
  // ═══════════════════════════════════════════════════════════

  // ─── Welcome Orientation (NEW) ─────────────────────────────
  if (appPhase === 'welcome-orientation') {
    return (
      <Suspense fallback={loadingFallback}>
        {showAppDock && <Dock items={appDockItems} position="center-left" isDarkMode={isDarkMode} />}
        <div
          className={`min-h-screen flex items-center justify-center p-4 md:p-8 ${isDarkMode ? 'dark' : ''}`}
          style={{
            background: isDarkMode
              ? 'radial-gradient(circle at 20% 20%, #031213 0%, #010809 45%, #010809 100%)'
              : 'linear-gradient(180deg, #FAFBF8 0%, #F0EBE6 100%)',
          }}
        >
          <WelcomeOrientationCard isDarkMode={isDarkMode} onStart={() => setAppPhase('welcome')} />
        </div>
        <RewardToggle prize={activePrize} enabled={cursorEnabled} onToggle={() => setCursorEnabled(e => !e)} />
      </Suspense>
    )
  }

  // ─── OnboardingCardFlow (exact backup rendering) ───────────
  if (appPhase === 'welcome' || appPhase === 'calibration' || appPhase === 'challenge-notice') {
    return (
      <Suspense fallback={loadingFallback}>
        {showAppDock && <Dock items={appDockItems} position="center-left" isDarkMode={isDarkMode} />}
        <OnboardingCardFlow
          onComplete={(result) => {
            const newTheme = result.theme
            setTheme(newTheme)
            applyTheme(newTheme === 'night' ? 'night' : 'light')
            setAppPhase('nav-training')
          }}
        />
      </Suspense>
    )
  }

  // ─── Navigation Training (NEW) ─────────────────────────────
  if (appPhase === 'nav-training') {
    return (
      <Suspense fallback={loadingFallback}>
        {showAppDock && <Dock items={appDockItems} position="center-left" isDarkMode={isDarkMode} />}
        {cursorEnabled && activePrize === 'blob-cursor' && <BlobCursor />}
        {cursorEnabled && activePrize === 'splash-cursor' && <SplashCursor />}
        <NavigationTraining
          theme={theme === 'night' ? 'night' : 'day'}
          onComplete={() => setAppPhase('challenge-landing')}
        />
        <RewardToggle prize={activePrize} enabled={cursorEnabled} onToggle={() => setCursorEnabled(e => !e)} />
      </Suspense>
    )
  }

  // ─── Challenge Landing (NEW) ───────────────────────────────
  if (appPhase === 'challenge-landing') {
    return (
      <Suspense fallback={loadingFallback}>
        {showAppDock && <Dock items={appDockItems} position="center-left" isDarkMode={isDarkMode} />}
        {cursorEnabled && activePrize === 'blob-cursor' && <BlobCursor />}
        {cursorEnabled && activePrize === 'splash-cursor' && <SplashCursor />}
        <PreChallengeCoursePage
          theme={theme === 'night' ? 'night' : 'day'}
          onBack={() => setAppPhase('nav-training')}
          onContinue={() => setAppPhase('layout-challenge')}
        />
        <RewardToggle prize={activePrize} enabled={cursorEnabled} onToggle={() => setCursorEnabled(e => !e)} />
      </Suspense>
    )
  }

  // ─── Layout Challenge (exact backup rendering) ─────────────
  if (appPhase === 'layout-challenge') {
    return (
      <Suspense fallback={loadingFallback}>
        {showAppDock && <Dock items={appDockItems} position="center-left" isDarkMode={isDarkMode} />}
        {cursorEnabled && activePrize === 'blob-cursor' && <BlobCursor />}
        {cursorEnabled && activePrize === 'splash-cursor' && <SplashCursor />}
        <LayoutChallenge
          theme={theme === 'night' ? 'night' : 'day'}
          onComplete={() => setAppPhase('henderson-challenge')}
          onBack={() => setAppPhase('challenge-landing')}
        />
        <RewardToggle prize={activePrize} enabled={cursorEnabled} onToggle={() => setCursorEnabled(e => !e)} />
      </Suspense>
    )
  }

  // ─── Henderson Challenge (exact backup visual wrapper) ─────
  if (appPhase === 'henderson-challenge') {
    return (
      <Suspense fallback={loadingFallback}>
        {showAppDock && <Dock items={appDockItems} position="center-left" isDarkMode={isDarkMode} />}
        {cursorEnabled && activePrize === 'blob-cursor' && <BlobCursor />}
        {cursorEnabled && activePrize === 'splash-cursor' && <SplashCursor />}
        <div
          className="min-h-screen w-full flex flex-col"
          style={{
            background:
              theme === 'night'
                ? 'radial-gradient(circle at 20% 20%, #031213 0%, #010809 45%, #010809 100%)'
                : 'linear-gradient(180deg, #F6F7F4 0%, #F0EBE6 100%)',
          }}
        >
          <div className="max-w-6xl w-full mx-auto px-5 md:px-10 py-8 md:py-12 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="text-[11px] font-bold uppercase tracking-[0.24em]"
                  style={{ color: theme === 'night' ? '#64F4F5' : '#C74601' }}
                >
                  Onboarding
                </div>
                <div className="flex items-center gap-2 text-xl font-heading font-bold" style={{ color: theme === 'night' ? '#FAFBF8' : '#1F1C1B' }}>
                  4 <span className="text-sm font-normal" style={{ color: theme === 'night' ? '#64F4F5' : '#747474' }}>/ 5</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="h-[6px] rounded-full"
                    style={{
                      width: i === 3 ? 32 : 18,
                      background:
                        i < 3
                          ? theme === 'night' ? '#004142' : '#D9D6D5'
                          : i === 3
                            ? theme === 'night' ? '#64F4F5' : '#007970'
                            : theme === 'night' ? '#07282A' : '#E5E4E3',
                    }}
                  />
                ))}
              </div>
            </div>

            <div
              className="w-full rounded-[32px] shadow-2xl border overflow-hidden"
              style={{
                background: theme === 'night' ? '#031213f2' : '#FFFFFF',
                borderColor: theme === 'night' ? '#004142' : '#E5E4E3',
              }}
            >
              <div className="p-3 md:p-4 lg:p-6" style={{ background: theme === 'night' ? 'rgba(1,8,9,0.6)' : '#FFFFFF' }}>
                <Interactive485Form
                  theme={theme === 'night' ? 'night' : 'day'}
                  qaMode={qaModeEnabled}
                  challengeOnly
                  onProceed={() => {
                    const nonce = Date.now()
                    window.location.hash = `/?dock=glossary&n=${nonce}`
                    setAppPhase('training')
                    setViewMode('HELP')
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <RewardToggle prize={activePrize} enabled={cursorEnabled} onToggle={() => setCursorEnabled(e => !e)} />
      </Suspense>
    )
  }

  // ─── Course Selection (exact backup rendering) ─────────────
  if (appPhase === 'course-selection') {
    return (
      <Suspense fallback={loadingFallback}>
        {showAppDock && <Dock items={appDockItems} position="center-left" isDarkMode={isDarkMode} />}
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

  // ─── Summary Page (NEW) ────────────────────────────────────
  if (appPhase === 'summary') {
    return (
      <Suspense fallback={loadingFallback}>
        {showAppDock && <Dock items={appDockItems} position="center-left" isDarkMode={isDarkMode} />}
        <div
          className={`min-h-screen flex items-center justify-center p-4 md:p-8 ${isDarkMode ? 'dark' : ''}`}
          style={{
            background: isDarkMode
              ? 'radial-gradient(circle at 20% 20%, #031213 0%, #010809 45%, #010809 100%)'
              : 'linear-gradient(180deg, #FAFBF8 0%, #F0EBE6 100%)',
          }}
        >
          <SummaryPage isDarkMode={isDarkMode} onComplete={() => setAppPhase('complete')} />
        </div>
        <RewardToggle prize={activePrize} enabled={cursorEnabled} onToggle={() => setCursorEnabled(e => !e)} />
      </Suspense>
    )
  }

  // ─── Complete (NEW) ────────────────────────────────────────
  if (appPhase === 'complete') {
    return (
      <Suspense fallback={loadingFallback}>
        {showAppDock && <Dock items={appDockItems} position="center-left" isDarkMode={isDarkMode} />}
        <div
          className={`min-h-screen flex items-center justify-center p-4 md:p-8 ${isDarkMode ? 'dark' : ''}`}
          style={{
            background: isDarkMode
              ? 'radial-gradient(circle at 20% 20%, #031213 0%, #010809 45%, #010809 100%)'
              : 'linear-gradient(180deg, #FAFBF8 0%, #F0EBE6 100%)',
          }}
        >
          <div className="text-center space-y-6 max-w-lg">
            <div className="w-20 h-20 rounded-2xl bg-transparent flex items-center justify-center mx-auto">
              <ClipboardCheck className={`w-10 h-10 ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#007970]'}`} />
            </div>
            <h1
              className={`font-heading text-[2rem] font-bold ${isDarkMode ? 'text-[#FAFBF8]' : 'text-[#1F1C1B]'}`}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Training Complete
            </h1>
            <p className={`text-base ${isDarkMode ? 'text-[#D9D6D5]' : 'text-[#747474]'}`}>
              You have completed the CMS-485 Documentation Training. Your results have been recorded.
            </p>
          </div>
        </div>
        <RewardToggle prize={activePrize} enabled={cursorEnabled} onToggle={() => setCursorEnabled(e => !e)} />
      </Suspense>
    )
  }

  // ─── Training (exact backup rendering) ─────────────────────
  return (
    <>
      {showAppDock && <Dock items={appDockItems} position="center-left" isDarkMode={isDarkMode} />}
      {cursorEnabled && activePrize === 'blob-cursor' && <Suspense fallback={null}><BlobCursor /></Suspense>}
      {cursorEnabled && activePrize === 'splash-cursor' && <Suspense fallback={null}><SplashCursor /></Suspense>}
      <Suspense fallback={null}><RewardToggle prize={activePrize} enabled={cursorEnabled} onToggle={() => setCursorEnabled(e => !e)} /></Suspense>
      <div className="relative z-10 w-full h-screen">
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-transparent text-white font-mono uppercase tracking-widest animate-pulse">Loading View...</div>}>
          {renderViewContent()}
        </Suspense>
      </div>
    </>
  )
}
