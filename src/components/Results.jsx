import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  DotsThreeVertical,
  ArrowRight,
  FunnelSimple,
  X,
  Prohibit,
  StarFour,
  WarningCircle,
  CaretDown,
  CaretUp,
  CaretLeft,
  CaretRight,
  Sparkle,
  Rows,
  Columns,
  ArrowsDownUp,
  FileText,
} from '@phosphor-icons/react'
import { DATE_RANGES, FACETS, formatDate, GMT_TIME } from '../data'

const PAGE_SIZES = [10, 25, 50]
const cleanSource = (name) => name.replace(/ \(.* language translation\)/, '')

const PILL_ROW = 24
const PILL_GAP = 8
const MAX_PILL_ROWS = 2

export function Head({ showFilters, onToggleFilters, onRemoveChip, chips }) {
  const pillsRef = useRef(null)
  const [expanded, setExpanded] = useState(false)
  const [width, setWidth] = useState(0)
  // `fit` = how many pills (toggle included) fit in two rows together with the link; null = measuring
  const [fit, setFit] = useState(null)
  const [overflowed, setOverflowed] = useState(false)

  useLayoutEffect(() => {
    const el = pillsRef.current
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // anything that can change the layout → render everything again and re-measure
  useLayoutEffect(() => setFit(null), [chips, showFilters, expanded, width])

  // Measure with every pill rendered: keep the pills of the first two rows and leave room
  // for the "See more (n)" link at the end of the second row (Figma "Pills")
  useLayoutEffect(() => {
    if (fit !== null) return
    const el = pillsRef.current
    const nodes = [...el.querySelectorAll('.chip')]
    const link = el.querySelector('.pills__more')
    const box = el.getBoundingClientRect()
    const top0 = nodes[0].getBoundingClientRect().top
    const row = (n) => Math.round((n.getBoundingClientRect().top - top0) / (PILL_ROW + PILL_GAP))
    const right = (n) => n.getBoundingClientRect().right - box.left
    let count = nodes.filter((n) => row(n) < MAX_PILL_ROWS).length
    const over = count < nodes.length
    if (over && link) {
      while (count > 1) {
        const last = nodes[count - 1]
        const linkW = link.getBoundingClientRect().width
        if (row(last) === MAX_PILL_ROWS - 1 && right(last) + PILL_GAP + linkW > box.width) count--
        else break
      }
    }
    setOverflowed(over)
    setFit(count)
  }, [fit])

  const collapsed = overflowed && !expanded && fit !== null
  const shown = collapsed ? chips.slice(0, fit - 1) : chips
  const hiddenCount = chips.length - shown.length

  return (
    <>
      <div className="title-row">
        <h1>Apple</h1>
        <button className="btn btn--outline-icon" aria-label="More options">
          <DotsThreeVertical size={16} weight="bold" />
        </button>
        <button className="btn btn--solid btn--small">Modify<span className="hide-phone"> Search</span></button>
      </div>

      <a className="profile-link" href="#profile" onClick={(e) => e.preventDefault()}>
        Apple Inc. Profile <ArrowRight size={16} />
      </a>

      <div className="pills" ref={pillsRef}>
        <button
          className={`chip chip--toggle${showFilters ? ' chip--active' : ''}`}
          onClick={onToggleFilters}
          aria-pressed={showFilters}
        >
          <FunnelSimple size={16} />
          {showFilters ? 'Hide filters' : 'Show filters'}
        </button>
        {(fit === null ? chips : shown).map((c) => (
          <button
            key={c.id}
            className={`chip${c.excluded ? ' chip--out' : ''}`}
            onClick={() => onRemoveChip(c)}
            aria-label={`Remove filter ${c.label}`}
          >
            {c.excluded && <Prohibit size={12} />}
            {c.label}
            <X size={12} weight="bold" />
          </button>
        ))}
        {(fit === null || overflowed) && (
          <button className="pills__more" onClick={() => setExpanded((e) => !e)} aria-expanded={expanded}>
            {expanded ? 'See less' : `See more (${fit === null ? chips.length : hiddenCount})`}
          </button>
        )}
      </div>
    </>
  )
}

export function SmartSummary() {
  const [open, setOpen] = useState(false)
  return (
    <section className="summary" aria-label="Smart Summary">
      <div className="summary__head">
        <div className="summary__title">
          <StarFour size={16} weight="fill" /> Smart Summary
        </div>
        <button className="link-btn">
          Disclaimer <WarningCircle size={16} />
        </button>
      </div>
      <div className={`summary__body${open ? '' : ' summary__collapsed'}`}>
        <ul>
          <li>
            Trump threatened to impose sweeping tariffs including a 100% tariff on all Canadian goods if Canada
            signs a deal with China. This threat targets Canada as a strategic lever and could disrupt roughly
            three quarters of Canadian exports to the U.S. and bilateral supply chains{' '}
            <span className="cite">[1] [2]</span>
          </li>
          {open && (
            <li>
              Apple and other large U.S. technology companies are weighing supply-chain exposure to the proposed
              measures, with analysts flagging potential margin pressure in the next two quarters{' '}
              <span className="cite">[3]</span>
            </li>
          )}
        </ul>
      </div>
      <div className="summary__foot">
        <button className="btn btn--text-primary" onClick={() => setOpen((o) => !o)}>
          {open ? 'View Less' : 'View More'} {open ? <CaretUp size={16} /> : <CaretDown size={16} />}
        </button>
        <button className="btn btn--text-primary">
          <Sparkle size={16} /> Deeper Analysis <CaretRight size={16} />
        </button>
      </div>
    </section>
  )
}

export function Related({ onPick }) {
  return (
    <section className="related">
      <h2>Related Searches</h2>
      <div className="related__tags">
        {['Apple stock', 'Apple new product releases', 'Apple financial performance'].map((t) => (
          <button key={t} className="tag" onClick={() => onPick(t)}>
            {t}
          </button>
        ))}
      </div>
    </section>
  )
}

export function ResultsList({ articles, onReset }) {
  const [compact, setCompact] = useState(false)
  const [sort, setSort] = useState('relevance')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  // new result set (filters / search changed) → back to the first page
  useEffect(() => setPage(1), [articles])

  const sorted = [...articles].sort((a, b) =>
    sort === 'newest' ? b.date.localeCompare(a.date) : sort === 'oldest' ? a.date.localeCompare(b.date) : 0,
  )
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const current = Math.min(page, pages)
  const from = (current - 1) * pageSize
  const visible = sorted.slice(from, from + pageSize)

  const goTo = (p) => setPage(p) // no scrolling: the page keeps its position

  return (
    <section className={`results${compact ? ' results--compact' : ''}`} aria-label="Top headlines">
      <div className="toolbar">
        <h2 className="toolbar__title">
          Top Headlines <span className="badge" aria-live="polite">{articles.length.toLocaleString('en-US')}</span>
        </h2>
        <div className="toolbar__right">
          <div className="view-toggle" role="group" aria-label="Density">
            <button aria-pressed={!compact} onClick={() => setCompact(false)} aria-label="Detailed view">
              <Rows size={16} />
            </button>
            <button aria-pressed={compact} onClick={() => setCompact(true)} aria-label="Compact view">
              <Columns size={16} />
            </button>
          </div>
          <label className="sort">
            <ArrowsDownUp size={16} />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value)
                setPage(1)
              }}
              aria-label="Sort by"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <CaretDown size={16} />
          </label>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <strong>No headlines match these filters</strong>
          <button className="link-btn link-btn--primary" onClick={onReset}>
            Reset filters
          </button>
        </div>
      ) : (
        visible.map((a) => (
          <article className="card" key={a.id}>
            <div className="card__main">
              <div className="card__content">
                <h3 className="card__title">{a.title}</h3>
                <p className="card__body">{a.body}</p>
              </div>
              <div className="card__meta">
                <span className="card__topic">{a.topic}</span>
                <a className="card__source" href="#source" onClick={(e) => e.preventDefault()}>
                  <i /> {cleanSource(a.source)}
                </a>
                <span>{formatDate(a.date)}</span>
                <span>{GMT_TIME}</span>
                <span>{a.readTime} min read</span>
                <FileText size={16} />
              </div>
            </div>
          </article>
        ))
      )}

      <nav className="pager" aria-label="Pagination">
        <div className="pager__left">
          <button disabled={current === 1} onClick={() => goTo(current - 1)} aria-label="Previous page">
            <CaretLeft size={16} />
          </button>
          <span>
            Page {current} of {pages}
          </span>
          <button disabled={current === pages} onClick={() => goTo(current + 1)} aria-label="Next page">
            <CaretRight size={16} />
          </button>
        </div>
        <div className="pager__right">
          <span>
            <strong>Results:</strong>{' '}
            {sorted.length ? `${from + 1}–${from + visible.length}` : '0'} of {sorted.length.toLocaleString('en-US')}
          </span>
          <label className="pager__size">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPage(1)
              }}
              aria-label="Items per page"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n} items per page
                </option>
              ))}
            </select>
            <CaretDown size={16} />
          </label>
        </div>
      </nav>
    </section>
  )
}

export function buildChips(filters) {
  const chips = []
  if (filters.range) {
    chips.push({
      id: 'range',
      kind: 'range',
      label: DATE_RANGES.find((r) => r.id === filters.range).label,
    })
  }
  if (filters.bucket) chips.push({ id: 'bucket', kind: 'bucket', label: filters.bucket.label })
  if (filters.media !== 'All') chips.push({ id: 'media', kind: 'media', label: filters.media })
  for (const f of FACETS) {
    for (const [value, state] of Object.entries(filters.facets[f.key] || {})) {
      if (state === 'off') continue
      chips.push({
        id: `${f.key}:${value}`,
        kind: 'facet',
        facet: f.key,
        value,
        excluded: state === 'out',
        label: cleanSource(value),
      })
    }
  }
  if (filters.query.trim()) chips.push({ id: 'query', kind: 'query', label: `“${filters.query.trim()}”` })
  return chips
}
