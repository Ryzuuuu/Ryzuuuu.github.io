import ScrollVelocity from '../bits/ScrollVelocity'

// Two lines of very large type that cross the screen between chapters, one each way, speeding up
// and leaning with the scroll. Decoration only, so it's hidden from screen readers.
const Band = ({ lines }) => (
  <div aria-hidden="true" className="band">
    <ScrollVelocity texts={lines} velocity={48} numCopies={5} separator="/" gap={28} skewWithVelocity={9} outlineAlternate />
  </div>
)

export default Band
