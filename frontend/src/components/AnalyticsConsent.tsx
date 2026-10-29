import { useSyncExternalStore } from 'react'
import { translate } from '../locale'
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  subscribeAnalyticsConsent,
} from '../lib/analytics'

export function AnalyticsConsent({ settings = false }: { settings?: boolean }) {
  const consent = useSyncExternalStore(subscribeAnalyticsConsent, getAnalyticsConsent)
  if (!settings && consent !== null) return null
  return (
    <section
      className={settings ? 'analytics-settings card' : 'analytics-banner card'}
      aria-label={translate('Cookie settings')}
    >
      <h2>{translate('Optional analytics')}</h2>
      <p>
        {translate(
          'Allow Google Analytics to measure page visits and feature usage? It receives counts, not names, wheel content, results or contact details. Nothing is sent before you accept.',
        )}
      </p>
      {settings && (
        <p role="status">
          {translate(consent === 'accepted' ? 'Analytics is allowed.' : 'Analytics is off.')}
        </p>
      )}
      <div className="analytics-actions">
        <button className="secondary" onClick={() => setAnalyticsConsent('accepted')}>
          {translate('Accept analytics')}
        </button>
        <button className="secondary" onClick={() => setAnalyticsConsent('rejected')}>
          {translate('Reject analytics')}
        </button>
      </div>
      <p>
        <a href="/privacy">{translate('Privacy Policy')}</a> ·{' '}
        <a href="/cookies">{translate('Cookie settings')}</a>
      </p>
    </section>
  )
}
