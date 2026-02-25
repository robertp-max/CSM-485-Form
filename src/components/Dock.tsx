import { useState, useRef, useEffect } from 'react'
import type { ReactNode, CSSProperties } from 'react'

export type DockItem = {
  icon: ReactNode
  label: string
  onClick: () => void
  isActive?: boolean
}

type DockProps = {
  items: DockItem[]
  position?: 'bottom-right' | 'bottom-center'
}

export const Dock = ({ items, position = 'bottom-right' }: DockProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const dockRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    : 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50'

  return (
    <div
      ref={dockRef}
      className={positionClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`flex items-end gap-1 px-3 py-2 rounded-2xl border border-[#E5E4E3] bg-white/95 backdrop-blur-md shadow-[0_8px_32px_rgba(31,28,27,0.12)] transition-all duration-300 ${
          isExpanded ? 'opacity-100' : 'opacity-90'
        }`}
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
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#1F1C1B] text-white text-[10px] font-semibold tracking-wide shadow-lg pointer-events-none z-10">
                  {item.label}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#1F1C1B]" />
                </div>
              )}

              <button
                style={itemStyle}
                onMouseEnter={() => setHoveredIndex(index)}
                onClick={item.onClick}
                className={`flex items-center justify-center w-11 h-11 rounded-xl transition-colors duration-200 ${
                  item.isActive
                    ? 'bg-[#007970] text-white shadow-[0_2px_8px_rgba(0,121,112,0.3)]'
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
