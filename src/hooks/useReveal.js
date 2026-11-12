import { useEffect } from 'react'

// One shared observer marks `.reveal` / `[data-reveal]` elements visible the first time they
// enter the viewport; CSS does the actual animating.
export const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, [data-reveal]')
    // The opening screen comes on as the curtain clears it, whatever part of the viewport it fills.
    let timer = 0
    const showHome = () => {
      document.querySelectorAll('#home .reveal, #home [data-reveal]').forEach((el) => el.classList.add('is-visible'))
    }
    const onOpen = () => { timer = setTimeout(showHome, 520) }
    if (document.documentElement.hasAttribute('data-intro')) window.addEventListener('intro:open', onOpen, { once: true })
    else showHome()
    const stop = () => {
      clearTimeout(timer)
      window.removeEventListener('intro:open', onOpen)
    }
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'))
      return stop
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
    // The opening screen's own elements are left to showHome.
    els.forEach((el) => { if (!el.closest('#home')) io.observe(el) })
    return () => {
      io.disconnect()
      stop()
    }
  }, [])
}
