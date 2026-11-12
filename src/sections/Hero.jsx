import { useEffect, useRef, useState } from 'react'
import { intro, profile } from '../constants'
import { GRADIENT } from '../palette'
import Button from '../components/Button'
import GradientText from '../bits/GradientText'
import VariableProximity from '../bits/VariableProximity'

const istNow = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })

const LocalTime = () => {
  const [time, setTime] = useState(istNow)
  useEffect(() => {
    const id = setInterval(() => setTime(istNow()), 15000)
    return () => clearInterval(id)
  }, [])
  return <span className="t-num">{time}</span>
}

// The name is set in a variable font, so each letter can put on weight as the pointer nears it.
const [FIRST, LAST] = profile.name.split(' ')
const ROMAN = ["'wght' 400, 'opsz' 144, 'SOFT' 30, 'WONK' 0", "'wght' 780, 'opsz' 144, 'SOFT' 100, 'WONK' 0"]
const ITALIC = ["'wght' 340, 'opsz' 144, 'SOFT' 100, 'WONK' 1", "'wght' 720, 'opsz' 144, 'SOFT' 100, 'WONK' 1"]

// What you can do to the console, each with its own small drawing.
const NOTES = [
  ['Drag', 'and it turns', 'M13 8a5 5 0 1 1-1.6-3.7M13.2 2.4v2.5h-2.5'],
  ['Point', 'and each piece shows off', 'M4.2 2.6 12 7.6l-3.5.9-1.6 3.4z'],
  ['Click', 'and it takes you somewhere', 'M8 3a5 5 0 1 0 0 10A5 5 0 0 0 8 3zM8 7.1a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8z'],
]

// The opening screen. The console stands to the right on its island; the copy keeps to the
// left, and only the name runs out past its column, above the plinth.
const Hero = () => {
  const name = useRef(null)
  const letters = (label, [from, to]) => (
    <VariableProximity label={label} containerRef={name} radius={240} falloff="gaussian" smoothing={0.14} fromFontVariationSettings={from} toFontVariationSettings={to} />
  )

  return (
    <section id="home" data-chapter="home" data-tone="dark" data-shot="hero" className="relative flex min-h-[100svh] flex-col justify-center lg:min-h-[155svh] lg:justify-start">
      <div className="wrap pb-16 pt-[54svh] lg:flex lg:min-h-[100svh] lg:flex-col lg:justify-center lg:pb-10 lg:pt-28">
        <div className="panel lg:max-w-[42%]">
          <p className="reveal t-meta flex items-center gap-4 text-muted">
            <span className="text-spark">№ 01</span>
            <span className="hero-rule" aria-hidden="true" />
            <span>Portfolio, 2027</span>
          </p>
          <h1 ref={name} data-reveal aria-label={profile.name} className="t-display t-display--hero mt-7 lg:mt-9" style={{ '--delay': '120ms' }}>
            <span aria-hidden="true" className="line-mask" style={{ '--i': 0 }}><span>{letters(FIRST, ROMAN)}</span></span>
            <span aria-hidden="true" className="line-mask" style={{ '--i': 1 }}>
              <span>
                <em><GradientText colors={[...GRADIENT, GRADIENT[1]]} animationSpeed={6} scale={2}>{letters(LAST, ITALIC)}</GradientText></em>
              </span>
            </span>
          </h1>
          <p className="reveal t-lead mt-8 max-w-[30ch] lg:mt-10" style={{ '--delay': '420ms' }}>
            {intro.lede}
          </p>
          <div className="reveal mt-9 flex flex-wrap items-center gap-3" style={{ '--delay': '560ms' }}>
            <Button href="#work" icon="cartridge">See what I’ve built</Button>
            <Button href={`mailto:${profile.email}`} ghost>Say hello</Button>
          </div>
          <p className="reveal t-meta mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted lg:mt-12" style={{ '--delay': '700ms' }}>
            <span>B.Tech CSE, VIT Bhopal</span>
            <span className="hero-rule" aria-hidden="true" />
            <span><span className="text-ink"><LocalTime /></span> IST</span>
            <a href="#process" className="ml-auto text-ink">Scroll <span aria-hidden="true" className="scroll-cue">↓</span></a>
          </p>
        </div>

        {/* Said once, instead of a caption following the console around the page. On a wide
            screen it's pinned to the left and only shows in the stretch after the opening copy has
            dissolved and before the first step arrives, when the console has the screen to itself. */}
        <aside className="hero-note">
          <p className="t-meta flex items-center gap-4 text-spark">
            <span>Operating notes</span>
            <span className="hero-rule" aria-hidden="true" />
          </p>
          <p className="hero-note__lead">A real 3D console, <em className="figure-grad">not a video.</em></p>
          <ul className="hero-note__list">
            {NOTES.map(([verb, what, d]) => (
              <li key={verb}>
                <span className="hero-note__chip" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
                </span>
                <span className="t-meta text-ink">{verb}</span>
                <span className="t-small text-muted">{what}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}

export default Hero
