import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Square,
  AlertCircle,
  CheckCircle,
  FileText,
  Target,
  ShieldCheck,
  XCircle,
  HelpCircle,
  Zap,
} from 'lucide-react'
import { CardFlowLayout } from './components/CardFlowLayout'
import { RevealSection } from './components/RevealSection'
import { Button } from './components/ui/Button'
import { Card } from './components/ui/Card'
import { PlanOfCareFocusPanel } from './components/PlanOfCareFocusPanel'
import titleMedia from './assets/CI Home Health Logo_White.png'
import headerLogoGray from './assets/CI Home Health Logo_Gray.png'
import coverBanner from './assets/CMS-485 LMS Banner.png'
import additionalContentRaw from './assets/Additional Content.txt?raw'
import { TRAINING_CARDS } from './data/trainingCards'
import { CARD_METADATA } from './data/cardMetadata'

const ANIMATION_MS = 320
const COVER_ZOOM_MS = 180
const PROGRESS_STORAGE_KEY = 'cms485.course.progress.v2'

type PanelMode = 'main' | 'additional' | 'challenge' | 'help'

type ChallengeResult = {
  selectedIndex: number
  isCorrect: boolean
}

type HelpSection = {
  title: string
  body: string[]
}

type CardItem = {
  title: string
  content: ReactElement | null
}

const normalizeText = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const parseAdditionalContentByTitle = (rawContent: string) => {
  const contentMap = new Map<string, string>()
  const sections = rawContent
    .split(/\n(?=\d+\.\s)/)
    .map((section) => section.trim())
    .filter(Boolean)

  sections.forEach((section) => {
    const headingMatch = section.match(/^\d+\.\s+([^\n]+)/)
    const bodyMatch = section.match(/"([\s\S]*)"/)

    if (!headingMatch || !bodyMatch) {
      return
    }

    const rawHeading = headingMatch[1].trim()
    const headingWithoutCategory = rawHeading.replace(/\s+\([^)]+\)\s*$/, '').trim()
    const body = bodyMatch[1].replace(/\s*\n\s*/g, ' ').trim()

    contentMap.set(normalizeText(rawHeading), body)
    contentMap.set(normalizeText(headingWithoutCategory), body)
  })

  return contentMap
}

const getRecordingStemFromPath = (filePath: string) => {
  const segments = filePath.split('/')
  const fileName = segments[segments.length - 1] ?? filePath

  return decodeURIComponent(fileName)
    .replace(/\.wav$/i, '')
    .replace(/\s+\(\d+\)\s*$/, '')
    .trim()
}

const ADDITIONAL_CONTENT_BY_TITLE = parseAdditionalContentByTitle(additionalContentRaw)

const VOICE_RECORDINGS = import.meta.glob('./assets/Voice Recordings/*.wav', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const VOICE_RECORDING_BY_TITLE = (() => {
  const mapping = new Map<string, string>()
  const normalizedTitleEntries = TRAINING_CARDS.map((card) => ({
    title: card.title,
    normalized: normalizeText(card.title),
  }))

  Object.entries(VOICE_RECORDINGS).forEach(([filePath, audioUrl]) => {
    const normalizedStem = normalizeText(getRecordingStemFromPath(filePath))

    const bestTitleMatch = normalizedTitleEntries
      .filter(({ normalized }) => normalizedStem.includes(normalized) || normalized.includes(normalizedStem))
      .sort((left, right) => right.normalized.length - left.normalized.length)[0]

    if (!bestTitleMatch || mapping.has(bestTitleMatch.title)) {
      return
    }

    mapping.set(bestTitleMatch.title, audioUrl)
  })

  return mapping
})()

const getAdditionalContentForTitle = (title: string) => {
  const normalizedTitle = normalizeText(title)
  const directMatch = ADDITIONAL_CONTENT_BY_TITLE.get(normalizedTitle)

  if (directMatch) {
    return directMatch
  }

  for (const [normalizedHeading, content] of ADDITIONAL_CONTENT_BY_TITLE) {
    if (normalizedHeading.includes(normalizedTitle) || normalizedTitle.includes(normalizedHeading)) {
      return content
    }
  }

  return null
}

const getChallengeOptions = (bullets: string[], objective: string) => {
  const optionA = bullets[0] ?? objective
  const optionB = bullets[1] ?? 'Use a generic template statement without patient-specific details.'
  const optionC = bullets[2] ?? 'Delay documentation updates until end-of-episode review.'

  return [optionA, optionB, optionC]
}

const LEARNER_HELP_SECTIONS: HelpSection[] = [
  {
    title: 'How This Training Works',
    body: [
      'This learning experience is card-based. Each topic includes a learning objective, key points, clinical lens, additional content, and a challenge check.',
      'Use Next and Back to move through topics. Some controls become available only after required steps are completed.',
    ],
  },
  {
    title: 'Navigation Basics',
    body: [
      'Back returns to the prior state in reverse order: challenge to additional content, additional content to main topic view, then previous topic card.',
      'Next advances in sequence: main topic view to additional content, additional content to challenge, then next topic card.',
      'You can also use keyboard arrows: right arrow for next and left arrow for back.',
    ],
  },
  {
    title: 'Audio and Additional Content',
    body: [
      'Select PLAY to open additional subject content and start narration for the current topic.',
      'Pause, Stop, and Restart are available while audio controls are active.',
      'If no recording exists for a topic, the interface will indicate that clearly and still allow progression based on current rules.',
    ],
  },
  {
    title: 'Challenge Rules',
    body: [
      'Challenge is available once the topic audio is completed.',
      'Each card challenge allows one submission attempt per session.',
      'After submit, the correct option is highlighted in teal and the selected incorrect answer (if any) is highlighted in red, with the correct-answer explanation shown.',
      'Challenge attempts remain locked for that session and reset only in a new session after completing training.',
    ],
  },
  {
    title: 'Progress and Session Behavior',
    body: [
      'Your in-progress location is retained for continuity.',
      'Challenge response state is session-based and intended to preserve attempt integrity.',
      'If your organization enables LMS tracking, completion and score data may also be recorded there.',
    ],
  },
  {
    title: 'Troubleshooting Quick Guide',
    body: [
      'If audio does not play, verify browser media permissions and device output settings.',
      'If progress appears stale, refresh once and return to the same launch entry point.',
      'If controls look locked unexpectedly, confirm whether challenge prerequisites were completed for the active topic.',
    ],
  },
  {
    title: 'Accessibility Support',
    body: [
      'This training supports keyboard navigation and visible focus states.',
      'Status updates (for actions like playback and lock changes) are announced through live text regions.',
      'If you use reduced motion preferences, transitions should minimize or disable animation effects.',
    ],
  },
]

const TitleCard = ({ onView, isDarkMode, className }: { onView: () => void; isDarkMode: boolean; className?: string }) => {
  return (
    <div className={`relative h-full w-full overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#121214]' : 'bg-white'} ${className ?? ''}`}>
      <img
        src={coverBanner}
        alt="CMS-485 LMS banner"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-100"
      />
      <div className={`absolute inset-0 z-10 transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-t from-[#0f1013] via-[#0f1013]/25 to-transparent' : 'bg-gradient-to-t from-white via-white/40 to-transparent'}`} />
      <div className={`absolute inset-0 z-10 ${isDarkMode ? 'bg-[radial-gradient(circle_at_20%_20%,rgba(0,121,112,0.22),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(199,70,1,0.2),transparent_40%)]' : 'bg-[radial-gradient(circle_at_20%_20%,rgba(196,244,245,0.35),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(255,213,191,0.35),transparent_40%)]'}`} />

      <div className="relative z-20 h-full w-full">
        <button
          onClick={onView}
          className={`group absolute z-30 bottom-[60px] left-[24px] sm:left-[60px] overflow-hidden px-8 py-3 font-bold transition-all ${
            isDarkMode 
              ? 'rounded-md border border-[#A63A01] bg-[#C74601] text-white shadow-[0_4px_14px_-8px_rgba(199,70,1,0.78)] hover:bg-[#B74001] hover:shadow-[0_8px_18px_-10px_rgba(199,70,1,0.85)]' 
              : 'rounded-md border border-[#006B64] bg-[#007970] text-white shadow-[0_4px_14px_-8px_rgba(0,121,112,0.7)] hover:bg-[#006961] hover:shadow-[0_8px_18px_-10px_rgba(0,121,112,0.75)]'
          }`}
        >
          <span className="relative z-10 flex items-center gap-2 uppercase tracking-widest text-sm">
            Start Learning
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </button>
      </div>
    </div>
  )
}

const ReportGridCard = ({
  items,
  onSelect,
  isDarkMode,
  unlockedCount,
  className,
}: {
  items: CardItem[]
  onSelect: (index: number) => void
  isDarkMode: boolean
  unlockedCount: number
  className?: string
}) => {
  const completedCount = Math.max(0, unlockedCount - 1)
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0

  return (
    <div className={`flex h-full w-full flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#121214]' : 'bg-white'} ${className ?? ''}`}>
      {/* Hero header */}
      <div className={`shrink-0 px-6 md:px-8 pt-4 pb-3 ${isDarkMode ? '' : ''}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
              isDarkMode ? 'border-white/10 bg-white/5 text-[#64F4F5]' : 'border-[#C74601]/20 bg-[#FFEEE5] text-[#C74601]'
            }`}>
              <FileText className="h-3 w-3" />
              Module Selection
            </div>
            <h2 className={`font-montserrat text-xl md:text-2xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-[#1F1C1B]'}`}>Course Modules</h2>
          </div>
          <div className={`flex items-center gap-3 rounded-lg border px-3 py-1.5 text-[10px] font-semibold tabular-nums ${
            isDarkMode ? 'border-white/10 bg-white/5 text-gray-300' : 'border-[#E5E4E3] bg-[#FAFBF8] text-[#524048]'
          }`}>
            <div className={`h-1.5 w-16 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-[#E5E4E3]'}`}>
              <div className="h-full bg-gradient-to-r from-[#007970] to-[#64F4F5] transition-all duration-700" style={{ width: `${progressPercent}%` }} />
            </div>
            <span>{completedCount} / {items.length}</span>
          </div>
        </div>
      </div>

      {/* Scrollable grid */}
      <div className="flex-1 min-h-0 overflow-hidden px-6 md:px-8 pb-4">
        <div className="grid w-full h-full grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-6 auto-rows-fr">
          {items.map((item, index) => {
            const isLocked = index + 1 > unlockedCount
            const isCompleted = index + 1 < unlockedCount
            return (
              <button
                key={item.title}
                onClick={() => onSelect(index)}
                disabled={isLocked}
                className={`group relative flex flex-col items-start border p-2 text-left transition-all duration-200 ${
                  isDarkMode
                    ? (isLocked
                      ? 'bg-white/[0.02] border-white/5 cursor-not-allowed opacity-40 rounded-lg'
                      : 'bg-white/[0.04] border-white/10 hover:border-[#C74601] hover:bg-white/[0.08] hover:shadow-[0_8px_24px_-10px_rgba(199,70,1,0.35)] rounded-lg')
                    : (isLocked
                      ? 'bg-[#FAFBF8] border-[#ECEAE9] cursor-not-allowed opacity-50 rounded-xl'
                      : 'bg-white border-2 border-[#E5E4E3] hover:border-[#007970] hover:shadow-[4px_4px_0_#007970] hover:-translate-y-0.5 hover:-translate-x-0.5 rounded-xl')
                }`}
              >
                <div className="flex w-full items-center justify-between mb-1">
                  <div className={`flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold transition-colors ${
                    isLocked
                      ? (isDarkMode ? 'bg-white/5 text-gray-600' : 'bg-[#F2F2F1] text-[#B8B4B2]')
                      : isCompleted
                        ? (isDarkMode ? 'bg-[#007970]/30 text-[#64F4F5]' : 'bg-[#E5FEFF] text-[#007970]')
                        : (isDarkMode ? 'bg-[#C74601]/20 text-[#C74601] group-hover:bg-[#C74601] group-hover:text-white' : 'bg-[#E5FEFF] text-[#007970] group-hover:bg-[#007970] group-hover:text-white')
                  }`}>
                    {index + 1}
                  </div>
                  {isLocked && <Lock className={`h-2.5 w-2.5 ${isDarkMode ? 'text-gray-600' : 'text-[#B8B4B2]'}`} />}
                  {isCompleted && !isLocked && <CheckCircle className={`h-3 w-3 ${isDarkMode ? 'text-[#007970]' : 'text-[#007970]'}`} />}
                  {!isLocked && !isCompleted && <ChevronRight className={`h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${isDarkMode ? 'text-[#C74601]' : 'text-[#007970]'}`} />}
                </div>

                <h3 className={`text-[9px] leading-tight font-semibold line-clamp-2 transition-colors ${
                  isLocked
                    ? (isDarkMode ? 'text-gray-600' : 'text-[#B8B4B2]')
                    : (isDarkMode ? 'text-gray-200 group-hover:text-white' : 'text-[#1F1C1B]')
                }`}>
                  {item.title}
                </h3>

                <div className={`mt-auto pt-1 flex w-full items-center gap-1 text-[8px] font-medium uppercase tracking-wider ${
                  isLocked
                    ? (isDarkMode ? 'text-gray-700' : 'text-[#C5C2C0]')
                    : (isDarkMode ? 'text-gray-500' : 'text-[#747474]')
                }`}>
                  <FileText className="h-2 w-2" />
                  {isLocked ? 'Locked' : isCompleted ? 'Completed' : 'Topic'}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const EndCard = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <div className={`flex h-full items-center justify-center p-8 transition-colors duration-300 ${isDarkMode ? 'bg-transparent' : 'bg-white'}`}>
      <div className="flex flex-col items-center justify-center h-full text-center relative z-10">
        {isDarkMode ? (
          <div className="w-24 h-24 rounded-none rotate-45 flex items-center justify-center mb-10 bg-[#007970]/20 border border-[#64F4F5] shadow-[0_0_50px_rgba(100,244,245,0.2)]">
            <div className="-rotate-45">
              <CheckCircle className="h-12 w-12 text-[#64F4F5]" />
            </div>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-10 bg-[#007970] text-white border-4 border-[#004142] shadow-[8px_8px_0_#004142] transform -rotate-3 transition-transform hover:rotate-0 duration-300">
            <CheckCircle className="h-12 w-12" />
          </div>
        )}
        <h2 className={`mb-6 font-montserrat text-4xl md:text-6xl font-medium tracking-tight transition-colors ${
          isDarkMode ? 'text-white drop-shadow-2xl' : 'text-[#1F1C1B] font-semibold'
        }`}>
          Course {isDarkMode 
            ? <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#64F4F5] to-[#007970]">Complete</span>
            : <span className="text-[#007970]">Complete</span>
          }
        </h2>
        <p className={`max-w-lg text-left text-lg leading-relaxed ${
          isDarkMode 
            ? 'text-white/60 font-light border-l-2 border-[#C74601] pl-6' 
            : 'text-[#524048] border-l-4 border-[#C74601] pl-6 bg-[#FFFAF7] p-4 rounded-r-lg'
        }`}>
          You have successfully completed the CMS-485 core training deck. Review any card again as needed before implementation.
        </p>
      </div>
    </div>
  )
}

const TrainingSection = ({
  title,
  section,
  objective,
  bullets,
  auditFocus,
  pocFocus,
  panelMode,
  previousPanelMode,
  isPanelAnimating,
  panelTransitionDirection,
  additionalContent,
  isPocPanelExpanded,
  onTogglePocPanel,
  manageFocus,
  challengeResult,
  onSubmitChallenge,
  isDarkMode,
}: (typeof TRAINING_CARDS)[number] & {
  pocFocus?: {
    boxes: string[]
    context: string
  }
  panelMode: PanelMode
  previousPanelMode: PanelMode | null
  isPanelAnimating: boolean
  panelTransitionDirection: 'next' | 'prev'
  additionalContent: string | null
  isPocPanelExpanded: boolean
  onTogglePocPanel: () => void
  manageFocus: boolean
  challengeResult: ChallengeResult | null
  onSubmitChallenge: (selectedIndex: number) => void
  isDarkMode: boolean
}) => {
  const [selectedChallengeIndex, setSelectedChallengeIndex] = useState<number | null>(null)
  const [hasSubmittedChallenge, setHasSubmittedChallenge] = useState(false)
  const additionalPanelRef = useRef<HTMLDivElement | null>(null)
  const challengeFirstOptionRef = useRef<HTMLButtonElement | null>(null)
  const helpPanelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (challengeResult) {
      setSelectedChallengeIndex(challengeResult.selectedIndex)
      setHasSubmittedChallenge(true)
      return
    }

    setSelectedChallengeIndex(null)
    setHasSubmittedChallenge(false)
  }, [title, panelMode, challengeResult])

  useEffect(() => {
    if (!manageFocus) {
      return
    }

    if (panelMode === 'additional') {
      additionalPanelRef.current?.focus()
      return
    }

    if (panelMode === 'challenge') {
      challengeFirstOptionRef.current?.focus()
      return
    }

    if (panelMode === 'help') {
      helpPanelRef.current?.focus()
    }
  }, [manageFocus, panelMode])

  const defaultInsightPanels = (
    <div className="grid gap-3 md:grid-cols-2">
      <Card className={`h-full transition-all duration-300 flex flex-col justify-center ${
        isDarkMode 
          ? 'p-4 border border-white/10 bg-[#0F0F11] hover:bg-[#151518] rounded-lg' 
          : 'p-4 bg-white border-2 border-[#E5E4E3] hover:border-[#007970] rounded-xl hover:shadow-[4px_4px_0_#007970] hover:-translate-y-0.5 hover:-translate-x-0.5'
      }`}>
        <h3 className={`mb-2 flex items-center gap-2 text-sm font-medium uppercase tracking-widest ${
          isDarkMode ? 'text-white/80' : 'text-[#1F1C1B] font-semibold'
        }`}>
          {isDarkMode ? (
            <FileText className="h-[18px] w-[18px] text-[#007970]" />
          ) : (
            <div className="bg-[#E5FEFF] p-1.5 rounded-lg text-[#007970] group-hover:bg-[#007970] group-hover:text-white transition-colors">
              <FileText className="h-5 w-5" />
            </div>
          )}
          Key Points
        </h3>
        <ul className="space-y-2">
          {bullets.map((item, index) => (
            <li key={item} className="flex items-start gap-2 group/item">
              <span className={`font-medium text-xs mt-0.5 transition-transform group-hover/item:translate-x-1 ${isDarkMode ? 'text-[#007970]' : 'text-[#007970] font-bold'}`}>{`0${index + 1}`}</span>
              <span className={`text-xs md:text-sm leading-relaxed ${isDarkMode ? 'text-white/70 font-light' : 'text-[#524048]'}`}>{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className={`h-full transition-all duration-300 flex flex-col justify-center ${
        isDarkMode 
          ? 'p-4 border border-white/10 bg-[#0F0F11] hover:border-[#C74601]/50 rounded-lg shadow-[inset_0_0_0_0_rgba(199,70,1,0)] hover:shadow-[inset_0_0_50px_0_rgba(199,70,1,0.05)]' 
          : 'p-4 bg-white border-2 border-[#E5E4E3] hover:border-[#C74601] rounded-xl hover:shadow-[4px_4px_0_#C74601] hover:-translate-y-0.5 hover:-translate-x-0.5'
      }`}>
        <h3 className={`mb-2 flex items-center gap-2 text-sm font-medium uppercase tracking-widest ${
          isDarkMode ? 'text-white/80' : 'text-[#1F1C1B] font-semibold'
        }`}>
          {isDarkMode ? (
            <ShieldCheck className="h-[18px] w-[18px] text-[#C74601]" />
          ) : (
            <div className="bg-[#FFEEE5] p-1.5 rounded-lg text-[#C74601] group-hover:bg-[#C74601] group-hover:text-white transition-colors">
              <ShieldCheck className="h-5 w-5" />
            </div>
          )}
          Clinical Lens
        </h3>
        <p className={`text-xs md:text-sm leading-relaxed ${isDarkMode ? 'text-white/70 font-light' : 'text-[#524048]'}`}>
          {auditFocus || 'Translate this concept into clear, patient-specific, defensible documentation language that aligns directly with organizational standards.'}
        </p>
      </Card>
    </div>
  )

  const challengePanel = (
    <Card className={`h-full transition-colors ${
      isDarkMode 
        ? 'bg-transparent border-none shadow-none' 
        : 'bg-white border-none shadow-none'
    }`}>
      <p className={`mb-4 text-lg font-medium leading-relaxed tracking-tight ${isDarkMode ? 'text-white border-l-4 border-[#C74601] pl-4' : 'text-[#1F1C1B] font-semibold flex items-center gap-3'}`}>
        {!isDarkMode && <Target className="text-[#C74601] h-5 w-5 shrink-0" />}
        Identify the optimal approach.
      </p>

      {!hasSubmittedChallenge && (
        <>
        <div className="space-y-2">
        {getChallengeOptions(bullets, objective).map((option, index) => {
          const isSelected = selectedChallengeIndex === index
          const isCorrect = index === 0

          let stateStyles = isDarkMode
            ? 'border-white/10 bg-black/20 text-white/60 hover:border-white/50 hover:bg-white/5 hover:text-white'
            : 'border-2 border-[#E5E4E3] bg-white text-[#524048] hover:border-[#007970] hover:shadow-[6px_6px_0_#007970] hover:-translate-y-1 hover:-translate-x-1 hover:text-[#1F1C1B]'
          
          if (hasSubmittedChallenge) {
            if (isCorrect) {
              stateStyles = isDarkMode
                ? 'border-[#007970] bg-[#007970]/20 text-white shadow-[0_0_30px_rgba(0,121,112,0.3)] scale-[1.02]'
                : 'border-2 border-[#007970] bg-[#007970] text-white shadow-[6px_6px_0_#004142] scale-[1.01]'
            } else if (isSelected) {
              stateStyles = isDarkMode
                ? 'border-[#D70101] bg-[#D70101]/20 text-white shadow-[0_0_30px_rgba(215,1,1,0.3)]'
                : 'border-2 border-[#D70101] bg-[#D70101] text-white shadow-[6px_6px_0_#7a0000]'
            } else {
              stateStyles = isDarkMode
                ? 'border-white/5 bg-transparent text-white/30'
                : 'border-2 border-[#E5E4E3] bg-[#FAFBF8] text-[#747474] opacity-50'
            }
          } else if (isSelected) {
            stateStyles = isDarkMode
              ? 'border-[#64F4F5] bg-[#64F4F5]/10 text-[#64F4F5] shadow-[0_0_20px_rgba(100,244,245,0.2)]'
              : 'border-2 border-[#007970] bg-[#E5FEFF] text-[#007970] shadow-[6px_6px_0_#007970] -translate-y-1 -translate-x-1 font-medium'
          }

          return (
            <button
              key={`${title}-challenge-${index}`}
              type="button"
              ref={index === 0 ? challengeFirstOptionRef : undefined}
              disabled={hasSubmittedChallenge}
              onClick={() => {
                if (hasSubmittedChallenge) return
                setSelectedChallengeIndex(index)
                setHasSubmittedChallenge(false)
              }}
              className={`w-full text-left rounded-lg border p-3 md:p-4 transition-all duration-300 flex items-center justify-between group cursor-pointer text-xs md:text-sm ${stateStyles}`}
            >
              <span className="pr-4 leading-relaxed">{option}</span>
              <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">
                {hasSubmittedChallenge && isCorrect && <CheckCircle className={`h-5 w-5 ${isDarkMode ? 'text-[#64F4F5]' : 'text-white'}`} />}
                {hasSubmittedChallenge && isSelected && !isCorrect && <XCircle className={`h-5 w-5 ${isDarkMode ? 'text-[#D70101]' : 'text-white'}`} />}
                {!hasSubmittedChallenge && isSelected && <Target className={`h-5 w-5 ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#007970]'}`} />}
                {!hasSubmittedChallenge && !isSelected && !isDarkMode && <div className="w-5 h-5 rounded-full border-2 border-[#D9D6D5] group-hover:border-[#007970]" />}
              </div>
            </button>
          )
        })}
        </div>

        <div className={`mt-3 flex items-center justify-end border-t pt-3 ${isDarkMode ? 'border-white/10' : 'border-[#E5E4E3]'}`}>
          <Button
            variant="primary"
            onClick={() => {
              if (selectedChallengeIndex === null || hasSubmittedChallenge) return
              setHasSubmittedChallenge(true)
              onSubmitChallenge(selectedChallengeIndex)
            }}
            disabled={selectedChallengeIndex === null}
            className={`px-6 py-2 font-bold uppercase tracking-wide text-sm transition-all ${
              isDarkMode
                ? 'bg-[#C74601] border border-[#C74601] text-white hover:bg-[#E56E2E] hover:shadow-[0_0_30px_rgba(199,70,1,0.6)] shadow-none rounded'
                : 'bg-[#C74601] border-2 border-[#421700] text-white hover:bg-[#E56E2E] hover:shadow-[6px_6px_0_#421700] hover:-translate-y-1 hover:-translate-x-1 shadow-none rounded-xl'
            }`}
          >
            Submit
          </Button>
        </div>
        </>
      )}

      {hasSubmittedChallenge && selectedChallengeIndex !== null && (
        <div className={`mt-4 rounded-xl border p-4 ${
          selectedChallengeIndex === 0
            ? (isDarkMode ? 'border-[#007970] bg-[#007970]/10' : 'border-2 border-[#007970] bg-[#F0FDFA]')
            : (isDarkMode ? 'border-[#D70101] bg-[#D70101]/10' : 'border-2 border-[#D70101] bg-[#FFF0F0]')
        }`}>
          <div className="flex items-start gap-3">
            {selectedChallengeIndex === 0 ? (
              <ShieldCheck className={`mt-0.5 h-5 w-5 shrink-0 ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#007970]'}`} />
            ) : (
              <AlertCircle className={`mt-0.5 h-5 w-5 shrink-0 ${isDarkMode ? 'text-[#FF8A8A]' : 'text-[#D70101]'}`} />
            )}
            <div className="space-y-2">
              <p className={`text-sm font-bold uppercase tracking-wide ${
                selectedChallengeIndex === 0 ? (isDarkMode ? 'text-[#64F4F5]' : 'text-[#007970]') : (isDarkMode ? 'text-[#FF8A8A]' : 'text-[#D70101]')
              }`}>
                {selectedChallengeIndex === 0 ? 'Correct Answer' : 'Incorrect'}
              </p>

              <div className={`text-xs md:text-sm leading-relaxed space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-[#524048]'}`}>
                <p><span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-[#1F1C1B]'}`}>Correct Answer:</span> {getChallengeOptions(bullets, objective)[0]}</p>
                {selectedChallengeIndex !== 0 && (
                  <p className="opacity-90"><span className="font-semibold">Why:</span> This directly supports the learning objective: "{objective}"</p>
                )}
              </div>

              <p className={`text-xs font-bold uppercase tracking-widest pt-1 ${isDarkMode ? 'text-gray-500' : 'text-[#747474]'}`}>Answer Submitted</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  )

  const showExplorerOnly = Boolean(pocFocus && isPocPanelExpanded)

  const additionalPanel = (
    <div ref={additionalPanelRef} tabIndex={-1} className="h-full overflow-y-auto">
      <div className="flex flex-col gap-3">
        {!showExplorerOnly && (
          <Card className={`transition-all duration-300 group ${
            isDarkMode 
              ? 'p-4 lg:p-5 border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-lg relative' 
              : 'p-4 lg:p-5 bg-white border-2 border-[#D9D6D5] shadow-[6px_6px_0_#D9D6D5] rounded-xl hover:shadow-[6px_6px_0_#007970] hover:border-[#007970] relative'
          }`}>
            {isDarkMode ? (
              <>
                <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-[#007970] opacity-50 m-3 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-[#C74601] opacity-50 m-3 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100" />
              </>
            ) : (
              <>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#007970] opacity-20 rounded-tr-xl transition-all duration-500 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#C74601] opacity-20 rounded-bl-xl transition-all duration-500 group-hover:opacity-100" />
              </>
            )}
            <h3 className={`mb-3 text-[10px] font-medium uppercase tracking-[0.15em] flex items-center gap-2 ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#C74601] font-bold'}`}>
                <AlertCircle className="h-4 w-4" />
                Expanded Context
            </h3>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'font-light text-white/90' : 'font-light text-[#1F1C1B]'}`}>
              {additionalContent ?? 'No additional content available for this section.'}
            </p>
          </Card>
        )}

        {pocFocus && (
          <PlanOfCareFocusPanel
            focus={pocFocus}
            isExpanded={isPocPanelExpanded}
            onToggle={onTogglePocPanel}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  )

  const helpPanel = (
    <div ref={helpPanelRef} tabIndex={-1} className="h-full">
      <Card className="h-full overflow-y-auto pr-1">
        <h3 className="mb-6 text-2xl font-bold text-[#C74601] flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Learner Help Guide
        </h3>
        <div className="grid grid-cols-1 gap-4 pb-2 md:grid-cols-2">
          {LEARNER_HELP_SECTIONS.map((helpSection) => (
            <section key={`${title}-${helpSection.title}`} className={`rounded-lg border p-4 ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-[#E5E4E3] bg-[#FAFBF8]'}`}>
              <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-[#007970]">{helpSection.title}</h4>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-[#524048]'}`}>
                {helpSection.body.join(' • ')}
              </p>
            </section>
          ))}
        </div>
      </Card>
    </div>
  )

  const renderPanel = (mode: PanelMode) => {
    switch (mode) {
      case 'help': return helpPanel
      case 'challenge': return challengePanel
      case 'additional': return additionalPanel
      default: return defaultInsightPanels
    }
  }

  return (
    <section className={`flex h-full flex-col justify-start overflow-hidden px-6 py-3 transition-colors duration-300 ${isDarkMode ? 'bg-transparent' : 'bg-white'}`}>
      <div className="mb-4 shrink-0">
        <RevealSection>
          <div className="mb-4">
            {isDarkMode ? (
              <div className="inline-flex items-center gap-3">
                <div className="w-8 h-px bg-[#C74601]" />
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#C74601]">{section}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 bg-[#FFEEE5] px-4 py-1.5 rounded-full border border-[#C74601]/20">
                <div className="w-2 h-2 rounded-full bg-[#C74601] animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C74601]">{section}</span>
              </div>
            )}
          </div>
          <h2 className={`mb-2 font-montserrat text-2xl font-medium leading-tight md:text-3xl transition-colors ${isDarkMode ? 'text-white drop-shadow-lg' : 'text-[#1F1C1B] font-semibold'}`}>
            {title}
          </h2>
        </RevealSection>

        {panelMode === 'main' && (
          <RevealSection delayMs={100}>
            {isDarkMode ? (
              <div className="mb-3 p-3 md:p-4 border border-white/10 bg-white/[0.02] backdrop-blur-md relative overflow-hidden group hover:border-[#64F4F5]/50 transition-colors duration-500 rounded-lg">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#64F4F5] shadow-[0_0_20px_#64F4F5]" />
                <div className="flex gap-3 items-start relative z-10">
                  <Target className="shrink-0 mt-0.5 text-[#64F4F5] h-5 w-5" strokeWidth={1.5} />
                  <div>
                    <h3 className="text-[10px] font-medium uppercase tracking-[0.15em] mb-1 text-white/50">Learning Objective</h3>
                    <p className="text-sm font-light leading-snug text-white/90">{objective}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-3 p-3 md:p-4 bg-[#007970] border-2 border-[#004142] shadow-[4px_4px_0_#004142] rounded-xl text-white relative overflow-hidden">
                <div className="flex gap-3 items-start relative z-10">
                  <Target className="shrink-0 mt-0.5 text-[#64F4F5] h-5 w-5" strokeWidth={2} />
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1 text-[#C4F4F5]">Learning Objective</h3>
                    <p className="text-sm font-normal leading-snug text-white">{objective}</p>
                  </div>
                </div>
              </div>
            )}
          </RevealSection>
        )}
      </div>

      <div className="relative flex-1 min-h-0 overflow-hidden">
        {isPanelAnimating && previousPanelMode !== null && previousPanelMode !== panelMode && (
          <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            panelTransitionDirection === 'next' 
              ? '-translate-x-full opacity-0' 
              : 'translate-x-full opacity-0'
          }`}>
            {renderPanel(previousPanelMode)}
          </div>
        )}

        <div className={`h-full transition-all duration-500 ease-in-out ${
          isPanelAnimating && previousPanelMode !== null
            ? panelTransitionDirection === 'next'
              ? 'animate-slide-in-right'
              : 'animate-slide-in-left'
            : ''
        }`}>
          {renderPanel(panelMode)}
        </div>
      </div>


    </section>
  )
}

const FlowCards = ({
  isDarkMode,
  isDebugMode,
  onToggleDarkMode,
  onToggleDebugMode,
}: {
  isDarkMode: boolean
  isDebugMode: boolean
  onToggleDarkMode: () => void
  onToggleDebugMode: () => void
}) => {
  const metadataByTitle = useMemo(() => {
    return new Map(CARD_METADATA.map((item) => [item.title, item]))
  }, [])

  const cards = useMemo(
    () => [
      { title: 'Title', content: null },
      ...TRAINING_CARDS.map((card) => {
        return {
          title: card.title,
          content: null,
        }
      }),
      { title: 'Complete', content: null },
    ],
    [metadataByTitle],
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const [showReportGrid, setShowReportGrid] = useState(false)
  const [isCoverZoomingOut, setIsCoverZoomingOut] = useState(false)
  const [viewedCardIndexes, setViewedCardIndexes] = useState<Set<number>>(() => new Set([0]))
  const [isNextLockedFeedback, setIsNextLockedFeedback] = useState(false)
  const [audioModeForTitle, setAudioModeForTitle] = useState<string | null>(null)
  const [challengeModeForTitle, setChallengeModeForTitle] = useState<string | null>(null)
  const [helpModeForTitle, setHelpModeForTitle] = useState<string | null>(null)
  const [helpReturnMode, setHelpReturnMode] = useState<'main' | 'additional' | 'challenge'>('main')
  const [audioPlaybackState, setAudioPlaybackState] = useState<'idle' | 'playing' | 'paused'>('idle')
  const [audioCompletedTitles, setAudioCompletedTitles] = useState<Set<string>>(() => new Set())
  const [challengeResultsByTitle, setChallengeResultsByTitle] = useState<Record<string, ChallengeResult>>({})
  const [isPocPanelExpanded, setIsPocPanelExpanded] = useState(false)
  const [isPanelAnimating, setIsPanelAnimating] = useState(false)
  const [panelTransitionDirection, setPanelTransitionDirection] = useState<'next' | 'prev'>('next')
  const [previousPanelMode, setPreviousPanelMode] = useState<PanelMode | null>(null)
  const [liveStatus, setLiveStatus] = useState('')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const touchStartXRef = useRef<number | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  const currentIsTrainingCard = currentIndex > 0 && currentIndex < cards.length - 1
  const canAdvanceFromCurrent = !currentIsTrainingCard || viewedCardIndexes.has(currentIndex)
  const currentCardTitle = cards[currentIndex]?.title ?? ''
  const currentVoiceRecording = currentIsTrainingCard ? VOICE_RECORDING_BY_TITLE.get(currentCardTitle) ?? null : null
  const isChallengeUnlocked = isDebugMode || audioCompletedTitles.has(currentCardTitle)
  const hasCurrentChallengeSubmission = Boolean(challengeResultsByTitle[currentCardTitle])
  const currentCardMetadata = currentIsTrainingCard ? metadataByTitle.get(currentCardTitle) : undefined
  const hasCurrentPocFocus = Boolean(currentCardMetadata?.pocFocus)
  const highestViewedIndex = useMemo(() => {
    return Math.max(...Array.from(viewedCardIndexes))
  }, [viewedCardIndexes])
  const unlockedTrainingCount = isDebugMode
    ? TRAINING_CARDS.length
    : Math.min(TRAINING_CARDS.length, Math.max(1, highestViewedIndex, currentIndex))

  const getPanelModeForTitle = (title: string): PanelMode => {
    if (helpModeForTitle === title) {
      return 'help'
    }

    if (challengeModeForTitle === title) {
      return 'challenge'
    }

    if (audioModeForTitle === title) {
      return 'additional'
    }

    return 'main'
  }

  const currentPanelMode = currentIsTrainingCard ? getPanelModeForTitle(currentCardTitle) : 'main'

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applyPreference = () => setPrefersReducedMotion(media.matches)
    applyPreference()
    media.addEventListener('change', applyPreference)
    return () => media.removeEventListener('change', applyPreference)
  }, [])

  const clearDelayedPlayback = () => {
    return
  }

  const stopCurrentAudioPlayback = () => {
    const audio = audioElementRef.current
    if (!audio) {
      return
    }

    audio.pause()
    audio.currentTime = 0
  }

  const transitionPanel = (nextMode: PanelMode, directionOverride: 'next' | 'prev') => {
    if (!currentIsTrainingCard) {
      return
    }

    const activeMode = getPanelModeForTitle(currentCardTitle)
    if (activeMode === nextMode) {
      return
    }

    setPreviousPanelMode(activeMode)
    setPanelTransitionDirection(directionOverride)
    setIsPanelAnimating(!prefersReducedMotion)

    if (nextMode === 'help') {
      if (activeMode === 'main' || activeMode === 'additional' || activeMode === 'challenge') {
        setHelpReturnMode(activeMode)
      }
      setHelpModeForTitle(currentCardTitle)

      if (!prefersReducedMotion) {
        window.setTimeout(() => {
          setIsPanelAnimating(false)
          setPreviousPanelMode(null)
        }, ANIMATION_MS)
      }
      return
    }

    setHelpModeForTitle(null)

    if (nextMode === 'main') {
      setAudioModeForTitle(null)
      setChallengeModeForTitle(null)
    } else if (nextMode === 'additional') {
      setAudioModeForTitle(currentCardTitle)
      setChallengeModeForTitle(null)
    } else {
      setAudioModeForTitle(currentCardTitle)
      setChallengeModeForTitle(currentCardTitle)
    }

    if (!prefersReducedMotion) {
      window.setTimeout(() => {
        setIsPanelAnimating(false)
        setPreviousPanelMode(null)
      }, ANIMATION_MS)
    }
  }

  const handleHelpToggle = () => {
    if (!currentIsTrainingCard) {
      return
    }

    if (currentPanelMode === 'help') {
      transitionPanel(helpReturnMode, 'prev')
      setLiveStatus('Help closed.')
      return
    }

    transitionPanel('help', 'prev')
    setLiveStatus('Help opened.')
  }

  const handleAudioPlayClick = () => {
    if (!currentIsTrainingCard) {
      return
    }

    transitionPanel('additional', 'next')
    stopCurrentAudioPlayback()

    const audio = audioElementRef.current
    if (!audio || !currentVoiceRecording) {
      setAudioPlaybackState('idle')
      setLiveStatus('No recording is available for this card.')
      return
    }

    audio.currentTime = 0
    audio
      .play()
      .then(() => {
        setAudioPlaybackState('playing')
        setLiveStatus('Playing recording.')
      })
      .catch(() => {
        setAudioPlaybackState('idle')
        setLiveStatus('Playback could not be started.')
      })
  }

  const handleAudioPauseClick = () => {
    const audio = audioElementRef.current
    if (!audio) {
      return
    }

    audio.pause()
    setAudioPlaybackState('paused')
    setLiveStatus('Playback paused.')
  }

  const handleAudioStopClick = () => {
    clearDelayedPlayback()
    stopCurrentAudioPlayback()
    setAudioPlaybackState('idle')
    setLiveStatus('Playback stopped.')
  }

  const handleAudioRestartClick = () => {
    clearDelayedPlayback()

    const audio = audioElementRef.current
    if (!audio || !currentVoiceRecording) {
      setAudioPlaybackState('idle')
      return
    }

    audio.pause()
    audio.currentTime = 0
    audio
      .play()
      .then(() => {
        setAudioPlaybackState('playing')
        setLiveStatus('Playback restarted.')
      })
      .catch(() => {
        setAudioPlaybackState('idle')
      })
  }

  const handleChallengeClick = () => {
    if (!isChallengeUnlocked) {
      setIsNextLockedFeedback(true)
      setLiveStatus('Challenge is locked until audio playback is completed once.')
      window.setTimeout(() => setIsNextLockedFeedback(false), 360)
      return
    }

    transitionPanel('challenge', 'next')
    setLiveStatus('Challenge unlocked.')
  }

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw) as {
        currentIndex?: number
        viewedCardIndexes?: number[]
      }

      if (typeof parsed.currentIndex === 'number' && parsed.currentIndex >= 0 && parsed.currentIndex < cards.length) {
        setCurrentIndex(parsed.currentIndex)
      }

      if (Array.isArray(parsed.viewedCardIndexes)) {
        const sanitized = parsed.viewedCardIndexes.filter((value) => Number.isInteger(value) && value >= 0 && value < cards.length)
        if (sanitized.length > 0) {
          setViewedCardIndexes(new Set(sanitized))
        }
      }
    } catch {
      window.localStorage.removeItem(PROGRESS_STORAGE_KEY)
    }
  }, [cards.length])

  useEffect(() => {
    const payload = JSON.stringify({
      currentIndex,
      viewedCardIndexes: Array.from(viewedCardIndexes),
    })

    window.localStorage.setItem(PROGRESS_STORAGE_KEY, payload)
  }, [currentIndex, viewedCardIndexes])

  useEffect(() => {
    if (!isAnimating) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setPreviousIndex(null)
      setIsAnimating(false)
    }, ANIMATION_MS)

    return () => window.clearTimeout(timeoutId)
  }, [isAnimating])

  const goTo = (nextIndex: number, nextDirection: 'next' | 'prev') => {
    if (isAnimating || nextIndex < 0 || nextIndex >= cards.length || nextIndex === currentIndex) {
      return
    }

    setDirection(nextDirection)
    setShowReportGrid(false)
    setPreviousIndex(currentIndex)
    setCurrentIndex(nextIndex)
    setIsAnimating(true)
  }

  const goNext = () => {
    if (!canAdvanceFromCurrent) {
      setIsNextLockedFeedback(true)
      window.setTimeout(() => setIsNextLockedFeedback(false), 360)
      return
    }

    if (currentPanelMode === 'help') {
      transitionPanel(helpReturnMode, 'prev')
      return
    }

    if (currentIsTrainingCard) {
      if (currentPanelMode === 'main') {
        handleAudioPlayClick()
        return
      }

      if (currentPanelMode === 'additional') {
        if (hasCurrentPocFocus) {
          if (!isPocPanelExpanded) {
            setIsPocPanelExpanded(true)
            setLiveStatus('CMS-485 Box Explorer expanded.')
            return
          }

          handleChallengeClick()
          return
        }

        handleChallengeClick()
        return
      }

      if (currentPanelMode === 'challenge' && !hasCurrentChallengeSubmission) {
        setIsNextLockedFeedback(true)
        setLiveStatus('Submit your challenge answer before moving to the next card.')
        window.setTimeout(() => setIsNextLockedFeedback(false), 360)
        return
      }
    }

    if (currentIndex < cards.length - 1) {
      goTo(currentIndex + 1, 'next')
    }
  }

  const goPrev = () => {
    if (currentIsTrainingCard) {
      if (currentPanelMode === 'help') {
        transitionPanel(helpReturnMode, 'prev')
        return
      }

      if (currentPanelMode === 'challenge') {
        if (hasCurrentPocFocus) {
          setIsPocPanelExpanded(true)
        }
        transitionPanel('additional', 'prev')
        return
      }

      if (currentPanelMode === 'additional') {
        if (hasCurrentPocFocus && isPocPanelExpanded) {
          setIsPocPanelExpanded(false)
          setLiveStatus('CMS-485 Box Explorer collapsed.')
          return
        }

        transitionPanel('main', 'prev')
        return
      }
    }

    if (currentIndex > 0) {
      goTo(currentIndex - 1, 'prev')
    }
  }

  const handleReportSelect = (nextIndex: number) => {
    const trainingCardNumber = nextIndex
    const isLocked = !isDebugMode && trainingCardNumber > unlockedTrainingCount
    if (isLocked) {
      setLiveStatus('Topic is locked until prior topics are completed.')
      return
    }

    if (nextIndex === currentIndex) {
      setShowReportGrid(false)
      return
    }

    goTo(nextIndex, nextIndex > currentIndex ? 'next' : 'prev')
  }

  const handleViewFromCover = () => {
    if (isCoverZoomingOut || showReportGrid) {
      return
    }

    setIsCoverZoomingOut(true)
    window.setTimeout(() => {
      setShowReportGrid(true)
      setIsCoverZoomingOut(false)
    }, COVER_ZOOM_MS)
  }

  useEffect(() => {
    if (!currentIsTrainingCard) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setViewedCardIndexes((previous) => {
        if (previous.has(currentIndex)) {
          return previous
        }
        const updated = new Set(previous)
        updated.add(currentIndex)
        return updated
      })
    }, 1100)

    return () => window.clearTimeout(timeoutId)
  }, [currentIndex, currentIsTrainingCard])

  useEffect(() => {
    stopCurrentAudioPlayback()
    setAudioPlaybackState('idle')
    setAudioModeForTitle(null)
    setChallengeModeForTitle(null)
    setHelpModeForTitle(null)
    setIsPocPanelExpanded(false)
    setIsPanelAnimating(false)
    setPreviousPanelMode(null)
  }, [currentIndex])

  useEffect(() => {
    return () => {
      stopCurrentAudioPlayback()
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        if (currentIndex === 0 && !showReportGrid) {
          handleViewFromCover()
          return
        }
        goNext()
      }

      if (event.key === 'ArrowLeft') {
        goPrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, showReportGrid, canAdvanceFromCurrent])

  const getAudioStatusLabel = () => {
    if (isDebugMode) {
      return 'QA mode: challenge lock bypassed'
    }

    if (audioPlaybackState === 'playing') {
      return 'Playing recording'
    }

    if (audioPlaybackState === 'paused') {
      return 'Playback paused'
    }

    return currentVoiceRecording ? ' ' : 'No recording for this card'
  }

  const renderCardContent = (index: number) => {
    if (index === 0) {
      if (showReportGrid) {
        return <ReportGridCard items={cards.slice(1, -1)} onSelect={(itemIndex) => handleReportSelect(itemIndex + 1)} className="zoom-enter" isDarkMode={isDarkMode} unlockedCount={unlockedTrainingCount} />
      }

      return <TitleCard onView={handleViewFromCover} className={isCoverZoomingOut ? 'zoom-exit' : ''} isDarkMode={isDarkMode} />
    }

    if (index === cards.length - 1) {
      return <EndCard isDarkMode={isDarkMode} />
    }

    const card = TRAINING_CARDS[index - 1]
    const metadata = metadataByTitle.get(card.title)
    const isCurrentCard = index === currentIndex
    const panelModeForCard = getPanelModeForTitle(card.title)
    const additionalContentForCard = getAdditionalContentForTitle(card.title)
    const challengeResultForCard = challengeResultsByTitle[card.title] ?? null

    return (
      <TrainingSection
        {...card}
        pocFocus={metadata?.pocFocus}
        panelMode={panelModeForCard}
        previousPanelMode={isCurrentCard ? previousPanelMode : null}
        isPanelAnimating={isCurrentCard && isPanelAnimating}
        panelTransitionDirection={panelTransitionDirection}
        additionalContent={additionalContentForCard}
        isPocPanelExpanded={isCurrentCard ? isPocPanelExpanded : false}
        onTogglePocPanel={() => setIsPocPanelExpanded((prev) => !prev)}
        manageFocus={isCurrentCard}
        challengeResult={challengeResultForCard}
        onSubmitChallenge={(selectedIndex) => {
          setChallengeResultsByTitle((previous) => ({
            ...previous,
            [card.title]: {
              selectedIndex,
              isCorrect: selectedIndex === 0,
            },
          }))
        }}
        isDarkMode={isDarkMode}
      />
    )
  }

  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden rounded-xl transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-[#121214]/90 text-[#F3F4F6] backdrop-blur-xl border border-white/10 shadow-[0_0_80px_-20px_rgba(199,70,1,0.3)]' 
        : 'bg-white text-[#1F1C1B] border-2 border-[#E5E4E3] shadow-[0_30px_60px_-15px_rgba(31,28,27,0.08)] rounded-2xl'
    }`}>
      {isDebugMode && currentIndex > 0 && currentIndex < cards.length - 1 && (
        <div className="pointer-events-none absolute right-6 top-4 z-30">
          <div className={`rounded border px-3 py-1 text-[10px] uppercase tracking-[0.15em] ${isDarkMode ? 'border-[#64F4F5]/50 bg-black/50 text-[#64F4F5]' : 'border-[#C74601]/35 bg-[#FFF3EC] text-[#C74601]'}`}>
            QA: ON
          </div>
        </div>
      )}
      {/* Header */}
      {currentIndex > 0 && currentIndex < cards.length - 1 && (
      <header className={`flex shrink-0 items-center justify-between px-8 py-5 transition-colors ${
        isDarkMode ? 'border-b border-white/5' : 'border-b-2 border-[#E5E4E3] bg-white'
      }`}>
        <div className="flex items-center gap-3">
          <img 
            src={isDarkMode ? titleMedia : headerLogoGray} 
            alt="CareIndeed" 
            className={`h-8 w-auto object-contain transition-transform duration-500 hover:scale-105 ${isDarkMode ? 'opacity-90 hover:opacity-100' : ''}`}
          />
        </div>

        {currentIndex > 0 && currentIndex < cards.length - 1 && (
          <div className="flex items-center gap-4">
            <div className={`text-xl font-medium tracking-widest px-5 py-1.5 border transition-colors ${
              isDarkMode 
                ? 'text-white/50 bg-black/50 border-white/10 backdrop-blur-sm shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] rounded' 
                : 'text-[#1F1C1B] font-semibold bg-[#F7FEFF] border-2 border-[#007970] shadow-[3px_3px_0_#007970] rounded-lg'
            }`}>
              {currentIndex} <span className={isDarkMode ? 'text-[#C74601]' : 'text-[#007970]'}>/ {cards.length - 2}</span>
            </div>
          </div>
        )}
      </header>
      )}

      {/* Progress Bar */}
      {currentIndex > 0 && currentIndex < cards.length - 1 && (
        <div className={`w-full relative overflow-hidden shrink-0 ${isDarkMode ? 'bg-white/5 h-1' : 'bg-[#E5E4E3] h-1.5'}`}>
          <div 
            className={`absolute top-0 left-0 h-full bg-gradient-to-r from-[#007970] via-[#64F4F5] to-[#C74601] transition-all duration-700 ease-out ${isDarkMode ? 'shadow-[0_0_15px_#C74601]' : ''}`}
            style={{ width: `${((currentIndex + (currentPanelMode === 'main' ? 0.3 : currentPanelMode === 'additional' ? 0.6 : 1)) / (cards.length - 2)) * 100}%` }}
          />
        </div>
      )}

      {/* Main Content Area */}
      <main className={`relative flex-1 overflow-hidden transition-colors ${isDarkMode ? '' : 'bg-white'}`}>
        {/* Subtle Background Glows */}
        {isDarkMode ? (
          <>
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#007970]/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#C74601]/10 rounded-full blur-[100px] pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#C4F4F5]/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#FFD5BF]/30 rounded-full blur-[100px] pointer-events-none" />
          </>
        )}

        <div
          className="absolute inset-0 z-10 flex items-center justify-center"
          onTouchStart={(e) => (touchStartXRef.current = e.changedTouches[0].clientX)}
          onTouchEnd={(e) => {
            if (!touchStartXRef.current) return
            const diff = e.changedTouches[0].clientX - touchStartXRef.current
            if (Math.abs(diff) > 50) {
              diff < 0 ? goNext() : goPrev()
            }
            touchStartXRef.current = null
          }}
        >
          {/* Previous Card (Slide Out) */}
          {previousIndex !== null && (
            <div
              className={`absolute inset-0 transform transition-transform duration-500 ease-in-out ${
                direction === 'next' ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'
              } flex items-center justify-center`}
            >
              {renderCardContent(previousIndex)}
            </div>
          )}

          {/* Current Card (Slide In) */}
          <div
            className={`absolute inset-0 transform transition-transform duration-500 ease-in-out ${
              isAnimating
                ? direction === 'next'
                  ? 'animate-slide-in-right'
                  : 'animate-slide-in-left'
                : 'translate-x-0'
            } flex items-center justify-center`}
          >
            {renderCardContent(currentIndex)}
          </div>
        </div>
      </main>

      {/* Footer Controls */}
      {currentIndex > 0 && currentIndex < cards.length - 1 && (
        <footer className={`px-8 py-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4 relative z-20 shrink-0 transition-colors ${
          isDarkMode ? 'border-t border-white/5 bg-[#0A0A0C]/80 backdrop-blur-xl' : 'border-t-2 border-[#E5E4E3] bg-[#FAFBF8]'
        }`}>
            {/* Left: Navigation */}
            <div className="flex items-center gap-2 justify-self-start">
              <Button
                variant="ghost"
                onClick={goPrev}
                className={`gap-2 font-semibold uppercase tracking-widest border-transparent transition-colors ${
                  isDarkMode 
                    ? 'text-white/50 hover:text-white hover:bg-white/10' 
                    : 'text-[#747474] hover:text-[#1F1C1B] hover:bg-[#E5E4E3]'
                }`}
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Back</span>
              </Button>

              <div className={`h-4 w-px mx-1 ${isDarkMode ? 'bg-white/10' : 'bg-[#E5E4E3]'}`} />

              <Button
                variant="ghost"
                onClick={handleHelpToggle}
                className={`gap-2 font-semibold uppercase tracking-widest border-transparent transition-colors ${
                  currentPanelMode === 'help' 
                    ? (isDarkMode ? 'text-[#C74601] bg-[#C74601]/20' : 'text-[#C74601] bg-[#FFEEE5]')
                    : (isDarkMode ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-[#747474] hover:text-[#1F1C1B] hover:bg-[#E5E4E3]')
                }`}
              >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Help</span>
              </Button>

              <div className={`h-4 w-px mx-1 ${isDarkMode ? 'bg-white/10' : 'bg-[#E5E4E3]'}`} />

              <Button
                variant="ghost"
                onClick={onToggleDarkMode}
                className={`gap-2 font-semibold uppercase tracking-widest border-transparent transition-colors ${
                  isDarkMode
                    ? 'text-[#FFB27F] hover:text-white hover:bg-white/10'
                    : 'text-[#007970] hover:text-[#005a54] hover:bg-[#E5FEFF]'
                }`}
              >
                <span className="hidden lg:inline">{isDarkMode ? 'Light Mode' : 'Night Mode'}</span>
                <span className="lg:hidden">Mode</span>
              </Button>
            </div>

            {/* Center: Audio Controls */}
            <div className="flex flex-col items-center gap-2 justify-self-center">
              <div className={`flex items-center gap-1 p-1 transition-colors ${
                isDarkMode ? 'bg-black/50 border border-white/10 rounded-lg' : 'bg-white border-2 border-[#E5E4E3] rounded-xl shadow-sm'
              }`}>
                {audioPlaybackState === 'playing' ? (
                  <Button
                    variant="ghost" 
                    onClick={handleAudioPauseClick}
                    className={`h-9 w-9 p-0 rounded-lg border-transparent transition-colors ${
                      isDarkMode 
                        ? 'text-[#64F4F5] bg-transparent hover:bg-white/10' 
                        : 'text-[#007970] bg-[#E5FEFF] hover:bg-[#C4F4F5]'
                    }`}
                  >
                    <Pause className="h-4 w-4 fill-current" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={handleAudioPlayClick}
                    className={`h-9 w-9 p-0 rounded-lg border-transparent transition-colors ${
                      isDarkMode
                        ? 'text-[#64F4F5] hover:bg-white/10'
                        : 'text-[#007970] hover:bg-[#E5FEFF]'
                    }`}
                    disabled={!currentVoiceRecording}
                  >
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  </Button>
                )}

                <div className={`w-px h-5 mx-1 ${isDarkMode ? 'bg-white/10' : 'bg-[#E5E4E3]'}`}></div>

                <Button
                    variant="ghost"
                     onClick={handleAudioStopClick}
                    className={`h-9 w-9 p-0 rounded-lg border-transparent transition-colors ${
                      isDarkMode
                        ? 'text-white/50 hover:text-white hover:bg-white/10'
                        : 'text-[#747474] hover:text-[#D70101] hover:bg-[#FFF0F0]'
                    }`}
                    disabled={!currentVoiceRecording}
                >
                    <Square className="h-4 w-4 fill-current" />
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleAudioRestartClick}
                  className={`h-9 w-9 p-0 rounded-lg border-transparent transition-colors ${
                    isDarkMode
                      ? 'text-white/50 hover:text-white hover:bg-white/10'
                      : 'text-[#747474] hover:text-[#007970] hover:bg-[#E5FEFF]'
                  }`}
                  disabled={!currentVoiceRecording}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              <span className={`text-[9px] uppercase tracking-[0.2em] animate-pulse ${isDarkMode ? 'font-medium text-[#64F4F5]/50' : 'font-bold text-[#747474]'}`}>
                {liveStatus || getAudioStatusLabel()}
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 justify-self-end">
              <Button
                variant="ghost"
                onClick={onToggleDebugMode}
                className={`gap-2 font-semibold uppercase tracking-widest border-transparent transition-colors ${
                  isDarkMode
                    ? 'text-[#64F4F5] hover:text-white hover:bg-white/10'
                    : 'text-[#C74601] hover:text-[#A83B01] hover:bg-[#FFEEE5]'
                }`}
              >
                <Zap className="h-4 w-4" />
                <span className="hidden lg:inline">QA {isDebugMode ? 'ON' : 'OFF'}</span>
              </Button>

              <Button
                onClick={handleChallengeClick}
                className={`relative overflow-hidden transition-all duration-300 font-bold uppercase tracking-widest text-xs border-transparent ${
                  isChallengeUnlocked
                    ? (isDarkMode ? 'text-[#C74601] hover:bg-[#C74601]/20 hover:text-[#FF8D4D]' : 'text-[#C74601] hover:bg-[#FFEEE5] hover:text-[#a03800]')
                    : (isDarkMode ? 'text-gray-600 opacity-50 cursor-not-allowed hover:bg-transparent' : 'text-[#747474] opacity-50 cursor-not-allowed hover:bg-transparent')
                } ${isNextLockedFeedback ? 'animate-shake' : ''}`}
              >
                <div className="relative z-10 flex items-center gap-2">
                  {isChallengeUnlocked ? (
                    <Zap className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  <span>Test Knowledge</span>
                </div>
              </Button>

              <Button
                onClick={goNext}
                className={`group transition-all ${
                  isDarkMode
                    ? 'rounded border border-white bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-[#64F4F5] hover:shadow-[0_0_20px_rgba(100,244,245,0.4)]'
                    : 'rounded-xl border-2 border-[#004142] bg-[#007970] text-white hover:bg-[#006059] hover:shadow-[4px_4px_0_#004142] hover:-translate-y-1 hover:-translate-x-1'
                } ${isNextLockedFeedback ? 'animate-shake' : ''}`}
              >
                <span className="hidden sm:inline font-bold uppercase tracking-widest text-xs">Next</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          <audio
            ref={audioElementRef}
            src={currentVoiceRecording ?? undefined}
            onEnded={() => {
              setAudioPlaybackState('idle')
              setAudioCompletedTitles(prev => {
                const updated = new Set(prev)
                updated.add(currentCardTitle)
                return updated
              })
            }}
            onPause={() => setAudioPlaybackState(state => state === 'playing' ? 'paused' : state)}
          />
        </footer>
      )}
    </div>
  )
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isDebugMode, setIsDebugMode] = useState(true)

  return (
    <CardFlowLayout isDarkMode={isDarkMode}>
      <FlowCards
        isDarkMode={isDarkMode}
        isDebugMode={isDebugMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onToggleDebugMode={() => setIsDebugMode((prev) => !prev)}
      />
    </CardFlowLayout>
  )
}

export default App
