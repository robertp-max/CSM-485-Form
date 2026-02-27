import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sfxClick, sfxSwipe, sfxModeToggle } from '../../utils/sfx';
import {
  Play, Pause, Swords,
  CheckCircle2, XCircle,
  ShieldCheck, FileText, Activity, Check,
  Moon, Sun, Layers, Lock, ChevronLeft, ChevronRight, ChevronDown, BookOpen,
  ArrowRight, GraduationCap, BarChart3, HeartPulse, Volume2
} from 'lucide-react';

const StyleInjector = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Roboto:wght@300;400;500&display=swap');

      .font-heading { font-family: 'Montserrat', sans-serif; }
      .font-body { font-family: 'Roboto', sans-serif; }

      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #FAFBF8; }
      ::-webkit-scrollbar-thumb { background: #D9D6D5; border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: #747474; }

      .dark ::-webkit-scrollbar-track { background: #020F10; }
      .dark ::-webkit-scrollbar-thumb { background: #07282A; }
      .dark ::-webkit-scrollbar-thumb:hover { background: #004142; }

      .glow-orange { box-shadow: 0 9px 28px -6px rgba(199, 70, 1, 0.46); }
      .glow-teal { box-shadow: 0 9px 28px -6px rgba(0, 121, 112, 0.345); }

      .dark .glow-orange { box-shadow: 0 12px 36px -6px rgba(229, 110, 46, 0.55); }
      .dark .glow-teal { box-shadow: 0 12px 36px -6px rgba(100, 244, 245, 0.45); }

      /* ── cinematic night-mode transition ── */
      .night-transition,
      .night-transition *:not(svg):not(path) {
        transition-property: background-color, color, border-color, box-shadow, opacity, fill, stroke, filter;
        transition-duration: 1.8s;
        transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* ── edge-sweep mode transition ── */
      @keyframes edgeSweepToNight {
        0%   { clip-path: inset(0 100% 0 0); opacity: 0; }
        8%   { opacity: 1; }
        50%  { clip-path: inset(0 0% 0 0); opacity: 0.92; }
        70%  { clip-path: inset(0 0% 0 0); opacity: 0.7; }
        100% { clip-path: inset(0 0% 0 100%); opacity: 0; }
      }
      @keyframes edgeSweepToDay {
        0%   { clip-path: inset(0 0 0 100%); opacity: 0; }
        8%   { opacity: 1; }
        50%  { clip-path: inset(0 0% 0 0); opacity: 0.92; }
        70%  { clip-path: inset(0 0% 0 0); opacity: 0.7; }
        100% { clip-path: inset(0 100% 0 0); opacity: 0; }
      }
      .edge-sweep-night {
        animation: edgeSweepToNight 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .edge-sweep-day {
        animation: edgeSweepToDay 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes auroraFloatA {
        0% { transform: translate3d(0, 0, 0) scale(1); }
        50% { transform: translate3d(8%, -6%, 0) scale(1.12); }
        100% { transform: translate3d(0, 0, 0) scale(1); }
      }

      @keyframes auroraFloatB {
        0% { transform: translate3d(0, 0, 0) scale(1); }
        50% { transform: translate3d(-8%, 7%, 0) scale(1.1); }
        100% { transform: translate3d(0, 0, 0) scale(1); }
      }

      .animate-aurora-a { animation: auroraFloatA 10s ease-in-out infinite; }
      .animate-aurora-b { animation: auroraFloatB 12s ease-in-out infinite; }

      details summary::-webkit-details-marker { display: none; }
      details summary { list-style: none; }
    `}
  </style>
);

const debugMode = true;
import { Dock } from '../Dock';
import { TRAINING_CARDS } from '../../data/trainingCards';
import HendersonChallenge from '../HendersonChallenge';
import LayoutChallenge from '../LayoutChallenge';
import { FINAL_TEST_TITLE, FINAL_TEST_OBJECTIVE, FINAL_TEST_KEY_POINTS, FINAL_TEST_QUESTIONS } from '../../data/finalTest';
import fullAdditionalContent from '../../assets/Additional Content.txt?raw';

type AdditionalSection = {
  title: string
  body: string
}

type ChallengeOption = {
  text: string
  isCorrect: boolean
}

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/['’`".,:;!?()\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const parseAdditionalSections = (raw: string): AdditionalSection[] => {
  const lines = raw.split(/\r?\n/)
  const sections: AdditionalSection[] = []
  let currentTitle = ''
  let buffer: string[] = []

  const flush = () => {
    if (!currentTitle) return
    const body = buffer.join('\n').trim().replace(/^"|"$/g, '').trim()
    sections.push({ title: currentTitle.trim(), body })
  }

  for (const line of lines) {
    const headingMatch = line.match(/^\s*\d+\.\s+(.+)$/)
    if (headingMatch) {
      flush()
      currentTitle = headingMatch[1].trim()
      buffer = []
      continue
    }
    buffer.push(line)
  }

  flush()
  return sections
}

const ADDITIONAL_SECTIONS = parseAdditionalSections(fullAdditionalContent)

const VOICE_RECORDINGS = {
  ...import.meta.glob('../../assets/Voice Recordings/*.wav', { eager: true, import: 'default' }),
  ...import.meta.glob('../../assets/Voice Recordings/*.mp3', { eager: true, import: 'default' }),
} as Record<string, string>

type AudioEntry = {
  path: string
  url: string
  title: string
  normalizedTitle: string
}

const normalizeAudioTitle = (value: string) =>
  value
    .toLowerCase()
    .replace(/\.(wav|mp3)$/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const AUDIO_ENTRIES: AudioEntry[] = Object.keys(VOICE_RECORDINGS).map(path => {
  const filename = path.split('/').pop() ?? path
  const title = filename.replace(/\.(wav|mp3)$/i, '')
  return {
    path,
    url: VOICE_RECORDINGS[path],
    title,
    normalizedTitle: normalizeAudioTitle(title),
  }
})

const findAudioForTitle = (title: string) => {
  const normalizedCardTitle = normalizeAudioTitle(title)
  if (!normalizedCardTitle) return null

  const exactMatch = AUDIO_ENTRIES.find(entry => entry.normalizedTitle === normalizedCardTitle)
  if (exactMatch) return exactMatch.url

  const containsMatches = AUDIO_ENTRIES
    .filter(entry => entry.normalizedTitle.includes(normalizedCardTitle) || normalizedCardTitle.includes(entry.normalizedTitle))
    .sort((left, right) => right.normalizedTitle.length - left.normalizedTitle.length)
  if (containsMatches.length > 0) return containsMatches[0].url

  const cardTokens = normalizedCardTitle.split(' ').filter(token => token.length > 2)
  let bestEntry: AudioEntry | null = null
  let bestOverlap = 0

  for (const entry of AUDIO_ENTRIES) {
    const entryTokens = entry.normalizedTitle.split(' ').filter(token => token.length > 2)
    const overlap = cardTokens.filter(token => entryTokens.includes(token)).length
    if (overlap > bestOverlap) {
      bestOverlap = overlap
      bestEntry = entry
    }
  }

  const minimumOverlap = Math.max(2, Math.floor(cardTokens.length * 0.5))
  return bestEntry && bestOverlap >= minimumOverlap ? bestEntry.url : null
}

const hashString = (value: string) => {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

const shuffleChallengeOptions = (options: string[], seedKey: string): ChallengeOption[] => {
  const normalized = options.filter(Boolean)
  const tagged = normalized.map((text, index) => ({ text, isCorrect: index === 0 }))
  const shuffled = [...tagged]
  let seed = hashString(seedKey || 'default')

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    const swapIndex = seed % (index + 1)
    const current = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = current
  }

  return shuffled
}

const mapCardFromTraining = (c: any) => {
  const fallbackAdditional = [c.auditFocus, c.objective, ...(c.bullets ?? [])].filter(Boolean).join(' ')
  const challengeSeed = `${c.section ?? ''}-${c.title ?? ''}`
  const challengeOptions = shuffleChallengeOptions([
    c.bullets?.[0] ?? c.objective ?? 'Select the most defensible response.',
    c.bullets?.[1] ?? 'Use a generic template statement without patient-specific details.',
    c.bullets?.[2] ?? 'Delay documentation updates until episode end.',
  ], challengeSeed)

  return {
    title: c.title,
    section: c.section ?? '',
    objective: c.objective ?? '',
    bullets: c.bullets ?? [],
    additional: fallbackAdditional,
    challenge: challengeOptions,
  }
}

// ── Metrics Persistence ──────────────────────────────────────
const METRICS_KEY = 'cms485.lc.metrics.v1'
const GATING_KEY = 'cms485.lc.gating.v1'

type MetricsData = {
  preScore: number | null
  preTotal: number
  hendersonScore: number | null
  hendersonTotal: number
  layoutScore: number | null
  layoutTotal: number
}

const defaultMetrics = (): MetricsData => ({
  preScore: null, preTotal: 3,
  hendersonScore: null, hendersonTotal: 0,
  layoutScore: null, layoutTotal: 0,
})

const loadMetrics = (): MetricsData => {
  try {
    const raw = localStorage.getItem(METRICS_KEY)
    if (!raw) return defaultMetrics()
    return { ...defaultMetrics(), ...JSON.parse(raw) }
  } catch { return defaultMetrics() }
}
const saveMetrics = (m: MetricsData) => localStorage.setItem(METRICS_KEY, JSON.stringify(m))

type GatingData = {
  hendersonComplete: boolean
  layoutComplete: boolean
  configComplete: boolean
}

const defaultGating = (): GatingData => ({ hendersonComplete: false, layoutComplete: false, configComplete: false })

const loadGating = (): GatingData => {
  try {
    const raw = localStorage.getItem(GATING_KEY)
    if (!raw) return defaultGating()
    return { ...defaultGating(), ...JSON.parse(raw) }
  } catch { return defaultGating() }
}
const saveGating = (g: GatingData) => localStorage.setItem(GATING_KEY, JSON.stringify(g))

// ── Pre-Assessment (baseline knowledge check) ───────────────
const PRE_ASSESSMENT = [
  {
    question: 'What is the primary purpose of the CMS-485 form?',
    options: [
      'To document the patient\'s Plan of Care',
      'To submit insurance claims directly',
      'To record nursing shift schedules',
    ],
    correctIdx: 0,
  },
  {
    question: 'Which element must be documented before wound care can begin?',
    options: [
      'Patient\'s food preferences',
      'Safety assessment and 911 protocols',
      'Physician\'s office hours',
    ],
    correctIdx: 1,
  },
  {
    question: 'What does "medical necessity" require in home health documentation?',
    options: [
      'Only listing the patient\'s diagnoses',
      'Skilled services tied to documented condition and risk',
      'Completing a standard template without changes',
    ],
    correctIdx: 1,
  },
]

// ── Intro card type ─────────────────────────────────────────
type IntroKind = 'welcome' | 'config' | 'challenge-gate' | 'forms'

const INTRO_CARDS: Array<{ title: string; kind: IntroKind; section: string; objective: string; bullets: string[]; additional: string; challenge: ChallengeOption[] }> = [
  { title: 'Welcome to CMS-485 Training', kind: 'welcome', section: 'Getting Started', objective: '', bullets: [], additional: '', challenge: [] },
  { title: 'System Configuration', kind: 'config', section: 'Setup', objective: '', bullets: [], additional: '', challenge: [] },
  { title: 'Challenge Gateway', kind: 'challenge-gate', section: 'Competency', objective: '', bullets: [], additional: '', challenge: [] },
  { title: 'Interactive CMS-485 Form', kind: 'forms', section: 'Practice', objective: '', bullets: [], additional: '', challenge: [] },
]

const cards = [
  ...INTRO_CARDS,
  ...TRAINING_CARDS.map(mapCardFromTraining),
  {
    title: FINAL_TEST_TITLE,
    section: 'Final Test',
    objective: FINAL_TEST_OBJECTIVE,
    bullets: FINAL_TEST_KEY_POINTS,
    additional: '',
    challenge: shuffleChallengeOptions(FINAL_TEST_QUESTIONS[0]?.options ?? ['See final test questions'], FINAL_TEST_TITLE),
  },
  {
    title: 'Completion', final: true },
];

const cardShellVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? '100vw' : '-100vw',
  }),
  center: {
    x: 0,
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? '-100vw' : '100vw',
  }),
}

const bookFlipVariants = {
  enter: (direction: number) => ({
    rotateY: direction >= 0 ? 90 : -90,
    x: direction >= 0 ? '20%' : '-20%',
    opacity: 0,
    scale: 0.92,
  }),
  center: {
    rotateY: 0,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    rotateY: direction >= 0 ? -90 : 90,
    x: direction >= 0 ? '-20%' : '20%',
    opacity: 0,
    scale: 0.92,
  }),
}

export default function CIHHLightCard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [modeTransitionKey, setModeTransitionKey] = useState(0);
  const [showCurtain, setShowCurtain] = useState(false);
  const [curtainDirection, setCurtainDirection] = useState<'night' | 'day'>('night');
  const [viewMode, setViewMode] = useState<'card' | 'web'>('card');
  const [webCardIndex, setWebCardIndex] = useState(0);
  const [webAudioCompleted, setWebAudioCompleted] = useState<Record<number, boolean>>({});
  const [webSubjectOpen, setWebSubjectOpen] = useState<Record<number, boolean>>({});
  const [webChallengeOpen, setWebChallengeOpen] = useState<Record<number, boolean>>({});
  const [playingCardIdx, setPlayingCardIdx] = useState<number | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [panelMode, setPanelMode] = useState('main');
  const [navDirection, setNavDirection] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | null>>(() => ({}));
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>(() => ({}));
  const [, setStatusMsg] = useState('QA mode bypasses locks');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pointerStartX = useRef<number | null>(null)
  const pointerStartY = useRef<number | null>(null)
  const pointerCurrentX = useRef<number | null>(null)
  const pointerCurrentY = useRef<number | null>(null)

  // ── Gating & Metrics state ──
  const [gating, setGating] = useState<GatingData>(() => loadGating())
  const [metrics, setMetrics] = useState<MetricsData>(() => loadMetrics())
  const [preAnswers, setPreAnswers] = useState<Record<number, number>>({})
  const [preSubmitted, setPreSubmitted] = useState(() => loadMetrics().preScore !== null)
  const [activeChallenge, setActiveChallenge] = useState<'henderson' | 'layout' | null>(null)
  const [audioTestPlaying, setAudioTestPlaying] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const isIntroCard = Boolean((cards[cardIndex] as any)?.kind)

  const card = cards[cardIndex] as any;
  const introCount = INTRO_CARDS.length
  const trainingCards = cards.filter(entry => !(entry as any).final && !(entry as any).kind)
  const visibleCardTotal = trainingCards.length
  const visibleStepTotal = visibleCardTotal * 3
  const trainingRelIndex = Math.max(0, cardIndex - introCount)
  const panelStepOffset = panelMode === 'main' ? 0 : panelMode === 'additional' ? 1 : 2
  const displayStepNumber = card?.final
    ? visibleStepTotal
    : isIntroCard
      ? 0
      : Math.min(trainingRelIndex * 3 + panelStepOffset + 1, visibleStepTotal)
  const progressActiveIndex = card?.final
    ? Math.max(0, visibleCardTotal - 1)
    : isIntroCard
      ? -1
      : Math.max(0, Math.min(trainingRelIndex, visibleCardTotal - 1))
  const audioUrl = card?.title ? findAudioForTitle(card.title) : null;
  const hasAudio = Boolean(audioUrl);
  const normalizedCardTitle = normalizeText(card?.title ?? '')
  const matchedAdditionalSection = ADDITIONAL_SECTIONS.find(section => {
    const normalizedSectionTitle = normalizeText(section.title)
    return normalizedSectionTitle.includes(normalizedCardTitle) || normalizedCardTitle.includes(normalizedSectionTitle)
  })
  const currentAdditionalContent = matchedAdditionalSection?.body || card.additional || ''

  // ── Book view computed values ──
  const webCards = cards.filter(c => !(c as any).final)
  const totalSpreads = Math.ceil(webCards.length / 2)
  const leftIdx = webCardIndex * 2
  const rightIdx = webCardIndex * 2 + 1
  const rightCard = rightIdx < webCards.length ? (webCards[rightIdx] as any) : null

  const getCardNarration = (c: any) => {
    if (!c) return ''
    const nt = normalizeText(c.title ?? '')
    const match = ADDITIONAL_SECTIONS.find(s => {
      const ns = normalizeText(s.title)
      return ns.includes(nt) || nt.includes(ns)
    })
    return match?.body || c.additional || ''
  }
  const getCardAudioUrl = (c: any): string | null => c?.title ? findAudioForTitle(c.title) : null
  const isKCUnlocked = (idx: number) => {
    const c = webCards[idx] as any
    if (!c) return true
    const url = c.title ? findAudioForTitle(c.title) : null
    return !url || webAudioCompleted[idx]
  }
  const canAdvanceSpread = Boolean(
    submittedAnswers[leftIdx] && (!rightCard || submittedAnswers[rightIdx])
  )

  const dockItems = [
    { icon: <FileText className="w-5 h-5" />, label: 'Help', onClick: () => alert('Open help') },
    { icon: viewMode === 'card' ? <BookOpen className="w-5 h-5" /> : <Layers className="w-5 h-5" />, label: viewMode === 'card' ? 'Book' : 'Card', onClick: () => { sfxClick(); stopAudio(); setViewMode(prev => prev === 'card' ? 'web' : 'card'); }, isActive: viewMode === 'web' },
    { icon: <ShieldCheck className="w-5 h-5" />, label: debugMode ? 'QA: ON' : 'QA: OFF', onClick: () => setStatusMsg(prev => prev === 'QA: ON' ? 'QA: OFF' : 'QA: ON'), isActive: debugMode },
    { icon: isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />, label: isDarkMode ? 'Light' : 'Night', onClick: () => {
      const goingToNight = !isDarkMode;
      sfxModeToggle(goingToNight);
      setCurtainDirection(goingToNight ? 'night' : 'day');
      setShowCurtain(true);
      setModeTransitionKey(k => k + 1);
      setTimeout(() => setIsDarkMode(prev => !prev), 500);
      setTimeout(() => setShowCurtain(false), 2000);
    }, isActive: isDarkMode },
    { icon: <Activity className="w-5 h-5" />, label: 'Top', onClick: () => {
      setNavDirection(cardIndex > 0 ? -1 : 1)
      setCardIndex(0)
      setPanelMode('main')
    } },
  ];

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false)
    setPlayingCardIdx(null)
  }

  const handleSubjectToggle = (cardIdx: number) => {
    const willBeOpen = !webSubjectOpen[cardIdx]
    setWebSubjectOpen(prev => ({ ...prev, [cardIdx]: willBeOpen }))
    if (willBeOpen) {
      const c = webCards[cardIdx] as any
      const url = c?.title ? findAudioForTitle(c.title) : null
      if (url) {
        stopAudio()
        if (!audioRef.current) audioRef.current = new Audio()
        audioRef.current.src = url
        audioRef.current.onended = () => {
          setIsPlaying(false)
          setPlayingCardIdx(null)
          setWebAudioCompleted(p => ({ ...p, [cardIdx]: true }))
        }
        audioRef.current.play().then(() => { setIsPlaying(true); setPlayingCardIdx(cardIdx) }).catch(() => {})
      } else {
        setWebAudioCompleted(p => ({ ...p, [cardIdx]: true }))
      }
    } else {
      stopAudio()
    }
  }

  const handleSubmitChallenge = () => {
    const selected = selectedAnswers[cardIndex] ?? null
    if (selected === null) {
      setStatusMsg('Select an answer to continue')
      return
    }
    sfxClick()
    setSubmittedAnswers(prev => ({ ...prev, [cardIndex]: true }))
  }

  const toggleAudio = () => {
    if (!audioRef.current) audioRef.current = new Audio()
    if (!audioUrl) {
      setStatusMsg('No recording available')
      return
    }
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      setStatusMsg('Paused')
      return
    }
    audioRef.current.src = audioUrl
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true)
        setStatusMsg('Playing')
      })
      .catch(() => setStatusMsg('Audio blocked; click play'))
  }

  const handleNext = () => {
    // ── Intro cards advance directly (no panels) ──
    if (isIntroCard) {
      const kind = (card as any).kind as IntroKind
      // Gating: challenge-gate requires both challenges
      if (kind === 'challenge-gate' && !gating.hendersonComplete && !gating.layoutComplete && !debugMode) {
        setStatusMsg('Complete both challenges to continue')
        return
      }
      // Gating: welcome requires pre-assessment submitted
      if (kind === 'welcome' && !preSubmitted && !debugMode) {
        setStatusMsg('Complete the baseline assessment first')
        return
      }
      if (cardIndex < cards.length - 1) {
        stopAudio()
        sfxSwipe()
        setNavDirection(1)
        setCardIndex(cardIndex + 1)
        setPanelMode('main')
      }
      return
    }
    if (!card.final && panelMode === 'main') {
      stopAudio()
      sfxSwipe()
      setNavDirection(1)
      setPanelMode('additional');
      return
    }
    if (!card.final && panelMode === 'additional') {
      stopAudio()
      sfxSwipe()
      setNavDirection(1)
      setPanelMode('challenge');
      return
    }
    if (panelMode === 'challenge' && !submittedAnswers[cardIndex]) {
      const selected = selectedAnswers[cardIndex] ?? null
      if (selected === null) {
        setStatusMsg('Select an answer to continue')
        return
      }
      setSubmittedAnswers(prev => ({ ...prev, [cardIndex]: true }))
      return
    }
    if (cardIndex < cards.length - 1) {
      stopAudio()
      sfxSwipe()
      setNavDirection(1)
      setCardIndex(cardIndex + 1);
      setPanelMode('main');
      setStatusMsg('QA mode bypasses locks');
    }
  };

  const handleBack = () => {
    stopAudio()
    sfxSwipe()
    if (panelMode === 'challenge') {
      setNavDirection(-1)
      setPanelMode('additional');
    } else if (panelMode === 'additional') {
      setNavDirection(-1)
      setPanelMode('main');
    } else if (cardIndex > 0) {
      setNavDirection(-1)
      setCardIndex(cardIndex - 1);
      setPanelMode('main');
    }
  };

  const isCorrect = (index: number) => {
    const sel = selectedAnswers[index]
    const options = (cards[index] as any)?.challenge as ChallengeOption[] | undefined
    if (sel === undefined || sel === null || !options?.[sel]) return false
    return options[sel].isCorrect
  }

  // ── Pre-assessment submit ──
  const handlePreAssessmentSubmit = () => {
    let score = 0
    PRE_ASSESSMENT.forEach((q, i) => {
      if (preAnswers[i] === q.correctIdx) score++
    })
    const updated = { ...metrics, preScore: score, preTotal: PRE_ASSESSMENT.length }
    setMetrics(updated)
    saveMetrics(updated)
    setPreSubmitted(true)
  }

  // ── Audio test for config card ──
  const handleTestAudioInline = () => {
    setAudioTestPlaying(true)
    const ctx = audioCtxRef.current || new AudioContext()
    audioCtxRef.current = ctx
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 659.25
    gainNode.gain.value = 0.12
    osc.connect(gainNode).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.25)
    setTimeout(() => setAudioTestPlaying(false), 500)
  }

  // ── Henderson challenge completion ──
  const handleHendersonExit = () => {
    const updatedGating = { ...gating, hendersonComplete: true }
    setGating(updatedGating)
    saveGating(updatedGating)
    // Update metrics
    const updatedMetrics = { ...metrics, hendersonScore: 1, hendersonTotal: 1 }
    setMetrics(updatedMetrics)
    saveMetrics(updatedMetrics)
    setActiveChallenge(null)
  }

  // ── Layout challenge completion ──
  const handleLayoutComplete = (_score: number, correct: number, total: number) => {
    const updatedGating = { ...gating, layoutComplete: true }
    setGating(updatedGating)
    saveGating(updatedGating)
    const updatedMetrics = { ...metrics, layoutScore: correct, layoutTotal: total }
    setMetrics(updatedMetrics)
    saveMetrics(updatedMetrics)
    setActiveChallenge(null)
  }

  // ── Training Not Available gate ──
  // Both challenges must be completed before training cards unlock

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = event.clientX
    pointerStartY.current = event.clientY
    pointerCurrentX.current = event.clientX
    pointerCurrentY.current = event.clientY
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerCurrentX.current = event.clientX
    pointerCurrentY.current = event.clientY
  }

  const handlePointerUp = () => {
    if (pointerStartX.current === null || pointerCurrentX.current === null || pointerStartY.current === null || pointerCurrentY.current === null) {
      return
    }

    const deltaX = pointerCurrentX.current - pointerStartX.current
    const deltaY = pointerCurrentY.current - pointerStartY.current
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY)
    const swipeThreshold = 70

    if (isHorizontalSwipe && Math.abs(deltaX) > swipeThreshold) {
      if (deltaX < 0) {
        handleNext()
      } else {
        handleBack()
      }
    }

    pointerStartX.current = null
    pointerStartY.current = null
    pointerCurrentX.current = null
    pointerCurrentY.current = null
  }

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false
    return Boolean(target.closest('button, a, input, textarea, select, [role="button"], label'))
  }

  const handleCardEdgeClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isInteractiveTarget(event.target)) return

    const rect = event.currentTarget.getBoundingClientRect()
    const edgeThreshold = Math.max(56, rect.width * 0.1)
    const offsetX = event.clientX - rect.left

    if (offsetX <= edgeThreshold) {
      handleBack()
      return
    }
    if (offsetX >= rect.width - edgeThreshold) {
      handleNext()
    }
  }

  useEffect(() => {
    if (viewMode !== 'card') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handleBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cardIndex, panelMode, viewMode])

  useEffect(() => {
    // Stop audio when card changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false)
  }, [cardIndex]);

  useEffect(() => {
    if (panelMode === 'additional' && hasAudio) {
      if (!audioRef.current) audioRef.current = new Audio()
      audioRef.current.src = audioUrl as string
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true)
          setStatusMsg('Playing')
        })
        .catch(() => setStatusMsg('Audio blocked; click play'))
    }
  }, [panelMode, cardIndex, hasAudio, audioUrl]);

  // Book view: reset collapse states when spread changes
  useEffect(() => {
    if (viewMode === 'web') {
      stopAudio()
      setWebSubjectOpen({})
      setWebChallengeOpen({})
      ;[leftIdx, rightIdx].forEach(idx => {
        if (idx < webCards.length) {
          const c = webCards[idx] as any
          const url = c?.title ? findAudioForTitle(c.title) : null
          if (!url) setWebAudioCompleted(prev => ({ ...prev, [idx]: true }))
        }
      })
    }
  }, [webCardIndex, viewMode])

  // Book view: auto-expand challenge when audio completes
  useEffect(() => {
    if (viewMode !== 'web') return
    ;[leftIdx, rightIdx].forEach(idx => {
      if (idx < webCards.length && isKCUnlocked(idx) && !webChallengeOpen[idx]) {
        setWebChallengeOpen(prev => ({ ...prev, [idx]: true }))
      }
    })
  }, [webAudioCompleted])

  useEffect(() => {
    stopAudio()
  }, [viewMode])

  // Book view keyboard navigation
  useEffect(() => {
    if (viewMode !== 'web') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && canAdvanceSpread && webCardIndex < totalSpreads - 1) {
        sfxSwipe(); setNavDirection(1); setWebCardIndex(prev => prev + 1)
      }
      if (e.key === 'ArrowLeft' && webCardIndex > 0) {
        sfxSwipe(); setNavDirection(-1); setWebCardIndex(prev => prev - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewMode, webCardIndex, canAdvanceSpread, totalSpreads])

  return (
    <div className={`night-transition min-h-screen bg-[radial-gradient(circle_at_top_right,_#FAFBF8_0%,_#D9D6D5_100%)] dark:bg-[radial-gradient(circle_at_top_right,_#020F10_0%,_#010808_100%)] text-[#1F1C1B] dark:text-[#FAFBF8] font-body p-4 md:p-8 flex items-center overflow-hidden justify-center relative ${isDarkMode ? 'dark' : ''}`}>
      <StyleInjector />

      {/* ── Cinematic edge-sweep overlay ── */}
      {showCurtain && (
        <div
          key={modeTransitionKey}
          className={`${curtainDirection === 'night' ? 'edge-sweep-night' : 'edge-sweep-day'} fixed inset-0 z-[9999] pointer-events-none`}
          style={{
            background: curtainDirection === 'night'
              ? 'linear-gradient(135deg, #020F10 0%, #004142 40%, #010808 100%)'
              : 'linear-gradient(135deg, #FAFBF8 0%, #E5FEFF 40%, #D9D6D5 100%)'
          }}
        />
      )}

      <div className="absolute top-[-10%] left-[-10%] w-[44%] h-[44%] bg-[#007970] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] opacity-[0.13] dark:opacity-[0.18] animate-aurora-a pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[44%] h-[44%] bg-[#C74601] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] opacity-[0.13] dark:opacity-[0.18] animate-aurora-b pointer-events-none"></div>

      {debugMode && (
        <div className="absolute top-6 right-6 flex items-center gap-2 bg-[#FFEEE5] dark:bg-[#021A1B]/80 text-[#C74601] dark:text-[#FFD5BF] px-4 py-2 rounded-full text-[0.9075rem] font-bold tracking-widest uppercase backdrop-blur-md shadow-sm z-50">
          <ShieldCheck className="w-4 h-4" /> QA: ON (Debug)
        </div>
      )}

      {viewMode === 'card' ? (
      <div className="w-full max-w-[1200px] min-h-[1000px] relative z-10">
        <AnimatePresence mode="wait" custom={navDirection}>
          <motion.div
            key={`${cardIndex}-${panelMode}`}
            custom={navDirection}
            variants={cardShellVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={handleCardEdgeClick}
            style={{ touchAction: 'pan-y' }}
            className="relative w-full min-h-[1000px] bg-white/0 dark:bg-[#020F10]/60 backdrop-blur-2xl rounded-[32px] shadow-[0_24px_60px_rgba(31,28,27,0.12)] dark:shadow-[0_24px_80px_rgba(0,10,10,0.75)] overflow-hidden flex flex-col border-l-[4.3px] border-l-[#C74601]"
          >
        <header className="px-8 pt-8 pb-4 flex justify-between items-end">
          <div>
            <p className="text-[#007970] dark:text-[#64F4F5] font-bold text-[1.059rem] tracking-widest uppercase mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> CMS-485 Training
            </p>
            {isIntroCard ? (
              <p className="font-heading text-[1.6rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8] tracking-tight">{card.section}</p>
            ) : (
            <p className="font-heading text-[2.7225rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8] tracking-tight" aria-live="polite" aria-label={`Step ${displayStepNumber} of ${visibleStepTotal}`}>
              {displayStepNumber} <span className="text-[#747474] dark:text-[#D9D6D5] text-[1.815rem]">/ {visibleStepTotal}</span>
            </p>
            )}
          </div>
          <img
            className="h-[2.8rem] w-auto object-contain"
            src={isDarkMode
              ? "https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_White.png"
              : "https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_Gray.png"
            }
            alt="CareIndeed Logo"
          />
        </header>

        <div className="px-8 py-4 flex gap-3">
          {Array.from({ length: visibleCardTotal }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === progressActiveIndex
                  ? 'w-12 bg-[#C74601] glow-orange'
                  : i < progressActiveIndex
                    ? 'w-6 bg-[#FFD5BF] dark:bg-[#021A1B]'
                    : 'w-2 bg-[#E5E4E3] dark:bg-[#07282A]'
              }`}
            />
          ))}
        </div>

        <section className="p-8 min-h-[520px] flex-1 flex flex-col items-center justify-center">
          <div key={`${cardIndex}-${panelMode}`} className="flex-1 flex flex-col w-full max-w-4xl">

            {card.final ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-[#E5FEFF] dark:bg-[#004142] flex items-center justify-center glow-teal mb-4 -translate-y-[1px] hover:-translate-y-[2px] shadow-[0_7px_17px_-5px_rgba(31,28,27,0.15)] hover:shadow-[0_14px_34px_-10px_rgba(31,28,27,0.3)] transition-all duration-300">
                  <Check className="w-12 h-12 text-[#007970] dark:text-[#64F4F5]" />
                </div>
                <h1 className="font-heading text-[2.7225rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8] -translate-y-[1px] hover:-translate-y-[2px] transition-transform duration-300">Training Complete</h1>
                <p className="text-[#524048] dark:text-[#D9D6D5] max-w-md text-[1.3613rem] font-light -translate-y-[1px] hover:-translate-y-[2px] transition-transform duration-300">
                  You have completed the CMS-485 documentation training. Excellent work mastering the Plan of Care.
                </p>

                {/* ── Before / After Metrics ── */}
                {metrics.preScore !== null && (
                  <div className="w-full max-w-lg mt-6 space-y-4">
                    <h2 className="font-heading text-[1.4rem] font-bold text-[#007970] dark:text-[#64F4F5] flex items-center gap-2 justify-center"><BarChart3 className="w-5 h-5" /> Performance Comparison</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl p-5 border border-[#E5E4E3] dark:border-[#07282A] bg-white/30 dark:bg-white/5 text-center">
                        <p className="text-[0.85rem] font-bold tracking-widest uppercase text-[#747474] dark:text-[#D9D6D5] mb-2">Before Training</p>
                        <p className="text-[2.4rem] font-bold text-[#C74601] dark:text-[#E56E2E]">{metrics.preScore}<span className="text-[1.2rem] text-[#747474]">/{metrics.preTotal}</span></p>
                        <p className="text-[0.9rem] text-[#524048] dark:text-[#D9D6D5]">{Math.round((metrics.preScore / metrics.preTotal) * 100)}%</p>
                      </div>
                      <div className="rounded-2xl p-5 border border-[#E5E4E3] dark:border-[#07282A] bg-white/30 dark:bg-white/5 text-center">
                        <p className="text-[0.85rem] font-bold tracking-widest uppercase text-[#747474] dark:text-[#D9D6D5] mb-2">After Training</p>
                        {(() => {
                          const postScore = (metrics.hendersonScore ?? 0) + (metrics.layoutScore ?? 0)
                          const postTotal = Math.max(1, (metrics.hendersonTotal || 1) + (metrics.layoutTotal || 1))
                          return (
                            <>
                              <p className="text-[2.4rem] font-bold text-[#007970] dark:text-[#64F4F5]">{postScore}<span className="text-[1.2rem] text-[#747474]">/{postTotal}</span></p>
                              <p className="text-[0.9rem] text-[#524048] dark:text-[#D9D6D5]">{Math.round((postScore / postTotal) * 100)}%</p>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                    {(() => {
                      const prePct = Math.round((metrics.preScore / metrics.preTotal) * 100)
                      const postScore = (metrics.hendersonScore ?? 0) + (metrics.layoutScore ?? 0)
                      const postTotal = Math.max(1, (metrics.hendersonTotal || 1) + (metrics.layoutTotal || 1))
                      const postPct = Math.round((postScore / postTotal) * 100)
                      const delta = postPct - prePct
                      return (
                        <div className={`rounded-xl p-3 text-center font-bold text-[1.1rem] ${delta >= 0 ? 'bg-[#E5FEFF] dark:bg-[#004142]/50 text-[#007970] dark:text-[#64F4F5]' : 'bg-[#FFEEE5] dark:bg-[#C74601]/20 text-[#C74601]'}`}>
                          {delta >= 0 ? '+' : ''}{delta}% Improvement
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            ) : card.kind === 'welcome' ? (
              /* ── WELCOME BANNER ── */
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto">
                <img
                  className="h-12 w-auto object-contain mb-2"
                  src={isDarkMode
                    ? "https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_White.png"
                    : "https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_Gray.png"}
                  alt="CareIndeed Home Health"
                />
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/40 dark:bg-white/5 border border-[#E5E4E3] dark:border-[#07282A] text-[#C74601] dark:text-[#E56E2E] text-xs font-bold uppercase tracking-[0.16em]">
                  <BookOpen className="w-4 h-4" /> CMS-485 Master Challenge
                </div>
                <h1 className="font-heading text-[2.5rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8] leading-tight">
                  Master the{' '}
                  <span className="bg-gradient-to-r from-[#007970] to-[#64F4F5] bg-clip-text text-transparent">Plan of Care</span>
                </h1>
                <p className="text-[1.15rem] text-[#524048] dark:text-[#D9D6D5] leading-relaxed font-light max-w-lg">
                  Welcome to CareIndeed's CMS-485 clinical documentation training. Navigate content in Card View or Book View, complete the Henderson and Layout challenges, and prove your competency.
                </p>
                <div className="grid grid-cols-2 gap-3 w-full max-w-md mt-2">
                  {[
                    { icon: FileText, label: 'Card & Book Views', desc: 'Two ways to learn' },
                    { icon: ShieldCheck, label: 'System Calibration', desc: 'Configure your environment' },
                    { icon: HeartPulse, label: 'Henderson Challenge', desc: 'High-acuity clinical case' },
                    { icon: GraduationCap, label: 'Layout Challenge', desc: 'CMS-485 form mastery' },
                  ].map((h, i) => (
                    <div key={i} className="rounded-xl p-3 border border-[#E5E4E3] dark:border-[#07282A] bg-white/20 dark:bg-white/5 text-left">
                      <h.icon className="w-4 h-4 text-[#007970] dark:text-[#64F4F5] mb-1" />
                      <p className="font-semibold text-[0.85rem] text-[#1F1C1B] dark:text-[#FAFBF8]">{h.label}</p>
                      <p className="text-[0.75rem] text-[#747474] dark:text-[#D9D6D5]">{h.desc}</p>
                    </div>
                  ))}
                </div>

                {/* ── Pre-Assessment Baseline Quiz ── */}
                {!preSubmitted ? (
                  <div className="w-full max-w-lg mt-4 text-left space-y-4">
                    <h2 className="font-heading text-[1.1rem] font-bold text-[#007970] dark:text-[#64F4F5] flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Baseline Knowledge Check</h2>
                    {PRE_ASSESSMENT.map((q, qi) => (
                      <div key={qi} className="space-y-2">
                        <p className="text-[0.95rem] font-medium text-[#1F1C1B] dark:text-[#FAFBF8]">{qi + 1}. {q.question}</p>
                        {q.options.map((opt, oi) => (
                          <button
                            key={oi}
                            onClick={() => setPreAnswers(prev => ({ ...prev, [qi]: oi }))}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-[0.9rem] transition-all border ${
                              preAnswers[qi] === oi
                                ? 'border-[#007970] dark:border-[#64F4F5] bg-[#E5FEFF] dark:bg-[#004142]/40 text-[#007970] dark:text-[#64F4F5] font-medium'
                                : 'border-[#E5E4E3] dark:border-[#07282A] text-[#524048] dark:text-[#D9D6D5] hover:border-[#007970]/40'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ))}
                    <button
                      onClick={handlePreAssessmentSubmit}
                      disabled={Object.keys(preAnswers).length < PRE_ASSESSMENT.length}
                      className="w-full py-3 rounded-xl font-bold text-white bg-[#C74601] hover:bg-[#E56E2E] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Submit Baseline
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[#007970] dark:text-[#64F4F5] font-bold text-[1rem]">
                    <CheckCircle2 className="w-5 h-5" /> Baseline recorded: {metrics.preScore}/{metrics.preTotal}
                  </div>
                )}
              </div>
            ) : card.kind === 'config' ? (
              /* ── SYSTEM CONFIGURATION ── */
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto w-full">
                <div className="w-16 h-16 rounded-2xl bg-[#E5FEFF] dark:bg-[#004142] flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-[#007970] dark:text-[#64F4F5]" />
                </div>
                <h2 className="font-heading text-[1.8rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8]">System Configuration</h2>
                <p className="text-[1rem] text-[#524048] dark:text-[#D9D6D5] text-center">Choose your preferred display theme, layout, and verify audio.</p>

                {/* Theme toggle */}
                <div className="w-full grid grid-cols-2 gap-3">
                  {[
                    { id: false, label: 'Light Mode', icon: Sun, desc: 'Clean, bright interface' },
                    { id: true, label: 'Night Mode', icon: Moon, desc: 'Easy on the eyes' },
                  ].map((m) => (
                    <button
                      key={String(m.id)}
                      onClick={() => {
                        if (isDarkMode !== m.id) {
                          const goingToNight = m.id
                          sfxModeToggle(goingToNight)
                          setCurtainDirection(goingToNight ? 'night' : 'day')
                          setShowCurtain(true)
                          setModeTransitionKey(k => k + 1)
                          setTimeout(() => setIsDarkMode(m.id), 500)
                          setTimeout(() => setShowCurtain(false), 2000)
                        }
                      }}
                      className={`rounded-xl p-4 border-2 transition-all text-left ${
                        isDarkMode === m.id
                          ? 'border-[#007970] dark:border-[#64F4F5] bg-[#E5FEFF] dark:bg-[#004142]/40'
                          : 'border-[#E5E4E3] dark:border-[#07282A]'
                      }`}
                    >
                      <m.icon className={`w-6 h-6 mb-2 ${isDarkMode === m.id ? 'text-[#007970] dark:text-[#64F4F5]' : 'text-[#747474]'}`} />
                      <p className="font-semibold text-[0.9rem] text-[#1F1C1B] dark:text-[#FAFBF8]">{m.label}</p>
                      <p className="text-[0.75rem] text-[#747474] dark:text-[#D9D6D5]">{m.desc}</p>
                    </button>
                  ))}
                </div>

                {/* View preference */}
                <div className="w-full grid grid-cols-2 gap-3">
                  {[
                    { id: 'card' as const, label: 'Card View', desc: 'Focused, one-at-a-time' },
                    { id: 'web' as const, label: 'Book View', desc: 'Two-page spread layout' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => { sfxClick(); setViewMode(v.id) }}
                      className={`rounded-xl p-4 border-2 transition-all text-left ${
                        viewMode === v.id
                          ? 'border-[#007970] dark:border-[#64F4F5] bg-[#E5FEFF] dark:bg-[#004142]/40'
                          : 'border-[#E5E4E3] dark:border-[#07282A]'
                      }`}
                    >
                      <p className="font-semibold text-[0.9rem] text-[#1F1C1B] dark:text-[#FAFBF8]">{v.label}</p>
                      <p className="text-[0.75rem] text-[#747474] dark:text-[#D9D6D5]">{v.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Audio check */}
                <button
                  onClick={handleTestAudioInline}
                  className={`w-full py-3 rounded-xl font-semibold text-[0.95rem] transition-all flex items-center justify-center gap-2 border-2 ${
                    audioTestPlaying
                      ? 'border-[#007970] dark:border-[#64F4F5] text-[#007970] dark:text-[#64F4F5] bg-[#E5FEFF] dark:bg-[#004142]/30'
                      : 'border-[#E5E4E3] dark:border-[#07282A] text-[#1F1C1B] dark:text-[#FAFBF8]'
                  }`}
                >
                  <Volume2 className={`w-4 h-4 ${audioTestPlaying ? 'animate-bounce' : ''}`} />
                  {audioTestPlaying ? 'Playing Tone…' : 'Test Audio'}
                </button>
              </div>
            ) : card.kind === 'challenge-gate' ? (
              /* ── CHALLENGE GATEWAY ── */
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto w-full">
                <div className="w-16 h-16 rounded-2xl bg-[#FFEEE5] dark:bg-[#C74601]/20 flex items-center justify-center">
                  <Swords className="w-8 h-8 text-[#C74601] dark:text-[#E56E2E]" />
                </div>
                <h2 className="font-heading text-[1.8rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8]">Competency Challenges</h2>
                <p className="text-[1rem] text-[#524048] dark:text-[#D9D6D5] text-center">Complete both challenges to unlock the training modules. These assess your clinical documentation competency.</p>

                <div className="w-full space-y-3">
                  {/* Henderson Challenge */}
                  <div className={`w-full rounded-xl p-5 border-2 transition-all flex items-center gap-4 ${
                    gating.hendersonComplete
                      ? 'border-[#007970] dark:border-[#64F4F5] bg-[#E5FEFF] dark:bg-[#004142]/30'
                      : 'border-[#E5E4E3] dark:border-[#07282A]'
                  }`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      gating.hendersonComplete ? 'bg-[#007970]/15 dark:bg-[#64F4F5]/15' : 'bg-[#FFEEE5] dark:bg-[#C74601]/15'
                    }`}>
                      {gating.hendersonComplete ? <CheckCircle2 className="w-6 h-6 text-[#007970] dark:text-[#64F4F5]" /> : <HeartPulse className="w-6 h-6 text-[#C74601]" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[1rem] text-[#1F1C1B] dark:text-[#FAFBF8]">Henderson Clinical Challenge</p>
                      <p className="text-[0.8rem] text-[#747474] dark:text-[#D9D6D5]">
                        {gating.hendersonComplete ? 'Completed' : 'Map clinical findings to CMS-485 boxes'}
                      </p>
                    </div>
                    {!gating.hendersonComplete && (
                      <button
                        onClick={() => setActiveChallenge('henderson')}
                        className="px-5 py-2 rounded-xl bg-[#C74601] text-white font-bold text-[0.85rem] hover:bg-[#E56E2E] transition-all flex items-center gap-1"
                      >
                        Launch <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Layout Challenge */}
                  <div className={`w-full rounded-xl p-5 border-2 transition-all flex items-center gap-4 ${
                    gating.layoutComplete
                      ? 'border-[#007970] dark:border-[#64F4F5] bg-[#E5FEFF] dark:bg-[#004142]/30'
                      : 'border-[#E5E4E3] dark:border-[#07282A]'
                  }`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      gating.layoutComplete ? 'bg-[#007970]/15 dark:bg-[#64F4F5]/15' : 'bg-[#FFEEE5] dark:bg-[#C74601]/15'
                    }`}>
                      {gating.layoutComplete ? <CheckCircle2 className="w-6 h-6 text-[#007970] dark:text-[#64F4F5]" /> : <GraduationCap className="w-6 h-6 text-[#C74601]" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[1rem] text-[#1F1C1B] dark:text-[#FAFBF8]">CMS-485 Layout Challenge</p>
                      <p className="text-[0.8rem] text-[#747474] dark:text-[#D9D6D5]">
                        {gating.layoutComplete ? 'Completed' : 'Place form sections in the correct order'}
                      </p>
                    </div>
                    {!gating.layoutComplete && (
                      <button
                        onClick={() => setActiveChallenge('layout')}
                        className="px-5 py-2 rounded-xl bg-[#C74601] text-white font-bold text-[0.85rem] hover:bg-[#E56E2E] transition-all flex items-center gap-1"
                      >
                        Launch <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Gating message */}
                {!gating.hendersonComplete || !gating.layoutComplete ? (
                  <p className="text-[0.85rem] text-[#747474] dark:text-[#D9D6D5] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Complete both challenges to unlock training content
                  </p>
                ) : (
                  <p className="text-[0.95rem] font-bold text-[#007970] dark:text-[#64F4F5] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> All challenges complete — training unlocked
                  </p>
                )}
              </div>
            ) : card.kind === 'forms' ? (
              /* ── INTERACTIVE CMS-485 FORM ── */
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto w-full">
                <div className="w-16 h-16 rounded-2xl bg-[#E5FEFF] dark:bg-[#004142] flex items-center justify-center">
                  <FileText className="w-8 h-8 text-[#007970] dark:text-[#64F4F5]" />
                </div>
                <h2 className="font-heading text-[1.8rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8]">Interactive CMS-485 Form</h2>
                <p className="text-[1rem] text-[#524048] dark:text-[#D9D6D5] text-center leading-relaxed">
                  The CMS-485 form is the structured Plan of Care used in home health. Each box serves a specific compliance and clinical documentation purpose.
                </p>
                <div className="w-full space-y-2 text-left">
                  {[
                    { box: 'Boxes 1–6', desc: 'Patient demographics, dates, and identification' },
                    { box: 'Boxes 11–12', desc: 'Principal and secondary diagnoses' },
                    { box: 'Boxes 14–16', desc: 'DME, functional limitations, and mental status' },
                    { box: 'Boxes 18–22', desc: 'Skilled nursing orders, frequency, and goals' },
                    { box: 'Boxes 23–28', desc: 'Signatures, certification, and federal penalty' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/20 dark:bg-white/5 border border-[#E5E4E3] dark:border-[#07282A]">
                      <span className="font-bold text-[0.85rem] text-[#007970] dark:text-[#64F4F5] min-w-[80px]">{item.box}</span>
                      <span className="text-[0.9rem] text-[#524048] dark:text-[#D9D6D5]">{item.desc}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[0.85rem] text-[#747474] dark:text-[#D9D6D5] italic">
                  You will practice completing these boxes throughout the training modules.
                </p>
              </div>
            ) : (
              <>
                <p className="text-[#C74601] dark:text-[#E56E2E] text-[0.9075rem] font-bold tracking-widest uppercase mb-3 -translate-y-[1px] hover:-translate-y-[2px] transition-transform duration-300">
                  {card.section} • {panelMode.toUpperCase()}
                </p>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#1F1C1B] dark:text-[#FAFBF8] mb-8 leading-tight -translate-y-[1px] hover:-translate-y-[2px] transition-transform duration-300">
                  {card.title}
                </h1>

                {panelMode === 'challenge' ? (
                  <div className="flex-1 max-w-3xl">
                    <p className="text-[#524048] dark:text-[#D9D6D5] mb-6 text-[1.3613rem]">Which response best aligns with this card's objective?</p>
                    <div className="space-y-3">
                        {card.challenge.map((option: ChallengeOption, i: number) => {
                        const isSelected = (selectedAnswers[cardIndex] ?? null) === i;
                        const submitted = Boolean(submittedAnswers[cardIndex]);
                        const showCorrect = submitted && isSelected && isCorrect(cardIndex);
                        const showWrong = submitted && isSelected && !isCorrect(cardIndex);

                        return (
                          <button
                            key={i}
                            disabled={submitted}
                            onClick={() => { sfxClick(); setSelectedAnswers(prev => ({ ...prev, [cardIndex]: i })); }}
                            className={`w-full text-left p-5 rounded-[16px] transition-all duration-300 flex items-start gap-4 bg-transparent border-l-[3.3px] ${showCorrect || showWrong || isSelected ? 'border-l-[#00BFB4]' : 'border-l-[#747474] dark:border-l-[#07282A] hover:border-l-[#007970] dark:hover:border-l-[#64F4F5]'} shadow-[0_6px_14px_-10px_rgba(31,28,27,0.2)] dark:shadow-[0_6px_14px_-10px_rgba(0,0,0,0.4)] hover:bg-white/[0.30] dark:hover:bg-white/[0.04] hover:shadow-[0_0_26px_-6px_rgba(0,121,112,0.62),0_12px_26px_-12px_rgba(31,28,27,0.28)] dark:hover:shadow-[0_0_26px_-6px_rgba(100,244,245,0.35),0_12px_26px_-12px_rgba(0,0,0,0.5)] ${
                              showCorrect ? 'glow-teal border-l-[#00BFB4] shadow-[0_0_32px_-4px_rgba(0,191,180,0.78),0_12px_28px_-12px_rgba(31,28,27,0.32)]' :
                              showWrong ? 'border-l-[#00BFB4] shadow-[0_0_30px_-5px_rgba(0,191,180,0.72),0_12px_28px_-12px_rgba(31,28,27,0.32)]' :
                              isSelected ? 'border-l-[#00BFB4] shadow-[0_0_30px_-5px_rgba(0,191,180,0.72),0_12px_28px_-12px_rgba(31,28,27,0.32)]' :
                              ''
                            }`}
                          >
                            <div className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                              showCorrect ? 'text-[#007970] dark:text-[#64F4F5] bg-transparent' :
                              showWrong ? 'text-[#D70101] dark:text-[#FBE6E6] bg-transparent' :
                              isSelected ? 'bg-transparent' : 'bg-transparent'
                            }`}>
                              {showCorrect && <CheckCircle2 className="w-4 h-4" />}
                              {showWrong && <XCircle className="w-4 h-4" />}
                            </div>
                            <span className={`text-[18.15px] leading-relaxed ${
                              showCorrect ? 'text-[#004142] dark:text-[#C4F4F5] font-semibold' :
                              showWrong ? 'text-[#D70101] dark:text-[#FBE6E6]' :
                              isSelected ? 'text-[#421700] dark:text-[#FFD5BF] font-medium' : 'text-[#524048] dark:text-[#D9D6D5]'
                            }`}>
                              {option.text}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                      <button
                        onClick={handleSubmitChallenge}
                        disabled={Boolean(submittedAnswers[cardIndex])}
                        className={`px-8 py-3 rounded-[12px] text-[1.1rem] font-bold tracking-wide transition-all duration-300 ${
                          !submittedAnswers[cardIndex]
                            ? 'bg-[#C74601] text-white hover:bg-[#E56E2E] glow-orange hover:-translate-y-0.5'
                            : 'bg-[#E5E4E3] dark:bg-[#07282A] text-[#747474] dark:text-[#D9D6D5] cursor-not-allowed'
                        }`}
                      >
                        Submit
                      </button>

                      {submittedAnswers[cardIndex] && (
                        <p className={`text-[1.21rem] font-bold flex items-center gap-2 ${isCorrect(cardIndex) ? 'text-[#007970] dark:text-[#64F4F5]' : 'text-[#D70101] dark:text-[#FBE6E6]'}`}>
                          {isCorrect(cardIndex) ? <><CheckCircle2 className="w-5 h-5"/> Correct — great job.</> : <><XCircle className="w-5 h-5"/> Incorrect — review before advancing.</>}
                        </p>
                      )}
                    </div>
                  </div>
                ) : panelMode === 'additional' ? (
                  <div className="flex-1 flex">
                    <div className="bg-transparent rounded-[24px] p-8 w-full h-full overflow-y-auto -translate-y-[1px] hover:-translate-y-[2px] border-l-[3.3px] border-l-[#007970] dark:border-l-[#64F4F5] shadow-[0_7px_17px_-5px_rgba(31,28,27,0.15),0_0_18px_-10px_rgba(0,121,112,0.35)] dark:shadow-[0_7px_17px_-5px_rgba(0,0,0,0.4),0_0_18px_-10px_rgba(100,244,245,0.15)] hover:shadow-[0_14px_34px_-10px_rgba(31,28,27,0.3),0_0_30px_-6px_rgba(0,121,112,0.72)] dark:hover:shadow-[0_14px_34px_-10px_rgba(0,0,0,0.5),0_0_30px_-6px_rgba(100,244,245,0.35)] transition-all duration-300 hover:bg-white/[0.30] dark:hover:bg-white/[0.04]">
                      <p className="text-[#1F1C1B] dark:text-[#FAFBF8] text-[1.21rem] leading-relaxed whitespace-pre-line">
                        {currentAdditionalContent}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 h-full">
                    <div className="bg-transparent rounded-[24px] p-6 -translate-y-[1px] hover:-translate-y-[2px] border-l-[3px] border-l-[#007970] dark:border-l-[#64F4F5] shadow-[0_7px_17px_-5px_rgba(31,28,27,0.15),0_0_16px_-10px_rgba(0,121,112,0.3)] dark:shadow-[0_7px_17px_-5px_rgba(0,0,0,0.4),0_0_16px_-10px_rgba(100,244,245,0.15)] hover:shadow-[0_14px_34px_-10px_rgba(31,28,27,0.3),0_0_28px_-6px_rgba(0,121,112,0.68)] dark:hover:shadow-[0_14px_34px_-10px_rgba(0,0,0,0.5),0_0_28px_-6px_rgba(100,244,245,0.35)] transition-all duration-300 hover:bg-white/[0.30] dark:hover:bg-white/[0.04]">
                      <h2 className="text-[#007970] dark:text-[#64F4F5] font-heading font-bold text-[1.3613rem] mb-2">Learning Objective</h2>
                      <p className="text-[#1F1C1B] dark:text-[#FAFBF8] text-[1.3613rem]">{card.objective}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                      <div className="bg-transparent rounded-[24px] p-6 -translate-y-[1px] hover:-translate-y-[2px] border-l-[3.3px] border-l-[#524048] dark:border-l-[#64F4F5] shadow-[0_7px_17px_-5px_rgba(31,28,27,0.15),0_0_16px_-10px_rgba(82,64,72,0.3)] dark:shadow-[0_7px_17px_-5px_rgba(0,0,0,0.4),0_0_16px_-10px_rgba(217,214,213,0.12)] hover:shadow-[0_14px_34px_-10px_rgba(31,28,27,0.3),0_0_28px_-6px_rgba(82,64,72,0.62)] dark:hover:shadow-[0_14px_34px_-10px_rgba(0,0,0,0.5),0_0_28px_-6px_rgba(217,214,213,0.25)] transition-all duration-300 hover:bg-white/[0.30] dark:hover:bg-white/[0.04]">
                        <h2 className="text-[#747474] dark:text-[#D9D6D5] font-heading font-bold text-[1.059rem] uppercase tracking-widest mb-4 pb-2">Key Points</h2>
                        <ul className="space-y-3 list-none">
                          {card.bullets.map((b: string, i: number) => (
                            <li key={i} className="text-[#524048] dark:text-[#FAFBF8] text-[1.21rem]">
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-transparent rounded-[24px] p-6 -translate-y-[1px] hover:-translate-y-[2px] border-l-[3.3px] border-l-[#C74601] dark:border-l-[#E56E2E] shadow-[0_7px_17px_-5px_rgba(31,28,27,0.15),0_0_16px_-10px_rgba(199,70,1,0.35)] dark:shadow-[0_7px_17px_-5px_rgba(0,0,0,0.4),0_0_16px_-10px_rgba(229,110,46,0.15)] hover:shadow-[0_14px_34px_-10px_rgba(31,28,27,0.3),0_0_28px_-6px_rgba(199,70,1,0.72)] dark:hover:shadow-[0_14px_34px_-10px_rgba(0,0,0,0.5),0_0_28px_-6px_rgba(229,110,46,0.35)] transition-all duration-300 hover:bg-white/[0.30] dark:hover:bg-white/[0.04]">
                        <h2 className="text-[#C74601] dark:text-[#E56E2E] font-heading font-bold text-[1.059rem] uppercase tracking-widest mb-4 pb-2">Clinical Lens</h2>
                        <p className="text-[#1F1C1B] dark:text-[#FAFBF8] text-[1.21rem] leading-relaxed">Translate this concept into clear, patient-specific, defensible documentation language.</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {panelMode === 'additional' && (
            <div
              className="fixed bottom-6 right-6 z-30 p-[40px] -m-[40px]"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                onClick={toggleAudio}
                disabled={!hasAudio}
                className="w-14 h-14 text-[#007970] dark:text-[#64F4F5] flex items-center justify-center hover:text-[#005E57] dark:hover:text-[#C4F4F5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title={isPlaying ? 'Pause audio' : 'Play audio'}
              >
                {isPlaying
                  ? <Pause className="w-5 h-5 fill-current" />
                  : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
            </div>
          )}
        </section>

          </motion.div>
        </AnimatePresence>
      </div>
      ) : (
      /* ═══ BOOK VIEW — two-page spread with flip ═══ */
      <div className="w-full max-w-[1584px] relative z-10" style={{ perspective: '2400px' }}>
        <AnimatePresence mode="wait" custom={navDirection}>
          <motion.div
            key={webCardIndex}
            custom={navDirection}
            variants={bookFlipVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ transformOrigin: 'right center', backfaceVisibility: 'hidden' }}
            className="relative w-full h-[81vh] bg-white/60 dark:bg-[#020F10]/70 backdrop-blur-2xl rounded-[20px] shadow-[0_16px_48px_rgba(31,28,27,0.10)] dark:shadow-[0_16px_64px_rgba(0,10,10,0.70)] flex flex-col border-x-[4px] border-x-[#C74601]"
          >
            {/* ── Book Header ── */}
            <header className="px-6 pt-4 pb-2.5 flex items-center justify-between border-b border-[#E5E4E3]/40 dark:border-[#07282A]/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#007970]/10 dark:bg-[#64F4F5]/10 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-[#007970] dark:text-[#64F4F5]" />
                </div>
                <div>
                  <p className="text-[#007970] dark:text-[#64F4F5] font-bold text-[1.1rem] tracking-[0.15em] uppercase leading-none">CMS-485 Training</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalSpreads }).map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-400 ${i === webCardIndex ? 'w-5 bg-[#C74601]' : i < webCardIndex ? 'w-2.5 bg-[#C74601]/30' : 'w-1.5 bg-[#E5E4E3] dark:bg-[#07282A]'}`} />
                  ))}
                </div>
                <span className="text-[#747474] dark:text-[#D9D6D5] text-[1.1rem] font-bold tracking-wider tabular-nums">Spread {webCardIndex + 1}/{totalSpreads}</span>
              </div>
            </header>

            {/* ── Two-Page Spread ── */}
            <div className="flex flex-1 min-h-0 items-center justify-center">
              {[leftIdx, rightIdx].map((pageIdx, sideIdx) => {
                const c = webCards[pageIdx] as any
                if (!c) {
                  return (
                    <div key={`empty-${sideIdx}`} className="w-1/2 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Check className="w-8 h-8 mx-auto text-[#007970] dark:text-[#64F4F5]" />
                        <p className="text-[#007970] dark:text-[#64F4F5] font-heading font-bold text-[1.12rem]">All Topics Complete</p>
                      </div>
                    </div>
                  )
                }

                const narration = getCardNarration(c)
                const cardAudioUrl = getCardAudioUrl(c)
                const hasPageAudio = Boolean(cardAudioUrl)
                const kcUnlocked = isKCUnlocked(pageIdx)
                const subOpen = webSubjectOpen[pageIdx]
                const chalOpen = webChallengeOpen[pageIdx]
                const isPagePlaying = isPlaying && playingCardIdx === pageIdx

                // ── Intro card rendering for Book View ──
                if (c.kind) {
                  return (
                    <div key={pageIdx} className="w-1/2 flex flex-col min-h-0 items-center justify-center">
                      <div className="flex-1 w-full max-w-[640px] overflow-hidden px-6 py-4 flex flex-col gap-3 justify-center">
                        {c.kind === 'welcome' && (
                          <div className="flex flex-col items-center text-center gap-3">
                            <img
                              className="h-10 w-auto object-contain mb-1"
                              src={isDarkMode
                                ? "https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_White.png"
                                : "https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_Gray.png"}
                              alt="CareIndeed"
                            />
                            <h2 className="font-heading text-[1.7rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8] leading-tight">
                              Master the <span className="text-[#007970] dark:text-[#64F4F5]">Plan of Care</span>
                            </h2>
                            <p className="text-[1.1rem] text-[#524048] dark:text-[#D9D6D5] leading-relaxed">
                              CMS-485 clinical documentation training with Card View, Book View, Henderson Clinical Challenge, and Layout Challenge.
                            </p>
                            {preSubmitted && (
                              <p className="text-[0.9rem] font-bold text-[#007970] dark:text-[#64F4F5] flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Baseline: {metrics.preScore}/{metrics.preTotal}</p>
                            )}
                          </div>
                        )}
                        {c.kind === 'config' && (
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 mb-1">
                              <ShieldCheck className="w-5 h-5 text-[#007970] dark:text-[#64F4F5]" />
                              <h2 className="font-heading text-[1.5rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8]">System Configuration</h2>
                            </div>
                            <p className="text-[1rem] text-[#524048] dark:text-[#D9D6D5]">Theme, layout, and audio preferences are configured via Card View or the dock controls.</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="rounded-lg p-3 border border-[#E5E4E3] dark:border-[#07282A] bg-white/20 dark:bg-white/5">
                                <Sun className="w-4 h-4 text-[#007970] dark:text-[#64F4F5] mb-1" />
                                <p className="text-[0.85rem] font-semibold text-[#1F1C1B] dark:text-[#FAFBF8]">Light / Night</p>
                              </div>
                              <div className="rounded-lg p-3 border border-[#E5E4E3] dark:border-[#07282A] bg-white/20 dark:bg-white/5">
                                <Layers className="w-4 h-4 text-[#007970] dark:text-[#64F4F5] mb-1" />
                                <p className="text-[0.85rem] font-semibold text-[#1F1C1B] dark:text-[#FAFBF8]">Card / Book</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {c.kind === 'challenge-gate' && (
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Swords className="w-5 h-5 text-[#C74601] dark:text-[#E56E2E]" />
                              <h2 className="font-heading text-[1.5rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8]">Competency Challenges</h2>
                            </div>
                            <div className={`rounded-lg p-3 flex items-center gap-3 border ${gating.hendersonComplete ? 'border-[#007970] dark:border-[#64F4F5] bg-[#E5FEFF]/50 dark:bg-[#004142]/30' : 'border-[#E5E4E3] dark:border-[#07282A]'}`}>
                              {gating.hendersonComplete ? <CheckCircle2 className="w-5 h-5 text-[#007970] dark:text-[#64F4F5]" /> : <HeartPulse className="w-5 h-5 text-[#C74601]" />}
                              <span className="text-[1rem] text-[#1F1C1B] dark:text-[#FAFBF8]">Henderson Challenge {gating.hendersonComplete ? '✓' : '— pending'}</span>
                            </div>
                            <div className={`rounded-lg p-3 flex items-center gap-3 border ${gating.layoutComplete ? 'border-[#007970] dark:border-[#64F4F5] bg-[#E5FEFF]/50 dark:bg-[#004142]/30' : 'border-[#E5E4E3] dark:border-[#07282A]'}`}>
                              {gating.layoutComplete ? <CheckCircle2 className="w-5 h-5 text-[#007970] dark:text-[#64F4F5]" /> : <GraduationCap className="w-5 h-5 text-[#C74601]" />}
                              <span className="text-[1rem] text-[#1F1C1B] dark:text-[#FAFBF8]">Layout Challenge {gating.layoutComplete ? '✓' : '— pending'}</span>
                            </div>
                            {gating.hendersonComplete && gating.layoutComplete && (
                              <p className="text-[0.9rem] font-bold text-[#007970] dark:text-[#64F4F5] flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Training unlocked</p>
                            )}
                          </div>
                        )}
                        {c.kind === 'forms' && (
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-5 h-5 text-[#007970] dark:text-[#64F4F5]" />
                              <h2 className="font-heading text-[1.5rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8]">CMS-485 Form Structure</h2>
                            </div>
                            <div className="space-y-1.5">
                              {[
                                { box: '1–6', desc: 'Demographics & dates' },
                                { box: '11–12', desc: 'Diagnoses' },
                                { box: '14–16', desc: 'DME, limitations, mental status' },
                                { box: '18–22', desc: 'Orders, frequency, goals' },
                                { box: '23–28', desc: 'Signatures & certification' },
                              ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-[0.95rem]">
                                  <span className="font-bold text-[#007970] dark:text-[#64F4F5] min-w-[50px]">{item.box}</span>
                                  <span className="text-[#524048] dark:text-[#D9D6D5]">{item.desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={pageIdx} className="w-1/2 flex flex-col min-h-0 items-center justify-center">
                    {/* Page content - scrollable */}
                    <div className="flex-1 w-full max-w-[640px] overflow-hidden px-6 py-4 flex flex-col gap-3 justify-center">

                      {/* Section + Title */}
                      <div className="mb-1">
                        <p className="text-[#C74601] dark:text-[#E56E2E] text-[0.92rem] font-bold tracking-[0.14em] uppercase mb-0.5">{c.section}</p>
                        <h2 className="font-heading text-[1.94rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8] leading-tight">{c.title}</h2>
                      </div>

                      {/* Learning Objective */}
                      <div className="px-0 py-0">
                        <p className="text-[#007970] dark:text-[#64F4F5] font-heading font-bold text-[0.87rem] tracking-[0.15em] uppercase mb-0.5">Objective</p>
                        <p className="text-[#1F1C1B] dark:text-[#FAFBF8] text-[1.35rem] leading-snug">{c.objective}</p>
                      </div>

                      {/* Key Points */}
                      <div className="px-0 py-0">
                        <p className="text-[#747474] dark:text-[#D9D6D5] font-heading font-bold text-[0.87rem] tracking-[0.15em] uppercase mb-1">Key Points</p>
                        <ul className="space-y-0.5 list-none">
                          {c.bullets.map((b: string, bi: number) => (
                            <li key={bi} className="text-[#524048] dark:text-[#FAFBF8] text-[1.26rem] leading-snug flex items-start gap-1.5">
                              <span className="text-[#007970] dark:text-[#64F4F5] mt-[3px] text-[0.54rem]">&#9679;</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Subject Content (collapsible) */}
                      {narration && (
                        <div className="transition-all duration-200">
                          <button onClick={() => handleSubjectToggle(pageIdx)} className="w-full flex items-center justify-between px-4 py-2 group">
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded flex items-center justify-center ${subOpen ? 'bg-[#007970]/15 dark:bg-[#64F4F5]/15' : 'bg-[#007970]/8 dark:bg-[#64F4F5]/8'}`}>
                                {isPagePlaying ? <Pause className="w-2.5 h-2.5 text-[#007970] dark:text-[#64F4F5] fill-current" /> : <Play className="w-2.5 h-2.5 text-[#007970] dark:text-[#64F4F5] fill-current ml-px" />}
                              </div>
                              <span className="text-[#007970] dark:text-[#64F4F5] font-heading font-bold text-[0.98rem] tracking-[0.12em] uppercase">Subject Content</span>
                              {isPagePlaying && <span className="text-[#007970] dark:text-[#64F4F5] text-[0.84rem] animate-pulse ml-0.5">Playing</span>}
                              {webAudioCompleted[pageIdx] && !isPagePlaying && <CheckCircle2 className="w-3 h-3 text-[#007970] dark:text-[#64F4F5] ml-0.5" />}
                            </div>
                            <ChevronDown className={`w-3 h-3 text-[#747474] dark:text-[#D9D6D5] transition-transform duration-200 ${subOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {subOpen && (
                            <div className="px-4 pb-3">
                              <p className="text-[#1F1C1B] dark:text-[#FAFBF8] text-[1.29rem] leading-[1.6] whitespace-pre-line pt-2 max-h-[18vh] overflow-hidden">{narration}</p>
                              {hasPageAudio && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (!audioRef.current) audioRef.current = new Audio()
                                    if (isPagePlaying) { stopAudio() }
                                    else if (cardAudioUrl) {
                                      stopAudio()
                                      audioRef.current.src = cardAudioUrl
                                      audioRef.current.onended = () => { setIsPlaying(false); setPlayingCardIdx(null); setWebAudioCompleted(p => ({ ...p, [pageIdx]: true })) }
                                      audioRef.current.play().then(() => { setIsPlaying(true); setPlayingCardIdx(pageIdx) }).catch(() => {})
                                    }
                                  }}
                                  className="mt-2 flex items-center gap-1 px-2.5 py-1 rounded-md text-[1.1rem] font-bold tracking-wide text-[#007970] dark:text-[#64F4F5] hover:bg-[#007970]/10 dark:hover:bg-[#64F4F5]/10 transition-colors"
                                >
                                  {isPagePlaying ? <Pause className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 fill-current" />}
                                  {isPagePlaying ? 'Pause' : 'Replay'}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Challenge (collapsible, locked) */}
                      <div className="transition-all duration-200">
                        <button
                          onClick={() => { if (kcUnlocked) setWebChallengeOpen(prev => ({ ...prev, [pageIdx]: !prev[pageIdx] })) }}
                          disabled={!kcUnlocked}
                          className="w-full flex items-center justify-between px-4 py-2 disabled:cursor-not-allowed group"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded flex items-center justify-center ${!kcUnlocked ? 'bg-[#747474]/10' : chalOpen ? 'bg-[#C74601]/15' : 'bg-[#C74601]/8'}`}>
                              {!kcUnlocked ? <Lock className="w-2.5 h-2.5 text-[#747474] dark:text-[#D9D6D5]" /> : <Swords className="w-2.5 h-2.5 text-[#C74601] dark:text-[#E56E2E]" />}
                            </div>
                            <span className={`font-heading font-bold text-[0.98rem] tracking-[0.12em] uppercase ${kcUnlocked ? 'text-[#C74601] dark:text-[#E56E2E]' : 'text-[#747474] dark:text-[#D9D6D5]'}`}>Challenge</span>
                            {!kcUnlocked && <span className="text-[#747474] dark:text-[#D9D6D5] text-[0.82rem] normal-case ml-0.5">Listen to unlock</span>}
                            {submittedAnswers[pageIdx] && (
                              <span className={`text-[0.87rem] font-bold ml-0.5 flex items-center gap-0.5 ${isCorrect(pageIdx) ? 'text-[#007970] dark:text-[#64F4F5]' : 'text-[#D70101] dark:text-[#FBE6E6]'}`}>
                                {isCorrect(pageIdx) ? <><CheckCircle2 className="w-2.5 h-2.5" /> Correct</> : <><XCircle className="w-2.5 h-2.5" /> Incorrect</>}
                              </span>
                            )}
                          </div>
                          <ChevronDown className={`w-3 h-3 ${!kcUnlocked ? 'text-[#D9D6D5] dark:text-[#07282A]' : 'text-[#747474] dark:text-[#D9D6D5]'} transition-transform duration-200 ${chalOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {chalOpen && kcUnlocked && (
                          <div className="px-4 pb-3">
                            <div className="space-y-1 pt-2">
                              {c.challenge.map((opt: ChallengeOption, oi: number) => {
                                const sel = (selectedAnswers[pageIdx] ?? null) === oi
                                const sub = Boolean(submittedAnswers[pageIdx])
                                const correct = sub && sel && isCorrect(pageIdx)
                                const wrong = sub && sel && !isCorrect(pageIdx)
                                return (
                                  <button key={oi} disabled={sub} onClick={() => { sfxClick(); setSelectedAnswers(prev => ({ ...prev, [pageIdx]: oi })) }}
                                    className={`w-full text-left px-1 py-1 transition-all duration-200 flex items-start gap-2 border-none text-[1.29rem] leading-snug ${
                                      correct ? 'text-[#004142] dark:text-[#C4F4F5]' :
                                      wrong ? 'text-[#D70101] dark:text-[#FBE6E6]' :
                                      sel ? 'text-[#421700] dark:text-[#FFD5BF]' :
                                      'text-[#524048] dark:text-[#D9D6D5]'
                                    }`}
                                  >
                                    <div className="mt-0.5 w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center">
                                      {correct && <CheckCircle2 className="w-3 h-3 text-[#007970] dark:text-[#64F4F5]" />}
                                      {wrong && <XCircle className="w-3 h-3 text-[#D70101] dark:text-[#FBE6E6]" />}
                                      {!sub && !sel && <div className="w-2.5 h-2.5 rounded-full border-[1.5px] border-[#D9D6D5] dark:border-[#07282A]" />}
                                      {!sub && sel && <div className="w-2.5 h-2.5 rounded-full bg-[#C74601] dark:bg-[#E56E2E]" />}
                                    </div>
                                    <span className={`${
                                      correct ? 'text-[#004142] dark:text-[#C4F4F5] font-semibold' :
                                      wrong ? 'text-[#D70101] dark:text-[#FBE6E6]' :
                                      sel ? 'text-[#421700] dark:text-[#FFD5BF] font-medium' : 'text-[#524048] dark:text-[#D9D6D5]'
                                    }`}>{opt.text}</span>
                                  </button>
                                )
                              })}
                            </div>
                            <div className="mt-2">
                              <button
                                onClick={() => { sfxClick(); setSubmittedAnswers(prev => ({ ...prev, [pageIdx]: true })) }}
                                disabled={Boolean(submittedAnswers[pageIdx]) || selectedAnswers[pageIdx] === undefined || selectedAnswers[pageIdx] === null}
                                className={`px-4 py-1.5 rounded-lg text-[1.26rem] font-bold tracking-wide transition-all duration-300 ${
                                  !submittedAnswers[pageIdx] && selectedAnswers[pageIdx] !== undefined && selectedAnswers[pageIdx] !== null
                                    ? 'bg-[#C74601] text-white hover:bg-[#E56E2E] shadow-[0_3px_12px_-3px_rgba(199,70,1,0.4)]'
                                    : 'bg-[#E5E4E3] dark:bg-[#07282A] text-[#747474] dark:text-[#D9D6D5] cursor-not-allowed'
                                }`}
                              >Submit</button>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Book Footer ── */}
            <footer className="px-6 py-2.5 flex items-center justify-between border-t border-[#E5E4E3]/30 dark:border-[#07282A]/40 shrink-0">
              <button
                onClick={() => { sfxSwipe(); stopAudio(); setNavDirection(-1); setWebCardIndex(prev => prev - 1) }}
                disabled={webCardIndex === 0}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[1.26rem] font-bold tracking-wide text-[#524048] dark:text-[#D9D6D5] hover:bg-white/30 dark:hover:bg-white/[0.06] disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <div className="flex items-center gap-3 text-[1.1rem] text-[#747474] dark:text-[#D9D6D5] font-medium tabular-nums">
                <span>Pages {leftIdx + 1}{rightCard ? `–${rightIdx + 1}` : ''} of {webCards.length}</span>
              </div>
              {webCardIndex < totalSpreads - 1 ? (
                <button
                  onClick={() => { sfxSwipe(); stopAudio(); setNavDirection(1); setWebCardIndex(prev => prev + 1) }}
                  disabled={!canAdvanceSpread}
                  className={`flex items-center gap-1.5 px-5 py-1.5 rounded-xl text-[1.26rem] font-bold tracking-wide transition-all duration-300 ${
                    canAdvanceSpread
                      ? 'bg-[#C74601] text-white hover:bg-[#E56E2E] shadow-[0_4px_16px_-4px_rgba(199,70,1,0.4)] hover:-translate-y-0.5'
                      : 'bg-[#E5E4E3] dark:bg-[#07282A] text-[#747474] dark:text-[#D9D6D5] cursor-not-allowed'
                  }`}
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                canAdvanceSpread && (
                  <div className="flex items-center gap-1.5 text-[#007970] dark:text-[#64F4F5] font-bold text-[1.26rem]">
                    <Check className="w-4 h-4" /> Complete
                  </div>
                )
              )}
            </footer>
          </motion.div>
        </AnimatePresence>
      </div>
      )}
      {/* Dock (center-left) */}
      <Dock items={dockItems} position="center-left" isDarkMode={isDarkMode} />

      {/* ── Challenge Overlay ── */}
      {activeChallenge && (
        <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-6xl h-[90vh] bg-white dark:bg-[#010809] rounded-2xl overflow-auto shadow-2xl relative">
            <button
              onClick={() => setActiveChallenge(null)}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-[#E5E4E3] dark:bg-[#07282A] flex items-center justify-center hover:bg-[#D9D6D5] dark:hover:bg-[#004142] transition-colors"
            >
              <XCircle className="w-5 h-5 text-[#747474] dark:text-[#D9D6D5]" />
            </button>
            {activeChallenge === 'henderson' && (
              <HendersonChallenge onExit={handleHendersonExit} />
            )}
            {activeChallenge === 'layout' && (
              <LayoutChallenge
                theme={isDarkMode ? 'night' : 'day'}
                onComplete={handleLayoutComplete}
                onBack={() => setActiveChallenge(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
