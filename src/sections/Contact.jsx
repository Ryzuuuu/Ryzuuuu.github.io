import { useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import { profile } from '../constants'

const Contact = () => {
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)

  // No backend on GitHub Pages: hand the message to the visitor's mail app.
  const onSubmit = (e) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = data.get('name').trim()
    const subject = `Hello from ${name}`
    const body = `${data.get('message').trim()}\n\n${name} (${data.get('email').trim()})`
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  return (
    <section id="contact" data-chapter="contact" data-tone="light" data-shot="contact" className="relative">
      <div className="container-x grid min-h-[135vh] items-center pb-24 pt-[52svh] lg:grid-cols-12 lg:py-32">
        <div className="panel lg:col-span-6 lg:col-start-7">
          <SectionHeading
            num="04"
            kicker="Contact"
            lines={['Let’s build', 'something that', 'survives the demo.']}
            intro="Internship, collaboration, hackathon team, or a half-formed idea that needs a second brain: send it over. I read everything, even the ones that start with “quick question”."
          />

          <div className="reveal grid border-y-2 border-ink sm:grid-cols-2" style={{ '--delay': '80ms' }}>
            <button
              type="button"
              onClick={copyEmail}
              className="group flex items-center justify-between gap-4 border-b-2 border-ink py-5 text-left sm:border-b-0 sm:border-r-2 sm:pr-6"
            >
              <span className="min-w-0">
                <span className="label block text-muted">Email</span>
                <span className="mt-1.5 block truncate text-lg font-medium">{profile.email}</span>
              </span>
              <span className="label shrink-0 text-accent" aria-live="polite">
                {copied ? 'Copied ✓' : 'Copy'}
              </span>
            </button>
            <a href={profile.github} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-4 py-5 sm:pl-6">
              <span>
                <span className="label block text-muted">GitHub</span>
                <span className="mt-1.5 block text-lg font-medium">{profile.github.replace('https://', '')}</span>
              </span>
              <span aria-hidden="true" className="font-display text-2xl font-extrabold transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">↗</span>
            </a>
          </div>

          <form onSubmit={onSubmit} className="reveal mt-12 space-y-8" style={{ '--delay': '160ms' }}>
            <div className="grid gap-8 sm:grid-cols-2">
              <label className="block">
                <span className="label block text-muted">What do I call you?</span>
                <input name="name" required autoComplete="name" placeholder="Ada Lovelace" className="field" />
              </label>
              <label className="block">
                <span className="label block text-muted">Where do I reply?</span>
                <input name="email" type="email" required autoComplete="email" placeholder="ada@engine.dev" className="field" />
              </label>
            </div>
            <label className="block">
              <span className="label block text-muted">What’s the idea?</span>
              <textarea name="message" required rows={4} placeholder="So, I had this idea…" className="field resize-y" />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-5">
              <p className="max-w-[17rem] text-sm italic text-muted" aria-live="polite">
                {sent ? 'Your mail app should be open now. Hit send, I’ll take it from there.' : 'Opens your mail app with everything filled in. There’s no server, so nothing gets lost in one.'}
              </p>
              <button type="submit" className="btn-solid">
                Send it <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Contact
