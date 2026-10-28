// A strip of text that drifts sideways on its own and speeds up (or reverses) with your scroll.
// The director moves the track; this just lays out two copies so the loop is seamless.
const Marquee = ({ items, speed = 50, className = '', itemClassName = '' }) => {
  const run = (copy) => (
    <span aria-hidden={copy > 0 || undefined} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className={`flex items-center ${itemClassName}`}>
          {item}
          <span aria-hidden="true" className="mx-[0.35em] inline-block h-[0.22em] w-[0.22em] rounded-full bg-pop" />
        </span>
      ))}
    </span>
  )
  return (
    <div data-marquee={speed} className={`marquee select-none ${className}`}>
      <div className="marquee-track">
        {run(0)}
        {run(1)}
      </div>
    </div>
  )
}

export default Marquee
