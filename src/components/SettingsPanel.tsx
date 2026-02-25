import { useState, useRef, useEffect } from 'react'
import { Settings, X } from 'lucide-react'

export type SettingsState = {
  appearance: 'light' | 'night'
  reducedMotion: boolean
  interactiveEffects: boolean
}

type SettingsPanelProps = {
  settings: SettingsState
  onSettingsChange: (settings: SettingsState) => void
}

export const SettingsPanel = ({ settings, onSettingsChange }: SettingsPanelProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const toggle = (key: keyof SettingsState) => {
    if (key === 'appearance') {
      onSettingsChange({
        ...settings,
        appearance: settings.appearance === 'light' ? 'night' : 'light',
      })
    } else {
      onSettingsChange({
        ...settings,
        [key]: !settings[key],
      })
    }
  }

  const isNight = settings.appearance === 'night'

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
          isNight
            ? 'text-white/70 hover:text-white hover:bg-white/10'
            : 'text-[#524048] hover:text-[#1F1C1B] hover:bg-[#F2F2F1]'
        }`}
        aria-label="Settings"
      >
        <Settings className="h-[18px] w-[18px]" />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full right-0 mt-2 w-72 rounded-xl border shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden z-50 ${
            isNight
              ? 'bg-[#151518] border-white/10 text-white'
              : 'bg-white border-[#E5E4E3] text-[#1F1C1B]'
          }`}
        >
          <div className={`flex items-center justify-between px-5 py-3 border-b ${isNight ? 'border-white/10' : 'border-[#E5E4E3]'}`}>
            <span className="text-xs font-semibold uppercase tracking-[0.12em]">Settings</span>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-black/5">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Appearance */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Appearance</p>
                <p className={`text-[11px] ${isNight ? 'text-white/50' : 'text-[#747474]'}`}>
                  {isNight ? 'Night mode' : 'Light mode'}
                </p>
              </div>
              <button
                onClick={() => toggle('appearance')}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isNight ? 'bg-[#007970]' : 'bg-[#E5E4E3]'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    isNight ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Reduced Motion</p>
                <p className={`text-[11px] ${isNight ? 'text-white/50' : 'text-[#747474]'}`}>
                  Minimize animations
                </p>
              </div>
              <button
                onClick={() => toggle('reducedMotion')}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.reducedMotion ? 'bg-[#007970]' : isNight ? 'bg-white/20' : 'bg-[#E5E4E3]'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    settings.reducedMotion ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Interactive Effects */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Interactive Effects</p>
                <p className={`text-[11px] ${isNight ? 'text-white/50' : 'text-[#747474]'}`}>
                  Hover shadows & transforms
                </p>
              </div>
              <button
                onClick={() => toggle('interactiveEffects')}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.interactiveEffects ? 'bg-[#007970]' : isNight ? 'bg-white/20' : 'bg-[#E5E4E3]'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    settings.interactiveEffects ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
