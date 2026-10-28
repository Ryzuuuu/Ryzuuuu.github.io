import SectionHeading from '../components/SectionHeading'
import { profile, projects, sideQuests } from '../constants'

const accents = ['green', 'blue', 'pink']

const Cartridge = ({ project, index }) => {
  const { title, genre, status, blurb, tags, repo } = project
  const live = status === 'In progress'
  return (
    <article
      data-accent={accents[index % accents.length]}
      className="reveal cartridge card group relative flex flex-col overflow-hidden p-5 sm:p-6"
      style={{ '--delay': `${(index % 3) * 80}ms` }}
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: 'var(--accent)' }} />
      <div className="mb-4 flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-wider sm:mb-5">
        <span className="text-dim">
          #{String(index + 1).padStart(2, '0')} · {genre}
        </span>
        <span className={`flex shrink-0 items-center gap-1.5 ${live ? 'text-accent' : 'text-dim'}`}>
          {live && <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: 'var(--accent)' }} />}
          {status}
        </span>
      </div>
      <h3 className="font-display text-2xl font-semibold tracking-tight">
        <a href={repo} target="_blank" rel="noreferrer" className="after:absolute after:inset-0 focus-visible:outline-none">
          {title}
          <span aria-hidden="true" className="ml-2 text-base text-accent sm:hidden">↗</span>
        </a>
      </h3>
      <p className="mt-3 flex-1 leading-relaxed text-muted">{blurb}</p>
      <ul className="mt-5 flex flex-wrap gap-2 sm:mt-6">
        {tags.map((t) => (
          <li key={t} className="chip">{t}</li>
        ))}
      </ul>
      <span className="mt-6 hidden font-mono text-xs uppercase tracking-wider text-accent transition-transform group-hover:translate-x-1 sm:block">
        View source ↗
      </span>
    </article>
  )
}

const Projects = () => (
  <section id="projects" data-accent="blue" className="relative py-20 sm:py-28">
    <div className="container-x">
      <SectionHeading
        index="02"
        eyebrow="Cartridge library"
        title="Things I’ve built."
        intro="Most of these started as a “what if…?” and turned into a repo. Pick a cartridge."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <Cartridge key={p.title} project={p} index={i} />
        ))}
      </div>

      <div className="reveal mt-16 grid gap-10 border-t border-line pt-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h3 className="font-display text-xl font-semibold">Side quests</h3>
          <p className="mt-2 text-muted">Hackathons, assignments and open-source detours.</p>
        </div>
        <ul className="grid gap-x-8 sm:grid-cols-2 lg:col-span-8">
          {sideQuests.map(({ title, note, repo }) => (
            <li key={title}>
              <a
                href={repo}
                target="_blank"
                rel="noreferrer"
                className="group flex items-baseline justify-between gap-4 border-b border-line py-4 transition-colors hover:border-white/25"
              >
                <span>
                  <span className="font-medium text-fg">{title}</span>
                  <span className="mt-0.5 block text-sm text-dim">{note}</span>
                </span>
                <span aria-hidden="true" className="text-dim transition-colors group-hover:text-accent">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="reveal mt-12 flex justify-center">
        <a href={profile.github} target="_blank" rel="noreferrer" className="btn-ghost">
          Everything else on GitHub ↗
        </a>
      </div>
    </div>
  </section>
)

export default Projects
