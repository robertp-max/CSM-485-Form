/**
 * trainingFlowMachine.ts — Centralized Training Flow Controller
 * ══════════════════════════════════════════════════════════════
 * Single source of truth for the entire training lifecycle.
 * Deterministic phase transitions — no ad-hoc routing checks.
 *
 * MASTER FLOW:
 *   onboarding → challenge → postChallenge → course → finalTest → summary → complete
 *
 * SUB-STEPS within each phase:
 *   onboarding:      welcome-orientation → light-night-training → nav-training
 *   challenge:        challenge-landing → layout-challenge → henderson-challenge
 *   postChallenge:   choose-path → course-selection → help-center
 *   course:          content-cards
 *   finalTest:       final-test
 *   summary:         summary-page
 *   complete:        done
 */

// ─── Phase Types ─────────────────────────────────────────────

export type TrainingPhase =
  | 'onboarding'
  | 'challenge'
  | 'postChallenge'
  | 'course'
  | 'finalTest'
  | 'summary'
  | 'complete'

export type OnboardingStep =
  | 'welcome-orientation'
  | 'light-night-training'
  | 'nav-training'

export type ChallengeStep =
  | 'challenge-landing'
  | 'layout-challenge'
  | 'henderson-challenge'

export type PostChallengeStep =
  | 'choose-path'
  | 'course-selection'
  | 'help-center'

export type CourseStep = 'content-cards'
export type FinalTestStep = 'final-test'
export type SummaryStep = 'summary-page'
export type CompleteStep = 'done'

export type FlowStep =
  | OnboardingStep
  | ChallengeStep
  | PostChallengeStep
  | CourseStep
  | FinalTestStep
  | SummaryStep
  | CompleteStep

// ─── State Shape ─────────────────────────────────────────────

export interface FlowState {
  phase: TrainingPhase
  step: FlowStep
  /** View mode for course content (LC, NW, LP, 485, FE, SCS, HELP, etc.) */
  viewMode: string
  /** Theme preference */
  theme: 'day' | 'night'
  /** Timestamps */
  sessionStartedAt: number
  /** Whether timers should be active (only during challenge phase) */
  timersActive: boolean
  /** Whether navigation is locked */
  navigationLocked: boolean
  /** Completed phases for gating */
  completedPhases: Set<TrainingPhase>
  /** Completed steps for gating */
  completedSteps: Set<FlowStep>
}

// ─── Transition Map ──────────────────────────────────────────

const PHASE_ORDER: TrainingPhase[] = [
  'onboarding',
  'challenge',
  'postChallenge',
  'course',
  'finalTest',
  'summary',
  'complete',
]

const STEP_SEQUENCES: Record<TrainingPhase, FlowStep[]> = {
  onboarding: ['welcome-orientation', 'light-night-training', 'nav-training'],
  challenge: ['challenge-landing', 'layout-challenge', 'henderson-challenge'],
  postChallenge: ['choose-path', 'course-selection', 'help-center'],
  course: ['content-cards'],
  finalTest: ['final-test'],
  summary: ['summary-page'],
  complete: ['done'],
}

// ─── State Machine ───────────────────────────────────────────

const STORAGE_KEY = 'cihh.trainingFlow.v1'

type Listener = () => void
const listeners = new Set<Listener>()

function notify() {
  listeners.forEach(fn => fn())
}

let _state: FlowState = loadState()

function defaultState(): FlowState {
  return {
    phase: 'onboarding',
    step: 'welcome-orientation',
    viewMode: 'DEFAULT',
    theme: 'day',
    sessionStartedAt: Date.now(),
    timersActive: false,
    navigationLocked: false,
    completedPhases: new Set(),
    completedSteps: new Set(),
  }
}

function serializeState(state: FlowState): string {
  return JSON.stringify({
    phase: state.phase,
    step: state.step,
    viewMode: state.viewMode,
    theme: state.theme,
    sessionStartedAt: state.sessionStartedAt,
    timersActive: state.timersActive,
    navigationLocked: state.navigationLocked,
    completedPhases: Array.from(state.completedPhases),
    completedSteps: Array.from(state.completedSteps),
  })
}

function deserializeState(raw: string): FlowState {
  try {
    const parsed = JSON.parse(raw)
    return {
      phase: parsed.phase ?? 'onboarding',
      step: parsed.step ?? 'welcome-orientation',
      viewMode: parsed.viewMode ?? 'DEFAULT',
      theme: parsed.theme ?? 'day',
      sessionStartedAt: parsed.sessionStartedAt ?? Date.now(),
      timersActive: parsed.timersActive ?? false,
      navigationLocked: parsed.navigationLocked ?? false,
      completedPhases: new Set(parsed.completedPhases ?? []),
      completedSteps: new Set(parsed.completedSteps ?? []),
    }
  } catch {
    return defaultState()
  }
}

function loadState(): FlowState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return deserializeState(raw)
  } catch { /* fallback */ }
  return defaultState()
}

function persistState() {
  try {
    localStorage.setItem(STORAGE_KEY, serializeState(_state))
  } catch { /* noop */ }
}

// ─── Public API ──────────────────────────────────────────────

/** Get current flow state (read-only snapshot) */
export function getFlowState(): Readonly<FlowState> {
  return _state
}

/** Subscribe to state changes */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Get snapshot for useSyncExternalStore */
export function getSnapshot(): FlowState {
  return _state
}

/** Advance to the next step in the current phase, or next phase */
export function advanceStep(): void {
  const steps = STEP_SEQUENCES[_state.phase]
  const currentIdx = steps.indexOf(_state.step)

  // Mark current step complete (immutable copy)
  const newCompletedSteps = new Set(_state.completedSteps)
  newCompletedSteps.add(_state.step)

  if (currentIdx < steps.length - 1) {
    // Next step within same phase — create NEW state object
    _state = {
      ..._state,
      step: steps[currentIdx + 1],
      completedSteps: newCompletedSteps,
      timersActive: _state.phase === 'challenge',
    }
  } else {
    // Phase complete — advance to next phase
    const newCompletedPhases = new Set(_state.completedPhases)
    newCompletedPhases.add(_state.phase)
    const phaseIdx = PHASE_ORDER.indexOf(_state.phase)
    if (phaseIdx < PHASE_ORDER.length - 1) {
      const nextPhase = PHASE_ORDER[phaseIdx + 1]
      _state = {
        ..._state,
        phase: nextPhase,
        step: STEP_SEQUENCES[nextPhase][0],
        completedPhases: newCompletedPhases,
        completedSteps: newCompletedSteps,
        timersActive: nextPhase === 'challenge',
      }
    } else {
      _state = {
        ..._state,
        completedPhases: newCompletedPhases,
        completedSteps: newCompletedSteps,
        timersActive: false,
      }
    }
  }

  persistState()
  notify()
}

/** Jump to a specific phase + step (for dock navigation in post-challenge) */
export function goTo(phase: TrainingPhase, step: FlowStep): void {
  _state = {
    ..._state,
    phase,
    step,
    timersActive: phase === 'challenge',
  }
  persistState()
  notify()
}

/** Set theme */
export function setFlowTheme(theme: 'day' | 'night'): void {
  _state = { ..._state, theme }
  persistState()
  notify()
}

/** Set view mode for course content */
export function setFlowViewMode(viewMode: string): void {
  _state = { ..._state, viewMode }
  persistState()
  notify()
}

/** Set navigation lock */
export function setFlowNavigationLocked(locked: boolean): void {
  _state = { ..._state, navigationLocked: locked }
  persistState()
  notify()
}

/** Check if a phase has been completed */
export function isPhaseComplete(phase: TrainingPhase): boolean {
  return _state.completedPhases.has(phase)
}

/** Check if a step has been completed */
export function isStepComplete(step: FlowStep): boolean {
  return _state.completedSteps.has(step)
}

/** Check if the current phase allows dock navigation */
export function isDockNavigationAllowed(): boolean {
  // Dock is always VISIBLE, but navigation may be restricted
  // During onboarding/challenge, only certain targets are allowed
  return _state.phase !== 'onboarding' && _state.phase !== 'challenge'
}

/** Get phase index for progress display */
export function getPhaseIndex(): number {
  return PHASE_ORDER.indexOf(_state.phase)
}

/** Get total phases for progress display */
export function getTotalPhases(): number {
  return PHASE_ORDER.length
}

/** Get step index within current phase */
export function getStepIndex(): number {
  const steps = STEP_SEQUENCES[_state.phase]
  return steps.indexOf(_state.step)
}

/** Get total steps in current phase */
export function getTotalSteps(): number {
  return STEP_SEQUENCES[_state.phase].length
}

/** Reset entire flow (for debugging / retake) */
export function resetFlow(): void {
  _state = defaultState()
  persistState()
  notify()
}

/** Mark current step complete without advancing */
export function markStepComplete(step: FlowStep): void {
  const newSteps = new Set(_state.completedSteps)
  newSteps.add(step)
  _state = { ..._state, completedSteps: newSteps }
  persistState()
  notify()
}

/** Get the phase order for display */
export function getPhaseOrder(): TrainingPhase[] {
  return [...PHASE_ORDER]
}

/** Get steps for a phase */
export function getStepsForPhase(phase: TrainingPhase): FlowStep[] {
  return [...STEP_SEQUENCES[phase]]
}

// ─── State Transition Table (for documentation / QA) ─────────

export const STATE_TRANSITION_TABLE = [
  { from: 'onboarding:welcome-orientation', to: 'onboarding:light-night-training', trigger: 'Begin Training button' },
  { from: 'onboarding:light-night-training', to: 'onboarding:nav-training', trigger: 'Theme configured + Continue' },
  { from: 'onboarding:nav-training', to: 'challenge:challenge-landing', trigger: 'Nav training 3 cards complete' },
  { from: 'challenge:challenge-landing', to: 'challenge:layout-challenge', trigger: 'Begin Challenges button' },
  { from: 'challenge:layout-challenge', to: 'challenge:henderson-challenge', trigger: 'Layout challenge completed' },
  { from: 'challenge:henderson-challenge', to: 'postChallenge:choose-path', trigger: 'Henderson challenge completed' },
  { from: 'postChallenge:choose-path', to: 'postChallenge:course-selection', trigger: 'Path chosen' },
  { from: 'postChallenge:course-selection', to: 'course:content-cards', trigger: 'Module selected' },
  { from: 'postChallenge:help-center', to: 'postChallenge:choose-path', trigger: 'Proceed to Training button' },
  { from: 'course:content-cards', to: 'finalTest:final-test', trigger: 'All cards completed' },
  { from: 'finalTest:final-test', to: 'summary:summary-page', trigger: 'Final test submitted' },
  { from: 'summary:summary-page', to: 'complete:done', trigger: 'Summary acknowledged' },
] as const
