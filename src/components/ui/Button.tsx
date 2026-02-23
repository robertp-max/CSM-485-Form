import { useState } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  icon?: ReactNode
  magnetic?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-gold text-brand-navyDark border border-brand-goldDark hover:bg-brand-goldLight shadow-[0_8px_16px_rgba(27,38,59,0.2)]',
  secondary: 'bg-brand-navy text-white border border-brand-navyLight hover:bg-brand-navyDark',
  ghost: 'bg-transparent text-brand-navy border border-brand-navyLight hover:bg-brand-sky',
}

export const Button = ({
  children,
  variant = 'primary',
  className,
  icon,
  magnetic = true,
  onMouseMove,
  onMouseLeave,
  onClick,
  ...props
}: ButtonProps) => {
  const [transform, setTransform] = useState('translate3d(0,0,0)')

  const handleMouseMove: ButtonProps['onMouseMove'] = (event) => {
    onMouseMove?.(event)
    if (!magnetic) {
      return
    }

    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const x = (event.clientX - rect.left - rect.width / 2) / rect.width
    const y = (event.clientY - rect.top - rect.height / 2) / rect.height
    setTransform(`translate3d(${x * 8}px, ${y * 6}px, 0)`)
  }

  const handleMouseLeave: ButtonProps['onMouseLeave'] = (event) => {
    onMouseLeave?.(event)
    setTransform('translate3d(0,0,0)')
  }

  const handleClick: ButtonProps['onClick'] = (event) => {
    onClick?.(event)
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const ripple = document.createElement('span')
    ripple.className = 'ripple-dot'
    ripple.style.left = `${event.clientX - rect.left}px`
    ripple.style.top = `${event.clientY - rect.top}px`
    target.appendChild(ripple)
    window.setTimeout(() => ripple.remove(), 700)
  }

  return (
    <button
      {...props}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={twMerge(
        'premium-btn group inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        variantClasses[variant],
        className,
      )}
      style={{ transform }}
    >
      <span>{children}</span>
      {icon && <span className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-0.5">{icon}</span>}
    </button>
  )
}
