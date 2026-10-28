import SectionHeading from '../components/SectionHeading'
import { profile, projects, sideQuests } from '../constants'

const pad = (n) => String(n).padStart(2, '0')

// Each work is its own scroll anchor: the monitor loads its title card, the cartridge reseats,
// and the camera steps a little further around the island.
const Entry = ({ project, index }) => {
  const { title, genre, status, blurb, tags, repo } = project
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
      <div className="container-x grid min-h-[92vh] items-center py-20 pt-[50svh] lg:grid-cols-12 lg:py-20">
        <div className="panel reveal lg:col-span-6 xl:col-span-5">
          <p className="smallcaps flex items-center gap-4 text-stone">
            <span className="numeral text-2xl">No. {pad(index + 1)}</span>
            <span aria-hidden="true" className="rule h-px flex-1 bg-hairline" />
            {genre}
          </p>
          <h3 id={`work-${index + 1}-title`} className="mt-7 text-[clamp(2.8rem,5vw,4.6rem)] leading-none">
            {title}
          </h3>
          <p className={`smallcaps mt-5 flex items-center gap-2.5 ${live ? 'text-claret-light' : 'text-stone'}`}>
            {live && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-claret-light" />}
            {status}
          </p>
          <p className="prose-body mt-6">{blurb}</p>
          <ul className="mt-7 flex flex-wrap gap-x-2 gap-y-2" aria-label="Built with">
            {tags.map((t) => (
              <li key={t} className="smallcaps border border-hairline px-3 py-1.5 text-[10px] text-parchment">
                {t}
              </li>
            ))}
          </ul>
          <a href={repo} target="_blank" rel="noreferrer" className="link-gold mt-9">
            View the repository <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </article>
  )
}

const Work = () => (
  <section id="work" data-chapter="work" aria-labelledby="work-heading" className="relative">
    <div data-shot="work" data-param="-1" data-screen="work">
      <div className="container-x grid min-h-[110vh] items-center pb-16 pt-[52svh] lg:grid-cols-12 lg:py-32">
        <div className="panel lg:col-span-6 xl:col-span-5">
          <SectionHeading
            numeral="III"
            eyebrow={<span id="work-heading">Selected work</span>}
            title={
              <>
                Things I’ve <em>built.</em>
              </>
            }
            intro="Most of these started as a “what if…?” and turned into a repository. Each one loads on the monitor as you reach it."
          />
          <ol className="reveal border-t border-hairline" style={{ '--delay': '120ms' }}>
            {projects.map(({ title, genre }, i) => (
              <li key={title}>
                <a
                  href={`#work-${i + 1}`}
                  className="group flex items-baseline gap-5 border-b border-hairline py-3.5 transition-colors hover:border-gold/50"
                >
                  <span className="numeral w-8 shrink-0 text-base">{pad(i + 1)}</span>
                  <span className="flex-1 font-display text-2xl text-ivory transition-colors group-hover:text-gold-light">
                    {title}
                  </span>
                  <span className="smallcaps hidden text-[10px] text-stone sm:block">{genre}</span>
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

    <div data-shot="archive" data-screen="archive">
      <div className="container-x grid min-h-[115vh] items-center pb-24 pt-[52svh] lg:grid-cols-12 lg:py-32">
        <div className="panel lg:col-span-6 xl:col-span-5">
          <header className="reveal">
            <p className="eyebrow">
              <span className="numeral">III b</span>
              <span aria-hidden="true" className="rule h-px w-12 bg-gold/60" />
              The archive
            </p>
            <h3 className="mt-6 text-[clamp(2.3rem,4vw,3.4rem)] leading-[1.05]">
              Side projects, <em>kept within reach.</em>
            </h3>
            <p className="prose-body mt-5">Hackathons, assignments and open-source detours.</p>
          </header>
          <ul className="reveal mt-10 border-t border-hairline" style={{ '--delay': '120ms' }}>
            {sideQuests.map(({ title, note, repo }) => (
              <li key={title}>
                <a
                  href={repo}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-6 border-b border-hairline py-5 transition-colors hover:border-gold/50"
                >
                  <span>
                    <span className="block font-display text-[1.7rem] leading-tight text-ivory transition-colors group-hover:text-gold-light">
                      {title}
                    </span>
                    <span className="mt-1 block text-sm text-stone">{note}</span>
                  </span>
                  <span aria-hidden="true" className="text-gold transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a href={profile.github} target="_blank" rel="noreferrer" className="link-gold reveal mt-10">
            Everything else on GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </div>
  </section>
)

export default Work
