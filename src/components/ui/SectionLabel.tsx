/* ── SectionLabel ───────────────────────────────────────────────
 *  Onboarding section label with step counter.
 *  Matches the backup's "Onboarding 3 / 5" header pattern.
 *
 *  Usage:
 *    <SectionLabel label="Onboarding" current={3} total={5} isDark={isDark} />
 *
 *  LOCKED — do not change typography or colors.
 * ─────────────────────────────────────────────────────────────── */

import { color } from '../../design-tokens'

interface SectionLabelProps {
  label: string
  current: number
  total: number
  isDark?: boolean
}

export default function SectionLabel({
  label,
  current,
  total,
  isDark = false,
}: SectionLabelProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="text-[11px] font-bold uppercase tracking-[0.24em]"
        style={{ color: isDark ? color.cyan : color.orange }}
      >
        {label}
      </div>
      <div
        className="flex items-center gap-2 text-xl font-heading font-bold"
        style={{ color: isDark ? color.textLight : color.textDark }}
      >
        {current}{' '}
        <span
          className="text-sm font-normal"
          style={{ color: isDark ? color.cyan : color.mutedDark }}
        >
          / {total}
        </span>
      </div>
    </div>
  )
}
