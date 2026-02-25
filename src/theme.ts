export type ThemeAppearance = 'light' | 'night'

const THEME_STORAGE_KEY = 'cihh.theme'

export const getStoredTheme = (): ThemeAppearance => {
  if (typeof window === 'undefined') return 'light'

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'night') return stored

  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'night'
  return 'light'
}

export const applyTheme = (appearance: ThemeAppearance) => {
  if (typeof document === 'undefined') return

  document.documentElement.dataset.theme = appearance
  document.documentElement.style.colorScheme = appearance === 'night' ? 'dark' : 'light'

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, appearance)
  }
}

export const toggleTheme = (current: ThemeAppearance): ThemeAppearance => {
  const next = current === 'light' ? 'night' : 'light'
  applyTheme(next)
  return next
}
