/**
 * GlossaryDebugPanel – Dev-only floating panel showing seen-term state
 * and suspend_data writes. Only renders when NODE_ENV !== 'production'.
 */
import { useGlossary } from './GlossaryProvider'
import { loadSuspendData } from '../scormPersist'
import { GLOSSARY_ENTRIES } from '../glossary'
import { useState } from 'react'

export const GlossaryDebugPanel = () => {
  // Gate: production builds strip console/debugger via esbuild.drop,
  // but also explicitly gate the component.
  if (import.meta.env.PROD) return null

  const { seenKeys } = useGlossary()
  const [expanded, setExpanded] = useState(false)

  const data = loadSuspendData()
  const jsonSize = JSON.stringify(data).length
  const totalTerms = GLOSSARY_ENTRIES.length

  return (
    <div className="glossary-debug-panel">
      <details open={expanded} onToggle={(e) => setExpanded((e.target as HTMLDetailsElement).open)}>
        <summary>Glossary Debug ({seenKeys.size}/{totalTerms})</summary>
        {expanded && (
          <div style={{ marginTop: 6 }}>
            <div style={{ marginBottom: 4 }}>
              suspend_data: {jsonSize} chars / 4096 limit
            </div>
            <div style={{ marginBottom: 4, color: '#c5a059' }}>
              Seen keys: {seenKeys.size === 0 ? '(none)' : Array.from(seenKeys).join(', ')}
            </div>
            <div>
              Unseen: {GLOSSARY_ENTRIES.filter((e) => !seenKeys.has(e.key)).map((e) => e.key).join(', ') || '(all seen)'}
            </div>
          </div>
        )}
      </details>
    </div>
  )
}
