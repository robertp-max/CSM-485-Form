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

export const CMS485_PAGE_LABEL = 'Page 1 (FAQ #65 sample)'

export const CMS485_HOTSPOTS: Cms485Hotspot[] = [
  {
    id: 'patient-cert-period',
    label: 'Patient Identifiers + Certification Period',
    bbox: { x: 6, y: 6, width: 88, height: 10 },
    shortTooltip: 'Confirm patient identity and cert dates exactly match source orders.',
    detail: {
      whyItMatters:
        'Identity/date mismatches break continuity, trigger claim edits, and weaken audit traceability.',
      howToFill:
        'Use the referral/order packet and certification dates approved by the physician. Keep identifiers exact across all forms.',
      commonMistakes: [
        'Transposed birth date or MRN',
        'Certification dates not aligned with episode records',
        'Nickname used instead of legal patient name',
      ],
      example: 'Cert Period: 02/24/2026–04/23/2026; Name and DOB exactly match intake face sheet.',
    },
    guidedStep: {
      stepOrder: 1,
      stepTitle: 'Set patient identity and cert window',
      stepInstruction: 'Start with patient identifiers and certification period before any clinical narrative.',
      source: 'Referral packet, intake demographics, signed certification order',
      defensibleForAudit: 'Shows timeline integrity and avoids objective demographic/date defects.',
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
    id: 'diagnoses',
    label: 'Diagnoses',
    bbox: { x: 6, y: 18, width: 88, height: 12 },
    shortTooltip: 'Diagnosis selection must support the skilled driver for care.',
    detail: {
      whyItMatters: 'Diagnosis quality impacts PDGM grouping, necessity framing, and payer confidence.',
      howToFill:
        'Assign principal diagnosis to the dominant skilled need and add clinically relevant secondary diagnoses.',
      commonMistakes: [
        'Using nonspecific diagnosis language',
        'Principal diagnosis not tied to visit-level skilled interventions',
        'Copy-forward diagnosis not updated for current condition',
      ],
      example: 'Principal: CHF exacerbation with edema management; Secondary: CKD stage 3, HTN.',
    },
    guidedStep: {
      stepOrder: 2,
      stepTitle: 'Document defensible diagnoses',
      stepInstruction: 'Set principal and secondary diagnoses that explain why skilled care is needed now.',
      source: 'Physician documentation, assessment findings, coding review',
      defensibleForAudit: 'Diagnosis-to-care alignment is a core medical necessity control.',
      checkQuestion: 'Which is strongest? ',
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
      label: 'Principal Diagnosis (mock)',
      placeholder: 'Enter principal diagnosis...',
      coachingMessage: 'Diagnosis must be specific enough to support skilled need.',
      highRisk: true,
    },
  },
  {
    id: 'orders-skilled-services',
    label: 'Orders / Skilled Services',
    bbox: { x: 6, y: 31, width: 88, height: 10 },
    shortTooltip: 'Orders should clearly define skilled interventions and intent.',
    detail: {
      whyItMatters:
        'Vague order language creates execution drift and weakens plan defensibility during review.',
      howToFill:
        'Document discipline, intervention, purpose, and expected clinical response in actionable language.',
      commonMistakes: [
        '“Evaluate and treat” without specifics',
        'No intervention purpose tied to patient condition',
        'Orders missing discipline ownership',
      ],
      example: 'SN for CHF monitoring, med titration reinforcement, edema trend escalation per protocol.',
    },
    guidedStep: {
      stepOrder: 3,
      stepTitle: 'Define skilled order specificity',
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
      label: 'Skilled Service Order (mock)',
      placeholder: 'e.g., SN for ...',
      coachingMessage: 'Include discipline, intervention, and clinical intent.',
    },
  },
  {
    id: 'visit-frequency-duration',
    label: 'Visit Frequency / Duration',
    bbox: { x: 6, y: 42, width: 88, height: 8 },
    shortTooltip: 'Frequency and duration must match acuity and progression expectations.',
    detail: {
      whyItMatters: 'Generic frequency is a top utilization-review risk and common denial trigger.',
      howToFill: 'Set frequency and duration based on risk acuity, intervention complexity, and measurable goals.',
      commonMistakes: [
        'Defaulting to generic 2w4 without rationale',
        'Duration not tied to expected progression',
        'No taper plan despite improvement',
      ],
      example: 'SN 2w3 then 1w3 for edema stabilization and medication self-management progression.',
    },
    guidedStep: {
      stepOrder: 4,
      stepTitle: 'Calibrate frequency and duration',
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
      label: 'Frequency/Duration (mock)',
      placeholder: 'e.g., 2w3 then 1w3',
      coachingMessage: 'Avoid vague cadence; tie plan to condition acuity.',
      highRisk: true,
    },
  },
  {
    id: 'goals-measurable',
    label: 'Measurable Goals',
    bbox: { x: 6, y: 51, width: 88, height: 9 },
    shortTooltip: 'Goals must be measurable, time-bound, and intervention-linked.',
    detail: {
      whyItMatters: 'Goal quality determines if progress can be objectively validated across visits.',
      howToFill: 'Write measurable targets with timeframe and intervention linkage.',
      commonMistakes: [
        'Broad goals without metric',
        'No timeline',
        'Goal not linked to interventions',
      ],
      example: 'Within 3 weeks patient demonstrates daily weight log and edema escalation call protocol.',
    },
    guidedStep: {
      stepOrder: 5,
      stepTitle: 'Set measurable goals',
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
      label: 'Goal statement (mock)',
      placeholder: 'Write a measurable goal...',
      coachingMessage: 'Include metric + timeframe + intervention connection.',
      highRisk: true,
    },
  },
  {
    id: 'dme-supplies',
    label: 'DME / Supplies',
    bbox: { x: 6, y: 61, width: 88, height: 7 },
    shortTooltip: 'Document equipment/supplies only when clinically justified and traceable.',
    detail: {
      whyItMatters: 'Unsupported DME/supply lines can produce compliance questions and billing friction.',
      howToFill: 'List only medically necessary equipment/supplies tied to plan interventions and safety.',
      commonMistakes: [
        'Adding supplies without intervention linkage',
        'No patient-specific need stated',
        'Outdated items carried forward',
      ],
      example: 'Compression supplies for edema protocol; patient/caregiver instructed on safe application.',
    },
    guidedStep: {
      stepOrder: 6,
      stepTitle: 'Validate DME and supply need',
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
      label: 'DME linkage check',
      options: ['No DME needed', 'Linked to active intervention', 'Unclear/Template only'],
      coachingMessage: 'Tie DME/supplies directly to intervention and safety rationale.',
    },
  },
  {
    id: 'safety-homebound',
    label: 'Safety Measures / Homebound Support',
    bbox: { x: 6, y: 69, width: 88, height: 10 },
    shortTooltip: 'Safety + homebound language should be specific and condition-based.',
    detail: {
      whyItMatters: 'Generic safety/homebound statements are high-risk in eligibility and survey review.',
      howToFill:
        'Describe taxing effort, functional limits, and concrete safety interventions aligned to current risks.',
      commonMistakes: [
        '“Patient is homebound” with no support details',
        'No risk triggers or follow-up actions',
        'Safety plan not tied to condition change risks',
      ],
      example: 'Homebound due to severe exertional dyspnea; fall-risk mitigation and caregiver reinforcement documented.',
    },
    guidedStep: {
      stepOrder: 7,
      stepTitle: 'Document safety and homebound defensibility',
      stepInstruction: 'Capture specific limitations and actionable risk controls.',
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
      label: 'Homebound rationale (mock)',
      placeholder: 'Describe taxing effort and limitation...',
      coachingMessage: 'Use objective limitations and safety context, not generic phrases.',
      highRisk: true,
    },
  },
  {
    id: 'physician-sign-date',
    label: 'Physician Signature / Date',
    bbox: { x: 6, y: 81, width: 88, height: 11 },
    shortTooltip: 'Signature and date controls are hard-stop compliance items.',
    detail: {
      whyItMatters: 'Missing/late authentication is an objective defect and frequent denial trigger.',
      howToFill: 'Ensure authorized signature method and date requirements are satisfied before billing progression.',
      commonMistakes: [
        'Unsigned or late-signed plan',
        'Signature date outside required window',
        'Authentication method not compliant',
      ],
      example: 'Physician e-signature completed and dated within required policy timeframe before finalization.',
    },
    guidedStep: {
      stepOrder: 8,
      stepTitle: 'Complete signature/date controls',
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
      label: 'Physician Signature Date (mock)',
      coachingMessage: 'Missing or invalid signature timing is high risk for denial.',
      highRisk: true,
    },
  },
]
