export type FinalTestQuestion = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  rationale: string
}

export const FINAL_TEST_TITLE = 'Final Test'

export const FINAL_TEST_OBJECTIVE =
  'Validate mastery of final operational priorities by applying the daily habits, leadership controls, and defensibility standards from the expanded Takeaways content.'

export const FINAL_TEST_KEY_POINTS = [
  'Daily documentation must include skilled rationale, intervention details, and patient response every visit.',
  'Discrepancies should be escalated and reconciled immediately while the clinical picture is fresh.',
  'Leadership controls require metric surveillance, focused retraining, and one source of truth.',
]

export const FINAL_TEST_CLINICAL_LENS =
  'Test decisions against one standard: clear, complete, and clinically coherent documentation at every step of the episode lifecycle.'

export const FINAL_TEST_QUESTIONS: FinalTestQuestion[] = [
  { id:'ft-1', prompt:'Which 3 elements must be clearly documented in every visit note?', options:['Skilled rationale, intervention details, and patient response','Staffing level, room setup, and patient preference','Billing code, payer tier, and episode length','Device brand, visit route, and chart color'], correctIndex:0, rationale:'Daily habits in the Takeaways require these three elements to be explicit before closing a note.' },
  { id:'ft-2', prompt:'When should OASIS-to-POC or order discrepancies be reconciled?', options:['At discharge when all notes are complete','Immediately, not deferred to episode end','Only if a payer requests clarification','During annual policy review meetings'], correctIndex:1, rationale:'The expanded content states problems age poorly, so discrepancies should be escalated and fixed today.' },
  { id:'ft-3', prompt:'Before major episode milestones, what self-audit behavior is expected?', options:['Review chart as an auditor would for narrative coherence and required elements','Only verify signature dates','Wait for manager review before checking anything','Copy the previous milestone documentation'], correctIndex:0, rationale:'The Takeaways call for structured self-audit habits through an auditor lens at SOC, recert, and discharge.' },
  { id:'ft-4', prompt:'Which leadership control is explicitly required for sustained compliance?', options:['Monthly social media updates','Tracking denial trends, signature timeliness, and order-aging metrics','Increasing visit volume targets each quarter','Rotating documentation templates weekly'], correctIndex:1, rationale:'Leadership controls in the expanded content prioritize routine metric monitoring to catch vulnerabilities early.' },
  { id:'ft-5', prompt:'How should retraining be delivered when chart deficiencies trend in one area?', options:['Use focused retraining tied to the specific deficiency pattern','Send one generic agency-wide reminder','Wait for survey findings to trigger education','Suspend all audits until quarter end'], correctIndex:0, rationale:'The content directs leaders to run targeted retraining rather than broad non-specific reminders.' },
  { id:'ft-6', prompt:'What is the purpose of maintaining a single source of truth for policy/workflow/checklists?', options:['Reduce team meetings','Ensure immediate, unified operational updates when regulations change','Eliminate physician involvement in revisions','Avoid documenting process changes'], correctIndex:1, rationale:'The Takeaways emphasize synchronized updates so the agency moves in unison with regulatory changes.' },
  { id:'ft-7', prompt:'According to the final operational priorities, defensibility is built through:', options:['High volume and rapid closure only','Consistency, clinical traceability, and timely order/signature governance','Minimal documentation with verbal clarification later','Separate standards by discipline'], correctIndex:1, rationale:'The final section explicitly defines this 3-part structure as the defensibility foundation.' },
  { id:'ft-8', prompt:'Which statement best reflects the recommended day-60 mindset?', options:['Documentation can relax after recertification','Apply the same framework as a repeatable standard across every episode','Move to summary-only charting near episode end','Focus on speed over narrative linkage'], correctIndex:1, rationale:'The expanded content says to keep the same defensible framework active across every episode without letting guard down.' },
  { id:'ft-9', prompt:'What does compliance-ready documentation protect, per the closing section?', options:['Only reimbursement cycle timing','Only survey outcomes','Clinician licenses, financial integrity, and patient safety/coordination','Only internal dashboard performance'], correctIndex:2, rationale:'The closing text links documentation quality to licensure protection, financial integrity, and safe coordinated care.' },
  { id:'ft-10', prompt:'What final audit standard should guide every chart touchpoint?', options:['Maximum note length','Narrative style preference by reviewer','Clear, complete, and clinically coherent documentation at every step','Template consistency regardless of patient specifics'], correctIndex:2, rationale:'The final audit focus is stated verbatim in the Key Takeaways and Next Actions expanded content.' },
]
