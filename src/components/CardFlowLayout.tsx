import type { ReactNode } from 'react'
import { BackgroundRipple } from './BackgroundRipple'

export const CardFlowLayout = ({ children, isDarkMode }: { children: ReactNode; isDarkMode: boolean }) => {
  return (
    <div className={`relative h-screen w-screen overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#09090b] text-[#F3F4F6]' : 'bg-[#FAFBF8] text-[#1F1C1B]'}`}>
      <BackgroundRipple isDarkMode={isDarkMode} />

      <main className={`relative z-10 flex h-full w-full items-center justify-center p-2 md:p-4`}>
        <div className={`flex w-full items-center justify-center h-full max-w-7xl max-h-[850px]`}>{children}</div>
      </main>
    </div>
  )
}
