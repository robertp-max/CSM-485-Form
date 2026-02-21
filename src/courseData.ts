export type SectionKey =
  | 'orientation'
  | 'regulatory'
  | 'orders'
  | 'field'
  | 'medical'
  | 'alignment'

export type VisualizationType = 'auditLens' | 'goodBad' | 'microSim' | 'decisionTree' | 'templateBuilder'

export type CardData = {
  id: string
  section: SectionKey
  title: string
  objective: string
  coreContent: string[]
  practicalExample: string
  redFlag: string
  deepDive?: string[]
  formHotspotIds?: string[]
  visualization: {
    type: VisualizationType
    prompt: string
    options?: string[]
    goodExample?: string
    badExample?: string
    chips?: string[]
  }
  knowledgeCheck: {
    question: string
    options: string[]
    correctAnswer: string
    rationale: string
  }
}

const makeCard = (card: CardData): CardData => card

export const sectionLabels: Record<SectionKey, string> = {
  orientation: 'Orientation',
  regulatory: 'Regulatory Foundation',
  orders: 'Orders & Change Control',
  field: 'CMS-485 Field-by-Field',
  medical: 'Medical Necessity',
  alignment: 'Alignment + Defensibility + Practice',
}

export const learningCards: CardData[] = [
  makeCard({
    id: 'course-overview',
    section: 'orientation',
    title: 'Course Overview + How to Pass + How This Protects Clinicians and Agency',
    objective: 'Explain course success criteria and how chart quality protects clinicians, patients, and agency operations.',
    coreContent: [
      'This training is CMS-aligned, CoP-compliant, and audit-ready for home health practice.',
      'Pass pathway: complete card checks, pass final exam, and apply the “one story” rule in charting.',
      'Documentation quality is both patient-safety control and payment-defense control.',
      'Poor documentation increases denial exposure, rework burden, and escalation risk.',
      'Strong documentation creates faster QA decisions and cleaner interdisciplinary handoffs.',
    ],
    practicalExample:
      'Compliant language: “Skilled RN identified worsening edema trend, notified provider, updated plan, reinforced teach-back thresholds.” This works because it shows risk, action, and outcome in one trace.',
    redFlag:
      'Reviewer view: “Routine follow-up done” with no clinical reasoning. It fails because skilled need and care-impact are not visible.',
    deepDive: [
      'Use this course as a repeatable charting protocol, not one-time onboarding content.',
      'When QA and clinicians use the same documentation model, denial variability drops.',
    ],
    visualization: {
      type: 'auditLens',
      prompt: 'Audit Lens: which sentence is easier for a reviewer to defend?',
      options: ['Routine visit completed.', 'Risk identified, skilled action performed, provider notified, plan revised.'],
    },
    knowledgeCheck: {
      question: 'What is the core documentation goal of this course?',
      options: ['Template completion only', 'CMS-aligned, CoP-compliant, audit-ready documentation', 'Faster note entry only'],
      correctAnswer: 'CMS-aligned, CoP-compliant, audit-ready documentation',
      rationale: 'The course trains defensible documentation, not just form completion.',
    },
  }),
  makeCard({
    id: 'trace-model',
    section: 'orientation',
    title: 'The Trace Model: FTF → OASIS/Assessment → POC → Visit Notes → Claim (One Story Rule)',
    objective: 'Apply one continuous clinical storyline from intake evidence through billed claim.',
    coreContent: [
      'The same clinical story must appear across FTF, assessment, POC, visits, and billing artifacts.',
      'Any mismatch in reason-for-care, skilled need, or homebound support introduces denial risk.',
      'Reviewers validate continuity, not isolated chart fragments.',
      'Use trace checks before billing: diagnosis, risk, interventions, and outcomes must align.',
      'Escalate and correct drift immediately when one document contradicts another.',
    ],
    practicalExample:
      'Compliant language: “FTF wound complexity aligns with OASIS findings, POC wound orders, and serial visit measurements.” It works because each artifact confirms the same story.',
    redFlag:
      'Reviewer view: FTF says CHF instability, but visits document only routine med reminders. It fails due to storyline inconsistency.',
    deepDive: ['Think longitudinally: reviewers reconstruct care chronology from first encounter to claim submission.'],
    visualization: {
      type: 'decisionTree',
      prompt: 'If FTF reason and visit-note skilled focus conflict, what is the best next step?',
      options: ['Ignore if signature is present', 'Reconcile records and update plan before billing', 'Proceed and explain later'],
    },
    knowledgeCheck: {
      question: 'What does the One Story Rule require?',
      options: ['Only diagnosis code consistency', 'Clinical continuity across all core documents', 'Only completed signatures'],
      correctAnswer: 'Clinical continuity across all core documents',
      rationale: 'Defensibility depends on a coherent cross-document clinical story.',
    },
  }),
  makeCard({
    id: 'format-not-requirement',
    section: 'orientation',
    title: 'CMS-485 Is a Format, Not the Requirement (CoPs and Coverage are the requirement)',
    objective: 'Differentiate form format from legal content requirements and audit expectations.',
    coreContent: [
      'CMS-485 is a familiar layout, but compliance is based on required content and evidence.',
      'Alternate forms are acceptable when required elements are complete and readily identifiable.',
      'Reviewers assess whether required fields can be traced quickly to clinical record support.',
      'A polished form still fails when patient-specific requirements are missing.',
      'Build QA checks around required elements, not form appearance.',
    ],
    practicalExample:
      'Compliant language: “Agency form includes all required plan elements and traceable links to assessment evidence.” It works because requirement completeness is explicit.',
    redFlag:
      'Reviewer view: “We use CMS-485” but goals or readmission interventions are absent. It fails due to missing required content.',
    visualization: {
      type: 'goodBad',
      prompt: 'Good vs Bad framing for form compliance',
      goodExample: 'Good: Requirement-complete, traceable, patient-specific plan.',
      badExample: 'Bad: Standardized form with missing required elements.',
    },
    knowledgeCheck: {
      question: 'What determines compliance first?',
      options: ['Form title', 'Required content completeness and traceability', 'PDF appearance'],
      correctAnswer: 'Required content completeness and traceability',
      rationale: 'Regulatory requirements govern, not the template name.',
    },
  }),
  makeCard({
    id: 'top-denial-triggers',
    section: 'orientation',
    title: 'Top 10 Denial Triggers (preview: what we’re preventing)',
    objective: 'Identify recurring denial triggers and prevent them before claim release.',
    coreContent: [
      'Top triggers include missing signatures, incomplete POC elements, and weak skilled rationale.',
      'Inconsistent diagnosis storyline across OASIS/POC/visits is a frequent review target.',
      'Generic homebound language without objective support is repeatedly denied.',
      'Late VO authentication creates avoidable compliance and payment delays.',
      'Most denials are predictable process failures, not unpredictable events.',
    ],
    practicalExample:
      'Compliant language: “Pre-bill checklist completed: signature verified, VO authenticated, skilled rationale current.” It works by converting risk into controls.',
    redFlag: 'Reviewer view: recurring denial reason appears monthly with no corrective action. It fails as systemic control breakdown.',
    visualization: {
      type: 'microSim',
      prompt: 'Which denial trigger should be escalated first?',
      options: ['Minor punctuation mismatch', 'Unsigned required plan before billing', 'Header capitalization variance'],
    },
    knowledgeCheck: {
      question: 'Which trigger has the highest immediate billing risk?',
      options: ['Unsigned required plan', 'Template font mismatch', 'Long note length'],
      correctAnswer: 'Unsigned required plan',
      rationale: 'Signature timing failures are objective and high-impact.',
    },
  }),

  // SECTION 2
  makeCard({
    id: 'coverage-vs-cops',
    section: 'regulatory',
    title: 'Coverage vs CoPs (what drives payment vs survey citations)',
    objective: 'Separate payment-eligibility testing from participation/survey compliance testing.',
    coreContent: [
      'Coverage rules drive payment eligibility decisions for billed services.',
      'CoPs drive participation and quality expectations validated in surveys.',
      'One chart defect can create both a denial and a citation pathway.',
      'Coverage checks ask “billable?” while CoP checks ask “compliant care process?”',
      'Build controls that satisfy both simultaneously.',
    ],
    practicalExample: 'Compliant language: “Care delivered under updated plan with timely provider communication and complete record support.” It works for both payment and survey trace.',
    redFlag: 'Reviewer view: care appears clinically reasonable but certification controls are missing. It fails payment eligibility.',
    visualization: { type: 'goodBad', prompt: 'Coverage vs CoP comparison', goodExample: 'Good: both payment and participation controls addressed.', badExample: 'Bad: clinical narrative only, no cert/signature control.' },
    knowledgeCheck: {
      question: 'What do coverage rules primarily influence?',
      options: ['Payment eligibility', 'Marketing strategy', 'UI layout'],
      correctAnswer: 'Payment eligibility',
      rationale: 'Coverage documentation is directly tied to billability.',
    },
  }),
  makeCard({
    id: 'plan-required-elements',
    section: 'regulatory',
    title: 'Plan of Care Required Elements (484.60 checklist)',
    objective: 'Apply a complete required-elements checklist and map each risk to interventions and measurable goals.',
    coreContent: [
      'Plan must include diagnoses, function/cognition context, ordered services, frequency/duration, and treatments.',
      'Plan must include safety measures, readmission-risk interventions, education plan, and discharge strategy.',
      'Goals must be measurable, patient-specific, and connected to ordered interventions.',
      'Advance-directive documentation must be present and traceable in the record.',
      'Supervisor attestation should verify completeness before claim release.',
    ],
    practicalExample: 'Compliant language: “Fall risk documented with gait intervention, caregiver teach-back, and measurable no-fall target over 30 days.” It works because risk, intervention, and outcome are linked.',
    redFlag: 'Reviewer view: generic goal text with no metric/timeframe. It fails because progress and necessity cannot be validated.',
    deepDive: [
      'Checklist completion should trigger correction workflow when any required element is missing.',
      'Use attestation wording to document who reviewed completeness and when.',
    ],
    formHotspotIds: ['patient-cert', 'functional-safety', 'goals-discharge'],
    visualization: {
      type: 'templateBuilder',
      prompt: 'Build a compliant goal statement',
      chips: ['Risk: fall with transfers', 'Intervention: gait + caregiver training', 'Goal: no falls in 30 days with SBA'],
    },
    knowledgeCheck: {
      question: 'What must be true for a required element to be considered complete?',
      options: ['Field is not blank', 'Element is present and linked to patient-specific evidence', 'Element appears in any old note'],
      correctAnswer: 'Element is present and linked to patient-specific evidence',
      rationale: 'Completeness requires traceable clinical meaning, not box-fill alone.',
    },
  }),
  makeCard({
    id: 'cert-recert-timeline',
    section: 'regulatory',
    title: 'Certification/Recert Timeline (60-day cert vs 30-day payment periods) + Recert Trap',
    objective: 'Manage dual timelines and prevent recertification drift that weakens medical necessity.',
    coreContent: [
      'Certification is 60-day cycle while payment periods are 30 days.',
      'Recert trap: repeating prior episode language despite changed condition trends.',
      'Each recert should include updated skilled rationale and measurable goal progression.',
      'Timeline controls should include early review checkpoints before day-60.',
      'Escalate unresolved updates before billing progression.',
    ],
    practicalExample: 'Compliant language: “Recert updated to reflect reduced edema trend and revised visit frequency.” It works because care intensity tracks current clinical status.',
    redFlag: 'Reviewer view: same goals copied across recert with conflicting visit evidence. It fails due to staleness and inconsistency.',
    visualization: { type: 'decisionTree', prompt: 'At day 55 with unresolved plan changes, what is best action?', options: ['Bill now, revise later', 'Hold and reconcile recert updates', 'Skip recert update'] },
    knowledgeCheck: {
      question: 'What is the recertification trap?',
      options: ['Using measurable goals', 'Copy-forward without condition-specific updates', 'Early supervisor review'],
      correctAnswer: 'Copy-forward without condition-specific updates',
      rationale: 'Static recerts undermine skilled-need defensibility.',
    },
  }),
  makeCard({
    id: 'ftf-requirements',
    section: 'regulatory',
    title: 'Face-to-Face Requirements (90 prior / 30 after SOC) + consistency expectations',
    objective: 'Validate FTF timing and ensure FTF storyline consistency with assessment and plan.',
    coreContent: [
      'FTF timing must meet allowed pre/post SOC windows and be clinically relevant.',
      'FTF reason should align with POC interventions and skilled-need narrative.',
      'Mismatched FTF and visit documentation creates necessity-risk flags.',
      'Use intake QA to verify FTF evidence before claim progression.',
      'Treat unresolved FTF mismatch as high-priority correction.',
    ],
    practicalExample: 'Compliant language: “FTF supports post-op wound risk; plan orders skilled wound surveillance and escalation criteria.” It works because reason and plan are coherent.',
    redFlag: 'Reviewer view: FTF reason unrelated to ongoing skilled interventions. It fails due to non-aligned necessity evidence.',
    visualization: { type: 'microSim', prompt: 'Which response best handles FTF/POC mismatch?', options: ['Proceed and note later', 'Reconcile and update before billing', 'Ignore if visits occurred'] },
    knowledgeCheck: {
      question: 'Why does FTF consistency matter?',
      options: ['Only for formatting', 'It supports necessity continuity across documents', 'Only for scheduling'],
      correctAnswer: 'It supports necessity continuity across documents',
      rationale: 'Consistency is central to defensible eligibility.',
    },
  }),
  makeCard({
    id: 'who-can-sign-order',
    section: 'regulatory',
    title: 'Who can order/sign (physician + allowed practitioners) + eligibility/enrollment risk',
    objective: 'Verify signer/order authority and enrollment eligibility before accepting orders.',
    coreContent: [
      'Eligible practitioners may order/sign when scope and enrollment requirements are satisfied.',
      'Signature presence alone does not prove ordering/certifying eligibility.',
      'Maintain active roster controls for ordering practitioners and enrollment status.',
      'Escalate mismatched NPI/enrollment status before SOC and billing steps.',
      'Document verification checks in workflow trace.',
    ],
    practicalExample: 'Compliant language: “Ordering practitioner verified active/enrolled before SOC acceptance.” It works by showing eligibility control occurred.',
    redFlag: 'Reviewer view: signed plan with no eligibility check evidence. It fails due to ordering risk exposure.',
    visualization: { type: 'auditLens', prompt: 'Audit Lens: what proof reduces signer eligibility risk?', options: ['Signature image only', 'Signature plus documented eligibility verification'] },
    knowledgeCheck: {
      question: 'What is the best eligibility safeguard?',
      options: ['Signature alone', 'Roster control with verification evidence', 'Annual memo'],
      correctAnswer: 'Roster control with verification evidence',
      rationale: 'Eligibility must be validated and documented.',
    },
  }),
  makeCard({
    id: 'signature-hard-stop',
    section: 'regulatory',
    title: 'Signature timing + billing hard stop control',
    objective: 'Apply hard-stop controls so required signatures are complete before billing.',
    coreContent: [
      'Required signatures must be completed and dated before claim release.',
      'Late signature defects are objective and highly preventable denial drivers.',
      'Use aging queues and escalation steps for pending signature items.',
      'Hard-stop should block billing when required docs remain incomplete.',
      'Track turnaround metrics to reduce repeat delays.',
    ],
    practicalExample: 'Compliant language: “Billing hold maintained until signed plan and authenticated VO were on file.” It works by enforcing control integrity.',
    redFlag: 'Reviewer view: claim released with known missing signature. It fails as direct timing-control violation.',
    formHotspotIds: ['signature-block'],
    visualization: { type: 'decisionTree', prompt: 'Signature not returned and billing deadline is near. Best action?', options: ['Submit and fix later', 'Maintain hold and escalate', 'Bypass with note'] },
    knowledgeCheck: {
      question: 'What does a true billing hard stop do?',
      options: ['Warns only', 'Prevents claim release until required signatures complete', 'Applies after payment'],
      correctAnswer: 'Prevents claim release until required signatures complete',
      rationale: 'A hard stop is preventive, not advisory.',
    },
  }),

  // SECTION 3
  makeCard({ id: 'orders-specific', section: 'orders', title: 'Orders must be specific: discipline/treatment/frequency/skill purpose', objective: 'Write orders that clearly specify what skilled service is needed and why.', coreContent: ['Order language should name discipline, treatment action, frequency, and clinical purpose.', 'Specific orders improve care consistency and review defensibility.', 'Vague order text weakens necessity signal and increases interpretation risk.', 'Orders should map to measurable outcomes and reassessment plan.', 'Specificity reduces avoidable clarification delays.'], practicalExample: 'Compliant language: “SN 2w2 then 1w4 for wound assessment, sterile care, infection escalation criteria.” It works because task and purpose are explicit.', redFlag: 'Reviewer view: “SN eval and treat PRN.” It fails because discipline purpose and boundaries are unclear.', visualization: { type: 'goodBad', prompt: 'Specific vs vague order wording', goodExample: 'Discipline + action + frequency + purpose.', badExample: 'General eval/treat without purpose.' }, knowledgeCheck: { question: 'What must specific orders include?', options: ['Only discipline', 'Discipline, treatment, frequency, and skilled purpose', 'Only diagnosis code'], correctAnswer: 'Discipline, treatment, frequency, and skilled purpose', rationale: 'Specificity is required for care execution and review traceability.' } }),
  makeCard({ id: 'prn-orders', section: 'orders', title: 'PRN orders: triggers + limits + compliant examples', objective: 'Create PRN orders with objective triggers and visit limits.', coreContent: ['PRN orders must define signs/symptoms that trigger use.', 'PRN orders must include explicit maximum limits before new orders are needed.', 'PRN should support patient-specific contingencies, not scheduling flexibility.', 'Trigger quality improves care response consistency.', 'Limit controls reduce utilization ambiguity in review.'], practicalExample: 'Compliant language: “SN PRN x2 for fever >100.4, increased drainage, new erythema.” It works by combining objective trigger and cap.', redFlag: 'Reviewer view: “PRN as needed.” It fails due to missing trigger and limit.', formHotspotIds: ['orders-frequency'], visualization: { type: 'templateBuilder', prompt: 'Build compliant PRN sentence', chips: ['Trigger: symptom threshold', 'Limit: PRN x2', 'Action: skilled reassessment + provider notify'] }, knowledgeCheck: { question: 'A compliant PRN order requires:', options: ['Only PRN keyword', 'Objective triggers and explicit limits', 'No written criteria'], correctAnswer: 'Objective triggers and explicit limits', rationale: 'PRN defensibility depends on trigger-and-limit structure.' } }),
  makeCard({ id: 'vo-elements', section: 'orders', title: 'Verbal/Oral Orders: required elements + write-up standards + date/time/received-by', objective: 'Capture complete VO details for traceable and compliant order handling.', coreContent: ['Document exact order text, date/time received, and receiver credentials.', 'Include clinical context for why the VO was required.', 'Ensure VO entry is transcribed consistently in the order record.', 'Track VO from receipt through authentication completion.', 'Use standardized VO write-up format to reduce omission risk.'], practicalExample: 'Compliant language: “VO received 10:22 by RN J.Smith: add PRN wound reassessment for specified triggers.” It works due to complete chronology.', redFlag: 'Reviewer view: VO mentioned in note but missing formal order trace. It fails due to incomplete record chain.', visualization: { type: 'auditLens', prompt: 'Audit Lens: which VO note is defensible?', options: ['VO received', 'VO with time, receiver, full order text, and tracking ID'] }, knowledgeCheck: { question: 'Which VO detail is essential?', options: ['General summary only', 'Date/time + received-by + exact order text', 'Nurse initials only'], correctAnswer: 'Date/time + received-by + exact order text', rationale: 'VO defensibility requires complete trace metadata.' } }),
  makeCard({ id: 'vo-auth-tracking', section: 'orders', title: 'VO authentication/countersign + tracking & escalation workflow', objective: 'Operate VO authentication workflow with escalation before billing risk occurs.', coreContent: ['VO must be authenticated/countersigned before claim release.', 'Tracking board should show pending, aging, and escalated VO items.', 'Escalation paths should be predefined by age threshold.', 'Billing hard-stop should include unresolved VO authentication.', 'Workflow ownership must be visible and timestamped.'], practicalExample: 'Compliant language: “VO escalated at 72h threshold and authenticated before billing hold release.” It works because workflow controls are explicit.', redFlag: 'Reviewer view: unresolved VO at billing with no escalation documentation. It fails as avoidable workflow defect.', visualization: { type: 'decisionTree', prompt: 'VO pending past threshold. Best next step?', options: ['Proceed billing', 'Escalate and maintain hold', 'Remove VO reference'] }, knowledgeCheck: { question: 'When should VO escalation occur?', options: ['After denial only', 'At defined aging thresholds before billing', 'Only quarterly'], correctAnswer: 'At defined aging thresholds before billing', rationale: 'Proactive escalation prevents predictable VO failures.' } }),
  makeCard({ id: 'change-trigger', section: 'orders', title: 'Change in condition triggers: when to notify provider + update POC', objective: 'Escalate condition changes and update plan documentation without delay.', coreContent: ['Define trigger list for symptoms/findings that require provider notification.', 'Document what changed, why it matters, and immediate skilled action.', 'Update POC and orders when condition shift alters care plan requirements.', 'Capture provider communication time and outcome in chart.', 'Use trigger protocol to prevent silent drift in care delivery.'], practicalExample: 'Compliant language: “New respiratory decline triggered provider call and same-day plan update.” It works because change-to-action chain is explicit.', redFlag: 'Reviewer view: deterioration documented across visits with no provider communication entry. It fails due to unmanaged plan drift.', visualization: { type: 'microSim', prompt: 'Patient shows new high-risk symptom trend. Next action?', options: ['Continue routine plan', 'Notify provider and update plan/orders', 'Document and wait'] }, knowledgeCheck: { question: 'What should follow a true condition-change trigger?', options: ['No action if visit completed', 'Provider notification + plan update trace', 'Discharge immediately'], correctAnswer: 'Provider notification + plan update trace', rationale: 'Trigger management is a core control for safe and compliant care.' } }),

  // SECTION 4 (12)
  makeCard({ id: 'field-identifiers', section: 'field', title: 'Patient identifiers + SOC + certification dates (mismatch errors)', objective: 'Validate identifier and date consistency across plan, assessment, and billing record.', coreContent: ['Identifiers and SOC/cert dates anchor episode integrity.', 'Date mismatches create high-confidence denial and audit flags.', 'Cross-check cert windows against recert and payment workflows.', 'Resolve overlaps/gaps before claim progression.', 'Treat date inconsistency as immediate correction priority.'], practicalExample: 'Compliant language: “SOC and cert dates reconciled across OASIS, POC, and claim period.” It works because timeline integrity is explicit.', redFlag: 'Reviewer view: cert dates conflict between plan and billing window. It fails due to objective mismatch.', formHotspotIds: ['patient-cert'], visualization: { type: 'goodBad', prompt: 'Date integrity examples', goodExample: 'Single consistent cert timeline across documents.', badExample: 'Conflicting SOC/cert dates by artifact.' }, knowledgeCheck: { question: 'Which mismatch is highest risk here?', options: ['Bullet style', 'Certification date conflict', 'Paragraph length'], correctAnswer: 'Certification date conflict', rationale: 'Date mismatches are objective and high-impact.' } }),
  makeCard({ id: 'dx-principal-secondary', section: 'field', title: 'Diagnoses 1: principal vs secondary (clinical logic)', objective: 'Differentiate principal and secondary diagnoses using actual skilled-care drivers.', coreContent: ['Principal diagnosis should reflect dominant skilled-care reason.', 'Secondary diagnoses should support risk complexity and treatment context.', 'Diagnosis logic must align with visit interventions and trend documentation.', 'Misalignment weakens necessity and grouping defensibility.', 'Diagnosis strategy should be clinician-verified, not template-driven.'], practicalExample: 'Compliant language: “Principal diagnosis reflects active wound complexity driving skilled interventions.” It works because care and coding align.', redFlag: 'Reviewer view: principal diagnosis unrelated to described skilled interventions. It fails due to logic mismatch.', formHotspotIds: ['diagnosis'], visualization: { type: 'auditLens', prompt: 'Audit Lens: choose principal diagnosis logic', options: ['Most chronic diagnosis', 'Diagnosis most directly driving current skilled care'] }, knowledgeCheck: { question: 'What should principal diagnosis represent?', options: ['Most common chronic condition', 'Dominant reason for current skilled services', 'Any billable diagnosis'], correctAnswer: 'Dominant reason for current skilled services', rationale: 'Principal diagnosis must mirror actual skilled-care driver.' } }),
  makeCard({ id: 'dx-icd-oasis', section: 'field', title: 'Diagnoses 2: ICD-10 sequencing + OASIS linkage (M1021/M1023 concept)', objective: 'Align diagnosis sequencing with OASIS diagnostic profile and care narrative.', coreContent: ['Diagnosis sequencing should be coherent with OASIS diagnosis concepts and severity context.', 'OASIS findings and plan diagnoses should reinforce one another.', 'Inconsistent sequencing and narrative signal chart unreliability.', 'Use QA crosswalk to verify diagnosis alignment early.', 'Document rationale for sequencing decisions in complex cases.'], practicalExample: 'Compliant language: “OASIS diagnosis profile and plan sequencing support the same clinical priority.” It works because source documents agree.', redFlag: 'Reviewer view: OASIS and plan show divergent diagnosis priorities. It fails due to cross-document conflict.', formHotspotIds: ['diagnosis'], visualization: { type: 'decisionTree', prompt: 'OASIS and plan diagnosis priorities differ. Best action?', options: ['Submit anyway', 'Reconcile sequencing and update', 'Ignore OASIS linkage'] }, knowledgeCheck: { question: 'Why does OASIS linkage matter for diagnoses?', options: ['Formatting only', 'It supports cross-document consistency', 'It is optional for review'], correctAnswer: 'It supports cross-document consistency', rationale: 'Consistency is central to defensible diagnosis strategy.' } }),
  makeCard({ id: 'pdgm-impact', section: 'field', title: 'PDGM impact: why principal dx mismatch triggers review', objective: 'Connect principal diagnosis alignment to payment grouping and review risk.', coreContent: ['Principal diagnosis influences payment grouping logic under PDGM framework.', 'Mismatch between coded principal and care narrative attracts review attention.', 'Grouping issues can create both overpayment and underpayment risk.', 'Clinical notes should visibly justify principal diagnosis selection.', 'QA should compare principal diagnosis against active skilled interventions.'], practicalExample: 'Compliant language: “Principal diagnosis selection reflects active skilled interventions and documented instability.” It works by linking coding to care.', redFlag: 'Reviewer view: coding indicates one condition while visits focus another. It fails due to grouping and necessity inconsistency.', visualization: { type: 'microSim', prompt: 'Principal diagnosis conflicts with visit focus. Most defensible next step?', options: ['Proceed billing', 'Reconcile coding to documented care', 'Suppress visit detail'] }, knowledgeCheck: { question: 'What does principal diagnosis mismatch increase?', options: ['Theme flexibility', 'Medical review risk', 'Staffing efficiency'], correctAnswer: 'Medical review risk', rationale: 'Mismatch is a common review trigger.' } }),
  makeCard({ id: 'disciplines-specific', section: 'field', title: 'Disciplines ordered: SN/PT/OT/SLP/MSW/HHA – what “specific” looks like', objective: 'Write discipline orders with clear role scope and measurable purpose.', coreContent: ['Each discipline order should describe why that discipline is required now.', 'Orders should avoid generic multi-discipline language without role clarity.', 'Discipline scope should map to care plan goals and interventions.', 'Specificity improves team coordination and reviewer confidence.', 'Unclear discipline purpose weakens necessity trace.'], practicalExample: 'Compliant language: “PT 2w3 for transfer safety progression with measurable mobility target.” It works by linking discipline, frequency, and outcome.', redFlag: 'Reviewer view: discipline listed with no purpose or expected outcome. It fails due to role ambiguity.', formHotspotIds: ['orders-frequency'], visualization: { type: 'templateBuilder', prompt: 'Build specific discipline order', chips: ['Discipline', 'Frequency', 'Skilled purpose', 'Outcome target'] }, knowledgeCheck: { question: 'What makes a discipline order specific?', options: ['Discipline name only', 'Discipline + frequency + purpose + measurable intent', 'Any checklist mark'], correctAnswer: 'Discipline + frequency + purpose + measurable intent', rationale: 'Specificity requires actionable and evaluable detail.' } }),
  makeCard({ id: 'frequency-justification', section: 'field', title: 'Frequency/duration justification: “why this many visits?”', objective: 'Justify visit intensity using risk trajectory and expected response timeline.', coreContent: ['Frequency should match instability level and skilled intervention cadence.', 'Duration planning should reflect expected trend and reassessment milestones.', 'Use explicit rationale to explain why fewer visits are not yet safe.', 'Document planned de-escalation criteria when risk improves.', 'Visit intensity should evolve with measurable progress.',], practicalExample: 'Compliant language: “2w2 then 1w4 based on infection-risk trajectory and caregiver skill progression.” It works because intensity is justified by trend.', redFlag: 'Reviewer view: fixed high frequency with no rationale update despite stability. It fails due to unsupported intensity.', formHotspotIds: ['orders-frequency'], visualization: { type: 'decisionTree', prompt: 'Condition stabilizes earlier than expected. What should frequency logic do?', options: ['Keep same indefinitely', 'Reassess and adjust with rationale', 'Delete rationale'] }, knowledgeCheck: { question: 'Best frequency justification includes:', options: ['Only count of visits', 'Risk trajectory and expected response timeline', 'Clinic preference only'], correctAnswer: 'Risk trajectory and expected response timeline', rationale: 'Justification must explain clinical need for intensity.' } }),
  makeCard({ id: 'functional-activities', section: 'field', title: 'Functional limitations + activities permitted (must match assessment reality)', objective: 'Align functional restrictions and permitted activities with actual assessed status.', coreContent: ['Functional limits should mirror assessed capability and safety risks.', 'Permitted activities should be realistic and clinically justified.', 'Contradictions between assessment and plan undermine credibility.', 'Update functional instructions when condition changes.', 'Use caregiver guidance language tied to safety needs.',], practicalExample: 'Compliant language: “Requires SBA for transfers and walker for ambulation; no unsupervised stairs.” It works because instructions follow assessed risk.', redFlag: 'Reviewer view: “Independent mobility” in plan but repeated near-fall notes in visits. It fails due to contradiction.', formHotspotIds: ['functional-safety'], visualization: { type: 'goodBad', prompt: 'Functional plan consistency', goodExample: 'Plan language reflects current assessed deficits and safety supports.', badExample: 'Permitted activities contradict assessment findings.' }, knowledgeCheck: { question: 'What must functional/activities fields reflect?', options: ['Template defaults', 'Assessment reality and safety needs', 'Patient preference only'], correctAnswer: 'Assessment reality and safety needs', rationale: 'Functional directives must match actual patient status.' } }),
  makeCard({ id: 'meds-poc', section: 'field', title: 'Medications on POC + skilled med teaching/monitoring (what reviewers want)', objective: 'Document medication plan with skilled monitoring rationale and teaching response.', coreContent: ['Medication lists should align with active regimen and care risks.', 'Skilled med teaching should include barrier, intervention, and response evidence.', 'Monitoring rationale should indicate what skilled judgment is required.', 'Changes in regimen should trigger updated teaching and provider communication trace.', 'Avoid generic “med education done” without patient response details.',], practicalExample: 'Compliant language: “New anticoagulant taught with bleed-risk thresholds and teach-back verification.” It works because risk and response are documented.', redFlag: 'Reviewer view: medication teaching statement with no content or response evidence. It fails due to unsupported skill claim.', formHotspotIds: ['meds-treatments'], visualization: { type: 'microSim', prompt: 'Patient starts high-risk med and shows confusion. Best documentation focus?', options: ['Routine teaching complete', 'Barrier-specific teaching + response + escalation thresholds', 'No update needed'] }, knowledgeCheck: { question: 'Strong med-teaching documentation includes:', options: ['Only education performed', 'Teaching content + barrier + patient response', 'Medication name only'], correctAnswer: 'Teaching content + barrier + patient response', rationale: 'Reviewers look for skilled teaching impact evidence.' } }),
  makeCard({ id: 'treatments-skilled', section: 'field', title: 'Treatments/procedures: wounds/devices (skilled vs task-only)', objective: 'Differentiate skilled procedural management from routine task completion wording.', coreContent: ['Treatment notes should show assessment, interpretation, and escalation logic.', 'Wound/device care needs objective trend data tied to interventions.', 'Task-only wording weakens necessity support for ongoing skilled visits.', 'Escalation criteria should be explicit and consistently applied.', 'Plan updates should follow significant treatment-response changes.',], practicalExample: 'Compliant language: “Skilled wound assessment found increased drainage/erythema; provider notified; regimen updated.” It works because it shows decision and response.', redFlag: 'Reviewer view: repetitive “dressing changed” without assessment findings. It fails due to task-only charting.', formHotspotIds: ['meds-treatments'], visualization: { type: 'auditLens', prompt: 'Which treatment note demonstrates skilled management?', options: ['Dressing changed', 'Findings interpreted, risk escalated, regimen adjusted'] }, knowledgeCheck: { question: 'What distinguishes skilled treatment documentation?', options: ['Procedure mention only', 'Assessment + decision + action trail', 'Visit duration only'], correctAnswer: 'Assessment + decision + action trail', rationale: 'Skilled necessity requires clinical judgment evidence.' } }),
  makeCard({ id: 'safety-readmission', section: 'field', title: 'Safety measures + ED/readmission risk + interventions (required)', objective: 'Document safety and readmission risk controls as active plan components.', coreContent: ['Plan must identify key safety risks and targeted interventions.', 'Readmission-risk mitigation should be specific and measurable.', 'Interventions should align with condition-specific risk profile.', 'Caregiver/patient education should include action thresholds.', 'Track whether risk interventions reduce adverse-event likelihood.',], practicalExample: 'Compliant language: “Readmission-risk plan includes symptom triggers, same-day call workflow, and caregiver action script.” It works by operationalizing safety response.', redFlag: 'Reviewer view: “Fall precautions” listed with no intervention detail. It fails due to non-actionable risk planning.', formHotspotIds: ['functional-safety'], visualization: { type: 'decisionTree', prompt: 'High readmission risk identified. Most defensible plan action?', options: ['Generic caution note', 'Specific interventions with trigger thresholds', 'No update if stable today'] }, knowledgeCheck: { question: 'What makes risk interventions defensible?', options: ['General caution language', 'Specific actions tied to identified risk', 'No measurable follow-up'], correctAnswer: 'Specific actions tied to identified risk', rationale: 'Risk controls must be actionable and traceable.' } }),
  makeCard({ id: 'goals-rehab-discharge', section: 'field', title: 'Goals/outcomes + rehab potential + discharge plan (measurable goals formula)', objective: 'Write measurable goals and discharge criteria that reflect realistic rehab potential.', coreContent: ['Goals should include metric, timeframe, and safety threshold.', 'Rehab potential should be individualized and evidence-based.', 'Discharge criteria should define readiness and skill transfer expectations.', 'Goal progression should be reassessed and updated with trend evidence.', 'Avoid static goals that ignore condition changes.',], practicalExample: 'Compliant language: “Patient completes transfer with SBA and no loss of balance for 14 days.” It works due to measurable target and timeframe.', redFlag: 'Reviewer view: “Improve mobility” with no metric or timeline. It fails because progress is non-evaluable.', formHotspotIds: ['goals-discharge'], visualization: { type: 'goodBad', prompt: 'Measurable vs vague goals', goodExample: 'Metric + timeframe + safety threshold', badExample: 'General improvement statement' }, knowledgeCheck: { question: 'What is the measurable goal formula?', options: ['Goal verb only', 'Metric + timeframe + safety threshold', 'Diagnosis + signature'], correctAnswer: 'Metric + timeframe + safety threshold', rationale: 'Measurable goals require objective definition.' } }),
  makeCard({ id: 'advance-directives', section: 'field', title: 'Advance directives documentation expectations + where it appears', objective: 'Ensure advance-directive status is documented, visible, and consistent across chart locations.', coreContent: ['Advance-directive status should be recorded and easy to locate in record.', 'POC references should align with primary chart directive documentation.', 'If directive status changes, update plan and communication notes promptly.', 'Care team should understand where directive detail is stored.', 'Omission or mismatch can create care and compliance risk.',], practicalExample: 'Compliant language: “Advance-directive status reviewed, documented, and linked in care record references.” It works due to visibility and consistency.', redFlag: 'Reviewer view: directive noted in one location but absent/contradicted in plan. It fails due to record inconsistency.', visualization: { type: 'auditLens', prompt: 'Audit Lens: what is required for directive defensibility?', options: ['Mention once', 'Document status and maintain cross-record consistency'] }, knowledgeCheck: { question: 'Best advance-directive practice is:', options: ['Optional mention', 'Visible and consistent documentation across chart', 'Verbal only'], correctAnswer: 'Visible and consistent documentation across chart', rationale: 'Directive documentation must be traceable and coherent.' } }),

  // SECTION 5 (8)
  makeCard({ id: 'skilled-vs-custodial', section: 'medical', title: 'Skilled vs custodial (reviewer lens)', objective: 'Differentiate skilled service rationale from custodial support tasks.', coreContent: ['Skilled care requires clinical judgment and potential treatment-impact decisions.', 'Custodial tasks alone do not establish skilled necessity.', 'Reviewers look for decision-making evidence, not activity lists.', 'Document why clinician-level skill was required for that encounter.', 'Tie interventions to risk and expected outcomes.',], practicalExample: 'Compliant language: “Skilled assessment changed treatment plan based on objective decline.” It works by showing care-impact judgment.', redFlag: 'Reviewer view: ADL support documented as primary skilled justification. It fails due to custodial framing.', visualization: { type: 'goodBad', prompt: 'Skilled vs custodial wording', goodExample: 'Clinical interpretation and action.', badExample: 'Task completion only.' }, knowledgeCheck: { question: 'What best signals skilled service?', options: ['Task list', 'Clinical decision that affects treatment', 'Visit length'], correctAnswer: 'Clinical decision that affects treatment', rationale: 'Skilled necessity depends on professional judgment impact.' } }),
  makeCard({ id: 'sn-observation', section: 'medical', title: 'SN: Observation/assessment that can change treatment (decision hinge)', objective: 'Document SN observation in a way that shows treatment-impact potential.', coreContent: ['Observation is skilled when findings can alter treatment decisions.', 'State what deterioration signals are being monitored and why.', 'Document thresholds and actions taken when signs appear.', 'Capture provider communication and regimen changes clearly.', 'Avoid “monitoring only” language without decision hinge.',], practicalExample: 'Compliant language: “Observed edema trend crossing threshold; provider notified; diuretic plan adjusted.” It works because observation changed treatment.', redFlag: 'Reviewer view: repeated stable checks without treatment impact narrative. It fails due to weak skilled rationale.', visualization: { type: 'decisionTree', prompt: 'Observation reveals new deterioration signal. Next action?', options: ['Note and continue routine', 'Escalate and adjust plan', 'Ignore if vitals within range'] }, knowledgeCheck: { question: 'What is the decision hinge concept?', options: ['Any observation', 'Observation with potential to change treatment', 'Only end-of-episode review'], correctAnswer: 'Observation with potential to change treatment', rationale: 'Skilled observation must have treatment relevance.' } }),
  makeCard({ id: 'sn-teaching', section: 'medical', title: 'SN: Teaching/training vs reinforcement + teach-back documentation', objective: 'Show when teaching is skilled and how teach-back proves learning response.', coreContent: ['Document baseline barrier and why skilled teaching is necessary now.', 'Teach-back should capture understanding quality and remaining gaps.', 'Reinforcement should state why prior teaching was insufficient or changed.', 'Education notes should link to risk reduction and action thresholds.', 'Avoid generic teaching statements without response evidence.',], practicalExample: 'Compliant language: “Teach-back improved from incorrect to accurate trigger response after demonstration.” It works by documenting learning impact.', redFlag: 'Reviewer view: “Education provided” with no learner response. It fails because skilled teaching effect is unproven.', visualization: { type: 'microSim', prompt: 'Patient repeats incorrect med safety response. Best note update?', options: ['Education done', 'Barrier + reteach + teach-back outcome', 'No change needed'] }, knowledgeCheck: { question: 'What strengthens teaching documentation most?', options: ['Handout provided', 'Teach-back response evidence', 'Template phrase only'], correctAnswer: 'Teach-back response evidence', rationale: 'Teach-back demonstrates skilled education effectiveness.' } }),
  makeCard({ id: 'sn-careplan-management', section: 'medical', title: 'SN: Care plan management + provider communication + POC revision', objective: 'Document nursing care-plan management actions that maintain plan accuracy and safety.', coreContent: ['Care-plan management requires reassessment and communication when goals are off-track.', 'Provider communication should include reason, recommendation, and outcome.', 'POC revisions should be timestamped and clinically justified.', 'Document why change was needed and what changed in practice.', 'Link revised plan to subsequent visit actions.',], practicalExample: 'Compliant language: “Provider notified of non-response trend; order revised and plan updated same day.” It works because management actions are explicit.', redFlag: 'Reviewer view: condition drift documented with no communication or revision trail. It fails due to unmanaged care-plan risk.', visualization: { type: 'auditLens', prompt: 'Which line proves care-plan management?', options: ['Continue as ordered', 'Notified provider, revised orders, updated plan, monitored response'] }, knowledgeCheck: { question: 'What should follow persistent non-response to current plan?', options: ['No change', 'Provider communication and plan revision', 'Discharge note only'], correctAnswer: 'Provider communication and plan revision', rationale: 'Care-plan management is active, not passive.', } }),
  makeCard({ id: 'skilled-to-nonskilled', section: 'medical', title: 'When skilled becomes non-skilled: discharge readiness vs continued skilled', objective: 'Determine when continued skilled services remain justified versus discharge readiness.', coreContent: ['Reassess whether ongoing needs still require skilled clinician judgment.', 'Document continued skilled rationale when complexity/risk remains high.', 'If goals achieved and risk reduced, transition toward discharge plan.', 'Avoid prolonged skilled episodes without updated necessity evidence.', 'Use objective trend criteria for continuation versus discharge.',], practicalExample: 'Compliant language: “Skilled need continues due to unresolved high-risk med titration requiring RN interpretation.” It works by specifying continuing complexity.', redFlag: 'Reviewer view: indefinite continuation with stable findings and no updated rationale. It fails due to unsupported continuation.', visualization: { type: 'decisionTree', prompt: 'Condition stable and goals met. Best next step?', options: ['Continue same skilled intensity', 'Initiate discharge readiness transition', 'Restart goals without reason'] }, knowledgeCheck: { question: 'What supports continued skilled services?', options: ['Habit', 'Current documented complexity requiring skilled judgment', 'Episode age only'], correctAnswer: 'Current documented complexity requiring skilled judgment', rationale: 'Continuation must be evidence-based.', } }),
  makeCard({ id: 'therapy-restorative-maintenance', section: 'medical', title: 'Therapy: restorative vs maintenance (how to justify maintenance)', objective: 'Differentiate restorative and maintenance therapy rationale in defensible language.', coreContent: ['Restorative therapy targets measurable improvement over defined period.', 'Maintenance therapy can be skilled when complexity requires therapist-level judgment.', 'Documentation should explain why non-skilled maintenance is insufficient.', 'Goals should reflect either improvement or prevention of decline with rationale.', 'Re-evaluate periodically to confirm continued skilled need.',], practicalExample: 'Compliant language: “Maintenance therapy required to prevent decline due to complex balance deficits requiring therapist adjustments.” It works by showing skilled complexity.', redFlag: 'Reviewer view: “Maintenance only” with no complexity explanation. It fails due to unsupported skilled requirement.', visualization: { type: 'goodBad', prompt: 'Maintenance justification quality', goodExample: 'Complexity + therapist judgment + decline prevention rationale.', badExample: 'Maintenance label only.' }, knowledgeCheck: { question: 'When is maintenance therapy still skilled?', options: ['Never', 'When complexity requires therapist-level judgment', 'Only if patient requests'], correctAnswer: 'When complexity requires therapist-level judgment', rationale: 'Skilled maintenance must show complexity and need for professional judgment.', } }),
  makeCard({ id: 'homebound-two-prong', section: 'medical', title: 'Homebound two-prong test (what counts as leaving home)', objective: 'Apply the homebound two-prong framework using objective functional and effort detail.', coreContent: ['Homebound is not absolute confinement; evaluate assistance needs and taxing effort.', 'Document devices/assistance and physiologic burden during departures.', 'Leaving home for necessary care can still fit homebound criteria when burden remains high.', 'Narrative should include frequency and context of departures.', 'Avoid formula phrases without objective support.',], practicalExample: 'Compliant language: “Requires walker + caregiver assist; leaves for medical appointments only; marked dyspnea after short ambulation.” It works through objective burden detail.', redFlag: 'Reviewer view: “Homebound, taxing effort” with no evidence. It fails due to conclusory language.', visualization: { type: 'templateBuilder', prompt: 'Build strong homebound statement', chips: ['Assistance/device', 'Effort burden', 'Departure frequency/context'] }, knowledgeCheck: { question: 'Strong homebound documentation includes:', options: ['Template phrase only', 'Functional barrier + effort + leaving-home pattern', 'Diagnosis label only'], correctAnswer: 'Functional barrier + effort + leaving-home pattern', rationale: 'Homebound defensibility depends on objective specifics.', } }),
  makeCard({ id: 'homebound-strong-weak', section: 'medical', title: 'Homebound documentation: strong vs weak examples + common denials', objective: 'Contrast strong and weak homebound narratives and predict denial risk.', coreContent: ['Strong examples include concrete mobility/safety limits and departure burden evidence.', 'Weak examples are generic, repetitive, and unsupported by visit findings.', 'Denials often follow internal contradictions between homebound statement and note behavior.', 'Align homebound narrative with assessment and visit trend data.', 'Update homebound details when function changes.',], practicalExample: 'Compliant language: “Needs one-person assist for stairs; leaves home infrequently for physician visits; recovers after dyspnea episodes.” It works because findings are concrete.', redFlag: 'Reviewer view: note says frequent independent outings while plan says homebound. It fails due to contradiction.', visualization: { type: 'goodBad', prompt: 'Strong vs weak homebound statement', goodExample: 'Concrete function + burden + frequency details.', badExample: '“Homebound due to condition.”' }, knowledgeCheck: { question: 'What commonly causes homebound denial?', options: ['Specific objective details', 'Generic/contradictory homebound statements', 'Caregiver training notes'], correctAnswer: 'Generic/contradictory homebound statements', rationale: 'Contradictions and vague language are high-risk denial drivers.', } }),

  // SECTION 6 (10)
  makeCard({ id: 'alignment-crosswalk', section: 'alignment', title: 'OASIS ↔ POC ↔ Visit Notes: same story alignment + quick crosswalk', objective: 'Use crosswalk checks to keep assessment, plan, and visit evidence synchronized.', coreContent: ['Any major assessed risk should appear in POC interventions and visit follow-through.', 'Diagnosis and function narrative should be coherent across all artifacts.', 'Crosswalk checks at SOC and recert catch drift early.', 'Alignment supports both survey and payment defensibility.', 'Use crosswalk as recurring QA habit, not one-time task.',], practicalExample: 'Compliant language: “OASIS fall risk aligns with POC safety interventions and visit reassessment updates.” It works because each document validates the same risk plan.', redFlag: 'Reviewer view: OASIS risk appears with no POC intervention or visit follow-up. It fails due to broken care trace.', formHotspotIds: ['diagnosis', 'functional-safety', 'goals-discharge'], visualization: { type: 'decisionTree', prompt: 'Crosswalk shows missing intervention for assessed risk. Next step?', options: ['Ignore until recert', 'Update plan and document follow-through', 'Hide risk detail'] }, knowledgeCheck: { question: 'What is the purpose of the crosswalk?', options: ['Formatting consistency', 'Clinical and documentation storyline consistency', 'Faster signatures'], correctAnswer: 'Clinical and documentation storyline consistency', rationale: 'Crosswalk prevents documentation drift across key records.', } }),
  makeCard({ id: 'survey-deficiencies', section: 'alignment', title: 'Common survey deficiencies: how POC defects become citations', objective: 'Recognize survey-deficiency patterns and prevent repeat citation pathways.', coreContent: ['Missing required plan elements can become direct deficiency findings.', 'Contradictory records weaken confidence in quality-system reliability.', 'Repeated control failures suggest systemic oversight issues.', 'Surveyors trace risk identification to intervention delivery evidence.', 'Corrective actions should be measurable and re-audited.',], practicalExample: 'Compliant language: “Deficiency trend addressed with targeted retraining, re-audit, and sustained metric improvement.” It works because correction is evidenced.', redFlag: 'Reviewer view: same defect repeated across charts with no process change. It fails as systemic noncompliance.', visualization: { type: 'auditLens', prompt: 'Audit Lens: which response is survey-ready?', options: ['Noted issue', 'Root cause, corrective action, re-audit evidence'] }, knowledgeCheck: { question: 'What turns isolated defects into bigger risk?', options: ['Single typo', 'Repeated defects without corrective controls', 'Detailed education notes'], correctAnswer: 'Repeated defects without corrective controls', rationale: 'Systemic patterns elevate compliance risk.', } }),
  makeCard({ id: 'defensibility-framework', section: 'alignment', title: 'Defensibility framework: Condition + Risk + Skilled Intervention + Response (template)', objective: 'Apply the CRSR framework to produce high-clarity, audit-defensible notes.', coreContent: ['Condition states current clinical status and context.', 'Risk explains why adverse outcome is plausible without intervention.', 'Skilled intervention details clinician-level action and judgment.', 'Response captures effect, communication, and plan next step.', 'CRSR turns vague notes into review-ready causal narratives.',], practicalExample: 'Compliant language: “Condition worsening edema; risk fluid overload; skilled RN escalated; provider adjusted regimen; response monitored.” It works by complete causal chain.', redFlag: 'Reviewer view: isolated tasks with no risk or response linkage. It fails due to fragmented reasoning.', visualization: { type: 'templateBuilder', prompt: 'Build a CRSR sentence', chips: ['Condition', 'Risk', 'Skilled Intervention', 'Response'] }, knowledgeCheck: { question: 'What does CRSR add most?', options: ['Longer notes', 'Causal clarity and defensibility', 'More abbreviations'], correctAnswer: 'Causal clarity and defensibility', rationale: 'CRSR improves reviewer comprehension of necessity and action.', } }),
  makeCard({ id: 'strong-vs-weak-phrases', section: 'alignment', title: 'Strong vs weak phrases: what to write / avoid', objective: 'Replace weak generic phrases with strong evidence-based clinical language.', coreContent: ['Strong phrases include objective findings, risk logic, and skilled action.', 'Weak phrases are generic and disconnected from measurable impact.', 'Phrase quality affects reviewer confidence in necessity claims.', 'Use concise, specific language tied to patient condition.', 'Avoid repeated placeholder wording across visits.',], practicalExample: 'Compliant language: “Skilled reassessment found new orthostatic drop; safety plan revised.” It works because findings and action are explicit.', redFlag: 'Reviewer view: “Patient stable, continue plan” repeated despite changing findings. It fails due to contradiction and vagueness.', visualization: { type: 'goodBad', prompt: 'Phrase quality compare', goodExample: 'Objective finding + action + rationale.', badExample: 'Generic status phrase without support.' }, knowledgeCheck: { question: 'What is a weak phrase pattern?', options: ['Specific trend + action', 'Generic repeated status line', 'Teach-back result detail'], correctAnswer: 'Generic repeated status line', rationale: 'Weak phrases hide clinical meaning and increase review risk.', } }),
  makeCard({ id: 'copy-paste-risk', section: 'alignment', title: 'Copy/paste and internal contradictions: how it flags auditors', objective: 'Identify and prevent copy/paste patterns that create contradictory documentation.', coreContent: ['Copy/paste can create stale findings that contradict current visit data.', 'Repeated identical language across changing conditions is a review trigger.', 'Contradictions reduce chart credibility and increase audit scrutiny.', 'Require per-visit updates to findings, response, and plan status.', 'Use QA checks to detect repeated static language patterns.',], practicalExample: 'Compliant language: “Updated today’s findings and revised plan rationale from prior visit baseline.” It works by showing current, individualized content.', redFlag: 'Reviewer view: identical multi-visit text despite condition changes. It fails due to documentation reliability concern.', visualization: { type: 'microSim', prompt: 'You detect repeated stale phrase in updated chart. Best step?', options: ['Leave unchanged', 'Correct to current findings and document update', 'Delete entire section'] }, knowledgeCheck: { question: 'Why is copy/paste risky in audits?', options: ['Saves too much time', 'Can create contradictions and stale evidence', 'Uses too many bullets'], correctAnswer: 'Can create contradictions and stale evidence', rationale: 'Reliability concerns quickly increase audit risk.', } }),
  makeCard({ id: 'case-chf', section: 'alignment', title: 'Case study: CHF (auditor highlight mode)', objective: 'Apply audit-lens documentation to CHF risk monitoring and escalation.', coreContent: ['Track edema, dyspnea, weight trends, and treatment-response thresholds.', 'Document skilled assessment decisions and provider communication timing.', 'Align plan interventions to readmission-risk mitigation.', 'Use measurable goals for symptom control and safety.', 'Show why visit intensity is clinically justified.',], practicalExample: 'Compliant language: “Weight gain + edema triggered same-day provider call and med adjustment; follow-up trend improved.” It works through clear decision-action-response chain.', redFlag: 'Reviewer view: CHF monitoring documented without threshold action or provider communication. It fails due to weak management evidence.', visualization: { type: 'microSim', prompt: 'CHF case: weight +2 lb in 24h with edema. Best next action?', options: ['Routine note only', 'Escalate to provider and update plan', 'Wait for next week'] }, knowledgeCheck: { question: 'What is key in CHF audit-lens charting?', options: ['General stability statement', 'Threshold-driven action documentation', 'Only diagnosis restatement'], correctAnswer: 'Threshold-driven action documentation', rationale: 'CHF defensibility depends on trend-triggered management actions.', } }),
  makeCard({ id: 'case-wound', section: 'alignment', title: 'Case study: Wound/Infection (auditor highlight mode)', objective: 'Document wound/infection management using objective trend and escalation logic.', coreContent: ['Track wound metrics and infection signs consistently across visits.', 'Document skilled intervention changes based on findings.', 'Escalation criteria should be explicit and evidence-driven.', 'Align orders with current wound risk state.', 'Show progress or rationale for adjusted plan intensity.',], practicalExample: 'Compliant language: “Increased drainage and erythema prompted provider notification and regimen update.” It works by tying findings to action.', redFlag: 'Reviewer view: repetitive wound-care task notes without trend interpretation. It fails due to task-only framing.', visualization: { type: 'auditLens', prompt: 'What note best reflects skilled wound management?', options: ['Dressing changed', 'Findings interpreted, provider notified, regimen updated'] }, knowledgeCheck: { question: 'What strengthens wound documentation most?', options: ['Procedure list only', 'Objective trend + escalation action', 'Lengthy narrative without data'], correctAnswer: 'Objective trend + escalation action', rationale: 'Skilled wound justification needs measurable findings and decisions.', } }),
  makeCard({ id: 'case-copd', section: 'alignment', title: 'Case study: COPD/O2 (auditor highlight mode)', objective: 'Apply COPD/O2 risk logic to homebound support and skilled intervention evidence.', coreContent: ['Document respiratory trend findings tied to intervention decisions.', 'Include oxygen safety and exertional burden education response.', 'Homebound detail should align with dyspnea burden evidence.', 'Escalate symptom progression using threshold-based plan actions.', 'Update goals and visit intensity as respiratory status shifts.',], practicalExample: 'Compliant language: “Exertional dyspnea increase triggered provider communication and revised respiratory action thresholds.” It works by linking trend to action.', redFlag: 'Reviewer view: oxygen use noted without safety counseling or symptom-action thresholds. It fails due to incomplete risk management.', visualization: { type: 'decisionTree', prompt: 'COPD/O2 symptoms increase from baseline. Most defensible response?', options: ['Continue unchanged', 'Escalate and revise respiratory plan', 'Only extend note length'] }, knowledgeCheck: { question: 'COPD/O2 charting should emphasize:', options: ['General condition label', 'Trend, safety response, and action thresholds', 'Only device presence'], correctAnswer: 'Trend, safety response, and action thresholds', rationale: 'Respiratory defensibility depends on actionable trend management.', } }),
  makeCard({ id: 'case-diabetes-falls', section: 'alignment', title: 'Case study: Diabetes/Falls/Insulin change (auditor highlight mode)', objective: 'Document diabetes/falls risk management with med-change teaching and safety outcomes.', coreContent: ['Link insulin changes to skilled teaching and hypoglycemia risk controls.', 'Document falls risk interventions and caregiver response.', 'Use teach-back results to demonstrate learning progression.', 'Align plan goals with safety and medication competency outcomes.', 'Escalate unresolved risks promptly to provider.',], practicalExample: 'Compliant language: “Insulin regimen change taught with teach-back; caregiver demonstrated threshold response protocol.” It works through competency evidence.', redFlag: 'Reviewer view: med change documented without teaching response or safety follow-up. It fails due to unsupported skilled education.', visualization: { type: 'templateBuilder', prompt: 'Build compliant diabetes-risk phrase', chips: ['New insulin change', 'Teach-back response', 'Falls safety action threshold'] }, knowledgeCheck: { question: 'What is essential after insulin change?', options: ['Medication list update only', 'Skilled teaching with response evidence', 'No additional documentation'], correctAnswer: 'Skilled teaching with response evidence', rationale: 'Regimen-change risk requires documented skilled education impact.', } }),
  makeCard({ id: 'case-dementia', section: 'alignment', title: 'Case study: Dementia/Safety (auditor highlight mode)', objective: 'Apply dementia safety documentation with caregiver workflow and measurable outcomes.', coreContent: ['Document cognitive/safety risks and supervision requirements clearly.', 'Use caregiver training and response data as core evidence.', 'Plan interventions should target wandering, medication, and hazard risks.', 'Goals should be measurable around safety behaviors and support reliability.', 'Escalate condition-change behaviors with provider communication trace.',], practicalExample: 'Compliant language: “Caregiver trained on wandering-risk response protocol with demonstrated teach-back accuracy.” It works because safety intervention is operationalized.', redFlag: 'Reviewer view: general supervision language without risk-specific interventions. It fails due to vague safety planning.', visualization: { type: 'microSim', prompt: 'New wandering behavior appears. Best immediate documentation action?', options: ['Generic safety note', 'Risk-specific intervention + caregiver response + provider notify', 'No update until recert'] }, knowledgeCheck: { question: 'What is key in dementia safety documentation?', options: ['Generic monitoring', 'Risk-specific caregiver intervention evidence', 'Only diagnosis mention'], correctAnswer: 'Risk-specific caregiver intervention evidence', rationale: 'Dementia safety defensibility requires specific risk-control actions.', } }),

  // SECTION 7 pre-bill checklist as learning card #46
  makeCard({ id: 'prebill-self-check', section: 'alignment', title: 'Pre-bill self-check checklist (interactive)', objective: 'Run a final pre-bill checklist that confirms readiness across signatures, alignment, and skilled evidence.', coreContent: ['Confirm required signatures/VO authentication are complete.', 'Confirm OASIS/POC/visit storyline alignment.', 'Confirm homebound and skilled rationale are current and specific.', 'Confirm measurable goals and progress evidence are present.', 'Hold billing when any high-risk item is unresolved.',], practicalExample: 'Compliant language: “Pre-bill checklist complete; unresolved items none; claim released per hard-stop control.” It works by documenting final readiness gate.', redFlag: 'Reviewer view: checklist bypassed despite unresolved signature mismatch. It fails as control bypass.', visualization: { type: 'decisionTree', prompt: 'One high-risk checklist item remains unresolved. Next step?', options: ['Release claim', 'Maintain hold and escalate', 'Ignore if prior period passed'] }, knowledgeCheck: { question: 'What should happen when pre-bill checklist finds unresolved high-risk defect?', options: ['Proceed and add note', 'Hold and escalate', 'Delete defect entry'], correctAnswer: 'Hold and escalate', rationale: 'Checklist is a release control, not documentation decoration.', } }),
]

export const finalExamQuestions = [
  { id: 'q1', cardId: 'course-overview', question: 'The course standard is best described as:', options: ['CMS-aligned / CoP-compliant / audit-ready', 'Official CMS certification', 'Template formatting course'], correctAnswer: 'CMS-aligned / CoP-compliant / audit-ready' },
  { id: 'q2', cardId: 'trace-model', question: 'One Story Rule means:', options: ['Any one document may differ', 'FTF/assessment/POC/visits/claim must align', 'Only POC matters'], correctAnswer: 'FTF/assessment/POC/visits/claim must align' },
  { id: 'q3', cardId: 'format-not-requirement', question: 'CMS-485 is:', options: ['Required form only', 'A format option; requirements are content-based', 'Optional for all claims'], correctAnswer: 'A format option; requirements are content-based' },
  { id: 'q4', cardId: 'coverage-vs-cops', question: 'Coverage rules primarily impact:', options: ['Payment eligibility', 'Branding', 'Chart colors'], correctAnswer: 'Payment eligibility' },
  { id: 'q5', cardId: 'plan-required-elements', question: 'A required element is complete when:', options: ['Not blank', 'Present and linked to patient-specific evidence', 'Mentioned in old note'], correctAnswer: 'Present and linked to patient-specific evidence' },
  { id: 'q6', cardId: 'cert-recert-timeline', question: 'Certification period is:', options: ['30 days', '60 days', '90 days'], correctAnswer: '60 days' },
  { id: 'q7', cardId: 'ftf-requirements', question: 'FTF mismatch with plan/notes increases:', options: ['UI complexity', 'Medical necessity risk', 'Team morale only'], correctAnswer: 'Medical necessity risk' },
  { id: 'q8', cardId: 'who-can-sign-order', question: 'Best signer control is:', options: ['Signature image only', 'Eligibility/enrollment verification evidence', 'Annual reminder only'], correctAnswer: 'Eligibility/enrollment verification evidence' },
  { id: 'q9', cardId: 'signature-hard-stop', question: 'Hard stop means:', options: ['Warn only', 'Block billing until required signatures complete', 'Review after payment'], correctAnswer: 'Block billing until required signatures complete' },
  { id: 'q10', cardId: 'prn-orders', question: 'Compliant PRN includes:', options: ['PRN wording only', 'Trigger and limit', 'No written details'], correctAnswer: 'Trigger and limit' },
  { id: 'q11', cardId: 'vo-elements', question: 'VO documentation must include:', options: ['General summary', 'Date/time, receiver, exact order text', 'Only initials'], correctAnswer: 'Date/time, receiver, exact order text' },
  { id: 'q12', cardId: 'field-identifiers', question: 'Highest immediate field risk:', options: ['Date mismatch', 'Bullet style', 'Spacing'], correctAnswer: 'Date mismatch' },
  { id: 'q13', cardId: 'dx-principal-secondary', question: 'Principal diagnosis should reflect:', options: ['Most chronic code', 'Dominant skilled-care driver', 'Any paid code'], correctAnswer: 'Dominant skilled-care driver' },
  { id: 'q14', cardId: 'frequency-justification', question: 'Frequency rationale should include:', options: ['Visit count only', 'Risk trajectory and response timeline', 'Provider preference'], correctAnswer: 'Risk trajectory and response timeline' },
  { id: 'q15', cardId: 'meds-poc', question: 'Strong med teaching note includes:', options: ['Education provided', 'Content + barrier + response', 'Medication name only'], correctAnswer: 'Content + barrier + response' },
  { id: 'q16', cardId: 'goals-rehab-discharge', question: 'Measurable goal formula:', options: ['Goal verb', 'Metric + timeframe + safety threshold', 'Diagnosis + date'], correctAnswer: 'Metric + timeframe + safety threshold' },
  { id: 'q17', cardId: 'skilled-vs-custodial', question: 'Skilled service is supported by:', options: ['Task list', 'Clinical decision impacting treatment', 'Length of visit'], correctAnswer: 'Clinical decision impacting treatment' },
  { id: 'q18', cardId: 'homebound-two-prong', question: 'Strong homebound statement includes:', options: ['Taxing effort phrase only', 'Functional barriers + effort + leaving-home pattern', 'Diagnosis only'], correctAnswer: 'Functional barriers + effort + leaving-home pattern' },
  { id: 'q19', cardId: 'defensibility-framework', question: 'CRSR stands for:', options: ['Condition Risk Skilled Response', 'Condition + Risk + Skilled Intervention + Response', 'Care Review Signature Rule'], correctAnswer: 'Condition + Risk + Skilled Intervention + Response' },
  { id: 'q20', cardId: 'prebill-self-check', question: 'If checklist finds unresolved high-risk defect:', options: ['Release claim', 'Hold and escalate', 'Archive note'], correctAnswer: 'Hold and escalate' },
  { id: 'q21', cardId: 'copy-paste-risk', question: 'Copy/paste risk is highest when:', options: ['Formatting changes', 'Stale text contradicts current findings', 'Text is concise'], correctAnswer: 'Stale text contradicts current findings' },
  { id: 'q22', cardId: 'case-chf', question: 'CHF charting should emphasize:', options: ['Threshold-driven action', 'General observation only', 'Diagnosis repetition'], correctAnswer: 'Threshold-driven action' },
  { id: 'q23', cardId: 'case-wound', question: 'Wound defensibility is strongest with:', options: ['Task note only', 'Trend + escalation + regimen change', 'Long narrative without metrics'], correctAnswer: 'Trend + escalation + regimen change' },
  { id: 'q24', cardId: 'alignment-crosswalk', question: 'Crosswalk purpose is to:', options: ['Improve aesthetics', 'Maintain same-story alignment across documents', 'Reduce page count'], correctAnswer: 'Maintain same-story alignment across documents' },
]

