import { useCallback, useMemo, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  HelpCircle,
  MessageCircleQuestion,
  Search,
  X,
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import {
  HELP_ARTICLES,
  HELP_CATEGORIES,
  FAQ_ENTRIES,
  type HelpArticle,
  type HelpCategory,
} from '../data/helpArticles'

/* ── Fuzzy search ────────────────────────────────────── */
function fuzzy(query: string, text: string): boolean {
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  if (t.includes(q)) return true
  // token match
  const tokens = q.split(/\s+/).filter(Boolean)
  return tokens.every((tok) => t.includes(tok))
}

function searchArticles(query: string): HelpArticle[] {
  if (!query.trim()) return HELP_ARTICLES
  return HELP_ARTICLES.filter(
    (a) =>
      fuzzy(query, a.title) ||
      fuzzy(query, a.summary) ||
      a.tags.some((t) => fuzzy(query, t)) ||
      a.body.some((p) => fuzzy(query, p)),
  )
}

/* ── Component ───────────────────────────────────────── */
export default function HelpCenter() {
  const { isDarkMode, toggle } = useTheme()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<HelpCategory | null>(null)
  const [activeArticle, setActiveArticle] = useState<HelpArticle | null>(null)
  const [showFaq, setShowFaq] = useState(false)

  const results = useMemo(() => {
    const filtered = searchArticles(query)
    if (activeCategory) return filtered.filter((a) => a.category === activeCategory)
    return filtered
  }, [query, activeCategory])

  const faqResults = useMemo(() => {
    if (!query.trim()) return FAQ_ENTRIES
    return FAQ_ENTRIES.filter(
      (f) => fuzzy(query, f.question) || fuzzy(query, f.answer) || f.tags.some((t) => fuzzy(query, t)),
    )
  }, [query])

  const goBack = useCallback(() => {
    if (activeArticle) { setActiveArticle(null); return }
    if (activeCategory) { setActiveCategory(null); return }
    window.history.back()
  }, [activeArticle, activeCategory])

  /* ── dark/light tokens ────────────────────────────────── */
  const bg = isDarkMode ? 'bg-[#09090b]' : 'bg-[#FAFBF8]'
  const surface = isDarkMode ? 'bg-[#121214] border-white/10' : 'bg-white border-[#E5E4E3]'
  const text = isDarkMode ? 'text-[#F3F4F6]' : 'text-[#1F1C1B]'
  const muted = isDarkMode ? 'text-white/60' : 'text-[#747474]'
  const teal = 'text-[#007970]'
  const hoverCard = isDarkMode
    ? 'hover:border-[#007970]/60 hover:bg-white/[0.04]'
    : 'hover:border-[#007970] hover:shadow-[4px_4px_0_#007970] hover:-translate-y-0.5 hover:-translate-x-0.5'

  /* ── Article detail ───────────────────────────────────── */
  if (activeArticle) {
    const cat = HELP_CATEGORIES.find((c) => c.id === activeArticle.category)
    return (
      <div className={`min-h-screen ${bg} ${text} font-sans`}>
        <header className={`sticky top-0 z-40 border-b ${isDarkMode ? 'border-white/10 bg-[#09090b]/95 backdrop-blur-lg' : 'border-[#E5E4E3] bg-[#FAFBF8]/95 backdrop-blur-lg'}`}>
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
            <button onClick={goBack} className={`flex items-center gap-1 text-sm font-medium ${teal} hover:underline`}>
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {cat && <span className={`text-xs uppercase tracking-widest ${muted}`}>{cat.label}</span>}
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-6 py-10">
          <h1 className="font-heading text-3xl font-bold mb-2">{activeArticle.title}</h1>
          <p className={`text-sm mb-8 ${muted}`}>{activeArticle.summary}</p>
          <div className="space-y-4">
            {activeArticle.body.map((paragraph, i) => (
              <p key={i} className="text-base leading-relaxed">{paragraph}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {activeArticle.tags.map((t) => (
              <span key={t} className={`rounded-full px-3 py-1 text-xs font-medium ${isDarkMode ? 'bg-[#007970]/15 text-[#64F4F5]' : 'bg-[#E5FEFF] text-[#007970]'}`}>
                {t}
              </span>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bg} ${text} font-sans`}>
      {/* ── Header ──────────────────────────────────────── */}
      <header className={`sticky top-0 z-40 border-b ${isDarkMode ? 'border-white/10 bg-[#09090b]/95 backdrop-blur-lg' : 'border-[#E5E4E3] bg-[#FAFBF8]/95 backdrop-blur-lg'}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <a href="#/" className={`flex items-center gap-1 text-sm font-medium ${teal} hover:underline`}>
              <ArrowLeft className="h-4 w-4" /> Course
            </a>
            <div className={`h-5 w-px ${isDarkMode ? 'bg-white/15' : 'bg-[#E5E4E3]'}`} />
            <div className="flex items-center gap-2">
              <HelpCircle className={`h-5 w-5 ${teal}`} />
              <span className="font-heading text-lg font-bold">Help Center</span>
            </div>
          </div>
          <button
            onClick={toggle}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${isDarkMode ? 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10' : 'border-[#E5E4E3] bg-white text-[#1F1C1B] hover:bg-[#F7FEFF]'}`}
          >
            {isDarkMode ? 'Light Mode' : 'Night Mode'}
          </button>
        </div>
      </header>

      {/* ── Hero + Search ───────────────────────────────── */}
      <section className={`border-b ${isDarkMode ? 'border-white/10' : 'border-[#E5E4E3]'}`}>
        <div className="mx-auto max-w-6xl px-6 py-12 text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight mb-3">
            How can we help<span className={teal}>?</span>
          </h1>
          <p className={`text-base mb-8 ${muted}`}>
            Search articles, browse categories, or jump to FAQ.
          </p>
          <div className={`relative mx-auto max-w-xl rounded-xl border ${isDarkMode ? 'border-white/15 bg-white/5' : 'border-[#E5E4E3] bg-white shadow-sm'}`}>
            <Search className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${muted}`} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search help articles, FAQ, references…"
              className={`w-full rounded-xl py-3.5 pl-12 pr-10 text-base bg-transparent focus:outline-none focus:ring-2 focus:ring-[#007970]/50 ${text} placeholder:${muted}`}
            />
            {query && (
              <button onClick={() => setQuery('')} className={`absolute right-3 top-1/2 -translate-y-1/2 ${muted} hover:${text}`}>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* ── Tab bar ───────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => { setShowFaq(false); setActiveCategory(null) }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              !showFaq
                ? (isDarkMode ? 'bg-[#007970]/20 text-[#64F4F5]' : 'bg-[#007970] text-white')
                : (isDarkMode ? 'text-white/60 hover:text-white' : 'text-[#747474] hover:text-[#1F1C1B]')
            }`}
          >
            <BookOpen className="h-4 w-4" /> Articles
          </button>
          <button
            onClick={() => setShowFaq(true)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              showFaq
                ? (isDarkMode ? 'bg-[#007970]/20 text-[#64F4F5]' : 'bg-[#007970] text-white')
                : (isDarkMode ? 'text-white/60 hover:text-white' : 'text-[#747474] hover:text-[#1F1C1B]')
            }`}
          >
            <MessageCircleQuestion className="h-4 w-4" /> FAQ
          </button>
        </div>

        {showFaq ? (
          /* ── FAQ view ──────────────────────────────────── */
          <div className="space-y-3 max-w-3xl">
            {faqResults.length === 0 && (
              <p className={muted}>No FAQ matches for "{query}"</p>
            )}
            {faqResults.map((f) => (
              <details
                key={f.id}
                className={`group rounded-xl border p-0 transition-all ${surface} ${hoverCard}`}
              >
                <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-4">
                  <span className="font-medium text-sm">{f.question}</span>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition-transform group-open:rotate-90 ${muted}`} />
                </summary>
                <div className={`px-5 pb-4 text-sm leading-relaxed ${muted}`}>
                  {f.answer}
                </div>
              </details>
            ))}
          </div>
        ) : activeCategory === null ? (
          /* ── Category grid ─────────────────────────────── */
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-10">
              {HELP_CATEGORIES.map((cat) => {
                const count = results.filter((a) => a.category === cat.id).length
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`group rounded-xl border p-5 text-left transition-all ${surface} ${hoverCard}`}
                  >
                    <h3 className="font-heading text-base font-bold mb-1">{cat.label}</h3>
                    <p className={`text-xs mb-3 ${muted}`}>{cat.description}</p>
                    <span className={`text-xs font-semibold ${teal}`}>{count} article{count !== 1 ? 's' : ''} →</span>
                  </button>
                )
              })}
            </div>

            {/* All articles list */}
            {query && (
              <div>
                <h2 className="font-heading text-lg font-bold mb-4">
                  {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                </h2>
                <div className="space-y-2">
                  {results.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setActiveArticle(a)}
                      className={`w-full rounded-xl border p-4 text-left transition-all ${surface} ${hoverCard} flex items-center justify-between gap-3`}
                    >
                      <div>
                        <h3 className="text-sm font-semibold mb-0.5">{a.title}</h3>
                        <p className={`text-xs ${muted}`}>{a.summary}</p>
                      </div>
                      <ChevronRight className={`h-4 w-4 shrink-0 ${muted}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* ── Filtered article list ────────────────────── */
          <>
            <button
              onClick={() => setActiveCategory(null)}
              className={`mb-6 flex items-center gap-1 text-sm font-medium ${teal} hover:underline`}
            >
              <ArrowLeft className="h-4 w-4" /> All categories
            </button>
            <h2 className="font-heading text-2xl font-bold mb-2">
              {HELP_CATEGORIES.find((c) => c.id === activeCategory)?.label}
            </h2>
            <p className={`text-sm mb-6 ${muted}`}>
              {HELP_CATEGORIES.find((c) => c.id === activeCategory)?.description}
            </p>
            <div className="space-y-2">
              {results.length === 0 && <p className={muted}>No articles match your search.</p>}
              {results.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setActiveArticle(a)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${surface} ${hoverCard} flex items-center justify-between gap-3`}
                >
                  <div>
                    <h3 className="text-sm font-semibold mb-0.5">{a.title}</h3>
                    <p className={`text-xs ${muted}`}>{a.summary}</p>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 ${muted}`} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className={`border-t mt-16 ${isDarkMode ? 'border-white/10' : 'border-[#E5E4E3]'}`}>
        <div className={`mx-auto max-w-6xl px-6 py-6 text-center text-xs uppercase tracking-widest font-bold ${muted}`}>
          © 2026 CareIndeed Training Operations · Internal Use Only
        </div>
      </footer>
    </div>
  )
}
