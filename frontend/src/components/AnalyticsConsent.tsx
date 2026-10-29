import { useSyncExternalStore } from 'react'
import { translate } from '../locale'
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  subscribeAnalyticsConsent,
} from '../lib/analytics'

export function AnalyticsConsent() {
  const consent = useSyncExternalStore(subscribeAnalyticsConsent, getAnalyticsConsent)
  return (
    <section className="analytics-settings" aria-label={translate('Cookie settings')}>
      <p>
        {translate(
          'With your permission, we use analytics cookies to understand how Wheelero is used and make it better. Your names and wheel entries are never sent to Google Analytics. The wheel works just as well if you decline.',
        )}
      </p>
      {consent !== null && (
        <p role="status">
          {translate(consent === 'accepted' ? 'Analytics is allowed.' : 'Analytics is off.')}
        </p>
      )}
      <div className="analytics-actions">
        <button className="secondary" onClick={() => setAnalyticsConsent('accepted')}>
          {translate('Accept cookies')}
        </button>
        <button className="secondary" onClick={() => setAnalyticsConsent('rejected')}>
          {translate('Reject cookies')}
        </button>
      </div>
      <p>
        <a href="/privacy">{translate('Privacy Policy')}</a> ·{' '}
        <a href="/cookies">{translate('Cookie settings')}</a>
      </p>
    </section>
  )
}
