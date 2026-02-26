/* ── BookCarousel ──────────────────────────────────────────────
 *  A 3D page-flipping carousel, pivot on the LEFT edge like
 *  turning the pages of a book.  Each "page" is a module card
 *  showing section, title, objective, and bullet highlights.
 *
 *  Uses framer-motion for spring-driven rotateY around the
 *  left edge (transformOrigin: 'left center').
 * ─────────────────────────────────────────────────────────── */

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  FileText,
  Lock,
  Target,
} from 'lucide-react'
import type { TrainingCard } from '../data/trainingCards'

// ─── Props ─────────────────────────────────────────────────
interface BookCarouselProps {
  items: TrainingCard[]
  onSelect: (index: number) => void
  isDarkMode: boolean
  unlockedCount: number
}

// ─── Unique sections in order ──────────────────────────────
function uniqueSections(items: TrainingCard[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const it of items) {
    if (!seen.has(it.section)) {
      seen.add(it.section)
      out.push(it.section)
    }
  }
  return out
}

// Section accent colors (cycle through brand palette)
const SECTION_COLORS = [
  '#007970', // teal
  '#C74601', // orange
  '#004142', // deep teal
  '#1F1C1B', // charcoal
  '#64F4F5', // cyan
  '#524048', // muted
]

export default function BookCarousel({ items, onSelect, isDarkMode, unlockedCount }: BookCarouselProps) {
  const sections = useMemo(() => uniqueSections(items), [items])

  // Group items by section, preserving original indices
  const groupedPages = useMemo(() => {
    return sections.map((sec) => {
      const cards = items
        .map((it, i) => ({ ...it, originalIndex: i }))
        .filter((it) => it.section === sec)
      return { section: sec, cards }
    })
  }, [items, sections])

  const [pageIndex, setPageIndex] = useState(0)
  const [direction, setDirection] = useState(0) // -1=prev, +1=next

  const totalPages = groupedPages.length
  const currentPage = groupedPages[pageIndex] ?? groupedPages[0]

  const completedCount = Math.max(0, unlockedCount - 1)
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0

  const goNext = useCallback(() => {
    if (pageIndex < totalPages - 1) {
      setDirection(1)
      setPageIndex((p) => p + 1)
    }
  }, [pageIndex, totalPages])

  const goPrev = useCallback(() => {
    if (pageIndex > 0) {
      setDirection(-1)
      setPageIndex((p) => p - 1)
    }
  }, [pageIndex])

  const sectionColor = SECTION_COLORS[pageIndex % SECTION_COLORS.length]

  // ─── Page card component ─────────────────────────────────
  const PageContent = ({ page }: { page: typeof currentPage }) => (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Page header / spine */}
      <div
        className="px-6 py-4 border-b flex items-center justify-between shrink-0"
        style={{
          background: isDarkMode ? 'rgba(0,65,66,0.5)' : `${sectionColor}0D`,
          borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#E5E4E3',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: sectionColor }}
          >
            {pageIndex + 1}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: sectionColor }}>
              {page.section}
            </p>
            <p
              className="text-[10px]"
              style={{ color: isDarkMode ? 'rgba(255,255,255,0.4)' : '#747474' }}
            >
              {page.cards.length} topic{page.cards.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <BookOpen className="w-5 h-5" style={{ color: isDarkMode ? 'rgba(255,255,255,0.15)' : '#D9D6D5' }} />
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {page.cards.map((card) => {
          const idx = card.originalIndex
          const isLocked = idx + 1 > unlockedCount
          const isCompleted = idx + 1 < unlockedCount

          return (
            <button
              key={card.title}
              onClick={() => !isLocked && onSelect(idx)}
              disabled={isLocked}
              className={`w-full text-left rounded-2xl border-2 p-4 transition-all group ${
                isLocked
                  ? isDarkMode
                    ? 'bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed'
                    : 'bg-[#FAFBF8] border-[#ECEAE9] opacity-50 cursor-not-allowed'
                  : isDarkMode
                    ? 'bg-white/[0.04] border-white/10 hover:border-[#007970] hover:bg-white/[0.06]'
                    : 'bg-white border-[#E5E4E3] hover:border-[#007970] hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {/* Top row: number + status */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold"
                    style={{
                      background: isLocked
                        ? isDarkMode ? 'rgba(255,255,255,0.05)' : '#F2F2F1'
                        : isCompleted
                          ? isDarkMode ? 'rgba(0,121,112,0.3)' : '#E5FEFF'
                          : isDarkMode ? 'rgba(199,70,1,0.2)' : '#E5FEFF',
                      color: isLocked
                        ? isDarkMode ? '#555' : '#B8B4B2'
                        : isCompleted
                          ? isDarkMode ? '#64F4F5' : '#007970'
                          : isDarkMode ? '#C74601' : '#007970',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{ color: isDarkMode ? '#e0e0e0' : '#1F1C1B' }}
                  >
                    {card.title}
                  </span>
                </div>
                {isLocked && <Lock className="h-3.5 w-3.5" style={{ color: isDarkMode ? '#555' : '#B8B4B2' }} />}
                {isCompleted && <CheckCircle className="h-3.5 w-3.5 text-[#007970]" />}
              </div>

              {/* Objective */}
              <div className="flex items-start gap-2 ml-8">
                <Target className="h-3 w-3 mt-0.5 shrink-0" style={{ color: isLocked ? (isDarkMode ? '#444' : '#C5C2C0') : sectionColor }} />
                <p
                  className="text-[11px] leading-relaxed"
                  style={{
                    color: isLocked
                      ? isDarkMode ? '#444' : '#C5C2C0'
                      : isDarkMode ? 'rgba(255,255,255,0.55)' : '#524048',
                  }}
                >
                  {card.objective}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Spine / page edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: sectionColor, opacity: 0.5 }}
      />
    </div>
  )

  // ─── Flip animation variants ─────────────────────────────
  // Pages rotate around the left edge, like a real book
  const variants = {
    enter: (dir: number) => ({
      rotateY: dir > 0 ? -90 : 90,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 200, damping: 28, mass: 0.8 },
    },
    exit: (dir: number) => ({
      rotateY: dir > 0 ? 90 : -90,
      opacity: 0,
      scale: 0.95,
      transition: { type: 'spring', stiffness: 200, damping: 28, mass: 0.8 },
    }),
  }

  return (
    <div className={`flex h-full w-full flex-col p-5 ${isDarkMode ? 'text-white' : ''}`}>
      {/* Header with progress */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] border ${
              isDarkMode ? 'border-white/10 bg-white/5 text-[#64F4F5]' : 'border-[#C74601]/15 bg-[#FFF8F5] text-[#C74601]'
            }`}
          >
            <FileText className="h-3 w-3" /> Module Selection
          </div>
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Course Modules
          </h2>
        </div>
        <div
          className={`flex items-center gap-2 text-[10px] font-semibold ${isDarkMode ? 'text-gray-400' : 'text-[#747474]'}`}
        >
          <div
            className={`h-1.5 w-14 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-[#E5E4E3]'}`}
          >
            <div
              className="h-full bg-[#007970] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {completedCount} / {items.length}
        </div>
      </div>

      {/* Section pill indicators */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 shrink-0">
        {sections.map((sec, i) => (
          <button
            key={sec}
            onClick={() => {
              setDirection(i > pageIndex ? 1 : -1)
              setPageIndex(i)
            }}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
              i === pageIndex
                ? isDarkMode
                  ? 'border-[#64F4F5]/40 bg-[#64F4F5]/10 text-[#64F4F5]'
                  : 'border-[#007970]/30 bg-[#E5FEFF] text-[#007970]'
                : isDarkMode
                  ? 'border-white/5 bg-white/[0.03] text-gray-500 hover:text-gray-300 hover:border-white/10'
                  : 'border-[#E5E4E3] bg-white text-[#747474] hover:border-[#007970]/30 hover:text-[#007970]'
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* 3D Book / flip zone */}
      <div
        className="flex-1 min-h-0 relative"
        style={{ perspective: '1200px' }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={pageIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className={`absolute inset-0 rounded-2xl border-2 overflow-hidden shadow-xl ${
              isDarkMode
                ? 'bg-[#031213]/90 border-white/8 backdrop-blur-md'
                : 'bg-white border-[#E5E4E3]'
            }`}
            style={{
              transformOrigin: 'left center',
              backfaceVisibility: 'hidden',
            }}
          >
            <PageContent page={currentPage} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4 shrink-0">
        <button
          onClick={goPrev}
          disabled={pageIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
            isDarkMode
              ? 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
              : 'bg-[#FAFBF8] border border-[#E5E4E3] text-[#524048] hover:border-[#007970]'
          }`}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Previous Section
        </button>

        {/* Page dots */}
        <div className="flex gap-1.5">
          {groupedPages.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > pageIndex ? 1 : -1)
                setPageIndex(i)
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === pageIndex
                  ? `w-6 ${isDarkMode ? 'bg-[#64F4F5]' : 'bg-[#007970]'}`
                  : `w-1.5 ${isDarkMode ? 'bg-white/15' : 'bg-[#D9D6D5]'}`
              }`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={pageIndex === totalPages - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
            isDarkMode
              ? 'bg-[#007970]/30 border border-[#007970]/50 text-[#64F4F5] hover:bg-[#007970]/50'
              : 'bg-[#007970] text-white hover:bg-[#006059]'
          }`}
        >
          Next Section <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
