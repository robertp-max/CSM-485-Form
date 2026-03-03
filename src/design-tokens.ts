/* ══════════════════════════════════════════════════════════════════
 *  DESIGN TOKENS — Single source of truth for ALL visual constants.
 *  ──────────────────────────────────────────────────────────────────
 *  DO NOT edit inline colors/radii/shadows in component files.
 *  Import from here instead. Any visual divergence from these values
 *  is a design regression.
 *
 *  Authority: CSM-485 Form - Copy (backup folder)
 *  Last verified: 2025-01-XX via fc.exe byte-for-byte comparison
 * ══════════════════════════════════════════════════════════════════ */

// ─── Color Palette ────────────────────────────────────────────

export const color = {
  // Brand primaries
  teal:         '#007970',
  cyan:         '#64F4F5',
  orange:       '#C74601',
  orangeAccent: '#E56E2E',

  // Text
  textDark:     '#1F1C1B',
  textLight:    '#FAFBF8',
  mutedDark:    '#747474',
  mutedLight:   '#D9D6D5',
  softDark:     '#524048',

  // Stroke / border
  strokeLight:  '#E5E4E3',
  strokeDark:   '#004142',
  strokeDeep:   '#07282A',

  // Surfaces
  surfaceLight: '#FFFFFF',
  surfaceDark:  '#010808',
  panelDark:    '#031213',
  bgDark:       '#020F10',
  inputDark:    '#07282A',
  cyanSurface:  '#E5FEFF',
  darkCyan:     '#002B2C',
  grayLight:    '#F2F2F1',
  pageBgTop:    '#F6F7F4',
  pageBgBottom: '#F0EBE6',
  orangeBgDark: '#3D1A00',
  orangeBgLight:'#FFF2EB',
} as const

// ─── Themed Palette Helper ─────────────────────────────────────

export function themed(isDark: boolean) {
  return {
    text:        isDark ? color.textLight   : color.textDark,
    textMuted:   isDark ? color.mutedLight  : color.mutedDark,
    accent:      isDark ? color.cyan        : color.teal,
    accent2:     isDark ? color.orangeAccent: color.orange,
    stroke:      isDark ? color.strokeDark  : color.strokeLight,
    surface:     isDark ? color.surfaceDark : color.surfaceLight,
    tag:         isDark ? color.mutedLight  : color.softDark,
    badge:       isDark ? color.darkCyan    : color.cyanSurface,
  } as const
}

// ─── Typography ───────────────────────────────────────────────

export const font = {
  heading: "'Montserrat', sans-serif",
  body:    "'Roboto', sans-serif",
} as const

// ─── Border Radius ────────────────────────────────────────────

export const radius = {
  cardShell:  '32px',
  cardInner:  '28px',
  subPanel:   '24px',
  medium:     '20px',
  button:     '14px',   // large buttons / CTA
  buttonSm:   '12px',
  pill:       '9999px',
} as const

// ─── Border Widths ────────────────────────────────────────────

export const borderWidth = {
  cardShell:  '4.3px',
  subPanel:   '3.3px',
  accent:     '3px',
  thin:       '1.5px',
} as const

// ─── Shadows ──────────────────────────────────────────────────

export const shadow = {
  /** Glass card — light mode */
  cardLight:       '0 24px 60px rgba(31, 28, 27, 0.12)',
  /** Glass card — dark mode */
  cardDark:        '0 24px 90px rgba(0, 10, 10, 0.82)',
  /** Sub-panel — light mode */
  panelLight:      '0 7px 17px -5px rgba(31,28,27,0.15), 0 0 16px -10px rgba(0,121,112,0.3)',
  /** Sub-panel — dark mode */
  panelDark:       '0 7px 17px -5px rgba(0,0,0,0.4), 0 0 16px -10px rgba(100,244,245,0.15)',
  /** Sub-panel — hover light */
  panelHoverLight: '0 14px 34px -10px rgba(31,28,27,0.3), 0 0 28px -6px rgba(0,121,112,0.68)',
  /** Sub-panel — hover dark */
  panelHoverDark:  '0 14px 34px -10px rgba(0,0,0,0.5), 0 0 28px -6px rgba(100,244,245,0.35)',
  /** CTA button */
  button:          '0 12px 40px rgba(0,121,112,0.25)',
  /** CTA button hover */
  buttonHover:     '0 18px 50px rgba(0,121,112,0.35)',
  /** Module card / button shadow */
  buttonAlt:       '0 16px 40px -12px rgba(0,121,112,0.55)',
} as const

export function themedShadow(isDark: boolean) {
  return {
    card:      isDark ? shadow.cardDark      : shadow.cardLight,
    panel:     isDark ? shadow.panelDark     : shadow.panelLight,
    panelHover:isDark ? shadow.panelHoverDark: shadow.panelHoverLight,
  } as const
}

// ─── Gradients ────────────────────────────────────────────────

export const gradient = {
  /** Light mode app background (CSS custom property fallback) */
  appLight: 'radial-gradient(circle at 18% 12%, rgba(0,121,112,0.18) 0%, rgba(229,254,255,0.95) 38%, rgba(255,238,229,0.95) 100%)',
  /** Dark mode app background */
  appDark:  'radial-gradient(circle at top right, #020F10 0%, #010808 100%)',
  /** Night mode panel background */
  nightPanel: 'radial-gradient(circle at 20% 20%, #031213 0%, #010809 45%, #010809 100%)',
  /** Light mode alt page background */
  lightPage: 'linear-gradient(180deg, #F6F7F4 0%, #F0EBE6 100%)',
  /** CTA button gradient */
  ctaButton: 'linear-gradient(135deg, rgba(0,121,112,0.92), rgba(0,92,85,0.92))',
} as const

// ─── Blur ─────────────────────────────────────────────────────

export const blur = {
  /** Glass card shell (Tailwind backdrop-blur-2xl = 40px) */
  cardShell: '40px',
  /** Sub-panel (Tailwind backdrop-blur-sm = 4px) */
  subPanel: '4px',
  /** Badge / pill (Tailwind backdrop-blur-md = 12px) */
  badge: '12px',
  /** Inline overlay (16px) */
  overlay: '16px',
} as const

// ─── Z-Index ──────────────────────────────────────────────────

export const zIndex = {
  dock: 50,
  overlay: 40,
  modal: 60,
  cursor: 9999,
} as const

// ─── Onboarding Progress ─────────────────────────────────────

export const onboarding = {
  /** Total onboarding steps (Welcome, Calibration, CoursePreview, Layout, Henderson) */
  totalSteps: 5,
  /** Active dot width */
  dotActive: 32,
  /** Inactive dot width */
  dotInactive: 18,
  /** Dot height */
  dotHeight: 6,
} as const

// ─── Glass Card Tailwind Classes (frozen) ─────────────────────
//  Use these exact class strings. Do NOT modify.

export const tw = {
  /** Outer glass card shell — matches backup OnboardingCardFlow / WelcomeOrientationCard */
  glassCard: 'bg-white/0 dark:bg-[#010808]/55 backdrop-blur-2xl rounded-[32px] border-l-[4.3px]',
  /** Inner glass sub-panel — matches backup training milestone panels */
  glassPanel: 'backdrop-blur-sm bg-white/[0.06] dark:bg-white/[0.04] rounded-[24px] p-5 border-l-[3.3px]',
  /** Glass panel hover effect */
  glassPanelHover: 'hover:bg-white/[0.33] dark:hover:bg-white/[0.33] -translate-y-[1px] hover:-translate-y-[2px]',
  /** Glass panel shadow classes (light + dark) */
  glassPanelShadow: 'shadow-[0_7px_17px_-5px_rgba(31,28,27,0.15),0_0_16px_-10px_rgba(0,121,112,0.3)] dark:shadow-[0_7px_17px_-5px_rgba(0,0,0,0.4),0_0_16px_-10px_rgba(100,244,245,0.15)]',
  /** Glass panel hover shadow */
  glassPanelHoverShadow: 'hover:shadow-[0_14px_34px_-10px_rgba(31,28,27,0.3),0_0_28px_-6px_rgba(0,121,112,0.68)] dark:hover:shadow-[0_14px_34px_-10px_rgba(0,0,0,0.5),0_0_28px_-6px_rgba(100,244,245,0.35)]',
  /** Primary CTA button */
  ctaButton: 'inline-flex items-center gap-3 rounded-2xl bg-[#007970] hover:bg-[#006059] text-white font-bold tracking-wide transition-all duration-300 hover:-translate-y-1',
  /** CTA button shadow */
  ctaButtonShadow: 'shadow-[0_12px_40px_rgba(0,121,112,0.25)] hover:shadow-[0_18px_50px_rgba(0,121,112,0.35)]',
  /** Badge / pill */
  badge: 'inline-flex items-center gap-2 rounded-full backdrop-blur-md text-[0.75rem] font-bold uppercase tracking-[0.18em]',
  /** Section label (onboarding stepper) */
  sectionLabel: 'text-[11px] font-bold uppercase tracking-[0.24em]',
} as const
