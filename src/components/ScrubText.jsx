import { useEffect, useRef } from 'react'

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// One scroll listener for every paragraph, doing nothing for those off screen.
const items = new Set()
let ticking = false

const update = () => {
  ticking = false
  const vh = window.innerHeight
  // Below the desktop layout, copy only shows in the lower half, under the console's window.
  const narrow = window.innerWidth < 1024
  const start = vh * (narrow ? 0.98 : 0.88)
  const end = vh * (narrow ? 0.62 : 0.42)
  for (const item of items) {
    const box = item.el.getBoundingClientRect()
    if (box.top > vh * 1.2 && item.lit === 0) continue
    const p = (start - box.top) / (start - end + box.height * 0.5)
    const lit = Math.round(Math.min(1, Math.max(0, p)) * item.words.length)
    if (lit === item.lit) continue
    item.words.forEach((w, i) => w.classList.toggle('on', i < lit))
    item.lit = lit
  }
}
const request = () => {
  if (ticking) return
  ticking = true
  requestAnimationFrame(update)
}

// A paragraph that lights up word by word as it's scrolled through, so reading feels driven by
// the visitor's own hand rather than something already sitting there.
const ScrubText = ({ as: Tag = 'p', text, className = '', style }) => {
  const ref = useRef(null)

  useEffect(() => {
    if (reducedMotion) return undefined
    const item = { el: ref.current, words: [...ref.current.querySelectorAll('.w')], lit: 0 }
    if (!items.size) {
      window.addEventListener('scroll', request, { passive: true })
      window.addEventListener('resize', request, { passive: true })
    }
    items.add(item)
    request()
    return () => {
      items.delete(item)
      if (!items.size) {
        window.removeEventListener('scroll', request)
        window.removeEventListener('resize', request)
      }
    }
  }, [])

  if (reducedMotion) return <Tag className={className} style={style}>{text}</Tag>

  return (
    <Tag ref={ref} className={className} style={style}>
      {text.split(' ').map((word, i) => (
        <span key={i}>
          {i > 0 && ' '}
          <span className="w">{word}</span>
        </span>
      ))}
    </Tag>
  )
}

export default ScrubText
