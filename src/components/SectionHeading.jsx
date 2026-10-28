const SectionHeading = ({ numeral, eyebrow, title, intro }) => (
  <header className="reveal mb-10 sm:mb-12">
    <p className="eyebrow">
      <span className="numeral">{numeral}</span>
      <span aria-hidden="true" className="rule h-px w-12 bg-gold/60" />
      {eyebrow}
    </p>
    <h2 className="mt-6 text-[clamp(2.6rem,5vw,4.4rem)] leading-[1.02]">{title}</h2>
    {intro && <p className="prose-body mt-6 max-w-xl">{intro}</p>}
  </header>
)

export default SectionHeading
