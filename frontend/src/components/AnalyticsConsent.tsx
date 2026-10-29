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
      <h2>{translate('About cookies')}</h2>
      <p>
        {translate(
          'Cookies are small files stored by your browser. They help websites remember information between visits.',
        )}
      </p>
      <p>
        {translate(
          'Wheelero uses optional Google Analytics cookies to measure visits and feature usage for up to one year. No names, wheel entries, results or contact details are sent.',
        )}
      </p>
      <p>
        {translate(
          'Accept cookies to enable Analytics or reject cookies to continue without it. Both choices give you full access. Your wheels stay on this device. You can change your choice in Cookie settings.',
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
