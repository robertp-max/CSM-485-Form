import React from 'react'
import { Card } from './ui/Card'
import archHtml from '../assets/CI_eLearning_Architecture.html?raw'

export const CIArchitectureCard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center pt-12">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-[90%] max-w-[1200px] h-[80%]">
        <Card className="h-full overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">CI eLearner Architecture</h2>
            <button onClick={onClose} className="px-3 py-1 text-sm rounded bg-[#007970] text-white">Close</button>
          </div>
          <div className="h-[calc(100%-48px)] overflow-auto">
            <iframe
              title="CI eLearner Architecture"
              srcDoc={archHtml}
              className="w-full h-full border-0"
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
