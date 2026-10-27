import { ct } from '../customization.i18n'
import { useState } from 'react'
import { readImage } from '../customization'
import { translate } from '../locale'

export function ImagePicker({
  label,
  value,
  change,
  busyChanged,
}: {
  label: string
  value: string | null
  change: (image: string | null) => void
  busyChanged: (busy: boolean) => void
}) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  return (
    <fieldset className="image-picker" disabled={loading}>
      <legend>{label}</legend>
      {value && <img className="image-preview" src={value} alt={label} />}
      <label className="image-upload">
        {ct.upload}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (!file) return
            setLoading(true)
            busyChanged(true)
            setError('')
            void readImage(file)
              .then(change)
              .catch((error: Error) => setError(error.message))
              .finally(() => {
                setLoading(false)
                busyChanged(false)
              })
          }}
        />
      </label>
      <div className="image-gallery" aria-label={ct.gallery}>
        {Object.entries(ct.images).map(([src, name]) => (
          <button type="button" key={src} aria-pressed={value === src} onClick={() => change(src)}>
            <img src={src} alt="" />
            <span>{name}</span>
          </button>
        ))}
      </div>
      {value && (
        <button type="button" className="text-button" onClick={() => change(null)}>
          {ct.removeImage}
        </button>
      )}
      {loading && <p role="status">{ct.loading}</p>}
      {error && <p role="alert">{translate(error)}</p>}
    </fieldset>
  )
}
