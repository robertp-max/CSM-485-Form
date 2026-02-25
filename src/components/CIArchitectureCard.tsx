import React from 'react'
import { Card } from './ui/Card'

// The architecture content now lives on the Systems page (systems-documentation.html).
// Render it in an iframe so the user sees the Systems content in-context.
export const CIArchitectureCard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const systemsUrl = `${window.location.origin}${window.location.pathname.replace(/index\.html.*$/, '')}systems-documentation.html`
  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center pt-12">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-[92%] max-w-[1280px] h-[88%]">
        <Card className="h-full overflow-hidden">
          <div className="flex items-center justify-between mb-4 px-4 py-2">
            <h2 className="text-xl font-bold">Systems · CI eLearner Architecture</h2>
            <div className="flex items-center gap-2">
              <a href={systemsUrl} target="_blank" rel="noreferrer" className="px-3 py-1 text-sm rounded bg-[#C74601] text-white">Open Systems</a>
              <button onClick={onClose} className="px-3 py-1 text-sm rounded bg-[#111] text-white/90">Close</button>
            </div>
          </div>
          <div className="h-[calc(100%-56px)] overflow-auto">
            <iframe
              title="Systems Documentation"
              src={systemsUrl}
              className="w-full h-full border-0"
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
