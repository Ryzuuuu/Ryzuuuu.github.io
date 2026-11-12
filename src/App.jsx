import { lazy, Suspense, useEffect } from 'react'
import Navbar from './components/Navbar'
import Band from './components/Band'
import Intro from './components/Intro'
import ExhibitLoader from './components/ExhibitLoader'
import SceneBoundary from './components/SceneBoundary'
import Hero from './sections/Hero'
import Process from './sections/Process'
import About from './sections/About'
import Toolbox from './sections/Toolbox'
import Work from './sections/Work'
import Contact from './sections/Contact'
import Colophon from './sections/Colophon'
import { startDirector } from './director'
import { useReveal } from './hooks/useReveal'
import { reportOpening } from './opening'
import Aurora from './bits/Aurora'
import { GRADIENT } from './palette'

// three.js is the heaviest dependency by far; load it after the copy is on screen.
const Stage = lazy(() => import('./canvas/Stage'))

const hasWebGL = (() => {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
})()

// With no console to wait for, the curtain only keeps its own time.
if (!hasWebGL) reportOpening({ ready: true, progress: 100 })

// The aurora is a second WebGL canvas, so it's only mounted where the opening backdrop shows.
const wide = window.matchMedia('(min-width: 1024px)').matches

const App = () => {
  useReveal()
  useEffect(() => startDirector(), [])

  return (
    <>
      <a
        href="#main"
        className="t-meta sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-ink focus:px-4 focus:py-3 focus:text-paper"
      >
        Skip to content
      </a>

      {/* Back to front: the lamps, the opening backdrop, the light, the console, the scrims, then the copy. */}
      <div aria-hidden="true" className="orbs">
        <span className="orb orb--a" />
        <span className="orb orb--b" />
        <span className="orb orb--c" />
      </div>
      {wide && (
        <div aria-hidden="true" className="hero-backdrop hidden lg:block">
          <div className="hero-backdrop__aurora">
            <Aurora colorStops={[GRADIENT[2], GRADIENT[1], GRADIENT[0]]} amplitude={1.3} blend={0.7} speed={0.7} height={0.5} layers={2} glow={0.5} brightness={0.9} opacity={0.4} mouseInteraction={false} />
          </div>
          <div className="hero-backdrop__grid" />
        </div>
      )}
      <div aria-hidden="true" className="stage-glow pointer-events-none fixed inset-0 z-[-2] hidden lg:block" />
      {hasWebGL && (
        <SceneBoundary>
          <Suspense fallback={<ExhibitLoader />}>
            <Stage />
          </Suspense>
        </SceneBoundary>
      )}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1]">
        <div className="scrim-left absolute inset-0 hidden lg:block" />
        <div className="scrim-right absolute inset-0 hidden lg:block" />
      </div>

      <div aria-hidden="true" className="progress" />
      <Navbar />
      <main id="main" className="pointer-events-none relative z-10 overflow-x-clip">
        <Hero />
        <Process />
        <Band lines={['Cameras, microphones, sensors', 'Hands, voices, signals']} />
        <About />
        <Toolbox />
        <Band lines={['Things that got finished', 'Things still arguing with me']} />
        <Work />
        <Band lines={['Still here? Good', 'The antenna is listening']} />
        <Contact />
      </main>
      <Colophon />

      <Intro />
      <div aria-hidden="true" className="grain pointer-events-none fixed inset-0 z-[60]" />
    </>
  )
}

export default App
