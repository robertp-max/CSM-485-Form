import { useState, useEffect, useRef } from 'react';
import {
  Play,
  ArrowRight, ArrowLeft, CheckCircle2, XCircle,
  ShieldCheck, FileText, Activity, Check,
  Home, Settings, LayoutGrid, HeartPulse, GraduationCap, ClipboardCheck
} from 'lucide-react';

const StyleInjector = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Roboto:wght@300;400;500&display=swap');

      .font-heading { font-family: 'Montserrat', sans-serif; }
      .font-body { font-family: 'Roboto', sans-serif; }

      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #FAFBF8; }
      ::-webkit-scrollbar-thumb { background: #D9D6D5; border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: #747474; }

      .glow-orange { box-shadow: 0 8px 24px -6px rgba(199, 70, 1, 0.35); }
      .glow-teal { box-shadow: 0 8px 24px -6px rgba(0, 121, 112, 0.25); }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    `}
  </style>
);

const debugMode = true;
import { Dock } from '../Dock';
import { TRAINING_CARDS } from '../../data/trainingCards';
import { FINAL_TEST_TITLE, FINAL_TEST_OBJECTIVE, FINAL_TEST_KEY_POINTS, FINAL_TEST_QUESTIONS } from '../../data/finalTest';

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
};

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
];

export default function CIHHLightWeb({ onNavigate }: { onNavigate?: (phase: string) => void }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [panelMode, setPanelMode] = useState('main');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | null>>(() => ({}));
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>(() => ({}));
  const [, setStatusMsg] = useState('QA mode bypasses locks');
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  const card = cards[cardIndex] as any;
  const audioUrl = card?.title ? findAudioForTitle(card.title) : null;
  const hasAudio = Boolean(audioUrl);

  const additionalSummary = (() => {
    if (!card.additional) return '';
    const sentences = card.additional.split(/(?<=\.)\s+/).filter(Boolean);
    return sentences.slice(0, 2).join(' ').trim() || card.additional.slice(0, 180);
  })();

  const dockItems = [
    { icon: <FileText className="w-5 h-5" />, label: 'Help Center', onClick: () => { const nonce = Date.now(); window.location.hash = `/?dock=glossary&n=${nonce}`; window.dispatchEvent(new CustomEvent('dock-nav', { detail: 'glossary' })); } },
    { icon: <ShieldCheck className="w-5 h-5" />, label: debugMode ? 'QA: ON' : 'QA: OFF', onClick: () => setStatusMsg(prev => prev === 'QA: ON' ? 'QA: OFF' : 'QA: ON'), isActive: debugMode },
    { icon: <Activity className="w-5 h-5" />, label: 'Top', onClick: () => { setCardIndex(0); setPanelMode('main'); } },
    ...(onNavigate ? [
      { icon: <Home className="w-5 h-5" />, label: 'Welcome', onClick: () => onNavigate('welcome') },
      { icon: <Settings className="w-5 h-5" />, label: 'Calibration', onClick: () => onNavigate('calibration') },
      { icon: <LayoutGrid className="w-5 h-5" />, label: 'Layout', onClick: () => onNavigate('layout-challenge') },
      { icon: <HeartPulse className="w-5 h-5" />, label: 'Henderson', onClick: () => onNavigate('henderson-challenge') },
      { icon: <GraduationCap className="w-5 h-5" />, label: 'Courses', onClick: () => onNavigate('course-selection') },
      { icon: <ClipboardCheck className="w-5 h-5" />, label: 'Final Exam', onClick: () => { const nonce = Date.now(); window.location.hash = `/?dock=final-exam&n=${nonce}`; } },
    ] : []),
  ];

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }

  const handleNext = () => {
    if (!card.final && panelMode === 'main') {
      stopAudio()
      setPanelMode('additional');
      return
    }
    if (!card.final && panelMode === 'additional') {
      stopAudio()
      setPanelMode('challenge');
      return
    }
    if (panelMode === 'challenge' && !submittedAnswers[cardIndex]) {
      setStatusMsg('Submit the challenge to advance');
      return
    }
    if (cardIndex < cards.length - 1) {
      stopAudio()
      setCardIndex(cardIndex + 1);
      setPanelMode('main');
      setStatusMsg('QA mode bypasses locks');
    }
  };

  const handleBack = () => {
    stopAudio()
    if (panelMode === 'challenge') {
      setPanelMode('additional');
    } else if (panelMode === 'additional') {
      setPanelMode('main');
    } else if (cardIndex > 0) {
      setCardIndex(cardIndex - 1);
      setPanelMode('main');
    }
  };

  const handleSubmitChallenge = () => {
    const sel = selectedAnswers[cardIndex] ?? null
    if (sel !== null) setSubmittedAnswers(prev => ({ ...prev, [cardIndex]: true }));
  };

  const isCorrect = (index: number) => (selectedAnswers[index] ?? null) === 0;
  const progressPercentage = ((cardIndex) / (cards.length - 1)) * 100;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [cardIndex]);

  useEffect(() => {
    if (panelMode === 'additional' && hasAudio) {
      if (!audioRef.current) audioRef.current = new Audio()
      audioRef.current.src = audioUrl as string
      audioRef.current.play().catch(() => setStatusMsg('Audio blocked; click play'))
      setStatusMsg('Playing')
    }
  }, [panelMode, cardIndex, hasAudio, audioUrl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handleBack();
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cardIndex, panelMode, selectedAnswers, submittedAnswers]);

  return (
    <div className="flex h-screen w-full bg-[#FAFBF8] text-[#1F1C1B] font-body overflow-hidden">
      <StyleInjector />

      <main className="flex-1 flex flex-col relative bg-[radial-gradient(circle_at_top_right,_#FAFBF8_0%,_#E5E4E3_100%)]">

        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#007970] rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.06] animate-pulse pointer-events-none z-0"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#C74601] rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.05] pointer-events-none z-0"></div>

        <header className="h-20 border-b border-[#E5E4E3] bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 z-10 relative">

          <div className="absolute bottom-0 left-0 h-[3px] bg-[#E5E4E3] w-full">
            <div
              className="h-full bg-[#C74601] transition-all duration-700 ease-out glow-orange"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="flex items-center gap-6">
            <img
              className="h-8 w-auto object-contain opacity-90"
              src="https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_Gray.png"
              alt="CareIndeed Logo"
            />

            <div className="hidden sm:block h-6 w-[1px] bg-[#D9D6D5]"></div>

            <div className="flex items-center gap-3">
              <span className="text-[#C74601] font-bold tracking-widest uppercase text-xs">
                {card.final ? 'End of Module' : card.section}
              </span>
              {!card.final && (
                <>
                  <span className="text-[#D9D6D5] hidden sm:inline">•</span>
                  <span className="text-[#524048] font-medium text-sm hidden sm:inline">
                    {panelMode === 'main' ? 'Concept Overview' : panelMode === 'additional' ? 'Deep Dive' : 'Knowledge Check'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#007970] font-bold text-xs tracking-widest uppercase hidden md:inline">
              {Math.round(progressPercentage)}% Complete
            </span>
            {debugMode && (
              <div className="flex items-center gap-2 bg-[#FFEEE5] border border-[#FFD5BF] text-[#C74601] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-sm">
                <ShieldCheck className="w-4 h-4" /> QA: ON
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-16 z-10 flex flex-col items-center">
          <div key={`${cardIndex}-${panelMode}`} className="animate-slide-up w-full max-w-4xl min-h-[780px] flex-1 flex flex-col justify-center">

            {card.final ? (
              <div className="flex flex-col items-center text-center space-y-8 py-20">
                <div className="w-32 h-32 rounded-full bg-[#E5FEFF] border border-[#C4F4F5] flex items-center justify-center glow-teal mb-4 shadow-[0_0_60px_rgba(0,121,112,0.15)]">
                  <Check className="w-16 h-16 text-[#007970]" />
                </div>
                <h1 className="font-heading text-5xl lg:text-6xl font-bold text-[#1F1C1B]">Module Complete</h1>
                <p className="text-[#524048] max-w-xl text-xl font-light leading-relaxed">
                  You have successfully completed the sample flow. Excellent work mastering the CMS-485 foundations and documentation standards.
                </p>
              </div>
            ) : (
              <div className="space-y-10 w-full">
                <header>
                  <h1 className="font-heading text-4xl lg:text-5xl font-bold text-[#1F1C1B] leading-tight">
                    {card.title}
                  </h1>
                </header>

                {panelMode === 'challenge' ? (
                  <div className="max-w-3xl space-y-8">
                    <p className="text-[#007970] text-xl font-medium">Which response best aligns with this card's objective?</p>
                    <div className="space-y-4">
                      {card.challenge.map((c: string, i: number) => {
                        const isSelected = (selectedAnswers[cardIndex] ?? null) === i;
                        const submitted = Boolean(submittedAnswers[cardIndex]);
                        const showCorrect = submitted && isSelected && isCorrect(cardIndex);
                        const showWrong = submitted && isSelected && !isCorrect(cardIndex);

                        return (
                          <button
                            key={i}
                            disabled={submitted}
                            onClick={() => setSelectedAnswers(prev => ({ ...prev, [cardIndex]: i }))}
                            className={`w-full text-left p-6 rounded-[20px] border-2 transition-all duration-300 flex items-start gap-5 ${
                              showCorrect ? 'bg-[#E5FEFF] border-[#007970] shadow-md' :
                              showWrong ? 'bg-[#FBE6E6] border-[#D70101]' :
                              isSelected ? 'bg-[#FFEEE5] border-[#C74601] shadow-md' :
                              'bg-white border-[#E5E4E3] hover:border-[#007970] hover:bg-[#F7FEFF] shadow-sm hover:shadow-md'
                            }`}
                          >
                            <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                              showCorrect ? 'border-[#007970] text-[#007970]' :
                              showWrong ? 'border-[#D70101] text-[#D70101]' :
                              isSelected ? 'border-[#C74601] bg-[#C74601]' : 'border-[#D9D6D5]'
                            }`}>
                              {showCorrect && <CheckCircle2 className="w-5 h-5" />}
                              {showWrong && <XCircle className="w-5 h-5" />}
                              {isSelected && !showCorrect && !showWrong && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                            </div>
                            <span className={`text-[17px] leading-relaxed ${
                              showCorrect ? 'text-[#004142] font-semibold' :
                              showWrong ? 'text-[#D70101]' :
                              isSelected ? 'text-[#421700] font-medium' : 'text-[#524048]'
                            }`}>
                              {c}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-6 flex items-center justify-between">
                      <button
                        onClick={handleSubmitChallenge}
                        disabled={(selectedAnswers[cardIndex] ?? null) === null || Boolean(submittedAnswers[cardIndex])}
                        className={`px-10 py-4 rounded-[16px] font-bold text-lg tracking-wide transition-all duration-300 ${
                          (selectedAnswers[cardIndex] ?? null) !== null && !submittedAnswers[cardIndex]
                            ? 'bg-[#C74601] text-white hover:bg-[#E56E2E] glow-orange hover:-translate-y-1'
                            : 'bg-[#E5E4E3] text-[#747474] cursor-not-allowed border border-[#D9D6D5]'
                        }`}
                      >
                        Submit Answer
                      </button>

                      {submittedAnswers[cardIndex] && (
                        <p className={`font-bold text-lg animate-slide-up flex items-center gap-3 ${isCorrect(cardIndex) ? 'text-[#007970]' : 'text-[#D70101]'}`}>
                          {isCorrect(cardIndex) ? <><CheckCircle2 className="w-7 h-7"/> Correct — great job.</> : <><XCircle className="w-7 h-7"/> Incorrect — review before advancing.</>}
                        </p>
                      )}
                    </div>
                  </div>
                ) : panelMode === 'additional' ? (
                  <div className="flex flex-col items-center">
                    <div className="bg-white/80 backdrop-blur-md border border-[#E5E4E3] rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgba(31,28,27,0.06)] w-full">
                      <h2 className="text-[#007970] font-heading font-bold text-2xl mb-6 flex items-center gap-3">
                        <Activity className="w-7 h-7" /> Subject Content (hover to view all)
                      </h2>
                      <div className="relative group">
                        <p className="text-[#1F1C1B] text-xl leading-relaxed font-light line-clamp-2">{additionalSummary}</p>
                        {card.additional && (
                          <div className="pointer-events-none absolute left-0 top-full mt-2 w-[56rem] max-w-full p-4 rounded-lg bg-white border border-[#E5E4E3] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[#1F1C1B] text-base leading-relaxed whitespace-pre-line">{card.additional}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Audio Play Button — centered below subject content */}
                    <div className="flex justify-center mt-5">
                      <button
                        onClick={() => {
                          if (!audioRef.current) audioRef.current = new Audio()
                          if (!audioUrl) { setStatusMsg('No recording available'); return }
                          audioRef.current.src = audioUrl
                          audioRef.current.play()
                          setStatusMsg('Playing')
                        }}
                        disabled={!hasAudio}
                        className={`w-14 h-14 rounded-full border-2 border-[#007970] text-[#007970] flex items-center justify-center hover:bg-[#007970]/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                        title="Play audio"
                      >
                        <Play className="w-5 h-5 md:w-6 md:h-6 fill-current ml-0.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-8 w-full">
                    <div className="bg-white/90 backdrop-blur-md border-l-4 border-[#C74601] rounded-r-[24px] rounded-l-[8px] p-6 md:p-8 shadow-sm">
                      <h2 className="text-[#C74601] font-heading font-bold text-sm tracking-widest uppercase mb-3">Learning Objective</h2>
                      <p className="text-[#1F1C1B] text-xl md:text-2xl font-medium leading-relaxed">{card.objective}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white border border-[#E5E4E3] rounded-[32px] p-6 md:p-8 shadow-sm">
                        <h2 className="text-[#747474] font-heading font-bold text-sm uppercase tracking-widest mb-6 border-b border-[#E5E4E3] pb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5" /> Key Principles
                        </h2>
                        <ul className="space-y-5">
                          {card.bullets.map((b: string, i: number) => (
                            <li key={i} className="flex items-start gap-4 text-[#524048] text-lg">
                              <span className="text-[#C74601] mt-1.5"><CheckCircle2 className="w-5 h-5" /></span> {b}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gradient-to-br from-[#FFEEE5] to-white border border-[#FFD5BF] rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col justify-center">
                        <h2 className="text-[#C74601] font-heading font-bold text-sm uppercase tracking-widest mb-6 border-b border-[#FFD5BF] pb-3">Clinical Lens</h2>
                        <p className="text-[#1F1C1B] text-xl leading-relaxed font-light">Translate this concept into clear, patient-specific, defensible documentation language.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="bg-white/95 backdrop-blur-xl border-t border-[#E5E4E3] px-6 md:px-8 py-6 flex items-center justify-between z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">

          <button
            onClick={handleBack}
            disabled={cardIndex === 0 && panelMode === 'main'}
            className="flex items-center gap-2 md:gap-3 text-[#747474] hover:text-[#1F1C1B] font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors md:text-lg"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" /> Back
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 md:gap-3 px-6 md:px-10 py-3 md:py-4 bg-[#C74601] hover:bg-[#E56E2E] text-white font-bold md:text-lg rounded-[12px] md:rounded-[16px] glow-orange transform hover:-translate-y-1 transition-all disabled:opacity-50 text-sm md:text-base shadow-md"
          >
            {card.final ? 'Finish Course' : 'Continue'} <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

        </footer>
        {/* Dock (center-left) */}
        <Dock items={dockItems} position="center-left" isDarkMode={false} />
      </main>
    </div>
  );
}
