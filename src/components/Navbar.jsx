import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Logo from '../brand/Logo'
import Button from './Button'
import { chapters, profile } from '../constants'
import { goTo, lockScroll } from '../director'

// Which section is under the top third of the screen.
const useActive = () => {
  const [active, setActive] = useState(null)
  useEffect(() => {
    const els = chapters.map(({ id }) => document.getElementById(id)).filter(Boolean)
    if (!els.length || !('IntersectionObserver' in window)) return undefined
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-30% 0px -69% 0px' },
    )
    els.forEach((el) => io.observe(el))
    const top = () => { if (window.scrollY < window.innerHeight * 0.5) setActive(null) }
    window.addEventListener('scroll', top, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', top)
    }
  }, [])
  return active
}

// A soft pill slides under the link being pointed at, and comes back to rest under the section
// you're in. It's positioned from the links' own boxes, written as CSS variables on the list.
const usePill = (active) => {
  const list = useRef(null)
  const place = useCallback((id) => {
    const ul = list.current
    if (!ul) return
    const a = id && ul.querySelector(`a[href="#${id}"]`)
    if (!a) { ul.style.setProperty('--pill-o', '0'); return }
    ul.style.setProperty('--pill-x', `${a.offsetLeft}px`)
    ul.style.setProperty('--pill-w', `${a.offsetWidth}px`)
    ul.style.setProperty('--pill-o', '1')
  }, [])
  useLayoutEffect(() => { place(active) }, [active, place])
  useEffect(() => {
    const onResize = () => place(active)
    window.addEventListener('resize', onResize)
    document.fonts?.ready.then(onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [active, place])
  return { list, place }
}

const Navbar = () => {
  const active = useActive()
  const { list, place } = usePill(active)
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  // Phone menu: freeze the page behind it, focus the first link, close on Escape.
  useEffect(() => {
    if (!open) return undefined
    lockScroll(true)
    menuRef.current?.querySelector('a')?.focus()
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    const button = buttonRef.current
    return () => {
      lockScroll(false)
      window.removeEventListener('keydown', onKey)
      button?.focus()
    }
  }, [open])

  const jump = (e, id) => {
    e.preventDefault()
    setOpen(false)
    // Let the menu unlock the page before gliding off.
    requestAnimationFrame(() => goTo(id))
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="nav">
        <div className="wrap flex h-16 items-center justify-between gap-6">
          <a href="#home" className="logo-link inline-flex items-center gap-2.5 text-ink md:flex-1" aria-label={`${profile.name}, back to top`}>
            <Logo />
            <span className="font-serif text-[1.3125rem] leading-none tracking-[-0.015em]">
              Neelabja<span className="hidden sm:inline"> Mukhopadhyay</span>
            </span>
          </a>

          <nav aria-label="Sections" className="hidden md:block">
            <ul ref={list} className="nav-links" onMouseLeave={() => place(active)}>
              {chapters.map(({ id, label }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onMouseEnter={() => place(id)}
                    onFocus={() => place(id)}
                    onBlur={() => place(active)}
                    aria-current={active === id ? 'true' : undefined}
                    className="nav-link"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden justify-end md:flex md:flex-1">
            <Button href={`mailto:${profile.email}`} size="sm">Email me</Button>
          </div>

          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
            className="menu-button md:hidden"
          >
            <span className="menu-button__bars" aria-hidden="true"><span /><span /></span>
            <span className="t-meta">{open ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>

      {open && (
        <div id="menu" ref={menuRef} className="fade-in fixed inset-x-0 bottom-0 top-16 z-40 bg-paper md:hidden">
          <nav aria-label="Sections" className="wrap flex h-full flex-col justify-between pb-10 pt-8">
            <ul>
              {chapters.map(({ id, label }, i) => (
                <li key={id} className="fade-in border-b border-line" style={{ animationDelay: `${i * 60}ms` }}>
                  <a
                    href={`#${id}`}
                    onClick={(e) => jump(e, id)}
                    aria-current={active === id ? 'true' : undefined}
                    className="group flex items-center justify-between py-5 text-ink"
                  >
                    <span className={`t-h3 ${active === id ? 'italic' : ''}`}>{label}</span>
                    <span aria-hidden="true" className="arrow arrow-e text-muted">→</span>
                  </a>
                </li>
              ))}
            </ul>
            <Button href={`mailto:${profile.email}`} className="self-start">Email me</Button>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
