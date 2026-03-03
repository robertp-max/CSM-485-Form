/* ── SummaryPage — Post-Final Test Aggregate Metrics ───────────
 *  Displays after Final Test completion:
 *    - Layout Challenge Score
 *    - POC Writing Score
 *    - Final Test Score
 *    - Total Time Spent
 *    - Completion Percentage
 *    - Pass/Fail Status
 *
 *  Visually consistent with Final Test UI. Minimal metrics layout.
 * ─────────────────────────────────────────────────────────────── */

import { useEffect, useState } from 'react'
import {
  Award,
  CheckCircle2,
  Clock,
  FileText,
  Target,
  TrendingUp,
  XCircle,
  ArrowRight,
} from 'lucide-react'
import { getAllResults, buildMoodlePayload, type ChallengeRecord, type MoodlePayload } from '../utils/challengeStore'

interface SummaryPageProps {
  isDarkMode?: boolean
  onComplete?: () => void
}

function fmtDuration(sec: number | null): string {
  if (sec == null || sec <= 0) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function fmtScore(score: number | null): string {
  if (score == null) return '—'
  return `${score}%`
}

export default function SummaryPage({ isDarkMode = false, onComplete }: SummaryPageProps) {
  const [results, setResults] = useState<ChallengeRecord[]>([])
  const [payload, setPayload] = useState<MoodlePayload | null>(null)

  useEffect(() => {
    setResults(getAllResults())
    setPayload(buildMoodlePayload())
  }, [])

  const layout = results.find(r => r.stage === 'layout-challenge')
  const henderson = results.find(r => r.stage === 'henderson-challenge')
  const finalTest = results.find(r => r.stage === 'final-test')
  const finalExam = results.find(r => r.stage === 'final-exam')

  const overallScore = payload?.overallScore ?? 0
  const overallPassed = payload?.overallPassed ?? false
  const totalTime = payload?.totalDurationSec ?? 0
  const completedStages = results.filter(r => r.completedAt).length
  const totalStages = results.length
  const completionPct = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0

  const isDark = isDarkMode

  const cardBg = isDark ? 'bg-[#010808]/60' : 'bg-white/80'
  const cardBorder = isDark ? 'border-[#004142]' : 'border-[#E5E4E3]'
  const textPrimary = isDark ? 'text-[#FAFBF8]' : 'text-[#1F1C1B]'
  const textSecondary = isDark ? 'text-[#D9D6D5]' : 'text-[#747474]'
  const accentTeal = isDark ? 'text-[#64F4F5]' : 'text-[#007970]'
  const accentOrange = isDark ? 'text-[#E56E2E]' : 'text-[#C74601]'

  const stages = [
    { label: 'Layout Challenge', record: layout, icon: Target },
    { label: 'POC Writing (Henderson)', record: henderson, icon: FileText },
    { label: 'Final Test', record: finalTest, icon: CheckCircle2 },
    { label: 'Clinical Audit Sim', record: finalExam, icon: Award },
  ]

  return (
    <div className={`w-full max-w-3xl mx-auto px-6 py-10 space-y-8 ${isDark ? 'dark' : ''}`}>
      {/* Header */}
      <div className="text-center space-y-3">
        <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-md border-l-[3px] ${isDark ? 'border-l-[#64F4F5]' : 'border-l-[#007970]'} ${accentTeal} text-[0.75rem] font-bold uppercase tracking-[0.18em]`}>
          <Award className="w-4 h-4" /> Training Summary
        </div>
        <h1 className={`font-heading text-[2.2rem] font-bold tracking-tight ${textPrimary}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Your Results
        </h1>
        <p className={`text-base ${textSecondary} max-w-md mx-auto`}>
          Complete overview of your CMS-485 training performance.
        </p>
      </div>

      {/* Overall Status Banner */}
      <div className={`rounded-[24px] p-6 border-l-[4px] ${overallPassed ? (isDark ? 'border-l-[#64F4F5]' : 'border-l-[#007970]') : (isDark ? 'border-l-[#E56E2E]' : 'border-l-[#C74601]')} ${cardBg} backdrop-blur-xl border ${cardBorder} shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)]`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${overallPassed ? (isDark ? 'bg-[#004142]' : 'bg-[#E5FEFF]') : (isDark ? 'bg-[#3D1A00]' : 'bg-[#FFF2EB]')}`}>
              {overallPassed
                ? <CheckCircle2 className={`w-8 h-8 ${accentTeal}`} />
                : <XCircle className={`w-8 h-8 ${accentOrange}`} />
              }
            </div>
            <div>
              <p className={`font-heading font-bold text-[1.3rem] ${textPrimary}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {overallPassed ? 'Training Complete — Passed' : 'Training Incomplete'}
              </p>
              <p className={`text-sm ${textSecondary}`}>
                {completedStages} of {totalStages} stages completed
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-heading text-[2rem] font-bold ${overallPassed ? accentTeal : accentOrange}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {overallScore}%
            </p>
            <p className={`text-xs ${textSecondary} uppercase tracking-wider`}>Overall Score</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Clock, label: 'Total Time', value: fmtDuration(totalTime) },
          { icon: Target, label: 'Completion', value: `${completionPct}%` },
          { icon: TrendingUp, label: 'Improvement', value: payload?.improvement.deltaPercent != null ? `+${payload.improvement.deltaPercent}%` : '—' },
        ].map((m, i) => (
          <div key={i} className={`rounded-[20px] p-5 border-l-[3px] ${isDark ? 'border-l-[#004142]' : 'border-l-[#E5E4E3]'} ${cardBg} backdrop-blur-xl border ${cardBorder} text-center`}>
            <m.icon className={`w-5 h-5 mx-auto mb-2 ${accentTeal}`} />
            <p className={`font-heading font-bold text-[1.1rem] ${textPrimary}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>{m.value}</p>
            <p className={`text-[0.72rem] ${textSecondary} uppercase tracking-wider mt-1`}>{m.label}</p>
          </div>
        ))}
      </div>

      {/* Stage Breakdown */}
      <div className={`rounded-[24px] overflow-hidden border ${cardBorder} ${cardBg} backdrop-blur-xl`}>
        <div className="px-6 py-4 border-b border-inherit">
          <h2 className={`font-heading font-bold text-[1rem] uppercase tracking-wider ${textSecondary}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Stage Breakdown
          </h2>
        </div>
        <div className="divide-y divide-inherit">
          {stages.map((s, i) => {
            const rec = s.record
            const completed = rec?.completedAt != null
            const passed = rec?.passed ?? false
            return (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <s.icon className={`w-5 h-5 ${completed ? (passed ? accentTeal : accentOrange) : textSecondary}`} />
                  <div>
                    <p className={`font-heading font-semibold text-[0.92rem] ${textPrimary}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>{s.label}</p>
                    <p className={`text-[0.78rem] ${textSecondary}`}>
                      {completed ? `${rec?.correct ?? 0}/${rec?.total ?? 0} correct · ${fmtDuration(rec?.durationSec ?? null)}` : 'Not started'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-heading font-bold text-[1.1rem] ${completed ? (passed ? accentTeal : accentOrange) : textSecondary}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {fmtScore(rec?.score ?? null)}
                  </p>
                  {completed && (
                    <p className={`text-[0.7rem] uppercase tracking-wider ${passed ? accentTeal : accentOrange}`}>
                      {passed ? 'Passed' : 'Review'}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      {onComplete && (
        <div className="text-center pt-4">
          <button
            onClick={onComplete}
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-[#007970] hover:bg-[#006059] text-white font-bold text-base tracking-wide transition-all duration-300 hover:-translate-y-0.5 shadow-[0_12px_40px_rgba(0,121,112,0.25)] hover:shadow-[0_18px_44px_rgba(0,121,112,0.3)]"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Complete Training
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  )
}
