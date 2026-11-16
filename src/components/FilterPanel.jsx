import { useEffect, useRef, useState } from 'react'
import { CaretUp, CaretDown, DownloadSimple, MagnifyingGlass, Prohibit, Check, Minus, X } from '@phosphor-icons/react'
import {
  ARTICLES,
  DATE_RANGES,
  FACETS,
  DISTRIBUTIONS,
  MAX_BARS,
  MEDIA_TYPES,
  OR_AND_FACETS,
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

const SHORT_RANGE = { '1d': 'Day', '1w': 'Week', '1m': 'Month', '3m': '3 mo', '6m': '6 mo', '1y': '1 yr', '2y': '2 yrs', '3y': '3 yrs', all: 'All' }

// "Date alternative": the ranges become one row of pills sitting right above the chart
function RangeChips({ value, onChange }) {
  return (
    <div className="rchips" role="radiogroup" aria-label="Date range">
      {DATE_RANGES.map((r) => (
        <button
          key={r.id}
          className={`rchip${value === r.id ? ' rchip--on' : ''}`}
          role="radio"
          aria-checked={value === r.id}
          title={r.label}
          onClick={() => onChange(r.id)}
        >
          {SHORT_RANGE[r.id]}
        </button>
      ))}
    </div>
  )
}

const SEG_LABEL = { '1d': '1D', '1w': '1W', '1m': '1M', '3m': '3M', '6m': '6M', '1y': '1Y', '2y': '2Y', '3y': '3Y', all: 'All' }

// Date alternative 2: one joined segmented control, attached to the chart in a single card
function RangeSegments({ value, onChange }) {
  return (
    <div className="seg" role="radiogroup" aria-label="Date range">
      {DATE_RANGES.map((r) => (
        <button
          key={r.id}
          className={`seg__opt${value === r.id ? ' seg__opt--on' : ''}`}
          role="radio"
          aria-checked={value === r.id}
          title={r.label}
          onClick={() => onChange(r.id)}
        >
          {SEG_LABEL[r.id]}
        </button>
      ))}
    </div>
  )
}

const isoDay = (ms) => new Date(ms).toISOString().slice(0, 10)

// Date alternative 3: three options, Today, This month and Custom (From / To inputs)
function CustomRange({ filters, setRange, setDist, setBucket }) {
  const [pick, setPick] = useState(null) // 'today' | 'month' | 'custom'
  const win = chartWindow('all')
  const min = isoDay(win.start)
  const max = isoDay(win.end)
  const from = filters.bucket?.start ?? min
  const to = filters.bucket?.end ?? max
  const apply = (f, t) => {
    if (!f || !t || f > t) return
    setBucket({ start: f, end: t, label: `${spanLabel(f)} – ${spanLabel(t)}` })
  }
  const today = () => {
    setPick('today')
    setRange('1d')
  }
  const month = () => {
    setPick('month')
    setRange('1m') // last 30 days window; the bar span is the calendar month so far
    const w = chartWindow('1m')
    const first = isoDay(Date.UTC(new Date(w.end).getUTCFullYear(), new Date(w.end).getUTCMonth(), 1))
    setBucket({ start: first > isoDay(w.start) ? first : isoDay(w.start), end: isoDay(w.end), label: 'This month' })
  }
  const custom = () => {
    setPick('custom')
    setRange('all')
    setDist('month')
  }
  const opts = [
    ['today', 'Today', today],
    ['month', 'This month', month],
    ['custom', 'Custom', custom],
  ]
  return (
    <>
      <SegmentedControl
        label="Date range"
        value={pick}
        onChange={(id) => opts.find(([k]) => k === id)[2]()}
        options={opts.map(([id, text]) => [id, text])}
      />
      {pick === 'custom' && (
        <div className="drange">
          <label>
            <span>From</span>
            <input type="date" value={from} min={min} max={to} onChange={(e) => apply(e.target.value, to)} />
          </label>
          <label>
            <span>To</span>
            <input type="date" value={to} min={from} max={max} onChange={(e) => apply(from, e.target.value)} />
          </label>
        </div>
      )}
    </>
  )
}

// Figma `Switch (Web)`, small: one on / off setting
function SwitchItem({ label, checked, onChange }) {
  return (
    <div className="fswitch">
      <button className="switch" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}>
        <span className="switch__track" />
        <span className="switch__label">{label}</span>
      </button>
    </div>
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

const spanLabel = (iso) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

const tickLabel = (n) => (n >= 1000 ? `${n / 1000}K` : String(n))

// a distribution is offered only if it yields 2–53 bars for the Date Range
function offeredDistributions(filters, gran) {
  return DISTRIBUTIONS.filter((d) => {
    if (d.id === gran) return true
    const win = chartWindow(filters.range)
    const days = (win.end - win.start) / 86400000 + 1
    if (d.id === 'year' && days <= 365) return false // up to a year: no yearly view
    if (d.id === 'week' && days >= 365) return false // a year or more: no weekly view
    if (d.id === 'month' && days <= 31) return false // up to a month: no monthly view
    const n = volumeBuckets(ARTICLES, filters, d.id).buckets.length
    return n >= 2 && n <= MAX_BARS // a single bar says nothing the range doesn't already
  })
}

// Figma "Segmented Control" (Fill, node 206:100357)
function SegmentedControl({ options, value, onChange, label }) {
  return (
    <div className="segctl" role="radiogroup" aria-label={label}>
      {options.map(([id, text]) => (
        <button
          key={id}
          className={`segctl__item${id === value ? ' segctl__item--on' : ''}`}
          role="radio"
          aria-checked={id === value}
          onClick={() => onChange(id)}
        >
          {text}
        </button>
      ))}
    </div>
  )
}

// Date range as a dropdown (Date alternative 1): sits joined to the distribution dropdown
function RangeSelect({ value, onChange }) {
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
  const current = DATE_RANGES.find((r) => r.id === value)
  return (
    <div className="dd" ref={ref}>
      <button
        className={`chart__select${open ? ' chart__select--open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Date range"
      >
        <span>{current?.label}</span>
        {open ? <CaretUp size={16} /> : <CaretDown size={16} />}
      </button>
      {open && (
        <div className="dd__menu" role="listbox" aria-label="Date range">
          {DATE_RANGES.map((r) => (
            <button
              key={r.id}
              className="dd__item"
              role="option"
              aria-selected={r.id === value}
              onClick={() => {
                onChange(r.id)
                setOpen(false)
              }}
            >
              <span>{r.label}</span>
              {r.id === value && <Check size={16} className="dd__check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DistributionSelect({ filters, gran, onChange, short }) {
  const text = (d) => (short ? d.label.replace(' distribution', '') : d.label)
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
  const offered = offeredDistributions(filters, gran)

  return (
    <div className="dd" ref={ref}>
      <button
        className={`chart__select${open ? ' chart__select--open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Distribution"
      >
        <span>{text(current)}</span>
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
              <span>{text(d)}</span>
              {d.id === gran && <Check size={16} className="dd__check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function VolumeChart({ filters, onPickBucket, onPickDist, alt, onPickRange }) {
  const [anchor, setAnchor] = useState(null) // alt: first bar of a span
  const [drag, setDrag] = useState(null) // brush: { a, b } bar indexes while dragging
  const [hover, setHover] = useState(null) // brush: bar index under the pointer
  const areaRef = useRef(null)
  const brush = alt === 'brush'
  // Bars follow the Date Range (day / week / month) and every other filter except the picked bar
  const { buckets, gran, from, to, single } = volumeBuckets(ARTICLES, filters)
  // Integer axis only: with a small max there is one line per whole number (max 2 → 0, 1, 2)
  const max = Math.max(1, ...buckets.map((b) => b.count))
  const intervals = max <= 5 ? max : 5
  const step = max <= 5 ? 1 : niceStep(max)
  const top = step * intervals
  const ticks = Array.from({ length: intervals + 1 }, (_, i) => i * step)
  const sel = filters.bucket
  // alt: a selection can span several bars (click one bar, then another to extend)
  const isSel = (b) => sel && (alt ? b.start >= sel.start && b.end <= sel.end : sel.start === b.start && sel.end === b.end)
  const pick = (b) => {
    if (!alt) return onPickBucket(isSel(b) ? null : { start: b.start, end: b.end, label: b.label })
    const single = sel && anchor && sel.start === anchor.start && sel.end === anchor.end
    if (single && anchor.start === b.start) {
      setAnchor(null)
      return onPickBucket(null)
    }
    if (single) {
      const [a, z] = anchor.start < b.start ? [anchor, b] : [b, anchor]
      const label = `${spanLabel(a.start)} – ${spanLabel(z.end)}`
      return onPickBucket({ start: a.start, end: z.end, label })
    }
    setAnchor(b)
    onPickBucket({ start: b.start, end: b.end, label: b.label })
  }
  const idxAt = (e) => {
    const r = areaRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(buckets.length - 1, Math.floor(((e.clientX - r.left) / r.width) * buckets.length)))
  }
  const brushDown = (e) => {
    if (!brush || e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const i = idxAt(e)
    setDrag({ a: i, b: i })
  }
  const brushMove = (e) => {
    if (!brush) return
    const i = idxAt(e)
    setHover(i)
    if (drag) setDrag((d) => d && { ...d, b: i })
  }
  const brushUp = () => {
    if (!drag) return
    const lo = Math.min(drag.a, drag.b)
    const hi = Math.max(drag.a, drag.b)
    setDrag(null)
    const first = buckets[lo]
    const last = buckets[hi]
    if (lo === hi) {
      // a plain click: select the bar, or clear it when it already is the whole selection
      const same = sel && sel.start === first.start && sel.end === first.end
      return onPickBucket(same ? null : { start: first.start, end: first.end, label: first.label })
    }
    onPickBucket({ start: first.start, end: last.end, label: `${spanLabel(first.start)} – ${spanLabel(last.end)}` })
  }
  const lit = (b, i) => (drag ? i >= Math.min(drag.a, drag.b) && i <= Math.max(drag.a, drag.b) : !!isSel(b))
  const hovered = brush && !drag && hover != null ? buckets[hover] : null
  const selCount = sel ? buckets.filter(isSel).reduce((n, b) => n + b.count, 0) : 0

  return (
    <div className={`chart${sel || drag ? ' chart--has-selection' : ''}${buckets.length === 1 ? ' chart--one' : ''}${brush ? ' chart--brush' : ''}`}>
      {onPickRange ? (
        <div className="dd-pair">
          <RangeSelect value={filters.range} onChange={onPickRange} />
          <DistributionSelect filters={filters} gran={gran} onChange={onPickDist} short />
        </div>
      ) : (
        <DistributionSelect filters={filters} gran={gran} onChange={onPickDist} />
      )}
      <div className="chart__plot">
        <div className="chart__y" aria-hidden>
          {ticks.map((t) => (
            <span key={t} style={{ bottom: `${(t / top) * 100}%` }}>
              {tickLabel(t)}
            </span>
          ))}
        </div>
        <div
          className="chart__area"
          ref={areaRef}
          role="group"
          aria-label={`Articles by ${gran} — select a bar to filter`}
          onPointerDown={brushDown}
          onPointerMove={brushMove}
          onPointerUp={brushUp}
          onPointerCancel={() => setDrag(null)}
          onPointerLeave={() => setHover(null)}
        >
          {ticks.slice(1).map((t) => (
            <div className="chart__grid" key={t} style={{ bottom: `${(t / top) * 100}%` }} />
          ))}
          <div className="chart__bars">
            {buckets.map((b, i) => (
              <button
                key={b.start}
                className="chart__col"
                aria-pressed={lit(b, i)}
                disabled={b.count === 0}
                onClick={() => pick(b)}
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
      {alt && (brush || sel) && (
        <div className="chart__hint" aria-live="polite">
          {hovered ? (
            <span>
              <strong>{hovered.label}</strong> · {hovered.count} article{hovered.count === 1 ? '' : 's'}
            </span>
          ) : sel ? (
            <>
              <span>
                <strong>{sel.label}</strong> · {selCount} article{selCount === 1 ? '' : 's'}
              </span>
              <button
                className="chart__clear"
                onClick={() => {
                  setAnchor(null)
                  onPickBucket(null)
                }}
                aria-label="Clear date selection"
              >
                <X size={12} weight="bold" />
              </button>
            </>
          ) : (
            <span>Drag across the bars to pick a span</span>
          )}
        </div>
      )}
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

// "Or and version": match any (or) / all (and) of the selected values. Figma `or-and` row.
function OrAnd({ name, value, onChange }) {
  return (
    <div className="orand" role="radiogroup" aria-label={`${name}: match`}>
      {['or', 'and'].map((m) => (
        <button
          key={m}
          className="orand__opt"
          role="radio"
          aria-checked={value === m}
          onClick={() => onChange(m)}
        >
          <span className={`radio${value === m ? ' radio--on' : ''}`} />
          <span>{m}</span>
        </button>
      ))}
    </div>
  )
}

function FacetGroup({ facet, filters, setFacetValue, orAnd, setFacetMode }) {
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
      {orAnd && OR_AND_FACETS.includes(facet.key) && (
        <OrAnd
          name={facet.title}
          value={filters.facetModes?.[facet.key] || 'or'}
          onChange={(m) => setFacetMode(facet.key, m)}
        />
      )}
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

export default function FilterPanel({ filters, dirty, setMedia, setEnterpriseAI, setRange, setBucket, setDist, setFacetValue, orAnd, dateAlt, setFacetMode, onReset, onApply, onClose }) {
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

        <Group title="Enterprise AI Eligible" collapsed={collapsed.enterprise} onToggle={() => toggle('enterprise')}>
          <SwitchItem
            label="Only enterprise AI eligible articles"
            checked={!!filters.enterpriseAI}
            onChange={setEnterpriseAI}
          />
        </Group>

        {dateAlt ? (
          <Group title="Date" collapsed={collapsed.range} onToggle={() => toggle('range')}>
            {dateAlt === 'date-alt-2' ? (
              <div className="dcard">
                <RangeSegments value={filters.range} onChange={setRange} />
                <VolumeChart filters={filters} onPickBucket={setBucket} onPickDist={setDist} alt="span" />
              </div>
            ) : dateAlt === 'date-alt-3' ? (
              <>
                <CustomRange filters={filters} setRange={setRange} setDist={setDist} setBucket={setBucket} />
                <VolumeChart filters={filters} onPickBucket={setBucket} onPickDist={setDist} alt="span" />
              </>
            ) : (
              <VolumeChart
                filters={filters}
                onPickBucket={setBucket}
                onPickDist={setDist}
                onPickRange={setRange}
                alt="brush"
              />
            )}
          </Group>
        ) : (
          <>
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

          </>
        )}

        {FACETS.map((f) => (
          <FacetGroup
            key={f.key}
            facet={f}
            filters={filters}
            setFacetValue={setFacetValue}
            orAnd={orAnd}
            setFacetMode={setFacetMode}
          />
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
