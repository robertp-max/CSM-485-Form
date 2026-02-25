import { useCallback, useSyncExternalStore } from 'react'
import { applyTheme, getStoredTheme, toggleTheme, type ThemeAppearance } from '../theme'

/* ── Tiny external-store for the global theme ───────────── */
type Listener = () => void
const listeners = new Set<Listener>()

let current: ThemeAppearance = getStoredTheme()

function subscribe(cb: Listener) {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

function getSnapshot(): ThemeAppearance {
  return current
}

function set(next: ThemeAppearance) {
  if (next === current) return
  current = next
  applyTheme(next)
  listeners.forEach((cb) => cb())
}

/* Public hook ─────────────────────────────────────────── */

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const isDarkMode = theme === 'night'

  const toggle = useCallback(() => {
    set(toggleTheme(current))
  }, [])

  const setTheme = useCallback((t: ThemeAppearance) => {
    set(t)
    applyTheme(t)
  }, [])

  return { theme, isDarkMode, toggle, setTheme } as const
}
