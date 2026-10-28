import { profile } from '../constants'

const Footer = () => (
  <footer className="border-t border-line py-10">
    <div className="container-x flex flex-col gap-4 font-mono text-xs text-dim sm:flex-row sm:items-center sm:justify-between">
      <p>
        © {new Date().getFullYear()} {profile.name} · Built with React Three Fiber
      </p>
      <p>
        3D model:{' '}
        <a
          href="https://sketchfab.com/3d-models/lumen-vgs-pack-f1c6f36076154777809b30a2e1c50ba3"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-dim/50 underline-offset-4 hover:text-fg"
        >
          Lumen VGS Pack by dark_igorek
        </a>
      </p>
      <a href="#home" className="hover:text-fg">
        Back to top ↑
      </a>
    </div>
  </footer>
)

export default Footer
