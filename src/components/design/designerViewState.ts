export type DesignerPanelMode = 'main' | 'additional' | 'challenge'

type DesignerViewState = {
  cardIndex: number
  panelMode: DesignerPanelMode
}

const STORAGE_KEY = 'cms485.designer.viewState.v1'

let inMemoryState: DesignerViewState = {
  cardIndex: 0,
  panelMode: 'main',
}

const sanitize = (raw: Partial<DesignerViewState> | null | undefined, totalCards: number): DesignerViewState => {
  const maxIndex = Math.max(0, totalCards - 1)
  const safeIndex = typeof raw?.cardIndex === 'number' && Number.isFinite(raw.cardIndex)
    ? Math.min(Math.max(0, Math.trunc(raw.cardIndex)), maxIndex)
    : 0
  const safePanelMode: DesignerPanelMode = raw?.panelMode === 'additional' || raw?.panelMode === 'challenge'
    ? raw.panelMode
    : 'main'

  return {
    cardIndex: safeIndex,
    panelMode: safePanelMode,
  }
}

export const loadDesignerViewState = (totalCards: number): DesignerViewState => {
  if (typeof window === 'undefined') return sanitize(inMemoryState, totalCards)

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<DesignerViewState>
      const nextState = sanitize(parsed, totalCards)
      inMemoryState = nextState
      return nextState
    }
  } catch {
  }

  return sanitize(inMemoryState, totalCards)
}

export const saveDesignerViewState = (state: DesignerViewState): void => {
  const nextState = sanitize(state, Number.MAX_SAFE_INTEGER)
  inMemoryState = nextState

  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
  } catch {
  }
}
