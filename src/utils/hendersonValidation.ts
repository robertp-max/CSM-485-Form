import { HENDERSON_BOXES, ANSWER_CHIPS, SAFETY_ALERT } from '../data/hendersonData'
import type { HendersonBox } from '../data/hendersonData'

/* ── Submission result ─────────────────────────────────── */
export type SubmissionResult = {
  correct: string[]
  incorrect: string[]
  safetyFirst: boolean
  safetyAlertTriggered: boolean
  score: number
  total: number
  confidenceLevel: 'master' | 'proficient' | 'developing' | 'needs-review'
  /** Per-box remediation messages for incorrect answers */
  remediations: { boxId: string; chipId: string; message: string }[]
}

/* ── Typed field definition ────────────────────────────── */
export type TypedFieldDef = {
  id: string
  label: string
  type: 'text' | 'date' | 'textarea' | 'select'
  placeholder?: string
  options?: string[]
  required: boolean
  section: string
}

/* ── CMS-485 typed fields (non-Henderson) ──────────────── */
export const CMS485_TYPED_FIELDS: TypedFieldDef[] = [
  { id: 'patient-hic', label: 'Box 1 · Patient HIC Number', type: 'text', placeholder: 'XXX-XX-XXXX-A', required: true, section: 'Patient Identifiers' },
  { id: 'soc-date', label: 'Box 2 · Start of Care Date', type: 'date', required: true, section: 'Patient Identifiers' },
  { id: 'cert-from', label: 'Box 3 · Certification From', type: 'date', required: true, section: 'Patient Identifiers' },
  { id: 'cert-to', label: 'Box 3 · Certification To', type: 'date', required: true, section: 'Patient Identifiers' },
  { id: 'med-record', label: 'Box 4 · Medical Record Number', type: 'text', placeholder: 'MR-2026-XXXX', required: true, section: 'Patient Identifiers' },
  { id: 'provider-num', label: 'Box 5 · Provider Number', type: 'text', placeholder: '10-XXXX', required: true, section: 'Patient Identifiers' },
  { id: 'patient-name', label: 'Box 6 · Patient Full Name', type: 'text', placeholder: 'Last, First M.', required: true, section: 'Demographics' },
  { id: 'patient-dob', label: 'Box 6 · Date of Birth', type: 'date', required: true, section: 'Demographics' },
  { id: 'patient-address', label: 'Box 6 · Patient Address', type: 'text', placeholder: 'Street, City, State ZIP', required: true, section: 'Demographics' },
  { id: 'other-dx', label: 'Box 9 · Other Pertinent Diagnoses', type: 'textarea', placeholder: 'List secondary diagnoses with ICD-10 codes (e.g., N18.3 CKD Stage 3, I10 Essential HTN)', required: true, section: 'Clinical' },
  { id: 'dme-supplies', label: 'Box 10 · DME and Supplies', type: 'textarea', placeholder: 'List durable medical equipment and supplies needed...', required: true, section: 'Clinical' },
  { id: 'nutritional', label: 'Box 12 · Nutritional Requirements', type: 'text', placeholder: 'e.g., ADA diet, Low Na <2g, fluid restriction 1.5L', required: true, section: 'Clinical' },
  { id: 'allergies', label: 'Box 13 · Allergies', type: 'text', placeholder: 'List all known allergies and reactions', required: true, section: 'Clinical' },
  { id: 'mental-status', label: 'Box 16 · Mental Status', type: 'select', options: ['Oriented x3', 'Confused intermittently', 'Agitated', 'Depressed', 'Forgetful', 'Anxious'], required: true, section: 'Functional' },
  { id: 'prognosis', label: 'Box 17 · Prognosis', type: 'select', options: ['Good', 'Fair', 'Guarded', 'Poor'], required: true, section: 'Functional' },
  { id: 'homebound', label: 'Box 17 · Homebound Reason', type: 'textarea', placeholder: 'Describe taxing effort and functional limitations justifying homebound status...', required: true, section: 'Functional' },
  { id: 'goals', label: 'Box 18b · Goals / Rehab Potential / Discharge Plan', type: 'textarea', placeholder: 'Write measurable, time-bound goals linked to interventions...', required: true, section: 'Goals & Orders' },
  { id: 'physician-name', label: 'Box 22 · Physician Name', type: 'text', placeholder: 'Dr. Full Name, MD', required: true, section: 'Authentication' },
  { id: 'physician-date', label: 'Box 23 · Physician Signature Date', type: 'date', required: true, section: 'Authentication' },
  { id: 'attending-nurse', label: 'Box 19 · Attending RN / Date', type: 'text', placeholder: 'Name, RN BSN, MM/DD/YYYY', required: true, section: 'Authentication' },
]

/* ── Group typed fields by section ─────────────────────── */
export function getFieldsBySection(): { section: string; fields: TypedFieldDef[] }[] {
  const map = new Map<string, TypedFieldDef[]>()
  for (const f of CMS485_TYPED_FIELDS) {
    const arr = map.get(f.section) ?? []
    arr.push(f)
    map.set(f.section, arr)
  }
  return Array.from(map, ([section, fields]) => ({ section, fields }))
}

/* ── Henderson placement validation (UPDATED) ─────────── */
export function validatePlacements(
  placements: Record<string, string>,
  safetyPlacedOrder: string[],
): SubmissionResult {
  const correct: string[] = []
  const incorrect: string[] = []
  const remediations: { boxId: string; chipId: string; message: string }[] = []

  for (const box of HENDERSON_BOXES) {
    const chipId = placements[box.id]
    if (chipId === box.correctChipId) {
      correct.push(box.id)
    } else {
      incorrect.push(box.id)
      // Find specific remediation for the chosen wrong answer
      if (chipId) {
        const remediation = box.remediation.find(r => r.wrongChipId === chipId)
        if (remediation) {
          remediations.push({ boxId: box.id, chipId, message: remediation.wrongExplanation })
        } else {
          // Fallback to first remediation if no specific match
          const fallback = box.remediation[0]
          if (fallback) {
            remediations.push({ boxId: box.id, chipId, message: fallback.wrongExplanation })
          }
        }
      }
    }
  }

  // Safety-first constraint: box-24 must be placed BEFORE box-18
  const safetyIdx = safetyPlacedOrder.indexOf('box-24')
  const woundIdx = safetyPlacedOrder.indexOf('box-18')
  const safetyFirst = safetyIdx >= 0 && (woundIdx < 0 || safetyIdx < woundIdx)

  // Safety alert: triggered if box-18 was placed before box-24
  const safetyAlertTriggered = woundIdx >= 0 && (safetyIdx < 0 || woundIdx < safetyIdx)

  const score = correct.length + (safetyFirst ? 1 : 0)
  const total = HENDERSON_BOXES.length + 1 // +1 for safety-first ordering

  let confidenceLevel: SubmissionResult['confidenceLevel']
  if (score === total) confidenceLevel = 'master'
  else if (score >= total - 1) confidenceLevel = 'proficient'
  else if (score >= total - 2) confidenceLevel = 'developing'
  else confidenceLevel = 'needs-review'

  return { correct, incorrect, safetyFirst, safetyAlertTriggered, score, total, confidenceLevel, remediations }
}

/* ── Safety Alert Data (re-export for use in UI) ──────── */
export { SAFETY_ALERT } from '../data/hendersonData'

/* ── Typed field validation ────────────────────────────── */
export function validateTypedField(fieldId: string, value: string): { valid: boolean; message: string } {
  if (!value.trim()) {
    return { valid: false, message: 'This field is required.' }
  }

  if (['soc-date', 'cert-from', 'cert-to', 'patient-dob', 'physician-date'].includes(fieldId)) {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) {
      return { valid: false, message: 'Enter a valid date.' }
    }
  }

  return { valid: true, message: '' }
}

/* ── Remediation lookup (UPDATED) ──────────────────────── */
export function getBoxRemediation(box: HendersonBox, chipId: string) {
  const chip = ANSWER_CHIPS.find((c) => c.id === chipId)
  if (!chip) return null

  // Direct match by chipId in the remediation array
  const directMatch = box.remediation.find((r) => r.wrongChipId === chipId)
  if (directMatch) return directMatch

  // Fallback: fuzzy match by label
  const fuzzyMatch = box.remediation.find((r) =>
    chip.label.toLowerCase().includes(r.wrongLabel.split(' ')[0].toLowerCase()),
  )

  return fuzzyMatch ?? box.remediation[0] ?? null
}

/* ── Correct chip lookup ───────────────────────────────── */
export function getCorrectChipForBox(boxId: string) {
  const box = HENDERSON_BOXES.find((b) => b.id === boxId)
  if (!box) return null
  return ANSWER_CHIPS.find((c) => c.id === box.correctChipId) ?? null
}

/* ── Progress calculation ──────────────────────────────── */
export function calcProgress(
  placements: Record<string, string>,
  typedFields: Record<string, string>,
): { percent: number; typedDone: number; typedTotal: number; hendersonDone: number; hendersonTotal: number } {
  const requiredTyped = CMS485_TYPED_FIELDS.filter((f) => f.required)
  const typedDone = requiredTyped.filter((f) => (typedFields[f.id] ?? '').trim().length > 0).length
  const typedTotal = requiredTyped.length

  const hendersonDone = HENDERSON_BOXES.filter((b) => placements[b.id]).length
  const hendersonTotal = HENDERSON_BOXES.length

  const total = typedTotal + hendersonTotal
  const done = typedDone + hendersonDone
  const percent = total > 0 ? Math.round((done / total) * 100) : 0

  return { percent, typedDone, typedTotal, hendersonDone, hendersonTotal }
}
