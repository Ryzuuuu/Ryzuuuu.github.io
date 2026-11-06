import { useEffect, useRef } from 'react'

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Counts the leading number of a figure up from zero the first time it's seen: "68,324", "14%",
// "90 sec" and "4 of 6" all keep whatever follows the number.
const CountUp = ({ value, className = '' }) => {
  const ref = useRef(null)

  useEffect(() => {
    const match = value.match(/^(\d[\d,]*)(.*)$/)
    if (!match || reducedMotion) return undefined
    const target = Number(match[1].replace(/,/g, ''))
    const el = ref.current
    let raf = 0
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const frame = (now) => {
        const p = Math.min(1, (now - start) / 1300)
        const eased = 1 - (1 - p) ** 4
        el.textContent = `${Math.round(target * eased).toLocaleString('en-US')}${match[2]}`
        if (p < 1) raf = requestAnimationFrame(frame)
      }
      raf = requestAnimationFrame(frame)
    }, { threshold: 0.6 })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value])

  return <p ref={ref} className={`tabular-nums ${className}`}>{value}</p>
}

export default CountUp
