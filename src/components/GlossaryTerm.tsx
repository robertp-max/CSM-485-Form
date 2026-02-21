import { useState } from 'react'
import { glossary } from '../glossary'

type GlossaryTermProps = {
  term: string
}

export default function GlossaryTerm({ term }: GlossaryTermProps) {
  const [open, setOpen] = useState(false)
  const definition = glossary[term] ?? glossary[term.toUpperCase()] ?? ''

  if (!definition) {
    return <span>{term}</span>
  }

  return (
    <span className="glossary-term group relative inline-block">
      <button
        type="button"
        className="glossary-term-trigger"
        aria-label={`Glossary term ${term}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((prev) => !prev)}
        onBlur={() => setOpen(false)}
      >
        {term}
      </button>
      <span
        className={`glossary-tooltip ${open ? 'show' : ''}`}
        role="tooltip"
      >
        <strong>{term}:</strong> {definition}
      </span>
    </span>
  )
}
