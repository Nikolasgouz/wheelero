import { useState } from 'react'
import { Dialog } from './Dialog'
import { t } from '../i18n'
import { ct } from '../customization.i18n'
import { saveWheel } from '../state/store'
import type { LocalWheel } from '../types'

export function SaveWheel({
  wheel,
  close,
  saved,
}: {
  wheel: LocalWheel
  close: () => void
  saved: () => void
}) {
  const [title, setTitle] = useState(wheel.title)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  return (
    <Dialog
      title={t.save}
      close={() => {
        if (!saving) close()
      }}
    >
      <form
        className="save-wheel-form"
        onSubmit={(event) => {
          event.preventDefault()
          setSaving(true)
          setError('')
          void saveWheel(wheel.id, title.trim())
            .then(saved)
            .catch((error: unknown) => {
              setError(error instanceof Error ? error.message : String(error))
            })
            .finally(() => setSaving(false))
        }}
      >
        <label>
          {t.title}
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={120}
            disabled={saving}
          />
        </label>
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
        <div className="result-actions">
          <button type="button" className="secondary" onClick={close} disabled={saving}>
            {ct.cancel}
          </button>
          <button className="primary" disabled={saving || !title.trim()}>
            {t.save}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
