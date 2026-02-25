/* ── WebView Layout Wrapper ────────────────────────────────────────
 *  Alternative layout: full-width, scroll-based web page style.
 *  No height constraints — content flows naturally.
 * ─────────────────────────────────────────────────────────────────── */

import type { ReactNode } from 'react'

export function WebView({ children, isDarkMode }: { children: ReactNode; isDarkMode: boolean }) {
  return (
    <div
      className={`relative min-h-screen w-screen font-sans transition-colors duration-200 ${
        isDarkMode ? 'bg-[#09090b] text-[#F3F4F6]' : 'bg-[#FAFBF8] text-[#1F1C1B]'
      }`}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#007970] focus:text-white focus:rounded-md focus:font-bold">Skip to content</a>
      <main id="main-content" className="relative z-10 mx-auto w-full max-w-screen-2xl min-h-screen">
        <div className="h-screen w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
