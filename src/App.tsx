import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { ArrowLeft, ArrowRight, Lock, Volume2 } from 'lucide-react'
import { CardFlowLayout } from './components/CardFlowLayout'
import { RevealSection } from './components/RevealSection'
import { Button } from './components/ui/Button'
import { Card } from './components/ui/Card'
import { PlanOfCareFocusPanel } from './components/PlanOfCareFocusPanel'
import titleMedia from './assets/CI Home Health Logo_White.png'
import coverBanner from './assets/CMS-485 LMS Banner.png'
import objectiveNarration from './assets/happy excited bay area man 2.wav'
import { TRAINING_CARDS } from './data/trainingCards'
import { CARD_METADATA } from './data/cardMetadata'

const ANIMATION_MS = 320
const COVER_ZOOM_MS = 180
const PROGRESS_STORAGE_KEY = 'cms485.course.progress.v1'

type CardItem = {
  title: string
  content: ReactElement | null
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
          <Button onClick={onView} className="px-8 py-3 text-base">
          Start Learning
          </Button>
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
        <h2 className="mb-8 text-center text-3xl font-bold">Start Learning</h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((item, index) => (
            (() => {
              const isUnlocked = index === 0
              const displayTitle = index === 0 ? 'Complete Course' : item.title

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
}: (typeof TRAINING_CARDS)[number] & {
  pocFocus?: {
    boxes: string[]
    context: string
  }
}) => {
  const objectiveAudioRef = useRef<HTMLAudioElement | null>(null)
  const [isObjectiveAudioPlaying, setIsObjectiveAudioPlaying] = useState(false)
  const [objectiveAudioSource, setObjectiveAudioSource] = useState<'none' | 'recording' | 'blocked'>('none')
  const [isPocPanelExpanded, setIsPocPanelExpanded] = useState(false)

  const handleObjectiveClick = () => {
    setIsObjectiveAudioPlaying(true)

    const fallbackAudio = objectiveAudioRef.current
    if (!fallbackAudio) {
      setObjectiveAudioSource('blocked')
      setIsObjectiveAudioPlaying(false)
      return
    }

    fallbackAudio.pause()
    fallbackAudio.currentTime = 0
    fallbackAudio.muted = false
    fallbackAudio.volume = 1
    fallbackAudio
      .play()
      .then(() => {
        setObjectiveAudioSource('recording')
        setIsObjectiveAudioPlaying(true)
      })
      .catch(() => {
        setObjectiveAudioSource('blocked')
        setIsObjectiveAudioPlaying(false)
      })
  }

  return (
    <section className="space-y-6">
      <RevealSection>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-goldDark">{section}</p>
        <h2 className="text-2xl font-bold text-brand-navy">{title}</h2>
      </RevealSection>

      <RevealSection delayMs={80}>
        <Card onClick={handleObjectiveClick} className="cursor-pointer">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-brand-navy">Learning Objective</h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-brand-goldDark">
              <Volume2 className={`h-4 w-4 ${isObjectiveAudioPlaying ? 'animate-pulse' : ''}`} />
              {isObjectiveAudioPlaying
                ? objectiveAudioSource === 'recording'
                  ? 'Recording'
                  : 'Playing'
                : objectiveAudioSource === 'blocked'
                  ? 'Audio Blocked'
                  : 'Click to Play'}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-brand-darkGray">{objective}</p>
          <audio
            ref={objectiveAudioRef}
            src={objectiveNarration}
            preload="auto"
            muted={false}
            onEnded={() => setIsObjectiveAudioPlaying(false)}
            onPause={() => setIsObjectiveAudioPlaying(false)}
          />
        </Card>
      </RevealSection>

      <div className="grid gap-4 md:grid-cols-2">
        <RevealSection delayMs={120}>
          <Card>
            <h3 className="mb-3 text-lg font-semibold text-brand-navy">Key Points</h3>
            <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-brand-darkGray">
              {bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </RevealSection>

        <RevealSection delayMs={170}>
          <Card className="h-full">
            <h3 className="mb-3 text-lg font-semibold text-brand-navy">Clinical Lens</h3>
            <p className="text-sm leading-relaxed text-brand-darkGray">
              Translate this concept into documentation language that is clear, patient-specific, and traceable across certification, orders, and visit notes.
            </p>
          </Card>
        </RevealSection>
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

const ChallengeSection = ({
  title,
  section,
  objective,
  bullets,
}: (typeof TRAINING_CARDS)[number]) => {
  const [selectedChallengeIndex, setSelectedChallengeIndex] = useState<number | null>(null)
  const challengeOptions = useMemo(() => getChallengeOptions(bullets, objective), [bullets, objective])

  useEffect(() => {
    setSelectedChallengeIndex(null)
  }, [title])

  return (
    <section className="flex min-h-[640px] items-center justify-center">
      <RevealSection className="w-full" delayMs={80}>
        <Card className="mx-auto w-full max-w-3xl">
          <div className="flex min-h-[360px] w-full flex-col items-center justify-center text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-goldDark">{section}</p>
            <h3 className="mb-3 text-xl font-semibold text-brand-navy">{title} · Challenge Question</h3>
            <p className="mb-5 max-w-2xl text-sm leading-relaxed text-brand-darkGray">
              Which response best aligns with this card objective?
            </p>

            <div className="w-full max-w-2xl space-y-3">
              {challengeOptions.map((option, index) => {
                const isSelected = selectedChallengeIndex === index
                const isCorrect = index === 0

                return (
                  <button
                    key={`${title}-challenge-${index}`}
                    type="button"
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
                {selectedChallengeIndex === 0
                  ? 'Correct — this aligns with the card objective.'
                  : 'Try again — focus on the documentation-defensible action.'}
              </p>
            )}
          </div>
        </Card>
      </RevealSection>
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
      ...TRAINING_CARDS.flatMap((card) => {
        const metadata = metadataByTitle.get(card.title)

        return [
          {
            title: card.title,
            content: (
              <TrainingSection
                {...card}
                pocFocus={metadata?.pocFocus}
              />
            ),
          },
          {
            title: `${card.title} · Challenge`,
            content: <ChallengeSection {...card} />,
          },
        ]
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
  const touchStartXRef = useRef<number | null>(null)

  const currentIsTrainingCard = currentIndex > 0 && currentIndex < cards.length - 1
  const canAdvanceFromCurrent = isQaMode || !currentIsTrainingCard || viewedCardIndexes.has(currentIndex)

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

    if (currentIndex < cards.length - 1) {
      goTo(currentIndex + 1, 'next')
    }
  }

  const goPrev = () => {
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
          <div className="text-sm font-semibold text-brand-darkGray">
            {currentIndex + 1} / {cards.length}
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
            {cards[previousIndex].content}
          </div>
        )}

        <div
          className={`relative swipe-card ${
            isAnimating ? (direction === 'next' ? 'swipe-in-right' : 'swipe-in-left') : ''
          }`}
        >
          {currentIndex === 0 && showReportGrid ? (
            <ReportGridCard items={cards.slice(1)} onSelect={(index) => handleReportSelect(index + 1)} className="zoom-enter" />
          ) : currentIndex === 0 ? (
            <TitleCard onView={handleViewFromCover} className={isCoverZoomingOut ? 'zoom-exit' : ''} />
          ) : currentIndex === cards.length - 1 ? (
            <EndCard />
          ) : (
            cards[currentIndex].content
          )}
        </div>
      </div>

      {currentIndex > 0 && currentIndex < cards.length - 1 && (
        <div className="mt-6 grid grid-cols-3 items-center">
          <Button variant="ghost" onClick={goPrev} className="justify-self-start">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-rotate-12" />
            Back
          </Button>

          <div className="justify-self-center">
            <img
              src="https://demo.findahomecare.com/wp-content/uploads/2025/10/FIndaHomeCare-Logo.png"
              alt="FindAHomeCare logo"
              className="h-[120px] w-auto object-contain"
            />
          </div>

          <Button
            variant="secondary"
            onClick={goNext}
            className={`justify-self-end ${!canAdvanceFromCurrent ? 'opacity-95' : ''} ${isNextLockedFeedback ? 'lock-shake' : ''}`}
          >
            {!canAdvanceFromCurrent ? (
              <>
                <Lock className="h-4 w-4" />
                Next
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 transition-transform group-hover:rotate-12" />
              </>
            )}
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
