/* ── WelcomeBanner — Light-mode branded landing page ───────────
 *  First screen the learner sees. CareIndeed-branded with a
 *  clean, professional layout and a prominent "Start" CTA.
 * ─────────────────────────────────────────────────────────────── */

import { useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  HeartPulse,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

interface WelcomeBannerProps {
  onStart: () => void
}

export default function WelcomeBanner({ onStart }: WelcomeBannerProps) {
  const [hovered, setHovered] = useState(false)

  const highlights = [
    { icon: FileText, label: 'Interactive CMS-485 Form', desc: 'Practice filling out a real Plan of Care' },
    { icon: ShieldCheck, label: 'Systems Calibration', desc: 'Configure your learning environment' },
    { icon: HeartPulse, label: 'Henderson Clinical Case', desc: 'High-acuity patient scenario' },
    { icon: GraduationCap, label: 'Competency Challenge', desc: 'Prove your documentation mastery' },
  ]

  return (
    <div className="min-h-screen bg-[#FAFBF8] text-[#1F1C1B] flex flex-col overflow-hidden relative"
         style={{ fontFamily: 'Roboto, sans-serif' }}>

      {/* Subtle brand gradient overlays */}
      <div className="absolute top-[-8%] right-[-6%] w-[45%] h-[45%] bg-[#007970] rounded-full mix-blend-multiply filter blur-[160px] opacity-[0.06] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-8%] w-[40%] h-[40%] bg-[#C74601] rounded-full mix-blend-multiply filter blur-[160px] opacity-[0.04] pointer-events-none" />
      <div className="absolute top-[30%] left-[50%] w-[30%] h-[30%] bg-[#64F4F5] rounded-full mix-blend-multiply filter blur-[180px] opacity-[0.03] pointer-events-none" />

      {/* Header */}
      <header className="px-8 lg:px-16 py-6 flex items-center justify-between relative z-10 border-b border-[#E5E4E3]">
        <div className="flex items-center gap-4">
          <img
            src="https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_Gray.png"
            alt="CareIndeed Home Health"
            className="h-8 w-auto object-contain"
          />
          <div className="hidden sm:block h-5 w-px bg-[#D9D6D5]" />
          <span className="hidden sm:inline text-xs font-bold tracking-[0.14em] uppercase text-[#747474]">
            Clinical Training Platform
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E5FEFF] border border-[#C4F4F5] text-[#007970] text-xs font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          New Module
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 lg:px-16 py-12 lg:py-20 relative z-10">
        <div className="max-w-4xl w-full text-center space-y-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-[#E5E4E3] shadow-sm text-[#C74601] text-xs font-bold uppercase tracking-[0.16em]">
            <BookOpen className="w-4 h-4" />
            CMS-485 Master Challenge
          </div>

          {/* Heading */}
          <div className="space-y-5">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
                style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Master the{' '}
              <span className="bg-gradient-to-r from-[#007970] to-[#64F4F5] bg-clip-text text-transparent">
                Plan of Care
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[#524048] max-w-2xl mx-auto leading-relaxed font-light">
              Welcome to CareIndeed's CMS-485 clinical documentation training.
              Configure your environment, practice on an interactive form, and
              prove your competency through a real-world patient scenario.
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-2">
            <button
              onClick={onStart}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-[#007970] hover:bg-[#006059] text-white font-bold text-lg tracking-wide transition-all duration-300 hover:-translate-y-1 shadow-[0_12px_40px_rgba(0,121,112,0.25)] hover:shadow-[0_18px_50px_rgba(0,121,112,0.35)]"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Begin Training
              <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${hovered ? 'translate-x-1' : ''}`} />
            </button>
            <p className="mt-4 text-sm text-[#747474]">
              Estimated time: 25–35 minutes
            </p>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-16 max-w-4xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="group bg-white border border-[#E5E4E3] rounded-2xl p-5 hover:border-[#007970]/30 hover:shadow-[0_8px_30px_rgba(0,121,112,0.06)] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E5FEFF] flex items-center justify-center mb-3 group-hover:bg-[#007970]/10 transition-colors">
                <h.icon className="w-5 h-5 text-[#007970]" />
              </div>
              <h3 className="font-semibold text-sm mb-1 text-[#1F1C1B]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {h.label}
              </h3>
              <p className="text-xs text-[#747474] leading-relaxed">
                {h.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mt-12 flex items-center gap-6 text-[#747474] text-xs tracking-wider uppercase">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#007970]" />
            HIPAA Compliant
          </div>
          <div className="h-3 w-px bg-[#D9D6D5]" />
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#007970]" />
            SCORM Compatible
          </div>
          <div className="h-3 w-px bg-[#D9D6D5]" />
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#007970]" />
            CareIndeed Certified
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 lg:px-16 py-4 border-t border-[#E5E4E3] flex items-center justify-between text-xs text-[#747474] relative z-10">
        <span>&copy; {new Date().getFullYear()} CareIndeed Home Health</span>
        <span>v2.0 · CMS-485 Documentation Module</span>
      </footer>
    </div>
  )
}
