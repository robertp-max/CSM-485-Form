import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, ChevronRight, GraduationCap, HelpCircle, MessageCircleQuestion, Search, X } from 'lucide-react'
import { HELP_ARTICLES, HELP_CATEGORIES, FAQ_ENTRIES, type HelpArticle, type HelpCategory } from '../data/helpArticles'

function fuzzy(query: string, text: string): boolean {
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  if (t.includes(q)) return true
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

export function HelpCenterInline({ isDarkMode = false, onStartTraining }: { isDarkMode?: boolean; onStartTraining?: () => void } = {}) {
  // isDarkMode passed from parent — DOM classList check is unreliable since
  // the Tailwind 'dark' class lives on a wrapper div, not on <html>.
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

  const surface = isDarkMode ? 'bg-white/5 border-white/12' : 'bg-white/60 border-white/40'
  const text = isDarkMode ? 'text-[#F3F4F6]' : 'text-[#1F1C1B]'
  const muted = isDarkMode ? 'text-white/60' : 'text-[#747474]'
  const teal = 'text-[#007970] dark:text-[#64F4F5]'
  const hoverCard = isDarkMode
    ? 'hover:border-[#007970]/60 hover:bg-white/[0.04]'
    : 'hover:border-[#007970] hover:shadow-[4px_4px_0_#007970] hover:-translate-y-0.5 hover:-translate-x-0.5'

  if (activeArticle) {
    const cat = HELP_CATEGORIES.find((c) => c.id === activeArticle.category)
    return (
      <div className={`w-full h-full ${text} font-sans flex flex-col`}>
          <header className="flex items-center justify-between gap-4 px-6 py-3 border-b" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#E5E4E3' }}>
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveArticle(null)} className={`flex items-center gap-1 text-sm font-medium ${teal} hover:underline`}>
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {cat && <span className={`text-xs uppercase tracking-widest ${muted}`}>{cat.label}</span>}
            </div>
          </header>
          <main className="px-6 py-6 space-y-4 flex-1 overflow-y-auto">
            <div>
              <h1 className="font-heading text-2xl font-bold mb-1">{activeArticle.title}</h1>
              <p className={`text-sm mb-2 ${muted}`}>{activeArticle.summary}</p>
            </div>
            <div className="space-y-3 text-base leading-relaxed">
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
    )
  }

  return (
    <div className={`w-full h-full ${text} font-sans flex flex-col`}>
        <div className="flex items-center justify-between gap-4 px-6 py-3 border-b" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#E5E4E3' }}>
          <div className="flex items-center gap-3">
            <HelpCircle className={`h-5 w-5 ${teal}`} />
            <span className="font-heading text-lg font-bold">Help Center</span>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6 flex-1 overflow-y-auto">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.24em]" style={{ color: isDarkMode ? '#64F4F5' : '#007970', background: isDarkMode ? 'rgba(0,121,112,0.12)' : '#E5FEFF', border: isDarkMode ? '1px solid rgba(100,244,245,0.25)' : '1px solid #C4F4F5' }}>
              Onboarding · Step Support
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-tight mb-1">How can we help?</h1>
              <p className={`text-base ${muted}`}>Search articles, browse categories, or jump to FAQ.</p>
            </div>
            <div className={`relative mx-auto max-w-2xl rounded-2xl border ${isDarkMode ? 'border-white/15 bg-white/5' : 'border-[#E5E4E3] bg-white shadow-sm'}`}>
              <Search className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${muted}`} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search help articles, FAQ, references…"
                className={`w-full rounded-2xl py-3.5 pl-12 pr-10 text-base bg-transparent focus:outline-none focus:ring-2 focus:ring-[#007970]/50 ${text} placeholder:${muted}`}
              />
              {query && (
                <button onClick={() => setQuery('')} className={`absolute right-3 top-1/2 -translate-y-1/2 ${muted}`}>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Prominent Start Training CTA */}
          {onStartTraining && (
            <div className="text-center">
              <button
                onClick={onStartTraining}
                className={`group inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 hover:-translate-y-1 ${
                  isDarkMode
                    ? 'bg-[#007970] hover:bg-[#006059] text-white shadow-[0_12px_40px_rgba(0,121,112,0.35)] hover:shadow-[0_18px_50px_rgba(0,121,112,0.5)]'
                    : 'bg-[#007970] hover:bg-[#006059] text-white shadow-[0_12px_40px_rgba(0,121,112,0.25)] hover:shadow-[0_18px_50px_rgba(0,121,112,0.35)]'
                }`}
              >
                <GraduationCap className="w-5 h-5" /> Start Training <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className={`text-xs mt-2 ${isDarkMode ? 'text-white/50' : 'text-[#747474]'}`}>Jump to the module selection page</p>
            </div>
          )}

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

          {showFaq ? (
            <div className="space-y-3 max-w-3xl mx-auto">
              {faqResults.length === 0 && (
                <p className={muted}>No FAQ matches for "{query}"</p>
              )}
              {faqResults.map((f) => (
                <details key={f.id} className={`group rounded-xl border p-0 transition-all ${surface} ${hoverCard}`}>
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
              {!query && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              )}

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
        </div>
    </div>
  )
}
