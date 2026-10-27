import { useState } from 'react'
import { Users, RotateCcw } from 'lucide-react'
import { Dialog } from './Dialog'
import { t } from '../i18n'
import { ct } from '../customization.i18n'
import { translate } from '../locale'
import type { LocalWheel } from '../types'
import { activeOptions, makeWheel } from '../state/wheel'
import { addWheels, editWheel, selectWheel } from '../state/store'

export function ClassroomPicker({
  wheels,
  current,
  close,
  ready,
  run,
  busy,
}: {
  wheels: LocalWheel[]
  current: LocalWheel
  close: () => void
  ready: () => void
  run: (task: () => Promise<unknown>) => void
  busy: boolean
}) {
  const [title, setTitle] = useState('')
  return (
    <Dialog
      title={translate('Classroom')}
      close={() => {
        if (!busy) close()
      }}
    >
      <p>
        {translate(
          'Save a class, mark absences, and give everyone a turn. Classes also appear in My wheels.',
        )}
      </p>
      <form
        className="class-create"
        onSubmit={(event) => {
          event.preventDefault()
          run(async () => {
            const wheel = makeWheel(title.trim(), [])
            wheel.classroom = { absent_ids: [] }
            wheel.no_repeat = true
            await addWheels([wheel])
            ready()
          })
        }}
      >
        <label htmlFor="class-name">{translate('Class name')}</label>
        <input
          id="class-name"
          value={title}
          maxLength={120}
          required
          disabled={busy}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="primary" disabled={busy || !title.trim()}>
          {translate('Create class')}
        </button>
      </form>
      <h3>{translate('Saved classes')}</h3>
      <div className="class-list">
        {wheels
          .filter((wheel) => wheel.classroom)
          .map((wheel) => (
            <button
              className="secondary"
              disabled={busy}
              key={wheel.id}
              onClick={() =>
                run(async () => {
                  await selectWheel(wheel.id)
                  ready()
                })
              }
            >
              <Users size={18} />
              <span>
                {wheel.title} · {t.count(wheel.options.length)}
              </span>
            </button>
          ))}
      </div>
      {!current.classroom && (
        <button
          className="secondary"
          disabled={busy}
          onClick={() =>
            run(async () => {
              await editWheel(current.id, {
                classroom: { absent_ids: [] },
                no_repeat: true,
                options: current.options.map((option) => ({ ...option, active: true })),
              })
              ready()
            })
          }
        >
          {translate('Use current wheel as a class')}
        </button>
      )}
      <div className="dialog-actions">
        <button className="secondary" disabled={busy} onClick={close}>
          {t.close}
        </button>
      </div>
    </Dialog>
  )
}

export function ClassroomControls({
  wheel,
  disabled,
  attendance,
  noRepeat,
  restart,
}: {
  wheel: LocalWheel
  disabled: boolean
  attendance: () => void
  noRepeat: (value: boolean) => void
  restart: () => void
}) {
  const present = wheel.options.length - wheel.classroom!.absent_ids.length
  const available = activeOptions(wheel).length
  return (
    <section className="classroom-controls" aria-label={translate('Classroom')}>
      <div className="classroom-heading">
        <span className="class-badge">
          <Users size={15} />
          {translate('Classroom')}
        </span>
        <button className="text-button" disabled={disabled} onClick={attendance}>
          {translate('Attendance')}
        </button>
      </div>
      <label>
        <input
          type="checkbox"
          checked={wheel.no_repeat}
          disabled={disabled}
          onChange={(e) => noRepeat(e.target.checked)}
        />
        {t.noRepeat}
      </label>
      <p role="status">{translate('{n} students available').replace('{n}', String(available))}</p>
      {present > 0 && !available && (
        <p>{translate('Round complete. Everyone present has had a turn.')}</p>
      )}
      {!present && wheel.options.length > 0 && (
        <p>{translate('All students are absent. Update attendance to continue.')}</p>
      )}
      <button
        className="secondary"
        disabled={disabled || !wheel.options.some((o) => !o.active)}
        onClick={restart}
      >
        <RotateCcw size={15} />
        {translate('Start new round')}
      </button>
    </section>
  )
}

export function Attendance({
  wheel,
  close,
  save,
}: {
  wheel: LocalWheel
  close: () => void
  save: (ids: string[]) => Promise<void>
}) {
  const [absent, setAbsent] = useState(new Set(wheel.classroom!.absent_ids))
  const [page, setPage] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  return (
    <Dialog
      title={translate('Attendance')}
      close={() => {
        if (!saving) close()
      }}
    >
      <p>
        {translate(
          'Check absent students. They stay in the class and remain excluded in the next round.',
        )}
      </p>
      <fieldset disabled={saving} className="attendance-list">
        <legend>{wheel.title}</legend>
        {wheel.options.slice(page * 100, (page + 1) * 100).map((option, index) => (
          <label key={option.id}>
            <input
              type="checkbox"
              checked={absent.has(option.id)}
              aria-label={`${translate('Absent')} ${page * 100 + index + 1}: ${option.label}`}
              onChange={(event) =>
                setAbsent((previous) => {
                  const next = new Set(previous)
                  if (event.target.checked) next.add(option.id)
                  else next.delete(option.id)
                  return next
                })
              }
            />
            <span>
              {page * 100 + index + 1}. {option.label}
            </span>
          </label>
        ))}
      </fieldset>
      {wheel.options.length > 100 && (
        <div className="editor-pages">
          <button disabled={saving || page === 0} onClick={() => setPage(page - 1)}>
            {ct.previous}
          </button>
          <span>
            {page + 1} / {Math.ceil(wheel.options.length / 100)}
          </span>
          <button
            disabled={saving || (page + 1) * 100 >= wheel.options.length}
            onClick={() => setPage(page + 1)}
          >
            {ct.next}
          </button>
        </div>
      )}
      {error && <p role="alert">{translate(error)}</p>}
      <div className="dialog-actions">
        <button className="secondary" disabled={saving} onClick={close}>
          {ct.cancel}
        </button>
        <button
          className="primary"
          disabled={saving}
          onClick={() => {
            setSaving(true)
            void save([...absent])
              .then(close)
              .catch((error: Error) => setError(error.message))
              .finally(() => setSaving(false))
          }}
        >
          {t.save}
        </button>
      </div>
    </Dialog>
  )
}
