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
import { createShareLink, readSharedWheel } from './lib/sharing'
import { exportLegacyBackup } from './state/storage'
import { Customize } from './components/Customize'
import { defaults, type Customization } from './customization'
import { getLanguage, subscribeLanguage } from './locale'
import { LanguageMenu } from './components/LanguageMenu'
import { playSound, prepareApplause, stopSounds } from './lib/audio'
import { presentationOptions, textColor } from './lib/presentation'
import { Dialog } from './components/Dialog'
import { PwaControls } from './components/PwaControls'
import { HomeInfo } from './components/HomeInfo'
import { SiteIntro, SiteDetails, SiteFooter } from './components/SiteContent'
import { NumberRange, TeamGenerator } from './components/Tools'
import { pages, currentPath } from './site'
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
  restoreEntries,
  removeWinner,
  removeDueWinners,
  scheduleRemoval,
  spinWheel,
  flushStorage,
  useStore,
} from './state/store'
import { makeWheel } from './state/wheel'
import { templates as bundledTemplates } from './state/templates'
import type { DrawResult, LocalWheel, Option, Wheel } from './types'

const sitePath = currentPath(location.pathname.replace(/\/$/, '') || '/')

type Screen = 'wheel' | 'options' | 'library'
type SharedWheel = Pick<Wheel, 'title' | 'no_repeat' | 'options' | 'customization'>

export default function App() {
  const language = useSyncExternalStore(subscribeLanguage, getLanguage)
  const { data, notice } = useStore()
  const [online, setOnline] = useState(navigator.onLine)
  const [screen, setScreen] = useState<Screen>('wheel')
  const [busy, setBusy] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [sidebarSnapshot, setSidebarSnapshot] = useState<LocalWheel | null>(null)
  const [rotation, setRotation] = useState(0)
  const wheelSvg = useRef<SVGSVGElement>(null)
  const [spinOptions, setSpinOptions] = useState<Option[] | null>(null)
  const [result, setResult] = useState<DrawResult | null>(null)
  const [message, setMessage] = useState('')
  const [storageMessage, setStorageMessage] = useState('')
  const [error, setError] = useState('')
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') ??
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  )
  const [customOpen, setCustomOpen] = useState(false)
  const [spinConfig, setSpinConfig] = useState<Customization | null>(null)
  const [popupOpen, setPopupOpen] = useState(false)
  const [sound, setSound] = useState(localStorage.getItem('wheelero-sound') === 'true')
  const [presenting, setPresenting] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [shared, setShared] = useState<SharedWheel | null>(null)
  const templates = bundledTemplates
  const [sidebarTab, setSidebarTab] = useState<'entries' | 'results'>('entries')
  const soundEnabled = useRef(sound)
  soundEnabled.current = sound
  const operation = useRef(false)
  const wheel = data?.wheels.find((w) => w.id === data.active)

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
    void initialize(sitePath).catch(reportError)
    const fragment = new URLSearchParams(location.hash.slice(1)).get('wheel')
    if (fragment) {
      try {
        setShared(readSharedWheel(fragment))
      } catch (error) {
        reportError(error)
      }
    } else if (new URLSearchParams(location.search).has('share')) {
      setError('This is an old server share link. Ask the sender for a new link or a JSON export.')
    }
  }, [reportError])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
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
    localStorage.setItem('wheelero-sound', String(sound))
    if (sound) void prepareApplause().catch(reportError)
  }, [sound, reportError])
  useEffect(() => {
    if (!data || busy) return
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
          <>
            <button className="primary" onClick={() => run(() => initialize(sitePath))}>
              {t.retry}
            </button>
            <button className="secondary" onClick={() => run(exportLegacyBackup)}>
              Export previous browser data
            </button>
          </>
        )}
      </main>
    )
  const available = activeOptions(wheel)
  const locked = busy
  const valid =
    wheel.title.trim().length > 0 && wheel.options.every((o) => o.label.trim().length > 0)
  const canSpin = available.length > 0 && valid && !locked
  const config = spinConfig ?? wheel.customization
  const winnerMessage =
    config.popup_message === defaults.popup_message ? t.selected : config.popup_message
  const displayed = spinOptions ?? presentationOptions(available, config, null)

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
          <img className="brand-icon" src="/wheelero.svg" alt="" width="34" height="34" />
          {t.brand}
        </a>
        {pages[sitePath].kind === 'wheel' && (
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
        )}
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

      <main id="main-content">
        <div className={pages[sitePath].kind === 'wheel' ? 'wheel-viewport' : undefined}>
          {!presenting && <SiteIntro path={sitePath} />}
          <p className="sr-only" role="status" aria-live="polite">
            {!spinning && result ? `${winnerMessage} ${result.label}` : ''}
          </p>
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
          {pages[sitePath].kind === 'information' ? (
            <SiteDetails path={sitePath} />
          ) : pages[sitePath].kind === 'teams' ? (
            <TeamGenerator />
          ) : screen === 'library' ? (
            <>
              <section className="sync-controls card" lang="en">
                <h2>Stored in your browser</h2>
                <p>
                  Wheels, settings and results are saved in IndexedDB on this device. Export JSON
                  before clearing browser data or moving to another device.
                </p>
                {'storage' in navigator && 'persist' in navigator.storage && (
                  <button
                    className="secondary"
                    disabled={locked}
                    onClick={() =>
                      run(async () => {
                        const granted = await navigator.storage.persist()
                        setStorageMessage(
                          granted
                            ? 'Persistent storage is enabled. Keep JSON backups too; clearing browser data still deletes your wheels.'
                            : 'The browser did not grant persistent storage. Your wheels are still saved locally; keep JSON backups.',
                        )
                      })
                    }
                  >
                    Protect local storage
                  </button>
                )}
                {storageMessage && <p role="status">{storageMessage}</p>}
              </section>
              <Library
                wheels={data.wheels}
                active={data.active}
                run={run}
                openEditor={() => navigate('options')}
              />
            </>
          ) : (
            <>
              {sitePath === '/random-number-wheel' && (
                <NumberRange
                  disabled={locked}
                  apply={(labels) =>
                    edit({
                      title: `Numbers ${labels[0]} to ${labels[labels.length - 1]}`,
                      options: labels.map((label) => ({
                        id: crypto.randomUUID(),
                        label,
                        active: true,
                        image: null,
                      })),
                    })
                  }
                />
              )}
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
                    <h2
                      className={config.show_title ? 'wheel-title' : 'sr-only'}
                      title={wheel.title}
                    >
                      {wheel.title}
                    </h2>
                  </div>
                  <div className="wheel-area">
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
                        screen === 'wheel' &&
                        !shareOpen &&
                        !shared
                      }
                      canSpin={canSpin}
                      onSpin={spin}
                    />
                  </div>
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
                    <h2>{t.options}</h2>
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
                  <button
                    className="secondary"
                    disabled={
                      locked ||
                      (!data.removed.some((item) => item.wheel_id === wheel.id) &&
                        wheel.options.every((option) => option.active))
                    }
                    onClick={() =>
                      run(async () => {
                        await restoreEntries(wheel.id)
                        setResult(null)
                        setSpinOptions(null)
                      })
                    }
                  >
                    Restore entries
                  </button>
                  <div className="save-bar">
                    <span>
                      <Check size={14} />
                      {t.saved}
                    </span>
                    <div>
                      <button
                        className="secondary"
                        disabled={locked || !valid}
                        onClick={() =>
                          run(async () => {
                            await flushStorage()
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
                            setShareUrl('')
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
        </div>
        {screen === 'wheel' && !presenting && pages[sitePath].kind === 'wheel' && (
          <>
            <HomeInfo />
            <SiteDetails path={sitePath} />
          </>
        )}
      </main>
      <footer>
        {!presenting && <SiteFooter />}
        <PwaControls busy={locked} report={setMessage} />
      </footer>
      {pages[sitePath].kind === 'wheel' && (
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
      )}

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
          <p className="muted">
            This link contains the title, entries, images and settings of this wheel. Results and
            other wheels are excluded. No upload is made. Anyone with the link can read and copy it.
            Links cannot be revoked; use JSON export for large wheels.
          </p>
          <button
            className="primary full-width"
            disabled={busy || !valid}
            onClick={() =>
              run(async () => {
                setShareUrl(createShareLink(wheel))
              })
            }
          >
            <Plus size={18} />
            {t.createLink}
          </button>
          {shareUrl && (
            <div className="share-row">
              <input aria-label={t.share} readOnly value={shareUrl} />
              <div>
                <button className="text-button" disabled={busy} onClick={() => copy(shareUrl)}>
                  {t.copyLink}
                </button>
                {'share' in navigator && (
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        await navigator.share({ title: wheel.title, url: shareUrl })
                      })
                    }
                  >
                    {t.nativeShare}
                  </button>
                )}
              </div>
            </div>
          )}
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
