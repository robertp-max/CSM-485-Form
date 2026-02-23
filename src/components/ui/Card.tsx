import type { MouseEvent, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  onClick?: (event: MouseEvent<HTMLDivElement>) => void
}

export const Card = ({ children, className, title, onClick }: CardProps) => {
  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const x = (event.clientX - rect.left - rect.width / 2) / rect.width
    const y = (event.clientY - rect.top - rect.height / 2) / rect.height
    target.style.transform = `rotateX(${-y * 3}deg) rotateY(${x * 4}deg) translateY(-2px)`
  }

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    event.currentTarget.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0px)'
  }

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const ripple = document.createElement('span')
    ripple.className = 'ripple-dot'
    ripple.style.left = `${event.clientX - rect.left}px`
    ripple.style.top = `${event.clientY - rect.top}px`
    target.appendChild(ripple)
    window.setTimeout(() => ripple.remove(), 700)
    onClick?.(event)
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={twMerge('interactive-card relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:shadow-xl hover:shadow-brand-navyDark/50', className)}
    >
      {title && <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>}
      {children}
    </div>
  )
}
