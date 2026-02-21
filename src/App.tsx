import { useEffect, useState } from 'react'
import './App.css'
import {
  getCompletionConfigFromQuery,
  getLmsEnvironmentDiagnostics,
  sendTrainingCompletion,
  type CompletionResult,
} from './lmsCompletion'

type Interaction =
  | {
      type: 'mcq'
      question: string
      options: string[]
      correctOption: string
      successText: string
    }
  | {
      type: 'multi'
      question: string
      options: string[]
      correctOptions: string[]
      successText: string
    }

type TrainingCard = {
  id: string
  title: string
  subtitle?: string
  durationMin: number
  label: 'Learning' | 'Game Checkpoint' | 'Scenario' | 'Pulse Break' | 'Wrap-Up'
  content: string[]
  interaction?: Interaction
}

type ChallengeQuestion = {
  id: string
  topic: string
  prompt: string
  options: string[]
  correctOption: string
  rationale: string
}

const finalChallengeQuestions: ChallengeQuestion[] = [
  {
    id: 'q1',
    topic: 'Certification period integrity',
    prompt: 'Which mismatch is highest risk in CSM-485 review?',
    options: [
      'Narrative wording preference',
      'Certification period dates that conflict across sections',
      'Minor punctuation differences',
      'Font size inconsistency',
    ],
    correctOption: 'Certification period dates that conflict across sections',
    rationale: 'Date conflicts can invalidate timelines and disrupt physician authorization workflow.',
  },
  {
    id: 'q2',
    topic: 'Physician sign-off requirements',
    prompt: 'Before submission, which element is required for compliant handoff?',
    options: [
      'Optional peer comment only',
      'Physician signature and date',
      'Sticky-note reminder on draft',
      'Verbal team acknowledgment only',
    ],
    correctOption: 'Physician signature and date',
    rationale: 'Signature/date verification is a core control in final review readiness.',
  },
  {
    id: 'q3',
    topic: 'Diagnosis discrepancy escalation',
    prompt: 'If diagnosis text changed in the latest note, best first action is:',
    options: [
      'Submit now and reconcile later',
      'Ignore unless billing team flags it',
      'Escalate discrepancy and reconcile before sign-off',
      'Delete diagnosis section',
    ],
    correctOption: 'Escalate discrepancy and reconcile before sign-off',
    rationale: 'Reconciliation before submission prevents downstream rework and quality risk.',
  },
  {
    id: 'q4',
    topic: 'Pre-submit verification workflow',
    prompt: 'Which set represents non-negotiable pre-submit checks?',
    options: [
      'Patient identifiers, care period dates, intervention/goal alignment',
      'Logo placement, page color, bullet style',
      'Only patient initials',
      'Only diagnosis code formatting',
    ],
    correctOption: 'Patient identifiers, care period dates, intervention/goal alignment',
    rationale: 'These fields directly impact clinical continuity and review acceptance.',
  },
  {
    id: 'q5',
    topic: 'Early risk escalation timing',
    prompt: 'When should a CSM-485 discrepancy be escalated?',
    options: [
      'After final submission only',
      'Immediately when mismatch is identified',
      'Only if a payer denies claim',
      'At month end close',
    ],
    correctOption: 'Immediately when mismatch is identified',
    rationale: 'Early escalation protects care continuity and timeline integrity.',
  },
]

const cards: TrainingCard[] = [
  {
    id: 'hero',
    title: 'CSM-485 Mastery Experience',
    subtitle: 'Nurse training pathway | estimated 38-42 minutes',
    durationMin: 3,
    label: 'Learning',
    content: [
      'Welcome to the CareIndeed training flow for physician plan of care compliance and documentation quality.',
      'Move through each card, complete game checkpoints, and finish with a readiness confirmation for Moodle unlock.',
    ],
  },
  {
    id: 'mission',
    title: 'Why CSM-485 Precision Matters',
    durationMin: 4,
    label: 'Learning',
    content: [
      'The care plan is the single source of truth between physician directives, nursing execution, and interdisciplinary communication.',
      'Accurate CSM-485 completion lowers rework, reduces delays, and protects continuity and reimbursement confidence.',
    ],
  },
  {
    id: 'anatomy',
    title: 'Form Anatomy: Non-Negotiable Fields',
    durationMin: 5,
    label: 'Learning',
    content: [
      'Verify patient identifiers, certification period, diagnoses, orders, visit frequencies, and signatures before submission.',
      'Cross-check that narrative, interventions, and goals align with physician intent and current patient status.',
    ],
    interaction: {
      type: 'multi',
      question: 'Select all core elements that must be verified before final submission.',
      options: [
        'Patient identifiers',
        'Physician signature and date',
        'Care period dates',
        'Nurse favorite color',
        'Intervention/goal alignment',
      ],
      correctOptions: [
        'Patient identifiers',
        'Physician signature and date',
        'Care period dates',
        'Intervention/goal alignment',
      ],
      successText: 'Great eye. You captured the required verification set.',
    },
  },
  {
    id: 'mythbuster',
    title: 'Game Checkpoint: Myth or Fact',
    durationMin: 4,
    label: 'Game Checkpoint',
    content: [
      'Keep momentum: short challenge to lock in compliance behavior before the workflow section.',
    ],
    interaction: {
      type: 'mcq',
      question:
        'Statement: If all orders are present, a missing physician signature can be corrected after submission with no workflow impact.',
      options: ['Fact', 'Myth'],
      correctOption: 'Myth',
      successText: 'Correct. Signature gaps can delay acceptance and trigger rework.',
    },
  },
  {
    id: 'workflow',
    title: 'Workflow Rhythm: Draft -> Verify -> Handoff',
    durationMin: 5,
    label: 'Learning',
    content: [
      'Best-performing teams use a repeatable cadence: complete draft, self-verify, peer check, then physician handoff.',
      'Escalate mismatches immediately when visit notes, goals, and ordered services are not aligned.',
    ],
  },
  {
    id: 'field-hunt',
    title: 'Game Checkpoint: Field Hunt',
    durationMin: 5,
    label: 'Game Checkpoint',
    content: [
      'Challenge mode: identify which update creates a true compliance risk and should be escalated first.',
    ],
    interaction: {
      type: 'mcq',
      question: 'Which issue should trigger immediate escalation?',
      options: [
        'Minor spacing inconsistency in narrative text',
        'Certification period dates conflict across sections',
        'Bullet style mismatch in notes',
        'Header capitalization differs from template',
      ],
      correctOption: 'Certification period dates conflict across sections',
      successText: 'Exactly. Date conflicts can invalidate timelines and downstream approvals.',
    },
  },
  {
    id: 'risk-signals',
    title: 'Risk Signals to Catch Early',
    durationMin: 4,
    label: 'Learning',
    content: [
      'Watch for conflicting diagnoses, unsigned amendments, and care goals that do not map to planned interventions.',
      'Early correction protects patient continuity and prevents bottlenecks before review windows close.',
    ],
  },
  {
    id: 'pulse-break',
    title: 'Pulse Break: 60-Second Reset',
    subtitle: 'Keep it lively: quick reflection before final scenario',
    durationMin: 2,
    label: 'Pulse Break',
    content: [
      'Pause for one minute: What two errors are most common on your current caseload?',
      'Mentally anchor your correction strategy before moving into the scenario card.',
    ],
  },
  {
    id: 'scenario',
    title: 'Scenario Sprint',
    durationMin: 4,
    label: 'Scenario',
    content: [
      'Scenario: You have a complete draft, but physician signature date is outside certification period and diagnosis text changed in latest note.',
      'Choose the strongest first action for compliant workflow recovery.',
    ],
    interaction: {
      type: 'mcq',
      question: 'Best first action?',
      options: [
        'Submit anyway and annotate later',
        'Escalate discrepancy, reconcile dates/diagnoses, then resubmit for sign-off',
        'Delete diagnosis section and continue',
        'Wait 48 hours and see if issue resolves itself',
      ],
      correctOption: 'Escalate discrepancy, reconcile dates/diagnoses, then resubmit for sign-off',
      successText: 'Perfect. Reconciliation before submission protects compliance and care integrity.',
    },
  },
  {
    id: 'competency-check',
    title: 'Final Competency Challenge',
    subtitle: 'Practice scorecard with unlimited retries',
    durationMin: 6,
    label: 'Game Checkpoint',
    content: [
      'Complete this scored challenge to confirm CSM-485 readiness.',
      'You can retry as needed and still continue to final completion and Moodle quiz.',
    ],
  },
  {
    id: 'completion',
    title: 'Training Complete: Ready for Moodle Quiz',
    subtitle: 'Final card sends completion event and unlock signal',
    durationMin: 2,
    label: 'Wrap-Up',
    content: [
      'You completed the CSM-485 learning path and interactive checkpoints.',
      'Select Complete Training to send completion status to your LMS integration and continue to the quiz.',
    ],
  },
]

function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completionMessage, setCompletionMessage] = useState('')
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({})
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string[]>>({})
  const [challengeAnswers, setChallengeAnswers] = useState<Record<string, string>>({})
  const [challengeSubmitted, setChallengeSubmitted] = useState(false)
  const [missedTopicCounts, setMissedTopicCounts] = useState<Record<string, number>>({})
  const [lastCompletionResult, setLastCompletionResult] = useState<CompletionResult | null>(null)
  const [debugCopyMessage, setDebugCopyMessage] = useState('')

  const currentCard = cards[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === cards.length - 1
  const totalMinutes = cards.reduce((sum, card) => sum + card.durationMin, 0)
  const remainingMinutes = cards.slice(currentIndex + 1).reduce((sum, card) => sum + card.durationMin, 0)

  const completionConfig = getCompletionConfigFromQuery()
  const isDebugLms = new URLSearchParams(window.location.search).get('debugLms') === '1'
  const lmsDiagnostics = getLmsEnvironmentDiagnostics()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1))
      }
      if (event.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(prev - 1, 0))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const toggleMultiAnswer = (cardId: string, option: string) => {
    setMultiAnswers((prev) => {
      const existing = prev[cardId] ?? []
      const next = existing.includes(option) ? existing.filter((item) => item !== option) : [...existing, option]
      return { ...prev, [cardId]: next }
    })
  }

  const interactionSolved = (card: TrainingCard) => {
    if (!card.interaction) return true

    if (card.interaction.type === 'mcq') {
      return (mcqAnswers[card.id] ?? '') === card.interaction.correctOption
    }

    const selected = multiAnswers[card.id] ?? []
    const correct = card.interaction.correctOptions
    return selected.length === correct.length && selected.every((item) => correct.includes(item))
  }

  const completedCheckpoints = cards.filter((card) => card.interaction && interactionSolved(card)).length
  const totalCheckpoints = cards.filter((card) => card.interaction).length
  const xp = completedCheckpoints * 120
  const challengeCorrect = finalChallengeQuestions.filter(
    (question) => challengeAnswers[question.id] === question.correctOption,
  ).length
  const challengeScore = Math.round((challengeCorrect / finalChallengeQuestions.length) * 100)
  const challengePassed = challengeSubmitted && challengeScore >= 80
  const challengeComplete = Object.keys(challengeAnswers).length === finalChallengeQuestions.length
  const personalizedRecapTopics = Object.entries(missedTopicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  const completeTraining = async () => {
    const payload = {
      event: 'training.completed' as const,
      module: 'CSM-485',
      completedAt: new Date().toISOString(),
      trainingMinutes: totalMinutes,
      checkpointsCompleted: completedCheckpoints,
      challengeScore,
      challengePassed,
      personalizedRecapTopics: personalizedRecapTopics.map(([topic]) => topic),
    }

    try {
      const result = await sendTrainingCompletion(payload, completionConfig)
      setLastCompletionResult(result)
      const anySuccess = result.scorm || result.xapi || result.webhook || result.postMessage

      if (anySuccess) {
        const activeChannels = [
          result.scorm ? 'SCORM' : null,
          result.xapi ? 'xAPI' : null,
          result.webhook ? 'webhook' : null,
          result.postMessage ? 'LTI postMessage' : null,
        ].filter(Boolean)

        setCompletionMessage(
          `Training marked complete via ${activeChannels.join(', ')}. You can return to Moodle for the quiz.`,
        )
      } else {
        setCompletionMessage('Completion was attempted, but no LMS channel confirmed. Verify launch configuration.')
      }
    } catch {
      setCompletionMessage('Completion could not be sent. Please retry or notify your administrator.')
    }
  }

  const buildDebugReport = () => {
    const reportLines = [
      'CSM-485 LMS Debug Report',
      `Generated: ${new Date().toISOString()}`,
      `URL: ${window.location.href}`,
      '',
      'Environment',
      `- In iframe: ${lmsDiagnostics.inIframe ? 'Yes' : 'No'}`,
      `- SCORM detected: ${lmsDiagnostics.scormVersion ?? 'None'}`,
      `- SCORM 2004 API: ${lmsDiagnostics.hasScormApi2004 ? 'Found' : 'Not found'}`,
      `- SCORM 1.2 API: ${lmsDiagnostics.hasScormApi12 ? 'Found' : 'Not found'}`,
      `- Parent window available: ${lmsDiagnostics.hasParentWindow ? 'Yes' : 'No'}`,
      '',
      'Configuration',
      `- Webhook configured: ${completionConfig.completionEndpoint ? 'Yes' : 'No'}`,
      `- xAPI endpoint configured: ${completionConfig.xapiEndpoint ? 'Yes' : 'No'}`,
      `- xAPI actor email configured: ${completionConfig.xapiActorEmail ? 'Yes' : 'No'}`,
      `- LTI target origin: ${completionConfig.ltiTargetOrigin || '*'}`,
      '',
      'Last completion attempt',
      `- SCORM sent: ${lastCompletionResult?.scorm ? 'Success' : 'No/failed'}`,
      `- xAPI sent: ${lastCompletionResult?.xapi ? 'Success' : 'No/failed'}`,
      `- Webhook sent: ${lastCompletionResult?.webhook ? 'Success' : 'No/failed'}`,
      `- postMessage sent: ${lastCompletionResult?.postMessage ? 'Success' : 'No/failed'}`,
      `- Errors: ${lastCompletionResult?.errors.length ? lastCompletionResult.errors.join(', ') : 'None'}`,
    ]

    return reportLines.join('\n')
  }

  const copyDebugReport = async () => {
    try {
      await navigator.clipboard.writeText(buildDebugReport())
      setDebugCopyMessage('Debug report copied. Paste this into Slack/email for your Moodle admin.')
    } catch {
      setDebugCopyMessage('Could not copy automatically. Clipboard permissions may be blocked in this browser.')
    }
  }

  return (
    <main className="app-shell">
      <header className="brand-header">
        <div className="brand-stack">
          <img
            src="/branding/logo-dark.png"
            alt="CareIndeed"
            className="brand-logo"
            onError={(event) => {
              const element = event.currentTarget
              element.style.display = 'none'
            }}
          />
          <p className="brand-tag">Nurse Training Experience · CSM-485</p>
        </div>
        <div className="stats-chip-wrap">
          <span className="stats-chip">XP {xp}</span>
          <span className="stats-chip">{completedCheckpoints}/{totalCheckpoints} checkpoints</span>
          <span className="stats-chip">Challenge {challengeSubmitted ? `${challengeScore}%` : 'Not graded yet'}</span>
        </div>
      </header>

      <section className="hero-strip" aria-label="Training summary">
        <div>
          <p className="hero-kicker">Mission-ready learning path</p>
          <h2>{totalMinutes} min guided flow</h2>
          <p>Estimated time remaining: {remainingMinutes} min</p>
        </div>
        <div className="hero-meter" role="progressbar" aria-valuemin={0} aria-valuemax={cards.length} aria-valuenow={currentIndex + 1}>
          <span style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }} />
        </div>
      </section>

      <section className="training-card" role="region" aria-live="polite">
        <div className="card-top-row">
          <span className="badge">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span className="badge ghost">{currentCard.label}</span>
          <div className="card-jump" aria-label="Card selector">
            {cards.map((card, index) => (
              <button
                key={card.id}
                type="button"
                className={`jump-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to ${card.title}`}
              />
            ))}
          </div>
        </div>

        <h1>{currentCard.title}</h1>
        {currentCard.subtitle ? <p className="subtitle">{currentCard.subtitle}</p> : null}
        <p className="duration-pill">Estimated card time: {currentCard.durationMin} min</p>
        <div className="copy-block">
          {currentCard.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {currentCard.interaction ? (
          <section className="game-panel">
            <p className="game-title">Interactive checkpoint</p>
            <p>{currentCard.interaction.question}</p>

            {currentCard.interaction.type === 'mcq' ? (
              <div className="option-grid">
                {currentCard.interaction.options.map((option) => {
                  const selected = mcqAnswers[currentCard.id] === option
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`option-btn ${selected ? 'selected' : ''}`}
                      onClick={() => setMcqAnswers((prev) => ({ ...prev, [currentCard.id]: option }))}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="option-grid">
                {currentCard.interaction.options.map((option) => {
                  const selected = (multiAnswers[currentCard.id] ?? []).includes(option)
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`option-btn ${selected ? 'selected' : ''}`}
                      onClick={() => toggleMultiAnswer(currentCard.id, option)}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            )}

            {interactionSolved(currentCard) ? <p className="success-note">{currentCard.interaction.successText}</p> : null}
          </section>
        ) : null}

        {currentCard.id === 'competency-check' ? (
          <section className="game-panel">
            <p className="game-title">Scored challenge</p>
            <p>Answer all 5 questions. Passing threshold: 80%.</p>

            <div className="challenge-grid">
              {finalChallengeQuestions.map((question, index) => (
                <article key={question.id} className="challenge-item">
                  <p className="challenge-question">
                    {index + 1}. {question.prompt}
                  </p>
                  <div className="option-grid">
                    {question.options.map((option) => {
                      const selected = challengeAnswers[question.id] === option
                      return (
                        <button
                          key={option}
                          type="button"
                          className={`option-btn ${selected ? 'selected' : ''}`}
                          onClick={() =>
                            setChallengeAnswers((prev) => ({
                              ...prev,
                              [question.id]: option,
                            }))
                          }
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                  {challengeSubmitted ? <p className="rationale-note">{question.rationale}</p> : null}
                </article>
              ))}
            </div>

            <div className="challenge-actions">
              <button
                type="button"
                className="secondary"
                disabled={!challengeComplete}
                onClick={() => {
                  setChallengeSubmitted(true)

                  const missedTopics = finalChallengeQuestions
                    .filter((question) => challengeAnswers[question.id] !== question.correctOption)
                    .map((question) => question.topic)

                  if (missedTopics.length) {
                    setMissedTopicCounts((prev) => {
                      const next = { ...prev }
                      missedTopics.forEach((topic) => {
                        next[topic] = (next[topic] ?? 0) + 1
                      })
                      return next
                    })
                  }
                }}
              >
                Grade Challenge
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setChallengeAnswers({})
                  setChallengeSubmitted(false)
                }}
              >
                Retry
              </button>
            </div>

            {challengeSubmitted ? (
              <p className={`success-note ${challengePassed ? '' : 'warn'}`}>
                Score: {challengeScore}% · {challengePassed ? 'Pass' : 'Needs retry (80% required)'}
              </p>
            ) : null}
          </section>
        ) : null}

        {currentCard.id === 'completion' ? (
          <section className="recap-panel" aria-label="Personalized recap">
            <p className="recap-title">Your personalized recap</p>
            {personalizedRecapTopics.length ? (
              <>
                <p>Based on your challenge attempts, focus on these top review themes:</p>
                <ul>
                  {personalizedRecapTopics.map(([topic, misses]) => (
                    <li key={topic}>
                      <strong>{topic}</strong> — revisit this area ({misses} miss{misses > 1 ? 'es' : ''})
                    </li>
                  ))}
                </ul>
                <p className="recap-note">Official graded assessment still occurs in your Moodle quiz.</p>
              </>
            ) : (
              <p>
                Great work—no recurring weak spots detected in practice attempts. Proceed to Moodle quiz with confidence.
              </p>
            )}
          </section>
        ) : null}

        <footer className="card-actions">
          <button
            type="button"
            className="secondary"
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            disabled={isFirst}
          >
            Back
          </button>

          {!isLast ? (
            <button
              type="button"
              className="primary"
              onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1))}
              disabled={Boolean(currentCard.interaction) && !interactionSolved(currentCard)}
            >
              Next
            </button>
          ) : (
            <button type="button" className="primary" onClick={completeTraining}>
              Complete Training
            </button>
          )}
        </footer>

        {completionMessage ? <p className="completion-note">{completionMessage}</p> : null}
      </section>

      <p className="helper-text">
        Tip: query options include <code>completionEndpoint</code>, <code>xapiEndpoint</code>, <code>xapiAuth</code>,
        <code>xapiActorEmail</code>, and <code>ltiTargetOrigin</code>. Logos go in <code>public/branding</code>.
      </p>

      {isDebugLms ? (
        <section className="debug-panel" aria-label="LMS diagnostics panel">
          <p className="debug-title">LMS Diagnostics (debugLms=1)</p>
          <div className="debug-actions">
            <button type="button" className="secondary" onClick={copyDebugReport}>
              Copy LMS debug report
            </button>
            {debugCopyMessage ? <p className="debug-note">{debugCopyMessage}</p> : null}
          </div>
          <ul>
            <li>In iframe: {lmsDiagnostics.inIframe ? 'Yes' : 'No'}</li>
            <li>SCORM detected: {lmsDiagnostics.scormVersion ?? 'None'}</li>
            <li>SCORM 2004 API: {lmsDiagnostics.hasScormApi2004 ? 'Found' : 'Not found'}</li>
            <li>SCORM 1.2 API: {lmsDiagnostics.hasScormApi12 ? 'Found' : 'Not found'}</li>
            <li>Parent window available: {lmsDiagnostics.hasParentWindow ? 'Yes' : 'No'}</li>
            <li>Webhook configured: {completionConfig.completionEndpoint ? 'Yes' : 'No'}</li>
            <li>xAPI endpoint configured: {completionConfig.xapiEndpoint ? 'Yes' : 'No'}</li>
            <li>xAPI actor email configured: {completionConfig.xapiActorEmail ? 'Yes' : 'No'}</li>
            <li>LTI target origin: {completionConfig.ltiTargetOrigin || '*'}</li>
          </ul>

          {lastCompletionResult ? (
            <>
              <p className="debug-title">Last completion attempt</p>
              <ul>
                <li>SCORM sent: {lastCompletionResult.scorm ? 'Success' : 'No/failed'}</li>
                <li>xAPI sent: {lastCompletionResult.xapi ? 'Success' : 'No/failed'}</li>
                <li>Webhook sent: {lastCompletionResult.webhook ? 'Success' : 'No/failed'}</li>
                <li>postMessage sent: {lastCompletionResult.postMessage ? 'Success' : 'No/failed'}</li>
                <li>Errors: {lastCompletionResult.errors.length ? lastCompletionResult.errors.join(', ') : 'None'}</li>
              </ul>
            </>
          ) : (
            <p className="debug-note">No completion attempt yet in this session.</p>
          )}
        </section>
      ) : null}
    </main>
  )
}

export default App
