/* ── StandaloneCourseSelection ────────────────────────────────────
 *  A standalone glass-card page showing all course topic sections.
 *  Reads sections from TRAINING_CARDS, displays one card per section
 *  with a clean, intuitive grid layout. Supports night/day themes.
 *  Chapters are locked until the previous chapter is completed.
 * ─────────────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  BriefcaseMedical,
  ClipboardCheck,
  ClipboardList,
  Code2,
  FileCheck,
  FileText,
  Gavel,
  GraduationCap,
  Heart,
  Home,
  Layers,
  Lock,
  Scale,
  Search,
  Shield,
  Stethoscope,
  CheckCircle2,
} from 'lucide-react'
import { TRAINING_CARDS } from '../data/trainingCards'
import { Dock } from './Dock'
import { useTheme } from '../hooks/useTheme'
import {
  getFirstCardIndexForSection,
  isChapterUnlocked,
  isChapterComplete,
  getSectionCompletionCount,
} from '../utils/progressTracker'

// Number of intro cards before training cards
const INTRO_CARD_COUNT = 5

/* ── Section Icons ────────────────────────────────────────── */
const SECTION_ICONS: Record<string, typeof Layers> = {
  'Foundation': BookOpen,
  'Regulatory Authority': Gavel,
  'Certification Lifecycle': FileCheck,
  'Orders & Signatures': ClipboardList,
  'Eligibility': Shield,
  'Clinical Necessity': Stethoscope,
  'Medical Necessity': BriefcaseMedical,
  'Clinical Alignment': Heart,
  'Coding Context': Code2,
  'Service Planning': Scale,
  'Order Management': ClipboardCheck,
  'Survey Readiness': Search,
  'Audit Readiness': FileText,
  'Case Cards': Bookmark,
  'Takeaways': GraduationCap,
}

/* ── Derive unique sections from training data ────────────── */
interface TopicSection {
  name: string
  count: number
  icon: typeof Layers
  firstCardIndex: number // Global card index (including intro cards)
}

function buildSections(): TopicSection[] {
  const seen = new Map<string, number>()
  TRAINING_CARDS.forEach((c) => {
    if (!c.section) return
    seen.set(c.section, (seen.get(c.section) ?? 0) + 1)
  })
  return Array.from(seen.entries()).map(([name, count]) => ({
    name,
    count,
    icon: SECTION_ICONS[name] ?? Layers,
    firstCardIndex: getFirstCardIndexForSection(name, TRAINING_CARDS, INTRO_CARD_COUNT),
  }))
}

/* ── Component ────────────────────────────────────────────── */
export default function StandaloneCourseSelection() {
  const { isDarkMode } = useTheme()
  const sections = useMemo(buildSections, [])
  const sectionNames = useMemo(() => sections.map(s => s.name), [sections])
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  
  // Force re-render when progress changes (listen for storage events)
  const [progressKey, setProgressKey] = useState(0)
  useEffect(() => {
    const handleStorage = () => setProgressKey(k => k + 1)
    window.addEventListener('storage', handleStorage)
    // Also refresh on mount to get latest progress
    setProgressKey(k => k + 1)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Get current progress state
  const progressState = useMemo(() => {
    // Using progressKey ensures this recalculates when progress changes
    void progressKey
    return {
      checkUnlocked: (idx: number) => isChapterUnlocked(idx, sectionNames, TRAINING_CARDS, INTRO_CARD_COUNT),
      checkComplete: (name: string) => isChapterComplete(name, TRAINING_CARDS, INTRO_CARD_COUNT),
      getCompletion: (name: string) => getSectionCompletionCount(name, TRAINING_CARDS, INTRO_CARD_COUNT),
    }
  }, [sectionNames, progressKey])

  /* ── Navigation helpers ── */
  const fire = useCallback((target: string) => {
    const nonce = Date.now()
    window.location.hash = `/?dock=${target}&n=${nonce}`
    window.dispatchEvent(new CustomEvent('dock-nav', { detail: target }))
  }, [])

  // Navigate to a specific card index
  const navigateToCard = useCallback((cardIndex: number) => {
    const nonce = Date.now()
    window.location.hash = `/?dock=light-card&cardIndex=${cardIndex}&n=${nonce}`
    window.dispatchEvent(new CustomEvent('dock-nav', { detail: { target: 'light-card', cardIndex } }))
  }, [])

  const dockItems = useMemo(() => [
    { icon: <Home className="w-5 h-5" />, label: 'Training', onClick: () => fire('light-card') },
    { icon: <FileText className="w-5 h-5" />, label: 'Help Center', onClick: () => fire('glossary') },
    { icon: <ClipboardCheck className="w-5 h-5" />, label: 'Final Test', onClick: () => fire('final-exam') },
  ], [fire])

  /* ── Palette ── */
  const p = isDarkMode
    ? {
        pageBg: 'radial-gradient(ellipse at 20% 0%, rgba(0,121,112,0.10) 0%, transparent 55%), radial-gradient(ellipse at 85% 100%, rgba(199,70,1,0.06) 0%, transparent 55%), #010809',
        cardBg: 'rgba(1,8,8,0.55)',
        borderAccent: '#64F4F5',
        shadow: '0 24px 90px rgba(0, 10, 10, 0.82)',
        text: '#FAFBF8',
        textMuted: '#D9D6D5',
        textDim: '#747474',
        accent: '#64F4F5',
        accent2: '#C74601',
        accentBg: '#002B2C',
        accentBorder: '#007970',
        tileBg: 'rgba(255,255,255,0.02)',
        tileBorder: 'rgba(255,255,255,0.06)',
        tileHoverBg: 'rgba(255,255,255,0.06)',
        tileHoverBorder: '#007970',
        divider: 'rgba(255,255,255,0.06)',
        badgeBg: 'rgba(100,244,245,0.08)',
        badgeBorder: '#007970',
        badgeText: '#64F4F5',
        footerBorder: 'rgba(255,255,255,0.06)',
        logo: 'https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_White.png',
      }
    : {
        pageBg: 'var(--app-gradient)',
        cardBg: 'rgba(255,255,255,0)',
        borderAccent: '#C74601',
        shadow: '0 24px 60px rgba(31, 28, 27, 0.12)',
        text: '#1F1C1B',
        textMuted: '#524048',
        textDim: '#747474',
        accent: '#007970',
        accent2: '#C74601',
        accentBg: '#E5FEFF',
        accentBorder: '#C4F4F5',
        tileBg: '#ffffff',
        tileBorder: '#E5E4E3',
        tileHoverBg: '#F7FEFF',
        tileHoverBorder: '#007970',
        divider: '#E5E4E3',
        badgeBg: '#E5FEFF',
        badgeBorder: '#C4F4F5',
        badgeText: '#007970',
        footerBorder: '#E5E4E3',
        logo: 'https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_Gray.png',
      }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center font-body p-4 md:p-8"
      style={{ background: p.pageBg, backgroundAttachment: 'fixed', color: p.text }}
    >
      <Dock items={dockItems} position="center-left" isDarkMode={isDarkMode} />

      {/* ── Glass Card Shell ── */}
      <div
        className="w-full max-w-5xl rounded-[32px] overflow-hidden border-l-[4.3px] backdrop-blur-2xl"
        style={{
          background: p.cardBg,
          borderLeftColor: p.borderAccent,
          boxShadow: p.shadow,
        }}
      >
        {/* ── Header ── */}
        <header
          className="px-6 md:px-10 py-5 flex items-center justify-between border-b"
          style={{ borderColor: p.divider }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: p.accentBg, border: `1px solid ${p.accentBorder}` }}
            >
              <Layers className="w-5 h-5" style={{ color: p.accent }} />
            </div>
            <div>
              <h1 className="font-heading text-lg md:text-xl font-bold">Course Modules</h1>
              <p className="text-xs" style={{ color: p.textDim }}>
                {sections.length} sections · {TRAINING_CARDS.length} topics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={p.logo}
              alt="CareIndeed"
              className="h-8 w-auto object-contain hidden sm:block opacity-80"
            />
          </div>
        </header>

        {/* ── Hero ── */}
        <div className="px-6 md:px-10 pt-8 pb-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] mb-4"
            style={{ background: p.badgeBg, border: `1px solid ${p.badgeBorder}`, color: p.badgeText }}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            CMS-485 Training Curriculum
          </div>
          <h2
            className="font-heading text-2xl md:text-3xl font-bold mb-2"
            style={{ color: p.text }}
          >
            Select a{' '}
            <span style={{ color: p.accent }}>Topic</span>
          </h2>
          <p className="text-sm max-w-xl mx-auto leading-relaxed" style={{ color: p.textMuted }}>
            Explore each section of the CMS-485 documentation curriculum. Click any topic to begin your training journey.
          </p>
        </div>

        {/* ── Section Grid ── */}
        <div className="px-6 md:px-10 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sections.map((sec, i) => {
              const isHovered = hoveredIdx === i
              const Icon = sec.icon
              const isUnlocked = progressState.checkUnlocked(i)
              const isComplete = progressState.checkComplete(sec.name)
              const completion = progressState.getCompletion(sec.name)
              
              return (
                <button
                  key={sec.name}
                  onClick={() => {
                    if (isUnlocked) {
                      navigateToCard(sec.firstCardIndex)
                    }
                  }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  disabled={!isUnlocked}
                  className={`group rounded-2xl p-4 border text-left transition-all duration-300 relative overflow-hidden ${!isUnlocked ? 'cursor-not-allowed' : ''}`}
                  style={{
                    background: isHovered && isUnlocked ? p.tileHoverBg : p.tileBg,
                    borderColor: isComplete 
                      ? p.accent 
                      : isHovered && isUnlocked 
                        ? p.tileHoverBorder 
                        : p.tileBorder,
                    transform: isHovered && isUnlocked ? 'translateY(-2px)' : 'none',
                    boxShadow: isHovered && isUnlocked
                      ? isDarkMode
                        ? '0 12px 40px rgba(100,244,245,0.06)'
                        : '0 12px 40px rgba(0,121,112,0.10)'
                      : '0 2px 8px rgba(0,0,0,0.03)',
                    opacity: isUnlocked ? 1 : 0.6,
                  }}
                >
                  {/* Accent bar top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300"
                    style={{
                      background: isComplete 
                        ? p.accent 
                        : `linear-gradient(90deg, ${p.accent}, ${p.accent2})`,
                      opacity: isComplete || (isHovered && isUnlocked) ? 1 : 0,
                    }}
                  />

                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                      style={{
                        background: isComplete 
                          ? `${p.accent}30` 
                          : isHovered && isUnlocked 
                            ? `${p.accent}18` 
                            : p.accentBg,
                        border: `1px solid ${isComplete || (isHovered && isUnlocked) ? p.accent : p.accentBorder}`,
                      }}
                    >
                      {!isUnlocked ? (
                        <Lock className="w-4.5 h-4.5" style={{ color: p.textDim }} />
                      ) : isComplete ? (
                        <CheckCircle2 className="w-4.5 h-4.5" style={{ color: p.accent }} />
                      ) : (
                        <Icon className="w-4.5 h-4.5" style={{ color: p.accent }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-heading text-sm font-bold leading-tight mb-0.5 transition-colors"
                        style={{ color: isUnlocked ? p.text : p.textDim }}
                      >
                        {sec.name}
                      </h3>
                      <p className="text-[11px]" style={{ color: p.textDim }}>
                        {isUnlocked ? (
                          isComplete ? (
                            <span style={{ color: p.accent }}>Completed ✓</span>
                          ) : completion.completed > 0 ? (
                            `${completion.completed}/${completion.total} completed`
                          ) : (
                            `${sec.count} topic${sec.count !== 1 ? 's' : ''}`
                          )
                        ) : (
                          'Complete previous chapter'
                        )}
                      </p>
                    </div>
                    {isUnlocked && !isComplete && (
                      <ArrowRight
                        className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                        style={{ color: p.accent }}
                      />
                    )}
                    {isComplete && (
                      <CheckCircle2
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: p.accent }}
                      />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="px-6 md:px-10 pb-8 flex flex-col items-center gap-4">
          <button
            onClick={() => fire('light-card')}
            className="group px-8 py-3 rounded-[14px] text-white text-sm font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, rgba(0,121,112,0.92), rgba(0,92,85,0.92))`,
              boxShadow: '0 16px 40px -12px rgba(0,121,112,0.55)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            Begin Training <ArrowRight className="inline w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <p className="text-[11px]" style={{ color: p.textDim }}>
            {TRAINING_CARDS.length} interactive lessons · Card &amp; Book modes
          </p>
        </div>

        {/* ── Footer ── */}
        <footer
          className="px-6 md:px-10 py-4 border-t"
          style={{ borderColor: p.footerBorder }}
        >
          <p
            className="text-[10px] uppercase tracking-[0.18em] font-bold"
            style={{ color: p.textDim }}
          >
            CareIndeed Training · Internal Use Only
          </p>
        </footer>
      </div>
    </div>
  )
}
