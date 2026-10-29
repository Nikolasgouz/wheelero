import { ArrowLeft } from 'lucide-react'
import { footerGroups, information, pages, type SitePath } from '../site'
import { getLanguage, translate } from '../locale'
import { ContactForm } from './ContactForm'

export function SiteIntro({ path }: { path: SitePath }) {
  if (path === '/')
    return (
      <h1 className="sr-only" lang={getLanguage()}>
        {translate(pages[path].heading)}
      </h1>
    )
  return (
    <section
      className={`site-intro ${pages[path].kind === 'information' ? 'information-intro' : ''}`}
      lang={getLanguage()}
    >
      {pages[path].kind === 'information' && (
        <a className="back-to-wheel" href="/">
          <ArrowLeft size={16} aria-hidden="true" />
          {translate('Return to the wheel')}
        </a>
      )}
      <h1>{translate(pages[path].heading)}</h1>
      <p>{translate(pages[path].intro)}</p>
    </section>
  )
}
export function SiteFooter({ path }: { path: SitePath }) {
  return (
    <nav className="site-links" aria-label={translate('Website pages')} lang={getLanguage()}>
      <div className="footer-identity">
        <a className="footer-logo" href="/" aria-label="Wheelero">
          <img src="/wheelero.svg" alt="" width="28" height="28" />
          Wheelero
        </a>
      </div>
      {footerGroups.map(({ title, links }) => (
        <section className="footer-group" key={title}>
          <h2>{translate(title)}</h2>
          {links.map(([href, label]) => (
            <a key={href} href={href} aria-current={path === href ? 'page' : undefined}>
              {translate(label)}
            </a>
          ))}
        </section>
      ))}
    </nav>
  )
}
export function SiteDetails({
  path,
  contactFormId,
}: {
  path: SitePath
  contactFormId: string
}) {
  if (path in information)
    return (
      <article className="site-details" lang={getLanguage()}>
        {path === '/contact' && <ContactForm formId={contactFormId} />}
        {information[path as keyof typeof information].map(([heading, text]) =>
          path === '/how-to-use' ? (
            <details key={heading}>
              <summary>{translate(heading)}</summary>
              <p>{translate(text)}</p>
            </details>
          ) : (
            <section key={heading}>
              <h2>{translate(heading)}</h2>
              <p>{translate(text)}</p>
            </section>
          ),
        )}
        {path === '/privacy' && (
          <section>
            <h2>{translate('Contact & support')}</h2>
            <p>
              {translate(
                'When you send a contact message, your reply email and message are processed by Formspree and delivered to our support inbox. Wheel entries and results are not included.',
              )}
            </p>
            <a className="back-to-wheel" href="/contact">
              {translate('Contact & support')}
            </a>
          </section>
        )}
      </article>
    )
  if (path === '/404')
    return (
      <p>
        <a href="/">{translate('Return to the wheel')}</a>
      </p>
    )
  return null
}
