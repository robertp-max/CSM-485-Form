/* ── PageFrame ──────────────────────────────────────────────────
 *  Full-page layout wrapper with themed gradient background.
 *  Matches the backup's onboarding page layout pattern.
 *
 *  Usage:
 *    <PageFrame isDark={isDark}>
 *      <div className="max-w-6xl mx-auto w-full">…</div>
 *    </PageFrame>
 *
 *  LOCKED — do not change gradients or base layout.
 *  Source of truth: design-tokens.ts → gradient.*
 * ─────────────────────────────────────────────────────────────── */

import type { ReactNode, CSSProperties } from 'react'
import { gradient, color } from '../../design-tokens'

interface PageFrameProps {
  children: ReactNode
  isDark?: boolean
  /** Override background (default: themed app gradient) */
  background?: string
  className?: string
  style?: CSSProperties
}

export default function PageFrame({
  children,
  isDark = false,
  background,
  className = '',
  style,
}: PageFrameProps) {
  const bg = background ?? (isDark ? gradient.nightPanel : 'var(--app-gradient)')

  return (
    <div
      className={`min-h-screen w-full px-5 md:px-10 py-8 md:py-12 flex items-center ${className}`}
      style={{
        background: bg,
        color: isDark ? color.textLight : color.textDark,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
