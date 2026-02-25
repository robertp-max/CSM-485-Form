/**
 * Canonical CMS-485 / Home Health Glossary
 * -----------------------------------------
 * Each entry contains a short key (used for SCORM persistence),
 * canonical term, aliases (case-insensitive), definition, and
 * optional "why it matters" one-liner.
 */

export type GlossaryEntry = {
  /** Short stable key used for persistence (3-6 chars, lowercase) */
  key: string
  /** Canonical display term */
  term: string
  /** Case-insensitive aliases that should also trigger this entry */
  aliases: string[]
  /** 1–2 sentence definition */
  definition: string
  /** Optional one-liner explaining importance */
  whyItMatters?: string
}

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    key: 'poc',
    term: 'Plan of Care',
    aliases: ['POC', 'plan of care', '485', 'CMS-485'],
    definition:
      'A patient-specific clinical roadmap documented on CMS-485 that details measurable goals, interventions, disciplines, and visit frequencies for the home health episode.',
    whyItMatters:
      'Every service billed must trace back to an active, signed Plan of Care.',
  },
  {
    key: 'cert',
    term: 'Certification',
    aliases: ['certification', 'certification period', 'cert period'],
    definition:
      'The initial 60-day period during which the physician certifies that the patient meets home health eligibility criteria including homebound status and skilled need.',
    whyItMatters:
      'Services outside a valid certification period are not covered by Medicare.',
  },
  {
    key: 'rcrt',
    term: 'Recertification',
    aliases: ['recertification', 'recert'],
    definition:
      'Subsequent 60-day episode renewals requiring a physician to re-attest that the patient continues to meet home health eligibility criteria.',
    whyItMatters:
      'Missed or late recertification creates a gap in coverage that cannot be billed retroactively.',
  },
  {
    key: 'sknd',
    term: 'Skilled Need',
    aliases: ['skilled need', 'skilled nursing', 'skilled service'],
    definition:
      'A clinical requirement that the services provided demand the judgment or expertise of a licensed professional (RN, PT, OT, SLP) and are reasonable and necessary.',
    whyItMatters:
      'Without documented skilled need, services may be denied as non-covered.',
  },
  {
    key: 'hbnd',
    term: 'Homebound',
    aliases: ['homebound', 'homebound status', 'home-bound'],
    definition:
      'A Medicare eligibility criterion requiring that leaving home demands considerable and taxing effort due to illness or injury, and absences are infrequent or for medical care.',
    whyItMatters:
      'Homebound status must be clinically supported in every assessment and visit note.',
  },
  {
    key: 'ftf',
    term: 'Face-to-Face Encounter',
    aliases: ['FTF', 'face-to-face', 'face to face encounter', 'F2F'],
    definition:
      'A physician or allowed NPP visit that documents the clinical findings supporting home health eligibility, required within specific timeframes relative to SOC.',
    whyItMatters:
      'A missing or non-compliant FTF is a top reason for claim denials and ADR failures.',
  },
  {
    key: 'ordr',
    term: 'Orders',
    aliases: ['orders', 'physician orders', 'MD orders'],
    definition:
      'Written directives from the certifying physician specifying treatments, medications, services, and frequencies that comprise the Plan of Care.',
    whyItMatters:
      'All provided services must be supported by signed orders; unauthorized services are not billable.',
  },
  {
    key: 'vo',
    term: 'Verbal Order',
    aliases: ['VO', 'verbal order', 'telephone order', 'TO'],
    definition:
      'A spoken physician directive that must be documented immediately in the record and authenticated by the physician within the required timeframe.',
    whyItMatters:
      'Unsigned verbal orders are a common survey deficiency and audit trigger.',
  },
  {
    key: 'adr',
    term: 'ADR',
    aliases: ['ADR', 'Additional Documentation Request'],
    definition:
      'A request from a Medicare contractor for supporting documentation to validate a claim before or after payment, triggered by targeted or random review.',
    whyItMatters:
      'A well-documented chart resolves ADRs quickly; gaps lead to denials and appeals.',
  },
  {
    key: 'cop',
    term: 'Conditions of Participation',
    aliases: ['CoP', 'CoPs', 'Conditions of Participation', 'conditions of participation'],
    definition:
      'Federal regulatory requirements (42 CFR §484) that home health agencies must meet to participate in Medicare and Medicaid programs.',
    whyItMatters:
      'Non-compliance can result in citations, sanctions, or termination from Medicare.',
  },
  {
    key: 'oass',
    term: 'OASIS',
    aliases: ['OASIS', 'OASIS-E', 'OASIS assessment'],
    definition:
      'Outcome and Assessment Information Set — a standardized patient assessment instrument required at specific time points to measure outcomes and determine payment grouping.',
    whyItMatters:
      'OASIS accuracy directly affects reimbursement, quality scores, and Star Ratings.',
  },
  {
    key: 'mned',
    term: 'Medical Necessity',
    aliases: ['medical necessity', 'medically necessary'],
    definition:
      'The clinical justification that services are reasonable and necessary for the diagnosis and treatment of the patient\'s condition, as required for Medicare coverage.',
    whyItMatters:
      'Every visit note must reflect medical necessity or the service risks denial.',
  },
  {
    key: 'psig',
    term: 'Physician Signature',
    aliases: ['physician signature', 'MD signature', 'signing physician'],
    definition:
      'The certifying physician\'s authentication of the Plan of Care, verbal orders, and FTF documentation, required within regulatory timeframes.',
    whyItMatters:
      'Unsigned or late-signed documents are a leading cause of claim denials.',
  },
  {
    key: 'dfrq',
    term: 'Discipline Frequency',
    aliases: ['discipline frequency', 'visit frequency', 'frequency and duration'],
    definition:
      'The specific number and type of visits per discipline (SN, PT, OT, SLP, MSW, HHA) ordered on the Plan of Care for each certification period.',
    whyItMatters:
      'Under/over-utilization relative to ordered frequencies triggers audit scrutiny.',
  },
  {
    key: 'vpat',
    term: 'Visit Pattern',
    aliases: ['visit pattern', 'visit schedule'],
    definition:
      'The clinical rationale-driven schedule of visits reflecting front-loading when appropriate and tapering as patient improves.',
    whyItMatters:
      'Visit patterns must match clinical acuity; mismatches signal potential compliance risk.',
  },
  {
    key: 'pdgm',
    term: 'PDGM',
    aliases: ['PDGM', 'Patient-Driven Groupings Model'],
    definition:
      'The Medicare payment model effective January 2020 that classifies home health periods into payment groups based on clinical characteristics, functional levels, and comorbidities.',
    whyItMatters:
      'Accurate coding and OASIS completion directly drive reimbursement under PDGM.',
  },
  {
    key: 'soc',
    term: 'Start of Care',
    aliases: ['SOC', 'start of care', 'SOC date'],
    definition:
      'The first billable visit date that establishes the initial assessment period, triggering OASIS completion and episode timing requirements.',
    whyItMatters:
      'SOC timing errors cascade into certification, billing, and OASIS deadline violations.',
  },
  {
    key: 'lupa',
    term: 'LUPA',
    aliases: ['LUPA', 'Low Utilization Payment Adjustment'],
    definition:
      'A payment reduction applied when the number of visits in a 30-day period falls below the PDGM-determined threshold for that payment group.',
    whyItMatters:
      'LUPA episodes pay per-visit instead of the full period rate, significantly reducing revenue.',
  },
  {
    key: 'hha',
    term: 'Home Health Aide',
    aliases: ['HHA', 'home health aide', 'aide services'],
    definition:
      'A paraprofessional who provides personal care and task-level support under the supervision and direction of a skilled discipline (RN, PT, OT, SLP).',
    whyItMatters:
      'HHA services require an active skilled discipline and a documented supervisory plan.',
  },
  {
    key: 'roc',
    term: 'Resumption of Care',
    aliases: ['ROC', 'resumption of care'],
    definition:
      'An OASIS assessment completed when a patient returns to home health services after an inpatient facility stay during an existing episode.',
    whyItMatters:
      'ROC triggers reassessment requirements and may change the PDGM payment group.',
  },
  {
    key: 'dc',
    term: 'Discharge',
    aliases: ['discharge', 'DC', 'discharge summary'],
    definition:
      'The formal end of a home health episode, requiring an OASIS transfer/discharge assessment and summary of goals met, outcomes, and follow-up plans.',
    whyItMatters:
      'Incomplete discharge documentation creates audit vulnerabilities and gaps in continuity.',
  },
  {
    key: 'qarp',
    term: 'QAPI',
    aliases: ['QAPI', 'Quality Assurance and Performance Improvement', 'QA', 'quality assurance'],
    definition:
      'A required agency-wide program combining quality assurance (monitoring standards) and performance improvement (data-driven initiatives) under the CoPs.',
    whyItMatters:
      'Active QAPI programs identify documentation deficiencies before they become survey findings.',
  },
  {
    key: 'epis',
    term: 'Episode',
    aliases: ['episode', 'episode of care', '30-day period'],
    definition:
      'A 30-day billing period under PDGM (previously 60-day under PPS) that defines the payment unit for home health services.',
    whyItMatters:
      'Episode management drives visit planning, LUPA avoidance, and revenue cycle performance.',
  },
  {
    key: 'supv',
    term: 'Supervisory Visit',
    aliases: ['supervisory visit', 'supervision', 'aide supervision'],
    definition:
      'A required visit by a registered nurse or therapist to evaluate aide performance and patient status, conducted every 14 days when HHA services are active.',
    whyItMatters:
      'Missing supervisory visits is a frequent CoP deficiency finding during surveys.',
  },
  {
    key: 'prn',
    term: 'PRN Order',
    aliases: ['PRN', 'as needed', 'PRN order'],
    definition:
      'An as-needed order that specifies the conditions under which a visit may be made, including triggers, boundaries, and required follow-up documentation.',
    whyItMatters:
      'Vague PRN orders without defined parameters are non-compliant and can be denied.',
  },
  {
    key: 'tfer',
    term: 'Transfer',
    aliases: ['transfer', 'transfer to inpatient'],
    definition:
      'The movement of a patient to an inpatient facility that requires an OASIS transfer assessment and may interrupt the current billing episode.',
    whyItMatters:
      'Timely transfer documentation ensures accurate OASIS reporting and episode handling.',
  },
  {
    key: 'clia',
    term: 'CLIA Waiver',
    aliases: ['CLIA', 'CLIA waiver', 'point-of-care testing'],
    definition:
      'A certificate under the Clinical Laboratory Improvement Amendments allowing agencies to perform waived point-of-care tests (e.g., blood glucose) in the home.',
    whyItMatters:
      'Performing lab tests without a valid CLIA waiver violates federal regulations.',
  },
  {
    key: 'icd',
    term: 'ICD-10 Coding',
    aliases: ['ICD-10', 'ICD-10 coding', 'diagnosis coding', 'ICD codes'],
    definition:
      'The standardized classification system for diagnoses used on the CMS-485 and OASIS that determines clinical grouping and payment classification.',
    whyItMatters:
      'Coding accuracy is the primary driver of PDGM payment group assignment.',
  },
  {
    key: 'msw',
    term: 'Medical Social Worker',
    aliases: ['MSW', 'medical social worker', 'social work'],
    definition:
      'A qualified social worker who provides services addressing psychosocial factors affecting the patient\'s health outcomes, ordered as part of the Plan of Care.',
    whyItMatters:
      'MSW services require a skilled discipline to be active and must be tied to specific Plan of Care goals.',
  },
  {
    key: 'npp',
    term: 'Non-Physician Practitioner',
    aliases: ['NPP', 'non-physician practitioner', 'nurse practitioner', 'NP', 'PA'],
    definition:
      'A clinical provider (NP, PA, CNS) who may perform certain certification functions including the Face-to-Face encounter under physician collaboration.',
    whyItMatters:
      'NPP FTF encounters must clearly document collaboration with the certifying physician.',
  },
  {
    key: 'cchh',
    term: 'Comprehensive Assessment',
    aliases: ['comprehensive assessment', 'initial assessment'],
    definition:
      'A thorough evaluation of the patient\'s medical, nursing, rehabilitative, social, and discharge planning needs completed at SOC, ROC, recert, or significant change.',
    whyItMatters:
      'The comprehensive assessment drives the entire Plan of Care and must be clinically complete.',
  },
  {
    key: 'strt',
    term: 'Star Rating',
    aliases: ['Star Rating', 'star ratings', 'quality star rating', 'CMS Star Rating'],
    definition:
      'A CMS quality measure (1–5 stars) comparing agency outcomes, process measures, and patient experience against national benchmarks.',
    whyItMatters:
      'Star Ratings affect referral patterns, value-based purchasing, and public perception of agency quality.',
  },
  {
    key: 'cord',
    term: 'Care Coordination',
    aliases: ['care coordination', 'coordination of care', 'interdisciplinary coordination'],
    definition:
      'The deliberate organization of patient care activities between disciplines and providers to ensure safe, effective, and efficient service delivery.',
    whyItMatters:
      'Poor care coordination is a root cause of contradictory documentation and compliance failures.',
  },
  {
    key: 'trc',
    term: 'Trace Model',
    aliases: ['trace model', 'one story rule', 'clinical trace'],
    definition:
      'A documentation quality framework requiring one continuous clinical narrative from Face-to-Face through OASIS, Plan of Care, visit notes, and claim submission.',
    whyItMatters:
      'Disconnected records across care artifacts are the primary trigger for audit denials.',
  },
  {
    key: 'othr',
    term: 'Order Tracking',
    aliases: ['order tracking', 'order management', 'order aging'],
    definition:
      'The systematic process of monitoring pending physician orders from issuance through authentication, ensuring timely signatures and compliance.',
    whyItMatters:
      'Aged unsigned orders create billing delays, compliance gaps, and audit vulnerabilities.',
  },
]

// ── Derived lookups ────────────────────────────────────────────

/** Map from lowercase surface form → GlossaryEntry */
const _entryByAlias = new Map<string, GlossaryEntry>()
for (const entry of GLOSSARY_ENTRIES) {
  _entryByAlias.set(entry.term.toLowerCase(), entry)
  for (const alias of entry.aliases) {
    _entryByAlias.set(alias.toLowerCase(), entry)
  }
}

/**
 * Look up a glossary entry by any known surface form (case-insensitive).
 */
export const lookupGlossaryEntry = (text: string): GlossaryEntry | undefined =>
  _entryByAlias.get(text.toLowerCase())

/**
 * All matchable surface forms sorted longest-first so regex greedily matches
 * multi-word phrases before their sub-phrases.
 */
export const glossarySurfaceForms: string[] = Array.from(_entryByAlias.keys()).sort(
  (a, b) => b.length - a.length,
)

// ── Backward-compat flat map (used by existing GlossaryTerm) ────
export const glossary: Record<string, string> = Object.fromEntries(
  GLOSSARY_ENTRIES.map((e) => [e.term, e.definition]),
)
export const glossaryTerms = Object.keys(glossary).sort((a, b) => b.length - a.length)
