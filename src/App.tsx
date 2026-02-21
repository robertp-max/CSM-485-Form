import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { finalExamQuestions, learningCards, sectionLabels, type CardData } from './courseData'
import { glossaryTerms } from './glossary'
import GlossaryTerm from './components/GlossaryTerm'
import NightSky from './components/NightSky'
import SkeletonBlock from './components/SkeletonBlock'
import {
  getCompletionConfigFromQuery,
  getLmsEnvironmentDiagnostics,
  sendTrainingCompletion,
  type CompletionResult,
} from './lmsCompletion'

const LargeVisualization = lazy(() => import('./components/LargeVisualization'))
const AuditorOverlay = lazy(() => import('./components/AuditorOverlay'))
const InteractiveFormExplorer = lazy(() => import('./components/InteractiveFormExplorer'))
const FinalExamSection = lazy(() => import('./components/FinalExamSection'))

type ResumeState = {
  screenIndex: number
  cardAnswers: Record<string, string>
  finalExamAnswers: Record<string, string>
  finalExamSubmitted: boolean
  qaDebugMode: boolean
  knowledgeInputStats: { correct: number; incorrect: number }
  cardModeById: Record<string, 'learner' | 'auditor'>
}

type Hotspot = {
  id: string
  label: string
  description: string
  x: number
  y: number
  w: number
  h: number
}

const RESUME_KEY = 'cms485-course-progress-v3'
const THEME_KEY = 'cms485-theme'
const INTRO_SCREEN_INDEX = -1

const cms485Hotspots: Hotspot[] = [
  { id: 'patient-cert', label: 'Patient + Certification', description: 'Identifiers, SOC, cert period, and timeline consistency.', x: 4, y: 6, w: 42, h: 12 },
  { id: 'diagnosis', label: 'Diagnosis Fields', description: 'Principal/secondary logic and sequencing linkage.', x: 4, y: 21, w: 42, h: 16 },
  { id: 'orders-frequency', label: 'Orders + Frequency', description: 'Discipline specificity, visit intensity, PRN controls.', x: 4, y: 40, w: 42, h: 18 },
  { id: 'functional-safety', label: 'Function + Safety', description: 'Functional limits, safety controls, readmission interventions.', x: 52, y: 21, w: 44, h: 18 },
  { id: 'goals-discharge', label: 'Goals + Discharge', description: 'Measurable outcomes, rehab potential, discharge criteria.', x: 52, y: 42, w: 44, h: 18 },
  { id: 'meds-treatments', label: 'Meds + Treatments', description: 'Medication/treatment details and skilled monitoring trace.', x: 4, y: 63, w: 42, h: 16 },
  { id: 'signature-block', label: 'Signature + Attestation', description: 'Practitioner signature/date and billing hard-stop evidence.', x: 52, y: 63, w: 44, h: 16 },
]

const parseResumeState = (): ResumeState => {
  try {
    const raw = window.localStorage.getItem(RESUME_KEY)
    if (!raw) {
      return {
        screenIndex: INTRO_SCREEN_INDEX,
        cardAnswers: {},
        finalExamAnswers: {},
        finalExamSubmitted: false,
        qaDebugMode: false,
        knowledgeInputStats: { correct: 0, incorrect: 0 },
        cardModeById: {},
      }
    }

    const parsed = JSON.parse(raw) as ResumeState
    return {
      screenIndex: Number.isFinite(parsed.screenIndex) ? parsed.screenIndex : INTRO_SCREEN_INDEX,
      cardAnswers: parsed.cardAnswers ?? {},
      finalExamAnswers: parsed.finalExamAnswers ?? {},
      finalExamSubmitted: parsed.finalExamSubmitted ?? false,
      qaDebugMode: parsed.qaDebugMode ?? false,
      knowledgeInputStats: parsed.knowledgeInputStats ?? { correct: 0, incorrect: 0 },
      cardModeById: parsed.cardModeById ?? {},
    }
  } catch {
    return {
      screenIndex: INTRO_SCREEN_INDEX,
      cardAnswers: {},
      finalExamAnswers: {},
      finalExamSubmitted: false,
      qaDebugMode: false,
      knowledgeInputStats: { correct: 0, incorrect: 0 },
      cardModeById: {},
    }
  }
}

const sectionOrder = Array.from(new Set(learningCards.map((card) => card.section)))

const sectionStartIndices = sectionOrder.map((section) => ({
  section,
  start: learningCards.findIndex((card) => card.section === section),
}))

const sectionByCardId = new Map(learningCards.map((card) => [card.id, card.section]))

function GlossaryText({ text }: { text: string }) {
  const sortedTerms = glossaryTerms

  const parts: Array<{ text: string; term?: string }> = []
  let cursor = 0
  const lower = text.toLowerCase()

  while (cursor < text.length) {
    let foundTerm: string | null = null
    let foundIndex = -1

    for (const term of sortedTerms) {
      const index = lower.indexOf(term.toLowerCase(), cursor)
      if (index !== -1 && (foundIndex === -1 || index < foundIndex)) {
        foundIndex = index
        foundTerm = term
      }
    }

    if (!foundTerm || foundIndex === -1) {
      parts.push({ text: text.slice(cursor) })
      break
    }

    if (foundIndex > cursor) {
      parts.push({ text: text.slice(cursor, foundIndex) })
    }

    parts.push({ text: text.slice(foundIndex, foundIndex + foundTerm.length), term: foundTerm })
    cursor = foundIndex + foundTerm.length
  }

  return (
    <>
      {parts.map((part, index) =>
        part.term ? (
          <GlossaryTerm key={`${part.term}-${index}`} term={part.text} />
        ) : (
          <span key={`text-${index}`}>{part.text}</span>
        ),
      )}
    </>
  )
}

function App() {
  const initial = parseResumeState()

  const [screenIndex, setScreenIndex] = useState(initial.screenIndex)
  const [cardAnswers, setCardAnswers] = useState<Record<string, string>>(initial.cardAnswers)
  const [finalExamAnswers, setFinalExamAnswers] = useState<Record<string, string>>(initial.finalExamAnswers)
  const [finalExamSubmitted, setFinalExamSubmitted] = useState(initial.finalExamSubmitted)
  const [qaDebugMode, setQaDebugMode] = useState(initial.qaDebugMode)
  const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem(THEME_KEY) === 'dark')
  const [knowledgeInputStats, setKnowledgeInputStats] = useState(initial.knowledgeInputStats)
  const [cardModeById, setCardModeById] = useState(initial.cardModeById)
  const [completionMessage, setCompletionMessage] = useState('')
  const [lastCompletionResult, setLastCompletionResult] = useState<CompletionResult | null>(null)

  const [isFormExplorerOpen, setIsFormExplorerOpen] = useState(true)
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null)
  const [pulseGuideOn, setPulseGuideOn] = useState(false)
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})
  const [mappingState, setMappingState] = useState({ risk: '', intervention: '', goal: '' })
  const [templateBuilderByCardId, setTemplateBuilderByCardId] = useState<Record<string, string[]>>({})

  const completionConfig = getCompletionConfigFromQuery()
  const queryParams = new URLSearchParams(window.location.search)
  const isDebugLms = queryParams.get('debugLms') === '1'
  const lmsDiagnostics = getLmsEnvironmentDiagnostics()

  const totalLearningScreens = learningCards.length * 2
  const examScreenIndex = totalLearningScreens
  const missedReviewScreenIndex = totalLearningScreens + 1
  const completionScreenIndex = totalLearningScreens + 2
  const totalScreens = totalLearningScreens + 3

  const inLearningFlow = screenIndex >= 0 && screenIndex < totalLearningScreens
  const currentCard: CardData | null = inLearningFlow ? learningCards[Math.floor(screenIndex / 2)] : null
  const isKnowledgeScreen = inLearningFlow && screenIndex % 2 === 1
  const isContentScreen = inLearningFlow && !isKnowledgeScreen

  const currentCardMode = currentCard ? cardModeById[currentCard.id] ?? 'learner' : 'learner'
  const currentCardSelection = currentCard ? cardAnswers[currentCard.id] ?? '' : ''
  const currentCardCorrect = currentCard ? currentCardSelection === currentCard.knowledgeCheck.correctAnswer : false

  const knowledgeChecksCompleted = Object.keys(cardAnswers).length
  const allKnowledgeChecksCompleted = knowledgeChecksCompleted === learningCards.length

  const finalExamCorrectCount = finalExamQuestions.filter((question) => finalExamAnswers[question.id] === question.correctAnswer).length
  const finalExamScore = Math.round((finalExamCorrectCount / finalExamQuestions.length) * 100)
  const finalExamPassed = finalExamSubmitted && finalExamScore >= 80
  const finalExamFullyAnswered = Object.keys(finalExamAnswers).length === finalExamQuestions.length

  const missedQuestions = finalExamQuestions.filter((question) => finalExamSubmitted && finalExamAnswers[question.id] !== question.correctAnswer)

  const cardToScreen = useMemo(() => {
    const map = new Map<string, number>()
    learningCards.forEach((card, index) => map.set(card.id, index * 2))
    return map
  }, [])

  const totalDuration = useMemo(() => learningCards.reduce((sum, card) => sum + card.coreContent.length + 1, 0) + 12, [])

  const relevantHotspots = useMemo(() => {
    if (!currentCard?.formHotspotIds?.length) {
      return [] as Hotspot[]
    }

    return cms485Hotspots.filter((hotspot) => currentCard.formHotspotIds?.includes(hotspot.id))
  }, [currentCard])

  const canGoNext = qaDebugMode
    ? screenIndex < completionScreenIndex
    : isContentScreen
      ? true
      : isKnowledgeScreen
        ? currentCardCorrect
        : screenIndex === examScreenIndex
          ? finalExamPassed
          : screenIndex < completionScreenIndex

  const canGoPrev = qaDebugMode ? screenIndex > INTRO_SCREEN_INDEX : screenIndex > 0 && !(isKnowledgeScreen && !currentCardCorrect)
  const canCompleteTraining = qaDebugMode ? true : allKnowledgeChecksCompleted && finalExamPassed

  const formExplorerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const payload: ResumeState = {
      screenIndex,
      cardAnswers,
      finalExamAnswers,
      finalExamSubmitted,
      qaDebugMode,
      knowledgeInputStats,
      cardModeById,
    }

    window.localStorage.setItem(RESUME_KEY, JSON.stringify(payload))
  }, [screenIndex, cardAnswers, finalExamAnswers, finalExamSubmitted, qaDebugMode, knowledgeInputStats, cardModeById])

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode)
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    window.localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    if (!relevantHotspots.length) {
      setActiveHotspotId(null)
      return
    }

    setActiveHotspotId(relevantHotspots[0].id)
  }, [currentCard?.id, relevantHotspots.length])

  useEffect(() => {
    if (!isFormExplorerOpen || !relevantHotspots.length) {
      setPulseGuideOn(false)
      return
    }

    const timeout = window.setTimeout(() => setPulseGuideOn(true), 8000)
    return () => window.clearTimeout(timeout)
  }, [isFormExplorerOpen, currentCard?.id, relevantHotspots.length, activeHotspotId])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' && canGoNext && screenIndex < completionScreenIndex) {
        setScreenIndex((prev) => Math.min(prev + 1, completionScreenIndex))
      }

      if (event.key === 'ArrowLeft' && canGoPrev) {
        setScreenIndex((prev) => Math.max(prev - 1, 0))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [canGoNext, canGoPrev, screenIndex, completionScreenIndex])

  const completeTraining = async () => {
    const payload = {
      event: 'training.completed' as const,
      module: 'CMS-485 LMS',
      completedAt: new Date().toISOString(),
      trainingMinutes: totalDuration,
      checkpointsCompleted: knowledgeChecksCompleted,
      challengeScore: finalExamScore,
      challengePassed: finalExamPassed,
      personalizedRecapTopics: [...new Set(missedQuestions.map((item) => sectionLabels[sectionByCardId.get(item.cardId) ?? 'orientation']))],
    }

    try {
      const result = await sendTrainingCompletion(payload, completionConfig)
      setLastCompletionResult(result)
      const anySuccess = result.scorm || result.xapi || result.webhook || result.postMessage
      setCompletionMessage(
        anySuccess
          ? 'Completion recorded. Certificate wording: CMS-aligned / CoP-compliant / audit-ready.'
          : 'Completion attempted but no LMS channel confirmed success. Verify launch settings.',
      )
    } catch {
      setCompletionMessage('Completion could not be sent. Retry or contact LMS admin.')
    }
  }

  const resetProgress = () => {
    setScreenIndex(INTRO_SCREEN_INDEX)
    setCardAnswers({})
    setFinalExamAnswers({})
    setFinalExamSubmitted(false)
    setKnowledgeInputStats({ correct: 0, incorrect: 0 })
    setCompletionMessage('')
    setLastCompletionResult(null)
    setChecklistState({})
    setMappingState({ risk: '', intervention: '', goal: '' })
    window.localStorage.removeItem(RESUME_KEY)
  }

  const jumpToCard = (cardId: string) => {
    const target = cardToScreen.get(cardId)
    if (typeof target === 'number') {
      setScreenIndex(target)
    }
  }

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // noop
    }
  }

  const showFormZone = () => {
    if (!relevantHotspots.length || !formExplorerRef.current) return
    setIsFormExplorerOpen(true)
    setActiveHotspotId(relevantHotspots[0].id)
    setPulseGuideOn(false)
    formExplorerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <main className="app-shell bg-page text-primary animate-fade-in-up">
      {darkMode ? <NightSky /> : null}

      {screenIndex !== INTRO_SCREEN_INDEX ? (
        <>
          <section className="instrument-strip sticky top-0 z-30 rounded-2xl border border-subtle bg-surface p-3 shadow-card backdrop-blur">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-primary">CMS-485 LMS · CMS-aligned / CoP-compliant / audit-ready</p>
              <div className="flex flex-wrap gap-2">
                <span className="stats-chip">Knowledge ✅ {knowledgeInputStats.correct} · ❌ {knowledgeInputStats.incorrect}</span>
                <button type="button" className={`secondary mode-toggle ${qaDebugMode ? 'active' : ''}`} onClick={() => setQaDebugMode((prev) => !prev)}>
                  QA Debug: {qaDebugMode ? 'ON' : 'OFF'}
                </button>
                <button type="button" className={`secondary mode-toggle ${darkMode ? 'active' : ''}`} onClick={() => setDarkMode((prev) => !prev)}>
                  {darkMode ? 'Dark' : 'Light'} Mode
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="progress-track">
                <motion.div
                  className="progress-fill"
                  animate={{ width: `${((screenIndex + 1) / totalScreens) * 100}%` }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                />
              </div>
              <div className="flex flex-wrap gap-1 text-[11px] text-muted">
                {sectionStartIndices.map((item, idx) => {
                  const screenStart = item.start * 2
                  const active = screenIndex >= screenStart && (idx === sectionStartIndices.length - 1 || screenIndex < sectionStartIndices[idx + 1].start * 2)
                  return (
                    <span key={item.section} className={`section-chip ${active ? 'active' : ''}`}>
                      {sectionLabels[item.section]}
                    </span>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="hero-strip mt-3 animate-fade-in-up" aria-label="Training summary">
            <div>
              <p className="hero-kicker">Interactive compliance workflow</p>
              <h2>{totalDuration}+ minute guided flow</h2>
              <p>Screen {screenIndex + 1} of {totalScreens} · Keyboard: ← → · Focus-safe controls</p>
            </div>
          </section>
        </>
      ) : null}

      <AnimatePresence mode="wait">
        <motion.section
          key={screenIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22 }}
          className="training-card mt-3 transition-all duration-300 hover:shadow-xl"
          role="region"
          aria-live="polite"
        >
          {screenIndex === INTRO_SCREEN_INDEX ? (
            <section className="hero-start" aria-label="Course intro">
              <img className="hero-start-image" src="/branding/cms-485-form.svg" alt="CMS-485 Form Training" />
              <div className="hero-start-overlay">
                <p className="hero-start-kicker">Interactive Clinical Simulation</p>
                <h1 className="hero-start-title">CMS-485 Form Training</h1>
                <p className="hero-start-subtitle">Empowering Excellence in Clinical Documentation</p>
                <button type="button" className="hero-start-cta" onClick={() => setScreenIndex(0)}>
                  Begin Simulation
                </button>
              </div>
            </section>
          ) : null}

          {screenIndex !== INTRO_SCREEN_INDEX ? (
            <>
          {currentCard && isContentScreen ? (
            <>
              <div className="card-top-row">
                <span className="badge">{sectionLabels[currentCard.section]}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`secondary mode-toggle ${currentCardMode === 'learner' ? 'active' : ''}`}
                    onClick={() => setCardModeById((prev) => ({ ...prev, [currentCard.id]: 'learner' }))}
                  >
                    Learner Mode
                  </button>
                  <button
                    type="button"
                    className={`secondary mode-toggle ${currentCardMode === 'auditor' ? 'active' : ''}`}
                    onClick={() => setCardModeById((prev) => ({ ...prev, [currentCard.id]: 'auditor' }))}
                  >
                    Auditor Mode
                  </button>
                </div>
              </div>

              <h1>{currentCard.title}</h1>

              <section className="objective-box">
                <p className="section-label">Learning Objective</p>
                <p><GlossaryText text={currentCard.objective} /></p>
              </section>

              <section className="copy-block">
                <p className="section-label">Core Content</p>
                <ul>
                  {currentCard.coreContent.map((item) => (
                    <li key={item}><GlossaryText text={item} /></li>
                  ))}
                </ul>
              </section>

              <section className="example-box">
                <div className="flex items-center justify-between gap-2">
                  <p className="section-label">Practical Example</p>
                  <div className="flex gap-2">
                    <button type="button" className="secondary btn-sm" onClick={() => copyText(currentCard.practicalExample)}>Copy compliant text</button>
                    <button type="button" className="tertiary btn-sm">Listen (stub)</button>
                  </div>
                </div>
                <p><GlossaryText text={currentCard.practicalExample} /></p>
              </section>

              <section className="red-flag-box">
                <p className="section-label">Common Mistake / Red Flag</p>
                <p><GlossaryText text={currentCard.redFlag} /></p>
              </section>

              {currentCard.deepDive ? (
                <section className="objective-box">
                  <p className="section-label">Clinical Deep Dive</p>
                  <ul>
                    {currentCard.deepDive.map((item) => (
                      <li key={item}><GlossaryText text={item} /></li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className="objective-box">
                <p className="section-label">Visualization / Interaction</p>
                <Suspense fallback={<SkeletonBlock label="Loading visualization" />}>
                  <LargeVisualization
                    card={currentCard}
                    builtText={templateBuilderByCardId[currentCard.id] ?? []}
                    onAddChip={(chip) =>
                      setTemplateBuilderByCardId((prev) => ({
                        ...prev,
                        [currentCard.id]: [...(prev[currentCard.id] ?? []), chip],
                      }))
                    }
                    onResetBuilder={() =>
                      setTemplateBuilderByCardId((prev) => ({
                        ...prev,
                        [currentCard.id]: [],
                      }))
                    }
                  />
                </Suspense>
              </section>

              {currentCardMode === 'auditor' ? (
                <Suspense fallback={<SkeletonBlock label="Loading auditor lens" />}>
                  <AuditorOverlay card={currentCard} />
                </Suspense>
              ) : null}

              {currentCard.id === 'plan-required-elements' ? (
                <section className="objective-box" ref={formExplorerRef}>
                  <p className="section-label">Required Elements Checklist (Interactive)</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {[
                      'Diagnoses complete and current',
                      'Safety + readmission interventions listed',
                      'Measurable goals with timeframe',
                      'Education/discharge criteria documented',
                      'Advance directive status documented',
                      'Supervisor completeness attestation ready',
                    ].map((item) => {
                      const checked = checklistState[item]
                      return (
                        <button
                          key={item}
                          type="button"
                          className={`checklist-item ${checked ? 'active' : ''}`}
                          onClick={() => setChecklistState((prev) => ({ ...prev, [item]: !prev[item] }))}
                        >
                          {checked ? '✅' : '⬜'} {item}
                        </button>
                      )
                    })}
                  </div>

                  <p className="section-label mt-3">Risk → Intervention → Measurable Goal mini-sim</p>
                  <div className="grid gap-2 md:grid-cols-3">
                    <input className="field-input" placeholder="Risk" value={mappingState.risk} onChange={(e) => setMappingState((prev) => ({ ...prev, risk: e.target.value }))} />
                    <input className="field-input" placeholder="Intervention" value={mappingState.intervention} onChange={(e) => setMappingState((prev) => ({ ...prev, intervention: e.target.value }))} />
                    <input className="field-input" placeholder="Measurable Goal" value={mappingState.goal} onChange={(e) => setMappingState((prev) => ({ ...prev, goal: e.target.value }))} />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 mt-3">
                    <article className="status-card status-success">
                      <p className="text-xs font-semibold uppercase tracking-wide">Compliant goal example</p>
                      <p className="text-sm mt-1">Patient will complete bed-to-chair transfer with stand-by assist and no loss of balance for 14 days.</p>
                    </article>
                    <article className="status-card status-warning">
                      <p className="text-xs font-semibold uppercase tracking-wide">Noncompliant goal example</p>
                      <p className="text-sm mt-1">Improve mobility.</p>
                    </article>
                  </div>

                  <div className="mt-3 rounded-lg border border-subtle bg-surface p-3 text-sm text-secondary">
                    <p className="font-semibold">Supervisor POC completeness attestation</p>
                    <p className="mt-1">“I attest required POC elements are complete, patient-specific, and traceable to assessment evidence prior to claim progression.”</p>
                    <button type="button" className="secondary btn-sm mt-2" onClick={() => copyText('I attest required POC elements are complete, patient-specific, and traceable to assessment evidence prior to claim progression.')}>Copy attestation snippet</button>
                  </div>
                </section>
              ) : null}

              {relevantHotspots.length ? (
                <div ref={formExplorerRef}>
                  <Suspense fallback={<SkeletonBlock label="Loading form explorer" />}>
                    <InteractiveFormExplorer
                      hotspots={relevantHotspots}
                      activeHotspotId={activeHotspotId}
                      isOpen={isFormExplorerOpen}
                      pulseGuideOn={pulseGuideOn}
                      onToggleOpen={() => setIsFormExplorerOpen((prev) => !prev)}
                      onShowZone={showFormZone}
                      onActivateHotspot={(id) => {
                        setActiveHotspotId(id)
                        setPulseGuideOn(false)
                      }}
                    />
                  </Suspense>
                </div>
              ) : null}
            </>
          ) : null}

          {currentCard && isKnowledgeScreen ? (
            <>
              <div className="card-top-row">
                <span className="badge">Knowledge Check</span>
                <span className="badge ghost">Section gate</span>
              </div>
              <h1>{currentCard.title} — Checkpoint</h1>
              <section className="game-panel">
                <p className="game-title">Question</p>
                <p>{currentCard.knowledgeCheck.question}</p>
                <div className="option-grid">
                  {currentCard.knowledgeCheck.options.map((option) => {
                    const selected = currentCardSelection === option
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`option-btn ${selected ? 'selected' : ''}`}
                        onClick={() => {
                          const correct = option === currentCard.knowledgeCheck.correctAnswer
                          setKnowledgeInputStats((prev) => ({
                            correct: prev.correct + (correct ? 1 : 0),
                            incorrect: prev.incorrect + (correct ? 0 : 1),
                          }))
                          setCardAnswers((prev) => ({ ...prev, [currentCard.id]: option }))
                        }}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
                {currentCardSelection ? (
                  <p className={`success-note ${currentCardCorrect ? '' : 'warn'}`}>
                    {currentCardCorrect
                      ? `Correct. ${currentCard.knowledgeCheck.rationale}`
                      : qaDebugMode
                        ? 'Incorrect. QA Debug ON: gate bypass enabled.'
                        : 'Incorrect. Back/Next locked until correct.'}
                  </p>
                ) : null}
              </section>
            </>
          ) : null}

          {screenIndex === examScreenIndex ? (
            <Suspense fallback={<SkeletonBlock label="Loading final exam" />}>
              <FinalExamSection
                finalExamAnswers={finalExamAnswers}
                qaDebugMode={qaDebugMode}
                finalExamFullyAnswered={finalExamFullyAnswered}
                finalExamSubmitted={finalExamSubmitted}
                finalExamScore={finalExamScore}
                finalExamPassed={finalExamPassed}
                missedCount={missedQuestions.length}
                onSelectAnswer={(questionId, answer) => setFinalExamAnswers((prev) => ({ ...prev, [questionId]: answer }))}
                onSubmit={() => setFinalExamSubmitted(true)}
                onReset={() => {
                  setFinalExamAnswers({})
                  setFinalExamSubmitted(false)
                }}
              />
            </Suspense>
          ) : null}

          {screenIndex === missedReviewScreenIndex ? (
            <>
              <div className="card-top-row">
                <span className="badge">Missed Review</span>
                <span className="badge ghost">Card-linked remediation</span>
              </div>
              <h1>Missed Questions Review</h1>
              <section className="copy-block">
                {missedQuestions.length ? (
                  <ul>
                    {missedQuestions.map((item) => {
                      const card = learningCards.find((c) => c.id === item.cardId)
                      return (
                        <li key={item.id} className="flex flex-wrap items-center justify-between gap-2">
                          <span>{item.question}</span>
                          {card ? (
                            <button type="button" className="secondary btn-sm" onClick={() => jumpToCard(card.id)}>
                              Review: {card.title}
                            </button>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p>No missed questions to review.</p>
                )}
              </section>
            </>
          ) : null}

          {screenIndex === completionScreenIndex ? (
            <>
              <div className="card-top-row">
                <span className="badge">Completion</span>
                <span className="badge ghost">Attestation</span>
              </div>
              <h1>Completion Screen</h1>
              <section className="copy-block">
                <ul>
                  <li>Attestation: I completed this CMS-aligned / CoP-compliant / audit-ready training pathway.</li>
                  <li>Course checks completed: {knowledgeChecksCompleted}/{learningCards.length}</li>
                  <li>Final exam score: {finalExamSubmitted ? `${finalExamScore}%` : 'Not submitted'}</li>
                </ul>
              </section>
              <footer className="card-actions">
                <button type="button" className="secondary" onClick={resetProgress}>Restart Course</button>
                <button type="button" className="primary" disabled={!canCompleteTraining} onClick={completeTraining}>Complete Training</button>
              </footer>
              {!canCompleteTraining && !qaDebugMode ? (
                <p className="completion-lock-note">Complete all knowledge gates and pass final exam (80%) to unlock completion.</p>
              ) : null}
              {completionMessage ? <p className="completion-note">{completionMessage}</p> : null}
            </>
          ) : null}
            </>
          ) : null}

          {screenIndex !== INTRO_SCREEN_INDEX ? (
            <footer className="card-actions nav-footer sticky bottom-0 rounded-xl border border-subtle bg-surface p-3 backdrop-blur-sm">
              <button type="button" className="secondary" onClick={() => setScreenIndex((prev) => Math.max(prev - 1, 0))} disabled={!canGoPrev}>
                Previous
              </button>
              <div className="nav-logo-wrap" aria-hidden="true">
                <img className="nav-logo" src="/branding/careindeed-logo.png" alt="CareIndeed" />
              </div>
              <button type="button" className="primary" onClick={() => setScreenIndex((prev) => Math.min(prev + 1, completionScreenIndex))} disabled={!canGoNext || screenIndex === completionScreenIndex}>
                Next
              </button>
            </footer>
          ) : null}
        </motion.section>
      </AnimatePresence>

      {screenIndex !== INTRO_SCREEN_INDEX ? (
        <>
          <p className="helper-text">
            App is public when deployed (no built-in auth gate in this codebase). Debug params: <code>debugLms=1</code>, <code>completionEndpoint</code>, <code>xapiEndpoint</code>, <code>xapiAuth</code>, <code>xapiActorEmail</code>, <code>ltiTargetOrigin</code>.
          </p>

          {isDebugLms ? (
            <section className="debug-panel" aria-label="LMS diagnostics panel">
              <p className="debug-title">LMS Diagnostics</p>
              <ul>
                <li>In iframe: {lmsDiagnostics.inIframe ? 'Yes' : 'No'}</li>
                <li>SCORM detected: {lmsDiagnostics.scormVersion ?? 'None'}</li>
                <li>SCORM 2004 API: {lmsDiagnostics.hasScormApi2004 ? 'Found' : 'Not found'}</li>
                <li>SCORM 1.2 API: {lmsDiagnostics.hasScormApi12 ? 'Found' : 'Not found'}</li>
                <li>Parent window available: {lmsDiagnostics.hasParentWindow ? 'Yes' : 'No'}</li>
              </ul>
              {lastCompletionResult ? (
                <ul>
                  <li>SCORM sent: {lastCompletionResult.scorm ? 'Success' : 'No/failed'}</li>
                  <li>xAPI sent: {lastCompletionResult.xapi ? 'Success' : 'No/failed'}</li>
                  <li>Webhook sent: {lastCompletionResult.webhook ? 'Success' : 'No/failed'}</li>
                  <li>postMessage sent: {lastCompletionResult.postMessage ? 'Success' : 'No/failed'}</li>
                  <li>Errors: {lastCompletionResult.errors.length ? lastCompletionResult.errors.join(', ') : 'None'}</li>
                </ul>
              ) : null}
            </section>
          ) : null}
        </>
      ) : null}
    </main>
  )
}

export default App
