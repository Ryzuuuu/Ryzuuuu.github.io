import Lines from '../components/Lines'
import Marquee from '../components/Marquee'
import SectionHeading from '../components/SectionHeading'
import { profile, projects, sideQuests } from '../constants'

const pad = (n) => String(n).padStart(2, '0')

// Each work is its own scroll anchor: the monitor loads its title card, the cartridge reseats,
// and the camera steps a little further around the island.
const Entry = ({ project, index }) => {
  const { title, quip, genre, status, blurb, tags, repo } = project
  const live = status === 'In progress'
  return (
    <article
      id={`work-${index + 1}`}
      data-shot="work"
      data-param={index}
      data-screen={`work-${index}`}
      aria-labelledby={`work-${index + 1}-title`}
      className="relative"
    >
      <div className="container-x relative grid min-h-[100vh] items-center py-20 pt-[50svh] lg:grid-cols-12 lg:py-24">
        <span
          aria-hidden="true"
          data-speed="0.3"
          className="outline-text pointer-events-none absolute -left-2 top-[12vh] select-none font-display text-[44vw] font-extrabold leading-none tracking-[-0.07em] lg:text-[21vw]"
        >
          {pad(index + 1)}
        </span>

        <div className="panel relative lg:col-span-6 xl:col-span-5">
          <p data-reveal className="reveal label flex items-center gap-3 text-muted">
            <span className="text-ink">No. {pad(index + 1)}</span>
            <span aria-hidden="true" className="rule h-[2px] flex-1 bg-line" />
            {genre}
          </p>
          <Lines as="h3" id={`work-${index + 1}-title`} lines={[title]} className="display-lg mt-7" delay={60} />
          <p className="reveal mt-4 text-[clamp(1.25rem,1.8vw,1.6rem)] font-medium italic leading-snug text-accent" style={{ '--delay': '160ms' }}>
            {quip}
          </p>
          <p className="reveal lead mt-6 text-muted" style={{ '--delay': '220ms' }}>
            {blurb}
          </p>
          <div className="reveal mt-7 flex flex-wrap items-center gap-2" style={{ '--delay': '300ms' }}>
            <span className={`label mr-2 flex items-center gap-2 ${live ? 'text-ink' : 'text-muted'}`}>
              <span aria-hidden="true" className={`h-2 w-2 rounded-full ${live ? 'animate-pulse bg-pop' : 'bg-line'}`} />
              {live ? 'In progress' : 'Shipped'}
            </span>
            <ul className="flex flex-wrap gap-2" aria-label="Built with">
              {tags.map((t) => (
                <li key={t} className="chip">{t}</li>
              ))}
            </ul>
          </div>
          <a href={repo} target="_blank" rel="noreferrer" className="reveal link mt-9 inline-block" style={{ '--delay': '360ms' }}>
            Read the source ↗
          </a>
        </div>
      </div>
    </article>
  )
}

const Work = () => (
  <section id="work" data-chapter="work" data-tone="dark" aria-labelledby="work-heading" className="relative">
    <div data-shot="work" data-param="-1" data-screen="work" className="relative">
      <Marquee
        items={['selected work', 'things that shipped', 'and some that are shipping']}
        speed={-55}
        className="pointer-events-none border-b-2 border-ink pb-6 pt-28"
        itemClassName="outline-text font-display text-[clamp(4rem,12vw,11rem)] font-extrabold leading-none tracking-[-0.06em] [-webkit-text-stroke-color:var(--ink)]"
      />
      <div className="container-x grid min-h-[100vh] items-center pb-16 pt-[40svh] lg:grid-cols-12 lg:py-28">
        <div className="panel lg:col-span-6 xl:col-span-5">
          <SectionHeading
            num="03"
            kicker={<span id="work-heading">Work</span>}
            lines={['Things I’ve', 'built.']}
            intro="Six things that began as “wait, could I…?” and ended as a repo. Scroll slowly; each one gets loaded into the console."
          />
          <ol className="reveal border-t-2 border-ink" style={{ '--delay': '120ms' }}>
            {projects.map(({ title, genre }, i) => (
              <li key={title}>
                <a
                  href={`#work-${i + 1}`}
                  className="group flex items-baseline gap-5 border-b-2 border-line py-3.5 transition-colors hover:border-ink"
                >
                  <span className="label w-7 shrink-0 text-muted">{pad(i + 1)}</span>
                  <span className="flex-1 font-display text-[1.7rem] font-extrabold leading-none tracking-[-0.04em] transition-transform duration-300 group-hover:translate-x-2">
                    {title}
                  </span>
                  <span className="label hidden text-muted sm:block">{genre}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>

    {projects.map((p, i) => (
      <Entry key={p.title} project={p} index={i} />
    ))}

    <div data-shot="archive" data-screen="archive" className="relative">
      <div className="container-x grid min-h-[120vh] items-center pb-24 pt-[52svh] lg:grid-cols-12 lg:py-32">
        <div className="panel lg:col-span-6 xl:col-span-5">
          <header className="mb-10">
            <p data-reveal className="reveal label flex items-center gap-4 text-muted">
              <span className="text-ink">03b</span>
              <span aria-hidden="true" className="rule h-[2px] w-14 bg-ink" />
              The B-sides
            </p>
            <Lines as="h3" lines={['Left lying', 'around.']} className="display-lg mt-7" delay={80} />
            <p className="reveal lead mt-7 text-muted" style={{ '--delay': '220ms' }}>
              Hackathons, assignments and detours that refused to stay small.
            </p>
          </header>
          <ul className="reveal border-t-2 border-ink" style={{ '--delay': '120ms' }}>
            {sideQuests.map(({ title, note, repo }) => (
              <li key={title}>
                <a
                  href={repo}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-6 border-b-2 border-line py-5 transition-colors hover:border-ink"
                >
                  <span>
                    <span className="block font-display text-[1.7rem] font-extrabold leading-none tracking-[-0.04em]">{title}</span>
                    <span className="mt-2 block text-[0.95rem] text-muted">{note}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-display text-2xl font-extrabold transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                  >
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a href={profile.github} target="_blank" rel="noreferrer" className="reveal link mt-10 inline-block">
            The rest of the attic, on GitHub ↗
          </a>
        </div>
      </div>
    </div>
  </section>
)

export default Work
