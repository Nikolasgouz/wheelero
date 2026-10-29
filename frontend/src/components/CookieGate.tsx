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
  if (consent !== null) return children
  const privacy = location.pathname.replace(/\/$/, '') === '/privacy'
  return (
    <div className="app cookie-gate">
      <header className="topbar">
        <a className="brand" href="/">
          <img className="brand-icon" src="/wheelero.svg" alt="" width="34" height="34" />
          Wheelero
        </a>
      </header>
      {privacy ? (
        <main>
          <LanguageMenu language={language} disabled={false} />
          <SiteIntro path="/privacy" />
          <SiteDetails path="/privacy" contactFormId="" />
          <AnalyticsConsent />
        </main>
      ) : (
        <>
          <h1 className="sr-only">Wheelero</h1>
          <Dialog title={translate('Cookie settings')} close={() => {}} headerClose={false}>
            <div className="cookie-language">
              <LanguageMenu language={language} disabled={false} />
            </div>
            <AnalyticsConsent />
          </Dialog>
        </>
      )}
    </div>
  )
}
