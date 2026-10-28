import { useSyncExternalStore } from 'react'
import { getSnapshot, subscribe } from '../director'
import { CAPTIONS, resolveShot } from '../canvas/shots'
import { TARGETS } from '../canvas/targets'
import { chapters } from '../constants'

// A museum label beside the exhibit: what the camera is studying, or what a hovered piece opens.
const ExhibitCaption = () => {
  const { shot, hovered } = useSyncExternalStore(subscribe, getSnapshot)
  if (shot === 'colophon') return null

  const chapter = hovered && chapters.find((c) => c.id === hovered)
  const caption = chapter
    ? { fig: `Chapter ${chapter.numeral}`, title: TARGETS[hovered].label, note: `Click to open ${chapter.title}` }
    : CAPTIONS[shot] ?? CAPTIONS.hero
  const right = resolveShot(shot).fx >= 0.5
  const top = CAPTIONS[shot]?.top

  return (
    <aside
      aria-hidden="true"
      className={`pointer-events-none fixed z-20 hidden w-72 lg:block ${top ? 'top-28' : 'bottom-9'} ${right ? 'right-12 text-right' : 'left-12'}`}
    >
      <div key={`${shot}|${hovered}`} className="fade-swap text-halo">
        <p className={`smallcaps flex items-center gap-3 text-gold ${right ? 'justify-end' : ''}`}>
          {right && <span className="h-px w-8 bg-gold/50" />}
          {caption.fig}
          {!right && <span className="h-px w-8 bg-gold/50" />}
        </p>
        <p className="mt-2 font-display text-[1.65rem] italic leading-tight text-ivory">{caption.title}</p>
        <p className="mt-1 text-sm text-stone">{caption.note}</p>
      </div>
    </aside>
  )
}

export default ExhibitCaption
