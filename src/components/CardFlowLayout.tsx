import type { ReactNode } from 'react'
import { BackgroundRipple } from './BackgroundRipple'

export const CardFlowLayout = ({ children, isDarkMode }: { children: ReactNode; isDarkMode: boolean }) => {
  return (
    <div className={`relative h-screen w-screen overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#09090b] text-[#F3F4F6]' : 'bg-[#FAFBF8] text-[#1F1C1B]'}`}>
      <BackgroundRipple isDarkMode={isDarkMode} />

      <main className={`relative z-10 flex h-full w-full items-center justify-center p-4 md:p-8`}>
        <div className={`flex w-full items-center justify-center h-full max-w-6xl max-h-[750px]`}>{children}</div>
      </main>
    </div>
  )
}
