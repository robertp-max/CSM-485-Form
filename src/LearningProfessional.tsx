import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
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
  BookOpen,
  Layers,
  GraduationCap,
  Award,
  LayoutGrid,
} from 'lucide-react'
import { Dock } from './components/Dock'
import type { DockItem } from './components/Dock'
import { SettingsPanel } from './components/SettingsPanel'
import type { SettingsState } from './components/SettingsPanel'
import { PlanOfCareFocusPanel } from './components/PlanOfCareFocusPanel'
import { Cms485VirtualForm } from './components/Cms485VirtualForm'
import { TermHighlighter } from './components/TermHighlighter'
import { useGlossary } from './components/GlossaryProvider'
import titleMedia from './assets/CI Home Health Logo_White.png'
import headerLogoGray from './assets/CI Home Health Logo_Gray.png'
import introVideo from './assets/CMS-485 Form (jake).mp4'
import additionalContentRaw from './assets/Additional Content.txt?raw'
import { TRAINING_CARDS } from './data/trainingCards'
import { CARD_METADATA } from './data/cardMetadata'
import { useTheme } from './hooks/useTheme'
import { ViewModeToggle } from './components/ViewModeToggle'

/* ─── URL Constants ─── */
const SYSTEMS_DOC_URL = import.meta.env.BASE_URL + 'systems-documentation.html'
const COURSE_FRAMEWORK_URL = import.meta.env.BASE_URL + 'course-framework.html'
const MASTERING_CMS485_URL = import.meta.env.BASE_URL + 'mastering-cms485.html'
const COURSE_DOCUMENTATION_URL = import.meta.env.BASE_URL + 'course-documentation.html'
const FAQ_HUB_URL = import.meta.env.BASE_URL + 'faq-hub.html'

/* ─── Constants ─── */
const PROGRESS_STORAGE_KEY = 'cms485.pro.progress.v1'

type PanelMode = 'main' | 'additional' | 'challenge' | 'help'

type ChallengeResult = {
  selectedIndex: number
  isCorrect: boolean
}

type HelpSection = {
  title: string
  body: string[]
}

type FlowCardKind = 'intro-video' | 'cover' | 'training' | 'final-test' | 'complete'

type FlowCardItem = {
  title: string
  content: null
  kind: FlowCardKind
  trainingIndex?: number
}

type FinalTestQuestion = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  rationale: string
}

/* ─── Helper Functions ─── */
const normalizeText = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

const parseAdditionalContentByTitle = (rawContent: string) => {
  const contentMap = new Map<string, string>()
  const sections = rawContent.split(/\n(?=\d+\.\s)/).map(s => s.trim()).filter(Boolean)
  sections.forEach(section => {
    const headingMatch = section.match(/^\d+\.\s+([^\n]+)/)
    const bodyMatch = section.match(/"([\s\S]*)"/)
    if (!headingMatch || !bodyMatch) return
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
  return decodeURIComponent(fileName).replace(/\.wav$/i, '').replace(/\s+\(\d+\)\s*$/, '').trim()
}

const ADDITIONAL_CONTENT_BY_TITLE = parseAdditionalContentByTitle(additionalContentRaw)

const VOICE_RECORDINGS = import.meta.glob('./assets/Voice Recordings/*.wav', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const VOICE_RECORDING_BY_TITLE = (() => {
  const mapping = new Map<string, string>()
  const normalizedTitleEntries = TRAINING_CARDS.map(card => ({
    title: card.title,
    normalized: normalizeText(card.title),
  }))

  Object.entries(VOICE_RECORDINGS).forEach(([filePath, audioUrl]) => {
    const normalizedStem = normalizeText(getRecordingStemFromPath(filePath))
    const bestTitleMatch = normalizedTitleEntries
      .filter(({ normalized }) => normalizedStem.includes(normalized) || normalized.includes(normalizedStem))
      .sort((left, right) => right.normalized.length - left.normalized.length)[0]
    if (!bestTitleMatch || mapping.has(bestTitleMatch.title)) return
    mapping.set(bestTitleMatch.title, audioUrl)
  })

  const oasisTitle = 'OASIS to Plan of Care Alignment'
  const targetTitle = 'Maintaining OASIS-POC Continuity'
  if (mapping.has(oasisTitle)) {
    const oasisAudio = mapping.get(oasisTitle)
    if (oasisAudio && !mapping.has(targetTitle)) {
      mapping.set(targetTitle, oasisAudio)
      mapping.delete(oasisTitle)
    }
  }

  const homeboundCardTitle = 'Homebound Criteria: Core Standard'
  if (!mapping.has(homeboundCardTitle)) {
    for (const [filePath, audioUrl] of Object.entries(VOICE_RECORDINGS)) {
      const stem = normalizeText(getRecordingStemFromPath(filePath))
      if (stem.includes('homebound criteria') || stem.startsWith('10 homebound')) {
        mapping.set(homeboundCardTitle, audioUrl)
        break
      }
    }
  }

  const explicitMappings: Record<string, string[]> = {
    'Visit Frequency and Duration': ['visit frequency and duration'],
    'Diagnosis and PDGM Relevance': ['diagnosis and pdgm relevance', 'diagnosis and pdgm'],
    'Diagnosis Integrity Safeguards': ['diagnosis integrity safeguards', 'diagnosis integrity'],
    'OASIS to Plan of Care Alignment': ['oasis to plan of care alignment'],
    'Survey Deficiency Pattern: Safety Gaps': ['survey deficiency pattern safety gaps', 'safety gaps'],
    'Survey Deficiency Pattern: Weak Coordination': ['survey deficiency pattern weak coordination', 'weak coordination'],
    'Survey Deficiency Pattern: Incomplete Plans': ['survey deficiency pattern incomplete plans', 'incomplete plans'],
    'Discipline Planning and Coordination': ['discipline planning and coordination'],
    'Interim Order Governance': ['interim order governance'],
    'Verbal and Telephone Orders: Core Rules': ['verbal and telephone orders core rules', 'verbal and telephone orders'],
    'Audit Trigger: Timeline Conflicts': ['audit trigger timeline conflicts'],
    'Audit Trigger: Storyline Inconsistency': ['audit trigger storyline inconsistency'],
    'Defensibility Checklist: Pre-Bill': ['defensibility checklist pre bill'],
    'Good vs Bad Example: Skilled Narrative': ['good vs bad example skilled narrative'],
    'Good vs Bad Example: Homebound Support': ['good vs bad example homebound support'],
    'Good vs Bad Example: Goal Quality': ['good vs bad example goal quality'],
    'Good vs Bad Example: Order Specificity': ['good vs bad example order specificity'],
    'Final Checklist: Daily Documentation Habits': ['final checklist daily documentation habits'],
    'Final Checklist: Leadership Controls': ['final checklist leadership controls'],
    'Key Takeaways and Next Actions': ['key takeaways and next actions'],
  }

  for (const [cardTitle, queries] of Object.entries(explicitMappings)) {
    if (mapping.has(cardTitle)) continue
    for (const [filePath, audioUrl] of Object.entries(VOICE_RECORDINGS)) {
      const stem = normalizeText(getRecordingStemFromPath(filePath))
      if (queries.some(q => stem.includes(q))) {
        mapping.set(cardTitle, audioUrl)
        break
      }
    }
  }

  return mapping
})()

const getAdditionalContentForTitle = (title: string) => {
  const normalizedTitle = normalizeText(title)
  const directMatch = ADDITIONAL_CONTENT_BY_TITLE.get(normalizedTitle)
  if (directMatch) return directMatch
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

const getChallengeData = (title: string, bullets: string[], objective: string) => {
  const baseOptions = getChallengeOptions(bullets, objective)
  const seed = Array.from(title).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const rotation = seed % baseOptions.length
  const options = baseOptions.map((_, index) => baseOptions[(index + rotation) % baseOptions.length])
  const correctIndex = (baseOptions.length - rotation) % baseOptions.length
  return { options, correctIndex }
}

/* ─── Final Test ─── */
const FINAL_TEST_TITLE = 'Final Test'

const FINAL_TEST_OBJECTIVE =
  'Validate mastery of final operational priorities by applying the daily habits, leadership controls, and defensibility standards from the expanded Takeaways content.'

const FINAL_TEST_KEY_POINTS = [
  'Daily documentation must include skilled rationale, intervention details, and patient response every visit.',
  'Discrepancies should be escalated and reconciled immediately while the clinical picture is fresh.',
  'Leadership controls require metric surveillance, focused retraining, and one source of truth.',
]

const FINAL_TEST_CLINICAL_LENS =
  'Test decisions against one standard: clear, complete, and clinically coherent documentation at every step of the episode lifecycle.'

const FINAL_TEST_QUESTIONS: FinalTestQuestion[] = [
  { id:'ft-1', prompt:'Which 3 elements must be clearly documented in every visit note?', options:['Skilled rationale, intervention details, and patient response','Staffing level, room setup, and patient preference','Billing code, payer tier, and episode length','Device brand, visit route, and chart color'], correctIndex:0, rationale:'Daily habits in the Takeaways require these three elements to be explicit before closing a note.' },
  { id:'ft-2', prompt:'When should OASIS-to-POC or order discrepancies be reconciled?', options:['At discharge when all notes are complete','Immediately, not deferred to episode end','Only if a payer requests clarification','During annual policy review meetings'], correctIndex:1, rationale:'The expanded content states problems age poorly, so discrepancies should be escalated and fixed today.' },
  { id:'ft-3', prompt:'Before major episode milestones, what self-audit behavior is expected?', options:['Review chart as an auditor would for narrative coherence and required elements','Only verify signature dates','Wait for manager review before checking anything','Copy the previous milestone documentation'], correctIndex:0, rationale:'The Takeaways call for structured self-audit habits through an auditor lens at SOC, recert, and discharge.' },
  { id:'ft-4', prompt:'Which leadership control is explicitly required for sustained compliance?', options:['Monthly social media updates','Tracking denial trends, signature timeliness, and order-aging metrics','Increasing visit volume targets each quarter','Rotating documentation templates weekly'], correctIndex:1, rationale:'Leadership controls in the expanded content prioritize routine metric monitoring to catch vulnerabilities early.' },
  { id:'ft-5', prompt:'How should retraining be delivered when chart deficiencies trend in one area?', options:['Use focused retraining tied to the specific deficiency pattern','Send one generic agency-wide reminder','Wait for survey findings to trigger education','Suspend all audits until quarter end'], correctIndex:0, rationale:'The content directs leaders to run targeted retraining rather than broad non-specific reminders.' },
  { id:'ft-6', prompt:'What is the purpose of maintaining a single source of truth for policy/workflow/checklists?', options:['Reduce team meetings','Ensure immediate, unified operational updates when regulations change','Eliminate physician involvement in revisions','Avoid documenting process changes'], correctIndex:1, rationale:'The Takeaways emphasize synchronized updates so the agency moves in unison with regulatory changes.' },
  { id:'ft-7', prompt:'According to the final operational priorities, defensibility is built through:', options:['High volume and rapid closure only','Consistency, clinical traceability, and timely order/signature governance','Minimal documentation with verbal clarification later','Separate standards by discipline'], correctIndex:1, rationale:'The final section explicitly defines this 3-part structure as the defensibility foundation.' },
  { id:'ft-8', prompt:'Which statement best reflects the recommended day-60 mindset?', options:['Documentation can relax after recertification','Apply the same framework as a repeatable standard across every episode','Move to summary-only charting near episode end','Focus on speed over narrative linkage'], correctIndex:1, rationale:'The expanded content says to keep the same defensible framework active across every episode without letting guard down.' },
  { id:'ft-9', prompt:'What does compliance-ready documentation protect, per the closing section?', options:['Only reimbursement cycle timing','Only survey outcomes','Clinician licenses, financial integrity, and patient safety/coordination','Only internal dashboard performance'], correctIndex:2, rationale:'The closing text links documentation quality to licensure protection, financial integrity, and safe coordinated care.' },
  { id:'ft-10', prompt:'What final audit standard should guide every chart touchpoint?', options:['Maximum note length','Narrative style preference by reviewer','Clear, complete, and clinically coherent documentation at every step','Template consistency regardless of patient specifics'], correctIndex:2, rationale:'The final audit focus is stated verbatim in the Key Takeaways and Next Actions expanded content.' },
]

/* ─── Help Sections ─── */
const LEARNER_HELP_SECTIONS: HelpSection[] = [
  { title:'How This Training Works', body:['This learning experience is section-based. Each topic includes a learning objective, key points, clinical lens, additional content, and a challenge check.','Use Next and Back to move through topics.'] },
  { title:'Navigation Basics', body:['Back returns to the prior state. Next advances in sequence.','You can also use keyboard arrows.'] },
  { title:'Audio and Additional Content', body:['Select PLAY to open additional content and start narration.','Pause, Stop, and Restart are available while audio is active.'] },
  { title:'Challenge Rules', body:['Challenge is available once audio is completed.','Each challenge allows one submission per session.'] },
  { title:'Progress', body:['Your location is retained for continuity.','Challenge state is session-based.'] },
  { title:'Accessibility', body:['Keyboard navigation and visible focus states are supported.','Reduced motion preferences are respected.'] },
]

/* ─── Professional Learning Page ─── */
export default function LearningProfessional() {
  const { resetClaims } = useGlossary()
  const metadataByTitle = useMemo(() => new Map(CARD_METADATA.map(item => [item.title, item])), [])
  const { theme, isDarkMode, setTheme } = useTheme()

  const cards = useMemo<FlowCardItem[]>(() => [
    { title: 'Intro Video', content: null, kind: 'intro-video' },
    { title: 'Title', content: null, kind: 'cover' },
    ...TRAINING_CARDS.map((card, trainingIndex) => ({
      title: card.title, content: null, kind: 'training' as const, trainingIndex,
    })),
    { title: FINAL_TEST_TITLE, content: null, kind: 'final-test' },
    { title: 'Complete', content: null, kind: 'complete' },
  ], [])

  /* ─── State ─── */
  const [currentIndex, setCurrentIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const [showReportGrid, setShowReportGrid] = useState(false)
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
  const [finalTestPageIndex, setFinalTestPageIndex] = useState(0)
  const [finalTestAnswers, setFinalTestAnswers] = useState<Record<string, number>>({})
  const [liveStatus, setLiveStatus] = useState('')
  const [showVirtualForm, setShowVirtualForm] = useState(false)
  const [settings, setSettings] = useState<SettingsState>(() => ({
    appearance: theme,
    reducedMotion: false,
    interactiveEffects: true,
  }))
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const touchStartXRef = useRef<number | null>(null)

  const isDebugMode = true // QA mode on by default in professional view
  const reducedMotion = settings.reducedMotion

  useEffect(() => {
    if (settings.appearance !== theme) setTheme(settings.appearance)
  }, [settings.appearance, theme, setTheme])

  /* ─── Derived ─── */
  const currentCard = cards[currentIndex]
  const coverCardIndex = useMemo(() => cards.findIndex(i => i.kind === 'cover'), [cards])
  const trainingStartIndex = useMemo(() => cards.findIndex(i => i.kind === 'training'), [cards])
  const currentIsTrainingCard = currentCard?.kind === 'training'
  const currentIsFinalTestCard = currentCard?.kind === 'final-test'
  const showNavigationChrome = currentIsTrainingCard || currentIsFinalTestCard
  const progressCardIndexes = useMemo(() =>
    cards.map((item, index) => (item.kind === 'training' || item.kind === 'final-test' ? index : -1)).filter(i => i >= 0),
  [cards])
  const totalProgressSteps = Math.max(1, progressCardIndexes.length)
  const currentCardTitle = currentCard?.title ?? ''
  const currentVoiceRecording = currentIsTrainingCard ? VOICE_RECORDING_BY_TITLE.get(currentCardTitle) ?? null : null
  const isChallengeUnlocked = isDebugMode || audioCompletedTitles.has(currentCardTitle)
  const hasCurrentChallengeSubmission = Boolean(challengeResultsByTitle[currentCardTitle])
  const currentCardMetadata = currentIsTrainingCard ? metadataByTitle.get(currentCardTitle) : undefined
  const hasCurrentPocFocus = Boolean(currentCardMetadata?.pocFocus)

  const viewedTrainingCount = useMemo(() =>
    cards.filter((item, index) => item.kind === 'training' && viewedCardIndexes.has(index)).length,
  [cards, viewedCardIndexes])
  const unlockedTrainingCount = isDebugMode
    ? TRAINING_CARDS.length
    : Math.min(TRAINING_CARDS.length, Math.max(1, viewedTrainingCount + 1))

  const getPanelModeForTitle = (title: string): PanelMode => {
    if (helpModeForTitle === title) return 'help'
    if (challengeModeForTitle === title) return 'challenge'
    if (audioModeForTitle === title) return 'additional'
    return 'main'
  }

  const currentPanelMode = currentIsTrainingCard ? getPanelModeForTitle(currentCardTitle) : 'main'
  const displayProgressStep = currentIsTrainingCard ? (currentCard?.trainingIndex ?? 0) + 1 : Math.max(1, progressCardIndexes.indexOf(currentIndex) + 1)
  const canAdvanceFromCurrent = !currentIsTrainingCard || viewedCardIndexes.has(currentIndex)

  /* ─── Reduced motion ─── */
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) setSettings(prev => ({ ...prev, reducedMotion: true }))
  }, [])

  /* ─── Audio Helpers ─── */
  const stopCurrentAudioPlayback = () => {
    const audio = audioElementRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
  }

  const transitionPanel = (nextMode: PanelMode, _dir: 'next' | 'prev') => {
    if (!currentIsTrainingCard) return
    const activeMode = getPanelModeForTitle(currentCardTitle)
    if (activeMode === nextMode) return

    if (nextMode === 'help') {
      if (activeMode === 'main' || activeMode === 'additional' || activeMode === 'challenge') setHelpReturnMode(activeMode)
      setHelpModeForTitle(currentCardTitle)
      return
    }

    setHelpModeForTitle(null)
    if (nextMode === 'main') { setAudioModeForTitle(null); setChallengeModeForTitle(null) }
    else if (nextMode === 'additional') { setAudioModeForTitle(currentCardTitle); setChallengeModeForTitle(null) }
    else { setAudioModeForTitle(currentCardTitle); setChallengeModeForTitle(currentCardTitle) }
  }

  const handleHelpToggle = () => {
    if (!currentIsTrainingCard) return
    if (currentPanelMode === 'help') { transitionPanel(helpReturnMode, 'prev'); return }
    transitionPanel('help', 'prev')
  }

  const handleAudioPlayClick = () => {
    if (!currentIsTrainingCard) return
    transitionPanel('additional', 'next')
    stopCurrentAudioPlayback()
    const audio = audioElementRef.current
    if (!audio || !currentVoiceRecording) {
      setAudioPlaybackState('idle')
      setLiveStatus('No recording available.')
      return
    }
    audio.currentTime = 0
    audio.play().then(() => { setAudioPlaybackState('playing'); setLiveStatus('Playing.') }).catch(() => { setAudioPlaybackState('idle') })
  }

  const handleAudioPauseClick = () => { audioElementRef.current?.pause(); setAudioPlaybackState('paused') }
  const handleAudioStopClick = () => { stopCurrentAudioPlayback(); setAudioPlaybackState('idle') }
  const handleAudioRestartClick = () => {
    const audio = audioElementRef.current
    if (!audio || !currentVoiceRecording) { setAudioPlaybackState('idle'); return }
    audio.pause(); audio.currentTime = 0
    audio.play().then(() => { setAudioPlaybackState('playing') }).catch(() => { setAudioPlaybackState('idle') })
  }

  const handleChallengeClick = () => {
    if (!isChallengeUnlocked) {
      setIsNextLockedFeedback(true)
      setTimeout(() => setIsNextLockedFeedback(false), 360)
      return
    }
    transitionPanel('challenge', 'next')
  }

  /* ─── Persistence ─── */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as { currentIndex?: number; viewedCardIndexes?: number[] }
      if (typeof parsed.currentIndex === 'number' && parsed.currentIndex >= 0 && parsed.currentIndex < cards.length) setCurrentIndex(parsed.currentIndex)
      if (Array.isArray(parsed.viewedCardIndexes)) {
        const sanitized = parsed.viewedCardIndexes.filter(v => Number.isInteger(v) && v >= 0 && v < cards.length)
        if (sanitized.length > 0) setViewedCardIndexes(new Set(sanitized))
      }
    } catch { window.localStorage.removeItem(PROGRESS_STORAGE_KEY) }
  }, [cards.length])

  useEffect(() => {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ currentIndex, viewedCardIndexes: Array.from(viewedCardIndexes) }))
  }, [currentIndex, viewedCardIndexes])

  useEffect(() => {
    if (!isAnimating) return
    const id = setTimeout(() => { setPreviousIndex(null); setIsAnimating(false) }, reducedMotion ? 0 : 320)
    return () => clearTimeout(id)
  }, [isAnimating, reducedMotion])

  /* ─── Navigation ─── */
  const goTo = (nextIndex: number, nextDirection: 'next' | 'prev') => {
    if (isAnimating || nextIndex < 0 || nextIndex >= cards.length || nextIndex === currentIndex) return
    setDirection(nextDirection)
    setShowReportGrid(false)
    setPreviousIndex(currentIndex)
    setCurrentIndex(nextIndex)
    setIsAnimating(true)
    resetClaims()
  }

  const goNext = () => {
    if (!canAdvanceFromCurrent) {
      setIsNextLockedFeedback(true)
      setTimeout(() => setIsNextLockedFeedback(false), 360)
      return
    }
    if (currentPanelMode === 'help') { transitionPanel(helpReturnMode, 'prev'); return }

    if (currentIsFinalTestCard) {
      const totalFinalTestPages = FINAL_TEST_QUESTIONS.length + 2
      if (finalTestPageIndex === 0) { setFinalTestPageIndex(1); return }
      if (finalTestPageIndex >= 1 && finalTestPageIndex <= FINAL_TEST_QUESTIONS.length) {
        const question = FINAL_TEST_QUESTIONS[finalTestPageIndex - 1]
        if (finalTestAnswers[question.id] === undefined) {
          setIsNextLockedFeedback(true)
          setTimeout(() => setIsNextLockedFeedback(false), 360)
          return
        }
        setFinalTestPageIndex(prev => Math.min(totalFinalTestPages - 1, prev + 1))
        return
      }
      if (finalTestPageIndex < totalFinalTestPages - 1) {
        setFinalTestPageIndex(prev => Math.min(totalFinalTestPages - 1, prev + 1))
        return
      }
    }

    if (currentIsTrainingCard) {
      if (currentPanelMode === 'main') { handleAudioPlayClick(); return }
      if (currentPanelMode === 'additional') {
        if (hasCurrentPocFocus && !isPocPanelExpanded) { setIsPocPanelExpanded(true); return }
        handleChallengeClick()
        return
      }
      if (currentPanelMode === 'challenge' && !hasCurrentChallengeSubmission) {
        setIsNextLockedFeedback(true)
        setTimeout(() => setIsNextLockedFeedback(false), 360)
        return
      }
    }

    if (currentIndex < cards.length - 1) goTo(currentIndex + 1, 'next')
  }

  const goPrev = () => {
    if (currentIsFinalTestCard && finalTestPageIndex > 0) { setFinalTestPageIndex(prev => Math.max(0, prev - 1)); return }
    if (currentIsTrainingCard) {
      if (currentPanelMode === 'help') { transitionPanel(helpReturnMode, 'prev'); return }
      if (currentPanelMode === 'challenge') { if (hasCurrentPocFocus) setIsPocPanelExpanded(true); transitionPanel('additional', 'prev'); return }
      if (currentPanelMode === 'additional') {
        if (hasCurrentPocFocus && isPocPanelExpanded) { setIsPocPanelExpanded(false); return }
        transitionPanel('main', 'prev'); return
      }
    }
    if (currentIndex > 0) goTo(currentIndex - 1, 'prev')
  }

  const handleReportSelect = (nextIndex: number) => {
    const trainingCardNumber = nextIndex - trainingStartIndex + 1
    const isLocked = !isDebugMode && trainingCardNumber > unlockedTrainingCount
    if (isLocked) return
    if (nextIndex === currentIndex) { setShowReportGrid(false); return }
    goTo(nextIndex, nextIndex > currentIndex ? 'next' : 'prev')
  }

  const handleViewFromCover = () => {
    if (currentCard?.kind !== 'cover' || showReportGrid) return
    setShowReportGrid(true)
  }

  /* ─── Effects ─── */
  useEffect(() => {
    if (!currentIsTrainingCard) return
    const id = setTimeout(() => {
      setViewedCardIndexes(prev => { if (prev.has(currentIndex)) return prev; const u = new Set(prev); u.add(currentIndex); return u })
    }, 1100)
    return () => clearTimeout(id)
  }, [currentIndex, currentIsTrainingCard])

  useEffect(() => {
    stopCurrentAudioPlayback()
    setAudioPlaybackState('idle')
    setAudioModeForTitle(null)
    setChallengeModeForTitle(null)
    setHelpModeForTitle(null)
    setIsPocPanelExpanded(false)
  }, [currentIndex])

  useEffect(() => () => { stopCurrentAudioPlayback() }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (currentCard?.kind === 'cover' && !showReportGrid) { handleViewFromCover(); return }
        goNext()
      }
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, showReportGrid, canAdvanceFromCurrent, currentPanelMode, currentIsFinalTestCard, finalTestPageIndex, finalTestAnswers, currentCard])

  /* ─── Dock items ─── */
  const dockItems: DockItem[] = [
    { icon: <HelpCircle className="h-5 w-5" />, label: 'FAQ Hub', onClick: () => window.open(FAQ_HUB_URL, '_blank') },
    { icon: <BookOpen className="h-5 w-5" />, label: 'Course Docs', onClick: () => window.open(COURSE_DOCUMENTATION_URL, '_blank') },
    { icon: <Layers className="h-5 w-5" />, label: 'Systems', onClick: () => window.open(SYSTEMS_DOC_URL, '_blank') },
    { icon: <LayoutGrid className="h-5 w-5" />, label: 'Framework', onClick: () => window.open(COURSE_FRAMEWORK_URL, '_blank') },
    { icon: <GraduationCap className="h-5 w-5" />, label: 'Mastering', onClick: () => window.open(MASTERING_CMS485_URL, '_blank') },
    { icon: <Award className="h-5 w-5" />, label: 'Architect', onClick: () => window.open(SYSTEMS_DOC_URL, '_blank') },
  ]

  /* ─── Audio status label ─── */
  const getAudioStatusLabel = () => {
    if (isDebugMode) return 'QA mode: challenge lock bypassed'
    if (audioPlaybackState === 'playing') return 'Playing recording'
    if (audioPlaybackState === 'paused') return 'Playback paused'
    return currentVoiceRecording ? ' ' : 'No recording for this card'
  }

  /* ─── Renderers ─── */
  const renderTrainingSection = (card: typeof TRAINING_CARDS[number], metadata: typeof CARD_METADATA[number] | undefined) => {
    const panelMode = getPanelModeForTitle(card.title)
    const additionalContent = getAdditionalContentForTitle(card.title)
    const challengeResult = challengeResultsByTitle[card.title] ?? null
    const challengeData = getChallengeData(card.title, card.bullets, card.objective)

    return (
      <section className={`flex h-full flex-col justify-start overflow-hidden px-10 py-6 ${isDarkMode ? 'text-white' : 'text-[#1F1C1B]'}`}>
        {/* Section tag */}
        <div className="mb-4 shrink-0">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-[0.14em] ${
            isDarkMode ? 'border-white/10 bg-white/5 text-[#C74601]' : 'border-[#C74601]/15 bg-[#FFF8F5] text-[#C74601]'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-[#C74601]' : 'bg-[#C74601]'}`} />
            {card.section}
          </div>

          {/* Title */}
          <h2 className={`mt-3 text-3xl md:text-4xl font-semibold leading-tight tracking-tight ${
            isDarkMode ? 'text-white' : 'text-[#1F1C1B]'
          }`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {card.title}
          </h2>
        </div>

        {/* Objective banner - main only */}
        {panelMode === 'main' && (
          <div className={`mb-4 shrink-0 p-4 rounded-xl ${
            isDarkMode
              ? 'bg-[#007970]/20 border border-[#007970]/40'
              : 'bg-[#007970] border-2 border-[#004142] shadow-[3px_3px_0_#004142] text-white'
          }`}>
            <div className="flex gap-3 items-start">
              <Target className={`shrink-0 mt-0.5 h-5 w-5 ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#C4F4F5]'}`} />
              <div>
                <h3 className={`text-[10px] font-bold uppercase tracking-[0.14em] mb-1 ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#C4F4F5]'}`}>Learning Objective</h3>
                <p className={`text-sm leading-snug ${isDarkMode ? 'text-white/90' : 'text-white'}`}><TermHighlighter text={card.objective} /></p>
              </div>
            </div>
          </div>
        )}

        {/* Panel content */}
        <div className="flex-1 min-h-0 overflow-auto hide-scrollbar">
          {panelMode === 'main' && (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Key Points */}
              <div className={`p-5 rounded-xl border-2 transition-colors ${
                isDarkMode
                  ? 'bg-white/[0.03] border-white/10'
                  : settings.interactiveEffects
                    ? 'bg-white border-[#E5E4E3] hover:border-[#007970] hover:shadow-[4px_4px_0_#007970] hover:-translate-y-0.5 hover:-translate-x-0.5'
                    : 'bg-white border-[#E5E4E3]'
              }`}>
                <h3 className={`mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest ${
                  isDarkMode ? 'text-white/80' : 'text-[#1F1C1B]'
                }`}>
                  <div className={`p-1 rounded-md ${isDarkMode ? 'text-[#007970]' : 'bg-[#E5FEFF] text-[#007970]'}`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  Key Points
                </h3>
                <ul className="space-y-2">
                  {card.bullets.map((item, index) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className={`text-xs font-bold mt-0.5 ${isDarkMode ? 'text-[#007970]' : 'text-[#007970]'}`}>{`0${index + 1}`}</span>
                      <span className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/70' : 'text-[#524048]'}`}><TermHighlighter text={item} /></span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clinical Lens */}
              <div className={`p-5 rounded-xl border-2 transition-colors ${
                isDarkMode
                  ? 'bg-white/[0.03] border-white/10'
                  : settings.interactiveEffects
                    ? 'bg-white border-[#E5E4E3] hover:border-[#C74601] hover:shadow-[4px_4px_0_#C74601] hover:-translate-y-0.5 hover:-translate-x-0.5'
                    : 'bg-white border-[#E5E4E3]'
              }`}>
                <h3 className={`mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest ${
                  isDarkMode ? 'text-white/80' : 'text-[#1F1C1B]'
                }`}>
                  <div className={`p-1 rounded-md ${isDarkMode ? 'text-[#C74601]' : 'bg-[#FFEEE5] text-[#C74601]'}`}>
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  Clinical Lens
                </h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/70' : 'text-[#524048]'}`}>
                  <TermHighlighter text={card.auditFocus || 'Translate this concept into clear, patient-specific, defensible documentation language that aligns directly with organizational standards.'} />
                </p>
              </div>
            </div>
          )}

          {panelMode === 'additional' && (
            <div className="flex flex-col gap-3 h-full">
              {!isPocPanelExpanded && (
                <div className={`flex-1 p-5 rounded-xl border-2 relative overflow-hidden ${
                  isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-white border-[#D9D6D5] shadow-[4px_4px_0_#D9D6D5]'
                }`}>
                  <div className={`absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 rounded-tr-xl opacity-20 ${isDarkMode ? 'border-[#007970]' : 'border-[#007970]'}`} />
                  <div className={`absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 rounded-bl-xl opacity-20 ${isDarkMode ? 'border-[#C74601]' : 'border-[#C74601]'}`} />
                  <h3 className={`mb-4 text-xs font-bold uppercase tracking-[0.14em] flex items-center gap-2 ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#C74601]'}`}>
                    <AlertCircle className="h-3.5 w-3.5" /> Expanded Context
                  </h3>
                  <p className={`text-base leading-relaxed ${isDarkMode ? 'text-white/90 font-light' : 'text-[#1F1C1B]'}`}>
                    <TermHighlighter text={additionalContent ?? 'No additional content available for this section.'} />
                  </p>
                </div>
              )}
              {metadata?.pocFocus && (
                <PlanOfCareFocusPanel
                  focus={metadata.pocFocus}
                  isExpanded={isPocPanelExpanded}
                  onToggle={() => setIsPocPanelExpanded(prev => !prev)}
                  isDarkMode={isDarkMode}
                />
              )}
            </div>
          )}

          {panelMode === 'challenge' && (
            <ChallengeView
              title={card.title}
              challengeData={challengeData}
              challengeResult={challengeResult}
              isDarkMode={isDarkMode}
              interactiveEffects={settings.interactiveEffects}
              onSubmit={(selectedIndex) => {
                setChallengeResultsByTitle(prev => ({
                  ...prev,
                  [card.title]: { selectedIndex, isCorrect: selectedIndex === challengeData.correctIndex },
                }))
              }}
            />
          )}

          {panelMode === 'help' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {LEARNER_HELP_SECTIONS.map(hs => (
                <div key={hs.title} className={`rounded-lg border p-4 ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-[#E5E4E3] bg-[#FAFBF8]'}`}>
                  <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#007970]">{hs.title}</h4>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-[#524048]'}`}>{hs.body.join(' ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    )
  }

  const renderCardContent = (index: number) => {
    const cardItem = cards[index]

    if (cardItem?.kind === 'intro-video') {
      return <IntroVideoSection isDarkMode={isDarkMode} onComplete={() => { if (currentIndex === index && coverCardIndex >= 0) goTo(coverCardIndex, 'next') }} />
    }

    if (cardItem?.kind === 'cover') {
      if (showReportGrid) {
        return (
          <ReportGrid
            items={TRAINING_CARDS}
            onSelect={(itemIndex) => handleReportSelect(itemIndex + trainingStartIndex)}
            isDarkMode={isDarkMode}
            unlockedCount={unlockedTrainingCount}
            interactiveEffects={settings.interactiveEffects}
          />
        )
      }
      return <CoverSection onView={handleViewFromCover} isDarkMode={isDarkMode} />
    }

    if (cardItem?.kind === 'complete') return <EndSection isDarkMode={isDarkMode} />

    if (cardItem?.kind === 'final-test') {
      return (
        <FinalTestSection
          isDarkMode={isDarkMode}
          pageIndex={finalTestPageIndex}
          answers={finalTestAnswers}
          interactiveEffects={settings.interactiveEffects}
          onAnswer={(qid, oi) => setFinalTestAnswers(prev => ({ ...prev, [qid]: oi }))}
        />
      )
    }

    const trainingIndex = cardItem?.trainingIndex ?? index - 1
    const card = TRAINING_CARDS[trainingIndex]
    const metadata = metadataByTitle.get(card.title)
    return renderTrainingSection(card, metadata)
  }

  /* ─── Progress percentage ─── */
  const progressPercent = (() => {
    const step = displayProgressStep
    const subStep = currentPanelMode === 'main' ? 0.3 : currentPanelMode === 'additional' ? 0.6 : 1
    return ((step + subStep) / totalProgressSteps) * 100
  })()

  /* ─── Render ─── */
  return (
    <div className={`h-full w-full overflow-hidden transition-colors duration-200 ${
      isDarkMode ? 'bg-[#09090b] text-white' : 'bg-[#FAFBF8] text-[#1F1C1B]'
    }`} style={{ fontFamily: 'Roboto, sans-serif' }}>

      {/* Full-screen container */}
      <div className="flex h-full w-full flex-col">

        {/* ─── Clean Header ─── */}
        {showNavigationChrome && (
          <header className={`flex shrink-0 items-center justify-between px-8 py-4 border-b ${
            isDarkMode ? 'border-white/10 bg-[#0F0F11]' : 'border-[#E5E4E3] bg-white'
          }`}>
            {/* Left: Toggle + Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSettings(prev => ({ ...prev, appearance: prev.appearance === 'light' ? 'night' : 'light' }))}
                className={`text-[10px] font-semibold uppercase tracking-[0.12em] px-3 py-1.5 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'border-white/15 text-white/60 hover:text-white hover:border-white/30'
                    : 'border-[#E5E4E3] text-[#747474] hover:text-[#1F1C1B] hover:border-[#007970]'
                }`}
              >
                {isDarkMode ? '☀ Light' : '🌙 Night'}
              </button>
              <ViewModeToggle isDarkMode={isDarkMode} />
              <img
                src={isDarkMode ? titleMedia : headerLogoGray}
                alt="CareIndeed"
                className="h-7 w-auto object-contain"
              />
            </div>

            {/* Center: Section + Progress */}
            <div className="flex items-center gap-4">
              {currentIsTrainingCard && (
                <span className={`text-xs font-medium uppercase tracking-[0.12em] ${isDarkMode ? 'text-white/40' : 'text-[#747474]'}`}>
                  {TRAINING_CARDS[currentCard?.trainingIndex ?? 0]?.section ?? ''}
                </span>
              )}
              <div className={`text-lg font-semibold tracking-widest px-4 py-1 rounded-lg border ${
                isDarkMode
                  ? 'border-white/10 bg-white/5 text-white/70'
                  : 'border-[#007970] bg-[#F7FEFF] text-[#1F1C1B] shadow-[2px_2px_0_#007970]'
              }`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {displayProgressStep} <span className={isDarkMode ? 'text-[#007970]' : 'text-[#007970]'}>/ {totalProgressSteps}</span>
              </div>
            </div>

            {/* Right: Help + Settings + Virtual CMS-485 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleHelpToggle}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentPanelMode === 'help'
                    ? (isDarkMode ? 'bg-[#007970]/20 text-[#64F4F5]' : 'bg-[#E5FEFF] text-[#007970] border border-[#007970]')
                    : (isDarkMode ? 'text-white/50 hover:text-white' : 'text-[#747474] hover:text-[#1F1C1B]')
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5" /> Help
              </button>
              <SettingsPanel settings={settings} onSettingsChange={setSettings} />
              <button
                onClick={() => setShowVirtualForm(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-[0.1em] border transition-colors ${
                  isDarkMode
                    ? 'border-[#64F4F5]/30 text-[#64F4F5] hover:bg-[#64F4F5]/10'
                    : 'border-[#007970]/25 text-[#007970] hover:bg-[#E5FEFF]'
                }`}
              >
                <FileText className="h-3.5 w-3.5" /> Virtual CMS-485
              </button>
            </div>
          </header>
        )}

        {/* Progress bar */}
        {showNavigationChrome && (
          <div className={`w-full shrink-0 ${isDarkMode ? 'bg-white/5 h-1' : 'bg-[#E5E4E3] h-1'}`}>
            <div
              className="h-full bg-gradient-to-r from-[#007970] to-[#64F4F5] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Main content */}
        <main
          className={`relative flex-1 overflow-hidden ${isDarkMode ? '' : 'bg-white'}`}
          onTouchStart={e => (touchStartXRef.current = e.changedTouches[0].clientX)}
          onTouchEnd={e => {
            if (!touchStartXRef.current) return
            const diff = e.changedTouches[0].clientX - touchStartXRef.current
            if (Math.abs(diff) > 50) diff < 0 ? goNext() : goPrev()
            touchStartXRef.current = null
          }}
        >
          {/* Previous card */}
          {previousIndex !== null && !reducedMotion && (
            <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
              direction === 'next' ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'
            }`}>
              {renderCardContent(previousIndex)}
            </div>
          )}

          {/* Current card */}
          <div className={`absolute inset-0 ${
            isAnimating && !reducedMotion
              ? direction === 'next' ? 'animate-slide-in-right' : 'animate-slide-in-left'
              : ''
          }`}>
            {renderCardContent(currentIndex)}
          </div>
        </main>

        {/* Footer */}
        {showNavigationChrome && (
          <footer className={`px-8 py-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4 shrink-0 border-t ${
            isDarkMode ? 'border-white/10 bg-[#0A0A0C]' : 'border-[#E5E4E3] bg-[#FAFBF8]'
          }`}>
            {/* Left: Back */}
            <div className="justify-self-start">
              <button
                onClick={goPrev}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
                  isDarkMode ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-[#747474] hover:text-[#1F1C1B] hover:bg-[#E5E4E3]'
                }`}
              >
                <ArrowLeft className="h-4 w-4" /> Return
              </button>
            </div>

            {/* Center: Audio */}
            <div className="flex flex-col items-center gap-1.5 justify-self-center">
              <div className={`flex items-center gap-0.5 p-1 rounded-xl border ${
                isDarkMode ? 'border-white/10 bg-white/5' : 'border-[#E5E4E3] bg-white shadow-sm'
              }`}>
                {audioPlaybackState === 'playing' ? (
                  <button onClick={handleAudioPauseClick} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-[#64F4F5] hover:bg-white/10' : 'text-[#007970] bg-[#E5FEFF] hover:bg-[#C4F4F5]'}`}>
                    <Pause className="h-4 w-4 fill-current" />
                  </button>
                ) : (
                  <button onClick={handleAudioPlayClick} disabled={!currentVoiceRecording} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-[#64F4F5] hover:bg-white/10' : 'text-[#007970] hover:bg-[#E5FEFF]'}`}>
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  </button>
                )}
                <div className={`w-px h-4 mx-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-[#E5E4E3]'}`} />
                <button onClick={handleAudioStopClick} disabled={!currentVoiceRecording} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-[#747474] hover:text-[#D70101] hover:bg-[#FFF0F0]'}`}>
                  <Square className="h-4 w-4 fill-current" />
                </button>
                <button onClick={handleAudioRestartClick} disabled={!currentVoiceRecording} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-[#747474] hover:text-[#007970] hover:bg-[#E5FEFF]'}`}>
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
              <span className={`text-[9px] uppercase tracking-[0.18em] ${isDarkMode ? 'text-white/40' : 'text-[#747474]'}`}>
                {liveStatus || getAudioStatusLabel()}
              </span>
            </div>

            {/* Right: Challenge + Advance */}
            <div className="flex items-center gap-3 justify-self-end">
              <button
                onClick={handleChallengeClick}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
                  isChallengeUnlocked
                    ? (isDarkMode ? 'text-[#C74601] hover:bg-[#C74601]/10' : 'text-[#C74601] hover:bg-[#FFEEE5]')
                    : 'text-[#747474] opacity-40 cursor-not-allowed'
                } ${isNextLockedFeedback ? 'animate-shake' : ''}`}
              >
                {isChallengeUnlocked ? <Zap className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                Test
              </button>

              <button
                onClick={goNext}
                className={`group flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all ${
                  isDarkMode
                    ? 'bg-[#007970] border border-[#007970] hover:bg-[#00968b]'
                    : 'bg-[#007970] border-2 border-[#004142] hover:shadow-[3px_3px_0_#004142] hover:-translate-y-0.5'
                } ${isNextLockedFeedback ? 'animate-shake' : ''}`}
              >
                Advance <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <audio
              ref={audioElementRef}
              src={currentVoiceRecording ?? undefined}
              onEnded={() => {
                setAudioPlaybackState('idle')
                setAudioCompletedTitles(prev => { const u = new Set(prev); u.add(currentCardTitle); return u })
              }}
              onPause={() => setAudioPlaybackState(s => s === 'playing' ? 'paused' : s)}
            />
          </footer>
        )}
      </div>

      {/* Virtual Form Overlay */}
      {showVirtualForm && <Cms485VirtualForm onClose={() => setShowVirtualForm(false)} />}

      {/* Dock - bottom right */}
      <Dock items={dockItems} position="bottom-right" isDarkMode={isDarkMode} />
    </div>
  )
}

/* ════════════════════════════════════════
   Sub-Components  (Professional Variants)
   ════════════════════════════════════════ */

function IntroVideoSection({ isDarkMode, onComplete }: { isDarkMode: boolean; onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (v) { v.muted = false; v.volume = 1 }
  }, [])

  return (
    <div className={`relative h-full w-full overflow-hidden ${isDarkMode ? 'bg-[#0F0F11]' : 'bg-white'}`}>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={introVideo}
        preload="auto"
        playsInline
        onPlay={() => { const v = videoRef.current; if (v) { v.muted = false; v.volume = 1 } setIsPlaying(true) }}
        onPause={() => setIsPlaying(false)}
        onEnded={onComplete}
      />
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2">
        {!isPlaying ? (
          <button
            onClick={() => { const v = videoRef.current; if (!v) return; v.muted = false; v.volume = 1; v.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false)) }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 text-[#1F1C1B] text-xs font-semibold shadow-md hover:bg-white"
          >
            <Play className="h-4 w-4" /> Play
          </button>
        ) : (
          <button
            onClick={() => { videoRef.current?.pause(); setIsPlaying(false) }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 text-[#1F1C1B] text-xs font-semibold shadow-md hover:bg-white"
          >
            <Pause className="h-4 w-4" /> Pause
          </button>
        )}
      </div>
    </div>
  )
}

function CoverSection({ onView, isDarkMode }: { onView: () => void; isDarkMode: boolean }) {
  return (
    <div className={`relative h-full w-full flex items-center justify-center ${isDarkMode ? 'bg-[#0F0F11]' : 'bg-[#FAFBF8]'}`}>
      <div className="text-center">
        <h1 className={`text-5xl md:text-7xl font-bold tracking-tight mb-6 ${isDarkMode ? 'text-white' : 'text-[#1F1C1B]'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
          CMS-485 <span className="text-[#007970]">Training</span>
        </h1>
        <p className={`text-lg mb-10 max-w-md mx-auto ${isDarkMode ? 'text-white/60' : 'text-[#524048]'}`}>
          Professional learning experience for Plan of Care documentation mastery.
        </p>
        <button
          onClick={onView}
          className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-white transition-all ${
            isDarkMode
              ? 'bg-[#007970] hover:bg-[#00968b]'
              : 'bg-[#007970] border-2 border-[#004142] shadow-[4px_4px_0_#004142] hover:-translate-y-1 hover:-translate-x-1'
          }`}
        >
          Start Learning <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function ReportGrid({ items, onSelect, isDarkMode, unlockedCount, interactiveEffects }: {
  items: typeof TRAINING_CARDS
  onSelect: (index: number) => void
  isDarkMode: boolean
  unlockedCount: number
  interactiveEffects: boolean
}) {
  const completedCount = Math.max(0, unlockedCount - 1)
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0

  return (
    <div className={`flex h-full w-full flex-col p-6 ${isDarkMode ? 'text-white' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] border ${
            isDarkMode ? 'border-white/10 bg-white/5 text-[#64F4F5]' : 'border-[#C74601]/15 bg-[#FFF8F5] text-[#C74601]'
          }`}>
            <FileText className="h-3 w-3" /> Module Selection
          </div>
          <h2 className="text-xl font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Course Modules</h2>
        </div>
        <div className={`flex items-center gap-2 text-[10px] font-semibold ${isDarkMode ? 'text-gray-400' : 'text-[#747474]'}`}>
          <div className={`h-1.5 w-14 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-[#E5E4E3]'}`}>
            <div className="h-full bg-[#007970] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          {completedCount} / {items.length}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="grid w-full grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5 auto-rows-fr">
          {items.map((item, index) => {
            const isLocked = index + 1 > unlockedCount
            const isCompleted = index + 1 < unlockedCount
            return (
              <button
                key={item.title}
                onClick={() => onSelect(index)}
                disabled={isLocked}
                className={`relative flex flex-col items-start p-2 text-left rounded-xl border-2 transition-all ${
                  isLocked
                    ? (isDarkMode ? 'bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed' : 'bg-[#FAFBF8] border-[#ECEAE9] opacity-50 cursor-not-allowed')
                    : (isDarkMode
                      ? 'bg-white/[0.04] border-white/10 hover:border-[#007970]'
                      : interactiveEffects
                        ? 'bg-white border-[#E5E4E3] hover:border-[#007970] hover:shadow-[3px_3px_0_#007970] hover:-translate-y-0.5'
                        : 'bg-white border-[#E5E4E3] hover:border-[#007970]')
                }`}
              >
                <div className="flex w-full items-center justify-between mb-1">
                  <div className={`flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold ${
                    isLocked
                      ? (isDarkMode ? 'bg-white/5 text-gray-600' : 'bg-[#F2F2F1] text-[#B8B4B2]')
                      : isCompleted
                        ? (isDarkMode ? 'bg-[#007970]/30 text-[#64F4F5]' : 'bg-[#E5FEFF] text-[#007970]')
                        : (isDarkMode ? 'bg-[#C74601]/20 text-[#C74601]' : 'bg-[#E5FEFF] text-[#007970]')
                  }`}>{index + 1}</div>
                  {isLocked && <Lock className={`h-2.5 w-2.5 ${isDarkMode ? 'text-gray-600' : 'text-[#B8B4B2]'}`} />}
                  {isCompleted && <CheckCircle className="h-3 w-3 text-[#007970]" />}
                </div>
                <h3 className={`text-[9px] leading-tight font-semibold line-clamp-2 ${
                  isLocked ? (isDarkMode ? 'text-gray-600' : 'text-[#B8B4B2]') : (isDarkMode ? 'text-gray-200' : 'text-[#1F1C1B]')
                }`}>{item.title}</h3>
                <div className={`mt-auto pt-1 flex items-center gap-1 text-[8px] font-medium uppercase tracking-wider ${
                  isLocked ? (isDarkMode ? 'text-gray-700' : 'text-[#C5C2C0]') : (isDarkMode ? 'text-gray-500' : 'text-[#747474]')
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

function EndSection({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className={`flex h-full items-center justify-center p-8 ${isDarkMode ? '' : 'bg-white'}`}>
      <div className="text-center">
        <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-8 ${
          isDarkMode
            ? 'bg-[#007970]/20 text-[#64F4F5] border border-[#007970]/40'
            : 'bg-[#007970] text-white border-2 border-[#004142] shadow-[6px_6px_0_#004142]'
        }`}>
          <CheckCircle className="h-10 w-10" />
        </div>
        <h2 className={`text-4xl md:text-5xl font-semibold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-[#1F1C1B]'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Course <span className="text-[#007970]">Complete</span>
        </h2>
        <p className={`max-w-md mx-auto text-base leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-[#524048]'}`}>
          You have successfully completed the CMS-485 core training. Review any section again as needed.
        </p>
      </div>
    </div>
  )
}

function ChallengeView({ title, challengeData, challengeResult, isDarkMode, interactiveEffects, onSubmit }: {
  title: string
  challengeData: { options: string[]; correctIndex: number }
  challengeResult: ChallengeResult | null
  isDarkMode: boolean
  interactiveEffects: boolean
  onSubmit: (selectedIndex: number) => void
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(challengeResult?.selectedIndex ?? null)
  const [submitted, setSubmitted] = useState(Boolean(challengeResult))

  useEffect(() => {
    if (challengeResult) { setSelectedIndex(challengeResult.selectedIndex); setSubmitted(true) }
    else { setSelectedIndex(null); setSubmitted(false) }
  }, [title, challengeResult])

  return (
    <div>
      <p className={`mb-4 text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1F1C1B]'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <Target className="text-[#C74601] h-5 w-5" /> Identify the optimal approach.
      </p>

      <div className="space-y-2">
        {challengeData.options.map((option, index) => {
          const isSelected = selectedIndex === index
          const isCorrect = index === challengeData.correctIndex

          let cls = isDarkMode
            ? 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20'
            : interactiveEffects
              ? 'border-2 border-[#E5E4E3] bg-white text-[#524048] hover:border-[#007970] hover:shadow-[4px_4px_0_#007970] hover:-translate-y-0.5'
              : 'border-2 border-[#E5E4E3] bg-white text-[#524048] hover:border-[#007970]'

          if (submitted) {
            if (isCorrect) cls = isDarkMode ? 'border-[#007970] bg-[#007970]/20 text-white' : 'border-2 border-[#007970] bg-[#007970] text-white shadow-[4px_4px_0_#004142]'
            else if (isSelected) cls = isDarkMode ? 'border-[#D70101] bg-[#D70101]/20 text-white' : 'border-2 border-[#D70101] bg-[#D70101] text-white'
            else cls = isDarkMode ? 'border-white/5 text-white/30' : 'border-2 border-[#E5E4E3] text-[#747474] opacity-50'
          } else if (isSelected) {
            cls = isDarkMode ? 'border-[#64F4F5] bg-[#64F4F5]/10 text-[#64F4F5]' : 'border-2 border-[#007970] bg-[#E5FEFF] text-[#007970] shadow-[4px_4px_0_#007970] -translate-y-0.5'
          }

          return (
            <button
              key={`${title}-ch-${index}`}
              disabled={submitted}
              onClick={() => { setSelectedIndex(index); setSubmitted(true); onSubmit(index) }}
              className={`w-full text-left rounded-xl border p-3 text-sm transition-all duration-200 flex items-center justify-between ${cls}`}
            >
              <span className="pr-3 leading-relaxed">{option}</span>
              <div className="shrink-0">
                {submitted && isCorrect && <CheckCircle className={`h-5 w-5 ${isDarkMode ? 'text-[#64F4F5]' : 'text-white'}`} />}
                {submitted && isSelected && !isCorrect && <XCircle className={`h-5 w-5 ${isDarkMode ? 'text-[#D70101]' : 'text-white'}`} />}
                {!submitted && isSelected && <Target className="h-5 w-5 text-[#007970]" />}
                {!submitted && !isSelected && !isDarkMode && <div className="w-5 h-5 rounded-full border-2 border-[#D9D6D5]" />}
              </div>
            </button>
          )
        })}
      </div>

      {submitted && selectedIndex !== null && (
        <div className={`mt-4 rounded-xl border-2 p-4 ${
          selectedIndex === challengeData.correctIndex
            ? (isDarkMode ? 'border-[#007970] bg-[#007970]/10' : 'border-[#007970] bg-[#F0FDFA]')
            : (isDarkMode ? 'border-[#D70101] bg-[#D70101]/10' : 'border-[#D70101] bg-[#FFF0F0]')
        }`}>
          <div className="flex items-start gap-2">
            {selectedIndex === challengeData.correctIndex
              ? <ShieldCheck className={`mt-0.5 h-5 w-5 ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#007970]'}`} />
              : <AlertCircle className={`mt-0.5 h-5 w-5 ${isDarkMode ? 'text-[#FF8A8A]' : 'text-[#D70101]'}`} />
            }
            <div>
              <p className={`text-sm font-bold uppercase tracking-wide ${
                selectedIndex === challengeData.correctIndex ? (isDarkMode ? 'text-[#64F4F5]' : 'text-[#007970]') : (isDarkMode ? 'text-[#FF8A8A]' : 'text-[#D70101]')
              }`}>{selectedIndex === challengeData.correctIndex ? 'Correct' : 'Incorrect'}</p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-[#524048]'}`}>
                <span className="font-semibold">Answer:</span> {challengeData.options[challengeData.correctIndex]}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FinalTestSection({ isDarkMode, pageIndex, answers, interactiveEffects: _interactiveEffects, onAnswer }: {
  isDarkMode: boolean
  pageIndex: number
  answers: Record<string, number>
  interactiveEffects: boolean
  onAnswer: (qid: string, oi: number) => void
}) {
  const totalQ = FINAL_TEST_QUESTIONS.length
  const isCover = pageIndex === 0
  const isResult = pageIndex === totalQ + 1
  const qIndex = pageIndex - 1
  const activeQ = qIndex >= 0 && qIndex < totalQ ? FINAL_TEST_QUESTIONS[qIndex] : null
  const correctCount = FINAL_TEST_QUESTIONS.filter(q => answers[q.id] === q.correctIndex).length
  const scorePercent = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0
  const passed = scorePercent >= 80

  if (isCover) {
    return (
      <section className={`flex h-full flex-col overflow-hidden px-10 py-6 ${isDarkMode ? 'text-white' : ''}`}>
        <div className="mb-4">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] border ${
            isDarkMode ? 'border-white/10 bg-white/5 text-[#64F4F5]' : 'border-[#C74601]/15 bg-[#FFF8F5] text-[#C74601]'
          }`}><ShieldCheck className="h-3 w-3" /> Final Assessment</div>
          <h2 className="mt-3 text-2xl font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{FINAL_TEST_TITLE}</h2>
        </div>
        <div className="grid flex-1 min-h-0 gap-3 md:grid-cols-2">
          <div className="p-4"><h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#007970]">Objective</h3><p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/80' : 'text-[#524048]'}`}><TermHighlighter text={FINAL_TEST_OBJECTIVE} /></p></div>
          <div className="p-4"><h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#007970]">Clinical Lens</h3><p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/80' : 'text-[#524048]'}`}><TermHighlighter text={FINAL_TEST_CLINICAL_LENS} /></p></div>
          <div className="p-4 md:col-span-2">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#007970]">Key Points</h3>
            <ul className="space-y-1.5">
              {FINAL_TEST_KEY_POINTS.map((p,i) => <li key={p} className="flex items-start gap-2"><span className="text-xs font-bold text-[#C74601] mt-0.5">0{i+1}</span><span className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/80' : 'text-[#524048]'}`}><TermHighlighter text={p} /></span></li>)}
            </ul>
            <p className={`mt-2 text-xs uppercase tracking-[0.12em] ${isDarkMode ? 'text-gray-500' : 'text-[#747474]'}`}>
              Use Advance to begin Question 1 of {totalQ}
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (activeQ) {
    const sel = answers[activeQ.id]
    return (
      <section className={`flex h-full flex-col overflow-hidden px-10 py-6 ${isDarkMode ? 'text-white' : ''}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Question {pageIndex} of {totalQ}</h2>
        </div>
        <div className="flex-1 flex flex-col">
          <p className={`text-lg leading-snug mb-4 ${isDarkMode ? 'text-white' : 'text-[#1F1C1B]'}`}>{activeQ.prompt}</p>
          <div className="grid gap-2">
            {activeQ.options.map((opt, oi) => (
              <button
                key={`${activeQ.id}-${opt}`}
                onClick={() => onAnswer(activeQ.id, oi)}
                className={`w-full rounded-xl border-2 px-3 py-2.5 text-left text-sm transition-all ${
                  sel === oi
                    ? (isDarkMode ? 'border-[#64F4F5] bg-[#64F4F5]/10 text-[#64F4F5]' : 'border-[#007970] bg-[#E5FEFF] text-[#007970]')
                    : (isDarkMode ? 'border-white/10 text-white/80 hover:border-white/20' : 'border-[#E5E4E3] text-[#524048] hover:border-[#007970]')
                }`}
              >
                <span className="font-semibold mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}
              </button>
            ))}
          </div>
          <p className={`mt-auto pt-3 text-xs uppercase tracking-[0.12em] ${isDarkMode ? 'text-gray-500' : 'text-[#747474]'}`}>
            {sel === undefined ? 'Select an answer, then use Advance.' : 'Answer selected. Advance to continue.'}
          </p>
        </div>
      </section>
    )
  }

  if (isResult) {
    return (
      <section className={`flex h-full flex-col overflow-hidden px-10 py-6 ${isDarkMode ? 'text-white' : ''}`}>
        <h2 className="mb-4 text-2xl font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Final Test Results</h2>
        <div className="grid flex-1 min-h-0 gap-3 md:grid-cols-2">
          <div className="p-4">
            <p className={`text-xs uppercase tracking-[0.12em] mb-1 ${isDarkMode ? 'text-gray-400' : 'text-[#747474]'}`}>Score</p>
            <p className={`text-4xl font-bold ${passed ? 'text-[#007970]' : 'text-[#C74601]'}`}>{scorePercent}%</p>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-white/80' : 'text-[#524048]'}`}>{correctCount} correct of {totalQ}</p>
          </div>
          <div className="p-4">
            <p className={`text-xs uppercase tracking-[0.12em] mb-1 ${isDarkMode ? 'text-gray-400' : 'text-[#747474]'}`}>Status</p>
            <p className={`text-2xl font-bold ${passed ? 'text-[#007970]' : 'text-[#C74601]'}`}>{passed ? 'Pass' : 'Needs Review'}</p>
          </div>
        </div>
      </section>
    )
  }

  return null
}
