// Sits where the exhibit will appear. `progress` is undefined while the 3D chunk itself loads.
const ExhibitLoader = ({ progress, done = false }) => (
  <div
    aria-hidden="true"
    className={`pointer-events-none fixed z-[2] w-52 -translate-x-1/2 -translate-y-1/2 text-center transition-opacity duration-700 ${
      done ? 'opacity-0' : 'opacity-100'
    }`}
    style={{ left: 'calc(var(--fx) * 100%)', top: 'calc(var(--fy) * 100%)' }}
  >
    <p className="smallcaps text-gold">Preparing the exhibit</p>
    <div className="mt-4 h-px bg-hairline">
      <div
        className="h-px origin-left bg-gold transition-transform duration-300"
        style={{ transform: `scaleX(${(progress ?? 4) / 100})` }}
      />
    </div>
    <p className="mt-3 font-display text-2xl italic text-gold-light">{progress === undefined ? '·' : `${Math.round(progress)}%`}</p>
  </div>
)

export default ExhibitLoader
