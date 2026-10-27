import { faq, information, pages, toolLinks, type SitePath } from '../site'

export function SiteIntro({ path }: { path: SitePath }) {
  return (
    <section className="site-intro" lang="en">
      <p className="info-eyebrow">Wheelero · One spin, one decision.</p>
      <h1>{pages[path].heading}</h1>
      <p>{pages[path].intro}</p>
    </section>
  )
}
export function SiteFooter() {
  return (
    <nav className="site-links" aria-label="Website pages" lang="en">
      {toolLinks.map(([href, label]) => (
        <a key={href} href={href}>
          {label}
        </a>
      ))}
      <a href="/about">About</a>
      <a href="/privacy">Privacy</a>
    </nav>
  )
}
export function SiteDetails({ path }: { path: SitePath }) {
  if (path === '/about' || path === '/privacy')
    return (
      <article className="site-details" lang="en">
        {information[path].map(([heading, text]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            <p>{text}</p>
          </section>
        ))}
      </article>
    )
  if (path === '/404')
    return (
      <p>
        <a href="/">Return to the wheel</a>
      </p>
    )
  return (
    <section className="site-details" lang="en">
      <h2>Questions & answers</h2>
      {faq.map(([question, answer]) => (
        <details key={question}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
    </section>
  )
}
