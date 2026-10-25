import { ct } from '../customization.i18n'
import { useState } from 'react'
import { gallery, readImage } from '../customization'

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
              .catch((error) => setError(String(error)))
              .finally(() => {
                setLoading(false)
                busyChanged(false)
              })
          }}
        />
      </label>
      <div className="image-gallery" aria-label={ct.gallery}>
        {gallery.map((image) => (
          <button
            type="button"
            key={image.src}
            aria-pressed={value === image.src}
            onClick={() => change(image.src)}
          >
            <img src={image.src} alt="" />
            <span>{image.name}</span>
          </button>
        ))}
      </div>
      {value && (
        <button type="button" className="text-button" onClick={() => change(null)}>
          {ct.removeImage}
        </button>
      )}
      {loading && <p role="status">{ct.loading}</p>}
      {error && <p role="alert">{error}</p>}
    </fieldset>
  )
}
