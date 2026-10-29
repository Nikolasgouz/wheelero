import { useSyncExternalStore, type ReactNode } from 'react'
import { getLanguage, subscribeLanguage, translate } from '../locale'
import { getAnalyticsConsent, subscribeAnalyticsConsent } from '../lib/analytics'
import { AnalyticsConsent } from './AnalyticsConsent'
import { Dialog } from './Dialog'
import { LanguageMenu } from './LanguageMenu'
import { SiteDetails, SiteIntro } from './SiteContent'

export function CookieGate({ children }: { children: ReactNode }) {
  const consent = useSyncExternalStore(subscribeAnalyticsConsent, getAnalyticsConsent)
  const language = useSyncExternalStore(subscribeLanguage, getLanguage)
  const privacy = location.pathname.replace(/\/$/, '') === '/privacy'
  if (consent !== null || !privacy)
    return (
      <>
        <div inert={consent === null} aria-hidden={consent === null ? true : undefined}>
          {children}
        </div>
        {consent === null && (
          <div className="cookie-overlay">
            <Dialog title={translate('Cookie settings')} close={() => {}} headerClose={false}>
              <div className="cookie-language">
                <LanguageMenu language={language} disabled={false} />
              </div>
              <AnalyticsConsent />
            </Dialog>
          </div>
        )}
      </>
    )
  return (
    <div className="app cookie-gate">
      <header className="topbar">
        <a className="brand" href="/">
          <img className="brand-icon" src="/wheelero.svg" alt="" width="34" height="34" />
          Wheelero
        </a>
      </header>
      <main>
        <LanguageMenu language={language} disabled={false} />
        <SiteIntro path="/privacy" />
        <SiteDetails path="/privacy" contactFormId="" />
        <AnalyticsConsent />
      </main>
    </div>
  )
}
