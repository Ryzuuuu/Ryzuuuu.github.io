import { lazy, Suspense, useEffect } from 'react'
import Navbar from './components/Navbar'
import ExhibitCaption from './components/ExhibitCaption'
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
import { useLiveType } from './hooks/useLiveType'
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
  useLiveType()
  useEffect(() => startDirector(), [])

  return (
    <>
      <a
        href="#main"
        className="meta sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-ink focus:px-4 focus:py-3 focus:text-surface"
      >
        Skip to content
      </a>

      {/* Back to front: the light, the console, the scrims, then the copy. */}
      <div aria-hidden="true" className="stage-glow pointer-events-none fixed inset-0 z-[-2] hidden lg:block" />
      <div aria-hidden="true" className="hero-rings hidden lg:block">
        {[0, 1, 2, 3].map((n) => <i key={n} style={{ '--n': n }} />)}
      </div>
      <div aria-hidden="true" className="cursor-light hidden lg:block" />
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

      <Navbar />
      <main id="main" className="pointer-events-none relative z-10 overflow-x-clip">
        <Hero />
        <Process />
        <About />
        <Toolbox />
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
