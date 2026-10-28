import { useState } from 'react'
import { navLinks } from '../data/services'
import { ArrowRight, Close, Menu } from './Icons'

export default function Navbar() {
  const [active, setActive] = useState('Home')
  const [open, setOpen] = useState(false)

  return (
    <header className="nav" data-anim="nav">
      <a href="#" className="nav__brand" aria-label="NextMinds home">
        <img src="/images/logo.png" alt="NextMinds" className="nav__logo-img" />
      </a>

      <nav className={`nav__links ${open ? 'is-open' : ''}`}>
        {navLinks.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className={`nav__link ${active === label ? 'is-active' : ''}`}
            onClick={() => {
              setActive(label)
              setOpen(false)
            }}
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="nav__actions">
        <a href="#contact" className="btn btn--outline nav__cta">
          Start a Project <ArrowRight width={16} />
        </a>
        <button
          type="button"
          className="icon-btn"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <Close width={18} /> : <Menu width={18} />}
        </button>
      </div>
    </header>
  )
}
