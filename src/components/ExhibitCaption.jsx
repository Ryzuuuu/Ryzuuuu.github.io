import { useSyncExternalStore } from 'react'
import { getSnapshot, subscribe } from '../director'
import { captionFor, resolveShot } from '../canvas/shots'
import { TARGETS } from '../canvas/targets'
import { chapters } from '../constants'

// A hand-drawn arrow, because a perfectly straight one would be suspicious.
const Squiggle = ({ flip }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 80 46"
    className={`mb-2 h-9 w-16 text-pop ${flip ? '-scale-x-100' : ''}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 42c10-2 18-8 22-17 3-7 1-13-4-12-6 1-4 11 4 14 12 4 28-4 46-22" />
    <path d="M60 4l12 1-3 12" />
  </svg>
)

// A label beside the exhibit: what the camera is studying, or what a hovered piece opens.
const ExhibitCaption = () => {
  const { shot, screen, hovered } = useSyncExternalStore(subscribe, getSnapshot)
  const base = captionFor(screen, shot)
  if (!base) return null

  const chapter = hovered && chapters.find((c) => c.id === hovered)
  const caption = chapter
    ? { fig: `Go to ${chapter.num}`, title: TARGETS[hovered].label, note: `Click it. It opens ${chapter.label}.` }
    : base
  const right = resolveShot(shot).fx >= 0.5

  return (
    <aside
      aria-hidden="true"
      className={`pointer-events-none fixed z-20 hidden w-72 lg:block ${base.top ? 'top-28' : 'bottom-9'} ${
        right ? 'right-12 text-right' : 'left-12'
      }`}
    >
      <div key={`${screen}|${hovered}`} className="swap-in">
        <div className={`flex ${right ? 'justify-end' : ''}`}>
          <Squiggle flip={right} />
        </div>
        <p className="label text-muted">{caption.fig}</p>
        <p className="mt-1.5 font-display text-[1.65rem] font-extrabold leading-none tracking-[-0.04em] text-ink">
          {caption.title}
        </p>
        <p className="mt-1.5 text-[0.95rem] italic text-muted">{caption.note}</p>
      </div>
    </aside>
  )
}

export default ExhibitCaption
