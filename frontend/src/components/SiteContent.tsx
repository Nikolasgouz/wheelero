import { faq, information, pages, toolLinks, type SitePath } from '../site'
import { translate } from '../locale'

export function SiteIntro({ path }: { path: SitePath }) {
  return (
    <section className="site-intro">
      <p className="info-eyebrow">Wheelero · {translate('One spin, one decision.')}</p>
      <h1>{translate(pages[path].heading)}</h1>
      <p>{translate(pages[path].intro)}</p>
    </section>
  )
}
export function SiteFooter() {
  return (
    <nav className="site-links" aria-label={translate('Website pages')}>
      {toolLinks.map(([href, label]) => (
        <a key={href} href={href}>
          {translate(label)}
        </a>
      ))}
      <a href="/about">{translate('About')}</a>
      <a href="/privacy">{translate('Privacy')}</a>
    </nav>
  )
}
export function SiteDetails({ path }: { path: SitePath }) {
  if (path === '/about' || path === '/privacy')
    return (
      <article className="site-details">
        {information[path].map(([heading, text]) => (
          <section key={heading}>
            <h2>{translate(heading)}</h2>
            <p>{translate(text)}</p>
          </section>
        ))}
      </article>
    )
  if (path === '/404')
    return (
      <p>
        <a href="/">{translate('Return to the wheel')}</a>
      </p>
    )
  return (
    <section className="site-details">
      <h2>{translate('Questions & answers')}</h2>
      {faq.map(([question, answer]) => (
        <details key={question}>
          <summary>{translate(question)}</summary>
          <p>{translate(answer)}</p>
        </details>
      ))}
    </section>
  )
}
