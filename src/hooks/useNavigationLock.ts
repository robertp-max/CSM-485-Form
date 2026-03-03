/* ── useNavigationLock ──────────────────────────────────────────────
 *  Global "navigationLocked" state.
 *  When locked, arrow-key and click-zone navigation is suppressed
 *  across all card-based views.
 *
 *  Lock sources: voiceover playing, challenge active, or any custom
 *  lock request via the exported helpers.
 *
 *  Implementation: lightweight pub/sub on a module-level boolean so
 *  any component can read + subscribe without prop-drilling.
 * ─────────────────────────────────────────────────────────────────── */

type Listener = () => void

let _locked = false
let _reason: string | null = null
const _listeners = new Set<Listener>()

function notify() {
  _listeners.forEach((fn) => fn())
}

/** Set lock state with an optional human-readable reason. */
export function setNavigationLocked(locked: boolean, reason?: string) {
  if (_locked === locked) return
  _locked = locked
  _reason = locked ? (reason ?? null) : null
  notify()
}

/** Read current lock state (non-reactive – use the hook for React). */
export function isNavigationLocked(): boolean {
  return _locked
}

/** Read current lock reason (non-reactive). */
export function getNavigationLockReason(): string | null {
  return _reason
}

/* ── React hook ── */
import { useSyncExternalStore } from 'react'

const subscribe = (cb: Listener) => {
  _listeners.add(cb)
  return () => { _listeners.delete(cb) }
}
const getSnapshot = () => _locked
const getReasonSnapshot = () => _reason

/** Reactive hook – re-renders when lock state changes. */
export function useNavigationLock() {
  const locked = useSyncExternalStore(subscribe, getSnapshot)
  const reason = useSyncExternalStore(subscribe, getReasonSnapshot)
  return { locked, reason }
}
