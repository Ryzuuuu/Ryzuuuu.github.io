import { useCallback, useEffect, useRef } from 'react'

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
export const BENGALI = 'কখগঘচছজঝটঠডঢণতথদধনপফবভমযরলশষসহ'
// How long each random character holds, so the noise reads as letters rather than a blur.
const TICK = 48

// Splits into what a reader sees as one character. Bengali needs this: a conjunct like ব্জ or a
// letter with a vowel sign is several code points, and pulling them apart draws broken shapes.
const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null
const characters = (text) => (segmenter ? [...segmenter.segment(text)].map((s) => s.segment) : [...text])

// Small labels decode from noise, left to right. They run once when they scroll into view, or
// with `hover` on every hover instead, or with `replay` on both. Its width is held so the row
// around it doesn't shuffle while it runs.
const Scramble = ({ children, as: Tag = 'span', hover = false, replay = false, glyphs = LATIN, duration = 750, className = '', ...rest }) => {
  const ref = useRef(null)
  const raf = useRef(0)
  const text = String(children)

  const run = useCallback(() => {
    const el = ref.current
    if (!el || reducedMotion) return
    cancelAnimationFrame(raf.current)
    el.textContent = text
    el.style.minWidth = `${el.offsetWidth}px`
    const parts = characters(text)
    const pool = [...glyphs]
    const start = performance.now()
    let last = 0
    const frame = (now) => {
      const p = Math.min(1, (now - start) / duration)
      if (p === 1) {
        el.textContent = text
        el.style.minWidth = ''
        return
      }
      if (now - last >= TICK) {
        last = now
        const settled = Math.floor(p * parts.length)
        el.textContent = parts.map((ch, i) => (
          i < settled || ch === ' ' ? ch : pool[Math.floor(Math.random() * pool.length)]
        )).join('')
      }
      raf.current = requestAnimationFrame(frame)
    }
    raf.current = requestAnimationFrame(frame)
  }, [text, duration, glyphs])

  useEffect(() => {
    if (hover) return undefined
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      run()
    }, { threshold: 0.6 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [hover, run])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  return (
    <Tag ref={ref} className={`inline-block ${className}`} onPointerEnter={hover || replay ? run : undefined} {...rest}>
      {text}
    </Tag>
  )
}

export default Scramble
