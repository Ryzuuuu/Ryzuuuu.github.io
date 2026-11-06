import { useEffect, useState } from 'react'
import Lines from '../components/Lines'
import Scramble, { BENGALI } from '../components/Scramble'
import { intro, profile } from '../constants'
import { timeAgo, useLastPush } from '../hooks/useLastPush'

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const LastPush = () => {
  const push = useLastPush()
  if (!push) return null
  return (
    <div className="swap-in">
      <dt className="label text-muted"><Scramble>Last commit</Scramble></dt>
      <dd className="mt-1.5">
        <a href={`${profile.github}/${push.repo}`} target="_blank" rel="noreferrer" className="link">
          {push.repo}
        </a>
        <span className="text-muted">, {timeAgo(push.date)}</span>
      </dd>
    </div>
  )
}

// What the things I build do, one verb at a time, each rolling in letter by letter.
const Rotator = () => {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reducedMotion) return undefined
    const id = setInterval(() => setI((n) => (n + 1) % intro.verbs.length), 2300)
    return () => clearInterval(id)
  }, [])
  return (
    <p
      aria-label={`I build things that ${intro.verbs.join(', ')}.`}
      className="reveal rotator-line parallax-2 mt-5"
      style={{ '--delay': '700ms' }}
    >
      <span aria-hidden="true">
        I build things that{' '}
        <span className="rotator text-accent">
          <span key={i} className="rotator__word">
            {[...`${intro.verbs[i]}.`].map((ch, c) => (
              <span key={c} className="rotator__char" style={{ '--c': c }}>{ch === ' ' ? ' ' : ch}</span>
            ))}
          </span>
        </span>
      </span>
    </p>
  )
}

const Hero = () => (
  <section id="home" data-chapter="home" data-tone="light" data-shot="hero" className="relative flex min-h-[100svh] flex-col justify-center">
    <div className="container-x pt-[52svh] lg:pb-8 lg:pt-20">
      {/* One column, kept left of the plinth: that side stays clear at every aspect ratio. */}
      <div className="panel lg:max-w-[41%]">
        <p lang="bn" className="reveal parallax-3 font-bengali text-[1.125rem] text-muted">
          <Scramble replay glyphs={BENGALI} duration={1300} className="whitespace-nowrap">{profile.bengali}</Scramble>
        </p>
        <Lines as="h1" lines={profile.name.split(' ')} className="display-xl parallax-1 mt-3" delay={250} />
        <Rotator />
        <p className="reveal lead parallax-3 mt-5 max-w-[34rem]" style={{ '--delay': '850ms' }}>
          {intro.statement}
        </p>
        <div className="reveal mt-7 flex flex-wrap gap-3" style={{ '--delay': '1000ms' }}>
          <a href="#work" className="btn-solid">See the work</a>
          <a href="#contact" className="btn-ghost">Contact</a>
        </div>
        <dl className="reveal meta mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t-2 border-ink pt-5 xs:grid-cols-3" style={{ '--delay': '1150ms' }}>
          {intro.now.map(([where, what]) => (
            <div key={where}>
              <dt className="label text-muted"><Scramble>{where}</Scramble></dt>
              <dd className="mt-1.5">{what}</dd>
            </div>
          ))}
          <LastPush />
        </dl>
      </div>
    </div>
  </section>
)

export default Hero
