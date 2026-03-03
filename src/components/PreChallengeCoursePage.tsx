import { useMemo } from 'react'
import { ArrowRight, BookOpen, CheckCircle2, Layers } from 'lucide-react'
import { TRAINING_CARDS } from '../data/trainingCards'
import { ProgressDots } from './ui'
import { gradient } from '../design-tokens'

interface Props {
  theme: 'day' | 'night'
  onContinue: () => void
  onBack?: () => void
}

function getSections() {
  const counts = new Map<string, number>()
  TRAINING_CARDS.forEach((card) => {
    if (!card.section) return
    counts.set(card.section, (counts.get(card.section) ?? 0) + 1)
  })
  return Array.from(counts.entries()).map(([name, count]) => ({ name, count }))
}

export default function PreChallengeCoursePage({ theme, onContinue, onBack }: Props) {
  const isNight = theme === 'night'
  const sections = useMemo(getSections, [])

  const p = isNight
    ? {
        bg: gradient.nightPanel,
        shell: 'rgba(1,8,8,0.55)',
        border: '#64F4F5',
        text: '#FAFBF8',
        textMuted: '#D9D6D5',
        accent: '#64F4F5',
        accent2: '#E56E2E',
        tile: 'rgba(255,255,255,0.03)',
        tileBorder: 'rgba(100,244,245,0.25)',
      }
    : {
        bg: 'var(--app-gradient)',
        shell: 'rgba(255,255,255,0)',
        border: '#C74601',
        text: '#1F1C1B',
        textMuted: '#524048',
        accent: '#007970',
        accent2: '#C74601',
        tile: '#ffffff',
        tileBorder: '#E5E4E3',
      }

  return (
    <div className="min-h-screen w-full px-5 md:px-10 py-8 md:py-12 flex items-center" style={{ background: p.bg, color: p.text }}>
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: isNight ? '#64F4F5' : '#C74601' }}>
              Onboarding
            </div>
            <div className="flex items-center gap-2 text-xl font-heading font-bold" style={{ color: p.text }}>
              3 <span className="text-sm font-normal" style={{ color: p.textMuted }}>/ 5</span>
            </div>
          </div>
          <ProgressDots current={2} isDark={isNight} />
        </div>

        <div
          className="w-full rounded-[32px] border-l-[4.3px] overflow-hidden"
          style={{
            background: p.shell,
            borderLeftColor: p.border,
            boxShadow: isNight ? '0 24px 90px rgba(0, 10, 10, 0.82)' : '0 24px 60px rgba(31, 28, 27, 0.12)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div className="px-6 md:px-10 pt-8 pb-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] mb-4" style={{ background: isNight ? '#002B2C' : '#E5FEFF', color: p.accent }}>
              <BookOpen className="w-3.5 h-3.5" /> Course Preview
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2" style={{ color: p.text }}>
              CMS-485 <span style={{ color: p.accent }}>Course Modules</span>
            </h2>
            <p className="text-sm max-w-2xl mx-auto leading-relaxed" style={{ color: p.textMuted }}>
              Review the chapters you&apos;ll cover before starting the two onboarding challenges.
            </p>
          </div>

          <div className="px-6 md:px-10 pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sections.map((section) => (
                <div
                  key={section.name}
                  className="rounded-2xl p-4 border"
                  style={{ background: p.tile, borderColor: p.tileBorder }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isNight ? 'rgba(100,244,245,0.12)' : '#E5FEFF' }}>
                      <Layers className="w-4.5 h-4.5" style={{ color: p.accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-sm font-bold leading-tight mb-0.5" style={{ color: p.text }}>
                        {section.name}
                      </h3>
                      <p className="text-[11px]" style={{ color: p.textMuted }}>{section.count} topics</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 mt-0.5" style={{ color: p.accent2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 md:px-10 pb-8 flex items-center justify-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="px-6 py-3 rounded-[14px] text-sm font-bold uppercase tracking-widest border"
                style={{ borderColor: p.tileBorder, color: p.text }}
              >
                Back
              </button>
            )}
            <button
              onClick={onContinue}
              className="group px-8 py-3 rounded-[14px] text-white text-sm font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, rgba(0,121,112,0.92), rgba(0,92,85,0.92))`,
                boxShadow: '0 16px 40px -12px rgba(0,121,112,0.55)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              Start Layout Challenge <ArrowRight className="inline w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
