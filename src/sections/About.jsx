import SectionHeading from '../components/SectionHeading'
import { loadout, stats } from '../constants'

const About = () => (
  <section id="about" data-accent="green" className="relative py-20 sm:py-28">
    <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-7">
        <SectionHeading index="01" eyebrow="Player profile" title="Ship it. Then make it beautiful." />

        <div className="reveal space-y-5 text-lg leading-relaxed text-muted" style={{ '--delay': '80ms' }}>
          <p>
            That’s the whole philosophy. I learn by building, usually something that has to survive the messy real world:
            shaky webcam feeds, noisy audio, sensors wired to a Raspberry Pi.
          </p>
          <p>
            Most of my projects sit where machine learning meets everyday life:{' '}
            <span className="text-fg">hand tracking that drives your slides</span>,{' '}
            <span className="text-fg">CCTV footage turned into store analytics</span>, and{' '}
            <span className="text-fg">a 90-second voice clip screened for early signs of neurological decline</span>. When
            I’m not training models I’m in React and Three.js, or grinding competitive programming problems.
          </p>
        </div>

        <dl className="reveal mt-12 grid grid-cols-3 gap-4 border-t border-line pt-8" style={{ '--delay': '160ms' }}>
          {stats.map(({ value, label }) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd className="font-display text-3xl font-bold text-fg sm:text-4xl">{value}</dd>
              <dd className="mt-1 font-mono text-[11px] uppercase tracking-wider text-dim sm:text-xs">{label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <aside className="reveal card self-start p-6 sm:p-8 lg:col-span-5 lg:mt-24" style={{ '--delay': '120ms' }}>
        <div className="mb-6 flex items-baseline justify-between">
          <h3 className="font-display text-xl font-semibold">Loadout</h3>
          <span className="font-mono text-[11px] uppercase tracking-wider text-dim">what I reach for</span>
        </div>
        <div className="space-y-6">
          {loadout.map(({ group, items }) => (
            <div key={group}>
              <p className="mb-2.5 font-mono text-xs uppercase tracking-wider text-accent">{group}</p>
              <ul className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <li key={item} className="chip">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </div>
  </section>
)

export default About
