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
      <div
        className={`flex ${position === 'center-left' ? 'flex-col items-center gap-3' : 'items-end gap-1'} px-0 py-0 bg-transparent border-none shadow-none backdrop-blur-0 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-90'}`}
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
                className={`flex items-center justify-center w-11 h-11 rounded-none transition-colors duration-200 border-none shadow-none ${
                  item.isActive
                    ? 'bg-transparent text-[#007970] dark:text-[#64F4F5]'
                    : isDarkMode
                      ? 'bg-transparent text-white/60 hover:text-white'
                      : 'bg-transparent text-[#524048] hover:text-[#007970]'
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
