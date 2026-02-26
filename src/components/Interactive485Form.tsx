import React, { useState, useMemo, useCallback, useRef } from 'react'
import { sendChallengeResults } from '../sendResults'
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  Heart,
  Home,
  Info,
  LayoutTemplate,
  Pointer,
  Presentation,
  RotateCcw,
  Search,
  ShieldAlert,
  Trophy,
  X,
  XCircle,
} from 'lucide-react'

// ─── Theme palette ─────────────────────────────────────────────
interface Palette {
  bg: string
  bgAlt: string
  bgDeep: string
  card: string
  cardBorder: string
  text: string
  textMuted: string
  textDim: string
  accent: string
  accentDim: string
  accent2: string
  accent2Dim: string
  accent2Light: string
  inputFocus: string
  scrollTrack: string
  scrollThumb: string
  scrollHover: string
  coverBg: string
  challengeBg: string
  sidebarBg: string
  formBg: string
  formHeaderBg: string
  correctBg: string
  incorrectBg: string
  chipBg: string
  chipBorder: string
  chipText: string
  logoUrl: string
}

const NIGHT: Palette = {
  bg: '#010809',
  bgAlt: '#031213',
  bgDeep: '#020C0D',
  card: '#031213',
  cardBorder: '#004142',
  text: '#FAFBF8',
  textMuted: '#D9D6D5',
  textDim: '#747474',
  accent: '#64F4F5',
  accentDim: '#007970',
  accent2: '#C74601',
  accent2Dim: '#C74601',
  accent2Light: '#FFD5BF',
  inputFocus: 'rgba(100, 244, 245, 0.05)',
  scrollTrack: '#010809',
  scrollThumb: '#004142',
  scrollHover: '#007970',
  coverBg: 'radial-gradient(circle at top right, #004142 0%, #001A1A 80%)',
  challengeBg: 'radial-gradient(circle at top right, #004142 0%, #001A1A 80%)',
  sidebarBg: '#031213',
  formBg: '#020C0D',
  formHeaderBg: '#002B2C',
  correctBg: 'rgba(0,121,112,0.2)',
  incorrectBg: 'rgba(215,1,1,0.2)',
  chipBg: '#002B2C',
  chipBorder: '#007970',
  chipText: '#64F4F5',
  logoUrl: 'https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_White.png',
}

const LIGHT: Palette = {
  bg: '#FAFBF8',
  bgAlt: '#FAFBF8',
  bgDeep: '#FAFBF8',
  card: '#ffffff',
  cardBorder: '#E5E4E3',
  text: '#1F1C1B',
  textMuted: '#524048',
  textDim: '#747474',
  accent: '#007970',
  accentDim: '#006059',
  accent2: '#C74601',
  accent2Dim: '#C74601',
  accent2Light: '#FFD5BF',
  inputFocus: 'rgba(0, 121, 112, 0.05)',
  scrollTrack: '#FAFBF8',
  scrollThumb: '#D9D6D5',
  scrollHover: '#747474',
  coverBg: '#ffffff',
  challengeBg: '#FAFBF8',
  sidebarBg: '#FAFBF8',
  formBg: '#ffffff',
  formHeaderBg: '#004142',
  correctBg: '#F0FDFA',
  incorrectBg: '#FFF0F0',
  chipBg: '#E5FEFF',
  chipBorder: '#007970',
  chipText: '#007970',
  logoUrl: 'https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_Gray.png',
}

// ─── Clinical narrative (shared) ───────────────────────────────
const HENDERSON_NARRATIVE = {
  vitals: {
    bloodSugar: '342 mg/dL',
    heartRate: '48 bpm (Ashen)',
    bloodPressure: '158/92',
    leftLeg: 'Cold, Pulseless',
  },
  environmentalRisks: [
    'Unsecured/loaded firearm on nightstand',
    'Power is currently out',
    'Insulin stored in warm temperatures',
    'Primary caregiver (daughter) has quit',
  ],
  sections: [
    {
      title: 'Clinical Evaluation Narrative',
      content:
        'Upon arrival for the initial assessment, the clinical environment was immediately compromised by the presence of a loaded handgun on the nightstand, requiring immediate tactical communication to establish a safe perimeter before the secondary stabilization phase could begin. The patient presents as significantly ashen and diaphoretic with a documented bradycardia of HR 48, yet due to profound diabetic peripheral neuropathy, he denies the typical chest pressure associated with myocardial infarction, though the clinical "silent" presentation suggests a 911 transfer is the only viable path forward despite the urgency of the Wagner Grade 3 great toe ulcer which currently probes to the bone. During the assessment, the neighbor, Mrs. Gable, arrived unannounced to ask if George\'s cat, "Pickles," could stay at her house until the power is restored, specifically mentioning that the feline requires a specific brand of wet food twice daily; meanwhile, the daughter\'s refusal to assist was punctuated by her claim that she is allergic to the cat and will not return until the animal is removed.',
    },
    {
      title: 'Physician Coordination',
      content:
        "Regarding the coordination of care and the prospective visit schedule, the primary clinician determined that while the standard stabilization typically requires oversight for the first 72 hours, the daughter\u2019s sudden refusal to provide support necessitates that this initial daily oversight be the top priority for those three days in week one. Following this stabilization, the plan dictates that the clinician will down-regulate to a twice-weekly cadence for the three remaining weeks of the first month to monitor for osteomyelitis. The second month of the certification period is slated to transition to a standard once-weekly frequency for the final four weeks. Physical Therapy remains sidelined by a mandated 48-hour vascular hold pending a consult for the pulseless left leg; thereafter, the therapist's intent is to conduct visits twice a week for a duration of three weeks, subsequently tapering to a once-weekly frequency for the final two weeks to finalize the safety and home exercise program.",
    },
  ],
}

// ─── Answer chips ──────────────────────────────────────────────
const ANSWER_CHIPS = [
  // BOX 11
  { id: '11-1', boxId: 'box-11', label: 'E11.621 (Type 2 DM w/ foot ulcer)' },
  { id: '11-2', boxId: 'box-11', label: 'L97.511 (Non-pressure chronic ulcer of right foot, limited to skin)', trapNote: 'Ignores the diabetes.' },
  { id: '11-3', boxId: 'box-11', label: 'L03.115 (Cellulitis of right lower limb)', trapNote: 'Symptom, not primary cause.' },
  { id: '11-4', boxId: 'box-11', label: 'I70.202 (Atherosclerosis of native arteries of L leg w/ ulcer)', trapNote: 'Ischemia is a secondary dx here.' },
  { id: '11-5', boxId: 'box-11', label: 'E11.9 (Type 2 DM without complications)', trapNote: 'Incorrectly labels as uncomplicated.' },
  { id: '11-6', boxId: 'box-11', label: 'I73.9 (Peripheral vascular disease, unspecified)', trapNote: 'Too vague for high-acuity billing.' },
  { id: '11-7', boxId: 'box-11', label: 'R00.1 (Bradycardia, unspecified)', trapNote: 'Acute symptom, not home health primary.' },
  { id: '11-8', boxId: 'box-11', label: 'M86.171 (Other acute osteomyelitis, right ankle and foot)', trapNote: 'Requires clinical confirmation/X-ray first.' },
  { id: '11-9', boxId: 'box-11', label: 'Z47.89 (Other orthopaedic aftercare)', trapNote: 'Used for post-op, not chronic ulcers.' },
  { id: '11-10', boxId: 'box-11', label: 'L98.491 (Non-pressure chronic ulcer of skin, unspecified)', trapNote: '"Unspecified" is an audit red flag.' },

  // BOX 15
  { id: '15-1', boxId: 'box-15', label: 'Endurance, Ambulation, LOPS (Loss of Protective Sensation)' },
  { id: '15-2', boxId: 'box-15', label: 'Total Assist for ADLs, Bedbound, Speech Impairment', trapNote: 'Overstates acuity; patient is chair-bound, not bedbound.' },
  { id: '15-3', boxId: 'box-15', label: 'Legally Blind, Hearing Impairment, Paralysis', trapNote: 'Not supported by the evaluation.' },
  { id: '15-4', boxId: 'box-15', label: 'Dyspnea with Minimal Exertion, Orthostatic Hypotension', trapNote: 'Clinically true but misses the neurological component.' },
  { id: '15-5', boxId: 'box-15', label: 'Contracture, Amputation Risk, Bowel/Bladder Incontinence', trapNote: 'Plausible but lacks specific primary evidence.' },
  { id: '15-6', boxId: 'box-15', label: 'Cognitive Impairment, Memory Loss, Disorientation', trapNote: 'Confusion is secondary to the cardiac/metabolic crisis.' },
  { id: '15-7', boxId: 'box-15', label: 'Severe Pain, Joint Stiffness, Limited Range of Motion', trapNote: 'Neuropathy often masks pain in Grade 3 ulcers.' },
  { id: '15-8', boxId: 'box-15', label: 'Fragile Skin, Decubitus Ulcer Risk, Poor Nutritional Status', trapNote: 'General "Catch-all" used incorrectly.' },
  { id: '15-9', boxId: 'box-15', label: 'Profound Generalized Weakness and Fatigue Only', trapNote: 'Not specific enough for Box 15.' },
  { id: '15-10', boxId: 'box-15', label: 'Dependent on Oxygen, Wheelchair Bound, Aphasia', trapNote: 'Irrelevant clinical data.' },

  // BOX 18
  { id: '18-1', boxId: 'box-18', label: 'Cleanse w/ NS, apply Collagen, cover foam; notify MD of Wagner 3 & request X-ray' },
  { id: '18-2', boxId: 'box-18', label: 'Cleanse w/ Betadine, apply dry sterile dressing, change every 3 days', trapNote: 'Betadine is cytotoxic; too infrequent.' },
  { id: '18-3', boxId: 'box-18', label: 'Soak foot in Epsom salts 15 mins daily; apply OTC antibiotic ointment', trapNote: 'Soaking is strictly contraindicated for diabetics.' },
  { id: '18-4', boxId: 'box-18', label: 'Apply Silver Sulfadiazine cream and leave open to air to promote drying', trapNote: 'Wounds need moisture balance, not drying.' },
  { id: '18-5', boxId: 'box-18', label: 'Cleanse w/ Hydrogen Peroxide and pack with wet-to-dry gauze BID', trapNote: 'Peroxide damages healthy tissue; wet-to-dry is outdated.' },
  { id: '18-6', boxId: 'box-18', label: 'Apply Hydrogel and instruct patient on autolytic debridement daily', trapNote: 'Too passive for a bone-involved infection.' },
  { id: '18-7', boxId: 'box-18', label: 'Enforce bedrest; wrap foot in heating pad to increase circulation', trapNote: 'Heating pads cause burns in neuropathy patients.' },
  { id: '18-8', boxId: 'box-18', label: 'Apply Honey-based dressing and check pulse once weekly', trapNote: 'Pulse must be checked daily in ischemia cases.' },
  { id: '18-9', boxId: 'box-18', label: "Irrigate wound with Dakin\u2019s solution and apply pressure dressing", trapNote: "Too aggressive; Dakin's is for specific necrotic cases." },
  { id: '18-10', boxId: 'box-18', label: 'Debride yellow slough at bedside with surgical blade; apply gauze', trapNote: 'Debridement requires a specific order/specialist.' },

  // BOX 21
  { id: '21-1', boxId: 'box-21', label: 'SN: 3w1, 2w3, 1w4 | PT: 2w3, 1w2' },
  { id: '21-2', boxId: 'box-21', label: 'SN: 7w1, 2w3, 1w4 | PT: 2w3, 1w2', trapNote: 'Interprets "daily oversight" as 7 days.' },
  { id: '21-3', boxId: 'box-21', label: 'SN: 3w1, 2w7 | PT: 1w5', trapNote: 'Miscalculates the tapering of care.' },
  { id: '21-4', boxId: 'box-21', label: 'SN: 1w9 | PT: 2w5', trapNote: 'Too low for acute Wagner Grade 3.' },
  { id: '21-5', boxId: 'box-21', label: 'SN: 5w1, 3w3, 2w5 | PT: 3w2, 1w3', trapNote: 'Over-utilization of resources.' },
  { id: '21-6', boxId: 'box-21', label: 'SN: 3w1, 2w3, 1w4 | PT: 1w1, 2w4', trapNote: 'Incorrectly adds a standalone Eval week for PT.' },
  { id: '21-7', boxId: 'box-21', label: 'SN: 7w1, 1w8 | PT: 2w5', trapNote: 'Misses the second-month taper.' },
  { id: '21-8', boxId: 'box-21', label: 'SN: 3w1, 1w8 | PT: 2w3, 1w2', trapNote: 'Drops to 1w too early in month one.' },
  { id: '21-9', boxId: 'box-21', label: 'SN: 2w4, 1w5 | PT: 2w4, 1w5', trapNote: 'Standard protocol that ignores the 72h stabilization.' },
  { id: '21-10', boxId: 'box-21', label: 'SN: 4w1, 2w8 | PT: 2w8', trapNote: "Random numbers that don't match the narrative." },

  // BOX 24
  { id: '24-1', boxId: 'box-24', label: 'Establish safe environment: secure firearm, initiate 911 transfer for HR 48' },
  { id: '24-2', boxId: 'box-24', label: 'Instruct daughter on wound care techniques and dressing changes', trapNote: 'Ignores that the daughter has quit.' },
  { id: '24-3', boxId: 'box-24', label: 'Provide educational pamphlets on low-sodium diets and foot care', trapNote: '"Fluff" that ignores the cardiac crisis.' },
  { id: '24-4', boxId: 'box-24', label: 'Install grab bars and non-slip mats in the bathroom immediately', trapNote: 'Good, but not the priority over the heart rate.' },
  { id: '24-5', boxId: 'box-24', label: 'Arrange for Meals-on-Wheels to address the power outage/nutrition', trapNote: 'Social need, not an emergency action.' },
  { id: '24-6', boxId: 'box-24', label: "Coordinate with Mrs. Gable regarding 'Pickles' the cat and feline dietary needs", trapNote: 'Social determinant distractor — irrelevant to the emergency clinical priority or CMS-485 safety requirements.' },
  { id: '24-7', boxId: 'box-24', label: 'Obtain consent for diabetic foot care and daily weights', trapNote: 'Basic care, not emergency stabilization.' },
  { id: '24-8', boxId: 'box-24', label: 'Instruct patient to keep legs elevated at 45 degrees while sleeping', trapNote: 'Dangerous if ischemia is present (reduces flow).' },
  { id: '24-9', boxId: 'box-24', label: 'Perform medication reconciliation and remove expired pills', trapNote: 'Necessary, but secondary to the 911/Firearm risk.' },
  { id: '24-10', boxId: 'box-24', label: 'Mark the border of the erythema with a surgical pen and monitor', trapNote: 'Good nursing, but ignores the "Silent MI" risk.' },
]

const FORM_BOXES = [
  {
    id: 'box-11',
    label: '11. Principal Diagnosis',
    correctChipId: '11-1',
    tooltipWhy: 'CMS requires the primary diagnosis to be the root condition requiring oversight, not just the superficial symptom.',
    validationAffirmation: 'Excellent! You prioritized the metabolic cause over the superficial symptoms. Coding Diabetes with Foot Ulcer justifies high-acuity skilled nursing.',
  },
  {
    id: 'box-15',
    label: '15. Functional Limitations',
    correctChipId: '15-1',
    tooltipWhy: 'Why did the wound get so bad? The patient cannot feel their feet.',
    validationAffirmation: 'Spot on. Identifying LOPS (Loss of Protective Sensation) justifies the need for advanced skilled teaching on foot inspections.',
  },
  {
    id: 'box-18',
    label: '18. Skilled Nursing Orders',
    correctChipId: '18-1',
    tooltipWhy: 'Probe-to-bone is a major red flag indicating suspected osteomyelitis.',
    validationAffirmation: "Critical catch! You didn't just \"clean a wound\"; you identified a medical emergency and escalated for an X-ray to save the limb.",
  },
  {
    id: 'box-21',
    label: '21. Visit Frequency',
    correctChipId: '21-1',
    tooltipWhy: '72 hours = 3 days. Month 1 has 4 weeks. Month 2 has 4 weeks.',
    validationAffirmation: 'Spot-on calculation! You navigated the "Stabilization Trap" perfectly. 72 hours is 3w1, not 7w1.',
  },
  {
    id: 'box-24',
    label: '24. Safety / Emergency Actions',
    correctChipId: '24-1',
    tooltipWhy: 'Safety and life-stabilization always precede wound healing.',
    validationAffirmation: 'Master-Level Priority! You recognized that clinical care cannot occur in a vacuum of danger. Safety first.',
  },
]

// ─── Sub-components ────────────────────────────────────────────
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

// ─── Props ─────────────────────────────────────────────────────
interface Props {
  theme?: 'night' | 'day'
  onProceed?: () => void
}

// ─── Main Component ────────────────────────────────────────────
export default function Interactive485Form({ theme = 'night', onProceed }: Props) {
  const p = theme === 'night' ? NIGHT : LIGHT
  const isNight = theme === 'night'

  const [activeTab, setActiveTab] = useState<string>('COVER')

  // Challenge state
  const [placements, setPlacements] = useState<Record<string, string>>({})
  const [activeField, setActiveField] = useState<string | null>(null)
  const [tooltipBox, setTooltipBox] = useState<string | null>(null)
  const [submissionResult, setSubmissionResult] = useState<{ correct: string[]; incorrect: string[]; safetyFirst: boolean } | null>(null)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [safetyPlacedOrder, setSafetyPlacedOrder] = useState<string[]>([])

  const optionsRef = useRef<HTMLDivElement>(null)

  const currentOptions = useMemo(() => {
    if (!activeField) return []
    return [...ANSWER_CHIPS.filter((c) => c.boxId === activeField)].sort(() => Math.random() - 0.5)
  }, [activeField])

  const handleBoxClick = (boxId: string) => {
    if (submissionResult) return
    setActiveField(boxId)
    setTimeout(() => {
      optionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }

  const handleOptionSelect = (chipId: string) => {
    if (!activeField) return
    setPlacements((prev) => ({ ...prev, [activeField]: chipId }))
    setSafetyPlacedOrder((prev) => [...prev.filter((b) => b !== activeField), activeField])
    setActiveField(null)
  }

  const removeChip = useCallback(
    (e: React.MouseEvent, boxId: string) => {
      e.stopPropagation()
      if (submissionResult) return
      setPlacements((prev) => {
        const next = { ...prev }
        delete next[boxId]
        return next
      })
      setSafetyPlacedOrder((prev) => prev.filter((b) => b !== boxId))
      if (activeField === boxId) setActiveField(null)
    },
    [submissionResult, activeField],
  )

  const handleSubmit = useCallback(() => {
    const correct: string[] = []
    const incorrect: string[] = []
    FORM_BOXES.forEach((box) => {
      if (placements[box.id] === box.correctChipId) correct.push(box.id)
      else incorrect.push(box.id)
    })
    const safetyIdx = safetyPlacedOrder.indexOf('box-24')
    const woundIdx = safetyPlacedOrder.indexOf('box-18')
    const safetyFirst = safetyIdx >= 0 && (woundIdx < 0 || safetyIdx < woundIdx)
    setSubmissionResult({ correct, incorrect, safetyFirst })
    setActiveField(null)
    if (correct.length === FORM_BOXES.length && safetyFirst) setShowBreakdown(true)

    // Fire-and-forget email of results
    sendChallengeResults({
      correct,
      incorrect,
      safetyFirst,
      totalBoxes: FORM_BOXES.length,
      timestamp: new Date().toISOString(),
    })
  }, [placements, safetyPlacedOrder])

  const handleReset = () => {
    setPlacements({})
    setSubmissionResult(null)
    setShowBreakdown(false)
    setSafetyPlacedOrder([])
    setActiveField(null)
  }

  const allBoxesFilled = FORM_BOXES.every((b) => placements[b.id])
  const showCrisisWarning = allBoxesFilled && !placements['box-24']

  // ─── Animations / scrollbar dynamic style ──────────────────
  const dynamicCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
    .font-heading { font-family: 'Montserrat', sans-serif; }
    .font-body { font-family: 'Roboto', sans-serif; }
    .i485-root ::-webkit-scrollbar { width: 8px; }
    .i485-root ::-webkit-scrollbar-track { background: ${p.scrollTrack}; }
    .i485-root ::-webkit-scrollbar-thumb { background: ${p.scrollThumb}; border-radius: 4px; }
    .i485-root ::-webkit-scrollbar-thumb:hover { background: ${p.scrollHover}; }
    @keyframes i485SlideUp {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .i485-slide-up { animation: i485SlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .cms-input-485 {
      width: 100%; background: transparent; border: none; outline: none; resize: none;
      font-family: 'Roboto', sans-serif; color: ${p.text};
    }
    .cms-input-485:focus { background: ${p.inputFocus}; }
  `

  // ─── COMPLETION MODAL ──────────────────────────────────────
  if (showBreakdown && submissionResult) {
    return (
      <div className="i485-root min-h-screen font-body flex items-center justify-center p-6" style={{ background: p.bg, color: p.text }}>
        <style>{dynamicCSS}</style>
        <div
          className="max-w-4xl w-full rounded-[32px] border shadow-2xl p-10 lg:p-16 i485-slide-up relative overflow-hidden"
          style={{ background: p.bgAlt, borderColor: p.cardBorder }}
        >
          {isNight && (
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#007970] rounded-full mix-blend-screen filter blur-[120px] opacity-20 pointer-events-none z-0" />
          )}
          <div className="relative z-10">
            <div className="text-center mb-12">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: isNight ? '#004142' : '#E5FEFF', boxShadow: `0 0 24px -4px ${isNight ? 'rgba(100,244,245,0.4)' : 'rgba(0,121,112,0.25)'}` }}
              >
                <Trophy className="h-12 w-12" style={{ color: p.accent }} />
              </div>
              <h1 className="font-heading text-4xl lg:text-5xl font-bold mb-4" style={{ color: p.text }}>
                CareIndeed Clinical Master
              </h1>
              <p style={{ color: p.textMuted }} className="text-lg">
                You successfully completed the CMS-485 Challenge with 100% accuracy.
              </p>
            </div>

            <div className="space-y-6">
              {FORM_BOXES.map((box) => (
                <div key={box.id} className="rounded-[20px] border p-6 shadow-sm" style={{ background: p.bg, borderColor: p.cardBorder }}>
                  <h3 className="font-heading text-lg font-bold mb-2" style={{ color: p.accent }}>
                    {box.label}
                  </h3>
                  <p className="leading-relaxed font-light" style={{ color: p.text }}>
                    {box.validationAffirmation}
                  </p>
                </div>
              ))}

              {submissionResult.safetyFirst && (
                <div className="rounded-[20px] border p-8 shadow-md" style={{ borderColor: p.accent2, background: `${p.accent2}15` }}>
                  <h3 className="font-heading text-xl font-bold mb-3 flex items-center gap-2" style={{ color: p.accent2Light }}>
                    <ShieldAlert className="h-6 w-6" style={{ color: p.accent2 }} /> The Priority Task: 911/Safety First
                  </h3>
                  <p className="leading-relaxed font-medium" style={{ color: p.text }}>
                    Master-Level Priority! You recognized that clinical care cannot occur in a vacuum of danger. By prioritizing the Bradycardia (Silent MI) and the unsecured firearm over the wound care, you demonstrated the most important trait of a CareIndeed clinician: Total Patient Advocacy and Safety First.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center mt-12 gap-4">
              <button
                onClick={() => {
                  handleReset()
                  setActiveTab('COVER')
                }}
                className="rounded-[16px] text-white px-10 py-4 font-bold text-lg tracking-wide transition-all hover:-translate-y-1"
                style={{ background: p.accent2, boxShadow: `0 0 24px -4px ${p.accent2}99` }}
              >
                Practice Again
              </button>
              {onProceed && (
                <button
                  onClick={onProceed}
                  className="rounded-[16px] text-white px-10 py-4 font-bold text-lg tracking-wide transition-all hover:-translate-y-1"
                  style={{ background: p.accent, boxShadow: `0 0 24px -4px ${p.accent}99` }}
                >
                  Proceed to Training
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── FORM RENDERER ─────────────────────────────────────────
  const renderForm = () => {
    const isReview = activeTab === 'REVIEW'
    const isChallenge = activeTab === 'CHALLENGE'

    const FormContent = ({ revVal, defaultVal }: { revVal: string; defaultVal: string }) => {
      if (isReview) return <div className="text-xs mt-1 font-medium" style={{ color: p.text }}>{revVal}</div>
      if (isChallenge) return <div className="text-xs mt-1 italic" style={{ color: p.cardBorder }}>[Focus on highlighted fields]</div>
      return <input className="cms-input-485 mt-1 w-full text-xs" defaultValue={defaultVal} placeholder="Type here..." />
    }

    const FormContentArea = ({ revVal, defaultVal }: { revVal: string; defaultVal: string }) => {
      if (isReview) return <div className="text-xs mt-1 font-medium whitespace-pre-wrap" style={{ color: p.text }}>{revVal}</div>
      if (isChallenge) return <div className="text-xs mt-1 italic" style={{ color: p.cardBorder }}>[Focus on highlighted fields]</div>
      return <textarea className="cms-input-485 mt-1 w-full h-full text-xs flex-1" defaultValue={defaultVal} placeholder="Type here..." />
    }

    const renderInteractiveField = (boxId: string, heightClass = 'min-h-[60px]') => {
      const box = FORM_BOXES.find((b) => b.id === boxId)
      if (!box) return null
      const chipId = placements[boxId]
      const chip = chipId ? ANSWER_CHIPS.find((c) => c.id === chipId) : null
      const isCorrect = submissionResult?.correct.includes(boxId)
      const isIncorrect = submissionResult?.incorrect.includes(boxId)
      const isActive = activeField === boxId

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
          onClick={() => handleBoxClick(boxId)}
        >
          <div className="flex justify-between items-start mb-1 z-10">
            <span className="text-[10px] font-bold" style={{ color: isActive ? p.accent : p.accent2 }}>
              {box.label}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setTooltipBox(tooltipBox === boxId ? null : boxId)
              }}
              className="opacity-0 group-hover:opacity-100 rounded p-0.5 transition-opacity"
              style={{ color: p.accent }}
              title="Clinical Logic"
            >
              <Info className="h-3 w-3" />
            </button>
          </div>

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
                  <button onClick={(e) => removeChip(e, boxId)} className="hover:opacity-70 flex-shrink-0" style={{ color: isNight ? '#fff' : p.text }}>
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

          {tooltipBox === boxId && (
            <div
              className="absolute top-0 right-0 mt-6 mr-2 w-64 text-xs p-3 rounded-lg shadow-2xl z-50 border"
              style={{ background: isNight ? '#031213' : '#1F1C1B', color: '#fff', borderColor: p.cardBorder }}
            >
              <strong className="block mb-1" style={{ color: p.accent2 }}>
                CareIndeed Clinical Tip:
              </strong>
              {box.tooltipWhy}
            </div>
          )}

          {isIncorrect && chip && (chip as any).trapNote && (
            <div
              className="absolute top-full left-0 w-full mt-1 p-2 rounded-md text-[10px] z-40 shadow-lg i485-slide-up"
              style={{
                background: isNight ? 'rgba(215,1,1,0.2)' : '#FBE6E6',
                border: '1px solid #D70101',
                color: isNight ? p.accent2Light : '#421700',
                backdropFilter: isNight ? 'blur(8px)' : undefined,
              }}
            >
              <strong style={{ color: isNight ? '#fff' : '#D70101' }}>Review:</strong> {(chip as any).trapNote}
            </div>
          )}
        </div>
      )
    }

    const labelColor = p.accent
    const rowBg = p.bg

    return (
      <div className="max-w-4xl mx-auto w-full border-2 shadow-2xl font-body relative mb-12 overflow-hidden" style={{ background: p.formBg, borderColor: p.cardBorder, color: p.text }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between p-3 font-bold border-b" style={{ background: p.formHeaderBg, borderColor: p.cardBorder, color: '#fff' }}>
          <span className="text-sm md:text-base tracking-wide uppercase">Home Health Certification and Plan of Care</span>
          <span className="text-xs md:text-sm" style={{ color: isNight ? '#64F4F5' : '#C4F4F5' }}>
            Form CMS-485
          </span>
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-5 border-b" style={{ borderColor: p.cardBorder, background: rowBg }}>
          {[
            { num: '1', label: 'Patient HI #', val: 'XXX-XX-XXXX-A' },
            { num: '2', label: 'SOC Date', val: '02/24/2026' },
            { num: '3', label: 'Cert Period', val: '02/24/2026 - 04/23/2026' },
            { num: '4', label: 'Medical Rec #', val: 'MR-2026-0485' },
            { num: '5', label: 'Provider #', val: '10-7654' },
          ].map((f, i) => (
            <div key={f.num} className={`p-1.5 ${i < 4 ? 'border-r' : ''}`} style={{ borderColor: p.cardBorder }}>
              <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>
                {f.num}. {f.label}
              </span>
              <FormContent revVal={f.val} defaultVal="" />
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div className="border-b p-2" style={{ borderColor: p.cardBorder, background: rowBg }}>
          <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>
            6. Patient Name, Address, DOB
          </span>
          <FormContent revVal="Jane A. Sample 1234 Elm St, Sacramento, CA 95811 DOB 03/15/1942" defaultVal="" />
        </div>

        {/* Row 3 - Diagnoses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-b" style={{ borderColor: p.cardBorder, background: rowBg }}>
          <div className="border-r border-b sm:border-b-0 p-2 min-h-[80px]" style={{ borderColor: p.cardBorder }}>
            {isChallenge ? (
              renderInteractiveField('box-11')
            ) : (
              <>
                <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>11. Principal DX</span>
                <FormContentArea revVal="I50.9 Heart failure, unspecified" defaultVal="" />
              </>
            )}
          </div>
          <div className="p-2 min-h-[80px]">
            <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>12. Other Pertinent DX</span>
            <FormContentArea revVal={'N18.3 CKD Stage 3\nI10 Essential HTN\nE11.65 T2DM w/ hyperglycemia\nZ87.39 Hx urinary disease'} defaultVal="" />
          </div>
        </div>

        {/* Row 4 - Functional Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b" style={{ borderColor: p.cardBorder, background: rowBg }}>
          <div className="border-r border-b sm:border-b-0 p-2 min-h-[70px]" style={{ borderColor: p.cardBorder }}>
            <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>14. DME / Supplies</span>
            <FormContentArea revVal="Rolling walker, BP cuff, Scale, Compression stockings" defaultVal="" />
          </div>
          <div className="border-r border-b sm:border-b-0 p-2 min-h-[70px]" style={{ borderColor: p.cardBorder }}>
            {isChallenge ? (
              renderInteractiveField('box-15')
            ) : (
              <>
                <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>15. Functional Limits</span>
                <FormContentArea revVal="Ambulation, Endurance, Dyspnea, Paralysis" defaultVal="" />
              </>
            )}
          </div>
          <div className="p-2 min-h-[70px]">
            <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>16. Mental Status</span>
            <FormContent revVal="Oriented, Confused, Depressed" defaultVal="" />
          </div>
        </div>

        {/* Row 5 - Orders */}
        <div className="border-b p-2 min-h-[100px]" style={{ borderColor: p.cardBorder, background: rowBg }}>
          {isChallenge ? (
            renderInteractiveField('box-18', 'min-h-[100px]')
          ) : (
            <>
              <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>18. Skilled Nursing Orders</span>
              <FormContentArea
                revVal={'SN CHF monitoring, med titration, edema q visit 2x/wk x 3wk then 1x/wk x 3wk\nPT Therapeutic exercise, balance, transfers 2x/wk x 4wk\nMSW Community resources, psychosocial 1x/mo x 2mo'}
                defaultVal=""
              />
            </>
          )}
        </div>

        {/* Row 6 - Goals & Frequency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-b" style={{ borderColor: p.cardBorder, background: rowBg }}>
          <div className="border-r border-b sm:border-b-0 p-2 min-h-[80px]" style={{ borderColor: p.cardBorder }}>
            {isChallenge ? (
              renderInteractiveField('box-21')
            ) : (
              <>
                <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>21. Visit Frequency</span>
                <FormContentArea revVal="SN 2W31W3 PT 2W4 MSW 1M2 | Total: 19 visits" defaultVal="" />
              </>
            )}
          </div>
          <div className="p-2 min-h-[80px]">
            <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>22. Goals / Rehab Potential</span>
            <FormContentArea revVal={'G1: Pt verbalizes 3 CHF red flags by visit 4\nG2: Daily wt/BP log 2lb variance x 2wk\nRehab: Good D/C when goals met'} defaultVal="" />
          </div>
        </div>

        {/* Row 7 - Safety */}
        <div className="border-b p-2 min-h-[80px]" style={{ borderColor: p.cardBorder, background: rowBg }}>
          {isChallenge ? (
            renderInteractiveField('box-24')
          ) : (
            <>
              <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>24. Safety / Behavioral</span>
              <FormContentArea revVal="Fall precautions, trip hazards, night lighting, emergency contacts" defaultVal="" />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 p-2 text-[10px] border-t" style={{ background: p.bgDeep, color: isNight ? p.accent : p.textDim, borderColor: p.cardBorder }}>
          <div>26. Signature of Physician: ______________________</div>
          <div className="text-right">Date: __/__/____</div>
        </div>
      </div>
    )
  }

  // ─── RIGHT SIDEBAR ─────────────────────────────────────────
  const renderRightSidebar = () => (
    <aside
      className="w-80 border-l p-6 overflow-y-auto flex-col gap-6 z-10 hidden lg:flex flex-shrink-0"
      style={{ background: p.bgAlt, borderColor: p.cardBorder, boxShadow: isNight ? '-4px 0 24px rgba(0,0,0,0.4)' : '-4px 0 24px rgba(0,0,0,0.02)' }}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: p.textDim }} />
        <input
          type="text"
          placeholder="Search CMS guidelines..."
          className="w-full rounded-[8px] py-2 pl-9 pr-3 text-sm focus:outline-none"
          style={{ background: p.bg, border: `1px solid ${p.cardBorder}`, color: p.text }}
        />
      </div>

      <div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-medium" style={{ color: p.textMuted }}>Guided progress</span>
          <span className="text-xs font-bold" style={{ color: p.text }}>12%</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: p.accentDim }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.accentDim }} />
          </div>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="w-4 h-4 rounded-full border-2" style={{ borderColor: p.cardBorder }} />
          ))}
        </div>
      </div>

      <div className="border-t pt-6 space-y-4" style={{ borderColor: p.cardBorder }}>
        <h3 className="font-bold text-sm leading-snug uppercase tracking-wide" style={{ color: p.accent }}>
          Patient Identifiers &amp; Certification Period
        </h3>
        <p className="text-xs" style={{ color: p.textMuted }}>
          Confirm patient identity and cert dates exactly match source orders.
        </p>

        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: p.accent2 }}>Why It Matters</h4>
          <p className="text-xs leading-relaxed font-light" style={{ color: p.textMuted }}>
            Identity/date mismatches break continuity, trigger claim edits, and weaken audit traceability.
          </p>
        </div>

        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: p.accentDim }}>How To Complete</h4>
          <p className="text-xs leading-relaxed font-light" style={{ color: p.textMuted }}>
            Use the referral/order packet and certification dates approved by the physician. Keep identifiers exact across all forms.
          </p>
        </div>

        <div className="p-3 rounded-lg border" style={{ background: p.bg, borderColor: p.cardBorder }}>
          <h4 className="font-bold text-[10px] uppercase tracking-widest mb-2" style={{ color: p.textMuted }}>Common Mistakes</h4>
          <ul className="text-xs space-y-1.5 pl-3 list-disc font-light" style={{ color: p.textMuted }}>
            <li>Transposed birth date or MRN</li>
            <li>Certification dates not aligned with episode records</li>
            <li>Nickname used instead of legal patient name</li>
          </ul>
        </div>
      </div>

      {activeTab === 'TRY_IT' && (
        <div className="p-4 rounded-[12px] border shadow-sm i485-slide-up" style={{ background: `${p.accent2}15`, borderColor: `${p.accent2}4d` }}>
          <h4 className="font-bold text-[10px] uppercase tracking-widest mb-3" style={{ color: p.accent2 }}>Try It Input</h4>
          <label className="text-xs font-bold block mb-1" style={{ color: p.accent2Light }}>Certification Start Date</label>
          <input
            type="date"
            className="w-full rounded-[6px] py-2 px-3 text-sm mb-2 focus:outline-none"
            style={{ background: p.bg, border: `1px solid ${p.accent2}80`, color: p.text }}
          />
          <p className="text-[10px] leading-relaxed font-light" style={{ color: `${p.accent2Light}cc` }}>
            Use the exact physician-approved certification period start date.
          </p>
        </div>
      )}

      <div className="rounded-[12px] border p-4 mt-auto" style={{ background: p.bg, borderColor: p.cardBorder }}>
        <h4 className="font-bold text-[10px] uppercase tracking-widest mb-3" style={{ color: p.cardBorder }}>Review Sections</h4>
        <ul className="text-xs space-y-1.5 font-medium">
          <li className="p-2 rounded-[6px] border" style={{ background: `${p.accentDim}33`, color: p.accent, borderColor: `${p.accentDim}4d` }}>
            1. Patient Identifiers + Certification
          </li>
          {['2. Diagnoses', '3. Orders / Skilled Services', '4. Visit Frequency / Duration', '5. Measurable Goals'].map((s) => (
            <li key={s} className="p-2 rounded-[6px] cursor-pointer transition-colors hover:opacity-80" style={{ color: p.textDim }}>
              {s}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )

  // ─── MAIN RENDER ───────────────────────────────────────────
  return (
    <div className="i485-root flex flex-col h-screen w-full font-body overflow-hidden" style={{ background: p.bg, color: p.text }}>
      <style>{dynamicCSS}</style>

      {/* TOP NAVBAR */}
      <header className="border-b px-6 pt-4 pb-0 flex-shrink-0 z-20 relative" style={{ background: isNight ? p.bg : p.card, borderColor: p.cardBorder }}>
        <div className="flex justify-between items-center mb-4 max-w-[1800px] mx-auto w-full">
          <div>
            <h1 className="font-heading font-bold text-xl md:text-2xl leading-tight" style={{ color: p.text }}>
              Interactive CMS-485 Virtual Form
            </h1>
            <p className="text-xs md:text-sm mt-1 flex items-center gap-2" style={{ color: isNight ? p.accentDim : p.textDim }}>
              Page 1 (FAQ #65 sample) <span style={{ color: p.cardBorder }}>|</span>{' '}
              <span style={{ color: p.textMuted }}>Guided training + Try It simulation</span>
            </p>
          </div>
          <img className="h-8 md:h-10 w-auto object-contain hidden sm:block opacity-90" src={p.logoUrl} alt="CareIndeed Logo" />
        </div>

        {/* TABS */}
        <div className="max-w-[1800px] mx-auto w-full flex items-center justify-between border-b-2 border-transparent relative z-10">
          <div className="flex items-center gap-1 md:gap-2 overflow-x-auto">
            {[
              { id: 'REVIEW', label: 'Review Mode' },
              { id: 'LEARN', label: 'Start Learning' },
              { id: 'TRY_IT', label: 'Try It Mode' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  handleReset()
                }}
                className="px-4 md:px-6 py-3 text-[10px] md:text-[11px] font-bold tracking-widest uppercase transition-all whitespace-nowrap"
                style={{
                  borderBottom: activeTab === tab.id ? `2px solid ${p.accent2}` : '2px solid transparent',
                  color: activeTab === tab.id ? p.accent2 : p.textMuted,
                  background: activeTab === tab.id ? `${p.accent2}15` : 'transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('CHALLENGE')}
            className="px-6 py-2.5 mb-1 ml-4 rounded-t-[8px] text-[11px] font-bold tracking-widest uppercase transition-all flex items-center gap-2"
            style={{
              background: activeTab === 'CHALLENGE' ? p.accent2 : isNight ? p.bgAlt : p.card,
              color: activeTab === 'CHALLENGE' ? '#fff' : p.accent2,
              border: activeTab === 'CHALLENGE' ? 'none' : `1px solid ${p.cardBorder}`,
              borderBottom: 0,
              boxShadow: activeTab === 'CHALLENGE' ? `0 0 24px -4px ${p.accent2}99` : undefined,
            }}
          >
            <Trophy className="w-3.5 h-3.5" /> CMS-485 Challenge
          </button>
        </div>
      </header>

      {/* COVER */}
      {activeTab === 'COVER' && (
        <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center i485-slide-up p-6" style={{ background: p.coverBg }}>
          <div className="text-center max-w-lg relative z-10">
            <Presentation className="w-24 h-24 mx-auto mb-8" style={{ color: isNight ? p.accentDim : '#D9D6D5' }} />
            <h2 className="font-heading text-4xl font-bold mb-4" style={{ color: p.text }}>Start Learning</h2>
            <p className="text-lg leading-relaxed mb-10 font-light" style={{ color: p.textMuted }}>
              Follow step-by-step guided training. Learn the specific regulatory compliance requirements for every box on the CMS-485 form.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setActiveTab('LEARN')}
                className="w-full sm:w-auto px-8 py-3 rounded-[12px] text-white font-bold uppercase tracking-widest text-sm shadow-md transition-all hover:-translate-y-0.5"
                style={{ background: p.accentDim, boxShadow: `0 8px 24px -6px ${p.accentDim}66` }}
              >
                Begin Training
              </button>
              <button
                onClick={() => setActiveTab('CHALLENGE')}
                className="w-full sm:w-auto px-8 py-3 rounded-[12px] font-bold uppercase tracking-widest text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                style={{ background: isNight ? p.bg : '#fff', border: `1px solid ${p.accent2}`, color: p.accent2 }}
              >
                Take the Challenge <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      )}

      {/* REVIEW / LEARN / TRY_IT */}
      {['REVIEW', 'LEARN', 'TRY_IT'].includes(activeTab) && (
        <div className="flex-1 flex overflow-hidden i485-slide-up" style={{ background: isNight ? 'radial-gradient(circle at top right, #002B2C 0%, #010809 100%)' : p.bgAlt }}>
          <main className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-4xl">{renderForm()}</div>
          </main>
          {renderRightSidebar()}
        </div>
      )}

      {/* CHALLENGE */}
      {activeTab === 'CHALLENGE' && (
        <div className="flex-1 flex flex-col i485-slide-up h-full overflow-hidden relative" style={{ background: p.challengeBg }}>
          {isNight && (
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C74601] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.15] animate-pulse pointer-events-none" />
          )}

          {showCrisisWarning && !submissionResult && (
            <div className="text-white px-6 py-2 flex items-center justify-center gap-3 animate-pulse shadow-md z-20 flex-shrink-0 border-b" style={{ background: p.accent2, borderColor: '#E56E2E' }}>
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-widest text-center">
                Critical Safety Warning: Address HR 48 and unsecured firearm BEFORE wound care.
              </span>
            </div>
          )}

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1800px] mx-auto w-full z-10">
            {/* LEFT: Clinical Data */}
            <aside
              className="w-full lg:w-[350px] xl:w-[400px] border-r flex flex-col flex-shrink-0 h-[50vh] lg:h-auto shadow-2xl relative"
              style={{ borderColor: p.cardBorder, background: p.sidebarBg }}
            >
              <div className="p-5 md:p-6 space-y-4 border-b flex-shrink-0 z-10" style={{ borderColor: p.cardBorder, background: isNight ? p.bgDeep : p.card }}>
                <h2 className="font-heading font-bold text-lg flex items-center gap-2" style={{ color: p.text }}>
                  <FileText className="w-5 h-5" style={{ color: p.accent }} /> Clinical Case Data
                </h2>

                <div className="rounded-[16px] border p-4 shadow-sm" style={{ background: `${p.accent2}15`, borderColor: `${p.accent2}4d` }}>
                  <h3 className="font-heading font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: p.accent2 }}>
                    <Heart className="h-4 w-4" /> Critical Vitals
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(HENDERSON_NARRATIVE.vitals).map(([k, v]) => (
                      <div key={k} className="rounded-lg p-2 border" style={{ background: p.bg, borderColor: `${p.accent2}33` }}>
                        <p className="text-[10px] font-bold uppercase" style={{ color: `${p.accent2}b3` }}>
                          {k.replace(/([A-Z])/g, ' $1')}
                        </p>
                        <p className="text-xs font-medium mt-0.5" style={{ color: p.text }}>
                          {v}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[16px] border p-4 shadow-sm" style={{ background: p.bg, borderColor: p.cardBorder }}>
                  <h3 className="font-heading font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: p.accent2 }}>
                    <Home className="h-4 w-4" style={{ color: p.textDim }} /> Environmental Risks
                  </h3>
                  <ul className="space-y-2">
                    {HENDERSON_NARRATIVE.environmentalRisks.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-xs" style={{ color: p.textMuted }}>
                        <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: p.accent2 }} />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4" style={{ background: p.sidebarBg }}>
                {HENDERSON_NARRATIVE.sections.map((s, i) => (
                  <ExpandableCard key={i} title={s.title} content={s.content} defaultOpen={i === 0} p={p} />
                ))}
              </div>
            </aside>

            {/* RIGHT: Form + Answer Bank */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col h-[70vh] lg:h-auto scroll-smooth" style={{ background: isNight ? undefined : 'rgba(229,228,227,0.4)' }}>
              <div
                className="max-w-4xl mx-auto w-full mb-6 flex justify-between items-center p-4 rounded-[16px] border shadow-xl"
                style={{ background: isNight ? 'rgba(3,18,19,0.8)' : p.card, borderColor: p.cardBorder, backdropFilter: isNight ? 'blur(12px)' : undefined }}
              >
                <div>
                  <h2 className="font-heading font-bold text-lg" style={{ color: p.text }}>Interactive CMS-485 Form</h2>
                  <p className="text-xs" style={{ color: p.textMuted }}>Click on the highlighted fields below to choose an answer.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={!allBoxesFilled || !!submissionResult}
                    className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all"
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
                  {submissionResult && onProceed && (
                    <button
                      onClick={onProceed}
                      className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5"
                      style={{ background: p.accent, color: isNight ? '#010809' : '#fff', boxShadow: `0 0 24px -4px ${p.accent}99` }}
                    >
                      Proceed to Training
                    </button>
                  )}
                </div>
              </div>

              {renderForm()}

              {/* Answer Bank */}
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
                    className="rounded-[24px] border p-6 md:p-8 shadow-xl i485-slide-up relative"
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
                        Select Answer for {FORM_BOXES.find((b) => b.id === activeField)?.label}
                      </h3>
                      <p className="text-sm mt-1 font-light" style={{ color: p.textMuted }}>
                        Choose the most clinically accurate and defensible option below.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      {currentOptions.map((chip) => (
                        <button
                          key={chip.id}
                          onClick={() => handleOptionSelect(chip.id)}
                          className="w-full text-left rounded-[12px] border px-5 py-4 text-sm font-medium transition-all group flex items-start gap-3"
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
      )}
    </div>
  )
}
