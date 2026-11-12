// The site's button: a pill with a small drawing in a round chip (styles under "Buttons" in
// index.css). The label is set twice, one copy under the other, so it can roll up on hover.
// `icon` picks the drawing, each one a piece of the console or of what the button does, and
// `slip` is the way it leaves the chip on hover before coming back in from the other side.
const ICONS = {
  // A game cartridge, for the work: it drops into its slot.
  cartridge: { d: 'M3.5 2.5h9v11h-2.3v-1.7H5.8v1.7H3.5zM5.6 4.8h4.8v3.1H5.6z', slip: [0, 1] },
  // The antenna, sending: for anything that gets in touch.
  signal: { d: 'M8 14V9M8 6.4a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM5.3 10.2a3.8 3.8 0 0 1 0-5.4M10.7 4.8a3.8 3.8 0 0 1 0 5.4M3.4 12.1a6.5 6.5 0 0 1 0-9.2M12.6 2.9a6.5 6.5 0 0 1 0 9.2', slip: [0, -1] },
  // Angle brackets, for the code.
  code: { d: 'M5.4 4.6 2 8l3.4 3.4M10.6 4.6 14 8l-3.4 3.4M9.3 3 6.7 13', slip: [1, 0] },
  // Two sheets, and the tick that replaces them once the copy has landed.
  copy: { d: 'M5.6 5.6h7.4V13H5.6zM3 10.4V3h7.4', slip: [1, -1] },
  check: { d: 'M2.8 8.6 6.4 12 13.2 4.4', slip: [1, -1] },
}

const Button = ({ as: Tag = 'a', icon = 'signal', size, ghost = false, className = '', children, ...rest }) => {
  const art = ICONS[icon]
  return (
    <Tag className={`btn ${size === 'sm' ? 'btn--sm' : ''} ${ghost ? 'btn--ghost' : ''} ${art ? '' : 'btn--plain'} ${className}`} {...rest}>
      <span className="btn__label">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
      {art && (
        <span aria-hidden="true" className="btn__icon">
          <svg
            key={icon}
            className="btn__glyph"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ '--dx': art.slip[0], '--dy': art.slip[1] }}
          >
            <path d={art.d} />
          </svg>
        </span>
      )}
    </Tag>
  )
}

export default Button
