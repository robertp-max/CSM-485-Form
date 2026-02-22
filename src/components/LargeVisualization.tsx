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
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-5 rounded-xl bg-status-success-bg border border-status-success-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-status-success-text">✅</span>
            <p className="text-xs font-bold uppercase tracking-wider text-status-success-text">Good Example</p>
          </div>
          <p className="text-sm text-status-success-text font-medium">{viz.goodExample}</p>
        </div>
        <div className="p-5 rounded-xl bg-status-danger-bg border border-status-danger-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-status-danger-text">❌</span>
            <p className="text-xs font-bold uppercase tracking-wider text-status-danger-text">Bad Example</p>
          </div>
          <p className="text-sm text-status-danger-text font-medium">{viz.badExample}</p>
        </div>
      </div>
    )
  }

  if (viz.type === 'templateBuilder') {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {viz.chips?.map((chip) => (
            <button
              key={chip}
              type="button"
              className="px-4 py-2 rounded-full text-sm font-medium bg-brand-teal/10 text-brand-teal border border-brand-teal/20 hover:bg-brand-teal hover:text-white transition-colors"
              onClick={() => onAddChip(chip)}
            >
              + {chip}
            </button>
          ))}
        </div>
        <div className="rounded-xl border-2 border-dashed border-subtle bg-bg-page p-4 min-h-[80px] flex items-center">
          <p className={`text-sm font-medium ${builtText.length ? 'text-text-primary' : 'text-text-muted italic'}`}>
            {builtText.length ? builtText.join(' | ') : 'Build a compliant sentence by selecting chips above.'}
          </p>
        </div>
        <button type="button" className="px-4 py-2 text-sm font-medium rounded-lg border border-subtle text-text-secondary hover:bg-bg-page transition-colors" onClick={onResetBuilder}>
          Reset Builder
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-text-secondary">{viz.prompt}</p>
      <div className="grid gap-3">
        {viz.options?.map((option) => (
          <button key={option} type="button" className="w-full text-left px-4 py-3 rounded-xl border border-subtle bg-bg-page hover:border-brand-teal hover:bg-brand-teal/5 text-text-primary font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
