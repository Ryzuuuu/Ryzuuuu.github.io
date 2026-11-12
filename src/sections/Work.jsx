import Lines from '../components/Lines'
import Plate from '../components/Plate'
import { profile, projects, sideProjects } from '../constants'

const pad = (n) => String(n).padStart(2, '0')
const total = pad(projects.length)

// Each project is its own scroll anchor: the monitor starts its instrument, the cartridge
// reseats, and the camera steps a little further around the island. Below the desktop layout the
// monitor is too small to read, so the same instrument is drawn on a plate under the copy.
const Entry = ({ project, index }) => {
  const { title, field, status, summary, body, figure, stack, instrument, repo } = project
  const n = index + 1
  return (
    <article
      id={`work-${n}`}
      data-shot="work"
      data-param={index}
      data-screen={`work-${index}`}
      aria-labelledby={`work-${n}-title`}
      className="relative"
    >
      <div className="wrap grid min-h-[70vh] items-center py-20 lg:min-h-[100vh] lg:grid-cols-12 lg:py-24">
        <div className="panel lg:col-span-5">
          <div data-reveal className="draw h-px bg-ink" />
          <p data-reveal className="reveal t-meta mt-3 flex justify-between gap-4 text-muted">
            <span className="t-num text-ink">{pad(n)} <span className="text-muted">/ {total}</span></span>
            <span>{field}</span>
            <span>{status}</span>
          </p>
          <Lines as="h3" id={`work-${n}-title`} lines={[title]} className="t-h3 mt-8" delay={60} />
          <p className="reveal t-lead italic-serif mt-4" style={{ '--delay': '140ms' }}>{summary}</p>
          <p className="reveal t-body mt-5 text-muted" style={{ '--delay': '220ms' }}>{body}</p>

          <div className="reveal mt-8 flex items-baseline gap-5 border-t border-line pt-5" style={{ '--delay': '300ms' }}>
            <span className="t-h3 figure-grad shrink-0">{figure.value}</span>
            <span className="t-small max-w-[16rem] text-muted">{figure.note}</span>
          </div>

          <div className="reveal mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-t border-line pt-4" style={{ '--delay': '360ms' }}>
            <span className="t-meta text-muted">{stack}</span>
            <a href={repo} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1.5 t-small">
              <span className="link">Source</span>
              <span aria-hidden="true" className="arrow arrow-ne text-muted">↗</span>
            </a>
          </div>

          <figure className="reveal mt-8 lg:hidden">
            <Plate screen={`work-${index}`} label={`${title}: ${instrument}`} />
            <figcaption className="t-small mt-2.5 flex gap-3 text-muted">
              <span className="t-meta shrink-0 pt-[0.2em] text-ink">Fig. {n}</span>
              <span>{instrument}.</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </article>
  )
}

const Work = () => (
  <section id="work" data-chapter="work" data-tone="dark" aria-labelledby="work-heading" className="relative">
    <div data-shot="work" data-param="-1" data-screen="work" className="relative">
      <div className="wrap grid min-h-[70vh] items-center pb-16 lg:min-h-[115vh] lg:grid-cols-12 lg:py-28">
        <div className="panel lg:col-span-5">
          <p data-reveal className="reveal t-meta text-muted">Work</p>
          <Lines id="work-heading" lines={['Seven things', [{ em: 'I’ve built.' }]]} className="t-h2 mt-5" delay={60} />
          <p className="reveal t-body mt-7 max-w-[30rem] text-muted" style={{ '--delay': '160ms' }}>
            Each one loads into the console as you scroll, with a small version of it running on the monitor.
            Some are finished. Some are still arguing with me.
          </p>
          <ol className="index reveal mt-10 border-t border-ink" style={{ '--delay': '240ms' }}>
            {projects.map(({ id, title, field }, i) => (
              <li key={id}>
                <a href={`#work-${i + 1}`} className="index-row group grid grid-cols-[2rem_1fr_auto] items-baseline gap-x-3 border-b border-line py-3">
                  <span className="t-num text-xs text-muted">{pad(i + 1)}</span>
                  <span className="t-h4">{title}</span>
                  <span className="t-small text-muted">{field}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>

    {projects.map((p, i) => (
      <Entry key={p.id} project={p} index={i} />
    ))}

    <div id="archive" data-chapter="archive" data-shot="archive" data-screen="archive" className="relative">
      <div className="wrap grid min-h-[70vh] items-center pb-24 lg:min-h-[120vh] lg:grid-cols-12 lg:py-32">
        <div className="panel lg:col-span-5">
          <p data-reveal className="reveal t-meta text-muted">Also</p>
          <Lines as="h3" lines={['Smaller', [{ em: 'things.' }]]} className="t-h2 mt-5" delay={60} />
          <ul className="reveal mt-10 border-t border-ink" style={{ '--delay': '160ms' }}>
            {sideProjects.map(({ title, note, repo }) => (
              <li key={title} className="border-b border-line">
                <a href={repo} target="_blank" rel="noreferrer" className="group grid grid-cols-[7.5rem_1fr_auto] items-baseline gap-4 py-3.5 sm:grid-cols-[9rem_1fr_auto]">
                  <span className="t-h4 text-[1.3125rem]"><span className="link-in">{title}</span></span>
                  <span className="t-small text-muted">{note}</span>
                  <span aria-hidden="true" className="arrow arrow-ne text-muted">↗</span>
                </a>
              </li>
            ))}
          </ul>
          <a href={profile.github} target="_blank" rel="noreferrer" className="reveal group mt-7 inline-flex items-center gap-1.5 t-small">
            <span className="link">Everything else is on GitHub</span>
            <span aria-hidden="true" className="arrow arrow-ne text-muted">↗</span>
          </a>
        </div>
      </div>
    </div>
  </section>
)

export default Work
