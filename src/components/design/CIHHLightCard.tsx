import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sfxClick, sfxSwipe, sfxModeToggle } from '../../utils/sfx';
import {
  Play, Pause, ArrowRight, Volume2,
  CheckCircle2, XCircle,
  ShieldCheck, FileText, Check,
  Moon, Sun, Layers, Lock, ChevronLeft, ChevronRight, ChevronDown, BookOpen,
  Home, Settings, LayoutGrid, HeartPulse, GraduationCap
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

      /* â”€â”€ cinematic night-mode transition â”€â”€ */
      .night-transition,
      .night-transition *:not(svg):not(path) {
        transition-property: background-color, color, border-color, box-shadow, opacity, fill, stroke, filter;
        transition-duration: 1.8s;
        transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* â”€â”€ edge-sweep mode transition â”€â”€ */
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
import { TermHighlighter } from '../TermHighlighter';
import { useGlossary } from '../GlossaryProvider';
import { TRAINING_CARDS } from '../../data/trainingCards';
import LayoutChallenge from '../LayoutChallenge';
import HendersonChallenge from '../HendersonChallenge';
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
    .replace(/['™`".,:;!?()\-]/g, ' ')
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
  const challengeOptions = shuffleChallengeOptions(
    c.challenge?.options ?? [
      c.bullets?.[0] ?? c.objective ?? 'Select the most defensible response.',
      c.bullets?.[1] ?? 'Use a generic template statement without patient-specific details.',
      c.bullets?.[2] ?? 'Delay documentation updates until episode end.',
    ],
    challengeSeed,
  )

  return {
    title: c.title,
    section: c.section ?? '',
    objective: c.objective ?? '',
    bullets: c.bullets ?? [],
    additional: fallbackAdditional,
    challenge: challengeOptions,
    challengeScenario: c.challenge?.scenario ?? '',
    challengeQuestion: c.challenge?.question ?? 'Which response best aligns with this card\'s objective?',
    correctLogic: c.challenge?.correctLogic ?? '',
  }
}

type IntroKind = 'welcome' | 'calibration' | 'layout-challenge' | 'henderson-challenge' | 'course-selection'

const INTRO_CARDS: Array<{ title: string; intro: IntroKind; section: string }> = [
  { title: 'Welcome', intro: 'welcome', section: 'Onboarding' },
  { title: 'Systems Calibration', intro: 'calibration', section: 'Onboarding' },
  { title: 'Layout Challenge', intro: 'layout-challenge', section: 'Onboarding' },
  { title: 'Henderson Challenge', intro: 'henderson-challenge', section: 'Onboarding' },
  { title: 'Course Selection', intro: 'course-selection', section: 'Onboarding' },
]

const GATING_KEY = 'cihh.intro.gating'

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

export default function CIHHLightCard({ onNavigate: _onNavigate }: { onNavigate?: (phase: string) => void }) {
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
  const { resetClaims } = useGlossary();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pointerStartX = useRef<number | null>(null)
  const pointerStartY = useRef<number | null>(null)
  const pointerCurrentX = useRef<number | null>(null)
  const pointerCurrentY = useRef<number | null>(null)

  const [audioTested, setAudioTested] = useState(false)
  const [introCompleted, setIntroCompleted] = useState<Record<string, boolean>>({})

  useEffect(() => {
    localStorage.setItem(GATING_KEY, JSON.stringify(introCompleted))
  }, [introCompleted])

  // Reset glossary first-occurrence claims when navigating cards
  useEffect(() => { resetClaims() }, [cardIndex, resetClaims])

  const card = cards[cardIndex] as any;
  const isOnIntroCard = Boolean(card?.intro)
  const isOnChallengeCard = card?.intro === 'layout-challenge' || card?.intro === 'henderson-challenge'
  const introCardCount = INTRO_CARDS.length
  const trainingOnlyCards = cards.filter(entry => !(entry as any).final && !(entry as any).intro)
  const trainingCardIndex = cardIndex - introCardCount

  // Intro card progress
  const introDisplayStep = Math.min(cardIndex + 1, introCardCount)
  const introProgressIndex = Math.min(cardIndex, introCardCount - 1)

  // Training card progress
  const visibleCardTotal = trainingOnlyCards.length
  const visibleStepTotal = visibleCardTotal * 3
  const panelStepOffset = panelMode === 'main' ? 0 : panelMode === 'additional' ? 1 : 2
  const displayStepNumber = card?.final
    ? visibleStepTotal
    : Math.max(1, Math.min(trainingCardIndex * 3 + panelStepOffset + 1, visibleStepTotal))
  const progressActiveIndex = card?.final
    ? Math.max(0, visibleCardTotal - 1)
    : Math.max(0, Math.min(trainingCardIndex, visibleCardTotal - 1))
  const audioUrl = card?.title ? findAudioForTitle(card.title) : null;
  const hasAudio = Boolean(audioUrl);
  const normalizedCardTitle = normalizeText(card?.title ?? '')
  const matchedAdditionalSection = ADDITIONAL_SECTIONS.find(section => {
    const normalizedSectionTitle = normalizeText(section.title)
    return normalizedSectionTitle.includes(normalizedCardTitle) || normalizedCardTitle.includes(normalizedSectionTitle)
  })
  const currentAdditionalContent = matchedAdditionalSection?.body || card.additional || ''

  // â”€â”€ Book view computed values â”€â”€
  const webCards = cards.filter(c => !(c as any).final && !(c as any).intro)
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

  // Course Selection: progress tracking, resume index
  const completedTopicCount = TRAINING_CARDS.filter((_, i) => submittedAnswers[introCardCount + i]).length;
  const firstIncompleteIdx = TRAINING_CARDS.findIndex((_, i) => !submittedAnswers[introCardCount + i]);
  const resumeCardIndex = firstIncompleteIdx >= 0 ? introCardCount + firstIncompleteIdx : introCardCount;

  const dockItems = [
    { icon: <FileText className="w-5 h-5" />, label: 'Help', onClick: () => alert('Open help') },
    ...(!isOnIntroCard ? [{ icon: viewMode === 'card' ? <BookOpen className="w-5 h-5" /> : <Layers className="w-5 h-5" />, label: viewMode === 'card' ? 'Book' : 'Card', onClick: () => { sfxClick(); stopAudio(); setViewMode(prev => prev === 'card' ? 'web' : 'card'); }, isActive: viewMode === 'web' }] : []),
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
    { icon: <Home className="w-5 h-5" />, label: 'Welcome', onClick: () => { sfxClick(); setNavDirection(cardIndex > 0 ? -1 : 1); setCardIndex(0); setPanelMode('main'); if (viewMode === 'web') setViewMode('card'); } },
    { icon: <Settings className="w-5 h-5" />, label: 'Calibrate', onClick: () => { sfxClick(); setNavDirection(cardIndex > 1 ? -1 : 1); setCardIndex(1); setPanelMode('main'); if (viewMode === 'web') setViewMode('card'); } },
    { icon: <LayoutGrid className="w-5 h-5" />, label: 'Layout', onClick: () => { sfxClick(); setNavDirection(cardIndex > 2 ? -1 : 1); setCardIndex(2); setPanelMode('main'); if (viewMode === 'web') setViewMode('card'); } },
    { icon: <GraduationCap className="w-5 h-5" />, label: 'Courses', onClick: () => { sfxClick(); setNavDirection(cardIndex > 3 ? -1 : 1); setCardIndex(3); setPanelMode('main'); if (viewMode === 'web') setViewMode('card'); } },
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

  const handleTestAudioInline = () => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 659.25
      gain.gain.value = 0.15
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.25)
      setAudioTested(true)
    } catch {}
  }

  const handleNext = () => {
    if (isOnIntroCard) {
      const introKind = card.intro as string
      if ((introKind === 'layout-challenge' || introKind === 'henderson-challenge') && !debugMode && !introCompleted[introKind]) return
      if (introKind === 'course-selection') {
        stopAudio()
        sfxSwipe()
        setNavDirection(1)
        setIntroCompleted(prev => ({ ...prev, [introKind]: true }))
        setCardIndex(resumeCardIndex)
        setPanelMode('main')
        if (viewMode === 'web') setWebCardIndex(Math.floor((resumeCardIndex - introCardCount) / 2))
        return
      }
      if (cardIndex < cards.length - 1) {
        stopAudio()
        sfxSwipe()
        setNavDirection(1)
        setIntroCompleted(prev => ({ ...prev, [introKind]: true }))
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
    if (isOnIntroCard) {
      if (cardIndex > 0) {
        stopAudio()
        sfxSwipe()
        setNavDirection(-1)
        setCardIndex(cardIndex - 1)
        setPanelMode('main')
      }
      return
    }
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

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isOnChallengeCard) return           // lock page during challenges
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
    if (isOnChallengeCard) return            // lock page during challenges
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
      if (isOnChallengeCard) return          // lock page during challenges
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

      {/* â”€â”€ Cinematic edge-sweep overlay â”€â”€ */}
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

      {(viewMode === 'card' || isOnIntroCard) ? (
      <div className={`w-full ${card.intro?.includes?.('challenge') ? 'max-w-[1400px]' : 'max-w-[1200px]'} min-h-[1000px] relative z-10`}>
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
              <FileText className="w-4 h-4" /> {isOnIntroCard ? 'Onboarding' : 'CMS-485 Training'}
            </p>
            {isOnIntroCard ? (
              <p className="font-heading text-[2.7225rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8] tracking-tight" aria-live="polite" aria-label={`Step ${introDisplayStep} of ${introCardCount}`}>
                {introDisplayStep} <span className="text-[#747474] dark:text-[#D9D6D5] text-[1.815rem]">/ {introCardCount}</span>
              </p>
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
          {isOnIntroCard ? (
            Array.from({ length: introCardCount }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === introProgressIndex
                    ? 'w-12 bg-[#007970] dark:bg-[#64F4F5] glow-teal'
                    : i < introProgressIndex
                      ? 'w-6 bg-[#C4F4F5] dark:bg-[#004142]'
                      : 'w-2 bg-[#E5E4E3] dark:bg-[#07282A]'
                }`}
              />
            ))
          ) : (
            Array.from({ length: visibleCardTotal }).map((_, i) => (
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
            ))
          )}
        </div>

        {card.intro?.includes?.('challenge') ? (
          /* ── CHALLENGE SECTION — renders inline inside card shell ── */
          <section className="flex-1 flex flex-col overflow-hidden">
            {card.intro === 'layout-challenge' && (
              <LayoutChallenge
                inline
                theme={isDarkMode ? 'night' : 'day'}
                onComplete={() => {
                  setIntroCompleted(prev => ({ ...prev, 'layout-challenge': true }))
                  sfxSwipe()
                  setNavDirection(1)
                  setCardIndex(cardIndex + 1)
                  setPanelMode('main')
                }}
                onBack={() => {
                  sfxSwipe()
                  setNavDirection(-1)
                  setCardIndex(cardIndex - 1)
                  setPanelMode('main')
                }}
              />
            )}
            {card.intro === 'henderson-challenge' && (
              <HendersonChallenge
                inline
                theme={isDarkMode ? 'night' : 'day'}
                onComplete={() => {
                  setIntroCompleted(prev => ({ ...prev, 'henderson-challenge': true }))
                  sfxSwipe()
                  setNavDirection(1)
                  setCardIndex(cardIndex + 1)
                  setPanelMode('main')
                }}
                onBack={() => {
                  sfxSwipe()
                  setNavDirection(-1)
                  setCardIndex(cardIndex - 1)
                  setPanelMode('main')
                }}
              />
            )}
          </section>
        ) : (
        <section className="p-8 min-h-[520px] flex-1 flex flex-col items-center justify-center">
          <div key={`${cardIndex}-${panelMode}`} className="flex-1 flex flex-col w-full max-w-4xl">

            {isOnIntroCard ? (
              /* ── INTRO CARD CONTENT ── */
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">

                {/* ── 1. Welcome Banner ── */}
                {card.intro === 'welcome' && (
                  <div className="space-y-10 max-w-2xl w-full">
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E5FEFF] dark:bg-[#002B2C] border border-[#C4F4F5] dark:border-[#007970] text-[#007970] dark:text-[#64F4F5] text-[0.75rem] font-bold uppercase tracking-[0.18em]">
                      <BookOpen className="w-4 h-4" /> CMS-485 Documentation Module
                    </div>
                    <div className="space-y-5">
                      <h1 className="font-heading text-[2.8rem] md:text-[3.6rem] font-bold tracking-tight leading-[1.08]">
                        Master the{' '}
                        <span className="bg-gradient-to-r from-[#007970] via-[#00A89D] to-[#64F4F5] bg-clip-text text-transparent">Plan of Care</span>
                      </h1>
                      <p className="text-[#524048] dark:text-[#D9D6D5] text-[1.15rem] leading-[1.7] font-light max-w-lg mx-auto">
                        CareIndeed&apos;s clinical documentation training platform. Build mastery through guided lessons, real&#8209;world challenges, and competency assessments.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { Icon: Settings, label: 'Environment Setup', desc: 'Personalize theme & audio' },
                        { Icon: LayoutGrid, label: 'Form Mastery', desc: 'CMS-485 structure challenge' },
                        { Icon: GraduationCap, label: 'Training Paths', desc: 'Card, Book & Interactive' },
                      ].map((h, i) => (
                        <div key={i} className="group flex items-start gap-3.5 p-4 rounded-2xl bg-white/50 dark:bg-white/[0.03] border border-[#E5E4E3] dark:border-[#07282A] hover:border-[#007970]/30 dark:hover:border-[#64F4F5]/20 hover:shadow-[0_6px_24px_rgba(0,121,112,0.08)] transition-all duration-300 text-left">
                          <div className="w-10 h-10 rounded-xl bg-[#E5FEFF] dark:bg-[#002B2C] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <h.Icon className="w-5 h-5 text-[#007970] dark:text-[#64F4F5]" />
                          </div>
                          <div>
                            <p className="font-heading font-semibold text-[0.92rem] mb-0.5">{h.label}</p>
                            <p className="text-[0.8rem] text-[#747474] dark:text-[#D9D6D5] leading-snug">{h.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 space-y-3">
                      <button onClick={handleNext} className="group inline-flex items-center gap-3 px-12 py-[18px] rounded-2xl bg-[#007970] hover:bg-[#006059] text-white font-bold text-lg tracking-wide transition-all duration-300 hover:-translate-y-1 shadow-[0_12px_40px_rgba(0,121,112,0.25)] hover:shadow-[0_18px_50px_rgba(0,121,112,0.35)]">
                        Begin Training <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <p className="text-[0.82rem] text-[#747474] dark:text-[#D9D6D5]">25-35 min &middot; 5 onboarding steps</p>
                    </div>
                    <div className="flex items-center justify-center gap-5 text-[0.72rem] text-[#747474] dark:text-[#D9D6D5] tracking-widest uppercase pt-2">
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#007970] dark:text-[#64F4F5]" /> SCORM Compatible</span>
                      <span className="h-3 w-px bg-[#D9D6D5] dark:bg-[#07282A]" />
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#007970] dark:text-[#64F4F5]" /> CareIndeed Certified</span>
                    </div>
                  </div>
                )}

                {/* ── 2. Systems Calibration ── */}
                {card.intro === 'calibration' && (
                  <div className="space-y-8 max-w-md w-full">
                    <div className="w-20 h-20 rounded-2xl bg-[#E5FEFF] dark:bg-[#002B2C] flex items-center justify-center mx-auto shadow-[0_8px_24px_rgba(0,121,112,0.12)]">
                      <Settings className="w-10 h-10 text-[#007970] dark:text-[#64F4F5]" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="font-heading text-[1.8rem] font-bold">Configure Your Environment</h2>
                      <p className="text-[#524048] dark:text-[#D9D6D5] text-base max-w-sm mx-auto">Personalize your learning experience before starting the training modules.</p>
                    </div>
                    <div className="space-y-3 text-left">
                      {/* Theme selection */}
                      <div className="p-5 rounded-2xl border border-[#E5E4E3] dark:border-[#07282A] bg-white/40 dark:bg-white/[0.02] hover:border-[#007970]/30 dark:hover:border-[#64F4F5]/20 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-3">
                          {isDarkMode ? <Moon className="w-5 h-5 text-[#64F4F5]" /> : <Sun className="w-5 h-5 text-[#C74601]" />}
                          <div>
                            <p className="font-heading font-semibold text-[0.95rem]">Display Theme</p>
                            <p className="text-[0.78rem] text-[#747474] dark:text-[#D9D6D5]">Choose your preferred visual mode</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { if (isDarkMode) { sfxModeToggle(false); setCurtainDirection('day'); setShowCurtain(true); setModeTransitionKey(k => k + 1); setTimeout(() => setIsDarkMode(false), 500); setTimeout(() => setShowCurtain(false), 2000); } }}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${!isDarkMode ? 'bg-[#007970] text-white shadow-[0_4px_16px_rgba(0,121,112,0.25)]' : 'bg-transparent border border-[#07282A] text-[#D9D6D5] hover:border-[#64F4F5]'}`}
                          >
                            <Sun className="w-4 h-4" />Light
                          </button>
                          <button
                            onClick={() => { if (!isDarkMode) { sfxModeToggle(true); setCurtainDirection('night'); setShowCurtain(true); setModeTransitionKey(k => k + 1); setTimeout(() => setIsDarkMode(true), 500); setTimeout(() => setShowCurtain(false), 2000); } }}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${isDarkMode ? 'bg-[#64F4F5] text-[#010809] shadow-[0_4px_16px_rgba(100,244,245,0.25)]' : 'bg-transparent border border-[#E5E4E3] text-[#747474] hover:border-[#007970]'}`}
                          >
                            <Moon className="w-4 h-4" />Night
                          </button>
                        </div>
                      </div>
                      {/* Audio verification */}
                      <div className="p-5 rounded-2xl border border-[#E5E4E3] dark:border-[#07282A] bg-white/40 dark:bg-white/[0.02] hover:border-[#007970]/30 dark:hover:border-[#64F4F5]/20 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Volume2 className="w-5 h-5 text-[#007970] dark:text-[#64F4F5]" />
                            <div>
                              <p className="font-heading font-semibold text-[0.95rem]">Audio Verification</p>
                              <p className="text-[0.78rem] text-[#747474] dark:text-[#D9D6D5]">Confirm speakers or headphones</p>
                            </div>
                          </div>
                          <button
                            onClick={handleTestAudioInline}
                            className={`px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${audioTested ? 'bg-[#E5FEFF] dark:bg-[#002B2C] text-[#007970] dark:text-[#64F4F5] border border-[#C4F4F5] dark:border-[#007970]' : 'bg-[#007970] dark:bg-[#64F4F5] text-white dark:text-[#010809] hover:opacity-90'}`}
                          >
                            {audioTested ? <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" />Verified</span> : <span className="flex items-center gap-1.5"><Volume2 className="w-4 h-4" />Test</span>}
                          </button>
                        </div>
                      </div>
                    </div>
                    <button onClick={handleNext} className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-[#007970] hover:bg-[#006059] text-white font-bold text-base tracking-wide transition-all duration-300 hover:-translate-y-0.5 shadow-[0_12px_40px_rgba(0,121,112,0.25)] hover:shadow-[0_18px_44px_rgba(0,121,112,0.3)]">
                      Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}

                {/* ── 3. Course Selection ── */
                {card.intro === 'course-selection' && (
                  <div className="w-full max-w-4xl space-y-5 overflow-y-auto max-h-full pb-4">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5FEFF] dark:bg-[#002B2C] border border-[#C4F4F5] dark:border-[#007970] text-[#007970] dark:text-[#64F4F5] text-[0.7rem] font-bold uppercase tracking-[0.16em]">
                          <Layers className="w-3 h-3" /> Course Modules
                        </div>
                        <h2 className="font-heading text-[1.5rem] font-bold">Select a Topic</h2>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Progress badge */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[0.72rem] font-semibold tabular-nums ${isDarkMode ? 'bg-white/5 border border-white/10 text-gray-300' : 'bg-[#FAFBF8] border border-[#E5E4E3] text-[#524048]'}`}>
                          <div className={`h-1.5 w-14 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-[#E5E4E3]'}`}>
                            <div className="h-full bg-gradient-to-r from-[#007970] to-[#64F4F5] transition-all duration-700" style={{ width: `${TRAINING_CARDS.length > 0 ? Math.round(completedTopicCount / TRAINING_CARDS.length * 100) : 0}%` }} />
                          </div>
                          <span>{completedTopicCount}/{TRAINING_CARDS.length}</span>
                        </div>
                        {/* View toggle + Resume */}
                        <div className="flex gap-1 p-0.5 rounded-lg bg-[#E5E4E3]/40 dark:bg-[#07282A]/40">
                          <button onClick={() => setViewMode('card')} className={`px-2.5 py-1 rounded-md text-[0.7rem] font-bold transition-all ${viewMode === 'card' ? 'bg-[#007970] text-white shadow-sm' : 'text-[#747474] dark:text-[#D9D6D5] hover:text-[#007970]'}`}>
                            Card
                          </button>
                          <button onClick={() => setViewMode('web')} className={`px-2.5 py-1 rounded-md text-[0.7rem] font-bold transition-all ${viewMode === 'web' ? 'bg-[#007970] text-white shadow-sm' : 'text-[#747474] dark:text-[#D9D6D5] hover:text-[#007970]'}`}>
                            Book
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            sfxClick();
                            setNavDirection(1);
                            setCardIndex(resumeCardIndex);
                            setPanelMode('main');
                            if (viewMode === 'web') setWebCardIndex(Math.floor((resumeCardIndex - introCardCount) / 2));
                          }}
                          className="group flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C74601] hover:bg-[#E56E2E] text-white text-[0.75rem] font-bold transition-all duration-200 hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(199,70,1,0.2)]"
                        >
                          {completedTopicCount === 0 ? 'Start' : 'Resume'} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>

                    {/* Topic grid grouped by section */}
                    <div className="space-y-3">
                      {(() => {
                        const sections: { name: string; items: { tc: typeof TRAINING_CARDS[0]; gi: number }[] }[] = [];
                        TRAINING_CARDS.forEach((tc, i) => {
                          const gi = introCardCount + i;
                          const last = sections[sections.length - 1];
                          if (last && last.name === tc.section) {
                            last.items.push({ tc, gi });
                          } else {
                            sections.push({ name: tc.section, items: [{ tc, gi }] });
                          }
                        });
                        return sections.map((sec) => {
                          const sectionDone = sec.items.every(({ gi }) => Boolean(submittedAnswers[gi]));
                          return (
                            <div key={sec.name} className={`rounded-2xl border overflow-hidden transition-all ${isDarkMode ? 'border-white/8 bg-white/[0.02]' : 'border-[#E5E4E3] bg-white'}`}>
                              {/* Section header */}
                              <div className={`flex items-center justify-between px-4 py-2.5 ${isDarkMode ? 'bg-white/[0.03] border-b border-white/5' : 'bg-[#FAFBF8] border-b border-[#E5E4E3]'}`}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${sectionDone ? 'bg-[#007970]' : 'bg-[#C74601]'}`} />
                                  <span className={`text-[0.72rem] font-bold uppercase tracking-[0.12em] ${isDarkMode ? 'text-white/70' : 'text-[#524048]'}`}>{sec.name}</span>
                                </div>
                                <span className={`text-[0.65rem] font-medium ${isDarkMode ? 'text-white/30' : 'text-[#B8B4B2]'}`}>
                                  {sec.items.filter(({ gi }) => Boolean(submittedAnswers[gi])).length}/{sec.items.length}
                                </span>
                              </div>
                              {/* Topic items */}
                              <div className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-[#F2F2F1]'}`}>
                                {sec.items.map(({ tc, gi }, idx) => {
                                  const done = Boolean(submittedAnswers[gi]);
                                  return (
                                    <button
                                      key={gi}
                                      onClick={() => { sfxClick(); setNavDirection(1); setCardIndex(gi); setPanelMode('main'); if (viewMode === 'web') setWebCardIndex(Math.floor((gi - introCardCount) / 2)); }}
                                      className={`group w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 ${done
                                        ? isDarkMode ? 'bg-[#002B2C]/20 hover:bg-[#002B2C]/40' : 'bg-[#F0FDFA]/60 hover:bg-[#E5FEFF]'
                                        : isDarkMode ? 'hover:bg-white/[0.04]' : 'hover:bg-[#FAFBF8]'
                                      }`}
                                    >
                                      {/* Number */}
                                      <span className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[0.68rem] font-bold transition-colors ${done
                                        ? isDarkMode ? 'bg-[#007970]/30 text-[#64F4F5]' : 'bg-[#E5FEFF] text-[#007970]'
                                        : isDarkMode ? 'bg-white/5 text-white/40' : 'bg-[#F2F2F1] text-[#747474] group-hover:bg-[#E5FEFF] group-hover:text-[#007970]'
                                      }`}>{idx + 1}</span>
                                      {/* Title */}
                                      <span className={`flex-1 text-[0.82rem] leading-snug transition-colors ${done
                                        ? isDarkMode ? 'text-[#64F4F5] font-medium' : 'text-[#007970] font-medium'
                                        : isDarkMode ? 'text-white/70 group-hover:text-white' : 'text-[#524048] group-hover:text-[#1F1C1B]'
                                      }`}>{tc.title}</span>
                                      {/* Status */}
                                      {done
                                        ? <CheckCircle2 className="w-4 h-4 text-[#007970] dark:text-[#64F4F5] flex-shrink-0" />
                                        : <ArrowRight className={`w-3.5 h-3.5 flex-shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${isDarkMode ? 'text-[#C74601]' : 'text-[#007970]'}`} />
                                      }
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>

            ) : card.final ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-[#E5FEFF] dark:bg-[#004142] flex items-center justify-center glow-teal mb-4 -translate-y-[1px] hover:-translate-y-[2px] shadow-[0_7px_17px_-5px_rgba(31,28,27,0.15)] hover:shadow-[0_14px_34px_-10px_rgba(31,28,27,0.3)] transition-all duration-300">
                  <Check className="w-12 h-12 text-[#007970] dark:text-[#64F4F5]" />
                </div>
                <h1 className="font-heading text-[2.7225rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8] -translate-y-[1px] hover:-translate-y-[2px] transition-transform duration-300">Training Complete</h1>
                <p className="text-[#524048] dark:text-[#D9D6D5] max-w-md text-[1.3613rem] font-light -translate-y-[1px] hover:-translate-y-[2px] transition-transform duration-300">
                  You have completed the CMS-485 documentation training. Excellent work mastering the Plan of Care.
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
                    {(card as any).challengeScenario && (
                      <p className="text-[#524048] dark:text-[#D9D6D5] mb-3 text-[0.95rem] leading-relaxed italic border-l-[3px] border-l-[#007970] dark:border-l-[#64F4F5] pl-4"><TermHighlighter text={(card as any).challengeScenario} /></p>
                    )}
                    <p className="text-[#524048] dark:text-[#D9D6D5] mb-4 text-[1.15rem] font-semibold"><TermHighlighter text={(card as any).challengeQuestion || 'Which response best aligns with this card\'s objective?'} /></p>
                    <div className="space-y-1.5">
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
                            className={`w-full text-left px-4 py-2.5 rounded-[12px] transition-all duration-300 flex items-start gap-3 bg-transparent border-l-[3.3px] ${showCorrect || showWrong || isSelected ? 'border-l-[#00BFB4]' : 'border-l-[#747474] dark:border-l-[#07282A] hover:border-l-[#007970] dark:hover:border-l-[#64F4F5]'} shadow-[0_6px_14px_-10px_rgba(31,28,27,0.2)] dark:shadow-[0_6px_14px_-10px_rgba(0,0,0,0.4)] hover:bg-white/[0.30] dark:hover:bg-white/[0.04] hover:shadow-[0_0_26px_-6px_rgba(0,121,112,0.62),0_12px_26px_-12px_rgba(31,28,27,0.28)] dark:hover:shadow-[0_0_26px_-6px_rgba(100,244,245,0.35),0_12px_26px_-12px_rgba(0,0,0,0.5)] ${
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
                            <span className={`text-[14.5px] leading-snug ${
                              showCorrect ? 'text-[#004142] dark:text-[#C4F4F5] font-semibold' :
                              showWrong ? 'text-[#D70101] dark:text-[#FBE6E6]' :
                              isSelected ? 'text-[#421700] dark:text-[#FFD5BF] font-medium' : 'text-[#524048] dark:text-[#D9D6D5]'
                            }`}>
                              <TermHighlighter text={option.text} />
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex items-center justify-between">
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

                    {submittedAnswers[cardIndex] && (card as any).correctLogic && (
                      <div className="mt-4 p-4 rounded-[12px] border-l-[3.3px] border-l-[#007970] dark:border-l-[#64F4F5] bg-white/[0.15] dark:bg-white/[0.04] shadow-[0_6px_14px_-10px_rgba(31,28,27,0.2)] dark:shadow-[0_6px_14px_-10px_rgba(0,0,0,0.4)]">
                        <p className="text-[#C74601] dark:text-[#E56E2E] text-[0.75rem] font-bold tracking-widest uppercase mb-1.5">Why This Is Correct</p>
                        <p className="text-[#524048] dark:text-[#D9D6D5] text-[0.92rem] leading-relaxed"><TermHighlighter text={(card as any).correctLogic} /></p>
                      </div>
                    )}
                  </div>
                ) : panelMode === 'additional' ? (
                  <div className="flex-1 flex">
                    <div className="bg-transparent rounded-[24px] p-8 w-full h-full overflow-y-auto -translate-y-[1px] hover:-translate-y-[2px] border-l-[3.3px] border-l-[#007970] dark:border-l-[#64F4F5] shadow-[0_7px_17px_-5px_rgba(31,28,27,0.15),0_0_18px_-10px_rgba(0,121,112,0.35)] dark:shadow-[0_7px_17px_-5px_rgba(0,0,0,0.4),0_0_18px_-10px_rgba(100,244,245,0.15)] hover:shadow-[0_14px_34px_-10px_rgba(31,28,27,0.3),0_0_30px_-6px_rgba(0,121,112,0.72)] dark:hover:shadow-[0_14px_34px_-10px_rgba(0,0,0,0.5),0_0_30px_-6px_rgba(100,244,245,0.35)] transition-all duration-300 hover:bg-white/[0.30] dark:hover:bg-white/[0.04]">
                      <p className="text-[#1F1C1B] dark:text-[#FAFBF8] text-[1.21rem] leading-relaxed whitespace-pre-line">
                        <TermHighlighter text={currentAdditionalContent} />
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 h-full">
                    <div className="bg-transparent rounded-[24px] p-6 -translate-y-[1px] hover:-translate-y-[2px] border-l-[3px] border-l-[#007970] dark:border-l-[#64F4F5] shadow-[0_7px_17px_-5px_rgba(31,28,27,0.15),0_0_16px_-10px_rgba(0,121,112,0.3)] dark:shadow-[0_7px_17px_-5px_rgba(0,0,0,0.4),0_0_16px_-10px_rgba(100,244,245,0.15)] hover:shadow-[0_14px_34px_-10px_rgba(31,28,27,0.3),0_0_28px_-6px_rgba(0,121,112,0.68)] dark:hover:shadow-[0_14px_34px_-10px_rgba(0,0,0,0.5),0_0_28px_-6px_rgba(100,244,245,0.35)] transition-all duration-300 hover:bg-white/[0.30] dark:hover:bg-white/[0.04]">
                      <h2 className="text-[#007970] dark:text-[#64F4F5] font-heading font-bold text-[1.3613rem] mb-2">Learning Objective</h2>
                      <p className="text-[#1F1C1B] dark:text-[#FAFBF8] text-[1.3613rem]"><TermHighlighter text={card.objective} /></p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                      <div className="bg-transparent rounded-[24px] p-6 -translate-y-[1px] hover:-translate-y-[2px] border-l-[3.3px] border-l-[#524048] dark:border-l-[#64F4F5] shadow-[0_7px_17px_-5px_rgba(31,28,27,0.15),0_0_16px_-10px_rgba(82,64,72,0.3)] dark:shadow-[0_7px_17px_-5px_rgba(0,0,0,0.4),0_0_16px_-10px_rgba(217,214,213,0.12)] hover:shadow-[0_14px_34px_-10px_rgba(31,28,27,0.3),0_0_28px_-6px_rgba(82,64,72,0.62)] dark:hover:shadow-[0_14px_34px_-10px_rgba(0,0,0,0.5),0_0_28px_-6px_rgba(217,214,213,0.25)] transition-all duration-300 hover:bg-white/[0.30] dark:hover:bg-white/[0.04]">
                        <h2 className="text-[#747474] dark:text-[#D9D6D5] font-heading font-bold text-[1.059rem] uppercase tracking-widest mb-4 pb-2">Key Points</h2>
                        <ul className="space-y-3 list-none">
                          {card.bullets.map((b: string, i: number) => (
                            <li key={i} className="text-[#524048] dark:text-[#FAFBF8] text-[1.21rem]">
                              <TermHighlighter text={b} />
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
        )}

          </motion.div>
        </AnimatePresence>
      </div>
      ) : (
      /* â•â•â• BOOK VIEW — two-page spread with flip â•â•â• */
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
            {/* â”€â”€ Book Header â”€â”€ */}
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

            {/* â”€â”€ Two-Page Spread â”€â”€ */}
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
                              {!kcUnlocked ? <Lock className="w-2.5 h-2.5 text-[#747474] dark:text-[#D9D6D5]" /> : <ShieldCheck className="w-2.5 h-2.5 text-[#C74601] dark:text-[#E56E2E]" />}
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

            {/* â”€â”€ Book Footer â”€â”€ */}
            <footer className="px-6 py-2.5 flex items-center justify-between border-t border-[#E5E4E3]/30 dark:border-[#07282A]/40 shrink-0">
              <button
                onClick={() => { sfxSwipe(); stopAudio(); setNavDirection(-1); setWebCardIndex(prev => prev - 1) }}
                disabled={webCardIndex === 0}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[1.26rem] font-bold tracking-wide text-[#524048] dark:text-[#D9D6D5] hover:bg-white/30 dark:hover:bg-white/[0.06] disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <div className="flex items-center gap-3 text-[1.1rem] text-[#747474] dark:text-[#D9D6D5] font-medium tabular-nums">
                <span>Pages {leftIdx + 1}{rightCard ? `“${rightIdx + 1}` : ''} of {webCards.length}</span>
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

    </div>
  );
}
