/* ── CardView Layout Wrapper ───────────────────────────────────────
 *  Default layout: constrained, centered card with backdrop effects.
 *  Black background with glass morphism cards + LiquidEther bg.
 * ─────────────────────────────────────────────────────────────────── */

import type { ReactNode } from 'react'
import { BackgroundRipple } from './BackgroundRipple'
import { LiquidEther } from './LiquidEther'

export function CardView({ children, isDarkMode }: { children: ReactNode; isDarkMode: boolean }) {
  return (
    <div
      className={`relative h-screen w-screen overflow-hidden font-sans transition-colors duration-200 ${
        isDarkMode ? 'bg-black text-[#F3F4F6]' : 'bg-[#FAFBF8] text-[#1F1C1B]'
      }`}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#007970] focus:text-white focus:rounded-md focus:font-bold">Skip to content</a>
      {isDarkMode && <BackgroundRipple isDarkMode={isDarkMode} />}
      {isDarkMode && <LiquidEther opacity={0.6} speed={0.15} />}

      <main id="main-content" className="relative z-10 flex h-full w-full items-center justify-center p-2 md:p-4">
        <div className="flex w-full items-center justify-center h-full max-w-7xl max-h-[850px]">
          {children}
        </div>
      </main>
    </div>
  )
}
