import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { t } from '../i18n'
import { translate } from '../locale'
import { flushStorage } from '../state/store'

interface InstallEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaControls({
  busy,
  report,
  beforeReload,
}: {
  busy: boolean
  report: (message: string) => void
  beforeReload: () => void
}) {
  const [install, setInstall] = useState<InstallEvent | null>(null)
  const [standalone, setStandalone] = useState(matchMedia('(display-mode: standalone)').matches)
  const [updateReady, setUpdateReady] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>()
  const {
    offlineReady: [offlineReady],
  } = useRegisterSW({
    onNeedReload: () => setUpdateReady(true),
    onRegisteredSW: (_url, registration) => setRegistration(registration),
    onRegisterError: (error) => report(error.message),
  })
  useEffect(() => {
    if (!registration) return
    function check() {
      if (navigator.onLine && !document.hidden)
        void registration!.update().catch((error: Error) => report(error.message))
    }
    const interval = window.setInterval(check, 60_000)
    window.addEventListener('online', check)
    window.addEventListener('focus', check)
    document.addEventListener('visibilitychange', check)
    return () => {
      clearInterval(interval)
      window.removeEventListener('online', check)
      window.removeEventListener('focus', check)
      document.removeEventListener('visibilitychange', check)
    }
  }, [registration, report])
  useEffect(() => {
    if (!updateReady || busy) return
    let cancelled = false
    let saving = false
    let lastActivity = performance.now()
    const events = ['pointerdown', 'keydown', 'input', 'wheel', 'touchmove', 'focusin', 'focusout']
    function activity() {
      lastActivity = performance.now()
    }
    function safeToReload() {
      return (
        !cancelled &&
        !document.hidden &&
        performance.now() - lastActivity >= 3000 &&
        !document.querySelector('dialog[open]') &&
        !document.activeElement?.matches('input, textarea, select, [contenteditable="true"]')
      )
    }
    for (const event of events)
      document.addEventListener(event, activity, { capture: true, passive: true })
    const interval = window.setInterval(() => {
      if (saving || !safeToReload()) return
      saving = true
      void flushStorage()
        .then(() => {
          if (safeToReload()) {
            beforeReload()
            location.reload()
          }
        })
        .catch((error: Error) => report(error.message))
        .finally(() => {
          saving = false
        })
    }, 500)
    return () => {
      cancelled = true
      clearInterval(interval)
      for (const event of events) document.removeEventListener(event, activity, true)
    }
  }, [updateReady, busy, report, beforeReload])
  useEffect(() => {
    const prompt = (event: Event) => {
      event.preventDefault()
      setInstall(event as InstallEvent)
    }
    const installed = () => {
      setStandalone(true)
      setInstall(null)
    }
    window.addEventListener('beforeinstallprompt', prompt)
    window.addEventListener('appinstalled', installed)
    return () => {
      window.removeEventListener('beforeinstallprompt', prompt)
      window.removeEventListener('appinstalled', installed)
    }
  }, [])
  return (
    <div className="pwa-controls">
      {offlineReady && <span className="offline-ready">{t.offlineReady}</span>}
      {updateReady && (
        <span role="status" className="update-status">
          {translate('An update is ready. It will apply automatically when you finish.')}
        </span>
      )}
      {!standalone &&
        (install ? (
          <button
            className="text-button"
            onClick={() => {
              void install
                .prompt()
                .then(() => install.userChoice)
                .then(() => setInstall(null))
                .catch((error) => report(error.message))
            }}
          >
            <Download size={15} />
            {t.install}
          </button>
        ) : (
          <button
            className="text-button"
            onClick={() =>
              report(
                'On iPhone/iPad: Safari → Share → Add to Home Screen. In other browsers, look for Install app in the menu, if supported.',
              )
            }
          >
            {t.installHelp}
          </button>
        ))}
    </div>
  )
}
