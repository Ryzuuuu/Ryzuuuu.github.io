import { useEffect, useState } from 'react'
import Lines from '../components/Lines'
import ScrollBadge from '../components/ScrollBadge'
import { onTheBench, profile } from '../constants'

const OnTheBench = () => {
  const [i, setI] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % onTheBench.length), 3800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="reveal mt-9 flex max-w-[34rem] items-baseline gap-4 border-t-2 border-ink pt-4" style={{ '--delay': '420ms' }}>
      <span className="label shrink-0 text-muted">On the bench</span>
      <p aria-hidden="true" className="min-h-[3.2em] text-lg font-medium sm:min-h-[1.6em]">
        <span key={i} className="swap-in block">{onTheBench[i]}</span>
      </p>
      <p className="sr-only">Currently building: {onTheBench.join('; ')}.</p>
    </div>
  )
}

const Hero = () => (
  <section id="home" data-chapter="home" data-tone="light" data-shot="hero" className="relative flex min-h-[100svh] flex-col">
    <div className="container-x flex flex-1 items-end pb-14 pt-[46svh] lg:items-center lg:pb-24 lg:pt-24">
      <div className="panel w-full lg:max-w-[54%]">
        <p data-reveal className="reveal label flex items-center gap-3 text-muted">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-pop" />
          {profile.name} — student developer
        </p>
        <Lines
          as="h1"
          className="display-xl mt-7"
          delay={120}
          lines={['I make', 'machines that', <span key="m" className="marker">notice things.</span>]}
        />
        <p className="reveal lead mt-8 max-w-[33rem] text-muted" style={{ '--delay': '320ms' }}>
          Edge AI, computer vision and the occasional overly ambitious website (you’re standing in one). I like
          problems that live outside the notebook.
        </p>
        <OnTheBench />
        <div className="reveal mt-10 flex flex-wrap gap-3" style={{ '--delay': '520ms' }}>
          <a href="#work" className="btn-solid">
            See the work <span aria-hidden="true">↓</span>
          </a>
          <a href="#contact" className="btn-ghost">
            Say hi
          </a>
        </div>
      </div>
    </div>

    <ScrollBadge href="#process" className="pointer-events-auto absolute bottom-5 left-1/2 hidden -translate-x-1/2 scale-90 lg:grid" />
  </section>
)

export default Hero
