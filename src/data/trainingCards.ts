export type TrainingCard = {
  title: string
  section: string
  objective: string
  bullets: string[]
  auditFocus?: string
}

export const TRAINING_CARDS: TrainingCard[] = [
  {
    title: 'What CMS-485 Is and Why It Matters',
    section: 'Foundation',
    objective: 'Define CMS-485 as the Plan of Care format and connect it to payment and survey outcomes.',
    bullets: [
      'CMS-485 is a structured Plan of Care representation used to communicate ordered home health services.',
      'Defensible POC documentation supports clinician decision-making, patient safety, and reimbursement integrity.',
      'Weak or inconsistent POC content is a common root cause of denials and condition-level survey findings.',
    ],
    auditFocus: 'Reviewer expectation: one coherent story from certification through claim.',
  },
  {
    title: 'Why Documentation Quality Drives Outcomes',
    section: 'Foundation',
    objective: 'Explain the operational impact of complete and traceable POC documentation.',
    bullets: [
      'High-quality documentation reduces claim rework and prevents preventable ADR escalation.',
      'Clear skilled rationale improves interdisciplinary execution and handoff quality.',
      'Documentation quality is both a compliance control and a care-quality control.',
    ],
  },
  {
    title: 'CoPs Authority for the Plan of Care',
    section: 'Regulatory Authority',
    objective: 'Tie Plan of Care expectations to Conditions of Participation requirements.',
    bullets: [
      'The Plan of Care must be established and periodically reviewed by the authorized practitioner.',
      'POC content must remain patient-specific and clinically linked to current assessment findings.',
      'Agencies must operationalize CoP requirements in workflow, not only policy language.',
    ],
  },
  {
    title: 'Required POC Content Elements',
    section: 'Regulatory Authority',
    objective: 'Identify required Plan of Care elements that must be complete and traceable.',
    bullets: [
      'Diagnoses, measurable goals, interventions, disciplines, frequency, and duration must be explicit.',
      'Safety risks, homebound support, and discharge planning must be addressed when applicable.',
      'Missing required elements can invalidate necessity narrative and delay compliant billing.',
    ],
  },
  {
    title: 'Certification vs Recertification',
    section: 'Certification Lifecycle',
    objective: 'Differentiate certification and recertification requirements in practical workflow terms.',
    bullets: [
      'Certification establishes initial eligibility and plan authorization for the episode window.',
      'Recertification must reflect ongoing need and updated clinical status, not copy-forward text.',
      'Certification cycles must remain synchronized with reassessment and care progression.',
    ],
  },
  {
    title: 'Recertification Drift Risk',
    section: 'Certification Lifecycle',
    objective: 'Prevent recertification failures caused by stale goals or unchanged rationale.',
    bullets: [
      'Unchanged goals across episodes can signal poor clinical reassessment and weak necessity support.',
      'Recert content must show progress, barriers, and revised interventions where indicated.',
      'Recertification should document why continued skilled services remain reasonable and necessary.',
    ],
    auditFocus: 'Common denial pattern: recert narrative does not match visit-level documentation.',
  },
  {
    title: 'Physician Orders: Required Specificity',
    section: 'Orders & Signatures',
    objective: 'Define order language that is compliant, specific, and executable.',
    bullets: [
      'Orders must include discipline, intervention, frequency, duration, and clinical intent.',
      'Vague order wording creates interpretation risk and weakens review defensibility.',
      'Order precision supports consistency between plan and visit execution.',
    ],
  },
  {
    title: 'Signature Timing and Dating Rules',
    section: 'Orders & Signatures',
    objective: 'Apply signature timing controls to prevent avoidable billing defects.',
    bullets: [
      'Required signatures must be completed and dated according to policy and payer expectations.',
      'Late signatures are objective defects and common denial drivers in post-payment review.',
      'A billing hard-stop should prevent release when signature prerequisites are incomplete.',
    ],
  },
  {
    title: 'Acceptable Signature Methods',
    section: 'Orders & Signatures',
    objective: 'Distinguish acceptable signature approaches and documentation expectations.',
    bullets: [
      'Electronic signatures must maintain identity integrity and audit traceability.',
      'Signature method must be consistently documented across compliance artifacts.',
      'Authentication controls should be validated during onboarding and periodic audits.',
    ],
  },
  {
    title: 'Homebound Criteria: Core Standard',
    section: 'Eligibility',
    objective: 'Define homebound status in precise, defensible clinical language.',
    bullets: [
      'Homebound status must describe taxing effort and condition-related limitation to leaving home.',
      'Documentation should include objective detail, not generic statements.',
      'Homebound rationale should remain aligned with assessment and visit findings.',
    ],
  },
  {
    title: 'Homebound Defensibility Examples',
    section: 'Eligibility',
    objective: 'Compare strong vs weak homebound documentation patterns.',
    bullets: [
      'Strong: specific functional limitations, assistive needs, symptom burden, and safety risk context.',
      'Weak: broad statements without objective function or symptom support.',
      'Defensible homebound documentation should be longitudinally consistent across episodes.',
    ],
  },
  {
    title: 'Skilled Need Requirements',
    section: 'Clinical Necessity',
    objective: 'Identify what qualifies as skilled services for coverage purposes.',
    bullets: [
      'Skilled services require clinical judgment, teaching, intervention management, or assessment synthesis.',
      'Task-only activity without skilled intent may fail necessity review.',
      'Documentation must connect intervention to risk management and measurable outcome.',
    ],
  },
  {
    title: 'Qualifying Skilled Service Patterns',
    section: 'Clinical Necessity',
    objective: 'Use standardized language for common skilled service scenarios.',
    bullets: [
      'Complex wound management, unstable medication response, and focused disease education are frequent examples.',
      'Each note should show why skilled care was required on that date of service.',
      'Skilled narrative must include assessment, intervention, and response.',
    ],
  },
  {
    title: 'Medical Necessity Standards',
    section: 'Medical Necessity',
    objective: 'Apply medical necessity logic that withstands payer and audit scrutiny.',
    bullets: [
      'Necessity requires reasonable and necessary services tied to documented condition and risk.',
      'Service intensity and frequency should reflect actual patient status and progression.',
      'Over-documenting tasks without clinical reasoning undermines necessity arguments.',
    ],
  },
  {
    title: 'Top Denial Drivers and Controls',
    section: 'Medical Necessity',
    objective: 'Connect common denial reasons to preventive controls at chart level.',
    bullets: [
      'Missing signatures, weak skilled rationale, and timeline inconsistencies remain high-frequency drivers.',
      'Use pre-bill control checks for signature, plan completeness, and traceability.',
      'Track denial themes monthly and implement targeted remediation loops.',
    ],
    auditFocus: 'Control quality matters more than template completion alone.',
  },
  {
    title: 'OASIS to Plan of Care Alignment',
    section: 'Clinical Alignment',
    objective: 'Ensure OASIS findings are reflected in the Plan of Care strategy.',
    bullets: [
      'POC interventions should map directly to assessed deficits, risks, and priorities from OASIS.',
      'Contradictions between OASIS and POC create review flags for consistency.',
      'Alignment should be visible at SOC and maintained through recertification.',
    ],
  },
  {
    title: 'Maintaining OASIS-POC Continuity',
    section: 'Clinical Alignment',
    objective: 'Operationalize continuity checks between assessments and visit documentation.',
    bullets: [
      'Use interdisciplinary review to reconcile updates in condition, goals, and interventions.',
      'When condition changes, revise POC and document rationale promptly.',
      'Continuity checks should occur before billing readiness confirmation.',
    ],
  },
  {
    title: 'Diagnosis and PDGM Relevance',
    section: 'Coding Context',
    objective: 'Understand how diagnosis quality affects grouping and coverage framing.',
    bullets: [
      'Principal diagnosis should reflect the dominant skilled driver for care delivery.',
      'Secondary diagnoses should contextualize complexity and risk burden.',
      'Diagnosis-to-care mismatch weakens coding integrity and medical necessity support.',
    ],
  },
  {
    title: 'Diagnosis Integrity Safeguards',
    section: 'Coding Context',
    objective: 'Reduce diagnosis-related claim risk through validation controls.',
    bullets: [
      'Validate diagnosis logic against visit content and physician orders before finalization.',
      'Avoid code selection driven by habit rather than current clinical profile.',
      'Document rationale for principal diagnosis shifts across episodes.',
    ],
  },
  {
    title: 'Visit Frequency and Duration',
    section: 'Service Planning',
    objective: 'Set frequency and duration that are clinically justified and review-ready.',
    bullets: [
      'Frequency should match risk acuity, intervention complexity, and monitoring needs.',
      'Duration must align with expected clinical progression and measurable goals.',
      'Overly generic frequency orders are high-risk in utilization review.',
    ],
  },
  {
    title: 'Discipline Planning and Coordination',
    section: 'Service Planning',
    objective: 'Coordinate disciplines around shared goals and non-duplicative interventions.',
    bullets: [
      'Each discipline role should be explicit and linked to objective outcomes.',
      'Coordination notes should demonstrate communication and care-plan synchronization.',
      'Duplicative or conflicting services can trigger necessity concerns.',
    ],
  },
  {
    title: 'Verbal and Telephone Orders: Core Rules',
    section: 'Order Management',
    objective: 'Capture verbal or telephone orders with complete trace metadata.',
    bullets: [
      'Document exact order, date/time received, receiving clinician, and context.',
      'Track order from intake through practitioner authentication completion.',
      'Unresolved verbal orders should escalate before billing progression.',
    ],
  },
  {
    title: 'Interim Order Governance',
    section: 'Order Management',
    objective: 'Manage interim orders consistently during condition changes.',
    bullets: [
      'Interim orders should reflect current condition and be integrated into the active plan.',
      'Order updates must be visible across scheduling, documentation, and QA workflows.',
      'Aging queues and escalation thresholds reduce unresolved-order risk.',
    ],
  },
  {
    title: 'Survey Deficiency Pattern: Incomplete Plans',
    section: 'Survey Readiness',
    objective: 'Recognize and prevent common survey citations tied to plan completeness.',
    bullets: [
      'Incomplete plans often miss measurable goals, intervention detail, or patient-specific language.',
      'Standardized checklists improve consistency but require clinical verification.',
      'Supervisor attestations should confirm completeness before release.',
    ],
  },
  {
    title: 'Survey Deficiency Pattern: Weak Coordination',
    section: 'Survey Readiness',
    objective: 'Improve documentation of coordination and communication evidence.',
    bullets: [
      'Surveyors expect clear evidence of interdisciplinary coordination and provider communication.',
      'Unclear role delineation can create citations even with technically complete forms.',
      'Communication logs should connect to care decisions and plan updates.',
    ],
  },
  {
    title: 'Survey Deficiency Pattern: Safety Gaps',
    section: 'Survey Readiness',
    objective: 'Document safety and risk interventions in actionable terms.',
    bullets: [
      'Safety planning should include risk trigger, intervention, and follow-up accountability.',
      'Generic safety statements without patient context are high-risk.',
      'Readmission prevention actions must remain visible across episode documentation.',
    ],
  },
  {
    title: 'Audit Trigger: Timeline Conflicts',
    section: 'Audit Readiness',
    objective: 'Prevent timeline inconsistencies across certification, orders, and visits.',
    bullets: [
      'SOC, certification windows, and order dates must remain internally consistent.',
      'Date conflicts create objective audit triggers and downstream billing risk.',
      'Use timeline reconciliation before claim submission.',
    ],
  },
  {
    title: 'Audit Trigger: Storyline Inconsistency',
    section: 'Audit Readiness',
    objective: 'Sustain one clinical story across plan, visits, and claim narrative.',
    bullets: [
      'Reviewer confidence depends on continuity between reason-for-care and visit execution.',
      'Disconnected documentation components increase denial probability.',
      'Perform trace checks from initial certification through final bill.',
    ],
  },
  {
    title: 'Defensibility Checklist: Pre-Bill',
    section: 'Audit Readiness',
    objective: 'Use a final pre-bill checklist to reduce avoidable exposure.',
    bullets: [
      'Signatures complete and dated; verbal/interim orders resolved.',
      'Required POC elements present, patient-specific, and measurable.',
      'Skilled need and homebound rationale are explicit and current.',
    ],
  },
  {
    title: 'Good vs Bad Example: Skilled Narrative',
    section: 'Case Cards',
    objective: 'Contrast defensible and non-defensible note language.',
    bullets: [
      'Good: “Observed edema progression, modified intervention, notified practitioner, updated plan.”',
      'Bad: “Routine visit completed; patient stable.”',
      'Good notes show assessment, action, and clinical consequence.',
    ],
  },
  {
    title: 'Good vs Bad Example: Homebound Support',
    section: 'Case Cards',
    objective: 'Differentiate objective homebound evidence from generalized statements.',
    bullets: [
      'Good: functional limitation details, assistive needs, and risk context are documented.',
      'Bad: “Patient is homebound” with no supporting evidence.',
      'Defensible language links limitation directly to safe travel constraints.',
    ],
  },
  {
    title: 'Good vs Bad Example: Goal Quality',
    section: 'Case Cards',
    objective: 'Apply measurable-goal principles to care planning documentation.',
    bullets: [
      'Good: measurable target, timeframe, and intervention linkage.',
      'Bad: broad intention without metric or timeline.',
      'Goal quality determines whether progress can be verified objectively.',
    ],
  },
  {
    title: 'Good vs Bad Example: Order Specificity',
    section: 'Case Cards',
    objective: 'Recognize order language that withstands utilization review.',
    bullets: [
      'Good: discipline + intervention + frequency + purpose in one order statement.',
      'Bad: “Evaluate and treat PRN.”',
      'Specificity supports execution consistency and audit defensibility.',
    ],
  },
  {
    title: 'Final Checklist: Daily Documentation Habits',
    section: 'Takeaways',
    objective: 'Embed high-reliability documentation behaviors into daily practice.',
    bullets: [
      'Document each visit with skilled rationale, intervention detail, and response.',
      'Escalate and reconcile discrepancies early; do not defer until billing.',
      'Use structured self-audit habits before completing each episode milestone.',
    ],
  },
  {
    title: 'Final Checklist: Leadership Controls',
    section: 'Takeaways',
    objective: 'Define leadership-level controls for sustained compliance performance.',
    bullets: [
      'Track denial trends, signature timeliness, and order-aging metrics monthly.',
      'Run focused retraining from chart-level deficiencies and audit findings.',
      'Maintain a single source of truth for policy, workflow, and checklist controls.',
    ],
  },
  {
    title: 'Key Takeaways and Next Actions',
    section: 'Takeaways',
    objective: 'Close with operational priorities for a defensible CMS-485 program.',
    bullets: [
      'A defensible CMS-485 workflow is built through consistency, traceability, and timely governance.',
      'Compliance-ready documentation protects clinicians, patients, and agency financial integrity.',
      'Apply this framework as a repeatable operating standard across all episodes.',
    ],
    auditFocus: 'Final standard: clear, complete, and clinically coherent documentation at every step.',
  },
]
