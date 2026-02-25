/**
 * GlossaryProvider – React context for first-time glossary hovercard state.
 *
 * Tracks which terms the learner has dismissed ("Got it") during this SCORM
 * attempt.  State is persisted via scormPersist (SCORM suspend_data with
 * localStorage fallback).
 *
 * Also tracks which terms have already rendered their first occurrence in
 * the *current page/card* so that only the first text-match shows the
 * hovercard affordance.
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { loadSuspendData, saveSuspendData } from '../scormPersist'

type GlossaryCtx = {
  /** Has the user dismissed this term? */
  isSeen: (termKey: string) => boolean
  /** Mark a term as seen (persists to SCORM / localStorage) */
  markSeen: (termKey: string) => void
  /** Should the hovercard show for this term? (first occurrence + not yet dismissed) */
  shouldShow: (termKey: string) => boolean
  /**
   * Claim the first-occurrence slot for a term.  Returns `true` if this is
   * the first call for that key in this mount cycle, `false` otherwise.
   * Used by TermHighlighter to render only one hovercard per term.
   */
  claimFirst: (termKey: string) => boolean
  /** Reset first-occurrence claims (call when navigating cards) */
  resetClaims: () => void
  /** Read-only view of all seen keys (for debug panel) */
  seenKeys: ReadonlySet<string>
}

const GlossaryContext = createContext<GlossaryCtx | null>(null)

export const useGlossary = (): GlossaryCtx => {
  const ctx = useContext(GlossaryContext)
  if (!ctx) throw new Error('useGlossary must be used within <GlossaryProvider>')
  return ctx
}

export const GlossaryProvider = ({ children }: { children: ReactNode }) => {
  // Seen state loaded from SCORM / localStorage on mount
  const [seen, setSeen] = useState<Set<string>>(() => {
    const data = loadSuspendData()
    return new Set(Object.keys(data.seen))
  })

  // First-occurrence claims (reset per card/page navigation)
  const claimedRef = useRef<Set<string>>(new Set())

  const isSeen = useCallback((key: string) => seen.has(key), [seen])

  const markSeen = useCallback((key: string) => {
    setSeen((prev) => {
      if (prev.has(key)) return prev
      const next = new Set(prev)
      next.add(key)
      // Persist
      saveSuspendData({ seen: { [key]: 1 } })
      return next
    })
  }, [])

  const shouldShow = useCallback(
    (key: string) => !seen.has(key),
    [seen],
  )

  const claimFirst = useCallback((key: string): boolean => {
    if (claimedRef.current.has(key)) return false
    claimedRef.current.add(key)
    return true
  }, [])

  const resetClaims = useCallback(() => {
    claimedRef.current = new Set()
  }, [])

  // Dev logging
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.debug('[GlossaryProvider] seen terms:', Array.from(seen))
    }
  }, [seen])

  const value = useMemo<GlossaryCtx>(
    () => ({ isSeen, markSeen, shouldShow, claimFirst, resetClaims, seenKeys: seen }),
    [isSeen, markSeen, shouldShow, claimFirst, resetClaims, seen],
  )

  return <GlossaryContext.Provider value={value}>{children}</GlossaryContext.Provider>
}
