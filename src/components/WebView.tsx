/* ── WebView Layout Wrapper ────────────────────────────────────────
 *  Alternative layout: full-width, scroll-based web page style.
 *  No height constraints — content flows naturally.
 * ─────────────────────────────────────────────────────────────────── */

import type { ReactNode } from 'react'

export function WebView({ children, isDarkMode }: { children: ReactNode; isDarkMode: boolean }) {
  return (
    <div
      className={`relative flex h-screen w-screen overflow-hidden font-sans transition-colors duration-200 ${
        isDarkMode
          ? 'bg-[#010809] text-[#FAFBF8]'
          : 'bg-[#FAFBF8] text-[#1F1C1B]'
      }`}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#007970] focus:text-white focus:rounded-md focus:font-bold">Skip to content</a>
      <main id="main-content" className={`relative z-10 flex-1 flex flex-col ${
        isDarkMode
          ? 'bg-[radial-gradient(circle_at_top_right,_#004142_0%,_#001A1A_80%)]'
          : 'bg-[radial-gradient(circle_at_top_right,_#FAFBF8_0%,_#E5E4E3_100%)]'
      }`}>
        {isDarkMode ? (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#C74601] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.20] animate-pulse pointer-events-none z-0" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#E56E2E] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.15] pointer-events-none z-0" />
          </>
        ) : (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#007970] rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.06] animate-pulse pointer-events-none z-0" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#C74601] rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.05] pointer-events-none z-0" />
          </>
        )}
        <div className="relative z-10 flex w-full flex-1 flex-col">{children}</div>
      </main>
    </div>
  )
}
