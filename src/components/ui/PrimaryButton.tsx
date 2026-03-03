/* ── PrimaryButton ──────────────────────────────────────────────
 *  Reusable teal CTA button matching the backup's exact pattern.
 *
 *  Usage:
 *    <PrimaryButton onClick={fn}>Begin Training</PrimaryButton>
 *
 *  LOCKED — do not change colors, shadows, or radius.
 *  Source of truth: design-tokens.ts → tw.ctaButton
 * ─────────────────────────────────────────────────────────────── */

import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { font } from '../../design-tokens'

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  /** Small / medium / large sizing (default: medium) */
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'px-6 py-2.5 text-sm',
  md: 'px-10 py-4 text-base',
  lg: 'px-12 py-[18px] text-lg',
} as const

export default function PrimaryButton({
  children,
  size = 'md',
  className = '',
  style,
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      className={`group inline-flex items-center gap-3 rounded-2xl bg-[#007970] hover:bg-[#006059] text-white font-bold tracking-wide transition-all duration-300 hover:-translate-y-1 shadow-[0_12px_40px_rgba(0,121,112,0.25)] hover:shadow-[0_18px_50px_rgba(0,121,112,0.35)] ${sizeMap[size]} ${className}`}
      style={{ fontFamily: font.heading, ...style }}
      {...rest}
    >
      {children}
    </button>
  )
}
