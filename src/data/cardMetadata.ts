import { TRAINING_CARDS } from './trainingCards'

export type CardMetadata = {
  cardId: string
  cardNumber: number
  title: string
  section: string
  objective: string
  keywords: string[]
  narrationScript: string
  wordCount: number
  estimatedSeconds: number
  pocFocus?: {
    boxes: string[]
    context: string
  }
}

const TARGET_TOTAL_MINUTES = 45
const TARGET_WPM = 130

const SECTION_RESEARCH_CONTEXT: Record<string, string> = {
  Foundation:
    'Research context: CMS reporting highlights documentation quality as a dominant risk area, with insufficient documentation and medical necessity making up most improper payment causes in home health. Clinicians should treat the plan of care as both a care roadmap and a reimbursement defense artifact.',
  'Regulatory Authority':
    'Research context: the governing framework is split between coverage rules and conditions of participation. The key requirement is an individualized written plan of care with all required elements, delivered in accordance with physician or allowed practitioner orders.',
  'Certification Lifecycle':
    'Research context: certification and recertification timelines are tightly controlled. Face-to-face and ongoing review expectations must align with actual episode documentation, not template language, to avoid objective denial triggers.',
  'Orders & Signatures':
    'Research context: signature timing and order authentication are among the clearest binary compliance checks. Late or missing signatures can invalidate otherwise clinically appropriate services at medical review.',
  Eligibility:
    'Research context: homebound and skilled need are evaluated as practical evidence, not generic phrases. The record must show function, risk, effort to leave home, and why skilled services are needed at this point in time.',
  'Clinical Necessity':
    'Research context: reviewers expect skilled judgment, not task completion language. Documentation should describe instability, professional assessment, intervention logic, and clinical response over time.',
  'Medical Necessity':
    'Research context: necessity denials often occur when frequency, intensity, or intervention detail is not tied to patient-specific risk. Narrative consistency across OASIS, plan, and visits is essential.',
  'Clinical Alignment':
    'Research context: OASIS findings, the plan of care, and visit notes must tell one coherent story. Alignment errors are a common survey and audit exposure because they are easy to detect during record tracing.',
  'Coding Context':
    'Research context: diagnosis integrity affects PDGM grouping and claim defensibility. The principal diagnosis must match the dominant skilled driver documented in the ongoing clinical record.',
  'Service Planning':
    'Research context: visit frequency and interdisciplinary design should be justified by condition risk, intervention complexity, and expected progression. Generic planning language invites utilization scrutiny.',
  'Order Management':
    'Research context: verbal and interim orders require reliable intake, routing, authentication, and reconciliation controls. Tracking order aging prevents compliance defects from reaching billing.',
  'Survey Readiness':
    'Research context: surveyors evaluate whether assessed risks appear in the active plan with interventions and measurable outcomes. Completeness without clinical specificity is not enough.',
  'Audit Readiness':
    'Research context: audit resilience depends on timeline integrity, signature controls, and continuity of story from referral through final claim. Pre-bill hard-stop checks reduce avoidable recoupment risk.',
  'Case Cards':
    'Research context: comparative examples train reviewers and clinicians to detect weak language patterns before they become denials. Contrast-based practice improves chart quality faster than policy reminders alone.',
  Takeaways:
    'Research context: organizations with repeatable QA loops, targeted retraining, and measurable control ownership sustain stronger compliance performance across episodes and payer audits.',
}

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const toKeywords = (card: (typeof TRAINING_CARDS)[number]) => {
  const words = `${card.title} ${card.section} ${card.objective} ${card.bullets.join(' ')}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 4)

  return Array.from(new Set(words)).slice(0, 12)
}

const cleanSentence = (value: string) => value.trim().replace(/\s+/g, ' ')

const toPracticePrompt = (card: (typeof TRAINING_CARDS)[number]) => {
  const firstPoint = card.bullets[0] ?? card.objective
  const secondPoint = card.bullets[1] ?? card.objective

  return cleanSentence(
    `Practice prompt: during documentation review, confirm that ${firstPoint.toLowerCase()} Then verify that ${secondPoint.toLowerCase()} State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.`,
  )
}

const toNarrationScript = (card: (typeof TRAINING_CARDS)[number], cardNumber: number) => {
  const sectionContext = SECTION_RESEARCH_CONTEXT[card.section] ??
    'Research context: documentation should remain patient-specific, measurable, and internally consistent across the record.'
  const bulletsText = card.bullets.map((item, index) => `Key point ${index + 1}: ${cleanSentence(item)}`).join(' ')
  const auditText = card.auditFocus ? `Audit focus: ${cleanSentence(card.auditFocus)}` : 'Audit focus: demonstrate objective rationale for coverage, care delivery, and claim defensibility.'
  const practicePrompt = toPracticePrompt(card)

  return cleanSentence(
    `Card ${cardNumber}: ${card.title}. Section: ${card.section}. Learning objective: ${cleanSentence(card.objective)} ${sectionContext} ${bulletsText} ${auditText} ${practicePrompt} Closing cue: document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.`,
  )
}

const toPocFocus = (card: (typeof TRAINING_CARDS)[number]): CardMetadata['pocFocus'] => {
  const bySection: Partial<Record<(typeof TRAINING_CARDS)[number]['section'], CardMetadata['pocFocus']>> = {
    'Regulatory Authority': {
      boxes: ['Diagnoses', 'Visit Frequency', 'Goals & Outcomes', 'Safety Measures', 'Orders/Signatures'],
      context:
        'These are the minimum high-risk boxes surveyors and auditors trace first when validating plan completeness under the CoPs and coverage framework.',
    },
    'Orders & Signatures': {
      boxes: ['Orders/Signatures', 'Visit Frequency', 'Treatments & Procedures'],
      context:
        'Ordering specificity and signature timing are objective controls. Missing or late authentication can trigger denials even when care delivery itself is clinically appropriate.',
    },
    Eligibility: {
      boxes: ['Homebound Status', 'Functional Limitations', 'Mental/Cognitive Status', 'Safety Measures'],
      context:
        'Eligibility documentation should show functional burden, taxing effort, and patient-specific risk logic, not generic homebound phrases.',
    },
    'Clinical Alignment': {
      boxes: ['Diagnoses', 'Goals & Outcomes', 'Visit Frequency', 'Treatments & Procedures'],
      context:
        'These boxes must mirror OASIS and visit-note findings so reviewers can follow one coherent clinical story from assessment to interventions.',
    },
    'Coding Context': {
      boxes: ['Diagnoses', 'Visit Frequency', 'Goals & Outcomes'],
      context:
        'Principal diagnosis and supporting conditions should match the dominant skilled driver documented in these plan elements to support defensible grouping and claims.',
    },
    'Service Planning': {
      boxes: ['Visit Frequency', 'Treatments & Procedures', 'Goals & Outcomes', 'Discharge Planning'],
      context:
        'Service design is most defensible when ordered intensity, intervention detail, and transition planning are explicitly connected to risk and expected progression.',
    },
    'Order Management': {
      boxes: ['Orders/Signatures', 'Treatments & Procedures', 'Visit Frequency'],
      context:
        'Verbal and interim order workflows should keep these boxes synchronized with active care to prevent unresolved order defects at billing.',
    },
    'Audit Readiness': {
      boxes: ['Orders/Signatures', 'Diagnoses', 'Visit Frequency', 'Goals & Outcomes', 'Homebound Status'],
      context:
        'Pre-bill review should prioritize these trace points because they are commonly cited in payment audits and recoupment actions.',
    },
    'Survey Readiness': {
      boxes: ['Safety Measures', 'Goals & Outcomes', 'Treatments & Procedures', 'Discharge Planning'],
      context:
        'Survey trace reviews typically validate whether identified risks appear in these boxes with measurable interventions and timely updates.',
    },
  }

  return bySection[card.section]
}

const estimateSeconds = (script: string) => {
  const words = script.split(/\s+/).filter(Boolean).length
  return Math.max(35, Math.round((words / TARGET_WPM) * 60))
}

export const CARD_METADATA: CardMetadata[] = TRAINING_CARDS.map((card, index) => {
  const cardNumber = index + 1
  const narrationScript = toNarrationScript(card, cardNumber)
  const wordCount = narrationScript.split(/\s+/).filter(Boolean).length
  const estimatedSeconds = estimateSeconds(narrationScript)
  const pocFocus = toPocFocus(card)

  return {
    cardId: `${String(cardNumber).padStart(2, '0')}-${toSlug(card.title)}`,
    cardNumber,
    title: card.title,
    section: card.section,
    objective: card.objective,
    keywords: toKeywords(card),
    narrationScript,
    wordCount,
    estimatedSeconds,
    pocFocus,
  }
})

export const CARD_METADATA_BY_ID = Object.fromEntries(CARD_METADATA.map((card) => [card.cardId, card]))

export const TOTAL_NARRATION_SECONDS = CARD_METADATA.reduce((total, card) => total + card.estimatedSeconds, 0)
export const TOTAL_NARRATION_MINUTES = Number((TOTAL_NARRATION_SECONDS / 60).toFixed(1))
export const NARRATION_TARGET_MINUTES = TARGET_TOTAL_MINUTES
