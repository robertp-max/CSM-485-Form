/* ── CardView Layout Wrapper ───────────────────────────────────────
 *  Default layout: constrained, centered card with backdrop effects.
 *  Black background with glass morphism cards + LiquidEther bg.
 * ─────────────────────────────────────────────────────────────────── */

import type { ReactNode } from 'react'

export function CardView({ children, isDarkMode }: { children: ReactNode; isDarkMode: boolean }) {
  return (
    <div
      className={`min-h-screen font-sans p-4 md:p-8 flex items-center justify-center relative overflow-hidden transition-colors duration-200 ${
        isDarkMode
          ? 'bg-[radial-gradient(circle_at_top_right,_#004142_0%,_#001A1A_80%)] text-[#FAFBF8]'
          : 'bg-[radial-gradient(circle_at_top_right,_#FAFBF8_0%,_#D9D6D5_100%)] text-[#1F1C1B]'
      }`}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#007970] focus:text-white focus:rounded-md focus:font-bold">Skip to content</a>

      {/* Decorative ambient glows */}
      {isDarkMode ? (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C74601] rounded-full mix-blend-screen blur-[120px] opacity-[0.25] animate-pulse pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#E56E2E] rounded-full mix-blend-screen blur-[120px] opacity-[0.20] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#007970] rounded-full mix-blend-multiply blur-[120px] opacity-[0.07] animate-pulse pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#C74601] rounded-full mix-blend-multiply blur-[120px] opacity-[0.05] pointer-events-none" />
        </>
      )}

      <main id="main-content" className="relative z-10 w-full flex items-center justify-center">
        <div className="flex w-full items-center justify-center max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  )
}
