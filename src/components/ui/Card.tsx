import type { MouseEvent, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  onClick?: (event: MouseEvent<HTMLDivElement>) => void
}

export const Card = ({ children, className, title, onClick }: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={twMerge('relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors duration-300', className)}
    >
      {title && <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>}
      {children}
    </div>
  )
}
