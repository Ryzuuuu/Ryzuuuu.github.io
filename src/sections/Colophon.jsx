import { useEffect, useState } from 'react'
import { chapters, profile } from '../constants'

const SITE_SOURCE = `${profile.github}/${profile.githubUser}.github.io`
const MODEL = 'https://sketchfab.com/3d-models/lumen-vgs-pack-f1c6f36076154777809b30a2e1c50ba3'
const LICENCE = 'https://creativecommons.org/licenses/by/4.0/'

const istNow = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' })

const LocalTime = () => {
  const [time, setTime] = useState(istNow)
  useEffect(() => {
    const id = setInterval(() => setTime(istNow()), 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="tabular-nums">{time} IST</span>
}

const Column = ({ title, children }) => (
  <div>
    <h2 className="label text-muted">{title}</h2>
    <div className="meta mt-3">{children}</div>
  </div>
)

const FootLink = ({ href, external, children }) => (
  <li>
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="group inline-flex items-center gap-1.5 py-[3px] text-ink"
    >
      <span className="transition-transform duration-500 ease-[var(--ease)] group-hover:translate-x-1">{children}</span>
      {external && (
        <span aria-hidden="true" className="text-muted transition-transform duration-500 ease-[var(--ease)] group-hover:-translate-y-0.5 group-hover:translate-x-1.5">↗</span>
      )}
    </a>
  </li>
)

// The last screen belongs to the console: it stands in the middle, slowly turning, with the
// antenna broadcasting, and the footer's contents sit on either side of it. Only the copy takes
// pointer events, so the console can still be dragged.
const Colophon = () => (
  <footer
    data-chapter="end"
    data-tone="dark"
    data-shot="colophon"
    className="pointer-events-none relative z-10 flex min-h-[60svh] flex-col lg:min-h-[100svh]"
  >
    <div className="container-x flex flex-1 flex-col gap-10 pt-10 lg:flex-row lg:items-center lg:justify-between lg:pt-14">
      <div className="reveal pointer-events-auto lg:w-[20.5vw]">
        <h2 className="display-md">That’s the tape.</h2>
        <p className="meta mt-4 text-muted">
          Thanks for watching to the end. If something here is useful to you, or broken, I’d like to know.
        </p>
        <a
          href={`mailto:${profile.email}`}
          className="link mt-5 inline-block font-display text-[clamp(1.0625rem,1.42vw,1.75rem)] font-semibold tracking-[-0.025em]"
        >
          {profile.email}
        </a>
      </div>

      <div className="reveal pointer-events-auto grid grid-cols-2 gap-x-6 gap-y-7 lg:w-[15vw] lg:grid-cols-1" style={{ '--delay': '120ms' }}>
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
        <div className="col-span-2 lg:col-span-1">
          <Column title="Console model">
            <p className="text-muted">
              <a href={MODEL} target="_blank" rel="noreferrer" className="link text-ink">Lumen VGS Pack by dark_igorek</a>,{' '}
              <a href={LICENCE} target="_blank" rel="noreferrer" className="link text-ink">CC BY 4.0</a>, recoloured
            </p>
          </Column>
        </div>
      </div>
    </div>

    {/* Not a reveal: this row sits below the point on screen where reveals trigger. */}
    <div className="container-x">
      <div className="meta pointer-events-auto mt-9 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-line py-4 text-muted lg:mt-0">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span className="hidden lg:inline">Drag the console to turn it</span>
        <LocalTime />
        <a href="#home" className="group inline-flex items-center gap-2 text-ink">
          Back to top
          <span aria-hidden="true" className="transition-transform duration-500 ease-[var(--ease)] group-hover:-translate-y-1">↑</span>
        </a>
      </div>
    </div>
  </footer>
)

export default Colophon
