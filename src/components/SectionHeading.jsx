import Lines from './Lines'
import Scramble from './Scramble'
import ScrubText from './ScrubText'

// A quiet chapter name above a large masked headline, and an optional intro.
const SectionHeading = ({ kicker, kickerId, lines, intro, id }) => (
  <header className="mb-12">
    <p data-reveal className="reveal label text-muted"><Scramble id={kickerId}>{kicker}</Scramble></p>
    <Lines id={id} lines={lines} className="display-lg mt-5" delay={80} />
    {intro && (
      <ScrubText text={intro} className="lead mt-7 max-w-[32rem] text-muted" />
    )}
  </header>
)

export default SectionHeading
