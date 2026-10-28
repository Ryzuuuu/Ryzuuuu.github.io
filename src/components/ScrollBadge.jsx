import { useId } from 'react'

// A slowly spinning circular label. Purely decorative nudge to keep going.
const ScrollBadge = ({ href, text = 'keep scrolling · it gets better · ', className = '' }) => {
  const id = `badge-${useId().replace(/[^\w-]/g, '')}`
  return (
  <a href={href} aria-label="Keep scrolling" className={`group relative grid h-28 w-28 place-items-center ${className}`}>
    <svg viewBox="0 0 100 100" aria-hidden="true" className="spin-slow absolute inset-0 h-full w-full">
      <defs>
        <path id={id} d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
      </defs>
      <text className="fill-ink font-mono text-[8.6px] uppercase" style={{ letterSpacing: '0.12em' }}>
        <textPath href={`#${id}`}>{text}</textPath>
      </text>
    </svg>
    <span
      aria-hidden="true"
      className="nudge grid h-11 w-11 place-items-center rounded-full bg-ink font-display text-xl font-extrabold text-surface transition-colors group-hover:bg-pop"
    >
      ↓
    </span>
  </a>
  )
}

export default ScrollBadge
