import SectionHeading from '../components/SectionHeading'
import { about } from '../constants'

const About = () => (
  <section id="about" data-chapter="about" data-tone="light" data-shot="about" className="relative">
    <div className="container-x grid min-h-[70vh] lg:min-h-[140vh] items-center pb-24 lg:grid-cols-12 lg:py-32">
      {/* The padding keeps the copy clear of the antenna, which this shot puts right beside it. */}
      <div className="panel lg:col-span-5 lg:col-start-8 lg:pl-[2.5vw]">
        <SectionHeading kicker="About" lines={about.title} />

        <div className="reveal lead space-y-5" style={{ '--delay': '160ms' }}>
          {about.paragraphs.map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
        </div>

        <dl className="reveal meta mt-12" style={{ '--delay': '260ms' }}>
          {about.facts.map(([k, v]) => (
            <div key={k} className="hairline flex justify-between gap-6 py-2.5">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </section>
)

export default About
