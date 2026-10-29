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
          'Cookies are small browser files. With your permission, Google Analytics uses them to measure visits and feature usage, without your names, entries or results.',
        )}
      </p>
      <p>
        {translate(
          'Either choice gives full access. You can change it anytime in Cookie settings.',
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
