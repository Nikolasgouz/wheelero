import { analyticsMessage, measurementId } from './lib/analytics-message'
import { pages } from './site'

declare global {
  interface Window {
    dataLayer: IArguments[]
    gtag: (...args: unknown[]) => void
  }
}
let initialized = false
if (
  import.meta.env.PROD &&
  import.meta.env.VITE_ANALYTICS_ENABLED === 'true' &&
  location.origin === 'https://wheelero.com' &&
  window.parent !== window
) {
  window.addEventListener('message', (message: MessageEvent<unknown>) => {
    if (
      message.origin !== location.origin ||
      message.source !== window.parent ||
      localStorage.getItem('wheelero-analytics-consent-v1') !== 'accepted'
    )
      return
    const parsed = analyticsMessage.safeParse(message.data)
    if (!parsed.success) return
    const { path, debug, event } = parsed.data
    const page = {
      page_location: `https://wheelero.com${path}`,
      page_title: pages[path].title,
      page_referrer: '',
    }
    if (!initialized) {
      initialized = true
      window.dataLayer = []
      // Google's official gtag queue uses arguments objects, not arrays.
      window.gtag = function () {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments)
      }
      window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      })
      window.gtag('consent', 'update', { analytics_storage: 'granted' })
      window.gtag('set', {
        ...page,
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        ads_data_redaction: true,
        url_passthrough: false,
      })
      window.gtag('js', new Date())
      window.gtag('config', measurementId, {
        ...page,
        send_page_view: false,
        cookie_domain: 'none',
        cookie_expires: 31536000,
        cookie_flags: 'SameSite=Lax;Secure',
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      })
      const script = document.createElement('script')
      script.async = true
      script.referrerPolicy = 'no-referrer'
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
      document.head.append(script)
    }
    const { name, ...counts } = event
    window.gtag('set', page)
    window.gtag('event', name, {
      ...page,
      ...counts,
      send_to: measurementId,
      ...(debug ? { debug_mode: true } : {}),
    })
  })
}
