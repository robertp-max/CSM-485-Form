/* ── Practice Scenario Data ──────────────────────────────────────
 *  Clinical scenarios for CMS-485 practice at 3 difficulty levels:
 *    Easy (CHF) · Intermediate (Post-CVA) · Master (Henderson)
 *  Shared types re-used by Interactive485Form and answer grading.
 * ─────────────────────────────────────────────────────────────── */

export interface AnswerChip {
  id: string
  boxId: string
  label: string
  trapNote?: string
}

export interface FormBox {
  id: string
  label: string
  correctChipId: string
  tooltipWhy: string
  validationAffirmation: string
}

export interface ClinicalNarrative {
  vitals: Record<string, string>
  environmentalRisks: string[]
  sections: { title: string; content: string }[]
}

export interface PracticeScenario {
  id: string
  title: string
  subtitle: string
  patientName: string
  difficulty: 'easy' | 'intermediate' | 'master'
  difficultyLabel: string
  chips: AnswerChip[]
  boxes: FormBox[]
  narrative: ClinicalNarrative
}

// ─── EASY: Mary Chen — Congestive Heart Failure ───────────────
export const EASY_SCENARIO: PracticeScenario = {
  id: 'easy',
  title: 'Case: Mary Chen',
  subtitle: 'Congestive Heart Failure — Straightforward Admission',
  patientName: 'Mary Chen',
  difficulty: 'easy',
  difficultyLabel: 'Beginner',
  narrative: {
    vitals: {
      bloodPressure: '152/88',
      heartRate: '88 bpm',
      spO2: '91% (room air)',
      weightChange: '+8 lbs / 5 days',
    },
    environmentalRisks: [
      'Lives alone in single-story apartment',
      'No medication organizer — pills loose in cabinet',
      'High-sodium diet habits (canned soups, deli meats)',
      'Bathroom without grab bars or non-slip mats',
    ],
    sections: [
      {
        title: 'Clinical Evaluation',
        content:
          'Mrs. Chen was discharged from Sacramento General Hospital three days ago following a 5-day admission for acute decompensation of congestive heart failure. She reports progressive shortness of breath over the past week, with new 2-pillow orthopnea and bilateral ankle edema. Her daily weights have shown an 8-pound gain over 5 days. She is compliant with her medications when reminded but admits to eating canned soup and deli meats frequently. Her daughter, Lisa, visits twice weekly and helps with grocery shopping.',
      },
      {
        title: 'Physician Coordination',
        content:
          'The physician has ordered home health nursing to monitor fluid status, ensure medication compliance with Lasix 40mg daily and Lisinopril 10mg daily, and provide dietary education on sodium restriction. Nursing visits are ordered twice weekly for the first four weeks to stabilize the fluid management regimen, then once weekly for the remaining four weeks of the certification period to confirm sustained compliance.',
      },
    ],
  },
  boxes: [
    {
      id: 'box-11',
      label: '11. Principal Diagnosis',
      correctChipId: 'easy-11-1',
      tooltipWhy: 'The primary diagnosis should be the underlying condition driving the need for skilled nursing — not just a symptom.',
      validationAffirmation: 'Correct! I50.9 captures the heart failure that necessitates skilled monitoring, not just a symptom like edema or dyspnea.',
    },
    {
      id: 'box-15',
      label: '15. Functional Limitations',
      correctChipId: 'easy-15-1',
      tooltipWhy: 'Functional limitations should reflect what the condition prevents the patient from doing independently.',
      validationAffirmation: 'Well done! Endurance and ambulation limitations directly correlate with CHF decompensation, and dyspnea on exertion is measurable.',
    },
    {
      id: 'box-18',
      label: '18. Skilled Nursing Orders',
      correctChipId: 'easy-18-1',
      tooltipWhy: 'Skilled nursing orders must be specific, measurable, and tied to the diagnosis.',
      validationAffirmation: 'Perfect! Daily weights, I/O monitoring, and medication compliance teaching are the gold-standard CHF skilled interventions.',
    },
    {
      id: 'box-21',
      label: '21. Visit Frequency',
      correctChipId: 'easy-21-1',
      tooltipWhy: 'The frequency must match physician orders and be clinically justified.',
      validationAffirmation: 'Correct! The physician ordered 2w4 then 1w4 — straightforward and audit-safe.',
    },
    {
      id: 'box-24',
      label: '24. Safety / Emergency Actions',
      correctChipId: 'easy-24-1',
      tooltipWhy: "Safety measures should address the patient's specific risks at home.",
      validationAffirmation: 'Great! Fall precautions, a daily weight log, and clear 911 instructions for sudden weight gain or SOB are essential CHF safety measures.',
    },
  ],
  chips: [
    // Box 11 — 4 choices
    { id: 'easy-11-1', boxId: 'box-11', label: 'I50.9 (Heart failure, unspecified)' },
    { id: 'easy-11-2', boxId: 'box-11', label: 'I10 (Essential hypertension)', trapNote: 'Contributing factor, not the primary reason for home health services.' },
    { id: 'easy-11-3', boxId: 'box-11', label: 'J81.0 (Acute pulmonary edema)', trapNote: 'A symptom of CHF decompensation, not the underlying diagnosis.' },
    { id: 'easy-11-4', boxId: 'box-11', label: 'R06.00 (Dyspnea, unspecified)', trapNote: 'A symptom code — never use as primary for home health billing.' },
    // Box 15
    { id: 'easy-15-1', boxId: 'box-15', label: 'Endurance, Ambulation, Dyspnea on Exertion' },
    { id: 'easy-15-2', boxId: 'box-15', label: 'Paralysis, Contracture, Aphasia', trapNote: 'Neurological limitations — not relevant to a CHF case.' },
    { id: 'easy-15-3', boxId: 'box-15', label: 'Total Assist for ADLs, Bedbound', trapNote: 'Overstates acuity — patient is ambulatory with limitations.' },
    { id: 'easy-15-4', boxId: 'box-15', label: 'Cognitive Impairment, Memory Loss', trapNote: 'No cognitive issues noted in the evaluation.' },
    // Box 18
    { id: 'easy-18-1', boxId: 'box-18', label: 'Daily weights, I/O monitoring, med compliance teaching, edema assessment q visit' },
    { id: 'easy-18-2', boxId: 'box-18', label: 'Wound care with NS and foam dressing changes BID', trapNote: 'No wound documented in this case.' },
    { id: 'easy-18-3', boxId: 'box-18', label: 'Insulin administration and blood sugar monitoring q4h', trapNote: 'Patient is not diabetic — this is a CHF case.' },
    { id: 'easy-18-4', boxId: 'box-18', label: 'ROM exercises and gait training with walker', trapNote: 'These are PT orders, not skilled nursing interventions.' },
    // Box 21
    { id: 'easy-21-1', boxId: 'box-21', label: 'SN: 2w4, 1w4' },
    { id: 'easy-21-2', boxId: 'box-21', label: 'SN: 7w1, 1w7', trapNote: 'Daily visits for a full week is over-utilization for stable CHF.' },
    { id: 'easy-21-3', boxId: 'box-21', label: 'SN: 1w8', trapNote: 'Once weekly from the start is too infrequent for acute decompensation.' },
    { id: 'easy-21-4', boxId: 'box-21', label: 'SN: 3w2, 2w6', trapNote: "Does not match the physician's ordered frequency." },
    // Box 24
    { id: 'easy-24-1', boxId: 'box-24', label: 'Fall precautions, daily weight log, 911 instructions for wt gain >2lbs/day or SOB' },
    { id: 'easy-24-2', boxId: 'box-24', label: 'Wound care supply education and dressing schedule', trapNote: 'No wound in this case — wrong patient scenario.' },
    { id: 'easy-24-3', boxId: 'box-24', label: 'Referral to speech therapy for swallowing evaluation', trapNote: 'No swallowing issues documented.' },
    { id: 'easy-24-4', boxId: 'box-24', label: 'DME installation of hospital bed and Hoyer lift', trapNote: 'Patient is not bedbound — this overstates the need.' },
  ],
}

// ─── INTERMEDIATE: Robert Williams — Post-CVA with Diabetes ───
export const INTERMEDIATE_SCENARIO: PracticeScenario = {
  id: 'intermediate',
  title: 'Case: Robert Williams',
  subtitle: 'Post-CVA with Diabetes — Complex Multisystem',
  patientName: 'Robert Williams',
  difficulty: 'intermediate',
  difficultyLabel: 'Intermediate',
  narrative: {
    vitals: {
      bloodPressure: '168/94',
      heartRate: '76 bpm',
      bloodSugar: '198 mg/dL',
      rightStrength: '3/5 (Hemiparesis)',
    },
    environmentalRisks: [
      'Throw rugs throughout the home (trip hazard)',
      'Bedroom upstairs — narrow staircase',
      'Wife works full-time (no daytime caregiver)',
      'Medications stored on high shelf in kitchen',
    ],
    sections: [
      {
        title: 'Clinical Evaluation',
        content:
          'Mr. Williams experienced a left-hemisphere cerebral infarction 10 days ago resulting in right-sided hemiparesis (3/5 strength), mild expressive aphasia, and difficulty with fine motor tasks. He was managing his Type 2 Diabetes well prior to the stroke with oral medications only, but his blood sugars have been elevated since admission (current BS 198). His wife, Sandra, works full-time as a school teacher and is unavailable during daytime hours. The two-story home has the master bedroom upstairs with multiple throw rugs on hardwood floors throughout. Mr. Williams was previously independent in all Activities of Daily Living.',
      },
      {
        title: 'Physician Coordination',
        content:
          'The physician has ordered nursing visits three times weekly for the first two weeks during the acute recovery phase for neurological assessments, medication management, and caregiver training for the wife. This will taper to twice weekly for two weeks as the patient stabilizes, then once weekly for the remaining four weeks. Physical Therapy is ordered at three times weekly for four weeks for gait training and strengthening, then twice weekly for four weeks for continued fall prevention. Occupational Therapy is ordered at twice weekly for four weeks then once weekly for four weeks for ADL retraining and fine motor recovery.',
      },
    ],
  },
  boxes: [
    {
      id: 'box-11',
      label: '11. Principal Diagnosis',
      correctChipId: 'mid-11-1',
      tooltipWhy: 'The primary diagnosis must be the condition that necessitates the majority of skilled services.',
      validationAffirmation: 'Correct! The cerebral infarction (I63.9) drives the nursing, PT, and OT needs.',
    },
    {
      id: 'box-15',
      label: '15. Functional Limitations',
      correctChipId: 'mid-15-1',
      tooltipWhy: 'Document limitations that are directly caused by the primary condition and require skilled intervention.',
      validationAffirmation: 'Well done! Ambulation, endurance, speech, and right-sided weakness are all direct consequences of the CVA.',
    },
    {
      id: 'box-18',
      label: '18. Skilled Nursing Orders',
      correctChipId: 'mid-18-1',
      tooltipWhy: 'Orders must address the clinical complexity — neuro monitoring plus multi-discipline coordination.',
      validationAffirmation: 'Excellent! Neuro assessment, fall prevention, med management, and caregiver training address the full scope of this complex case.',
    },
    {
      id: 'box-21',
      label: '21. Visit Frequency',
      correctChipId: 'mid-21-1',
      tooltipWhy: "Parse each discipline's schedule separately from the narrative.",
      validationAffirmation: 'Spot-on! You correctly parsed all three disciplines: SN 3w2→2w2→1w4, PT 3w4→2w4, OT 2w4→1w4.',
    },
    {
      id: 'box-24',
      label: '24. Safety / Emergency Actions',
      correctChipId: 'mid-24-1',
      tooltipWhy: "Safety measures must address the patient's specific functional deficits and home environment.",
      validationAffirmation: 'Great catch! Removing rugs, moving the bedroom downstairs, right-side assist, and stroke symptom recognition are all critical.',
    },
  ],
  chips: [
    // Box 11 — 6 choices
    { id: 'mid-11-1', boxId: 'box-11', label: 'I63.9 (Cerebral infarction, unspecified)' },
    { id: 'mid-11-2', boxId: 'box-11', label: 'E11.9 (Type 2 DM without complications)', trapNote: 'Diabetes is a comorbidity, not the primary reason for home health.' },
    { id: 'mid-11-3', boxId: 'box-11', label: 'I10 (Essential hypertension)', trapNote: 'A risk factor for stroke but not the primary home health diagnosis.' },
    { id: 'mid-11-4', boxId: 'box-11', label: 'G81.91 (Hemiplegia, right side, unspecified)', trapNote: 'A symptom/manifestation of the CVA, not the underlying condition.' },
    { id: 'mid-11-5', boxId: 'box-11', label: 'R47.01 (Aphasia)', trapNote: 'A symptom of the stroke — never code a symptom as primary.' },
    { id: 'mid-11-6', boxId: 'box-11', label: 'I69.351 (Hemiplegia following cerebral infarction)', trapNote: 'Sequelae code — premature at only 10 days post-event.' },
    // Box 15
    { id: 'mid-15-1', boxId: 'box-15', label: 'Ambulation, Endurance, Speech, Right-sided Weakness' },
    { id: 'mid-15-2', boxId: 'box-15', label: 'Total Assist for ADLs, Bedbound, Ventilator-dependent', trapNote: "Significantly overstates the patient's current acuity." },
    { id: 'mid-15-3', boxId: 'box-15', label: 'LOPS, Amputation Risk, Bowel Incontinence', trapNote: 'Diabetic/wound-related limitations, not stroke-related.' },
    { id: 'mid-15-4', boxId: 'box-15', label: 'Legally Blind, Bilateral Deafness', trapNote: 'Not supported by any findings in the evaluation.' },
    { id: 'mid-15-5', boxId: 'box-15', label: 'Confusion, Wandering, Aggressive Behavior', trapNote: 'Patient has aphasia, not confusion or behavioral issues.' },
    { id: 'mid-15-6', boxId: 'box-15', label: 'Severe Pain, Joint Contracture, Decubitus Ulcer', trapNote: 'Not documented in the current evaluation.' },
    // Box 18
    { id: 'mid-18-1', boxId: 'box-18', label: 'Neuro assessment, fall prevention, med management, PT/OT coordination, caregiver training' },
    { id: 'mid-18-2', boxId: 'box-18', label: 'Daily wound care with NS and collagen dressing', trapNote: 'No wound documented — wrong clinical scenario.' },
    { id: 'mid-18-3', boxId: 'box-18', label: 'Insulin sliding scale and BG monitoring q4h', trapNote: 'Diabetes was well-controlled pre-stroke; oral meds only.' },
    { id: 'mid-18-4', boxId: 'box-18', label: 'Tracheostomy care and suctioning PRN', trapNote: 'No tracheostomy — completely irrelevant to this case.' },
    { id: 'mid-18-5', boxId: 'box-18', label: 'IV antibiotic administration and PICC line care', trapNote: 'No IV therapy ordered for this patient.' },
    { id: 'mid-18-6', boxId: 'box-18', label: 'Cardiac telemetry monitoring and oxygen titration', trapNote: "Not ordered — patient's cardiac status is stable." },
    // Box 21
    { id: 'mid-21-1', boxId: 'box-21', label: 'SN: 3w2, 2w2, 1w4 | PT: 3w4, 2w4 | OT: 2w4, 1w4' },
    { id: 'mid-21-2', boxId: 'box-21', label: 'SN: 7w1, 1w7 | PT: 3w8', trapNote: 'Daily nursing not justified; PT has no taper.' },
    { id: 'mid-21-3', boxId: 'box-21', label: 'SN: 1w8 | PT: 1w8', trapNote: 'Far too infrequent for an acute CVA recovery.' },
    { id: 'mid-21-4', boxId: 'box-21', label: 'SN: 2w8 | PT: 2w8 | OT: 2w8', trapNote: 'No taper pattern — does not reflect improving status.' },
    { id: 'mid-21-5', boxId: 'box-21', label: 'SN: 3w1, 2w3, 1w4 | PT: 2w3, 1w2', trapNote: 'This is the Henderson schedule — wrong patient.' },
    { id: 'mid-21-6', boxId: 'box-21', label: 'SN: 5w2, 3w4 | PT: 5w2, 3w4', trapNote: "Extreme over-utilization that won't survive an audit." },
    // Box 24
    { id: 'mid-24-1', boxId: 'box-24', label: 'Fall precautions, remove throw rugs, move bedroom downstairs, 911 for stroke symptoms' },
    { id: 'mid-24-2', boxId: 'box-24', label: 'Wound care supply teaching and dressing change schedule', trapNote: 'No wound in this case.' },
    { id: 'mid-24-3', boxId: 'box-24', label: 'Oxygen safety and smoking cessation counseling', trapNote: "Not relevant to this patient's documented needs." },
    { id: 'mid-24-4', boxId: 'box-24', label: 'Secure firearm and initiate 911 for cardiac emergency', trapNote: 'This is the Henderson scenario — wrong patient.' },
    { id: 'mid-24-5', boxId: 'box-24', label: 'Diabetic foot care teaching only', trapNote: 'DM is a comorbidity; the priority is stroke recovery and fall prevention.' },
    { id: 'mid-24-6', boxId: 'box-24', label: 'Home exercise program without supervision', trapNote: 'Unsafe — patient has hemiparesis and requires supervised therapy.' },
  ],
}

// ─── MASTER: George Henderson — The Full Challenge ────────────
export const MASTER_SCENARIO: PracticeScenario = {
  id: 'master',
  title: 'Case: George Henderson',
  subtitle: 'Multi-System Crisis — Expert Level',
  patientName: 'George Henderson',
  difficulty: 'master',
  difficultyLabel: 'Expert',
  narrative: {
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
        title: 'Clinical Evaluation',
        content:
          'Upon arrival, the environment was compromised by a loaded handgun, requiring tactical communication to secure the area. The patient is ashen and bradycardic (HR 48); while neuropathy masks chest pain, the presentation suggests a "silent" MI requiring immediate 911 transfer. Simultaneously, the patient has an urgent Wagner Grade 3 great toe ulcer that currently probes to the bone. Socially, a neighbor (Mrs. Gable) arrived unannounced to discuss feline care for the patient\'s cat, "Pickles," as the power remains out.',
      },
      {
        title: 'Physician Coordination',
        content:
          'SN: Stabilization requires oversight for the first 72 hours (3 visits in week one). Frequency then drops to twice-weekly for the remaining 3 weeks of the month to monitor for osteomyelitis. The second month transitions to once-weekly for 4 weeks. PT: Sidelined by a 48-hour vascular hold for the pulseless left leg. Thereafter, visits are twice-weekly for 3 weeks, followed by once-weekly for 2 weeks.',
      },
    ],
  },
  boxes: [
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
  ],
  chips: [
    // Box 11 — 10 choices
    { id: '11-1', boxId: 'box-11', label: 'E11.621 (Type 2 DM w/ foot ulcer)' },
    { id: '11-2', boxId: 'box-11', label: 'L97.519 (Non-pressure chronic ulcer of R foot, unspecified severity)', trapNote: 'Specificity Failure: This code lacks the Diabetes link. Medicare requires the most specific code — unspecified severity is too vague when we know the wound is Wagner Grade 3.' },
    { id: '11-3', boxId: 'box-11', label: 'L03.115 (Cellulitis of right lower limb)', trapNote: 'Coding Rule: Cellulitis is a manifestation of the wound. You must code the etiology (Diabetes) linked to the manifestation (Ulcer) to capture the full clinical picture and justify home health.' },
    { id: '11-4', boxId: 'box-11', label: 'I70.202 (Atherosclerosis of native arteries of L leg w/ ulcer)', trapNote: 'Acuity Trap: While ischemia is present, it is a secondary finding. If vascular disease were the primary driver, the patient would need a vascular consult first — not home health wound care.' },
    { id: '11-5', boxId: 'box-11', label: 'E11.40 (Type 2 DM with Diabetic Neuropathy, unspecified)', trapNote: 'Incomplete Coding: Neuropathy is the mechanism that caused the ulcer, but E11.40 does not capture the active foot ulcer that is the reason for the home health episode.' },
    { id: '11-6', boxId: 'box-11', label: 'I73.9 (Peripheral vascular disease, unspecified)', trapNote: 'Specificity Failure: Too non-specific for an ulcer case where we know the underlying etiology. "Unspecified PVD" will not support a high-acuity clinical grouping for reimbursement.' },
    { id: '11-7', boxId: 'box-11', label: 'R00.1 (Bradycardia, unspecified)', trapNote: 'Acuity Trap: HR 48 is a reason for an ER visit, not home health admission. If bradycardia is the primary reason for the visit, the patient is too unstable to receive home care.' },
    { id: '11-8', boxId: 'box-11', label: 'M86.9 (Osteomyelitis, unspecified)', trapNote: 'Premature Coding: You cannot code Osteomyelitis as primary until confirmed by imaging (X-ray/MRI). The probe-to-bone finding is a clinical indicator, not a confirmed diagnosis — code the known Wagner Grade 3 ulcer.' },
    { id: '11-9', boxId: 'box-11', label: 'Z48.01 (Encounter for change of surgical dressing)', trapNote: 'Wrong Code Type: Z48.01 is a routine aftercare code used for post-operative dressing changes, not for an active, infected diabetic ulcer with suspected osteomyelitis.' },
    { id: '11-10', boxId: 'box-11', label: 'R41.0 (Disorientation, unspecified)', trapNote: 'Distractor Alert: Disorientation is a symptom — likely secondary to the Silent MI or hyperglycemia. It does not justify the skilled nursing need for wound care and cannot be a primary home health diagnosis.' },
    // Box 15
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
    // Box 18
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
    // Box 21
    { id: '21-1', boxId: 'box-21', label: 'SN: 3w1, 2w3, 1w4 | PT: 2w3, 1w2' },
    { id: '21-2', boxId: 'box-21', label: 'SN: 7w1, 2w3, 1w4 | PT: 2w3, 1w2', trapNote: 'Audit Error: 72 hours of stabilization equals 3 calendar days, so 3w1 is correct. Coding 7w1 suggests a full week of daily visits — that\'s over-utilization not supported by the narrative and exactly the kind of math trap auditors catch.' },
    { id: '21-3', boxId: 'box-21', label: 'SN: 3w1, 2w7 | PT: 1w5', trapNote: 'Audit Failure: Frequencies must reflect expected patient progress. Maintaining a high frequency for 7 straight weeks without a step-down suggests the patient is not improving, which triggers claim denials for "lack of medical necessity."' },
    { id: '21-4', boxId: 'box-21', label: 'SN: 1w9 | PT: 2w5', trapNote: 'Safety Risk: 1w9 is dangerously insufficient for a Wagner Grade 3 ulcer and an unstable cardiac status. This frequency fails to provide the skilled oversight required for a patient of this acuity.' },
    { id: '21-5', boxId: 'box-21', label: 'SN: 5w1, 3w3, 2w5 | PT: 3w2, 1w3', trapNote: 'Documentation Discrepancy: These numbers do not appear anywhere in the physician\'s coordination notes. In a real audit, every visit frequency on the 485 must be traceable to a verbal or written physician order.' },
    { id: '21-6', boxId: 'box-21', label: 'SN: 3w1, 2w3, 1w4 | PT: 1w1, 2w4', trapNote: 'PT Logic Error: The narrative states PT starts after a 48-hour hold within the existing week. Adding an extra 1w1 evaluation week incorrectly extends the certification period and inflates visit counts beyond the physician\'s intent.' },
    { id: '21-7', boxId: 'box-21', label: 'SN: 7w1, 2w8 | PT: 2w5', trapNote: 'Double Math Error: This gets the 72-hour trap wrong (7w1 instead of 3w1) AND over-utilizes SN for month two. It also fails to taper PT during the final two weeks as the narrative requires.' },
    { id: '21-8', boxId: 'box-21', label: 'SN: 3w1, 2w3, 1w4 | PT: 2w5', trapNote: 'PT Taper Failure: The SN schedule is correct, but the PT schedule ignores the explicit taper. The narrative states twice-weekly for 3 weeks then once-weekly for 2 weeks — this option runs PT at a flat 2w5 with no step-down.' },
    { id: '21-9', boxId: 'box-21', label: 'SN: 2w4, 1w5 | PT: 2w4, 1w5', trapNote: 'Mirroring Red Flag: Giving SN and PT identical frequencies is a cookie-cutter care indicator. Each discipline must have a frequency justified by its specific goals. This also ignores the 72-hour stabilization requirement.' },
    { id: '21-10', boxId: 'box-21', label: 'SN: 4w1, 2w8 | PT: 2w8', trapNote: 'No Tapering, No Stabilization Logic: The 4w1 ignores the 72-hour (3w1) instruction, and neither discipline shows any step-down pattern — a clear sign this was guessed rather than parsed from the physician coordination notes.' },
    // Box 24
    { id: '24-1', boxId: 'box-24', label: 'Establish safety: secure firearm, initiate 911 for HR 48/Ashen presentation' },
    { id: '24-2', boxId: 'box-24', label: 'Perform wound care to right great toe to prevent further infection', trapNote: 'Clinical Negligence: Performing wound care while a patient is ashen and bradycardic (HR 48) is a failure to recognize a life-threatening cardiac event. Dressings can wait — a Silent MI cannot.' },
    { id: '24-3', boxId: 'box-24', label: 'Secure the firearm and then perform a 12-lead EKG at bedside', trapNote: 'Delay of Care: You are in a home, not an ER. Performing a 12-lead EKG yourself delays the definitive care provided by EMS. Secure the weapon, call 911, and let the paramedics handle cardiac diagnostics.' },
    { id: '24-4', boxId: 'box-24', label: 'Educate daughter on insulin storage temperatures (78°F)', trapNote: 'Priority Error: While insulin storage is important, you are currently facing an active life-safety crisis. Educating a caregiver who has already quit does not address the immediate emergency.' },
    { id: '24-5', boxId: 'box-24', label: 'Assess the L leg pulselessness and apply a warm compress', trapNote: 'Danger! Applying heat to an ischemic limb (no pulse) can cause catastrophic tissue damage. Blood flow cannot carry heat away from the tissue, leading to thermal burns on top of ischemia.' },
    { id: '24-6', boxId: 'box-24', label: "Locate 'Pickles' the cat to reduce patient anxiety/confusion", trapNote: 'Focus! The patient is in active cardiac distress. While the clinician may have empathy for the social situation, the Pickles distractor is designed to pull your attention away from a life-threatening arrhythmia.' },
    { id: '24-7', boxId: 'box-24', label: 'Contact the power company to restore electricity for the patient', trapNote: 'Priority Error: Restoring power is a logistical and social work task. It does not address the immediate life-safety issues of the unsecured firearm and the Silent MI currently in progress.' },
    { id: '24-8', boxId: 'box-24', label: 'Reconcile the Glyburide/Lisinopril medication discrepancy immediately', trapNote: 'Correct Priority, Wrong Timing: While medication reconciliation is critical, it does not fix an active myocardial infarction. Stabilize the cardiac event first; reconcile medications during the follow-up visit.' },
    { id: '24-9', boxId: 'box-24', label: 'Apply a pressure dressing to the right great toe ulcer', trapNote: 'Wrong Intervention: Pressure dressings are contraindicated for ischemic ulcers — they further restrict already compromised blood flow. This is also ignoring the active cardiac emergency entirely.' },
    { id: '24-10', boxId: 'box-24', label: 'Instruct Mrs. Gable to transport the patient to her house', trapNote: 'Abandonment Risk: Moving an unstable, bradycardic patient to a neighbor\'s house in a personal vehicle without medical transport is unsafe and legally indefensible. This is not an appropriate emergency response.' },
  ],
}

export const ALL_SCENARIOS = [EASY_SCENARIO, INTERMEDIATE_SCENARIO, MASTER_SCENARIO] as const
