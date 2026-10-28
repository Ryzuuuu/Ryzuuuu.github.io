import { useEffect, useRef } from 'react'

// Counts from zero to `value` the first time it scrolls into view. Screen readers get the
// final number straight away.
const CountUp = ({ value, suffix = '' }) => {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    el.textContent = `0${suffix}`
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const step = (now) => {
        const p = Math.min(1, (now - start) / 1400)
        const eased = 1 - (1 - p) ** 4
        el.textContent = `${Math.round(value * eased)}${suffix}`
        if (p < 1) frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    }, { threshold: 0.6 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(frame) }
  }, [value, suffix])

  return (
    <span aria-label={`${value}${suffix}`}>
      <span ref={ref} aria-hidden="true">{`${value}${suffix}`}</span>
    </span>
  )
}

export default CountUp
