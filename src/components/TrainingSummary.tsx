/**
 * TrainingSummary.tsx — Full-bleed summary card showing all challenge results,
 * timing, score improvement, and Moodle/SCORM readiness status.
 * Designed to render inline inside the glass card shell.
 */
import { useEffect, useState } from 'react'
import {
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  Send,
  ShieldCheck,
  Target,
  TrendingUp,
  Trophy,
  XCircle,
} from 'lucide-react'
import { getAllResults, buildMoodlePayload, type ChallengeRecord, type MoodlePayload } from '../utils/challengeStore'

/* ─── Helpers ────────────────────────────────────────────────── */
const fmtDuration = (sec: number | null): string => {
  if (sec === null || sec === 0) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}

const fmtScore = (score: number | null): string => {
  if (score === null) return '—'
  return `${score}%`
}

const stageIcon = (stage: string) => {
  switch (stage) {
    case 'layout-challenge': return <Layers className="w-5 h-5" />
    case 'henderson-challenge': return <FileText className="w-5 h-5" />
    case 'training-cards': return <Target className="w-5 h-5" />
    case 'final-test': return <BarChart3 className="w-5 h-5" />
    case 'final-exam': return <Trophy className="w-5 h-5" />
    default: return <FileText className="w-5 h-5" />
  }
}

/* ─── Component ──────────────────────────────────────────────── */
export default function TrainingSummary({ isDarkMode: isDark = false }: { isDarkMode?: boolean } = {}) {
  const [results, setResults] = useState<ChallengeRecord[]>([])
  const [payload, setPayload] = useState<MoodlePayload | null>(null)
  const [showPayload, setShowPayload] = useState(false)

  useEffect(() => {
    setResults(getAllResults())
    setPayload(buildMoodlePayload())
  }, [])

  // Colours
  const teal = '#007970'
  const orange = '#C74601'
  const textPrimary = isDark ? '#FAFBF8' : '#1F1C1B'
  const textMuted = isDark ? '#94A3B8' : '#524048'
  const textDim = isDark ? '#475569' : '#B8B4B2'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.55)'
  const cardBorder = isDark ? '#1E3A3B' : '#D9D6D5'
  const surfaceBg = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.4)'
  const greenBg = isDark ? 'rgba(0,121,112,0.15)' : 'rgba(0,121,112,0.08)'
  const redBg = isDark ? 'rgba(215,1,1,0.15)' : 'rgba(215,1,1,0.08)'

  const completedCount = results.filter(r => r.completedAt).length
  const totalStages = results.length
  const improvement = payload?.improvement

  return (
    <div className="w-full h-full overflow-y-auto px-4 py-8 md:px-8 md:py-10">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&family=Roboto:wght@300;400;500;700&display=swap');
        .font-heading { font-family: 'Montserrat', sans-serif; }
        .font-body { font-family: 'Roboto', sans-serif; }
      `}</style>

      <div className="max-w-4xl mx-auto font-body space-y-8">

        {/* ── Header ────────────────────────────────── */}
        <div className="text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 mb-5 shadow-sm"
            style={{ borderColor: `${teal}66`, background: `${teal}15`, color: isDark ? '#64F4F5' : teal }}
          >
            <Award className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Training Summary</span>
          </div>

          <h1 className="font-heading text-3xl md:text-4xl font-black mb-3" style={{ color: textPrimary }}>
            Your Learning Journey
          </h1>
          <p className="text-base font-light max-w-xl mx-auto" style={{ color: textMuted }}>
            Performance across all challenges — from baseline through certification.
          </p>
        </div>

        {/* ── Overall Stats Row ────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Stages Done', value: `${completedCount}/${totalStages}`, icon: <CheckCircle2 className="w-5 h-5" />, accent: teal },
            { label: 'Overall Score', value: fmtScore(payload?.overallScore ?? null), icon: <BarChart3 className="w-5 h-5" />, accent: (payload?.overallScore ?? 0) >= 80 ? teal : orange },
            { label: 'Total Time', value: fmtDuration(payload?.totalDurationSec ?? null), icon: <Clock className="w-5 h-5" />, accent: textMuted },
            { label: 'Status', value: payload?.overallPassed ? 'PASSED' : completedCount === totalStages ? 'REVIEW' : 'IN PROGRESS', icon: payload?.overallPassed ? <ShieldCheck className="w-5 h-5" /> : <Target className="w-5 h-5" />, accent: payload?.overallPassed ? teal : orange },
          ].map((stat, i) => (
            <div key={i} className="rounded-[16px] border p-4 text-center" style={{ background: cardBg, borderColor: cardBorder }}>
              <div className="flex justify-center mb-2" style={{ color: stat.accent }}>{stat.icon}</div>
              <p className="font-heading text-xl font-black" style={{ color: textPrimary }}>{stat.value}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest mt-1" style={{ color: textDim }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Improvement Banner ──────────────────── */}
        {improvement && improvement.baselineScore !== null && improvement.finalScore !== null && (
          <div
            className="rounded-[20px] border p-5 flex flex-col sm:flex-row items-center gap-4"
            style={{
              background: (improvement.deltaPercent ?? 0) >= 0 ? greenBg : redBg,
              borderColor: (improvement.deltaPercent ?? 0) >= 0 ? `${teal}55` : '#D7010155',
            }}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8" style={{ color: (improvement.deltaPercent ?? 0) >= 0 ? teal : '#D70101' }} />
              <div>
                <h3 className="font-heading font-bold text-lg" style={{ color: textPrimary }}>
                  {(improvement.deltaPercent ?? 0) >= 0 ? 'Score Improvement' : 'Score Comparison'}
                </h3>
                <p className="text-sm" style={{ color: textMuted }}>
                  Baseline (Layout + Henderson avg) → Final Exam
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 ml-auto">
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: textDim }}>Baseline</p>
                <p className="font-heading text-2xl font-black" style={{ color: textMuted }}>{improvement.baselineScore}%</p>
              </div>
              <div className="text-2xl font-bold" style={{ color: textDim }}>→</div>
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: textDim }}>Final</p>
                <p className="font-heading text-2xl font-black" style={{ color: (improvement.deltaPercent ?? 0) >= 0 ? teal : '#D70101' }}>{improvement.finalScore}%</p>
              </div>
              <div
                className="rounded-full px-3 py-1 text-sm font-bold"
                style={{
                  background: (improvement.deltaPercent ?? 0) >= 0 ? `${teal}22` : '#D7010122',
                  color: (improvement.deltaPercent ?? 0) >= 0 ? teal : '#D70101',
                }}
              >
                {(improvement.deltaPercent ?? 0) >= 0 ? '+' : ''}{improvement.deltaPercent}%
              </div>
            </div>
          </div>
        )}

        {/* ── Stage Breakdown Table ───────────────── */}
        <div className="rounded-[20px] border overflow-hidden" style={{ background: cardBg, borderColor: cardBorder }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: cardBorder }}>
            <h3 className="font-heading font-bold text-sm uppercase tracking-widest flex items-center gap-2" style={{ color: orange }}>
              <Layers className="w-4 h-4" /> Stage Breakdown
            </h3>
          </div>

          <div className="divide-y" style={{ borderColor: cardBorder }}>
            {results.map((rec) => {
              const done = rec.completedAt !== null
              return (
                <div key={rec.stage} className="px-5 py-4 flex items-center gap-4" style={{ borderColor: cardBorder }}>
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: done ? `${teal}15` : surfaceBg, color: done ? teal : textDim }}
                  >
                    {stageIcon(rec.stage)}
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-sm truncate" style={{ color: textPrimary }}>{rec.label}</p>
                    <p className="text-xs" style={{ color: textMuted }}>
                      {done
                        ? `${rec.correct}/${rec.total} correct · ${fmtDuration(rec.durationSec)}`
                        : 'Not yet attempted'
                      }
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0 w-16">
                    <p className="font-heading text-lg font-black" style={{ color: done ? (rec.passed ? teal : '#D70101') : textDim }}>
                      {fmtScore(rec.score)}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className="flex-shrink-0">
                    {done ? (
                      rec.passed ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: greenBg, color: teal }}>
                          <CheckCircle2 className="w-3 h-3" /> Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: redBg, color: '#D70101' }}>
                          <XCircle className="w-3 h-3" /> Review
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: surfaceBg, color: textDim }}>
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Moodle / SCORM Section ─────────────── */}
        <div className="rounded-[20px] border p-5" style={{ background: cardBg, borderColor: cardBorder }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-sm uppercase tracking-widest flex items-center gap-2" style={{ color: teal }}>
              <Send className="w-4 h-4" /> Moodle / LMS Integration
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1" style={{ background: `${orange}22`, color: orange }}>
              Not Connected
            </span>
          </div>

          <p className="text-sm mb-4" style={{ color: textMuted }}>
            When Moodle is configured, your results will be automatically sent via SCORM 1.2 / 2004.
            The payload below shows what will be transmitted.
          </p>

          <button
            onClick={() => setShowPayload(!showPayload)}
            className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-[10px] border transition-all hover:opacity-80"
            style={{ borderColor: cardBorder, color: isDark ? '#64F4F5' : teal, background: surfaceBg }}
          >
            {showPayload ? 'Hide' : 'Preview'} SCORM Payload
          </button>

          {showPayload && payload && (
            <div className="mt-4 rounded-[12px] border p-4 overflow-x-auto" style={{ background: isDark ? 'rgba(0,0,0,0.3)' : '#F7F6F5', borderColor: cardBorder }}>
              <pre className="text-[11px] leading-relaxed whitespace-pre-wrap break-all" style={{ color: textMuted }}>
                {JSON.stringify(payload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* ── Footer Note ────────────────────────── */}
        <div className="text-center py-4">
          <p className="text-xs" style={{ color: textDim }}>
            Results are stored locally and will be transmitted to your LMS when SCORM is configured.
          </p>
        </div>

      </div>
    </div>
  )
}
