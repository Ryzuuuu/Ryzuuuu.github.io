// Sits where the console will appear. `progress` is undefined while the 3D chunk itself loads.
const ExhibitLoader = ({ progress, done = false }) => (
  <div
    aria-hidden="true"
    className={`pointer-events-none fixed z-[16] w-40 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000 ${
      done ? 'opacity-0' : 'opacity-100'
    }`}
    style={{ left: 'calc(var(--fx) * 100%)', top: 'calc(var(--fy) * 100%)' }}
  >
    <div className="h-px bg-line">
      <div
        className="h-full origin-left bg-ink transition-transform duration-500"
        style={{ transform: `scaleX(${(progress ?? 3) / 100})` }}
      />
    </div>
    <p className="label mt-2 flex justify-between text-muted">
      <span>console.glb</span>
      <span>{progress === undefined ? '' : Math.round(progress)}</span>
    </p>
  </div>
)

export default ExhibitLoader
