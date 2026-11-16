import { useEffect, useMemo, useRef, useState } from 'react'
import { ARTICLES, applyFilters } from './data'
import { Header, LeftNav } from './components/Chrome'
import FilterPanel from './components/FilterPanel'
import { Head, SmartSummary, Related, ResultsList, buildChips } from './components/Results'

// Panel filters (edited as a draft, committed with "Apply filters").
// The keyword query lives in the header and filters live.
const DEFAULT_FILTERS = { media: 'All', enterpriseAI: false, range: '6m', dist: null, bucket: null, facets: {}, facetModes: {} }
// Gear menu → "Or and version": same app with an or / and radio on some filter groups
const OR_AND = new URLSearchParams(window.location.search).get('version') === 'or-and'
// Gear menu → date alternatives: 'date-alt' (click-click span), 'date-alt-1' (brush), '-2' (segmented card), '-3' (custom range)
const DATE_VERSION = new URLSearchParams(window.location.search).get('version')
const DATE_ALT = DATE_VERSION?.startsWith('date-alt') ? DATE_VERSION : null
const NARROW = '(max-width: 860px)'
const PHONE = '(max-width: 600px)'

// Order-independent snapshot used to compare filter states (ignores empty facet groups)
const snapshot = (f) =>
  JSON.stringify({
    media: f.media,
    enterpriseAI: !!f.enterpriseAI,
    range: f.range,
    dist: f.dist ?? null,
    bucket: f.bucket ? [f.bucket.start, f.bucket.end] : null,
    modes: Object.entries(f.facetModes || {})
      .filter(([, m]) => m === 'and')
      .map(([k]) => k)
      .sort(),
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
  const [compact, setCompact] = useState(false) // compact = split view (list + article pane)
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

  // Phones: the filters are a bottom sheet and the menu a drawer; lock the page behind them
  const [phone, setPhone] = useState(() => window.matchMedia(PHONE).matches)
  useEffect(() => {
    const mq = window.matchMedia(PHONE)
    const onChange = (e) => setPhone(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  const overlay = phone && (showFilters || !navCollapsed)
  useEffect(() => {
    document.body.style.overflow = overlay ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [overlay])
  // Entering the compact (split) view tucks the filters away; "Show filters" brings them back
  // on the left and the list + article pane adapt to the remaining width
  const changeView = (c) => {
    setCompact(c)
    if (c) setShowFilters(false)
  }
  // on medium screens the left menu folds to icons so list + article pane keep a usable width
  const toggleFilters = () => {
    if (!showFilters && compact && window.innerWidth < 1280) setNavCollapsed(true)
    setShowFilters((s) => !s)
  }
  const openFilters = () => {
    if (compact && window.innerWidth < 1280) setNavCollapsed(true)
    setShowFilters(true)
  }
  const closeOverlays = () => {
    setShowFilters(false)
    setNavCollapsed(true)
  }

  // Results and chips reflect only the APPLIED filters
  const results = useMemo(() => applyFilters(ARTICLES, { ...applied, query }), [applied, query])
  const chips = useMemo(() => buildChips({ ...applied, query }), [applied, query])

  // Both buttons stay disabled until the user changes something away from the default / applied state
  const dirty = snapshot(draft) !== snapshot(DEFAULT_FILTERS) || snapshot(draft) !== snapshot(applied)

  const setMedia = (media) => setDraft((f) => ({ ...f, media }))
  const setEnterpriseAI = (enterpriseAI) => setDraft((f) => ({ ...f, enterpriseAI }))
  // Changing the Date Range changes the bars' granularity, so a previously picked bar no longer applies
  const setRange = (range) => setDraft((f) => ({ ...f, range, dist: null, bucket: null }))
  const setDist = (dist) => setDraft((f) => ({ ...f, dist, bucket: null }))
  const setBucket = (bucket) => setDraft((f) => ({ ...f, bucket }))
  const setFacetValue = (facet, value, state) => setDraft((f) => withFacet(f, facet, value, state))
  const setFacetMode = (facet, mode) =>
    setDraft((f) => ({ ...f, facetModes: { ...(f.facetModes || {}), [facet]: mode } }))

  // Removing a chip is an explicit action on the applied results, so it applies immediately
  const removeChip = (c) => {
    const update = (f) => {
      if (c.kind === 'range') return { ...f, range: null, dist: null, bucket: null }
      if (c.kind === 'bucket') return { ...f, bucket: null }
      if (c.kind === 'media') return { ...f, media: 'All' }
      if (c.kind === 'enterpriseAI') return { ...f, enterpriseAI: false }
      return withFacet(f, c.facet, c.value, 'off')
    }
    if (c.kind === 'query') return setQuery('')
    setDraft(update)
    setApplied(update)
  }

  // Clicking an or / and connector in the applied card flips that group's mode right away
  const toggleMode = (facet, mode) => {
    const update = (f) => ({ ...f, facetModes: { ...(f.facetModes || {}), [facet]: mode } })
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
      <Header
        onMenu={() => setNavCollapsed((c) => !c)}
        chips={chips}
        onRemoveChip={removeChip}
        onReset={reset}
        onOpenFilters={openFilters}
      />
      {overlay && <div className="scrim" onClick={closeOverlays} aria-hidden />}
      <div className="body">
        <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((c) => !c)} />
        <main className="main">
          <div className={`main__inner${showFilters ? '' : ' main__inner--centered'}`}>
            {showFilters && (
              <FilterPanel
                filters={{ ...draft, query }}
                dirty={dirty}
                setMedia={setMedia}
                setEnterpriseAI={setEnterpriseAI}
                setRange={setRange}
                setDist={setDist}
                setBucket={setBucket}
                setFacetValue={setFacetValue}
                orAnd={OR_AND}
                dateAlt={DATE_ALT}
                setFacetMode={setFacetMode}
                onReset={reset}
                onApply={apply}
                onClose={() => setShowFilters(false)}
              />
            )}
            <div className={`content${compact ? ' content--split' : ''}`} ref={resultsRef}>
              <Head
                orAnd={OR_AND}
                showFilters={showFilters}
                onToggleFilters={toggleFilters}
                chips={chips}
                onRemoveChip={removeChip}
                onToggleMode={toggleMode}
              />
              <SmartSummary />
              <Related />
              <ResultsList articles={results} onReset={reset} compact={compact} onCompact={changeView} />
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
