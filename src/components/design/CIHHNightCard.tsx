import { useEffect, useRef, useState } from 'react'
import {
  Play, Pause,
  ArrowRight, ArrowLeft, CheckCircle2, XCircle,
  ShieldCheck, FileText, Activity, Check,
  Home, Settings, LayoutGrid, HeartPulse, GraduationCap, ClipboardCheck,
} from 'lucide-react'
import { TRAINING_CARDS } from '../../data/trainingCards'
import { FINAL_TEST_TITLE, FINAL_TEST_OBJECTIVE, FINAL_TEST_KEY_POINTS, FINAL_TEST_QUESTIONS } from '../../data/finalTest'

const StyleInjector = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Roboto:wght@300;400;500&display=swap');

      .font-heading { font-family: 'Montserrat', sans-serif; }
      .font-body { font-family: 'Roboto', sans-serif; }

      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #001A1A; }
      ::-webkit-scrollbar-thumb { background: #004142; border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: #007970; }

      .glow-orange { box-shadow: 0 0 24px -4px rgba(199, 70, 1, 0.6); }
      .glow-teal { box-shadow: 0 0 24px -4px rgba(100, 244, 245, 0.4); }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }
    `}
  </style>
)

const mapCardFromTraining = (c: any) => {
  const fallbackAdditional = [c.auditFocus, c.objective, ...(c.bullets ?? [])].filter(Boolean).join(' ')
  return {
    title: c.title,
    section: c.section ?? '',
    objective: c.objective ?? '',
    bullets: c.bullets ?? [],
    additional: fallbackAdditional,
    challenge: [
      c.bullets?.[0] ?? c.objective ?? 'Select the most defensible response.',
      c.bullets?.[1] ?? 'Use a generic template statement without patient-specific details.',
      c.bullets?.[2] ?? 'Delay documentation updates until episode end.',
    ],
  }
}

const cards = [
  ...TRAINING_CARDS.map(mapCardFromTraining),
  {
    title: FINAL_TEST_TITLE,
    section: 'Final Test',
    objective: FINAL_TEST_OBJECTIVE,
    bullets: FINAL_TEST_KEY_POINTS,
    additional: '',
    challenge: FINAL_TEST_QUESTIONS[0]?.options ?? ['See final test questions'],
  },
  { title: 'Completion', final: true },
]

export default function CIHHNightCard({ onNavigate }: { onNavigate?: (phase: string) => void }) {
  const [cardIndex, setCardIndex] = useState(0)
  const [panelMode, setPanelMode] = useState<'main' | 'additional' | 'challenge'>('main')
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | null>>(() => ({}))
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>(() => ({}))
  const [, setStatusMsg] = useState('QA mode bypasses locks')
  const [isPlaying, setIsPlaying] = useState(false)
  const [qaMode, setQaMode] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const VOICE_RECORDINGS = {
    ...import.meta.glob('../../assets/Voice Recordings/*.wav', { eager: true, import: 'default' }),
    ...import.meta.glob('../../assets/Voice Recordings/*.mp3', { eager: true, import: 'default' }),
  } as Record<string, string>

  const findAudioForTitle = (title: string) => {
    const key = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    for (const fp of Object.keys(VOICE_RECORDINGS)) {
      if (fp.toLowerCase().includes(key) || fp.toLowerCase().includes(title.toLowerCase().split(' ')[0])) return VOICE_RECORDINGS[fp]
    }
    return null
  }

  const card = cards[cardIndex] as any
  const audioUrl = card?.title ? findAudioForTitle(card.title) : null
  const hasAudio = Boolean(audioUrl)

  const additionalSummary = (() => {
    if (!card.additional) return ''
    const sentences = card.additional.split(/(?<=\.)\s+/).filter(Boolean)
    return sentences.slice(0, 2).join(' ').trim() || card.additional.slice(0, 180)
  })()

  const dockItems = [
    { icon: <FileText className="w-5 h-5" />, label: 'Help Center', onClick: () => { const nonce = Date.now(); window.location.hash = `/?dock=glossary&n=${nonce}`; window.dispatchEvent(new CustomEvent('dock-nav', { detail: 'glossary' })); } },
    { icon: <Activity className="w-5 h-5" />, label: 'Top', onClick: () => { setCardIndex(0); setPanelMode('main') } },
    ...(onNavigate ? [
      { icon: <Home className="w-5 h-5" />, label: 'Welcome', onClick: () => onNavigate('welcome') },
      { icon: <Settings className="w-5 h-5" />, label: 'Calibration', onClick: () => onNavigate('calibration') },
      { icon: <LayoutGrid className="w-5 h-5" />, label: 'Layout', onClick: () => onNavigate('layout-challenge') },
      { icon: <HeartPulse className="w-5 h-5" />, label: 'Henderson', onClick: () => onNavigate('henderson-challenge') },
      { icon: <GraduationCap className="w-5 h-5" />, label: 'Courses', onClick: () => onNavigate('course-selection') },
      { icon: <ClipboardCheck className="w-5 h-5" />, label: 'Final Exam', onClick: () => { const nonce = Date.now(); window.location.hash = `/?dock=final-exam&n=${nonce}`; window.dispatchEvent(new CustomEvent('dock-nav', { detail: 'final-exam' })); } },
    ] : []),
  ]

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
  }

  const handleNext = () => {
    if (!card.final && panelMode === 'main') {
      stopAudio()
      setPanelMode('additional')
      return
    }
    if (!card.final && panelMode === 'additional') {
      stopAudio()
      setPanelMode('challenge')
      return
    }
    if (panelMode === 'challenge' && !submittedAnswers[cardIndex] && !qaMode) {
      setStatusMsg('Submit the challenge to advance')
      return
    }
    if (cardIndex < cards.length - 1) {
      stopAudio()
      setCardIndex(cardIndex + 1)
      setPanelMode('main')
      setStatusMsg('QA mode bypasses locks')
    }
  }

  const handleBack = () => {
    stopAudio()
    if (panelMode === 'challenge') {
      setPanelMode('additional')
    } else if (panelMode === 'additional') {
      setPanelMode('main')
    } else if (cardIndex > 0) {
      setCardIndex(cardIndex - 1)
      setPanelMode('main')
    }
  }

  const handleSubmitChallenge = () => {
    const sel = selectedAnswers[cardIndex] ?? null
    if (sel !== null) {
      setSubmittedAnswers(prev => ({ ...prev, [cardIndex]: true }))
    }
  }

  const isCorrect = (index: number) => {
    const sel = selectedAnswers[index]
    return sel === 0
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handleBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cardIndex, panelMode, selectedAnswers, submittedAnswers, qaMode])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
  }, [cardIndex])

  useEffect(() => {
    if (panelMode === 'additional' && hasAudio) {
      if (!audioRef.current) audioRef.current = new Audio()
      audioRef.current.src = audioUrl as string
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setStatusMsg('Audio blocked; click play'))
      setStatusMsg('')
    }
  }, [panelMode, cardIndex, hasAudio, audioUrl])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#004142_0%,_#001A1A_80%)] text-[#FAFBF8] font-body p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
      <StyleInjector />

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C74601] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.25] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#E56E2E] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.20] pointer-events-none"></div>

      <button
        onClick={() => setQaMode(prev => !prev)}
        className={`absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase backdrop-blur-md shadow-lg z-50 border transition-colors ${
          qaMode
            ? 'bg-[#C74601]/20 border-[#C74601]/50 text-[#FFD5BF]'
            : 'bg-[#031213]/80 border-[#004142] text-[#64F4F5]'
        }`}
      >
        <ShieldCheck className="w-4 h-4" /> QA: {qaMode ? 'ON' : 'OFF'}
      </button>

      <div className="w-full max-w-5xl min-h-[780px] bg-[#031213]/95 backdrop-blur-xl border border-[#007970]/40 rounded-[32px] shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col relative z-10">
        <header className="px-8 pt-8 pb-4 flex justify-between items-end border-b border-[#007970]/30">
          <div>
            <p className="text-[#64F4F5] font-bold text-sm tracking-widest uppercase mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> CMS-485 Designer
            </p>
            <div className="font-heading text-4xl font-bold text-white tracking-tight">
              {cardIndex + 1} <span className="text-[#64F4F5]/60 text-2xl">/ {cards.length}</span>
            </div>
          </div>
          <img
            className="h-10 w-auto object-contain opacity-90"
            src="https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_White.png"
            alt="CareIndeed Logo"
          />
        </header>

        <div className="px-8 py-4 flex gap-3">
          {cards.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === cardIndex
                  ? 'w-12 bg-[#C74601] glow-orange'
                  : i < cardIndex
                    ? 'w-6 bg-[#C74601]/40'
                    : 'w-2 bg-[#004142]'
              }`}
            />
          ))}
        </div>

        <section className="p-8 h-[560px] flex flex-col justify-center overflow-hidden relative">
          <div key={`${cardIndex}-${panelMode}`} className="animate-slide-up flex-1 flex flex-col w-full">

            {card.final ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-[#C74601]/20 flex items-center justify-center glow-orange mb-4">
                  <Check className="w-12 h-12 text-[#FFD5BF]" />
                </div>
                <h1 className="font-heading text-4xl font-bold text-white">Course Complete</h1>
                <p className="text-[#D9D6D5] max-w-md text-lg font-light">
                  You have successfully completed the sample flow. Excellent work mastering the CMS-485 foundations.
                </p>
              </div>
            ) : (
              <>
                <p className="text-[#FFD5BF] text-xs font-bold tracking-widest uppercase mb-3">
                  {card.section} / {panelMode.toUpperCase()}
                </p>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
                  {card.title}
                </h1>

                {panelMode === 'challenge' ? (
                  <div className="flex-1 max-w-3xl">
                    <p className="text-[#D9D6D5] mb-6 text-lg">Which response best aligns with this card's objective?</p>
                    <div className="space-y-3">
                      {card.challenge.map((c: string, i: number) => {
                        const isSelected = (selectedAnswers[cardIndex] ?? null) === i
                        const submitted = Boolean(submittedAnswers[cardIndex])
                        const showCorrect = submitted && isSelected && isCorrect(cardIndex)
                        const showWrong = submitted && isSelected && !isCorrect(cardIndex)

                        return (
                          <button
                            key={i}
                            disabled={submitted}
                            onClick={() => setSelectedAnswers(prev => ({ ...prev, [cardIndex]: i }))}
                            className={`w-full text-left p-5 rounded-[16px] border transition-all duration-300 flex items-start gap-4 ${
                              showCorrect ? 'bg-[#64F4F5]/10 border-[#64F4F5] glow-teal' :
                              showWrong ? 'bg-[#D70101]/10 border-[#D70101]' :
                              isSelected ? 'bg-[#007970]/30 border-[#C74601]' :
                              'bg-[#002B2C]/40 border-[#007970]/30 hover:border-[#64F4F5]/70 hover:bg-[#004142]/60'
                            }`}
                          >
                            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                              showCorrect ? 'border-[#64F4F5] text-[#64F4F5]' :
                              showWrong ? 'border-[#D70101] text-[#D70101]' :
                              isSelected ? 'border-[#C74601] bg-[#C74601]' : 'border-[#64F4F5]/50'
                            }`}>
                              {showCorrect && <CheckCircle2 className="w-4 h-4" />}
                              {showWrong && <XCircle className="w-4 h-4" />}
                              {isSelected && !showCorrect && !showWrong && <div className="w-2 h-2 rounded-full bg-white"></div>}
                            </div>
                            <span className={`text-[15px] leading-relaxed ${
                              showCorrect ? 'text-[#64F4F5] font-medium' :
                              showWrong ? 'text-[#FBE6E6]' :
                              isSelected ? 'text-white' : 'text-[#D9D6D5]'
                            }`}>
                              {c}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                      <button
                        onClick={handleSubmitChallenge}
                        disabled={(selectedAnswers[cardIndex] ?? null) === null || Boolean(submittedAnswers[cardIndex])}
                        className={`px-8 py-3 rounded-[12px] font-bold tracking-wide transition-all duration-300 ${
                          (selectedAnswers[cardIndex] ?? null) !== null && !submittedAnswers[cardIndex]
                            ? 'bg-[#C74601] text-white hover:bg-[#E56E2E] glow-orange hover:-translate-y-0.5'
                            : 'bg-[#002B2C] text-[#007970] cursor-not-allowed border border-[#004142]'
                        }`}
                      >
                        Submit Answer
                      </button>

                      {submittedAnswers[cardIndex] && (
                        <p className={`font-bold animate-slide-up flex items-center gap-2 ${isCorrect(cardIndex) ? 'text-[#64F4F5]' : 'text-[#FBE6E6]'}`}>
                          {isCorrect(cardIndex) ? <><CheckCircle2 className="w-5 h-5"/> Correct — great job.</> : <><XCircle className="w-5 h-5"/> Incorrect — review before advancing.</>}
                        </p>
                      )}
                    </div>
                  </div>
                ) : panelMode === 'additional' ? (
                  <div className="flex-1 flex flex-col items-center">
                    <div className="bg-[#002B2C]/60 border border-[#007970]/40 rounded-[24px] p-8 shadow-inner w-full">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <h2 className="text-[#64F4F5] font-heading font-bold text-xl flex items-center gap-2">
                          <Activity className="w-5 h-5" /> Subject Content (hover to view all)
                        </h2>
                      </div>
                      <div className="relative group">
                        <p className="text-[#FAFBF8] text-lg leading-relaxed line-clamp-2">{additionalSummary}</p>
                        {card.additional && (
                          <div className="pointer-events-none absolute left-0 top-full mt-2 w-[56rem] max-w-full p-4 rounded-lg bg-[#031213] border border-[#004142] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[#D9D6D5] text-sm leading-relaxed whitespace-pre-line">{card.additional}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Audio Play Button — centered below subject content */}
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => {
                          if (!audioRef.current) audioRef.current = new Audio()
                          if (!audioUrl) { setStatusMsg('No recording available'); return }
                          if (isPlaying) {
                            audioRef.current.pause()
                            setIsPlaying(false)
                            setStatusMsg('Paused')
                            return
                          }
                          audioRef.current.src = audioUrl
                          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setStatusMsg('Audio blocked; click play'))
                          setStatusMsg('')
                        }}
                        disabled={!hasAudio}
                        className={`w-14 h-14 rounded-full border-2 border-[#007970] text-[#64F4F5] flex items-center justify-center hover:bg-[#007970]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                        title={isPlaying ? 'Pause audio' : 'Play audio'}
                      >
                        {isPlaying
                          ? <Pause className="w-5 h-5 fill-current" />
                          : <Play className="w-5 h-5 fill-current ml-0.5" />}
                      </button>
                    </div>

                    <div className="flex-1" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 h-full">
                    <div className="bg-[#002B2C]/60 border border-[#007970]/40 rounded-[24px] p-6 shadow-inner">
                      <h2 className="text-[#64F4F5] font-heading font-bold text-lg mb-2">Learning Objective</h2>
                      <p className="text-white text-lg">{card.objective}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                      <div className="bg-[#020C0D] border border-[#007970]/40 rounded-[24px] p-6 shadow-inner">
                        <h2 className="text-[#64F4F5] font-heading font-bold text-sm uppercase tracking-widest mb-4 border-b border-[#004142] pb-2">Key Points</h2>
                        <ul className="space-y-3">
                          {card.bullets.map((b: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-[#FAFBF8]">
                              <span className="text-[#C74601] mt-1">•</span> {b}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gradient-to-br from-[#C74601]/10 to-[#020C0D] border border-[#C74601]/40 rounded-[24px] p-6 shadow-inner">
                        <h2 className="text-[#C74601] font-heading font-bold text-sm uppercase tracking-widest mb-4 border-b border-[#C74601]/20 pb-2">Clinical Lens</h2>
                        <p className="text-[#FAFBF8] leading-relaxed">Translate this concept into clear, patient-specific, defensible documentation language.</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
              <>
            {/* no absolute audio controls here anymore */}
              </>
        </section>

        <footer className="px-8 py-6 bg-[#010809] border-t border-[#007970]/40 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              disabled={cardIndex === 0 && panelMode === 'main'}
              className="flex items-center gap-2 text-[#D9D6D5] hover:text-white font-semibold tracking-widest uppercase disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Return</span>
            </button>

            <div className="flex items-center gap-2 text-[#64F4F5]">
              {dockItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="text-[#64F4F5] hover:text-white transition-colors"
                  title={item.label}
                  aria-label={item.label}
                >
                  {item.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 text-[#C74601] font-bold tracking-widest uppercase hover:text-[#E56E2E]"
            >
              {card.final ? 'Finish' : 'Advance'} <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </footer>
      </div>
    </div>
  )
}
