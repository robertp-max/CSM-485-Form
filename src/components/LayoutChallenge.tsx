import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { AlertTriangle, GripVertical, Trophy, RotateCcw, Eye, ArrowLeft } from 'lucide-react'

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
export default function LayoutChallenge({ theme, onComplete, onBack, inline }: LayoutChallengeProps) {
  const p = palette(theme)
  const isNight = theme === 'night'

  // placements: zone-box → chip-id
  const [placements, setPlacements] = useState<Record<string, string>>({})
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [validation, setValidation] = useState<Record<string, 'correct' | 'incorrect'> | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [score, setScore] = useState(100)
  const startRef = useRef(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [shuffled] = useState(() => shuffle(FORM_PARTS))
  const [blurred, setBlurred] = useState(false)

  // Bank chips = those not placed
  const placedChipIds = useMemo(() => new Set(Object.values(placements)), [placements])
  const bankChips = useMemo(() => shuffled.filter((c) => !placedChipIds.has(c.id)), [shuffled, placedChipIds])

  // Timer + score penalty
  useEffect(() => {
    if (isComplete) return
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
  }, [isComplete])

  // Anti-cheat blur
  useEffect(() => {
    if (isComplete) return
    const onBlur = () => setBlurred(true)
    const onFocus = () => setBlurred(false)
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
    }
  }, [isComplete])

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
      if (isComplete) return
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
    [isComplete],
  )

  const onDropBank = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(null)
      if (isComplete) return
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
    [isComplete],
  )

  /* ── Check Answers ────────────────────────────────────────── */
  const checkAnswers = useCallback(() => {
    if (isComplete) return
    const result: Record<string, 'correct' | 'incorrect'> = {}
    let correct = 0
    for (const zone of ZONES) {
      const chipId = placements[zone.box]
      if (chipId) {
        const part = FORM_PARTS.find((fp) => fp.id === chipId)
        if (part && part.box === zone.box) {
          result[zone.box] = 'correct'
          correct++
        } else {
          result[zone.box] = 'incorrect'
        }
      }
    }
    setValidation(result)
    if (correct === FORM_PARTS.length) {
      setIsComplete(true)
      onComplete?.(score, correct, FORM_PARTS.length)
    }
  }, [placements, isComplete, score, onComplete])

  const showKey = useCallback(() => {
    setIsComplete(true)
    setScore(0)
    const auto: Record<string, string> = {}
    for (const part of FORM_PARTS) auto[part.box] = part.id
    setPlacements(auto)
    const result: Record<string, 'correct' | 'incorrect'> = {}
    ZONES.forEach((z) => (result[z.box] = 'correct'))
    setValidation(result)
  }, [])

  const handleReset = useCallback(() => {
    setPlacements({})
    setValidation(null)
    setIsComplete(false)
    setScore(100)
    startRef.current = Date.now()
    setElapsed(0)
  }, [])

  /* ── Chip renderer ────────────────────────────────────────── */
  const renderChip = (part: FormPart, inZone = false) => (
    <div
      key={part.id}
      draggable={!isComplete}
      onDragStart={(e) => onDragStart(e, part.id)}
      style={{
        background: inZone ? 'transparent' : p.chipBg,
        borderColor: inZone ? 'transparent' : p.chipBorder,
        color: inZone ? p.text : p.chipText,
        cursor: isComplete ? 'default' : 'grab',
        fontSize: inZone ? 10 : 12,
        fontWeight: inZone ? 700 : 500,
        textTransform: inZone ? 'uppercase' : undefined,
        textAlign: inZone ? 'center' : 'left',
      }}
      className={`flex items-center gap-2 rounded-md border px-3 py-2 select-none transition-transform ${
        isComplete ? '' : 'active:scale-[0.97]'
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
        style={{ background: bg, borderColor: border, minHeight: 60, padding: '20px 8px 8px' }}
        onDragOver={(e) => onDragOverZone(e, box)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDropZone(e, box)}
      >
        <span
          className="absolute top-1 left-1.5 text-[10px] font-bold pointer-events-none"
          style={{ color: p.textDim }}
        >
          {label}
        </span>
        {part ? (
          renderChip(part, true)
        ) : (
          <span className="text-[10px] italic" style={{ color: p.textDim }}>
            Drop here
          </span>
        )}
      </div>
    )
  }

  const scoreColor = score > 40 ? p.accent : score > 0 ? p.accent2 : '#ef4444'
  const timerColor = elapsed > 180 ? '#ef4444' : elapsed > 120 ? p.accent2 : p.text

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative" style={inline ? { color: p.text } : { background: p.bg, color: p.text }}>
      {/* Anti-cheat overlay */}
      {blurred && !isComplete && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: isNight ? 'rgba(1,8,9,0.98)' : 'rgba(255,255,255,0.98)', backdropFilter: 'blur(10px)' }}
        >
          <AlertTriangle className="w-16 h-16 mb-4" style={{ color: p.accent2 }} />
          <h2 className="text-2xl font-bold font-heading" style={{ color: p.text }}>Assessment Paused</h2>
          <p className="mt-2" style={{ color: p.textMuted }}>Click back into this window to resume.</p>
        </div>
      )}

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
                onClick={checkAnswers}
                className="px-4 py-2 rounded-lg text-sm font-heading font-bold transition-all hover:-translate-y-0.5 text-white"
                style={{ background: p.accentDim, boxShadow: `0 4px 12px ${p.accentDim}66` }}
              >
                CHECK
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-lg transition-colors hover:opacity-80"
                style={{ color: p.textDim }}
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
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
              onClick={checkAnswers}
              className="px-3 py-1.5 rounded-lg text-xs font-heading font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: p.accentDim }}
            >
              CHECK
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg hover:opacity-80"
              style={{ color: p.textDim }}
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Parts Bank */}
        <div
          className="w-full lg:w-[300px] xl:w-[340px] border-r flex flex-col flex-shrink-0"
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
            className="p-3 flex-1 overflow-y-auto flex flex-col gap-2"
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
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-start justify-center" style={{ background: isNight ? '#020C0D' : '#F3F4F6' }}>
          <div
            className="w-full max-w-4xl border-y-[6px] shadow-md"
            style={{ background: p.formBg, borderColor: isNight ? p.accentDim : '#2C3E50' }}
          >
            {/* Row 1: 5 equal columns */}
            <div className="grid grid-cols-5" style={{ borderBottom: `1px solid ${p.cardBorder}` }}>
              {['1', '2', '3', '4', '5'].map((b, i) => (
                <div key={b} style={{ borderRight: i < 4 ? `1px solid ${p.cardBorder}` : undefined }}>
                  {renderZone(b, `Box ${b}`)}
                </div>
              ))}
            </div>

            {/* Row 2: Full-width Box 6 */}
            <div style={{ borderBottom: `1px solid ${p.cardBorder}` }}>
              {renderZone('6', 'Box 6', 'min-h-[60px]')}
            </div>

            {/* Row 3: 60/40 split — Box 11, 12 */}
            <div className="flex" style={{ borderBottom: `1px solid ${p.cardBorder}` }}>
              <div className="w-[60%]" style={{ borderRight: `1px solid ${p.cardBorder}` }}>
                {renderZone('11', 'Box 11', 'min-h-[70px]')}
              </div>
              <div className="w-[40%]">{renderZone('12', 'Box 12', 'min-h-[70px]')}</div>
            </div>

            {/* Row 4: 30/40/30 — Box 14, 15, 16 */}
            <div className="flex" style={{ borderBottom: `1px solid ${p.cardBorder}` }}>
              <div className="w-[30%]" style={{ borderRight: `1px solid ${p.cardBorder}` }}>
                {renderZone('14', 'Box 14', 'min-h-[70px]')}
              </div>
              <div className="w-[40%]" style={{ borderRight: `1px solid ${p.cardBorder}` }}>
                {renderZone('15', 'Box 15', 'min-h-[70px]')}
              </div>
              <div className="w-[30%]">{renderZone('16', 'Box 16', 'min-h-[70px]')}</div>
            </div>

            {/* Row 5: Full-width Box 18 */}
            <div style={{ borderBottom: `1px solid ${p.cardBorder}` }}>
              {renderZone('18', 'Box 18', 'min-h-[80px]')}
            </div>

            {/* Row 6: 60/40 — Box 21, 22 */}
            <div className="flex" style={{ borderBottom: `1px solid ${p.cardBorder}` }}>
              <div className="w-[60%]" style={{ borderRight: `1px solid ${p.cardBorder}` }}>
                {renderZone('21', 'Box 21', 'min-h-[80px]')}
              </div>
              <div className="w-[40%]">{renderZone('22', 'Box 22', 'min-h-[80px]')}</div>
            </div>

            {/* Row 7: Safety Addendum — thick bottom border */}
            <div style={{ borderBottom: `4px solid ${isNight ? p.accentDim : '#9CA3AF'}` }}>
              {renderZone('safety', 'Safety Addendum', 'min-h-[60px]')}
            </div>

            {/* Row 8: 70/30 — Box 23, 25 */}
            <div className="flex" style={{ borderBottom: `1px solid ${p.cardBorder}` }}>
              <div className="w-[70%]" style={{ borderRight: `1px solid ${p.cardBorder}` }}>
                {renderZone('23', 'Box 23', 'min-h-[60px]')}
              </div>
              <div className="w-[30%]">{renderZone('25', 'Box 25', 'min-h-[60px]')}</div>
            </div>

            {/* Row 9: 50/50 — Box 24, 26 */}
            <div className="flex" style={{ borderBottom: `1px solid ${p.cardBorder}` }}>
              <div className="w-[50%]" style={{ borderRight: `1px solid ${p.cardBorder}` }}>
                {renderZone('24', 'Box 24', 'min-h-[80px]')}
              </div>
              <div className="w-[50%]">{renderZone('26', 'Box 26', 'min-h-[80px]')}</div>
            </div>

            {/* Row 10: 50/50 — Box 27, 28 */}
            <div className="flex">
              <div className="w-[50%]" style={{ borderRight: `1px solid ${p.cardBorder}` }}>
                {renderZone('27', 'Box 27', 'min-h-[80px]')}
              </div>
              <div className="w-[50%]">{renderZone('28', 'Box 28', 'min-h-[80px]')}</div>
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
