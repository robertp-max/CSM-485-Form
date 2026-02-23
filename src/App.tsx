import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { ArrowLeft, ArrowRight, Lock, Pause, Play, RotateCcw, Square } from 'lucide-react'
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
const PROGRESS_STORAGE_KEY = 'cms485.course.progress.v1'

type PanelMode = 'main' | 'additional' | 'challenge'

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

const TitleCard = ({ onView, className }: { onView: () => void; className?: string }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className ?? ''}`}>
      <div className="relative mx-auto flex min-h-[640px] w-full max-w-5xl items-end justify-center">
        <img
          src={coverBanner}
          alt="CMS-485 LMS banner"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="relative z-10 mb-8">
          <p id="start-learning-desc" className="sr-only">
            Opens the module selection screen.
          </p>
          <button
            type="button"
            onClick={onView}
            aria-label="Start Learning"
            aria-describedby="start-learning-desc"
            className="rounded-md border border-brand-goldDark bg-brand-gold px-8 py-3 text-base font-semibold uppercase tracking-wide text-brand-navyDark shadow-[0_8px_16px_rgba(27,38,59,0.2)] transition-colors hover:bg-brand-goldLight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navyDark"
          >
            Start Learning
          </button>
        </div>
      </div>
    </div>
  )
}

const ReportGridCard = ({
  items,
  onSelect,
  className,
}: {
  items: CardItem[]
  onSelect: (index: number) => void
  className?: string
}) => {
  return (
    <div className={`step-fade-slide flex min-h-[640px] items-center justify-center ${className ?? ''}`}>
      <div className="w-full max-w-4xl rounded-2xl bg-brand-navyDark px-8 py-10 text-white shadow-xl">
        <h2 className="mb-8 text-center text-3xl font-bold">Continue where you left off</h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((item, index) => (
            (() => {
              const isUnlocked = index === 0
              const displayTitle = index === 0 ? 'What CMS-485 Is and Why It Matters' : item.title

              return (
            <button
              key={`${index + 1}-${item.title}`}
              onClick={() => {
                if (isUnlocked) {
                  onSelect(index)
                }
              }}
              disabled={!isUnlocked}
              className={`group rounded-lg border p-4 text-left transition-all ${
                isUnlocked
                  ? 'border-white/20 bg-white/10 hover:-translate-y-1 hover:bg-white/20'
                  : 'cursor-not-allowed border-white/10 bg-white/5 opacity-65'
              }`}
            >
              <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold text-sm font-bold text-brand-navyDark transition-transform group-hover:scale-110">
                {isUnlocked ? index + 1 : <Lock className="h-3.5 w-3.5" />}
              </div>
              <div className="text-sm font-semibold leading-snug">{displayTitle}</div>
            </button>
              )
            })()
          ))}
        </div>
      </div>
    </div>
  )
}

const EndCard = () => {
  return (
    <div className="flex min-h-[640px] items-center justify-center">
      <div className="w-full max-w-3xl rounded-2xl bg-brand-navyDark px-8 py-14 text-center text-white shadow-xl">
        <img src={titleMedia} alt="CI Home Health logo" className="mx-auto mb-6 h-14 w-auto object-contain" />
        <p className="mx-auto mt-5 max-w-2xl text-sm text-brand-navyLight md:text-base">
          You have completed the CMS-485 core training deck. Review any card again as needed before implementation.
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
  pocFocus,
  panelMode,
  previousPanelMode,
  isPanelAnimating,
  panelTransitionDirection,
  additionalContent,
  isChallengeUnlocked,
  manageFocus,
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
  isChallengeUnlocked: boolean
  manageFocus: boolean
}) => {
  const [isPocPanelExpanded, setIsPocPanelExpanded] = useState(false)
  const [selectedChallengeIndex, setSelectedChallengeIndex] = useState<number | null>(null)
  const additionalPanelRef = useRef<HTMLDivElement | null>(null)
  const challengeFirstOptionRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    setSelectedChallengeIndex(null)
  }, [title, panelMode])

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
    }
  }, [manageFocus, panelMode])

  const defaultInsightPanels = (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <h3 className="mb-3 text-lg font-semibold text-brand-navy">Key Points</h3>
        <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-brand-darkGray">
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>

      <Card className="h-full">
        <h3 className="mb-3 text-lg font-semibold text-brand-navy">Clinical Lens</h3>
        <p className="text-sm leading-relaxed text-brand-darkGray">
          Translate this concept into documentation language that is clear, patient-specific, and traceable across certification, orders, and visit notes.
        </p>
      </Card>
    </div>
  )

  const challengePanel = (
    <Card className="h-full">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-goldDark">{section}</p>
      <h3 className="mb-3 text-xl font-semibold text-brand-navy">{title} · Challenge Question</h3>
      <p className="mb-5 max-w-2xl text-sm leading-relaxed text-brand-darkGray">Which response best aligns with this card objective?</p>

      <div className="w-full max-w-2xl space-y-3">
        {getChallengeOptions(bullets, objective).map((option, index) => {
          const isSelected = selectedChallengeIndex === index
          const isCorrect = index === 0

          return (
            <button
              key={`${title}-challenge-${index}`}
              type="button"
              ref={index === 0 ? challengeFirstOptionRef : undefined}
              onClick={() => setSelectedChallengeIndex(index)}
              className={`w-full rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                isSelected
                  ? isCorrect
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-rose-400 bg-rose-50 text-rose-800'
                  : 'border-brand-navyLight bg-white text-brand-darkGray hover:bg-brand-sky/30'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>

      {selectedChallengeIndex !== null && (
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-navy">
          {selectedChallengeIndex === 0 ? 'Correct — this aligns with the card objective.' : 'Try again — focus on the documentation-defensible action.'}
        </p>
      )}

      {!isChallengeUnlocked && (
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-darkGray">
          Complete audio playback at least once to unlock challenge mode.
        </p>
      )}
    </Card>
  )

  const additionalPanel = (
    <div ref={additionalPanelRef} tabIndex={-1}>
      <Card className="h-full">
        <h3 className="mb-3 text-lg font-semibold text-brand-navy">Additional Subject Content</h3>
        <p className="text-sm leading-relaxed text-brand-darkGray">
          {additionalContent ?? 'Additional narrated content is not available yet for this card.'}
        </p>
      </Card>
    </div>
  )

  const renderPanel = (mode: PanelMode) => {
    if (mode === 'challenge') {
      return challengePanel
    }

    if (mode === 'additional') {
      return additionalPanel
    }

    return defaultInsightPanels
  }

  return (
    <section className="space-y-6">
      <RevealSection>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-goldDark">{section}</p>
        <h2 className="text-2xl font-bold text-brand-navy">{title}</h2>
      </RevealSection>

      <RevealSection delayMs={80}>
        <Card>
          <h3 className="mb-3 text-lg font-semibold text-brand-navy">Learning Objective</h3>
          <p className="text-sm leading-relaxed text-brand-darkGray">{objective}</p>
        </Card>
      </RevealSection>

      <div className="relative min-h-[240px]">
        {isPanelAnimating && previousPanelMode !== null && previousPanelMode !== panelMode && (
          <div className={`absolute inset-0 swipe-card ${panelTransitionDirection === 'next' ? 'swipe-out-left' : 'swipe-out-right'}`}>
            {renderPanel(previousPanelMode)}
          </div>
        )}

        <div
          className={`swipe-card ${
            isPanelAnimating && previousPanelMode !== null && previousPanelMode !== panelMode
              ? panelTransitionDirection === 'next'
                ? 'swipe-in-right'
                : 'swipe-in-left'
              : ''
          }`}
        >
          {renderPanel(panelMode)}
        </div>
      </div>

      {pocFocus && (
        <RevealSection delayMs={220}>
          <PlanOfCareFocusPanel
            focus={pocFocus}
            isExpanded={isPocPanelExpanded}
            onToggle={() => setIsPocPanelExpanded((previous) => !previous)}
          />
        </RevealSection>
      )}
    </section>
  )
}

const FlowCards = () => {
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
  const [isQaMode, setIsQaMode] = useState(false)
  const [viewedCardIndexes, setViewedCardIndexes] = useState<Set<number>>(() => new Set([0]))
  const [isNextLockedFeedback, setIsNextLockedFeedback] = useState(false)
  const [audioModeForTitle, setAudioModeForTitle] = useState<string | null>(null)
  const [challengeModeForTitle, setChallengeModeForTitle] = useState<string | null>(null)
  const [audioPlaybackState, setAudioPlaybackState] = useState<'idle' | 'playing' | 'paused'>('idle')
  const [audioCompletedTitles, setAudioCompletedTitles] = useState<Set<string>>(() => new Set())
  const [isPanelAnimating, setIsPanelAnimating] = useState(false)
  const [panelTransitionDirection, setPanelTransitionDirection] = useState<'next' | 'prev'>('next')
  const [previousPanelMode, setPreviousPanelMode] = useState<PanelMode | null>(null)
  const [liveStatus, setLiveStatus] = useState('')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const touchStartXRef = useRef<number | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  const currentIsTrainingCard = currentIndex > 0 && currentIndex < cards.length - 1
  const canAdvanceFromCurrent = isQaMode || !currentIsTrainingCard || viewedCardIndexes.has(currentIndex)
  const currentCardTitle = cards[currentIndex]?.title ?? ''
  const currentVoiceRecording = currentIsTrainingCard ? VOICE_RECORDING_BY_TITLE.get(currentCardTitle) ?? null : null
  const isChallengeUnlocked = audioCompletedTitles.has(currentCardTitle)

  const getPanelModeForTitle = (title: string): PanelMode => {
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

    if (currentIsTrainingCard) {
      if (currentPanelMode === 'main') {
        handleAudioPlayClick()
        return
      }

      if (currentPanelMode === 'additional') {
        handleChallengeClick()
        return
      }
    }

    if (currentIndex < cards.length - 1) {
      goTo(currentIndex + 1, 'next')
    }
  }

  const goPrev = () => {
    if (currentIsTrainingCard) {
      if (currentPanelMode === 'challenge') {
        transitionPanel('additional', 'prev')
        return
      }

      if (currentPanelMode === 'additional') {
        transitionPanel('main', 'prev')
        return
      }
    }

    if (currentIndex > 0) {
      goTo(currentIndex - 1, 'prev')
    }
  }

  const handleReportSelect = (nextIndex: number) => {
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
        return <ReportGridCard items={cards.slice(1)} onSelect={(itemIndex) => handleReportSelect(itemIndex + 1)} className="zoom-enter" />
      }

      return <TitleCard onView={handleViewFromCover} className={isCoverZoomingOut ? 'zoom-exit' : ''} />
    }

    if (index === cards.length - 1) {
      return <EndCard />
    }

    const card = TRAINING_CARDS[index - 1]
    const metadata = metadataByTitle.get(card.title)
    const isCurrentCard = index === currentIndex
    const panelModeForCard = getPanelModeForTitle(card.title)
    const additionalContentForCard = getAdditionalContentForTitle(card.title)

    return (
      <TrainingSection
        {...card}
        pocFocus={metadata?.pocFocus}
        panelMode={panelModeForCard}
        previousPanelMode={isCurrentCard ? previousPanelMode : null}
        isPanelAnimating={isCurrentCard && isPanelAnimating}
        panelTransitionDirection={panelTransitionDirection}
        additionalContent={additionalContentForCard}
        isChallengeUnlocked={audioCompletedTitles.has(card.title)}
        manageFocus={isCurrentCard}
      />
    )
  }

  return (
    <section
      className={`mx-auto w-full max-w-5xl rounded-xl ${
        currentIndex === 0 || currentIndex === cards.length - 1 ? 'bg-transparent p-0 shadow-none' : 'bg-white p-4 shadow-sm md:p-6'
      }`}
    >
      <button
        type="button"
        onClick={() => setIsQaMode((previous) => !previous)}
        className="fixed right-4 top-4 z-40 rounded-md border border-brand-navyLight bg-white/95 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-brand-navy shadow-sm backdrop-blur hover:bg-white"
      >
        QA: {isQaMode ? 'On' : 'Off'}
      </button>

      {currentIndex > 0 && currentIndex < cards.length - 1 && (
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={headerLogoGray}
              alt="CI Home Health logo"
              className="h-8 w-auto object-contain"
            />
            <div className="text-base font-bold tracking-wide text-brand-navy">
              {currentIndex + 1} / {cards.length}
            </div>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {cards.map((item, index) => {
              if (index === 0) {
                return null
              }
              const isActive = index === currentIndex
              return (
                <button
                  key={item.title}
                  onClick={() => goTo(index, index > currentIndex ? 'next' : 'prev')}
                  className={`h-2 rounded-full transition-all ${isActive ? 'nav-glow-active w-6 bg-brand-gold' : 'w-2 bg-brand-navyLight hover:w-4'}`}
                  aria-label={`Go to ${item.title}`}
                />
              )
            })}
          </div>
        </div>
      )}

      <div
        className="relative min-h-[640px] overflow-hidden"
        onTouchStart={(event) => {
          touchStartXRef.current = event.changedTouches[0].clientX
        }}
        onTouchEnd={(event) => {
          if (touchStartXRef.current === null) {
            return
          }
          const diff = event.changedTouches[0].clientX - touchStartXRef.current
          if (Math.abs(diff) < 40) {
            return
          }
          if (diff < 0) {
            goNext()
          } else {
            goPrev()
          }
          touchStartXRef.current = null
        }}
      >
        {previousIndex !== null && (
          <div
            className={`absolute inset-0 swipe-card ${
              direction === 'next' ? 'swipe-out-left' : 'swipe-out-right'
            }`}
          >
            {renderCardContent(previousIndex)}
          </div>
        )}

        <div
          className={`relative swipe-card ${
            isAnimating ? (direction === 'next' ? 'swipe-in-right' : 'swipe-in-left') : ''
          }`}
        >
          {renderCardContent(currentIndex)}
        </div>
      </div>

      {currentIsTrainingCard && (
        <div className="mt-6 grid grid-cols-3 items-center">
          <Button variant="ghost" onClick={goPrev} className="justify-self-start">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-rotate-12" />
            Back
          </Button>

          <div className="justify-self-center text-center">
            {currentPanelMode === 'main' ? (
              <Button variant="ghost" onClick={handleAudioPlayClick} className="px-4 py-2 text-xs" disabled={!currentIsTrainingCard}>
                <Play className="h-4 w-4" />
                PLAY
              </Button>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button variant="ghost" onClick={handleAudioPauseClick} className="px-3 py-2 text-xs">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
                <Button variant="ghost" onClick={handleAudioStopClick} className="px-3 py-2 text-xs">
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
                <Button variant="ghost" onClick={handleAudioRestartClick} className="px-3 py-2 text-xs">
                  <RotateCcw className="h-4 w-4" />
                  Restart
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleChallengeClick}
                  className={`px-3 py-2 text-xs ${!isChallengeUnlocked ? 'opacity-95' : ''} ${isNextLockedFeedback ? 'lock-shake' : ''}`}
                  aria-disabled={!isChallengeUnlocked}
                >
                  {!isChallengeUnlocked && <Lock className="h-4 w-4" />}
                  Challenge
                </Button>
              </div>
            )}

            {currentIsTrainingCard && (
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-brand-darkGray" aria-live="polite">
                {liveStatus || getAudioStatusLabel()}
              </p>
            )}

            <audio
              ref={audioElementRef}
              src={currentVoiceRecording ?? undefined}
              preload="auto"
              onEnded={() => {
                setAudioPlaybackState('idle')
                setAudioCompletedTitles((previous) => {
                  const updated = new Set(previous)
                  updated.add(currentCardTitle)
                  return updated
                })
                setLiveStatus('Challenge unlocked.')
              }}
              onPause={() => {
                if (audioPlaybackState === 'playing') {
                  setAudioPlaybackState('paused')
                }
              }}
            />
          </div>

          <Button variant="ghost" onClick={goNext} className={`justify-self-end ${isNextLockedFeedback ? 'lock-shake' : ''}`}>
            Next
            <ArrowRight className="h-4 w-4 transition-transform group-hover:rotate-12" />
          </Button>
        </div>
      )}
    </section>
  )
}

function App() {
  return (
    <CardFlowLayout>
      <FlowCards />
    </CardFlowLayout>
  )
}

export default App
