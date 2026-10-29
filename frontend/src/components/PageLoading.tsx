import type { ReactNode } from 'react'
import { pages, type SitePath } from '../site'
import { t } from '../i18n'
import { SiteIntro, SiteDetails, SiteFooter } from './SiteContent'
import { ToolGuide } from './ToolGuide'
import { HomeInfo } from './HomeInfo'

// Shared initial HTML and client loading shell reserve the tool's layout while IDB opens.
export function PageLoading({
  path,
  children,
  contactFormId,
}: {
  path: SitePath
  children?: ReactNode
  contactFormId: string
}) {
  return (
    <div className="app home">
      <header className="topbar">
        <a className="brand" href="/">
          <img className="brand-icon" src="/wheelero.svg" alt="" width="34" height="34" />
          Wheelero
        </a>
      </header>
      <main id="main-content">
        <div className={pages[path].kind === 'wheel' ? 'wheel-viewport' : undefined}>
          <SiteIntro path={path} />
          {pages[path].kind === 'information' ? (
            <SiteDetails path={path} contactFormId={contactFormId} />
          ) : (
            <div className={`tool-loading ${pages[path].kind}`}>
              <p role="status">{t.loading}</p>
              <noscript>
                Enable JavaScript to use this tool. Instructions and information are available
                below.
              </noscript>
            </div>
          )}
          {children}
        </div>
        <ToolGuide path={path} />
        {path === '/' && <HomeInfo />}
      </main>
      <footer className="site-footer">
        <SiteFooter path={path} />
      </footer>
    </div>
  )
}
