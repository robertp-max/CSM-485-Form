/**
 * challengeStore.ts — Centralized challenge result persistence
 * Stores timing, scores, and completion data for all challenge stages.
 * localStorage-backed so it survives refresh. SCORM-ready payload export.
 */

const STORE_KEY = 'cihh.challengeResults'

export type ChallengeStage =
  | 'layout-challenge'
  | 'henderson-challenge'
  | 'training-cards'
  | 'final-test'
  | 'final-exam'

export interface ChallengeRecord {
  stage: ChallengeStage
  label: string
  /** Start timestamp (ms since epoch) */
  startedAt: number | null
  /** End timestamp (ms since epoch) */
  completedAt: number | null
  /** Duration in seconds */
  durationSec: number | null
  /** Score 0-100 */
  score: number | null
  /** Correct / Total */
  correct: number | null
  total: number | null
  /** Whether the learner passed this stage */
  passed: boolean
  /** Extra metadata */
  meta?: Record<string, unknown>
}

const DEFAULTS: ChallengeRecord[] = [
  { stage: 'layout-challenge', label: 'Layout Challenge', startedAt: null, completedAt: null, durationSec: null, score: null, correct: null, total: null, passed: false },
  { stage: 'henderson-challenge', label: 'Henderson Challenge', startedAt: null, completedAt: null, durationSec: null, score: null, correct: null, total: null, passed: false },
  { stage: 'training-cards', label: 'Training Card Challenges', startedAt: null, completedAt: null, durationSec: null, score: null, correct: null, total: null, passed: false },
  { stage: 'final-test', label: 'Final Test', startedAt: null, completedAt: null, durationSec: null, score: null, correct: null, total: null, passed: false },
  { stage: 'final-exam', label: 'Clinical Audit Simulator', startedAt: null, completedAt: null, durationSec: null, score: null, correct: null, total: null, passed: false },
]

function load(): ChallengeRecord[] {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ChallengeRecord[]
      // Ensure all stages exist (merge with defaults for forward-compat)
      return DEFAULTS.map(d => {
        const found = parsed.find(p => p.stage === d.stage)
        return found ? { ...d, ...found } : d
      })
    }
  } catch { /* corrupted — reset */ }
  return DEFAULTS.map(d => ({ ...d }))
}

function save(records: ChallengeRecord[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(records))
}

/** Get all challenge records */
export function getAllResults(): ChallengeRecord[] {
  return load()
}

/** Get a single stage result */
export function getResult(stage: ChallengeStage): ChallengeRecord {
  return load().find(r => r.stage === stage) ?? DEFAULTS.find(d => d.stage === stage)!
}

/** Mark stage as started (records timestamp) */
export function markStarted(stage: ChallengeStage) {
  const records = load()
  const rec = records.find(r => r.stage === stage)
  if (rec && !rec.startedAt) {
    rec.startedAt = Date.now()
  }
  save(records)
}

/** Record stage completion */
export function markCompleted(
  stage: ChallengeStage,
  data: { score: number; correct: number; total: number; passed: boolean; meta?: Record<string, unknown> }
) {
  const records = load()
  const rec = records.find(r => r.stage === stage)
  if (rec) {
    const now = Date.now()
    rec.completedAt = now
    rec.durationSec = rec.startedAt ? Math.round((now - rec.startedAt) / 1000) : null
    rec.score = data.score
    rec.correct = data.correct
    rec.total = data.total
    rec.passed = data.passed
    rec.meta = data.meta
  }
  save(records)
}

/** Clear all results (for retake) */
export function resetAll() {
  localStorage.removeItem(STORE_KEY)
}

// ─── SCORM / Moodle Payload ──────────────────────────────────

export interface MoodlePayload {
  event: 'training.completed'
  module: 'CMS-485-Documentation'
  completedAt: string
  totalDurationSec: number
  stages: Array<{
    stage: ChallengeStage
    label: string
    durationSec: number | null
    score: number | null
    correct: number | null
    total: number | null
    passed: boolean
  }>
  overallScore: number
  overallPassed: boolean
  improvement: {
    baselineScore: number | null
    finalScore: number | null
    deltaPercent: number | null
  }
}

/**
 * Build a Moodle/SCORM-ready payload from all challenge results.
 * This can be sent via SCORM API, webhook, or xAPI when Moodle is configured.
 */
export function buildMoodlePayload(): MoodlePayload {
  const records = load()
  const completed = records.filter(r => r.completedAt)

  const totalDuration = completed.reduce((sum, r) => sum + (r.durationSec ?? 0), 0)

  // Baseline = average of layout + henderson
  const layout = records.find(r => r.stage === 'layout-challenge')
  const henderson = records.find(r => r.stage === 'henderson-challenge')
  const baselineScores = [layout?.score, henderson?.score].filter((s): s is number => s !== null)
  const baselineScore = baselineScores.length > 0 ? Math.round(baselineScores.reduce((a, b) => a + b, 0) / baselineScores.length) : null

  // Final = final-exam score
  const finalExam = records.find(r => r.stage === 'final-exam')
  const finalScore = finalExam?.score ?? null

  const deltaPercent = baselineScore !== null && finalScore !== null ? finalScore - baselineScore : null

  // Overall: weighted average of all completed stages
  const allScores = completed.map(r => r.score).filter((s): s is number => s !== null)
  const overallScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0
  const overallPassed = completed.length === records.length && completed.every(r => r.passed)

  return {
    event: 'training.completed',
    module: 'CMS-485-Documentation',
    completedAt: new Date().toISOString(),
    totalDurationSec: totalDuration,
    stages: records.map(r => ({
      stage: r.stage,
      label: r.label,
      durationSec: r.durationSec,
      score: r.score,
      correct: r.correct,
      total: r.total,
      passed: r.passed,
    })),
    overallScore,
    overallPassed,
    improvement: {
      baselineScore,
      finalScore,
      deltaPercent,
    },
  }
}
