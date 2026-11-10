import { useState } from 'react'
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
import { DATE_RANGES, FACETS, formatDate } from '../data'

export function Head({ filters, showFilters, onToggleFilters, onRemoveChip, onClearAll, chips }) {
  return (
    <>
      <div className="title-row">
        <h1>Apple</h1>
        <button className="btn btn--outline-icon" aria-label="More options">
          <DotsThreeVertical size={16} weight="bold" />
        </button>
        <button className="btn btn--solid btn--small">Modify Search</button>
      </div>

      <a className="profile-link" href="#profile" onClick={(e) => e.preventDefault()}>
        Apple Inc. Profile <ArrowRight size={16} />
      </a>

      <div className="pills">
        <button
          className={`chip chip--toggle${showFilters ? ' chip--active' : ''}`}
          onClick={onToggleFilters}
          aria-pressed={showFilters}
        >
          <FunnelSimple size={16} />
          {showFilters ? 'Hide filters' : 'Show filters'}
        </button>
        {chips.map((c) => (
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
        {chips.length > 0 && (
          <button className="link-btn link-btn--primary" onClick={onClearAll}>
            Clear all
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
        {!open && <div className="summary__fade" />}
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

export function ResultsList({ articles, total, onReset }) {
  const [compact, setCompact] = useState(false)
  const [sort, setSort] = useState('relevance')

  const sorted = [...articles].sort((a, b) =>
    sort === 'newest' ? b.date.localeCompare(a.date) : sort === 'oldest' ? a.date.localeCompare(b.date) : 0,
  )

  return (
    <section className={`results${compact ? ' results--compact' : ''}`} aria-label="Top headlines">
      <div className="toolbar">
        <h2 className="toolbar__title">
          Top Headlines <span className="badge" aria-live="polite">{articles.length}</span>
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
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
              <option value="relevance">Relevance</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <CaretDown size={16} />
          </label>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty">
          <strong>No headlines match these filters</strong>
          <button className="link-btn link-btn--primary" onClick={onReset}>
            Reset filters
          </button>
        </div>
      ) : (
        sorted.map((a) => (
          <article className="card" key={a.id}>
            <h3 className="card__title">{a.title}</h3>
            <p className="card__body">{a.body}</p>
            <div className="card__meta">
              <span className="card__topic">{a.topic}</span>
              <a className="card__source" href="#source" onClick={(e) => e.preventDefault()}>
                <i /> {a.source.replace(' (Chinese language translation)', '')}
              </a>
              <span>{formatDate(a.date)}</span>
              <span>{a.readTime} min read</span>
              <FileText size={16} />
            </div>
          </article>
        ))
      )}

      <div className="pager">
        <div className="pager__left">
          <button disabled aria-label="Previous page">
            <CaretLeft size={16} />
          </button>
          <span>Page 1 of 1</span>
          <button disabled aria-label="Next page">
            <CaretRight size={16} />
          </button>
        </div>
        <div className="pager__right">
          <span>
            <strong>Results:</strong> {articles.length ? `1–${articles.length}` : '0'} of {articles.length}
            {articles.length !== total && ` (filtered from ${total})`}
          </span>
          <span>10 items per page</span>
        </div>
      </div>
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
        label: value.replace(' (Chinese language translation)', ''),
      })
    }
  }
  if (filters.query.trim()) chips.push({ id: 'query', kind: 'query', label: `“${filters.query.trim()}”` })
  return chips
}
