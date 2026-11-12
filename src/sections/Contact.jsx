import { useState } from 'react'
import Button from '../components/Button'
import Lines from '../components/Lines'
import ScrollReveal from '../bits/ScrollReveal'
import { contact, profile } from '../constants'

// The camera finds the antenna, which starts broadcasting; the copy sits to its right.
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
    <section id="contact" data-chapter="contact" data-tone="light" data-shot="contact" aria-labelledby="contact-heading" className="relative">
      <div className="wrap grid min-h-[70vh] items-center pb-24 lg:min-h-[130vh] lg:grid-cols-12 lg:py-32">
        <div className="panel lg:col-span-5 lg:col-start-8">
          <p data-reveal className="reveal t-meta text-muted">Contact</p>
          <Lines id="contact-heading" lines={[['Say ', { em: 'hello.' }]]} className="t-display mt-5" delay={60} />
          <div className="mt-8">
            <ScrollReveal containerClassName="sr t-lead max-w-[30ch]" baseOpacity={0.14} baseRotation={2} blurStrength={5} wordAnimationEnd="bottom 68%">{contact.body}</ScrollReveal>
          </div>
          <div className="reveal mt-10 border-t border-ink pt-5" style={{ '--delay': '260ms' }}>
            <a href={`mailto:${profile.email}`} className="group inline-flex flex-wrap items-baseline gap-x-3">
              <span className="t-h4 link text-[clamp(1.5rem,2.3vw,2.4rem)]">{profile.email}</span>
              <span aria-hidden="true" className="arrow arrow-ne text-muted">↗</span>
            </a>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button as="button" type="button" onClick={copyEmail} ghost size="sm" icon={copied ? 'check' : 'copy'}>
                <span aria-live="polite">{copied ? 'Copied to clipboard' : 'Copy my email'}</span>
              </Button>
              <Button href={profile.github} target="_blank" rel="noreferrer" ghost size="sm" icon="code">Open my GitHub</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
