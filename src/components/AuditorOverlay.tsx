import type { CardData } from '../courseData'

type AuditorOverlayProps = {
  card: CardData
}

export default function AuditorOverlay({ card }: AuditorOverlayProps) {
  return (
    <div className="interactive-card p-6 rounded-2xl bg-brand-teal/5 border-2 border-brand-teal/20 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-teal/20 text-brand-teal">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        </div>
        <h3 className="text-lg font-bold text-brand-teal">Auditor Lens</h3>
      </div>
      <p className="text-text-secondary font-medium mb-2">Focus this card on traceability. Confirm each statement maps to assessment evidence and claim-impact logic.</p>
      <p className="text-sm text-text-muted">Current topic: {card.title}</p>
    </div>
  )
}
