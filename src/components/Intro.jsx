import { useEffect, useRef, useState } from 'react'
import Logo from '../brand/Logo'
import { profile } from '../constants'
import { lockScroll } from '../director'
import { getOpening, reportOpening } from '../opening'

// The curtain the site opens behind. The lotus unfurls in the middle while a counter follows the
// console's download; then an iris opens from where the console stands, and the page is there.
//
// The counter never runs ahead of the download or of the clock, so it can't flash past, and it
// never waits longer than MAX_MS: on a slow line the curtain goes up anyway and the small loader
// beside the plinth takes over.
const STEPS = ['Warming the tube', 'Seating the cartridge', 'Raising the antenna', 'Ready']
const MIN_MS = 2100
const MAX_MS = 7000
const OPEN_MS = 1800

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const Intro = () => {
  const [phase, setPhase] = useState(reducedMotion ? 'gone' : 'loading')
  const count = useRef(null)
  const step = useRef(null)
  const bar = useRef(null)

  useEffect(() => {
    const raise = () => {
      document.documentElement.removeAttribute('data-intro')
      lockScroll(false)
      reportOpening({ raised: true })
      window.dispatchEvent(new Event('intro:open'))
    }
    if (reducedMotion) {
      raise()
      return
    }

    lockScroll(true)
    const start = performance.now()
    let last = start
    let shown = 0
    let raf = 0
    let timer = 0

    const tick = (now) => {
      const { progress, ready } = getOpening()
      const elapsed = now - start
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const clock = Math.min(100, (elapsed / MIN_MS) * 100)
      const target = ready || elapsed > MAX_MS ? clock : Math.min(clock, progress * 0.94)
      shown = Math.max(shown, Math.min(target, shown + dt * 95))

      if (count.current) count.current.textContent = String(Math.floor(shown)).padStart(3, '0')
      if (bar.current) bar.current.style.transform = `scaleX(${shown / 100})`
      if (step.current) step.current.textContent = STEPS[Math.min(STEPS.length - 1, Math.floor((shown / 100) * STEPS.length))]

      if (shown >= 99.9) {
        setPhase('opening')
        raise()
        timer = setTimeout(() => setPhase('gone'), OPEN_MS)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [])

  if (phase === 'gone') return null

  return (
    <div aria-hidden="true" className={`intro ${phase === 'opening' ? 'is-opening' : ''}`}>
      <div className="intro__veil">
        <div className="intro__lamp" />
        <p className="intro__head t-meta">
          <span>{profile.name}</span>
          <span>Portfolio, 2027</span>
        </p>
        <div className="intro__mark"><Logo size="full" /></div>
        <p className="intro__count"><span ref={count}>000</span></p>
        <p className="intro__step t-meta"><span ref={step}>{STEPS[0]}</span></p>
        <div className="intro__bar"><span ref={bar} /></div>
      </div>
      <div className="intro__ring" />
    </div>
  )
}

export default Intro
