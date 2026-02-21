import { useId, useState } from 'react'
import { glossary } from '../glossary'

type GlossaryTermProps = {
  term: string
}

export default function GlossaryTerm({ term }: GlossaryTermProps) {
  const [open, setOpen] = useState(false)
  const tooltipId = useId()
  const definition = glossary[term] ?? glossary[term.toUpperCase()] ?? ''

  if (!definition) {
    return <span>{term}</span>
  }

  return (
    <span
      className="glossary-term group relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="glossary-term-trigger"
        aria-label={`Glossary term ${term}`}
        aria-describedby={tooltipId}
        aria-expanded={open}
        aria-haspopup="dialog"
        onFocus={() => setOpen(true)}
        onClick={() => setOpen((prev) => !prev)}
        onBlur={() => setOpen(false)}
      >
        {term}
      </button>
      <span
        id={tooltipId}
        className={`glossary-tooltip ${open ? 'show' : ''}`}
        role="tooltip"
        aria-hidden={!open}
      >
        <strong>{term}:</strong> {definition}
      </span>
    </span>
  )
}
