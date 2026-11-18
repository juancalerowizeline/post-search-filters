import { Fragment, useEffect, useRef, useState } from 'react'
import {
  House,
  MagnifyingGlass,
  StarFour,
  BookmarkSimple,
  Star,
  CaretUp,
  CaretDown,
  CaretLeft,
  Question,
  Bell,
  CirclesFour,
  Gear,
  Check,
  List,
  X,
  BookBookmark,
  Globe,
  CalendarBlank,
  Translate,
  Factory,
  BuildingOffice,
  FunnelSimple,
  ClockCounterClockwise,
} from '@phosphor-icons/react'
import logo from '../assets/example-inc.svg'

// Links in the gear (Settings) dropdown: the default prototype and its new versions.
// Versions are the same app opened with ?version=<id>; "default" has no parameter.
// `sep` draws a separator above the item: Default | date versions | or / and
const PROTOTYPE_VERSIONS = [
  { id: 'default', label: 'Default', href: './' },
  { id: 'date-alt-1', label: 'Date alternative 1 · Brush', href: '?version=date-alt-1', sep: true },
  { id: 'date-alt-2', label: 'Date alternative 2 · Tabs', href: '?version=date-alt-2' },
  { id: 'date-alt-3', label: 'Date alternative 3 · Custom', href: '?version=date-alt-3' },
  { id: 'or-and', label: 'Or and version', href: '?version=or-and', sep: true },
]
const CURRENT_VERSION = new URLSearchParams(window.location.search).get('version') || 'default'

const SEARCH_CHIPS = [
  { id: 'source', label: 'All Source', icon: Globe },
  { id: 'range', label: 'Date', icon: CalendarBlank },
  { id: 'language', label: 'Language', icon: Translate },
  { id: 'industry', label: 'Industry', icon: Factory },
  { id: 'company', label: 'Company', icon: BuildingOffice },
]
const RECENT_SEARCHES = ['Tesla earnings Q4', 'NVIDIA AI chips', 'OpenAI valuation 2025']

/** Expanded search (Figma "Search Bar v2"): input, filter shortcuts, recent/saved searches, selected filters. */
function SearchPanel({ query, onQuery, chips, onRemoveChip, onReset, onOpenFilters, onClose }) {
  const [tab, setTab] = useState('recent')
  const [saved, setSaved] = useState(['Apple earnings', 'Tech regulation 2026'])
  const [showLists, setShowLists] = useState(true)
  const inputRef = useRef(null)
  useEffect(() => inputRef.current?.focus(), [])

  const selected = chips.filter((c) => c.kind !== 'query')
  const active = (id) => chips.some((c) => (id === 'range' ? c.kind === 'range' : c.facet === id))
  const rangeChip = chips.find((c) => c.kind === 'range')
  const items = tab === 'recent' ? RECENT_SEARCHES : saved
  const pick = (text) => {
    onQuery(text)
    onClose()
  }
  const save = () => {
    const q = query.trim()
    if (q && !saved.includes(q)) setSaved((l) => [q, ...l])
    setTab('saved')
  }

  return (
    <div className="search-panel" role="dialog" aria-label="Search">
      <div className="search-panel__top">
        <MagnifyingGlass size={24} className="icon search-panel__glass" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onClose()}
          placeholder="Search Example Inc. or type a Company, Industry, Region, Sources, Subject"
          aria-label="Search"
        />
        <button className="icon-btn search-panel__clear" aria-label="Clear search" onClick={() => onQuery('')}>
          <X size={16} />
        </button>
      </div>

      <div className="search-panel__chips">
        <button
          className={`round-btn${showLists ? ' round-btn--on' : ''}`}
          aria-label="Recent and saved searches"
          aria-pressed={showLists}
          onClick={() => setShowLists((v) => !v)}
        >
          <BookBookmark size={16} />
        </button>
        {SEARCH_CHIPS.map(({ id, label, icon: Icon }) => (
          <span key={id} className={`sfilter${active(id) ? ' sfilter--on' : ''}`}>
            <Icon size={16} />
            {id === 'range' && rangeChip ? rangeChip.label : label}
          </span>
        ))}
        <button className="round-btn search-panel__funnel" aria-label="Open filters" onClick={onOpenFilters}>
          <FunnelSimple size={16} />
        </button>
      </div>

      {showLists && (
        <div className="search-panel__lists">
          <div className="search-panel__tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'recent'} onClick={() => setTab('recent')}>
              <ClockCounterClockwise size={16} /> Recent Searches
            </button>
            <button role="tab" aria-selected={tab === 'saved'} onClick={() => setTab('saved')}>
              <BookmarkSimple size={16} /> Saved Searches
            </button>
          </div>
          <ul className="search-panel__list">
            {items.map((t) => (
              <li key={t}>
                <button onClick={() => pick(t)}>
                  <ClockCounterClockwise size={16} /> {t}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="search-panel__foot">
        <div className="search-panel__selected">
          <strong>Selected Filters</strong>
          <div className="search-panel__selected-chips">
            {selected.length ? (
              selected.map((c) => (
                <button key={c.id} className="mini-chip" onClick={() => onRemoveChip(c)} aria-label={`Remove filter ${c.label}`}>
                  {c.label}
                  <X size={12} />
                </button>
              ))
            ) : (
              <span className="search-panel__none">No filters selected</span>
            )}
          </div>
        </div>
        <div className="search-panel__actions">
          <button className="link-action" onClick={onReset}>
            Reset Filters
          </button>
          <div className="search-panel__actions-right">
            <button className="link-action" onClick={save}>
              <BookmarkSimple size={16} /> Save Search
            </button>
            <button className="btn-outline" onClick={onClose}>
              <MagnifyingGlass size={16} /> Search
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Header({ onMenu, chips, onRemoveChip, onReset, onOpenFilters }) {
  const [searchOpen, setSearchOpen] = useState(false) // phones only: the search bar drops under the header
  const [panelOpen, setPanelOpen] = useState(false)
  // typing is local for now: it does not filter or search anything
  const [query, onQuery] = useState('')
  const wrapRef = useRef(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef(null)

  useEffect(() => {
    if (!settingsOpen) return
    const onDown = (e) => !settingsRef.current?.contains(e.target) && setSettingsOpen(false)
    const onKey = (e) => e.key === 'Escape' && setSettingsOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [settingsOpen])

  useEffect(() => {
    if (!panelOpen) return
    const onDown = (e) => !wrapRef.current?.contains(e.target) && setPanelOpen(false)
    const onKey = (e) => e.key === 'Escape' && setPanelOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [panelOpen])

  return (
    <header className={`header${searchOpen ? ' header--search' : ''}`}>
      <button className="icon-btn header__burger" aria-label="Menu" onClick={onMenu}>
        <List size={24} />
      </button>
      <div className="header__logo">
        <img src={logo} alt="Example Inc." />
      </div>
      {panelOpen && <div className="search-overlay" aria-hidden />}
      <div className="search" ref={wrapRef}>
        <label className="search-bar">
          <MagnifyingGlass size={24} className="icon" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            onFocus={() => setPanelOpen(true)}
            placeholder="Search Example Inc. or type a Company, Industry, Region, Sources, Subject"
            aria-label="Search"
          />
        </label>
        {panelOpen && (
          <SearchPanel
            query={query}
            onQuery={onQuery}
            chips={chips}
            onRemoveChip={onRemoveChip}
            onReset={onReset}
            onOpenFilters={() => {
              setPanelOpen(false)
              onOpenFilters()
            }}
            onClose={() => setPanelOpen(false)}
          />
        )}
      </div>
      <div className="header__menu">
        <button
          className="icon-btn header__search-toggle"
          aria-label="Search"
          aria-expanded={searchOpen}
          onClick={() => setSearchOpen((o) => !o)}
        >
          <MagnifyingGlass size={24} />
        </button>
        <button className="icon-btn icon-btn--help" aria-label="Help & Support">
          <Question size={24} />
        </button>
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={24} />
        </button>
        <button className="icon-btn icon-btn--wide" aria-label="App suite">
          <CirclesFour size={24} />
        </button>
        <div className="settings icon-btn--wide" ref={settingsRef}>
          <button
            className="icon-btn"
            aria-label="Settings"
            aria-haspopup="menu"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((o) => !o)}
          >
            <Gear size={24} />
          </button>
          {settingsOpen && (
            <div className="settings__menu" role="menu" aria-label="Prototype versions">
              {PROTOTYPE_VERSIONS.map((v) => (
                <Fragment key={v.id}>
                  {v.sep && <div className="settings__sep" role="separator" />}
                <a
                  className="settings__item"
                  role="menuitem"
                  href={v.href}
                  aria-current={v.id === CURRENT_VERSION ? 'true' : undefined}
                  onClick={() => setSettingsOpen(false)}
                >
                  {v.label}
                  {v.id === CURRENT_VERSION && <Check size={16} className="settings__check" />}
                </a>
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export function LeftNav({ collapsed, onToggle }) {
  const [open, setOpen] = useState(true)
  const [selected, setSelected] = useState(null)

  const Item = ({ icon: Icon, label, chev }) => (
    <button
      className={`nav-item${selected === label ? ' nav-item--selected' : ''}`}
      onClick={() => (chev ? setOpen((o) => !o) : setSelected(label))}
      title={collapsed ? label : undefined}
      aria-expanded={chev ? open : undefined}
    >
      <Icon size={16} />
      <span className="nav-item__label">{label}</span>
      {chev && (open ? <CaretUp size={20} className="nav-item__chev" /> : <CaretDown size={20} className="nav-item__chev" />)}
    </button>
  )

  return (
    <>
      <nav className={`nav${collapsed ? ' nav--collapsed' : ''}`} aria-label="Main">
        <Item icon={House} label="Home" />
        <Item icon={MagnifyingGlass} label="Advanced Search" />
        <Item icon={StarFour} label="AI Assistant" />
        <Item icon={BookmarkSimple} label="Saved" />
        <Item icon={Star} label="Interest" chev />
        {open &&
          ['Tesla Inc.', 'NVIDIA Corporation', 'OpenAI LLC'].map((name) => (
            <button
              key={name}
              className={`nav-item nav-item--sub nav-sub${selected === name ? ' nav-item--selected' : ''}`}
              onClick={() => setSelected(name)}
            >
              <span className="nav-item__label">{name}</span>
            </button>
          ))}
      </nav>
      <button
        className={`nav__toggle${collapsed ? ' nav__toggle--collapsed' : ''}`}
        onClick={onToggle}
        aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
      >
        <CaretLeft size={16} />
      </button>
    </>
  )
}
