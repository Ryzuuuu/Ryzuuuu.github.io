import CountUp from '../components/CountUp'
import SectionHeading from '../components/SectionHeading'
import { stats } from '../constants'

const About = () => (
  <section id="about" data-chapter="about" data-tone="light" data-shot="about" className="relative">
    <div className="container-x grid min-h-[140vh] items-center pb-24 pt-[52svh] lg:grid-cols-12 lg:py-32">
      <div className="panel lg:col-span-6 lg:col-start-7">
        <SectionHeading num="01" kicker="About" lines={['Machine learning,', 'out in the wild.']} />

        <div className="reveal lead space-y-5 text-muted" style={{ '--delay': '120ms' }}>
          <p>
            I’m a student developer who keeps dragging models out of notebooks and into places they weren’t trained
            for: <span className="font-medium text-ink">hand tracking that flips your slides</span>,{' '}
            <span className="font-medium text-ink">CCTV footage turned into store analytics</span>, and{' '}
            <span className="marker font-medium text-ink">a 90-second voice clip screened for early signs of neurological decline</span>.
          </p>
          <p>While the models train, I’m in React and Three.js, or losing a polite argument with a competitive programming judge.</p>
        </div>

        <dl className="reveal mt-14 grid grid-cols-3 border-t-2 border-ink" style={{ '--delay': '220ms' }}>
          {stats.map(({ value, suffix, label }, i) => (
            <div key={label} className={`flex flex-col-reverse pt-5 ${i ? 'border-l-2 border-ink pl-4 sm:pl-6' : 'pr-4'}`}>
              <dt className="label mt-3 leading-relaxed text-muted">{label}</dt>
              <dd className="font-display text-[clamp(3rem,5vw,5rem)] font-extrabold leading-none tracking-[-0.05em]">
                <CountUp value={value} suffix={suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </section>
)

export default About
