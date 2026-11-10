import { useEffect, useRef, useState } from 'react'
import { CaretUp, CaretDown, DownloadSimple, MagnifyingGlass, Prohibit, Check, Minus, X } from '@phosphor-icons/react'
import {
  ARTICLES,
  DATE_RANGES,
  FACETS,
  DISTRIBUTIONS,
  MAX_BARS,
  MEDIA_TYPES,
  VISIBLE_OPTIONS,
  VISIBLE_RANGES,
  applyFilters,
  chartWindow,
  facetCount,
  volumeBuckets,
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
        if (counts && counts[id] === 0 && value !== id) return null // no results → not offered
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

// "Nice" axis step (1, 2, 5, 10, 20, 50 …) so the 5 intervals read well at any volume
function niceStep(max) {
  const raw = Math.max(1, max) / 5
  const pow = 10 ** Math.floor(Math.log10(raw))
  const n = raw / pow
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow
}

const tickLabel = (n) => (n >= 1000 ? `${n / 1000}K` : String(n))

function DistributionSelect({ filters, gran, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = DISTRIBUTIONS.find((d) => d.id === gran)
  // a distribution is offered only if it yields 2–53 bars for the Date Range
  const offered = DISTRIBUTIONS.filter((d) => {
    if (d.id === gran) return true
    const win = chartWindow(filters.range)
    const days = (win.end - win.start) / 86400000 + 1
    if (d.id === 'year' && days <= 365) return false // up to a year: no yearly view
    if (d.id === 'week' && days >= 365) return false // a year or more: no weekly view
    if (d.id === 'month' && days <= 31) return false // up to a month: no monthly view
    const n = volumeBuckets(ARTICLES, filters, d.id).buckets.length
    return n >= 2 && n <= MAX_BARS // a single bar says nothing the range doesn't already
  })

  return (
    <div className="dd" ref={ref}>
      <button
        className={`chart__select${open ? ' chart__select--open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Distribution"
      >
        <span>{current.label}</span>
        {open ? <CaretUp size={16} /> : <CaretDown size={16} />}
      </button>
      {open && (
        <div className="dd__menu" role="listbox" aria-label="Distribution">
          {offered.map((d) => (
            <button
              key={d.id}
              className="dd__item"
              role="option"
              aria-selected={d.id === gran}
              onClick={() => {
                onChange(d.id)
                setOpen(false)
              }}
            >
              <span>{d.label}</span>
              {d.id === gran && <Check size={16} className="dd__check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function VolumeChart({ filters, onPickBucket, onPickDist }) {
  // Bars follow the Date Range (day / week / month) and every other filter except the picked bar
  const { buckets, gran, from, to, single } = volumeBuckets(ARTICLES, filters)
  // Integer axis only: with a small max there is one line per whole number (max 2 → 0, 1, 2)
  const max = Math.max(1, ...buckets.map((b) => b.count))
  const intervals = max <= 5 ? max : 5
  const step = max <= 5 ? 1 : niceStep(max)
  const top = step * intervals
  const ticks = Array.from({ length: intervals + 1 }, (_, i) => i * step)
  const sel = filters.bucket
  const isSel = (b) => sel && sel.start === b.start && sel.end === b.end

  return (
    <div className={`chart${sel ? ' chart--has-selection' : ''}${buckets.length === 1 ? ' chart--one' : ''}`}>
      <DistributionSelect filters={filters} gran={gran} onChange={onPickDist} />
      <div className="chart__plot">
        <div className="chart__y" aria-hidden>
          {ticks.map((t) => (
            <span key={t} style={{ bottom: `${(t / top) * 100}%` }}>
              {tickLabel(t)}
            </span>
          ))}
        </div>
        <div className="chart__area" role="group" aria-label={`Articles by ${gran} — select a bar to filter`}>
          {ticks.slice(1).map((t) => (
            <div className="chart__grid" key={t} style={{ bottom: `${(t / top) * 100}%` }} />
          ))}
          <div className="chart__bars">
            {buckets.map((b) => (
              <button
                key={b.start}
                className="chart__col"
                aria-pressed={!!isSel(b)}
                disabled={b.count === 0}
                onClick={() => onPickBucket(isSel(b) ? null : { start: b.start, end: b.end, label: b.label })}
                title={`${b.label}: ${b.count} article${b.count === 1 ? '' : 's'}`}
                aria-label={`${b.label}: ${b.count} article${b.count === 1 ? '' : 's'}`}
              >
                <span className="chart__bar" style={{ height: b.count === 0 ? '1px' : `${(b.count / top) * 100}%` }} />
              </button>
            ))}
          </div>
        </div>
        <div className={`chart__x${single ? ' chart__x--single' : ''}`}>
          <span>{from}</span>
          {!single && <span>{to}</span>}
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
  // Options with 0 results are not offered (unless already selected/excluded, so they can be undone)
  const available = facet.options.filter(
    (o) => selection[o] || facetCount(ARTICLES, filters, facet.key, o) > 0,
  )
  const matching = available.filter((o) => o.toLowerCase().includes(needle))
  const shown = expanded || needle ? matching : matching.slice(0, VISIBLE_OPTIONS)

  return (
    <Group
      title={facet.title}
      count={available.length}
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
        {!shown.length && (
          <div className="fitem" style={{ color: 'var(--content-subtle)' }}>
            {needle ? 'No matches' : 'No options for the current filters'}
          </div>
        )}
        {!needle && matching.length > VISIBLE_OPTIONS && (
          <button className="show-more" onClick={() => setExpanded((e) => !e)}>
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </Group>
  )
}

// ---- Export dropdown: pick which filter element to download as CSV --------

// Labels follow the Figma `.Select Dropdown (Web)`; "Technology" maps to the Industries group.
const EXPORT_ITEMS = [
  { id: 'media', label: 'Media Types' },
  { id: 'date', label: 'Date' },
  { id: 'range', label: 'Date Range' },
  { id: 'source', label: 'Source' },
  { id: 'company', label: 'Company' },
  { id: 'industry', label: 'Technology' },
  { id: 'region', label: 'Region' },
  { id: 'subject', label: 'Subject' },
  { id: 'language', label: 'Language' },
]

function exportRows(id, filters) {
  if (id === 'media') {
    return [
      ['Media Type', 'Articles', 'Selected'],
      ...MEDIA_TYPES.map((m) => [
        m,
        applyFilters(ARTICLES, { ...filters, media: m }).length,
        filters.media === m ? 'Yes' : '',
      ]),
    ]
  }
  if (id === 'date') {
    const { buckets, gran } = volumeBuckets(ARTICLES, filters)
    return [
      [DISTRIBUTIONS.find((d) => d.id === gran).header, 'Articles', 'Selected'],
      ...buckets.map((b) => [
        b.label,
        b.count,
        filters.bucket && filters.bucket.start === b.start && filters.bucket.end === b.end ? 'Yes' : '',
      ]),
    ]
  }
  if (id === 'range') {
    return [
      ['Date Range', 'Articles', 'Selected'],
      ...DATE_RANGES.map((r) => [
        r.label,
        applyFilters(ARTICLES, { ...filters, range: r.id }).length,
        filters.range === r.id ? 'Yes' : '',
      ]),
    ]
  }
  const facet = FACETS.find((f) => f.key === id)
  const sel = filters.facets[id] || {}
  return [
    [facet.title, 'Articles', 'Selection'],
    ...facet.options.map((o) => [
      o,
      facetCount(ARTICLES, filters, id, o),
      sel[o] === 'in' ? 'Included' : sel[o] === 'out' ? 'Excluded' : '',
    ]),
  ]
}

function downloadCsv(rows, filename) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
  const csv = '\uFEFF' + rows.map((r) => r.map(esc).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function ExportMenu({ filters }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (item) => {
    downloadCsv(exportRows(item.id, filters), `factiva-${item.label.toLowerCase().replace(/\s+/g, '-')}.csv`)
    setOpen(false)
  }

  return (
    <div className="export" ref={ref}>
      <button
        className="export__btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <DownloadSimple size={16} /> <span className="export__label">Export</span>
      </button>
      {open && (
        <div className="export__menu" role="menu" aria-label="Export">
          {EXPORT_ITEMS.map((item) => (
            <button key={item.id} className="export__item" role="menuitem" onClick={() => pick(item)}>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FilterPanel({ filters, dirty, setMedia, setRange, setBucket, setDist, setFacetValue, onReset, onApply, onClose }) {
  const [collapsed, setCollapsed] = useState({})
  const [sheetFull, setSheetFull] = useState(false) // phones: scrolling the sheet expands it to full height
  const [rangeExpanded, setRangeExpanded] = useState(false)
  // keep the picked range visible even if it lives under "Show more"
  const rangesShown =
    rangeExpanded || DATE_RANGES.slice(VISIBLE_RANGES).some((r) => r.id === filters.range)
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

  return (
    <aside className={`filters${sheetFull ? ' filters--full' : ''}`} aria-label="Filters">
      <div className="filters__scroll" onScroll={(e) => setSheetFull(e.currentTarget.scrollTop > 0)}>
        <div className="filters__head">
          <span>Filters</span>
          <div className="filters__head-actions">
            <ExportMenu filters={filters} />
            <button className="filters__close" onClick={onClose} aria-label="Close filters">
              <X size={16} />
            </button>
          </div>
        </div>

        <Group title="Media Types" collapsed={collapsed.media} onToggle={() => toggle('media')}>
          <RadioList options={MEDIA_TYPES} value={filters.media} onChange={setMedia} counts={mediaCounts} />
        </Group>

        <Group title="Date Range" collapsed={collapsed.range} onToggle={() => toggle('range')}>
          <RadioList
            options={rangesShown ? DATE_RANGES : DATE_RANGES.slice(0, VISIBLE_RANGES)}
            value={filters.range}
            onChange={setRange}
          />
          <button className="show-more" onClick={() => setRangeExpanded((e) => !e)}>
            {rangesShown ? 'Show less' : 'Show more'}
          </button>
        </Group>

        <Group title="Volume by date" collapsed={collapsed.volume} onToggle={() => toggle('volume')}>
          <VolumeChart filters={filters} onPickBucket={setBucket} onPickDist={setDist} />
        </Group>

        {FACETS.map((f) => (
          <FacetGroup key={f.key} facet={f} filters={filters} setFacetValue={setFacetValue} />
        ))}
      </div>
      <div className="filters__actions">
        <button className="btn btn--ghost" onClick={onReset} disabled={!dirty}>
          Reset filters
        </button>
        <button className="btn btn--solid" onClick={onApply} disabled={!dirty}>
          Apply filters
        </button>
      </div>
    </aside>
  )
}
