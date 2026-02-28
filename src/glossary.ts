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

  /* ── CMS Form ── */
  {
    key: 'cms485',
    term: 'CMS-485',
    aliases: ['CMS-485', '485', 'Plan of Treatment'],
    definition:
      'The Home Health Certification and Plan of Care form — the federally required document that communicates the physician-ordered plan of care for Medicare home health beneficiaries, including diagnoses, services, goals, and certification period.',
    whyItMatters:
      'Every field on the 485 must be accurate, complete, and consistent with the clinical record to withstand audit scrutiny.',
  },

  /* ── Clinical Roles & Disciplines ── */
  {
    key: 'sn',
    term: 'Skilled Nursing',
    aliases: ['SN', 'skilled nursing', 'skilled nurse'],
    definition:
      'A registered nurse (RN) or licensed practical nurse (LPN/LVN) providing services that require the skills of a licensed nurse, including assessment, teaching, training, and skilled interventions as defined in 42 CFR §409.44.',
    whyItMatters:
      'Skilled nursing is the most common qualifying service for the Medicare home health benefit.',
  },
  {
    key: 'pt',
    term: 'Physical Therapy',
    aliases: ['PT', 'physical therapy', 'physical therapist'],
    definition:
      'A qualified physical therapist providing skilled rehabilitative services to restore function, improve mobility, relieve pain, or prevent disability. PT is a qualifying service for the Medicare home health benefit under 42 CFR §409.42.',
    whyItMatters:
      'PT services require documented functional limitations and measurable, time-bound goals.',
  },
  {
    key: 'ot',
    term: 'Occupational Therapy',
    aliases: ['OT', 'occupational therapy', 'occupational therapist'],
    definition:
      'A qualified occupational therapist providing skilled services to restore, maintain, or prevent decline in functional abilities related to self-care, work, and daily living tasks.',
    whyItMatters:
      'OT can continue as a stand-alone qualifying service once another skilled service has established eligibility.',
  },
  {
    key: 'slp',
    term: 'Speech-Language Pathology',
    aliases: ['SLP', 'speech-language pathology', 'speech therapy', 'speech therapist'],
    definition:
      'A qualified speech-language pathologist providing skilled services for speech, language, cognitive-communication, voice, swallowing, and fluency disorders.',
    whyItMatters:
      'SLP is a qualifying service; swallowing disorders often drive medical necessity documentation.',
  },
  {
    key: 'dme',
    term: 'DME',
    aliases: ['DME', 'durable medical equipment'],
    definition:
      'Durable Medical Equipment — equipment that can withstand repeated use, is primarily for a medical purpose, is appropriate for home use, and is ordered by a physician. Examples include wheelchairs, walkers, hospital beds, and oxygen equipment.',
    whyItMatters:
      'DME listed on the Plan of Care must be medically necessary and supported by clinical documentation.',
  },

  /* ── Plan of Care Details ── */
  {
    key: 'freq',
    term: 'Frequency',
    aliases: ['frequency'],
    definition:
      'The number of visits per discipline per unit of time as ordered on the Plan of Care (e.g., "3 times per week" or "2W1, 1W3"). CMS requires that frequency be stated explicitly and be adequate to meet the patient\'s needs.',
    whyItMatters:
      'Missing or vague frequency statements on the CMS-485 are a common deficiency and audit trigger.',
  },
  {
    key: 'dur',
    term: 'Duration',
    aliases: ['duration'],
    definition:
      'The length of time over which ordered services are to be provided, typically expressed in weeks and aligned with the 60-day certification period. Duration must be explicitly stated on the Plan of Care alongside frequency.',
    whyItMatters:
      'Duration must match the certification period and support the clinical rationale for the ordered visits.',
  },
  {
    key: 'mgoal',
    term: 'Measurable Goals',
    aliases: ['measurable goals', 'measurable goal'],
    definition:
      'Patient-centered, objective, and quantifiable outcomes documented on the Plan of Care. Per CMS guidance, goals must include a specific target, a timeframe for achievement, and a linkage to the skilled intervention addressing the goal.',
    whyItMatters:
      'Vague or non-measurable goals do not meet CMS standards and weaken the clinical record\'s defensibility.',
  },
  {
    key: 'intord',
    term: 'Interim Order',
    aliases: ['interim order', 'interim orders'],
    definition:
      'A physician order issued between certification periods to add, change, or discontinue services on an existing Plan of Care. Interim orders must be incorporated into the current POC and signed by the physician.',
    whyItMatters:
      'Unsigned or undocumented interim orders create gaps in the authorized plan and risk claim denials.',
  },
  {
    key: 'dcpln',
    term: 'Discharge Planning',
    aliases: ['discharge planning', 'discharge plan'],
    definition:
      'The process of preparing for the patient\'s transition from home health services, documented on the Plan of Care. CMS requires that discharge planning be initiated at admission and updated throughout the episode.',
    whyItMatters:
      'Absent or boilerplate discharge plans signal lack of individualized care planning during audits.',
  },

  /* ── Clinical Documentation ── */
  {
    key: 'skrat',
    term: 'Skilled Rationale',
    aliases: ['skilled rationale'],
    definition:
      'The documented clinical reasoning that explains why a patient\'s care requires the skills of a licensed professional rather than non-skilled personnel. The rationale must connect the patient\'s condition, complexity, and risk to the specific skilled intervention.',
    whyItMatters:
      'Missing skilled rationale is the most common reason for medical necessity denials on audit.',
  },
  {
    key: 'clnec',
    term: 'Clinical Necessity',
    aliases: ['clinical necessity', 'clinically necessary'],
    definition:
      'The requirement that ordered services are driven by clinical assessment findings and that continuing care is supported by demonstrated patient need, complexity, or instability.',
    whyItMatters:
      'Clinical necessity must be supported with patient-specific evidence in every visit note and reassessment.',
  },
  {
    key: 'adl',
    term: 'ADL',
    aliases: ['ADL', 'ADLs', 'activities of daily living'],
    definition:
      'Activities of Daily Living — basic self-care tasks including bathing, dressing, toileting, transferring, continence, and eating. Functional limitations in ADLs support homebound status, skilled need, and OASIS assessment.',
    whyItMatters:
      'ADL documentation provides the functional evidence that supports homebound status and medical necessity.',
  },
  {
    key: 'sob',
    term: 'SOB',
    aliases: ['SOB', 'shortness of breath'],
    definition:
      'Shortness of Breath (Dyspnea) — a subjective clinical symptom documented in patient assessments. SOB severity and its functional impact are relevant to homebound status justification and skilled nursing assessment.',
    whyItMatters:
      'SOB must be documented with specific details (onset, severity, triggers) to support clinical findings.',
  },
  {
    key: 'bnfy',
    term: 'Beneficiary',
    aliases: ['beneficiary', 'beneficiaries'],
    definition:
      'An individual enrolled in and entitled to benefits under the Medicare program. In home health, the beneficiary is the patient receiving services covered by Medicare Parts A or B.',
    whyItMatters:
      'Beneficiary eligibility must be verified at SOC and each recertification to prevent coverage issues.',
  },

  /* ── Compliance, Audit & Oversight ── */
  {
    key: 'mac',
    term: 'MAC',
    aliases: ['MAC', 'Medicare Administrative Contractor'],
    definition:
      'Medicare Administrative Contractor — a private entity that CMS contracts with to process and pay Medicare claims for a defined geographic jurisdiction. MACs also perform medical review, provider enrollment, and provider education.',
    whyItMatters:
      'Understanding your MAC\'s Local Coverage Determinations helps prevent claim denials.',
  },
  {
    key: 'rac',
    term: 'RAC',
    aliases: ['RAC', 'Recovery Audit Contractor'],
    definition:
      'Recovery Audit Contractor — an entity contracted by CMS to identify and correct improper payments (overpayments and underpayments) in the Medicare program through post-payment review.',
    whyItMatters:
      'RAC audits look for documentation patterns that suggest systematic billing errors.',
  },
  {
    key: 'zpic',
    term: 'ZPIC',
    aliases: ['ZPIC', 'Zone Program Integrity Contractor'],
    definition:
      'Zone Program Integrity Contractor — CMS contractors responsible for investigating potential fraud, waste, and abuse in Medicare through data analysis, medical record review, and law enforcement referrals.',
    whyItMatters:
      'ZPIC investigations carry serious consequences and can lead to payment suspensions and fraud referrals.',
  },
  {
    key: 'upic',
    term: 'UPIC',
    aliases: ['UPIC', 'Unified Program Integrity Contractor'],
    definition:
      'Unified Program Integrity Contractor — the successor to ZPICs, UPICs perform fraud, waste, and abuse investigations across both Medicare and Medicaid programs within assigned jurisdictions.',
    whyItMatters:
      'UPICs have expanded authority and can suspend payments during active investigations.',
  },
  {
    key: 'tpe',
    term: 'TPE',
    aliases: ['TPE', 'Targeted Probe and Educate'],
    definition:
      'Targeted Probe and Educate — a CMS medical review strategy where MACs select providers with high claim error rates for focused review. Providers receive individualized education after each round.',
    whyItMatters:
      'TPE rounds are an early-warning system; agencies that correct errors avoid escalation to full review.',
  },
  {
    key: 'noa',
    term: 'NOA',
    aliases: ['NOA', 'Notice of Admission'],
    definition:
      'Notice of Admission — a one-time notice that home health agencies must submit to Medicare within 5 calendar days of the start of a 60-day episode to establish payment.',
    whyItMatters:
      'Missed or late NOA submission directly reduces Medicare reimbursement for the episode.',
  },
  {
    key: 'utrev',
    term: 'Utilization Review',
    aliases: ['utilization review'],
    definition:
      'The process of evaluating the medical necessity, appropriateness, and efficiency of home health services delivered to a patient. May be conducted prospectively, concurrently, or retrospectively.',
    whyItMatters:
      'Internal utilization review catches over- and under-utilization patterns before payers do.',
  },
  {
    key: 'pprev',
    term: 'Post-Payment Review',
    aliases: ['post-payment review'],
    definition:
      'A retrospective audit conducted after a claim has been paid, examining the medical record to determine whether services billed were medically necessary, properly documented, and correctly coded.',
    whyItMatters:
      'Post-payment review findings can trigger broader audits and significant recoupment demands.',
  },
  {
    key: 'deny',
    term: 'Claim Denial',
    aliases: ['claim denial', 'claim denials'],
    definition:
      'A determination by a payer that a Medicare home health claim does not meet coverage criteria, medical necessity requirements, or documentation standards.',
    whyItMatters:
      'Denial patterns reveal systemic documentation weaknesses that must be addressed agency-wide.',
  },
  {
    key: 'dfns',
    term: 'Defensibility',
    aliases: ['defensibility', 'defensible'],
    definition:
      'The degree to which a clinical record can withstand external scrutiny during audit, medical review, or legal proceedings. A defensible record contains complete, consistent, patient-specific documentation.',
    whyItMatters:
      'Defensibility is the single most important quality of a clinical record in the current regulatory environment.',
  },
  {
    key: 'srvy',
    term: 'Survey',
    aliases: ['survey', 'surveyor', 'surveys', 'surveyors'],
    definition:
      'An on-site inspection conducted by state survey agencies on behalf of CMS to evaluate a home health agency\'s compliance with the Conditions of Participation.',
    whyItMatters:
      'Survey readiness requires that every active clinical record demonstrate current compliance.',
  },
  {
    key: 'cite',
    term: 'Citation',
    aliases: ['citation', 'citations'],
    definition:
      'A formal finding of non-compliance with a specific Condition of Participation identified during a survey. Citations document the deficient practice, the regulatory reference, and the scope and severity.',
    whyItMatters:
      'Citations require corrective action plans and repeat deficiencies can trigger sanctions or decertification.',
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
