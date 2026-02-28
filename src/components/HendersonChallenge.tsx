import { useState, useMemo } from 'react'
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Heart,
  Home,
  RotateCcw,
  ShieldAlert,
  Trophy,
  XCircle,
} from 'lucide-react'

/* ─── Clinical narrative (shortened per update) ────────────── */
const VITALS: [string, string][] = [
  ['Heart Rate', '48 bpm (Ashen)'],
  ['Blood Sugar', '342 mg/dL'],
  ['Blood Pressure', '158/92'],
  ['Left Leg', 'Cold, Pulseless'],
]

const ENV_RISKS = [
  'Loaded firearm on nightstand',
  'Power currently out',
  'Insulin stored warm',
  'Caregiver (daughter) quit',
]

const NARRATIVE_SECTIONS = [
  {
    title: 'Clinical Evaluation',
    content:
      'Upon arrival, the environment was compromised by a loaded handgun, requiring tactical communication to secure the area. The patient is ashen and bradycardic (HR 48); while neuropathy masks chest pain, the presentation suggests a "silent" MI requiring immediate 911 transfer. Simultaneously, the patient has an urgent Wagner Grade 3 great toe ulcer that currently probes to the bone. Socially, a neighbor (Mrs. Gable) arrived unannounced to discuss feline care for the patient\'s cat, "Pickles," as the power remains out.',
  },
  {
    title: 'Physician Coordination',
    content:
      'SN: Stabilization requires oversight for the first 72 hours (3 visits in week one). Frequency then drops to twice-weekly for the remaining 3 weeks of the month to monitor for osteomyelitis. The second month transitions to once-weekly for 4 weeks. PT: Sidelined by a 48-hour vascular hold for the pulseless left leg. Thereafter, visits are twice-weekly for 3 weeks, followed by once-weekly for 2 weeks.',
  },
]

/* ─── Challenge steps (one box per step) ───────────────────── */
interface ChallengeStep {
  boxLabel: string
  question: string
  options: { label: string; trapNote?: string }[]
  correctIndex: number
  correctLogic: string
}

const STEPS: ChallengeStep[] = [
  {
    boxLabel: 'Box 11 — Principal Diagnosis',
    question: 'Which ICD-10 code should be listed as the principal diagnosis for this home health episode?',
    options: [
      { label: 'E11.621 (Type 2 DM w/ foot ulcer)' },
      { label: 'L03.115 (Cellulitis of R lower limb)', trapNote: 'Coding Rule: Cellulitis is a manifestation of the wound. To justify Home Health, you must code the etiology (Diabetes) linked to the manifestation (Ulcer) to capture the full clinical picture.' },
      { label: 'I70.202 (Atherosclerosis of L leg)', trapNote: 'Acuity Trap: While this is an acute issue, it is a reason for ER/Hospitalization. If it is the primary reason for the Home Health visit, the patient is technically too unstable for home care.' },
      { label: 'R00.1 (Bradycardia, unspecified)', trapNote: 'Acuity Trap: This is an acute ER issue. If bradycardia is the primary reason for the Home Health visit, the patient is too unstable for home care.' },
      { label: 'M86.9 (Osteomyelitis, unspecified)', trapNote: 'Pre-mature Coding: You cannot code Osteomyelitis as primary until it is confirmed by imaging (X-ray/MRI). Stick to the confirmed Wagner Grade 3 ulcer until the "probe-to-bone" is verified.' },
      { label: 'L97.519 (Non-pressure chronic ulcer, unspec. severity)', trapNote: 'Specificity Failure: Medicare requires the most specific code available. "Unspecified chronic ulcer" is too vague when we know the patient has Type 2 Diabetes.' },
      { label: 'I73.9 (Peripheral Vascular Disease)', trapNote: 'Specificity Failure: "PVD" is too vague for an ulcer case. Medicare requires the most specific code available.' },
      { label: 'E11.40 (Type 2 DM w/ Neuropathy)', trapNote: 'This ignores the more acute foot ulcer. Neuropathy is contributing but the ulcer drives the skilled nursing need.' },
      { label: 'Z48.01 (Encounter for change of surgical dressing)', trapNote: 'This is a routine aftercare code, not an illness code. It does not capture the medical necessity for home health.' },
      { label: 'R41.0 (Disorientation, unspecified)', trapNote: 'Distractor Alert: Disorientation is a symptom, likely of the "Silent MI" or hyperglycemia. It does not justify the skilled nursing need for wound care.' },
    ],
    correctIndex: 0,
    correctLogic: 'E11.621 identifies both the underlying cause (Diabetes) and the acute manifestation (foot ulcer) requiring skilled care. While the patient is also bradycardic, the bradycardia is an emergency reason for transfer, not the primary driver of the home health certification period.',
  },
  {
    boxLabel: 'Box 15 — Functional Limitations',
    question: 'Which functional limitations best describe this patient\'s clinical picture?',
    options: [
      { label: 'Endurance, Ambulation, LOPS (Loss of Protective Sensation)' },
      { label: 'Total Assist for ADLs, Bedbound, Speech Impairment', trapNote: 'Overstates acuity; patient is chair-bound, not bedbound.' },
      { label: 'Legally Blind, Hearing Impairment, Paralysis', trapNote: 'Not supported by the evaluation.' },
      { label: 'Dyspnea with Minimal Exertion, Orthostatic Hypotension', trapNote: 'Clinically true but misses the neurological component (LOPS).' },
      { label: 'Contracture, Amputation Risk, Bowel/Bladder Incontinence', trapNote: 'Plausible but lacks specific primary evidence from the narrative.' },
      { label: 'Cognitive Impairment, Memory Loss, Disorientation', trapNote: 'Confusion is secondary to the cardiac/metabolic crisis.' },
      { label: 'Severe Pain, Joint Stiffness, Limited Range of Motion', trapNote: 'Neuropathy often masks pain in Grade 3 ulcers \u2014 contradicts the narrative.' },
      { label: 'Fragile Skin, Decubitus Ulcer Risk, Poor Nutritional Status', trapNote: 'General "catch-all" used incorrectly for this specific case.' },
      { label: 'Profound Generalized Weakness and Fatigue Only', trapNote: 'Not specific enough for Box 15.' },
      { label: 'Dependent on Oxygen, Wheelchair Bound, Aphasia', trapNote: 'Irrelevant clinical data not supported by the narrative.' },
    ],
    correctIndex: 0,
    correctLogic: 'Ambulation/Endurance are limited by the current cardiac status (HR 48) and the pulseless left leg. LOPS is confirmed by the clinical narrative stating "profound diabetic peripheral neuropathy" is masking typical symptoms like chest pressure.',
  },
  {
    boxLabel: 'Box 18 — Skilled Nursing Orders',
    question: 'Which skilled nursing order is the most appropriate for this patient\'s wound?',
    options: [
      { label: 'Cleanse w/ NS, apply Collagen, cover foam; notify MD of Wagner 3 & request X-ray' },
      { label: 'Cleanse w/ Betadine, apply dry sterile dressing, change every 3 days', trapNote: 'Betadine is cytotoxic to healthy tissue; every 3 days is too infrequent for a Grade 3 ulcer.' },
      { label: 'Soak foot in Epsom salts 15 mins daily; apply OTC antibiotic ointment', trapNote: 'Soaking is strictly contraindicated for diabetics with neuropathy.' },
      { label: 'Apply Silver Sulfadiazine cream and leave open to air to promote drying', trapNote: 'Wounds need moisture balance, not drying. Leaving open increases infection risk.' },
      { label: 'Cleanse w/ Hydrogen Peroxide and pack with wet-to-dry gauze BID', trapNote: 'Peroxide damages healthy tissue; wet-to-dry is outdated practice.' },
      { label: 'Apply Hydrogel and instruct patient on autolytic debridement daily', trapNote: 'Too passive for a bone-involved infection requiring immediate escalation.' },
      { label: 'Enforce bedrest; wrap foot in heating pad to increase circulation', trapNote: 'Danger! Heating pads cause burns in neuropathy patients because they cannot feel the heat.' },
      { label: 'Apply Honey-based dressing and check pulse once weekly', trapNote: 'Pulse must be checked daily in ischemia cases, not once weekly.' },
      { label: 'Irrigate wound with Dakin\u2019s solution and apply pressure dressing', trapNote: 'Too aggressive; Dakin\u2019s is for specific necrotic cases, not appropriate here.' },
      { label: 'Debride yellow slough at bedside with surgical blade; apply gauze', trapNote: 'Debridement requires a specific physician order and specialist involvement.' },
    ],
    correctIndex: 0,
    correctLogic: 'The evaluation specifies a Wagner Grade 3 great toe ulcer that "probes to the bone." Standard clinical practice for a probe-to-bone finding requires immediate MD notification and an X-ray to rule out osteomyelitis (bone infection). NS cleansing with collagen and foam is appropriate wound care.',
  },
  {
    boxLabel: 'Box 21 — Visit Frequency',
    question: 'Based on the physician coordination notes, what is the correct visit frequency?',
    options: [
      { label: 'SN: 3w1, 2w3, 1w4 | PT: 2w3, 1w2' },
      { label: 'SN: 7w1, 2w3, 1w4 | PT: 2w3, 1w2', trapNote: '72 hours of stabilization equals 3 calendar days. Coding 7w1 suggests a full week of daily visits \u2014 over-utilization not supported by the 72-hour narrative.' },
      { label: 'SN: 3w1, 2w7 | PT: 1w5', trapNote: 'Audit Failure: Keeping a high frequency for 7 weeks without a step-down suggests the patient is not improving, which can lead to claim denials.' },
      { label: 'SN: 3w1, 2w3, 1w4 | PT: 1w1, 2w4', trapNote: 'The narrative states PT starts after a 48-hour hold within the existing week. Adding an extra 1w1 evaluation week incorrectly extends the certification period.' },
      { label: 'SN: 1w9 | PT: 2w5', trapNote: 'Safety Risk: 1w9 is insufficient for a Wagner Grade 3 ulcer and unstable cardiac status. This fails to provide the skilled oversight required.' },
      { label: 'SN: 7w1, 2w8 | PT: 2w5', trapNote: 'Documentation Discrepancy: These numbers do not appear in the physician coordination notes. The 485 must match the coordination exactly.' },
      { label: 'SN: 3w1, 2w3, 1w4 | PT: 2w5', trapNote: 'PT Logic Error: The narrative explicitly requested a taper to once-weekly for the final two weeks. Failing to taper suggests a lack of discharge planning.' },
      { label: 'SN: 5w1, 3w3, 2w5 | PT: 3w2, 1w3', trapNote: 'Documentation Discrepancy: Arbitrary numbers not supported by the physician coordination narrative.' },
      { label: 'SN: 2w4, 1w5 | PT: 2w4, 1w5', trapNote: 'Mirroring disciplines (giving SN and PT the same schedule) is a red flag for "cookie-cutter" care. Each discipline must have its own justified frequency.' },
      { label: 'SN: 4w1, 2w8 | PT: 2w8', trapNote: 'Mirroring and math errors. Fails to address the 72-hour stabilization requirement.' },
    ],
    correctIndex: 0,
    correctLogic: 'SN: The physician notes state "72 hours" of stabilization = 3 days in week one (3w1), NOT 7w1. Then twice-weekly for the remaining 3 weeks (2w3), once-weekly for month two (1w4). PT: After a 48-hour vascular hold, twice-weekly for 3 weeks (2w3), tapering to once-weekly for 2 weeks (1w2).',
  },
  {
    boxLabel: 'Box 24 — Safety / Emergency Actions',
    question: 'What is the FIRST clinical priority upon arriving at Henderson\'s home?',
    options: [
      { label: 'Establish safe environment: secure firearm, initiate 911 transfer for HR 48' },
      { label: 'Perform wound care to R great toe to prevent further infection', trapNote: 'Clinical Negligence: Performing wound care while a patient is ashen and bradycardic (HR 48) is a failure to recognize a life-threatening cardiac event.' },
      { label: 'Secure the firearm and then perform a 12-lead EKG', trapNote: 'Delay of Care: You are in a home, not an ER. Performing a 12-lead EKG delays the definitive care provided by EMS and the hospital.' },
      { label: 'Educate daughter on insulin storage temperatures (78\u00B0F)', trapNote: 'Priority Error: Insulin temperatures are a logistical issue. You are currently facing a life-safety issue.' },
      { label: 'Assess the L leg pulselessness and apply a warm compress', trapNote: 'Danger! Applying heat to an ischemic limb (no pulse) can cause catastrophic tissue damage because the blood flow cannot carry the heat away.' },
      { label: 'Locate "Pickles" the cat to reduce patient anxiety/confusion', trapNote: 'Focus! While the patient is worried about the cat, the clinician must ignore the "Pickles" distractor to manage the active Myocardial Infarction.' },
      { label: 'Contact the power company to restore electricity for the patient', trapNote: 'Priority Error: Power restoration is a social work task, not a life-safety priority during a cardiac emergency.' },
      { label: 'Reconcile the Glyburide/Lisinopril error immediately', trapNote: 'Important, but secondary. Medication reconciliation does not fix the active Silent MI.' },
      { label: 'Apply a pressure dressing to the R great toe ulcer', trapNote: 'Improper wound care technique for a Wagner Grade 3 ulcer, and ignores the active cardiac emergency.' },
      { label: 'Instruct Mrs. Gable to take the patient to her house', trapNote: 'Abandonment: Moving an unstable, bradycardic patient to a neighbor\u2019s house without medical transport is unsafe and legally indefensible.' },
    ],
    correctIndex: 0,
    correctLogic: 'Life-Safety First: Clinical protocols mandate establishing a safe environment (securing the loaded handgun) before beginning medical interventions. A heart rate of 48 bpm (bradycardia) in an ashen, diaphoretic patient suggests a "silent" myocardial infarction masked by neuropathy \u2014 a life-threatening emergency requiring immediate 911 transfer.',
  },
]

/* ─── Props ─────────────────────────────────────────────────── */
interface Props {
  theme?: 'night' | 'day'
  inline?: boolean
  onComplete?: () => void
  onBack?: () => void
}

/* ─── Deterministic shuffle (stable per step) ──────────────── */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr]
  let s = seed
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647
    const j = s % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Henderson POC Challenge — Card-sized step-through quiz
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function HendersonChallenge({ theme = 'day', inline, onComplete, onBack }: Props) {
  const isDark = theme === 'night'

  /* state */
  const [currentStep, setCurrentStep] = useState(0)
  const [selected, setSelected] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({})
  const [expandedNarrative, setExpandedNarrative] = useState<number | null>(null)
  const [showVitals, setShowVitals] = useState(false)
  const [completed, setCompleted] = useState(false)

  const step = STEPS[currentStep]

  /* shuffle options once per step (deterministic) */
  const shuffledOptions = useMemo(() => {
    const indexed = step.options.map((o, i) => ({ ...o, origIdx: i }))
    return seededShuffle(indexed, currentStep * 7919 + 104729)
  }, [currentStep, step.options])

  const isCorrect = (si: number) => selected[si] === STEPS[si].correctIndex
  const totalCorrect = STEPS.filter((_, i) => submitted[i] && isCorrect(i)).length

  /* handlers */
  const pick = (origIdx: number) => { if (!submitted[currentStep]) setSelected(p => ({ ...p, [currentStep]: origIdx })) }

  const submit = () => {
    if (selected[currentStep] === undefined) return
    setSubmitted(p => ({ ...p, [currentStep]: true }))
  }

  const next = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1)
    else setCompleted(true)
  }

  const reset = () => { setCurrentStep(0); setSelected({}); setSubmitted({}); setExpandedNarrative(null); setShowVitals(false); setCompleted(false) }

  /* ── colour helpers ─────────────────────────────────────── */
  const cls = {
    bg:        isDark ? 'bg-[#010809]' : 'bg-white',
    bgAlt:     isDark ? 'bg-[#031213]' : 'bg-[#FAFBF8]',
    border:    isDark ? 'border-[#004142]' : 'border-[#E5E4E3]',
    text:      isDark ? 'text-[#FAFBF8]' : 'text-[#1F1C1B]',
    muted:     isDark ? 'text-[#D9D6D5]' : 'text-[#524048]',
    dim:       isDark ? 'text-[#747474]' : 'text-[#747474]',
    accent:    isDark ? 'text-[#64F4F5]' : 'text-[#007970]',
    accentBg:  isDark ? 'bg-[#007970]' : 'bg-[#007970]',
    warnBdr:   isDark ? 'border-l-[#C74601]' : 'border-l-[#C74601]',
    stepDot:   isDark ? 'bg-[#07282A]' : 'bg-[#E5E4E3]',
    okBdr:     isDark ? 'border-l-[#64F4F5]' : 'border-l-[#007970]',
    okBg:      isDark ? 'bg-white/[0.03]' : 'bg-[#F0FDFA]',
    errBdr:    'border-l-[#D70101]',
    errBg:     isDark ? 'bg-white/[0.03]' : 'bg-[#FFF0F0]',
    selBdr:    isDark ? 'border-l-[#C74601]' : 'border-l-[#C74601]',
    selBg:     isDark ? 'bg-white/[0.04]' : 'bg-[#FFF3EC]',
    idleBdr:   isDark ? 'border-l-[#07282A]' : 'border-l-[#E5E4E3]',
    hoverBdr:  isDark ? 'hover:border-l-[#64F4F5]' : 'hover:border-l-[#007970]',
    hoverBg:   isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-[#FAFBF8]',
    btnPri:    'bg-[#C74601] text-white hover:bg-[#E56E2E]',
    btnDis:    isDark ? 'bg-[#07282A] text-[#747474]' : 'bg-[#E5E4E3] text-[#747474]',
    btnSec:    isDark ? 'bg-[#002B2C] text-[#64F4F5] border border-[#004142]' : 'bg-[#F2F4F7] text-[#524048] border border-[#E5E4E3]',
    btnGo:     isDark ? 'bg-[#007970] text-[#010809] hover:bg-[#64F4F5]' : 'bg-[#007970] text-white hover:bg-[#006059]',
  }

  /* ── COMPLETED VIEW ─────────────────────────────────────── */
  if (completed) {
    const allPerfect = totalCorrect === STEPS.length
    return (
      <div className={`flex-1 flex flex-col ${cls.bg} overflow-y-auto ${inline ? '' : 'h-screen'}`}>
        {/* header */}
        <div className={`flex items-center gap-3 px-5 py-3 border-b ${cls.border} ${cls.bgAlt} flex-shrink-0`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-[#004142]' : 'bg-[#E5FEFF]'}`}>
            <Trophy className={`w-4 h-4 ${cls.accent}`} />
          </div>
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-widest text-[#C74601]">Henderson POC</p>
            <p className={`text-[0.95rem] font-bold ${cls.text}`}>
              {allPerfect ? 'CareIndeed Clinical Master' : `Score: ${totalCorrect}/${STEPS.length}`}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          <p className={`text-[0.85rem] leading-relaxed mb-3 ${cls.muted}`}>
            {allPerfect
              ? 'You successfully navigated all clinical and administrative traps. You prioritized life over logistics, etiology over symptoms, and precise math over "cookie-cutter" scheduling.'
              : 'Review the logic below to strengthen your clinical judgment.'}
          </p>

          {/* Per-box summary */}
          {STEPS.map((s, i) => {
            const ok = submitted[i] && isCorrect(i)
            return (
              <div key={i} className={`rounded-xl border-l-[3px] px-3 py-2.5 ${ok ? `${cls.okBdr} ${cls.okBg}` : `${cls.errBdr} ${cls.errBg}`}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  {ok ? <CheckCircle2 className={`w-3.5 h-3.5 ${cls.accent}`} /> : <XCircle className="w-3.5 h-3.5 text-[#D70101]" />}
                  <span className={`text-[0.78rem] font-bold ${cls.text}`}>{s.boxLabel}</span>
                </div>
                <p className={`text-[0.78rem] leading-snug ${cls.muted}`}>{s.correctLogic}</p>
              </div>
            )
          })}
        </div>

        {/* actions */}
        <div className={`flex items-center gap-3 px-5 py-3 border-t ${cls.border} flex-shrink-0`}>
          <button onClick={reset} className={`px-5 py-2 rounded-xl text-[0.82rem] font-bold tracking-wide flex items-center gap-2 ${cls.btnSec}`}>
            <RotateCcw className="w-3.5 h-3.5" /> Retry
          </button>
          {onComplete && (
            <button onClick={onComplete} className={`px-5 py-2 rounded-xl text-[0.82rem] font-bold tracking-wide ${cls.btnPri} shadow-[0_4px_16px_-4px_rgba(199,70,1,0.4)]`}>
              Continue
            </button>
          )}
        </div>
      </div>
    )
  }

  /* ── MAIN QUIZ VIEW ─────────────────────────────────────── */
  return (
    <div className={`flex-1 flex flex-col ${cls.bg} overflow-hidden ${inline ? '' : 'h-screen'}`}>
      {/* Top bar — progress */}
      <div className={`flex items-center justify-between px-5 py-2.5 border-b flex-shrink-0 ${cls.border} ${cls.bgAlt}`}>
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button onClick={onBack} className={`text-[0.72rem] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border transition-colors ${cls.btnSec}`}>
              Back
            </button>
          )}
          <div className="min-w-0">
            <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#C74601]">Henderson POC</p>
            <p className={`text-[0.82rem] font-bold truncate ${cls.text}`}>
              {currentStep + 1}/{STEPS.length}  {step.boxLabel}
            </p>
          </div>
        </div>
        {/* Step dots */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${
              i === currentStep ? 'w-7 bg-[#C74601]'
                : submitted[i] ? isCorrect(i) ? 'w-4 bg-[#007970]' : 'w-4 bg-[#D70101]'
                  : `w-2 ${cls.stepDot}`
            }`} />
          ))}
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {/* Collapsible clinical reference */}
        <div className={`rounded-xl border mb-3 ${cls.border} ${cls.bgAlt}`}>
          {/* Vitals toggle */}
          <button onClick={() => setShowVitals(v => !v)}
            className={`w-full flex items-center justify-between px-3 py-2 text-left ${showVitals ? `border-b ${cls.border}` : ''}`}>
            <span className={`text-[0.72rem] font-bold uppercase tracking-widest flex items-center gap-1.5 text-[#C74601]`}>
              <Heart className="w-3 h-3" /> Vitals &amp; Risks
            </span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showVitals ? 'rotate-180' : ''} ${cls.dim}`} />
          </button>
          {showVitals && (
            <div className="px-3 py-2 space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                {VITALS.map(([k, v]) => (
                  <div key={k} className={`rounded-lg px-2 py-1 border ${isDark ? 'bg-[#020C0D] border-[#C74601]/20' : 'bg-white border-[#FFD5BF]/40'}`}>
                    <p className="text-[0.58rem] font-bold uppercase text-[#C74601]/60">{k}</p>
                    <p className={`text-[0.72rem] font-medium ${cls.text}`}>{v}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                {ENV_RISKS.map((r, i) => (
                  <div key={i} className={`flex items-start gap-1.5 text-[0.72rem] ${cls.muted}`}>
                    <ShieldAlert className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#C74601]" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Narrative sections (accordion) */}
          {NARRATIVE_SECTIONS.map((sec, i) => (
            <div key={i}>
              <button onClick={() => setExpandedNarrative(expandedNarrative === i ? null : i)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left border-t ${cls.border}`}>
                <span className={`text-[0.72rem] font-bold flex items-center gap-1.5 ${cls.accent}`}>
                  <BookOpen className="w-3 h-3" /> {sec.title}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${expandedNarrative === i ? 'rotate-180' : ''} ${cls.dim}`} />
              </button>
              {expandedNarrative === i && (
                <div className={`px-3 pb-2.5 text-[0.75rem] leading-relaxed ${cls.muted}`}>
                  {sec.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Question */}
        <div className="mb-3">
          <p className={`text-[0.95rem] font-semibold leading-snug ${cls.text}`}>
            {step.question}
          </p>
        </div>

        {/* Options — radio-button list style (matches training card challenges) */}
        <div className="space-y-1">
          {shuffledOptions.map((opt, i) => {
            const isSel = selected[currentStep] === opt.origIdx
            const done = Boolean(submitted[currentStep])
            const showOk = done && isSel && opt.origIdx === step.correctIndex
            const showErr = done && isSel && opt.origIdx !== step.correctIndex

            return (
              <button key={i} disabled={done} onClick={() => pick(opt.origIdx)}
                className={`w-full text-left px-3 py-1.5 rounded-xl transition-all flex items-start gap-2 border-l-[3px] ${
                  showOk ? `${cls.okBdr} ${cls.okBg}`
                    : showErr ? `${cls.errBdr} ${cls.errBg}`
                      : isSel ? `${cls.selBdr} ${cls.selBg}`
                        : `${cls.idleBdr} ${cls.hoverBdr} ${cls.hoverBg}`
                }`}>
                <div className="mt-0.5 w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center">
                  {showOk && <CheckCircle2 className={`w-3.5 h-3.5 ${cls.accent}`} />}
                  {showErr && <XCircle className="w-3.5 h-3.5 text-[#D70101]" />}
                  {!done && !isSel && <div className={`w-2.5 h-2.5 rounded-full border-[1.5px] ${isDark ? 'border-[#07282A]' : 'border-[#D9D6D5]'}`} />}
                  {!done && isSel && <div className="w-2.5 h-2.5 rounded-full bg-[#C74601]" />}
                </div>
                <span className={`text-[0.78rem] leading-snug ${
                  showOk ? `${cls.accent} font-semibold`
                    : showErr ? 'text-[#D70101]'
                      : isSel ? (isDark ? 'text-[#FFD5BF] font-medium' : 'text-[#421700] font-medium')
                        : cls.muted
                }`}>{opt.label}</span>
              </button>
            )
          })}
        </div>

        {/* Feedback — remediation or correct logic */}
        {submitted[currentStep] && !isCorrect(currentStep) && (() => {
          const trap = step.options[selected[currentStep]]?.trapNote
          return trap ? (
            <div className={`mt-2.5 rounded-xl border-l-[3px] px-3 py-2 ${cls.errBdr} ${cls.errBg}`}>
              <p className={`text-[0.68rem] font-bold uppercase tracking-widest mb-0.5 ${isDark ? 'text-[#FBE6E6]' : 'text-[#D70101]'}`}>Review</p>
              <p className={`text-[0.78rem] leading-snug ${isDark ? 'text-[#FBE6E6]' : 'text-[#421700]'}`}>{trap}</p>
            </div>
          ) : null
        })()}

        {submitted[currentStep] && isCorrect(currentStep) && (
          <div className={`mt-2.5 rounded-xl border-l-[3px] px-3 py-2 ${cls.okBdr} ${cls.okBg}`}>
            <p className={`text-[0.68rem] font-bold uppercase tracking-widest mb-0.5 ${cls.accent}`}>Why This Is Correct</p>
            <p className={`text-[0.78rem] leading-snug ${cls.muted}`}>{step.correctLogic}</p>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className={`flex items-center justify-between px-5 py-2.5 border-t ${cls.border} flex-shrink-0`}>
        {!submitted[currentStep] ? (
          <button onClick={submit} disabled={selected[currentStep] === undefined}
            className={`px-5 py-2 rounded-xl text-[0.82rem] font-bold tracking-wide transition-all ${
              selected[currentStep] !== undefined ? `${cls.btnPri} shadow-[0_4px_16px_-4px_rgba(199,70,1,0.4)]` : `${cls.btnDis} cursor-not-allowed`
            }`}>
            Submit
          </button>
        ) : (
          <button onClick={next}
            className={`group px-5 py-2 rounded-xl text-[0.82rem] font-bold tracking-wide transition-all flex items-center gap-2 ${cls.btnGo}`}>
            {currentStep < STEPS.length - 1 ? 'Next' : 'See Results'}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
        {submitted[currentStep] && (
          <span className={`text-[0.85rem] font-bold flex items-center gap-1.5 ${isCorrect(currentStep) ? cls.accent : 'text-[#D70101]'}`}>
            {isCorrect(currentStep) ? <><CheckCircle2 className="w-4 h-4" /> Correct</> : <><XCircle className="w-4 h-4" /> Incorrect</>}
          </span>
        )}
      </div>
    </div>
  )
}
