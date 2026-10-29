import { ct } from '../customization.i18n'
import { useEffect, useRef, useState } from 'react'
import { customizationSchema, palettes, type Customization } from '../customization'
import { playSound, stopSounds } from '../lib/audio'
import { Dialog } from './Dialog'
import { ImagePicker } from './ImagePicker'

export function Customize({
  value,
  close,
  save,
}: {
  value: Customization
  close: () => void
  save: (value: Customization) => Promise<void>
}) {
  const [draft, setDraft] = useState(() => structuredClone(value))
  const [tab, setTab] = useState(0)
  const [saving, setSaving] = useState(false)
  const [uploads, setUploads] = useState(0)
  const [error, setError] = useState('')
  const preview = useRef<() => void>(() => {})
  useEffect(() => () => stopSounds(), [])
  function patch(patch: Partial<Customization>) {
    setDraft((current) => ({ ...current, ...patch }))
  }
  function check(key: keyof Customization, label: string) {
    return (
      <label className="custom-check">
        <input
          type="checkbox"
          checked={Boolean(draft[key])}
          onChange={(e) => patch({ [key]: e.target.checked })}
        />
        {label}
      </label>
    )
  }
  function range(
    key: 'spin_volume' | 'result_volume' | 'duration' | 'max_names',
    label: string,
    min: number,
    max: number,
  ) {
    return (
      <label className="custom-range">
        {label}
        <output>
          {draft[key]}
          {max === 100 ? '%' : ''}
        </output>
        <input
          type="range"
          min={min}
          max={max}
          value={draft[key]}
          onChange={(e) => {
            preview.current()
            patch({ [key]: Number(e.target.value) })
          }}
        />
        <input
          aria-label={ct.value(label)}
          type="number"
          min={min}
          max={max}
          value={draft[key]}
          onChange={(e) => {
            preview.current()
            patch({ [key]: Number(e.target.value) })
          }}
        />
      </label>
    )
  }
  function sound(after: boolean) {
    const key = after ? 'result_sound' : 'spin_sound'
    return (
      <div className="sound-setting">
        <label>
          {after ? ct.resultSound : ct.spinSound}
          <select
            aria-label={after ? ct.resultSound : ct.spinSound}
            value={draft[key]}
            onChange={(e) => {
              preview.current()
              patch({ [key]: e.target.value })
            }}
          >
            {Object.entries(after ? ct.result : ct.spin).map(([id, text]) => (
              <option key={id} value={id}>
                {text}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="secondary"
          disabled={draft[key] === 'none'}
          onClick={() => {
            preview.current()
            preview.current = playSound(
              draft[key],
              after ? draft.result_volume : draft.spin_volume,
              (error) => setError(error instanceof Error ? error.message : String(error)),
              after ? 0 : draft.duration,
            )
          }}
        >
          {ct.play}
        </button>
        <button type="button" className="secondary" onClick={() => preview.current()}>
          {ct.stop}
        </button>
      </div>
    )
  }
  return (
    <Dialog
      title={ct.title}
      close={() => {
        if (!saving) close()
      }}
    >
      <div className="customization">
        <div role="tablist" aria-label={ct.settings} className="custom-tabs">
          {ct.tabs.map((label, index) => (
            <button
              key={label}
              role="tab"
              disabled={saving}
              id={`custom-tab-${index}`}
              aria-controls={`custom-panel-${index}`}
              aria-selected={tab === index}
              tabIndex={tab === index ? 0 : -1}
              onClick={() => {
                preview.current()
                setTab(index)
              }}
              onKeyDown={(e) => {
                if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return
                e.preventDefault()
                const next =
                  e.key === 'Home'
                    ? 0
                    : e.key === 'End'
                      ? 2
                      : (tab + (e.key === 'ArrowRight' ? 1 : 2)) % 3
                preview.current()
                setTab(next)
                document.getElementById(`custom-tab-${next}`)!.focus()
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <form
          aria-busy={saving}
          onSubmit={(e) => {
            e.preventDefault()
            const parsed = customizationSchema.safeParse(draft)
            if (!parsed.success || saving || uploads > 0) return
            setSaving(true)
            setError('')
            void save(parsed.data)
              .catch((error) => setError(String(error)))
              .finally(() => setSaving(false))
          }}
        >
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <fieldset disabled={saving} style={{ border: 0, padding: 0, margin: 0 }}>
            <div
              role="tabpanel"
              id={`custom-panel-${tab}`}
              aria-labelledby={`custom-tab-${tab}`}
              className="custom-panel"
            >
              {tab === 0 && (
                <>
                  {sound(false)}
                  {range('spin_volume', ct.spinVolume, 0, 100)}
                  {range('duration', ct.duration, 1, 60)}
                  <div className="custom-extra">
                    {check('show_duplicates', ct.duplicates)}
                    {check('slow_spin', ct.slow)}
                    {check('show_title', ct.showTitle)}
                    {range('max_names', ct.maxNames, 4, 1000)}
                  </div>
                </>
              )}
              {tab === 1 && (
                <>
                  {sound(true)}
                  {range('result_volume', ct.resultVolume, 0, 100)}
                  {check('confetti', ct.confetti)}
                  {check('popup', ct.popup)}
                  <label>
                    {ct.message}
                    <input
                      value={draft.popup_message}
                      disabled={!draft.popup}
                      maxLength={200}
                      required
                      onChange={(e) => patch({ popup_message: e.target.value })}
                    />
                  </label>
                  <div className="custom-extra">
                    {check('animate_winner', ct.animate)}
                    {check('auto_remove', ct.autoRemove)}
                    {check('remove_button', ct.remove)}
                    {check('removal_sound', ct.click)}
                  </div>
                </>
              )}
              {tab === 2 && (
                <>
                  <fieldset className="appearance-modes">
                    <legend>{ct.appearance}</legend>
                    <label>
                      <input
                        type="radio"
                        name="appearance"
                        checked={draft.mode === 'colors'}
                        onChange={() => patch({ mode: 'colors' })}
                      />
                      {ct.colors}
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="appearance"
                        checked={draft.mode === 'image'}
                        onChange={() => patch({ mode: 'image' })}
                      />
                      {ct.background}
                    </label>
                  </fieldset>
                  {draft.mode === 'colors' ? (
                    <>
                      <label>
                        {ct.theme}
                        <select
                          aria-label={ct.theme}
                          defaultValue=""
                          onChange={(e) =>
                            patch({
                              palette: palettes[e.target.value as keyof typeof palettes].map(
                                (color) => ({ color, enabled: true }),
                              ),
                            })
                          }
                        >
                          <option value="" disabled>
                            {ct.chooseTheme}
                          </option>
                          {Object.entries(ct.themes).map(([id, label]) => (
                            <option key={id} value={id}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="custom-extra">
                        <fieldset>
                          <legend>{ct.palette}</legend>
                          <p className="muted">{ct.uniqueColors}</p>
                          <div className="palette-editor">
                            {draft.palette.map((color, index) => (
                              <div key={index}>
                                <input
                                  type="checkbox"
                                  aria-label={ct.activeColor(index + 1)}
                                  checked={color.enabled}
                                  disabled={
                                    color.enabled &&
                                    draft.palette.filter((c) => c.enabled).length === 1
                                  }
                                  onChange={(e) =>
                                    patch({
                                      palette: draft.palette.map((c, i) =>
                                        i === index ? { ...c, enabled: e.target.checked } : c,
                                      ),
                                    })
                                  }
                                />
                                <input
                                  type="color"
                                  aria-label={ct.color(index + 1)}
                                  value={color.color}
                                  onChange={(e) =>
                                    patch({
                                      palette: draft.palette.map((c, i) =>
                                        i === index ? { ...c, color: e.target.value } : c,
                                      ),
                                    })
                                  }
                                />
                              </div>
                            ))}
                            <button
                              type="button"
                              className="secondary"
                              disabled={draft.palette.length === 12}
                              onClick={() =>
                                patch({
                                  palette: [...draft.palette, { color: '#7650cc', enabled: true }],
                                })
                              }
                            >
                              {ct.addColor}
                            </button>
                          </div>
                        </fieldset>
                      </div>
                    </>
                  ) : (
                    <ImagePicker
                      busyChanged={(busy) => setUploads((count) => count + (busy ? 1 : -1))}
                      label={ct.fullImage}
                      value={draft.wheel_image}
                      change={(wheel_image) => patch({ wheel_image })}
                    />
                  )}
                  <div className="custom-extra">
                    <label className="color-setting">
                      {ct.page}
                      <input
                        type="color"
                        value={draft.page_color}
                        onChange={(e) => patch({ page_color: e.target.value })}
                      />
                    </label>
                    {check('gradient', ct.gradient)}
                    <label>
                      {ct.text}
                      <select
                        aria-label={ct.text}
                        value={draft.text}
                        onChange={(e) => patch({ text: e.target.value as Customization['text'] })}
                      >
                        <option value="always">{ct.always}</option>
                        <option value="never">{ct.never}</option>
                        <option value="unless_image">{ct.unlessImage}</option>
                      </select>
                    </label>
                    {check('borders', ct.borders)}
                    {check('shadow', ct.shadow)}
                    {check('pointer_changes', ct.pointer)}
                  </div>
                </>
              )}
            </div>
          </fieldset>
          <div className="custom-footer">
            <button type="button" className="secondary" disabled={saving} onClick={close}>
              {ct.cancel}
            </button>
            <button
              className="primary"
              disabled={saving || uploads > 0 || !customizationSchema.safeParse(draft).success}
            >
              OK
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}
