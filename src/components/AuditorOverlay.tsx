import type { CardData } from '../courseData'

type AuditorOverlayProps = {
  card: CardData
}

export default function AuditorOverlay({ card }: AuditorOverlayProps) {
  return (
    <section className="objective-box border-strong bg-surface">
      <p className="section-label">Auditor Lens</p>
      <p className="text-sm text-secondary">Focus this card on traceability. Confirm each statement maps to assessment evidence and claim-impact logic.</p>
      <p className="text-sm text-muted">Current topic: {card.title}</p>
    </section>
  )
}
