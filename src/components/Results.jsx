import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  Info,
  ArrowSquareOut,
  DownloadSimple,
  BookmarkSimple,
  LinkSimpleHorizontal,
  Play,
} from '@phosphor-icons/react'
import { DATE_RANGES, FACETS, formatDate, GMT_TIME } from '../data'
import logo from '../assets/dow-jones.svg'
import { SidebarSliderIn, SidebarSliderOut } from './SidebarIcons'

const PAGE_SIZES = [10, 25, 50]
const cleanSource = (name) => name.replace(/ \(.* language translation\)/, '')

const PILL_ROW = 24
const PILL_GAP = 8
const MAX_PILL_ROWS = 2

function TitleBlock() {
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
    </>
  )
}

const GROUP_LABELS = { range: 'Date Range', bucket: 'Date', media: 'Media Types', query: 'Keyword' }

// Applied chips grouped by the filter they come from, in order of first appearance
function groupChips(chips) {
  const groups = []
  for (const c of chips) {
    const key = c.kind === 'facet' ? c.facet : c.kind
    let g = groups.find((x) => x.key === key)
    if (!g) {
      g = { key, label: c.kind === 'facet' ? c.facetTitle : GROUP_LABELS[c.kind], mode: c.mode, chips: [] }
      groups.push(g)
    }
    g.chips.push(c)
  }
  return groups
}

// "Or and version": one card with the applied filters (Figma `applied`). The leading icon toggles
// the filter sidebar; the title row opens / closes the pills. Connectors: or / and between the
// included values of a group, "not" before the excluded ones.
function AppliedFilters({ chips, showFilters, onToggleFilters, onRemoveChip, onToggleMode }) {
  const [open, setOpen] = useState(true)
  const groups = groupChips(chips)

  const chip = (c) => (
    <button
      key={c.id}
      className={`chip${c.excluded ? ' chip--neg' : ''}`}
      onClick={() => onRemoveChip(c)}
      aria-label={`Remove filter ${c.label}`}
    >
      {c.excluded && <Prohibit size={16} />}
      {c.label}
      <X size={12} weight="bold" />
    </button>
  )

  return (
    <section className={`applied${open ? ' applied--open' : ''}`} aria-label="Filters applied">
      <div className="applied__head">
        <button
          className={`applied__toggle${showFilters ? ' applied__toggle--on' : ''}`}
          onClick={onToggleFilters}
          aria-pressed={showFilters}
          aria-label={showFilters ? 'Hide filters' : 'Show filters'}
          title={showFilters ? 'Hide filters' : 'Show filters'}
        >
          {showFilters ? <SidebarSliderIn /> : <SidebarSliderOut />}
        </button>
        <button className="applied__title" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <span>Filters Applied ({chips.length})</span>
          {open ? <CaretUp size={20} /> : <CaretDown size={20} />}
        </button>
      </div>
      {open && groups.length > 0 && (
        <div className="applied__groups">
          {groups.map((g) => {
            const included = g.chips.filter((c) => !c.excluded)
            const excluded = g.chips.filter((c) => c.excluded)
            return (
              <div className="applied__group" key={g.key}>
                <div className="applied__group-label">{g.label}</div>
                <div className="applied__pills">
                  {included.map((c, i) => (
                    <Fragment key={c.id}>
                      {i > 0 && (
                        <button
                          className="chip chip--op"
                          onClick={() => onToggleMode(g.key, g.mode === 'and' ? 'or' : 'and')}
                          aria-label={`${g.label}: match ${g.mode}. Switch to ${g.mode === 'and' ? 'or' : 'and'}`}
                          title={`Switch to ${g.mode === 'and' ? 'or' : 'and'}`}
                        >
                          {g.mode}
                        </button>
                      )}
                      {chip(c)}
                    </Fragment>
                  ))}
                  {excluded.length > 0 && <span className="chip chip--op">not</span>}
                  {excluded.map(chip)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function HeadOrAnd({ showFilters, onToggleFilters, onRemoveChip, onToggleMode, chips }) {
  return (
    <>
      <TitleBlock />
      <AppliedFilters
        chips={chips}
        showFilters={showFilters}
        onToggleFilters={onToggleFilters}
        onRemoveChip={onRemoveChip}
        onToggleMode={onToggleMode}
      />
    </>
  )
}

export function Head(props) {
  return props.orAnd ? <HeadOrAnd {...props} /> : <HeadClassic {...props} />
}

function HeadClassic({ showFilters, onToggleFilters, onRemoveChip, chips }) {
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
      <TitleBlock />

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

export function Related() {
  return (
    <section className="related">
      <h2>Related Searches</h2>
      <div className="related__tags">
        {['Apple stock', 'Apple new product releases', 'Apple financial performance'].map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>
    </section>
  )
}


// Fictional follow-up copy so the viewer reads like a full article (sample content only)
function articleParagraphs(a) {
  const region = a.region[0]
  const company = a.company[0]
  return [
    { text: a.body },
    {
      head: 'Background',
      text: `${company} has been under close watch from investors in ${region} over the past year, with attention focused on ${a.subject[0].toLowerCase()} and how management allocates capital. Executives said the latest development fits the strategy outlined at earlier investor events.`,
    },
    {
      text: `Analysts covering the ${a.industry[0].toLowerCase()} sector said the move could influence competitors, although they cautioned that the impact will depend on execution and on regulatory conditions in ${region}.`,
    },
    {
      head: 'What comes next',
      text: `The company said it will provide further detail in its next scheduled update. Market participants expect additional disclosures on timing, costs and the expected effect on revenue over the coming quarters.`,
    },
    { text: 'This is sample content created for the prototype; names of companies are real, events and figures are fictional.' },
  ]
}

function ArticleViewer({ article: a, onClose }) {
  const paragraphs = articleParagraphs(a)
  const words = paragraphs.reduce((n, p) => n + p.text.split(/\s+/).length, 0)
  const longDate = new Date(a.date + 'T12:00:00Z').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
  const subheadline = a.body.split(/(?<=\.)\s/)[0]
  return (
    <article className="viewer">
      <header className="viewer__header">
        <div className="viewer__bar">
          <img src={logo} alt="Dow Jones" className="viewer__logo" />
          <div className="viewer__actions">
            <button className="icon-btn icon-btn--sm" aria-label="Open in a new tab">
              <ArrowSquareOut size={20} />
            </button>
            <button className="icon-btn icon-btn--sm" aria-label="Close article" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>
        <hr className="viewer__rule" />
      </header>

      <div className="viewer__content">
        <div className="viewer__source">{cleanSource(a.source)}</div>
        <div className="viewer__headline">
          <div className="viewer__tags">
            {[a.topic, a.media, a.region[0]].map((t) => (
              <span key={t} className="ptag">
                {t}
              </span>
            ))}
          </div>
          <h3>{a.title}</h3>
          <p className="viewer__sub">{subheadline}</p>
          <div className="viewer__byline">
            <span>By John Doe</span>
            <span>
              <a href="#source" onClick={(e) => e.preventDefault()}>
                {cleanSource(a.source)},
              </a>{' '}
              {a.language[0]}, {words.toLocaleString('en-US')} words, {longDate}
            </span>
          </div>
        </div>

        <div className="viewer__utility">
          <div>
            <button className="icon-btn icon-btn--xs" aria-label="Download">
              <DownloadSimple size={16} />
            </button>
            <button className="icon-btn icon-btn--xs" aria-label="Save">
              <BookmarkSimple size={16} />
            </button>
            <button className="icon-btn icon-btn--xs" aria-label="Copy link">
              <LinkSimpleHorizontal size={16} />
            </button>
          </div>
          <button className="viewer__listen">
            <Play size={16} /> Listen ({String(a.readTime).padStart(2, '0')}:20)
          </button>
        </div>

        <div className="viewer__body">
          {paragraphs.map((p, i) => (
            <div key={i}>
              {p.head && <h4>{p.head}</h4>}
              <p>{p.text}</p>
            </div>
          ))}
        </div>

        <footer className="viewer__copy">
          <hr />
          <span>Dow Jones &amp; Company, Inc.</span>
          <span>WP-DJ-{String(a.id).padStart(10, '0')}</span>
        </footer>
      </div>
    </article>
  )
}

export function ResultsList({ articles, onReset, compact, onCompact }) {
  const setCompact = onCompact
  const [selectedId, setSelectedId] = useState(null) // compact (split) view: article shown in the right pane
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

  const selected = articles.find((a) => a.id === selectedId)

  const cards =
    visible.length === 0 ? (
        <div className="empty">
          <strong>No headlines match these filters</strong>
          <button className="link-btn link-btn--primary" onClick={onReset}>
            Reset filters
          </button>
        </div>
    ) : (
      visible.map((a) => (
          <article
            className={`card${compact ? ' card--split' : ''}${compact && a.id === selectedId ? ' card--selected' : ''}`}
            key={a.id}
            onClick={compact ? () => setSelectedId(a.id) : undefined}
            onKeyDown={compact ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSelectedId(a.id)) : undefined}
            tabIndex={compact ? 0 : undefined}
            aria-current={compact && a.id === selectedId ? 'true' : undefined}
          >
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
    )
  const pager = (
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
  )

  return (
    <section className={`results${compact ? ' results--split' : ''}`} aria-label="Top headlines">
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

      {compact ? (
        <div className="split">
          <div className="split__list">
            {cards}
            {pager}
          </div>
          <aside className="split__detail" aria-live="polite">
            {selected ? (
              <ArticleViewer article={selected} onClose={() => setSelectedId(null)} />
            ) : (
              <div className="detail__empty">
                <Info size={16} weight="fill" />
                <strong>No article selected.</strong>
                <span>Select an article from the sidebar to view</span>
              </div>
            )}
          </aside>
        </div>
      ) : (
        <>
          {cards}
          {pager}
        </>
      )}
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
        facetTitle: f.title,
        mode: filters.facetModes?.[f.key] || 'or', // how the included values of the group combine
        value,
        excluded: state === 'out',
        label: cleanSource(value),
      })
    }
  }
  if (filters.query.trim()) chips.push({ id: 'query', kind: 'query', label: `“${filters.query.trim()}”` })
  return chips
}
