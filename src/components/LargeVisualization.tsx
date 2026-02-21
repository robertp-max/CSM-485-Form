import type { CardData } from '../courseData'

type LargeVisualizationProps = {
  card: CardData
  builtText: string[]
  onAddChip: (chip: string) => void
  onResetBuilder: () => void
}

export default function LargeVisualization({ card, builtText, onAddChip, onResetBuilder }: LargeVisualizationProps) {
  const viz = card.visualization

  if (viz.type === 'goodBad') {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <article className="status-card status-success">
          <p className="text-xs font-semibold uppercase tracking-wide">Good Example</p>
          <p className="mt-1 text-sm">{viz.goodExample}</p>
        </article>
        <article className="status-card status-warning">
          <p className="text-xs font-semibold uppercase tracking-wide">Bad Example</p>
          <p className="mt-1 text-sm">{viz.badExample}</p>
        </article>
      </div>
    )
  }

  if (viz.type === 'templateBuilder') {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {viz.chips?.map((chip) => (
            <button
              key={chip}
              type="button"
              className="chip"
              onClick={() => onAddChip(chip)}
            >
              + {chip}
            </button>
          ))}
        </div>
        <div className="rounded-lg border border-subtle bg-surface p-3 text-sm text-secondary">
          {builtText.length ? builtText.join(' | ') : 'Build a compliant sentence by selecting chips.'}
        </div>
        <button type="button" className="secondary btn-sm" onClick={onResetBuilder}>
          Reset Builder
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-secondary">{viz.prompt}</p>
      <div className="grid gap-2">
        {viz.options?.map((option) => (
          <button key={option} type="button" className="option-btn transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
