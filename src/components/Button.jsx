// The site's button: a pill with its arrow in a round chip (styles under "Buttons" in index.css).
// `dir` is the way the arrow points, and the way it slips out on hover: 'ne' or 's'; null
// leaves the arrow off.
const ARROWS = { ne: '↗', s: '↓' }

const Button = ({ as: Tag = 'a', dir = 'ne', size, ghost = false, className = '', children, ...rest }) => (
  <Tag className={`btn ${size === 'sm' ? 'btn--sm' : ''} ${ghost ? 'btn--ghost' : ''} ${dir ? '' : 'btn--plain'} ${className}`} {...rest}>
    {children}
    {dir && (
      <span aria-hidden="true" className={`btn__icon btn__icon--${dir}`}>
        <span className="btn__glyph">{ARROWS[dir]}</span>
      </span>
    )}
  </Tag>
)

export default Button
