/**
 * Fisher-Yates (Knuth) shuffle algorithm.
 * Creates a new shuffled array without mutating the input.
 */
export function fisherYatesShuffle<T>(array: readonly T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
