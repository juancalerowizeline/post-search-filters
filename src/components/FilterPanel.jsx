import { useState } from 'react'
import { CaretUp, CaretDown, Export, MagnifyingGlass, Prohibit, Check, Minus } from '@phosphor-icons/react'
import {
  ARTICLES,
  DATE_RANGES,
  FACETS,
  MEDIA_TYPES,
  MONTHS,
  VISIBLE_OPTIONS,
  applyFilters,
  facetCount,
  inRange,
} from '../data'

function Group({ title, count, collapsed, onToggle, children }) {
  return (
    <section className={`fgroup${collapsed ? ' fgroup--collapsed' : ''}`}>
      <button className="fgroup__head" onClick={onToggle} aria-expanded={!collapsed}>
        <span className="fgroup__title">{title}</span>
        {count != null ? <span className="fgroup__count">({count})</span> : <span className="fgroup__spacer" />}
        <CaretUp size={20} className="fgroup__caret" />
      </button>
      {!collapsed && children}
    </section>
  )
}

function RadioList({ options, value, onChange, counts }) {
  return (
    <div role="radiogroup">
      {options.map((o) => {
        const id = o.id ?? o
        const label = o.label ?? o
        return (
          <div className="fitem" key={id}>
            <button
              className="fitem__main"
              role="radio"
              aria-checked={value === id}
              onClick={() => onChange(id)}
            >
              <span className={`radio${value === id ? ' radio--on' : ''}`} />
              <span className="fitem__label">{label}</span>
              {counts && <span className="fitem__count">{counts[id]}</span>}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function VolumeChart({ filters }) {
  // Volume ignores the date-range filter itself so the user can see what the range excludes
  const pool = applyFilters(ARTICLES, filters, 'range')
  const bars = MONTHS.map((m) => {
    const inMonth = pool.filter((a) => new Date(a.date + 'T12:00:00Z').getUTCMonth() === m.month)
    return { ...m, count: inMonth.length, active: inMonth.filter((a) => inRange(a, filters.range)).length }
  })
  const max = Math.max(1, ...bars.map((b) => b.count))
  const step = Math.max(1, Math.ceil(max / 5))
  const top = step * 5
  const ticks = [0, 1, 2, 3, 4, 5].map((i) => i * step)

  return (
    <div className="chart">
      <div className="chart__select" aria-label="Distribution">
        <span>Monthly distribution</span>
        <CaretDown size={16} />
      </div>
      <div className="chart__plot">
        <div className="chart__y" aria-hidden>
          {ticks.map((t) => (
            <span key={t} style={{ bottom: `${(t / top) * 100}%` }}>
              {t}
            </span>
          ))}
        </div>
        <div className="chart__area" role="img" aria-label="Articles per month">
          {ticks.slice(1).map((t) => (
            <div className="chart__grid" key={t} style={{ bottom: `${(t / top) * 100}%` }} />
          ))}
          <div className="chart__bars">
            {bars.map((b) => (
              <div
                key={b.label}
                className={`chart__bar${filters.range && b.active === 0 && b.count > 0 ? ' chart__bar--dim' : ''}`}
                style={{ height: `${(b.count / top) * 100}%` }}
                title={`${b.label}: ${b.count}`}
              />
            ))}
          </div>
        </div>
        <div className="chart__x">
          <span>01 may 2026</span>
          <span>29 oct 2026</span>
        </div>
      </div>
    </div>
  )
}

function CheckItem({ label, count, state, onToggle, onExclude }) {
  const zero = count === 0 && state === 'off'
  return (
    <div className={`fitem${zero ? ' fitem--zero' : ''}`}>
      <button
        className="fitem__main"
        role="checkbox"
        aria-checked={state === 'out' ? 'mixed' : state === 'in'}
        onClick={onToggle}
      >
        <span className={`check${state === 'in' ? ' check--on' : state === 'out' ? ' check--mixed' : ''}`}>
          {state === 'in' && <Check size={12} weight="bold" />}
          {state === 'out' && <Minus size={12} weight="bold" />}
        </span>
        <span className={`fitem__label${state === 'out' ? ' fitem__label--out' : ''}`}>{label}</span>
        <span className="fitem__count">{count}</span>
      </button>
      <button
        className={`fitem__ban${state === 'out' ? ' fitem__ban--on' : ''}`}
        onClick={onExclude}
        aria-label={`Exclude ${label}`}
        aria-pressed={state === 'out'}
        title="Exclude"
      >
        <Prohibit size={16} />
      </button>
    </div>
  )
}

function FacetGroup({ facet, filters, setFacetValue }) {
  const [collapsed, setCollapsed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [q, setQ] = useState('')

  const selection = filters.facets[facet.key] || {}
  const needle = q.trim().toLowerCase()
  const matching = facet.options.filter((o) => o.toLowerCase().includes(needle))
  const shown = expanded || needle ? matching : matching.slice(0, VISIBLE_OPTIONS)

  return (
    <Group
      title={facet.title}
      count={facet.options.length}
      collapsed={collapsed}
      onToggle={() => setCollapsed((c) => !c)}
    >
      <label className="fgroup__search">
        <MagnifyingGlass size={16} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={facet.placeholder}
          aria-label={facet.placeholder}
        />
      </label>
      <div>
        {shown.map((o) => {
          const s = selection[o] || 'off'
          return (
            <CheckItem
              key={o}
              label={o}
              count={facetCount(ARTICLES, filters, facet.key, o)}
              state={s}
              onToggle={() => setFacetValue(facet.key, o, s === 'in' ? 'off' : 'in')}
              onExclude={() => setFacetValue(facet.key, o, s === 'out' ? 'off' : 'out')}
            />
          )
        })}
        {!shown.length && <div className="fitem" style={{ color: 'var(--content-subtle)' }}>No matches</div>}
        {!needle && matching.length > VISIBLE_OPTIONS && (
          <button className="show-more" onClick={() => setExpanded((e) => !e)}>
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </Group>
  )
}

export default function FilterPanel({ filters, results, setMedia, setRange, setFacetValue, onReset, onApply }) {
  const [collapsed, setCollapsed] = useState({})
  const toggle = (k) => setCollapsed((c) => ({ ...c, [k]: !c[k] }))

  const mediaCounts = Object.fromEntries(
    MEDIA_TYPES.map((m) => [
      m,
      applyFilters(ARTICLES, { ...filters, media: m }, undefined).length,
    ]),
  )
  const rangeCounts = Object.fromEntries(
    DATE_RANGES.map((r) => [r.id, applyFilters(ARTICLES, { ...filters, range: r.id }).length]),
  )

  const exportCsv = () => {
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
    const rows = [['Title', 'Source', 'Date', 'Media', 'Company', 'Industry', 'Region', 'Subject', 'Language']]
    results.forEach((a) =>
      rows.push([a.title, a.source, a.date, a.media, a.company.join('; '), a.industry.join('; '), a.region.join('; '), a.subject.join('; '), a.language.join('; ')]),
    )
    const blob = new Blob([rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'factiva-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <aside className="filters" aria-label="Filters">
      <div className="filters__scroll">
        <div className="filters__head">
          <span>Filters</span>
          <button className="link-btn" onClick={exportCsv}>
            <Export size={16} /> Export
          </button>
        </div>

        <Group title="Media Types" collapsed={collapsed.media} onToggle={() => toggle('media')}>
          <RadioList options={MEDIA_TYPES} value={filters.media} onChange={setMedia} counts={mediaCounts} />
        </Group>

        <Group title="Date Range" collapsed={collapsed.range} onToggle={() => toggle('range')}>
          <RadioList options={DATE_RANGES} value={filters.range} onChange={setRange} />
        </Group>

        <Group title="Volume by date" collapsed={collapsed.volume} onToggle={() => toggle('volume')}>
          <VolumeChart filters={filters} />
        </Group>

        {FACETS.map((f) => (
          <FacetGroup key={f.key} facet={f} filters={filters} setFacetValue={setFacetValue} />
        ))}
      </div>
      <div className="filters__actions">
        <button className="btn btn--ghost" onClick={onReset}>
          Reset filters
        </button>
        <button className="btn btn--solid" onClick={onApply}>
          Apply filters
        </button>
      </div>
    </aside>
  )
}
