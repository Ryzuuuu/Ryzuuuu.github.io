// Sits where the exhibit will appear. `progress` is undefined while the 3D chunk itself loads.
const ExhibitLoader = ({ progress, done = false }) => (
  <div
    aria-hidden="true"
    className={`pointer-events-none fixed z-[2] w-56 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 ${
      done ? 'opacity-0' : 'opacity-100'
    }`}
    style={{ left: 'calc(var(--fx) * 100%)', top: 'calc(var(--fy) * 100%)' }}
  >
    <p className="font-display text-6xl font-extrabold tracking-[-0.05em] text-ink">
      {progress === undefined ? '…' : `${Math.round(progress)}%`}
    </p>
    <div className="mt-3 h-[3px] bg-ink/15">
      <div
        className="h-full origin-left bg-ink transition-transform duration-300"
        style={{ transform: `scaleX(${(progress ?? 3) / 100})` }}
      />
    </div>
    <p className="label mt-3 text-muted">Unpacking the console</p>
  </div>
)

export default ExhibitLoader
