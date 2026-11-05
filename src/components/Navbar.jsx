import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { chapters, profile } from '../constants'
import { getSnapshot, goTo, lockScroll, subscribe } from '../director'

const Navbar = () => {
  const { chapter } = useSyncExternalStore(subscribe, getSnapshot)
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

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
        className="absolute inset-x-0 top-0 z-10 h-px origin-left bg-accent"
        style={{ transform: 'scaleX(var(--progress))' }}
      />
      <div className="container-x relative flex h-14 items-center justify-between border-b border-line bg-surface">
        <a href="#home" className="font-display text-[1.1875rem] font-extrabold tracking-[-0.035em] text-ink" aria-label={`${profile.name}, back to top`}>
          {profile.name}
        </a>

        <nav aria-label="Chapters" className="hidden lg:block">
          <ul className="label flex items-center gap-1">
            {chapters.map(({ id, label }) => {
              // Smaller things sits inside Work on the page, but has its own piece on the console.
              const active = chapter === id || (id === 'work' && chapter === 'archive')
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={active ? 'true' : undefined}
                    className={`block px-3.5 py-2.5 transition-colors duration-300 ${active ? 'bg-ink text-surface' : 'text-ink hover:bg-raised'}`}
                  >
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
          className="meta -mr-2 p-2 text-ink lg:hidden"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open && (
        <div id="menu" ref={menuRef} className="swap-in fixed inset-x-0 bottom-0 top-14 z-40 bg-surface lg:hidden">
          <nav aria-label="Chapters" className="container-x flex h-full flex-col justify-center pb-16">
            <ul className="space-y-1">
              {chapters.map(({ id, label }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(e) => jump(e, id)}
                    aria-current={chapter === id ? 'true' : undefined}
                    className="display-lg block py-1 text-ink"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-12 hairline pt-6">
              <a href={`mailto:${profile.email}`} className="link meta">{profile.email}</a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
