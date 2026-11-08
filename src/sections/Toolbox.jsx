import Lines from '../components/Lines'
import { tools } from '../constants'

// The camera looks down into the console's open mechanism while this list is on screen.
const Toolbox = () => (
  <section id="toolbox" data-chapter="toolbox" data-tone="light" data-shot="toolbox" aria-labelledby="toolbox-heading" className="relative">
    <div className="wrap grid min-h-[70vh] items-center pb-24 lg:min-h-[135vh] lg:grid-cols-12 lg:py-32">
      <div className="panel lg:col-span-5">
        <p data-reveal className="reveal t-meta text-muted">Tools</p>
        <Lines id="toolbox-heading" lines={['What I', [{ em: 'reach for.' }]]} className="t-h2 mt-5" delay={60} />
        <dl className="reveal mt-10 border-t border-ink" style={{ '--delay': '160ms' }}>
          {tools.map(({ verb, items }) => (
            <div key={verb} className="group grid grid-cols-[7.5rem_1fr] items-baseline gap-4 border-b border-line py-3.5 sm:grid-cols-[9.5rem_1fr]">
              <dt className="italic-serif text-[1.3125rem] leading-tight transition-[transform,color] duration-700 ease-[var(--ease)] group-hover:translate-x-1.5 group-hover:text-accent">
                {verb}
              </dt>
              <dd className="t-small text-muted">{items.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </section>
)

export default Toolbox
