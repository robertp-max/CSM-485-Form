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
    <section className="objective-box">
      <div className="flex items-center justify-between gap-2">
        <p className="section-label">CMS-485 Interactive Form Explorer</p>
        <div className="flex gap-2">
          <button type="button" className="secondary btn-sm" onClick={onShowZone}>Show me on the form</button>
          <button type="button" className="secondary btn-sm" onClick={onToggleOpen}>
            {isOpen ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {isOpen ? (
        <>
          <div className="relative mt-2 overflow-hidden rounded-xl border border-subtle bg-surface">
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
            <p className="mt-2 text-sm text-secondary"><strong>{activeHotspot.label}:</strong> {activeHotspot.description}</p>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
