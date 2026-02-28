import React, { useState, useMemo, useCallback, useRef } from 'react'
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  Heart,
  Home,
  Info,
  LayoutTemplate,
  Pointer,
  RotateCcw,
  ShieldAlert,
  Trophy,
  X,
  XCircle,
} from 'lucide-react'

/* ─── Theme palette (mirrors Interactive485Form) ───────────── */
interface Palette {
  bg: string; bgAlt: string; bgDeep: string; card: string; cardBorder: string
  text: string; textMuted: string; textDim: string
  accent: string; accentDim: string; accent2: string; accent2Dim: string; accent2Light: string
  inputFocus: string; formBg: string; formHeaderBg: string
  correctBg: string; incorrectBg: string; chipBg: string; chipBorder: string; chipText: string
  sidebarBg: string; challengeBg: string; coverBg: string
}

const NIGHT: Palette = {
  bg: '#010809', bgAlt: '#031213', bgDeep: '#020C0D', card: '#031213',
  cardBorder: '#004142', text: '#FAFBF8', textMuted: '#D9D6D5', textDim: '#747474',
  accent: '#64F4F5', accentDim: '#007970', accent2: '#C74601', accent2Dim: '#C74601', accent2Light: '#FFD5BF',
  inputFocus: 'rgba(100, 244, 245, 0.05)', formBg: '#020C0D', formHeaderBg: '#002B2C',
  correctBg: 'rgba(0,121,112,0.2)', incorrectBg: 'rgba(215,1,1,0.2)',
  chipBg: '#002B2C', chipBorder: '#007970', chipText: '#64F4F5',
  sidebarBg: '#031213', challengeBg: 'radial-gradient(circle at top right, #004142 0%, #001A1A 80%)',
  coverBg: 'radial-gradient(circle at top right, #004142 0%, #001A1A 80%)',
}

const LIGHT: Palette = {
  bg: '#FAFBF8', bgAlt: '#FAFBF8', bgDeep: '#FAFBF8', card: '#ffffff',
  cardBorder: '#E5E4E3', text: '#1F1C1B', textMuted: '#524048', textDim: '#747474',
  accent: '#007970', accentDim: '#006059', accent2: '#C74601', accent2Dim: '#C74601', accent2Light: '#FFD5BF',
  inputFocus: 'rgba(0, 121, 112, 0.05)', formBg: '#ffffff', formHeaderBg: '#004142',
  correctBg: '#F0FDFA', incorrectBg: '#FFF0F0',
  chipBg: '#E5FEFF', chipBorder: '#007970', chipText: '#007970',
  sidebarBg: '#FAFBF8', challengeBg: '#FAFBF8',
  coverBg: '#ffffff',
}

/* ─── Clinical narrative — identical to Interactive485Form ──── */
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
        'Upon arrival, the environment was compromised by a loaded handgun, requiring tactical communication to secure the area. The patient is ashen and bradycardic (HR 48); while neuropathy masks chest pain, the presentation suggests a "silent" MI requiring immediate 911 transfer. Simultaneously, the patient has an urgent Wagner Grade 3 great toe ulcer that currently probes to the bone. Socially, a neighbor (Mrs. Gable) arrived unannounced to discuss feline care for the patient\'s cat, "Pickles," as the power remains out.',
    },
    {
      title: 'Physician Coordination',
      content:
        'SN: Stabilization requires oversight for the first 72 hours (3 visits in week one). Frequency then drops to twice-weekly for the remaining 3 weeks of the month to monitor for osteomyelitis. The second month transitions to once-weekly for 4 weeks. PT: Sidelined by a 48-hour vascular hold for the pulseless left leg. Thereafter, visits are twice-weekly for 3 weeks, followed by once-weekly for 2 weeks.',
    },
  ],
}

/* ─── Answer chips — identical to Interactive485Form ────────── */
const ANSWER_CHIPS = [
  // BOX 11
  { id: '11-1', boxId: 'box-11', label: 'E11.621 (Type 2 DM w/ foot ulcer)' },
  { id: '11-2', boxId: 'box-11', label: 'L03.115 (Cellulitis of R lower limb)', trapNote: 'Coding Rule: Cellulitis is a manifestation of the wound. To justify Home Health, you must code the etiology (Diabetes) linked to the manifestation (Ulcer) to capture the full clinical picture.' },
  { id: '11-3', boxId: 'box-11', label: 'I70.202 (Atherosclerosis of L leg)', trapNote: 'Acuity Trap: While this is an acute issue, it is a reason for ER/Hospitalization. If it is the primary reason for the Home Health visit, the patient is technically too unstable for home care.' },
  { id: '11-4', boxId: 'box-11', label: 'R00.1 (Bradycardia, unspecified)', trapNote: 'Acuity Trap: This is an acute ER issue. If bradycardia is the primary reason for the Home Health visit, the patient is too unstable for home care.' },
  { id: '11-5', boxId: 'box-11', label: 'M86.9 (Osteomyelitis, unspecified)', trapNote: 'Pre-mature Coding: You cannot code Osteomyelitis as primary until it is confirmed by imaging (X-ray/MRI). Stick to the confirmed Wagner Grade 3 ulcer until the "probe-to-bone" is verified.' },
  { id: '11-6', boxId: 'box-11', label: 'L97.519 (Non-pressure chronic ulcer, unspec. severity)', trapNote: 'Specificity Failure: Medicare requires the most specific code available. "Unspecified chronic ulcer" is too vague when we know the patient has Type 2 Diabetes.' },
  { id: '11-7', boxId: 'box-11', label: 'I73.9 (Peripheral Vascular Disease)', trapNote: 'Specificity Failure: "PVD" is too vague for an ulcer case. Medicare requires the most specific code available.' },
  { id: '11-8', boxId: 'box-11', label: 'E11.40 (Type 2 DM w/ Neuropathy)', trapNote: 'This ignores the more acute foot ulcer. Neuropathy is contributing but the ulcer drives the skilled nursing need.' },
  { id: '11-9', boxId: 'box-11', label: 'Z48.01 (Encounter for change of surgical dressing)', trapNote: 'This is a routine aftercare code, not an illness code. It does not capture the medical necessity for home health.' },
  { id: '11-10', boxId: 'box-11', label: 'R41.0 (Disorientation, unspecified)', trapNote: 'Distractor Alert: Disorientation is a symptom, likely of the "Silent MI" or hyperglycemia. It does not justify the skilled nursing need for wound care.' },

  // BOX 15
  { id: '15-1', boxId: 'box-15', label: 'Endurance, Ambulation, LOPS (Loss of Protective Sensation)' },
  { id: '15-2', boxId: 'box-15', label: 'Total Assist for ADLs, Bedbound, Speech Impairment', trapNote: 'Overstates acuity; patient is chair-bound, not bedbound.' },
  { id: '15-3', boxId: 'box-15', label: 'Legally Blind, Hearing Impairment, Paralysis', trapNote: 'Not supported by the evaluation.' },
  { id: '15-4', boxId: 'box-15', label: 'Dyspnea with Minimal Exertion, Orthostatic Hypotension', trapNote: 'Clinically true but misses the neurological component (LOPS).' },
  { id: '15-5', boxId: 'box-15', label: 'Contracture, Amputation Risk, Bowel/Bladder Incontinence', trapNote: 'Plausible but lacks specific primary evidence from the narrative.' },
  { id: '15-6', boxId: 'box-15', label: 'Cognitive Impairment, Memory Loss, Disorientation', trapNote: 'Confusion is secondary to the cardiac/metabolic crisis.' },
  { id: '15-7', boxId: 'box-15', label: 'Severe Pain, Joint Stiffness, Limited Range of Motion', trapNote: 'Neuropathy often masks pain in Grade 3 ulcers \u2014 contradicts the narrative.' },
  { id: '15-8', boxId: 'box-15', label: 'Fragile Skin, Decubitus Ulcer Risk, Poor Nutritional Status', trapNote: 'General "catch-all" used incorrectly for this specific case.' },
  { id: '15-9', boxId: 'box-15', label: 'Profound Generalized Weakness and Fatigue Only', trapNote: 'Not specific enough for Box 15.' },
  { id: '15-10', boxId: 'box-15', label: 'Dependent on Oxygen, Wheelchair Bound, Aphasia', trapNote: 'Irrelevant clinical data not supported by the narrative.' },

  // BOX 18
  { id: '18-1', boxId: 'box-18', label: 'Cleanse w/ NS, apply Collagen, cover foam; notify MD of Wagner 3 & request X-ray' },
  { id: '18-2', boxId: 'box-18', label: 'Cleanse w/ Betadine, apply dry sterile dressing, change every 3 days', trapNote: 'Betadine is cytotoxic to healthy tissue; every 3 days is too infrequent for a Grade 3 ulcer.' },
  { id: '18-3', boxId: 'box-18', label: 'Soak foot in Epsom salts 15 mins daily; apply OTC antibiotic ointment', trapNote: 'Soaking is strictly contraindicated for diabetics with neuropathy.' },
  { id: '18-4', boxId: 'box-18', label: 'Apply Silver Sulfadiazine cream and leave open to air to promote drying', trapNote: 'Wounds need moisture balance, not drying. Leaving open increases infection risk.' },
  { id: '18-5', boxId: 'box-18', label: 'Cleanse w/ Hydrogen Peroxide and pack with wet-to-dry gauze BID', trapNote: 'Peroxide damages healthy tissue; wet-to-dry is outdated practice.' },
  { id: '18-6', boxId: 'box-18', label: 'Apply Hydrogel and instruct patient on autolytic debridement daily', trapNote: 'Too passive for a bone-involved infection requiring immediate escalation.' },
  { id: '18-7', boxId: 'box-18', label: 'Enforce bedrest; wrap foot in heating pad to increase circulation', trapNote: 'Danger! Heating pads cause burns in neuropathy patients because they cannot feel the heat.' },
  { id: '18-8', boxId: 'box-18', label: 'Apply Honey-based dressing and check pulse once weekly', trapNote: 'Pulse must be checked daily in ischemia cases, not once weekly.' },
  { id: '18-9', boxId: 'box-18', label: "Irrigate wound with Dakin\u2019s solution and apply pressure dressing", trapNote: "Too aggressive; Dakin\u2019s is for specific necrotic cases, not appropriate here." },
  { id: '18-10', boxId: 'box-18', label: 'Debride yellow slough at bedside with surgical blade; apply gauze', trapNote: 'Debridement requires a specific physician order and specialist involvement.' },

  // BOX 21
  { id: '21-1', boxId: 'box-21', label: 'SN: 3w1, 2w3, 1w4 | PT: 2w3, 1w2' },
  { id: '21-2', boxId: 'box-21', label: 'SN: 7w1, 2w3, 1w4 | PT: 2w3, 1w2', trapNote: '72 hours of stabilization equals 3 calendar days. Coding 7w1 suggests a full week of daily visits \u2014 over-utilization not supported by the 72-hour narrative.' },
  { id: '21-3', boxId: 'box-21', label: 'SN: 3w1, 2w7 | PT: 1w5', trapNote: 'Audit Failure: Keeping a high frequency for 7 weeks without a step-down suggests the patient is not improving, which can lead to claim denials.' },
  { id: '21-4', boxId: 'box-21', label: 'SN: 3w1, 2w3, 1w4 | PT: 1w1, 2w4', trapNote: 'The narrative states PT starts after a 48-hour hold within the existing week. Adding an extra 1w1 evaluation week incorrectly extends the certification period.' },
  { id: '21-5', boxId: 'box-21', label: 'SN: 1w9 | PT: 2w5', trapNote: 'Safety Risk: 1w9 is insufficient for a Wagner Grade 3 ulcer and unstable cardiac status. This fails to provide the skilled oversight required.' },
  { id: '21-6', boxId: 'box-21', label: 'SN: 7w1, 2w8 | PT: 2w5', trapNote: 'Documentation Discrepancy: These numbers do not appear in the physician coordination notes. The 485 must match the coordination exactly.' },
  { id: '21-7', boxId: 'box-21', label: 'SN: 3w1, 2w3, 1w4 | PT: 2w5', trapNote: 'PT Logic Error: The narrative explicitly requested a taper to once-weekly for the final two weeks. Failing to taper suggests a lack of discharge planning.' },
  { id: '21-8', boxId: 'box-21', label: 'SN: 5w1, 3w3, 2w5 | PT: 3w2, 1w3', trapNote: 'Documentation Discrepancy: Arbitrary numbers not supported by the physician coordination narrative.' },
  { id: '21-9', boxId: 'box-21', label: 'SN: 2w4, 1w5 | PT: 2w4, 1w5', trapNote: 'Mirroring disciplines (giving SN and PT the same schedule) is a red flag for "cookie-cutter" care. Each discipline must have its own justified frequency.' },
  { id: '21-10', boxId: 'box-21', label: 'SN: 4w1, 2w8 | PT: 2w8', trapNote: 'Mirroring and math errors. Fails to address the 72-hour stabilization requirement.' },

  // BOX 24
  { id: '24-1', boxId: 'box-24', label: 'Establish safe environment: secure firearm, initiate 911 transfer for HR 48' },
  { id: '24-2', boxId: 'box-24', label: 'Perform wound care to R great toe to prevent further infection', trapNote: 'Clinical Negligence: Performing wound care while a patient is ashen and bradycardic (HR 48) is a failure to recognize a life-threatening cardiac event.' },
  { id: '24-3', boxId: 'box-24', label: 'Secure the firearm and then perform a 12-lead EKG', trapNote: 'Delay of Care: You are in a home, not an ER. Performing a 12-lead EKG delays the definitive care provided by EMS and the hospital.' },
  { id: '24-4', boxId: 'box-24', label: 'Educate daughter on insulin storage temperatures (78\u00B0F)', trapNote: 'Priority Error: Insulin temperatures are a logistical issue. You are currently facing a life-safety issue.' },
  { id: '24-5', boxId: 'box-24', label: 'Assess the L leg pulselessness and apply a warm compress', trapNote: 'Danger! Applying heat to an ischemic limb (no pulse) can cause catastrophic tissue damage because the blood flow cannot carry the heat away.' },
  { id: '24-6', boxId: 'box-24', label: 'Locate "Pickles" the cat to reduce patient anxiety/confusion', trapNote: 'Focus! While the patient is worried about the cat, the clinician must ignore the "Pickles" distractor to manage the active Myocardial Infarction.' },
  { id: '24-7', boxId: 'box-24', label: 'Contact the power company to restore electricity for the patient', trapNote: 'Priority Error: Power restoration is a social work task, not a life-safety priority during a cardiac emergency.' },
  { id: '24-8', boxId: 'box-24', label: 'Reconcile the Glyburide/Lisinopril error immediately', trapNote: 'Important, but secondary. Medication reconciliation does not fix the active Silent MI.' },
  { id: '24-9', boxId: 'box-24', label: 'Apply a pressure dressing to the R great toe ulcer', trapNote: 'Improper wound care technique for a Wagner Grade 3 ulcer, and ignores the active cardiac emergency.' },
  { id: '24-10', boxId: 'box-24', label: 'Instruct Mrs. Gable to take the patient to her house', trapNote: 'Abandonment: Moving an unstable, bradycardic patient to a neighbor\u2019s house without medical transport is unsafe and legally indefensible.' },
]

const FORM_BOXES = [
  {
    id: 'box-11',
    label: '11. Principal Diagnosis',
    correctChipId: '11-1',
    tooltipWhy: 'CMS requires the primary diagnosis to be the root condition requiring oversight, not just the superficial symptom.',
    validationAffirmation: 'E11.621 identifies both the underlying cause (Diabetes) and the acute manifestation (foot ulcer) requiring skilled care. While the patient is also bradycardic, the bradycardia is an emergency reason for transfer, not the primary driver of the home health certification period.',
  },
  {
    id: 'box-15',
    label: '15. Functional Limitations',
    correctChipId: '15-1',
    tooltipWhy: 'Why did the wound get so bad? The patient cannot feel their feet.',
    validationAffirmation: 'Ambulation/Endurance are limited by the current cardiac status (HR 48) and the pulseless left leg. LOPS is confirmed by the clinical narrative stating "profound diabetic peripheral neuropathy" is masking typical symptoms like chest pressure.',
  },
  {
    id: 'box-18',
    label: '18. Skilled Nursing Orders',
    correctChipId: '18-1',
    tooltipWhy: 'Probe-to-bone is a major red flag indicating suspected osteomyelitis.',
    validationAffirmation: 'The evaluation specifies a Wagner Grade 3 great toe ulcer that "probes to the bone." Standard clinical practice for a probe-to-bone finding requires immediate MD notification and an X-ray to rule out osteomyelitis (bone infection).',
  },
  {
    id: 'box-21',
    label: '21. Visit Frequency',
    correctChipId: '21-1',
    tooltipWhy: '72 hours = 3 days. Month 1 has 4 weeks. Month 2 has 4 weeks.',
    validationAffirmation: 'SN: The physician notes state \"72 hours\" of stabilization = 3 days in week one (3w1), NOT 7w1. Then twice-weekly for the remaining 3 weeks (2w3), once-weekly for month two (1w4). PT: After a 48-hour vascular hold, twice-weekly for 3 weeks (2w3), tapering to once-weekly for 2 weeks (1w2).',
  },
  {
    id: 'box-24',
    label: '24. Safety / Emergency Actions',
    correctChipId: '24-1',
    tooltipWhy: 'Safety and life-stabilization always precede wound healing.',
    validationAffirmation: 'Life-Safety First: Clinical protocols mandate establishing a safe environment (securing the loaded handgun) before beginning medical interventions. A heart rate of 48 bpm (bradycardia) in an ashen, diaphoretic patient suggests a \"silent\" myocardial infarction masked by neuropathy \u2014 a life-threatening emergency requiring immediate 911 transfer.',
  },
]

/* ─── Expandable card sub-component ────────────────────────── */
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

/* ─── Props ─────────────────────────────────────────────────── */
interface Props {
  theme?: 'night' | 'day'
  inline?: boolean
  onComplete?: () => void
  onBack?: () => void
}

/* ─── Henderson POC Challenge ──────────────────────────────── */
export default function HendersonChallenge({ theme = 'night', inline, onComplete, onBack }: Props) {
  const p = theme === 'night' ? NIGHT : LIGHT
  const isNight = theme === 'night'

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
    if (correct.length === FORM_BOXES.length && safetyFirst) {
      setShowBreakdown(true)
    }
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

  /* ─── CSS ────────────────────────────────────────────────── */
  const dynamicCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
    .font-heading { font-family: 'Montserrat', sans-serif; }
    .font-body { font-family: 'Roboto', sans-serif; }
    .hc-root ::-webkit-scrollbar { width: 8px; }
    .hc-root ::-webkit-scrollbar-track { background: ${p.bg}; }
    .hc-root ::-webkit-scrollbar-thumb { background: ${p.cardBorder}; border-radius: 4px; }
    .hc-root ::-webkit-scrollbar-thumb:hover { background: ${p.accentDim}; }
    @keyframes hcSlideUp {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .hc-slide-up { animation: hcSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `

  /* ─── Interactive field renderer ─────────────────────────── */
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
            <strong className="block mb-1" style={{ color: p.accent2 }}>CareIndeed Clinical Tip:</strong>
            {box.tooltipWhy}
          </div>
        )}

        {isIncorrect && chip && (chip as any).trapNote && (
          <div
            className="absolute top-full left-0 w-full mt-1 p-2 rounded-md text-[10px] z-40 shadow-lg hc-slide-up"
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

  /* ─── Form renderer ──────────────────────────────────────── */
  const renderForm = () => {
    const labelColor = p.accent
    const rowBg = p.bg

    return (
      <div className="max-w-4xl mx-auto w-full border-2 shadow-2xl font-body relative mb-12 overflow-hidden" style={{ background: p.formBg, borderColor: p.cardBorder, color: p.text }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between p-3 font-bold border-b" style={{ background: p.formHeaderBg, borderColor: p.cardBorder, color: '#fff' }}>
          <span className="text-sm md:text-base tracking-wide uppercase">Home Health Certification and Plan of Care</span>
          <span className="text-xs md:text-sm" style={{ color: isNight ? '#64F4F5' : '#C4F4F5' }}>Form CMS-485</span>
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
              <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>{f.num}. {f.label}</span>
              <div className="text-xs mt-1" style={{ color: p.textMuted }}>{f.val}</div>
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div className="border-b p-2" style={{ borderColor: p.cardBorder, background: rowBg }}>
          <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>6. Patient Name, Address, DOB</span>
          <div className="text-xs mt-1" style={{ color: p.textMuted }}>George Henderson | 1247 Birch Hollow Ln, Sacramento, CA 95811 | DOB 11/03/1948</div>
        </div>

        {/* Row 3 — Diagnoses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-b" style={{ borderColor: p.cardBorder, background: rowBg }}>
          <div className="border-r border-b sm:border-b-0 p-2 min-h-[80px]" style={{ borderColor: p.cardBorder }}>
            {renderInteractiveField('box-11')}
          </div>
          <div className="p-2 min-h-[80px]">
            <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>12. Other Pertinent DX</span>
            <div className="text-xs mt-1 whitespace-pre-line" style={{ color: p.textMuted }}>
              {'I73.9 Peripheral vascular disease\nR00.1 Bradycardia\nE11.65 T2DM w/ hyperglycemia\nI10 Essential HTN'}
            </div>
          </div>
        </div>

        {/* Row 4 — Functional Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b" style={{ borderColor: p.cardBorder, background: rowBg }}>
          <div className="border-r border-b sm:border-b-0 p-2 min-h-[70px]" style={{ borderColor: p.cardBorder }}>
            <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>14. DME / Supplies</span>
            <div className="text-xs mt-1" style={{ color: p.textMuted }}>Wound care kit, rolling walker, compression stockings</div>
          </div>
          <div className="border-r border-b sm:border-b-0 p-2 min-h-[70px]" style={{ borderColor: p.cardBorder }}>
            {renderInteractiveField('box-15')}
          </div>
          <div className="p-2 min-h-[70px]">
            <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>16. Mental Status</span>
            <div className="text-xs mt-1" style={{ color: p.textMuted }}>Oriented x3, Anxious, Cooperative</div>
          </div>
        </div>

        {/* Row 5 — Orders */}
        <div className="border-b p-2 min-h-[100px]" style={{ borderColor: p.cardBorder, background: rowBg }}>
          {renderInteractiveField('box-18', 'min-h-[100px]')}
        </div>

        {/* Row 6 — Goals & Frequency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-b" style={{ borderColor: p.cardBorder, background: rowBg }}>
          <div className="border-r border-b sm:border-b-0 p-2 min-h-[80px]" style={{ borderColor: p.cardBorder }}>
            {renderInteractiveField('box-21')}
          </div>
          <div className="p-2 min-h-[80px]">
            <span className="text-[9px] font-bold uppercase block" style={{ color: labelColor }}>22. Goals / Rehab Potential</span>
            <div className="text-xs mt-1 whitespace-pre-line" style={{ color: p.textMuted }}>
              {'G1: Wound bed granulating >50% by visit 6\nG2: BS consistently <200 by week 3\nRehab: Fair — pending vascular clearance'}
            </div>
          </div>
        </div>

        {/* Row 7 — Safety */}
        <div className="border-b p-2 min-h-[80px]" style={{ borderColor: p.cardBorder, background: rowBg }}>
          {renderInteractiveField('box-24')}
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 p-2 text-[10px] border-t" style={{ background: p.bgDeep, color: isNight ? p.accent : p.textDim, borderColor: p.cardBorder }}>
          <div>26. Signature of Physician: ______________________</div>
          <div className="text-right">Date: __/__/____</div>
        </div>
      </div>
    )
  }

  /* ─── COMPLETION MODAL ───────────────────────────────────── */
  if (showBreakdown && submissionResult) {
    return (
      <div className="hc-root font-body flex items-center justify-center p-6 flex-1 overflow-y-auto" style={{ background: p.bg, color: p.text }}>
        <style>{dynamicCSS}</style>
        <div
          className="max-w-4xl w-full rounded-[32px] border shadow-2xl p-10 lg:p-16 hc-slide-up relative overflow-hidden"
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
                Henderson POC — Complete
              </h1>
              <p style={{ color: p.textMuted }} className="text-lg">
                CareIndeed Clinical Master Confirmed! You successfully navigated 27 clinical and administrative traps. You prioritized life over logistics, etiology over symptoms, and precise math over "cookie-cutter" scheduling. George Henderson is safe because of your clinical judgment.
              </p>
            </div>

            <div className="space-y-6">
              {FORM_BOXES.map((box) => (
                <div key={box.id} className="rounded-[20px] border p-6 shadow-sm" style={{ background: p.bg, borderColor: p.cardBorder }}>
                  <h3 className="font-heading text-lg font-bold mb-2" style={{ color: p.accent }}>{box.label}</h3>
                  <p className="leading-relaxed font-light" style={{ color: p.text }}>{box.validationAffirmation}</p>
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
                onClick={handleReset}
                className="rounded-[16px] px-10 py-4 font-bold text-lg tracking-wide transition-all hover:-translate-y-1 flex items-center gap-2"
                style={{ background: isNight ? p.bgDeep : '#F2F4F7', color: p.text, border: `1px solid ${p.cardBorder}` }}
              >
                <RotateCcw className="w-5 h-5" /> Try Again
              </button>
              {onComplete && (
                <button
                  onClick={onComplete}
                  className="rounded-[16px] text-white px-10 py-4 font-bold text-lg tracking-wide transition-all hover:-translate-y-1"
                  style={{ background: p.accent2, boxShadow: `0 0 24px -4px ${p.accent2}99` }}
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ─── MAIN RENDER ────────────────────────────────────────── */
  const wrapperClass = inline
    ? 'hc-root flex flex-col flex-1 font-body overflow-hidden'
    : 'hc-root flex flex-col h-screen w-full font-body overflow-hidden'

  return (
    <div className={wrapperClass} style={{ background: p.bg, color: p.text }}>
      <style>{dynamicCSS}</style>

      {showCrisisWarning && !submissionResult && (
        <div className="text-white px-6 py-2 flex items-center justify-center gap-3 animate-pulse shadow-md z-20 flex-shrink-0 border-b" style={{ background: p.accent2, borderColor: '#E56E2E' }}>
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm font-bold uppercase tracking-widest text-center">
            Critical Safety Warning: Address HR 48 and unsecured firearm BEFORE wound care.
          </span>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full z-10 hc-slide-up" style={{ background: p.challengeBg }}>
        {/* LEFT — Clinical Data */}
        <aside
          className="w-full lg:w-[350px] xl:w-[400px] border-r flex flex-col flex-shrink-0 h-[50vh] lg:h-auto shadow-2xl relative"
          style={{ borderColor: p.cardBorder, background: p.sidebarBg }}
        >
          <div className="p-5 md:p-6 space-y-4 border-b flex-shrink-0 z-10" style={{ borderColor: p.cardBorder, background: isNight ? p.bgDeep : p.card }}>
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg flex items-center gap-2" style={{ color: p.text }}>
                <FileText className="w-5 h-5" style={{ color: p.accent }} /> Henderson POC
              </h2>
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80"
                  style={{ color: p.accent, borderColor: p.cardBorder, background: p.bg }}
                >
                  Back
                </button>
              )}
            </div>

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
                    <p className="text-xs font-medium mt-0.5" style={{ color: p.text }}>{v}</p>
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

        {/* RIGHT — Form + Answer Bank */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col h-[70vh] lg:h-auto scroll-smooth" style={{ background: isNight ? undefined : 'rgba(229,228,227,0.4)' }}>
          <div
            className="max-w-4xl mx-auto w-full mb-6 flex justify-between items-center p-4 rounded-[16px] border shadow-xl"
            style={{ background: isNight ? 'rgba(3,18,19,0.8)' : p.card, borderColor: p.cardBorder, backdropFilter: isNight ? 'blur(12px)' : undefined }}
          >
            <div>
              <h2 className="font-heading font-bold text-lg" style={{ color: p.text }}>
                Henderson Clinical Challenge
              </h2>
              <p className="text-xs" style={{ color: p.textMuted }}>Click on the highlighted fields below to choose an answer.</p>
            </div>
            <div className="flex items-center gap-3">
              {submissionResult && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1.5"
                  style={{ background: isNight ? '#002B2C' : '#F2F4F7', color: p.accent, border: `1px solid ${p.cardBorder}` }}
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              )}
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
                className="rounded-[24px] border p-6 md:p-8 shadow-xl hc-slide-up relative"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentOptions.map((chip) => (
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
  )
}
