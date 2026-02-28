export type CardChallenge = {
  scenario: string
  question: string
  options: string[]      // index 0 is always correct — shuffled at render time
  correctLogic: string
}

export type TrainingCard = {
  title: string
  section: string
  objective: string
  bullets: string[]
  auditFocus?: string
  challenge: CardChallenge
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
    challenge: {
      scenario: 'Your agency receives an Additional Documentation Request (ADR) for a post-payment review. The reviewer notes the Plan of Care does not tell a coherent story from certification through the claim.',
      question: 'What is the primary purpose of the CMS-485 in this review context?',
      options: [
        'It serves as the structured Plan of Care that communicates ordered services and supports reimbursement defensibility.',
        'It is an optional summary document the agency sends only when a payer requests additional detail.',
        'It is the billing form that lists charges the agency submits for each 60-day episode.',
        'It is an internal checklist staff use to track daily visit schedules.',
        'It is the physician referral letter that initiates the home health admission.',
      ],
      correctLogic: 'The CMS-485 is the structured Plan of Care that communicates ordered home health services, supports clinician decision-making, and provides the narrative foundation for reimbursement. Without a coherent POC, the claim lacks defensibility under post-payment review.',
    },
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
    challenge: {
      scenario: 'A home health agency notices a 30% increase in ADR requests over the past quarter. Upon internal review, most returned claims have unclear skilled rationale and missing intervention details.',
      question: 'What operational outcome is most directly tied to improving POC documentation quality?',
      options: [
        'Reduced claim rework and prevention of preventable ADR escalation.',
        'Increased visit volume per clinician per day.',
        'Elimination of all payer audits for the next fiscal year.',
        'Automatic approval of recertification episodes without clinical review.',
        'Reduced need for interdisciplinary team meetings.',
      ],
      correctLogic: 'High-quality documentation reduces claim rework and prevents ADR escalation by ensuring every chart element is complete and traceable. Documentation quality functions as both a compliance control and a care-quality control, directly reducing denial exposure.',
    },
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
    challenge: {
      scenario: 'During a state survey, a reviewer finds that the agency policy manual references Conditions of Participation requirements, but actual patient charts show generic, template-only Plan of Care language with no patient-specific clinical linkage.',
      question: 'What regulatory gap does this finding represent?',
      options: [
        'The agency has not operationalized CoP requirements in its workflow, relying on policy language alone without patient-specific POC content.',
        'The agency exceeded CoP requirements and should simplify its documentation.',
        'Conditions of Participation only apply to skilled nursing facilities, not home health agencies.',
        'Template-based language is preferred by surveyors as long as it references the correct regulation.',
        'The policy manual is sufficient evidence of compliance; chart-level detail is optional.',
      ],
      correctLogic: 'Conditions of Participation require that the Plan of Care be patient-specific and clinically linked to current assessment findings. Agencies must operationalize CoP requirements in workflow — not merely reference them in policy manuals — or face citations for non-compliance.',
    },
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
    challenge: {
      scenario: 'A QA reviewer audits a Plan of Care and finds that it includes diagnoses and nursing interventions, but there are no measurable goals, no stated frequency or duration, and discharge planning is absent.',
      question: 'Which required POC content elements are missing from this plan?',
      options: [
        'Measurable goals, frequency, duration, and discharge planning — all of which must be explicit and traceable.',
        'Only the discharge plan, since goals and frequency are optional in initial certifications.',
        'No elements are missing because diagnoses and interventions are the only required components.',
        'A physician narrative summary, which must appear on every POC regardless of episode type.',
        'The billing authorization code, which replaces measurable goals in compliant documentation.',
      ],
      correctLogic: 'Required POC elements include diagnoses, measurable goals, interventions, disciplines, frequency, duration, safety risks, homebound support, and discharge planning. Missing any of these can invalidate the necessity narrative and delay billing.',
    },
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
    challenge: {
      scenario: 'A clinician submits a recertification POC for a patient entering a second 60-day episode. The clinical reviewer notices the goals, interventions, and narrative are identical to the initial certification with no updates to reflect current status.',
      question: 'Why is this recertification problematic?',
      options: [
        'Recertification must reflect ongoing need and updated clinical status rather than copying forward text from the initial certification.',
        'Recertification only requires a new physician signature and no content changes.',
        'Identical content is acceptable as long as the patient is still receiving services.',
        'Recertification narrative is only reviewed during ADR, so updates can be deferred.',
        'The clinician should only update the diagnosis codes and leave all other content unchanged.',
      ],
      correctLogic: 'Recertification must reflect ongoing need and updated clinical status. Copy-forward text from the initial certification fails to demonstrate that the clinician has reassessed the patient and determined continued skilled services are reasonable and necessary.',
    },
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
    challenge: {
      scenario: 'A patient has been on service for four consecutive episodes. A post-payment reviewer compares recertification narratives and finds the same three goals listed identically across all four episodes with no documented progress, barriers, or intervention changes.',
      question: 'What risk does this pattern create?',
      options: [
        'It signals poor clinical reassessment and weak necessity support, making the claim vulnerable to denial.',
        'It demonstrates clinical stability, which strengthens the case for continued services.',
        'It is acceptable practice because goals only need to change at discharge.',
        'It is only flagged during state surveys, not during payer audits.',
        'It reduces documentation burden and is encouraged for efficiency.',
      ],
      correctLogic: 'Unchanged goals across episodes signal poor clinical reassessment and weak necessity support. Recertification content must show progress, barriers, and revised interventions to demonstrate why continued skilled services remain reasonable and necessary.',
    },
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
    challenge: {
      scenario: 'A physician order reads: "Nursing to evaluate and treat as needed." The order does not specify intervention type, frequency, duration, or clinical purpose.',
      question: 'What is fundamentally wrong with this order?',
      options: [
        'It lacks required specificity — orders must include discipline, intervention, frequency, duration, and clinical intent to be compliant and executable.',
        'It is compliant because physicians have broad discretion in ordering home health services.',
        'It is acceptable as a standing order that the nurse can interpret at each visit.',
        'It only needs a frequency added; all other elements are optional for nursing orders.',
        'It should be replaced with the agency template order, regardless of patient condition.',
      ],
      correctLogic: 'Compliant physician orders must include discipline, intervention, frequency, duration, and clinical intent. Vague wording like "evaluate and treat as needed" creates interpretation risk, weakens defensibility, and fails to support consistency between plan and execution.',
    },
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
    challenge: {
      scenario: 'A billing coordinator discovers that a physician signed and dated the POC 15 days after the certification period ended. The claim has already been submitted and is now under post-payment review.',
      question: 'What billing control should have prevented this exposure?',
      options: [
        'A billing hard-stop that prevents claim release when signature prerequisites are incomplete or late.',
        'An automatic backdating feature that adjusts signature dates to match the certification window.',
        'A policy that allows late signatures as long as the physician confirms verbally.',
        'Submitting the claim without the signature and adding it later during audit response.',
        'Removing the signature requirement for episodes shorter than 30 days.',
      ],
      correctLogic: 'Late signatures are objective defects and common denial drivers. A billing hard-stop should prevent claim release when signature prerequisites are incomplete, ensuring required signatures are completed and dated according to policy and payer expectations.',
    },
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
    challenge: {
      scenario: 'An agency allows physicians to sign POCs electronically. During an audit, the reviewer asks for evidence that the electronic signature system maintains identity verification and an audit trail. The agency cannot produce this documentation.',
      question: 'What signature compliance failure does this represent?',
      options: [
        'Electronic signatures must maintain identity integrity and audit traceability — the agency failed to validate and document its authentication controls.',
        'Electronic signatures are not acceptable for POC documentation under any circumstance.',
        'The audit trail is only required for paper signatures, not electronic ones.',
        'Identity verification is the physician responsibility, not the agency obligation.',
        'Signature method documentation is optional and only needed for accreditation surveys.',
      ],
      correctLogic: 'Electronic signatures must maintain identity integrity and audit traceability. Authentication controls should be validated during onboarding and periodic audits. The agency must be able to produce documentation of its signature method compliance at any time.',
    },
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
    challenge: {
      scenario: 'A patient chart states only: "Patient is homebound." There are no details about functional limitations, assistive device needs, or the effort required to leave the residence.',
      question: 'Why does this documentation fail the homebound standard?',
      options: [
        'Homebound status must describe the taxing effort and condition-related limitations with objective detail, not generic statements.',
        'The statement is sufficient because it directly affirms homebound status.',
        'Homebound documentation is only required for patients over age 75.',
        'Detailed homebound criteria are only needed during recertification, not initial certification.',
        'A verbal confirmation from the patient replaces the need for clinical documentation.',
      ],
      correctLogic: 'Homebound status must describe the taxing effort and specific condition-related limitations to leaving home using objective clinical detail. A generic statement without supporting evidence fails to meet the defensibility standard and misaligns with assessment findings.',
    },
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
    challenge: {
      scenario: 'Two nurses document homebound status for the same patient. Nurse A writes: "Requires rolling walker for all ambulation; experiences SOB after 10 feet; unable to safely descend 3 porch steps without standby assist." Nurse B writes: "Patient stays home most of the time."',
      question: 'Which documentation pattern meets the defensibility standard and why?',
      options: [
        'Nurse A — it includes specific functional limitations, assistive needs, and safety risk context that create a defensible homebound narrative.',
        'Nurse B — brevity is preferred because it reduces documentation burden.',
        'Both are acceptable because they each confirm the patient stays home.',
        'Neither is adequate because homebound status must be documented by the physician, not the nurse.',
        'Nurse B — general statements avoid over-documenting and reduce audit scrutiny.',
      ],
      correctLogic: 'Strong homebound documentation includes specific functional limitations, assistive needs, symptom burden, and safety risk context. Nurse A provides objective, defensible detail that can withstand audit review, while Nurse B offers only a broad statement without clinical support.',
    },
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
    challenge: {
      scenario: 'A visit note reads: "Changed wound dressing. Vitals taken. Medication box refilled." There is no mention of clinical assessment, clinical judgment applied, or skilled rationale for any intervention.',
      question: 'Why might this visit fail a necessity review?',
      options: [
        'The note describes task-only activity without demonstrating the clinical judgment, teaching, or assessment synthesis required for skilled services.',
        'The note is compliant because wound care and vitals are inherently skilled activities.',
        'Medication box refills automatically qualify as skilled nursing intervention.',
        'Necessity review only evaluates frequency, not the content of individual visit notes.',
        'Task descriptions are preferred over clinical reasoning in skilled visit documentation.',
      ],
      correctLogic: 'Skilled services require clinical judgment, teaching, intervention management, or assessment synthesis. Task-only activity without skilled intent fails necessity review because documentation must connect each intervention to risk management and a measurable outcome.',
    },
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
    challenge: {
      scenario: 'A nurse visits a diabetic patient with a non-healing wound. The note reads: "Wound care performed. Will continue current plan." There is no assessment of wound status, no intervention rationale, and no patient response documented.',
      question: 'What three elements must the skilled narrative include?',
      options: [
        'Assessment of current condition, the specific intervention performed, and the patient response observed.',
        'Visit start time, supply list used, and next visit date.',
        'Patient mood, family statement, and weather conditions.',
        'Physician name, order date, and insurance authorization number.',
        'Template selection, charting software version, and supervisor sign-off.',
      ],
      correctLogic: 'The skilled narrative must include assessment, intervention, and response. Each note should demonstrate why skilled care was required on that specific date of service, especially for qualifying patterns like complex wound management.',
    },
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
    challenge: {
      scenario: 'A clinician documents 14 detailed task entries per visit across 5 weekly visits for a patient whose wound is progressing well and vital signs have been stable for three weeks. The clinical rationale section is blank on every note.',
      question: 'How does this documentation pattern undermine medical necessity?',
      options: [
        'Over-documenting tasks without clinical reasoning undermines necessity arguments — service intensity must reflect actual patient status and progression.',
        'High task volume always strengthens the necessity argument regardless of clinical reasoning.',
        'Medical necessity is only evaluated at the episode level, not individual visits.',
        'Blank rationale sections are acceptable if task documentation is thorough.',
        'Stable patients do not require necessity justification until recertification.',
      ],
      correctLogic: 'Medical necessity requires reasonable and necessary services tied to documented condition and risk. Over-documenting tasks without clinical reasoning undermines the argument because service intensity and frequency must reflect the patient actual status and progression.',
    },
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
    challenge: {
      scenario: 'An agency reviews its denial data and finds three recurring themes: missing physician signatures, skilled rationale that does not match visit content, and certification dates that conflict with start-of-care timing.',
      question: 'What preventive control strategy addresses all three denial drivers?',
      options: [
        'Pre-bill control checks for signature completion, plan completeness, and timeline traceability before claim release.',
        'Submitting claims faster to avoid payer review windows.',
        'Assigning one clinician to handle all signatures to reduce variability.',
        'Eliminating skilled rationale sections from templates to prevent inconsistency.',
        'Waiting for denials to occur, then appealing each one individually.',
      ],
      correctLogic: 'Missing signatures, weak skilled rationale, and timeline inconsistencies are high-frequency denial drivers. Pre-bill control checks for signature, plan completeness, and traceability prevent these defects before claim submission. Agencies should also track denial themes monthly and implement targeted remediation.',
    },
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
    challenge: {
      scenario: 'An OASIS assessment scores a patient with severe functional limitations in bathing, toileting, and transferring. However, the Plan of Care only addresses wound care and medication management with no reference to functional deficits.',
      question: 'What documentation problem does this mismatch create?',
      options: [
        'POC interventions do not map to assessed OASIS deficits, creating a consistency review flag that weakens the chart defensibility.',
        'OASIS and POC are independent documents that do not need to align.',
        'Functional limitations are only documented in therapy notes, not the POC.',
        'The mismatch is acceptable because wound care takes clinical priority over functional deficits.',
        'OASIS scores are advisory and do not affect POC content requirements.',
      ],
      correctLogic: 'POC interventions should map directly to assessed deficits, risks, and priorities from OASIS. Contradictions between OASIS and POC create review flags for consistency. Alignment must be visible at SOC and maintained through recertification.',
    },
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
    challenge: {
      scenario: 'A patient condition deteriorates significantly mid-episode with new cardiac symptoms. The interdisciplinary team discusses the change in a meeting, but the POC is not updated and visit notes continue referencing the original plan without revised goals or interventions.',
      question: 'What continuity failure occurred?',
      options: [
        'The POC was not revised when the condition changed, and the rationale for the change was not documented — continuity checks should occur before billing readiness.',
        'Verbal interdisciplinary discussion is sufficient documentation of the condition change.',
        'POC updates are only required at recertification, not mid-episode.',
        'The original plan remains valid as long as the physician was verbally notified.',
        'Continuity checks are only performed by the billing department after claim submission.',
      ],
      correctLogic: 'When condition changes, the POC must be revised and the rationale documented promptly. Interdisciplinary review should reconcile updates in condition, goals, and interventions. Continuity checks should occur before billing readiness confirmation, not after.',
    },
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
    challenge: {
      scenario: 'A patient is admitted primarily for skilled wound care of a diabetic foot ulcer, but the principal diagnosis is coded as essential hypertension. The secondary diagnosis list does not include the wound or diabetes.',
      question: 'How does this coding decision affect the claim?',
      options: [
        'The principal diagnosis does not reflect the dominant skilled driver, creating a diagnosis-to-care mismatch that weakens coding integrity and medical necessity support.',
        'Hypertension is always an appropriate principal diagnosis for home health patients.',
        'Secondary diagnoses are optional and do not affect claim integrity.',
        'The coding is correct because hypertension is a higher-risk condition than a foot ulcer.',
        'Diagnosis sequencing only matters for inpatient claims, not home health.',
      ],
      correctLogic: 'The principal diagnosis should reflect the dominant skilled driver for care delivery. Selecting hypertension when the primary skilled service is wound care creates a diagnosis-to-care mismatch, weakening both coding integrity and medical necessity support under PDGM grouping.',
    },
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
    challenge: {
      scenario: 'A coder selects the same principal diagnosis for a patient across three consecutive episodes without reviewing updated visit notes or physician orders. The patient condition has shifted from post-surgical wound care to chronic disease management.',
      question: 'What diagnosis integrity safeguard was violated?',
      options: [
        'Diagnosis logic was not validated against current visit content and physician orders — code selection was driven by habit rather than the patient current clinical profile.',
        'Using the same diagnosis across episodes is standard practice and requires no additional validation.',
        'The coder should change diagnoses every episode regardless of clinical changes.',
        'Diagnosis validation is the physician sole responsibility, not the coder responsibility.',
        'Principal diagnosis should always reflect the first condition documented at SOC.',
      ],
      correctLogic: 'Diagnosis logic must be validated against visit content and physician orders before finalization. Avoiding code selection driven by habit ensures that the principal diagnosis reflects the current clinical profile. Rationale for principal diagnosis shifts must also be documented across episodes.',
    },
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
    challenge: {
      scenario: 'A Plan of Care orders skilled nursing visits "as needed" for a patient with an unstable medication regimen requiring weekly lab draws and dose adjustments. No specific frequency or duration is stated.',
      question: 'Why is this frequency order high-risk?',
      options: [
        'Overly generic frequency orders are high-risk in utilization review — frequency must match risk acuity, intervention complexity, and monitoring needs with explicit terms.',
        '"As needed" is an acceptable frequency for skilled nursing as long as visits occur.',
        'Frequency specificity is only required for therapy disciplines, not nursing.',
        'The physician can clarify frequency verbally during each visit.',
        'Generic frequency orders reduce audit exposure by not committing to a fixed schedule.',
      ],
      correctLogic: 'Frequency must match risk acuity, intervention complexity, and monitoring needs explicitly. "As needed" without specificity fails utilization review because reviewers cannot verify that service intensity aligns with clinical justification. Duration must also align with expected progression and measurable goals.',
    },
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
    challenge: {
      scenario: 'Both the skilled nurse and physical therapist are documenting fall prevention education with the same patient using identical teaching content. Their coordination notes show no communication about who owns this intervention or how their roles differ.',
      question: 'What service planning problem does this create?',
      options: [
        'Duplicative services without defined discipline roles can trigger necessity concerns — each discipline must have explicit, non-overlapping interventions linked to distinct outcomes.',
        'Both disciplines teaching the same content strengthens the patient education outcomes.',
        'Coordination notes are optional as long as both disciplines are ordered.',
        'Duplicative interventions are acceptable because different disciplines bill under separate codes.',
        'Only therapy disciplines need to define their roles; nursing interventions are exempt from coordination requirements.',
      ],
      correctLogic: 'Duplicative or conflicting services can trigger necessity concerns. Each discipline role should be explicit and linked to objective outcomes. Coordination notes must demonstrate communication and care-plan synchronization to ensure non-duplicative, purposeful interventions.',
    },
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
    challenge: {
      scenario: 'A nurse receives a telephone order from a physician to increase wound care visits. The nurse documents only "MD called, increase visits" in the progress note without recording the date, time, exact order wording, or the receiving clinician name.',
      question: 'What documentation elements are missing from this telephone order?',
      options: [
        'The exact order wording, date/time received, receiving clinician name, and clinical context — all required trace metadata for telephone orders.',
        'Only the physician name is missing; the rest of the documentation is sufficient.',
        'Telephone orders do not require documentation beyond noting that a call occurred.',
        'The nurse should wait for a written order and disregard the telephone communication.',
        'Progress note entries are not appropriate locations for telephone order documentation.',
      ],
      correctLogic: 'Verbal and telephone orders require complete trace metadata: exact order wording, date/time received, receiving clinician, and context. Orders must be tracked from intake through practitioner authentication. Unresolved verbal orders should escalate before billing progression.',
    },
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
    challenge: {
      scenario: 'A patient develops a new infection mid-episode and the physician issues an interim order for antibiotic administration. Three weeks later, the interim order has not been integrated into the POC, scheduling has no record of it, and QA has not flagged the gap.',
      question: 'What order governance failure occurred?',
      options: [
        'The interim order was not integrated into the active plan, and order updates were not visible across scheduling, documentation, and QA workflows.',
        'Interim orders do not need to be integrated into the POC until recertification.',
        'The QA department has no responsibility for tracking interim orders.',
        'Three weeks is within acceptable aging limits for interim order resolution.',
        'Interim orders are only required for new disciplines, not new interventions for existing disciplines.',
      ],
      correctLogic: 'Interim orders should reflect current condition and be integrated into the active plan promptly. Order updates must be visible across scheduling, documentation, and QA workflows. Aging queues and escalation thresholds should prevent orders from going unresolved.',
    },
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
    challenge: {
      scenario: 'A surveyor reviews five patient charts and cites the agency for incomplete Plans of Care. The citations note that all five plans use identical template language with no patient-specific goals or individualized intervention detail.',
      question: 'What prevention strategy would have addressed this deficiency pattern?',
      options: [
        'Standardized checklists with clinical verification and supervisor attestations confirming patient-specific completeness before release.',
        'Using more detailed templates with additional generic language options.',
        'Eliminating checklists entirely and relying on clinician memory for plan elements.',
        'Having the billing department verify clinical content before submission.',
        'Deferring plan completion until after the surveyor visit.',
      ],
      correctLogic: 'Incomplete plans often miss measurable goals, intervention detail, or patient-specific language. Standardized checklists improve consistency but must be paired with clinical verification. Supervisor attestations should confirm completeness before release to prevent citations.',
    },
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
    challenge: {
      scenario: 'During a survey, the reviewer asks for evidence of interdisciplinary coordination. The agency provides a sign-in sheet from a team meeting but no documentation linking the discussion to specific care decisions, plan updates, or role assignments.',
      question: 'Why is a sign-in sheet insufficient as coordination evidence?',
      options: [
        'Surveyors expect communication logs that connect to care decisions and plan updates — attendance alone does not demonstrate meaningful coordination.',
        'Sign-in sheets are the gold standard for proving interdisciplinary coordination.',
        'Coordination evidence is only required for agencies with more than three disciplines.',
        'Surveyors never request coordination documentation during standard reviews.',
        'Role delineation documentation is only needed for therapy services.',
      ],
      correctLogic: 'Surveyors expect clear evidence of interdisciplinary coordination and provider communication through documentation linked to care decisions and plan updates. Unclear role delineation can create citations even with technically complete forms. Communication logs must show substance, not just attendance.',
    },
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
    challenge: {
      scenario: 'A patient chart includes the safety statement: "Fall precautions in place." There is no identification of specific fall risk triggers, no targeted intervention plan, and no follow-up accountability documented.',
      question: 'What makes this safety documentation inadequate?',
      options: [
        'It is a generic statement without patient context — safety planning must include specific risk triggers, targeted interventions, and follow-up accountability.',
        'The statement is sufficient because it confirms safety awareness.',
        'Safety documentation is only required for patients with a prior hospitalization.',
        'Generic safety statements are preferred because they apply to all patients uniformly.',
        'Follow-up accountability is the physician responsibility and does not belong in nursing documentation.',
      ],
      correctLogic: 'Safety planning must include the specific risk trigger, the intervention to address it, and follow-up accountability. Generic safety statements without patient context are high-risk for citations. Readmission prevention actions must also remain visible across episode documentation.',
    },
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
    challenge: {
      scenario: 'An auditor reviews a patient file and discovers that the physician signature on the Plan of Care is dated five days before the start of care date, and the first nursing visit note is dated two days before the certification period begins.',
      question: 'Why would an auditor flag these timeline conflicts?',
      options: [
        'SOC, certification windows, and order dates must remain internally consistent — date conflicts create objective audit triggers and downstream billing risk.',
        'Timeline discrepancies are acceptable as long as all documents are eventually signed.',
        'Physician signatures before start of care demonstrate proactive planning and are preferred.',
        'Visit notes dated before a certification period are standard practice for pre-admission assessments.',
        'Auditors only review billing dates, not clinical documentation dates.',
      ],
      correctLogic: 'SOC, certification windows, and order dates must remain internally consistent. Date conflicts create objective audit triggers and downstream billing risk. Using timeline reconciliation before claim submission prevents these issues from reaching the auditor.',
    },
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
    challenge: {
      scenario: 'A patient OASIS assessment documents severe functional limitations requiring maximum assist for all transfers. Three days later, the nursing visit note states the patient is "independent with all ADLs and ambulating without difficulty." No clinical event or intervention explains the change.',
      question: 'What audit concern does this documentation pattern create?',
      options: [
        'Reviewer confidence depends on continuity between reason-for-care and visit execution — disconnected documentation components increase denial probability.',
        'The visit note correctly documents current status, making the earlier OASIS irrelevant.',
        'Functional status changes need only be documented at recertification.',
        'OASIS assessments and visit notes are reviewed independently and do not need to align.',
        'Rapid improvement without intervention is expected and does not require explanation.',
      ],
      correctLogic: 'Reviewer confidence depends on continuity between the reason-for-care and visit execution. Disconnected documentation components increase denial probability. Trace checks from initial certification through final bill catch storyline inconsistencies before they reach auditors.',
    },
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
    challenge: {
      scenario: 'An agency releases claims without a pre-bill documentation review. A subsequent audit reveals that 40% of the billed episodes have incomplete physician signatures, missing homebound justification, or unresolved verbal orders.',
      question: 'What pre-bill process would have prevented these audit findings?',
      options: [
        'A final checklist confirming signatures are complete and dated, required POC elements are patient-specific and measurable, and skilled need and homebound rationale are explicit and current.',
        'Releasing claims immediately and addressing documentation issues only if audited.',
        'Having the billing department write clinical justifications for incomplete charts.',
        'Performing documentation reviews annually rather than before each billing cycle.',
        'Relying on the physician to verify all clinical documentation accuracy before signing.',
      ],
      correctLogic: 'A pre-bill checklist must confirm that signatures are complete and dated with verbal/interim orders resolved, required POC elements are present and patient-specific, and skilled need and homebound rationale are explicit and current. Claims released without this verification create unnecessary denial risk.',
    },
  },
  {
    title: 'Good vs Bad Example: Skilled Narrative',
    section: 'Case Cards',
    objective: 'Contrast defensible and non-defensible note language.',
    bullets: [
      'Good: “Observed edema progression, modified intervention, notified practitioner, updated plan.”',
      'Bad: “Routine visit completed; patient stable.”',
      'Good notes show assessment, action, and clinical consequence.',
    ],    challenge: {
      scenario: 'A nurse documents a home visit note that reads: "Routine visit completed. Patient stable. Continue plan of care." The patient actually presented with new bilateral lower extremity edema, required intervention modification, and the physician was notified.',
      question: 'Which note language would make this visit defensible?',
      options: [
        '"Observed edema progression, modified intervention, notified practitioner, updated plan" — shows assessment, action, and clinical consequence.',
        '"Routine visit completed; patient stable" — brevity is preferred in visit documentation.',
        '"Patient seen today. Will continue to monitor" — monitoring language satisfies skilled need.',
        '"Edema noted" — identifying the finding is sufficient without describing actions taken.',
        '"Called doctor" — physician notification alone demonstrates skilled nursing judgment.',
      ],
      correctLogic: 'Good skilled narratives show assessment, action, and clinical consequence. "Observed edema progression, modified intervention, notified practitioner, updated plan" demonstrates the clinical reasoning and skilled judgment that supports the visit. "Routine visit completed; patient stable" is non-defensible because it shows no skilled need.',
    },  },
  {
    title: 'Good vs Bad Example: Homebound Support',
    section: 'Case Cards',
    objective: 'Differentiate objective homebound evidence from generalized statements.',
    bullets: [
      'Good: functional limitation details, assistive needs, and risk context are documented.',
      'Bad: “Patient is homebound” with no supporting evidence.',
      'Defensible language links limitation directly to safe travel constraints.',
    ],    challenge: {
      scenario: 'Two patient charts are reviewed for homebound documentation. Chart A states: "Patient is homebound." Chart B states: "Patient requires maximum assist of one person and rolling walker for all transfers. Leaving home requires taxing effort due to severe dyspnea on exertion after 10 feet of ambulation."',
      question: 'Why is Chart B defensible and Chart A is not?',
      options: [
        'Chart B documents functional limitation details, assistive needs, and risk context — defensible language links limitation directly to safe travel constraints.',
        'Chart A is sufficient because it makes a clear homebound status declaration.',
        'Both charts are acceptable because homebound status is a binary determination.',
        'Chart B is too detailed and creates liability by documenting specific limitations.',
        'Homebound documentation only matters at start of care, not throughout the episode.',
      ],
      correctLogic: 'Good homebound documentation includes functional limitation details, assistive needs, and risk context. "Patient is homebound" with no supporting evidence is indefensible. Defensible language links the specific limitation directly to safe travel constraints, as demonstrated in Chart B.',
    },  },
  {
    title: 'Good vs Bad Example: Goal Quality',
    section: 'Case Cards',
    objective: 'Apply measurable-goal principles to care planning documentation.',
    bullets: [
      'Good: measurable target, timeframe, and intervention linkage.',
      'Bad: broad intention without metric or timeline.',
      'Goal quality determines whether progress can be verified objectively.',
    ],
    challenge: {
      scenario: 'A plan of care includes two goals. Goal A: "Patient will improve mobility." Goal B: "Patient will ambulate 50 feet with rolling walker independently within 30 days, supported by PT gait training 3x/week."',
      question: 'Why does Goal B meet documentation standards while Goal A does not?',
      options: [
        'Goal B includes a measurable target, timeframe, and intervention linkage — goal quality determines whether progress can be verified objectively.',
        'Goal A is preferred because broad goals allow more clinical flexibility.',
        'Both goals are acceptable because any documented goal satisfies regulatory requirements.',
        'Goal B is too specific and creates unrealistic expectations for the patient.',
        'Measurable goals are only required for therapy services, not nursing.',
      ],
      correctLogic: 'Good goals include a measurable target, timeframe, and intervention linkage. Broad intentions without metric or timeline cannot be objectively verified. Goal quality determines whether progress can be measured, which is essential for demonstrating skilled need and continuing eligibility.',
    },
  },
  {
    title: 'Good vs Bad Example: Order Specificity',
    section: 'Case Cards',
    objective: 'Recognize order language that withstands utilization review.',
    bullets: [
      'Good: discipline + intervention + frequency + purpose in one order statement.',
      'Bad: “Evaluate and treat PRN.”',
      'Specificity supports execution consistency and audit defensibility.',
    ],    challenge: {
      scenario: 'Two physician orders are compared during utilization review. Order A: "Evaluate and treat PRN." Order B: "SN to perform wound care to left heel stage III pressure ulcer with wet-to-dry dressing changes, 3x/week for 4 weeks, to achieve wound closure."',
      question: 'Why does Order B withstand utilization review while Order A does not?',
      options: [
        'Order B includes discipline, intervention, frequency, and purpose in one statement — specificity supports execution consistency and audit defensibility.',
        'Order A is acceptable because PRN orders give clinicians appropriate flexibility.',
        'Both orders are valid because physician intent is implied regardless of specificity.',
        'Order B is overly restrictive and prevents clinical judgment at the point of care.',
        'Utilization reviewers only evaluate billing codes, not order language.',
      ],
      correctLogic: 'Good orders include discipline, intervention, frequency, and purpose in one statement. "Evaluate and treat PRN" lacks the specificity needed for execution consistency and audit defensibility. Specific order language supports consistent care delivery and withstands utilization review.',
    },  },
  {
    title: 'Final Checklist: Daily Documentation Habits',
    section: 'Takeaways',
    objective: 'Embed high-reliability documentation behaviors into daily practice.',
    bullets: [
      'Document each visit with skilled rationale, intervention detail, and response.',
      'Escalate and reconcile discrepancies early; do not defer until billing.',
      'Use structured self-audit habits before completing each episode milestone.',
    ],
    challenge: {
      scenario: 'A clinician consistently completes visit notes at the end of each week rather than after each visit. By Friday, details from Monday and Tuesday visits are approximated from memory. The agency later receives a targeted audit request for three of those episodes.',
      question: 'What daily documentation habit would have protected these episodes?',
      options: [
        'Document each visit with skilled rationale, intervention detail, and response at the time of the visit — do not defer documentation until later.',
        'Batch documentation at the end of each week to improve efficiency.',
        'Complete notes within 30 days of the visit as long as they are eventually filed.',
        'Use copy-forward from previous visit notes to ensure consistency.',
        'Defer detailed documentation to the discharge summary where it matters most.',
      ],
      correctLogic: 'Each visit should be documented with skilled rationale, intervention detail, and response at the time it occurs. Discrepancies should be escalated and reconciled early, not deferred until billing. Structured self-audit habits before completing each episode milestone catch issues before they become audit findings.',
    },
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
    challenge: {
      scenario: 'An agency experiences a 25% claim denial rate over three consecutive months. Leadership responds by sending a mass email reminding staff about documentation requirements. The denial rate does not improve in the following quarter.',
      question: 'What leadership control approach would more effectively reduce denials?',
      options: [
        'Track denial trends, signature timeliness, and order-aging metrics monthly, then run focused retraining from chart-level deficiencies and audit findings.',
        'Send periodic reminder emails about documentation standards.',
        'Increase the number of patients assigned per clinician to improve productivity.',
        'Outsource all documentation review to an external compliance vendor.',
        'Wait for the next survey cycle to identify specific improvement areas.',
      ],
      correctLogic: 'Leadership must track denial trends, signature timeliness, and order-aging metrics monthly to identify root causes. Focused retraining from chart-level deficiencies and audit findings addresses specific gaps. A single source of truth for policy, workflow, and checklist controls ensures sustained compliance performance.',
    },
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
    challenge: {
      scenario: 'A newly appointed Director of Clinical Services is tasked with building a defensible CMS-485 documentation program from scratch. The agency has high turnover, inconsistent workflows, and no standardized documentation framework. The director must prioritize the first operational change.',
      question: 'What foundational principle should guide the program build?',
      options: [
        'A defensible CMS-485 workflow is built through consistency, traceability, and timely governance — apply this as a repeatable operating standard across all episodes.',
        'Focus exclusively on passing the next survey without changing underlying workflows.',
        'Implement the most complex documentation system available to demonstrate compliance commitment.',
        'Delegate all compliance decisions to individual clinicians without standardized guidance.',
        'Prioritize billing volume over documentation quality to stabilize agency finances first.',
      ],
      correctLogic: 'A defensible CMS-485 workflow is built through consistency, traceability, and timely governance. Compliance-ready documentation protects clinicians, patients, and agency financial integrity. This framework should be applied as a repeatable operating standard across all episodes.',
    },
  },
]
