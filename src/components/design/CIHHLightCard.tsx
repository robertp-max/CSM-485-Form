import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sfxClick, sfxSwipe, sfxModeToggle } from '../../utils/sfx';
import {
  Play, Pause,
  Square, RotateCcw, Swords,
  CheckCircle2, XCircle,
  ShieldCheck, FileText, Activity, Check,
  Moon, Sun, Layers, LayoutGrid
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
    `}
  </style>
);

const debugMode = true;
import { Dock } from '../Dock';
import { TRAINING_CARDS } from '../../data/trainingCards';
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

const cards = [
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

export default function CIHHLightCard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [modeTransitionKey, setModeTransitionKey] = useState(0);
  const [showCurtain, setShowCurtain] = useState(false);
  const [curtainDirection, setCurtainDirection] = useState<'night' | 'day'>('night');
  const [viewMode, setViewMode] = useState<'card' | 'web'>('card');
  const [cardIndex, setCardIndex] = useState(0);
  const [panelMode, setPanelMode] = useState('main');
  const [navDirection, setNavDirection] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | null>>(() => ({}));
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>(() => ({}));
  const [statusMsg, setStatusMsg] = useState('QA mode bypasses locks');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pointerStartX = useRef<number | null>(null)
  const pointerStartY = useRef<number | null>(null)
  const pointerCurrentX = useRef<number | null>(null)
  const pointerCurrentY = useRef<number | null>(null)

  const card = cards[cardIndex] as any;
  const visibleCardTotal = cards.filter(entry => !(entry as any).final).length
  const visibleStepTotal = visibleCardTotal * 3
  const panelStepOffset = panelMode === 'main' ? 0 : panelMode === 'additional' ? 1 : 2
  const displayStepNumber = card?.final
    ? visibleStepTotal
    : Math.min(cardIndex * 3 + panelStepOffset + 1, visibleStepTotal)
  const progressActiveIndex = card?.final
    ? Math.max(0, visibleCardTotal - 1)
    : Math.max(0, Math.min(cardIndex, visibleCardTotal - 1))
  const audioUrl = card?.title ? findAudioForTitle(card.title) : null;
  const hasAudio = Boolean(audioUrl);
  const normalizedCardTitle = normalizeText(card?.title ?? '')
  const matchedAdditionalSection = ADDITIONAL_SECTIONS.find(section => {
    const normalizedSectionTitle = normalizeText(section.title)
    return normalizedSectionTitle.includes(normalizedCardTitle) || normalizedCardTitle.includes(normalizedSectionTitle)
  })
  const currentAdditionalContent = matchedAdditionalSection?.body || card.additional || ''

  const dockItems = [
    { icon: <FileText className="w-5 h-5" />, label: 'Help', onClick: () => alert('Open help') },
    { icon: viewMode === 'card' ? <LayoutGrid className="w-5 h-5" /> : <Layers className="w-5 h-5" />, label: viewMode === 'card' ? 'Web' : 'Card', onClick: () => { sfxClick(); setViewMode(prev => prev === 'card' ? 'web' : 'card'); }, isActive: viewMode === 'web' },
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handleBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cardIndex, panelMode])

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

  return (
    <div className={`night-transition min-h-screen bg-[radial-gradient(circle_at_top_right,_#FAFBF8_0%,_#D9D6D5_100%)] dark:bg-[radial-gradient(circle_at_top_right,_#020F10_0%,_#010808_100%)] text-[#1F1C1B] dark:text-[#FAFBF8] font-body p-4 md:p-8 flex items-center justify-center relative overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
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
              <FileText className="w-4 h-4" /> CMS-485 Designer
            </p>
            <p className="font-heading text-[2.7225rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8] tracking-tight" aria-live="polite" aria-label={`Step ${displayStepNumber} of ${visibleStepTotal}`}>
              {displayStepNumber} <span className="text-[#747474] dark:text-[#D9D6D5] text-[1.815rem]">/ {visibleStepTotal}</span>
            </p>
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
                <h1 className="font-heading text-[2.7225rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8] -translate-y-[1px] hover:-translate-y-[2px] transition-transform duration-300">Course Complete</h1>
                <p className="text-[#524048] dark:text-[#D9D6D5] max-w-md text-[1.3613rem] font-light -translate-y-[1px] hover:-translate-y-[2px] transition-transform duration-300">
                  You have successfully completed the sample flow. Excellent work mastering the CMS-485 foundations.
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
      /* ═══════════════════════════════════════════════════════ */
      /*  WEB VIEW — scrollable full-page documentation layout */
      /* ═══════════════════════════════════════════════════════ */
      <div className="w-full max-w-[960px] relative z-10 py-8">
        {/* Web view header */}
        <header className="mb-12 flex justify-between items-end">
          <div>
            <p className="text-[#007970] dark:text-[#64F4F5] font-bold text-[1.059rem] tracking-widest uppercase mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> CMS-485 Designer
            </p>
            <h1 className="font-heading text-[2.7225rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8] tracking-tight leading-tight">
              Course Overview
            </h1>
            <p className="text-[#747474] dark:text-[#D9D6D5] text-[1.1rem] mt-2">{cards.filter(c => !(c as any).final).length} modules &middot; Web View</p>
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

        {/* Module cards */}
        <div className="space-y-10">
          {cards.filter(c => !(c as any).final).map((webCard: any, idx: number) => {
            const matchedSection = ADDITIONAL_SECTIONS.find(section => {
              const normSection = normalizeText(section.title)
              const normCard = normalizeText(webCard.title ?? '')
              return normSection.includes(normCard) || normCard.includes(normSection)
            })
            const additionalBody = matchedSection?.body || webCard.additional || ''

            return (
              <motion.article
                key={idx}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: 'easeOut' }}
                className="bg-white/0 dark:bg-[#020F10]/40 backdrop-blur-xl rounded-[28px] border-l-[4.3px] border-l-[#C74601] shadow-[0_12px_40px_rgba(31,28,27,0.08)] dark:shadow-[0_12px_40px_rgba(0,10,10,0.5)] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_rgba(31,28,27,0.16)] dark:hover:shadow-[0_20px_60px_rgba(0,10,10,0.65)]"
              >
                {/* Module header */}
                <div className="px-8 pt-7 pb-4 border-b border-[#E5E4E3]/50 dark:border-[#07282A]/60">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[#C74601] dark:text-[#E56E2E] text-[0.85rem] font-bold tracking-widest uppercase">
                      {webCard.section}
                    </p>
                    <span className="text-[#D9D6D5] dark:text-[#07282A] text-[0.8rem] font-bold tracking-widest">MODULE {idx + 1}</span>
                  </div>
                  <h2 className="font-heading text-[1.6rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8] leading-snug">
                    {webCard.title}
                  </h2>
                </div>

                {/* Content body */}
                <div className="px-8 py-6 space-y-6">
                  {/* Objective */}
                  <div className="border-l-[3px] border-l-[#007970] dark:border-l-[#64F4F5] pl-5 py-1">
                    <h3 className="text-[#007970] dark:text-[#64F4F5] font-heading font-bold text-[0.95rem] uppercase tracking-widest mb-1">Learning Objective</h3>
                    <p className="text-[#1F1C1B] dark:text-[#FAFBF8] text-[1.1rem] leading-relaxed">{webCard.objective}</p>
                  </div>

                  {/* Key Points + Clinical Lens side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="border-l-[3px] border-l-[#524048] dark:border-l-[#64F4F5] pl-5 py-1">
                      <h3 className="text-[#747474] dark:text-[#D9D6D5] font-heading font-bold text-[0.85rem] uppercase tracking-widest mb-3">Key Points</h3>
                      <ul className="space-y-2 list-none">
                        {webCard.bullets.map((b: string, bi: number) => (
                          <li key={bi} className="text-[#524048] dark:text-[#FAFBF8] text-[1.02rem] leading-relaxed">{b}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="border-l-[3px] border-l-[#C74601] dark:border-l-[#E56E2E] pl-5 py-1">
                      <h3 className="text-[#C74601] dark:text-[#E56E2E] font-heading font-bold text-[0.85rem] uppercase tracking-widest mb-3">Clinical Lens</h3>
                      <p className="text-[#1F1C1B] dark:text-[#FAFBF8] text-[1.02rem] leading-relaxed">Translate this concept into clear, patient-specific, defensible documentation language.</p>
                    </div>
                  </div>

                  {/* Additional content (collapsed) */}
                  {additionalBody && (
                    <details className="group">
                      <summary className="cursor-pointer text-[#007970] dark:text-[#64F4F5] font-bold text-[0.9rem] tracking-widest uppercase flex items-center gap-2 select-none hover:text-[#005E57] dark:hover:text-[#C4F4F5] transition-colors">
                        <span className="inline-block transition-transform duration-200 group-open:rotate-90">&rsaquo;</span>
                        Additional Content
                      </summary>
                      <div className="mt-3 pl-4 border-l-[2px] border-l-[#E5E4E3] dark:border-l-[#07282A]">
                        <p className="text-[#524048] dark:text-[#D9D6D5] text-[1rem] leading-relaxed whitespace-pre-line">{additionalBody}</p>
                      </div>
                    </details>
                  )}

                  {/* Challenge */}
                  <details className="group">
                    <summary className="cursor-pointer text-[#C74601] dark:text-[#E56E2E] font-bold text-[0.9rem] tracking-widest uppercase flex items-center gap-2 select-none hover:text-[#E56E2E] dark:hover:text-[#FFD5BF] transition-colors">
                      <span className="inline-block transition-transform duration-200 group-open:rotate-90">&rsaquo;</span>
                      Knowledge Check
                    </summary>
                    <div className="mt-4 space-y-2">
                      {webCard.challenge.map((opt: ChallengeOption, oi: number) => {
                        const wKey = idx
                        const wSelected = (selectedAnswers[wKey] ?? null) === oi
                        const wSubmitted = Boolean(submittedAnswers[wKey])
                        const wCorrect = wSubmitted && wSelected && (() => { const sel = selectedAnswers[wKey]; const opts = webCard.challenge as ChallengeOption[]; return sel !== undefined && sel !== null && opts?.[sel]?.isCorrect === true; })()
                        const wWrong = wSubmitted && wSelected && !wCorrect

                        return (
                          <button
                            key={oi}
                            disabled={wSubmitted}
                            onClick={() => { sfxClick(); setSelectedAnswers(prev => ({ ...prev, [wKey]: oi })); }}
                            className={`w-full text-left px-4 py-3 rounded-[12px] transition-all duration-200 flex items-start gap-3 border-l-[3px] ${
                              wCorrect ? 'border-l-[#00BFB4] bg-[#E5FEFF]/40 dark:bg-[#004142]/20' :
                              wWrong ? 'border-l-[#D70101] bg-[#FBE6E6]/30 dark:bg-[#3D0000]/20' :
                              wSelected ? 'border-l-[#00BFB4] bg-[#E5FEFF]/20 dark:bg-[#004142]/10' :
                              'border-l-[#E5E4E3] dark:border-l-[#07282A] hover:border-l-[#007970] dark:hover:border-l-[#64F4F5] hover:bg-white/30 dark:hover:bg-white/[0.03]'
                            }`}
                          >
                            <div className="mt-0.5 w-4 h-4 flex-shrink-0 flex items-center justify-center">
                              {wCorrect && <CheckCircle2 className="w-4 h-4 text-[#007970] dark:text-[#64F4F5]" />}
                              {wWrong && <XCircle className="w-4 h-4 text-[#D70101] dark:text-[#FBE6E6]" />}
                            </div>
                            <span className={`text-[1rem] leading-relaxed ${
                              wCorrect ? 'text-[#004142] dark:text-[#C4F4F5] font-semibold' :
                              wWrong ? 'text-[#D70101] dark:text-[#FBE6E6]' :
                              wSelected ? 'text-[#1F1C1B] dark:text-[#FAFBF8] font-medium' :
                              'text-[#524048] dark:text-[#D9D6D5]'
                            }`}>{opt.text}</span>
                          </button>
                        )
                      })}
                      <div className="flex items-center gap-4 mt-3">
                        <button
                          onClick={() => { sfxClick(); setSubmittedAnswers(prev => ({ ...prev, [idx]: true })); }}
                          disabled={Boolean(submittedAnswers[idx]) || selectedAnswers[idx] === undefined || selectedAnswers[idx] === null}
                          className={`px-5 py-2 rounded-[10px] text-[0.95rem] font-bold tracking-wide transition-all duration-200 ${
                            !submittedAnswers[idx] && selectedAnswers[idx] !== undefined && selectedAnswers[idx] !== null
                              ? 'bg-[#C74601] text-white hover:bg-[#E56E2E] glow-orange hover:-translate-y-0.5'
                              : 'bg-[#E5E4E3] dark:bg-[#07282A] text-[#747474] dark:text-[#D9D6D5] cursor-not-allowed'
                          }`}
                        >Submit</button>
                        {submittedAnswers[idx] && (
                          <span className={`text-[0.95rem] font-bold flex items-center gap-1.5 ${
                            (() => { const sel = selectedAnswers[idx]; const opts = webCard.challenge as ChallengeOption[]; return sel !== undefined && sel !== null && opts?.[sel]?.isCorrect === true; })() ? 'text-[#007970] dark:text-[#64F4F5]' : 'text-[#D70101] dark:text-[#FBE6E6]'
                          }`}>
                            {(() => { const sel = selectedAnswers[idx]; const opts = webCard.challenge as ChallengeOption[]; return sel !== undefined && sel !== null && opts?.[sel]?.isCorrect === true; })() ? <><CheckCircle2 className="w-4 h-4"/> Correct</> : <><XCircle className="w-4 h-4"/> Incorrect</>}
                          </span>
                        )}
                      </div>
                    </div>
                  </details>
                </div>
              </motion.article>
            )
          })}
        </div>

        {/* Completion footer */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: cards.filter(c => !(c as any).final).length * 0.08 + 0.1 }}
          className="mt-16 mb-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#E5FEFF] dark:bg-[#004142] flex items-center justify-center glow-teal mx-auto mb-4">
            <Check className="w-8 h-8 text-[#007970] dark:text-[#64F4F5]" />
          </div>
          <h2 className="font-heading text-[1.6rem] font-bold text-[#1F1C1B] dark:text-[#FAFBF8]">End of Modules</h2>
          <p className="text-[#747474] dark:text-[#D9D6D5] text-[1.05rem] mt-2">Review any section above or switch to Card View for guided navigation.</p>
        </motion.div>
      </div>
      )}
      {/* Dock (center-left) */}
      <Dock items={dockItems} position="center-left" isDarkMode={isDarkMode} />
    </div>
  );
}
