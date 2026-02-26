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
    { id: '11-2', boxId: 'box-11', label: 'L97.511 (Non-pressure chronic ulcer of right foot, limited to skin)', trapNote: 'Ignores the diabetes.' },
    { id: '11-3', boxId: 'box-11', label: 'L03.115 (Cellulitis of right lower limb)', trapNote: 'Symptom, not primary cause.' },
    { id: '11-4', boxId: 'box-11', label: 'I70.202 (Atherosclerosis of native arteries of L leg w/ ulcer)', trapNote: 'Ischemia is a secondary dx here.' },
    { id: '11-5', boxId: 'box-11', label: 'E11.9 (Type 2 DM without complications)', trapNote: 'Incorrectly labels as uncomplicated.' },
    { id: '11-6', boxId: 'box-11', label: 'I73.9 (Peripheral vascular disease, unspecified)', trapNote: 'Too vague for high-acuity billing.' },
    { id: '11-7', boxId: 'box-11', label: 'R00.1 (Bradycardia, unspecified)', trapNote: 'Acute symptom, not home health primary.' },
    { id: '11-8', boxId: 'box-11', label: 'M86.171 (Other acute osteomyelitis, right ankle and foot)', trapNote: 'Requires clinical confirmation/X-ray first.' },
    { id: '11-9', boxId: 'box-11', label: 'Z47.89 (Other orthopaedic aftercare)', trapNote: 'Used for post-op, not chronic ulcers.' },
    { id: '11-10', boxId: 'box-11', label: 'L98.491 (Non-pressure chronic ulcer of skin, unspecified)', trapNote: '"Unspecified" is an audit red flag.' },
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
    { id: '21-2', boxId: 'box-21', label: 'SN: 7w1, 2w3, 1w4 | PT: 2w3, 1w2', trapNote: 'Interprets "daily oversight" as 7 days.' },
    { id: '21-3', boxId: 'box-21', label: 'SN: 3w1, 2w7 | PT: 1w5', trapNote: 'Miscalculates the tapering of care.' },
    { id: '21-4', boxId: 'box-21', label: 'SN: 1w9 | PT: 2w5', trapNote: 'Too low for acute Wagner Grade 3.' },
    { id: '21-5', boxId: 'box-21', label: 'SN: 5w1, 3w3, 2w5 | PT: 3w2, 1w3', trapNote: 'Over-utilization of resources.' },
    { id: '21-6', boxId: 'box-21', label: 'SN: 3w1, 2w3, 1w4 | PT: 1w1, 2w4', trapNote: 'Incorrectly adds a standalone Eval week for PT.' },
    { id: '21-7', boxId: 'box-21', label: 'SN: 7w1, 1w8 | PT: 2w5', trapNote: 'Misses the second-month taper.' },
    { id: '21-8', boxId: 'box-21', label: 'SN: 3w1, 1w8 | PT: 2w3, 1w2', trapNote: 'Drops to 1w too early in month one.' },
    { id: '21-9', boxId: 'box-21', label: 'SN: 2w4, 1w5 | PT: 2w4, 1w5', trapNote: 'Standard protocol that ignores the 72h stabilization.' },
    { id: '21-10', boxId: 'box-21', label: 'SN: 4w1, 2w8 | PT: 2w8', trapNote: "Random numbers that don't match the narrative." },
    // Box 24
    { id: '24-1', boxId: 'box-24', label: 'Establish safe environment: secure firearm, initiate 911 transfer for HR 48' },
    { id: '24-2', boxId: 'box-24', label: 'Instruct daughter on wound care techniques and dressing changes', trapNote: 'Ignores that the daughter has quit.' },
    { id: '24-3', boxId: 'box-24', label: 'Provide educational pamphlets on low-sodium diets and foot care', trapNote: '"Fluff" that ignores the cardiac crisis.' },
    { id: '24-4', boxId: 'box-24', label: 'Install grab bars and non-slip mats in the bathroom immediately', trapNote: 'Good, but not the priority over the heart rate.' },
    { id: '24-5', boxId: 'box-24', label: 'Arrange for Meals-on-Wheels to address the power outage/nutrition', trapNote: 'Social need, not an emergency action.' },
    { id: '24-6', boxId: 'box-24', label: "Coordinate with Mrs. Gable regarding 'Pickles' the cat and feline dietary needs", trapNote: 'Social determinant distractor \u2014 irrelevant to the emergency clinical priority or CMS-485 safety requirements.' },
    { id: '24-7', boxId: 'box-24', label: 'Obtain consent for diabetic foot care and daily weights', trapNote: 'Basic care, not emergency stabilization.' },
    { id: '24-8', boxId: 'box-24', label: 'Instruct patient to keep legs elevated at 45 degrees while sleeping', trapNote: 'Dangerous if ischemia is present (reduces flow).' },
    { id: '24-9', boxId: 'box-24', label: 'Perform medication reconciliation and remove expired pills', trapNote: 'Necessary, but secondary to the 911/Firearm risk.' },
    { id: '24-10', boxId: 'box-24', label: 'Mark the border of the erythema with a surgical pen and monitor', trapNote: 'Good nursing, but ignores the "Silent MI" risk.' },
  ],
}

export const ALL_SCENARIOS = [EASY_SCENARIO, INTERMEDIATE_SCENARIO, MASTER_SCENARIO] as const
