/* ── Henderson Case Data (UPDATED) ────────────────────────────
   Source of truth: Henderson_POC._Challenge_Update.txt
   
   Changes from original:
   - 10 answer choices per question (was 2-3)
   - Full 27-trap remediation bank
   - Updated clinical narrative (shortened per attachment)
   - Safety-first global constraint data
   - Distractor logic metadata (Pickles / Mrs. Gable)
   - Shuffle support flag
   ──────────────────────────────────────────────────────────── */

export type HendersonBox = {
  id: 'box-11' | 'box-15' | 'box-18' | 'box-21' | 'box-24'
  label: string
  shortLabel: string
  instruction: string
  correctChipId: string
  tooltipWhy: string
  validationAffirmation: string
  remediation: { wrongChipId: string; wrongLabel: string; wrongExplanation: string }[]
}

export type AnswerChip = {
  id: string
  label: string
  boxTarget: string
  isCorrect: boolean
  category: 'diagnosis' | 'functional' | 'nursing' | 'frequency' | 'safety'
}

/* ── Clinical Narrative (shortened per attachment) ──────── */
export const HENDERSON_NARRATIVE = {
  patientName: 'George Henderson',
  summary:
    'Upon arrival, the environment was compromised by a loaded handgun, requiring tactical communication to secure the area. The patient is ashen and bradycardic (HR 48); while neuropathy masks chest pain, the presentation suggests a "silent" MI requiring immediate 911 transfer. Simultaneously, the patient has an urgent Wagner Grade 3 great toe ulcer that currently probes to the bone. Socially, a neighbor (Mrs. Gable) arrived unannounced to discuss feline care for the patient\'s cat, "Pickles," as the power remains out.',
  scheduleQuote:
    'SN: Stabilization requires oversight for the first 72 hours (3 visits in week one). Frequency then drops to twice-weekly for the remaining 3 weeks of the month to monitor for osteomyelitis. The second month transitions to once-weekly for 4 weeks.\n\nPT: Sidelined by a 48-hour vascular hold for the pulseless left leg. Thereafter, visits are twice-weekly for 3 weeks, followed by once-weekly for 2 weeks.',
  vitals: {
    hr: '48 bpm (Bradycardia)',
    appearance: 'Ashen, diaphoretic',
    bs: '342 mg/dL',
    bp: '158/92',
    leftLeg: 'Cold, pulseless (acute ischemia)',
    woundGrade: 'Wagner Grade 3 (probe-to-bone)',
    insulin: 'Warm (power out, no refrigeration)',
  },
  environmentalRisks: [
    'Loaded firearm on nightstand',
    'Power outage (no refrigeration → warm insulin)',
    'Daughter has quit as caregiver',
    'Patient confused/agitated',
    'Spoiled insulin',
  ],
  sections: [
    {
      title: 'Clinical Evaluation Narrative',
      content: 'Upon arrival, the environment was compromised by a loaded handgun, requiring tactical communication to secure the area. The patient is ashen and bradycardic (HR 48); while neuropathy masks chest pain, the presentation suggests a "silent" MI requiring immediate 911 transfer.\n\nSimultaneously, the patient has an urgent Wagner Grade 3 great toe ulcer that currently probes to the bone. Socially, a neighbor (Mrs. Gable) arrived unannounced to discuss feline care for the patient\'s cat, "Pickles," as the power remains out.',
    },
    {
      title: 'Physician Coordination',
      content: 'The primary clinician established the following prospective schedule:\n\nSN: Stabilization requires oversight for the first 72 hours (3 visits in week one). Frequency then drops to twice-weekly for the remaining 3 weeks of the month to monitor for osteomyelitis. The second month transitions to once-weekly for 4 weeks.\n\nPT: Sidelined by a 48-hour vascular hold for the pulseless left leg. Thereafter, visits are twice-weekly for 3 weeks, followed by once-weekly for 2 weeks.',
    },
  ],
  /** Distractor tracking — Pickles/Mrs. Gable click counter threshold */
  distractorThreshold: 2,
  distractorMessage: 'Stay focused on the Life-Safety and CMS-485 requirements.',
}

/* ── CMS-485 Boxes — 10 choices each ────────────────────── */
export const HENDERSON_BOXES: HendersonBox[] = [
  /* ═══════ BOX 11: Principal Diagnosis ═══════ */
  {
    id: 'box-11',
    label: 'Box 11: Principal Diagnosis',
    shortLabel: 'Principal Dx',
    instruction: 'Select the correct principal diagnosis code. Goal: Identify the etiology (cause) as the primary home health driver.',
    correctChipId: 'chip-dx-e11621',
    tooltipWhy:
      'Home Health regulations require the primary diagnosis to be the condition that necessitates the "Skilled Service" (wound care). Coding the chronic cause (Diabetes) with the acute manifestation (Ulcer) justifies the long-term clinical oversight. E11.621 captures the metabolic driver and the ulcer manifestation.',
    validationAffirmation:
      'Excellent sequencing! You correctly prioritized the metabolic cause over the superficial symptoms. By coding the Diabetes with Foot Ulcer as primary, you have successfully justified the high-acuity skilled nursing needed for a Wagner Grade 3 wound while satisfying CMS audit requirements for diagnostic etiology.',
    remediation: [
      { wrongChipId: 'chip-dx-cellulitis', wrongLabel: 'L03.115 (Cellulitis of R lower limb)', wrongExplanation: 'Coding Rule: Cellulitis is a manifestation of the wound. To justify Home Health, you must code the etiology (Diabetes) linked to the manifestation (Ulcer) to capture the full clinical picture.' },
      { wrongChipId: 'chip-dx-atherosclerosis', wrongLabel: 'I70.202 (Atherosclerosis of L leg)', wrongExplanation: 'Acuity Trap: While these are the most "acute" issues, they are reasons for ER/Hospitalization. If they are the primary reason for the Home Health visit, the patient is technically too unstable for home care.' },
      { wrongChipId: 'chip-dx-bradycardia', wrongLabel: 'R00.1 (Bradycardia, unspecified)', wrongExplanation: 'Acuity Trap: While these are the most "acute" issues, they are reasons for ER/Hospitalization. If they are the primary reason for the Home Health visit, the patient is technically too unstable for home care.' },
      { wrongChipId: 'chip-dx-osteomyelitis', wrongLabel: 'M86.9 (Osteomyelitis, unspecified)', wrongExplanation: 'Pre-mature Coding: You cannot code Osteomyelitis as primary until it is confirmed by imaging (X-ray/MRI). Stick to the confirmed Wagner Grade 3 ulcer until the "probe-to-bone" is verified.' },
      { wrongChipId: 'chip-dx-chronic-ulcer', wrongLabel: 'L97.519 (Non-pressure chronic ulcer, unspec. severity)', wrongExplanation: 'Specificity Failure: Medicare requires the most specific code available. "Unspecified chronic ulcer" is too vague when we know the patient has Type 2 Diabetes.' },
      { wrongChipId: 'chip-dx-pvd', wrongLabel: 'I73.9 (Peripheral Vascular Disease)', wrongExplanation: 'Specificity Failure: Medicare requires the most specific code available. "PVD" is too vague when we know the patient has Type 2 Diabetes linked to the ulcer.' },
      { wrongChipId: 'chip-dx-neuropathy', wrongLabel: 'E11.40 (Type 2 DM w/ Neuropathy)', wrongExplanation: 'Coding Rule: While neuropathy is present (LOPS), the more acute foot ulcer is the reason for skilled nursing. E11.621 (with foot ulcer) better justifies the clinical grouping.' },
      { wrongChipId: 'chip-dx-dressing', wrongLabel: 'Z48.01 (Encounter for change of surgical dressing)', wrongExplanation: 'This is a routine code, not an illness code. Z-codes describe encounters, not the underlying pathology that justifies home health services.' },
      { wrongChipId: 'chip-dx-disorientation', wrongLabel: 'R41.0 (Disorientation, unspecified)', wrongExplanation: 'Distractor Alert: Disorientation is a symptom, likely of the "Silent MI" or hyperglycemia. It does not justify the skilled nursing need for wound care.' },
    ],
  },

  /* ═══════ BOX 15: Functional Limitations ═══════ */
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
      { wrongChipId: 'chip-func-ambulation-only', wrongLabel: 'Ambulation only', wrongExplanation: 'Ambulation alone does not capture the neuropathy component (LOPS) that is the root cause of the wound going undetected.' },
    ],
  },

  /* ═══════ BOX 18: Skilled Nursing Orders ═══════ */
  {
    id: 'box-18',
    label: 'Box 18: Skilled Nursing Orders',
    shortLabel: 'SN Orders',
    instruction: 'Select the correct wound care and escalation protocol. The "Probe-to-Bone" finding changes status from "Routine Wound" to "Complex/Infected," requiring MD notification.',
    correctChipId: 'chip-sn-collagen',
    tooltipWhy:
      'The "Probe-to-Bone" finding is a clinical red flag for Osteomyelitis. Standard dressings are insufficient; the clinician must initiate a medical escalation with collagen/foam protocol and immediate MD notification for X-ray/specialist consult.',
    validationAffirmation:
      'Critical catch! You didn\'t just "clean a wound"; you identified a medical emergency. By recognizing "Probe-to-Bone" as suspected Osteomyelitis, you moved from a basic dressing change to an advanced clinical protocol. This saves limbs and lives.',
    remediation: [
      { wrongChipId: 'chip-sn-betadine', wrongLabel: 'Betadine + dry sterile dressing', wrongExplanation: 'Betadine is cytotoxic and can delay granulation in a diabetic wound. A dry sterile dressing is inappropriate for a Wagner Grade 3 ulcer requiring moisture balance.' },
      { wrongChipId: 'chip-sn-soak', wrongLabel: 'Epsom salt soak + air dry', wrongExplanation: 'NEVER soak a diabetic foot. Maceration increases infection risk, and hot water can cause burns due to peripheral neuropathy.' },
    ],
  },

  /* ═══════ BOX 21: Visit Frequency (10 choices) ═══════ */
  {
    id: 'box-21',
    label: 'Box 21: Visit Frequency',
    shortLabel: 'Frequency',
    instruction: 'Calculate the correct SN and PT visit schedule. Parse the "72-hour" and "48-hour hold" logic correctly.',
    correctChipId: 'chip-freq-correct',
    tooltipWhy:
      'Box 21 Logic: 72 hours stabilization = 3 visits in week 1 (3w1), NOT 7w1. After week 1, 3 remaining weeks at 2/week (2w3). Month 2: 4 weeks at 1/week (1w4). PT starts after 48-hr hold: 2w3, then 1w2.',
    validationAffirmation:
      'Spot-on calculation! You correctly identified that 72 hours of daily oversight only accounts for 3 visits in the first week (3w1). Your ability to translate narrative coordination notes into precise CMS-485 frequencies shows high-level administrative competence.',
    remediation: [
      { wrongChipId: 'chip-freq-trap2', wrongLabel: 'SN: 7w1, 2w3, 1w4 | PT: 2w3, 1w2', wrongExplanation: '72 hours of stabilization equals 3 calendar days. Coding 7w1 suggests a full week of daily visits, which is an over-utilization of resources not supported by the 72-hour narrative.' },
      { wrongChipId: 'chip-freq-trap3', wrongLabel: 'SN: 3w1, 2w7 | PT: 1w5', wrongExplanation: 'Audit Failure: Frequencies must reflect the patient\'s expected progress. Keeping a high frequency for 7 weeks straight without a "step-down" (e.g., 2w7) suggests the patient is not improving, which can lead to claim denials.' },
      { wrongChipId: 'chip-freq-trap4', wrongLabel: 'SN: 3w1, 2w3, 1w4 | PT: 1w1, 2w4', wrongExplanation: 'Careful: The narrative states PT starts after a 48-hour hold within the existing week. Adding an extra 1w1 evaluation week incorrectly extends the certification period beyond the physician\'s intent.' },
      { wrongChipId: 'chip-freq-trap5', wrongLabel: 'SN: 1w9 | PT: 2w5', wrongExplanation: 'Safety Risk: 1w9 is insufficient for a Wagner Grade 3 ulcer and an unstable cardiac status. This frequency fails to provide the "Skilled Oversight" required for a patient of this acuity.' },
      { wrongChipId: 'chip-freq-trap6', wrongLabel: 'SN: 7w1, 2w8 | PT: 2w5', wrongExplanation: 'Documentation Discrepancy: These numbers do not appear in the physician\'s coordination notes. In a real audit, the 485 must match the verbal or written coordination exactly.' },
      { wrongChipId: 'chip-freq-trap7', wrongLabel: 'SN: 3w1, 2w3, 1w4 | PT: 2w5', wrongExplanation: 'PT Logic Error: The narrative explicitly requested a taper to once-weekly for the final two weeks. Failing to document the taper suggests a lack of discharge planning.' },
      { wrongChipId: 'chip-freq-trap8', wrongLabel: 'SN: 5w1, 3w3, 2w5 | PT: 3w2, 1w3', wrongExplanation: 'Documentation Discrepancy: These numbers do not appear in the physician\'s coordination notes. In a real audit, the 485 must match the verbal or written coordination exactly.' },
      { wrongChipId: 'chip-freq-trap9', wrongLabel: 'SN: 2w4, 1w5 | PT: 2w4, 1w5', wrongExplanation: 'Mirroring disciplines (giving SN and PT the same schedule) is a red flag for "cookie-cutter" care. Each discipline must have a frequency justified by its specific goals.' },
      { wrongChipId: 'chip-freq-trap10', wrongLabel: 'SN: 4w1, 2w8 | PT: 2w8', wrongExplanation: 'Mirroring disciplines (giving SN and PT the same schedule) is a red flag for "cookie-cutter" care. Each discipline must have a frequency justified by its specific goals. Also fails to address the 72-hour stabilization.' },
    ],
  },

  /* ═══════ BOX 24: Safety Priority (Mandatory Decision) ═══════ */
  {
    id: 'box-24',
    label: 'Mandatory Decision: Clinical Priority',
    shortLabel: 'Safety Priority',
    instruction: 'What must happen BEFORE any wound care begins? Prioritize Life-Safety (Weapon/Cardiac) over Wound Care.',
    correctChipId: 'chip-safety-correct',
    tooltipWhy:
      'You cannot treat a patient in the middle of a Silent MI (HR 48, ashen) or in the presence of an unsecured weapon. Safety and life-stabilization always precede wound healing.',
    validationAffirmation:
      'Master-Level Priority! You recognized that clinical care cannot occur in a vacuum of danger. By prioritizing the Bradycardia (Silent MI) and the unsecured firearm over the wound care, you demonstrated the most important trait of a CareIndeed clinician: Total Patient Advocacy and Safety First.',
    remediation: [
      { wrongChipId: 'chip-safety-wound-first', wrongLabel: 'Perform wound care to R great toe to prevent further infection', wrongExplanation: 'Clinical Negligence: Performing wound care while a patient is ashen and bradycardic (HR 48) is a failure to recognize a life-threatening cardiac event.' },
      { wrongChipId: 'chip-safety-ekg', wrongLabel: 'Secure the firearm and then perform a 12-lead EKG', wrongExplanation: 'Delay of Care: You are in a home, not an ER. Performing a 12-lead EKG yourself delays the definitive care provided by EMS and the hospital.' },
      { wrongChipId: 'chip-safety-insulin', wrongLabel: 'Educate daughter on insulin storage temperatures (78°F)', wrongExplanation: 'Priority Error: While power outages and insulin temperatures are important, they are "Logistical" issues. You are currently facing a "Life-Safety" issue.' },
      { wrongChipId: 'chip-safety-warmcompress', wrongLabel: 'Assess the L leg pulselessness and apply a warm compress', wrongExplanation: 'Danger! Applying heat to an ischemic limb (no pulse) can cause catastrophic tissue damage because the blood flow cannot carry the heat away.' },
      { wrongChipId: 'chip-safety-pickles', wrongLabel: 'Locate "Pickles" the cat to reduce patient anxiety/confusion', wrongExplanation: 'Focus! While the patient is worried about the cat, the clinician must ignore the "Pickles" distractor to manage the active Myocardial Infarction.' },
      { wrongChipId: 'chip-safety-power', wrongLabel: 'Contact the power company to restore electricity for the patient', wrongExplanation: 'Priority Error: While power outages and insulin temperatures are important, they are "Logistical" issues. You are currently facing a "Life-Safety" issue.' },
      { wrongChipId: 'chip-safety-meds', wrongLabel: 'Reconcile the Glyburide/Lisinopril error immediately', wrongExplanation: 'Important, but doesn\'t fix the active MI. Medication reconciliation can occur after the life threat is addressed.' },
      { wrongChipId: 'chip-safety-pressure', wrongLabel: 'Apply a pressure dressing to the R great toe ulcer', wrongExplanation: 'Improper wound care technique for a Wagner Grade 3 ulcer, and clinical care must wait until safety is established.' },
      { wrongChipId: 'chip-safety-neighbor', wrongLabel: 'Instruct Mrs. Gable to take the patient to her house', wrongExplanation: 'Abandonment: Moving an unstable, bradycardic patient to a neighbor\'s house without medical transport is unsafe and legally indefensible.' },
    ],
  },
]

/* ── Answer Chips — Full 10-choice answer bank ──────────── */
export const ANSWER_CHIPS: AnswerChip[] = [
  // ─── Box 11: Principal Diagnosis (10 choices) ───
  { id: 'chip-dx-e11621', label: 'E11.621 — Type 2 DM with foot ulcer', boxTarget: 'box-11', isCorrect: true, category: 'diagnosis' },
  { id: 'chip-dx-cellulitis', label: 'L03.115 — Cellulitis of R lower limb', boxTarget: 'box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'chip-dx-atherosclerosis', label: 'I70.202 — Atherosclerosis of L leg', boxTarget: 'box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'chip-dx-bradycardia', label: 'R00.1 — Bradycardia, unspecified', boxTarget: 'box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'chip-dx-osteomyelitis', label: 'M86.9 — Osteomyelitis, unspecified', boxTarget: 'box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'chip-dx-chronic-ulcer', label: 'L97.519 — Non-pressure chronic ulcer, unspec. severity', boxTarget: 'box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'chip-dx-pvd', label: 'I73.9 — Peripheral Vascular Disease', boxTarget: 'box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'chip-dx-neuropathy', label: 'E11.40 — Type 2 DM with Neuropathy', boxTarget: 'box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'chip-dx-dressing', label: 'Z48.01 — Encounter for change of surgical dressing', boxTarget: 'box-11', isCorrect: false, category: 'diagnosis' },
  { id: 'chip-dx-disorientation', label: 'R41.0 — Disorientation, unspecified', boxTarget: 'box-11', isCorrect: false, category: 'diagnosis' },

  // ─── Box 15: Functional Limitations (2 choices — kept from original) ───
  { id: 'chip-func-endurance-lops', label: 'Endurance, Ambulation, LOPS (Neuropathy)', boxTarget: 'box-15', isCorrect: true, category: 'functional' },
  { id: 'chip-func-ambulation-only', label: 'Ambulation only', boxTarget: 'box-15', isCorrect: false, category: 'functional' },

  // ─── Box 18: Skilled Nursing Orders (3 choices — kept from original) ───
  { id: 'chip-sn-collagen', label: 'Cleanse NS → Collagen → Foam; notify MD for X-ray/consult', boxTarget: 'box-18', isCorrect: true, category: 'nursing' },
  { id: 'chip-sn-betadine', label: 'Betadine + dry sterile dressing', boxTarget: 'box-18', isCorrect: false, category: 'nursing' },
  { id: 'chip-sn-soak', label: 'Epsom salt soak + air dry', boxTarget: 'box-18', isCorrect: false, category: 'nursing' },

  // ─── Box 21: Visit Frequency (10 choices) ───
  { id: 'chip-freq-correct', label: 'SN: 3w1, 2w3, 1w4 | PT: 2w3, 1w2', boxTarget: 'box-21', isCorrect: true, category: 'frequency' },
  { id: 'chip-freq-trap2', label: 'SN: 7w1, 2w3, 1w4 | PT: 2w3, 1w2', boxTarget: 'box-21', isCorrect: false, category: 'frequency' },
  { id: 'chip-freq-trap3', label: 'SN: 3w1, 2w7 | PT: 1w5', boxTarget: 'box-21', isCorrect: false, category: 'frequency' },
  { id: 'chip-freq-trap4', label: 'SN: 3w1, 2w3, 1w4 | PT: 1w1, 2w4', boxTarget: 'box-21', isCorrect: false, category: 'frequency' },
  { id: 'chip-freq-trap5', label: 'SN: 1w9 | PT: 2w5', boxTarget: 'box-21', isCorrect: false, category: 'frequency' },
  { id: 'chip-freq-trap6', label: 'SN: 7w1, 2w8 | PT: 2w5', boxTarget: 'box-21', isCorrect: false, category: 'frequency' },
  { id: 'chip-freq-trap7', label: 'SN: 3w1, 2w3, 1w4 | PT: 2w5', boxTarget: 'box-21', isCorrect: false, category: 'frequency' },
  { id: 'chip-freq-trap8', label: 'SN: 5w1, 3w3, 2w5 | PT: 3w2, 1w3', boxTarget: 'box-21', isCorrect: false, category: 'frequency' },
  { id: 'chip-freq-trap9', label: 'SN: 2w4, 1w5 | PT: 2w4, 1w5', boxTarget: 'box-21', isCorrect: false, category: 'frequency' },
  { id: 'chip-freq-trap10', label: 'SN: 4w1, 2w8 | PT: 2w8', boxTarget: 'box-21', isCorrect: false, category: 'frequency' },

  // ─── Box 24: Mandatory Decision / Safety Priority (10 choices) ───
  { id: 'chip-safety-correct', label: 'Establish safety: secure firearm, initiate 911 for HR 48/Ashen', boxTarget: 'box-24', isCorrect: true, category: 'safety' },
  { id: 'chip-safety-wound-first', label: 'Perform wound care to R great toe to prevent further infection', boxTarget: 'box-24', isCorrect: false, category: 'safety' },
  { id: 'chip-safety-ekg', label: 'Secure the firearm and then perform a 12-lead EKG', boxTarget: 'box-24', isCorrect: false, category: 'safety' },
  { id: 'chip-safety-insulin', label: 'Educate daughter on insulin storage temperatures (78°F)', boxTarget: 'box-24', isCorrect: false, category: 'safety' },
  { id: 'chip-safety-warmcompress', label: 'Assess the L leg pulselessness and apply a warm compress', boxTarget: 'box-24', isCorrect: false, category: 'safety' },
  { id: 'chip-safety-pickles', label: 'Locate "Pickles" the cat to reduce patient anxiety/confusion', boxTarget: 'box-24', isCorrect: false, category: 'safety' },
  { id: 'chip-safety-power', label: 'Contact the power company to restore electricity for the patient', boxTarget: 'box-24', isCorrect: false, category: 'safety' },
  { id: 'chip-safety-meds', label: 'Reconcile the Glyburide/Lisinopril error immediately', boxTarget: 'box-24', isCorrect: false, category: 'safety' },
  { id: 'chip-safety-pressure', label: 'Apply a pressure dressing to the R great toe ulcer', boxTarget: 'box-24', isCorrect: false, category: 'safety' },
  { id: 'chip-safety-neighbor', label: 'Instruct Mrs. Gable to take the patient to her house', boxTarget: 'box-24', isCorrect: false, category: 'safety' },
]

/* ── Expert feedback for 100% success ──────────────────── */
export const EXPERT_SUCCESS_MESSAGE =
  'CareIndeed Clinical Master Confirmed! You successfully navigated 27 clinical and administrative traps. You prioritized life over logistics, etiology over symptoms, and precise math over "cookie-cutter" scheduling. George Henderson is safe because of your clinical judgment.'

/* ── Safety-First Global Constraint ────────────────────── */
export const SAFETY_ALERT = {
  title: 'CareIndeed Safety Alert',
  message:
    'Stop! You attempted clinical care while a patient was in cardiac distress (HR 48) and a weapon was unsecured. Safety and 911 take precedence over dressings.',
  /** If box-18 is completed before box-24, trigger this alert */
  triggerCondition: 'box-18 placed before box-24',
}
