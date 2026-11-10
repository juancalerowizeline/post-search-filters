import { useState } from 'react'
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
} from '@phosphor-icons/react'
import logo from '../assets/dow-jones.svg'

export function Header({ query, onQuery }) {
  return (
    <header className="header">
      <div className="header__logo">
        <img src={logo} alt="Dow Jones" />
      </div>
      <label className="search-bar">
        <MagnifyingGlass size={24} className="icon" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search Dow Jones or type a Company, Industry, Region, Sources, Subject"
          aria-label="Search"
        />
      </label>
      <div className="header__menu">
        <button className="icon-btn" aria-label="Help & Support">
          <Question size={24} />
        </button>
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={24} />
        </button>
        <button className="icon-btn" aria-label="App suite">
          <CirclesFour size={24} />
        </button>
        <button className="icon-btn" aria-label="Settings">
          <Gear size={24} />
        </button>
      </div>
    </header>
  )
}

export function LeftNav({ collapsed, onToggle }) {
  const [open, setOpen] = useState(true)
  const [selected, setSelected] = useState('Search Builder')

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
        <Item icon={MagnifyingGlass} label="Search Builder" />
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
