/**
 * scormPersist.ts – Lightweight SCORM suspend_data persistence
 * -------------------------------------------------------------
 * Stores glossary "seen terms" (and future data) in cmi.suspend_data
 * with automatic fallback to localStorage when SCORM is unavailable.
 *
 * Payload schema  { v:1, seen:{ <shortKey>:1, … }, …future }
 * SCORM 1.2 limit for suspend_data is 4096 chars – we stay well under
 * by using 3-6 char keys and a flat map.
 */

// ── SCORM API types ────────────────────────────────────────────

type ScormApi12 = {
  LMSInitialize: (arg: string) => string
  LMSGetValue: (element: string) => string
  LMSSetValue: (element: string, value: string) => string
  LMSCommit: (arg: string) => string
}

type ScormApi2004 = {
  Initialize: (arg: string) => string
  GetValue: (element: string) => string
  SetValue: (element: string, value: string) => string
  Commit: (arg: string) => string
}

// ── Schema ─────────────────────────────────────────────────────

const SCHEMA_VERSION = 1

export type SuspendPayload = {
  v: number
  seen: Record<string, 1>
}

const emptyPayload = (): SuspendPayload => ({ v: SCHEMA_VERSION, seen: {} })

// ── SCORM API discovery ────────────────────────────────────────

const findApi = <T>(apiName: 'API' | 'API_1484_11'): T | null => {
  let win: Window | null = window
  let attempts = 0
  while (win && attempts < 20) {
    const candidate = (win as unknown as Record<string, unknown>)[apiName]
    if (candidate) return candidate as T
    if (win.parent === win) break
    win = win.parent
    attempts++
  }
  return null
}

let _scormInited = false
const ensureScormInit = (api12: ScormApi12 | null, api2004: ScormApi2004 | null) => {
  if (_scormInited) return
  _scormInited = true
  try {
    if (api2004) api2004.Initialize('')
    else if (api12) api12.LMSInitialize('')
  } catch { /* already initialized or unavailable */ }
}

// ── Read / Write helpers ───────────────────────────────────────

const LS_KEY = 'cihh.glossary.suspend'

const readRawScorm = (): string => {
  try {
    const api2004 = findApi<ScormApi2004>('API_1484_11')
    const api12 = findApi<ScormApi12>('API')
    ensureScormInit(api12, api2004)
    if (api2004) return api2004.GetValue('cmi.suspend_data') || ''
    if (api12) return api12.LMSGetValue('cmi.suspend_data') || ''
  } catch { /* fall through */ }
  return ''
}

const writeRawScorm = (json: string): boolean => {
  try {
    const api2004 = findApi<ScormApi2004>('API_1484_11')
    const api12 = findApi<ScormApi12>('API')
    ensureScormInit(api12, api2004)
    if (api2004) {
      api2004.SetValue('cmi.suspend_data', json)
      api2004.Commit('')
      return true
    }
    if (api12) {
      api12.LMSSetValue('cmi.suspend_data', json)
      api12.LMSCommit('')
      return true
    }
  } catch { /* fall through */ }
  return false
}

// ── Public API ─────────────────────────────────────────────────

/** Load current suspend payload, merging SCORM > localStorage. */
export const loadSuspendData = (): SuspendPayload => {
  // Try SCORM first
  const raw = readRawScorm()
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<SuspendPayload>
      if (parsed && typeof parsed === 'object' && parsed.v === SCHEMA_VERSION) {
        return { v: SCHEMA_VERSION, seen: parsed.seen ?? {} }
      }
    } catch { /* corrupted – start fresh */ }
  }

  // Fall back to localStorage
  try {
    const ls = localStorage.getItem(LS_KEY)
    if (ls) {
      const parsed = JSON.parse(ls) as Partial<SuspendPayload>
      if (parsed && typeof parsed === 'object' && parsed.v === SCHEMA_VERSION) {
        return { v: SCHEMA_VERSION, seen: parsed.seen ?? {} }
      }
    }
  } catch { /* corrupted */ }

  return emptyPayload()
}

/**
 * Save a partial update into suspend data (merge semantics).
 * Writes to SCORM if available, always mirrors to localStorage.
 */
export const saveSuspendData = (partial: Partial<SuspendPayload>): void => {
  const current = loadSuspendData()
  const merged: SuspendPayload = {
    v: SCHEMA_VERSION,
    seen: { ...current.seen, ...partial.seen },
  }
  const json = JSON.stringify(merged)

  // Safety: don't exceed SCORM 1.2 limit (4096 chars)
  if (json.length > 3900) {
    if (import.meta.env.DEV) {
      console.warn('[scormPersist] suspend_data approaching size limit:', json.length)
    }
  }

  writeRawScorm(json)

  // Always mirror to localStorage for offline/dev fallback
  try {
    localStorage.setItem(LS_KEY, json)
  } catch { /* storage full – non-critical */ }

  if (import.meta.env.DEV) {
    console.debug('[scormPersist] saved', merged)
  }
}
