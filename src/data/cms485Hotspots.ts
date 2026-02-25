/* ══════════════════════════════════════════════════════════
   CMS-485 Individual Box Hotspots
   Each CMS-485 box is its own discrete hotspot with
   independent positioning, tooltip, guided quiz, and
   Try-It input.
   ══════════════════════════════════════════════════════════ */

export type Cms485Hotspot = {
  id: string
  label: string
  bbox: {
    x: number
    y: number
    width: number
    height: number
  }
  shortTooltip: string
  detail: {
    whyItMatters: string
    howToFill: string
    commonMistakes: string[]
    example: string
  }
  guidedStep: {
    stepOrder: number
    stepTitle: string
    stepInstruction: string
    source: string
    defensibleForAudit: string
    checkQuestion: string
    choices: string[]
    correctIndex: number
    rationale: string
  }
  tryInput: {
    type: 'text' | 'date' | 'select'
    label: string
    placeholder?: string
    options?: string[]
    coachingMessage: string
    highRisk?: boolean
  }
}

export const CMS485_PAGE_LABEL = 'Page 1 -- Individual Box View'

/* ── Form layout reference ──────────────────────────────────
   Row 1  Header               h: 5.5%   y: 0
   Row 2  Boxes 1-5 (cols-5)   h: 10.5%  y: 5.5
   Row 3  Box 6                h: 5%     y: 16
   Row 4  Boxes 7/8 + 9 (2)   h: 12%    y: 21
   Row 5  Box 18a              h: 10%    y: 33
   Row 6  Freq + 12/13 (3)    h: 8%     y: 43
   Row 7  Box 18b              h: 9%     y: 51
   Row 8  Boxes 10 + 11 (3)   h: 7%     y: 60
   Row 9  Boxes 14-17 (4)     h: 10%    y: 67
   Row 10 Boxes 21-23 (2)     h: 11.5%  y: 77
   Row 11 Footer               h: 1.5%   y: 88.5
   ── Calibrated y values from production ──────────────────
   Boxes 1-5:  y≈6   h≈10
   Box 6:      y≈16  h≈2.5
   Boxes 7-9:  y≈18.5 h≈12
   Box 18a:    y≈31  h≈10
   Freq/12/13: y≈42  h≈8
   Box 18b:    y≈51  h≈9
   DME/11:     y≈61  h≈7
   14-17:      y≈69  h≈9.5
   21-23:      y≈79  h≈11
   ──────────────────────────────────────────────────────── */

export const CMS485_HOTSPOTS: Cms485Hotspot[] = [
  /* ═══════════════════════════════════════════════════════
     ROW 2 -- Patient Identifiers (grid-cols-5)
     y: 6, h: 10.  Each column ≈ 20% wide
     ═══════════════════════════════════════════════════════ */
  {
    id: 'box-1',
    label: 'Box 1 · Patient HIC Number',
    bbox: { x: 0, y: 6, width: 20, height: 10 },
    shortTooltip: 'Health Insurance Claim (HIC) number must match Medicare card exactly.',
    detail: {
      whyItMatters:
        'An incorrect HIC number causes claim rejections at the clearinghouse level before clinical review even begins.',
      howToFill:
        'Copy the HIC number directly from the patient\'s Medicare card or verified intake record. Double-check every character.',
      commonMistakes: [
        'Transposing digits from the Medicare card',
        'Using a Medicaid or commercial ID instead of the HIC',
        'Omitting the suffix letter (e.g., the "A" in XXX-XX-XXXX-A)',
      ],
      example: '123-45-6789-A -- verified against Medicare card at intake.',
    },
    guidedStep: {
      stepOrder: 1,
      stepTitle: 'Enter Patient HIC Number',
      stepInstruction: 'Locate the Health Insurance Claim number from the referral packet or Medicare card.',
      source: 'Medicare card, referral demographics',
      defensibleForAudit: 'Exact HIC match is a hard-stop claim requirement.',
      checkQuestion: 'Where should the HIC number be sourced from?',
      choices: [
        'The patient\'s verbal confirmation only',
        'The Medicare card or verified intake record',
        'A previous episode record without re-verification',
      ],
      correctIndex: 1,
      rationale: 'HIC must be sourced from an authoritative document, not verbal recall.',
    },
    tryInput: {
      type: 'text',
      label: 'HIC Number',
      placeholder: 'XXX-XX-XXXX-A',
      coachingMessage: 'Include the suffix letter. Match the Medicare card exactly.',
      highRisk: true,
    },
  },
  {
    id: 'box-2',
    label: 'Box 2 · Start of Care Date',
    bbox: { x: 20, y: 6, width: 20, height: 10 },
    shortTooltip: 'SOC date anchors the entire episode timeline and billing window.',
    detail: {
      whyItMatters:
        'The SOC date determines episode start, OASIS lock date, and timeliness of all subsequent submissions.',
      howToFill:
        'Enter the date of the first billable visit. This must match the OASIS and referral authorization.',
      commonMistakes: [
        'Using the referral date instead of the first visit date',
        'Date format inconsistency across documents',
        'SOC date falling outside the authorization window',
      ],
      example: '02/24/2026 -- matches first SN visit and OASIS SOC.',
    },
    guidedStep: {
      stepOrder: 2,
      stepTitle: 'Set Start of Care Date',
      stepInstruction: 'Document the date of the first billable visit as the SOC date.',
      source: 'OASIS record, first visit documentation',
      defensibleForAudit: 'SOC date alignment across forms prevents timeline defects.',
      checkQuestion: 'The SOC date should match:',
      choices: [
        'The date the referral was received',
        'The date of the first billable visit',
        'The physician signature date',
      ],
      correctIndex: 1,
      rationale: 'SOC is defined as the first billable visit, not the referral or order date.',
    },
    tryInput: {
      type: 'date',
      label: 'Start of Care Date',
      coachingMessage: 'Must match the OASIS SOC date precisely.',
      highRisk: true,
    },
  },
  {
    id: 'box-3',
    label: 'Box 3 · Certification Period',
    bbox: { x: 40, y: 6, width: 20, height: 10 },
    shortTooltip: 'Cert period defines the 60-day episode window for billing and care delivery.',
    detail: {
      whyItMatters:
        'The certification period frames the entire billing episode. Mismatched dates break continuity and can trigger denials.',
      howToFill:
        'Enter the From and To dates matching the physician-approved 60-day episode window.',
      commonMistakes: [
        'Cert period not aligned with SOC date',
        'Using a 30-day window instead of 60-day',
        'Dates not matching the signed physician order',
      ],
      example: '02/24/2026 - 04/23/2026 (60-day episode aligned to SOC).',
    },
    guidedStep: {
      stepOrder: 3,
      stepTitle: 'Confirm Certification Period',
      stepInstruction: 'Verify the From/To dates define a proper 60-day episode aligned with SOC.',
      source: 'Physician certification order, intake documentation',
      defensibleForAudit: 'Cert period consistency is a core audit checkpoint.',
      checkQuestion: 'True/False: A one-day cert period mismatch is low risk if the diagnosis is correct.',
      choices: ['True', 'False'],
      correctIndex: 1,
      rationale: 'Date conflicts are objective findings and can invalidate episode consistency.',
    },
    tryInput: {
      type: 'date',
      label: 'Certification Start Date',
      coachingMessage: 'Use the exact physician-approved certification period start date.',
      highRisk: true,
    },
  },
  {
    id: 'box-4',
    label: 'Box 4 · Medical Record Number',
    bbox: { x: 60, y: 6, width: 20, height: 10 },
    shortTooltip: 'Internal MRN for cross-referencing the patient across systems.',
    detail: {
      whyItMatters:
        'MRN ties the CMS-485 to the agency\'s EHR record. Mismatches create audit traceability gaps.',
      howToFill:
        'Enter the medical record number assigned by the home health agency at intake.',
      commonMistakes: [
        'Confusing MRN with HIC or provider number',
        'Leaving blank when auto-population fails',
        'Using a hospital MRN instead of agency MRN',
      ],
      example: 'MR-2026-0485 -- matches agency EHR assignment.',
    },
    guidedStep: {
      stepOrder: 4,
      stepTitle: 'Verify Medical Record Number',
      stepInstruction: 'Confirm the MRN matches the agency-assigned record in the EHR.',
      source: 'Agency EHR intake record',
      defensibleForAudit: 'MRN traceability links the plan to the complete clinical chart.',
      checkQuestion: 'The MRN should come from:',
      choices: [
        'The referring hospital\'s system',
        'The home health agency\'s EHR',
        'Either system is acceptable',
      ],
      correctIndex: 1,
      rationale: 'The agency MRN ensures internal traceability for audit and QA.',
    },
    tryInput: {
      type: 'text',
      label: 'Medical Record Number',
      placeholder: 'MR-2026-XXXX',
      coachingMessage: 'Use the home health agency-assigned MRN.',
    },
  },
  {
    id: 'box-5',
    label: 'Box 5 · Provider Number',
    bbox: { x: 80, y: 6, width: 20, height: 10 },
    shortTooltip: 'CMS-assigned provider number for the home health agency.',
    detail: {
      whyItMatters:
        'The provider number identifies the agency to CMS. An incorrect number routes the claim to the wrong entity.',
      howToFill:
        'Use the CMS-assigned provider number for your home health agency exactly as issued.',
      commonMistakes: [
        'Using a physician NPI instead of the agency provider number',
        'Transposing digits',
        'Using a branch number instead of the main provider ID',
      ],
      example: '10-7654 -- CMS-assigned agency provider number.',
    },
    guidedStep: {
      stepOrder: 5,
      stepTitle: 'Enter Provider Number',
      stepInstruction: 'Enter the CMS-assigned home health agency provider number.',
      source: 'Agency CMS certification records',
      defensibleForAudit: 'Provider number mismatch causes claim routing failures.',
      checkQuestion: 'The provider number identifies:',
      choices: [
        'The attending physician',
        'The home health agency',
        'The insurance carrier',
      ],
      correctIndex: 1,
      rationale: 'Box 5 is the agency-level CMS provider identification.',
    },
    tryInput: {
      type: 'text',
      label: 'Provider Number',
      placeholder: '10-XXXX',
      coachingMessage: 'Use the CMS-assigned number, not a physician NPI.',
    },
  },

  /* ═══════════════════════════════════════════════════════
     ROW 3 -- Patient Demographics (full width)
     y: 16.5, h: 2.5
     ═══════════════════════════════════════════════════════ */
  {
    id: 'box-6',
    label: 'Box 6 · Patient Name / Address / DOB',
    bbox: { x: 0, y: 16.5, width: 100, height: 2.5 },
    shortTooltip: 'Demographic data must match intake exactly -- name, address, date of birth.',
    detail: {
      whyItMatters:
        'Demographic mismatches are objective defects that can invalidate the entire plan regardless of clinical quality.',
      howToFill:
        'Use the patient\'s legal name (not nickname), current address, and verified DOB from intake documentation.',
      commonMistakes: [
        'Nickname used instead of legal name',
        'Address not updated after relocation',
        'DOB transposition errors',
      ],
      example: 'Jane A. Sample · 1234 Elm St, Sacramento, CA 95811 · DOB 03/15/1942',
    },
    guidedStep: {
      stepOrder: 6,
      stepTitle: 'Verify Patient Demographics',
      stepInstruction: 'Confirm name, address, and DOB exactly match the intake face sheet.',
      source: 'Intake demographics, referral packet, insurance card',
      defensibleForAudit: 'Demographic accuracy is a hard-stop compliance control.',
      checkQuestion: 'Which name should appear in Box 6?',
      choices: [
        'Whatever name the patient prefers',
        'The legal name matching intake documentation',
        'The name on the most recent visit note',
      ],
      correctIndex: 1,
      rationale: 'Legal name ensures cross-system traceability and claim validity.',
    },
    tryInput: {
      type: 'text',
      label: 'Patient Full Name',
      placeholder: 'Last, First M.',
      coachingMessage: 'Use legal name -- not nicknames or abbreviations.',
      highRisk: true,
    },
  },

  /* ═══════════════════════════════════════════════════════
     ROW 4 -- Diagnoses (grid-cols-2)
     y: 19, h: 12.  Left col = 0-50%, Right col = 50-100%
     Box 7 occupies top ~8% of left cell,
     Box 8 occupies bottom ~4% of left cell
     ═══════════════════════════════════════════════════════ */
  {
    id: 'box-7',
    label: 'Box 7 · Principal Diagnosis / ICD / Date',
    bbox: { x: 0, y: 19.5, width: 50, height: 8 },
    shortTooltip: 'Principal diagnosis must support the primary skilled service driver.',
    detail: {
      whyItMatters:
        'Diagnosis quality impacts PDGM grouping, necessity framing, and payer confidence. The principal Dx must justify skilled care.',
      howToFill:
        'Assign the principal diagnosis to the dominant skilled need with the correct ICD-10 code, and include the onset/exacerbation date.',
      commonMistakes: [
        'Using nonspecific diagnosis language',
        'Principal diagnosis not tied to visit-level skilled interventions',
        'Copy-forward diagnosis not updated for current condition',
        'Missing the ICD-10 code or onset date',
      ],
      example: 'I50.9 Heart failure, unspecified -- 02/24/2026',
    },
    guidedStep: {
      stepOrder: 7,
      stepTitle: 'Document Principal Diagnosis',
      stepInstruction: 'Code the principal diagnosis to match the dominant skilled service need with ICD-10 specificity.',
      source: 'Physician documentation, assessment findings, coding review',
      defensibleForAudit: 'Diagnosis-to-care alignment is a core medical necessity control.',
      checkQuestion: 'Which principal diagnosis approach is strongest?',
      choices: [
        'General symptom only with no clinical driver',
        'Principal diagnosis tied to skilled intervention and current risk',
        'Copy prior episode diagnosis without reassessment',
      ],
      correctIndex: 1,
      rationale: 'Reviewers expect diagnosis language to match active skilled treatment logic.',
    },
    tryInput: {
      type: 'text',
      label: 'Principal Diagnosis (ICD-10)',
      placeholder: 'e.g., I50.9 Heart failure, unspecified',
      coachingMessage: 'Must be specific enough to support the skilled need for this episode.',
      highRisk: true,
    },
  },
  {
    id: 'box-8',
    label: 'Box 8 · Surgical Procedures',
    bbox: { x: 0, y: 27.5, width: 50, height: 4 },
    shortTooltip: 'Document any surgical procedures relevant to the current episode.',
    detail: {
      whyItMatters:
        'Surgical history contextualizes the current care needs and supports medical necessity for post-surgical services.',
      howToFill:
        'List any relevant surgical procedures with ICD-10 procedure codes and dates. Enter N/A if none.',
      commonMistakes: [
        'Leaving blank instead of documenting N/A',
        'Listing unrelated historical surgeries',
        'Missing the procedure date',
      ],
      example: 'N/A (no surgical procedures in current episode)',
    },
    guidedStep: {
      stepOrder: 8,
      stepTitle: 'Document Surgical History',
      stepInstruction: 'Record any surgical procedures relevant to the current care episode, or document N/A.',
      source: 'Hospital discharge, physician records, surgical reports',
      defensibleForAudit: 'Surgical context supports or rules out post-operative care justification.',
      checkQuestion: 'If no surgical procedure applies, Box 8 should contain:',
      choices: [
        'Leave it blank',
        'N/A',
        'Repeat the principal diagnosis',
      ],
      correctIndex: 1,
      rationale: 'Blank fields create ambiguity; N/A confirms the clinician reviewed the field.',
    },
    tryInput: {
      type: 'text',
      label: 'Surgical Procedures',
      placeholder: 'Procedure code and date, or N/A',
      coachingMessage: 'Always document N/A rather than leaving blank.',
    },
  },
  {
    id: 'box-9',
    label: 'Box 9 · Other Pertinent Diagnoses / ICD',
    bbox: { x: 50, y: 19.5, width: 50, height: 12 },
    shortTooltip: 'Secondary diagnoses add clinical context and support complexity justification.',
    detail: {
      whyItMatters:
        'Secondary diagnoses demonstrate the full clinical picture, support higher PDGM groupings, and justify the intensity of services.',
      howToFill:
        'List all clinically relevant secondary diagnoses with ICD-10 codes, prioritized by relevance to the current skilled care need.',
      commonMistakes: [
        'Listing only one secondary diagnosis when multiple apply',
        'Including resolved conditions not relevant to this episode',
        'Non-specific codes that weaken complexity documentation',
      ],
      example: 'N18.3 CKD Stage 3 · I10 Essential HTN · E11.65 T2DM w/ hyperglycemia',
    },
    guidedStep: {
      stepOrder: 9,
      stepTitle: 'Populate Secondary Diagnoses',
      stepInstruction: 'Document all pertinent secondary diagnoses that impact care complexity or treatment planning.',
      source: 'Clinical assessment, medication list, comorbidity review',
      defensibleForAudit: 'Complete comorbidity documentation strengthens necessity and grouping.',
      checkQuestion: 'Secondary diagnoses should be:',
      choices: [
        'Only the most serious single condition',
        'All conditions clinically relevant to this episode',
        'Copied from the last episode without review',
      ],
      correctIndex: 1,
      rationale: 'Complete comorbidity capture supports PDGM and demonstrates clinical complexity.',
    },
    tryInput: {
      type: 'text',
      label: 'Other Pertinent Diagnoses',
      placeholder: 'e.g., N18.3 CKD Stage 3, I10 Essential HTN',
      coachingMessage: 'Include all diagnoses that affect the current plan of care.',
      highRisk: true,
    },
  },

  /* ═══════════════════════════════════════════════════════
     ROW 5 -- Orders (full width)
     y: 32, h: 10
     ═══════════════════════════════════════════════════════ */
  {
    id: 'box-18a',
    label: 'Box 18a · Orders for Discipline and Treatments',
    bbox: { x: 0, y: 32, width: 100, height: 10 },
    shortTooltip: 'Orders should clearly define skilled interventions, discipline, and clinical intent.',
    detail: {
      whyItMatters:
        'Vague order language creates execution drift and weakens plan defensibility during review.',
      howToFill:
        'Document discipline, intervention, purpose, and expected clinical response in actionable language for every ordered service.',
      commonMistakes: [
        '"Evaluate and treat" without specifics',
        'No intervention purpose tied to patient condition',
        'Orders missing discipline ownership',
        'Frequency not included with the order',
      ],
      example: 'SN for CHF monitoring, med titration reinforcement, edema trend escalation per protocol -- 2x/wk x 3wk then 1x/wk x 3wk.',
    },
    guidedStep: {
      stepOrder: 10,
      stepTitle: 'Define Skilled Order Specificity',
      stepInstruction: 'Translate physician intent into clear skilled services that staff can execute consistently.',
      source: 'Physician order set and clinical assessment',
      defensibleForAudit: 'Specific service language reduces interpretation risk and claim challenge risk.',
      checkQuestion: 'Best order wording includes:',
      choices: [
        'Only discipline name',
        'Discipline + intervention + purpose',
        'Generic statement with PRN only',
      ],
      correctIndex: 1,
      rationale: 'Defensible orders contain who/what/why in one statement.',
    },
    tryInput: {
      type: 'text',
      label: 'Skilled Service Order',
      placeholder: 'e.g., SN for CHF monitoring, med titration...',
      coachingMessage: 'Include discipline, intervention, and clinical intent.',
    },
  },

  /* ═══════════════════════════════════════════════════════
     ROW 6 -- Frequency & Nutritional (grid-cols-3)
     y: 42.5, h: 8.  Left 2/3 = freq, Right 1/3 = 12/13
     ═══════════════════════════════════════════════════════ */
  {
    id: 'box-freq',
    label: 'Frequency Summary',
    bbox: { x: 0, y: 42.5, width: 66, height: 8 },
    shortTooltip: 'Frequency and duration must match acuity, progression expectations, and the orders above.',
    detail: {
      whyItMatters: 'Generic frequency is a top utilization-review risk and common denial trigger.',
      howToFill: 'Summarize all discipline frequencies with shorthand (e.g., SN 2W3 1W3) and total visit count.',
      commonMistakes: [
        'Frequency summary doesn\'t match Box 18a orders',
        'Defaulting to generic 2w4 without rationale',
        'Missing total visit count',
        'No taper plan despite expected improvement',
      ],
      example: 'SN 2W3 1W3 · PT 2W4 · MSW 1M2 | Total: 19 visits',
    },
    guidedStep: {
      stepOrder: 11,
      stepTitle: 'Calibrate Frequency and Duration',
      stepInstruction: 'Set practical cadence that reflects patient risk and expected response timeline.',
      source: 'OASIS findings, current status assessment, physician plan',
      defensibleForAudit: 'Frequency rationale should be clinically proportional and traceable.',
      checkQuestion: 'True/False: Frequency can remain generic if goals are measurable.',
      choices: ['True', 'False'],
      correctIndex: 1,
      rationale: 'Both goals and frequency rationale must be specific and defensible.',
    },
    tryInput: {
      type: 'text',
      label: 'Frequency/Duration Summary',
      placeholder: 'e.g., SN 2W3 1W3 PT 2W4 Total: 19',
      coachingMessage: 'Avoid vague cadence; tie plan to condition acuity.',
      highRisk: true,
    },
  },
  {
    id: 'box-12-13',
    label: 'Box 12 · Nutritional / Box 13 · Allergies',
    bbox: { x: 66.5, y: 42.5, width: 33.5, height: 8 },
    shortTooltip: 'Nutritional restrictions and allergies are safety-critical documentation.',
    detail: {
      whyItMatters:
        'Dietary restrictions and allergies directly impact medication safety, wound healing, and care planning.',
      howToFill:
        'Document specific diet orders (e.g., ADA, low sodium) and list ALL known allergies with reaction types.',
      commonMistakes: [
        '"No known allergies" without verifying with patient',
        'Generic "regular diet" when restrictions exist',
        'Missing drug allergies that affect prescribing',
      ],
      example: 'Diet: Low Na <2g, fluid 1.5L | Allergies: Sulfa (rash), Codeine (nausea)',
    },
    guidedStep: {
      stepOrder: 12,
      stepTitle: 'Document Nutrition and Allergies',
      stepInstruction: 'Record specific dietary restrictions and all known allergies with reaction types.',
      source: 'Physician diet order, medication reconciliation, patient interview',
      defensibleForAudit: 'Allergy omissions create liability and medication safety risk.',
      checkQuestion: 'Allergy documentation should include:',
      choices: [
        'Drug names only',
        'Drug names and reaction types',
        'Only severe allergies',
      ],
      correctIndex: 1,
      rationale: 'Reaction type guides clinical decision-making and prevents adverse events.',
    },
    tryInput: {
      type: 'text',
      label: 'Nutritional / Allergies',
      placeholder: 'e.g., Low Na <2g | Sulfa (rash), Codeine',
      coachingMessage: 'Include specific restrictions and all allergy reaction types.',
    },
  },

  /* ═══════════════════════════════════════════════════════
     ROW 7 -- Goals (full width)
     y: 51, h: 9
     ═══════════════════════════════════════════════════════ */
  {
    id: 'box-18b',
    label: 'Box 18b · Goals / Rehab Potential / Discharge',
    bbox: { x: 0, y: 51, width: 100, height: 9 },
    shortTooltip: 'Goals must be measurable, time-bound, and linked to the interventions ordered.',
    detail: {
      whyItMatters: 'Goal quality determines if progress can be objectively validated across visits.',
      howToFill: 'Write measurable targets with timeframe and intervention linkage. Include rehab potential and discharge criteria.',
      commonMistakes: [
        'Broad goals without a metric',
        'No timeline attached to the goal',
        'Goal not linked to the interventions ordered',
        'Missing rehab potential assessment',
      ],
      example: 'G1: Pt verbalizes 3 CHF red flags by visit 4 · G2: Daily wt/BP log 2lb variance x 2wk · Rehab: Good. D/C when goals met.',
    },
    guidedStep: {
      stepOrder: 13,
      stepTitle: 'Set Measurable Goals',
      stepInstruction: 'Write outcomes reviewers can verify objectively, not intent statements.',
      source: 'Assessment baseline, care priorities, discipline interventions',
      defensibleForAudit: 'Objective goals strengthen clinical story continuity across the episode.',
      checkQuestion: 'Which goal is strongest?',
      choices: [
        'Patient will do better soon',
        'Improve safety',
        'Patient will verbalize 3 CHF red flags by visit 4',
      ],
      correctIndex: 2,
      rationale: 'Strong goals include observable metric + timeframe.',
    },
    tryInput: {
      type: 'text',
      label: 'Goal Statement (mock)',
      placeholder: 'Write a measurable goal...',
      coachingMessage: 'Include metric + timeframe + intervention connection.',
      highRisk: true,
    },
  },

  /* ═══════════════════════════════════════════════════════
     ROW 8 -- DME & Safety (grid-cols-3)
     y: 61, h: 7.  Left 2/3 = Box 10, Right 1/3 = Box 11
     ═══════════════════════════════════════════════════════ */
  {
    id: 'box-10',
    label: 'Box 10 · DME and Supplies',
    bbox: { x: 0, y: 61, width: 66, height: 6.5 },
    shortTooltip: 'Document equipment and supplies only when clinically justified and traceable.',
    detail: {
      whyItMatters: 'Unsupported DME/supply lines can produce compliance questions and billing friction.',
      howToFill: 'List only medically necessary equipment/supplies tied to plan interventions and safety.',
      commonMistakes: [
        'Adding supplies without intervention linkage',
        'No patient-specific need stated',
        'Outdated items carried forward from prior episode',
      ],
      example: 'Rolling walker · BP cuff · Scale · Compression stockings 20-30mmHg',
    },
    guidedStep: {
      stepOrder: 14,
      stepTitle: 'Validate DME and Supply Need',
      stepInstruction: 'Include DME/supplies only when they directly support active interventions and safety.',
      source: 'Care plan interventions, physician orders, safety assessment',
      defensibleForAudit: 'Supports necessity and avoids unsupported line-item risk.',
      checkQuestion: 'DME/supply entries should be:',
      choices: ['Template defaults', 'Linked to active care interventions', 'Copied from previous episode'],
      correctIndex: 1,
      rationale: 'DME/supplies must connect to the current plan and condition.',
    },
    tryInput: {
      type: 'select',
      label: 'DME Linkage Check',
      options: ['No DME needed', 'Linked to active intervention', 'Unclear/Template only'],
      coachingMessage: 'Tie DME/supplies directly to intervention and safety rationale.',
    },
  },
  {
    id: 'box-11',
    label: 'Box 11 · Safety Measures',
    bbox: { x: 66.5, y: 61, width: 33.5, height: 6.5 },
    shortTooltip: 'Safety measures should be specific, actionable, and condition-based.',
    detail: {
      whyItMatters:
        'Generic safety statements weaken the plan\'s defensibility and may miss real hazards.',
      howToFill:
        'Document specific safety interventions tied to the patient\'s actual risk profile (fall risk, medication, environment).',
      commonMistakes: [
        '"General safety precautions" with no specifics',
        'Not addressing identified home hazards',
        'Missing emergency contact information',
      ],
      example: 'Fall precautions · trip hazard removal · night lighting · emergency contacts posted',
    },
    guidedStep: {
      stepOrder: 15,
      stepTitle: 'Document Safety Measures',
      stepInstruction: 'List concrete safety interventions matched to the patient\'s identified risks.',
      source: 'Safety assessment, home visit observations, fall risk screen',
      defensibleForAudit: 'Specific safety measures demonstrate proactive risk management.',
      checkQuestion: 'Best safety documentation includes:',
      choices: [
        '"Safety precautions in place"',
        'Specific interventions tied to identified risks',
        'Reference to agency policy only',
      ],
      correctIndex: 1,
      rationale: 'Actionable, patient-specific safety measures are defensible.',
    },
    tryInput: {
      type: 'text',
      label: 'Safety Measures',
      placeholder: 'e.g., Fall precautions, trip hazards...',
      coachingMessage: 'Be specific -- tie each measure to an identified risk.',
    },
  },

  /* ═══════════════════════════════════════════════════════
     ROW 9 -- Functional / Activities / Mental / Prognosis
     (grid-cols-4)   y: 68, h: 9.5.  Each col ≈ 25%
     ═══════════════════════════════════════════════════════ */
  {
    id: 'box-14',
    label: 'Box 14 · Functional Limitations',
    bbox: { x: 0, y: 68, width: 25, height: 9.5 },
    shortTooltip: 'Functional limitations justify the need for skilled intervention.',
    detail: {
      whyItMatters:
        'Functional limitation documentation directly supports the case for skilled service necessity.',
      howToFill:
        'Check all limitations that apply: ambulation, endurance, dyspnea, paralysis, etc.',
      commonMistakes: [
        'Checking only one limitation when multiple apply',
        'Not linking limitations to the skilled service ordered',
        'Missing sensory deficits (e.g., neuropathy)',
      ],
      example: '☑ Ambulation ☑ Endurance ☑ Dyspnea ☐ Paralysis',
    },
    guidedStep: {
      stepOrder: 16,
      stepTitle: 'Document Functional Limitations',
      stepInstruction: 'Identify all functional limitations that support the need for skilled services.',
      source: 'OASIS mobility, functional assessment, therapy evaluation',
      defensibleForAudit: 'Documented limitations justify skilled interventions and episode intensity.',
      checkQuestion: 'Functional limits should reflect:',
      choices: [
        'Only the most severe limitation',
        'All limitations affecting care delivery',
        'Whatever was documented last episode',
      ],
      correctIndex: 1,
      rationale: 'Complete functional assessment captures the full scope of skilled care needs.',
    },
    tryInput: {
      type: 'text',
      label: 'Functional Limitations',
      placeholder: 'e.g., Ambulation, Endurance, Dyspnea',
      coachingMessage: 'List all that apply -- don\'t limit to just one.',
    },
  },
  {
    id: 'box-15',
    label: 'Box 15 · Activities Permitted',
    bbox: { x: 25, y: 68, width: 25, height: 9.5 },
    shortTooltip: 'Activities permitted define the patient\'s safe functional boundaries.',
    detail: {
      whyItMatters:
        'Activity restrictions guide safe care delivery and liability boundaries for staff.',
      howToFill:
        'Document physician-ordered activity level: weight bearing status, assistive device use, and mobility limits.',
      commonMistakes: [
        'Not updating activity level after condition change',
        '"As tolerated" without specifics',
        'Conflicting with PT recommendations',
      ],
      example: '☑ Partial WB ☑ Walker ☑ WC ☑ Up as tolerated',
    },
    guidedStep: {
      stepOrder: 17,
      stepTitle: 'Set Activity Permissions',
      stepInstruction: 'Document the physician-ordered activity boundaries for safe care.',
      source: 'Physician orders, PT evaluation, functional assessment',
      defensibleForAudit: 'Clear activity limits protect staff and patient from unsafe mobility.',
      checkQuestion: '"Up as tolerated" alone is sufficient for Box 15:',
      choices: ['True', 'False'],
      correctIndex: 1,
      rationale: 'Activity permissions need specific boundaries, not just open-ended tolerance.',
    },
    tryInput: {
      type: 'text',
      label: 'Activities Permitted',
      placeholder: 'e.g., Partial WB, Walker, Up as tolerated',
      coachingMessage: 'Include weight bearing status and assistive devices.',
    },
  },
  {
    id: 'box-16',
    label: 'Box 16 · Mental Status',
    bbox: { x: 50, y: 68, width: 25, height: 9.5 },
    shortTooltip: 'Mental status assessment affects safety planning and teaching approach.',
    detail: {
      whyItMatters:
        'Mental status directly impacts medication management, safety initiatives, and teaching strategies.',
      howToFill:
        'Document the current mental status findings: orientation, cognition, mood, and behavioral observations.',
      commonMistakes: [
        '"Alert and oriented" without specifying x3 or x4',
        'Not documenting depression or agitation',
        'Inconsistency between mental status and safety plan',
      ],
      example: '☑ Oriented ☐ Confused ☑ Depressed ☐ Agitated',
    },
    guidedStep: {
      stepOrder: 18,
      stepTitle: 'Assess Mental Status',
      stepInstruction: 'Document the patient\'s current cognitive and emotional status.',
      source: 'Nursing assessment, OASIS cognitive section, behavioral observations',
      defensibleForAudit: 'Mental status drives safety planning, medication management approach, and teaching methods.',
      checkQuestion: 'A confused patient impacts which other box?',
      choices: [
        'Box 5 (Provider Number)',
        'Box 11 (Safety Measures)',
        'Box 4 (Medical Record)',
      ],
      correctIndex: 1,
      rationale: 'Confusion increases safety risk and must be reflected in the safety plan.',
    },
    tryInput: {
      type: 'select',
      label: 'Mental Status',
      options: ['Oriented x3', 'Confused intermittently', 'Agitated', 'Depressed', 'Forgetful'],
      coachingMessage: 'Select the primary finding. Multiple may apply in clinical practice.',
    },
  },
  {
    id: 'box-17',
    label: 'Box 17 · Prognosis / Homebound',
    bbox: { x: 75, y: 68, width: 25, height: 9.5 },
    shortTooltip: 'Prognosis and homebound status are critical eligibility qualifiers.',
    detail: {
      whyItMatters:
        'Generic homebound statements are high-risk in eligibility and survey review. Prognosis frames expected outcomes.',
      howToFill:
        'Describe taxing effort, functional limits, and concrete reasons the patient qualifies as homebound. State prognosis.',
      commonMistakes: [
        '"Patient is homebound" with no support details',
        'Prognosis not aligned with goals and frequency',
        'Homebound language copied from prior episode',
      ],
      example: 'Fair prognosis · CHF mgmt, mod readmission risk · HB: severe dyspnea >25ft, taxing, requires assist.',
    },
    guidedStep: {
      stepOrder: 19,
      stepTitle: 'Document Prognosis and Homebound',
      stepInstruction: 'Capture specific taxing-effort language and functional evidence for homebound qualification.',
      source: 'Functional assessment, fall/safety screen, visit observations',
      defensibleForAudit: 'Objective homebound/safety evidence is central to eligibility and quality review.',
      checkQuestion: 'Best homebound wording includes:',
      choices: [
        'Patient homebound, no detail',
        'Taxing effort + functional limitation + condition context',
        'Copy from prior episode statement',
      ],
      correctIndex: 1,
      rationale: 'Defensible language links condition to specific mobility/safety constraints.',
    },
    tryInput: {
      type: 'text',
      label: 'Homebound Rationale',
      placeholder: 'Describe taxing effort and limitation...',
      coachingMessage: 'Use objective limitations and safety context, not generic phrases.',
      highRisk: true,
    },
  },

  /* ═══════════════════════════════════════════════════════
     ROW 10 -- Physician / Signature (grid-cols-2)
     y: 79, h: 10.5.  Left col 0-50%, Right col 50-100%
     ═══════════════════════════════════════════════════════ */
  {
    id: 'box-21',
    label: 'Box 21 · Physician Name',
    bbox: { x: 0, y: 79, width: 50, height: 5.5 },
    shortTooltip: 'Physician name must match the ordering/certifying provider.',
    detail: {
      whyItMatters:
        'The physician named must be the one who ordered or certified the plan. Misattribution invalidates the certification.',
      howToFill:
        'Enter the full name and credentials of the certifying physician.',
      commonMistakes: [
        'Using an associate physician who didn\'t sign the order',
        'Abbreviated name without credentials',
        'Different physician than the one who reviewed the plan',
      ],
      example: 'Dr. Robert Chen, MD · CI Medical · Sacramento, CA',
    },
    guidedStep: {
      stepOrder: 20,
      stepTitle: 'Enter Physician Name',
      stepInstruction: 'Document the full name and credentials of the ordering/certifying physician.',
      source: 'Signed orders, certification workflow',
      defensibleForAudit: 'Physician identity must match the signature on the plan.',
      checkQuestion: 'The physician in Box 21 must be:',
      choices: [
        'Any physician at the practice',
        'The physician who certified or ordered the plan',
        'The patient\'s primary care physician regardless of orders',
      ],
      correctIndex: 1,
      rationale: 'Certification validity requires the certifying physician\'s identity.',
    },
    tryInput: {
      type: 'text',
      label: 'Physician Name',
      placeholder: 'Dr. Full Name, MD',
      coachingMessage: 'Include full credentials and practice name.',
    },
  },
  {
    id: 'box-22',
    label: 'Box 22 · Date HHA Received Signed POT',
    bbox: { x: 0, y: 84.5, width: 50, height: 5 },
    shortTooltip: 'The date the HHA received the signed plan -- impacts timely filing.',
    detail: {
      whyItMatters:
        'This date starts the timely-filing clock and must be within required windows for compliance.',
      howToFill:
        'Enter the actual date the agency received the signed Plan of Treatment back from the physician.',
      commonMistakes: [
        'Using the date sent instead of the date received',
        'Backdating to meet compliance windows',
        'Leaving blank when signature was received electronically',
      ],
      example: '02/26/2026 -- signed POT received via e-signature portal.',
    },
    guidedStep: {
      stepOrder: 21,
      stepTitle: 'Record POT Receipt Date',
      stepInstruction: 'Document when the signed Plan of Treatment was received by the agency.',
      source: 'E-signature logs, fax receipt, mail log',
      defensibleForAudit: 'Receipt date compliance prevents timely-filing denials.',
      checkQuestion: 'Box 22 should reflect:',
      choices: [
        'The date the plan was sent for signature',
        'The date the signed plan was received back',
        'The physician signature date',
      ],
      correctIndex: 1,
      rationale: 'The receipt date triggers compliance timelines, not the send date.',
    },
    tryInput: {
      type: 'date',
      label: 'Date HHA Received Signed POT',
      coachingMessage: 'Use actual receipt date, not the physician signature date.',
      highRisk: true,
    },
  },
  {
    id: 'box-23',
    label: 'Box 23 · Physician Signature / Date',
    bbox: { x: 50, y: 79, width: 50, height: 6.5 },
    shortTooltip: 'Signature and date controls are hard-stop compliance items.',
    detail: {
      whyItMatters:
        'Missing or late authentication is an objective defect and frequent denial trigger.',
      howToFill:
        'Ensure the physician has signed with an authorized method and the date falls within the required window.',
      commonMistakes: [
        'Unsigned or late-signed plan',
        'Signature date outside required window',
        'Authentication method not compliant (e.g., rubber stamp)',
      ],
      example: 'Robert Chen, MD · 02/25/2026 · e-Sig verified',
    },
    guidedStep: {
      stepOrder: 22,
      stepTitle: 'Complete Signature Controls',
      stepInstruction: 'Confirm authentication method and date timing before episode release.',
      source: 'Signed orders workflow, authentication logs, QA checklist',
      defensibleForAudit: 'Prevents objective technical denials unrelated to clinical quality.',
      checkQuestion: 'True/False: Plan can be billed before signature if care was delivered correctly.',
      choices: ['True', 'False'],
      correctIndex: 1,
      rationale: 'Billing release should be hard-stopped when required signatures are incomplete.',
    },
    tryInput: {
      type: 'date',
      label: 'Physician Signature Date',
      coachingMessage: 'Missing or invalid signature timing is high risk for denial.',
      highRisk: true,
    },
  },
  {
    id: 'box-19',
    label: 'Box 19 · Attending RN / Date',
    bbox: { x: 50, y: 85.5, width: 50, height: 4 },
    shortTooltip: 'The attending RN demonstrates clinical accountability for the plan.',
    detail: {
      whyItMatters:
        'The RN sign-off confirms clinical ownership of the plan and connects the agency\'s nurse to the physician orders.',
      howToFill:
        'Enter the name, credentials, and signature date of the RN responsible for the plan.',
      commonMistakes: [
        'Missing RN credentials (BSN, MSN)',
        'Date not matching the plan submission timeline',
        'Using a different RN than the one who assessed the patient',
      ],
      example: 'Maria Santos, RN BSN · 02/24/2026',
    },
    guidedStep: {
      stepOrder: 23,
      stepTitle: 'Enter Attending RN',
      stepInstruction: 'Document the RN responsible for clinical oversight of this plan.',
      source: 'Nursing assignment, assessment documentation',
      defensibleForAudit: 'RN accountability links clinical care to the documented plan.',
      checkQuestion: 'The RN in Box 19 should be:',
      choices: [
        'Any available RN',
        'The RN who assessed the patient and developed the plan',
        'The agency DON regardless of involvement',
      ],
      correctIndex: 1,
      rationale: 'Clinical accountability requires the assessing RN\'s signature.',
    },
    tryInput: {
      type: 'text',
      label: 'Attending RN / Date',
      placeholder: 'Name, RN BSN, MM/DD/YYYY',
      coachingMessage: 'Include full credentials and the actual assessment date.',
    },
  },
]
