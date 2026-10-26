import { ct } from './customization.i18n'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from 'react'
import {
  Check,
  ChevronRight,
  CircleDot,
  Copy,
  LayoutGrid,
  Maximize2,
  Moon,
  Plus,
  RefreshCw,
  Settings,
  Settings2,
  Share2,
  Sun,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { api, NetworkError } from './api/client'
import { Customize } from './components/Customize'
import { defaults, type Customization } from './customization'
import { getLanguage, subscribeLanguage } from './locale'
import { LanguageMenu } from './components/LanguageMenu'
import { playSound, prepareApplause, stopSounds } from './lib/audio'
import { presentationOptions, textColor } from './lib/presentation'
import { Dialog } from './components/Dialog'
import { PwaControls } from './components/PwaControls'
import { HomeInfo } from './components/HomeInfo'
import { Wheel as Spinner } from './components/Wheel'
import { t } from './i18n'
import { targetRotation } from './lib/geometry'
import { freezeWheel } from './lib/motion'
import { Editor } from './screens/Editor'
import { WheelSidebar } from './components/WheelSidebar'
import { Library } from './screens/Library'
import {
  activeOptions,
  addWheels,
  clearWheel,
  editWheel,
  forkWheel,
  initialize,
  removeWinner,
  removeDueWinners,
  scheduleRemoval,
  spinWheel,
  synchronize,
  useStore,
} from './state/store'
import { makeWheel } from './state/wheel'
import { templates as bundledTemplates } from './state/templates'
import type { DrawResult, LocalWheel, Option, Share, Template, Wheel } from './types'

type Screen = 'wheel' | 'options' | 'library'
type SharedWheel = Pick<Wheel, 'title' | 'no_repeat' | 'options' | 'customization'>

export default function App() {
  const language = useSyncExternalStore(subscribeLanguage, getLanguage)
  const { data, online, notice } = useStore()
  const [screen, setScreen] = useState<Screen>('wheel')
  const [busy, setBusy] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [sidebarSnapshot, setSidebarSnapshot] = useState<LocalWheel | null>(null)
  const [rotation, setRotation] = useState(0)
  const wheelSvg = useRef<SVGSVGElement>(null)
  const [spinOptions, setSpinOptions] = useState<Option[] | null>(null)
  const [result, setResult] = useState<DrawResult | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') ??
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  )
  const [customOpen, setCustomOpen] = useState(false)
  const [spinConfig, setSpinConfig] = useState<Customization | null>(null)
  const [popupOpen, setPopupOpen] = useState(false)
  const [sound, setSound] = useState(true)
  const [presenting, setPresenting] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shares, setShares] = useState<Share[]>([])
  const [shared, setShared] = useState<SharedWheel | null>(null)
  const [templates, setTemplates] = useState<Template[]>(bundledTemplates)
  const [sidebarTab, setSidebarTab] = useState<'entries' | 'results'>('entries')
  const soundEnabled = useRef(sound)
  soundEnabled.current = sound
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
    void prepareApplause().catch(reportError)
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

  function edit(patch: Partial<Pick<Wheel, 'title' | 'options' | 'no_repeat' | 'customization'>>) {
    setResult(null)
    setPopupOpen(false)
    setSpinOptions(null)
    setSpinConfig(null)
    setRotation(0)
    void editWheel(wheel!.id, patch).catch(reportError)
  }
  useEffect(() => () => stopSounds(), [])
  useEffect(() => {
    if (!data || busy || data.pending_draw) return
    const timer = window.setInterval(() => {
      const due = data.removals.filter((removal) => removal.due <= Date.now())
      if (!due.length) return
      run(async () => {
        for (const removal of await removeDueWinners()) {
          if (soundEnabled.current && removal.sound) playSound('click', removal.volume, reportError)
        }
      })
    }, 250)
    return () => clearInterval(timer)
  }, [data, busy, run, reportError])
  function spin() {
    if (operation.current) return
    const startAngle = freezeWheel(wheelSvg.current!)
    setRotation(startAngle)
    stopSounds()
    run(async () => {
      setResult(null)
      setPopupOpen(false)
      setSpinning(true)
      setSidebarSnapshot(wheel!)
      setSpinOptions(presentationOptions(activeOptions(wheel!), wheel!.customization, null))
      let stop = () => {}
      try {
        const outcome = await spinWheel(wheel!.id)
        const config = outcome.customization
        const visible = presentationOptions(outcome.options, config, outcome.result.option_id)
        setSpinConfig(config)
        setSpinOptions(visible)
        // Paint the new projection before applying the target transform.
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        )
        setRotation(
          targetRotation(
            startAngle,
            visible.findIndex((o) => o.id === outcome.result.option_id),
            visible.length,
          ) +
            (config.slow_spin ? -3 : Math.max(0, Math.floor(config.duration / 2) - 5)) * 360,
        )
        if (soundEnabled.current)
          stop = playSound(config.spin_sound, config.spin_volume, reportError, config.duration)
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 30
              : config.duration * 1000 + 50,
          ),
        )
        stop()
        setResult(outcome.result)
        setSidebarTab('results')
        setPopupOpen(config.popup)
        if (soundEnabled.current) playSound(config.result_sound, config.result_volume, reportError)
        if (config.auto_remove) await scheduleRemoval(wheel!.id, outcome.result, config)
      } finally {
        stop()
        setSpinning(false)
        setSidebarSnapshot(null)
      }
    })
  }
  function removeResult() {
    if (!result || !wheel) return
    run(async () => {
      const removed = await removeWinner(wheel.id, result.option_id)
      if (removed && soundEnabled.current && (spinConfig ?? wheel.customization).removal_sound)
        playSound('click', (spinConfig ?? wheel.customization).result_volume, reportError)
      setPopupOpen(false)
    })
  }
  function navigate(next: Screen) {
    setScreen(next)
    setSidebarTab('entries')
    setSpinOptions(null)
    setSpinConfig(null)
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
    setPopupOpen(false)
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
  const canSpin = available.length > 0 && valid && !locked
  const config = spinConfig ?? wheel.customization
  const winnerMessage =
    config.popup_message === defaults.popup_message ? t.selected : config.popup_message
  const displayed = spinOptions ?? presentationOptions(available, config, null)
  const sharedUrl = (token: string) => `${location.origin}/?share=${encodeURIComponent(token)}`

  return (
    <div
      className={`app ${screen === 'wheel' ? 'home' : ''} ${presenting ? 'presenting' : ''}`}
      style={
        presenting
          ? ({
              background: config.gradient
                ? `linear-gradient(145deg, ${config.page_color}, #7650cc44), ${config.page_color}`
                : config.page_color,
              '--presentation-ink': textColor(config.page_color),
            } as CSSProperties)
          : undefined
      }
    >
      <header className="topbar">
        <a className="brand" href="/" aria-label={t.brand}>
          <span className="brand-icon">✳</span>
          {t.brand}
        </a>
        <nav className="desktop-nav" aria-label={t.navigation}>
          <button
            disabled={locked}
            className={screen === 'wheel' ? 'selected' : ''}
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
          <LanguageMenu language={language} disabled={locked} />
          {!online && (
            <span className="connection offline" title={t.offline}>
              <span />
              {t.offline}
            </span>
          )}
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
            <div className={`workspace mobile-${screen}`}>
              <section className="spinner-panel" aria-label={t.wheel} hidden={screen !== 'wheel'}>
                <div className="wheel-top">
                  <div className="wheel-heading">
                    <span className="pill">
                      <span />
                      {t.count(wheel.options.length)}
                    </span>
                    <div className="wheel-tools">
                      <button
                        className="icon-button"
                        aria-label={ct.title}
                        title={ct.title}
                        disabled={locked}
                        onClick={() => setCustomOpen(true)}
                      >
                        <Settings size={18} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={sound ? t.soundOff : t.soundOn}
                        disabled={locked}
                        onClick={() => {
                          if (sound) stopSounds()
                          setSound(!sound)
                        }}
                      >
                        {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
                      </button>
                      <button
                        className="icon-button"
                        aria-label={presenting ? t.exitFullscreen : t.fullscreen}
                        disabled={locked}
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
                  <h1 className={config.show_title ? 'wheel-title' : 'sr-only'}>{wheel.title}</h1>
                </div>
                <Spinner
                  svg={wheelSvg}
                  options={displayed}
                  rotation={rotation}
                  spinning={spinning}
                  config={config}
                  winnerId={result?.option_id ?? null}
                  idle={
                    !spinning &&
                    displayed.length > 0 &&
                    !data.pending_draw &&
                    screen === 'wheel' &&
                    !shareOpen &&
                    !shared
                  }
                  canSpin={canSpin}
                  onSpin={spin}
                />
                <div className="wheel-bottom">
                  {displayed.length !== available.length && (
                    <p className="muted display-note">{ct.visible(displayed.length)}</p>
                  )}
                  {displayed.length > 48 && config.text !== 'never' && (
                    <details className="wheel-legend">
                      <summary>{ct.legend}</summary>
                      <ol>
                        {displayed.map((o) => (
                          <li key={o.id}>{o.label}</li>
                        ))}
                      </ol>
                    </details>
                  )}
                  {result && (
                    <section
                      className={`inline-result ${config.animate_winner ? 'winner-animation' : ''}`}
                      aria-live="polite"
                    >
                      <span>{winnerMessage}</span>
                      <strong>{result.label}</strong>
                      <div className="result-actions">
                        <button className="text-button" disabled={!canSpin} onClick={spin}>
                          {t.again}
                        </button>
                        {config.remove_button && (
                          <button
                            className="text-button"
                            disabled={
                              locked || !wheel.options.some((o) => o.id === result.option_id)
                            }
                            onClick={removeResult}
                          >
                            {t.removeWinner}
                          </button>
                        )}
                        <button
                          className="icon-button"
                          aria-label={t.copyResult}
                          onClick={() => copy(result.label)}
                        >
                          <Copy size={18} />
                        </button>
                      </div>
                    </section>
                  )}
                  {result && config.confetti && (
                    <div key={result.id} className="confetti" aria-hidden="true">
                      {Array.from({ length: 40 }, (_, i) => (
                        <i
                          key={i}
                          style={{
                            left: `${(i * 37) % 100}%`,
                            background: config.palette[i % config.palette.length].color,
                            animationDelay: `${(i % 7) * 0.08}s`,
                            transform: `rotate(${i * 29}deg)`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <div className="spin-actions">
                    {!available.length && wheel.options.length > 0 && <p>{t.exhausted}</p>}
                    {!available.length && wheel.options.length > 0 && (
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
                </div>
              </section>
              <div className="wheel-sidebar-column" hidden={screen !== 'wheel'}>
                <WheelSidebar
                  key={wheel.id}
                  wheel={sidebarSnapshot ?? wheel}
                  disabled={locked}
                  edit={edit}
                  tab={sidebarTab}
                  setTab={setSidebarTab}
                  openEditor={() => navigate('options')}
                  clear={(section) =>
                    run(async () => {
                      await clearWheel(wheel.id, section)
                      setResult(null)
                      setPopupOpen(false)
                      setSpinOptions(null)
                      setSpinConfig(null)
                      setSidebarSnapshot(null)
                      setRotation(0)
                    })
                  }
                />
              </div>
              <div className="editor-column" hidden={screen !== 'options'}>
                <div className="options-toolbar">
                  <h1>{t.options}</h1>
                  <button
                    className="secondary"
                    disabled={locked}
                    onClick={() => setCustomOpen(true)}
                  >
                    <Settings2 size={17} />
                    {ct.title}
                  </button>
                </div>
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
            <section className="templates-section" hidden={screen !== 'options'}>
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
        {screen === 'wheel' && !presenting && <HomeInfo />}
      </main>
      <footer>
        <PwaControls busy={locked} report={setMessage} />
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

      {customOpen && (
        <Customize
          value={wheel.customization}
          muted={!sound}
          close={() => setCustomOpen(false)}
          save={async (customization) => {
            await editWheel(wheel.id, { customization })
            setResult(null)
            setPopupOpen(false)
            setSpinOptions(null)
            setSpinConfig(null)
            setRotation(0)
            setCustomOpen(false)
          }}
        />
      )}
      {result && popupOpen && (
        <Dialog title={winnerMessage} close={closeResult} headerClose={false}>
          <div className="result-display">
            <span className="result-sparkle">✦</span>
            <p className="winner">{result.label}</p>
            {result.source === 'offline' && <span className="pill">{t.offlineResult}</span>}
          </div>
          <div className="result-actions">
            <button className="secondary" onClick={closeResult}>
              {t.close}
            </button>
            {config.remove_button && (
              <button
                className="primary"
                disabled={locked || !wheel.options.some((o) => o.id === result.option_id)}
                onClick={removeResult}
              >
                {t.removeWinner}
              </button>
            )}
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
