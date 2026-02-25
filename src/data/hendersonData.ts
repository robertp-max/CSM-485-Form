/* ── Henderson Case Data ──────────────────────────────────
   All content sourced exclusively from Henderson_POC._Challenge.txt
   and Henderson_Medical_Evaluation.html attachments.
   No external clinical claims.
   ──────────────────────────────────────────────────────── */

export type HendersonBox = {
  id: 'box-11' | 'box-15' | 'box-18' | 'box-21' | 'box-24'
  label: string
  shortLabel: string
  instruction: string
  correctChipId: string
  tooltipWhy: string
  validationAffirmation: string
  remediation: { wrongLabel: string; wrongExplanation: string }[]
}

export type AnswerChip = {
  id: string
  label: string
  boxTarget: string
  isCorrect: boolean
  category: 'diagnosis' | 'functional' | 'nursing' | 'frequency' | 'safety'
}

/* ── Clinical Narrative ─────────────────────────────────── */
export const HENDERSON_NARRATIVE = {
  patientName: 'George Henderson',
  summary:
    'Multi-system failure: Cardiovascular (Bradycardia HR 48, ashen, diaphoretic), Vascular (cold pulseless left leg – ischemia), Metabolic (Wagner Grade 3 foot ulcer, probe-to-bone, BS 342, warm Insulin), Environmental (loaded firearm on nightstand, power out, daughter quit).',
  scheduleQuote:
    '"Stabilization requires oversight for the first 72 hours… following this, the clinician will drop to twice-weekly for the remainder of the month… final month is standard once-weekly. PT starts after a 48-hr vascular hold: 2w for 3wks, then 1w for 2wks."',
  vitals: {
    hr: '48 bpm (Bradycardia)',
    appearance: 'Ashen, diaphoretic',
    bs: '342 mg/dL',
    leftLeg: 'Cold, pulseless (acute ischemia)',
    woundGrade: 'Wagner Grade 3 (probe-to-bone)',
    insulin: 'Warm (power out, no refrigeration)',
  },
  environmentalRisks: [
    'Loaded firearm on nightstand',
    'Power outage (no refrigeration → warm insulin)',
    'Daughter has quit as caregiver',
    'Patient confused/agitated',
  ],
  sections: [
    {
      title: 'History & Presentation',
      content: 'Mr. Henderson is a Type 2 diabetic male presenting with a Wagner Grade 3 foot ulcer (probe-to-bone positive). Blood sugar is 342. HR is 48, patient is ashen and diaphoretic consistent with suspected Silent MI. Left leg is cold and pulseless indicating acute vascular ischemia.',
    },
    {
      title: 'Wound Assessment',
      content: 'Right foot: deep ulcer with granulation tissue undermined by necrotic borders. Probe-to-bone test is POSITIVE — strongly suggestive of Osteomyelitis. The wound was hidden by ill-fitting shoes; patient has lost protective sensation (neuropathy) and was unaware of the infection.',
    },
    {
      title: 'Environmental Safety',
      content: 'A loaded firearm was observed on the nightstand beside the bed. The patient appeared confused. The residence has no power — insulin stored at room temperature is compromised. The patient\'s daughter, previously the primary caregiver, has quit.',
    },
    {
      title: 'Coordination Notes',
      content: HENDERSON_SCHEDULE_QUOTE(),
    },
  ],
}

function HENDERSON_SCHEDULE_QUOTE() {
  return 'Stabilization requires oversight for the first 72 hours. Following this, the clinician will drop to twice-weekly for the remainder of the month. Final month is standard once-weekly. PT starts after a 48-hr vascular hold: 2w for 3wks, then 1w for 2wks.'
}

/* ── CMS-485 Boxes ──────────────────────────────────────── */
export const HENDERSON_BOXES: HendersonBox[] = [
  {
    id: 'box-11',
    label: 'Box 11: Principal Diagnosis',
    shortLabel: 'Principal Dx',
    instruction: 'Select the correct principal diagnosis code.',
    correctChipId: 'chip-dx-e11621',
    tooltipWhy:
      'Home Health regulations require the primary diagnosis to be the condition that necessitates the "Skilled Service" (wound care). Coding the chronic cause (Diabetes) with the acute manifestation (Ulcer) justifies the long-term clinical oversight.',
    validationAffirmation:
      'Excellent sequencing! You correctly prioritized the metabolic cause over the superficial symptoms. By coding the Diabetes with Foot Ulcer as primary, you have successfully justified the high-acuity skilled nursing needed for a Wagner Grade 3 wound while satisfying CMS audit requirements for diagnostic etiology.',
    remediation: [
      { wrongLabel: 'L03.115 (Cellulitis)', wrongExplanation: 'Cellulitis is a symptom/manifestation of the underlying wound. Coding it as primary fails to capture the chronic metabolic cause (Diabetes) required for high-acuity home health reimbursement.' },
      { wrongLabel: 'I74.3 (Ischemia)', wrongExplanation: 'While life-threatening, acute limb ischemia is a surgical emergency. If this were the primary reason for the visit, the patient should be in the ER, not home health.' },
    ],
  },
  {
    id: 'box-15',
    label: 'Box 15: Functional Limitations',
    shortLabel: 'Functional Limits',
    instruction: 'Identify the functional limitations that justify skilled services.',
    correctChipId: 'chip-func-endurance-lops',
    tooltipWhy:
      'LOPS (Loss of Protective Sensation) is the "invisible" reason for the patient\'s condition. Because he cannot feel his feet (Neuropathy), he was unaware of the infection. This justifies the need for "Skilled Teaching" on foot inspections.',
    validationAffirmation:
      'Correct functional assessment! Endurance, Ambulation, and Loss of Protective Sensation collectively justify the skilled teaching, wound management, and safety interventions ordered.',
    remediation: [
      { wrongLabel: 'Ambulation only', wrongExplanation: 'Ambulation alone does not capture the neuropathy component (LOPS) that is the root cause of the wound going undetected.' },
    ],
  },
  {
    id: 'box-18',
    label: 'Box 18: Skilled Nursing Orders',
    shortLabel: 'SN Orders',
    instruction: 'Select the correct wound care and escalation protocol.',
    correctChipId: 'chip-sn-collagen',
    tooltipWhy:
      'The "Probe-to-Bone" finding is a clinical red flag for Osteomyelitis. Standard dressings are insufficient; the clinician must initiate a medical escalation with collagen/foam protocol and immediate MD notification for X-ray/specialist consult.',
    validationAffirmation:
      'Critical catch! You didn\'t just "clean a wound"; you identified a medical emergency. By recognizing "Probe-to-Bone" as suspected Osteomyelitis, you moved from a basic dressing change to an advanced clinical protocol. This saves limbs and lives.',
    remediation: [
      { wrongLabel: 'Betadine + dry sterile dressing', wrongExplanation: 'Betadine is cytotoxic and can delay granulation in a diabetic wound. A dry sterile dressing is inappropriate for a Wagner Grade 3 ulcer requiring moisture balance.' },
      { wrongLabel: 'Epsom salt soak', wrongExplanation: 'NEVER soak a diabetic foot. Maceration increases infection risk, and hot water can cause burns due to peripheral neuropathy.' },
    ],
  },
  {
    id: 'box-21',
    label: 'Box 21: Visit Frequency',
    shortLabel: 'Frequency',
    instruction: 'Calculate the correct SN and PT visit schedule.',
    correctChipId: 'chip-freq-3w1-2w3-1w4',
    tooltipWhy:
      'Box 21 Logic: 72 hours stabilization = 3 visits in week 1 (3w1), NOT 7w1. After week 1, 3 remaining weeks at 2/week (2w3). Month 2: 4 weeks at 1/week (1w4). PT starts after 48-hr hold: 2w3, then 1w2.',
    validationAffirmation:
      'Spot-on calculation! You correctly identified that 72 hours of daily oversight only accounts for 3 visits in the first week (3w1). Your ability to translate narrative coordination notes into precise CMS-485 frequencies shows high-level administrative competence.',
    remediation: [
      { wrongLabel: 'SN 7w1 (daily for a full week)', wrongExplanation: 'The note specifies "first 72 hours" of daily oversight. In CMS-485 coding, this is 3 visits in week 1 (3w1), not a full week of daily visits (7w1).' },
      { wrongLabel: 'SN 3w1, 2w7', wrongExplanation: 'The 2w7 notation implies 2 visits for 7 weeks, which doesn\'t match the month-1 remainder (3 weeks) plus month-2 (4 weeks at 1/week) structure from the narrative.' },
    ],
  },
  {
    id: 'box-24',
    label: 'Critical Safety & Behavioral Goals',
    shortLabel: 'Safety Priority',
    instruction: 'What must happen BEFORE any wound care begins?',
    correctChipId: 'chip-safety-first',
    tooltipWhy:
      'You cannot treat a patient in the middle of a Silent MI (HR 48, ashen) or in the presence of an unsecured weapon. Safety and life-stabilization always precede wound healing.',
    validationAffirmation:
      'Master-Level Priority! You recognized that clinical care cannot occur in a vacuum of danger. By prioritizing the Bradycardia (Silent MI) and the unsecured firearm over the wound care, you demonstrated the most important trait of a CareIndeed clinician: Total Patient Advocacy and Safety First.',
    remediation: [
      { wrongLabel: 'Perform dressing change first', wrongExplanation: 'If the learner prioritized the wound over the heart rate/firearm, they failed the "Safety First" test. A HR of 48 in an ashen, diaphoretic diabetic patient is a Silent MI until proven otherwise. The cold, pulseless leg indicates acute blockage that can lead to amputation within hours. You cannot perform clinical care in the presence of an unsecured firearm and a confused patient.' },
    ],
  },
]

/* ── Answer Chips ───────────────────────────────────────── */
export const ANSWER_CHIPS: AnswerChip[] = [
  // Diagnosis chips
  { id: 'chip-dx-e11621', label: 'E11.621 — Type 2 DM with foot ulcer', boxTarget: 'box-11', isCorrect: true, category: 'diagnosis' },
  { id: 'chip-dx-cellulitis', label: 'L03.115 — Cellulitis of right foot', boxTarget: 'box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'chip-dx-ischemia', label: 'I74.3 — Acute limb ischemia', boxTarget: 'box-11', isCorrect: false, category: 'diagnosis' },

  // Functional limitation chips
  { id: 'chip-func-endurance-lops', label: 'Endurance, Ambulation, LOPS (Neuropathy)', boxTarget: 'box-15', isCorrect: true, category: 'functional' },
  { id: 'chip-func-ambulation-only', label: 'Ambulation only', boxTarget: 'box-15', isCorrect: false, category: 'functional' },

  // Skilled nursing chips
  { id: 'chip-sn-collagen', label: 'Cleanse NS → Collagen → Foam; notify MD for X-ray/consult', boxTarget: 'box-18', isCorrect: true, category: 'nursing' },
  { id: 'chip-sn-betadine', label: 'Betadine + dry sterile dressing', boxTarget: 'box-18', isCorrect: false, category: 'nursing' },
  { id: 'chip-sn-soak', label: 'Epsom salt soak + air dry', boxTarget: 'box-18', isCorrect: false, category: 'nursing' },

  // Visit frequency chips
  { id: 'chip-freq-3w1-2w3-1w4', label: 'SN 3w1, 2w3, 1w4 | PT 2w3, 1w2', boxTarget: 'box-21', isCorrect: true, category: 'frequency' },
  { id: 'chip-freq-7w1', label: 'SN 7w1, 2w3, 1w4 | PT 2w3, 1w2', boxTarget: 'box-21', isCorrect: false, category: 'frequency' },
  { id: 'chip-freq-3w1-2w7', label: 'SN 3w1, 2w7 | PT 1w5', boxTarget: 'box-21', isCorrect: false, category: 'frequency' },
  { id: 'chip-freq-1w9', label: 'SN 1w9 | PT 2w5', boxTarget: 'box-21', isCorrect: false, category: 'frequency' },

  // Safety chips
  { id: 'chip-safety-first', label: 'Secure firearm + 911 for suspected Silent MI → THEN wound care', boxTarget: 'box-24', isCorrect: true, category: 'safety' },
  { id: 'chip-safety-wound-first', label: 'Perform dressing change to Wagner Grade 3 ulcer first', boxTarget: 'box-24', isCorrect: false, category: 'safety' },
]
