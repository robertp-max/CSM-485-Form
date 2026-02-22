import { useRef } from 'react'
import type { ReactNode } from 'react'
import { useInView } from '../hooks/useInView'

interface RevealSectionProps {
  children: ReactNode
  delayMs?: number
  className?: string
}

export const RevealSection = ({ children, delayMs = 0, className }: RevealSectionProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'in-view' : ''} ${className ?? ''}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  )
}
