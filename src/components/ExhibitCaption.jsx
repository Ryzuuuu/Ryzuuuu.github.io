import { useSyncExternalStore } from 'react'
import { getSnapshot, subscribe } from '../director'
import { captionFor, resolveShot } from '../canvas/shots'
import { TARGETS } from '../canvas/targets'
import { projects } from '../constants'

// A figure caption beside the console: what the monitor is running, or, when you hover a piece
// of the console, where clicking it goes.
const ExhibitCaption = () => {
  const { shot, screen, hovered } = useSyncExternalStore(subscribe, getSnapshot)
  const n = screen.startsWith('work-') ? Number(screen.slice(5)) : -1
  const project = projects[n]
  const base = project ? { text: project.instrument } : captionFor(screen, shot)
  if (!base) return null

  const target = hovered && TARGETS[hovered]
  const heading = target ? target.label : project ? `Fig. ${n + 1} · On the monitor` : 'On the monitor'
  const text = target ? `Click to open ${target.opens}, or drag to turn it` : base.text
  const right = resolveShot(shot).fx >= 0.5

  return (
    <aside
      aria-hidden="true"
      className={`pointer-events-none fixed bottom-7 z-20 hidden lg:block ${right ? 'right-[var(--gutter)]' : 'left-[var(--gutter)]'}`}
    >
      <div key={`${screen}|${hovered}`} className={`fade-in max-w-[22rem] border-t border-ink pt-2.5 ${right ? 'text-right' : ''}`}>
        <p className="t-meta text-muted">{heading}</p>
        <p className="t-small mt-1 text-ink">{text}</p>
      </div>
    </aside>
  )
}

export default ExhibitCaption
