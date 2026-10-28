import SectionHeading from '../components/SectionHeading'
import { loadout } from '../constants'

const Toolbox = () => (
  <section id="toolbox" data-chapter="toolbox" data-tone="light" data-shot="toolbox" className="relative">
    <div className="container-x grid min-h-[135vh] items-center pb-24 pt-[52svh] lg:grid-cols-12 lg:py-32">
      <div className="panel lg:col-span-6">
        <SectionHeading
          num="02"
          kicker="Toolbox"
          lines={['Tools I actually', 'reach for.']}
          intro="Not a list of everything I’ve ever installed. Just what comes out of the drawer when something has to work by Friday."
        />

        <ol>
          {loadout.map(({ group, aside, items }, i) => (
            <li
              key={group}
              className="reveal border-t-2 border-ink py-6 last:border-b-2"
              style={{ '--delay': `${i * 90}ms` }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h3 className="text-[clamp(1.8rem,2.6vw,2.5rem)] leading-none tracking-[-0.045em]">{group}</h3>
                <span className="italic text-muted">{aside}</span>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${group} tools`}>
                {items.map((item) => (
                  <li key={item} className="chip">{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </section>
)

export default Toolbox
