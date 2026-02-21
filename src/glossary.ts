export const glossary: Record<string, string> = {
  VO: 'Verbal/Oral Order: spoken order requiring written trace and timely authentication.',
  PRN: 'As-needed order requiring explicit trigger, bounds, and follow-up documentation.',
  POC: 'Plan of Care: patient-specific clinical roadmap with measurable goals, interventions, and frequencies.',
  HHA: 'Home Health Aide services: task-level support delivered under the supervision of skilled disciplines.',
  FTF: 'Face-to-Face encounter supporting eligibility/certification with timing and relevance controls.',
  PDGM: 'Patient-Driven Groupings Model: payment grouping framework based on clinical/coding factors.',
  CoP: 'Conditions of Participation: operational and quality requirements for Medicare-participating agencies.',
  SOC: 'Start of Care: opening assessment and plan-of-care establishment point for an episode.',
  LUPA: 'Low Utilization Payment Adjustment: payment adjustment when visit threshold is not met.',
  homebound: 'Coverage concept requiring qualifying barriers and considerable effort to leave home.',
  'skilled need': 'Clinical requirement that services need professional judgment and are reasonable/necessary.',
}

export const glossaryTerms = Object.keys(glossary).sort((a, b) => b.length - a.length)
