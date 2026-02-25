import { LayoutPanelLeft, Rows3 } from 'lucide-react'
import { useLayoutMode } from '../hooks/useLayoutMode'

type Props = {
  isDarkMode: boolean
  compact?: boolean
}

export function ViewModeToggle({ isDarkMode, compact = false }: Props) {
  const { mode, setMode } = useLayoutMode()

  const containerClass = isDarkMode
    ? 'border-white/15 bg-black/45 text-white'
    : 'border-[#D9D6D5] bg-white text-[#1F1C1B]'

  const activeClass = isDarkMode
    ? 'bg-[#007970]/25 text-[#64F4F5] border-[#64F4F5]/35'
    : 'bg-[#E5FEFF] text-[#007970] border-[#007970]/30'

  const inactiveClass = isDarkMode
    ? 'text-white/65 hover:text-white hover:bg-white/10 border-transparent'
    : 'text-[#747474] hover:text-[#1F1C1B] hover:bg-[#FAFBF8] border-transparent'

  return (
    <div className={`inline-flex items-center gap-1 rounded-lg border p-1 transition-colors duration-200 ${containerClass}`} role="group" aria-label="View mode">
      <button
        type="button"
        onClick={() => setMode('card')}
        aria-pressed={mode === 'card'}
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64F4F5] ${mode === 'card' ? activeClass : inactiveClass}`}
      >
        <LayoutPanelLeft className="h-3.5 w-3.5" />
        {!compact && <span>Card View</span>}
      </button>
      <button
        type="button"
        onClick={() => setMode('web')}
        aria-pressed={mode === 'web'}
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64F4F5] ${mode === 'web' ? activeClass : inactiveClass}`}
      >
        <Rows3 className="h-3.5 w-3.5" />
        {!compact && <span>Web View</span>}
      </button>
    </div>
  )
}
