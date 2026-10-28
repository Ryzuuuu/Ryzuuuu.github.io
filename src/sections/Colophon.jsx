import Lines from '../components/Lines'
import { chapters, profile } from '../constants'

// The page ends on a bird's-eye view of the whole island, with the credits beneath it.
const Colophon = () => (
  <footer
    data-chapter="end"
    data-tone="dark"
    data-shot="colophon"
    className="pointer-events-none relative z-10 flex min-h-[110svh] flex-col justify-end"
  >
    <div className="pointer-events-auto bg-gradient-to-t from-surface via-surface/95 to-transparent pb-10 pt-40">
      <div className="container-x">
        <Lines
          as="p"
          lines={['Thanks for scrolling', 'all the way down.']}
          className="display-xl"
        />
        <p className="reveal lead mt-8 max-w-[36rem] text-muted" style={{ '--delay': '200ms' }}>
          Most people don’t. If you did, you probably have something in mind, and my inbox is{' '}
          <a href="#contact" className="link">right back up there</a>.
        </p>

        <div className="mt-20 grid gap-8 border-t-2 border-ink pt-8 text-sm text-muted md:grid-cols-[1fr_auto_auto] md:items-start md:gap-14">
          <p className="max-w-[28rem]">
            © {new Date().getFullYear()} {profile.name}. Built with React Three Fiber, one compressed GLB and an
            unreasonable amount of camera tweaking. Console model:{' '}
            <a
              href="https://sketchfab.com/3d-models/lumen-vgs-pack-f1c6f36076154777809b30a2e1c50ba3"
              target="_blank"
              rel="noreferrer"
              className="link"
            >
              Lumen VGS Pack by dark_igorek
            </a>
            .
          </p>
          <nav aria-label="Chapters">
            <ul className="label space-y-2.5">
              {chapters.map(({ id, num, label }) => (
                <li key={id}>
                  <a href={`#${id}`} className="text-ink transition-colors hover:text-accent">
                    <span className="mr-2 text-muted">{num}</span>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a href="#home" className="btn-ghost self-start">
            Back to the top ↑
          </a>
        </div>
      </div>
    </div>
  </footer>
)

export default Colophon
