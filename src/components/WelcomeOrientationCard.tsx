/* ── WelcomeOrientationCard ────────────────────────────────────
 *  First screen in the MASTER FLOW. Replaces the old WelcomeBanner
 *  as the entry point after "Begin Training" on the Master the
 *  Plan of Care page. Glass-card design matching OnboardingCardFlow.
 *
 *  Props:
 *    onStart — called when the learner clicks "Begin Training"
 *    isDarkMode — current theme state
 * ─────────────────────────────────────────────────────────────── */

import { useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  HeartPulse,
  LayoutGrid,
  Settings,
  Shield,
  Sparkles,
} from 'lucide-react'

interface WelcomeOrientationCardProps {
  onStart: () => void
  isDarkMode?: boolean
}

export default function WelcomeOrientationCard({ onStart, isDarkMode = false }: WelcomeOrientationCardProps) {
  const [hovered, setHovered] = useState(false)

  const logo = isDarkMode
    ? 'https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_White.png'
    : 'https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_Gray.png'

  const glassPanel = (accentColor: string) =>
    `backdrop-blur-sm bg-white/[0.06] dark:bg-white/[0.04] rounded-[24px] p-5 border-l-[3.3px] ${accentColor} shadow-[0_7px_17px_-5px_rgba(31,28,27,0.15),0_0_16px_-10px_rgba(0,121,112,0.3)] dark:shadow-[0_7px_17px_-5px_rgba(0,0,0,0.4),0_0_16px_-10px_rgba(100,244,245,0.15)] hover:shadow-[0_14px_34px_-10px_rgba(31,28,27,0.3),0_0_28px_-6px_rgba(0,121,112,0.68)] dark:hover:shadow-[0_14px_34px_-10px_rgba(0,0,0,0.5),0_0_28px_-6px_rgba(100,244,245,0.35)] transition-all duration-300 hover:bg-white/[0.33] dark:hover:bg-white/[0.33] -translate-y-[1px] hover:-translate-y-[2px]`

  const milestones = [
    { Icon: Settings, label: 'Environment Setup', desc: 'Theme & audio configuration', accent: 'border-l-[#007970] dark:border-l-[#64F4F5]' },
    { Icon: LayoutGrid, label: 'Form Mastery', desc: 'CMS-485 structure challenge', accent: 'border-l-[#C74601] dark:border-l-[#E56E2E]' },
    { Icon: HeartPulse, label: 'Clinical Scenario', desc: 'Henderson patient case study', accent: 'border-l-[#524048] dark:border-l-[#64F4F5]' },
    { Icon: GraduationCap, label: 'Training Paths', desc: 'Card, Book & Interactive modes', accent: 'border-l-[#007970] dark:border-l-[#64F4F5]' },
  ] as const

  return (
    <div className={`w-full ${isDarkMode ? 'dark' : ''}`}>
      {/* Outer card shell — frosted glass matching OnboardingCardFlow */}
      <div
        className="relative w-full max-w-2xl mx-auto bg-white/0 dark:bg-[#010808]/55 backdrop-blur-2xl rounded-[32px] overflow-hidden border-l-[4.3px] px-8 py-10"
        style={{
          borderLeftColor: isDarkMode ? '#64F4F5' : '#C74601',
          boxShadow: isDarkMode
            ? '0 24px 90px rgba(0, 10, 10, 0.82)'
            : '0 24px 60px rgba(31, 28, 27, 0.12)',
        }}
      >
      <div className="space-y-8 text-center">
        {/* Logo + badge */}
        <div className="flex flex-col items-center gap-4">
          <img className="h-10 w-auto object-contain" src={logo} alt="CareIndeed Home Health" />
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-transparent backdrop-blur-md border-l-[3px] border-l-[#007970] dark:border-l-[#64F4F5] text-[#007970] dark:text-[#64F4F5] text-[0.75rem] font-bold uppercase tracking-[0.18em] shadow-[0_4px_14px_-6px_rgba(0,121,112,0.3)] dark:shadow-[0_4px_14px_-6px_rgba(100,244,245,0.2)]">
            <BookOpen className="w-4 h-4" /> CMS-485 Documentation Module
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-5">
          <h1 className="font-heading text-[2.8rem] md:text-[3.4rem] font-bold tracking-tight leading-[1.08]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Welcome to{' '}
            <span className="bg-gradient-to-r from-[#007970] via-[#00A89D] to-[#64F4F5] bg-clip-text text-transparent">
              Clinical Training
            </span>
          </h1>
          <p className="text-[#524048] dark:text-[#D9D6D5] text-[1.1rem] leading-[1.7] font-light max-w-lg mx-auto">
            This orientation prepares you for CareIndeed's CMS-485 documentation platform.
            You'll configure your environment, complete challenges, and prove clinical competency.
          </p>
        </div>

        {/* What you'll do — glass panels */}
        <div className="space-y-3 text-left">
          <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-[#747474] dark:text-[#D9D6D5] text-center">
            <Shield className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
            Training Milestones
          </p>
          <div className="grid grid-cols-2 gap-4">
            {milestones.map((m, i) => (
              <div key={i} className={glassPanel(m.accent) + ' flex items-start gap-3.5 !p-4'}>
                <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center flex-shrink-0">
                  <m.Icon className="w-5 h-5 text-[#007970] dark:text-[#64F4F5]" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-[0.92rem] mb-0.5 text-[#1F1C1B] dark:text-[#FAFBF8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{m.label}</p>
                  <p className="text-[0.8rem] text-[#747474] dark:text-[#D9D6D5] leading-snug">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orientation points */}
        <div className="backdrop-blur-sm bg-white/[0.06] dark:bg-white/[0.04] rounded-[20px] p-5 border-l-[3px] border-l-[#C74601] dark:border-l-[#E56E2E] shadow-[0_7px_17px_-5px_rgba(31,28,27,0.12)] dark:shadow-[0_7px_17px_-5px_rgba(0,0,0,0.4)] text-left space-y-3">
          <p className="font-heading font-bold text-[0.95rem] text-[#C74601] dark:text-[#E56E2E]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <Sparkles className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            Before You Begin
          </p>
          <ul className="space-y-2 text-[0.85rem] text-[#524048] dark:text-[#D9D6D5] leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#007970] dark:text-[#64F4F5] flex-shrink-0" />
              <span>Estimated time: <strong>25–35 minutes</strong> for the full training</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#007970] dark:text-[#64F4F5] flex-shrink-0" />
              <span>Challenges are <strong>one attempt only</strong> — answers lock after submission</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#007970] dark:text-[#64F4F5] flex-shrink-0" />
              <span>Score <strong>100%</strong> on your first try to earn the Clinical Master badge</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="pt-2 space-y-3">
          <button
            onClick={onStart}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group inline-flex items-center gap-3 px-12 py-[18px] rounded-2xl bg-[#007970] hover:bg-[#006059] text-white font-bold text-lg tracking-wide transition-all duration-300 hover:-translate-y-1 shadow-[0_12px_40px_rgba(0,121,112,0.25)] hover:shadow-[0_18px_50px_rgba(0,121,112,0.35)]"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Begin Training
            <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${hovered ? 'translate-x-1' : ''}`} />
          </button>
          <p className="text-[0.82rem] text-[#747474] dark:text-[#D9D6D5]">
            <FileText className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
            5 onboarding steps &middot; 2 challenges &middot; Final assessment
          </p>
        </div>

        {/* Trust strip */}
        <div className="flex items-center justify-center gap-5 text-[0.72rem] text-[#747474] dark:text-[#D9D6D5] tracking-widest uppercase pt-2">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#007970] dark:text-[#64F4F5]" /> HIPAA Compliant</span>
          <span className="h-3 w-px bg-[#D9D6D5]/40 dark:bg-[#07282A]" />
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#007970] dark:text-[#64F4F5]" /> SCORM Compatible</span>
          <span className="h-3 w-px bg-[#D9D6D5]/40 dark:bg-[#07282A]" />
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#007970] dark:text-[#64F4F5]" /> CareIndeed Certified</span>
        </div>
      </div>
      </div>{/* /outer card shell */}
    </div>
  )
}
