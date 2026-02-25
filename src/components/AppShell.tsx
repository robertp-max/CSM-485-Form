/* ── AppShell — Unified Layout Container ──────────────────────────
 *  Wraps ALL routes in either CardView or WebView based on the
 *  persisted layout preference. Provides SplashCursor animation
 *  and layout switching context for child routes.
 * ─────────────────────────────────────────────────────────────────── */

import { Outlet } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { useLayoutMode } from '../hooks/useLayoutMode'
import { CardView } from './CardView'
import { WebView } from './WebView'
import { SplashCursor } from './SplashCursor'
import { ViewModeToggle } from './ViewModeToggle'

export function AppShell() {
  const { isDarkMode } = useTheme()
  const { isCardView } = useLayoutMode()

  const Layout = isCardView ? CardView : WebView

  return (
    <>
      {isDarkMode && <SplashCursor />}
      <div className="pointer-events-none fixed right-3 top-3 z-[85]">
        <div className="pointer-events-auto">
          <ViewModeToggle isDarkMode={isDarkMode} compact />
        </div>
      </div>
      <Layout isDarkMode={isDarkMode}>
        <Outlet />
      </Layout>
    </>
  )
}
