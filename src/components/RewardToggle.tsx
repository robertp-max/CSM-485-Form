/* ── RewardToggle — Floating cursor-reward on/off pill ─────────
 *  Shows during practice & training phases when a cursor prize
 *  is active. Clicking it toggles the visual effect on/off.
 * ─────────────────────────────────────────────────────────────── */

import { MousePointer2, Sparkles } from 'lucide-react'

type PrizeId = 'retake-challenge' | 'blob-cursor' | 'splash-cursor' | null

interface RewardToggleProps {
  prize: PrizeId
  enabled: boolean
  onToggle: () => void
}

export default function RewardToggle({ prize, enabled, onToggle }: RewardToggleProps) {
  // Only show for cursor prizes
  if (prize !== 'blob-cursor' && prize !== 'splash-cursor') return null

  const Icon = prize === 'blob-cursor' ? MousePointer2 : Sparkles
  const label = prize === 'blob-cursor' ? 'Blob Cursor' : 'Splash Cursor'

  return (
    <button
      onClick={onToggle}
      className="fixed bottom-5 right-5 z-[9999] flex items-center gap-2.5 pl-3.5 pr-3 py-2 rounded-full border transition-all duration-300 hover:scale-[1.04] active:scale-95 shadow-xl backdrop-blur-xl group"
      style={{
        background: enabled
          ? 'rgba(0, 121, 112, 0.88)'
          : 'rgba(30, 30, 30, 0.72)',
        borderColor: enabled
          ? 'rgba(100, 244, 245, 0.35)'
          : 'rgba(255, 255, 255, 0.12)',
        boxShadow: enabled
          ? '0 8px 32px rgba(0, 121, 112, 0.35), 0 2px 8px rgba(0,0,0,0.2)'
          : '0 4px 20px rgba(0,0,0,0.3)',
      }}
      title={enabled ? `Turn off ${label}` : `Turn on ${label}`}
    >
      <Icon
        className="w-3.5 h-3.5 transition-colors"
        style={{ color: enabled ? '#E0FFFE' : '#9ca3af' }}
      />
      <span
        className="text-[11px] font-semibold tracking-wide transition-colors"
        style={{ color: enabled ? '#fff' : '#9ca3af' }}
      >
        {label}
      </span>

      {/* Mini toggle switch */}
      <span
        className="relative w-7 h-3.5 rounded-full transition-colors duration-300 flex-shrink-0"
        style={{
          background: enabled
            ? 'rgba(100, 244, 245, 0.3)'
            : 'rgba(255, 255, 255, 0.12)',
        }}
      >
        <span
          className="absolute top-[2px] w-2.5 h-2.5 rounded-full transition-all duration-300"
          style={{
            background: enabled ? '#64F4F5' : '#6b7280',
            left: enabled ? '14px' : '2px',
            boxShadow: enabled ? '0 0 6px rgba(100, 244, 245, 0.5)' : 'none',
          }}
        />
      </span>
    </button>
  )
}
