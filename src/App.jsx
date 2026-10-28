import { lazy, Suspense, useEffect } from 'react'
import Navbar from './components/Navbar'
import ExhibitCaption from './components/ExhibitCaption'
import ExhibitLoader from './components/ExhibitLoader'
import SceneBoundary from './components/SceneBoundary'
import Hero from './sections/Hero'
import Manifesto from './sections/Manifesto'
import About from './sections/About'
import Expertise from './sections/Expertise'
import Work from './sections/Work'
import Contact from './sections/Contact'
import Colophon from './sections/Colophon'
import { startDirector } from './director'
import { useReveal } from './hooks/useReveal'

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

const App = () => {
  useReveal()
  useEffect(() => startDirector(), [])

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-ivory focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>

      {/* The exhibit stays put behind the whole page; the copy scrolls past it. */}
      <div aria-hidden="true" className="stage-glow pointer-events-none fixed inset-0 z-0" />
      {hasWebGL && (
        <SceneBoundary>
          <Suspense fallback={<ExhibitLoader />}>
            <Stage />
          </Suspense>
        </SceneBoundary>
      )}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1]">
        <div className="vignette absolute inset-0" />
        <div className="scrim-left absolute inset-0 hidden lg:block" />
        <div className="scrim-right absolute inset-0 hidden lg:block" />
        <div className="scrim-bottom absolute inset-0 lg:hidden" />
      </div>

      <Navbar />
      <main id="main" className="pointer-events-none relative z-10">
        <Hero />
        <Manifesto />
        <About />
        <Expertise />
        <Work />
        <Contact />
      </main>
      <Colophon />
      <ExhibitCaption />

      <div aria-hidden="true" className="grain pointer-events-none fixed inset-0 z-[60]" />
    </>
  )
}

export default App
