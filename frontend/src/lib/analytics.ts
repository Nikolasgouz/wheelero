import { currentPath } from '../site'
import { measurementId, type AnalyticsEvent } from './analytics-message'

const consentKey = 'wheelero-analytics-consent-v1'
export type AnalyticsConsent = 'accepted' | 'rejected' | null
const listeners = new Set<() => void>()
const analyticsEnabled =
  import.meta.env.PROD &&
  import.meta.env.VITE_ANALYTICS_ENABLED === 'true' &&
  location.origin === 'https://wheelero.com'
let frame: HTMLIFrameElement | null = null
let ready = false
let queue: AnalyticsEvent[] = []
let viewedPath: string | null = null

export function getAnalyticsConsent(): AnalyticsConsent {
  const value = localStorage.getItem(consentKey)
  return value === 'accepted' || value === 'rejected' ? value : null
}
export function subscribeAnalyticsConsent(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
export function trackAnalytics(event: AnalyticsEvent) {
  if (!analyticsEnabled || getAnalyticsConsent() !== 'accepted' || !navigator.onLine) return
  if (!ready) {
    if (frame) queue.push(event)
    return
  }
  frame!.contentWindow!.postMessage(
    {
      path: currentPath(location.pathname.replace(/\/$/, '') || '/'),
      debug: sessionStorage.getItem('wheelero-analytics-debug') === 'true',
      event,
    },
    location.origin,
  )
}
function pageView() {
  if (!analyticsEnabled || getAnalyticsConsent() !== 'accepted' || !navigator.onLine) return
  const path = currentPath(location.pathname.replace(/\/$/, '') || '/')
  if (viewedPath === path) return
  viewedPath = path
  trackAnalytics({ name: 'page_view' })
}
function applyConsent() {
  if (analyticsEnabled && getAnalyticsConsent() === 'accepted' && navigator.onLine) {
    if (!frame) {
      frame = document.createElement('iframe')
      frame.src = '/analytics.html'
      frame.hidden = true
      frame.title = 'Analytics'
      frame.referrerPolicy = 'no-referrer'
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin')
      frame.onload = () => {
        ready = true
        const events = queue
        queue = []
        for (const event of events) trackAnalytics(event)
      }
      document.body.append(frame)
    }
    pageView()
  } else {
    if (frame?.contentWindow)
      Object.assign(frame.contentWindow, { [`ga-disable-${measurementId}`]: true })
    frame?.remove()
    frame = null
    ready = false
    queue = []
    if (getAnalyticsConsent() !== 'accepted') {
      for (const name of ['_ga', '_ga_JB9ZRMKRKR']) {
        for (const domain of ['', '; Domain=wheelero.com', '; Domain=.wheelero.com'])
          document.cookie = `${name}=; Max-Age=0; Path=/${domain}; SameSite=Lax; Secure`
      }
    }
  }
  listeners.forEach((listener) => listener())
}
export function setAnalyticsConsent(consent: Exclude<AnalyticsConsent, null>) {
  localStorage.setItem(consentKey, consent)
  applyConsent()
}
export function startAnalytics() {
  applyConsent()
  window.addEventListener('storage', (event) => {
    if (event.key === consentKey || event.key === null) applyConsent()
  })
  window.addEventListener('online', applyConsent)
  window.addEventListener('popstate', pageView)
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      viewedPath = null
      applyConsent()
    }
  })
}
