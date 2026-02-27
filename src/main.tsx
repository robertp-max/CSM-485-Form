import { Component, StrictMode, lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import './index.css'
import App from './App'
import { applyTheme, getStoredTheme } from './theme'
import { useTheme } from './hooks/useTheme'
import { GlossaryProvider } from './components/GlossaryProvider'
import { GlossaryDebugPanel } from './components/GlossaryDebugPanel'

// Apply persisted or system-preferred theme before mounting the app
applyTheme(getStoredTheme())

const LearningProfessional = lazy(() => import('./LearningProfessional'))
const HelpCenter = lazy(() => import('./components/HelpCenter'))

type ErrorBoundaryState = {
  hasError: boolean
  message: string
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message,
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#1B4F72' }}>
          <div style={{ maxWidth: 760, width: '100%', background: '#fff', borderRadius: 12, padding: 20 }}>
            <h1 style={{ margin: 0, fontSize: 20, color: '#1B263B' }}>Screen failed to load</h1>
            <p style={{ marginTop: 8, color: '#3f4957' }}>
              A runtime error occurred. Refresh the page; if it persists, share this message.
            </p>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: 12, background: '#f5f7fa', padding: 12, borderRadius: 8 }}>
              {this.state.message || 'Unknown runtime error'}
            </pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

type DockTarget =
  | 'welcome-banner'
  | 'system-calibration'
  | 'interactive-form'
  | 'night-card'
  | 'light-card'
  | 'night-web'
  | 'light-web'
  | 'course-selection'
  | 'first-card'
  | 'final-exam'
  | 'quiz'
  | 'glossary'
  | 'cms-485'

function GlobalDock() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeTarget = (new URLSearchParams(location.search).get('dock') as DockTarget | null) ?? 'welcome-banner'

  const links: Array<{ target: DockTarget; label: string }> = [
    { target: 'welcome-banner', label: 'WELCOME BANNER' },
    { target: 'system-calibration', label: 'SYSTEM CALIBRATION' },
    { target: 'interactive-form', label: 'INTERACTIVE FORM' },
    { target: 'course-selection', label: 'COURSE SELECTION' },
    { target: 'first-card', label: 'FIRST CARD' },
    { target: 'final-exam', label: 'FINAL EXAM (CLINICAL AUDIT)' },
    { target: 'night-card', label: 'NIGHT CARD' },
    { target: 'light-card', label: 'LIGHT CARD' },
    { target: 'night-web', label: 'NIGHT WEB' },
    { target: 'light-web', label: 'LIGHT WEB' },
    { target: 'quiz', label: 'QUIZ' },
    { target: 'glossary', label: 'GLOSSARY' },
    { target: 'cms-485', label: 'CMS-485' },
  ]

  const { isDarkMode, toggle: toggleThemeMode } = useTheme()
  const isCardWebView = ['night-card', 'light-card', 'night-web', 'light-web'].includes(activeTarget)
  const visualTarget: DockTarget = isCardWebView
    ? activeTarget
    : (isDarkMode ? 'night-card' : 'light-card')
  const isWebMode = visualTarget === 'light-web' || visualTarget === 'night-web'

  const goToTarget = (target: DockTarget) => {
    const nonce = Date.now()
    navigate({ pathname: '/', search: `?dock=${target}&n=${nonce}` })
    window.location.hash = `/?dock=${target}&n=${nonce}`
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 99999,
      display: 'flex',
      gap: '8px',
      padding: '8px',
      background: 'rgba(0,0,0,0.85)',
      borderRadius: '99px',
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px)',
      pointerEvents: 'auto'
    }}>
      <button
        onClick={() => {
          toggleThemeMode()
          if (isCardWebView) {
            const willBeLight = isDarkMode
            const nextTarget: DockTarget = isWebMode
              ? (willBeLight ? 'light-web' : 'night-web')
              : (willBeLight ? 'light-card' : 'night-card')
            goToTarget(nextTarget)
          }
        }}
        style={{
          padding: '6px 14px',
          borderRadius: '99px',
          color: '#fff',
          fontSize: '11px',
          fontWeight: 'bold',
          background: !isDarkMode ? 'rgba(199,70,1,0.95)' : 'rgba(0,121,112,0.95)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.2)',
          transition: 'all 0.2s',
          border: 'none',
          cursor: 'pointer'
        }}
        aria-pressed={true}
      >
        THEME: {isDarkMode ? 'NIGHT' : 'LIGHT'}
      </button>

      <button
        onClick={() => {
          const nextTarget: DockTarget = isWebMode
            ? (isDarkMode ? 'night-card' : 'light-card')
            : (isDarkMode ? 'night-web' : 'light-web')
          goToTarget(nextTarget)
        }}
        style={{
          padding: '6px 14px',
          borderRadius: '99px',
          color: '#fff',
          fontSize: '11px',
          fontWeight: 'bold',
          background: isWebMode ? 'rgba(79,70,229,0.95)' : 'rgba(20,20,20,0.95)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.2)',
          transition: 'all 0.2s',
          border: 'none',
          cursor: 'pointer'
        }}
        aria-pressed={true}
      >
        LAYOUT: {isWebMode ? 'WEB' : 'CARD'}
      </button>

      {links.map(link => {
        const isActive = activeTarget === link.target
        return (
          <button
            key={link.target}
            onClick={() => {
              goToTarget(link.target)
            }}
            style={{
              padding: '6px 14px',
              borderRadius: '99px',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '11px',
              fontWeight: 'bold',
              background: isActive ? 'rgba(0,121,112,0.95)' : 'rgba(255,255,255,0.1)',
              boxShadow: isActive ? '0 0 0 1px rgba(100,244,245,0.35), 0 6px 18px rgba(0,121,112,0.45)' : 'none',
              transition: 'all 0.2s',
              border: 'none',
              cursor: 'pointer'
            }}
            aria-pressed={isActive}
          >
            {link.label}
          </button>
        )
      })}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <GlossaryProvider>
        <HashRouter>
          <Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#FAFBF8' }}><p style={{ color: '#524048', fontFamily: 'Roboto, sans-serif' }}>Loading…</p></div>}>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/learning" element={<LearningProfessional />} />
              <Route path="/help" element={<HelpCenter />} />
            </Routes>
          </Suspense>

          {/* Master Site-Wide Shortcuts */}
          <GlobalDock />
        </HashRouter>
        <GlossaryDebugPanel />
      </GlossaryProvider>
    </ErrorBoundary>
  </StrictMode>,
)
