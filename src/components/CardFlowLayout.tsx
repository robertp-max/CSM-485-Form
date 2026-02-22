import type { ReactNode } from 'react'
import { BackgroundRipple } from './BackgroundRipple'

export const CardFlowLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1B4F72] font-sans text-brand-charcoal">
      <BackgroundRipple />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-4 md:p-8">
        <div className="w-full">{children}</div>
      </main>
    </div>
  )
}
