import Marquee from './Marquee'

// A slightly crooked strip of ticker tape across the page. It drifts on its own and
// speeds up, or reverses, with your scroll.
const Tape = ({ items, speed = 60, tilt = -2.5, inverted = true }) => (
  <div aria-hidden="true" className="pointer-events-none relative z-10 -mx-4 py-10">
    <div
      className={`border-y-2 border-ink py-3 ${inverted ? 'bg-ink text-surface' : 'bg-surface text-ink'}`}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <Marquee
        items={items}
        speed={speed}
        itemClassName="font-display text-[clamp(2rem,5vw,4.5rem)] font-extrabold leading-none tracking-[-0.045em]"
      />
    </div>
  </div>
)

export default Tape
