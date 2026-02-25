/**
 * TermHighlighter – Scans text content and wraps first-occurrence glossary
 * matches with <GlossaryTerm> hovercards.
 *
 * Usage:
 *   <TermHighlighter text="The Plan of Care requires certification." />
 *
 * Works purely on plain-text strings.  Does NOT parse HTML or break JSX.
 * For JSX children, wrap individual text props with <TermHighlighter>.
 *
 * Performance: builds a single combined regex on module load (memoized).
 */
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { glossarySurfaceForms, lookupGlossaryEntry } from '../glossary'
import GlossaryTerm from './GlossaryTerm'
import { useGlossary } from './GlossaryProvider'

// ── Build a single regex matching all surface forms ────────────
// Sorted longest-first so the alternation greedily matches multi-word phrases.
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const _pattern = glossarySurfaceForms.map(escape).join('|')
const GLOSSARY_RE = new RegExp(`\\b(${_pattern})\\b`, 'gi')

type Props = {
  /** Plain text to scan for glossary terms */
  text: string
  /** Disable highlighting (e.g. inside form fields) */
  disabled?: boolean
}

/**
 * Renders text with glossary terms wrapped as interactive hovercards.
 * Only the first occurrence of each term (per context claim) gets the hovercard.
 */
export const TermHighlighter = ({ text, disabled }: Props): ReactNode => {
  const { claimFirst } = useGlossary()

  return useMemo(() => {
    if (disabled || !text) return text

    const parts: ReactNode[] = []
    let lastIndex = 0
    // Track which entries we've already rendered in THIS text block
    const localSeen = new Set<string>()

    // Reset regex state
    GLOSSARY_RE.lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = GLOSSARY_RE.exec(text)) !== null) {
      const matchText = match[0]
      const entry = lookupGlossaryEntry(matchText)
      if (!entry) continue

      // Push preceding text
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }

      const isFirstInBlock = !localSeen.has(entry.key)
      if (isFirstInBlock) localSeen.add(entry.key)
      // Claim globally (only first call per key per card returns true)
      const isFirstGlobal = isFirstInBlock && claimFirst(entry.key)

      parts.push(
        <GlossaryTerm
          key={`${entry.key}-${match.index}`}
          surfaceText={matchText}
          entry={entry}
          isFirst={isFirstGlobal}
        />,
      )

      lastIndex = match.index + matchText.length
    }

    // Remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    return parts.length > 0 ? <>{parts}</> : text
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, disabled, claimFirst])
}
