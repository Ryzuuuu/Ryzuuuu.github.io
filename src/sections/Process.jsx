import Lines from '../components/Lines'
import { process } from '../constants'

// How a project goes, acted out by the model: each step is its own scroll anchor, the console
// swaps from wireframe to clay to finished as you reach it, and the camera keeps orbiting.
const Process = () => (
  <section id="process" data-chapter="home" data-tone="dark" aria-labelledby="process-title" className="relative">
    {process.map(({ title, body }, i) => (
      <article key={i} data-shot="process" data-param={i} data-screen={`process-${i}`} className="relative">
        <div className="container-x relative grid min-h-[70vh] lg:min-h-[125vh] content-center py-24 lg:grid-cols-12 lg:py-32">
          <div className="panel relative lg:col-span-5">
            {i === 0 && (
              <h2 id="process-title" data-reveal className="reveal label mb-5 text-muted">
                How a project goes
              </h2>
            )}
            <Lines as="h3" lines={title} className="display-lg" delay={60} />
            <p className="reveal lead mt-7 max-w-[29rem] text-muted" style={{ '--delay': '200ms' }}>
              {body}
            </p>
          </div>
        </div>
      </article>
    ))}
  </section>
)

export default Process
