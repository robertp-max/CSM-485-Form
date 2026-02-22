import { Maximize2, Minimize2 } from 'lucide-react'

type PlanOfCareFocus = {
  boxes: string[]
  context: string
}

type PlanOfCareFocusPanelProps = {
  focus: PlanOfCareFocus
  isExpanded: boolean
  onToggle: () => void
}

const POC_BOXES = [
  'Diagnoses',
  'Functional Limitations',
  'Mental/Cognitive Status',
  'Allergies',
  'Medications',
  'Treatments & Procedures',
  'Safety Measures',
  'DME/Supplies',
  'Nutritional Requirements',
  'Visit Frequency',
  'Goals & Outcomes',
  'Discharge Planning',
  'Rehab Potential',
  'Homebound Status',
  'Orders/Signatures',
  'Advance Directives',
]

export const PlanOfCareFocusPanel = ({ focus, isExpanded, onToggle }: PlanOfCareFocusPanelProps) => {
  const highlighted = new Set(focus.boxes)

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-brand-navyLight bg-white shadow-sm transition-all duration-300">
      <div className="flex flex-col md:flex-row">
        <div className="w-full border-b border-brand-navyLight/60 bg-brand-sky/30 p-4 md:w-[320px] md:border-b-0 md:border-r">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-navy">Plan of Care Focus</p>
          <h4 className="mt-1 text-base font-semibold text-brand-navy">CMS-485 Box Explorer</h4>
          <p className="mt-2 text-sm text-brand-darkGray">Open this panel to see which CMS-485 areas tie directly to this card topic.</p>

          <button
            type="button"
            onClick={onToggle}
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-brand-navyLight bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-brand-navy hover:bg-brand-sky"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        <div className={`transition-all duration-300 ${isExpanded ? 'max-h-[900px] opacity-100 md:w-[620px]' : 'max-h-0 opacity-0 md:w-0'} overflow-hidden`}>
          <div className="p-4">
            <div className="rounded-md border border-brand-navyLight/70 bg-brand-sky/20 p-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-navy">CMS-485 Highlighted Boxes</p>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                {POC_BOXES.map((box) => {
                  const isActive = highlighted.has(box)
                  return (
                    <div
                      key={box}
                      className={`rounded border px-2 py-2 text-[11px] font-semibold leading-tight transition-colors ${
                        isActive
                          ? 'border-brand-goldDark bg-brand-gold/20 text-brand-navy'
                          : 'border-brand-navyLight/60 bg-white text-brand-darkGray'
                      }`}
                    >
                      {box}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-3 rounded-md border border-brand-goldDark/40 bg-brand-gold/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-navy">More Context</p>
              <p className="mt-1 text-sm leading-relaxed text-brand-darkGray">{focus.context}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
