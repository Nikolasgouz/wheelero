import { ct } from '../customization.i18n'
import {
  ImagePlus,
  ArrowDown,
  ArrowUp,
  ClipboardList,
  Plus,
  RotateCcw,
  Shuffle,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Dialog } from '../components/Dialog'
import { ImagePicker } from '../components/ImagePicker'
import { t } from '../i18n'
import { colors } from '../lib/geometry'
import { parseEntries } from '../lib/entries'
import { shuffled } from '../lib/random'
import type { LocalWheel, Option, Wheel } from '../types'

export function Editor({
  wheel,
  disabled,
  edit,
  report,
}: {
  wheel: LocalWheel
  disabled: boolean
  edit: (patch: Partial<Pick<Wheel, 'title' | 'options' | 'no_repeat'>>) => void
  report: (message: string) => void
}) {
  const [{ bulk, newLabel }, setDraft] = useState<{ bulk: string | null; newLabel: string }>(() =>
    JSON.parse(localStorage.getItem(`draft:${wheel.id}`) ?? '{"bulk":null,"newLabel":""}'),
  )
  useEffect(() => {
    localStorage.setItem(`draft:${wheel.id}`, JSON.stringify({ bulk, newLabel }))
  }, [bulk, newLabel, wheel.id])
  const [imageOption, setImageOption] = useState<string | null>(null)
  const [imageBusy, setImageBusy] = useState(false)
  const [page, setPage] = useState(0)
  const currentPage = Math.min(page, Math.max(0, Math.ceil(wheel.options.length / 200) - 1))
  const duplicate = new Set(wheel.options.map((o) => o.label)).size !== wheel.options.length
  function add(labels: string[]) {
    if (labels.length + wheel.options.length > 10000 || labels.some((v) => v.length > 160)) {
      report('Up to 10,000 entries, with up to 160 characters each.')
      return
    }
    edit({
      options: [
        ...wheel.options,
        ...labels.map((label) => ({ id: crypto.randomUUID(), label, active: true, image: null })),
      ],
    })
    setDraft({ newLabel: '', bulk: null })
  }
  function move(index: number, direction: number) {
    const options = [...wheel.options]
    ;[options[index], options[index + direction]] = [options[index + direction], options[index]]
    edit({ options })
  }
  function update(option: Option, label: string) {
    edit({ options: wheel.options.map((o) => (o.id === option.id ? { ...o, label } : o)) })
  }
  return (
    <section className="editor card" aria-labelledby="editor-title">
      <div className="section-heading">
        <div>
          <h2 id="editor-title">{t.edit}</h2>
          <p>{t.editHint}</p>
        </div>
      </div>
      <fieldset disabled={disabled}>
        <label className="field-label" htmlFor="wheel-title">
          {t.title}
        </label>
        <input
          id="wheel-title"
          className="title-input"
          value={wheel.title}
          maxLength={120}
          placeholder={t.placeholder}
          onChange={(e) => edit({ title: e.target.value })}
          onBlur={() => {
            if (!wheel.title.trim()) edit({ title: t.newTitle })
          }}
        />
        <div className="options-heading">
          <label className="field-label">
            {t.options} <span className="count-badge">{wheel.options.length}</span>
          </label>
          <div>
            <button
              className="text-button"
              onClick={() =>
                setDraft((current) => ({ ...current, bulk: bulk === null ? '' : null }))
              }
            >
              <ClipboardList size={14} />
              {t.paste}
            </button>
            <button
              className="icon-button"
              title={t.shuffle}
              aria-label={t.shuffle}
              disabled={wheel.options.length < 2}
              onClick={() => edit({ options: shuffled(wheel.options) })}
            >
              <Shuffle size={16} />
            </button>
          </div>
        </div>
        {bulk !== null && (
          <div className="bulk-editor">
            <label htmlFor="bulk-options">{t.pasteHint}</label>
            <textarea
              id="bulk-options"
              rows={5}
              value={bulk}
              onChange={(e) => setDraft((current) => ({ ...current, bulk: e.target.value }))}
            />
            <button className="secondary small" onClick={() => add(parseEntries(bulk))}>
              {t.pasteApply}
            </button>
          </div>
        )}
        <div className="option-list">
          {wheel.options.slice(currentPage * 200, (currentPage + 1) * 200).map((option, offset) => {
            const i = currentPage * 200 + offset
            return (
              <div
                className={`option-row ${!option.active && wheel.no_repeat ? 'used' : ''}`}
                key={option.id}
              >
                <span className="option-dot" style={{ background: colors[i % colors.length] }} />
                <input
                  aria-label={t.optionLabel(i + 1)}
                  value={option.label}
                  maxLength={160}
                  onChange={(e) => update(option, e.target.value)}
                  onBlur={() => {
                    if (!option.label.trim())
                      edit({ options: wheel.options.filter((o) => o.id !== option.id) })
                  }}
                />
                <button
                  className="icon-button"
                  aria-label={ct.entry(option.label)}
                  onClick={() => setImageOption(option.id)}
                >
                  {option.image ? (
                    <img className="entry-thumbnail" src={option.image} alt="" />
                  ) : (
                    <ImagePlus size={15} />
                  )}
                </button>
                <div className="reorder">
                  <button
                    aria-label={`${t.up}: ${option.label}`}
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    aria-label={`${t.down}: ${option.label}`}
                    disabled={i === wheel.options.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>
                <button
                  className="icon-button remove-option"
                  aria-label={`${t.remove}: ${option.label}`}
                  onClick={() => edit({ options: wheel.options.filter((o) => o.id !== option.id) })}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )
          })}
        </div>
        {wheel.options.length > 200 && (
          <div className="editor-pages">
            <button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
              {ct.previous}
            </button>
            <span>
              {currentPage + 1} / {Math.ceil(wheel.options.length / 200)}
            </span>
            <button
              disabled={(currentPage + 1) * 200 >= wheel.options.length}
              onClick={() => setPage(currentPage + 1)}
            >
              {ct.next}
            </button>
          </div>
        )}
        <form
          className="add-option"
          onSubmit={(e) => {
            e.preventDefault()
            if (newLabel.trim()) add([newLabel.trim()])
          }}
        >
          <input
            aria-label={t.optionPlaceholder}
            placeholder={t.optionPlaceholder}
            value={newLabel}
            maxLength={160}
            onChange={(e) => setDraft((current) => ({ ...current, newLabel: e.target.value }))}
          />
          <button
            className="icon-button"
            disabled={!newLabel.trim() || wheel.options.length === 10000}
            aria-label={t.add}
          >
            <Plus size={20} />
          </button>
        </form>
        {duplicate && (
          <div className="warning">
            <p>{t.duplicate}</p>
            <button
              className="text-button"
              onClick={() =>
                edit({
                  options: wheel.options.filter(
                    (o, i, a) => a.findIndex((v) => v.label === o.label) === i,
                  ),
                })
              }
            >
              {t.dedupe}
            </button>
          </div>
        )}
        <div className="repeat-setting">
          <div>
            <label htmlFor="no-repeat">{t.noRepeat}</label>
            <p>{t.noRepeatHint}</p>
          </div>
          <input
            id="no-repeat"
            role="switch"
            type="checkbox"
            checked={wheel.no_repeat}
            onChange={(e) =>
              edit({
                no_repeat: e.target.checked,
                options: wheel.options.map((o) => ({ ...o, active: true })),
              })
            }
          />
        </div>
        {wheel.no_repeat && wheel.options.some((o) => !o.active) && (
          <button
            className="text-button reset"
            onClick={() => edit({ options: wheel.options.map((o) => ({ ...o, active: true })) })}
          >
            <RotateCcw size={14} />
            {t.reset}
          </button>
        )}
      </fieldset>
      {imageOption && (
        <Dialog
          title={ct.imageTitle}
          close={() => {
            if (!imageBusy) setImageOption(null)
          }}
        >
          <ImagePicker
            busyChanged={setImageBusy}
            label={ct.entryImage}
            value={wheel.options.find((o) => o.id === imageOption)!.image}
            change={(image) =>
              edit({
                options: wheel.options.map((o) => (o.id === imageOption ? { ...o, image } : o)),
              })
            }
          />
        </Dialog>
      )}
    </section>
  )
}
