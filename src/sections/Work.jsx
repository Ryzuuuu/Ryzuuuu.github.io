import Lines from '../components/Lines'
import SectionHeading from '../components/SectionHeading'
import { profile, projects, sideProjects } from '../constants'

// Each project is its own scroll anchor: the monitor starts its instrument, the cartridge
// reseats, and the camera steps a little further around the island.
const Entry = ({ project, index }) => {
  const { title, field, status, summary, body, figure, stack, repo } = project
  return (
    <article
      id={`work-${index + 1}`}
      data-shot="work"
      data-param={index}
      data-screen={`work-${index}`}
      aria-labelledby={`work-${index + 1}-title`}
      className="relative"
    >
      <div className="container-x relative grid min-h-[70vh] lg:min-h-[100vh] items-center py-20 lg:grid-cols-12 lg:py-24">
        <div className="panel relative lg:col-span-5">
          <p data-reveal className="reveal label flex justify-between gap-4 text-muted">
            <span>{field}</span>
            <span>{status}</span>
          </p>
          <div data-reveal className="mt-3 hairline rule" />
          <Lines as="h3" id={`work-${index + 1}-title`} lines={[title]} className="display-lg mt-6" delay={60} />
          <p className="reveal summary mt-4" style={{ '--delay': '160ms' }}>
            {summary}
          </p>
          <p className="reveal lead mt-5 text-muted" style={{ '--delay': '240ms' }}>
            {body}
          </p>
          <div className="reveal mt-7 grid grid-cols-[auto_1fr] items-center gap-5" style={{ '--delay': '320ms' }}>
            <p className="font-display text-[clamp(2.6rem,3.6vw,3.75rem)] font-bold leading-none tracking-[-0.03em] text-accent">{figure.value}</p>
            <p className="meta max-w-[15rem] text-muted">{figure.note}</p>
          </div>
          <div className="reveal meta mt-7 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2" style={{ '--delay': '400ms' }}>
            <span className="text-muted">{stack}</span>
            <a href={repo} target="_blank" rel="noreferrer" className="link">Source</a>
          </div>
        </div>
      </div>
    </article>
  )
}

const Work = () => (
  <section id="work" data-chapter="work" data-tone="dark" aria-labelledby="work-heading" className="relative">
    <div data-shot="work" data-param="-1" data-screen="work" className="relative">
      <div className="container-x grid min-h-[70vh] lg:min-h-[110vh] items-center pb-16 lg:grid-cols-12 lg:py-28">
        <div className="panel lg:col-span-5">
          <SectionHeading
            kicker={<span id="work-heading">Work</span>}
            lines={['Seven things', 'I’ve built.']}
            intro="Each one loads into the console as you scroll, with a small version of it running on the monitor. Some are finished. Some are still arguing with me."
          />
          <ol className="reveal" style={{ '--delay': '160ms' }}>
            {projects.map(({ title, field }, i) => (
              <li key={title}>
                <a
                  href={`#work-${i + 1}`}
                  className="group hairline flex items-baseline justify-between gap-5 py-2.5"
                >
                  <span className="font-display text-[1.5rem] font-bold leading-tight tracking-[-0.012em] transition-transform duration-700 ease-[var(--ease)] group-hover:translate-x-2">
                    {title}
                  </span>
                  <span className="meta text-muted">{field}</span>
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
      <div className="container-x grid min-h-[70vh] lg:min-h-[120vh] items-center pb-24 lg:grid-cols-12 lg:py-32">
        <div className="panel lg:col-span-5">
          <header className="mb-10">
            <p data-reveal className="reveal label text-muted">Also</p>
            <Lines as="h3" lines={['Smaller things.']} className="display-lg mt-5" delay={80} />
          </header>
          <ul className="reveal" style={{ '--delay': '120ms' }}>
            {sideProjects.map(({ title, note, repo }) => (
              <li key={title}>
                <a
                  href={repo}
                  target="_blank"
                  rel="noreferrer"
                 
                  className="hairline grid grid-cols-[8rem_1fr] items-baseline gap-4 py-3"
                >
                  <span className="font-display text-[1.25rem] font-bold leading-tight tracking-[-0.01em]">{title}</span>
                  <span className="meta text-muted">{note}</span>
                </a>
              </li>
            ))}
          </ul>
          <a href={profile.github} target="_blank" rel="noreferrer" className="reveal link meta mt-8 inline-block">
            Everything else is on GitHub
          </a>
        </div>
      </div>
    </div>
  </section>
)

export default Work
