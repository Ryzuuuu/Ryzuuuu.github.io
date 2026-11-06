import { markGeometry, VIEW_BOX } from './mark'

// The logo as a component. Each row of petals is its own group, so index.css can bloom them in on
// load, open them on hover and turn the aperture with the scroll. Colours come from the --logo-*
// variables, which follow the page's tone. It's decorative: label whatever link it sits in.
const Logo = ({ size = 'compact', className = '' }) => {
  const { dial, layers, lens } = markGeometry(size)
  return (
    <svg viewBox={VIEW_BOX} aria-hidden="true" focusable="false" className={`logo ${className}`}>
      {dial && (
        <g className="logo__dial">
          <circle r={dial.radius} fill="none" stroke="var(--logo-dial)" strokeWidth="0.5" />
          {Array.from({ length: dial.ticks }, (_, i) => (
            <line
              key={i}
              y1={-dial.radius + 0.9}
              y2={-dial.radius + (i % dial.major === 0 ? 3.1 : 1.9)}
              transform={`rotate(${(i * 360) / dial.ticks})`}
              stroke="var(--logo-dial)"
              strokeWidth={i % dial.major === 0 ? 0.8 : 0.4}
            />
          ))}
        </g>
      )}
      {layers.map(({ id, tone, d, angles }, l) => (
        <g key={id} className={`logo__layer logo__layer--${id}`}>
          {angles.map((angle, i) => (
            <g key={angle} transform={`rotate(${angle})`}>
              <path className="logo__petal" d={d} fill={`var(--logo-${tone})`} style={{ '--i': i, '--l': l }} />
            </g>
          ))}
        </g>
      ))}
      <g className="logo__lens">
        <circle r={lens.body} fill="var(--logo-lens)" />
        {lens.ring > 0 && <circle r={lens.ring} fill="none" stroke="var(--logo-glint)" strokeWidth={lens.ringWidth} opacity="0.55" />}
        <circle cx={lens.glint[0]} cy={lens.glint[1]} r={lens.glint[2]} fill="var(--logo-glint)" />
      </g>
    </svg>
  )
}

export default Logo
