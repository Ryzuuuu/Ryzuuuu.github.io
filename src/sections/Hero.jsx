import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { nowBuilding, profile } from '../constants'
import { TARGETS } from '../canvas/targets'
import SceneBoundary from '../components/SceneBoundary'

// three.js is the heaviest dependency by far; load it after the copy is on screen.
const ConsoleScene = lazy(() => import('../canvas/ConsoleScene'))

const hasWebGL = (() => {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
})()

const NowBuilding = () => {
  const [text, setText] = useState('')

  useEffect(() => {
    let line = 0
    let i = 0
    let deleting = false
    let timer
    const tick = () => {
      const full = nowBuilding[line]
      i += deleting ? -1 : 1
      setText(full.slice(0, i))
      let wait = deleting ? 22 : 45
      if (!deleting && i === full.length) { deleting = true; wait = 2600 }
      else if (deleting && i === 0) { deleting = false; line = (line + 1) % nowBuilding.length; wait = 400 }
      timer = setTimeout(tick, wait)
    }
    timer = setTimeout(tick, 900)
    return () => clearTimeout(timer)
  }, [])

  return (
    <p className="font-mono text-sm text-muted">
      <span className="text-neon-green">&gt; now building:</span>{' '}
      <span className="caret text-fg">{text}</span>
      <span className="sr-only">{nowBuilding.join('. ')}</span>
    </p>
  )
}

const goTo = (id) => document.getElementById(id)?.scrollIntoView()

const Hero = () => {
  const [hovered, setHovered] = useState(null)
  const copyRef = useRef(null)
  const onSelect = useCallback((id) => goTo(id), [])

  // Desktop only: fade the copy as the hero scrolls away. Direct style writes, once per frame at most.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)')
    let frame = 0
    const update = () => {
      frame = 0
      const el = copyRef.current
      if (!el) return
      if (!desktop.matches) {
        el.style.opacity = ''
        el.style.transform = ''
        return
      }
      const p = Math.min(1, window.scrollY / window.innerHeight)
      el.style.opacity = String(1 - p * 1.4)
      el.style.transform = `translate3d(0, ${p * -60}px, 0)`
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    desktop.addEventListener('change', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      desktop.removeEventListener('change', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  const target = hovered && TARGETS[hovered]

  return (
    <section id="home" data-accent="green" className="hero-glow relative overflow-hidden lg:h-[100svh] lg:min-h-[640px]">
      {/* Phones: scene on top, copy below. Desktop: full-bleed scene, copy on the left. */}
      <div className="relative h-[54svh] min-h-[340px] lg:absolute lg:inset-0 lg:h-auto">
        {hasWebGL && (
          <SceneBoundary>
            <Suspense
              fallback={
                <div className="absolute inset-0 grid place-items-center font-mono text-xs uppercase tracking-[0.3em] text-neon-green/70">
                  Booting…
                </div>
              }
            >
              <ConsoleScene hovered={hovered} onHover={setHovered} onSelect={onSelect} />
            </Suspense>
          </SceneBoundary>
        )}
        <div className="scanlines pointer-events-none absolute inset-0 opacity-25" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />

        {/* Scene hint: tells people the 3D bits are clickable */}
        <p
          aria-live="polite"
          className="pointer-events-none absolute bottom-3 left-4 right-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] sm:text-[11px] lg:bottom-6 lg:left-auto lg:right-8 lg:text-right"
        >
          {target ? (
            <span style={{ color: target.color }}>▸ {target.label}: {target.hint}</span>
          ) : (
            <span className="text-dim">
              <span className="lg:hidden">Swipe to spin · tap the monitor, a gamepad or the TV</span>
              <span className="hidden lg:inline">Drag to spin · click the monitor, a gamepad or the TV</span>
            </span>
          )}
        </p>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-2/3 bg-gradient-to-r from-ink/90 via-ink/50 to-transparent lg:block" />

      <div className="container-x relative pb-16 pt-4 lg:pointer-events-none lg:flex lg:h-full lg:items-center lg:py-0">
        <div ref={copyRef} className="max-w-xl lg:pointer-events-auto lg:will-change-transform">
          <p className="eyebrow mb-5 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-neon-green" />
            Player 1 ready
          </p>
          <h1 className="font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight xs:text-5xl sm:text-6xl lg:text-7xl">
            Ideas in.
            <br />
            <span className="gradient-text">Working systems out.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            I’m <span className="text-fg">{profile.name}</span>, a student developer who builds things that see, listen and
            sense: edge AI, computer vision, and interactive web like the console you’re looking at.
          </p>
          <div className="mt-5">
            <NowBuilding />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#projects" className="btn-primary">
              Press start <span aria-hidden="true">↓</span>
            </a>
            <a href="#contact" className="btn-ghost">
              Say hi
            </a>
          </div>
        </div>
      </div>

      <a
        href="#about"
        aria-label="Scroll to About"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-dim transition-colors hover:text-fg lg:flex"
      >
        Scroll
        <span className="block h-8 w-px animate-pulse bg-gradient-to-b from-dim to-transparent" />
      </a>
    </section>
  )
}

export default Hero
