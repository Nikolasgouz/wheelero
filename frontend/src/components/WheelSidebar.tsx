import { useEffect, useState } from 'react'
import {
  ArrowDownAZ,
  History,
  Pencil,
  Plus,
  Settings2,
  Shuffle,
  Trash2,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { t } from '../i18n'
import { ct } from '../customization.i18n'
import type { LocalWheel, Wheel } from '../types'
import { shuffled } from '../lib/random'

const alphabetical = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

export function WheelSidebar({
  wheel,
  disabled,
  edit,
  tab,
  setTab,
  customize,
  openEditor,
  clear,
}: {
  wheel: LocalWheel
  disabled: boolean
  edit: (patch: Partial<Pick<Wheel, 'options'>>) => void
  tab: 'entries' | 'results'
  setTab: (tab: 'entries' | 'results') => void
  customize: () => void
  openEditor: () => void
  clear: (section: 'entries' | 'results') => void
}) {
  const [newEntry, setNewEntry] = useState(
    () => localStorage.getItem(`sidebar-draft:${wheel.id}`) ?? '',
  )
  const [page, setPage] = useState(0)
  const [allHistory, setAllHistory] = useState(false)
  const currentPage = Math.min(page, Math.max(0, Math.ceil(wheel.options.length / 100) - 1))
  useEffect(() => {
    localStorage.setItem(`sidebar-draft:${wheel.id}`, newEntry)
  }, [newEntry, wheel.id])

  return (
    <aside className="wheel-sidebar card" aria-label={t.wheelDetails}>
      <div className="sidebar-tabs" role="tablist" aria-label={t.wheelDetails}>
        {(['entries', 'results'] as const).map((key) => (
          <button
            key={key}
            role="tab"
            id={`sidebar-tab-${key}`}
            aria-controls={`sidebar-${key}`}
            aria-selected={tab === key}
            tabIndex={tab === key ? 0 : -1}
            aria-label={key === 'entries' ? t.options : t.results}
            onClick={() => setTab(key)}
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
              event.preventDefault()
              const next =
                event.key === 'Home'
                  ? 'entries'
                  : event.key === 'End'
                    ? 'results'
                    : key === 'entries'
                      ? 'results'
                      : 'entries'
              setTab(next)
              document.getElementById(`sidebar-tab-${next}`)!.focus()
            }}
          >
            {key === 'entries' ? t.options : t.results}
            <span className="count-badge" aria-hidden="true">
              {key === 'entries' ? wheel.options.length : wheel.results.length}
            </span>
          </button>
        ))}
      </div>
      <fieldset className="sidebar-actions" disabled={disabled} aria-label={t.wheelActions}>
        <button className="secondary" onClick={customize}>
          <Settings2 size={14} />
          {ct.title}
        </button>
        <button
          className="secondary"
          disabled={wheel.options.length < 2}
          onClick={() => {
            edit({ options: shuffled(wheel.options) })
            setPage(0)
          }}
        >
          <Shuffle size={14} />
          {t.shuffle}
        </button>
        <button
          className="secondary"
          disabled={wheel.options.length < 2}
          onClick={() => {
            edit({
              options: [...wheel.options].sort((a, b) => alphabetical.compare(a.label, b.label)),
            })
            setPage(0)
          }}
        >
          <ArrowDownAZ size={14} />
          {t.sort}
        </button>
      </fieldset>
      <div
        role="tabpanel"
        id="sidebar-entries"
        aria-labelledby="sidebar-tab-entries"
        hidden={tab !== 'entries'}
        className="sidebar-panel"
      >
        <div className="sidebar-list-heading">
          <p className="sidebar-edit-hint" id="sidebar-edit-hint">
            {t.editEntriesHint}
          </p>
          <button
            className="text-button"
            aria-label={t.clearEntries}
            disabled={disabled || !wheel.options.length}
            onClick={() => {
              clear('entries')
              setPage(0)
              setNewEntry('')
            }}
          >
            <Trash2 size={14} /> {t.clear}
          </button>
        </div>
        <fieldset disabled={disabled}>
          <div className="sidebar-entry-list">
            {wheel.options
              .slice(currentPage * 100, (currentPage + 1) * 100)
              .map((option, offset) => (
                <div
                  className={`sidebar-entry ${wheel.no_repeat && !option.active ? 'used' : ''}`}
                  key={option.id}
                >
                  <span aria-hidden="true">{currentPage * 100 + offset + 1}</span>
                  <input
                    aria-label={t.entryLabel(currentPage * 100 + offset + 1)}
                    aria-describedby="sidebar-edit-hint"
                    value={option.label}
                    maxLength={160}
                    onFocus={(event) => event.currentTarget.select()}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') event.currentTarget.blur()
                    }}
                    onChange={(event) =>
                      edit({
                        options: wheel.options.map((o) =>
                          o.id === option.id ? { ...o, label: event.target.value } : o,
                        ),
                      })
                    }
                    onBlur={() => {
                      if (!option.label.trim())
                        edit({ options: wheel.options.filter((o) => o.id !== option.id) })
                    }}
                  />
                  <button
                    className="icon-button"
                    aria-label={`${t.editEntry}: ${option.label}`}
                    title={t.editEntry}
                    onClick={(event) => {
                      const input = event.currentTarget.parentElement!.querySelector('input')!
                      input.focus()
                      input.select()
                    }}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`${t.removeEntry}: ${option.label}`}
                    onClick={() =>
                      edit({ options: wheel.options.filter((o) => o.id !== option.id) })
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            {!wheel.options.length && <p className="empty-history">{t.insufficient}</p>}
          </div>
          {wheel.options.length > 100 && (
            <div className="editor-pages">
              <button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
                {ct.previous}
              </button>
              <span>
                {currentPage + 1} / {Math.ceil(wheel.options.length / 100)}
              </span>
              <button
                disabled={(currentPage + 1) * 100 >= wheel.options.length}
                onClick={() => setPage(currentPage + 1)}
              >
                {ct.next}
              </button>
            </div>
          )}
          <form
            className="add-option sidebar-add"
            onSubmit={(event) => {
              event.preventDefault()
              if (!newEntry.trim() || wheel.options.length >= 10000) return
              edit({
                options: [
                  ...wheel.options,
                  { id: crypto.randomUUID(), label: newEntry.trim(), active: true, image: null },
                ],
              })
              setNewEntry('')
            }}
          >
            <input
              aria-label={t.newEntry}
              placeholder={t.newEntry}
              maxLength={160}
              value={newEntry}
              onChange={(event) => setNewEntry(event.target.value)}
            />
            <button
              className="icon-button"
              aria-label={t.addEntry}
              disabled={!newEntry.trim() || wheel.options.length >= 10000}
            >
              <Plus size={19} />
            </button>
          </form>
        </fieldset>
      </div>
      <div
        role="tabpanel"
        id="sidebar-results"
        aria-labelledby="sidebar-tab-results"
        hidden={tab !== 'results'}
        className="sidebar-panel"
      >
        <div className="history">
          <div className="history-heading">
            <History size={15} />
            <span>{t.history}</span>
            <span>{t.historyCount(wheel.results.length)}</span>
            <button
              className="text-button"
              aria-label={t.clearResults}
              disabled={disabled || !wheel.results.length}
              onClick={() => {
                clear('results')
                setAllHistory(false)
              }}
            >
              <Trash2 size={14} /> {t.clear}
            </button>
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
                    title={new Date(r.created_at).toLocaleString('en-GB')}
                  >
                    {new Date(r.created_at).toLocaleTimeString('en-GB', {
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
      </div>
      <button className="sidebar-more-options text-button" disabled={disabled} onClick={openEditor}>
        {t.moreOptions}
      </button>
    </aside>
  )
}
