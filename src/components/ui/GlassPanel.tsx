/* ── GlassPanel ─────────────────────────────────────────────────
 *  Reusable frosted glass sub-panel / milestone tile.
 *  Matches the backup's inner panel pattern exactly.
 *
 *  Usage:
 *    <GlassPanel accentClass="border-l-[#007970]">…</GlassPanel>
 *
 *  LOCKED — do not change class strings or shadows.
 *  Source of truth: design-tokens.ts → tw.glassPanel
 * ─────────────────────────────────────────────────────────────── */

import type { ReactNode, CSSProperties } from 'react'

interface GlassPanelProps {
  children: ReactNode
  /** Tailwind border-l color class, e.g. "border-l-[#007970] dark:border-l-[#64F4F5]" */
  accentClass?: string
  /** Enable hover effects (lift + shadow intensify) */
  hoverable?: boolean
  className?: string
  style?: CSSProperties
}

export default function GlassPanel({
  children,
  accentClass = 'border-l-[#007970] dark:border-l-[#64F4F5]',
  hoverable = true,
  className = '',
  style,
}: GlassPanelProps) {
  const hoverClasses = hoverable
    ? 'hover:shadow-[0_14px_34px_-10px_rgba(31,28,27,0.3),0_0_28px_-6px_rgba(0,121,112,0.68)] dark:hover:shadow-[0_14px_34px_-10px_rgba(0,0,0,0.5),0_0_28px_-6px_rgba(100,244,245,0.35)] hover:bg-white/[0.33] dark:hover:bg-white/[0.33] -translate-y-[1px] hover:-translate-y-[2px]'
    : ''

  return (
    <div
      className={`backdrop-blur-sm bg-white/[0.06] dark:bg-white/[0.04] rounded-[24px] p-5 border-l-[3.3px] ${accentClass} shadow-[0_7px_17px_-5px_rgba(31,28,27,0.15),0_0_16px_-10px_rgba(0,121,112,0.3)] dark:shadow-[0_7px_17px_-5px_rgba(0,0,0,0.4),0_0_16px_-10px_rgba(100,244,245,0.15)] transition-all duration-300 ${hoverClasses} ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
