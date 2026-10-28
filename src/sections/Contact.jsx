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
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  return (
    <section id="contact" data-chapter="contact" data-shot="contact" className="relative">
      <div className="container-x grid min-h-[130vh] items-center pb-24 pt-[52svh] lg:grid-cols-12 lg:py-32">
        <div className="panel lg:col-span-6 lg:col-start-7 xl:col-span-5 xl:col-start-8">
          <SectionHeading
            numeral="IV"
            eyebrow="Correspondence"
            title={
              <>
                Let’s build something <em>worth keeping.</em>
              </>
            }
            intro="An internship, a collaboration, a hackathon team, or an idea that needs a second brain: send it over. I read every message."
          />

          <div className="reveal grid border-y border-hairline sm:grid-cols-2" style={{ '--delay': '80ms' }}>
            <button
              type="button"
              onClick={copyEmail}
              className="group flex items-center justify-between gap-4 border-b border-hairline py-5 text-left sm:border-b-0 sm:border-r sm:pr-6"
            >
              <span className="min-w-0">
                <span className="smallcaps block text-[10px] text-stone">Email</span>
                <span className="mt-1 block truncate text-ivory transition-colors group-hover:text-gold-light">{profile.email}</span>
              </span>
              <span className="smallcaps shrink-0 text-[10px] text-gold" aria-live="polite">
                {copied ? 'Copied' : 'Copy'}
              </span>
            </button>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-4 py-5 sm:pl-6"
            >
              <span>
                <span className="smallcaps block text-[10px] text-stone">GitHub</span>
                <span className="mt-1 block text-ivory transition-colors group-hover:text-gold-light">
                  {profile.github.replace('https://', '')}
                </span>
              </span>
              <span aria-hidden="true" className="text-gold">↗</span>
            </a>
          </div>

          <form onSubmit={onSubmit} className="reveal mt-10 space-y-7" style={{ '--delay': '160ms' }}>
            <div className="grid gap-7 sm:grid-cols-2">
              <label className="block">
                <span className="smallcaps block text-[10px] text-stone">Name</span>
                <input name="name" required autoComplete="name" placeholder="Ada Lovelace" className="field" />
              </label>
              <label className="block">
                <span className="smallcaps block text-[10px] text-stone">Email</span>
                <input name="email" type="email" required autoComplete="email" placeholder="ada@engine.dev" className="field" />
              </label>
            </div>
            <label className="block">
              <span className="smallcaps block text-[10px] text-stone">Message</span>
              <textarea name="message" required rows={4} placeholder="So I had this idea…" className="field resize-y" />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-5 pt-1">
              <p className="max-w-[16rem] text-sm text-stone" aria-live="polite">
                {sent ? 'Your mail app should now be open with the letter ready to send.' : 'Opens your mail app with everything filled in.'}
              </p>
              <button type="submit" className="btn-gold">
                Send letter <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Contact
