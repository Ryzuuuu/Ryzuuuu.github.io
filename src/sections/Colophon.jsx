import { chapters, profile } from '../constants'

const SITE_SOURCE = `${profile.github}/${profile.githubUser}.github.io`

const Column = ({ title, children }) => (
  <div>
    <h2 className="t-meta text-muted">{title}</h2>
    <div className="t-small mt-3">{children}</div>
  </div>
)

const FootLink = ({ href, external, children }) => (
  <li>
    <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} className="group inline-flex items-center gap-1.5 py-[3px]">
      <span className="link-in">{children}</span>
      {external && <span aria-hidden="true" className="arrow arrow-ne text-muted">↗</span>}
    </a>
  </li>
)

// The last screen belongs to the console: it stands in the middle on a slow turntable, the
// antenna broadcasting, and the footer sits on either side of it. Only the copy takes the
// pointer, so the console can still be dragged.
const Colophon = () => (
  <footer
    data-chapter="end"
    data-tone="dark"
    data-shot="colophon"
    className="pointer-events-none relative z-10 flex min-h-[60svh] flex-col lg:min-h-[100svh]"
  >
    <div className="wrap flex flex-1 flex-col gap-10 pt-10 lg:flex-row lg:items-center lg:justify-between lg:pt-16">
      <div className="reveal panel lg:w-[22vw]">
        <h2 className="t-h2">
          That’s <em>all,</em> for now.
        </h2>
        <p className="t-small mt-5 text-muted">
          Thanks for reading to the end. If something here is useful to you, or broken, I’d like to know.
        </p>
        <a href={`mailto:${profile.email}`} className="link t-h4 mt-6 inline-block text-[clamp(1.0625rem,1.35vw,1.5rem)]">
          {profile.email}
        </a>
      </div>

      <div className="reveal panel grid grid-cols-2 gap-x-6 gap-y-8 lg:w-[15vw] lg:grid-cols-1" style={{ '--delay': '120ms' }}>
        <Column title="Chapters">
          <ul>
            {chapters.map(({ id, label }) => <FootLink key={id} href={`#${id}`}>{label}</FootLink>)}
          </ul>
        </Column>
        <Column title="Elsewhere">
          <ul>
            <FootLink href={profile.github} external>GitHub</FootLink>
            <FootLink href={SITE_SOURCE} external>Source</FootLink>
          </ul>
        </Column>
      </div>
    </div>

    <div className="wrap">
      <div className="t-meta panel mt-9 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-line py-4 text-muted lg:mt-0">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span className="hidden lg:inline">Drag the console to turn it</span>
        <span className="hidden md:inline">Set in Newsreader &amp; Geist</span>
        <a href="#home" className="group inline-flex items-center gap-2 text-ink">
          Back to top <span aria-hidden="true" className="arrow transition-transform group-hover:-translate-y-0.5">↑</span>
        </a>
      </div>
    </div>
  </footer>
)

export default Colophon
