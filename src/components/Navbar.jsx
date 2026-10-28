import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { chapters, profile } from '../constants'
import { getSnapshot, goTo, lockScroll, subscribe } from '../director'

const Navbar = () => {
  const { chapter } = useSyncExternalStore(subscribe, getSnapshot)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Phone menu: freeze the page behind it, focus the first link, close on Escape.
  useEffect(() => {
    if (!open) return
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
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-[3px] origin-left bg-pop"
        style={{ transform: 'scaleX(var(--progress))' }}
      />
      <div
        className={`absolute inset-0 border-b-2 border-ink bg-surface/85 backdrop-blur-md transition-[opacity,transform] duration-500 ${
          scrolled || open ? 'opacity-100' : '-translate-y-full opacity-0'
        }`}
      />
      <div className="container-x relative flex h-[4.5rem] items-center justify-between">
        <a href="#home" className="group flex items-baseline gap-3" aria-label={`${profile.name}, back to top`}>
          <span className="font-display text-[1.6rem] font-extrabold leading-none tracking-[-0.05em] text-ink">
            {profile.short}
          </span>
          <span className="label hidden text-muted transition-colors group-hover:text-ink sm:inline">/ portfolio</span>
        </a>

        <nav aria-label="Chapters" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {chapters.map(({ id, num, label }) => {
              const active = chapter === id
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={active ? 'true' : undefined}
                    className={`label flex items-center gap-2 border-2 px-3.5 py-2.5 transition-colors ${
                      active ? 'border-ink bg-ink text-surface' : 'border-transparent text-ink hover:border-ink'
                    }`}
                  >
                    <span className={active ? 'text-surface/60' : 'text-muted'}>{num}</span>
                    {label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((o) => !o)}
          className="label flex items-center gap-3 border-2 border-ink px-4 py-2.5 text-ink lg:hidden"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open && (
        <div id="menu" ref={menuRef} className="fixed inset-x-0 bottom-0 top-[4.5rem] z-40 bg-surface lg:hidden">
          <nav aria-label="Chapters" className="container-x flex h-full flex-col justify-center pb-16">
            <ul className="space-y-3">
              {chapters.map(({ id, num, label }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(e) => jump(e, id)}
                    aria-current={chapter === id ? 'true' : undefined}
                    className="flex items-baseline gap-4 font-display text-[3.4rem] font-extrabold leading-none tracking-[-0.05em] text-ink"
                  >
                    <span className="label text-muted">{num}</span>
                    {label.toLowerCase()}.
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-12 border-t-2 border-ink pt-6">
              <a href={`mailto:${profile.email}`} className="link">{profile.email}</a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
