import { useState } from 'react'
import { Dialog } from './Dialog'
import { parseEntries } from '../lib/entries'
import { translate } from '../locale'
import { t } from '../i18n'
import { ct } from '../customization.i18n'

export function PasteList({
  count,
  close,
  apply,
}: {
  count: number
  close: () => void
  apply: (text: string, mode: 'replace' | 'add') => Promise<void>
}) {
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const labels = parseEntries(text)
  const valid =
    labels.length > 0 && labels.length <= 10000 && labels.every((label) => label.length <= 160)
  async function submit(mode: 'replace' | 'add') {
    setSaving(true)
    setError('')
    try {
      await apply(text, mode)
      close()
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setSaving(false)
    }
  }
  return (
    <Dialog
      title={translate('Paste a list')}
      close={() => {
        if (!saving) close()
      }}
    >
      <div className="paste-list">
        <label htmlFor="paste-list">{t.pasteHint}</label>
        <textarea
          id="paste-list"
          rows={8}
          autoFocus
          maxLength={1610000}
          disabled={saving}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <p role="status">
          {translate('{n} entries ready to import').replace('{n}', String(labels.length))}
        </p>
        <p className="muted">
          {translate('Blank lines are ignored. Duplicate names keep separate chances.')}
        </p>
        <p className="muted">
          {translate('Replace starts a new list. Add keeps your current entries and round.')}
        </p>
        {labels.length > 0 && !valid && <p role="alert">{t.limit}</p>}
        {error && <p role="alert">{translate(error)}</p>}
        <div className="dialog-actions">
          <button className="secondary" disabled={saving} onClick={close}>
            {ct.cancel}
          </button>
          <button
            className="secondary"
            disabled={saving || !valid}
            onClick={() => void submit('replace')}
          >
            {translate('Replace current entries')}
          </button>
          <button
            className="primary"
            disabled={saving || !valid || count + labels.length > 10000}
            onClick={() => void submit('add')}
          >
            {translate('Add to current entries')}
          </button>
        </div>
        {valid && count + labels.length > 10000 && <p>{t.limit}</p>}
      </div>
    </Dialog>
  )
}
