/* ── ProgressDots ───────────────────────────────────────────────
 *  Onboarding step progress indicator.
 *  Matches the backup's exact dot sizing and coloring.
 *
 *  Usage:
 *    <ProgressDots current={2} total={5} isDark={isDark} />
 *
 *  LOCKED — do not change colors, sizes, or logic.
 *  Source of truth: design-tokens.ts → onboarding.*
 * ─────────────────────────────────────────────────────────────── */

import { color, onboarding } from '../../design-tokens'

interface ProgressDotsProps {
  /** 0-based index of the current step */
  current: number
  /** Total number of steps */
  total?: number
  isDark?: boolean
}

export default function ProgressDots({
  current,
  total = onboarding.totalSteps,
  isDark = false,
}: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="h-[6px] rounded-full"
          style={{
            width: i === current ? onboarding.dotActive : onboarding.dotInactive,
            background:
              i < current
                ? isDark ? color.strokeDark : color.mutedLight
                : i === current
                  ? isDark ? color.cyan : color.teal
                  : isDark ? color.strokeDeep : color.strokeLight,
          }}
        />
      ))}
    </div>
  )
}
