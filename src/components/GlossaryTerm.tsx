/**
 * GlossaryTerm – Accessible hovercard for glossary terms.
 *
 * First occurrence in a session shows dotted underline + full hovercard.
 * After "Got it" is clicked the term is marked seen and never opens again.
 * If already seen: subtle underline only (no hovercard).
 */
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { GlossaryEntry } from '../glossary'
import { useGlossary } from './GlossaryProvider'

export type GlossaryTermProps = {
  /** The text as it appears in content */
  surfaceText: string
  /** Resolved glossary entry */
  entry: GlossaryEntry
  /** Whether this is the first occurrence of the term (hovercard eligible) */
  isFirst: boolean
}

export default function GlossaryTerm({ surfaceText, entry, isFirst }: GlossaryTermProps) {
  const { isSeen, markSeen, shouldShow } = useGlossary()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const tooltipId = useId()
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const showHovercard = isFirst && shouldShow(entry.key)

  // Position the hovercard relative to the trigger
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const cardWidth = 320
    const cardHeight = 200 // estimate

    let left = rect.left + rect.width / 2 - cardWidth / 2
    let top = rect.bottom + 8

    // Clamp horizontal
    if (left < 8) left = 8
    if (left + cardWidth > window.innerWidth - 8) left = window.innerWidth - cardWidth - 8

    // Flip above if too low
    if (top + cardHeight > window.innerHeight - 8) {
      top = rect.top - cardHeight - 8
    }

    setPos({ top, left })
  }, [])

  const doOpen = useCallback(() => {
    clearTimeout(closeTimerRef.current)
    if (!showHovercard) return
    updatePosition()
    setOpen(true)
  }, [showHovercard, updatePosition])

  const doClose = useCallback((delay = 120) => {
    closeTimerRef.current = setTimeout(() => setOpen(false), delay)
  }, [])

  const cancelClose = useCallback(() => {
    clearTimeout(closeTimerRef.current)
  }, [])

  const handleGotIt = useCallback(() => {
    markSeen(entry.key)
    setOpen(false)
  }, [markSeen, entry.key])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Close on outside click (without marking seen)
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (
        cardRef.current &&
        !cardRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!open) return
    const handler = () => updatePosition()
    window.addEventListener('scroll', handler, true)
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('scroll', handler, true)
      window.removeEventListener('resize', handler)
    }
  }, [open, updatePosition])

  const seenAlready = isSeen(entry.key)

  // Underline class:  unseen → accent dotted, seen → muted
  const underlineClass = seenAlready
    ? 'glossary-term-seen'
    : 'glossary-term-unseen'

  // If the term was seen or this isn't the first occurrence, render plain underline
  if (!showHovercard) {
    return (
      <span className={`glossary-term-inline ${underlineClass}`} title={seenAlready ? entry.term : undefined}>
        {surfaceText}
      </span>
    )
  }

  const hovercard = open && pos
    ? createPortal(
        <div
          ref={cardRef}
          role="dialog"
          aria-label={`Definition: ${entry.term}`}
          id={tooltipId}
          className="glossary-hovercard"
          style={{ top: pos.top, left: pos.left }}
          onMouseEnter={cancelClose}
          onMouseLeave={() => doClose(200)}
        >
          <div className="glossary-hovercard-title">{entry.term}</div>
          <p className="glossary-hovercard-def">{entry.definition}</p>
          {entry.whyItMatters && (
            <p className="glossary-hovercard-why">
              <span className="glossary-hovercard-why-label">Why it matters:</span>{' '}
              {entry.whyItMatters}
            </p>
          )}
          <button
            type="button"
            className="glossary-hovercard-gotit"
            onClick={handleGotIt}
          >
            Got it
          </button>
        </div>,
        document.body,
      )
    : null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`glossary-term-trigger ${underlineClass}`}
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        aria-haspopup="dialog"
        onMouseEnter={doOpen}
        onMouseLeave={() => doClose(200)}
        onFocus={doOpen}
        onClick={doOpen}
      >
        {surfaceText}
      </button>
      {hovercard}
    </>
  )
}
