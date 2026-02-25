/* ── Layout Mode Hook ─────────────────────────────────────────────
 *  Persists CardView / WebView preference in localStorage.
 *  CardView = default (constrained card-based layout).
 *  WebView  = alternative (full-width, web-page style).
 * ─────────────────────────────────────────────────────────────── */

import { useSyncExternalStore, useCallback } from 'react'

export type LayoutMode = 'card' | 'web'

const STORAGE_KEY = 'cihh.layoutMode'

type Listener = () => void
const listeners = new Set<Listener>()

function getSnapshot(): LayoutMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'web') return 'web'
  } catch { /* ignore */ }
  return 'card'
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify() {
  listeners.forEach((l) => l())
}

export function setLayoutMode(mode: LayoutMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch { /* ignore */ }
  notify()
}

export function useLayoutMode() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, () => 'card' as LayoutMode)

  const toggle = useCallback(() => {
    setLayoutMode(mode === 'card' ? 'web' : 'card')
  }, [mode])

  return { mode, isCardView: mode === 'card', isWebView: mode === 'web', toggle, setMode: setLayoutMode }
}
