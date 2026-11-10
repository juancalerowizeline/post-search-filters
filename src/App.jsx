import { useEffect, useMemo, useRef, useState } from 'react'
import { ARTICLES, applyFilters } from './data'
import { Header, LeftNav } from './components/Chrome'
import FilterPanel from './components/FilterPanel'
import { Head, SmartSummary, Related, ResultsList, buildChips } from './components/Results'

// Panel filters (edited as a draft, committed with "Apply filters").
// The keyword query lives in the header and filters live.
const DEFAULT_FILTERS = { media: 'All', range: '6m', dist: null, bucket: null, facets: {} }
const NARROW = '(max-width: 860px)'

// Order-independent snapshot used to compare filter states (ignores empty facet groups)
const snapshot = (f) =>
  JSON.stringify({
    media: f.media,
    range: f.range,
    dist: f.dist ?? null,
    bucket: f.bucket ? [f.bucket.start, f.bucket.end] : null,
    facets: Object.keys(f.facets)
      .sort()
      .map((k) => [k, Object.entries(f.facets[k]).sort(([a], [b]) => a.localeCompare(b))])
      .filter(([, entries]) => entries.length),
  })

export default function App() {
  const [draft, setDraft] = useState(DEFAULT_FILTERS)
  const [applied, setApplied] = useState(DEFAULT_FILTERS)
  const [query, setQuery] = useState('')
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

  // Results and chips reflect only the APPLIED filters
  const results = useMemo(() => applyFilters(ARTICLES, { ...applied, query }), [applied, query])
  const chips = useMemo(() => buildChips({ ...applied, query }), [applied, query])

  // Both buttons stay disabled until the user changes something away from the default / applied state
  const dirty = snapshot(draft) !== snapshot(DEFAULT_FILTERS) || snapshot(draft) !== snapshot(applied)

  const setMedia = (media) => setDraft((f) => ({ ...f, media }))
  // Changing the Date Range changes the bars' granularity, so a previously picked bar no longer applies
  const setRange = (range) => setDraft((f) => ({ ...f, range, dist: null, bucket: null }))
  const setDist = (dist) => setDraft((f) => ({ ...f, dist, bucket: null }))
  const setBucket = (bucket) => setDraft((f) => ({ ...f, bucket }))
  const setFacetValue = (facet, value, state) => setDraft((f) => withFacet(f, facet, value, state))

  // Removing a chip is an explicit action on the applied results, so it applies immediately
  const removeChip = (c) => {
    const update = (f) => {
      if (c.kind === 'range') return { ...f, range: null, dist: null, bucket: null }
      if (c.kind === 'bucket') return { ...f, bucket: null }
      if (c.kind === 'media') return { ...f, media: 'All' }
      return withFacet(f, c.facet, c.value, 'off')
    }
    if (c.kind === 'query') return setQuery('')
    setDraft(update)
    setApplied(update)
  }

  const apply = () => {
    setApplied(draft)
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (window.matchMedia(NARROW).matches) setShowFilters(false)
  }

  const reset = () => {
    setDraft(DEFAULT_FILTERS)
    setApplied(DEFAULT_FILTERS)
  }

  return (
    <div className="app">
      <Header query={query} onQuery={setQuery} />
      <div className="body">
        <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((c) => !c)} />
        <main className="main">
          <div className={`main__inner${showFilters ? '' : ' main__inner--centered'}`}>
            {showFilters && (
              <FilterPanel
                filters={{ ...draft, query }}
                dirty={dirty}
                setMedia={setMedia}
                setRange={setRange}
                setDist={setDist}
                setBucket={setBucket}
                setFacetValue={setFacetValue}
                onReset={reset}
                onApply={apply}
              />
            )}
            <div className="content" ref={resultsRef}>
              <Head
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters((s) => !s)}
                chips={chips}
                onRemoveChip={removeChip}
              />
              <SmartSummary />
              <Related onPick={setQuery} />
              <ResultsList articles={results} onReset={reset} />
            </div>
          </div>
          <footer className="footer">
            © 2025 Dow Jones All rights reserved
            {['Terms of Use', 'Privacy Notice', 'Cookie Notice', 'Accessibility', 'Send Feedback'].map((l) => (
              <span key={l}>
                {' • '}
                <a href="#footer" onClick={(e) => e.preventDefault()}>{l}</a>
              </span>
            ))}
          </footer>
        </main>
      </div>
    </div>
  )
}

function withFacet(f, facet, value, state) {
  const next = { ...(f.facets[facet] || {}) }
  if (state === 'off') delete next[value]
  else next[value] = state
  return { ...f, facets: { ...f.facets, [facet]: next } }
}
