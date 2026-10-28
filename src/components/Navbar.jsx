import { useEffect, useRef, useState } from 'react'
import { profile, sections } from '../constants'
import { useActiveSection } from '../hooks/useActiveSection'

const sectionIds = sections.map((s) => s.id)

const Navbar = () => {
  const active = useActiveSection(sectionIds)
  const [scrolled, setScrolled] = useState(false)
  const progressRef = useRef(null)

  // Progress bar is written straight to the DOM so scrolling never re-renders React.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`
      setScrolled(window.scrollY > 24)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'border-b border-line bg-ink/90' : 'border-b border-transparent'
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between">
        <a href="#home" className="group flex items-center gap-2.5" aria-label="Back to top">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 bg-white/5 font-mono text-sm font-medium transition-colors group-hover:border-neon-green/60 group-hover:text-neon-green">
            {profile.initials}
          </span>
          <span className="hidden font-mono text-xs uppercase tracking-[0.2em] text-muted sm:inline">
            {profile.name.split(' ')[0]}
          </span>
        </a>

        <nav aria-label="Sections">
          <ul className="flex items-center gap-1 sm:gap-2">
            {sections.map(({ id, label, accent }) => {
              const isActive = active === id
              return (
                <li key={id} data-accent={accent}>
                  <a
                    href={`#${id}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={`flex items-center gap-2 rounded-md px-2.5 py-2 font-mono text-xs uppercase tracking-wider transition-colors sm:px-3 ${
                      isActive ? 'text-accent' : 'text-muted hover:text-fg'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-all ${isActive ? 'scale-125' : 'opacity-40'}`}
                      style={{ background: 'var(--accent)' }}
                    />
                    {label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
      <div
        ref={progressRef}
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left"
        style={{ transform: 'scaleX(0)', background: 'linear-gradient(90deg,#3dffa2,#8183ff,#ff5fb1)' }}
      />
    </header>
  )
}

export default Navbar
