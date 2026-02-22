type Hotspot = {
  id: string
  label: string
  description: string
  x: number
  y: number
  w: number
  h: number
}

type InteractiveFormExplorerProps = {
  hotspots: Hotspot[]
  activeHotspotId: string | null
  isOpen: boolean
  pulseGuideOn: boolean
  onToggleOpen: () => void
  onShowZone: () => void
  onActivateHotspot: (id: string) => void
}

export default function InteractiveFormExplorer({
  hotspots,
  activeHotspotId,
  isOpen,
  pulseGuideOn,
  onToggleOpen,
  onShowZone,
  onActivateHotspot,
}: InteractiveFormExplorerProps) {
  const activeHotspot = hotspots.find((item) => item.id === activeHotspotId)

  return (
    <div className="interactive-card p-6 rounded-2xl bg-bg-card mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-text-primary">CMS-485 Interactive Form Explorer</h3>
        </div>
        <div className="flex gap-2">
          <button type="button" className="premium-btn px-3 py-1.5 text-xs font-medium rounded-md bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/20 transition-colors" onClick={onShowZone}>Show me on the form</button>
          <button type="button" className="px-3 py-1.5 text-xs font-medium rounded-md border border-subtle text-text-secondary hover:bg-bg-page transition-colors" onClick={onToggleOpen}>
            {isOpen ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {isOpen ? (
        <>
          <div className="relative mt-4 overflow-hidden rounded-xl border border-subtle bg-surface shadow-inner">
            <img src="/branding/cms-485-form.svg" alt="CMS-485 Plan of Care form" className="w-full" />
            {hotspots.map((hotspot) => {
              const active = activeHotspot?.id === hotspot.id
              return (
                <button
                  key={hotspot.id}
                  type="button"
                  className={`hotspot ${active ? 'active' : ''} ${pulseGuideOn && !active ? 'animate-pulse' : ''}`}
                  style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, width: `${hotspot.w}%`, height: `${hotspot.h}%` }}
                  onClick={() => onActivateHotspot(hotspot.id)}
                />
              )
            })}
          </div>
          {activeHotspot ? (
            <div className="mt-4 p-4 rounded-xl bg-brand-teal/5 border border-brand-teal/20">
              <p className="text-sm text-text-secondary"><strong className="text-brand-teal">{activeHotspot.label}:</strong> {activeHotspot.description}</p>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
