/* ── AppShell — Unified Layout Container ──────────────────────────
 *  Wraps ALL routes in either CardView or WebView based on the
 *  persisted layout preference. Provides SplashCursor animation
 *  and layout switching context for child routes.
 * ─────────────────────────────────────────────────────────────────── */

import { Outlet } from 'react-router-dom'

export function AppShell() {
  return <Outlet />
}
