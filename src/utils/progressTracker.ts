/**
 * Progress Tracker Utility
 * Tracks card completion and chapter progress across sessions using localStorage
 */

const PROGRESS_STORAGE_KEY = 'cihh.training.progress.v1'

export interface ProgressData {
  submittedAnswers: Record<number, boolean>
  viewedCards: number[]
  currentCardIndex: number
  lastUpdated: number
}

const defaultProgress: ProgressData = {
  submittedAnswers: {},
  viewedCards: [],
  currentCardIndex: 0,
  lastUpdated: Date.now(),
}

/**
 * Load progress data from localStorage
 */
export function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (!raw) return { ...defaultProgress }
    const parsed = JSON.parse(raw)
    return {
      submittedAnswers: parsed.submittedAnswers ?? {},
      viewedCards: parsed.viewedCards ?? [],
      currentCardIndex: parsed.currentCardIndex ?? 0,
      lastUpdated: parsed.lastUpdated ?? Date.now(),
    }
  } catch {
    return { ...defaultProgress }
  }
}

/**
 * Save progress data to localStorage
 */
export function saveProgress(progress: Partial<ProgressData>): void {
  try {
    const current = loadProgress()
    const updated: ProgressData = {
      ...current,
      ...progress,
      lastUpdated: Date.now(),
    }
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.warn('Failed to save progress:', e)
  }
}

/**
 * Mark a card as submitted/completed
 */
export function markCardSubmitted(cardIndex: number): void {
  const progress = loadProgress()
  progress.submittedAnswers[cardIndex] = true
  saveProgress(progress)
}

/**
 * Check if a card has been submitted
 */
export function isCardSubmitted(cardIndex: number): boolean {
  const progress = loadProgress()
  return Boolean(progress.submittedAnswers[cardIndex])
}

/**
 * Get all submitted answers
 */
export function getSubmittedAnswers(): Record<number, boolean> {
  const progress = loadProgress()
  return progress.submittedAnswers
}

/**
 * Check if a chapter (section) is completed
 * A chapter is completed if all its cards have been submitted
 */
export function isChapterComplete(
  sectionName: string,
  trainingCards: Array<{ section: string }>,
  introCardCount: number
): boolean {
  const progress = loadProgress()
  const sectionCards = trainingCards
    .map((card, idx) => ({ card, globalIndex: introCardCount + idx }))
    .filter(({ card }) => card.section === sectionName)
  
  if (sectionCards.length === 0) return false
  
  return sectionCards.every(({ globalIndex }) => 
    Boolean(progress.submittedAnswers[globalIndex])
  )
}

/**
 * Check if a chapter is started (at least one card has been submitted)
 */
export function isChapterStarted(
  sectionName: string,
  trainingCards: Array<{ section: string }>,
  introCardCount: number
): boolean {
  const progress = loadProgress()
  const sectionCards = trainingCards
    .map((card, idx) => ({ card, globalIndex: introCardCount + idx }))
    .filter(({ card }) => card.section === sectionName)
  
  if (sectionCards.length === 0) return false
  
  return sectionCards.some(({ globalIndex }) => 
    Boolean(progress.submittedAnswers[globalIndex])
  )
}

/**
 * Get the first card index for a given section (chapter)
 * Returns the global card index (including intro cards)
 */
export function getFirstCardIndexForSection(
  sectionName: string,
  trainingCards: Array<{ section: string }>,
  introCardCount: number
): number {
  const idx = trainingCards.findIndex(card => card.section === sectionName)
  return idx >= 0 ? introCardCount + idx : introCardCount
}

/**
 * Check if a chapter is unlocked
 * First chapter is always unlocked
 * Other chapters are unlocked if the previous chapter is completed
 */
export function isChapterUnlocked(
  sectionIndex: number,
  sections: string[],
  trainingCards: Array<{ section: string }>,
  introCardCount: number
): boolean {
  // First chapter is always unlocked
  if (sectionIndex === 0) return true
  
  // Check if previous chapter is completed
  const previousSection = sections[sectionIndex - 1]
  return isChapterComplete(previousSection, trainingCards, introCardCount)
}

/**
 * Get completion count for a section
 */
export function getSectionCompletionCount(
  sectionName: string,
  trainingCards: Array<{ section: string }>,
  introCardCount: number
): { completed: number; total: number } {
  const progress = loadProgress()
  const sectionCards = trainingCards
    .map((card, idx) => ({ card, globalIndex: introCardCount + idx }))
    .filter(({ card }) => card.section === sectionName)
  
  const completed = sectionCards.filter(({ globalIndex }) => 
    Boolean(progress.submittedAnswers[globalIndex])
  ).length
  
  return { completed, total: sectionCards.length }
}

/**
 * Reset all progress (for testing/debugging)
 */
export function resetProgress(): void {
  localStorage.removeItem(PROGRESS_STORAGE_KEY)
}
