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

export function AppShell() {
  const { isDarkMode } = useTheme()
  const { isCardView } = useLayoutMode()

  const Layout = isCardView ? CardView : WebView

  return (
    <>
      {isDarkMode && <SplashCursor />}
      <Layout isDarkMode={isDarkMode}>
        <Outlet />
      </Layout>
    </>
  )
}
