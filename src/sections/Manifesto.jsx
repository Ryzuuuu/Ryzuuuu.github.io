// An interlude with nothing to do but look: the camera circles the island once as you scroll through.
const Manifesto = () => (
  <section
    id="manifesto"
    aria-label="Philosophy"
    data-chapter="home"
    data-shot="manifesto"
    className="relative"
  >
    <div className="container-x flex min-h-[220vh] flex-col justify-between py-[22vh]">
      <p className="reveal text-halo pointer-events-auto font-display text-[clamp(4.2rem,12vw,11rem)] font-normal italic leading-none text-ivory">
        Ship it.
      </p>
      <div className="reveal pointer-events-auto max-w-[44rem] self-end text-right">
        <p className="text-halo font-display text-[clamp(2.6rem,6vw,5.6rem)] italic leading-[1.02] text-gold-light">
          Then make it beautiful.
        </p>
        <p className="prose-body text-halo ml-auto mt-7 max-w-[30rem]">
          That’s the whole philosophy. I learn by building, usually something that has to survive the messy real world:
          shaky webcam feeds, noisy audio, sensors wired to a Raspberry Pi.
        </p>
      </div>
    </div>
  </section>
)

export default Manifesto
