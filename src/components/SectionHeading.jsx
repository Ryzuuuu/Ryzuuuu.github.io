import Lines from './Lines'

// A quiet chapter name above a large masked headline, and an optional intro.
const SectionHeading = ({ kicker, lines, intro, id }) => (
  <header className="mb-12">
    <p data-reveal className="reveal label text-muted">{kicker}</p>
    <Lines id={id} lines={lines} className="display-lg mt-5" delay={80} />
    {intro && (
      <p className="reveal lead mt-7 max-w-[32rem] text-muted" style={{ '--delay': '260ms' }}>
        {intro}
      </p>
    )}
  </header>
)

export default SectionHeading
