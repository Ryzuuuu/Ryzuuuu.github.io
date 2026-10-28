import { useEffect, useState } from 'react'
import { nowBuilding, profile } from '../constants'

const NowBuilding = () => {
  const [i, setI] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % nowBuilding.length), 4200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-baseline gap-5 border-t border-hairline pt-5">
      <span className="smallcaps shrink-0 text-gold">Presently</span>
      <p aria-hidden="true" className="min-h-[1.7em] font-display text-xl italic text-ivory sm:text-[1.35rem]">
        <span key={i} className="fade-swap inline-block">{nowBuilding[i]}</span>
      </p>
      <p className="sr-only">Now building: {nowBuilding.join('; ')}.</p>
    </div>
  )
}

const Hero = () => (
  <section id="home" data-chapter="home" data-shot="hero" className="relative flex min-h-[100svh] flex-col">
    <div className="container-x flex flex-1 items-end pb-14 pt-[46svh] lg:items-center lg:pb-24 lg:pt-28">
      <div className="panel w-full max-w-[38rem] lg:max-w-[36rem] xl:max-w-[40rem]">
        <p className="eyebrow">
          <span className="numeral">No. 01</span>
          <span aria-hidden="true" className="h-px w-12 bg-gold/60" />
          Student developer
        </p>
        <h1 className="text-halo mt-7 text-[clamp(3.1rem,7vw,6.9rem)] leading-[0.95]">
          Ideas in.
          <br />
          <em>Working systems out.</em>
        </h1>
        <p className="prose-body mt-7 max-w-[34rem]">
          I’m <span className="font-normal text-ivory">{profile.name}</span>, a student developer who builds things that
          see, listen and sense: edge AI, computer vision, and interactive web like the exhibit beside you.
        </p>
        <div className="mt-7 max-w-[34rem]">
          <NowBuilding />
        </div>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#work" className="btn-gold">
            View selected work <span aria-hidden="true">↓</span>
          </a>
          <a href="#contact" className="btn-line">
            Get in touch
          </a>
        </div>
      </div>
    </div>

    <a
      href="#manifesto"
      aria-label="Scroll to explore"
      className="smallcaps pointer-events-auto absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-stone transition-colors hover:text-ivory lg:flex"
    >
      Scroll to explore
      <span aria-hidden="true" className="block h-12 w-px overflow-hidden">
        <span className="scroll-cue block h-full w-px bg-gold" />
      </span>
    </a>
  </section>
)

export default Hero
