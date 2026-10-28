import { chapters, profile } from '../constants'

// The page ends on a bird's-eye view of the whole island, with the credits beneath it.
const Colophon = () => (
  <footer data-chapter="end" data-shot="colophon" className="pointer-events-none relative z-10 flex min-h-[100svh] flex-col justify-end">
    <div className="pointer-events-auto bg-gradient-to-t from-ink via-ink/90 to-transparent pb-10 pt-32">
      <div className="container-x">
        <div className="flex flex-col items-center text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full border border-gold/50 font-display text-3xl italic text-gold-light">
            {profile.initials}
          </span>
          <p className="mt-6 font-display text-[clamp(2rem,4vw,3rem)] text-ivory">{profile.name}</p>
          <nav aria-label="Chapters" className="mt-6">
            <ul className="smallcaps flex flex-wrap justify-center gap-x-8 gap-y-3 text-stone">
              {chapters.map(({ id, numeral, label }) => (
                <li key={id}>
                  <a href={`#${id}`} className="transition-colors hover:text-ivory">
                    <span className="numeral mr-2 text-sm">{numeral}</span>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-hairline pt-7 text-sm text-stone md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {profile.name} · Built with React Three Fiber
          </p>
          <p>
            Exhibit:{' '}
            <a
              href="https://sketchfab.com/3d-models/lumen-vgs-pack-f1c6f36076154777809b30a2e1c50ba3"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-gold/40 underline-offset-4 transition-colors hover:text-ivory"
            >
              Lumen VGS Pack by dark_igorek
            </a>
          </p>
          <a href="#home" className="smallcaps text-gold transition-colors hover:text-gold-light">
            Return to the top ↑
          </a>
        </div>
      </div>
    </div>
  </footer>
)

export default Colophon
