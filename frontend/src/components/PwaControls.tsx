import { useEffect, useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { t } from '../i18n'
import { flushStorage } from '../state/store'

interface InstallEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaControls({
  busy,
  report,
}: {
  busy: boolean
  report: (message: string) => void
}) {
  const [install, setInstall] = useState<InstallEvent | null>(null)
  const [standalone, setStandalone] = useState(matchMedia('(display-mode: standalone)').matches)
  const [activated, setActivated] = useState(false)
  const [updateRequested, setUpdateRequested] = useState(false)
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({ onNeedReload: () => setActivated(true) })
  useEffect(() => {
    if (!activated || !updateRequested || busy) return
    let cancelled = false
    void flushStorage()
      .then(() => {
        if (!cancelled) location.reload()
      })
      .catch((error) => report(error.message))
    return () => {
      cancelled = true
    }
  }, [activated, updateRequested, busy, report])
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
      {(needRefresh || activated) && (
        <button
          className="secondary"
          disabled={busy}
          onClick={() => {
            void flushStorage()
              .then(async () => {
                const registration = await navigator.serviceWorker.ready
                setUpdateRequested(true)
                if (registration.waiting) return updateServiceWorker(true)
                // Another tab may have activated it before this tab received the event.
                setActivated(true)
              })
              .catch((error) => report(error.message))
          }}
        >
          <RefreshCw size={15} />
          {t.updateNow}
        </button>
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
