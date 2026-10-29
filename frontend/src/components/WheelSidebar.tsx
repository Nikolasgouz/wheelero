import { useEffect, useMemo, useState } from 'react'
import { ArrowDownAZ, Download, History, Shuffle, Trash2, Wifi, Laptop } from 'lucide-react'
import { t } from '../i18n'
import type { LocalWheel, Wheel } from '../types'
import { shuffled } from '../lib/random'
import { resultsText } from '../lib/results'
import { parseEntries, reconcileEntries } from '../lib/entries'

const alphabetical = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

export function WheelSidebar({
  wheel,
  disabled,
  edit,
  tab,
  setTab,
  openEditor,
  clear,
}: {
  wheel: LocalWheel
  disabled: boolean
  edit: (patch: Partial<Pick<Wheel, 'options'>>) => void
  tab: 'entries' | 'results'
  setTab: (tab: 'entries' | 'results') => void
  openEditor: () => void
  clear: (section: 'entries' | 'results') => void
}) {
  const source = wheel.options.map((option) => option.label).join('\n')
  const [draft, setDraft] = useState({ source, text: source })
  const [overLimit, setOverLimit] = useState(false)
  if (draft.source !== source) setDraft({ source, text: source })
  const [allHistory, setAllHistory] = useState(false)
  const [sortedResults, setSortedResults] = useState(
    () => localStorage.getItem(`result-sort:${wheel.id}`) === 'true',
  )
  const results = useMemo(
    () =>
      sortedResults
        ? [...wheel.results].sort((a, b) => alphabetical.compare(a.label, b.label))
        : wheel.results,
    [wheel.results, sortedResults],
  )
  useEffect(() => {
    localStorage.setItem(`result-sort:${wheel.id}`, String(sortedResults))
  }, [sortedResults, wheel.id])

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
      <fieldset
        className="sidebar-actions"
        disabled={disabled}
        aria-label={t.wheelActions}
        hidden={tab !== 'entries'}
      >
        <button
          className="secondary"
          disabled={wheel.options.length < 2}
          onClick={() => {
            edit({ options: shuffled(wheel.options) })
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
          }}
        >
          <ArrowDownAZ size={14} />
          {t.sort}
        </button>
        <button
          className="secondary"
          aria-label={t.clearEntries}
          disabled={!wheel.options.length}
          onClick={() => {
            clear('entries')
            setDraft({ source: '', text: '' })
            setOverLimit(false)
          }}
        >
          <Trash2 size={14} /> {t.clear}
        </button>
      </fieldset>
      <fieldset
        className="sidebar-actions result-toolbar"
        disabled={disabled}
        aria-label={t.resultActions}
        hidden={tab !== 'results'}
      >
        <button
          className="secondary"
          disabled={results.length < 2}
          aria-pressed={sortedResults}
          onClick={() => {
            setSortedResults(!sortedResults)
            setAllHistory(true)
          }}
        >
          <ArrowDownAZ size={14} /> {t.sort}
        </button>
        <button
          className="secondary"
          aria-label={t.clearResults}
          disabled={!results.length}
          onClick={() => {
            clear('results')
            setAllHistory(false)
            setSortedResults(false)
          }}
        >
          <Trash2 size={14} /> {t.clear}
        </button>
        <button
          className="secondary"
          disabled={!results.length}
          onClick={() => {
            const url = URL.createObjectURL(
              new Blob([resultsText(wheel.title, results)], { type: 'text/plain;charset=utf-8' }),
            )
            const link = document.createElement('a')
            link.href = url
            link.download = `wheelero-results-${wheel.id}-${new Date().toISOString().slice(0, 10)}.txt`
            document.body.append(link)
            link.click()
            link.remove()
            window.setTimeout(() => URL.revokeObjectURL(url), 1000)
          }}
        >
          <Download size={14} /> {t.exportResults}
        </button>
      </fieldset>
      <div
        role="tabpanel"
        id="sidebar-entries"
        aria-labelledby="sidebar-tab-entries"
        hidden={tab !== 'entries'}
        className="sidebar-panel"
      >
        <textarea
          className="entries-textarea"
          aria-label={t.options}
          placeholder={t.pasteHint}
          disabled={disabled}
          spellCheck={false}
          maxLength={1610000}
          value={draft.text}
          onChange={(event) => {
            const text = event.currentTarget.value
            const labels = parseEntries(text)
            if (labels.length > 10000 || labels.some((label) => label.length > 160)) {
              setOverLimit(true)
              return
            }
            setOverLimit(false)
            setDraft({ source: labels.join('\n'), text })
            edit({
              options: reconcileEntries(
                wheel.options,
                labels,
                parseEntries(text.slice(0, event.currentTarget.selectionStart)).length,
              ),
            })
          }}
        />
        {overLimit && (
          <p className="entries-limit" role="alert">
            {t.limit}
          </p>
        )}
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
            <span>{sortedResults ? t.sortedResults : t.history}</span>
            <span>{t.historyCount(wheel.results.length)}</span>
          </div>
          {wheel.results.length ? (
            <ol>
              {(allHistory ? results : results.slice(0, 5)).map((r) => (
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
                      <Laptop size={12} aria-label={t.offlineResult} />
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
