/* ── CourseSelectionPage — Polished training module launcher ──────
 *  Final onboarding screen. User has completed Welcome Banner,
 *  Systems Calibration, Layout Challenge, and Henderson Challenge.
 *  Now they choose which training module to enter.
 * ─────────────────────────────────────────────────────────────── */

import { useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  HelpCircle,
  Layers,
  Sparkles,
  Trophy,
} from 'lucide-react'

export type CourseModule =
  | 'card-training'
  | 'book-training'
  | 'learning-pro'
  | 'interactive-form'
  | 'final-exam'
  | 'glossary'

interface CourseSelectionPageProps {
  theme: 'day' | 'night'
  onSelect: (moduleId: CourseModule) => void
}

/* ── Palettes ─────────────────────────────────────────────── */
const LIGHT = {
  bg: '#FAFBF8',
  card: '#ffffff',
  cardBorder: '#E5E4E3',
  cardHover: '#F7FEFF',
  text: '#1F1C1B',
  textMuted: '#524048',
  textDim: '#747474',
  accent: '#007970',
  accentBg: '#E5FEFF',
  accentBorder: '#C4F4F5',
  accent2: '#C74601',
  accent2Bg: '#FFEEE5',
  accent2Border: '#FFD5BF',
  headerBg: 'rgba(255,255,255,0.95)',
  footerBorder: '#E5E4E3',
  logo: 'https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_Gray.png',
  tagBg: '#E5FEFF',
  tagBorder: '#C4F4F5',
  tagText: '#007970',
  shadow: '0 4px 20px rgba(0,0,0,0.04)',
  hoverShadow: '0 12px 40px rgba(0,121,112,0.10)',
}

const NIGHT = {
  bg: '#010809',
  card: '#031213',
  cardBorder: '#004142',
  cardHover: '#002B2C',
  text: '#FAFBF8',
  textMuted: '#D9D6D5',
  textDim: '#747474',
  accent: '#64F4F5',
  accentBg: '#002B2C',
  accentBorder: '#007970',
  accent2: '#C74601',
  accent2Bg: 'rgba(199,70,1,0.15)',
  accent2Border: 'rgba(199,70,1,0.4)',
  headerBg: 'rgba(1,8,9,0.95)',
  footerBorder: '#004142',
  logo: 'https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_White.png',
  tagBg: 'rgba(100,244,245,0.08)',
  tagBorder: '#007970',
  tagText: '#64F4F5',
  shadow: '0 4px 20px rgba(0,0,0,0.15)',
  hoverShadow: '0 12px 40px rgba(100,244,245,0.06)',
}

/* ── Modules ──────────────────────────────────────────────── */
const MODULES: Array<{
  id: CourseModule
  icon: typeof Layers
  title: string
  desc: string
  time: string
  tag: string | null
  tagAccent: boolean
}> = [
  {
    id: 'card-training',
    icon: Layers,
    title: 'Card Training',
    desc: 'Step-by-step, card-based CMS-485 lessons with quizzes, audio narration, and key-point breakdowns.',
    time: '20–30 min',
    tag: 'Recommended',
    tagAccent: true,
  },
  {
    id: 'book-training',
    icon: BookOpen,
    title: 'Book Training',
    desc: 'Two-page spread layout for an immersive reading experience with full content depth and side-by-side review.',
    time: '20–30 min',
    tag: null,
    tagAccent: false,
  },
  {
    id: 'learning-pro',
    icon: GraduationCap,
    title: 'Learning Professional',
    desc: 'Comprehensive guided learning path with video introduction, narration, and progressive module flow.',
    time: '25–35 min',
    tag: null,
    tagAccent: false,
  },
  {
    id: 'interactive-form',
    icon: FileText,
    title: 'Interactive CMS-485',
    desc: 'Hands-on practice with the CMS-485 form structure, clinical narratives, and documentation fields.',
    time: '15–20 min',
    tag: null,
    tagAccent: false,
  },
  {
    id: 'final-exam',
    icon: Trophy,
    title: 'Final Assessment',
    desc: 'Comprehensive competency exam covering CMS-485 structure, safety protocols, and documentation standards.',
    time: '10–15 min',
    tag: 'Assessment',
    tagAccent: false,
  },
  {
    id: 'glossary',
    icon: HelpCircle,
    title: 'Clinical Glossary',
    desc: 'Reference guide for CMS-485 terminology, abbreviations, and home health documentation standards.',
    time: 'Reference',
    tag: null,
    tagAccent: false,
  },
]

/* ── Component ────────────────────────────────────────────── */
export default function CourseSelectionPage({ theme, onSelect }: CourseSelectionPageProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const p = theme === 'day' ? LIGHT : NIGHT
  const isNight = theme === 'night'

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden relative"
      style={{
        background: isNight
          ? 'radial-gradient(ellipse at 20% 0%, rgba(0,121,112,0.10) 0%, transparent 55%), radial-gradient(ellipse at 85% 100%, rgba(199,70,1,0.06) 0%, transparent 55%), #010809'
          : 'radial-gradient(ellipse at 20% 0%, rgba(0,121,112,0.07) 0%, transparent 55%), radial-gradient(ellipse at 85% 100%, rgba(199,70,1,0.04) 0%, transparent 55%), #FAFBF8',
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      {/* ── Header ── */}
      <header
        className="px-8 lg:px-16 py-5 flex items-center justify-between relative z-10 border-b backdrop-blur-xl"
        style={{ background: p.headerBg, borderColor: p.footerBorder }}
      >
        <div className="flex items-center gap-4">
          <img
            src={p.logo}
            alt="CareIndeed Home Health"
            className="h-8 w-auto object-contain"
          />
          <div className="hidden sm:block h-5 w-px" style={{ background: p.footerBorder }} />
          <span
            className="hidden sm:inline text-xs font-bold tracking-[0.14em] uppercase"
            style={{ color: p.textDim }}
          >
            Clinical Training Platform
          </span>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider"
          style={{
            background: p.accentBg,
            border: `1px solid ${p.accentBorder}`,
            color: p.accent,
          }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Setup Complete
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col items-center px-6 lg:px-16 py-12 lg:py-16 relative z-10">
        <div className="max-w-5xl w-full">
          {/* Hero */}
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.16em] mb-6"
              style={{
                background: p.accent2Bg,
                border: `1px solid ${p.accent2Border}`,
                color: p.accent2,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Onboarding Complete
            </div>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] mb-4"
              style={{ color: p.text, fontFamily: 'Montserrat, sans-serif' }}
            >
              Choose Your{' '}
              <span style={{ color: p.accent }}>Training Path</span>
            </h1>
            <p
              className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ color: p.textMuted }}
            >
              You've completed calibration and both competency challenges.
              Select a training module below to continue your CMS-485 documentation mastery.
            </p>
          </div>

          {/* ── Module Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((mod) => {
              const isHovered = hoveredId === mod.id
              return (
                <button
                  key={mod.id}
                  onClick={() => onSelect(mod.id)}
                  onMouseEnter={() => setHoveredId(mod.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group rounded-2xl p-6 border-2 text-left transition-all duration-300 flex flex-col gap-4 relative overflow-hidden"
                  style={{
                    background: isHovered ? p.cardHover : p.card,
                    borderColor: isHovered ? p.accent : p.cardBorder,
                    boxShadow: isHovered ? p.hoverShadow : p.shadow,
                    transform: isHovered ? 'translateY(-3px)' : 'none',
                  }}
                >
                  {/* Tag */}
                  {mod.tag && (
                    <div
                      className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        background: mod.tagAccent ? p.accent2Bg : p.tagBg,
                        border: `1px solid ${mod.tagAccent ? p.accent2Border : p.tagBorder}`,
                        color: mod.tagAccent ? p.accent2 : p.tagText,
                      }}
                    >
                      {mod.tag}
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                    style={{
                      background: isHovered ? `${p.accent}18` : p.accentBg,
                      border: `1px solid ${isHovered ? p.accent : p.accentBorder}`,
                    }}
                  >
                    <mod.icon className="w-6 h-6" style={{ color: p.accent }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3
                      className="font-bold text-base mb-1.5"
                      style={{ color: p.text, fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {mod.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: p.textMuted }}>
                      {mod.desc}
                    </p>
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between pt-3 border-t"
                    style={{ borderColor: p.cardBorder }}
                  >
                    <span className="text-xs font-medium" style={{ color: p.textDim }}>
                      {mod.time}
                    </span>
                    <span
                      className="flex items-center gap-1 text-xs font-bold transition-transform duration-300"
                      style={{
                        color: p.accent,
                        transform: isHovered ? 'translateX(3px)' : 'none',
                      }}
                    >
                      Launch <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="px-8 lg:px-16 py-4 border-t flex items-center justify-between text-xs relative z-10"
        style={{ color: p.textDim, borderColor: p.footerBorder }}
      >
        <span>&copy; {new Date().getFullYear()} CareIndeed Home Health</span>
        <span>v2.0 · CMS-485 Training Platform</span>
      </footer>
    </div>
  )
}
