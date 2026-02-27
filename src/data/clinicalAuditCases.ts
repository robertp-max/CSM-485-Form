/* ── Clinical Audit Simulator Data ────────────────────────
   Three progressive cases derived from the Final Test PDF:
   Case 1: Martha Jenkins (Easy)      — 10 pts
   Case 2: Elena Rodriguez (Medium)   — 25 pts
   Case 3: George Henderson (Hard)    — 50 pts
   ──────────────────────────────────────────────────────── */

export type CaseBox = {
  id: string
  label: string
  shortLabel: string
  instruction: string
  correctChipId: string
  tooltipWhy: string
  remediation: { wrongLabel: string; wrongExplanation: string }[]
}

export type CaseChip = {
  id: string
  label: string
  boxTarget: string
  isCorrect: boolean
  category: 'diagnosis' | 'functional' | 'nursing' | 'frequency' | 'safety'
}

export type AuditCase = {
  id: string
  difficulty: 'easy' | 'medium' | 'hard'
  difficultyLabel: string
  points: number
  patientName: string
  age: number
  summary: string
  narrative: string
  vitals: Record<string, string>
  environmentalRisks: string[]
  physicianOrders: string
  boxes: CaseBox[]
  chips: CaseChip[]
}

/* ════════════════════════════════════════════════════════
   CASE 1: Martha Jenkins — Easy (10 pts)
   ════════════════════════════════════════════════════════ */
const JENKINS_BOXES: CaseBox[] = [
  {
    id: 'j-box-11',
    label: 'Box 11: Principal Diagnosis',
    shortLabel: 'Principal Dx',
    instruction: 'Select the correct ICD-10 code for TKR aftercare.',
    correctChipId: 'j-chip-dx-z471',
    tooltipWhy: 'Medicare requires the aftercare code (Z47.1) as the primary driver to justify the home health episode for a post-surgical patient.',
    remediation: [
      { wrongLabel: 'M25.561 — Knee Pain', wrongExplanation: 'Coding Failure: "Knee Pain" (M25.561) is a symptom. For a post-surgical patient, Medicare requires the Aftercare code (Z47.1) as the primary driver to justify the home health episode.' },
    ],
  },
  {
    id: 'j-box-15',
    label: 'Box 15: Functional Limitations',
    shortLabel: 'Functional Limits',
    instruction: 'Identify the functional limitations relevant to a knee replacement patient.',
    correctChipId: 'j-chip-func-ambtrans',
    tooltipWhy: 'Post-TKR patients require skilled PT for ambulation and transfer training. These are the functional areas directly impacted by knee surgery.',
    remediation: [
      { wrongLabel: 'Feeding / Speech', wrongExplanation: 'Irrelevant to a knee surgery case. The functional limitations must match the surgical site and rehabilitation needs.' },
    ],
  },
  {
    id: 'j-box-18',
    label: 'Box 18: Skilled Nursing Orders',
    shortLabel: 'SN Orders',
    instruction: 'Select the correct nursing orders for post-TKR care.',
    correctChipId: 'j-chip-sn-assess',
    tooltipWhy: 'Post-surgical wound monitoring and PT exercises are the core skilled nursing needs for a stable TKR patient.',
    remediation: [
      { wrongLabel: 'Apply heat to incision', wrongExplanation: 'Clinical Risk: Applying heat to a fresh surgical incision can increase local inflammation and vasodilation, potentially leading to increased swelling or dehiscence. Focus on assessment and mobility.' },
    ],
  },
  {
    id: 'j-box-21',
    label: 'Box 21: Visit Frequency',
    shortLabel: 'Frequency',
    instruction: 'Calculate the correct SN and PT visit schedule.',
    correctChipId: 'j-chip-freq-correct',
    tooltipWhy: 'SN once-weekly for 4 weeks (1w4) and PT three times a week for 4 weeks (3w4). Precise frequency-to-duration mapping.',
    remediation: [
      { wrongLabel: 'SN: 4w1 | PT: 3w4', wrongExplanation: 'Administrative Error: You swapped Frequency and Duration. Documenting 4w1 suggests four visits in one week followed by three weeks of no care. This is an over-utilization risk for week one.' },
    ],
  },
  {
    id: 'j-box-priority',
    label: 'Priority Action',
    shortLabel: 'Priority',
    instruction: 'What is the first clinical priority for this patient?',
    correctChipId: 'j-chip-priority-pain',
    tooltipWhy: 'For a stable post-op patient, confirming pain management and medications is the appropriate first action — not escalating to emergency services.',
    remediation: [
      { wrongLabel: '911 Transfer', wrongExplanation: 'Operational Error: Martha is a stable post-op patient. Initiating 911 for a low-grade fever (100.1°F) without other distress is an unnecessary utilization of emergency resources.' },
    ],
  },
]

const JENKINS_CHIPS: CaseChip[] = [
  // Dx (Box 11) — 10 chips
  { id: 'j-chip-dx-z471', label: 'Z47.1 — Aftercare following joint replacement', boxTarget: 'j-box-11', isCorrect: true, category: 'diagnosis' },
  { id: 'j-chip-dx-pain', label: 'M25.561 — Knee Pain', boxTarget: 'j-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'j-chip-dx-oa', label: 'M17.11 — Primary osteoarthritis, right knee', boxTarget: 'j-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'j-chip-dx-ssi', label: 'T81.4 — Surgical site infection', boxTarget: 'j-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'j-chip-dx-dvt', label: 'I82.401 — DVT of right lower extremity', boxTarget: 'j-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'j-chip-dx-pe', label: 'I26.99 — Pulmonary embolism without cor pulmonale', boxTarget: 'j-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'j-chip-dx-z96', label: 'Z96.651 — Presence of right knee joint implant', boxTarget: 'j-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'j-chip-dx-m79', label: 'M79.3 — Panniculitis, unspecified', boxTarget: 'j-box-11', isCorrect: false, category: 'diagnosis' },
  // Functional (Box 15) — 10 chips
  { id: 'j-chip-func-ambtrans', label: 'Ambulation, Transferring', boxTarget: 'j-box-15', isCorrect: true, category: 'functional' },
  { id: 'j-chip-func-feedspeech', label: 'Feeding / Speech', boxTarget: 'j-box-15', isCorrect: false, category: 'functional' },
  { id: 'j-chip-func-vision', label: 'Vision / Hearing', boxTarget: 'j-box-15', isCorrect: false, category: 'functional' },
  { id: 'j-chip-func-bathing', label: 'Bathing only', boxTarget: 'j-box-15', isCorrect: false, category: 'functional' },
  { id: 'j-chip-func-cogn', label: 'Cognition / Memory', boxTarget: 'j-box-15', isCorrect: false, category: 'functional' },
  { id: 'j-chip-func-resp', label: 'Respiratory / Oxygen Management', boxTarget: 'j-box-15', isCorrect: false, category: 'functional' },
  { id: 'j-chip-func-bowel', label: 'Bowel / Bladder Incontinence', boxTarget: 'j-box-15', isCorrect: false, category: 'functional' },
  { id: 'j-chip-func-dress', label: 'Upper Body Dressing only', boxTarget: 'j-box-15', isCorrect: false, category: 'functional' },
  // SN Orders (Box 18) — 10 chips
  { id: 'j-chip-sn-assess', label: 'Assess surgical site + PT exercises', boxTarget: 'j-box-18', isCorrect: true, category: 'nursing' },
  { id: 'j-chip-sn-heat', label: 'Apply heat to incision', boxTarget: 'j-box-18', isCorrect: false, category: 'nursing' },
  { id: 'j-chip-sn-wound-vac', label: 'Apply wound VAC therapy', boxTarget: 'j-box-18', isCorrect: false, category: 'nursing' },
  { id: 'j-chip-sn-ivantibiotics', label: 'Administer IV antibiotics', boxTarget: 'j-box-18', isCorrect: false, category: 'nursing' },
  { id: 'j-chip-sn-insulin', label: 'Sliding scale insulin management', boxTarget: 'j-box-18', isCorrect: false, category: 'nursing' },
  { id: 'j-chip-sn-picc', label: 'PICC line maintenance and flush', boxTarget: 'j-box-18', isCorrect: false, category: 'nursing' },
  { id: 'j-chip-sn-foley', label: 'Foley catheter management', boxTarget: 'j-box-18', isCorrect: false, category: 'nursing' },
  { id: 'j-chip-sn-trach', label: 'Tracheostomy care and suctioning', boxTarget: 'j-box-18', isCorrect: false, category: 'nursing' },
  // Freq (Box 21) — 10 chips
  { id: 'j-chip-freq-correct', label: 'SN: 1w4 | PT: 3w4', boxTarget: 'j-box-21', isCorrect: true, category: 'frequency' },
  { id: 'j-chip-freq-swapped', label: 'SN: 4w1 | PT: 3w4', boxTarget: 'j-box-21', isCorrect: false, category: 'frequency' },
  { id: 'j-chip-freq-high', label: 'SN: 3w4 | PT: 5w4', boxTarget: 'j-box-21', isCorrect: false, category: 'frequency' },
  { id: 'j-chip-freq-low', label: 'SN: 1w2 | PT: 1w4', boxTarget: 'j-box-21', isCorrect: false, category: 'frequency' },
  { id: 'j-chip-freq-prn', label: 'SN: PRN | PT: 3w4', boxTarget: 'j-box-21', isCorrect: false, category: 'frequency' },
  { id: 'j-chip-freq-nopt', label: 'SN: 1w4 | PT: Not ordered', boxTarget: 'j-box-21', isCorrect: false, category: 'frequency' },
  { id: 'j-chip-freq-daily', label: 'SN: 7w1 | PT: 3w4', boxTarget: 'j-box-21', isCorrect: false, category: 'frequency' },
  { id: 'j-chip-freq-biweekly', label: 'SN: 2w8 | PT: 2w8', boxTarget: 'j-box-21', isCorrect: false, category: 'frequency' },
  // Priority — 10 chips
  { id: 'j-chip-priority-pain', label: 'Confirm Pain / Meds', boxTarget: 'j-box-priority', isCorrect: true, category: 'safety' },
  { id: 'j-chip-priority-911', label: '911 Transfer', boxTarget: 'j-box-priority', isCorrect: false, category: 'safety' },
  { id: 'j-chip-priority-wound', label: 'Perform wound debridement', boxTarget: 'j-box-priority', isCorrect: false, category: 'safety' },
  { id: 'j-chip-priority-lab', label: 'Draw stat blood cultures', boxTarget: 'j-box-priority', isCorrect: false, category: 'safety' },
  { id: 'j-chip-priority-dc', label: 'Initiate discharge planning', boxTarget: 'j-box-priority', isCorrect: false, category: 'safety' },
  { id: 'j-chip-priority-iv', label: 'Start peripheral IV line', boxTarget: 'j-box-priority', isCorrect: false, category: 'safety' },
  { id: 'j-chip-priority-diet', label: 'Modify diet to liquid-only', boxTarget: 'j-box-priority', isCorrect: false, category: 'safety' },
  { id: 'j-chip-priority-oxygen', label: 'Apply supplemental oxygen 2L NC', boxTarget: 'j-box-priority', isCorrect: false, category: 'safety' },
]

/* ════════════════════════════════════════════════════════
   CASE 2: Elena Rodriguez — Medium (25 pts)
   ════════════════════════════════════════════════════════ */
const RODRIGUEZ_BOXES: CaseBox[] = [
  {
    id: 'r-box-11',
    label: 'Box 11: Principal Diagnosis',
    shortLabel: 'Principal Dx',
    instruction: 'Select the correct primary diagnosis for a post-cardiac patient with complications.',
    correctChipId: 'r-chip-dx-z48812',
    tooltipWhy: 'The primary reason for Home Health admission is cardiac surgery aftercare (Z48.812). While DVT is likely a complication, the aftercare code drives the episode.',
    remediation: [
      { wrongLabel: 'I82.401 — DVT of right lower extremity', wrongExplanation: 'Diagnosis Error: While the patient likely has a DVT, it is a complication. The primary reason for the Home Health admission remains the cardiac surgery aftercare (Z48.812).' },
    ],
  },
  {
    id: 'r-box-15',
    label: 'Box 15: Functional Limitations',
    shortLabel: 'Functional Limits',
    instruction: 'Identify the functional limitations for a post-cardiac surgical patient.',
    correctChipId: 'r-chip-func-correct',
    tooltipWhy: 'Post-cardiac patients have endurance, ambulation, and activity tolerance limitations that justify skilled services for monitoring and rehabilitation.',
    remediation: [
      { wrongLabel: 'Bathing only', wrongExplanation: 'Bathing alone does not capture the cardiovascular compromise and vascular risk that drive the skilled services for this patient.' },
    ],
  },
  {
    id: 'r-box-18',
    label: 'Box 18: Skilled Nursing Orders',
    shortLabel: 'SN Orders',
    instruction: 'Select the correct nursing protocol for sternal and vascular monitoring.',
    correctChipId: 'r-chip-sn-monitor',
    tooltipWhy: 'The clicking sound suggests sternal instability and the red swollen calf indicates DVT. Monitoring cardiac output, sternal assessment, and calf measurement are priority orders.',
    remediation: [
      { wrongLabel: 'Apply warm pack to swollen calf', wrongExplanation: 'Safety Violation: Applying a warm pack to a suspected DVT (red/swollen calf) is contraindicated. Heat can cause vasodilation and dislodge the thrombus, leading to a fatal Pulmonary Embolism (PE).' },
    ],
  },
  {
    id: 'r-box-21',
    label: 'Box 21: Visit Frequency',
    shortLabel: 'Frequency',
    instruction: 'Calculate the correct SN and PT visit schedule. Note the PT surgical hold.',
    correctChipId: 'r-chip-freq-correct',
    tooltipWhy: 'SN: daily for 5 days (5w1), then 2w2, then 1w5. PT has a 72-hour surgical hold, then 3w2, then 2w2. The "daily for 5 days" is NOT a full week.',
    remediation: [
      { wrongLabel: 'SN: 7w1, 2w2, 1w5', wrongExplanation: 'Audit Red Flag: The physician requested daily oversight for only 5 days. Selecting 7w1 (daily for the full week) results in 2 unapproved visits, which will be flagged as non-reimbursable over-utilization.' },
      { wrongLabel: 'SN: 5w1, 3w2, 2w2 (PT starts Day 1)', wrongExplanation: 'Scheduling Error: PT is on a mandated 72-hour surgical hold. Attempting to schedule visits before the hold expires is a compliance violation and ignores the surgeon\'s safety protocols.' },
    ],
  },
  {
    id: 'r-box-priority',
    label: 'Priority Action',
    shortLabel: 'Priority',
    instruction: 'What is the first clinical priority given the presenting symptoms?',
    correctChipId: 'r-chip-priority-dvt',
    tooltipWhy: 'Low BP, tachycardia, low SpO2 combined with a red swollen calf = DVT/PE risk. Immediate assessment and MD notification take priority.',
    remediation: [
      { wrongLabel: 'Apply warm compress to calf', wrongExplanation: 'Safety Violation: Applying warmth to a suspected DVT is contraindicated. Heat causes vasodilation and can dislodge the thrombus, leading to fatal PE.' },
    ],
  },
]

const RODRIGUEZ_CHIPS: CaseChip[] = [
  // Dx (Box 11) — 10 chips
  { id: 'r-chip-dx-z48812', label: 'Z48.812 — Cardiac surgery aftercare', boxTarget: 'r-box-11', isCorrect: true, category: 'diagnosis' },
  { id: 'r-chip-dx-dvt', label: 'I82.401 — DVT of right lower extremity', boxTarget: 'r-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'r-chip-dx-chf', label: 'I50.9 — Heart failure, unspecified', boxTarget: 'r-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'r-chip-dx-afib', label: 'I48.91 — Atrial fibrillation, unspecified', boxTarget: 'r-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'r-chip-dx-pe', label: 'I26.99 — Pulmonary embolism', boxTarget: 'r-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'r-chip-dx-ssi', label: 'T81.4 — Infection following procedure', boxTarget: 'r-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'r-chip-dx-sternal', label: 'T22.0 — Superficial injury of thorax', boxTarget: 'r-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'r-chip-dx-hypo', label: 'I95.1 — Orthostatic hypotension', boxTarget: 'r-box-11', isCorrect: false, category: 'diagnosis' },
  // Functional (Box 15) — 10 chips
  { id: 'r-chip-func-correct', label: 'Endurance, Ambulation, Activity Tolerance', boxTarget: 'r-box-15', isCorrect: true, category: 'functional' },
  { id: 'r-chip-func-bathing', label: 'Bathing only', boxTarget: 'r-box-15', isCorrect: false, category: 'functional' },
  { id: 'r-chip-func-cogn', label: 'Cognition / Memory', boxTarget: 'r-box-15', isCorrect: false, category: 'functional' },
  { id: 'r-chip-func-feeding', label: 'Feeding / Swallowing', boxTarget: 'r-box-15', isCorrect: false, category: 'functional' },
  { id: 'r-chip-func-vision', label: 'Vision / Hearing', boxTarget: 'r-box-15', isCorrect: false, category: 'functional' },
  { id: 'r-chip-func-bowel', label: 'Bowel / Bladder Management', boxTarget: 'r-box-15', isCorrect: false, category: 'functional' },
  { id: 'r-chip-func-transfer', label: 'Transferring only', boxTarget: 'r-box-15', isCorrect: false, category: 'functional' },
  { id: 'r-chip-func-speech', label: 'Speech / Communication', boxTarget: 'r-box-15', isCorrect: false, category: 'functional' },
  // SN Orders (Box 18) — 10 chips
  { id: 'r-chip-sn-monitor', label: 'Cardiac output monitoring + sternal check + calf measurement', boxTarget: 'r-box-18', isCorrect: true, category: 'nursing' },
  { id: 'r-chip-sn-warm', label: 'Apply warm pack to swollen calf', boxTarget: 'r-box-18', isCorrect: false, category: 'nursing' },
  { id: 'r-chip-sn-massage', label: 'Massage right calf to reduce swelling', boxTarget: 'r-box-18', isCorrect: false, category: 'nursing' },
  { id: 'r-chip-sn-ambulate', label: 'Encourage vigorous ambulation to prevent clot', boxTarget: 'r-box-18', isCorrect: false, category: 'nursing' },
  { id: 'r-chip-sn-elevate', label: 'Elevate legs above heart level and apply ice', boxTarget: 'r-box-18', isCorrect: false, category: 'nursing' },
  { id: 'r-chip-sn-wound', label: 'Wound VAC therapy to sternal incision', boxTarget: 'r-box-18', isCorrect: false, category: 'nursing' },
  { id: 'r-chip-sn-teds', label: 'Apply TED hose and encourage walking immediately', boxTarget: 'r-box-18', isCorrect: false, category: 'nursing' },
  { id: 'r-chip-sn-insulin', label: 'Sliding scale insulin management', boxTarget: 'r-box-18', isCorrect: false, category: 'nursing' },
  // Freq (Box 21) — 10 chips
  { id: 'r-chip-freq-correct', label: 'SN: 5w1, 2w2, 1w5 | PT: (72hr hold) 3w2, 2w2', boxTarget: 'r-box-21', isCorrect: true, category: 'frequency' },
  { id: 'r-chip-freq-7w1', label: 'SN: 7w1, 2w2, 1w5 | PT: 3w2, 2w2', boxTarget: 'r-box-21', isCorrect: false, category: 'frequency' },
  { id: 'r-chip-freq-nohold', label: 'SN: 5w1, 3w2, 2w2 | PT starts Day 1', boxTarget: 'r-box-21', isCorrect: false, category: 'frequency' },
  { id: 'r-chip-freq-low', label: 'SN: 2w1, 1w7 | PT: 2w4', boxTarget: 'r-box-21', isCorrect: false, category: 'frequency' },
  { id: 'r-chip-freq-prn', label: 'SN: PRN | PT: (72hr hold) 3w2, 2w2', boxTarget: 'r-box-21', isCorrect: false, category: 'frequency' },
  { id: 'r-chip-freq-equal', label: 'SN: 3w3, 1w5 | PT: 3w3, 1w5', boxTarget: 'r-box-21', isCorrect: false, category: 'frequency' },
  { id: 'r-chip-freq-48hr', label: 'SN: 5w1, 2w2, 1w5 | PT: (48hr hold) 3w2, 2w2', boxTarget: 'r-box-21', isCorrect: false, category: 'frequency' },
  { id: 'r-chip-freq-high', label: 'SN: 7w2, 3w4 | PT: 5w4', boxTarget: 'r-box-21', isCorrect: false, category: 'frequency' },
  // Priority — 10 chips
  { id: 'r-chip-priority-dvt', label: 'DVT/PE assessment → MD notification → vitals protocol', boxTarget: 'r-box-priority', isCorrect: true, category: 'safety' },
  { id: 'r-chip-priority-warm', label: 'Apply warm compress to calf', boxTarget: 'r-box-priority', isCorrect: false, category: 'safety' },
  { id: 'r-chip-priority-sternal', label: 'Apply sternal binder and reassess in 24hrs', boxTarget: 'r-box-priority', isCorrect: false, category: 'safety' },
  { id: 'r-chip-priority-ambulate', label: 'Ambulate patient to promote circulation', boxTarget: 'r-box-priority', isCorrect: false, category: 'safety' },
  { id: 'r-chip-priority-pain', label: 'Administer PRN pain medication first', boxTarget: 'r-box-priority', isCorrect: false, category: 'safety' },
  { id: 'r-chip-priority-o2', label: 'Increase supplemental O2 to 4L and monitor', boxTarget: 'r-box-priority', isCorrect: false, category: 'safety' },
  { id: 'r-chip-priority-dc', label: 'Schedule outpatient follow-up and discharge', boxTarget: 'r-box-priority', isCorrect: false, category: 'safety' },
  { id: 'r-chip-priority-heparin', label: 'Self-administer heparin injection PRN', boxTarget: 'r-box-priority', isCorrect: false, category: 'safety' },
]

/* ════════════════════════════════════════════════════════
   CASE 3: George Henderson — Hard (50 pts)
   ════════════════════════════════════════════════════════ */
const HENDERSON_BOXES: CaseBox[] = [
  {
    id: 'h-box-11',
    label: 'Box 11: Principal Diagnosis',
    shortLabel: 'Principal Dx',
    instruction: 'Select the correct principal diagnosis code for multi-system failure.',
    correctChipId: 'h-chip-dx-e11621',
    tooltipWhy: 'Home Health regulations require the primary diagnosis to be the condition that necessitates the skilled service (wound care). Coding the chronic cause (Diabetes) with the acute manifestation (Ulcer) justifies long-term clinical oversight.',
    remediation: [
      { wrongLabel: 'L03.115 — Cellulitis', wrongExplanation: 'Cellulitis is a symptom/manifestation of the underlying wound. Coding it as primary fails to capture the chronic metabolic cause (Diabetes) required for high-acuity home health reimbursement.' },
      { wrongLabel: 'I74.3 — Acute Limb Ischemia', wrongExplanation: 'While life-threatening, acute limb ischemia is a surgical emergency. If this were the primary reason for the visit, the patient should be in the ER, not home health.' },
    ],
  },
  {
    id: 'h-box-15',
    label: 'Box 15: Functional Limitations',
    shortLabel: 'Functional Limits',
    instruction: 'Identify the functional limitations that justify skilled services.',
    correctChipId: 'h-chip-func-endurance',
    tooltipWhy: 'LOPS (Loss of Protective Sensation) is the invisible reason for the patient\'s condition. Because he cannot feel his feet (Neuropathy), he was unaware of the infection.',
    remediation: [
      { wrongLabel: 'Ambulation only', wrongExplanation: 'Ambulation alone does not capture the neuropathy component (LOPS) that is the root cause of the wound going undetected.' },
    ],
  },
  {
    id: 'h-box-18',
    label: 'Box 18: Skilled Nursing Orders',
    shortLabel: 'SN Orders',
    instruction: 'Select the correct wound care and escalation protocol.',
    correctChipId: 'h-chip-sn-collagen',
    tooltipWhy: 'The Probe-to-Bone finding is a clinical red flag for Osteomyelitis. Standard dressings are insufficient; the clinician must initiate a medical escalation with collagen/foam protocol and immediate MD notification.',
    remediation: [
      { wrongLabel: 'Betadine + dry sterile dressing', wrongExplanation: 'Betadine is cytotoxic and can delay granulation in a diabetic wound. A dry sterile dressing is inappropriate for a Wagner Grade 3 ulcer requiring moisture balance.' },
      { wrongLabel: 'Epsom salt soak + air dry', wrongExplanation: 'NEVER soak a diabetic foot. Maceration increases infection risk, and hot water can cause burns due to peripheral neuropathy.' },
    ],
  },
  {
    id: 'h-box-21',
    label: 'Box 21: Visit Frequency',
    shortLabel: 'Frequency',
    instruction: 'Calculate the correct SN and PT visit schedule from coordination notes.',
    correctChipId: 'h-chip-freq-correct',
    tooltipWhy: '72 hours stabilization = 3 visits in week 1 (3w1), NOT 7w1. After week 1, 3 remaining weeks at 2/week (2w3). Month 2: 4 weeks at 1/week (1w4). PT starts after 48-hr hold.',
    remediation: [
      { wrongLabel: 'SN: 7w1, 2w3, 1w4', wrongExplanation: 'The note specifies "first 72 hours" of daily oversight. In CMS-485 coding, this is 3 visits in week 1 (3w1), not a full week of daily visits (7w1).' },
      { wrongLabel: 'SN: 3w1, 2w7', wrongExplanation: 'The 2w7 notation implies 2 visits for 7 weeks, which doesn\'t match the month-1 remainder (3 weeks) plus month-2 (4 weeks at 1/week) structure.' },
    ],
  },
  {
    id: 'h-box-priority',
    label: 'Critical Safety & Priority',
    shortLabel: 'Safety Priority',
    instruction: 'What must happen BEFORE any wound care begins?',
    correctChipId: 'h-chip-safety-first',
    tooltipWhy: 'You cannot treat a patient in the middle of a Silent MI (HR 48, ashen) or in the presence of an unsecured weapon. Safety and life-stabilization always precede wound healing.',
    remediation: [
      { wrongLabel: 'Perform dressing change first', wrongExplanation: 'Clinical Focus Failure: If you prioritized the wound over the heart rate/firearm, you failed the Safety First test. HR 48 in an ashen, diaphoretic diabetic is a Silent MI until proven otherwise. The cold, pulseless leg indicates acute blockage. You cannot perform clinical care with an unsecured firearm and a confused patient.' },
      { wrongLabel: 'Address Pickles the Cat', wrongExplanation: 'Clinical Focus Failure: You spent time addressing the neighbor\'s request for cat care while the patient was in active cardiac distress (HR 48). Prioritize life-safety over household logistics.' },
    ],
  },
]

const HENDERSON_CHIPS: CaseChip[] = [
  // Dx (Box 11) — 10 chips
  { id: 'h-chip-dx-e11621', label: 'E11.621 — Type 2 DM with foot ulcer', boxTarget: 'h-box-11', isCorrect: true, category: 'diagnosis' },
  { id: 'h-chip-dx-cellulitis', label: 'L03.115 — Cellulitis of right foot', boxTarget: 'h-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'h-chip-dx-ischemia', label: 'I74.3 — Acute Limb Ischemia', boxTarget: 'h-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'h-chip-dx-osteo', label: 'M86.171 — Osteomyelitis of right ankle/foot', boxTarget: 'h-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'h-chip-dx-pvd', label: 'I73.9 — Peripheral vascular disease, unspecified', boxTarget: 'h-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'h-chip-dx-gangrene', label: 'I96 — Gangrene, not elsewhere classified', boxTarget: 'h-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'h-chip-dx-sepsis', label: 'A41.9 — Sepsis, unspecified organism', boxTarget: 'h-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'h-chip-dx-neuropathy', label: 'E11.40 — Type 2 DM with neuropathy', boxTarget: 'h-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'h-chip-dx-bradycardia', label: 'R00.1 — Bradycardia, unspecified', boxTarget: 'h-box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'h-chip-dx-hyperglycemia', label: 'R73.9 — Hyperglycemia, unspecified', boxTarget: 'h-box-11', isCorrect: false, category: 'diagnosis' },
  // Functional (Box 15) — 10 chips
  { id: 'h-chip-func-endurance', label: 'Endurance, Ambulation, LOPS (Neuropathy)', boxTarget: 'h-box-15', isCorrect: true, category: 'functional' },
  { id: 'h-chip-func-ambonly', label: 'Ambulation only', boxTarget: 'h-box-15', isCorrect: false, category: 'functional' },
  { id: 'h-chip-func-bathing', label: 'Bathing / Grooming', boxTarget: 'h-box-15', isCorrect: false, category: 'functional' },
  { id: 'h-chip-func-feeding', label: 'Feeding / Swallowing', boxTarget: 'h-box-15', isCorrect: false, category: 'functional' },
  { id: 'h-chip-func-cogn', label: 'Cognition / Orientation', boxTarget: 'h-box-15', isCorrect: false, category: 'functional' },
  { id: 'h-chip-func-transfer', label: 'Transferring only', boxTarget: 'h-box-15', isCorrect: false, category: 'functional' },
  { id: 'h-chip-func-speech', label: 'Speech / Language', boxTarget: 'h-box-15', isCorrect: false, category: 'functional' },
  { id: 'h-chip-func-resp', label: 'Respiratory / Ventilator Management', boxTarget: 'h-box-15', isCorrect: false, category: 'functional' },
  { id: 'h-chip-func-dress', label: 'Dressing / Upper Body only', boxTarget: 'h-box-15', isCorrect: false, category: 'functional' },
  { id: 'h-chip-func-continence', label: 'Bowel / Bladder Continence', boxTarget: 'h-box-15', isCorrect: false, category: 'functional' },
  // SN Orders (Box 18) — 10 chips
  { id: 'h-chip-sn-collagen', label: 'Cleanse NS → Collagen → Foam; notify MD for X-ray/consult', boxTarget: 'h-box-18', isCorrect: true, category: 'nursing' },
  { id: 'h-chip-sn-betadine', label: 'Betadine + dry sterile dressing', boxTarget: 'h-box-18', isCorrect: false, category: 'nursing' },
  { id: 'h-chip-sn-soak', label: 'Epsom salt soak + air dry', boxTarget: 'h-box-18', isCorrect: false, category: 'nursing' },
  { id: 'h-chip-sn-peroxide', label: 'Hydrogen peroxide flush + gauze packing', boxTarget: 'h-box-18', isCorrect: false, category: 'nursing' },
  { id: 'h-chip-sn-silvadene', label: 'Apply Silvadene cream + occlusive wrap', boxTarget: 'h-box-18', isCorrect: false, category: 'nursing' },
  { id: 'h-chip-sn-debridebed', label: 'Bedside sharp debridement without MD order', boxTarget: 'h-box-18', isCorrect: false, category: 'nursing' },
  { id: 'h-chip-sn-compression', label: 'Apply 4-layer compression bandage', boxTarget: 'h-box-18', isCorrect: false, category: 'nursing' },
  { id: 'h-chip-sn-heat', label: 'Apply warming pad to affected foot', boxTarget: 'h-box-18', isCorrect: false, category: 'nursing' },
  { id: 'h-chip-sn-honey', label: 'Manuka honey application + dry dressing', boxTarget: 'h-box-18', isCorrect: false, category: 'nursing' },
  { id: 'h-chip-sn-vacuum', label: 'Wound VAC at -125 mmHg continuous', boxTarget: 'h-box-18', isCorrect: false, category: 'nursing' },
  // Freq (Box 21) — 10 chips
  { id: 'h-chip-freq-correct', label: 'SN: 3w1, 2w3, 1w4 | PT: 2w3, 1w2', boxTarget: 'h-box-21', isCorrect: true, category: 'frequency' },
  { id: 'h-chip-freq-7w1', label: 'SN: 7w1, 2w3, 1w4 | PT: 2w3, 1w2', boxTarget: 'h-box-21', isCorrect: false, category: 'frequency' },
  { id: 'h-chip-freq-bad', label: 'SN: 3w1, 2w7 | PT: 1w5', boxTarget: 'h-box-21', isCorrect: false, category: 'frequency' },
  { id: 'h-chip-freq-daily', label: 'SN: 7w1, 3w3, 2w4 | PT: 3w4, 1w4', boxTarget: 'h-box-21', isCorrect: false, category: 'frequency' },
  { id: 'h-chip-freq-low', label: 'SN: 1w4, 1w4 | PT: 1w4', boxTarget: 'h-box-21', isCorrect: false, category: 'frequency' },
  { id: 'h-chip-freq-prn', label: 'SN: PRN | PT: (48hr hold) 2w3, 1w2', boxTarget: 'h-box-21', isCorrect: false, category: 'frequency' },
  { id: 'h-chip-freq-nohold', label: 'SN: 3w1, 2w3, 1w4 | PT starts Day 1: 3w3, 1w2', boxTarget: 'h-box-21', isCorrect: false, category: 'frequency' },
  { id: 'h-chip-freq-flat', label: 'SN: 2w8 | PT: 2w8', boxTarget: 'h-box-21', isCorrect: false, category: 'frequency' },
  { id: 'h-chip-freq-short', label: 'SN: 3w1, 2w1 | PT: 2w1', boxTarget: 'h-box-21', isCorrect: false, category: 'frequency' },
  { id: 'h-chip-freq-switched', label: 'SN: 2w3, 3w1, 1w4 | PT: 1w2, 2w3', boxTarget: 'h-box-21', isCorrect: false, category: 'frequency' },
  // Safety (Priority) — 10 chips
  { id: 'h-chip-safety-first', label: 'Secure firearm + 911 for Silent MI → THEN wound care', boxTarget: 'h-box-priority', isCorrect: true, category: 'safety' },
  { id: 'h-chip-safety-wound', label: 'Perform dressing change first', boxTarget: 'h-box-priority', isCorrect: false, category: 'safety' },
  { id: 'h-chip-safety-cat', label: 'Address Pickles the Cat', boxTarget: 'h-box-priority', isCorrect: false, category: 'safety' },
  { id: 'h-chip-safety-insulin', label: 'Administer warm insulin from counter', boxTarget: 'h-box-priority', isCorrect: false, category: 'safety' },
  { id: 'h-chip-safety-walk', label: 'Help patient ambulate to bathroom', boxTarget: 'h-box-priority', isCorrect: false, category: 'safety' },
  { id: 'h-chip-safety-daughter', label: 'Contact daughter to resume caregiving', boxTarget: 'h-box-priority', isCorrect: false, category: 'safety' },
  { id: 'h-chip-safety-suction', label: 'Suction airway and position prone', boxTarget: 'h-box-priority', isCorrect: false, category: 'safety' },
  { id: 'h-chip-safety-vitals', label: 'Take vitals every 15 min and wait for trends', boxTarget: 'h-box-priority', isCorrect: false, category: 'safety' },
  { id: 'h-chip-safety-narcan', label: 'Administer Narcan for altered mental status', boxTarget: 'h-box-priority', isCorrect: false, category: 'safety' },
  { id: 'h-chip-safety-glucometer', label: 'Check glucose and administer correction dose', boxTarget: 'h-box-priority', isCorrect: false, category: 'safety' },
]

/* ════════════════════════════════════════════════════════
   EXPORTED CASES
   ════════════════════════════════════════════════════════ */
export const AUDIT_CASES: AuditCase[] = [
  {
    id: 'jenkins',
    difficulty: 'easy',
    difficultyLabel: 'EASY',
    points: 10,
    patientName: 'Martha Jenkins',
    age: 72,
    summary: 'Post-op Total Knee Replacement. Stable but needs wound checks and mobility training.',
    narrative: 'Martha Jenkins, age 72, is post-operative following a Total Knee Replacement (TKR). She is stable but requires routine wound checks and progressive mobility training. The surgical site is clean with no signs of infection. She reports mild, manageable pain controlled by prescribed oral analgesics.',
    vitals: {
      'Temperature': '100.1°F',
      'Blood Pressure': '124/80 mmHg',
      'Heart Rate': '72 bpm',
      'Status': 'Stable post-op',
    },
    environmentalRisks: [],
    physicianOrders: 'SN once-weekly for 4 weeks. PT three times a week for 4 weeks.',
    boxes: JENKINS_BOXES,
    chips: JENKINS_CHIPS,
  },
  {
    id: 'rodriguez',
    difficulty: 'medium',
    difficultyLabel: 'MEDIUM',
    points: 25,
    patientName: 'Elena Rodriguez',
    age: 58,
    summary: 'Post-op cardiac with sternal clicking and a red, swollen calf suggesting DVT/PE risk.',
    narrative: 'Elena Rodriguez, age 58, is post-operative cardiac surgery. She presents with an audible "clicking" sound in her chest (suggesting sternal instability) and a red, swollen right calf — a classic indicator of Deep Vein Thrombosis (DVT). Her vital signs show hypotension, tachycardia, and low oxygen saturation, creating a high-risk post-surgical picture.',
    vitals: {
      'Blood Pressure': '92/54 mmHg (Low)',
      'Heart Rate': '112 bpm (Tachycardic)',
      'SpO2': '89% (Below normal)',
      'Sternal': 'Audible clicking',
      'Right Calf': 'Red, swollen, warm',
    },
    environmentalRisks: [
      'Post-surgical patient with unstable vitals',
      'DVT/PE risk requiring emergency awareness',
    ],
    physicianOrders: 'SN daily for 5 days (5w1), then 2w2, then 1w5. PT on 72-hour surgical hold, then 3w2, then 2w2.',
    boxes: RODRIGUEZ_BOXES,
    chips: RODRIGUEZ_CHIPS,
  },
  {
    id: 'henderson',
    difficulty: 'hard',
    difficultyLabel: 'AUDIT MASTER',
    points: 50,
    patientName: 'George Henderson',
    age: 71,
    summary: 'Multi-system failure with environmental hazards. Bradycardia, pulseless leg, Wagner Grade 3 ulcer, loaded firearm, and caregiver abandonment.',
    narrative: 'George Henderson, age 71, presents with multi-system failure: Cardiovascular (Bradycardia HR 48, ashen, diaphoretic), Vascular (cold pulseless left leg — acute ischemia), Metabolic (Wagner Grade 3 foot ulcer, probe-to-bone positive, BS 342, warm insulin due to power outage). Environmental hazards include a loaded firearm on the nightstand, no power, and his daughter has quit as caregiver.',
    vitals: {
      'Heart Rate': '48 bpm (Bradycardia)',
      'Appearance': 'Ashen, diaphoretic',
      'Blood Sugar': '342 mg/dL',
      'Left Leg': 'Cold, pulseless (acute ischemia)',
      'Wound Grade': 'Wagner Grade 3 (probe-to-bone)',
      'Insulin': 'Warm (power out, no refrigeration)',
    },
    environmentalRisks: [
      'Loaded firearm on nightstand',
      'Power outage — no refrigeration, warm insulin',
      'Daughter has quit as caregiver',
      'Patient confused and agitated',
    ],
    physicianOrders: 'Stabilization for 72 hours (3w1), then 2w3, then 1w4. PT on 48-hour hold, then 2w3, then 1w2.',
    boxes: HENDERSON_BOXES,
    chips: HENDERSON_CHIPS,
  },
]
