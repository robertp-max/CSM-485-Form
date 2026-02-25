import { Component, StrictMode, lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AppShell } from './components/AppShell'
import { applyTheme, getStoredTheme } from './theme'
import { GlossaryProvider } from './components/GlossaryProvider'
import { GlossaryDebugPanel } from './components/GlossaryDebugPanel'

// Apply persisted or system-preferred theme before mounting the app
applyTheme(getStoredTheme())

const LearningProfessional = lazy(() => import('./LearningProfessional.tsx'))
const HelpCenter = lazy(() => import('./components/HelpCenter.tsx'))

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <GlossaryProvider>
        <HashRouter>
          <Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#FAFBF8' }}><p style={{ color: '#524048', fontFamily: 'Roboto, sans-serif' }}>Loading…</p></div>}>
            <Routes>
              {/* Unified layout shell — CardView (default) or WebView */}
              <Route element={<AppShell />}>
                <Route path="/" element={<App />} />
                <Route path="/learning" element={<LearningProfessional />} />
              </Route>
              {/* Standalone pages (own layout) */}
              <Route path="/help" element={<HelpCenter />} />
              {/* Henderson challenge now lives inside Virtual CMS-485 */}
              <Route path="/henderson" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </HashRouter>
        <GlossaryDebugPanel />
      </GlossaryProvider>
    </ErrorBoundary>
  </StrictMode>,
)
