import React from 'react'
import { Card } from './ui/Card'

export const CIArchitectureCard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center pt-12">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-[92%] max-w-[1280px] h-[88%]">
        <Card className="h-full overflow-hidden">
          <div className="flex items-center justify-between mb-4 px-4 py-2">
            <h2 className="text-xl font-bold">Systems · CI eLearner Architecture</h2>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-3 py-1 text-sm rounded bg-[#111] text-white/90">Close</button>
            </div>
          </div>
          <div className="h-[calc(100%-56px)] overflow-auto px-4 py-3">
            <div className="h-full w-full rounded-lg border border-white/15 bg-black/30 p-6 text-white/80">
              <p className="text-sm leading-relaxed">
                Architecture documentation links have been removed from the in-app experience.
              </p>
              <p className="mt-3 text-xs text-white/60">
                Use the primary shortcut dock for navigation.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
