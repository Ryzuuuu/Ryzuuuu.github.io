import { useEffect, useRef } from 'react'
import { FONTS, H, makeInstruments, W } from '../canvas/instruments'
import { rgb } from '../palette'

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const FPS = 30

// Neel on paper, mixed from the palette, so the plates print in the same ink as the page.
const makeInk = () => ({
  bg: rgb('paper-raised'),
  fg: rgb('brand'),
  soft: rgb('stone'),
  faint: rgb('stone', 0.28),
})

// One project's instrument, drawn live on a plate. It only animates while it's on screen, at a
// steady rate rather than every display refresh; with reduced motion it draws a single frame.
const Plate = ({ screen, label }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    const ink = makeInk()
    const draw = makeInstruments(ctx, ink)
    let raf = 0
    let visible = false
    let last = -1
    const start = performance.now()

    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const { width } = canvas.getBoundingClientRect()
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round((width * H * dpr) / W)
    }

    const paint = (t) => {
      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0)
      ctx.fillStyle = ink.bg
      ctx.fillRect(0, 0, W, H)
      ctx.textBaseline = 'alphabetic'
      draw(screen, t)
    }

    const loop = (now) => {
      raf = 0
      if (!visible) return
      const frame = Math.floor(((now - start) / 1000) * FPS)
      if (frame !== last) {
        last = frame
        paint((now - start) / 1000)
      }
      raf = requestAnimationFrame(loop)
    }

    const still = () => paint(12)

    size()
    still()
    // Repaint once the web fonts land, so a still frame doesn't keep the fallback.
    Promise.all(FONTS.map((f) => document.fonts?.load(f))).then(() => { if (!visible || reducedMotion) still() })

    const ro = new ResizeObserver(() => {
      size()
      if (reducedMotion || !visible) still()
    })
    ro.observe(canvas)

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !reducedMotion && !raf) raf = requestAnimationFrame(loop)
    })
    io.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [screen])

  return (
    <div className="plate">
      <canvas ref={canvasRef} role="img" aria-label={label} />
    </div>
  )
}

export default Plate
