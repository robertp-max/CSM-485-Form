import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { GripVertical, Trophy, ArrowLeft, CheckCircle2, XCircle, ChevronLeft, ChevronRight, FileText } from 'lucide-react'

/* ── Types ─────────────────────────────────────────────────── */
interface FormPart {
  id: string
  box: string
  label: string
}

interface LayoutChallengeProps {
  theme: 'night' | 'day'
  onComplete?: (score: number, correct: number, total: number) => void
  onBack?: () => void
  inline?: boolean
  qaMode?: boolean
}

/* ── Palette (mirrors Interactive485Form) ──────────────────── */
const palette = (t: 'night' | 'day') => {
  const n = t === 'night'
  return {
    bg: n ? '#010809' : '#FAFBF8',
    bgAlt: n ? '#031213' : '#FAFBF8',
    card: n ? '#031213' : '#ffffff',
    cardBorder: n ? '#004142' : '#E5E4E3',
    text: n ? '#FAFBF8' : '#1F1C1B',
    textMuted: n ? '#D9D6D5' : '#524048',
    textDim: n ? '#747474' : '#747474',
    accent: n ? '#64F4F5' : '#007970',
    accentDim: n ? '#007970' : '#006059',
    accent2: n ? '#C74601' : '#C74601',
    accent2Light: n ? '#FFD5BF' : '#FFD5BF',
    formBg: n ? '#020C0D' : '#ffffff',
    formHeaderBg: n ? '#002B2C' : '#004142',
    chipBg: n ? '#002B2C' : '#E5FEFF',
    chipBorder: n ? '#007970' : '#007970',
    chipText: n ? '#64F4F5' : '#007970',
    correctBg: n ? 'rgba(0,121,112,0.25)' : '#ecfdf5',
    correctBorder: n ? '#007970' : '#10b981',
    incorrectBg: n ? 'rgba(215,1,1,0.25)' : '#fef2f2',
    incorrectBorder: n ? '#D70101' : '#ef4444',
    bankBg: n ? '#031213' : '#F8F9FA',
    dropHover: n ? 'rgba(0,65,66,0.5)' : '#e6f4f1',
  }
}

/* ── Static data ───────────────────────────────────────────── */
const FORM_PARTS: FormPart[] = [
  { id: 'chip-1', box: '1', label: 'Patient HI #' },
  { id: 'chip-2', box: '2', label: 'SOC Date' },
  { id: 'chip-3', box: '3', label: 'Cert Period' },
  { id: 'chip-4', box: '4', label: 'Medical Rec #' },
  { id: 'chip-5', box: '5', label: 'Provider #' },
  { id: 'chip-6', box: '6', label: 'Patient Name, Address, DOB' },
  { id: 'chip-11', box: '11', label: 'Principal Diagnosis' },
  { id: 'chip-12', box: '12', label: 'Other Pertinent DX' },
  { id: 'chip-14', box: '14', label: 'DME / Supplies' },
  { id: 'chip-15', box: '15', label: 'Functional Limitations' },
  { id: 'chip-16', box: '16', label: 'Mental Status' },
  { id: 'chip-18', box: '18', label: 'Skilled Nursing Orders' },
  { id: 'chip-21', box: '21', label: 'Visit Frequency' },
  { id: 'chip-22', box: '22', label: 'Goals / Rehab Potential' },
  { id: 'chip-safety', box: 'safety', label: 'Safety / Emergency Actions' },
  { id: 'chip-23', box: '23', label: "Nurse's Signature & Date of Verbal SOC" },
  { id: 'chip-24', box: '24', label: "Physician's Name & Address" },
  { id: 'chip-25', box: '25', label: 'Date HHA Received Signed POT' },
  { id: 'chip-26', box: '26', label: 'Certification / Recertification Statement' },
  { id: 'chip-27', box: '27', label: "Attending Physician's Signature & Date" },
  { id: 'chip-28', box: '28', label: 'Federal Penalty Warning (Misrepresentation)' },
]

const ZONES: { box: string; label: string }[] = [
  { box: '1', label: 'Box 1' },
  { box: '2', label: 'Box 2' },
  { box: '3', label: 'Box 3' },
  { box: '4', label: 'Box 4' },
  { box: '5', label: 'Box 5' },
  { box: '6', label: 'Box 6' },
  { box: '11', label: 'Box 11' },
  { box: '12', label: 'Box 12' },
  { box: '14', label: 'Box 14' },
  { box: '15', label: 'Box 15' },
  { box: '16', label: 'Box 16' },
  { box: '18', label: 'Box 18' },
  { box: '21', label: 'Box 21' },
  { box: '22', label: 'Box 22' },
  { box: 'safety', label: 'Safety Addendum' },
  { box: '23', label: 'Box 23' },
  { box: '25', label: 'Box 25' },
  { box: '24', label: 'Box 24' },
  { box: '26', label: 'Box 26' },
  { box: '27', label: 'Box 27' },
  { box: '28', label: 'Box 28' },
]

/* ── Box descriptions for review panel ─────────────────────── */
const BOX_DESCRIPTIONS: Record<string, string> = {
  '1': 'Patient Health Insurance Claim Number — the Medicare beneficiary identifier that links the patient to their insurance coverage. Required for all CMS billing.',
  '2': 'Start of Care (SOC) Date — the date home health services begin for the current episode. Drives the 60-day certification period calculation.',
  '3': 'Certification Period — the 60-day episode window. "From" is SOC date; "To" is 60 days later. Must align with physician orders.',
  '4': 'Medical Record Number — the agency\'s internal patient identifier. Used for record retrieval and cross-referencing within the agency\'s system.',
  '5': 'Provider Number — the home health agency\'s CMS-assigned provider ID. Required for Medicare billing and regulatory compliance.',
  '6': 'Patient Name, Address, and Date of Birth — core demographics. Must match Medicare enrollment records exactly for claim processing.',
  '11': 'Principal Diagnosis — the primary ICD-10 code driving the home health episode. Must be the condition most related to the current plan of care.',
  '12': 'Other Pertinent Diagnoses — secondary ICD-10 codes that affect treatment. Listed in order of clinical importance for PDGM grouping.',
  '14': 'DME and Supplies — durable medical equipment and supplies ordered. Must be medically necessary and tied to the plan of care.',
  '15': 'Functional Limitations — documented physical and cognitive deficits. Drives OASIS scoring and justifies skilled care necessity.',
  '16': 'Mental Status — cognitive and behavioral assessment. Affects safety planning, caregiver training needs, and OASIS scoring.',
  '18': 'Skilled Nursing Orders — specific interventions ordered by the physician. Must include frequency, duration, and measurable goals.',
  '21': 'Visit Frequency — the discipline-specific visit schedule across the certification period. Written as "Xw Y" (X visits per week for Y weeks).',
  '22': 'Goals and Rehabilitation Potential — measurable patient outcomes and the clinician\'s assessment of the patient\'s ability to improve.',
  'safety': 'Safety / Emergency Actions — critical safety measures and emergency protocols. Must be addressed before clinical interventions begin.',
  '23': 'Nurse\'s Signature & Date of Verbal SOC — documents the clinician who established the plan and when verbal orders were obtained.',
  '24': 'Physician\'s Name & Address — the certifying/ordering physician. Required for order authentication and Medicare billing.',
  '25': 'Date HHA Received Signed POT — documents when the agency received the physician-signed plan of treatment. Compliance tracking.',
  '26': 'Certification / Recertification Statement — the physician\'s attestation that home health services are medically necessary.',
  '27': 'Attending Physician\'s Signature & Date — the physician\'s authentication of the entire plan of care. Must be obtained within required timeframes.',
  '28': 'Federal Penalty Warning — the legal notice about penalties for misrepresentation of information on federal forms.',
}

/* ── Shuffle helper ────────────────────────────────────────── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* ── Component ─────────────────────────────────────────────── */
export default function LayoutChallenge({ theme, onComplete, onBack, inline, qaMode }: LayoutChallengeProps) {
  const p = palette(theme)
  const isNight = theme === 'night'

  // placements: zone-box → chip-id
  const [placements, setPlacements] = useState<Record<string, string>>({})
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [validation, setValidation] = useState<Record<string, 'correct' | 'incorrect'> | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [reviewIdx, setReviewIdx] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [score, setScore] = useState(100)
  const startRef = useRef(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [shuffled] = useState(() => shuffle(FORM_PARTS))

  // Bank chips = those not placed
  const placedChipIds = useMemo(() => new Set(Object.values(placements)), [placements])
  const bankChips = useMemo(() => shuffled.filter((c) => !placedChipIds.has(c.id)), [shuffled, placedChipIds])

  // Timer + score penalty
  useEffect(() => {
    if (isComplete || isSubmitted) return
    const id = setInterval(() => {
      const secs = Math.floor((Date.now() - startRef.current) / 1000)
      setElapsed(secs)
      let s = 100
      if (secs > 180) {
        s = 100 - 60 - (secs - 180) * 2
      } else if (secs > 120) {
        s = 100 - (secs - 120)
      }
      setScore(Math.max(0, s))
    }, 500)
    return () => clearInterval(id)
  }, [isComplete, isSubmitted])

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  /* ── DnD Handlers ─────────────────────────────────────────── */
  const onDragStart = useCallback((e: React.DragEvent, chipId: string) => {
    e.dataTransfer.setData('text/plain', chipId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const onDragOverZone = useCallback((e: React.DragEvent, zoneBox: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(zoneBox)
  }, [])

  const onDragLeave = useCallback(() => setDragOver(null), [])

  const onDropZone = useCallback(
    (e: React.DragEvent, zoneBox: string) => {
      e.preventDefault()
      setDragOver(null)
      if (isComplete || isSubmitted) return
      setValidation(null) // clear previous check
      const chipId = e.dataTransfer.getData('text/plain')
      if (!chipId) return

      setPlacements((prev) => {
        const next = { ...prev }
        // Remove chip from any zone it was previously in
        for (const [k, v] of Object.entries(next)) {
          if (v === chipId) delete next[k]
        }
        // If the target zone already has a chip, release it back to bank
        // (the bank auto-shows anything not in placements)
        next[zoneBox] = chipId
        return next
      })
    },
    [isComplete, isSubmitted],
  )

  const onDropBank = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(null)
      if (isComplete || isSubmitted) return
      setValidation(null)
      const chipId = e.dataTransfer.getData('text/plain')
      if (!chipId) return
      setPlacements((prev) => {
        const next = { ...prev }
        for (const [k, v] of Object.entries(next)) {
          if (v === chipId) delete next[k]
        }
        return next
      })
    },
    [isComplete, isSubmitted],
  )

  /* ── Check Answers ────────────────────────────────────────── */
  const checkAnswers = useCallback(() => {
    if (isSubmitted) return
    const effectivePlacements = qaMode
      ? FORM_PARTS.reduce<Record<string, string>>((acc, part) => {
          acc[part.box] = part.id
          return acc
        }, {})
      : placements

    if (qaMode) {
      setPlacements(effectivePlacements)
    }

    const result: Record<string, 'correct' | 'incorrect'> = {}
    let correct = 0
    for (const zone of ZONES) {
      const chipId = effectivePlacements[zone.box]
      if (chipId) {
        const part = FORM_PARTS.find((fp) => fp.id === chipId)
        if (part && part.box === zone.box) {
          result[zone.box] = 'correct'
          correct++
        } else {
          result[zone.box] = 'incorrect'
        }
      } else {
        result[zone.box] = 'incorrect'
      }
    }

    const payload = {
      challenge: 'layout-challenge',
      submittedAt: new Date().toISOString(),
      elapsed,
      score,
      correct,
      total: FORM_PARTS.length,
      qaMode: Boolean(qaMode),
      placements: effectivePlacements,
    }

    if (!qaMode) {
      localStorage.setItem('cms485.layoutChallenge.lastAttempt', JSON.stringify(payload))
    }
    setValidation(result)
    setCorrectCount(correct)
    setIsSubmitted(true)
    setIsComplete(correct === FORM_PARTS.length)
    // Show review panel so user can browse results before proceeding
    setShowReview(true)
    setReviewIdx(0)
  }, [placements, isSubmitted, score, elapsed, qaMode])

  const handleProceed = useCallback(() => {
    if (!isSubmitted) return
    onComplete?.(score, correctCount, FORM_PARTS.length)
  }, [isSubmitted, onComplete, score, correctCount])

  /* ── Chip renderer ────────────────────────────────────────── */
  const renderChip = (part: FormPart, inZone = false) => (
    <div
      key={part.id}
      draggable={!isComplete && !isSubmitted}
      onDragStart={(e) => onDragStart(e, part.id)}
      style={{
        background: inZone ? 'transparent' : p.chipBg,
        borderColor: inZone ? 'transparent' : p.chipBorder,
        color: inZone ? p.text : p.chipText,
        cursor: isComplete || isSubmitted ? 'default' : 'grab',
        fontSize: inZone ? 10 : 12,
        fontWeight: inZone ? 700 : 500,
        textTransform: inZone ? 'uppercase' : undefined,
        textAlign: inZone ? 'center' : 'left',
      }}
      className={`flex items-center gap-2 rounded-md border px-3 py-2 select-none transition-transform ${
        isComplete || isSubmitted ? '' : 'active:scale-[0.97]'
      } ${inZone ? 'justify-center w-full' : 'shadow-sm'}`}
    >
      {!inZone && <GripVertical className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />}
      <span className={inZone ? '' : 'leading-snug'}>{part.label}</span>
    </div>
  )

  /* ── Zone renderer ────────────────────────────────────────── */
  const renderZone = (box: string, label: string, extraClass = '') => {
    const chipId = placements[box]
    const part = chipId ? FORM_PARTS.find((fp) => fp.id === chipId) : null
    const val = validation?.[box]
    const isOver = dragOver === box

    let bg = p.formBg
    let border = p.cardBorder
    if (val === 'correct') {
      bg = p.correctBg
      border = p.correctBorder
    } else if (val === 'incorrect') {
      bg = p.incorrectBg
      border = p.incorrectBorder
    } else if (isOver) {
      bg = p.dropHover
      border = p.accentDim
    }

    return (
      <div
        key={box}
        className={`relative flex items-center justify-center transition-all ${extraClass}`}
        style={{
          background: bg,
          borderColor: border,
          height: '100%',
          width: '100%',
          padding: '20px 8px 8px',
        }}
        onDragOver={(e) => onDragOverZone(e, box)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDropZone(e, box)}
      >
        <span
          className="absolute top-1 left-1.5 text-[9px] font-bold pointer-events-none uppercase tracking-wider opacity-60"
          style={{ color: p.textDim }}
        >
          {label}
        </span>
        {part ? (
          renderChip(part, true)
        ) : (
          <span className="text-[10px] italic font-medium opacity-30" style={{ color: p.textDim }}>
            Drop
          </span>
        )}
      </div>
    )
  }

  const scoreColor = score > 40 ? p.accent : score > 0 ? p.accent2 : '#ef4444'
  const timerColor = elapsed > 180 ? '#ef4444' : elapsed > 120 ? p.accent2 : p.text

  /* ── Review Panel ─────────────────────────────────────────── */
  if (showReview && validation) {
    const reviewItems = ZONES.map((zone) => {
      const chipId = placements[zone.box]
      const placedPart = chipId ? FORM_PARTS.find((fp) => fp.id === chipId) : null
      const correctPart = FORM_PARTS.find((fp) => fp.box === zone.box)
      const isCorrectPlacement = validation[zone.box] === 'correct'
      const description = BOX_DESCRIPTIONS[zone.box] ?? ''
      return { zone, placedPart, correctPart, isCorrectPlacement, description }
    })

    const clampedIdx = Math.min(reviewIdx, reviewItems.length - 1)
    const active = reviewItems[clampedIdx]

    return (
      <div
        className="flex flex-col h-full w-full overflow-hidden relative"
        style={inline ? { color: p.text } : { background: p.bg, color: p.text }}
      >
        {/* Review Header */}
        <div
          className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0"
          style={{ borderBottom: `1px solid ${p.cardBorder}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: isNight ? 'rgba(100,244,245,0.1)' : '#E5FEFF' }}
            >
              <FileText className="h-4 w-4" style={{ color: p.accent }} />
            </div>
            <div>
              <h1 className="font-heading font-bold text-base leading-tight" style={{ color: p.text }}>
                Layout Review
              </h1>
              <p className="text-[0.72rem]" style={{ color: p.textMuted }}>
                <strong style={{ color: p.accent }}>{correctCount}/{FORM_PARTS.length}</strong> correct
                {' · '}Score: <strong style={{ color: scoreColor }}>{score}</strong>
                {' · '}Time: {fmtTime(elapsed)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleProceed}
              className="px-4 py-1.5 rounded-lg text-white font-bold text-[0.72rem] tracking-wide transition-all hover:-translate-y-0.5"
              style={{ background: p.accentDim, boxShadow: `0 6px 20px -6px ${p.accentDim}88` }}
            >
              Continue
            </button>
          </div>
        </div>

        {/* Split panel */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left sidebar — zone list */}
          <div
            className="w-[200px] shrink-0 flex flex-col py-1 overflow-y-auto"
            style={{ borderRight: `1px solid ${p.cardBorder}` }}
          >
            {reviewItems.map((item, i) => {
              const selected = i === clampedIdx
              return (
                <button
                  key={item.zone.box}
                  onClick={() => setReviewIdx(i)}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-all duration-150 ${selected ? '' : 'hover:opacity-80'}`}
                  style={{
                    background: selected
                      ? (isNight
                        ? item.isCorrectPlacement ? 'rgba(0,121,112,0.18)' : 'rgba(215,1,1,0.12)'
                        : item.isCorrectPlacement ? '#F0FDFA' : '#FFF7F5')
                      : 'transparent',
                    borderLeft: selected
                      ? `3px solid ${item.isCorrectPlacement ? p.accent : '#ef4444'}`
                      : '3px solid transparent',
                  }}
                >
                  {item.isCorrectPlacement
                    ? <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: p.accent }} />
                    : <XCircle className="w-3 h-3 shrink-0" style={{ color: '#ef4444' }} />
                  }
                  <span
                    className={`text-[0.72rem] leading-tight ${selected ? 'font-bold' : 'font-medium'}`}
                    style={{ color: selected ? p.text : p.textMuted }}
                  >
                    {item.zone.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Right detail panel */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {active && (
                <div key={active.zone.box} style={{ animation: 'layoutReviewFade 0.2s ease forwards' }}>
                  {/* Zone title + badge */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.68rem] font-bold uppercase tracking-widest"
                      style={{
                        background: active.isCorrectPlacement ? (isNight ? 'rgba(0,121,112,0.3)' : '#E5FEFF') : (isNight ? 'rgba(215,1,1,0.2)' : '#FBE6E6'),
                        color: active.isCorrectPlacement ? p.accent : '#ef4444',
                      }}
                    >
                      {active.isCorrectPlacement
                        ? <><CheckCircle2 className="w-3 h-3" /> Correct</>
                        : <><XCircle className="w-3 h-3" /> Incorrect</>
                      }
                    </span>
                    <h2 className="font-heading font-bold text-base" style={{ color: p.text }}>
                      {active.zone.label}
                    </h2>
                  </div>

                  {/* What they placed (if wrong) */}
                  {!active.isCorrectPlacement && (
                    <div
                      className="rounded-xl px-4 py-3 mb-3 text-[0.8rem]"
                      style={{
                        background: isNight ? 'rgba(215,1,1,0.1)' : '#FFF0F0',
                        border: `1px solid ${isNight ? 'rgba(215,1,1,0.25)' : '#F5C6C6'}`,
                        color: isNight ? '#FFB8B8' : '#7A1A1A',
                      }}
                    >
                      <span className="font-bold" style={{ color: isNight ? '#FF8A8A' : '#ef4444' }}>Your answer: </span>
                      {active.placedPart ? active.placedPart.label : <em>Empty — nothing was placed</em>}
                      {active.placedPart && active.placedPart.box !== active.zone.box && (
                        <p className="mt-1.5 italic text-[0.76rem]" style={{ color: isNight ? '#FFD5BF' : '#8B4513' }}>
                          This part belongs in Box {active.placedPart.box}.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Correct answer */}
                  {!active.isCorrectPlacement && active.correctPart && (
                    <div
                      className="rounded-xl px-4 py-3 mb-3 text-[0.8rem]"
                      style={{
                        background: isNight ? 'rgba(0,121,112,0.1)' : '#E5FEFF',
                        border: `1px solid ${isNight ? 'rgba(0,121,112,0.25)' : '#B8E8E8'}`,
                        color: isNight ? '#C4F4F5' : '#004142',
                      }}
                    >
                      <span className="font-bold" style={{ color: p.accent }}>Correct answer: </span>
                      {active.correctPart.label}
                    </div>
                  )}

                  {/* Box description / clinical explanation */}
                  <div
                    className="rounded-xl px-4 py-4 text-[0.82rem] leading-relaxed"
                    style={{
                      background: isNight
                        ? active.isCorrectPlacement ? 'rgba(0,121,112,0.06)' : 'rgba(199,70,1,0.04)'
                        : active.isCorrectPlacement ? '#F8FFFE' : '#FFFCFB',
                      border: `1px solid ${isNight ? 'rgba(100,244,245,0.08)' : '#F0EFEE'}`,
                      color: isNight ? '#D8EDFF' : p.textMuted,
                    }}
                  >
                    <span className="font-bold block mb-2 text-[0.76rem] uppercase tracking-wider" style={{ color: active.isCorrectPlacement ? p.accent : p.accent2 }}>
                      {active.isCorrectPlacement ? 'What this box contains' : 'Why this matters'}
                    </span>
                    <p>{active.description}</p>
                    {active.isCorrectPlacement && active.correctPart && (
                      <p className="mt-3 font-medium" style={{ color: p.accent }}>
                        You correctly identified that <strong>{active.correctPart.label}</strong> belongs in {active.zone.label}.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom nav */}
            <div
              className="shrink-0 px-5 py-3 flex items-center justify-between"
              style={{ borderTop: `1px solid ${p.cardBorder}` }}
            >
              <button
                onClick={() => setReviewIdx(i => Math.max(0, i - 1))}
                disabled={reviewIdx === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.76rem] font-bold tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:-translate-y-0.5"
                style={{ color: p.textMuted }}
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <span className="text-[0.72rem] font-medium tabular-nums" style={{ color: p.textDim }}>
                {clampedIdx + 1} / {reviewItems.length}
              </span>
              <button
                onClick={() => setReviewIdx(i => Math.min(reviewItems.length - 1, i + 1))}
                disabled={reviewIdx >= reviewItems.length - 1}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.76rem] font-bold tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:-translate-y-0.5"
                style={{ color: p.textMuted }}
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes layoutReviewFade {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    )
  }

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative" style={inline ? { color: p.text } : { background: p.bg, color: p.text }}>
      {/* Header — standalone mode only */}
      {!inline && (
        <header
          className="px-6 py-4 flex justify-between items-center border-b flex-shrink-0"
          style={{ background: isNight ? p.bgAlt : p.card, borderColor: p.cardBorder }}
        >
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="p-1.5 rounded-lg transition-colors hover:opacity-80" style={{ color: p.accent }}>
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="font-heading font-bold text-lg md:text-xl" style={{ color: p.text }}>
                CMS-485 Layout Mastery
              </h1>
              <p className="text-xs mt-0.5" style={{ color: p.textMuted }}>
                Drag all 21 parts into their correct boxes. Points deduct after 2 minutes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="text-right hidden md:block">
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: p.textDim }}>Time</div>
              <div className="font-heading font-bold text-xl leading-none mt-1" style={{ color: timerColor }}>
                {fmtTime(elapsed)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: p.textDim }}>Score</div>
              <div className="font-heading font-bold text-3xl leading-none mt-1" style={{ color: scoreColor }}>
                {score}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={isSubmitted ? handleProceed : checkAnswers}
                className="px-4 py-2 rounded-lg text-sm font-heading font-bold transition-all hover:-translate-y-0.5 text-white"
                style={{ background: p.accentDim, boxShadow: `0 4px 12px ${p.accentDim}66` }}
              >
                {isSubmitted ? 'PROCEED' : 'CHECK'}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Compact toolbar — inline card mode */}
      {inline && (
        <div
          className="flex items-center justify-between px-4 py-2.5 border-b flex-shrink-0"
          style={{ borderColor: p.cardBorder }}
        >
          <p className="text-xs font-medium" style={{ color: p.textMuted }}>
            Drag all 21 parts into their correct boxes
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: p.textDim }}>Time</span>
            <span className="font-heading font-bold text-base" style={{ color: timerColor }}>{fmtTime(elapsed)}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest ml-1" style={{ color: p.textDim }}>Score</span>
            <span className="font-heading font-bold text-xl" style={{ color: scoreColor }}>{score}</span>
            <button
              onClick={isSubmitted ? handleProceed : checkAnswers}
              className="px-3 py-1.5 rounded-lg text-xs font-heading font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: p.accentDim }}
            >
              {isSubmitted ? 'PROCEED' : 'CHECK'}
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] overflow-hidden">
        {/* Left: Parts Bank */}
        <div
          className="w-full border-r flex flex-col"
          style={{ background: p.bankBg, borderColor: p.cardBorder }}
        >
          <div className="p-4 border-b flex-shrink-0" style={{ background: isNight ? p.bgAlt : '#fff', borderColor: p.cardBorder }}>
            <h3 className="font-heading font-bold text-xs uppercase tracking-widest flex items-center gap-2" style={{ color: p.accent2 }}>
              <GripVertical className="w-4 h-4" /> Form Parts Bank
            </h3>
            <p className="text-[11px] mt-1" style={{ color: p.textMuted }}>
              {bankChips.length} of {FORM_PARTS.length} remaining
            </p>
          </div>
          <div
            className="p-3 flex-1 overflow-y-auto flex flex-col gap-1.5"
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
            }}
            onDrop={onDropBank}
          >
            {bankChips.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center p-6">
                <div>
                  <Trophy className="w-10 h-10 mx-auto mb-2" style={{ color: p.accent }} />
                  <p className="text-sm font-bold" style={{ color: p.accent }}>All parts placed!</p>
                  <p className="text-xs mt-1" style={{ color: p.textMuted }}>Click CHECK to validate.</p>
                </div>
              </div>
            ) : (
              bankChips.map((part) => renderChip(part))
            )}
          </div>
        </div>

        {/* Right: CMS-485 Form Grid */}
        <div className="flex-1 overflow-hidden p-0" style={{ background: isNight ? '#020C0D' : '#F3F4F6' }}>
          <div
            className="w-full h-full flex flex-col border-r"
            style={{ background: p.formBg, borderColor: p.cardBorder }}
          >
            <div className="flex-[0.8] flex border-b" style={{ borderColor: p.cardBorder }}>
              {['1', '2', '3', '4', '5'].map((b, i) => (
                <div key={b} className={`flex-1 ${i < 4 ? 'border-r' : ''}`} style={{ borderColor: p.cardBorder }}>
                  {renderZone(b, `Box ${b}`)}
                </div>
              ))}
            </div>

            <div className="flex-[1] border-b" style={{ borderColor: p.cardBorder }}>
              {renderZone('6', 'Box 6')}
            </div>

            <div className="flex-[1.2] flex border-b" style={{ borderColor: p.cardBorder }}>
              <div className="w-[60%] border-r" style={{ borderColor: p.cardBorder }}>
                {renderZone('11', 'Box 11')}
              </div>
              <div className="flex-1">{renderZone('12', 'Box 12')}</div>
            </div>

            <div className="flex-[1.2] flex border-b" style={{ borderColor: p.cardBorder }}>
              <div className="w-[30%] border-r" style={{ borderColor: p.cardBorder }}>
                {renderZone('14', 'Box 14')}
              </div>
              <div className="w-[40%] border-r" style={{ borderColor: p.cardBorder }}>
                {renderZone('15', 'Box 15')}
              </div>
              <div className="flex-1">{renderZone('16', 'Box 16')}</div>
            </div>

            <div className="flex-[1.5] border-b" style={{ borderColor: p.cardBorder }}>
              {renderZone('18', 'Box 18')}
            </div>

            <div className="flex-[1.4] flex border-b" style={{ borderColor: p.cardBorder }}>
              <div className="w-[60%] border-r" style={{ borderColor: p.cardBorder }}>
                {renderZone('21', 'Box 21')}
              </div>
              <div className="flex-1">{renderZone('22', 'Box 22')}</div>
            </div>

            <div className="flex-[1] border-b" style={{ borderColor: isNight ? p.accentDim : '#9CA3AF', borderBottomWidth: '4px' }}>
              {renderZone('safety', 'Safety Addendum')}
            </div>

            <div className="flex-[1] flex border-b" style={{ borderColor: p.cardBorder }}>
              <div className="w-[70%] border-r" style={{ borderColor: p.cardBorder }}>
                {renderZone('23', 'Box 23')}
              </div>
              <div className="flex-1">{renderZone('25', 'Box 25')}</div>
            </div>

            <div className="flex-[1.2] flex border-b" style={{ borderColor: p.cardBorder }}>
              <div className="w-[50%] border-r" style={{ borderColor: p.cardBorder }}>
                {renderZone('24', 'Box 24')}
              </div>
              <div className="flex-1">{renderZone('26', 'Box 26')}</div>
            </div>

            <div className="flex-[1.2] flex border-b last:border-0" style={{ borderColor: p.cardBorder }}>
              <div className="w-[50%] border-r" style={{ borderColor: p.cardBorder }}>
                {renderZone('27', 'Box 27')}
              </div>
              <div className="flex-1">{renderZone('28', 'Box 28')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Completion banner */}
      {isComplete && validation && Object.values(validation).every((v) => v === 'correct') && score > 0 && (
        <div
          className="absolute bottom-0 left-0 right-0 p-6 text-center"
          style={{ background: isNight ? `${p.accentDim}ee` : `${p.accentDim}ee`, backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center justify-center gap-4 text-white">
            <Trophy className="w-8 h-8" />
            <div className="text-left">
              <h3 className="font-heading font-bold text-lg">Master Clinician!</h3>
              <p className="text-sm opacity-90">
                You reconstructed the entire CMS-485 form. Score: {score}/100 | Time: {fmtTime(elapsed)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
