import SectionHeading from '../components/SectionHeading'
import { stats } from '../constants'

const About = () => (
  <section id="about" data-chapter="about" data-shot="about" className="relative">
    <div className="container-x grid min-h-[135vh] items-center pb-24 pt-[52svh] lg:grid-cols-12 lg:py-32">
      <div className="panel lg:col-span-6 lg:col-start-7 xl:col-span-5 xl:col-start-8">
        <SectionHeading
          numeral="I"
          eyebrow="Profile"
          title={
            <>
              Where machine learning meets <em>everyday life.</em>
            </>
          }
        />

        <div className="reveal prose-body space-y-5" style={{ '--delay': '100ms' }}>
          <p>
            Most of what I build lives in that overlap:{' '}
            <span className="font-normal text-ivory">hand tracking that drives your slides</span>,{' '}
            <span className="font-normal text-ivory">CCTV footage turned into store analytics</span>, and{' '}
            <span className="font-normal text-ivory">a 90-second voice clip screened for early signs of neurological decline</span>.
          </p>
          <p>When I’m not training models I’m in React and Three.js, or grinding competitive programming problems.</p>
        </div>

        <dl className="reveal mt-12 grid grid-cols-3 border-t border-hairline" style={{ '--delay': '200ms' }}>
          {stats.map(({ value, label }, i) => (
            <div key={label} className={`flex flex-col-reverse pt-6 ${i ? 'border-l border-hairline pl-4 sm:pl-6' : 'pr-4'}`}>
              <dt className="smallcaps mt-2 text-[10px] leading-relaxed text-stone sm:text-[11px]">{label}</dt>
              <dd className="font-display text-5xl leading-none text-gold-light sm:text-6xl">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </section>
)

export default About
