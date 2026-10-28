import { useEffect, useRef } from 'react'

const GLYPHS = '!<>-_\\/[]{}=+*^?#01'

// Eyebrow label decodes from noise the first time its heading scrolls into view.
const Scramble = ({ text }) => {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    const host = el?.closest('.reveal')
    if (!el || !host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const run = () => {
      const start = performance.now()
      const step = (now) => {
        const p = Math.min(1, (now - start) / 700)
        const solved = Math.floor(p * text.length)
        el.textContent = text
          .split('')
          .map((ch, i) => (i < solved || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
          .join('')
        if (p < 1) frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    }
    host.addEventListener('reveal', run, { once: true })
    return () => { host.removeEventListener('reveal', run); cancelAnimationFrame(frame) }
  }, [text])

  return (
    <span aria-label={text}>
      <span ref={ref} aria-hidden="true">{text}</span>
    </span>
  )
}

const SectionHeading = ({ index, eyebrow, title, intro }) => (
  <header className="reveal mb-12 max-w-2xl sm:mb-16">
    <p className="eyebrow mb-4">
      <span className="text-dim">{index} /</span> <Scramble text={eyebrow} />
    </p>
    <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">{title}</h2>
    {intro && <p className="mt-5 text-lg leading-relaxed text-muted">{intro}</p>}
  </header>
)

export default SectionHeading
