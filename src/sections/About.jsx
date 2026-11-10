import Lines from '../components/Lines'
import ScrollReveal from '../bits/ScrollReveal'
import { about } from '../constants'

// The camera turns to the monitor, which sits to the left of the copy in this shot.
const About = () => (
  <section id="about" data-chapter="about" data-tone="light" data-shot="about" aria-labelledby="about-heading" className="relative">
    <div className="wrap grid min-h-[70vh] items-center pb-24 lg:min-h-[140vh] lg:grid-cols-12 lg:py-32">
      {/* The padding keeps the copy clear of the antenna, which this shot puts right beside it. */}
      <div className="panel lg:col-span-5 lg:col-start-8 lg:pl-[2.5vw]">
        <p data-reveal className="reveal t-meta text-muted">About</p>
        <Lines id="about-heading" lines={['I point cameras', [{ em: 'at hands.' }]]} className="t-h2 mt-5" delay={60} />
        <div className="mt-9 space-y-5">
          {about.paragraphs.map((p, i) => (
            <ScrollReveal key={p.slice(0, 20)} containerClassName={`sr ${i === 0 ? 't-lead' : 't-body text-muted'}`} baseOpacity={0.14} baseRotation={i === 0 ? 2 : 0} blurStrength={5} wordAnimationEnd="bottom 68%">
              {p}
            </ScrollReveal>
          ))}
        </div>
        <dl className="reveal mt-10 border-t border-ink" style={{ '--delay': '300ms' }}>
          {about.facts.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-6 border-b border-line py-3">
              <dt className="t-meta text-muted">{k}</dt>
              <dd className="t-small text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </section>
)

export default About
