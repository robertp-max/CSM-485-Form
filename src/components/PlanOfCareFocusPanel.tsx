import { Maximize2, Minimize2 } from 'lucide-react'

type PlanOfCareFocus = {
  boxes: string[]
  context: string
}

type PlanOfCareFocusPanelProps = {
  focus: PlanOfCareFocus
  isExpanded: boolean
  onToggle: () => void
  showToggle?: boolean
}

export const PlanOfCareFocusPanel = ({ focus, isExpanded, onToggle, showToggle = true, isDarkMode }: PlanOfCareFocusPanelProps & {isDarkMode: boolean}) => {
  return (
    <div className="mt-3 space-y-3">
      <div className={`rounded-xl border p-4 transition-colors duration-300 ${
        isDarkMode
          ? 'border-white/10 bg-white/5 hover:border-white/20'
          : 'border-[#E5E4E3] bg-white hover:border-[#007970] hover:shadow-sm'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#C74601]">Plan of Care Focus</p>
            <h4 className={`mt-1 font-montserrat text-base font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-[#1F1C1B]'}`}>CMS-485 Box Explorer</h4>
            <p className={`mt-1 text-xs transition-colors ${isDarkMode ? 'text-gray-300' : 'text-[#524048]'}`}>Open to view the CMS-485 areas tied to this topic.</p>
          </div>

          {showToggle && (
            <button
              type="button"
              onClick={onToggle}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-bold uppercase tracking-wide transition-all ${
                isDarkMode
                  ? 'border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20'
                  : 'border-[#E5E4E3] bg-white text-[#007970] hover:border-[#007970] hover:bg-[#F0FDFA]'
              }`}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className={`rounded-xl border p-4 transition-colors ${
          isDarkMode
            ? 'border-white/10 bg-[#1F1C1B]/70'
            : 'border-[#E5E4E3] bg-white'
        }`}>
          <div className={`rounded-md border p-3 transition-colors ${
            isDarkMode
              ? 'border-white/20 bg-white/5'
              : 'border-[#E5FEFF] bg-[#F7FEFF]'
          }`}>
            <p className={`mb-3 text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#007970]'}`}>CMS-485 Highlighted Boxes</p>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {focus.boxes.map((box) => (
                <div
                  key={box}
                  className={`rounded border px-2 py-2 text-[11px] font-semibold leading-tight transition-colors ${
                    isDarkMode
                      ? 'border-[#C74601] bg-[#C74601]/20 text-white'
                      : 'border-[#007970] bg-[#007970]/10 text-[#007970]'
                  }`}
                >
                  {box}
                </div>
              ))}
            </div>
          </div>

          <div className={`mt-3 rounded-md border p-3 transition-colors ${
            isDarkMode
              ? 'border-[#C74601]/40 bg-[#C74601]/10'
              : 'border-[#C74601]/20 bg-[#FFF8F3]'
          }`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C74601]">More Context</p>
            <p className={`mt-1 text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-[#524048]'}`}>{focus.context}</p>
          </div>
        </div>
      )}
    </div>
  )
}
