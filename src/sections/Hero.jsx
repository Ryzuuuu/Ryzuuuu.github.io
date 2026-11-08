import { useEffect, useState } from 'react'
import { intro, profile } from '../constants'
import { timeAgo, useLastPush } from '../hooks/useLastPush'
import Button from '../components/Button'

const istNow = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })

const LocalTime = () => {
  const [time, setTime] = useState(istNow)
  useEffect(() => {
    const id = setInterval(() => setTime(istNow()), 15000)
    return () => clearInterval(id)
  }, [])
  return <span className="t-num">{time}</span>
}

const LastPush = () => {
  const push = useLastPush()
  if (!push) return null
  return (
    <a href={`${profile.github}/${push.repo}`} target="_blank" rel="noreferrer" className="now__commit fade-in group">
      <span className="text-muted">Pushed to</span> <span className="link-in text-ink">{push.repo}</span>
      <span className="text-muted"> · {timeAgo(push.date)}</span>
    </a>
  )
}

// What's on the desk right now: a small card with a live dot, one line per place, and the
// latest commit and the time in India along the bottom.
const Now = () => (
  <div className="now">
    <p className="now__head t-meta">
      <span className="now__dot" aria-hidden="true" /> Currently
    </p>
    <ul className="now__list">
      {intro.now.map(({ org, where, what }) => (
        <li key={org} className="now__item">
          <p className="t-meta"><span className="text-accent">{org}</span>{where && <span className="text-muted"> · {where}</span>}</p>
          <p className="now__what">{what}</p>
        </li>
      ))}
    </ul>
    <div className="now__foot t-meta">
      <LastPush />
      <span className="ml-auto whitespace-nowrap"><LocalTime /> <span className="text-muted">IST</span></span>
    </div>
  </div>
)

// The opening screen. The console stands to the right on its island; the copy keeps to the
// left, which stays clear of the plinth at every aspect ratio.
const Hero = () => (
  <section id="home" data-chapter="home" data-tone="light" data-shot="hero" className="relative flex min-h-[100svh] flex-col justify-center">
    <div className="wrap pb-16 pt-[54svh] lg:pb-10 lg:pt-28">
      <div className="panel lg:max-w-[42%]">
        <p className="reveal flex flex-wrap items-baseline gap-x-4 gap-y-1 text-muted">
          <span className="t-meta">Portfolio · B.Tech CSE, VIT Bhopal · 2027</span>
          <span lang="bn" className="font-bengali text-[0.9375rem]">{profile.bengali}</span>
        </p>
        <h1 data-reveal aria-label={profile.name} className="t-display t-display--hero mt-6 lg:mt-8" style={{ '--delay': '120ms' }}>
          <span aria-hidden="true" className="line-mask" style={{ '--i': 0 }}><span>Neelabja</span></span>
          <span aria-hidden="true" className="line-mask" style={{ '--i': 1 }}><span><em className="tracking-[-0.045em]">Mukhopadhyay</em></span></span>
        </h1>
        <p className="reveal t-lead mt-8 max-w-[30ch] lg:mt-10" style={{ '--delay': '420ms' }}>
          {intro.lede}
        </p>
        <div className="reveal mt-9 flex flex-wrap items-center gap-3" style={{ '--delay': '560ms' }}>
          <Button href="#work" dir="s">See the work</Button>
          <Button href={`mailto:${profile.email}`} ghost>Get in touch</Button>
        </div>
        <div className="reveal mt-10" style={{ '--delay': '700ms' }}>
          <Now />
        </div>
      </div>
    </div>
  </section>
)

export default Hero
