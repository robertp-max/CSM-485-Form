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
  const { isDarkMode } = useTheme()
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

  const proceedToTraining = useCallback(() => {
    const nonce = Date.now()
    window.location.hash = `/?dock=course-selection&n=${nonce}`
  }, [])

  /* ── dark/light tokens ────────────────────────────────── */
  const pageGradient = isDarkMode
    ? 'radial-gradient(ellipse at 20% 0%, rgba(0,121,112,0.10) 0%, transparent 55%), radial-gradient(ellipse at 85% 100%, rgba(199,70,1,0.06) 0%, transparent 55%), #010809'
    : 'var(--app-gradient)'
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
      <div className={`min-h-screen flex items-center justify-center ${text} font-sans p-4 md:p-8`} style={{ background: pageGradient }}>
        <div
          className="w-full max-w-5xl mx-auto my-10 rounded-[32px] overflow-hidden border-l-[4.3px]"
          style={{
            background: isDarkMode ? 'rgba(1,8,8,0.55)' : 'rgba(255,255,255,0)',
            borderLeftColor: isDarkMode ? '#64F4F5' : '#C74601',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: isDarkMode
              ? '0 24px 90px rgba(0, 10, 10, 0.82)'
              : '0 24px 60px rgba(31, 28, 27, 0.12)',
          }}
        >
          <header className="flex items-center justify-between gap-4 px-6 py-4 border-b" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#E5E4E3' }}>
            <div className="flex items-center gap-3">
              <button onClick={goBack} className={`flex items-center gap-1 text-sm font-medium ${teal} hover:underline`}>
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {cat && <span className={`text-xs uppercase tracking-widest ${muted}`}>{cat.label}</span>}
            </div>
            <button
              onClick={proceedToTraining}
              className="px-10 py-3 rounded-[16px] text-white text-sm font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, rgba(0,121,112,0.92), rgba(0,92,85,0.92))',
                boxShadow: '0 20px 50px -18px rgba(0,121,112,0.65)',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(12px)',
              }}
            >
              Proceed to Training
            </button>
          </header>

          <main className="px-6 py-8 md:px-10 md:py-10 space-y-6">
            <div>
              <h1 className="font-heading text-3xl font-bold mb-2">{activeArticle.title}</h1>
              <p className={`text-sm mb-4 ${muted}`}>{activeArticle.summary}</p>
            </div>
            <div className="space-y-4 text-base leading-relaxed">
              {activeArticle.body.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {activeArticle.tags.map((t) => (
                <span key={t} className={`rounded-full px-3 py-1 text-xs font-medium ${isDarkMode ? 'bg-[#007970]/15 text-[#64F4F5]' : 'bg-[#E5FEFF] text-[#007970]'}`}>
                  {t}
                </span>
              ))}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${text} font-sans p-4 md:p-8`} style={{ background: pageGradient }}>
      <div
        className="w-full max-w-6xl mx-auto my-8 rounded-[32px] overflow-hidden border-l-[4.3px]"
        style={{
          background: isDarkMode ? 'rgba(1,8,8,0.55)' : 'rgba(255,255,255,0)',
          borderLeftColor: isDarkMode ? '#64F4F5' : '#C74601',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: isDarkMode
            ? '0 24px 90px rgba(0, 10, 10, 0.82)'
            : '0 24px 60px rgba(31, 28, 27, 0.12)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#E5E4E3' }}>
          <div className="flex items-center gap-3">
            <HelpCircle className={`h-5 w-5 ${teal}`} />
            <span className="font-heading text-lg font-bold">Help Center</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={proceedToTraining}
              className="px-10 py-3 rounded-[16px] text-white text-sm font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, rgba(0,121,112,0.92), rgba(0,92,85,0.92))',
                boxShadow: '0 20px 50px -18px rgba(0,121,112,0.65)',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(12px)',
              }}
            >
              Proceed to Training
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-8 md:px-10 md:py-10 space-y-8">
          {/* Hero + search */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.24em]" style={{ color: isDarkMode ? '#64F4F5' : '#007970', background: isDarkMode ? 'rgba(0,121,112,0.12)' : '#E5FEFF', border: isDarkMode ? '1px solid rgba(100,244,245,0.25)' : '1px solid #C4F4F5' }}>
              Onboarding · Step Support
            </div>
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight mb-2">How can we help?</h1>
              <p className={`text-base ${muted}`}>Search articles, browse categories, or jump to FAQ.</p>
            </div>
            <div className={`relative mx-auto max-w-xl rounded-2xl border ${isDarkMode ? 'border-white/15 bg-white/5' : 'border-[#E5E4E3] bg-white shadow-sm'}`}>
              <Search className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${muted}`} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search help articles, FAQ, references…"
                className={`w-full rounded-2xl py-3.5 pl-12 pr-10 text-base bg-transparent focus:outline-none focus:ring-2 focus:ring-[#007970]/50 ${text} placeholder:${muted}`}
              />
              {query && (
                <button onClick={() => setQuery('')} className={`absolute right-3 top-1/2 -translate-y-1/2 ${muted} hover:${text}`}>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => { setShowFaq(false); setActiveCategory(null) }}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                !showFaq
                  ? (isDarkMode ? 'bg-[#007970]/30 text-[#64F4F5]' : 'bg-[#007970] text-white shadow-lg shadow-[#007970]/30')
                  : (isDarkMode ? 'text-white/60 hover:text-white' : 'text-[#747474] hover:text-[#1F1C1B]')
              }`}
            >
              <BookOpen className="h-4 w-4" /> Articles
            </button>
            <button
              onClick={() => setShowFaq(true)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                showFaq
                  ? (isDarkMode ? 'bg-[#007970]/30 text-[#64F4F5]' : 'bg-[#007970] text-white shadow-lg shadow-[#007970]/30')
                  : (isDarkMode ? 'text-white/60 hover:text-white' : 'text-[#747474] hover:text-[#1F1C1B]')
              }`}
            >
              <MessageCircleQuestion className="h-4 w-4" /> FAQ
            </button>
          </div>

          {/* Content */}
          {showFaq ? (
            <div className="space-y-3 max-w-3xl mx-auto">
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
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

              {query && (
                <div className="space-y-2">
                  <h2 className="font-heading text-lg font-bold">
                    {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                  </h2>
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
              )}
            </>
          ) : (
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

          {/* Footer CTA */}
          <div className="pt-6 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#E5E4E3' }}>
            <div className="flex items-center">
              <div className={`text-xs uppercase tracking-[0.18em] font-bold ${muted}`}>
                CareIndeed Training · Internal Use Only
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
