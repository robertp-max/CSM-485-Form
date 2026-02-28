import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import { applyTheme, getStoredTheme } from './theme'
import { GlossaryProvider } from './components/GlossaryProvider'
import { GlossaryDebugPanel } from './components/GlossaryDebugPanel'

applyTheme(getStoredTheme())

const LearningProfessional = lazy(() => import('./LearningProfessional'))
const HelpCenter = lazy(() => import('./components/HelpCenter'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlossaryProvider>
      <HashRouter>
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#FAFBF8' }}><p style={{ color: '#524048', fontFamily: 'Roboto, sans-serif' }}>Loading…</p></div>}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/learning" element={<LearningProfessional />} />
            <Route path="/help" element={<HelpCenter />} />
          </Routes>
        </Suspense>
      </HashRouter>
      <GlossaryDebugPanel />
    </GlossaryProvider>
  </StrictMode>,
)
