import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { chapters, profile } from '../constants'
import { getSnapshot, subscribe } from '../director'

const Monogram = () => (
  <span className="grid h-10 w-10 place-items-center rounded-full border border-gold/50 font-display text-lg italic text-gold-light transition-colors group-hover:border-gold">
    {profile.initials}
  </span>
)

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

  // Phone menu: lock the page behind it, focus the first link, close on Escape.
  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    root.style.overflow = 'hidden'
    menuRef.current?.querySelector('a')?.focus()
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    const button = buttonRef.current
    return () => {
      root.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      button?.focus()
    }
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`absolute inset-0 border-b border-hairline bg-ink/75 backdrop-blur-md transition-opacity duration-500 ${
          scrolled || open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div className="container-x relative flex h-20 items-center justify-between">
        <a href="#home" className="group flex items-center gap-3.5" aria-label={`${profile.name}, back to top`} onClick={() => setOpen(false)}>
          <Monogram />
          <span className="hidden font-display text-xl text-ivory sm:block">{profile.name}</span>
        </a>

        <nav aria-label="Chapters" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {chapters.map(({ id, numeral, label }) => {
              const active = chapter === id
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={active ? 'true' : undefined}
                    className={`smallcaps group relative flex items-baseline gap-2.5 py-2 transition-colors ${
                      active ? 'text-ivory' : 'text-stone hover:text-ivory'
                    }`}
                  >
                    <span className="numeral text-base">{numeral}</span>
                    {label}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-gold transition-transform duration-500 ${
                        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
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
          className="smallcaps flex items-center gap-3 py-3 text-ivory lg:hidden"
        >
          {open ? 'Close' : 'Menu'}
          <span aria-hidden="true" className="relative block h-3 w-6">
            <span className={`absolute left-0 h-px w-6 bg-gold transition-transform duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0.5'}`} />
            <span className={`absolute left-0 h-px w-6 bg-gold transition-transform duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-2.5'}`} />
          </span>
        </button>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-px w-full origin-left bg-gold/70"
        style={{ transform: 'scaleX(var(--progress))' }}
      />

      {open && (
        <div id="menu" ref={menuRef} className="fixed inset-x-0 bottom-0 top-20 z-40 bg-ink/95 backdrop-blur-md lg:hidden">
          <nav aria-label="Chapters" className="container-x flex h-full flex-col justify-center pb-20">
            <ul className="space-y-7">
              {chapters.map(({ id, numeral, title }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={() => setOpen(false)}
                    aria-current={chapter === id ? 'true' : undefined}
                    className="flex items-baseline gap-5 font-display text-[2.6rem] leading-none text-ivory"
                  >
                    <span className="numeral w-10 text-2xl">{numeral}</span>
                    {title}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-14 border-t border-hairline pt-6">
              <a href={`mailto:${profile.email}`} className="smallcaps text-gold">{profile.email}</a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
