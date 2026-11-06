import SectionHeading from '../components/SectionHeading'
import { tools } from '../constants'

const Toolbox = () => (
  <section id="toolbox" data-chapter="toolbox" data-tone="light" data-shot="toolbox" className="relative">
    <div className="container-x grid min-h-[70vh] lg:min-h-[135vh] items-center pb-24 lg:grid-cols-12 lg:py-32">
      <div className="panel lg:col-span-5">
        <SectionHeading kicker="Tools" lines={['What I', 'reach for.']} />

        <dl>
          {tools.map(({ verb, items }, i) => (
            <div
              key={verb}
              className="reveal group hairline grid grid-cols-[8.75rem_1fr] items-baseline gap-4 py-3"
              style={{ '--delay': `${i * 70}ms` }}
            >
              <dt className="font-display text-[1.25rem] font-semibold leading-tight transition-[transform,color] duration-700 ease-[var(--ease)] group-hover:translate-x-1.5 group-hover:text-accent">{verb}</dt>
              <dd className="meta text-muted">{items.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </section>
)

export default Toolbox
