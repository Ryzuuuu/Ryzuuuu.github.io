import Lines from './Lines'

// "02 — Toolbox" kicker, a big masked headline, and an optional intro paragraph.
const SectionHeading = ({ num, kicker, lines, intro, id }) => (
  <header className="mb-12 sm:mb-14">
    <p data-reveal className="label flex items-center gap-4 text-muted">
      <span className="text-ink">{num}</span>
      <span aria-hidden="true" className="rule h-[2px] w-14 bg-ink" />
      {kicker}
    </p>
    <Lines id={id} lines={lines} className="display-lg mt-7" delay={80} />
    {intro && (
      <p className="reveal lead mt-8 max-w-[34rem] text-muted" style={{ '--delay': '260ms' }}>
        {intro}
      </p>
    )}
  </header>
)

export default SectionHeading
