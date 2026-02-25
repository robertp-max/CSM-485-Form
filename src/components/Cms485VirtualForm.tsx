import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Circle, Search, X, ZoomIn, RotateCcw } from 'lucide-react'
import { Button } from './ui/Button'
import { CMS485_HOTSPOTS, CMS485_PAGE_LABEL, type Cms485Hotspot } from '../data/cms485Hotspots'

type Props = {
  onClose: () => void
}

type ScormApi12 = {
  LMSInitialize: (arg: string) => string
  LMSSetValue: (element: string, value: string) => string
  LMSCommit: (arg: string) => string
}

type ScormApi2004 = {
  Initialize: (arg: string) => string
  SetValue: (element: string, value: string) => string
  Commit: (arg: string) => string
}

type Mode = 'explore' | 'guided' | 'tryit'

const STORAGE_KEY = 'cms485.virtualForm.v1'

const findApi = <T,>(apiName: 'API' | 'API_1484_11'): T | null => {
  let currentWindow: Window | null = window
  let attempts = 0

  while (currentWindow && attempts < 20) {
    const candidate = (currentWindow as unknown as Record<string, unknown>)[apiName]
    if (candidate) {
      return candidate as T
    }
    if (currentWindow.parent === currentWindow) break
    attempts += 1
    currentWindow = currentWindow.parent
  }

  return null
}

const mirrorToScorm = (payload: Record<string, unknown>, completed: boolean) => {
  try {
    const api2004 = findApi<ScormApi2004>('API_1484_11')
    if (api2004) {
      api2004.Initialize('')
      api2004.SetValue('cmi.suspend_data', JSON.stringify(payload))
      if (completed) {
        api2004.SetValue('cmi.completion_status', 'completed')
      }
      api2004.Commit('')
      return
    }

    const api12 = findApi<ScormApi12>('API')
    if (api12) {
      api12.LMSInitialize('')
      api12.LMSSetValue('cmi.suspend_data', JSON.stringify(payload))
      if (completed) {
        api12.LMSSetValue('cmi.core.lesson_status', 'completed')
      }
      api12.LMSCommit('')
    }
  } catch {
    // Keep client-side only behavior if SCORM is unavailable.
  }
}

const getTooltipPosition = (bbox: Cms485Hotspot['bbox']) => {
  const nearRight = bbox.x > 70
  const nearBottom = bbox.y > 78

  return {
    left: nearRight ? `${bbox.x + bbox.width - 2}%` : `${bbox.x + 2}%`,
    top: nearBottom ? `${bbox.y - 1}%` : `${bbox.y + bbox.height + 1}%`,
    transform: nearRight
      ? nearBottom
        ? 'translate(-100%, -100%)'
        : 'translate(-100%, 0)'
      : nearBottom
        ? 'translate(0, -100%)'
        : 'translate(0, 0)',
  }
}

const validateTryInput = (hotspot: Cms485Hotspot, value: string) => {
  if (!value.trim()) {
    return { valid: false, message: `${hotspot.tryInput.label} is required.` }
  }

  if (hotspot.tryInput.type === 'text' && value.trim().length < 14) {
    return { valid: false, message: 'Add more clinical detail for a defensible entry.' }
  }

  if (hotspot.tryInput.type === 'select' && value.toLowerCase().includes('unclear')) {
    return { valid: false, message: 'Select a clinically actionable option.' }
  }

  if (hotspot.id === 'visit-frequency-duration' && !/\d/.test(value)) {
    return { valid: false, message: 'Include numeric visit cadence (example: 2w3 then 1w3).' }
  }

  if (hotspot.id === 'physician-sign-date' && hotspot.tryInput.type === 'date') {
    const now = new Date()
    const selected = new Date(value)
    if (Number.isNaN(selected.getTime()) || selected > now) {
      return { valid: false, message: 'Signature date cannot be in the future.' }
    }
  }

  return { valid: true, message: 'Looks good. This section is defensible.' }
}

export const Cms485VirtualForm = ({ onClose }: Props) => {
  const [mode, setMode] = useState<Mode>('explore')
  const [selectedId, setSelectedId] = useState(CMS485_HOTSPOTS[0]?.id ?? '')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [guidedStepIndex, setGuidedStepIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(() => new Set())
  const [tryInputs, setTryInputs] = useState<Record<string, string>>({})
  const [tryFeedback, setTryFeedback] = useState<Record<string, { valid: boolean; message: string }>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [showCalibration, setShowCalibration] = useState(false)
  const [zoom, setZoom] = useState(1)

  const viewerScrollRef = useRef<HTMLDivElement | null>(null)

  const orderedHotspots = useMemo(
    () => [...CMS485_HOTSPOTS].sort((a, b) => a.guidedStep.stepOrder - b.guidedStep.stepOrder),
    [],
  )

  const selectedHotspot = useMemo(
    () => CMS485_HOTSPOTS.find((item) => item.id === selectedId) ?? orderedHotspots[0],
    [selectedId, orderedHotspots],
  )

  const filteredHotspots = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return orderedHotspots
    return orderedHotspots.filter((item) => item.label.toLowerCase().includes(query))
  }, [orderedHotspots, searchQuery])

  const currentGuidedHotspot = orderedHotspots[guidedStepIndex] ?? orderedHotspots[0]

  const allStepsCompleted = completedSteps.size >= orderedHotspots.length
  const progressPercent = Math.round((completedSteps.size / orderedHotspots.length) * 100)

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as {
        mode?: Mode
        selectedId?: string
        guidedStepIndex?: number
        quizAnswers?: Record<string, number>
        completedSteps?: string[]
        tryInputs?: Record<string, string>
      }

      if (parsed.mode) setMode(parsed.mode)
      if (parsed.selectedId) setSelectedId(parsed.selectedId)
      if (typeof parsed.guidedStepIndex === 'number') setGuidedStepIndex(parsed.guidedStepIndex)
      if (parsed.quizAnswers) setQuizAnswers(parsed.quizAnswers)
      if (parsed.completedSteps) setCompletedSteps(new Set(parsed.completedSteps))
      if (parsed.tryInputs) setTryInputs(parsed.tryInputs)
    } catch {
      // Ignore bad local data.
    }
  }, [])

  useEffect(() => {
    const payload = {
      mode,
      selectedId,
      guidedStepIndex,
      quizAnswers,
      completedSteps: [...completedSteps],
      tryInputs,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    mirrorToScorm(
      {
        cms485: {
          stepIndex: guidedStepIndex,
          completed: [...completedSteps],
          quizAnswers,
          tryInputs,
        },
      },
      allStepsCompleted,
    )
  }, [mode, selectedId, guidedStepIndex, quizAnswers, completedSteps, tryInputs, allStepsCompleted])

  useEffect(() => {
    if (mode !== 'guided') return
    if (!currentGuidedHotspot) return
    setSelectedId(currentGuidedHotspot.id)
  }, [mode, currentGuidedHotspot])

  const onSelectHotspot = (hotspotId: string) => {
    setSelectedId(hotspotId)
    if (mode === 'explore') return

    const index = orderedHotspots.findIndex((item) => item.id === hotspotId)
    if (index >= 0) {
      setGuidedStepIndex(index)
    }
  }

  const submitCheckAnswer = (hotspot: Cms485Hotspot, answerIndex: number) => {
    setQuizAnswers((previous) => ({ ...previous, [hotspot.id]: answerIndex }))
    if (answerIndex === hotspot.guidedStep.correctIndex) {
      setCompletedSteps((previous) => new Set([...previous, hotspot.id]))
    }
  }

  const onTryInputChange = (hotspot: Cms485Hotspot, value: string) => {
    setTryInputs((previous) => ({ ...previous, [hotspot.id]: value }))
    setTryFeedback((previous) => ({ ...previous, [hotspot.id]: validateTryInput(hotspot, value) }))
  }

  const highRiskIds = orderedHotspots.filter((item) => item.tryInput.highRisk).map((item) => item.id)
  const highRiskMissing = highRiskIds.filter((id) => {
    const hotspot = orderedHotspots.find((item) => item.id === id)
    if (!hotspot) return false
    const value = tryInputs[id] ?? ''
    return !validateTryInput(hotspot, value).valid
  })

  const tryCompletedCount = orderedHotspots.filter((hotspot) => {
    const value = tryInputs[hotspot.id] ?? ''
    return validateTryInput(hotspot, value).valid
  }).length

  const zoomToSelected = () => {
    setZoom(1.35)
    const target = selectedHotspot
    if (!target || !viewerScrollRef.current) return

    window.setTimeout(() => {
      const container = viewerScrollRef.current
      if (!container) return
      const centerX = (target.bbox.x + target.bbox.width / 2) / 100
      const centerY = (target.bbox.y + target.bbox.height / 2) / 100
      container.scrollTo({
        left: Math.max(0, container.scrollWidth * centerX - container.clientWidth / 2),
        top: Math.max(0, container.scrollHeight * centerY - container.clientHeight / 2),
        behavior: 'smooth',
      })
    }, 60)
  }

  const resetAll = () => {
    setMode('explore')
    setGuidedStepIndex(0)
    setQuizAnswers({})
    setCompletedSteps(new Set())
    setTryInputs({})
    setTryFeedback({})
    setZoom(1)
  }

  const activeForPanel = mode === 'guided' ? currentGuidedHotspot : selectedHotspot
  const activeAnswer = quizAnswers[activeForPanel.id]
  const activeTryFeedback = tryFeedback[activeForPanel.id]

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm p-0 md:p-2">
      <div className="h-full w-full rounded-none border border-white/10 bg-[#0B0D10] text-white shadow-[0_0_80px_-20px_rgba(0,121,112,0.55)] md:rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6">
          <div>
            <h2 className="text-lg font-semibold tracking-wide">Interactive CMS-485 Virtual Form</h2>
            <p className="text-xs text-white/60">{CMS485_PAGE_LABEL} Â· Guided training + Try It simulation</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="text-xs" onClick={resetAll}>
              Restart
            </Button>
            <Button variant="ghost" className="text-xs" onClick={onClose} aria-label="Close CMS-485 virtual form">
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </div>

        <div className="grid h-[calc(100%-60px)] min-h-0 grid-cols-1 lg:grid-cols-[1.45fr_0.95fr]">
          <section className="border-b border-white/10 p-3 lg:border-b-0 lg:border-r lg:border-white/10 lg:p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Button variant={mode === 'explore' ? 'primary' : 'ghost'} className="text-[11px]" onClick={() => setMode('explore')}>
                Review Mode
              </Button>
              <Button
                variant={mode === 'guided' ? 'primary' : 'ghost'}
                className="text-[11px]"
                onClick={() => {
                  setMode('guided')
                  setSelectedId(currentGuidedHotspot.id)
                }}
              >
                Start Learning
              </Button>
              <Button variant={mode === 'tryit' ? 'primary' : 'ghost'} className="text-[11px]" onClick={() => setMode('tryit')}>
                Try It Mode
              </Button>

              <div className="ml-auto flex items-center gap-2 text-xs">
                <span className="text-white/70">Zoom</span>
                <input
                  aria-label="Zoom slider"
                  type="range"
                  min={0.8}
                  max={1.6}
                  step={0.05}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                />
                <Button variant="ghost" className="px-3 py-1 text-[10px]" onClick={zoomToSelected}>
                  <ZoomIn className="h-3.5 w-3.5" />
                  Zoom to selected
                </Button>
                <label className="ml-1 inline-flex items-center gap-1 text-[11px] text-white/70">
                  <input type="checkbox" checked={showCalibration} onChange={(event) => setShowCalibration(event.target.checked)} />
                  Calibrate
                </label>
              </div>
            </div>

            <div
              ref={viewerScrollRef}
              className="hide-scrollbar h-[calc(100%-40px)] min-h-0 overflow-auto rounded-xl border border-white/10 bg-black/35 p-2"
            >
              <div className="mx-auto w-full max-w-[1100px] origin-top" style={{ transform: `scale(${zoom})` }}>
                <div className="relative aspect-[8.5/11] overflow-hidden rounded-lg border border-white/10 bg-white">
                  {/* HTML-rendered CMS-485 form */}
                  <div className="absolute inset-0 overflow-hidden text-[#0F172A]" style={{ fontSize: 'clamp(6px, 0.85vw, 11px)' }}>
                    <div className="flex items-start border-b-2 border-[#334155]" style={{ height: '5.5%' }}>
                      <div className="flex-1 flex items-center justify-center h-full bg-[#1E293B] text-white px-2"><span className="font-bold tracking-wide text-center" style={{ fontSize: 'clamp(7px, 1vw, 13px)' }}>HOME HEALTH CERTIFICATION AND PLAN OF CARE</span></div>
                      <div className="w-[18%] h-full flex items-center justify-center border-l-2 border-[#334155] bg-[#F1F5F9] text-[10px] font-semibold text-[#334155]">Form CMS-485</div>
                    </div>
                    <div className="border-b border-[#94A3B8] grid grid-cols-5" style={{ height: '10.5%' }}>
                      <div className="border-r border-[#94A3B8] p-1"><div className="text-[8px] font-bold text-[#64748B] uppercase">1. Patient HIC #</div><div className="mt-0.5 font-mono">XXX-XX-XXXX-A</div></div>
                      <div className="border-r border-[#94A3B8] p-1"><div className="text-[8px] font-bold text-[#64748B] uppercase">2. SOC Date</div><div className="mt-0.5 font-mono">02/24/2026</div></div>
                      <div className="border-r border-[#94A3B8] p-1"><div className="text-[8px] font-bold text-[#64748B] uppercase">3. Certification Period</div><div className="mt-0.5 font-mono">02/24  04/23/2026</div></div>
                      <div className="border-r border-[#94A3B8] p-1"><div className="text-[8px] font-bold text-[#64748B] uppercase">4. Medical Record #</div><div className="mt-0.5 font-mono">MR-2026-0485</div></div>
                      <div className="p-1"><div className="text-[8px] font-bold text-[#64748B] uppercase">5. Provider #</div><div className="mt-0.5 font-mono">10-7654</div></div>
                    </div>
                    <div className="border-b border-[#94A3B8] p-1" style={{ height: '5%' }}><div className="text-[8px] font-bold text-[#64748B] uppercase">6. Patient Name, Address, DOB</div><div className="mt-0.5">Jane A. Sample  1234 Elm St, Sacramento, CA 95811  DOB 03/15/1942</div></div>
                    <div className="border-b border-[#94A3B8] grid grid-cols-2" style={{ height: '12%' }}>
                      <div className="border-r border-[#94A3B8] p-1"><div className="text-[8px] font-bold text-[#64748B] uppercase">7. Principal Dx / ICD / Date</div><div className="mt-0.5">I50.9  Heart failure, unspecified  02/24/2026</div><div className="text-[8px] font-bold text-[#64748B] uppercase mt-1">8. Surgical</div><div>N/A</div></div>
                      <div className="p-1"><div className="text-[8px] font-bold text-[#64748B] uppercase">9. Other Pertinent Dx / ICD</div><div className="mt-0.5 space-y-0.5"><div>N18.3  CKD Stage 3</div><div>I10  Essential HTN</div><div>E11.65  T2DM w/ hyperglycemia</div><div>Z87.39  Hx urinary disease</div></div></div>
                    </div>
                    <div className="border-b border-[#94A3B8] p-1" style={{ height: '10%' }}><div className="text-[8px] font-bold text-[#64748B] uppercase">18a. Orders for Discipline and Treatments</div><div className="mt-0.5 space-y-0.5"><div>SN  CHF monitoring, med titration, edema q visit  2x/wk x 3wk then 1x/wk x 3wk</div><div>PT  Therapeutic exercise, balance, transfers  2x/wk x 4wk</div><div>MSW  Community resources, psychosocial  1x/mo x 2mo</div></div></div>
                    <div className="border-b border-[#94A3B8] grid grid-cols-3" style={{ height: '8%' }}>
                      <div className="col-span-2 border-r border-[#94A3B8] p-1"><div className="text-[8px] font-bold text-[#64748B] uppercase">Frequency Summary</div><div className="mt-0.5">SN 2W31W3  PT 2W4  MSW 1M2 | Total: 19 visits</div></div>
                      <div className="p-1"><div className="text-[8px] font-bold text-[#64748B] uppercase">12. Nutritional / 13. Allergies</div><div className="mt-0.5">Low Na &lt;2g, fluid 1.5L | Sulfa, Codeine</div></div>
                    </div>
                    <div className="border-b border-[#94A3B8] p-1" style={{ height: '9%' }}><div className="text-[8px] font-bold text-[#64748B] uppercase">18b. Goals / Rehab Potential / Discharge</div><div className="mt-0.5 space-y-0.5"><div><strong>G1:</strong> Pt verbalizes 3 CHF red flags by visit 4</div><div><strong>G2:</strong> Daily wt/BP log 2lb variance x 2wk</div><div><strong>G3:</strong> Ambulate 150ft w/ RW, min assist, SpO2 92% by wk 4</div><div className="text-[#64748B]">Rehab: Good  D/C when goals met</div></div></div>
                    <div className="border-b border-[#94A3B8] grid grid-cols-3" style={{ height: '7%' }}>
                      <div className="col-span-2 border-r border-[#94A3B8] p-1"><div className="text-[8px] font-bold text-[#64748B] uppercase">10. DME and Supplies</div><div className="mt-0.5">Rolling walker  BP cuff  Scale  Compression stockings 20-30mmHg</div></div>
                      <div className="p-1"><div className="text-[8px] font-bold text-[#64748B] uppercase">11. Safety Measures</div><div className="mt-0.5">Fall precautions, trip hazards, night lighting, emergency contacts</div></div>
                    </div>
                    <div className="border-b border-[#94A3B8] grid grid-cols-4" style={{ height: '10%' }}>
                      <div className="border-r border-[#94A3B8] p-1"><div className="text-[8px] font-bold text-[#64748B] uppercase">14. Functional Limits</div><div className="mt-0.5"> Ambulation  Endurance  Dyspnea  Paralysis</div></div>
                      <div className="border-r border-[#94A3B8] p-1"><div className="text-[8px] font-bold text-[#64748B] uppercase">15. Activities Permitted</div><div className="mt-0.5"> Partial WB  Walker  WC  Up as tolerated</div></div>
                      <div className="border-r border-[#94A3B8] p-1"><div className="text-[8px] font-bold text-[#64748B] uppercase">16. Mental Status</div><div className="mt-0.5"> Oriented  Confused  Depressed  Agitated</div></div>
                      <div className="p-1"><div className="text-[8px] font-bold text-[#64748B] uppercase">17. Prognosis / Homebound</div><div className="mt-0.5">Fair  CHF mgmt, mod readmission risk</div><div className="mt-0.5">HB: severe dyspnea &gt;25ft, taxing, requires assist</div></div>
                    </div>
                    <div className="grid grid-cols-2" style={{ height: '11.5%' }}>
                      <div className="border-r border-[#94A3B8] p-1"><div className="text-[8px] font-bold text-[#64748B] uppercase">21. Physician Name</div><div className="mt-0.5">Dr. Robert Chen, MD  CI Medical  Sacramento, CA</div><div className="text-[8px] font-bold text-[#64748B] uppercase mt-1">22. Date HHA Received Signed POT</div><div className="font-mono">02/26/2026</div></div>
                      <div className="p-1"><div className="text-[8px] font-bold text-[#64748B] uppercase">23. Physician Signature / Date</div><div className="mt-1 font-serif italic" style={{ fontSize: 'clamp(10px,1.4vw,18px)' }}>Robert Chen, MD</div><div className="font-mono mt-0.5">02/25/2026</div><div className="mt-1 inline-block rounded border border-[#0D9488] bg-[#ECFDF5] px-1.5 py-0.5 text-[8px] font-bold text-[#0D9488]"> e-Sig verified</div><div className="text-[8px] font-bold text-[#64748B] uppercase mt-1">19. RN</div><div>Maria Santos, RN BSN  02/24/2026</div></div>
                    </div>
                    <div className="flex items-center justify-between px-2 bg-[#F1F5F9] border-t border-[#94A3B8]" style={{ height: '1.5%' }}><span className="text-[7px] text-[#94A3B8]">Form CMS-485 (C-3) (02/2026)</span><span className="text-[7px] text-[#94A3B8]">OMB Approval Pending</span></div>
                  </div>
                  <div className="absolute inset-0 z-20" aria-label="CMS-485 hotspots overlay">
                    {orderedHotspots.map((hotspot) => {
                      const isSelected = selectedId === hotspot.id
                      const isGuidedTarget = mode === 'guided' && currentGuidedHotspot.id === hotspot.id
                      const isSearchDimmed = searchQuery.trim() && !hotspot.label.toLowerCase().includes(searchQuery.toLowerCase())

                      return (
                        <button
                          key={hotspot.id}
                          type="button"
                          aria-label={`Hotspot: ${hotspot.label}`}
                          onMouseEnter={() => setHoveredId(hotspot.id)}
                          onMouseLeave={() => setHoveredId((current) => (current === hotspot.id ? null : current))}
                          onFocus={() => onSelectHotspot(hotspot.id)}
                          onClick={() => onSelectHotspot(hotspot.id)}
                          className={`absolute rounded-md border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64F4F5] focus-visible:ring-offset-1 focus-visible:ring-offset-black ${
                            isSearchDimmed
                              ? 'opacity-20'
                              : isGuidedTarget
                                ? 'animate-pulse border-[#64F4F5] bg-[#64F4F5]/15 shadow-[0_0_18px_rgba(100,244,245,0.45)]'
                                : isSelected
                                  ? 'border-[#C74601] bg-[#C74601]/12 shadow-[0_0_14px_rgba(199,70,1,0.35)]'
                                  : 'border-white/20 bg-transparent hover:border-[#64F4F5]/70 hover:bg-[#64F4F5]/8'
                          }`}
                          style={{
                            left: `${hotspot.bbox.x}%`,
                            top: `${hotspot.bbox.y}%`,
                            width: `${hotspot.bbox.width}%`,
                            height: `${hotspot.bbox.height}%`,
                          }}
                        >
                          {showCalibration && (
                            <span className="absolute -top-5 left-0 rounded bg-black/80 px-1.5 py-0.5 text-[10px] text-[#64F4F5]">
                              {hotspot.id}
                            </span>
                          )}
                        </button>
                      )
                    })}

                    {hoveredId && (() => {
                      const hovered = orderedHotspots.find((item) => item.id === hoveredId)
                      if (!hovered) return null
                      const position = getTooltipPosition(hovered.bbox)

                      return (
                        <div
                          className="pointer-events-none absolute z-30 max-w-[260px] rounded-md border border-[#64F4F5]/40 bg-black/90 px-3 py-2 text-xs text-white shadow-lg"
                          style={position}
                        >
                          <p className="font-semibold text-[#64F4F5]">{hovered.label}</p>
                          <p className="mt-1 text-white/80">{hovered.shortTooltip}</p>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="hide-scrollbar min-h-0 overflow-y-auto p-3 md:p-4">
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <Search className="h-4 w-4 text-white/60" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search field..."
                className="w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
                aria-label="Search field labels"
              />
            </div>

            <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-white/70">
                <span>Guided progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="mb-2 h-2 overflow-hidden rounded bg-white/10">
                <div className="h-full bg-gradient-to-r from-[#007970] via-[#64F4F5] to-[#C74601]" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="flex flex-wrap gap-1">
                {orderedHotspots.map((step) => (
                  <span
                    key={step.id}
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                      completedSteps.has(step.id)
                        ? 'border-[#007970] bg-[#007970]/25 text-[#64F4F5]'
                        : 'border-white/20 bg-transparent text-white/50'
                    }`}
                    title={step.guidedStep.stepTitle}
                  >
                    {completedSteps.has(step.id) ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                  </span>
                ))}
              </div>
            </div>

            {allStepsCompleted && mode === 'guided' ? (
              <div className="rounded-xl border border-[#007970]/50 bg-[#007970]/12 p-4">
                <h3 className="text-base font-semibold text-[#64F4F5]">Youâ€™re done</h3>
                <p className="mt-1 text-sm text-white/85">
                  All guided sections completed. You can review any hotspot or run Try It mode before finalizing.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button className="text-xs" onClick={resetAll}>
                    <RotateCcw className="h-4 w-4" />
                    Restart
                  </Button>
                  <Button variant="ghost" className="text-xs" onClick={() => setMode('explore')}>
                    Review sections
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#64F4F5]">{activeForPanel.label}</h3>
                  <p className="mt-2 text-xs text-white/70">{activeForPanel.shortTooltip}</p>

                  <div className="mt-3 space-y-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#64F4F5]">Why it matters</p>
                      <p className="text-white/85">{activeForPanel.detail.whyItMatters}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#64F4F5]">How to complete</p>
                      <p className="text-white/85">{activeForPanel.detail.howToFill}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#64F4F5]">Common mistakes</p>
                      <ul className="list-disc space-y-1 pl-5 text-white/80">
                        {activeForPanel.detail.commonMistakes.map((mistake) => (
                          <li key={mistake}>{mistake}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#64F4F5]">Example</p>
                      <p className="text-white/85">{activeForPanel.detail.example}</p>
                    </div>
                  </div>
                </div>

                {mode === 'guided' && (
                  <div className="mb-4 rounded-xl border border-[#C74601]/45 bg-[#C74601]/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#FFB27F]">
                      Step {guidedStepIndex + 1} Â· {activeForPanel.guidedStep.stepTitle}
                    </p>
                    <p className="mt-2 text-sm text-white/90">{activeForPanel.guidedStep.stepInstruction}</p>
                    <p className="mt-2 text-xs text-white/70"><span className="font-semibold text-white/80">Source:</span> {activeForPanel.guidedStep.source}</p>
                    <p className="mt-1 text-xs text-white/70"><span className="font-semibold text-white/80">Defensible for audits:</span> {activeForPanel.guidedStep.defensibleForAudit}</p>

                    <div className="mt-3 rounded-lg border border-white/10 bg-black/25 p-3">
                      <p className="text-sm text-white">{activeForPanel.guidedStep.checkQuestion}</p>
                      <div className="mt-2 grid gap-2">
                        {activeForPanel.guidedStep.choices.map((choice, index) => {
                          const picked = activeAnswer === index
                          const correct = activeForPanel.guidedStep.correctIndex === index
                          return (
                            <button
                              key={choice}
                              type="button"
                              onClick={() => submitCheckAnswer(activeForPanel, index)}
                              className={`rounded border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64F4F5] ${
                                picked
                                  ? correct
                                    ? 'border-[#007970] bg-[#007970]/20 text-[#64F4F5]'
                                    : 'border-[#D70101] bg-[#D70101]/20 text-[#FFB8B8]'
                                  : 'border-white/15 bg-white/5 text-white/85 hover:border-white/30'
                              }`}
                            >
                              {choice}
                            </button>
                          )
                        })}
                      </div>

                      {activeAnswer !== undefined && (
                        <p className={`mt-2 text-xs ${activeAnswer === activeForPanel.guidedStep.correctIndex ? 'text-[#64F4F5]' : 'text-[#FFB8B8]'}`}>
                          {activeForPanel.guidedStep.rationale}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex justify-between">
                      <Button
                        variant="ghost"
                        className="text-xs"
                        disabled={guidedStepIndex === 0}
                        onClick={() => setGuidedStepIndex((value) => Math.max(0, value - 1))}
                      >
                        Back
                      </Button>
                      <Button
                        className="text-xs"
                        onClick={() => {
                          setCompletedSteps((previous) => new Set([...previous, activeForPanel.id]))
                          setGuidedStepIndex((value) => Math.min(orderedHotspots.length - 1, value + 1))
                        }}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

                {mode === 'tryit' && (
                  <div className="rounded-xl border border-[#007970]/45 bg-[#007970]/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64F4F5]">Try It input</p>
                    <label className="mt-2 block text-sm text-white/90">{activeForPanel.tryInput.label}</label>

                    {activeForPanel.tryInput.type === 'select' ? (
                      <select
                        value={tryInputs[activeForPanel.id] ?? ''}
                        onChange={(event) => onTryInputChange(activeForPanel, event.target.value)}
                        className="mt-2 w-full rounded border border-white/20 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#64F4F5]"
                      >
                        <option value="">Select...</option>
                        {activeForPanel.tryInput.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={activeForPanel.tryInput.type}
                        value={tryInputs[activeForPanel.id] ?? ''}
                        onChange={(event) => onTryInputChange(activeForPanel, event.target.value)}
                        placeholder={activeForPanel.tryInput.placeholder}
                        className="mt-2 w-full rounded border border-white/20 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#64F4F5]"
                      />
                    )}

                    <p className="mt-2 text-xs text-white/70">{activeForPanel.tryInput.coachingMessage}</p>
                    {activeTryFeedback && (
                      <p className={`mt-1 text-xs ${activeTryFeedback.valid ? 'text-[#64F4F5]' : 'text-[#FFB8B8]'}`}>
                        {activeTryFeedback.message}
                      </p>
                    )}

                    <div className="mt-4 rounded-lg border border-white/10 bg-black/25 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#64F4F5]">Try It summary</p>
                      <p className="mt-1 text-sm text-white/85">Completed sections: {tryCompletedCount} / {orderedHotspots.length}</p>
                      <p className="mt-2 text-xs text-white/70">Missing high-risk sections: {highRiskMissing.length}</p>
                      {highRiskMissing.length > 0 && (
                        <ul className="mt-1 list-disc pl-5 text-xs text-[#FFB8B8]">
                          {highRiskMissing.map((id) => {
                            const hotspot = orderedHotspots.find((item) => item.id === id)
                            return hotspot ? <li key={id}>{hotspot.label}</li> : null
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#64F4F5]">Review sections</p>
                  <div className="grid gap-1">
                    {filteredHotspots.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectHotspot(item.id)}
                        className={`rounded px-2 py-1.5 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64F4F5] ${
                          selectedId === item.id
                            ? 'bg-[#007970]/25 text-[#64F4F5]'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                      >
                        {item.guidedStep.stepOrder}. {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

