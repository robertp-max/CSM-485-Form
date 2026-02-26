import { Component, StrictMode, lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import './index.css'
import App from './App'
import { applyTheme, getStoredTheme } from './theme'
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
            {[
              { to: '/', label: 'ENGINE' },
              { to: '/learning', label: 'LEARN' },
              { to: '/help', label: 'HELP' },
            ].map(link => (
              <Link 
                key={link.to} 
                to={link.to}
                style={{
                  padding: '6px 14px',
                  borderRadius: '99px',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  background: 'rgba(255,255,255,0.1)',
                  transition: 'all 0.2s'
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </HashRouter>
        <GlossaryDebugPanel />
      </GlossaryProvider>
    </ErrorBoundary>
  </StrictMode>,
)
