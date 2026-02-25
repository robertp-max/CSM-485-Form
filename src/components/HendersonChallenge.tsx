import { useCallback, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  GripVertical,
  Heart,
  Home,
  Info,
  ShieldAlert,
  Trophy,
  X,
  XCircle,
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import {
  ANSWER_CHIPS,
  HENDERSON_BOXES,
  HENDERSON_NARRATIVE,
} from '../data/hendersonData'

const STORAGE_KEY = 'cms485.henderson.v1'

type Props = {
  onExit?: () => void
}

type Placement = Record<string, string> // boxId → chipId
type SubmissionResult = {
  correct: string[]    // box IDs
  incorrect: string[]  // box IDs
  safetyFirst: boolean // did they place safety before wound?
}

function loadState(): { placements: Placement } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { placements: {} }
    return JSON.parse(raw) as { placements: Placement }
  } catch { return { placements: {} } }
}

function saveState(placements: Placement) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ placements }))
}

/* ── Component ───────────────────────────────────────────── */
export default function HendersonChallenge({ onExit }: Props) {
  const { isDarkMode, toggle } = useTheme()
  const [placements, setPlacements] = useState<Placement>(() => loadState().placements)
  const [draggingChipId, setDraggingChipId] = useState<string | null>(null)
  const [hoveredBox, setHoveredBox] = useState<string | null>(null)
  const [tooltipBox, setTooltipBox] = useState<string | null>(null)
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [safetyPlacedOrder, setSafetyPlacedOrder] = useState<string[]>([])

  // Track which chips are placed
  const placedChipIds = useMemo(() => new Set(Object.values(placements)), [placements])
  const availableChips = useMemo(
    () => ANSWER_CHIPS.filter((c) => !placedChipIds.has(c.id)),
    [placedChipIds],
  )

  const removeChip = useCallback((boxId: string) => {
    setPlacements((prev) => {
      const next = { ...prev }
      delete next[boxId]
      saveState(next)
      return next
    })
    setSafetyPlacedOrder((prev) => prev.filter((b) => b !== boxId))
  }, [])

  const handleDragStart = useCallback((chipId: string) => {
    setDraggingChipId(chipId)
  }, [])

  const handleDrop = useCallback((boxId: string) => {
    if (draggingChipId) {
      // Remove chip from any other box first
      setPlacements((prev) => {
        const cleaned = Object.fromEntries(
          Object.entries(prev).filter(([, v]) => v !== draggingChipId),
        )
        cleaned[boxId] = draggingChipId
        saveState(cleaned)
        return cleaned
      })
      setSafetyPlacedOrder((prev) => [...prev.filter((b) => b !== boxId), boxId])
      setDraggingChipId(null)
    }
  }, [draggingChipId])

  const handleSubmit = useCallback(() => {
    const correct: string[] = []
    const incorrect: string[] = []

    for (const box of HENDERSON_BOXES) {
      const chipId = placements[box.id]
      if (chipId === box.correctChipId) {
        correct.push(box.id)
      } else {
        incorrect.push(box.id)
      }
    }

    // Safety-first check: box-24 must be placed before box-18 in the order
    const safetyIdx = safetyPlacedOrder.indexOf('box-24')
    const woundIdx = safetyPlacedOrder.indexOf('box-18')
    const safetyFirst = safetyIdx >= 0 && (woundIdx < 0 || safetyIdx < woundIdx)

    setSubmissionResult({ correct, incorrect, safetyFirst })
    if (correct.length === HENDERSON_BOXES.length && safetyFirst) {
      setShowBreakdown(true)
    }
  }, [placements, safetyPlacedOrder])

  const handleReset = useCallback(() => {
    setPlacements({})
    setSubmissionResult(null)
    setShowBreakdown(false)
    setSafetyPlacedOrder([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const allBoxesFilled = HENDERSON_BOXES.every((b) => placements[b.id])

  // HR crisis warning
  const showHrWarning = allBoxesFilled && !placements['box-24']
  const showFirearmWarning = allBoxesFilled && !placements['box-24']

  /* ── Theme tokens ──────────────────────────────────── */
  const bg = isDarkMode ? 'bg-[#09090b]' : 'bg-[#FAFBF8]'
  const surface = isDarkMode ? 'bg-[#121214] border-white/10' : 'bg-white border-[#E5E4E3]'
  const text = isDarkMode ? 'text-[#F3F4F6]' : 'text-[#1F1C1B]'
  const muted = isDarkMode ? 'text-white/60' : 'text-[#747474]'


  /* ── Clinical Logic Breakdown Modal ──────────────────── */
  if (showBreakdown && submissionResult) {
    return (
      <div className={`min-h-screen ${bg} ${text} font-sans`}>
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="text-center mb-10">
            <Trophy className="h-16 w-16 mx-auto text-[#007970] mb-4" />
            <h1 className="font-heading text-4xl font-bold mb-2">CareIndeed Clinical Master</h1>
            <p className={muted}>You successfully completed the Henderon POC with 100% accuracy.</p>
          </div>

          <div className="space-y-6">
            {HENDERSON_BOXES.map((box) => (
              <div key={box.id} className={`rounded-xl border p-6 ${surface}`}>
                <h3 className="font-heading text-lg font-bold text-[#007970] mb-2">{box.label}</h3>
                <p className="text-sm leading-relaxed">{box.validationAffirmation}</p>
              </div>
            ))}

            {submissionResult.safetyFirst && (
              <div className={`rounded-xl border-2 border-[#C74601] p-6 ${isDarkMode ? 'bg-[#C74601]/10' : 'bg-[#FFEEE5]'}`}>
                <h3 className="font-heading text-lg font-bold text-[#C74601] mb-2">🏆 The Priority Task: 911/Safety First</h3>
                <p className="text-sm leading-relaxed">
                  Master-Level Priority! You recognized that clinical care cannot occur in a vacuum of danger. By prioritizing the Bradycardia (Silent MI) and the unsecured firearm over the wound care, you demonstrated the most important trait of a CareIndeed clinician: Total Patient Advocacy and Safety First.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4 mt-10">
            <button onClick={handleReset} className="rounded-xl border-2 border-[#007970] bg-[#007970] text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#006059]">
              Restart Henderon POC
            </button>
            {onExit ? (
              <button onClick={onExit} className="rounded-xl border-2 border-[#E5E4E3] px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#007970]/10">
                Back to Virtual CMS-485
              </button>
            ) : (
              <a href="#/" className="rounded-xl border-2 border-[#E5E4E3] px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#007970]/10">
                Back to Course
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bg} ${text} font-sans`}>
      {/* ── Header ──────────────────────────────────── */}
      <header className={`sticky top-0 z-40 border-b ${isDarkMode ? 'border-white/10 bg-[#09090b]/95 backdrop-blur-lg' : 'border-[#E5E4E3] bg-[#FAFBF8]/95 backdrop-blur-lg'}`}>
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            {onExit ? (
              <button onClick={onExit} className="flex items-center gap-1 text-sm font-medium text-[#007970] hover:underline">
                <ArrowLeft className="h-4 w-4" /> Virtual CMS-485
              </button>
            ) : (
              <a href="#/" className="flex items-center gap-1 text-sm font-medium text-[#007970] hover:underline">
                <ArrowLeft className="h-4 w-4" /> Course
              </a>
            )}
            <div className={`h-5 w-px ${isDarkMode ? 'bg-white/15' : 'bg-[#E5E4E3]'}`} />
            <h1 className="font-heading text-base font-bold">
              Clinical Master POC: <span className="text-[#C74601]">Case Henderon</span>
            </h1>
            <span className={`text-[10px] uppercase tracking-widest ${muted}`}>Level: Expert · CMS-485 Mastery</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${isDarkMode ? 'border-white/10 text-white/80 hover:bg-white/10' : 'border-[#E5E4E3] text-[#1F1C1B] hover:bg-[#F7FEFF]'}`}>
              {isDarkMode ? 'Light' : 'Night'}
            </button>
            <button onClick={handleReset} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${isDarkMode ? 'border-white/10 text-[#C74601]' : 'border-[#E5E4E3] text-[#C74601]'}`}>
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* ── Crisis Banner ────────────────────────────── */}
      {(showHrWarning || showFirearmWarning) && !submissionResult && (
        <div className="bg-[#C74601] text-white px-6 py-3 flex items-center justify-center gap-3 animate-pulse">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm font-bold uppercase tracking-widest">
            Critical Safety Warning: Address HR 48 (Bradycardia) and unsecured firearm BEFORE any wound care.
          </span>
        </div>
      )}

      {/* ── Split Layout ─────────────────────────────── */}
      <div className="mx-auto max-w-[1600px] grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-0 min-h-[calc(100vh-56px)]">
        {/* LEFT — Clinical Narrative */}
        <aside className={`border-r overflow-y-auto p-6 ${isDarkMode ? 'border-white/10' : 'border-[#E5E4E3]'}`} style={{ maxHeight: 'calc(100vh - 56px)' }}>
          <div className={`rounded-xl border-l-4 border-[#007970] p-4 mb-6 text-sm italic ${isDarkMode ? 'bg-white/5 text-white/80' : 'bg-[#F7FEFF] text-[#524048]'}`}>
            {HENDERSON_NARRATIVE.scheduleQuote}
          </div>

          {/* Vitals Banner */}
          <div className={`rounded-xl border p-4 mb-6 ${isDarkMode ? 'border-[#C74601]/40 bg-[#C74601]/8' : 'border-[#C74601]/30 bg-[#FFEEE5]'}`}>
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-[#C74601] mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4" /> Critical Vitals
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(HENDERSON_NARRATIVE.vitals).map(([key, val]) => (
                <div key={key} className={`rounded-lg p-2 ${isDarkMode ? 'bg-black/30' : 'bg-white'}`}>
                  <span className={`font-semibold uppercase tracking-wider ${muted}`}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <p className="mt-0.5 font-medium">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental Risks */}
          <div className={`rounded-xl border p-4 mb-6 ${isDarkMode ? 'border-[#C74601]/40 bg-[#C74601]/5' : 'border-[#C74601]/20 bg-[#FFF9F5]'}`}>
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-[#C74601] mb-2 flex items-center gap-2">
              <Home className="h-4 w-4" /> Environmental Risks
            </h3>
            <ul className="space-y-1.5">
              {HENDERSON_NARRATIVE.environmentalRisks.map((r) => (
                <li key={r} className="flex items-start gap-2 text-xs">
                  <ShieldAlert className="h-3.5 w-3.5 mt-0.5 text-[#C74601] shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Narrative Sections */}
          {HENDERSON_NARRATIVE.sections.map((s) => (
            <div key={s.title} className={`mb-4 rounded-xl border p-4 ${surface}`}>
              <h3 className="font-heading text-sm font-bold text-[#007970] mb-2">{s.title}</h3>
              <p className="text-sm leading-relaxed">{s.content}</p>
            </div>
          ))}
        </aside>

        {/* RIGHT — Interactive CMS-485 */}
        <section className="overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          <h2 className="font-heading text-xl font-bold mb-6">Interactive CMS-485 Form</h2>

          {/* Drop Zones */}
          <div className="space-y-4 mb-8">
            {HENDERSON_BOXES.map((box) => {
              const chipId = placements[box.id]
              const chip = chipId ? ANSWER_CHIPS.find((c) => c.id === chipId) : null
              const isCorrect = submissionResult?.correct.includes(box.id)
              const isIncorrect = submissionResult?.incorrect.includes(box.id)
              const correctChip = ANSWER_CHIPS.find((c) => c.id === box.correctChipId)

              return (
                <div key={box.id} className="relative">
                  <div
                    className={`rounded-xl border-2 p-4 transition-all min-h-[80px] ${
                      isCorrect
                        ? (isDarkMode ? 'border-[#007970] bg-[#007970]/10' : 'border-[#007970] bg-[#F0FDFA]')
                        : isIncorrect
                          ? (isDarkMode ? 'border-[#D70101] bg-[#D70101]/10' : 'border-[#D70101] bg-[#FFF0F0]')
                          : hoveredBox === box.id && draggingChipId
                            ? (isDarkMode ? 'border-[#64F4F5] bg-[#64F4F5]/10' : 'border-[#007970] bg-[#E5FEFF]')
                            : (isDarkMode ? 'border-white/15 bg-white/[0.03]' : 'border-[#E5E4E3] bg-white')
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setHoveredBox(box.id) }}
                    onDragLeave={() => setHoveredBox(null)}
                    onDrop={(e) => { e.preventDefault(); setHoveredBox(null); handleDrop(box.id) }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-heading text-sm font-bold">
                        {box.label}
                      </h3>
                      <button
                        onClick={() => setTooltipBox(tooltipBox === box.id ? null : box.id)}
                        className="text-[#007970] hover:text-[#64F4F5]"
                        aria-label={`Clinical logic for ${box.shortLabel}`}
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Tooltip */}
                    {tooltipBox === box.id && (
                      <div className={`rounded-lg border p-3 mb-3 text-xs ${isDarkMode ? 'border-[#007970]/40 bg-[#007970]/10 text-[#C4F4F5]' : 'border-[#007970]/30 bg-[#F0FDFA] text-[#004142]'}`}>
                        <span className="font-bold text-[#007970]">Clinical Logic: </span>
                        {box.tooltipWhy}
                      </div>
                    )}

                    <p className={`text-xs mb-3 ${muted}`}>{box.instruction}</p>

                    {chip ? (
                      <div className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                        isCorrect
                          ? 'border-[#007970] bg-[#007970]/15 text-[#007970]'
                          : isIncorrect
                            ? 'border-[#D70101] bg-[#D70101]/15 text-[#D70101]'
                            : (isDarkMode ? 'border-[#64F4F5]/30 bg-[#64F4F5]/8 text-[#64F4F5]' : 'border-[#007970]/30 bg-[#E5FEFF] text-[#007970]')
                      }`}>
                        <span className="text-sm font-medium">{chip.label}</span>
                        {!submissionResult && (
                          <button onClick={() => removeChip(box.id)} className="ml-2 hover:opacity-70">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {isCorrect && <CheckCircle className="h-4 w-4 shrink-0" />}
                        {isIncorrect && <XCircle className="h-4 w-4 shrink-0" />}
                      </div>
                    ) : (
                      <div className={`flex items-center justify-center rounded-lg border-2 border-dashed py-4 text-xs ${isDarkMode ? 'border-white/15 text-white/30' : 'border-[#E5E4E3] text-[#B8B4B2]'}`}>
                        Drop an answer chip here
                      </div>
                    )}

                    {/* Remediation for incorrect */}
                    {isIncorrect && chip && (
                      <div className={`mt-3 rounded-lg border p-3 text-xs ${isDarkMode ? 'border-[#D70101]/30 bg-[#D70101]/5' : 'border-[#D70101]/20 bg-[#FFF0F0]'}`}>
                        {box.remediation
                          .filter((r) => chip.label.includes(r.wrongLabel.split(' ')[0]))
                          .map((r) => (
                            <div key={r.wrongLabel}>
                              <p className="font-bold text-[#D70101] mb-1">Why {r.wrongLabel} is wrong:</p>
                              <p>{r.wrongExplanation}</p>
                            </div>
                          ))}
                        {correctChip && (
                          <p className="mt-2"><span className="font-bold text-[#007970]">Correct answer:</span> {correctChip.label}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Submit / Result */}
          {submissionResult ? (
            <div className={`rounded-xl border-2 p-6 text-center mb-8 ${
              submissionResult.incorrect.length === 0 && submissionResult.safetyFirst
                ? 'border-[#007970] bg-[#007970]/10'
                : 'border-[#C74601] bg-[#C74601]/10'
            }`}>
              <h3 className="font-heading text-xl font-bold mb-2">
                {submissionResult.incorrect.length === 0 && submissionResult.safetyFirst
                  ? '🏆 Perfect — Clinical Master!'
                  : `${submissionResult.correct.length}/${HENDERSON_BOXES.length} Correct`}
              </h3>
              {!submissionResult.safetyFirst && (
                <p className="text-sm text-[#C74601] font-medium mt-2">
                  ⚠️ Safety check failed: You must address the firearm and HR 48 BEFORE wound care.
                </p>
              )}
              <div className="flex justify-center gap-3 mt-4">
                {submissionResult.incorrect.length === 0 && submissionResult.safetyFirst && (
                  <button onClick={() => setShowBreakdown(true)} className="rounded-xl bg-[#007970] text-white px-5 py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-[#006059]">
                    View Clinical Breakdown
                  </button>
                )}
                <button onClick={handleReset} className={`rounded-xl border-2 px-5 py-2.5 text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'border-white/20 hover:bg-white/10' : 'border-[#E5E4E3] hover:bg-[#FAFBF8]'}`}>
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allBoxesFilled}
              className={`w-full rounded-xl py-4 text-sm font-bold uppercase tracking-widest transition-all mb-8 ${
                allBoxesFilled
                  ? 'bg-[#007970] text-white hover:bg-[#006059] shadow-lg'
                  : (isDarkMode ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-[#E5E4E3] text-[#B8B4B2] cursor-not-allowed')
              }`}
            >
              Generate Master Plan
            </button>
          )}

          {/* ── Answer Chip Dock ────────────────────────── */}
          <div className={`rounded-xl border p-4 ${surface}`}>
            <h3 className="font-heading text-sm font-bold mb-3 flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-[#007970]" /> Clinical Answer Chips
            </h3>
            <p className={`text-xs mb-4 ${muted}`}>
              Drag chips into the CMS-485 boxes above. Or click a chip, then click a box.
            </p>

            <div className="flex flex-wrap gap-2 mt-1.5">
              {availableChips.map((chip) => (
                <button
                  key={chip.id}
                  draggable
                  onDragStart={() => handleDragStart(chip.id)}
                  onClick={() => {
                    if (draggingChipId === chip.id) {
                      setDraggingChipId(null)
                    } else {
                      setDraggingChipId(chip.id)
                    }
                  }}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all cursor-grab active:cursor-grabbing ${
                    draggingChipId === chip.id
                      ? (isDarkMode ? 'border-[#64F4F5] bg-[#64F4F5]/15 text-[#64F4F5] scale-105' : 'border-[#007970] bg-[#E5FEFF] text-[#007970] scale-105 shadow-md')
                      : chip.category === 'safety'
                        ? (isDarkMode ? 'border-[#C74601]/40 bg-[#C74601]/8 text-[#FFB27F] hover:border-[#C74601]' : 'border-[#C74601]/30 bg-[#FFEEE5] text-[#C74601] hover:border-[#C74601]')
                        : (isDarkMode ? 'border-white/15 bg-white/5 text-white/80 hover:border-[#64F4F5]/50' : 'border-[#E5E4E3] bg-white text-[#524048] hover:border-[#007970] hover:shadow-sm')
                  }`}
                >
                  <GripVertical className="h-3 w-3 inline mr-1 opacity-50" />
                  {chip.label}
                </button>
              ))}
            </div>

            {availableChips.length === 0 && (
              <p className={`text-xs ${muted}`}>All chips placed. Click "Generate Master Plan" to check your answers.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
