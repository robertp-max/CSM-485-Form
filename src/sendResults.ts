/* ── sendChallengeResults ──────────────────────────────────────
 *  Posts challenge results to /api/send-results (Vercel serverless).
 *  Falls back gracefully — never blocks the learner flow.
 * ───────────────────────────────────────────────────────────── */

export interface ChallengeResultPayload {
  learnerName?: string
  correct: string[]
  incorrect: string[]
  safetyFirst: boolean
  totalBoxes: number
  prize?: string
  timestamp: string
}

export async function sendChallengeResults(payload: ChallengeResultPayload): Promise<boolean> {
  try {
    const res = await fetch('/api/send-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.ok
  } catch (err) {
    console.warn('[sendChallengeResults] Network error — result not sent:', err)
    return false
  }
}
