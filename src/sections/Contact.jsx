import { useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import { profile } from '../constants'

const field =
  'w-full rounded-lg border border-line bg-ink/60 px-4 py-3 text-fg placeholder:text-dim transition-colors focus:border-[color:var(--accent)] focus:outline-none'

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
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  return (
    <section id="contact" data-accent="pink" className="relative py-20 sm:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading
            index="03"
            eyebrow="Multiplayer"
            title="Player 2, press start."
            intro="An internship, a collaboration, a hackathon team, or an idea that needs a second brain: send it over. I read every message."
          />
          <div className="reveal space-y-3" style={{ '--delay': '80ms' }}>
            <button type="button" onClick={copyEmail} className="card group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:border-white/25">
              <span className="min-w-0">
                <span className="block font-mono text-[11px] uppercase tracking-wider text-dim">Email</span>
                <span className="block truncate text-fg">{profile.email}</span>
              </span>
              <span className="shrink-0 font-mono text-xs uppercase tracking-wider text-accent" aria-live="polite">
                {copied ? 'Copied ✓' : 'Copy'}
              </span>
            </button>
            <a href={profile.github} target="_blank" rel="noreferrer" className="card group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:border-white/25">
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-wider text-dim">GitHub</span>
                <span className="block text-fg">{profile.github.replace('https://', '')}</span>
              </span>
              <span aria-hidden="true" className="font-mono text-xs text-accent">↗</span>
            </a>
          </div>
        </div>

        <form onSubmit={onSubmit} className="reveal card space-y-4 p-6 sm:p-8 lg:col-span-7 lg:mt-24" style={{ '--delay': '120ms' }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-muted">Name</span>
              <input name="name" required autoComplete="name" placeholder="Ada Lovelace" className={field} />
            </label>
            <label className="block">
              <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-muted">Email</span>
              <input name="email" type="email" required autoComplete="email" placeholder="ada@engine.dev" className={field} />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-muted">Message</span>
            <textarea name="message" required rows={5} placeholder="So I had this idea…" className={`${field} resize-y`} />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <p className="text-sm text-dim" aria-live="polite">
              {sent ? 'Your mail app should be open with the message ready to send.' : 'Opens your mail app with everything filled in.'}
            </p>
            <button type="submit" className="btn-primary">
              Transmit <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default Contact
