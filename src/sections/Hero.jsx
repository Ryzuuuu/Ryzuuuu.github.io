import Lines from '../components/Lines'
import { intro, profile } from '../constants'
import { timeAgo, useLastPush } from '../hooks/useLastPush'

const LastPush = () => {
  const push = useLastPush()
  if (!push) return null
  return (
    <div className="swap-in">
      <dt className="label text-muted">Last commit</dt>
      <dd className="mt-1.5">
        <a href={`${profile.github}/${push.repo}`} target="_blank" rel="noreferrer" className="link">
          {push.repo}
        </a>
        <span className="text-muted">, {timeAgo(push.date)}</span>
      </dd>
    </div>
  )
}

const Hero = () => (
  <section id="home" data-chapter="home" data-tone="light" data-shot="hero" className="relative flex min-h-[100svh] flex-col justify-center">
    <div className="container-x pt-[52svh] lg:pb-10 lg:pt-20">
      {/* One column, kept left of the plinth: that side stays clear at every aspect ratio. */}
      <div className="panel lg:max-w-[41%]">
        <p lang="bn" className="reveal font-bengali text-[1.125rem] text-muted">
          {profile.bengali}
        </p>
        <Lines as="h1" lines={profile.name.split(' ')} className="display-xl mt-3" delay={80} />
        <p className="reveal lead mt-7 max-w-[34rem]" style={{ '--delay': '320ms' }}>
          {intro.statement}
        </p>
        <div className="reveal mt-8 flex flex-wrap gap-3" style={{ '--delay': '420ms' }}>
          <a href="#work" className="btn-solid">See the work</a>
          <a href="#contact" className="btn-ghost">Contact</a>
        </div>
        <dl className="reveal meta mt-9 grid grid-cols-2 gap-x-6 gap-y-4 border-t-2 border-ink pt-5 xs:grid-cols-3" style={{ '--delay': '520ms' }}>
          {intro.now.map(([where, what]) => (
            <div key={where}>
              <dt className="label text-muted">{where}</dt>
              <dd className="mt-1.5">{what}</dd>
            </div>
          ))}
          <LastPush />
        </dl>
      </div>
    </div>
  </section>
)

export default Hero
