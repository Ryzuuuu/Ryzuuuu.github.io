import Lines from '../components/Lines'
import { process } from '../constants'

const NUMERALS = ['i', 'ii', 'iii']

// How a project goes, acted out by the model: each step is its own scroll anchor, the console
// swaps from wireframe to clay to finished as you reach it, and the camera keeps orbiting.
const Process = () => (
  <section id="process" data-chapter="home" data-tone="dark" aria-labelledby="process-title" className="relative">
    {process.map(({ title, body }, i) => (
      <article key={i} data-shot="process" data-param={i} data-screen={`process-${i}`} className="relative">
        <div className="wrap grid min-h-[70vh] content-center py-24 lg:min-h-[125vh] lg:grid-cols-12 lg:py-32">
          <div className="panel lg:col-span-5">
            {i === 0 && (
              <h2 id="process-title" data-reveal className="reveal t-meta mb-10 text-muted">How a project goes</h2>
            )}
            <p data-reveal className="reveal flex items-baseline justify-between border-t border-ink pt-4">
              <span className="italic-serif text-[1.5rem] leading-none text-accent">{NUMERALS[i]}.</span>
              <span className="t-meta text-muted">Step {i + 1} of 3</span>
            </p>
            <Lines as="h3" lines={[title[0], [{ em: title[1] }]]} className="t-h2 mt-8" delay={80} />
            <p className="reveal t-body mt-7 max-w-[30rem] text-muted" style={{ '--delay': '240ms' }}>{body}</p>
          </div>
        </div>
      </article>
    ))}
  </section>
)

export default Process
