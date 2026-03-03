/* ── GlassCard ──────────────────────────────────────────────────
 *  Reusable frosted glass card shell.
 *  Matches the backup's outer card pattern exactly.
 *
 *  Usage:
 *    <GlassCard isDark={isDark}>…children…</GlassCard>
 *
 *  LOCKED — do not change class strings or shadows.
 *  Source of truth: design-tokens.ts → tw.glassCard
 * ─────────────────────────────────────────────────────────────── */

import type { ReactNode, CSSProperties } from 'react'
import { color, shadow, borderWidth, radius } from '../../design-tokens'

interface GlassCardProps {
  children: ReactNode
  isDark?: boolean
  className?: string
  style?: CSSProperties
  /** Override accent border color (default: cyan for dark, orange for light) */
  accentColor?: string
}

export default function GlassCard({
  children,
  isDark = false,
  className = '',
  style,
  accentColor,
}: GlassCardProps) {
  const borderColor = accentColor ?? (isDark ? color.cyan : color.orange)

  return (
    <div
      className={`bg-white/0 dark:bg-[#010808]/55 backdrop-blur-2xl rounded-[32px] overflow-hidden border-l-[4.3px] ${className}`}
      style={{
        borderLeftColor: borderColor,
        boxShadow: isDark ? shadow.cardDark : shadow.cardLight,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** Re-export token values for reference */
export { radius, borderWidth, shadow }
