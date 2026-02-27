import { useState, useRef, useEffect, useCallback } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { sfxHover, sfxClick } from '../utils/sfx'

export type DockItem = {
  icon: ReactNode
  label: string
  onClick: () => void
  isActive?: boolean
}

type DockProps = {
  items: DockItem[]
  position?: 'bottom-right' | 'bottom-center' | 'center-left'
  isDarkMode?: boolean
}

export const Dock = ({ items, position = 'bottom-right', isDarkMode = false }: DockProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const dockRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Drag state (resets on refresh) ────────────────────────
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 })

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('[data-dock-drag]')) return
    e.preventDefault()
    dragState.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: dragOffset.x, origY: dragOffset.y }
    dockRef.current?.setPointerCapture(e.pointerId)
  }, [dragOffset])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.dragging) return
    setDragOffset({
      x: dragState.current.origX + (e.clientX - dragState.current.startX),
      y: dragState.current.origY + (e.clientY - dragState.current.startY),
    })
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.dragging) return
    dragState.current.dragging = false
    dockRef.current?.releasePointerCapture(e.pointerId)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsExpanded(true)
  }

  const handleMouseLeave = () => {
    setHoveredIndex(null)
    timeoutRef.current = setTimeout(() => setIsExpanded(false), 300)
  }

  const getScale = (index: number): number => {
    if (hoveredIndex === null) return 1
    const distance = Math.abs(index - hoveredIndex)
    if (distance === 0) return 1.25
    if (distance === 1) return 1.1
    return 1
  }

  const positionClasses = position === 'bottom-right'
    ? 'fixed bottom-6 right-6 z-50'
    : position === 'bottom-center'
      ? 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50'
      : 'fixed left-6 top-1/2 -translate-y-1/2 z-50'

  return (
    <div
      ref={dockRef}
      className={`${positionClasses} group`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`, touchAction: 'none' }}
    >
      {/* Drag handle */}
      <div
        data-dock-drag
        className={`absolute -top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-1 rounded-full cursor-grab active:cursor-grabbing select-none
                   backdrop-blur-md border shadow-lg transition-all opacity-0 group-hover:opacity-100 ${
                     isDarkMode
                       ? 'bg-white/10 border-white/20 hover:border-white/40'
                       : 'bg-black/60 border-white/20 hover:border-white/40'
                   }`}
        style={{ touchAction: 'none' }}
      >
        <svg width="12" height="6" viewBox="0 0 12 6" className="text-white/50">
          <circle cx="1.5" cy="1" r="1" fill="currentColor"/><circle cx="5" cy="1" r="1" fill="currentColor"/><circle cx="8.5" cy="1" r="1" fill="currentColor"/>
          <circle cx="1.5" cy="5" r="1" fill="currentColor"/><circle cx="5" cy="5" r="1" fill="currentColor"/><circle cx="8.5" cy="5" r="1" fill="currentColor"/>
        </svg>
        <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest">Drag</span>
      </div>
      <div
        className={`flex items-end gap-1 px-3 py-2 rounded-2xl border backdrop-blur-md shadow-[0_8px_32px_rgba(31,28,27,0.12)] transition-all duration-300 ${
          isDarkMode
            ? 'border-white/10 bg-[#151518]/95'
            : 'border-[#E5E4E3] bg-white/95'
        } ${isExpanded ? 'opacity-100' : 'opacity-90'}`}
      >
        {items.map((item, index) => {
          const scale = getScale(index)
          const isHovered = hoveredIndex === index

          const itemStyle: CSSProperties = {
            transform: `scale(${scale})`,
            transition: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }

          return (
            <div key={item.label} className="relative flex flex-col items-center">
              {/* Tooltip */}
              {isHovered && (
                <div className={`absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide shadow-lg pointer-events-none z-10 ${
                  isDarkMode ? 'bg-white text-[#1F1C1B]' : 'bg-[#1F1C1B] text-white'
                }`}>
                  {item.label}
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${
                    isDarkMode ? 'border-t-white' : 'border-t-[#1F1C1B]'
                  }`} />
                </div>
              )}

              <button
                style={itemStyle}
                onMouseEnter={() => { setHoveredIndex(index); sfxHover(); }}
                onClick={() => { sfxClick(); item.onClick(); }}
                className={`flex items-center justify-center w-11 h-11 rounded-xl transition-colors duration-200 ${
                  item.isActive
                    ? 'bg-[#007970] text-white shadow-[0_2px_8px_rgba(0,121,112,0.3)]'
                    : isDarkMode
                      ? 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      : 'bg-[#F7F7F6] text-[#524048] hover:bg-[#E5FEFF] hover:text-[#007970]'
                }`}
                aria-label={item.label}
              >
                {item.icon}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
