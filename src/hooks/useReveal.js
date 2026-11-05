import { useEffect } from 'react'

// One shared observer marks `.reveal` / `[data-reveal]` elements visible the first time they
// enter the viewport; CSS does the actual animating.
export const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, [data-reveal]')
    // The opening screen is on show from the start, whatever part of the viewport it fills.
    document.querySelectorAll('#home .reveal').forEach((el) => el.classList.add('is-visible'))
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}
