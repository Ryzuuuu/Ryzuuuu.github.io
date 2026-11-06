import { useSyncExternalStore } from 'react'
import { getSnapshot, subscribe } from '../director'
import { captionFor, resolveShot } from '../canvas/shots'
import { TARGETS } from '../canvas/targets'
import { projects } from '../constants'

// A small museum label beside the console: what the monitor is running, or, when you hover a
// piece of the console, where clicking it goes.
const ExhibitCaption = () => {
  const { shot, screen, hovered } = useSyncExternalStore(subscribe, getSnapshot)
  const project = screen.startsWith('work-') && projects[Number(screen.slice(5))]
  const base = project ? { text: project.instrument } : captionFor(screen, shot)
  if (!base) return null

  const target = hovered && TARGETS[hovered]
  const heading = target ? target.label : 'On the monitor'
  const text = target ? `Click to open ${target.opens}, or drag to turn it` : base.text
  const right = resolveShot(shot).fx >= 0.5

  return (
    <aside
      aria-hidden="true"
      className={`pointer-events-none fixed bottom-7 z-20 hidden lg:block ${right ? 'right-12' : 'left-12'}`}
    >
      <div key={`${screen}|${hovered}`} className="swap-in max-w-[22rem] bg-surface px-3.5 py-2.5">
        <p className="meta text-muted">{heading}</p>
        <p className="mt-0.5 font-display text-[1.0625rem] leading-snug text-ink font-semibold">{text}</p>
      </div>
    </aside>
  )
}

export default ExhibitCaption
