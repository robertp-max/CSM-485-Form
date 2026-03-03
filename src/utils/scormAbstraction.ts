/**
 * scormAbstraction.ts — SCORM Mapping Abstraction Layer
 * ══════════════════════════════════════════════════════════════
 * Prepares the SCORM integration layer for later implementation.
 * Maps internal training data to SCORM 1.2 CMI fields.
 *
 * NOT YET CONNECTED — this is a preparation layer only.
 * After full flow wiring is complete, connect to actual SCORM API.
 *
 * Supported CMI fields:
 *   cmi.core.lesson_status
 *   cmi.core.score.raw
 *   cmi.core.session_time
 *   cmi.suspend_data
 */

import { getAllResults, buildMoodlePayload } from './challengeStore'

// ─── Types ───────────────────────────────────────────────────

export type ScormLessonStatus =
  | 'not attempted'
  | 'incomplete'
  | 'completed'
  | 'passed'
  | 'failed'

export interface ScormDataMap {
  /** cmi.core.lesson_status */
  lessonStatus: ScormLessonStatus
  /** cmi.core.score.raw (0-100) */
  scoreRaw: number
  /** cmi.core.session_time (ISO 8601 duration: PTxHxMxS) */
  sessionTime: string
  /** cmi.suspend_data (JSON string for resume) */
  suspendData: string
}

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Convert seconds to SCORM 1.2 session_time format: HHHH:MM:SS.SS
 */
function secondsToScormTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(4, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.00`
}

/**
 * Determine SCORM lesson_status from internal results
 */
function determineLessonStatus(): ScormLessonStatus {
  const results = getAllResults()
  const allCompleted = results.every(r => r.completedAt != null)
  const allPassed = results.every(r => r.passed)
  const anyStarted = results.some(r => r.startedAt != null)

  if (!anyStarted) return 'not attempted'
  if (!allCompleted) return 'incomplete'
  if (allPassed) return 'passed'
  return 'completed'
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Build the complete SCORM data map from current training state.
 * This is the abstraction layer — call this when ready to persist to SCORM.
 */
export function buildScormDataMap(): ScormDataMap {
  const payload = buildMoodlePayload()
  const results = getAllResults()

  const lessonStatus = determineLessonStatus()
  const scoreRaw = payload.overallScore
  const sessionTime = secondsToScormTime(payload.totalDurationSec)

  // Suspend data: compact summary for session resume
  const suspendData = JSON.stringify({
    v: 1,
    phase: lessonStatus,
    stages: results.map(r => ({
      s: r.stage,
      p: r.passed,
      sc: r.score,
    })),
    ts: Date.now(),
  })

  return {
    lessonStatus,
    scoreRaw,
    sessionTime,
    suspendData,
  }
}

/**
 * Get individual SCORM CMI values for field-by-field integration.
 */
export function getScormField(field: keyof ScormDataMap): string | number {
  const map = buildScormDataMap()
  return map[field]
}

/**
 * Debug: Print SCORM mapping to console.
 * Use during development to verify data before connecting to actual SCORM API.
 */
export function debugScormMapping(): void {
  const map = buildScormDataMap()
  console.group('SCORM Abstraction Layer — Current Mapping')
  console.log('cmi.core.lesson_status:', map.lessonStatus)
  console.log('cmi.core.score.raw:', map.scoreRaw)
  console.log('cmi.core.session_time:', map.sessionTime)
  console.log('cmi.suspend_data:', map.suspendData)
  console.log('suspend_data (parsed):', JSON.parse(map.suspendData))
  console.groupEnd()
}

/**
 * Placeholder: Call this function when SCORM API is available.
 * After flow wiring is complete, replace the body with actual SCORM API calls.
 *
 * Example future implementation:
 * ```ts
 * const api = findApi<ScormAPI>('API')
 * if (api) {
 *   api.LMSSetValue('cmi.core.lesson_status', map.lessonStatus)
 *   api.LMSSetValue('cmi.core.score.raw', String(map.scoreRaw))
 *   api.LMSSetValue('cmi.core.session_time', map.sessionTime)
 *   api.LMSSetValue('cmi.suspend_data', map.suspendData)
 *   api.LMSCommit('')
 * }
 * ```
 */
export function persistToScorm(): { success: boolean; message: string } {
  const map = buildScormDataMap()
  // NOT YET IMPLEMENTED — log only
  console.log('[SCORM Abstraction] Would persist:', map)
  return {
    success: false,
    message: 'SCORM persistence not yet connected. Abstraction layer ready.',
  }
}
