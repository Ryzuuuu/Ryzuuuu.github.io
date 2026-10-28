import Lines from '../components/Lines'
import { process } from '../constants'

// "How I work", acted out by the model: each step is its own scroll anchor, the console swaps
// from wireframe to clay to finished as you reach it, and the camera keeps orbiting throughout.
const Process = () => (
  <section id="process" data-chapter="home" data-tone="dark" aria-labelledby="process-title" className="relative">
    {process.map(({ step, title, body, note }, i) => (
      <article key={step} data-shot="process" data-param={i} data-screen={`process-${i}`} className="relative">
        <div className="container-x relative grid min-h-[125vh] content-center py-24 pt-[50svh] lg:grid-cols-12 lg:py-32">
          <span
            aria-hidden="true"
            data-speed="0.22"
            className="outline-text pointer-events-none absolute left-2 top-[16vh] select-none font-display text-[42vw] font-extrabold leading-none tracking-[-0.06em] lg:left-6 lg:top-[8vh] lg:text-[24vw]"
          >
            {String(i + 1).padStart(2, '0')}
          </span>

          <div className="panel relative lg:col-span-6 xl:col-span-5">
            {i === 0 && (
              <header className="mb-16">
                <p data-reveal className="reveal label flex items-center gap-4 text-muted">
                  <span aria-hidden="true" className="rule h-[2px] w-14 bg-ink" />
                  How I work
                </p>
                <h2 id="process-title" data-reveal className="reveal mt-5 max-w-[26rem] text-2xl font-bold leading-tight tracking-[-0.02em]">
                  Three steps, applied with <span className="marker">suspicious consistency.</span>
                </h2>
              </header>
            )}
            <p data-reveal className="reveal label text-accent">{step}</p>
            <Lines as="h3" lines={title} className="display-lg mt-5" delay={60} />
            <p className="reveal lead mt-8 max-w-[30rem] text-muted" style={{ '--delay': '200ms' }}>
              {body}
            </p>
            <p className="reveal mt-8 max-w-[26rem] text-sm italic text-muted" style={{ '--delay': '320ms' }}>
              {note}
            </p>
          </div>
        </div>
      </article>
    ))}
  </section>
)

export default Process
