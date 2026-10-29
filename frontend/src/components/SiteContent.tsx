import { ArrowLeft } from 'lucide-react'
import { footerGroups, information, pages, publicPath, type SitePath } from '../site'
import { getLanguage, translate } from '../locale'
import { ContactForm } from './ContactForm'

export function SiteIntro({ path }: { path: SitePath }) {
  // The homepage's visible H1 and introduction live in the original HomeInfo layout.
  if (path === '/') return null
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
            <a key={href} href={publicPath(href)} aria-current={path === href ? 'page' : undefined}>
              {translate(label)}
            </a>
          ))}
        </section>
      ))}
    </nav>
  )
}
export function SiteDetails({ path, contactFormId }: { path: SitePath; contactFormId: string }) {
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
            <h2>{translate('Optional analytics')}</h2>
            <p>
              {translate(
                'Your analytics choice is stored on this device. If you accept, Google Analytics uses _ga cookies for up to one year and receives page visits, feature counts and technical connection data. Rejecting stops collection and removes these cookies without deleting your wheels.',
              )}
            </p>
            <p>
              {translate(
                'Allow Google Analytics to measure page visits and feature usage? It receives counts, not names, wheel content, results or contact details. Nothing is sent before you accept.',
              )}
            </p>
            <a className="back-to-wheel" href="/cookies">
              {translate('Cookie settings')}
            </a>
            <p>
              <a href="https://policies.google.com/privacy">
                Google · {translate('Privacy Policy')}
              </a>
            </p>
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
