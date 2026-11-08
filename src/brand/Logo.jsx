import { useId, useMemo } from 'react'
import { drawMark, VIEW_BOX } from './mark'

// The logo as a component, drawn by mark.js so it always matches the exported files. index.css
// animates its parts by class: the flower turns slowly, the satellite circles the rim, the rows
// counter-turn with the scroll and the petals open on hover. It's decorative: label whatever link
// it sits in.
const Logo = ({ size = 'compact', className = '' }) => {
  const key = `logo${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const markup = useMemo(() => drawMark(size, undefined, key), [size, key])
  return (
    <svg
      viewBox={VIEW_BOX}
      aria-hidden="true"
      focusable="false"
      className={`logo ${className}`}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

export default Logo
