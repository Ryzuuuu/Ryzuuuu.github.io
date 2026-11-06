import { useEffect } from 'react'

const RADIUS = 190
const REST = { wght: 600, wdth: 112 }
const PEAK = { wght: 800, wdth: 125 }

// Headlines respond to the pointer: letters swell as it nears, using the width and weight axes
// of the variable font, and settle again as it leaves. The opening screen also drifts a little
// against the pointer. Only headlines on screen are touched, and only while something is moving.
export const useLiveType = () => {
  useEffect(() => {
    const root = document.documentElement
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return undefined

    const pointer = { x: -9999, y: -9999 }
    const visible = new Set()
    let raf = 0

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target)
        else visible.delete(entry.target)
      }
    })
    const heads = document.querySelectorAll('h1[data-reveal], h2[data-reveal], h3[data-reveal]')
    for (const head of heads) {
      head.liveChars = [...head.querySelectorAll('.char')].map((el) => ({ el, level: 0 }))
      io.observe(head)
    }

    const frame = () => {
      raf = 0
      const reads = []
      for (const head of visible) {
        const box = head.getBoundingClientRect()
        const near = pointer.x > box.left - RADIUS && pointer.x < box.right + RADIUS
          && pointer.y > box.top - RADIUS && pointer.y < box.bottom + RADIUS
        for (const c of head.liveChars) {
          let target = 0
          if (near) {
            const r = c.el.getBoundingClientRect()
            const d = Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2))
            target = Math.max(0, 1 - d / RADIUS) ** 2
          }
          if (target !== c.level) reads.push([c, target])
        }
      }
      let moving = false
      for (const [c, target] of reads) {
        c.level += (target - c.level) * 0.2
        if (Math.abs(target - c.level) < 0.004) c.level = target
        else moving = true
        if (c.level === 0) c.el.style.fontVariationSettings = ''
        else {
          const wght = REST.wght + (PEAK.wght - REST.wght) * c.level
          const wdth = REST.wdth + (PEAK.wdth - REST.wdth) * c.level
          c.el.style.fontVariationSettings = `'wght' ${wght.toFixed(0)}, 'wdth' ${wdth.toFixed(1)}`
        }
      }
      if (moving) raf = requestAnimationFrame(frame)
    }
    const request = () => { if (!raf) raf = requestAnimationFrame(frame) }

    const move = (e) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      root.style.setProperty('--px', ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3))
      root.style.setProperty('--py', ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3))
      root.style.setProperty('--cx', `${e.clientX}px`)
      root.style.setProperty('--cy', `${e.clientY}px`)
      request()
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('scroll', request, { passive: true })

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('scroll', request)
    }
  }, [])
}
