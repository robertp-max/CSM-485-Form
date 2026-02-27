import { useCallback, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ChevronRight,
  FileText,
  Heart,
  Home,
  Info,
  LayoutTemplate,
  Pointer,
  Presentation,
  Shield,
  ShieldAlert,
  Star,
  Trophy,
  X,
  Zap,
} from 'lucide-react'
import { AUDIT_CASES } from '../data/clinicalAuditCases'
import type { AuditCase, CaseBox, CaseChip } from '../data/clinicalAuditCases'

// ─── Palette ──────────────────────────────────────────────────────
interface Palette {
  bg: string; bgAlt: string; bgDeep: string; card: string; cardBorder: string
  text: string; textMuted: string; textDim: string
  accent: string; accentDim: string; accent2: string; accent2Light: string
  formBg: string; formHeaderBg: string
  correctBg: string; incorrectBg: string
  chipBg: string; chipBorder: string; chipText: string
  sidebarBg: string; challengeBg: string; coverBg: string
  scrollTrack: string; scrollThumb: string; scrollHover: string
  logoUrl: string
}

const NIGHT: Palette = {
  bg: '#010809', bgAlt: '#0A1214', bgDeep: '#031213', card: '#0D1518', cardBorder: '#1E3A3B',
  text: '#FAFBF8', textMuted: '#94A3B8', textDim: '#475569',
  accent: '#64F4F5', accentDim: '#007970', accent2: '#C74601', accent2Light: '#FFB27F',
  formBg: '#0D1518', formHeaderBg: '#004142',
  correctBg: 'rgba(0,121,112,0.15)', incorrectBg: 'rgba(215,1,1,0.15)',
  chipBg: '#0A1214', chipBorder: '#1E3A3B', chipText: '#94A3B8',
  sidebarBg: '#060D0E', challengeBg: 'radial-gradient(circle at top right, #002B2C 0%, #010809 100%)',
  coverBg: 'radial-gradient(circle at top right, #001A1A 0%, #010809 100%)',
  scrollTrack: '#0A1214', scrollThumb: '#1E3A3B', scrollHover: '#2A4A4B',
  logoUrl: '/branding/CI_Logo_Horizontal_White.png',
}

const LIGHT: Palette = {
  bg: '#FAFBF8', bgAlt: '#F2F0EF', bgDeep: '#E5E4E3', card: '#FFFFFF', cardBorder: '#D9D6D5',
  text: '#1F1C1B', textMuted: '#524048', textDim: '#B8B4B2',
  accent: '#007970', accentDim: '#009688', accent2: '#C74601', accent2Light: '#E65D1A',
  formBg: '#FFFFFF', formHeaderBg: '#007970',
  correctBg: 'rgba(0,121,112,0.08)', incorrectBg: 'rgba(215,1,1,0.08)',
  chipBg: '#FFFFFF', chipBorder: '#D9D6D5', chipText: '#524048',
  sidebarBg: '#F7F6F5', challengeBg: 'rgba(229,228,227,0.4)',
  coverBg: 'linear-gradient(to bottom right, #E5FEFF, #FAFBF8, #FFEEE5)',
  scrollTrack: '#F2F0EF', scrollThumb: '#D9D6D5', scrollHover: '#B8B4B2',
  logoUrl: '/branding/CareIndeed_Logo.png',
}

// ─── Difficulty accent colours ────────────────────────────────────
const DIFF_COLORS: Record<string, { badge: string; badgeBg: string; border: string }> = {
  easy:   { badge: '#10B981', badgeBg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
  medium: { badge: '#F59E0B', badgeBg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
  hard:   { badge: '#EF4444', badgeBg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' },
}

// ─── Sub-components ───────────────────────────────────────────────
function ExpandableCard({ title, content, defaultOpen = false, p }: { title: string; content: string; defaultOpen?: boolean; p: Palette }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="rounded-[12px] border shadow-sm overflow-hidden transition-all duration-300" style={{ background: p.bgAlt, borderColor: p.cardBorder }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 transition-colors focus:outline-none hover:opacity-90"
        style={{ background: p.bgAlt }}
      >
        <h4 className="font-heading font-bold text-sm flex items-center gap-2" style={{ color: p.accent }}>
          <BookOpen className="w-4 h-4" /> {title}
        </h4>
        <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} style={{ color: p.textDim }} />
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-4 border-t text-sm leading-relaxed font-light" style={{ borderColor: p.cardBorder, background: p.bg, color: p.textMuted }}>
          {content}
        </div>
      </div>
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────
type Props = { theme?: 'night' | 'day'; onExit?: () => void }
type Phase = 'cover' | 'case' | 'results'
type CaseResult = { caseId: string; correct: string[]; incorrect: string[]; safetyViolation: boolean; score: number }

// ─── Helpers ──────────────────────────────────────────────────────
/** Extracts the CMS-485 form position from a box ID, e.g. `j-box-11` → `11`, `r-box-priority` → `priority` */
const positionOf = (boxId: string) => {
  const i = boxId.lastIndexOf('-')
  return i >= 0 ? boxId.slice(i + 1) : boxId
}

/* ═══════════════════════════════════════════════════════════════════
   FINAL EXAM WEB — Clinical Audit Simulator
   Modelled after the Henderson tab in Interactive CMS-485 Form
   ═══════════════════════════════════════════════════════════════════ */
export default function FinalExamWeb({ theme = 'night', onExit }: Props) {
  const p = theme === 'night' ? NIGHT : LIGHT
  const isNight = theme === 'night'

  // ── Phase & case ────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('cover')
  const [caseIndex, setCaseIndex] = useState(0)

  // ── Challenge state ─────────────────────────────────────────────
  const [placements, setPlacements] = useState<Record<string, string>>({})
  const [activeField, setActiveField] = useState<string | null>(null)
  const [tooltipBox, setTooltipBox] = useState<string | null>(null)
  const [submissionResult, setSubmissionResult] = useState<{ correct: string[]; incorrect: string[]; safetyViolation: boolean } | null>(null)
  const [caseResults, setCaseResults] = useState<CaseResult[]>([])

  const optionsRef = useRef<HTMLDivElement>(null)
  const currentCase: AuditCase = AUDIT_CASES[caseIndex]
  const diffColors = DIFF_COLORS[currentCase.difficulty] ?? DIFF_COLORS.easy

  // ── Sidebar sections (derived from flat narrative / orders) ─────
  const sections = useMemo(() => [
    { title: 'Clinical Evaluation', content: currentCase.narrative },
    { title: 'Physician Coordination', content: currentCase.physicianOrders },
  ], [currentCase])

  // ── Options for the currently-active field (randomised) ─────────
  const currentOptions = useMemo(() => {
    if (!activeField) return []
    return [...currentCase.chips.filter((c: CaseChip) => c.boxTarget === activeField)].sort(() => Math.random() - 0.5)
  }, [activeField, currentCase.chips])

  const allBoxesFilled = currentCase.boxes.every((b: CaseBox) => placements[b.id])
  const totalScore = caseResults.reduce((s, r) => s + r.score, 0)
  const maxScore = AUDIT_CASES.reduce((s, c) => s + c.points, 0)
  const passThreshold = Math.round(maxScore * 0.8)

  /** Find the case-box whose form position matches (11, 15, 18, 21, 24/priority) */
  const boxFor = (pos: string): CaseBox | undefined => {
    const direct = currentCase.boxes.find((b: CaseBox) => positionOf(b.id) === pos)
    if (direct) return direct
    if (pos === '24') return currentCase.boxes.find((b: CaseBox) => positionOf(b.id) === 'priority')
    return undefined
  }

  // ── Handlers ────────────────────────────────────────────────────
  const handleBoxClick = (boxId: string) => {
    if (submissionResult) return
    setActiveField(boxId)
    setTimeout(() => optionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }

  const handleOptionSelect = (chipId: string) => {
    if (!activeField) return
    setPlacements(prev => ({ ...prev, [activeField]: chipId }))
    setActiveField(null)
  }

  const removeChip = useCallback((e: React.MouseEvent, boxId: string) => {
    e.stopPropagation()
    if (submissionResult) return
    setPlacements(prev => { const n = { ...prev }; delete n[boxId]; return n })
    if (activeField === boxId) setActiveField(null)
  }, [submissionResult, activeField])

  const handleValidate = useCallback(() => {
    const correct: string[] = []
    const incorrect: string[] = []
    let safetyViolation = false

    currentCase.boxes.forEach((box: CaseBox) => {
      if (placements[box.id] === box.correctChipId) {
        correct.push(box.id)
      } else {
        incorrect.push(box.id)
        const chip = currentCase.chips.find((c: CaseChip) => c.id === placements[box.id])
        if (chip?.category === 'safety' && !chip.isCorrect) safetyViolation = true
        if (positionOf(box.id) === 'priority' && placements[box.id] !== box.correctChipId) safetyViolation = true
      }
    })

    const score = safetyViolation ? 0 : Math.round((correct.length / currentCase.boxes.length) * currentCase.points)
    setSubmissionResult({ correct, incorrect, safetyViolation })
    setActiveField(null)
    setCaseResults(prev => [...prev, { caseId: currentCase.id, correct, incorrect, safetyViolation, score }])
  }, [currentCase, placements])

  const handleReset = useCallback(() => {
    setPlacements({})
    setSubmissionResult(null)
    setActiveField(null)
    setTooltipBox(null)
  }, [])

  const advanceToNext = useCallback(() => {
    if (caseIndex < AUDIT_CASES.length - 1) {
      setCaseIndex(i => i + 1)
      handleReset()
    } else {
      setPhase('results')
    }
  }, [caseIndex, handleReset])

  const handleFullReset = useCallback(() => {
    setPhase('cover')
    setCaseIndex(0)
    handleReset()
    setCaseResults([])
  }, [handleReset])

  // ── Dynamic CSS (fonts, scrollbar, keyframes) ───────────────────
  const dynamicCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&family=Roboto:wght@300;400;500;700&display=swap');
    .font-heading { font-family: 'Montserrat', sans-serif; }
    .font-body   { font-family: 'Roboto', sans-serif; }
    .fe-root ::-webkit-scrollbar { width: 8px; }
    .fe-root ::-webkit-scrollbar-track { background: ${p.scrollTrack}; }
    .fe-root ::-webkit-scrollbar-thumb { background: ${p.scrollThumb}; border-radius: 4px; }
    .fe-root ::-webkit-scrollbar-thumb:hover { background: ${p.scrollHover}; }
    @keyframes feSlideUp {
      from { opacity: 0; transform: translateY(15px); }
      to   { opacity: 1; transform: translateY(0);   }
    }
    .fe-slide-up { animation: feSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `

  // ── CMS-485 FORM RENDERER ──────────────────────────────────────
  const renderForm = () => {
    const labelColor = p.accent
    const rowBg = p.bg

    const FocusHint = () => (
      <div className="text-xs mt-1 italic" style={{ color: p.cardBorder }}>[Focus on highlighted fields]</div>
    )

    /** Renders a clickable interactive field mapped to a CMS-485 position */
    const renderInteractiveField = (pos: string, heightClass = 'min-h-[60px]') => {
      const box = boxFor(pos)
      if (!box) return <FocusHint />

      const chipId = placements[box.id]
      const chip = chipId ? currentCase.chips.find((c: CaseChip) => c.id === chipId) : null
      const isCorrect = submissionResult?.correct.includes(box.id)
      const isIncorrect = submissionResult?.incorrect.includes(box.id)
      const isActive = activeField === box.id

      // Remediation text for incorrect answers
      const remediation = isIncorrect && chip
        ? box.remediation?.find(r => chip.label.includes(r.wrongLabel.split(' — ')[0]?.trim() ?? '') || chip.label.includes(r.wrongLabel.split('—')[0]?.trim() ?? ''))
          ?? box.remediation?.[0]
        : null

      return (
        <div
          className={`w-full h-full p-2 transition-all relative flex flex-col cursor-pointer group ${heightClass}`}
          style={{
            background: isCorrect ? p.correctBg : isIncorrect ? p.incorrectBg : isActive ? (isNight ? 'rgba(0,65,66,0.5)' : 'rgba(0,121,112,0.05)') : p.bg,
            border: isActive ? `2px solid ${p.accent}` : `1px solid ${p.cardBorder}`,
            margin: isActive ? '-2px' : '2px',
            borderRadius: isActive ? undefined : '8px',
            zIndex: isActive ? 10 : undefined,
            boxShadow: isActive ? `0 0 0 3px ${isNight ? 'rgba(100,244,245,0.3)' : 'rgba(0,121,112,0.2)'}` : undefined,
          }}
          onClick={() => handleBoxClick(box.id)}
        >
          {/* Label + info */}
          <div className="flex justify-between items-start mb-1 z-10">
            <span className="text-[10px] font-bold" style={{ color: isActive ? p.accent : p.accent2 }}>
              {box.label}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setTooltipBox(tooltipBox === box.id ? null : box.id) }}
              className="opacity-0 group-hover:opacity-100 rounded p-0.5 transition-opacity"
              style={{ color: p.accent }}
              title="Clinical Logic"
            >
              <Info className="h-3 w-3" />
            </button>
          </div>

          {/* Chip or placeholder */}
          <div className="flex-1 flex flex-col justify-center">
            {chip ? (
              <div
                className="flex items-center justify-between rounded-md px-2 py-1.5 border text-xs shadow-sm mt-1 z-10"
                style={{
                  background: isCorrect ? p.accentDim : isIncorrect ? '#D70101' : p.chipBg,
                  borderColor: isCorrect ? p.cardBorder : isIncorrect ? '#8e2f2f' : p.chipBorder,
                  color: isCorrect || isIncorrect ? '#fff' : p.chipText,
                  fontWeight: 500,
                }}
              >
                <span className="truncate mr-2">{chip.label}</span>
                {!submissionResult && (
                  <button onClick={(e) => removeChip(e, box.id)} className="hover:opacity-70 flex-shrink-0" style={{ color: isNight ? '#fff' : p.text }}>
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ) : (
              <div className="text-[10px] text-center italic transition-colors" style={{ color: isActive ? p.accent : p.cardBorder, fontWeight: isActive ? 700 : 400 }}>
                {isActive ? 'Select an answer from the bank below' : 'Click to select answer'}
              </div>
            )}
          </div>

          {/* Tooltip */}
          {tooltipBox === box.id && (
            <div
              className="absolute top-0 right-0 mt-6 mr-2 w-64 text-xs p-3 rounded-lg shadow-2xl z-50 border"
              style={{ background: isNight ? '#031213' : '#1F1C1B', color: '#fff', borderColor: p.cardBorder }}
            >
              <strong className="block mb-1" style={{ color: p.accent2 }}>CareIndeed Clinical Tip:</strong>
              {box.tooltipWhy}
            </div>
          )}

          {/* Remediation overlay */}
          {isIncorrect && remediation && (
            <div
              className="absolute top-full left-0 w-full mt-1 p-2 rounded-md text-[10px] z-40 shadow-lg fe-slide-up"
              style={{
                background: isNight ? 'rgba(215,1,1,0.2)' : '#FBE6E6',
                border: '1px solid #D70101',
                color: isNight ? p.accent2Light : '#421700',
                backdropFilter: isNight ? 'blur(8px)' : undefined,
              }}
            >
              <strong style={{ color: isNight ? '#fff' : '#D70101' }}>Review:</strong> {remediation.wrongExplanation}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="max-w-4xl mx-auto w-full border-2 shadow-2xl font-body relative mb-12 overflow-hidden" style={{ background: p.formBg, borderColor: p.cardBorder, color: p.text }}>
        {/* ── Header ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between p-3 font-bold border-b" style={{ background: p.formHeaderBg, borderColor: p.cardBorder, color: '#fff' }}>
          <span className="text-sm md:text-base tracking-wide uppercase">Home Health Certification and Plan of Care</span>
          <span className="text-xs md:text-sm" style={{ color: isNight ? '#64F4F5' : '#C4F4F5' }}>Form CMS-485</span>
        </div>

        {/* ── Row 1 ──────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 border-b" style={{ borderColor: p.cardBorder, background: rowBg }}>
          {[
            { num: '1', label: 'Patient HI #' },
            { num: '2', label: 'SOC Date' },
            { num: '3', label: 'Cert Period' },
            { num: '4', label: 'Medical Rec #' },
            { num: '5', label: 'Provider #' },
          ].map((f, i) => (
            <div key={f.num} className={`p-1.5 ${i < 4 ? 'border-r' : ''}`} style={{ borderColor: p.cardBorder }}>
              <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>{f.num}. {f.label}</span>
              <FocusHint />
            </div>
          ))}
        </div>

        {/* ── Row 2 — Patient Name ───────────────── */}
        <div className="border-b p-2" style={{ borderColor: p.cardBorder, background: rowBg }}>
          <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>6. Patient Name, Address, DOB</span>
          <div className="text-xs mt-1 font-medium" style={{ color: p.textMuted }}>
            {currentCase.patientName}, Age {currentCase.age}
          </div>
        </div>

        {/* ── Row 3 — Diagnoses ──────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-b" style={{ borderColor: p.cardBorder, background: rowBg }}>
          <div className="border-r border-b sm:border-b-0 p-2 min-h-[80px]" style={{ borderColor: p.cardBorder }}>
            {renderInteractiveField('11')}
          </div>
          <div className="p-2 min-h-[80px]">
            <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>12. Other Pertinent DX</span>
            <FocusHint />
          </div>
        </div>

        {/* ── Row 4 — Functional Limits ──────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b" style={{ borderColor: p.cardBorder, background: rowBg }}>
          <div className="border-r border-b sm:border-b-0 p-2 min-h-[70px]" style={{ borderColor: p.cardBorder }}>
            <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>14. DME / Supplies</span>
            <FocusHint />
          </div>
          <div className="border-r border-b sm:border-b-0 p-2 min-h-[70px]" style={{ borderColor: p.cardBorder }}>
            {renderInteractiveField('15')}
          </div>
          <div className="p-2 min-h-[70px]">
            <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>16. Mental Status</span>
            <FocusHint />
          </div>
        </div>

        {/* ── Row 5 — Orders ─────────────────────── */}
        <div className="border-b p-2 min-h-[100px]" style={{ borderColor: p.cardBorder, background: rowBg }}>
          {renderInteractiveField('18', 'min-h-[100px]')}
        </div>

        {/* ── Row 6 — Goals & Frequency ──────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-b" style={{ borderColor: p.cardBorder, background: rowBg }}>
          <div className="border-r border-b sm:border-b-0 p-2 min-h-[80px]" style={{ borderColor: p.cardBorder }}>
            {renderInteractiveField('21')}
          </div>
          <div className="p-2 min-h-[80px]">
            <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>22. Goals / Rehab Potential</span>
            <FocusHint />
          </div>
        </div>

        {/* ── Row 7 — Safety / Priority ──────────── */}
        <div className="border-b p-2 min-h-[80px]" style={{ borderColor: p.cardBorder, background: rowBg }}>
          {renderInteractiveField('24', 'min-h-[80px]')}
        </div>

        {/* ── Footer ─────────────────────────────── */}
        <div className="grid grid-cols-2 p-2 text-[10px] border-t" style={{ background: p.bgDeep, color: isNight ? p.accent : p.textDim, borderColor: p.cardBorder }}>
          <div>26. Signature of Physician: ______________________</div>
          <div className="text-right">Date: __/__/____</div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="fe-root flex flex-col h-screen w-full font-body overflow-hidden" style={{ background: p.bg, color: p.text }}>
      <style>{dynamicCSS}</style>

      {/* ═══════════════════════════════════════════
          PHASE: COVER
          ═══════════════════════════════════════════ */}
      {phase === 'cover' && (
        <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center fe-slide-up p-6" style={{ background: p.coverBg }}>
          <div className="text-center max-w-3xl relative z-10">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 mb-8"
              style={{ borderColor: `${p.accent2}66`, background: `${p.accent2}15`, color: p.accent2Light }}
            >
              <Shield className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Final Assessment · Web Only</span>
            </div>

            <Presentation className="w-24 h-24 mx-auto mb-8" style={{ color: isNight ? p.accentDim : '#D9D6D5' }} />

            <h2 className="font-heading text-5xl md:text-6xl font-black mb-4 leading-[0.95]" style={{ color: p.text }}>
              Clinical Audit
              <br />
              <span style={{ color: p.accent }}>Simulator</span>
            </h2>

            <p className="text-lg leading-relaxed mb-3 font-light" style={{ color: p.textMuted }}>
              Three progressive patient cases. CMS-485 form challenges. Trap logic, remediation feedback, and safety-violation scoring.
            </p>
            <p className="text-sm mb-10 font-light" style={{ color: p.textDim }}>
              Complete all three clinical audits to earn your certification. Pass threshold: {passThreshold}/{maxScore} points.
            </p>

            {/* Case Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 text-left">
              {AUDIT_CASES.map((c: AuditCase, i: number) => {
                const dc = DIFF_COLORS[c.difficulty] ?? DIFF_COLORS.easy
                return (
                  <div key={c.id} className="rounded-[16px] border p-5 transition-all shadow-lg" style={{ background: p.card, borderColor: dc.border }}>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full"
                        style={{ color: dc.badge, background: dc.badgeBg }}
                      >
                        Case {i + 1} · {c.difficultyLabel}
                      </span>
                      <span className="text-xs font-bold" style={{ color: dc.badge }}>{c.points} pts</span>
                    </div>
                    <h3 className="font-heading text-base font-bold mb-1" style={{ color: p.text }}>{c.patientName}, {c.age}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: p.textMuted }}>{c.summary}</p>
                  </div>
                )
              })}
            </div>

            {/* Scoring Rules */}
            <div className="rounded-[16px] border p-6 max-w-2xl mx-auto mb-10 text-left" style={{ background: p.card, borderColor: p.cardBorder }}>
              <h3 className="font-heading text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: p.accent2 }}>
                <Zap className="h-4 w-4" /> Scoring Rules
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: p.textMuted }}>
                <li className="flex items-start gap-2"><Star className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#10B981' }} /><span><strong style={{ color: p.text }}>Easy:</strong> 10 points · One math trap, one coding trap</span></li>
                <li className="flex items-start gap-2"><Star className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#F59E0B' }} /><span><strong style={{ color: p.text }}>Medium:</strong> 25 points · Two math traps, one emergency trigger</span></li>
                <li className="flex items-start gap-2"><Star className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#EF4444' }} /><span><strong style={{ color: p.text }}>Audit Master:</strong> 50 points · The full Henderson Gauntlet</span></li>
                <li className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: p.accent2 }} /><span><strong style={{ color: p.text }}>Safety Violation</strong> = all points forfeited for that case</span></li>
                <li className="flex items-start gap-2"><Trophy className="h-4 w-4 mt-0.5 shrink-0" style={{ color: p.accentDim }} /><span><strong style={{ color: p.text }}>Passing:</strong> {passThreshold}/{maxScore} points ({Math.round((passThreshold / maxScore) * 100)}%)</span></li>
              </ul>
            </div>

            <button
              onClick={() => setPhase('case')}
              className="px-10 py-4 rounded-[12px] text-white font-bold uppercase tracking-widest text-sm shadow-xl transition-all hover:-translate-y-0.5"
              style={{ background: p.accentDim, boxShadow: `0 8px 24px -6px ${p.accentDim}66` }}
            >
              Begin Clinical Audit
            </button>
          </div>
        </main>
      )}

      {/* ═══════════════════════════════════════════
          PHASE: RESULTS
          ═══════════════════════════════════════════ */}
      {phase === 'results' && (
        <main className="flex-1 overflow-y-auto fe-slide-up p-6" style={{ background: p.coverBg }}>
          <div className="max-w-3xl mx-auto py-12">
            <div className="text-center mb-12">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6"
                style={{ background: totalScore >= passThreshold ? `${p.accentDim}33` : `${p.accent2}33`, color: totalScore >= passThreshold ? p.accent : p.accent2 }}
              >
                <Trophy className="h-10 w-10" />
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-black mb-3" style={{ color: p.text }}>
                {totalScore >= passThreshold ? 'Audit Certification Complete' : 'Audit Review Required'}
              </h1>
              <p className="text-xl" style={{ color: p.textMuted }}>
                Final Score: <strong style={{ color: p.text }}>{totalScore}</strong> / {maxScore}
                {totalScore >= passThreshold ? ' — Passed' : ` — Need ${passThreshold} to pass`}
              </p>
            </div>

            {/* Per-case results */}
            <div className="space-y-4 mb-10">
              {AUDIT_CASES.map((c: AuditCase, i: number) => {
                const result = caseResults[i]
                if (!result) return null
                const dc = DIFF_COLORS[c.difficulty] ?? DIFF_COLORS.easy
                return (
                  <div key={c.id} className="rounded-[16px] border p-5" style={{ background: p.card, borderColor: p.cardBorder }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full" style={{ color: dc.badge, background: dc.badgeBg }}>
                          {c.difficultyLabel}
                        </span>
                        <h3 className="font-heading text-lg font-bold" style={{ color: p.text }}>{c.patientName}</h3>
                      </div>
                      <span className="font-heading text-2xl font-black" style={{ color: result.score === c.points ? p.accent : p.accent2 }}>
                        {result.score}/{c.points}
                      </span>
                    </div>
                    {result.safetyViolation && (
                      <p className="text-sm font-semibold flex items-center gap-2 mt-1" style={{ color: p.accent2 }}>
                        <AlertTriangle className="h-4 w-4" />
                        Safety Violation — all points forfeited for this case
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs" style={{ color: p.textMuted }}>{result.correct.length}/{c.boxes.length} correct</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleFullReset}
                className="rounded-[12px] border-2 px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all hover:opacity-80"
                style={{ borderColor: p.cardBorder, color: p.text }}
              >
                Retake Full Exam
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="rounded-[12px] px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5"
                  style={{ background: p.accentDim }}
                >
                  Return to Training
                </button>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ═══════════════════════════════════════════
          PHASE: CASE
          ═══════════════════════════════════════════ */}
      {phase === 'case' && (
        <>
          {/* ── Top Navbar ──────────────────────────── */}
          <header className="border-b px-6 pt-4 pb-3 flex-shrink-0 z-20 relative" style={{ background: isNight ? p.bg : p.card, borderColor: p.cardBorder }}>
            <div className="flex justify-between items-center max-w-[1800px] mx-auto w-full">
              <div>
                <h1 className="font-heading font-bold text-xl md:text-2xl leading-tight" style={{ color: p.text }}>
                  CMS-485 Clinical Audit
                </h1>
                <p className="text-xs md:text-sm mt-1 flex items-center gap-2 flex-wrap" style={{ color: isNight ? p.accentDim : p.textDim }}>
                  Case {caseIndex + 1} of {AUDIT_CASES.length}
                  <span style={{ color: p.cardBorder }}>|</span>
                  <span
                    className="font-bold px-2 py-0.5 rounded-full text-[10px]"
                    style={{ color: diffColors.badge, background: diffColors.badgeBg }}
                  >
                    {currentCase.difficultyLabel}
                  </span>
                  <span style={{ color: p.cardBorder }}>|</span>
                  <span style={{ color: p.textMuted }}>{currentCase.points} points</span>
                  {caseResults.length > 0 && (
                    <>
                      <span style={{ color: p.cardBorder }}>|</span>
                      <span style={{ color: p.accent }}>Running: {totalScore} pts</span>
                    </>
                  )}
                </p>
              </div>
              <img className="h-8 md:h-10 w-auto object-contain hidden sm:block opacity-90" src={p.logoUrl} alt="CareIndeed Logo" />
            </div>

            {/* Progress bar */}
            <div className="max-w-[1800px] mx-auto w-full mt-3 flex items-center gap-3">
              {AUDIT_CASES.map((c: AuditCase, i: number) => (
                <div key={c.id} className="flex items-center gap-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: i === caseIndex ? '80px' : '40px',
                      background: i < caseIndex ? p.accentDim : i === caseIndex ? p.accent2 : p.cardBorder,
                      opacity: i > caseIndex ? 0.3 : 1,
                    }}
                  />
                  <span className="text-[9px] font-bold uppercase" style={{ color: i === caseIndex ? p.accent2 : p.textDim }}>
                    {c.patientName.split(' ').pop()}
                  </span>
                </div>
              ))}
            </div>
          </header>

          {/* ── Case Content ────────────────────────── */}
          <div className="flex-1 flex flex-col fe-slide-up h-full overflow-hidden relative" style={{ background: p.challengeBg }}>
            {/* Decorative glow */}
            {isNight && (
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C74601] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.15] animate-pulse pointer-events-none" />
            )}

            {/* Case subtitle banner */}
            <div className="px-6 py-2 flex items-center justify-center gap-3 z-20 flex-shrink-0 border-b" style={{ background: isNight ? p.bgDeep : '#fff', borderColor: p.cardBorder }}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: diffColors.badge }}>
                {currentCase.difficultyLabel}
              </span>
              <span style={{ color: p.cardBorder }}>|</span>
              <span className="text-xs font-medium" style={{ color: p.textMuted }}>{currentCase.summary}</span>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1800px] mx-auto w-full z-10">
              {/* ── LEFT: Clinical Data Sidebar ──────── */}
              <aside
                className="w-full lg:w-[350px] xl:w-[400px] border-r flex flex-col flex-shrink-0 h-[50vh] lg:h-auto shadow-2xl relative"
                style={{ borderColor: p.cardBorder, background: p.sidebarBg }}
              >
                <div className="p-5 md:p-6 space-y-4 border-b flex-shrink-0 z-10" style={{ borderColor: p.cardBorder, background: isNight ? p.bgDeep : p.card }}>
                  <h2 className="font-heading font-bold text-lg flex items-center gap-2" style={{ color: p.text }}>
                    <FileText className="w-5 h-5" style={{ color: p.accent }} /> Clinical Case Data
                  </h2>

                  {/* Vitals Grid */}
                  <div className="rounded-[16px] border p-4 shadow-sm" style={{ background: `${p.accent2}15`, borderColor: `${p.accent2}4d` }}>
                    <h3 className="font-heading font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: p.accent2 }}>
                      <Heart className="h-4 w-4" /> Critical Vitals
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(currentCase.vitals).map(([k, v]) => (
                        <div key={k} className="rounded-lg p-2 border" style={{ background: p.bg, borderColor: `${p.accent2}33` }}>
                          <p className="text-[10px] font-bold uppercase" style={{ color: `${p.accent2}b3` }}>{k}</p>
                          <p className="text-xs font-medium mt-0.5" style={{ color: p.text }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Environmental Risks */}
                  {currentCase.environmentalRisks.length > 0 && (
                    <div className="rounded-[16px] border p-4 shadow-sm" style={{ background: p.bg, borderColor: p.cardBorder }}>
                      <h3 className="font-heading font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: p.accent2 }}>
                        <Home className="h-4 w-4" style={{ color: p.textDim }} /> Environmental Risks
                      </h3>
                      <ul className="space-y-2">
                        {currentCase.environmentalRisks.map((r) => (
                          <li key={r} className="flex items-start gap-2 text-xs" style={{ color: p.textMuted }}>
                            <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: p.accent2 }} />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Expandable Sections */}
                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4" style={{ background: p.sidebarBg }}>
                  {sections.map((s, i) => (
                    <ExpandableCard key={i} title={s.title} content={s.content} defaultOpen={i === 0} p={p} />
                  ))}
                </div>
              </aside>

              {/* ── RIGHT: Form + Answer Bank ────────── */}
              <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col h-[70vh] lg:h-auto scroll-smooth" style={{ background: isNight ? undefined : 'rgba(229,228,227,0.4)' }}>
                {/* Case Header Bar */}
                <div
                  className="max-w-4xl mx-auto w-full mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-[16px] border shadow-xl"
                  style={{ background: isNight ? 'rgba(3,18,19,0.8)' : p.card, borderColor: p.cardBorder, backdropFilter: isNight ? 'blur(12px)' : undefined }}
                >
                  <div>
                    <h2 className="font-heading font-bold text-lg" style={{ color: p.text }}>
                      Case: {currentCase.patientName}
                    </h2>
                    <p className="text-xs" style={{ color: p.textMuted }}>Click on the highlighted fields below to choose an answer.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleValidate}
                      disabled={!allBoxesFilled || !!submissionResult}
                      className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap"
                      style={{
                        background: allBoxesFilled && !submissionResult ? p.accent2 : isNight ? '#002B2C' : '#F2F4F7',
                        color: allBoxesFilled && !submissionResult ? '#fff' : isNight ? p.accentDim : '#B8B4B2',
                        cursor: allBoxesFilled && !submissionResult ? 'pointer' : 'not-allowed',
                        border: allBoxesFilled && !submissionResult ? 'none' : `1px solid ${p.cardBorder}`,
                        boxShadow: allBoxesFilled && !submissionResult ? `0 0 24px -4px ${p.accent2}99` : undefined,
                      }}
                    >
                      Validate Plan
                    </button>
                    {submissionResult && (
                      <button
                        onClick={advanceToNext}
                        className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
                        style={{ background: p.accent, color: isNight ? '#010809' : '#fff', boxShadow: `0 0 24px -4px ${p.accent}99` }}
                      >
                        {caseIndex < AUDIT_CASES.length - 1 ? (
                          <>Next Case <ArrowRight className="h-4 w-4" /></>
                        ) : (
                          <>View Results <Trophy className="h-4 w-4" /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Submission Summary */}
                {submissionResult && (
                  <div
                    className="max-w-4xl mx-auto w-full mb-6 p-4 rounded-[16px] border fe-slide-up text-center"
                    style={{
                      background: submissionResult.incorrect.length === 0 && !submissionResult.safetyViolation ? p.correctBg : p.incorrectBg,
                      borderColor: submissionResult.incorrect.length === 0 && !submissionResult.safetyViolation ? p.accentDim : '#D70101',
                    }}
                  >
                    <h3 className="font-heading text-xl font-bold mb-1" style={{ color: p.text }}>
                      {submissionResult.safetyViolation
                        ? '\u26A0 Safety Violation \u2014 0 Points'
                        : submissionResult.incorrect.length === 0
                          ? `Perfect \u2014 ${currentCase.points} Points!`
                          : `${submissionResult.correct.length}/${currentCase.boxes.length} Correct \u00B7 ${caseResults[caseResults.length - 1]?.score ?? 0} pts`
                      }
                    </h3>
                    {submissionResult.safetyViolation && (
                      <p className="text-sm font-medium" style={{ color: p.accent2 }}>
                        A safety violation was detected. All points for this case are forfeited.
                      </p>
                    )}
                  </div>
                )}

                {/* CMS-485 Form */}
                {renderForm()}

                {/* ── Answer Bank ─────────────────────── */}
                <div ref={optionsRef} className="max-w-4xl mx-auto w-full mb-20 scroll-mt-6">
                  {!activeField ? (
                    <div
                      className="border-2 border-dashed rounded-[24px] p-10 text-center flex flex-col items-center justify-center"
                      style={{ background: isNight ? 'rgba(3,18,19,0.6)' : 'rgba(255,255,255,0.6)', borderColor: p.cardBorder }}
                    >
                      <Pointer className="w-10 h-10 mb-3" style={{ color: p.cardBorder }} />
                      <h3 className="font-heading font-bold text-lg" style={{ color: isNight ? p.accent : p.textDim }}>Answer Bank is Hidden</h3>
                      <p className="text-sm mt-1" style={{ color: isNight ? p.accentDim : p.textMuted }}>Click on any highlighted box in the CMS-485 form above to view its options.</p>
                    </div>
                  ) : (
                    <div
                      className="rounded-[24px] border p-6 md:p-8 shadow-xl fe-slide-up relative"
                      style={{ background: isNight ? p.bgDeep : p.card, borderColor: p.accentDim }}
                    >
                      <button
                        onClick={() => setActiveField(null)}
                        className="absolute top-6 right-6 p-1.5 rounded-full transition-colors"
                        style={{ color: p.accent, background: isNight ? '#002B2C' : '#F2F4F7' }}
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="mb-6 border-b pb-4 pr-10" style={{ borderColor: p.cardBorder }}>
                        <h3 className="font-heading text-xl font-bold flex items-center gap-2" style={{ color: p.text }}>
                          <LayoutTemplate className="h-6 w-6" style={{ color: p.accentDim }} />
                          {currentCase.boxes.find((b: CaseBox) => b.id === activeField)?.label ?? activeField}
                        </h3>
                        <p className="text-sm mt-2 font-medium leading-relaxed" style={{ color: isNight ? p.accent : p.accent2 }}>
                          {currentCase.boxes.find((b: CaseBox) => b.id === activeField)?.instruction}
                        </p>
                        <p className="text-xs mt-1 font-light" style={{ color: p.textMuted }}>
                          Choose the most clinically accurate and defensible option below.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentOptions.map((chip: CaseChip) => (
                          <button
                            key={chip.id}
                            onClick={() => handleOptionSelect(chip.id)}
                            className="w-full text-left rounded-[12px] border px-4 py-3 text-sm font-medium transition-all group flex items-start gap-3"
                            style={{ background: p.bg, borderColor: p.cardBorder, color: p.text }}
                            onMouseEnter={(e) => {
                              ;(e.currentTarget as HTMLElement).style.borderColor = p.accentDim
                              ;(e.currentTarget as HTMLElement).style.background = isNight ? '#002B2C' : '#E5FEFF'
                            }}
                            onMouseLeave={(e) => {
                              ;(e.currentTarget as HTMLElement).style.borderColor = p.cardBorder
                              ;(e.currentTarget as HTMLElement).style.background = p.bg
                            }}
                          >
                            <div
                              className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                              style={{ borderColor: p.cardBorder }}
                            >
                              <div className="w-2.5 h-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: p.accent }} />
                            </div>
                            <span className="leading-snug">{chip.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </main>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
