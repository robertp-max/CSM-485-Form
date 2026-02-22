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
      className={twMerge('interactive-card rounded-lg border border-brand-navyLight bg-white p-6 shadow-sm', className)}
    >
      {title && <h3 className="mb-4 text-lg font-semibold text-brand-navy">{title}</h3>}
      {children}
    </div>
  )
}
