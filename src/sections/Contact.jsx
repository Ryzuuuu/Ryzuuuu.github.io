import { useState } from 'react'
import Lines from '../components/Lines'
import { contact, profile } from '../constants'

const Contact = () => {
  const [copied, setCopied] = useState(false)

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
      <div className="container-x grid min-h-[70vh] lg:min-h-[130vh] items-center pb-24 lg:grid-cols-12 lg:py-32">
        <div className="panel lg:col-span-5 lg:col-start-8">
          <p data-reveal className="reveal label text-muted">Contact</p>
          <Lines lines={contact.title} className="display-lg mt-5" delay={80} />
          <p className="reveal lead mt-7" style={{ '--delay': '220ms' }}>
            {contact.body}
          </p>

          <a
            href={`mailto:${profile.email}`}
           
            className="reveal link mt-10 inline-block font-display text-[clamp(1.5rem,2.4vw,2.5rem)] font-bold tracking-[-0.015em]"
            style={{ '--delay': '320ms' }}
          >
            {profile.email}
          </a>

          <div className="reveal meta mt-5 flex gap-6 text-muted" style={{ '--delay': '400ms' }}>
            <button type="button" onClick={copyEmail} className="transition-colors hover:text-ink">
              <span aria-live="polite">{copied ? 'Copied' : 'Copy address'}</span>
            </button>
            <a href={profile.github} target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
