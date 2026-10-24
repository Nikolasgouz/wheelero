import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleDot,
  Copy,
  History,
  LayoutGrid,
  Maximize2,
  Moon,
  Plus,
  RefreshCw,
  Settings2,
  Share2,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import { api, NetworkError } from './api/client'
import { Dialog } from './components/Dialog'
import { PwaControls } from './components/PwaControls'
import { Wheel as Spinner } from './components/Wheel'
import { t } from './i18n'
import { targetRotation } from './lib/geometry'
import { Editor } from './screens/Editor'
import { Library } from './screens/Library'
import {
  activeOptions,
  addWheels,
  editWheel,
  forkWheel,
  initialize,
  makeWheel,
  spinWheel,
  synchronize,
  useStore,
} from './state/store'
import { templates as bundledTemplates } from './state/templates'
import type { DrawResult, Option, Share, Template, Wheel } from './types'

type Screen = 'wheel' | 'options' | 'library'
type SharedWheel = Pick<Wheel, 'title' | 'no_repeat' | 'options'>

export default function App() {
  const { data, online, notice } = useStore()
  const [screen, setScreen] = useState<Screen>('wheel')
  const [busy, setBusy] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [spinOptions, setSpinOptions] = useState<Option[] | null>(null)
  const [result, setResult] = useState<DrawResult | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') ??
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  )
  const [sound, setSound] = useState(false)
  const [presenting, setPresenting] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shares, setShares] = useState<Share[]>([])
  const [shared, setShared] = useState<SharedWheel | null>(null)
  const [templates, setTemplates] = useState<Template[]>(bundledTemplates)
  const [allHistory, setAllHistory] = useState(false)
  const audio = useRef<AudioContext | null>(null)
  const operation = useRef(false)
  const wheel = data?.wheels.find((w) => w.id === data.active && !w.deleted)

  const reportError = useCallback((error: unknown) => {
    setError(error instanceof Error ? error.message : String(error))
  }, [])
  const run = useCallback(
    (task: () => Promise<unknown>) => {
      if (operation.current) return
      operation.current = true
      setBusy(true)
      setError('')
      void task()
        .catch(reportError)
        .finally(() => {
          operation.current = false
          setBusy(false)
        })
    },
    [reportError],
  )

  useEffect(() => {
    void initialize().catch(reportError)
    void api<Template[]>('/templates')
      .then(setTemplates)
      .catch((error) => {
        if (!(error instanceof NetworkError)) reportError(error)
      })
    const token = new URLSearchParams(location.search).get('share')
    if (token)
      void api<SharedWheel>(`/shares/${encodeURIComponent(token)}`)
        .then(setShared)
        .catch(reportError)
  }, [reportError])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])
  useEffect(() => {
    if (!data || busy) return
    const sync = () => run(synchronize)
    const interval = window.setInterval(sync, 20000)
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    return () => {
      clearInterval(interval)
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
    }
  }, [data, busy, run])
  useEffect(() => {
    const change = () => {
      if (!document.fullscreenElement) setPresenting(false)
    }
    document.addEventListener('fullscreenchange', change)
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPresenting(false)
    }
    window.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('fullscreenchange', change)
      window.removeEventListener('keydown', escape)
    }
  }, [])

  function edit(patch: Partial<Pick<Wheel, 'title' | 'options' | 'no_repeat'>>) {
    setSpinOptions(null)
    setRotation(0)
    void editWheel(wheel!.id, patch).catch(reportError)
  }
  function spin() {
    if (operation.current) return
    if (sound) {
      audio.current ??= new AudioContext()
      void audio.current.resume()
    }
    run(async () => {
      setResult(null)
      setSpinning(true)
      setSpinOptions(activeOptions(wheel!))
      try {
        const outcome = await spinWheel(wheel!.id)
        setSpinOptions(outcome.options)
        setRotation((current) =>
          targetRotation(current, outcome.result.choice_index, outcome.options.length),
        )
        await new Promise((resolve) =>
          setTimeout(resolve, matchMedia('(prefers-reduced-motion: reduce)').matches ? 30 : 3100),
        )
        setResult(outcome.result)
        if (sound && audio.current) {
          const oscillator = audio.current.createOscillator()
          const gain = audio.current.createGain()
          oscillator.connect(gain)
          gain.connect(audio.current.destination)
          oscillator.frequency.setValueAtTime(660, audio.current.currentTime)
          oscillator.frequency.setValueAtTime(880, audio.current.currentTime + 0.12)
          gain.gain.setValueAtTime(0.08, audio.current.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, audio.current.currentTime + 0.45)
          oscillator.start()
          oscillator.stop(audio.current.currentTime + 0.45)
        }
      } finally {
        setSpinning(false)
      }
    })
  }
  function navigate(next: Screen) {
    setScreen(next)
    setSpinOptions(null)
    setRotation(0)
    setResult(null)
  }
  function copy(text: string) {
    run(async () => {
      await navigator.clipboard.writeText(text)
      setMessage(t.copied)
    })
  }
  function closeResult() {
    setResult(null)
  }

  if (!data || !wheel)
    return (
      <main className="loading">
        <span className="brand">{t.brand}</span>
        <p>{error || t.loading}</p>
        {error && (
          <button className="primary" onClick={() => run(initialize)}>
            {t.retry}
          </button>
        )}
      </main>
    )
  const available = activeOptions(wheel)
  const locked = busy || !!data.pending_draw
  const valid =
    wheel.title.trim().length > 0 && wheel.options.every((o) => o.label.trim().length > 0)
  const canSpin = wheel.options.length >= 2 && available.length > 0 && valid && !locked
  const displayed = spinOptions ?? available
  const sharedUrl = (token: string) => `${location.origin}/?share=${encodeURIComponent(token)}`

  return (
    <div className={`app ${presenting ? 'presenting' : ''}`}>
      <header className="topbar">
        <a className="brand" href="/" aria-label={t.brand}>
          <span className="brand-icon">✳</span>
          {t.brand}
          <span className="beta">BETA</span>
        </a>
        <nav className="desktop-nav" aria-label={t.navigation}>
          <button
            disabled={locked}
            className={screen !== 'library' ? 'selected' : ''}
            onClick={() => navigate('wheel')}
          >
            {t.wheel}
          </button>
          <button
            disabled={locked}
            className={screen === 'library' ? 'selected' : ''}
            onClick={() => navigate('library')}
          >
            {t.library}
          </button>
        </nav>
        <div className="header-actions">
          <span className={`connection ${online ? '' : 'offline'}`}>
            <span />
            {online ? t.online : t.offline}
          </span>
          <button
            className="icon-button"
            aria-label={theme === 'light' ? t.dark : t.light}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
          </button>
        </div>
      </header>

      <main>
        {error && (
          <div className="notice error" role="alert">
            <span>{error}</span>
            <button className="icon-button" aria-label={t.close} onClick={() => setError('')}>
              <X size={16} />
            </button>
          </div>
        )}
        {message && (
          <div className="notice" role="status">
            <span>{message}</span>
            <button className="icon-button" aria-label={t.close} onClick={() => setMessage('')}>
              <X size={16} />
            </button>
          </div>
        )}
        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}
        {data.pending_draw && (
          <div className="notice warning">
            <span>{t.uncertain}</span>
            <button disabled={busy} onClick={() => run(synchronize)}>
              {t.sync}
            </button>
          </div>
        )}

        {screen === 'library' ? (
          <Library
            wheels={data.wheels.filter((w) => !w.deleted)}
            active={data.active}
            run={run}
            openEditor={() => navigate('options')}
          />
        ) : (
          <>
            <section className="intro">
              <span className="eyebrow">
                <Sparkles size={14} />
                {t.eyebrow}
              </span>
              <h1>{t.headline}</h1>
              <p>{t.subtitle}</p>
            </section>
            <div className={`workspace mobile-${screen}`}>
              <section className="spinner-panel" aria-label={t.wheel}>
                <div className="wheel-heading">
                  <span className="pill">
                    <span />
                    {t.count(wheel.options.length)}
                  </span>
                  <div className="wheel-tools">
                    <button
                      className="icon-button"
                      aria-label={sound ? t.soundOff : t.soundOn}
                      onClick={() => setSound(!sound)}
                    >
                      {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                    <button
                      className="icon-button"
                      aria-label={presenting ? t.exitFullscreen : t.fullscreen}
                      onClick={() =>
                        run(async () => {
                          if (presenting) {
                            if (document.fullscreenElement) await document.exitFullscreen()
                            setPresenting(false)
                          } else {
                            setPresenting(true)
                            if (document.fullscreenEnabled)
                              await document.documentElement.requestFullscreen()
                          }
                        })
                      }
                    >
                      <Maximize2 size={17} />
                    </button>
                  </div>
                </div>
                <h2 className="wheel-title">{wheel.title}</h2>
                <Spinner options={displayed} rotation={rotation} spinning={spinning} />
                <div className="spin-actions">
                  <button className="primary spin-button" disabled={!canSpin} onClick={spin}>
                    <RefreshCw size={20} className={spinning ? 'rotating' : ''} />
                    {spinning ? t.spinning : t.spin}
                    <ArrowRight size={19} />
                  </button>
                  <p>
                    {wheel.options.length < 2
                      ? t.insufficient
                      : !available.length
                        ? t.exhausted
                        : t.spinHint}
                  </p>
                  {!available.length && wheel.options.length > 1 && (
                    <button
                      className="secondary"
                      disabled={locked}
                      onClick={() =>
                        edit({ options: wheel.options.map((o) => ({ ...o, active: true })) })
                      }
                    >
                      {t.reset}
                    </button>
                  )}
                </div>
                <div className="history">
                  <div className="history-heading">
                    <History size={15} />
                    <h3>{t.history}</h3>
                    <span>{t.historyCount(wheel.results.length)}</span>
                  </div>
                  {wheel.results.length ? (
                    <ol>
                      {(allHistory ? wheel.results : wheel.results.slice(0, 5)).map((r) => (
                        <li key={r.id}>
                          <span className="history-marker" />
                          <strong>{r.label}</strong>
                          <span
                            className="result-source"
                            title={r.source === 'server' ? t.server : t.offlineResult}
                          >
                            {r.source === 'server' ? (
                              <Wifi size={12} aria-label={t.server} />
                            ) : (
                              <WifiOff size={12} aria-label={t.offlineResult} />
                            )}
                          </span>
                          <time
                            dateTime={r.created_at}
                            title={new Date(r.created_at).toLocaleString('el-GR')}
                          >
                            {new Date(r.created_at).toLocaleTimeString('el-GR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </time>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="empty-history">{t.noHistory}</p>
                  )}
                  {wheel.results.length > 5 && (
                    <button className="text-button" onClick={() => setAllHistory(!allHistory)}>
                      {allHistory ? t.lessHistory : t.allHistory}
                    </button>
                  )}
                </div>
              </section>
              <div className="editor-column">
                <Editor
                  key={wheel.id}
                  wheel={wheel}
                  disabled={locked}
                  edit={edit}
                  report={setError}
                />
                <div className="save-bar">
                  <span>
                    <Check size={14} />
                    {wheel.dirty ? t.pending : t.saved}
                  </span>
                  <div>
                    <button
                      className="secondary"
                      disabled={locked || !valid}
                      onClick={() =>
                        run(async () => {
                          await synchronize()
                          setMessage(t.autoSave)
                        })
                      }
                    >
                      <RefreshCw size={15} />
                      {t.save}
                    </button>
                    <button
                      className="secondary"
                      disabled={locked}
                      onClick={() =>
                        run(async () => {
                          if (!online) throw new Error(t.shareOffline)
                          const activeId = await synchronize()
                          setShares(await api<Share[]>(`/wheels/${activeId}/shares`))
                          setShareOpen(true)
                        })
                      }
                    >
                      <Share2 size={15} />
                      {t.share}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <section className="templates-section">
              <div className="section-heading">
                <div>
                  <h2>
                    {t.templates} <span>↗</span>
                  </h2>
                  <p>{t.templatesHint}</p>
                </div>
                <span className="template-hint">{t.allTemplates}</span>
              </div>
              <div className="template-grid">
                {templates.map((template) => (
                  <button
                    className="template-card"
                    key={template.id}
                    disabled={locked}
                    onClick={() =>
                      run(async () => {
                        await addWheels([makeWheel(template.title, template.options)])
                        navigate('wheel')
                      })
                    }
                  >
                    <span className={`template-emoji ${template.id}`}>{template.emoji}</span>
                    <span>
                      <strong>{template.title}</strong>
                      <small>{template.category}</small>
                    </span>
                    <ChevronRight size={17} />
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      <footer>
        <div>
          <span className="footer-brand">{t.brand}</span>
          <span>{t.footer}</span>
        </div>
        <PwaControls busy={locked} report={setMessage} />
        <span className="privacy">{t.privacy}</span>
      </footer>
      <nav className="mobile-nav" aria-label={t.mobileNavigation}>
        {(
          [
            ['wheel', CircleDot, t.wheel],
            ['options', Settings2, t.options],
            ['library', LayoutGrid, t.library],
          ] as const
        ).map(([key, Icon, label]) => (
          <button
            disabled={locked}
            key={key}
            className={screen === key ? 'selected' : ''}
            onClick={() => navigate(key)}
          >
            <Icon size={21} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {result && (
        <Dialog title={t.selected} close={closeResult}>
          <div className="result-display">
            <span className="result-sparkle">✦</span>
            <p className="winner">{result.label}</p>
            <span className="pill">{result.source === 'server' ? t.server : t.offlineResult}</span>
          </div>
          <button className="primary full-width" disabled={!canSpin} onClick={spin}>
            <RefreshCw size={18} />
            {t.again}
          </button>
          {!available.length && (
            <button
              className="secondary full-width"
              onClick={() => {
                edit({ options: wheel.options.map((o) => ({ ...o, active: true })) })
                closeResult()
              }}
            >
              {t.reset}
            </button>
          )}
          <div className="result-actions">
            <button
              className="text-button"
              onClick={() => {
                edit({ options: wheel.options.filter((o) => o.id !== result.option_id) })
                closeResult()
              }}
            >
              {t.removeWinner}
            </button>
            <button
              className="icon-button"
              aria-label={t.copyResult}
              onClick={() => copy(result.label)}
            >
              <Copy size={18} />
            </button>
          </div>
        </Dialog>
      )}

      {shareOpen && (
        <Dialog title={t.shareHeading} close={() => setShareOpen(false)}>
          <p className="muted">{t.shareHint}</p>
          <button
            className="primary full-width"
            disabled={busy}
            onClick={() =>
              run(async () => {
                const activeId = await synchronize()
                const latest = await api<Wheel>(`/wheels/${activeId}`)
                await api<Share>(`/wheels/${activeId}/shares`, 'POST', {
                  revision: latest.revision,
                })
                setShares(await api<Share[]>(`/wheels/${activeId}/shares`))
              })
            }
          >
            <Plus size={18} />
            {t.createLink}
          </button>
          {!shares.length && <p className="muted">{t.noShares}</p>}
          {shares.map((share) => (
            <div className="share-row" key={share.token}>
              <input aria-label={t.share} readOnly value={sharedUrl(share.token)} />
              <div>
                <button
                  className="text-button"
                  disabled={busy}
                  onClick={() => copy(sharedUrl(share.token))}
                >
                  {t.copyLink}
                </button>
                {'share' in navigator && (
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        await navigator.share({ title: wheel.title, url: sharedUrl(share.token) })
                      })
                    }
                  >
                    {t.nativeShare}
                  </button>
                )}
                <button
                  className="text-button danger"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await api(`/wheels/${wheel.id}/shares/${share.token}`, 'DELETE')
                      setShares((current) => current.filter((s) => s.token !== share.token))
                    })
                  }
                >
                  {t.revoke}
                </button>
              </div>
            </div>
          ))}
        </Dialog>
      )}

      {shared && (
        <Dialog
          title={t.shared}
          close={() => {
            setShared(null)
            history.replaceState(null, '', '/')
          }}
        >
          <h3>{shared.title}</h3>
          <ul className="shared-options">
            {shared.options.map((o) => (
              <li key={o.id}>{o.label}</li>
            ))}
          </ul>
          <button
            className="primary full-width"
            disabled={busy}
            onClick={() =>
              run(async () => {
                await addWheels([forkWheel({ ...shared, results: [] })])
                setShared(null)
                history.replaceState(null, '', '/')
                navigate('wheel')
              })
            }
          >
            {t.sharedCopy}
          </button>
        </Dialog>
      )}
    </div>
  )
}
