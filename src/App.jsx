import { useEffect, useMemo, useRef, useState } from 'react'
import { ARTICLES, applyFilters } from './data'
import { Header, LeftNav } from './components/Chrome'
import FilterPanel from './components/FilterPanel'
import { Head, SmartSummary, Related, ResultsList, buildChips } from './components/Results'

const INITIAL = { media: 'All', range: '6m', query: '', facets: {} }
const NARROW = '(max-width: 860px)'

export default function App() {
  const [filters, setFilters] = useState(INITIAL)
  const [navCollapsed, setNavCollapsed] = useState(() => window.matchMedia(NARROW).matches)
  const [showFilters, setShowFilters] = useState(() => !window.matchMedia(NARROW).matches)
  const resultsRef = useRef(null)

  // keep layout sensible when crossing the narrow breakpoint
  useEffect(() => {
    const mq = window.matchMedia(NARROW)
    const onChange = (e) => {
      setNavCollapsed(e.matches)
      setShowFilters(!e.matches)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const results = useMemo(() => applyFilters(ARTICLES, filters), [filters])
  const chips = useMemo(() => buildChips(filters), [filters])

  const setMedia = (media) => setFilters((f) => ({ ...f, media }))
  const setRange = (range) => setFilters((f) => ({ ...f, range }))
  const setQuery = (query) => setFilters((f) => ({ ...f, query }))
  const setFacetValue = (facet, value, state) =>
    setFilters((f) => {
      const next = { ...(f.facets[facet] || {}) }
      if (state === 'off') delete next[value]
      else next[value] = state
      return { ...f, facets: { ...f.facets, [facet]: next } }
    })

  const removeChip = (c) => {
    if (c.kind === 'range') setRange(null)
    else if (c.kind === 'media') setMedia('All')
    else if (c.kind === 'query') setQuery('')
    else setFacetValue(c.facet, c.value, 'off')
  }

  const reset = () => setFilters(INITIAL)
  const clearAll = () => setFilters({ media: 'All', range: null, query: '', facets: {} })
  const apply = () => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (window.matchMedia(NARROW).matches) setShowFilters(false)
  }

  return (
    <div className="app">
      <Header query={filters.query} onQuery={setQuery} />
      <div className="body">
        <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((c) => !c)} />
        <main className="main">
          <div className="main__inner">
            {showFilters && (
              <FilterPanel
                filters={filters}
                results={results}
                setMedia={setMedia}
                setRange={setRange}
                setFacetValue={setFacetValue}
                onReset={reset}
                onApply={apply}
              />
            )}
            <div className="content" ref={resultsRef}>
              <Head
                filters={filters}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters((s) => !s)}
                chips={chips}
                onRemoveChip={removeChip}
                onClearAll={clearAll}
              />
              <SmartSummary />
              <Related onPick={setQuery} />
              <ResultsList articles={results} total={ARTICLES.length} onReset={reset} />
            </div>
          </div>
          <footer className="footer">Prototype built from the “Post Search Filters (WIP)” Figma design · DJ Platform theme</footer>
        </main>
      </div>
    </div>
  )
}
